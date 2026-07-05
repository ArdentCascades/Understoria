/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/**
 * Client half of the §5 awaiting-transition artifact
 * (docs/auto-confirm-key.md §5): the transition into
 * `awaiting_confirmation` enqueues a SIGNED artifact for the node,
 * whose received_at stamp is what makes the /auto-confirm window
 * enforceable. Server-side enforcement is covered in
 * apps/server/src/routes/autoConfirm.test.ts; this suite covers that
 * the artifact is produced at the right moments, signed by a real
 * party, and produced exactly once.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { verifyAwaitingTransition } from "@understoria/shared/crypto";
import type { AwaitingTransition } from "@understoria/shared/types";
import { db, SETTING_KEYS, setSetting } from "./database";
import { claimPost, confirmExchange, createPost } from "./actions";
import {
  claimProjectTask,
  createProject,
  addProjectTask,
  launchProject,
  markProjectTaskComplete,
} from "./projects";
import { persistSecretKey } from "./secrets";
import { generateKeyPair } from "@/lib/crypto";

const NODE = "node_transition_test";

async function reset() {
  await Promise.all(db.tables.map((t) => t.clear()));
  await setSetting(SETTING_KEYS.nodeId, NODE);
  // enqueueOutbox no-ops unless a community node is configured.
  await setSetting(SETTING_KEYS.communityNodeUrl, "http://node.test");
  await setSetting(SETTING_KEYS.communityNodeEnabled, "1");
}

async function newMember(name: string): Promise<string> {
  const kp = generateKeyPair();
  await persistSecretKey(kp.publicKey, kp.secretKey);
  await db.members.put({
    publicKey: kp.publicKey,
    displayName: name,
    skills: [],
    availability: "",
    availabilityChips: [],
    seedBalance: 5,
    vouchedBy: [],
    createdAt: Date.now(),
    nodeId: NODE,
    locationZone: "zone",
  });
  return kp.publicKey;
}

async function artifactRows(): Promise<AwaitingTransition[]> {
  const rows = await db.outbox
    .where("kind")
    .equals("awaiting_transition")
    .toArray();
  return rows.map((r) => JSON.parse(r.payload) as AwaitingTransition);
}

describe("confirmExchange — §5 artifact on the first confirmation", () => {
  beforeEach(reset);

  it("enqueues a verifiable artifact naming the true helper/helped sides", async () => {
    const poster = await newMember("Poster");
    const claimer = await newMember("Claimer");
    const post = await createPost(
      poster,
      "zone",
      {
        type: "NEED",
        category: "transport",
        title: "Ride to clinic",
        description: "",
        estimatedHours: 1,
        urgency: "medium",
        expiresAt: null,
      },
      NODE,
    );
    await claimPost(post.id, claimer);
    await confirmExchange(post.id, claimer, NODE);

    const artifacts = await artifactRows();
    expect(artifacts).toHaveLength(1);
    const a = artifacts[0];
    expect(a.postId).toBe(post.id);
    // NEED: the claimer helps the poster.
    expect(a.helperKey).toBe(claimer);
    expect(a.helpedKey).toBe(poster);
    expect(a.signedBy).toBe(claimer);
    expect(verifyAwaitingTransition(a)).toBe(true);
  });

  it("does not enqueue a second artifact when the same party re-confirms", async () => {
    const poster = await newMember("Poster");
    const claimer = await newMember("Claimer");
    const post = await createPost(
      poster,
      "zone",
      {
        type: "NEED",
        category: "transport",
        title: "Ride",
        description: "",
        estimatedHours: 1,
        urgency: "medium",
        expiresAt: null,
      },
      NODE,
    );
    await claimPost(post.id, claimer);
    await confirmExchange(post.id, claimer, NODE);
    await confirmExchange(post.id, claimer, NODE);
    expect(await artifactRows()).toHaveLength(1);
  });
});

describe("markProjectTaskComplete — §5 artifact for the project-task path", () => {
  beforeEach(reset);

  it("enqueues a verifiable artifact under the project-task label", async () => {
    const organizer = await newMember("Organizer");
    const helper = await newMember("Helper");
    const project = await createProject(
      organizer,
      {
        title: "Fridge",
        description: "",
        category: "infrastructure",
        targetHours: 10,
        deadline: null,
        locationZone: "zone",
        tags: [],
        templateId: null,
      },
      NODE,
    );
    await launchProject(project.id, organizer);
    const task = await addProjectTask(project.id, organizer, {
      title: "Build shelf",
      description: "",
      category: "infrastructure",
      estimatedHours: 2,
      urgency: "medium",
      requiredSkills: [],
      dependencies: [],
    });
    await claimProjectTask(task.id, helper);
    await markProjectTaskComplete(task.id, helper, 2);

    const artifacts = await artifactRows();
    expect(artifacts).toHaveLength(1);
    const a = artifacts[0];
    expect(a.postId).toBe(`project:${project.id}/task:${task.id}`);
    expect(a.helperKey).toBe(helper);
    expect(a.helpedKey).toBe(organizer);
    expect(a.signedBy).toBe(helper);
    expect(verifyAwaitingTransition(a)).toBe(true);
  });
});
