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
import type { Achievement, Exchange, Member, Post } from "@/types";
import type { InviteRow } from "@/db/database";
import type { SignedVouch } from "@/lib/vouch";
import {
  currentLockState,
  lockSession,
  unlockSession,
  type LockState,
} from "@/db/secrets";

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
  lockState: LockState;
  unlock: (
    passphrase: string,
  ) => Promise<"unlocked" | "wrong_passphrase" | "nothing_to_unlock">;
  lock: () => void;
  refreshLockState: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [nodeId, setNodeId] = useState<string>("");
  const [currentMemberKey, setCurrentMemberKey] = useState<string | null>(
    null,
  );
  const [lockState, setLockState] = useState<LockState>("unprotected");
  const cleanupRef = useRef<(() => void) | null>(null);

  const refreshLockState = useCallback(async () => {
    const next = await currentLockState();
    setLockState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const node = await ensureNodeId();
      const initialLock = await currentLockState();
      if (cancelled) return;
      setLockState(initialLock);
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
      lockState,
      unlock,
      lock,
      refreshLockState,
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
      lockState,
      unlock,
      lock,
      refreshLockState,
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
