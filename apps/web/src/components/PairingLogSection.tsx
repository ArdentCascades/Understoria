/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listPairings } from "@/db/pairing";
import type { PairingLogRow } from "@/db/database";
import { formatRelativeTime } from "@/lib/format";

/**
 * Profile-page surface for the local paired-device inventory. Two
 * short lists if there's anything to show:
 *
 *   - "Devices I've authorized from here"   (kind === "source")
 *   - "Times this device was authorized
 *      from elsewhere"                      (kind === "destination")
 *
 * Both lists empty → renders null. The section is a passive
 * memory-aid: there is no remove / revoke action because Ed25519 has
 * no revocation primitive (see `docs/device-pairing.md` §9). The
 * "rotate hint" copy points members at Emergency → Hard purge as the
 * only remediation if a paired device is lost.
 */
export function PairingLogSection() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PairingLogRow[]>([]);

  // Single read on mount. The inventory only grows on pair flows
  // (AddDevice / PairDevice) that navigate away from Profile, so a
  // live subscription would be over-engineered — by the time the
  // member is back on Profile the row already exists.
  useEffect(() => {
    void listPairings().then(setRows);
  }, []);

  if (rows.length === 0) return null;

  const sourceRows = rows.filter((r) => r.kind === "source");
  const destinationRows = rows.filter((r) => r.kind === "destination");

  return (
    <section
      className="card mb-4"
      aria-labelledby="profile-pairingLog-heading"
    >
      <h2
        id="profile-pairingLog-heading"
        className="page-title text-base"
      >
        {t("profile.pairingLog.title")}
      </h2>
      <p className="mt-1 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.pairingLog.intro")}
      </p>
      <p className="mt-1 text-xs text-moss-500 dark:text-moss-300">
        {t("profile.pairingLog.rotateHint")}
      </p>

      {sourceRows.length > 0 && (
        <PairingList
          headingKey="profile.pairingLog.sourceTitle"
          rows={sourceRows}
        />
      )}
      {destinationRows.length > 0 && (
        <PairingList
          headingKey="profile.pairingLog.destinationTitle"
          rows={destinationRows}
        />
      )}
    </section>
  );
}

function PairingList({
  headingKey,
  rows,
}: {
  headingKey: string;
  rows: PairingLogRow[];
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-moss-500 dark:text-moss-300">
        {t(headingKey)}
      </h3>
      <ul className="flex flex-col divide-y divide-moss-100 dark:divide-moss-800">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate">
              {row.label === ""
                ? t("profile.pairingLog.unlabeled")
                : row.label}
            </span>
            <span className="shrink-0 text-xs text-moss-500 dark:text-moss-300">
              {formatRelativeTime(row.completedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
