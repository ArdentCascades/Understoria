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
import { ensureNodeId, seedDemoCommunityIfEmpty } from "@/db/seed";
import {
  backfillOnboardedForExistingUsers,
  isOnboarded,
} from "@/db/onboarding";
import { getNodeConfig } from "@/db/nodeConfig";
import { DEFAULT_NODE_CONFIG } from "@/types";
import type {
  Achievement,
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
  isTextSize,
  type TextSize,
} from "@/lib/textSize";

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
  textSize: TextSize;
  setTextSize: (size: TextSize) => Promise<void>;
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
  const [textSize, setTextSizeState] = useState<TextSize>("default");
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
      // localStorage is the no-FOUC cache.
      const rawSize = await getSetting(SETTING_KEYS.textSize);
      const size: TextSize = isTextSize(rawSize) ? rawSize : "default";
      if (cancelled) return;
      setTextSizeState(size);
      applyTextSize(size);
      cacheTextSize(size);
      // Only seed the demo community when the node isn't locked. Seeding
      // writes plaintext secret keys for demo members, which we don't want
      // to run while a user's real wrapped keys are present but sealed.
      if (initialLock !== "locked") {
        const member = await seedDemoCommunityIfEmpty();
        const storedKey = await getSetting(SETTING_KEYS.currentMember);
        if (cancelled) return;
        setCurrentMemberKey(storedKey ?? member.publicKey);
      } else {
        const storedKey = await getSetting(SETTING_KEYS.currentMember);
        if (cancelled) return;
        setCurrentMemberKey(storedKey ?? null);
      }
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

  // Federation sync — pull cross-node posts from the community
  // node on startup. Runs once; subsequent syncs happen on
  // manual refresh or next app load. Silent failure — if the
  // node is unreachable the Board just shows local posts.
  useEffect(() => {
    if (!ready) return;
    void import("@/lib/federationSync").then(
      ({
        pullFederatedPosts,
        pullFederatedClaims,
        pullFederatedTaskComments,
      }) => {
        void pullFederatedPosts();
        void pullFederatedClaims();
        void pullFederatedTaskComments();
      },
    );
  }, [ready]);

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

  const setTextSize = useCallback(async (size: TextSize) => {
    await setSetting(SETTING_KEYS.textSize, size);
    setTextSizeState(size);
    applyTextSize(size);
    cacheTextSize(size);
  }, []);

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

  const currentMember = useMemo(
    () => members?.find((m) => m.publicKey === currentMemberKey) ?? null,
    [members, currentMemberKey],
  );

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
      posts: posts ?? [],
      exchanges: exchanges ?? [],
      achievements: achievements ?? [],
      invites: invites ?? [],
      vouches: vouches ?? [],
      projects: projects ?? [],
      projectTasks: projectTasks ?? [],
      proposals: proposals ?? [],
      votes: votes ?? [],
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
      textSize,
      setTextSize,
    }),
    [
      ready,
      nodeId,
      currentMember,
      setCurrentMember,
      members,
      posts,
      exchanges,
      achievements,
      invites,
      vouches,
      projects,
      projectTasks,
      proposals,
      votes,
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
      textSize,
      setTextSize,
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
