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
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { BetaNotice } from "@/components/BetaNotice";
import { InstallGuide } from "@/components/InstallGuide";
import type { ConceptIllustrationName } from "@/components/visual";
import { AvailabilityChipPicker } from "@/components/AvailabilityChipPicker";
import { markOnboarded } from "@/db/onboarding";
import { updateMemberProfile } from "@/db/actions";
import {
  currentLockState,
  enablePassphrase,
  enrollPasskeyFirst,
} from "@/db/secrets";
import { supportsPasskeys } from "@/lib/passkeyUnlock";
import { humanizeError } from "@/lib/humanizeError";
import { currentInstallEnvironment } from "@/lib/installGuide";
import { isOurNode } from "@/lib/nodeIdentity";
import { db } from "@/db/database";
import { createMember } from "@/db/seed";
import { useApp } from "@/state/AppContext";
import {
  required,
  useFieldValidation,
  type Validator,
} from "@/lib/validation";
import { focusFirstInvalidField } from "@/lib/focusFirstInvalid";
import type { AvailabilityChip } from "@/types";

// Same validation shape as InviteAccept — the display name is the one
// required field of the whole flow: onboarding can't finish without an
// identity, and an identity needs a name.
type FieldName = "displayName";

const VALIDATORS: Record<FieldName, Validator> = {
  displayName: required("welcome.profileSetup.nameRequired"),
};

// Per-step shape. `concept` screens are static intros; the `install`
// step offers the optional home-screen install (auto-skipped when the
// app is already installed, so nobody hits a dead-end screen); the
// `profileSetup` step is interactive — same chrome, form fields in
// place of body paragraphs. New step kinds plug in here.
type Step =
  | {
      kind: "concept";
      key: string;
      illustration: ConceptIllustrationName;
      titleKey: string;
      bodyKey: string;
      bodyMoreKey: string;
    }
  | { kind: "install"; key: "install"; icon: string }
  | { kind: "profileSetup"; key: "profileSetup"; icon: string }
  /** "Protect your key" (V5 #475) — right after the identity mints,
   *  one decision, three doors: lock with the device's own
   *  fingerprint/face/PIN (leads, when supported — a non-reader
   *  never faces a typed passphrase), create a passphrase instead,
   *  or skip (today's unprotected default, reachable honestly). */
  | { kind: "protect"; key: "protect"; icon: string }
  /** First screen ONLY when launched as an installed app with no
   *  identity: "are you new, or do you already use Understoria in
   *  this phone's browser?" — the installed copy has its own
   *  isolated storage, so a member who onboarded in the browser
   *  lands here signed-out and needs pairing, not a second
   *  identity. */
  | { kind: "installedArrival"; key: "installedArrival"; icon: string };

const INSTALLED_ARRIVAL_STEP: Step = {
  kind: "installedArrival",
  key: "installedArrival",
  icon: "\u{1F4F1}",
};

const STEPS: readonly Step[] = [
  {
    kind: "concept",
    key: "timebank",
    illustration: "timebank",
    titleKey: "welcome.screens.timebank.title",
    bodyKey: "welcome.screens.timebank.body",
    bodyMoreKey: "welcome.screens.timebank.bodyMore",
  },
  {
    kind: "concept",
    key: "credit",
    illustration: "credit",
    titleKey: "welcome.screens.credit.title",
    bodyKey: "welcome.screens.credit.body",
    bodyMoreKey: "welcome.screens.credit.bodyMore",
  },
  {
    kind: "concept",
    key: "identity",
    illustration: "identity",
    titleKey: "welcome.screens.identity.title",
    bodyKey: "welcome.screens.identity.body",
    bodyMoreKey: "welcome.screens.identity.bodyMore",
  },
  {
    kind: "concept",
    key: "community",
    illustration: "community",
    titleKey: "welcome.screens.community.title",
    bodyKey: "welcome.screens.community.body",
    bodyMoreKey: "welcome.screens.community.bodyMore",
  },
  {
    kind: "concept",
    key: "projects",
    // Tree — the next stage from the seedling / herb / sprig
    // metaphors elsewhere in the design language. Projects are the
    // collective form of the same growth.
    illustration: "projects",
    titleKey: "welcome.screens.projects.title",
    bodyKey: "welcome.screens.projects.body",
    bodyMoreKey: "welcome.screens.projects.bodyMore",
  },
  {
    kind: "install",
    key: "install",
    icon: "\u{1F4F2}",
  },
  {
    kind: "profileSetup",
    key: "profileSetup",
    icon: "\u{1F331}",
  },
  {
    kind: "protect",
    key: "protect",
    icon: "\u{1F510}",
  },
];

export default function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    currentMember,
    setCurrentMember,
    onboarded,
    refreshOnboarded,
    nodeConfig,
    nodeId,
    communityNodeIds,
  } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const location = useLocation();

  // `?revisit=1` marks a DELIBERATE re-open of the tour (the
  // LearnSection "Revisit the welcome" link) — the one entry that must
  // survive the onboarded guard below.
  const revisit = new URLSearchParams(location.search).has("revisit");

  // An already-onboarded device has no business on the welcome flow —
  // send it to the board — UNLESS it arrived with the explicit revisit
  // flag. Belt for the post-link trap (PairDevice now refreshes the
  // in-memory flag itself, but any stale navigation, back-button, or
  // bookmark that lands here again must not show a finished member the
  // fork/tour); those paths carry no `?revisit` and still bounce. Safe
  // against the flow's own finish(): that navigates away in the same
  // breath it refreshes.
  useEffect(() => {
    if (onboarded && !revisit) navigate("/", { replace: true });
  }, [onboarded, revisit, navigate]);

  // Auto-skip the install step when we're already running as an
  // installed app — offering "add to home screen" inside the installed
  // app is a dead end. Detected once on mount (the posture can't change
  // mid-tour in a way that matters here), so the visible step list and
  // its progress dots stay honest: when installed, the step is dropped
  // entirely rather than shown-then-skipped.
  const installed = useMemo(
    () => currentInstallEnvironment().kind === "installed",
    [],
  );
  const visibleSteps = useMemo(
    () =>
      installed
        ? [INSTALLED_ARRIVAL_STEP, ...STEPS.filter((s) => s.kind !== "install")]
        : STEPS,
    [installed],
  );

  // Count members scoped to THIS community (a paired device that
  // brought identities over from a peer node could have rows under a
  // foreign nodeId — those don't satisfy the bootstrap on the LOCAL
  // node). Alias-aware (lib/nodeIdentity.ts): members materialized
  // under a pre-canonical community id must still count, or a healed
  // device would wrongly see the invite-only landing.
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
    return all.filter((m) => isOurNode(m.nodeId, communityNodeIds)).length;
  }, [communityNodeIds]);

  // Tri-state: `true` allows onboarding, `false` shows the invite-only
  // landing, `"loading"` defers the decision until Dexie resolves the
  // count. Defaulting to "loading" (not `false`) when invite-only is on
  // avoids flashing the landing on the bootstrap path; defaulting to
  // `true` when invite-only is off is safe (open mode never gates).
  //
  // A member who already HAS an identity always passes: the gate exists
  // to stop strangers from minting themselves an identity on an
  // invite-only node, and profileSetup with a current member only
  // UPDATES that member. Without this bypass an invited member (whose
  // own row makes localMemberCount ≥ 1) would hit the dead-end landing
  // at the final step and could never complete onboarding.
  const selfOnboardingAllowed: boolean | "loading" = useMemo(() => {
    if (currentMember) return true;
    if (!nodeConfig.inviteOnly) return true;
    if (localMemberCount === undefined) return "loading";
    if (localMemberCount === 0) return true;
    return false;
  }, [currentMember, nodeConfig.inviteOnly, localMemberCount]);

  // Profile-setup state lives here (not in the step component) so
  // typing it and stepping Back to a concept screen doesn't lose
  // what was entered. Initialized from the current member so a
  // returning user who re-opens /welcome via the LearnSection link
  // sees their existing values, not empty fields. The display name
  // prefills too — an invited member sees the name they chose at
  // InviteAccept; the dev seed's "You" founder gets renamed to
  // whatever real name is typed here.
  const [displayName, setDisplayName] = useState(
    currentMember?.displayName ?? "",
  );
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

  // /welcome renders OUTSIDE Layout's `ready` gate, so a hard page
  // load can mount this component before AppContext has resolved the
  // current member — the useState initializers above then captured
  // null and the prefill stays empty. When the member arrives late,
  // hydrate any field the visitor hasn't typed into yet (never
  // clobber in-progress input). Runs once per mount.
  const hydratedFromMember = useRef(false);
  useEffect(() => {
    if (hydratedFromMember.current || !currentMember) return;
    hydratedFromMember.current = true;
    setDisplayName((v) => (v.trim() ? v : currentMember.displayName));
    setZone((v) => (v.trim() ? v : currentMember.locationZone ?? ""));
    setSkills((v) => (v.trim() ? v : (currentMember.skills ?? []).join(", ")));
    setAvailability((v) => (v.trim() ? v : currentMember.availability ?? ""));
    setAvailabilityChips((v) =>
      v.length > 0 ? v : currentMember.availabilityChips ?? [],
    );
  }, [currentMember]);

  const validation = useFieldValidation<FieldName>(
    { displayName },
    VALIDATORS,
  );

  async function finish() {
    await markOnboarded();
    await refreshOnboarded();
    navigate("/", { replace: true });
  }

  // Runs from the profileSetup step and requires a valid display
  // name, so "onboarded" can never be true without an identity behind
  // it: with no current member it MINTS the real Ed25519 identity
  // (fresh device on an open node, or the invite-only bootstrap);
  // with one it UPDATES that member's profile (invited member
  // arriving from InviteAccept, or the dev seed's founder) — never a
  // second identity for the same person. After the save, an
  // UNPROTECTED device advances to the protect step (V5 #475) —
  // whose three doors each end in finish() — while a revisit or an
  // already-protected identity finishes directly, as before.
  async function saveProfileAndFinish() {
    validation.markAllTouched();
    if (validation.hasErrors) {
      // Short viewports can have the errored field scrolled away —
      // bring it into view so the blocked submit is never silent.
      focusFirstInvalidField();
      return;
    }
    const name = displayName.trim();
    const trimmedZone = zone.trim();
    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const trimmedAvail = availability.trim();
    setSaving(true);
    try {
      if (currentMember) {
        const updates: Parameters<typeof updateMemberProfile>[1] = {
          displayName: name,
        };
        if (trimmedZone) updates.locationZone = trimmedZone;
        if (parsedSkills.length > 0) updates.skills = parsedSkills;
        if (trimmedAvail) updates.availability = trimmedAvail;
        if (availabilityChips.length > 0) {
          updates.availabilityChips = availabilityChips;
        }
        await updateMemberProfile(currentMember.publicKey, updates);
      } else {
        // createMember generates the keypair and stores the secret key
        // locally — the same machinery redeemInvite and the dev seed
        // ride on. No hand-rolled crypto here.
        const member = await createMember(
          {
            displayName: name,
            locationZone: trimmedZone,
            skills: parsedSkills,
            availability: trimmedAvail,
            availabilityChips,
          },
          nodeId,
        );
        await setCurrentMember(member.publicKey);
      }
      const lockState = await currentLockState();
      if (!revisit && lockState === "unprotected") {
        setStepIndex(
          visibleSteps.findIndex((s) => s.kind === "protect"),
        );
      } else {
        await finish();
      }
    } finally {
      setSaving(false);
    }
  }

  // ---- The protect step's three doors (V5 #475). --------------------
  const [protectPhase, setProtectPhase] = useState<
    "choice" | "passphrase" | "working" | "donePasskey" | "donePassphrase"
  >("choice");
  const [protectError, setProtectError] = useState<string | null>(null);
  const [protectPass, setProtectPass] = useState("");
  const passkeySupported = useMemo(() => supportsPasskeys(), []);

  async function handleProtectPasskey() {
    setProtectError(null);
    setProtectPhase("working");
    try {
      const { enrollPasskey } = await import("@/lib/passkeyUnlock");
      const result = await enrollPasskey({
        displayName: displayName.trim() || "Understoria member",
      });
      if (!result.ok) {
        setProtectPhase("choice");
        if (result.error === "cancelled") return; // their call, no scolding
        setProtectError(
          result.error === "prf_unsupported"
            ? t("profile.security.passkey.prfUnsupported")
            : t("profile.security.passkey.failed"),
        );
        return;
      }
      await enrollPasskeyFirst(result.kek, {
        credentialId: result.credentialId,
        prfSalt: result.prfSalt,
        createdAt: Date.now(),
      });
      setProtectPhase("donePasskey");
    } catch (err) {
      setProtectPhase("choice");
      setProtectError(humanizeError(err));
    }
  }

  async function handleProtectPassphrase() {
    setProtectError(null);
    setProtectPhase("working");
    try {
      await enablePassphrase(protectPass);
      setProtectPass("");
      setProtectPhase("donePassphrase");
    } catch (err) {
      setProtectPhase("passphrase");
      setProtectError(humanizeError(err));
    }
  }

  async function finishProtect(goToSettings: boolean) {
    await finish();
    if (goToSettings) navigate("/settings", { replace: true });
  }

  const step = visibleSteps[stepIndex];
  const onBack = stepIndex === 0 ? null : () => setStepIndex(stepIndex - 1);
  // Skip jumps to the profileSetup step (always the last visible step),
  // never straight to "onboarded": the concept tour is skippable,
  // identity creation is not. Nobody is trapped — Back and leaving the
  // page both still work; the device just isn't "onboarded" until a
  // named identity exists.
  //
  // EXCEPT on a deliberate revisit (`?revisit=1`, the LearnSection
  // link): the member is already onboarded, so "Skip" means "I'm done
  // with the tour", not "take me to profile setup" — it exits straight
  // back to the board. The last step's own "Open the board" button is
  // unchanged; only Skip differs for revisitors.
  const handleSkip = revisit
    ? () => navigate("/", { replace: true })
    : () =>
        // Land on profileSetup, not the last step: the protect step
        // sits after it and is meaningless before an identity exists.
        setStepIndex(
          visibleSteps.findIndex((s) => s.kind === "profileSetup"),
        );

  if (step.kind === "concept") {
    // On the FIRST concept screen only, surface a small affordance
    // for members who landed here because they want to bring an
    // existing identity onto this device — the design doc §7.1
    // "third path." Members who are genuinely new will scroll past
    // without engaging. The beta/AI disclosure also lives here: the
    // first screen a brand-new person reads is the honest place to
    // say what this software is before they put anything into it.
    const bodyWithPairLink =
      stepIndex === 0 ? (
        <>
          <p>{t(step.bodyKey)}</p>
          <p>{t(step.bodyMoreKey)}</p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate("/pair-device")}
              className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("welcome.pairDeviceLink")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/recover")}
              className="text-sm text-canopy-700 underline-offset-2 hover:underline dark:text-canopy-300"
            >
              {t("welcome.recoveryKitLink")}
            </button>
          </div>
          <BetaNotice className="mt-4" />
        </>
      ) : (
        <>
          <p>{t(step.bodyKey)}</p>
          <p>{t(step.bodyMoreKey)}</p>
        </>
      );
    return (
      <OnboardingScreen
        illustration={step.illustration}
        title={t(step.titleKey)}
        body={bodyWithPairLink}
        stepIndex={stepIndex}
        stepCount={visibleSteps.length}
        onBack={onBack}
        // Concept screens are never the last visible step — the
        // profileSetup step always follows — so Next only ever
        // advances; finishing happens exclusively from profileSetup.
        onNext={() => setStepIndex(stepIndex + 1)}
        onSkip={handleSkip}
        nextLabel={t("welcome.next")}
      />
    );
  }

  // The installed-arrival fork. Renders only as the first step of an
  // installed launch: the installed copy has isolated storage, so a
  // member who already onboarded in this phone's browser lands here
  // signed-out. The two cards ARE the navigation — bring-my-identity
  // leaves for the same-phone pairing wizard, I'm-new continues into
  // the normal tour.
  if (step.kind === "installedArrival") {
    return (
      <OnboardingScreen
        icon={step.icon}
        title={t("welcome.installedArrival.title")}
        body={
          <div className="flex flex-col gap-3 text-start">
            <p className="text-center text-sm text-moss-600 dark:text-moss-300">
              {t("welcome.installedArrival.intro")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/pair-device?samePhone=1")}
              className="card flex flex-col gap-1 border-canopy-300 text-start hover:border-canopy-500 dark:border-canopy-700"
            >
              <span className="font-semibold text-canopy-900 dark:text-canopy-100">
                {t("welcome.installedArrival.bringTitle")}
              </span>
              <span className="text-sm text-moss-600 dark:text-moss-300">
                {t("welcome.installedArrival.bringBody")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStepIndex(stepIndex + 1)}
              className="card flex flex-col gap-1 text-start hover:border-moss-400"
            >
              <span className="font-semibold">
                {t("welcome.installedArrival.newTitle")}
              </span>
              <span className="text-sm text-moss-600 dark:text-moss-300">
                {t("welcome.installedArrival.newBody")}
              </span>
            </button>
          </div>
        }
        stepIndex={stepIndex}
        stepCount={visibleSteps.length}
        onBack={null}
        // The two cards ARE the navigation — no Next/Skip on this
        // screen (skipping the fork would mean silently defaulting a
        // returning member into creating a duplicate identity).
        onNext={null}
        onSkip={null}
      />
    );
  }

  // The optional install step. Non-blocking: Next advances to
  // profileSetup (install is never the last visible step — profileSetup
  // always follows), Skip jumps to profileSetup like everywhere else,
  // Back works like any other step. When the app is already installed
  // this branch never renders — the step was filtered out of
  // `visibleSteps` above.
  if (step.kind === "install") {
    return (
      <OnboardingScreen
        icon={step.icon}
        title={t("install.step.title")}
        body={
          <div className="space-y-3 text-start">
            <p className="text-center text-sm text-moss-600 dark:text-moss-300">
              {t("install.step.intro")}
            </p>
            <InstallGuide variant="step" />
          </div>
        }
        stepIndex={stepIndex}
        stepCount={visibleSteps.length}
        onBack={onBack}
        onNext={() => setStepIndex(stepIndex + 1)}
        onSkip={handleSkip}
        nextLabel={t("welcome.next")}
      />
    );
  }

  // "Protect your key" (V5 #475). Reached only from a successful
  // profile save on an unprotected device. One idea per screen: the
  // choice explains only "your key can be locked"; the
  // this-is-not-an-account explanation waits until AFTER enrollment,
  // when it's about something the member just did. Every door ends
  // in finish() — nobody gets trapped ahead of the board.
  if (step.kind === "protect") {
    const doorButton =
      "w-full rounded-xl border border-moss-300 p-4 text-start hover:bg-moss-50 dark:border-moss-700 dark:hover:bg-moss-900";
    return (
      <OnboardingScreen
        icon={step.icon}
        title={t("welcome.protect.title")}
        body={
          protectPhase === "donePasskey" ? (
            <div className="space-y-3 text-start">
              <p className="font-medium">{t("welcome.protect.doneTitle")}</p>
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("welcome.protect.doneNotAnAccount")}
              </p>
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("welcome.protect.doneBackup")}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void finishProtect(true)}
                >
                  {t("welcome.protect.backupNow")}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void finishProtect(false)}
                >
                  {t("welcome.protect.backupLater")}
                </button>
              </div>
            </div>
          ) : protectPhase === "donePassphrase" ? (
            <div className="space-y-3 text-start">
              <p className="font-medium">
                {t("welcome.protect.doneTitlePassphrase")}
              </p>
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("welcome.protect.doneBackup")}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void finishProtect(false)}
                >
                  {t("welcome.start")}
                </button>
              </div>
            </div>
          ) : protectPhase === "passphrase" ? (
            <div className="space-y-3 text-start">
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("profile.security.passphraseHint")}
              </p>
              <input
                className="input w-full"
                type="password"
                value={protectPass}
                onChange={(e) => setProtectPass(e.target.value)}
                aria-label={t("welcome.protect.passphraseLabel")}
                placeholder={t("welcome.protect.passphraseLabel")}
              />
              {protectError && (
                <p role="alert" className="text-sm text-rose-600">
                  {protectError}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void handleProtectPassphrase()}
                >
                  {t("welcome.protect.passphraseConfirm")}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setProtectError(null);
                    setProtectPhase("choice");
                  }}
                >
                  {t("common.back")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-start">
              <p className="text-sm text-moss-600 dark:text-moss-300">
                {t("welcome.protect.intro")}
              </p>
              {protectError && (
                <p role="alert" className="text-sm text-rose-600">
                  {protectError}
                </p>
              )}
              {passkeySupported && (
                <button
                  type="button"
                  className={doorButton}
                  disabled={protectPhase === "working"}
                  onClick={() => void handleProtectPasskey()}
                >
                  <span className="block font-medium">
                    {protectPhase === "working"
                      ? t("common.working")
                      : t("welcome.protect.passkeyDoor")}
                  </span>
                  <span className="block text-sm text-moss-600 dark:text-moss-300">
                    {t("welcome.protect.passkeyDoorBody")}
                  </span>
                </button>
              )}
              <button
                type="button"
                className={doorButton}
                disabled={protectPhase === "working"}
                onClick={() => {
                  setProtectError(null);
                  setProtectPhase("passphrase");
                }}
              >
                <span className="block font-medium">
                  {t("welcome.protect.passphraseDoor")}
                </span>
                <span className="block text-sm text-moss-600 dark:text-moss-300">
                  {t("welcome.protect.passphraseDoorBody")}
                </span>
              </button>
              <button
                type="button"
                className={doorButton}
                disabled={protectPhase === "working"}
                onClick={() => void finish()}
              >
                <span className="block font-medium">
                  {t("welcome.protect.skipDoor")}
                </span>
                <span className="block text-sm text-moss-600 dark:text-moss-300">
                  {t("welcome.protect.skipDoorBody")}
                </span>
              </button>
            </div>
          )
        }
        stepIndex={stepIndex}
        stepCount={visibleSteps.length}
        // No Back (the identity is already minted — re-running the
        // profile save would be the only thing behind), no Next/Skip:
        // the doors ARE the navigation, like installedArrival.
        onBack={null}
        onNext={null}
        onSkip={null}
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
        <div className="space-y-4 text-start">
          <p className="text-center text-sm text-moss-600 dark:text-moss-300">
            {currentMember
              ? t("welcome.profileSetup.introExisting", {
                  name: currentMember.displayName,
                })
              : t("welcome.profileSetup.intro")}
          </p>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t("welcome.profileSetup.nameLabel")}
            </span>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={() => validation.onBlur("displayName")}
              aria-invalid={
                validation.shouldShowError("displayName") || undefined
              }
              aria-describedby={
                validation.shouldShowError("displayName")
                  ? "welcome-displayName-error"
                  : undefined
              }
              maxLength={60}
              required
              disabled={saving}
            />
            {validation.shouldShowError("displayName") && (
              <p
                id="welcome-displayName-error"
                role="alert"
                className="text-xs text-rose-700 dark:text-rose-300"
              >
                {t(validation.errors.displayName!.key)}
              </p>
            )}
          </label>
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
          <p className="text-center text-xs text-moss-600 dark:text-moss-300">
            {t("welcome.profileSetup.hint")}
          </p>
          {/* Bridge sentence so the landing isn't cold — the Board has
              its own nudges, this is just a "what now" before the
              finish tap. Plain text, no new buttons. */}
          <p className="text-center text-sm text-moss-600 dark:text-moss-300">
            {t("welcome.nextSteps")}
          </p>
        </div>
      }
      stepIndex={stepIndex}
      stepCount={visibleSteps.length}
      onBack={onBack}
      onNext={() => void saveProfileAndFinish()}
      // No Skip here: identity creation is the one non-skippable step.
      // "Onboarded" must never be true without a named identity behind
      // it. Back / leaving the page remain available — nobody is
      // trapped, the device just stays un-onboarded.
      onSkip={null}
      // A fresh device continues to the protect step, so the button
      // says Next; a revisit finishes here and keeps "Open the board".
      nextLabel={
        saving
          ? t("common.working")
          : revisit
            ? t("welcome.start")
            : t("welcome.next")
      }
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
        <p className="text-sm text-moss-600 dark:text-moss-300">
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
      <div className="space-y-3 text-start text-sm text-moss-700 dark:text-moss-200">
        <p>{t("welcome.inviteOnly.body1")}</p>
        <p>{t("welcome.inviteOnly.body2")}</p>
      </div>
    </div>
  );
}
