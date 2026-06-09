/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { unblockMember } from "@/db/blocks";

export interface UnblockConfirmDialogProps {
  open: boolean;
  blockedKey: string;
  blockedDisplayName: string;
  onClose: () => void;
  onUnblocked?: () => void;
}

/**
 * Confirm dialog for unblock. The unblock crosses a meaningful state
 * boundary (per design doc §14.2, "Unblock confirmation: open"
 * resolved to "ConfirmDialog same shape as co-organizer revoke"). The
 * body names what re-enables (DMs, claims, vouches, RSVPs) and what
 * persists (the previously-blocked history row stays for the
 * blocker's memory).
 */
export function UnblockConfirmDialog({
  open,
  blockedKey,
  blockedDisplayName,
  onClose,
  onUnblocked,
}: UnblockConfirmDialogProps) {
  const { t } = useTranslation();
  const { currentMember } = useApp();
  const { showToast } = useToast();

  async function handleConfirm() {
    if (!currentMember) return;
    try {
      await unblockMember({
        blockerKey: currentMember.publicKey,
        blockedKey,
      });
      showToast(t("block.unblock.success"), "success");
      onUnblocked?.();
      onClose();
    } catch {
      // Failure here is structurally unlikely (the action is a
      // straight Dexie delete + put with no validation), but surface
      // a friendly toast and leave the dialog open so the member can
      // retry. Don't auto-close on error.
      showToast(t("block.unblock.errorGeneric"), "error");
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title={t("block.unblock.confirmTitle", { name: blockedDisplayName })}
      description={t("block.unblock.confirmBody")}
      confirmLabel={t("block.unblock.confirmButton")}
      confirmingLabel={t("block.unblock.confirmingButton")}
      cancelLabel={t("block.unblock.dismiss")}
      tone="caution"
      onConfirm={() => handleConfirm()}
      onCancel={onClose}
    />
  );
}
