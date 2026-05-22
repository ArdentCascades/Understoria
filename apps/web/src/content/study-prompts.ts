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

// Study-group prompts mirrored from docs/political-education/README.md.
// Kept here (rather than in i18n locales) because long-form prose
// translation is a separate workstream from UI string translation —
// see docs/roadmap.md "i18n debt compounding" in the failure-modes
// section. English-only for now; a structured translation pass is
// tracked as Agent 9 maintenance work.

export interface StudyPrompt {
  id: string;
  theme: "platform" | "mutual_aid" | "organizing" | "power" | "traditions";
  body: string;
}

export const STUDY_PROMPTS: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "What did timebanks and mutual aid networks do before there was " +
      "software for it? What did they lose when software arrived, and " +
      "what did they gain? Where should Understoria sit in that tradeoff?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Understoria's design principle is one-hour-equals-one-hour. What " +
      "work is that principle protecting? What critiques does it invite? " +
      "Are there cases in your community where it gets in the way?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "If we removed the app tomorrow, what would we still have? That " +
      "answer is the actual foundation; the app is scaffolding.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade distinguishes mutual aid from charity by who gets to " +
      "decide. Who makes decisions in your community right now? Who doesn't?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "Mutual aid projects often get absorbed by NGOs or turned into " +
      "service-provision programs. What protects your community from that pull?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "Who in your community isn't asking for help even though they need it? Why?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey distinguishes mobilizing (getting existing supporters to " +
      "show up) from organizing (winning over people who aren't yet " +
      "supporters). Is your mutual aid network a mobilizing project, an " +
      "organizing one, or both?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "Mutual aid work and union work have historically fed each other. " +
      "Where are the connections in your context? What's possible that " +
      "isn't being tried?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman argues that pretending to be structureless doesn't make you " +
      "structureless; it just makes the structure informal and harder to " +
      "challenge. What informal structures exist in your community? Are " +
      "they working?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "If Understoria's software decisions were being made by a corporation " +
      "rather than a cooperative, what would be different about its " +
      "features? Write down three.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss and Hyde frame the gift as carrying an obligation — to " +
      "receive, to give in turn — that the market specifically erases. " +
      "Where in your community is the gift logic still intact, and where " +
      "has it been replaced with transactional framing? Does it matter?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "The Haudenosaunee principle of evaluating decisions across multiple " +
      "generations is structurally hard for a project optimized around " +
      "weekly metrics. Pick a recent decision your community made. How " +
      "would it look reconsidered with a five- or seven-generation horizon?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "The Zapatistas' mandar obedeciendo — to lead by obeying — is not a " +
      "metaphor; it's a structural commitment with consequences for who " +
      "holds coordinating roles and for how long. Who in your community " +
      "holds informal coordinating authority? What would it cost to " +
      "formalize it under mandar obedeciendo?",
  },
] as const;

export function promptShareText(prompt: StudyPrompt): string {
  return `${prompt.body}\n\n— Discussion prompt from Understoria, mirrored from docs/political-education/README.md`;
}
