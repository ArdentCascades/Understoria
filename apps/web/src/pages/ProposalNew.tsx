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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "@/state/AppContext";
import { useToast } from "@/state/ToastContext";
import { createProposal } from "@/db/proposals";
import { humanizeError } from "@/lib/humanizeError";
import {
  combine,
  positiveInteger,
  required,
  useFieldValidation,
  type Validator,
} from "@/lib/validation";
import type {
  NodeConfigProposalPayload,
  ReversibilityTier,
} from "@/types";

// Agent 13 — v1 only supports config_change proposals. Other
// categories (recall, policy) come in follow-up PRs. Reversibility
// tier defaults to `easy` for config_change because a config change
// is reversed by another proposal; the proposer can override to
// moderate / hard if they think the cultural impact is larger.

type FieldName = "title" | "dailyHelperLimit";

const VALIDATORS: Record<FieldName, Validator> = {
  title: required("proposals.errorTitleRequired"),
  dailyHelperLimit: combine(
    required("proposals.errorPositiveInteger"),
    positiveInteger("proposals.errorPositiveInteger"),
  ),
};

export default function ProposalNewPage() {
  const { currentMember, nodeId, nodeConfig } = useApp();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reversibilityTier, setReversibilityTier] =
    useState<ReversibilityTier>("easy");
  const [dailyHelperLimit, setDailyHelperLimit] = useState(
    String(nodeConfig.dailyHelperLimit),
  );
  const [shortExchangeHours, setShortExchangeHours] = useState(
    String(nodeConfig.shortExchangeHours),
  );
  const [reciprocalPairThreshold, setReciprocalPairThreshold] = useState(
    String(nodeConfig.reciprocalPairThreshold),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useFieldValidation<FieldName>(
    { title, dailyHelperLimit },
    VALIDATORS,
  );

  if (!currentMember) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    validation.markAllTouched();
    if (validation.hasErrors) return;

    const proposedConfig: NodeConfigProposalPayload = {
      // The form only edits the three Agent 11 thresholds; the
      // Agent 13 fields ride along unchanged from the current
      // config so the payload remains a complete NodeConfig.
      ...nodeConfig,
      dailyHelperLimit: Number.parseInt(dailyHelperLimit, 10),
      shortExchangeHours: Number.parseFloat(shortExchangeHours),
      reciprocalPairThreshold: Number.parseInt(reciprocalPairThreshold, 10),
    };

    try {
      setSubmitting(true);
      await createProposal({
        category: "config_change",
        reversibilityTier,
        title,
        description,
        payload: JSON.stringify(proposedConfig),
        proposerKey: currentMember!.publicKey,
        nodeId,
      });
      showToast(t("proposals.toast.created"));
      navigate("/proposals");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-8 pt-4">
      <header className="mb-4">
        <button
          type="button"
          className="btn-ghost -ml-2 text-sm"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          {t("proposals.new.title")}
        </h1>
        <p className="text-sm text-moss-600 dark:text-moss-300">
          {t("proposals.new.subtitle")}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("proposals.new.fieldTitle")}
          </span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => validation.onBlur("title")}
            aria-invalid={validation.shouldShowError("title") || undefined}
            aria-describedby={
              validation.shouldShowError("title") ? "title-error" : undefined
            }
            maxLength={120}
            required
          />
          {validation.shouldShowError("title") && (
            <p
              id="title-error"
              role="alert"
              className="text-xs text-rose-700 dark:text-rose-300"
            >
              {t(validation.errors.title!.key)}
            </p>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {t("proposals.new.fieldDescription")}
          </span>
          <textarea
            className="input min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("proposals.new.descriptionPlaceholder")}
            maxLength={2000}
          />
        </label>

        <fieldset className="rounded-xl border border-moss-200 p-3 dark:border-moss-800">
          <legend className="px-1 text-xs uppercase tracking-wide text-moss-500">
            {t("proposals.new.configHeader")}
          </legend>
          <p className="mb-3 text-xs text-moss-500 dark:text-moss-400">
            {t("proposals.new.configIntro")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ConfigField
              label={t("profile.communitySettings.dailyLimit.label")}
              value={dailyHelperLimit}
              onChange={setDailyHelperLimit}
              onBlur={() => validation.onBlur("dailyHelperLimit")}
              error={
                validation.shouldShowError("dailyHelperLimit")
                  ? t(validation.errors.dailyHelperLimit!.key)
                  : null
              }
              min="1"
              step="1"
              current={String(nodeConfig.dailyHelperLimit)}
            />
            <ConfigField
              label={t("profile.communitySettings.shortExchange.label")}
              value={shortExchangeHours}
              onChange={setShortExchangeHours}
              min="0"
              step="0.25"
              current={String(nodeConfig.shortExchangeHours)}
            />
            <ConfigField
              label={t("profile.communitySettings.reciprocal.label")}
              value={reciprocalPairThreshold}
              onChange={setReciprocalPairThreshold}
              min="2"
              step="1"
              current={String(nodeConfig.reciprocalPairThreshold)}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-moss-200 p-3 dark:border-moss-800">
          <legend className="px-1 text-xs uppercase tracking-wide text-moss-500">
            {t("proposals.new.tierHeader")}
          </legend>
          <p className="mb-3 text-xs text-moss-500 dark:text-moss-400">
            {t("proposals.new.tierIntro")}
          </p>
          <div className="flex flex-col gap-2">
            {(["easy", "moderate", "hard"] as const).map((tier) => (
              <label key={tier} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={reversibilityTier === tier}
                  onChange={() => setReversibilityTier(tier)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">
                    {t(`proposals.reversibility.${tier}`)}
                  </span>{" "}
                  <span className="text-xs text-moss-500 dark:text-moss-400">
                    — {t(`proposals.reversibility.${tier}Hint`)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? t("proposals.new.submitting")
              : t("proposals.new.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfigField({
  label,
  value,
  onChange,
  onBlur,
  error,
  min,
  step,
  current,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
  min: string;
  step: string;
  current: string;
}) {
  const { t } = useTranslation();
  const changed = value !== current;
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error) || undefined}
      />
      <span className="text-xs text-moss-500 dark:text-moss-400">
        {changed
          ? t("proposals.new.currentValue", { value: current })
          : t("proposals.new.unchanged")}
      </span>
      {error && (
        <p
          role="alert"
          className="text-xs text-rose-700 dark:text-rose-300"
        >
          {error}
        </p>
      )}
    </label>
  );
}

