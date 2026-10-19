"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 border ${
              isDestructive
                ? "bg-[#FFEBE9] border-[#FF8182]/50 text-[#D1242F]"
                : "bg-[#FFF8C5] border-[#D4A72C]/50 text-[#9A6700]"
            }`}
          >
            {isDestructive ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#59636E] leading-relaxed pt-1">
            {description}
          </p>
        </div>

        <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#D1D9E0]/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "danger" : "primary"}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
