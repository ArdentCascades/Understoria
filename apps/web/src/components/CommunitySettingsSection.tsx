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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import {
  InvalidNodeConfigError,
  putNodeConfig,
  resetNodeConfig,
} from "@/db/nodeConfig";
import type { Milestone, NodeConfig } from "@/types";
import { WhyTooltip } from "@/components/WhyTooltip";
import { MAX_CUSTOM_MILESTONES } from "@/db/nodeConfig";

// Per the roadmap (Agent 11 stage A), this UI is a bootstrap measure:
// any member can edit until Agent 13 (in-app governance) ships and
// changes route through a proposal. The yellow note below makes that
// posture explicit so a community doesn't mistake the affordance for
// the eventual norm.

export function CommunitySettingsSection() {
  const { t, i18n } = useTranslation();
  const { nodeId, nodeConfig, refreshNodeConfig } = useApp();
  const [draft, setDraft] = useState<NodeConfig>(nodeConfig);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the form in sync if another tab or the welcome flow changes
  // the config underneath us.
  useEffect(() => {
    setDraft(nodeConfig);
  }, [nodeConfig]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await putNodeConfig(nodeId, {
        dailyHelperLimit: Math.round(draft.dailyHelperLimit),
        shortExchangeHours: draft.shortExchangeHours,
        reciprocalPairThreshold: Math.round(draft.reciprocalPairThreshold),
        taskCheckInDays: Math.round(draft.taskCheckInDays),
        taskNeedsHelpDays: Math.round(draft.taskNeedsHelpDays),
        taskCheckInGraceDays: Math.round(draft.taskCheckInGraceDays),
        proposalDeliberationDays: Math.round(draft.proposalDeliberationDays),
        proposalMinAffirms: Math.round(draft.proposalMinAffirms),
        adoptionQuietDays: Math.round(draft.adoptionQuietDays),
        autoConfirmHours: Math.round(draft.autoConfirmHours),
        customMilestones: draft.customMilestones,
        inviteOnly: draft.inviteOnly ?? false,
      });
      await refreshNodeConfig();
      setSavedAt(Date.now());
    } catch (err) {
      if (err instanceof InvalidNodeConfigError) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    setError(null);
    try {
      const fresh = await resetNodeConfig(nodeId);
      setDraft(fresh);
      await refreshNodeConfig();
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="card mb-4"
      aria-labelledby="community-settings-title"
    >
      <h2
        id="community-settings-title"
        className="mb-2 text-sm font-semibold uppercase tracking-wide text-moss-600 dark:text-moss-300"
      >
        {t("profile.communitySettings.title")}
      </h2>
      <p className="mb-3 text-sm text-moss-600 dark:text-moss-300">
        {t("profile.communitySettings.intro")}
        <WhyTooltip principleId="community-authority" />
      </p>
      <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <p>{t("profile.communitySettings.bootstrapNote")}</p>
        <p className="mt-2">
          <Link
            to="/proposals/new"
            className="font-medium underline-offset-2 hover:underline"
          >
            {t("profile.communitySettings.proposeLink")}
          </Link>
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4">
        <Field
          id="cfg-daily"
          label={t("profile.communitySettings.dailyLimit.label")}
          hint={t("profile.communitySettings.dailyLimit.hint")}
        >
          <input
            id="cfg-daily"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            value={draft.dailyHelperLimit}
            onChange={(e) =>
              setDraft({
                ...draft,
                dailyHelperLimit: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-short"
          label={t("profile.communitySettings.shortExchange.label")}
          hint={t("profile.communitySettings.shortExchange.hint")}
        >
          <input
            id="cfg-short"
            type="number"
            inputMode="decimal"
            min={0}
            max={24}
            step={0.05}
            value={draft.shortExchangeHours}
            onChange={(e) =>
              setDraft({
                ...draft,
                shortExchangeHours: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-reciprocal"
          label={t("profile.communitySettings.reciprocal.label")}
          hint={t("profile.communitySettings.reciprocal.hint")}
        >
          <input
            id="cfg-reciprocal"
            type="number"
            inputMode="numeric"
            min={2}
            max={50}
            step={1}
            value={draft.reciprocalPairThreshold}
            onChange={(e) =>
              setDraft({
                ...draft,
                reciprocalPairThreshold: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-task-checkin"
          label={t("profile.communitySettings.taskCheckInDays.label")}
          hint={t("profile.communitySettings.taskCheckInDays.hint")}
        >
          <input
            id="cfg-task-checkin"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            step={1}
            value={draft.taskCheckInDays}
            onChange={(e) =>
              setDraft({
                ...draft,
                taskCheckInDays: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-task-needs-help"
          label={t("profile.communitySettings.taskNeedsHelpDays.label")}
          hint={t("profile.communitySettings.taskNeedsHelpDays.hint")}
        >
          <input
            id="cfg-task-needs-help"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            step={1}
            value={draft.taskNeedsHelpDays}
            onChange={(e) =>
              setDraft({
                ...draft,
                taskNeedsHelpDays: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-task-grace"
          label={t("profile.communitySettings.taskCheckInGraceDays.label")}
          hint={t("profile.communitySettings.taskCheckInGraceDays.hint")}
        >
          <input
            id="cfg-task-grace"
            type="number"
            inputMode="numeric"
            min={0}
            max={30}
            step={1}
            value={draft.taskCheckInGraceDays}
            onChange={(e) =>
              setDraft({
                ...draft,
                taskCheckInGraceDays: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-deliberation"
          label={t("profile.communitySettings.deliberationDays.label")}
          hint={t("profile.communitySettings.deliberationDays.hint")}
        >
          <input
            id="cfg-deliberation"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            step={1}
            value={draft.proposalDeliberationDays}
            onChange={(e) =>
              setDraft({
                ...draft,
                proposalDeliberationDays: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-min-affirms"
          label={t("profile.communitySettings.minAffirms.label")}
          hint={t("profile.communitySettings.minAffirms.hint")}
        >
          <input
            id="cfg-min-affirms"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            step={1}
            value={draft.proposalMinAffirms}
            onChange={(e) =>
              setDraft({
                ...draft,
                proposalMinAffirms: Number(e.target.value),
              })
            }
            className="input"
          />
        </Field>
        <Field
          id="cfg-auto-confirm"
          label={t("community.autoConfirmHours.label")}
          hint={t("community.autoConfirmHours.help")}
        >
          <div className="flex items-center gap-2">
            <input
              id="cfg-auto-confirm"
              type="number"
              inputMode="numeric"
              min={0}
              max={8760}
              step={1}
              value={draft.autoConfirmHours}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  autoConfirmHours: Number(e.target.value),
                })
              }
              className="input"
            />
            <span className="text-xs text-moss-600 dark:text-moss-300">
              {t("community.autoConfirmHours.unit")}
            </span>
          </div>
        </Field>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="cfg-invite-only"
            className="inline-flex items-start gap-2 text-sm font-medium"
          >
            <input
              id="cfg-invite-only"
              type="checkbox"
              className="mt-1"
              checked={draft.inviteOnly ?? false}
              onChange={(e) =>
                setDraft({ ...draft, inviteOnly: e.target.checked })
              }
            />
            <span>
              {t("profile.communitySettings.inviteOnly.label")}
            </span>
          </label>
          <p className="pl-6 text-xs text-moss-600 dark:text-moss-300">
            {t("profile.communitySettings.inviteOnly.helpText")}
          </p>
        </div>

        <CustomMilestonesPanel
          milestones={draft.customMilestones}
          onChange={(next) =>
            setDraft({ ...draft, customMilestones: next })
          }
        />

        {error && (
          <p className="text-sm text-red-700 dark:text-red-300" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving
              ? t("common.saving")
              : t("profile.communitySettings.save")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            {t("profile.communitySettings.reset")}
          </button>
          {savedAt && (
            <span className="text-xs text-moss-600 dark:text-moss-300">
              {t("common.savedAt", {
                when: new Date(savedAt).toLocaleTimeString(
                  i18n.resolvedLanguage,
                ),
              })}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <p className="text-xs text-moss-600 dark:text-moss-300">{hint}</p>
      {children}
    </div>
  );
}

// Edits go into `draft.customMilestones` and only persist when the
// parent form is saved — that keeps the save semantics consistent with
// every other field on this section. Validation happens at save time
// in `putNodeConfig`; this panel does the lightweight client-side
// checks (duplicate, label length, count cap) for early feedback.
function CustomMilestonesPanel({
  milestones,
  onChange,
}: {
  milestones: Milestone[];
  onChange: (next: Milestone[]) => void;
}) {
  const { t } = useTranslation();
  const [draftType, setDraftType] = useState<Milestone["type"]>("hours");
  const [draftThreshold, setDraftThreshold] = useState<string>("");
  const [draftLabel, setDraftLabel] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    setLocalError(null);
    const threshold = Number(draftThreshold);
    const label = draftLabel.trim();
    if (
      !Number.isFinite(threshold) ||
      !Number.isInteger(threshold) ||
      threshold <= 0
    ) {
      setLocalError(t("community.customMilestones.validation.threshold"));
      return;
    }
    if (label.length === 0) {
      setLocalError(t("community.customMilestones.validation.labelRequired"));
      return;
    }
    if (label.length > 80) {
      setLocalError(t("community.customMilestones.validation.labelTooLong"));
      return;
    }
    if (milestones.length >= MAX_CUSTOM_MILESTONES) {
      setLocalError(t("community.customMilestones.validation.maxReached"));
      return;
    }
    if (
      milestones.some(
        (m) => m.type === draftType && m.threshold === threshold,
      )
    ) {
      setLocalError(t("community.customMilestones.validation.duplicate"));
      return;
    }
    onChange([...milestones, { type: draftType, threshold, label }]);
    setDraftThreshold("");
    setDraftLabel("");
  }

  function handleRemove(idx: number) {
    onChange(milestones.filter((_, i) => i !== idx));
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-moss-200 p-3 dark:border-moss-700">
      <legend className="px-1 text-sm font-medium">
        {t("community.customMilestones.title")}
      </legend>
      <p className="text-xs text-moss-600 dark:text-moss-300">
        {t("community.customMilestones.intro")}
      </p>

      {milestones.length === 0 ? (
        <p className="text-xs italic text-moss-600 dark:text-moss-300">
          {t("community.customMilestones.emptyMessage")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {milestones.map((m, idx) => (
            <li
              key={`${m.type}-${m.threshold}-${idx}`}
              className="flex items-center justify-between gap-2 rounded border border-moss-100 px-2 py-1 text-sm dark:border-moss-800"
            >
              <span>
                <span className="font-medium">{m.label}</span>{" "}
                <span className="text-xs text-moss-600 dark:text-moss-300">
                  ({t(`community.customMilestones.type${capitalize(m.type)}`)} ·{" "}
                  {m.threshold})
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-xs text-red-700 hover:underline dark:text-red-300"
              >
                {t("community.customMilestones.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs">
            <span>{t("community.customMilestones.typeLabel")}</span>
            <select
              value={draftType}
              onChange={(e) =>
                setDraftType(e.target.value as Milestone["type"])
              }
              className="input"
            >
              <option value="hours">
                {t("community.customMilestones.typeHours")}
              </option>
              <option value="exchanges">
                {t("community.customMilestones.typeExchanges")}
              </option>
              <option value="members">
                {t("community.customMilestones.typeMembers")}
              </option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>{t("community.customMilestones.thresholdLabel")}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={draftThreshold}
              onChange={(e) => setDraftThreshold(e.target.value)}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>{t("community.customMilestones.labelField")}</span>
            <input
              type="text"
              maxLength={80}
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder={t("community.customMilestones.labelHint")}
              className="input"
            />
          </label>
        </div>
        {localError && (
          <p className="text-xs text-red-700 dark:text-red-300" role="alert">
            {localError}
          </p>
        )}
        <div>
          <button
            type="button"
            onClick={handleAdd}
            className="btn-secondary text-xs"
            disabled={milestones.length >= MAX_CUSTOM_MILESTONES}
          >
            {t("community.customMilestones.add")}
          </button>
        </div>
      </div>
    </fieldset>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
