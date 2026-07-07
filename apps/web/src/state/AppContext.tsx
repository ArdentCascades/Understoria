/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  getSetting,
  SETTING_KEYS,
  setSetting,
} from "@/db/database";
import { ensureNodeId, seedDemoCommunityIfDev } from "@/db/seed";
import {
  backfillOnboardedForExistingUsers,
  isOnboarded,
} from "@/db/onboarding";
import { getNodeConfig } from "@/db/nodeConfig";
import { DEFAULT_NODE_CONFIG } from "@/types";
import type {
  Achievement,
  CoOrganizerInvitation,
  CoOrganizerInvitationResponse,
  CoOrganizerInvitationRevocation,
  Event,
  EventCancellation,
  EventProjectLinkRow,
  EventRsvpRow,
  Exchange,
  Member,
  NodeConfig,
  Post,
  Project,
  ProjectTask,
  Proposal,
  Vote,
} from "@/types";
import type { InviteRow } from "@/db/database";
import type { BlockRow } from "@/types";
import type { SignedVouch } from "@/lib/vouch";
import {
  currentLockState,
  lockSession,
  unlockSession,
  type LockState,
} from "@/db/secrets";
import {
  applyTheme,
  cacheResolvedTheme,
  isThemePreference,
  resolveTheme,
  subscribeSystemTheme,
  systemPrefersDark,
  type ThemePreference,
} from "@/lib/theme";
import {
  applyTextSize,
  cacheTextSize,
  isTextSizePreference,
  isWideViewport,
  resolveTextSize,
  subscribeViewportWidth,
  type TextSize,
  type TextSizePreference,
} from "@/lib/textSize";
import {
  applyDensity,
  cacheDensity,
  isDensityPreference,
  type DensityPreference,
} from "@/lib/density";

export interface AppContextValue {
  ready: boolean;
  nodeId: string;
  currentMember: Member | null;
  setCurrentMember: (publicKey: string) => Promise<void>;
  members: Member[];
  posts: Post[];
  exchanges: Exchange[];
  achievements: Achievement[];
  invites: InviteRow[];
  vouches: SignedVouch[];
  projects: Project[];
  projectTasks: ProjectTask[];
  proposals: Proposal[];
  votes: Vote[];
  /** Co-organizer invitation records (PR C). Feed the invitee-side
   *  attention item and the organizer-side pending / past lists.
   *  See `docs/co-organizer-invitations.md` §6–§7. */
  coorgInvitations: CoOrganizerInvitation[];
  coorgInvitationResponses: CoOrganizerInvitationResponse[];
  coorgInvitationRevocations: CoOrganizerInvitationRevocation[];
  /** Federated community events (PR F). Drive the Calendar event
   *  markers + three event attention-rail items. See
   *  `docs/community-events.md`. */
  events: Event[];
  /** Local-only RSVP roster. Never federates — see design doc §4 + §7. */
  eventRsvps: EventRsvpRow[];
  /** Signed event-cancellation rows. Combined with `events` to derive
   *  effective state and to drive the `event_cancelled` attention item. */
  eventCancellations: EventCancellation[];
  /** Local-only event⇄project work-day links (plan 10). Never federates.
   *  Consumers (Calendar, ProjectDetail, EventDetail) join these against
   *  the already-block-filtered `events`; the rows themselves carry no
   *  member key to filter on. */
  eventProjectLinks: EventProjectLinkRow[];
  /**
   * PR F (member blocking — consumer wiring). The set of `blockedKey`
   * values the current member has actively blocked, derived once
   * from the `blocks` table. Consumers that need the raw set (e.g.
   * filtering attention items, custom per-page filters) can read
   * this directly; the exported `posts` / `projects` / `events` /
   * `vouches` arrays above are already pre-filtered against this
   * set for the §6 hide-from-blocker rows. See `docs/blocking.md`
   * §6.
   *
   * The current member's OWN content is NEVER filtered — block is
   * one-way visibility from the blocker's perspective (see the
   * PR F scope note "No filtering of OWN content"). The block set
   * applies only to OTHER members' content rendered in this
   * member's view.
   */
  blockedKeys: ReadonlySet<string>;
  /**
   * The subset of `blockedKeys` where the per-block `hideGovernance`
   * flag is `true`. Used by governance surfaces (Proposals, Disputes,
   * Votes) to filter contributions — system default is to leave
   * governance visible (`hideGovernance: false`); per-block opt-in
   * flips it. See `docs/blocking.md` §3.2 + §6 rows "Dispute /
   * Proposal comments" and "Proposal votes" + §11.10.
   *
   * Membership in this set is a strict subset of `blockedKeys`;
   * unblocking removes the entry from both sets in lockstep via the
   * underlying `BlockRow.hideGovernance` flag.
   */
  governanceHiddenKeys: ReadonlySet<string>;
  lockState: LockState;
  unlock: (
    passphrase: string,
  ) => Promise<"unlocked" | "wrong_passphrase" | "nothing_to_unlock">;
  lock: () => void;
  refreshLockState: () => Promise<void>;
  onboarded: boolean;
  refreshOnboarded: () => Promise<void>;
  nodeConfig: NodeConfig;
  refreshNodeConfig: () => Promise<void>;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  textSizePreference: TextSizePreference;
  textSize: TextSize;
  setTextSizePreference: (pref: TextSizePreference) => Promise<void>;
  densityPreference: DensityPreference;
  setDensityPreference: (pref: DensityPreference) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [nodeId, setNodeId] = useState<string>("");
  const [currentMemberKey, setCurrentMemberKey] = useState<string | null>(
    null,
  );
  const [lockState, setLockState] = useState<LockState>("unprotected");
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [nodeConfig, setNodeConfig] = useState<NodeConfig>(DEFAULT_NODE_CONFIG);
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [textSizePreference, setTextSizePreferenceState] =
    useState<TextSizePreference>("auto");
  const [textSize, setTextSizeState] = useState<TextSize>("default");
  const [densityPreference, setDensityPreferenceState] =
    useState<DensityPreference>("default");
  const cleanupRef = useRef<(() => void) | null>(null);

  const refreshLockState = useCallback(async () => {
    const next = await currentLockState();
    setLockState(next);
  }, []);

  const refreshOnboarded = useCallback(async () => {
    setOnboarded(await isOnboarded());
  }, []);

  const refreshNodeConfig = useCallback(async () => {
    setNodeConfig(await getNodeConfig(nodeId));
  }, [nodeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const node = await ensureNodeId();
      const initialLock = await currentLockState();
      if (cancelled) return;
      setLockState(initialLock);
      // Hydrate theme preference from Dexie. The inline script in
      // index.html already applied the right class on first paint
      // using the localStorage cache; this read syncs React state
      // and corrects the class if the cache was stale.
      const rawTheme = await getSetting(SETTING_KEYS.themePreference);
      const pref: ThemePreference = isThemePreference(rawTheme)
        ? rawTheme
        : "system";
      if (cancelled) return;
      setThemePreferenceState(pref);
      applyTheme(resolveTheme(pref, systemPrefersDark()));
      cacheResolvedTheme(pref);
      // Same shape for text size — Dexie is the source of truth,
      // localStorage is the no-FOUC cache. Default preference is
      // "auto" (larger on desktop, default on phone). Explicit
      // values from v1 (PR #88) pass isTextSizePreference and are
      // honored as-is.
      const rawSize = await getSetting(SETTING_KEYS.textSize);
      const sizePref: TextSizePreference = isTextSizePreference(rawSize)
        ? rawSize
        : "auto";
      const resolvedSize = resolveTextSize(sizePref, isWideViewport());
      if (cancelled) return;
      setTextSizePreferenceState(sizePref);
      setTextSizeState(resolvedSize);
      applyTextSize(resolvedSize);
      cacheTextSize(sizePref);
      // Density preference. Same pattern: Dexie is source of truth,
      // localStorage is the no-FOUC cache. Default is the comfortable
      // padding (launch behavior); compact is opt-in only.
      const rawDensity = await getSetting(SETTING_KEYS.density);
      const densPref: DensityPreference = isDensityPreference(rawDensity)
        ? rawDensity
        : "default";
      if (cancelled) return;
      setDensityPreferenceState(densPref);
      applyDensity(densPref);
      cacheDensity(densPref);
      // Demo-community seed is DEV-MODE ONLY (operator ruling R1): dev
      // builds get a demo community to poke at; real deployments start
      // with an empty node, and the first identity is minted by
      // onboarding (Welcome's profile-setup step, InviteAccept, or
      // PairDevice) — never by the seed. The seed also only runs when
      // the node isn't locked: it writes plaintext secret keys for demo
      // members, which we don't want while a user's real wrapped keys
      // are present but sealed. In every non-seeding path the current
      // member is simply whatever the settings row says — possibly null
      // on a fresh device, which the app tolerates pre-onboarding.
      if (initialLock !== "locked") {
        await seedDemoCommunityIfDev();
      }
      const storedKey = await getSetting(SETTING_KEYS.currentMember);
      if (cancelled) return;
      setCurrentMemberKey(storedKey ?? null);
      // Devices that have used Understoria before Agent 16 had members
      // but never set the onboarded flag — backfill so they don't see
      // a welcome flow for software they already know.
      await backfillOnboardedForExistingUsers();
      if (cancelled) return;
      setOnboarded(await isOnboarded());
      setNodeConfig(await getNodeConfig(node));
      setNodeId(node);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Start the outbox worker once the app is ready. Stops on unmount /
  // hot reload so tests and dev environments don't accumulate stray
  // timers. Locked-state startup is fine — the worker honors the
  // disabled flag and lock state via readSubmitConfig + getSecretKey
  // at flush time.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void import("@/lib/outbox").then(({ startOutboxWorker, stopOutboxWorker }) => {
      if (cancelled) return;
      startOutboxWorker();
      // Stash a cleanup target so the effect's return can invoke it.
      cleanupRef.current = stopOutboxWorker;
    });
    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [ready]);

  // Federation sync — pull cross-node records from the community node
  // on startup AND on a steady interval, so long-lived tabs and
  // installed apps converge without a reload (project & task state
  // especially — docs/project-federation.md §5). Silent failure — if
  // the node is unreachable the Board just shows local records.
  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const FEDERATION_REPULL_MS = 3 * 60 * 1000;
    const runPulls = () =>
      import("@/lib/federationSync").then(
        ({
          pullFederatedPosts,
          pullFederatedClaims,
          pullFederatedTaskComments,
          pullFederatedExchanges,
          pullFederatedCoOrgInvitations,
          pullFederatedCoOrgResponses,
          pullFederatedCoOrgRevocations,
          pullFederatedEvents,
          pullFederatedEventCancellations,
          pullFederatedRedemptions,
          pullFederatedInviteRevocations,
          pullFederatedVouches,
          pullFederatedProjectStates,
          pullFederatedTaskStates,
        }) => {
          void pullFederatedPosts();
          void pullFederatedClaims();
          void pullFederatedTaskComments();
          void pullFederatedExchanges();
          void pullFederatedCoOrgInvitations();
          void pullFederatedCoOrgResponses();
          void pullFederatedCoOrgRevocations();
          void pullFederatedEvents();
          void pullFederatedEventCancellations();
          // Phase 1 of docs/invite-redemption.md: redemption receipts
          // (invite-row flip + roster materialization, §6) and the §9
          // companion vouch pull (trust-status convergence).
          void pullFederatedRedemptions();
          // docs/invite-revocation.md: converge revoked-then-redeemed
          // invites to one honest state across every device.
          void pullFederatedInviteRevocations();
          void pullFederatedVouches();
          // docs/project-federation.md: project + task LWW state.
          // Projects first — a task's authority derives from its
          // project, so the task pull skips rows whose project
          // hasn't landed yet and retries next cycle.
          void pullFederatedProjectStates().then(() => {
            void pullFederatedTaskStates();
          });
        },
      );
    void runPulls();
    timer = setInterval(() => void runPulls(), FEDERATION_REPULL_MS);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ready]);

  // Auto-confirm sweep — for `awaiting_confirmation` records older
  // than `nodeConfig.autoConfirmHours`, ask the server's system key
  // to close them out. Silent no-op if the community knob is 0 or
  // the community node is unreachable. See
  // `docs/auto-confirm-key.md`.
  useEffect(() => {
    if (!ready) return;
    if (!nodeId) return;
    void import("@/lib/autoConfirmSweep").then(({ runAutoConfirmSweep }) => {
      void runAutoConfirmSweep(nodeId).catch((err) => {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[understoria] auto-confirm sweep failed", err);
        }
      });
    });
  }, [ready, nodeId]);

  // When the preference is "system", repaint on OS theme change.
  // When the user pins "light" or "dark", the subscription is
  // pointless (override wins) — skip it so the matchMedia handler
  // isn't sitting around firing no-ops.
  useEffect(() => {
    if (themePreference !== "system") return;
    return subscribeSystemTheme((dark) => {
      applyTheme(dark ? "dark" : "light");
    });
  }, [themePreference]);

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    await setSetting(SETTING_KEYS.themePreference, pref);
    setThemePreferenceState(pref);
    applyTheme(resolveTheme(pref, systemPrefersDark()));
    cacheResolvedTheme(pref);
  }, []);

  // When the preference is "auto", repaint on viewport-width
  // change. The three explicit sizes ignore viewport, so skipping
  // the subscription saves a no-op listener.
  useEffect(() => {
    if (textSizePreference !== "auto") return;
    return subscribeViewportWidth((wide) => {
      const resolved: TextSize = wide ? "larger" : "default";
      setTextSizeState(resolved);
      applyTextSize(resolved);
    });
  }, [textSizePreference]);

  const setTextSizePreference = useCallback(
    async (pref: TextSizePreference) => {
      await setSetting(SETTING_KEYS.textSize, pref);
      const resolved = resolveTextSize(pref, isWideViewport());
      setTextSizePreferenceState(pref);
      setTextSizeState(resolved);
      applyTextSize(resolved);
      cacheTextSize(pref);
    },
    [],
  );

  const setDensityPreference = useCallback(
    async (pref: DensityPreference) => {
      await setSetting(SETTING_KEYS.density, pref);
      setDensityPreferenceState(pref);
      applyDensity(pref);
      cacheDensity(pref);
    },
    [],
  );

  const unlock = useCallback(
    async (passphrase: string) => {
      const result = await unlockSession(passphrase);
      if (result === "unlocked") {
        await refreshLockState();
      }
      return result;
    },
    [refreshLockState],
  );

  const lock = useCallback(() => {
    lockSession();
    setLockState("locked");
  }, []);

  const members = useLiveQuery(() => db.members.toArray(), [], [] as Member[]);
  const posts = useLiveQuery(
    () => db.posts.orderBy("createdAt").reverse().toArray(),
    [],
    [] as Post[],
  );
  const exchanges = useLiveQuery(
    () => db.exchanges.orderBy("completedAt").reverse().toArray(),
    [],
    [] as Exchange[],
  );
  const achievements = useLiveQuery(
    () => db.achievements.toArray(),
    [],
    [] as Achievement[],
  );
  const invites = useLiveQuery(
    () => db.invites.orderBy("createdAt").reverse().toArray(),
    [],
    [] as InviteRow[],
  );
  const vouches = useLiveQuery(
    () => db.vouches.toArray(),
    [],
    [] as SignedVouch[],
  );
  const projects = useLiveQuery(
    () => db.projects.orderBy("createdAt").reverse().toArray(),
    [],
    [] as Project[],
  );
  const projectTasks = useLiveQuery(
    () => db.projectTasks.toArray(),
    [],
    [] as ProjectTask[],
  );
  const proposals = useLiveQuery(
    () => db.proposals.orderBy("createdAt").reverse().toArray(),
    [],
    [] as Proposal[],
  );
  const votes = useLiveQuery(
    () => db.votes.toArray(),
    [],
    [] as Vote[],
  );
  const coorgInvitations = useLiveQuery(
    () => db.coorgInvitations.toArray(),
    [],
    [] as CoOrganizerInvitation[],
  );
  const coorgInvitationResponses = useLiveQuery(
    () => db.coorgInvitationResponses.toArray(),
    [],
    [] as CoOrganizerInvitationResponse[],
  );
  const coorgInvitationRevocations = useLiveQuery(
    () => db.coorgInvitationRevocations.toArray(),
    [],
    [] as CoOrganizerInvitationRevocation[],
  );
  const events = useLiveQuery(
    () => db.events.orderBy("startsAt").toArray(),
    [],
    [] as Event[],
  );
  const eventRsvps = useLiveQuery(
    () => db.eventRsvps.toArray(),
    [],
    [] as EventRsvpRow[],
  );
  const eventCancellations = useLiveQuery(
    () => db.eventCancellations.toArray(),
    [],
    [] as EventCancellation[],
  );
  const eventProjectLinks = useLiveQuery(
    () => db.eventProjectLinks.toArray(),
    [],
    [] as EventProjectLinkRow[],
  );
  // PR F: live block rows for the current member. Scoped by
  // blockerKey so a paired-device cluster shared between household
  // members (each with their own key) reads only their own rows.
  // The query re-runs whenever the `blocks` table mutates — a fresh
  // block / unblock / hideGovernance toggle reflows the derived
  // filter-set without any manual refresh. See docs/blocking.md §6 /
  // PR F scope.
  const blockRowsForCurrent = useLiveQuery(
    () => {
      if (!currentMemberKey)
        return Promise.resolve([] as BlockRow[]);
      return db.blocks
        .where("blockerKey")
        .equals(currentMemberKey)
        .toArray() as Promise<BlockRow[]>;
    },
    [currentMemberKey],
    [] as BlockRow[],
  );

  const currentMember = useMemo(
    () => members?.find((m) => m.publicKey === currentMemberKey) ?? null,
    [members, currentMemberKey],
  );

  // PR F (member blocking — consumer wiring). Derive the two
  // visibility-filter sets from the live block rows:
  //
  //   - `blockedKeys`: every member the current blocker has actively
  //     blocked. Used by the (a) hide-from-blocker rows of the §6
  //     scope table (posts, projects, events, vouches, attention,
  //     etc.).
  //   - `governanceHiddenKeys`: the strict subset for which the
  //     per-block `hideGovernance` opt-in is on. Used by the
  //     governance-only branches (proposals, votes, dispute
  //     comments) per §3.2 + §6.
  //
  // The sets are derived ONCE per block-row mutation and consumed
  // by every list-filter downstream — single bulk read, O(1)
  // per-row lookups thereafter. See `db/blocks.ts` `blockedFilter`
  // for the equivalent action-side helper.
  const blockedKeys = useMemo<ReadonlySet<string>>(() => {
    const s = new Set<string>();
    for (const row of blockRowsForCurrent ?? []) s.add(row.blockedKey);
    return s;
  }, [blockRowsForCurrent]);
  const governanceHiddenKeys = useMemo<ReadonlySet<string>>(() => {
    const s = new Set<string>();
    for (const row of blockRowsForCurrent ?? []) {
      if (row.hideGovernance) s.add(row.blockedKey);
    }
    return s;
  }, [blockRowsForCurrent]);

  // PR F: pre-filter the exposed arrays so every Board / Calendar /
  // Profile consumer downstream automatically respects the §6
  // hide-from-blocker rule. The current member's OWN content is
  // never filtered (block is one-way visibility from the blocker's
  // perspective). Note: governance rows (proposals, votes) are NOT
  // filtered here — the default `hideGovernance: false` would never
  // filter them, and the per-block opt-in is applied by the
  // governance consumer surfaces (Proposals, Disputes pages)
  // reading `governanceHiddenKeys`.
  //
  // Why filter at the AppContext rather than the page: the consumer
  // surfaces are too many (Board feed, Calendar agenda/month/week,
  // Profile vouchers, MemberDetail, search results, attention rail,
  // …) to gate one-by-one without risking a missed surface. The
  // central filter at the data fan-out point is the leakproof shape.
  // Per-action gates (claimPost, rsvpToEvent, sendMessage, etc.)
  // live closer to their writes and use point-lookup
  // `isMutuallyBlocked`.
  const filteredPosts = useMemo(() => {
    if (blockedKeys.size === 0) return posts ?? [];
    return (posts ?? []).filter((p) => !blockedKeys.has(p.postedBy));
  }, [posts, blockedKeys]);
  const filteredProjects = useMemo(() => {
    if (blockedKeys.size === 0 || !currentMemberKey) return projects ?? [];
    // Co-organizer standing trumps block visibility — if the current
    // member is a co-organizer of a project organized by someone
    // they've now blocked, they should NOT lose access to the
    // project (per PR F scope: "The filter is 'hide projects where
    // I have NO standing.'"). Practically: hide projects organized
    // by a blocked member ONLY when the current member is NOT a
    // co-organizer of the project.
    //
    // Standing reads `Project.coOrganizerKeys` — the live authority
    // list materialized on every grant and removal since PR #238, so a
    // co-organizer who just accepted their invitation keeps the project
    // (and a stepped-down one correctly loses standing). See
    // `docs/co-organizer-invitations.md` §5.
    return (projects ?? []).filter((p) => {
      if (!blockedKeys.has(p.organizerKey)) return true;
      return p.coOrganizerKeys.includes(currentMemberKey);
    });
  }, [projects, blockedKeys, currentMemberKey]);
  const filteredEvents = useMemo(() => {
    if (blockedKeys.size === 0) return events ?? [];
    return (events ?? []).filter((e) => !blockedKeys.has(e.createdBy));
  }, [events, blockedKeys]);
  // Vouches: hide vouches AUTHORED by a blocked member from the
  // current blocker's view. The signed vouch row stays in Dexie
  // (immutable; existing signed records aren't retroactively
  // unsigned by a later block — see settled decision 6 / "block
  // engages prospectively only"); rendering filter only.
  const filteredVouches = useMemo(() => {
    if (blockedKeys.size === 0) return vouches ?? [];
    return (vouches ?? []).filter((v) => !blockedKeys.has(v.voucherKey));
  }, [vouches, blockedKeys]);

  const setCurrentMember = useCallback(async (publicKey: string) => {
    await setSetting(SETTING_KEYS.currentMember, publicKey);
    setCurrentMemberKey(publicKey);
  }, []);

  const value: AppContextValue = useMemo(
    () => ({
      ready,
      nodeId,
      currentMember,
      setCurrentMember,
      members: members ?? [],
      posts: filteredPosts,
      exchanges: exchanges ?? [],
      achievements: achievements ?? [],
      invites: invites ?? [],
      vouches: filteredVouches,
      projects: filteredProjects,
      projectTasks: projectTasks ?? [],
      // proposals + votes are deliberately NOT filtered here —
      // governance content is visible by default per docs/blocking.md
      // §3.2 / §11.10 (no silent disenfranchisement). Governance
      // surfaces apply the per-block opt-in via `governanceHiddenKeys`
      // themselves. This locks the load-bearing negative test —
      // listProposals returns the same set when hideGovernance is
      // false for every block.
      proposals: proposals ?? [],
      votes: votes ?? [],
      coorgInvitations: coorgInvitations ?? [],
      coorgInvitationResponses: coorgInvitationResponses ?? [],
      coorgInvitationRevocations: coorgInvitationRevocations ?? [],
      events: filteredEvents,
      eventRsvps: eventRsvps ?? [],
      eventCancellations: eventCancellations ?? [],
      eventProjectLinks: eventProjectLinks ?? [],
      blockedKeys,
      governanceHiddenKeys,
      lockState,
      unlock,
      lock,
      refreshLockState,
      onboarded,
      refreshOnboarded,
      nodeConfig,
      refreshNodeConfig,
      themePreference,
      setThemePreference,
      textSizePreference,
      textSize,
      setTextSizePreference,
      densityPreference,
      setDensityPreference,
    }),
    [
      ready,
      nodeId,
      currentMember,
      setCurrentMember,
      members,
      filteredPosts,
      exchanges,
      achievements,
      invites,
      filteredVouches,
      filteredProjects,
      projectTasks,
      proposals,
      votes,
      coorgInvitations,
      coorgInvitationResponses,
      coorgInvitationRevocations,
      filteredEvents,
      eventRsvps,
      eventCancellations,
      eventProjectLinks,
      blockedKeys,
      governanceHiddenKeys,
      lockState,
      unlock,
      lock,
      refreshLockState,
      onboarded,
      refreshOnboarded,
      nodeConfig,
      refreshNodeConfig,
      themePreference,
      setThemePreference,
      textSizePreference,
      textSize,
      setTextSizePreference,
      densityPreference,
      setDensityPreference,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error("useApp must be used within an AppProvider");
  return ctx;
}

export function useRequireMember(): Member {
  const { currentMember } = useApp();
  if (!currentMember)
    throw new Error("Expected a current member to be loaded");
  return currentMember;
}
