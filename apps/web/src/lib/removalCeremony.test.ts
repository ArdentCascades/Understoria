/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { beforeEach, describe, expect, it } from "vitest";
import { generateKeyPair } from "@understoria/shared/crypto";
import { db, setSetting, SETTING_KEYS } from "@/db/database";
import { createMember } from "@/db/seed";
import { persistSecretKey } from "@/db/secrets";
import { removalStructurallyValid } from "./memberRemoval";
import type { MemberRemoval } from "@understoria/shared/types";
import {
  coSignDraft,
  collectCosignFragment,
  mintCeremonyDraft,
  parseCeremonyDraft,
  submitCeremonyRecord,
  type CeremonyDraft,
} from "./removalCeremony";

async function wipe() {
  await Promise.all(db.tables.map((t) => t.clear()));
}

async function beMember(
  kp: { publicKey: string; secretKey: string },
  name: string,
) {
  await createMember({ publicKey: kp.publicKey, displayName: name }, "node_t");
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await setSetting(SETTING_KEYS.currentMember, kp.publicKey);
  await setSetting(SETTING_KEYS.communityNodeUrl, "https://node.test/api");
}

beforeEach(wipe);

describe("the co-signing ceremony, device by device", () => {
  it("mint → co-sign → collect → submit assembles a structurally valid quorum record", async () => {
    const proposer = generateKeyPair();
    const cosignerA = generateKeyPair();
    const cosignerB = generateKeyPair();
    const target = generateKeyPair();

    // --- Proposer's device: mint the draft (their signature is #1) ---
    await beMember(proposer, "Rosa");
    const minted = await mintCeremonyDraft(
      "removal",
      target.publicKey,
      "  a reason the community will read  ",
    );
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;
    let draft: CeremonyDraft = minted.draft;
    expect(draft.payload.reason).toBe("a reason the community will read");
    expect(draft.signatures).toHaveLength(1);

    // --- Co-signer A's device: parse (sees who/why), sign ---
    await wipe();
    await beMember(cosignerA, "Gus");
    const parsedA = parseCeremonyDraft(draft.draftText);
    expect(parsedA.ok).toBe(true);
    if (!parsedA.ok) return;
    expect(parsedA.draft.subjectKey).toBe(target.publicKey);
    const fragA = await coSignDraft(parsedA.draft);
    expect(fragA.ok).toBe(true);

    // --- Co-signer B's device ---
    await wipe();
    await beMember(cosignerB, "Greta");
    const parsedB = parseCeremonyDraft(draft.draftText);
    if (!parsedB.ok) throw new Error("parse failed");
    const fragB = await coSignDraft(parsedB.draft);
    if (!fragA.ok || !fragB.ok) throw new Error("cosign failed");

    // --- Back on the proposer's device: collect both fragments ---
    await wipe();
    await beMember(proposer, "Rosa");
    const a = collectCosignFragment(fragA.fragmentText, draft);
    expect(a.ok).toBe(true);
    if (a.ok) draft = { ...draft, signatures: [...draft.signatures, a.entry] };

    // A replayed fragment is a duplicate.
    expect(collectCosignFragment(fragA.fragmentText, draft)).toEqual({
      ok: false,
      error: "duplicate",
    });

    const b = collectCosignFragment(fragB.fragmentText, draft);
    expect(b.ok).toBe(true);
    if (b.ok) draft = { ...draft, signatures: [...draft.signatures, b.entry] };

    // Under quorum refuses; at quorum queues the assembled record.
    expect(await submitCeremonyRecord({ ...draft, signatures: draft.signatures.slice(0, 2) }, 3)).toEqual({
      ok: false,
      error: "not_enough",
    });
    const submitted = await submitCeremonyRecord(draft, 3);
    expect(submitted).toEqual({ ok: true });

    const queued = await db.outbox
      .filter((r) => r.kind === "member_removal")
      .toArray();
    expect(queued).toHaveLength(1);
    const record = JSON.parse(queued[0].payload) as MemberRemoval;
    // The assembled record passes the SAME structural check every
    // node and every pulling device applies.
    expect(removalStructurallyValid(record, 3)).toBe(true);
    expect(record.signatures.map((s) => s.signerKey).sort()).toEqual(
      [proposer.publicKey, cosignerA.publicKey, cosignerB.publicKey].sort(),
    );
  });

  it("refuses cross-record fragments, subject signatures, and tampered drafts", async () => {
    const proposer = generateKeyPair();
    const target = generateKeyPair();
    const cosigner = generateKeyPair();
    await beMember(proposer, "Rosa");
    const minted = await mintCeremonyDraft("removal", target.publicKey, null);
    const other = await mintCeremonyDraft("removal", generateKeyPair().publicKey, null);
    if (!minted.ok || !other.ok) throw new Error("mint failed");

    // The subject can't mint about themselves.
    expect(await mintCeremonyDraft("removal", proposer.publicKey, null)).toEqual({
      ok: false,
      error: "self_subject",
    });

    // A fragment signed against ANOTHER draft is refused.
    await wipe();
    await beMember(cosigner, "Gus");
    const otherParsed = parseCeremonyDraft(other.draft.draftText);
    if (!otherParsed.ok) throw new Error("parse failed");
    const wrongFrag = await coSignDraft(otherParsed.draft);
    if (!wrongFrag.ok) throw new Error("cosign failed");
    expect(collectCosignFragment(wrongFrag.fragmentText, minted.draft)).toEqual({
      ok: false,
      error: "different_record",
    });

    // The subject's own signature is refused at collection.
    await wipe();
    await beMember(target, "Mallory");
    const parsed = parseCeremonyDraft(minted.draft.draftText);
    if (!parsed.ok) throw new Error("parse failed");
    expect(await coSignDraft(parsed.draft)).toEqual({
      ok: false,
      error: "self_subject",
    });

    // Garbage is not a draft; a draft is not a fragment.
    expect(parseCeremonyDraft("not json").ok).toBe(false);
    expect(collectCosignFragment(minted.draft.draftText, minted.draft)).toEqual({
      ok: false,
      error: "not_a_fragment",
    });
  });

  it("a reinstatement ceremony round-trips the same way", async () => {
    const proposer = generateKeyPair();
    const cosigner = generateKeyPair();
    const target = generateKeyPair();
    await beMember(proposer, "Rosa");
    const minted = await mintCeremonyDraft(
      "reinstatement",
      target.publicKey,
      null,
    );
    expect(minted.ok).toBe(true);
    if (!minted.ok) return;

    await wipe();
    await beMember(cosigner, "Gus");
    const parsed = parseCeremonyDraft(minted.draft.draftText);
    if (!parsed.ok) throw new Error("parse failed");
    expect(parsed.draft.recordKind).toBe("reinstatement");
    const frag = await coSignDraft(parsed.draft);
    if (!frag.ok) throw new Error("cosign failed");

    await wipe();
    await beMember(proposer, "Rosa");
    const collected = collectCosignFragment(frag.fragmentText, minted.draft);
    expect(collected.ok).toBe(true);
    if (!collected.ok) return;
    const submitted = await submitCeremonyRecord(
      {
        ...minted.draft,
        signatures: [...minted.draft.signatures, collected.entry],
      },
      2,
    );
    expect(submitted).toEqual({ ok: true });
    expect(
      await db.outbox.filter((r) => r.kind === "member_reinstatement").count(),
    ).toBe(1);
  });
});
