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

// The in-app twin of docs/bootstrap-from-a-node.md — the walkthrough
// for starting a NEW community using only an existing node, served by
// the app itself so a member with no GitHub account (and no idea what
// GitHub is) can follow the whole loop. Long-form prose lives here
// rather than in the i18n JSON, same discipline as content/faq.ts;
// startCommunity.es.ts mirrors it and startCommunity.parity.test.ts
// keeps the two aligned — INCLUDING byte-identical code blocks, since
// terminal commands never translate.
//
// Keep this and docs/bootstrap-from-a-node.md telling the same story:
// the doc is the repo/tarball copy, this is the member-facing one.

export interface GuideStep {
  /** Stable anchor id, shared across languages. */
  id: string;
  title: string;
  paragraphs: string[];
  /** Verbatim terminal blocks (one string per block). MUST be
   *  identical across locales — the parity test enforces it. */
  code?: string[];
}

export interface StartCommunityGuide {
  intro: string[];
  steps: GuideStep[];
  closing: string[];
}

export const START_COMMUNITY: StartCommunityGuide = {
  intro: [
    "Your community runs Understoria. You can start one for your " +
      "neighborhood, your workplace, your family across town — using " +
      "only your community's own server. No GitHub account, no app " +
      "store, no Docker required, no permission from anyone.",
    "This works because Understoria is free software (AGPL licensed) " +
      "and every server offers its own source code — the exact code " +
      "it is running. That isn't a courtesy; the license requires it, " +
      "and the app builds it in so no single company, host, or " +
      "repository can ever be the only place the software lives. " +
      "Every community is a seed.",
    "Who this is for: someone comfortable following terminal " +
      "instructions carefully, but who has never deployed a server. " +
      "If the words 'terminal' and 'command' are new to you, do this " +
      "next to a member who's done it — that's how this knowledge is " +
      "supposed to travel anyway.",
  ],
  steps: [
    {
      id: "what-you-need",
      title: "1. What you need",
      paragraphs: [
        "A computer with a terminal (the commands below are for Linux " +
          "or a Mac; a Raspberry Pi works). About 15 minutes to try " +
          "the app on your own machine. Deploying a real server for " +
          "members is a longer afternoon and needs a domain name and " +
          "a small server — the guides that come inside the download " +
          "cover all of that.",
      ],
    },
    {
      id: "get-the-software",
      title: "2. Get the software",
      paragraphs: [
        "The easy way: on this very page's community — or any " +
          "Understoria community you can reach — open the Menu (top " +
          "right) → Community infrastructure → the card called 'The " +
          "software itself'. Download BOTH files: the source archive " +
          "and the checksums. Put them in the same folder.",
        "The terminal way (replace the address with your community's):",
        "Some servers also offer a 'full history bundle'. It's " +
          "bigger, and if you have git installed it's the better " +
          "download: you get the entire development history and " +
          "normal update pulls later. If you take the bundle, unpack " +
          "it with git instead of tar:",
      ],
      code: [
        "mkdir understoria-download && cd understoria-download\n" +
          "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\n" +
          "curl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\n" +
          "git clone understoria.bundle understoria",
      ],
    },
    {
      id: "verify",
      title: "3. Verify what you downloaded",
      paragraphs: [
        "A checksum is a fingerprint computed from the file's exact " +
          "bytes. If even one byte changed on the way to you — a " +
          "flaky connection, a cut-off download — the fingerprint " +
          "changes completely. Check it before building anything. " +
          "You want to see 'OK'. Anything else: delete and " +
          "re-download.",
        "Be honest with yourself about what this proves: the " +
          "checksum came from the same server as the file, so it " +
          "proves the download arrived intact — it cannot prove " +
          "nobody changed the code on that server. You already " +
          "extend your operator that trust every day (they serve you " +
          "this running app). For independent confirmation, fetch a " +
          "second community's checksums for the same version and " +
          "compare — two operators would have to collude to fool " +
          "that.",
        "Then unpack. The archive extracts into the current folder, " +
          "so make one first:",
      ],
      code: [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria",
      ],
    },
    {
      id: "try-it",
      title: "4. Try it before you commit to anything",
      paragraphs: [
        "You can run the whole app on your own machine and walk a " +
          "real exchange end to end. The folder you just unpacked " +
          "contains every guide the project has, in its docs folder — " +
          "open docs/quickstart.md in any text editor and follow it " +
          "from its first step. Where it says to clone the " +
          "repository, skip that: you're already sitting in the " +
          "source folder.",
        "This is worth doing even if you're sure. You'll onboard " +
          "yourself, post a need, and confirm an exchange — so when " +
          "your first real member gets stuck, you'll have seen their " +
          "screen before.",
      ],
    },
    {
      id: "deploy",
      title: "5. Deploy it for your community",
      paragraphs: [
        "The full server guides are in the same docs folder, written " +
          "for exactly this moment. Pick by how you want to run it: " +
          "docs/deploy-linode.md (Docker on a small five-dollar-class " +
          "server — the most-traveled path, mostly automated by a " +
          "setup script) or docs/deploy-alternatives.md (Podman, or " +
          "plain Linux with no containers at all — the right shape " +
          "for donated hardware).",
        "One translation to make as you read them, since both open " +
          "by cloning from the public repository: where a guide says " +
          "to clone into a folder on the server, instead copy your " +
          "verified archive there and extract it. Everything else — " +
          "the system key, the settings file, founder keys, backups, " +
          "the 'before going public' checklist — applies unchanged.",
        "Updating later, without git: download the newer archive " +
          "from any server running the newer version, verify it the " +
          "same way, extract it into a fresh folder, carry your " +
          "settings file over, and redeploy. Your community's data " +
          "is safe through this — it never lives in the source " +
          "folder.",
      ],
      code: [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\n" +
          "ssh root@YOUR-SERVER\n" +
          "cd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n" +
          "  && tar -xzf understoria-source.tar.gz -C understoria\n" +
          "cd understoria",
      ],
    },
    {
      id: "seed",
      title: "6. You're now a seed too",
      paragraphs: [
        "The moment your server is up, it offers ITS own source the " +
          "same way — automatically, from the same build. Your " +
          "members can verify what they're running, and the next " +
          "neighborhood can bootstrap from you the way you just did " +
          "from your community. No single point — not GitHub, not " +
          "the project's authors, not any one operator — can take " +
          "the software away from everyone at once.",
        "Two habits keep the chain strong: redeploy occasionally " +
          "(your server offers the source of what it runs, so " +
          "running something recent means seeding something recent), " +
          "and know a second community's server — the " +
          "compare-two-servers check above only works if communities " +
          "can name each other.",
      ],
    },
  ],
  closing: [
    "Questions this page doesn't answer live in the download's docs " +
      "folder — docs/bootstrap-from-a-node.md is this same " +
      "walkthrough with more detail, and docs/operator-guide.md is " +
      "the day-to-day manual for whoever keeps the server up.",
  ],
};
