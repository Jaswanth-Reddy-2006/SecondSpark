import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const badgeType = searchParams.get("type") || "status";

  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        ratings: true,
        tasks: {
          where: {
            status: { in: ["open", "in_progress"] },
          },
        },
      },
    });

    let labelLeft = "SecondSpark";
    let labelRight = "Unknown";
    let rightBg = "#59636E"; // slate default

    if (!project) {
      labelRight = "Project Not Found";
      rightBg = "#CF222E"; // red
    } else {
      if (badgeType === "rating") {
        labelLeft = "SecondSpark Potential";
        const avg =
          project.ratings.length > 0
            ? (
                project.ratings.reduce(
                  (acc, r) =>
                    acc + (r.clarity + r.documentation + r.potential + r.onboarding + r.reusability) / 5,
                  0
                ) / project.ratings.length
              ).toFixed(1)
            : project.ratingAverage.toFixed(1);
        labelRight = `★ ${avg} / 5.0`;
        rightBg = "#D97706"; // amber
      } else if (badgeType === "tasks") {
        labelLeft = "Revival Tasks";
        const openCount = project.tasks.length;
        labelRight = `${openCount} Open`;
        rightBg = openCount > 0 ? "#8250DF" : "#1A7F37"; // purple or green
      } else if (badgeType === "rot") {
        labelLeft = "Bit-Rot Index";
        let rot = 30;
        if (project.autopsyData) {
          try {
            const parsed = JSON.parse(project.autopsyData);
            rot = parsed.rotIndex || 30;
          } catch {
            // fallback
          }
        }
        labelRight = `${rot}/100`;
        rightBg = rot > 65 ? "#CF222E" : rot > 35 ? "#D97706" : "#1A7F37";
      } else {
        // Status badge
        labelLeft = "SecondSpark";
        if (project.status === "Revived") {
          labelRight = "Revived";
          rightBg = "#1A7F37"; // green
        } else if (project.status === "Under Review") {
          labelRight = "Under Review";
          rightBg = "#0969DA"; // blue
        } else if (project.status === "Archived") {
          labelRight = "Archived";
          rightBg = "#59636E"; // gray
        } else {
          // Abandoned / Seeking maintainer
          if (project.collaborationStatus === "open_to_adoption") {
            labelRight = "Seeking Maintainer";
            rightBg = "#8250DF"; // purple
          } else if (project.collaborationStatus === "open_to_collaborators") {
            labelRight = "Open to Collaborators";
            rightBg = "#0969DA"; // blue
          } else {
            labelRight = "Graveyard Preserved";
            rightBg = "#D97706"; // amber
          }
        }
      }
    }

    // Measure approximate widths
    const charWidth = 7.2;
    const padding = 16;
    const widthLeft = Math.round(labelLeft.length * charWidth + padding);
    const widthRight = Math.round(labelRight.length * charWidth + padding);
    const totalWidth = widthLeft + widthRight;
    const height = 20;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="${labelLeft}: ${labelRight}">
  <title>${labelLeft}: ${labelRight}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".15"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${widthLeft}" height="${height}" fill="#24292F"/>
    <rect x="${widthLeft}" width="${widthRight}" height="${height}" fill="${rightBg}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${widthLeft / 2}" y="15" fill="#010101" fill-opacity=".3">${labelLeft}</text>
    <text x="${widthLeft / 2}" y="14">${labelLeft}</text>
    <text aria-hidden="true" x="${widthLeft + widthRight / 2}" y="15" fill="#010101" fill-opacity=".3">${labelRight}</text>
    <text x="${widthLeft + widthRight / 2}" y="14" font-weight="600">${labelRight}</text>
  </g>
</svg>`.trim();

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=120, s-maxage=120",
      },
    });
  } catch (error) {
    console.error("Error generating SVG badge:", error);
    const errorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="130" height="20" viewBox="0 0 130 20">
  <rect width="65" height="20" fill="#24292F"/>
  <rect x="65" width="65" height="20" fill="#CF222E"/>
  <text x="32" y="14" fill="#fff" font-size="11" text-anchor="middle" font-family="sans-serif">SecondSpark</text>
  <text x="97" y="14" fill="#fff" font-size="11" text-anchor="middle" font-family="sans-serif">Error</text>
</svg>`.trim();
    return new Response(errorSvg, {
      status: 500,
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }
}
