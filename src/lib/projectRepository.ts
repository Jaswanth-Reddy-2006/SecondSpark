import { Project, ProjectStatus, TimelineEvent } from "@/types/project";
import { CollaborationStatus } from "@/types/community";

const STORAGE_KEY = "secondspark_graveyard_projects_v1";
const MIGRATED_FLAG_KEY = "secondspark_migrated_to_db_v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in project repository listener:", e);
    }
  });
}

/**
 * Sanitize and validate stored project object, ensuring all expected
 * array and string fields are safely present.
 */
export function sanitizeProject(raw: unknown): Project {
  const p = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const rawAuthor = (typeof p.author === "object" && p.author !== null ? p.author : {}) as Record<string, unknown>;

  const statusStr = String(p.status || "Abandoned");
  const validStatus = (["Abandoned", "Under Review", "Revived", "Archived"].includes(statusStr)
    ? statusStr
    : "Abandoned") as ProjectStatus;

  const validCollabStatus = ([
    "feedback_only",
    "open_to_collaborators",
    "invitation_only",
    "open_to_adoption",
    "closed",
  ].includes(String(p.collaborationStatus))
    ? String(p.collaborationStatus)
    : "feedback_only") as CollaborationStatus;

  const revivalStr = String(p.revivalPotential || "Moderate");
  const validRevival = (["High", "Moderate", "Low"].includes(revivalStr)
    ? revivalStr
    : "Moderate") as "High" | "Moderate" | "Low";

  const rawHistory = Array.isArray(p.history) ? p.history : (Array.isArray(p.timelineEvents) ? p.timelineEvents : []);
  const sanitizedHistory: TimelineEvent[] = rawHistory.map((hItem: unknown, idx: number) => {
    const h = (typeof hItem === "object" && hItem !== null ? hItem : {}) as Record<string, unknown>;
    const hType = (["created", "status_change", "edited", "note_added"].includes(String(h.type))
      ? String(h.type)
      : "note_added") as TimelineEvent["type"];

    return {
      id: String(h.id || `hist-${idx}-init`),
      type: hType,
      title: String(h.title || "Activity logged"),
      description: String(h.description || ""),
      timestamp: String(h.timestamp || "2024-01-01T00:00:00Z"),
      actor: h.actor ? String(h.actor) : undefined,
      metadata: (typeof h.metadata === "object" && h.metadata !== null ? h.metadata : undefined) as TimelineEvent["metadata"],
    };
  });

  return {
    id: String(p.id || "proj-default"),
    name: String(p.name || "Untitled Project"),
    tagline: String(p.tagline || ""),
    description: String(p.description || ""),
    originalProblem: String(p.originalProblem || ""),
    intendedUsers: String(p.intendedUsers || ""),
    techTags: Array.isArray(p.techTags) ? p.techTags.map(String) : [],
    repoUrl: p.repoUrl ? String(p.repoUrl) : undefined,
    demoUrl: p.demoUrl ? String(p.demoUrl) : undefined,
    status: validStatus,
    lastActiveDate: String(p.lastActiveDate || p.lastUpdated || "2024-01-01"),
    lastUpdated: String(p.lastUpdated || "2024-01-01"),
    createdAt: String(p.createdAt || "2024-01-01"),
    worthRevisiting: Boolean(p.worthRevisiting),
    completionRate: typeof p.completionRate === "number" ? Math.max(0, Math.min(100, p.completionRate)) : 50,
    abandonedReason: String(p.abandonedReason || "No abandonment reason recorded."),
    completedFeatures: Array.isArray(p.completedFeatures) ? p.completedFeatures.map(String) : [],
    unfinishedFeatures: Array.isArray(p.unfinishedFeatures) ? p.unfinishedFeatures.map(String) : [],
    mainBlockers: String(p.mainBlockers || ""),
    lessonsLearned: String(p.lessonsLearned || ""),
    revivalPotential: validRevival,
    nextAction: p.nextAction ? String(p.nextAction) : undefined,
    nextActionDueDate: p.nextActionDueDate ? String(p.nextActionDueDate) : undefined,
    revivalChecklist: Array.isArray(p.revivalChecklist)
      ? p.revivalChecklist.map((item: unknown, i: number) => {
          const it = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
          return {
            id: String(it.id || `chk-${i}`),
            label: String(it.label || ""),
            completed: Boolean(it.completed),
            category: (["audit", "setup", "fix", "feature", "test"].includes(String(it.category))
              ? String(it.category)
              : "feature") as "audit" | "setup" | "fix" | "feature" | "test",
          };
        })
      : undefined,
    stars: typeof p.stars === "number" ? p.stars : 0,
    repoName: p.repoName ? String(p.repoName) : undefined,
    
    // Community extensions
    isPublic: Boolean(p.isPublic),
    slug: p.slug ? String(p.slug) : undefined,
    collaborationStatus: validCollabStatus,
    skillsNeeded: Array.isArray(p.skillsNeeded) ? p.skillsNeeded.map(String) : [],
    ratingsCount: typeof p.ratingsCount === "number" ? Math.max(0, p.ratingsCount) : 0,
    ratingAverage: typeof p.ratingAverage === "number" ? Math.max(0, Math.min(5, p.ratingAverage)) : 0.0,

    author: {
      id: rawAuthor.id ? String(rawAuthor.id) : undefined,
      name: String(rawAuthor.name || "Developer"),
      avatar: String(rawAuthor.avatar || "DR"),
      handle: String(rawAuthor.handle || "@developer"),
      image: rawAuthor.image ? String(rawAuthor.image) : undefined,
    },
    history: sanitizedHistory,
  };
}

let cachedSnapshot: Project[] | null = null;
let serverSyncInitiated = false;

export const projectRepository = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    // Trigger server synchronization when mounted
    if (!serverSyncInitiated && typeof window !== "undefined") {
      serverSyncInitiated = true;
      projectRepository.syncWithServer();
    }
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Synchronize local repository with persistent database on server.
   * If server has projects, updates local snapshot.
   * If user has local projects not yet in database, migrates them safely.
   */
  async syncWithServer(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) {
        // Unauthenticated, continue using local state
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const serverProjects: Project[] = Array.isArray(data.projects) ? data.projects.map(sanitizeProject) : [];

        // Check if we need to migrate existing browser projects
        const storedStr = localStorage.getItem(STORAGE_KEY);
        const hasMigrated = localStorage.getItem(MIGRATED_FLAG_KEY) === "true";

        if (storedStr && !hasMigrated) {
          try {
            const localProjects: Project[] = JSON.parse(storedStr);
            if (Array.isArray(localProjects) && localProjects.length > 0) {
              // Send local projects to migration endpoint
              const migrateRes = await fetch("/api/projects/migrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projects: localProjects }),
              });

              if (migrateRes.ok) {
                localStorage.setItem(MIGRATED_FLAG_KEY, "true");
                // Re-fetch synced database projects
                const refreshedRes = await fetch("/api/projects");
                if (refreshedRes.ok) {
                  const refreshedData = await refreshedRes.json();
                  if (Array.isArray(refreshedData.projects)) {
                    cachedSnapshot = refreshedData.projects.map(sanitizeProject);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedSnapshot));
                    notifyListeners();
                    return;
                  }
                }
              }
            }
          } catch (migrateErr) {
            console.error("Migration check failed:", migrateErr);
          }
        }

        if (serverProjects.length > 0) {
          cachedSnapshot = serverProjects;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProjects));
          notifyListeners();
        } else if (cachedSnapshot && cachedSnapshot.length > 0 && !hasMigrated) {
          // If server is empty but client has projects, migrate them
          await fetch("/api/projects/migrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projects: cachedSnapshot }),
          });
          localStorage.setItem(MIGRATED_FLAG_KEY, "true");
        }
      }
    } catch (err) {
      console.error("Failed to sync projects with server:", err);
    }
  },

  /**
   * Retrieves all projects from storage / cache.
   */
  getAll(): Project[] {
    if (typeof window === "undefined") {
      return [];
    }

    if (cachedSnapshot !== null) {
      return cachedSnapshot;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        cachedSnapshot = [];
        return [];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        cachedSnapshot = [];
        return [];
      }

      cachedSnapshot = parsed.map(sanitizeProject);
      return cachedSnapshot;
    } catch (err) {
      console.error("Failed to read projects from localStorage:", err);
      cachedSnapshot = [];
      return [];
    }
  },

  /**
   * Retrieve a single project by ID.
   */
  getById(id: string): Project | null {
    const all = this.getAll();
    return all.find((p) => p.id === id) || null;
  },

  /**
   * Persists a full list of projects to storage.
   */
  saveAll(projects: Project[]): void {
    cachedSnapshot = projects;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      } catch (err) {
        console.error("Failed to save projects to localStorage:", err);
      }
    }
    notifyListeners();
  },

  /**
   * Creates a new project in the graveyard vault.
   * Optimistically updates local cache and persists to server database.
   */
  create(
    data: Omit<Project, "id" | "createdAt" | "lastUpdated" | "history"> & {
      id?: string;
      createdAt?: string;
      lastUpdated?: string;
      history?: TimelineEvent[];
    }
  ): Project {
    const all = this.getAll();
    const nowIso = new Date().toISOString();
    const today = nowIso.split("T")[0];

    const initialHistoryEvent: TimelineEvent = {
      id: `hist-${Date.now()}`,
      type: "created",
      title: "Project Entombed in Graveyard",
      description: `Archived in vault with status "${data.status}" and ${data.completionRate}% completion.`,
      timestamp: nowIso,
      actor: data.author?.name || "Developer",
    };

    const newProject: Project = sanitizeProject({
      ...data,
      id: data.id || `proj-${Date.now()}`,
      createdAt: data.createdAt || today,
      lastUpdated: today,
      history: [initialHistoryEvent, ...(data.history || [])],
    });

    const updated = [newProject, ...all];
    this.saveAll(updated);

    // Asynchronously persist to server database
    if (typeof window !== "undefined") {
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      })
        .then(async (res) => {
          if (res.ok) {
            const result = await res.json();
            if (result.project?.id && result.project.id !== newProject.id) {
              // Update with canonical server ID if necessary
              const remapped = this.getAll().map((p) =>
                p.id === newProject.id ? { ...p, id: result.project.id } : p
              );
              this.saveAll(remapped);
            }
          }
        })
        .catch((err) => console.error("Server project persistence failed:", err));
    }

    return newProject;
  },

  /**
   * Updates an existing project and appends a chronological timeline event.
   * Optimistically updates local cache and persists to server database.
   */
  update(
    id: string,
    updates: Partial<Project>,
    changeNote?: string
  ): Project | null {
    const all = this.getAll();
    const existingIndex = all.findIndex((p) => p.id === id);
    if (existingIndex === -1) return null;

    const existing = all[existingIndex];
    const nowIso = new Date().toISOString();
    const today = nowIso.split("T")[0];

    // Determine timeline events
    const newEvents: TimelineEvent[] = [];

    if (updates.status && updates.status !== existing.status) {
      newEvents.push({
        id: `hist-${Date.now()}-status`,
        type: "status_change",
        title: `Status Changed to ${updates.status}`,
        description:
          changeNote ||
          `Project moved from "${existing.status}" to "${updates.status}".`,
        timestamp: nowIso,
        actor: "Developer",
        metadata: {
          previousStatus: existing.status,
          newStatus: updates.status,
        },
      });
    } else if (changeNote) {
      newEvents.push({
        id: `hist-${Date.now()}-edit`,
        type: "edited",
        title: "Project Details Updated",
        description: changeNote,
        timestamp: nowIso,
        actor: "Developer",
      });
    }

    const updatedProject: Project = sanitizeProject({
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      lastUpdated: today,
      history: [...newEvents, ...existing.history],
    });

    const updatedList = [...all];
    updatedList[existingIndex] = updatedProject;
    this.saveAll(updatedList);

    // Asynchronously persist update to server database
    if (typeof window !== "undefined") {
      fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, timelineNote: changeNote }),
      }).catch((err) => console.error("Server project update failed:", err));
    }

    return updatedProject;
  },

  /**
   * Permanently deletes a project from storage.
   */
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;

    this.saveAll(filtered);

    // Asynchronously delete from server database
    if (typeof window !== "undefined") {
      fetch(`/api/projects/${id}`, {
        method: "DELETE",
      }).catch((err) => console.error("Server project deletion failed:", err));
    }

    return true;
  },

  /**
   * Clears local storage and server cache.
   */
  resetToSeed(): void {
    this.saveAll([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(MIGRATED_FLAG_KEY);
      fetch("/api/projects/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: [] }),
      }).catch((err) => console.error("Reset sync failed:", err));
    }
  },
};
