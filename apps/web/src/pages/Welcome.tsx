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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { AvailabilityChipPicker } from "@/components/AvailabilityChipPicker";
import { markOnboarded } from "@/db/onboarding";
import { updateMemberProfile } from "@/db/actions";
import { db } from "@/db/database";
import { useApp } from "@/state/AppContext";
import type { AvailabilityChip } from "@/types";

// Per-step shape. `concept` screens are static intros; the
// `profileSetup` step is interactive — same chrome, form fields
// in place of body paragraphs. New step kinds (a future "tour
// highlight" step, say) plug in here.
type Step =
  | {
      kind: "concept";
      key: string;
      icon: string;
      titleKey: string;
      bodyKeys: readonly string[];
    }
  | { kind: "profileSetup"; key: "profileSetup"; icon: string };

const STEPS: readonly Step[] = [
  {
    kind: "concept",
    key: "timebank",
    icon: "\u{23F3}",
    titleKey: "welcome.screens.timebank.title",
    bodyKeys: [
      "welcome.screens.timebank.body1",
      "welcome.screens.timebank.body2",
    ],
  },
  {
    kind: "concept",
    key: "credit",
    icon: "\u{1F33E}",
    titleKey: "welcome.screens.credit.title",
    bodyKeys: [
      "welcome.screens.credit.body1",
      "welcome.screens.credit.body2",
    ],
  },
  {
    kind: "concept",
    key: "identity",
    icon: "\u{1F511}",
    titleKey: "welcome.screens.identity.title",
    bodyKeys: [
      "welcome.screens.identity.body1",
      "welcome.screens.identity.body2",
    ],
  },
  {
    kind: "concept",
    key: "community",
    icon: "\u{1F33F}",
    titleKey: "welcome.screens.community.title",
    bodyKeys: [
      "welcome.screens.community.body1",
      "welcome.screens.community.body2",
    ],
  },
  {
    kind: "concept",
    key: "projects",
    // Tree — the next stage from the seedling / herb / sprig
    // metaphors elsewhere in the design language. Projects are the
    // collective form of the same growth.
    icon: "\u{1F333}",
    titleKey: "welcome.screens.projects.title",
    bodyKeys: [
      "welcome.screens.projects.body1",
      "welcome.screens.projects.body2",
    ],
  },
  {
    kind: "profileSetup",
    key: "profileSetup",
    icon: "\u{1F331}",
  },
];

export default function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentMember, refreshOnboarded, nodeConfig, nodeId } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  // Count members scoped to THIS node (a paired device that brought
  // identities over from a peer node could have rows under a different
  // nodeId — those don't satisfy the bootstrap on the LOCAL node).
  // `undefined` while Dexie is still resolving lets us render a
  // "loading" placeholder rather than flashing the invite-only landing
  // and then flipping to profileSetup once the count comes back as 0.
  //
  // Race window: two visitors hitting /welcome simultaneously on a
  // fresh `inviteOnly: true` node could BOTH satisfy the bootstrap
  // check and onboard before either has written a row. The operator
  // setup window is short and visitor traffic on a fresh node is low —
  // acceptable risk. This is documented behavior, not a bug.
  const localMemberCount = useLiveQuery<number | undefined>(async () => {
    const all = await db.members.toArray();
    return all.filter((m) => m.nodeId === nodeId).length;
  }, [nodeId]);

  // Tri-state: `true` allows onboarding, `false` shows the invite-only
  // landing, `"loading"` defers the decision until Dexie resolves the
  // count. Defaulting to "loading" (not `false`) when invite-only is on
  // avoids flashing the landing on the bootstrap path; defaulting to
  // `true` when invite-only is off is safe (open mode never gates).
  const selfOnboardingAllowed: boolean | "loading" = useMemo(() => {
    if (!nodeConfig.inviteOnly) return true;
    if (localMemberCount === undefined) return "loading";
    if (localMemberCount === 0) return true;
    return false;
  }, [nodeConfig.inviteOnly, localMemberCount]);

  // Profile-setup state lives here (not in the step component) so
  // typing it and stepping Back to a concept screen doesn't lose
  // what was entered. Initialized from the current member so a
  // returning user who re-opens /welcome via the LearnSection link
  // sees their existing values, not empty fields.
  const [zone, setZone] = useState(currentMember?.locationZone ?? "");
  const [skills, setSkills] = useState(
    (currentMember?.skills ?? []).join(", "),
  );
  const [availability, setAvailability] = useState(
    currentMember?.availability ?? "",
  );
  const [availabilityChips, setAvailabilityChips] = useState<
    AvailabilityChip[]
  >(currentMember?.availabilityChips ?? []);
  const [saving, setSaving] = useState(false);

  async function finish() {
    await markOnboarded();
    await refreshOnboarded();
    navigate("/", { replace: true });
  }

  async function saveProfileAndFinish() {
    if (!currentMember) {
      await finish();
      return;
    }
    const updates: Parameters<typeof updateMemberProfile>[1] = {};
    const trimmedZone = zone.trim();
    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const trimmedAvail = availability.trim();
    if (trimmedZone) updates.locationZone = trimmedZone;
    if (parsedSkills.length > 0) updates.skills = parsedSkills;
    if (trimmedAvail) updates.availability = trimmedAvail;
    if (availabilityChips.length > 0) {
      updates.availabilityChips = availabilityChips;
    }

    if (Object.keys(updates).length > 0) {
      setSaving(true);
      try {
        await updateMemberProfile(currentMember.publicKey, updates);
      } finally {
        setSaving(false);
      }
    }
    await finish();
  }

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const onBack = stepIndex === 0 ? null : () => setStepIndex(stepIndex - 1);

  if (step.kind === "concept") {
    // On the FIRST concept screen only, surface a small affordance
    // for members who landed here because they want to bring an
    // existing identity onto this device — the design doc §7.1
    // "third path." Members who are genuinely new will scroll past
    // without engaging.
    const bodyWithPairLink =
      stepIndex === 0 ? (
        <>
          {step.bodyKeys.map((k) => (
            <p key={k}>{t(k)}</p>
          ))}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate("/pair-device")}
              className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("welcome.pairDeviceLink")}
            </button>
          </div>
        </>
      ) : (
        step.bodyKeys.map((k) => <p key={k}>{t(k)}</p>)
      );
    return (
      <OnboardingScreen
        icon={step.icon}
        title={t(step.titleKey)}
        body={bodyWithPairLink}
        stepIndex={stepIndex}
        stepCount={STEPS.length}
        onBack={onBack}
        onNext={() => {
          if (isLast) {
            void finish();
          } else {
            setStepIndex(stepIndex + 1);
          }
        }}
        onSkip={() => void finish()}
        nextLabel={isLast ? t("welcome.start") : t("welcome.next")}
      />
    );
  }

  // profileSetup — but first, gate it on `inviteOnly`. Concept screens
  // above always render; only the FINAL step is replaced when the gate
  // is active. Visitors who navigated through the concept screens still
  // get the explainer about what Understoria is — the right context for
  // them to decide whether to seek an invite.
  if (selfOnboardingAllowed === "loading") {
    return <InviteOnlyLanding loading />;
  }
  if (selfOnboardingAllowed === false) {
    return <InviteOnlyLanding />;
  }

  return (
    <OnboardingScreen
      icon={step.icon}
      title={t("welcome.profileSetup.title")}
      body={
        <div className="space-y-4 text-left">
          <p className="text-center text-sm text-moss-600 dark:text-moss-300">
            {t("welcome.profileSetup.intro")}
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t("profile.about.area")}</span>
            <input
              className="input"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder={t("profile.about.areaPlaceholder")}
              maxLength={80}
              disabled={saving}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("profile.about.skills")}
            </span>
            <input
              className="input"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={t("profile.about.skillsPlaceholder")}
              maxLength={200}
              disabled={saving}
            />
          </label>
          <div className="flex flex-col gap-2">
            <div>
              <div className="text-sm font-semibold">
                {t("profile.about.availabilityHeading")}
              </div>
              <div className="text-xs text-moss-600 dark:text-moss-300">
                {t("profile.about.availabilitySubhead")}
              </div>
            </div>
            <AvailabilityChipPicker
              value={availabilityChips}
              onChange={setAvailabilityChips}
            />
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                {t("profile.about.availabilityNotesLabel")}
              </span>
              <input
                className="input"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder={t("profile.about.availabilityPlaceholder")}
                maxLength={120}
                disabled={saving}
              />
            </label>
          </div>
          <p className="text-center text-xs text-moss-500 dark:text-moss-400">
            {t("welcome.profileSetup.hint")}
          </p>
        </div>
      }
      stepIndex={stepIndex}
      stepCount={STEPS.length}
      onBack={onBack}
      onNext={() => void saveProfileAndFinish()}
      onSkip={() => void finish()}
      nextLabel={saving ? t("common.working") : t("welcome.start")}
      busy={saving}
    />
  );
}

// The dead-end landing shown in place of the profileSetup step when
// `nodeConfig.inviteOnly` is on and the bootstrap exception doesn't
// fire (i.e. at least one member already exists on this node). No
// action buttons by design — the intent is for the visitor to back out
// of /welcome and follow an invite link if they have one. An invited
// visitor never sees this page: they hit `/invite#<signed-token>`,
// which is handled by InviteAccept.tsx and is unchanged by this gate.
//
// Concept screens (Steps 1-5) still render above this; only the FINAL
// step is replaced, so a curious visitor still gets to read what
// Understoria is.
function InviteOnlyLanding({ loading = false }: { loading?: boolean }) {
  const { t } = useTranslation();
  // While the local member count is still resolving, render the same
  // chrome but blank out the body so we never flash "invite-only" then
  // pop into profileSetup if the count comes back as 0. Same posture
  // as `useApp().ready` everywhere else in the app.
  if (loading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 p-8 text-center">
        <div aria-hidden className="text-5xl">{"\u{1F33F}"}</div>
        <p className="text-sm text-moss-500 dark:text-moss-400">
          {t("common.loading")}
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 p-8 text-center">
      <div aria-hidden className="text-5xl">{"\u{1F33F}"}</div>
      <h1 className="text-2xl font-semibold">
        {t("welcome.inviteOnly.title")}
      </h1>
      <div className="space-y-3 text-left text-sm text-moss-700 dark:text-moss-200">
        <p>{t("welcome.inviteOnly.body1")}</p>
        <p>{t("welcome.inviteOnly.body2")}</p>
      </div>
    </div>
  );
}
