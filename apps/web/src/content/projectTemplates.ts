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

// Project templates — friendly starting points for the "Start a
// project" flow. Picking a template pre-fills the project form and
// stages all the template's tasks so they're created together with
// the project.
//
// Templates are NOT prescriptions. The whole point is that a member
// reads one, recognizes the shape of something their community needs,
// and then edits everything before launching. Nothing here is fixed.
//
// Recurring tasks (e.g. "~2h per month") are modeled as one-off
// tasks with a localized cadence sentence appended to the task
// description. There's deliberately no new schema field — keeping
// ProjectTask flat protects federation and the rest of the project
// lifecycle from churn for a content-only feature.

import type { ProjectCategory } from "@/types";

export type RecurringCadence = "session" | "month" | "event" | "cycle";

export interface TemplateTask {
  name: string;
  description: string;
  hours: number;
  recurringCadence?: RecurringCadence;
  /** Suggested skills for the task, localized per template locale.
   *  Staged into `ProjectTask.requiredSkills`, which feeds the task
   *  UI's skills rendering (and the proposed ways-to-plug-in
   *  matching). Plain everyday words — "carpentry", "driving" — the
   *  same register members use in their own profile skills. */
  skills?: readonly string[];
  /** Indexes of EARLIER tasks in this template that should complete
   *  first — the soft-block "Follows:" framing from
   *  docs/task-ordering-and-dependencies.md, never a hard gate.
   *  Remapped to real task ids at creation (and past any tasks the
   *  member excluded in the staging step). Must reference strictly
   *  earlier indexes; the drift between locales is prevented by
   *  authoring both locales from one table (see the content pass). */
  follows?: readonly number[];
}

export interface ProjectTemplate {
  /** Stable kebab-case slug; identical across locales so a selection
   *  survives a language switch. */
  id: string;
  name: string;
  purpose: string;
  whoItServes: string;
  whatYoullNeed: string;
  setupHours: number;
  defaultCategory: ProjectCategory;
  tasks: readonly TemplateTask[];
  /** True for templates whose recurring crew work (rotas, sessions,
   *  service days) is the shape the work-day + shifts machinery
   *  coordinates. Feeds ONE quiet, dismissible, organizer-only line
   *  on a freshly created project — never a rail item or badge
   *  (no-notifications). */
  suggestsWorkDays?: boolean;
  /** Narrative bridge from "picked a template" to "know what to do
   *  this week" — who to talk to before any task starts. Locale
   *  prose; rendered in the selected-template context block. */
  firstSteps?: string;
  /** Honest, specific failure modes — how this project actually
   *  dies or hurts someone. Locale prose. */
  commonPitfalls?: string;
  /** Ids of complementary templates. Locale-INVARIANT (identical in
   *  both arrays); every id must exist and never self-reference —
   *  CI-pinned in projectTemplates.test.ts. */
  pairsWith?: readonly string[];
  /** FAQ entry ids (content/faq.ts) rendered as /help#<id> links,
   *  labeled by the FAQ question in the viewer's language.
   *  Locale-INVARIANT; membership CI-pinned against FAQ_SECTIONS. */
  learnMore?: readonly string[];
}

export const PROJECT_TEMPLATES_EN: readonly ProjectTemplate[] = [
  {
    id: "community-fridge",
    name: "Community Fridge & Free Pantry",
    purpose:
      "Provide free, 24/7 access to food and essentials with no questions asked.",
    whoItServes:
      "Anyone who needs food; especially helpful for people working irregular hours, undocumented neighbors, and those who can't reach a food bank during business hours.",
    whatYoullNeed:
      "A donated fridge, a sheltered outdoor spot with an outlet, a host site, and a small cleaning rota.",
    setupHours: 18,
    defaultCategory: "food",
    firstSteps:
      "Start with the host, not the fridge. Sit down with the " +
      "shop owner, church, or clinic you have in mind and talk " +
      "through the unglamorous parts — the power bill, what " +
      "happens when someone leaves a mess, who they call when it " +
      "breaks — before you source a single appliance. While " +
      "you're at it, ask the food pantries and mutual aid groups " +
      "already working nearby what gaps they see, so the fridge " +
      "fills one instead of duplicating them.",
    commonPitfalls:
      "Community fridges almost never die from a lack of " +
      "donations — they die when nobody clearly owns the " +
      "cleaning, the fridge gets grim, and the host quietly asks " +
      "for it to go. Put names on the rota before opening day, " +
      "and treat the host relationship as the thing you're " +
      "maintaining, not just the appliance.",
    pairsWith: ["gleaning-network", "food-preservation", "community-meal"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Find a host site with power and foot traffic",
        description:
          "Approach small businesses, churches, clinics, or community centers. Ask if they'll let you place a fridge under their awning and plug it in (electricity cost is usually a few dollars a month — offer to cover it). Get a simple written okay.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Source a fridge and a weatherproof shelter",
        description:
          "Put out a call for a working fridge on local groups. Build or buy a simple wooden cabinet/lean-to around it to protect it from rain and sun. Anchor it so it can't tip. Includes locating, transporting, and building.",
        hours: 8,
        skills: ["carpentry", "driving"],
        follows: [0],
      },
      {
        name: "Set the ground rules and label everything",
        description:
          "Post a clear, multilingual sign: take what you need, leave what you can, no expired/home-canned/raw meat. Add labels and a marker so people can date items.",
        hours: 1.5,
        skills: ["writing", "translation"],
        follows: [1],
      },
      {
        name: "Recruit a cleaning and restocking rota",
        description:
          "Make a shared weekly schedule. Each shift is ~15 minutes: wipe surfaces, toss anything spoiled or past-date, and note what's running low. Keep cleaning supplies on site.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organizing"],
        follows: [1],
      },
      {
        name: "Build supply relationships",
        description:
          "Ask bakeries, grocers, restaurants, and farmers' markets for regular end-of-day donations. Coordinate a pickup volunteer. Track which sources are reliable.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Set up a problem contact",
        description:
          "Put one phone number or email on the fridge for \"fridge is broken / power is out / question.\" Decide who answers it and how fast.",
        hours: 0.5,
      },
    ],
  },
  {
    id: "community-garden",
    name: "Community Garden / Shared Growing Plot",
    purpose:
      "Grow free fresh produce together and create a gathering space.",
    whoItServes:
      "Neighbors without yard space, people facing food costs, and anyone wanting connection and a reason to be outside.",
    whatYoullNeed:
      "A plot of land (even a vacant lot or rooftop), soil/beds, water access, seeds, and a core group of 5–10 regulars.",
    setupHours: 25,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Before you touch the soil, talk to two groups of people: " +
      "whoever owns the land, and the neighbors who live right " +
      "next to it — their blessing matters as much as the lease. " +
      "Then gather your likely regulars and have the " +
      "sharing-model conversation early; knowing whether this is " +
      "individual plots or a communal harvest changes everything " +
      "you build.",
    commonPitfalls:
      "Gardens don't usually die in spring — they die in the " +
      "hottest weeks, when the watering rota quietly collapses " +
      "and the beds go brown. The other slow killer is one person " +
      "treating it as their garden with helpers; write down how " +
      "decisions get made while everyone still likes each other.",
    pairsWith: ["seed-library", "community-composting", "food-preservation"],
    tasks: [
      {
        name: "Secure land and permission",
        description:
          "Identify a vacant lot, church yard, school ground, or unused park corner. Find the owner (city land records, or just ask). Get a written license or lease, even a one-year handshake-in-writing, and confirm water access.",
        hours: 6,
        skills: ["outreach"],
      },
      {
        name: "Test the soil and plan beds",
        description:
          "Send a cheap soil test to a local extension service to rule out lead/contaminants. If soil is bad, plan raised beds with clean soil. Sketch where beds, paths, and a tool spot will go.",
        hours: 2,
        skills: ["gardening"],
        follows: [0],
      },
      {
        name: "Gather materials and build",
        description:
          "Collect lumber or use straw-bale/keyhole beds, compost, and mulch. Host a build day; many hands raise beds quickly. Set up a hose or rain barrels.",
        hours: 10,
        skills: ["carpentry"],
        follows: [0, 1],
      },
      {
        name: "Decide the sharing model",
        description:
          "Agree as a group: individual plots, fully communal harvest, or a hybrid. Write down how produce is divided and how decisions get made.",
        hours: 1,
        skills: ["facilitation"],
      },
      {
        name: "Plant for your climate and season",
        description:
          "Pick easy, high-yield crops for your zone (greens, beans, squash, tomatoes, herbs). Stagger planting so harvests don't all hit at once. Label rows.",
        hours: 4,
        recurringCadence: "cycle",
        skills: ["gardening"],
        follows: [2],
      },
      {
        name: "Set a watering and weeding rota",
        description:
          "Plants die from neglect more than anything. Build a simple shared calendar; tie tasks to easy reminders. Keep it low-commitment so people don't burn out.",
        hours: 1,
        skills: ["organizing"],
        follows: [4],
      },
      {
        name: "Plan the harvest and surplus",
        description:
          "Decide harvest days. Route extra produce to the community fridge, neighbors, or a free stand at the gate. Save some seeds for next year.",
        hours: 1,
        recurringCadence: "cycle",
        follows: [4],
      },
    ],
  },
  {
    id: "tool-lending-library",
    name: "Tool & Equipment Lending Library",
    purpose:
      "Let neighbors borrow tools and gear instead of buying them, saving money and reducing waste.",
    whoItServes:
      "Renters, new homeowners, hobbyists, and anyone doing occasional repairs or projects.",
    whatYoullNeed:
      "Storage space, donated tools, a simple check-out system, and a couple of \"librarians.\"",
    setupHours: 20,
    defaultCategory: "infrastructure",
    firstSteps:
      "Before collecting a single drill, talk to the person " +
      "offering the space about what living with a tool library " +
      "actually means — noise, storage creep, strangers at the " +
      "door during open hours. Then ask neighbors what they'd " +
      "actually borrow; a list of ten requested tools beats a " +
      "garage of donated ones nobody wants.",
    commonPitfalls:
      "Tool libraries die from silence after the due date: nobody " +
      "follows up, tools drift into permanent loans, and the " +
      "shelves empty out. A friendly reminder routine matters " +
      "more than a strict late policy — and be ready to say no to " +
      "donations, or you'll become the neighborhood's dump for " +
      "broken gear.",
    pairsWith: ["library-of-things", "repair-cafe", "weatherization-brigade"],
    learnMore: ["confirm-exchange"],
    tasks: [
      {
        name: "Find storage and open hours",
        description:
          "A shed, garage, closet at a community center, or shipping container works. Pick 2–4 predictable open hours a week so people know when to come.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Collect and sort the inventory",
        description:
          "Put out a donation call (people have duplicate drills and ladders everywhere). Clean, test, and label each tool. Discard or repair anything unsafe.",
        hours: 6,
        skills: ["driving"],
        follows: [0],
      },
      {
        name: "Catalog everything",
        description:
          "Use a free spreadsheet or lending-library app. Record each item, its condition, and a photo. Number tools so they're easy to track.",
        hours: 4,
        skills: ["data entry"],
        follows: [1],
      },
      {
        name: "Write borrowing rules",
        description:
          "Set loan length (e.g., one week), how many items at once, and a return/late policy. Keep it forgiving — this is about trust. Note any tool that needs a safety briefing.",
        hours: 1,
        skills: ["writing"],
      },
      {
        name: "Set up sign-out",
        description:
          "A clipboard or simple form: name, contact, item, date out, due date. Take a quick photo of the tool's condition at checkout to avoid disputes.",
        hours: 2,
        skills: ["data entry"],
        follows: [2, 3],
      },
      {
        name: "Train your librarians",
        description:
          "Walk volunteers through the catalog, checkout steps, and basic safety (eye protection, ladder use). Have a one-page cheat sheet at the desk.",
        hours: 2,
        skills: ["teaching"],
        follows: [4],
      },
      {
        name: "Maintain and grow",
        description:
          "Inspect returned tools, sharpen and oil regularly, and track what people request most so you know what to add next.",
        hours: 2,
        skills: ["tool repair"],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "neighborhood-care-network",
    name: "Neighborhood Care Network",
    purpose:
      "Make sure isolated neighbors are checked on, connected, and supported.",
    whoItServes:
      "Elderly people, disabled and chronically ill neighbors, new parents, and anyone living alone.",
    whatYoullNeed:
      "A list of volunteers, a way to match them to neighbors, and a check-in routine. Volunteers are neighbors, not care professionals — screen anyone making home visits, never let a volunteer handle a neighbor's money alone, and agree in advance on when to call family or emergency services.",
    setupHours: 18,
    defaultCategory: "emotional_support",
    firstSteps:
      "Start by listening, not recruiting: talk with the " +
      "neighbors you hope to support about what they actually " +
      "want — a weekly call, a ride, company — because a network " +
      "built on assumptions feels like surveillance. At the same " +
      "time, have the honest conversation with early volunteers " +
      "about screening and boundaries, so the rules in place feel " +
      "like care, not suspicion, when the first match happens.",
    commonPitfalls:
      "Care networks rarely fail from too few volunteers — they " +
      "burn out the three people who always say yes while " +
      "everyone else waits to be asked. Spread the matches " +
      "deliberately, hold the volunteer debriefs even when things " +
      "seem fine, and don't let check-ins turn into treating a " +
      "neighbor as a case instead of a person.",
    pairsWith: ["rides-transportation", "disability-support-network", "welcome-wagon"],
    learnMore: ["message-someone"],
    tasks: [
      {
        name: "Map who's around",
        description:
          "Quietly identify neighbors who might be isolated through word of mouth, building managers, clinics, and faith groups. Never assume need — invite people in, don't single them out.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Recruit and screen volunteers",
        description:
          "Ask for people who can commit to regular contact. For any in-home visits or help with vulnerable adults, do basic reference checks and never have a volunteer handle a neighbor's money alone.",
        hours: 5,
        skills: ["outreach", "interviewing"],
      },
      {
        name: "Match thoughtfully",
        description:
          "Pair on language, proximity, and comfort. Ask both people what they want — a weekly call, a grocery run, a chat on the porch — and respect that boundary.",
        hours: 2,
        skills: ["organizing"],
        follows: [0, 1],
      },
      {
        name: "Set a check-in rhythm",
        description:
          "Agree on frequency and method (call, text, knock). Give volunteers a short script for the first contact so it feels warm, not clinical.",
        hours: 1,
        follows: [2],
      },
      {
        name: "Create an escalation plan",
        description:
          "Decide in advance what to do if someone doesn't answer or seems in crisis: who to call, when to involve family or emergency services, and how to log it. Keep it written and simple.",
        hours: 2,
        skills: ["writing"],
      },
      {
        name: "Coordinate practical help",
        description:
          "Track recurring needs — rides to appointments, prescription pickups, snow shoveling — and connect them to other volunteers or projects in your program.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organizing"],
      },
      {
        name: "Support the volunteers too",
        description:
          "Hold a check-in for them to debrief. Caring work is draining; rotate tasks and watch for burnout.",
        hours: 2,
        skills: ["facilitation"],
        recurringCadence: "month",
      },
    ],
  },
  {
    id: "emergency-preparedness",
    name: "Emergency & Disaster Preparedness Network",
    purpose:
      "Help the neighborhood prepare for and respond to disasters (heat waves, storms, floods, power outages) when official help is slow.",
    whoItServes:
      "Everyone, with priority to people who can't easily evacuate or who depend on power for medical equipment.",
    whatYoullNeed:
      "A contact list, a meeting spot, basic supplies, and a communication plan that works without internet. This network complements official emergency services — it doesn't replace them. In a life-threatening situation, always call emergency services first.",
    setupHours: 30,
    defaultCategory: "organizing",
    firstSteps:
      "Build the plan around the people it's for: knock on the " +
      "doors of neighbors on oxygen, refrigerated meds, or upper " +
      "floors without elevators, and ask what a bad week looks " +
      "like for them. Then talk to whoever controls your likely " +
      "safe spot and to any existing emergency group (CERT, the " +
      "fire department's outreach) so your network fills the gaps " +
      "around official response instead of duplicating it.",
    commonPitfalls:
      "These networks don't fail during the disaster — they fail " +
      "in the quiet years before it, when the contact tree goes " +
      "stale, phone numbers change, and the plan lives on one " +
      "person's laptop. Print everything, refresh the list on a " +
      "calendar rhythm, and drill at least once; the first real " +
      "use should never be the first use.",
    pairsWith: ["cooling-warming-center", "community-first-aid-training", "community-wifi-mesh"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Map your neighborhood's risks",
        description:
          "List the disasters most likely where you are. Note vulnerable points: people on the upper floors with no elevator, those on oxygen or refrigerated meds, single-exit buildings.",
        hours: 4,
      },
      {
        name: "Build a contact tree",
        description:
          "Collect opt-in contact info block by block. Designate a few \"block captains\" who each check on ~10 households. Keep a paper copy — phones and internet fail in disasters.",
        hours: 8,
        skills: ["outreach", "data entry"],
      },
      {
        name: "Plan offline communication",
        description:
          "Decide how you'll reach each other without cell service: door knocks, a meeting spot, whistles, or radios. Print and distribute the plan.",
        hours: 3,
        skills: ["writing"],
        follows: [1],
      },
      {
        name: "Stock shared supplies",
        description:
          "Assemble a community kit: water, first aid, flashlights, batteries, a battery/crank radio, blankets, and basic tools. Store it where a few people can access it.",
        hours: 5,
        skills: ["driving"],
      },
      {
        name: "Identify safe spots",
        description:
          "Find places that could serve as a cooling/warming center or charging point (a hall with a generator, a shaded park). Confirm access ahead of time.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Run a drill or info night",
        description:
          "Host a session on personal go-bags, shutting off utilities, and the contact tree. Practice once so people aren't learning during the actual emergency.",
        hours: 5,
        skills: ["teaching", "facilitation"],
        follows: [1, 2],
      },
      {
        name: "Define roles for \"day of\"",
        description:
          "Pre-assign who checks on the medically vulnerable first, who opens the safe spot, and who coordinates. Review and update the plan twice a year.",
        hours: 2,
        skills: ["organizing"],
        follows: [4],
      },
    ],
  },
  {
    id: "free-store",
    name: "Free Store / Goods Swap",
    purpose:
      "Redistribute clothing, household goods, and supplies for free.",
    whoItServes:
      "Anyone — people in tight spots, people decluttering, and the environment.",
    whatYoullNeed:
      "A space (even pop-up), tables or racks, sorting volunteers, and a regular schedule.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Talk first with the space host about the honest realities " +
      "— donation piles, foot traffic, what the room looks like " +
      "the morning after — and then with a nearby thrift store or " +
      "charity about what already floods in, so you know what " +
      "your neighborhood actually lacks. If you can, spend an " +
      "hour at an existing free store before your first event; " +
      "the flow of intake and display is easier to copy than to " +
      "invent.",
    commonPitfalls:
      "Free stores drown before they starve: without a firm " +
      "yes/no list at the door, volunteers spend every hour " +
      "sorting broken and soiled donations instead of welcoming " +
      "people. And decide where leftovers go before the first " +
      "event ends — a pile of unclaimed goods with no exit plan " +
      "is how host spaces get lost.",
    pairsWith: ["repair-cafe", "library-of-things", "mutual-aid-moving-crew"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Pick a format and space",
        description:
          "Decide between a standing free store, a recurring pop-up, or a one-day swap. Borrow a hall, storefront, or park pavilion. A recurring date builds habit.",
        hours: 2,
      },
      {
        name: "Set donation standards",
        description:
          "Accept clean, working, usable items only. Post a clear \"yes\" and \"no\" list (no broken electronics, no soiled clothing, no recalled baby gear). This saves enormous sorting time.",
        hours: 0.5,
        skills: ["writing"],
      },
      {
        name: "Organize intake and sorting",
        description:
          "Set up stations: receive, sort by category, and stage for display. Have a plan for items you can't use (donate onward or recycle).",
        hours: 2,
        skills: ["organizing"],
        follows: [0, 1],
      },
      {
        name: "Display so people can browse with dignity",
        description:
          "Hang clothes by size, group household goods, keep it tidy and welcoming. No application, no proof of need — just take what you'll use.",
        hours: 1.5,
        skills: ["design"],
        follows: [2],
      },
      {
        name: "Staff the event",
        description:
          "Assign greeters, sorters, and someone for questions. A friendly, no-judgment tone is the whole point.",
        hours: 3,
        skills: ["organizing"],
        recurringCadence: "event",
      },
      {
        name: "Handle the leftovers",
        description:
          "Pre-arrange where unclaimed items go after each event (a partner charity, textile recycling) so the space resets clean.",
        hours: 1,
        skills: ["driving"],
      },
    ],
  },
  {
    id: "skill-share",
    name: "Skill Share & Free Classes",
    purpose:
      "Let neighbors teach and learn from each other for free — cooking, repairs, language, budgeting, first aid, digital skills.",
    whoItServes:
      "Everyone; especially people who can't afford paid classes and those whose knowledge is rarely valued.",
    whatYoullNeed:
      "A space, people willing to teach, and a way to publish a schedule.",
    setupHours: 9,
    defaultCategory: "education",
    firstSteps:
      "The project starts with the two-question conversations, " +
      "not the venue: ask people what they could teach and what " +
      "they'd love to learn, and pay special attention to " +
      "neighbors whose knowledge is rarely treated as expertise. " +
      "Your first real task is reassuring one nervous would-be " +
      "teacher over coffee that their session doesn't need to be " +
      "a lecture.",
    commonPitfalls:
      "Skill shares fade when the same two confident people end " +
      "up teaching everything and the schedule quietly bends to " +
      "the organizers' free evenings instead of the attendees'. " +
      "Keep recruiting first-time teachers, ask who's missing " +
      "from the room, and treat a five-person session as a " +
      "success, because it is.",
    pairsWith: ["time-bank", "digital-literacy", "repair-cafe"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Survey skills and interests",
        description:
          "Ask members two questions: what could you teach, and what would you love to learn? Collect answers in a simple form. The overlap is your curriculum.",
        hours: 1.5,
        skills: ["outreach"],
      },
      {
        name: "Recruit and prep teachers",
        description:
          "Reassure people that \"teaching\" can be informal. Help them outline a one-hour session and gather any materials. Pair nervous first-timers with a co-host.",
        hours: 3,
        skills: ["teaching", "facilitation"],
        follows: [0],
      },
      {
        name: "Find space and time",
        description:
          "Use a library room, community center, park, or someone's living room. Pick recurring slots so it becomes routine.",
        hours: 1.5,
      },
      {
        name: "Build a schedule",
        description:
          "List sessions with date, topic, teacher, and what to bring. Publish it where members already look. Keep sign-ups light or drop-in.",
        hours: 1.5,
        recurringCadence: "month",
        skills: ["organizing"],
        follows: [1, 2],
      },
      {
        name: "Make it accessible",
        description:
          "Consider language needs, childcare, physical access, and timing for people who work. Ask attendees what would help them come.",
        hours: 1.5,
        skills: ["accessibility", "translation"],
      },
    ],
  },
  {
    id: "bulk-buying-coop",
    name: "Bulk-Buying Food Co-op",
    purpose:
      "Pool orders to buy food and staples in bulk at lower prices.",
    whoItServes:
      "Households squeezed by grocery prices, large families, and food-desert neighborhoods.",
    whatYoullNeed:
      "A group of committed households, a wholesale source, a pickup/sort space, and someone to manage orders.",
    setupHours: 20,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Gather your households before you call any supplier, and " +
      "have the awkward money conversation first: what people can " +
      "commit to, how payment happens before orders go in, and " +
      "what a missed cycle means. A call with an existing buying " +
      "club — most are happy to share their spreadsheet and their " +
      "scars — will save you a season of trial and error.",
    commonPitfalls:
      "Buying co-ops die from money friction and coordinator " +
      "fatigue: someone fronts cash and resents it, an order goes " +
      "unpaid, or one person quietly runs every cycle until they " +
      "quit and the whole thing stops. Collect payment before " +
      "ordering without exception, and rotate the coordinator " +
      "role from cycle two, not someday.",
    pairsWith: ["community-market", "food-preservation"],
    tasks: [
      {
        name: "Gather your buying group",
        description:
          "Recruit enough households to hit supplier minimums (often 8–15). Agree on a buying cycle (weekly, biweekly, monthly).",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Find a supplier",
        description:
          "Contact food wholesalers, farm co-ops, restaurant suppliers, or buying clubs. Compare minimum orders, delivery options, and prices. Confirm what staples they carry.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Set up ordering",
        description:
          "Use a shared spreadsheet or form where members enter quantities by the cutoff. Designate one coordinator to total and place the order.",
        hours: 3,
        skills: ["data entry", "organizing"],
        follows: [1],
      },
      {
        name: "Handle money transparently",
        description:
          "Decide payment up front (collect before ordering to avoid fronting cash). Track every dollar in a shared ledger. Add a tiny optional buffer for spillage, not profit.",
        hours: 2,
        skills: ["accounting"],
      },
      {
        name: "Arrange delivery and a sort space",
        description:
          "Pick a spot to receive the bulk delivery — a garage, hall, or driveway. Schedule enough hands for unloading day.",
        hours: 3,
        skills: ["organizing"],
        follows: [1],
      },
      {
        name: "Split orders fairly",
        description:
          "Set up sorting stations with scales for bulk grains/produce. Pre-print each household's list. Double-check before pickup.",
        hours: 3,
        skills: ["organizing"],
        follows: [2, 4],
        recurringCadence: "cycle",
      },
      {
        name: "Rotate the work",
        description:
          "Coordinating, sorting, and pickup duties should rotate so no one person carries it all. Review pricing and supplier reliability each cycle.",
        hours: 1,
        recurringCadence: "cycle",
      },
    ],
  },
  {
    id: "repair-cafe",
    name: "Repair Café",
    purpose:
      "Fix broken items — clothing, electronics, bikes, furniture — for free instead of throwing them away.",
    whoItServes:
      "Anyone with something broken and no money or skill to fix it; keeps usable goods out of landfills.",
    whatYoullNeed:
      "Handy volunteers, basic tools, a space with tables and power, and a recurring date.",
    setupHours: 14,
    defaultCategory: "skilled_labor",
    suggestsWorkDays: true,
    firstSteps:
      "Recruit your first two or three fixers before anything " +
      "else — the neighbor who sews, the bike tinkerer — because " +
      "a date and venue mean nothing without them. Then walk the " +
      "venue with them, talking through tables, power, and light, " +
      "and if there's a repair café in a nearby town, visit one " +
      "session; the intake flow is the part worth stealing.",
    commonPitfalls:
      "Repair cafés quietly turn into free drop-off repair shops: " +
      "visitors leave items and walk away, fixers become unpaid " +
      "technicians, and the one electronics person burns out " +
      "first. Hold the line that owners stay with their repair, " +
      "and post clearly that some things can't be saved — " +
      "disappointment handled up front is easier than blame " +
      "afterward.",
    pairsWith: ["tool-lending-library", "community-bike-workshop", "free-store"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Recruit fixers by specialty",
        description:
          "Find people good with sewing, small electronics, bikes, appliances, and woodwork. You only need one or two per category to start.",
        hours: 4,
        skills: ["repair", "electronics", "sewing"],
      },
      {
        name: "Set up repair stations",
        description:
          "Each station needs a table, the right tools, good light, and power. Group similar repairs together. Label stations clearly.",
        hours: 3,
        recurringCadence: "session",
        skills: ["organizing"],
      },
      {
        name: "Schedule a recurring date",
        description:
          "Monthly works well. Pick a steady venue — library, makerspace, community hall — so people know where to bring things.",
        hours: 1,
      },
      {
        name: "Create an intake flow",
        description:
          "A greeter logs each visitor and item, then routes them to the right fixer. Set the expectation: visitors stay and help with their own repair when they can; it's a learning space, not a drop-off.",
        hours: 2,
        skills: ["writing"],
      },
      {
        name: "Manage safety and expectations",
        description:
          "Post that some items can't be saved and repairs are attempted, not guaranteed. Have safe practices for electrical and battery items. Keep a first-aid kit handy.",
        hours: 2,
      },
      {
        name: "Stock common parts and consumables",
        description:
          "Keep thread, fuses, glue, fasteners, tubes, and patches on hand. Track what gets used so you can restock.",
        hours: 2,
        recurringCadence: "session",
        follows: [0],
      },
    ],
  },
  {
    id: "rides-transportation",
    name: "Rides & Transportation Support",
    purpose:
      "Get neighbors to medical appointments, grocery stores, and essential errands when transit and money are barriers.",
    whoItServes:
      "People without cars, disabled neighbors, elders, and anyone in a transit gap.",
    whatYoullNeed:
      "Volunteer drivers, a request/dispatch method, and clear safety and insurance ground rules. Driving neighbors is a serious responsibility — confirm every driver's license and insurance, screen anyone who'll drive vulnerable riders, and never use a volunteer ride in place of an ambulance in a medical emergency.",
    setupHours: 18,
    defaultCategory: "transport",
    firstSteps:
      "Two sets of conversations come before the first ride: sit " +
      "down with each would-be driver to confirm license and " +
      "insurance and talk honestly about screening, and talk with " +
      "the people who need rides — and the senior centers and " +
      "clinics that know them — about real destinations, times, " +
      "and mobility needs. The vetting conversation is easier as " +
      "a founding norm than as a rule imposed later.",
    commonPitfalls:
      "Ride networks fail at dispatch, not driving: requests land " +
      "on one person's phone until that person is exhausted, and " +
      "the same two reliable drivers get every ask while others " +
      "are never called again after one no. Rotate the " +
      "coordinator role, spread requests deliberately, and never " +
      "let the insurance question wait until after the first " +
      "fender-bender.",
    pairsWith: ["health-navigation", "community-bike-workshop", "court-support"],
    learnMore: ["claim-post"],
    tasks: [
      {
        name: "Recruit and vet drivers",
        description:
          "Confirm each driver has a valid license, insurance, and a safe vehicle. For rides with vulnerable people, do reference or background checks per your local norms.",
        hours: 5,
        skills: ["driving"],
      },
      {
        name: "Sort out insurance and liability",
        description:
          "Check what each driver's personal insurance covers for volunteer driving. Consider a simple waiver and consult a local legal aid clinic — this protects everyone.",
        hours: 4,
        skills: ["paperwork"],
      },
      {
        name: "Set up a request system",
        description:
          "Pick one channel for ride requests (phone line, form, group chat) with a lead time (e.g., 48 hours). Capture pickup time, locations, mobility needs, and contact info.",
        hours: 2,
        skills: ["organizing", "tech"],
      },
      {
        name: "Build a dispatch routine",
        description:
          "Have one coordinator (rotating) match requests to available drivers and confirm with both sides the day before. Keep a backup driver list for cancellations.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organizing"],
        follows: [0, 2],
      },
      {
        name: "Define what's covered",
        description:
          "Decide which trips qualify (medical, groceries, essential errands) and your service area. Be clear about wait times and whether drivers help carry bags.",
        hours: 1,
        skills: ["facilitation"],
      },
      {
        name: "Handle costs",
        description:
          "Decide how gas is covered — a small shared fund, optional rider contributions, or nothing. Keep it transparent and never let it become a barrier for the rider.",
        hours: 2,
        follows: [4],
      },
      {
        name: "Keep riders and drivers safe",
        description:
          "Set norms: drivers don't enter homes alone, no handling of money beyond agreed costs, and a check-in after rides with vulnerable people. Log each ride.",
        hours: 2,
        follows: [0],
      },
    ],
  },
  {
    id: "tenant-union",
    name: "Tenant Union & Eviction Defense Network",
    purpose:
      "Organize renters to defend against evictions, unsafe conditions, and unfair rent hikes through collective action.",
    whoItServes:
      "Renters, especially in buildings with negligent or absentee landlords, and anyone facing eviction.",
    whatYoullNeed:
      "A core organizing group, accurate local tenant-rights info, a connection to legal aid, and a fast contact system. This project supports tenants and shares public legal information; it does not replace legal advice. Always route individual cases to qualified legal aid before deadlines.",
    setupHours: 30,
    defaultCategory: "housing",
    firstSteps:
      "Talk to affected tenants before any contact with a " +
      "landlord, ever — door-knock, listen to what people " +
      "actually fear and want, and let the tenants in each " +
      "building set the pace, because they carry the retaliation " +
      "risk, not the organizers. In parallel, introduce yourself " +
      "to the local legal aid clinic early; you'll want that " +
      "relationship before the first eviction notice arrives, not " +
      "after.",
    commonPitfalls:
      "The way tenant unions hurt people is by moving faster than " +
      "the tenants themselves: a confrontation launched before a " +
      "building is ready exposes the most vulnerable neighbors to " +
      "retaliation they didn't sign up for. The quieter failure " +
      "is drift into giving legal advice instead of legal " +
      "information — route individual cases to qualified legal " +
      "aid before deadlines, every time.",
    pairsWith: ["legal-aid-clinic", "mutual-aid-moving-crew", "solidarity-fund"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Recruit a core organizing committee",
        description:
          "Find 3–6 committed tenants to anchor the work. Look for people respected in their buildings. Agree on roles, a meeting rhythm, and shared goals.",
        hours: 5,
        skills: ["organizing"],
      },
      {
        name: "Map buildings and tenant issues",
        description:
          "Door-knock or survey to learn which buildings have problems and what they are (repairs ignored, illegal fees, harassment). Track patterns and find natural leaders in each building.",
        hours: 8,
        skills: ["outreach", "interviewing"],
      },
      {
        name: "Gather accurate local tenant-rights information",
        description:
          "Compile your area's actual laws on eviction notice periods, repairs, deposits, and rent rules. Partner with a legal aid clinic to verify it. This is shared information, not legal advice — make that clear to members.",
        hours: 4,
        skills: ["paperwork", "writing"],
      },
      {
        name: "Build a rapid-response contact system",
        description:
          "Set up a phone tree or group chat so a tenant getting an eviction notice or lockout can reach the union fast. Decide who responds and how quickly.",
        hours: 3,
        skills: ["organizing", "tech support"],
      },
      {
        name: "Host a know-your-rights workshop",
        description:
          "Run a session (ideally with a legal aid partner) walking tenants through their rights and what to do if served papers. Provide printed take-home guides in relevant languages.",
        hours: 4,
        recurringCadence: "event",
        skills: ["teaching", "facilitation"],
        follows: [2],
      },
      {
        name: "Set up an eviction-response protocol",
        description:
          "Write a simple step-by-step for when someone faces eviction: document everything, contact legal aid by the deadline, organize neighbor support, and never ignore court dates.",
        hours: 3,
        skills: ["writing"],
        follows: [2],
      },
      {
        name: "Connect to legal aid and ongoing support",
        description:
          "Build a referral relationship with tenant lawyers, legal aid, and housing counselors so the union can hand off cases that need professional help. Keep contacts current.",
        hours: 3,
        skills: ["outreach"],
      },
    ],
  },
  {
    id: "childcare-collective",
    name: "Childcare / Babysitting Collective",
    purpose:
      "Share trusted childcare among families so parents can work, rest, or handle emergencies without paying for it.",
    whoItServes:
      "Parents and caregivers, especially single parents, shift workers, and lower-income families.",
    whatYoullNeed:
      "A group of vetted families, a safe space (or rotating homes), a scheduling system, and clear safety rules. Caring for other people's children is a serious responsibility — keep firm supervision rules, screen caregivers, and follow your local rules on informal childcare.",
    setupHours: 28,
    defaultCategory: "childcare",
    suggestsWorkDays: true,
    firstSteps:
      "This project is built in living rooms before it's built " +
      "anywhere else: gather the founding families and talk " +
      "through the uncomfortable specifics — screening, " +
      "supervision, discipline styles, what happens when a kid " +
      "gets hurt — before anyone schedules a single hour of care. " +
      "Check your local rules on informal childcare in that same " +
      "first stretch, so the model you agree on is one you can " +
      "actually run.",
    commonPitfalls:
      "Two things quietly break childcare collectives: credit " +
      "imbalance, where the same families always host until they " +
      "resent it, and safety rules that soften as everyone gets " +
      "comfortable — the just-this-once exception to never-alone " +
      "is exactly how trust gets destroyed. Track the balance " +
      "openly and treat the safety rules as most important with " +
      "the families you know best.",
    pairsWith: ["toy-library", "time-bank", "youth-mentorship"],
    learnMore: ["what-is-balance"],
    tasks: [
      {
        name: "Gather founding families and agree on a model",
        description:
          "Recruit families who know or can build trust with each other. Decide the model: a rotating babysitting co-op where parents earn and spend care credits, or scheduled group care.",
        hours: 4,
        skills: ["outreach", "facilitation"],
      },
      {
        name: "Set safety and vetting standards",
        description:
          "Agree on screening for anyone caring for children: references, background checks where appropriate, and a firm rule that no single adult is ever alone with another family's child unaccounted for. Set adult-to-child ratios.",
        hours: 6,
        skills: ["childcare"],
        follows: [0],
      },
      {
        name: "Find and child-proof a space",
        description:
          "Choose a venue or set standards for host homes. Check for hazards, cover outlets, secure heavy furniture, lock away medicines and chemicals, and confirm a safe outdoor area if used.",
        hours: 4,
        skills: ["childcare", "home repair"],
      },
      {
        name: "Create a scheduling and credit system",
        description:
          "Use a shared calendar or co-op app. In a credit model, one hour of care earns one hour owed. Track who's hosting when so the load stays fair.",
        hours: 3,
        skills: ["organizing", "data entry"],
        follows: [0],
      },
      {
        name: "Set health, allergy, and emergency policies",
        description:
          "Collect allergy info, medications, emergency contacts, and pickup authorizations for each child. Write a clear sick-child policy and what to do in a medical emergency.",
        hours: 3,
        skills: ["paperwork", "writing"],
      },
      {
        name: "Train caregivers on basics",
        description:
          "Cover supervision, safe sleep for infants, allergy and emergency response, and the safety rules. Encourage at least one pediatric first-aid/CPR-certified adult per session.",
        hours: 5,
        skills: ["teaching", "first aid"],
        follows: [1],
      },
      {
        name: "Run a trial session and gather feedback",
        description:
          "Hold a short pilot with a few families, then debrief. Fix what didn't work before scaling. Check in regularly so trust and safety stay strong.",
        hours: 3,
        skills: ["childcare"],
        follows: [2, 5],
      },
    ],
  },
  {
    id: "community-composting",
    name: "Community Composting Program",
    purpose:
      "Collect food scraps to divert waste from landfill and produce free compost for local gardens.",
    whoItServes:
      "Households without a way to compost, community gardens, and the local environment.",
    whatYoullNeed:
      "A composting site, collection bins, basic equipment, and a small maintenance rota.",
    setupHours: 22,
    defaultCategory: "infrastructure",
    suggestsWorkDays: true,
    firstSteps:
      "Talk to the site host and to the neighbors within smelling " +
      "distance before the first bin arrives — fear of odor and " +
      "rats kills compost sites, and an early honest conversation " +
      "defuses it better than any pamphlet. Then find your " +
      "compost's future home (a community garden that wants it) " +
      "and at least one person who's actually kept a hot pile " +
      "alive; their judgment will shape which method you pick.",
    commonPitfalls:
      "Compost projects die when nobody owns the turning: the " +
      "pile stalls or starts to smell, a neighbor complains, and " +
      "the host pulls permission — that chain moves faster than " +
      "you'd think. Match how many scraps you collect to what " +
      "your rota can actually process, and treat one contaminated " +
      "batch as a signage problem to fix, not a volunteer to " +
      "blame.",
    pairsWith: ["community-garden", "community-meal"],
    tasks: [
      {
        name: "Find a composting site",
        description:
          "Secure a spot with space and some sun — a community garden corner, vacant lot, or willing backyard. Confirm permission and check local rules on composting.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Choose a composting method",
        description:
          "Pick what fits your scale: a three-bin hot-compost system, tumblers, or worm bins. Match the method to how much material you expect and how much turning you can manage.",
        hours: 3,
        skills: ["composting"],
        follows: [0],
      },
      {
        name: "Source bins and equipment",
        description:
          "Build or buy collection bins and the composting structure. Gather a pitchfork, thermometer, and brown material (leaves, cardboard) to balance the food scraps.",
        hours: 4,
        skills: ["carpentry", "driving"],
        follows: [1],
      },
      {
        name: "Set up a collection system",
        description:
          "Decide how scraps arrive: a drop-off bin with set hours, or a volunteer pickup route. Give participants small countertop pails and a clear drop schedule.",
        hours: 4,
        skills: ["organizing"],
        follows: [2],
      },
      {
        name: "Make clear what's accepted",
        description:
          "Post a simple yes/no list (yes: fruit, veg, coffee, eggshells; no: meat, dairy, oils, pet waste). Clear signage prevents contamination that ruins a batch.",
        hours: 2,
        skills: ["writing", "translation"],
        follows: [1],
      },
      {
        name: "Recruit and train a maintenance rota",
        description:
          "Compost needs regular turning, moisture checks, and balancing greens and browns. Build a shared schedule and teach volunteers the basics so piles don't smell or stall.",
        hours: 3,
        skills: ["composting", "teaching"],
        follows: [2],
      },
      {
        name: "Distribute finished compost",
        description:
          "Once compost is ready, share it free with contributors and community gardens. Announce pickup days and bring bags or buckets.",
        hours: 2,
        skills: ["driving"],
        recurringCadence: "cycle",
      },
    ],
  },
  {
    id: "free-little-library",
    name: "Free Little Library & Book Exchange",
    purpose:
      "Provide free books 24/7 to encourage reading and sharing, with no library card or fees.",
    whoItServes:
      "Kids, families, and readers of all ages, especially in neighborhoods with limited book access.",
    whatYoullNeed:
      "A weatherproof book box, a starting collection, a host spot, and light upkeep.",
    setupHours: 7.5,
    defaultCategory: "education",
    firstSteps:
      "Start with two short conversations: one with whoever's " +
      "wall or yard will host the box, about placement and what " +
      "happens if it gets shabby, and one with the families and " +
      "school nearby about what books they'd actually take home. " +
      "Line up your steward — the person who'll check it weekly — " +
      "before the box goes up, not after.",
    commonPitfalls:
      "Little libraries don't die from a shortage of books — they " +
      "die from the wrong ones: someone dumps a box of outdated " +
      "textbooks, the good titles get buried, rain gets in, and " +
      "people quietly stop looking. A five-minute weekly steward " +
      "visit prevents almost all of it; the box needs a person " +
      "more than it needs donations.",
    pairsWith: ["seed-library", "books-to-prisoners"],
    tasks: [
      {
        name: "Build or get a weatherproof book box",
        description:
          "Make or buy a sturdy, waterproof box on a post or wall. A repurposed cabinet or newspaper box works. Add a clear door and a sloped roof so books stay dry.",
        hours: 4,
        skills: ["carpentry"],
      },
      {
        name: "Choose and prep a location",
        description:
          "Pick a spot with foot traffic and permission — your own front yard, a community center, or a park edge. Anchor the box firmly and confirm it's allowed.",
        hours: 1,
        skills: ["outreach"],
        follows: [0],
      },
      {
        name: "Stock the initial collection",
        description:
          "Gather donated books through a small drive. Aim for a mix: children's books, popular fiction, and practical nonfiction. Start it half-full so there's room to add.",
        hours: 1.5,
        skills: ["outreach"],
        follows: [1],
      },
      {
        name: "Add a sign and simple norms",
        description:
          "Post \"Take a book, leave a book — all free.\" Keep it welcoming and rule-light. Add a note inviting all ages and languages.",
        hours: 0.5,
        skills: ["writing"],
        follows: [1],
      },
      {
        name: "Recruit a steward",
        description:
          "Ask someone nearby to check the box weekly: tidy it, remove anything damaged or inappropriate, and rebalance the stock. Five minutes a week keeps it healthy.",
        hours: 0.5,
        skills: ["outreach"],
      },
    ],
  },
  {
    id: "community-first-aid-training",
    name: "Community First Aid & Overdose Response Training",
    purpose:
      "Train neighbors in first aid, CPR, and overdose reversal so the community can respond in the minutes before professionals arrive.",
    whoItServes:
      "Everyone; especially high-impact where EMS response is slow or overdose rates are high.",
    whatYoullNeed:
      "Certified trainers, supplies, a space, and a recurring schedule. All medical training should be delivered by certified instructors; this project organizes and hosts that training, it doesn't replace it.",
    setupHours: 17,
    defaultCategory: "education",
    firstSteps:
      "Your first conversation is with the people who'll actually " +
      "teach — a Red Cross chapter, your health department, or a " +
      "harm-reduction group. Ask what they need from a host and " +
      "which dates they can offer, then talk with the folks most " +
      "likely to witness an emergency — family of people who use " +
      "drugs, staff at nearby businesses — so the first sessions " +
      "get built around them.",
    commonPitfalls:
      "This project fades when it becomes one big training event " +
      "that never repeats — skills rust and naloxone expires with " +
      "nobody noticing. And resist the urge to teach the medical " +
      "content yourselves; your job is hosting certified " +
      "instructors, not standing in for them.",
    pairsWith: ["harm-reduction-supplies", "emergency-preparedness"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Partner with certified trainers",
        description:
          "Connect with qualified instructors — the Red Cross, your local health department, or a harm-reduction organization. They deliver the actual medical training; your role is to organize and host it.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Source supplies",
        description:
          "Obtain first-aid kits, CPR practice mannequins (often loaned by trainers), and naloxone. Many public health programs distribute naloxone free — ask your health department or harm-reduction groups.",
        hours: 3,
        skills: ["outreach", "driving"],
        follows: [0],
      },
      {
        name: "Find space and schedule sessions",
        description:
          "Book a room that fits hands-on practice — a community center, library, or clinic. Set recurring dates so people can plan around work.",
        hours: 2,
      },
      {
        name: "Recruit participants",
        description:
          "Promote sessions widely and prioritize people likely to witness emergencies. Keep sign-up easy and free, and offer varied times for shift workers.",
        hours: 2,
        skills: ["outreach"],
        follows: [2],
      },
      {
        name: "Run the training sessions",
        description:
          "Host the trainer-led sessions, handle setup and check-in, and make sure everyone gets hands-on practice. Provide take-home reference cards.",
        hours: 4,
        skills: ["organizing"],
        follows: [0, 1, 3],
        recurringCadence: "session",
      },
      {
        name: "Distribute kits and refreshers",
        description:
          "Send trained people home with a first-aid kit and naloxone where available. Schedule periodic refreshers so skills stay sharp.",
        hours: 2,
        recurringCadence: "session",
        follows: [4],
      },
    ],
  },
  {
    id: "time-bank",
    name: "Time Bank",
    purpose:
      "Let members exchange services by time, where one hour given equals one hour earned, valuing everyone's contribution equally.",
    whoItServes:
      "Anyone, especially people rich in time and skills but short on cash.",
    whatYoullNeed:
      "A member list, a tracking system, a coordinator, and agreed rules.",
    setupHours: 27,
    defaultCategory: "organizing",
    firstSteps:
      "Start with conversations, not software: sit down with ten " +
      "or fifteen neighbors and ask each one what they'd offer " +
      "and what they'd ask for. If those conversations don't " +
      "surface variety — rides, tutoring, repairs, cooking — keep " +
      "recruiting before you build the system.",
    commonPitfalls:
      "Time banks rarely die of scandal; they die of silence — " +
      "people sign up, nobody makes the first request, and it all " +
      "goes quiet. Have a coordinator actively broker matches for " +
      "the first months, and hold the one-hour-equals-one-hour " +
      "line: the moment you debate whether a plumber's hour " +
      "outranks a babysitter's, it stops being a time bank.",
    pairsWith: ["skill-share", "childcare-collective"],
    learnMore: ["what-is-balance", "negative-balance"],
    tasks: [
      {
        name: "Recruit founding members and inventory skills",
        description:
          "Gather an initial group and ask each what they can offer (rides, tutoring, repairs, cooking, gardening) and what they need. The variety of offers is what makes it work.",
        hours: 5,
        skills: ["outreach"],
      },
      {
        name: "Choose a tracking system",
        description:
          "Pick a way to log hours: dedicated time-bank software, a shared spreadsheet, or a simple ledger. It must record who gave and received hours.",
        hours: 4,
        skills: ["tech support", "data entry"],
      },
      {
        name: "Set the rules",
        description:
          "Agree on the core principle (one hour = one credit, regardless of the task), how members request and confirm exchanges, and what happens if someone's balance runs low.",
        hours: 4,
        skills: ["facilitation", "writing"],
      },
      {
        name: "Onboard members",
        description:
          "Hold a short orientation so people understand the philosophy and the system. Give everyone a few starter credits so exchanges can begin immediately.",
        hours: 4,
        skills: ["teaching"],
        follows: [1, 2],
      },
      {
        name: "Launch a service directory",
        description:
          "Publish a searchable list of who offers what. Keep it current so members can find help without asking the coordinator every time.",
        hours: 4,
        skills: ["data entry"],
        follows: [0],
      },
      {
        name: "Coordinate and broker exchanges",
        description:
          "Have a coordinator help match needs to offers, especially early on, and nudge quiet members. Over time members connect directly.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organizing"],
        follows: [4],
      },
      {
        name: "Build trust and safety practices",
        description:
          "Set norms for exchanges involving homes or vulnerable members (references, not meeting alone where uncomfortable). Add a simple way to flag problems.",
        hours: 4,
        skills: ["facilitation"],
      },
    ],
  },
  {
    id: "solidarity-fund",
    name: "Solidarity Fund (Mutual Aid Cash Assistance)",
    purpose:
      "Pool money to give direct, no-strings cash to neighbors facing a crisis.",
    whoItServes:
      "People hit by emergencies — a rent shortfall, a medical bill, a utility shutoff.",
    whatYoullNeed:
      "A transparent money system, a small stewardship team, a fundraising plan, and clear criteria. Handling pooled money carries real responsibility — use dual sign-off, keep clean records, protect recipient privacy, and get advice on the legal and tax treatment of your fund.",
    setupHours: 23,
    defaultCategory: "mutual_aid_drive",
    firstSteps:
      "Before you collect a dollar, sit down with the few people " +
      "you'd trust with pooled money and talk honestly: how dual " +
      "sign-off will work, what gets published, and what happens " +
      "when requests outrun the fund. Then find a local nonprofit " +
      "resource or accountant to walk you through the legal and " +
      "tax side before the account opens.",
    commonPitfalls:
      "Money breaks trust faster than anything else — one " +
      "unexplained payout or a sloppy ledger can end the fund " +
      "even when nobody did anything wrong. And there will almost " +
      "always be more requests than money; if the criteria " +
      "weren't agreed in advance, saying no case by case burns " +
      "out the team and breeds resentment.",
    pairsWith: ["resource-hub-dispatch", "tenant-union", "free-tax-prep"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Form a small stewardship team",
        description:
          "Recruit a few trusted people to manage the fund. Define roles clearly and commit to transparency from day one — trust is everything here.",
        hours: 3,
        skills: ["organizing"],
      },
      {
        name: "Set up transparent money handling",
        description:
          "Open a dedicated account or use a fiscal sponsor. Require two people to approve payouts, keep a clear ledger, and check whether your structure has tax or legal implications — consult a local nonprofit resource or accountant.",
        hours: 5,
        skills: ["accounting", "paperwork"],
        follows: [0],
      },
      {
        name: "Define request and disbursement criteria",
        description:
          "Decide who's eligible, typical amounts, how often someone can request, and whether it's first-come or need-weighted. Keep barriers low and avoid requiring proof of hardship where you can.",
        hours: 4,
        skills: ["facilitation"],
      },
      {
        name: "Create a simple, low-barrier request form",
        description:
          "Build a short, private form asking only what's necessary. Offer multiple ways to apply (online, phone, in person) and protect applicants' privacy.",
        hours: 2,
        skills: ["writing"],
        follows: [2],
      },
      {
        name: "Set up fundraising",
        description:
          "Combine recurring small donations from members with occasional drives. Be clear with donors that funds go directly to neighbors in need.",
        hours: 4,
        skills: ["outreach"],
        follows: [1],
      },
      {
        name: "Build a decision and payout process",
        description:
          "Set a turnaround time, a quick review by the team, and fast payout methods. Speed matters in a crisis. Document each decision simply.",
        hours: 3,
        skills: ["organizing"],
        follows: [1, 2],
      },
      {
        name: "Report back transparently",
        description:
          "Share regular summaries — money in, money out, number of neighbors helped — without exposing recipients' identities. Transparency keeps donors giving.",
        hours: 2,
        recurringCadence: "month",
        skills: ["writing", "accounting"],
      },
    ],
  },
  {
    id: "diaper-hygiene-bank",
    name: "Diaper & Hygiene Supply Bank",
    purpose:
      "Distribute free diapers, period products, and hygiene items, which can't be bought with most food assistance.",
    whoItServes:
      "Low-income families, infants, menstruating people, and unhoused neighbors.",
    whatYoullNeed:
      "Storage, a supply stream, distribution points, and volunteers.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Talk first with the people who already see the families — " +
      "the pediatric clinic, the food pantry, the church — and " +
      "ask which sizes and products actually run short and " +
      "whether they'd host distribution. That one conversation " +
      "saves you months of guessing.",
    commonPitfalls:
      "What hurts most is unpredictability: one big drive, full " +
      "shelves, then empty months right when families have " +
      "started counting on you. Watch the real inventory too — " +
      "newborn sizes pile up while the big sizes run out — and " +
      "never ask for proof of need; dignity is part of the " +
      "service.",
    pairsWith: ["welcome-wagon", "laundry-shower-access"],
    tasks: [
      {
        name: "Find storage and a distribution point",
        description:
          "Secure dry, secure storage and a place to hand items out — a closet at a clinic, church, or community center. The distribution spot should feel private and dignified.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Set up supply sourcing",
        description:
          "Combine bulk buying, donation drives, and connections to diaper-bank networks or wholesalers. Track which sources are steady so you don't run dry.",
        hours: 3,
        skills: ["outreach", "driving"],
      },
      {
        name: "Sort and inventory by size and type",
        description:
          "Organize diapers by size, plus period products and hygiene items. Keep a running count so you know what to request. Sizes for older babies often run short.",
        hours: 1.5,
        skills: ["organizing", "data entry"],
        follows: [0, 1],
      },
      {
        name: "Set a fair distribution policy",
        description:
          "Decide how much each family gets and how often, with no proof-of-need barrier. Make it predictable so people can rely on it.",
        hours: 1,
        skills: ["facilitation"],
      },
      {
        name: "Schedule distribution and staff it",
        description:
          "Set regular distribution days, recruit volunteers to hand out supplies, and keep the tone warm and judgment-free.",
        hours: 2.5,
        skills: ["organizing"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "community-bike-workshop",
    name: "Community Bike Workshop",
    purpose:
      "Offer free space, tools, and help to fix, build, and earn bikes, making transport affordable and accessible.",
    whoItServes:
      "People without cars, youth, commuters, and anyone needing affordable transportation.",
    whatYoullNeed:
      "A space, tools, donated bikes and parts, and volunteer mechanics.",
    setupHours: 20,
    defaultCategory: "transport",
    suggestsWorkDays: true,
    firstSteps:
      "Before hunting for a space, talk with the people who'd use " +
      "the workshop and the mechanics who'd teach — and if " +
      "there's a community bike shop in a nearby city, visit it " +
      "and ask what they'd do differently. With your site host, " +
      "settle storage, access, and insurance up front.",
    commonPitfalls:
      "The workshop dies when volunteers fix bikes instead of " +
      "teaching people to fix them: it becomes a free repair " +
      "shop, the line grows, and your mechanics burn out. Watch " +
      "out for drowning in donated junk bikes too — triage " +
      "ruthlessly — and never let a bike roll out without a " +
      "brakes-and-tires safety check.",
    pairsWith: ["repair-cafe", "rides-transportation", "tool-lending-library"],
    tasks: [
      {
        name: "Find a workshop space",
        description:
          "Secure a garage, basement, shipping container, or shared community space with room to work and store bikes. Confirm access and any insurance needs.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Gather tools and a workstand",
        description:
          "Collect a basic bike toolkit and at least one repair stand through donations or a small budget. Organize tools so they're easy to find and return.",
        hours: 5,
        skills: ["driving"],
        follows: [0],
      },
      {
        name: "Collect donated bikes and parts",
        description:
          "Put out calls for unused bikes and salvageable parts. Sort into \"fixable,\" \"for parts,\" and \"ready to ride.\" A parts stockpile is what keeps the workshop running.",
        hours: 4,
        skills: ["repair", "driving"],
        follows: [0],
      },
      {
        name: "Recruit volunteer mechanics",
        description:
          "Find a few people who can fix bikes and, more importantly, teach others. The goal is helping people learn to repair their own, not doing it for them.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Set open hours and an earn-a-bike model",
        description:
          "Pick predictable open hours. Consider an earn-a-bike program where someone learns repair skills over a few sessions and leaves with a bike they fixed themselves.",
        hours: 2,
        skills: ["organizing"],
      },
      {
        name: "Establish safety practices",
        description:
          "Require eye protection, set rules for tool use, and have a first-aid kit. Always do a safety check (brakes, tires, headset) before any bike leaves.",
        hours: 2,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "newcomer-translation-network",
    name: "Newcomer & Translation Support Network",
    purpose:
      "Help immigrants and refugees navigate a new place — translation, paperwork, orientation, and community connection.",
    whoItServes:
      "Newly arrived immigrants and refugees, and non-English-speaking neighbors.",
    whatYoullNeed:
      "Bilingual volunteers, partner organizations, orientation materials, and a request system. Be especially careful with privacy: don't collect immigration status, route legal questions to qualified immigration lawyers, and let community members lead on what support they actually want.",
    setupHours: 22,
    defaultCategory: "other",
    firstSteps:
      "Start by talking with newcomer communities themselves and " +
      "the organizations already walking alongside them — let " +
      "them say what support they want rather than designing it " +
      "for them. And before the first request arrives, have your " +
      "handoff ready: qualified immigration lawyers you can route " +
      "every legal question to.",
    commonPitfalls:
      "The most serious risk is well-meaning volunteers sliding " +
      "from interpreting into giving legal or medical advice " +
      "they're not qualified for — bad immigration guidance can " +
      "cost someone dearly. And collect the bare minimum of data: " +
      "one careless record about someone's status can put them in " +
      "real danger.",
    pairsWith: ["welcome-wagon", "legal-aid-clinic", "health-navigation"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Recruit bilingual and multilingual volunteers",
        description:
          "Find volunteers who speak the languages common in your area and can help with translation, forms, and accompaniment. Match languages to actual local needs.",
        hours: 4,
        skills: ["translation", "outreach"],
      },
      {
        name: "Map local services and partners",
        description:
          "Build a directory of clinics, schools, legal aid, ESL classes, food resources, and immigrant-serving organizations. Newcomers often just need to know what exists and how to reach it.",
        hours: 5,
        skills: ["outreach", "data entry"],
      },
      {
        name: "Build a request and matching system",
        description:
          "Create a simple way for newcomers to ask for help and get matched to a volunteer by language and need. Offer phone and in-person options, not just online.",
        hours: 3,
        skills: ["organizing", "tech support"],
        follows: [0],
      },
      {
        name: "Create orientation materials",
        description:
          "Put together plain-language guides in relevant languages covering transit, schools, healthcare, and rights. Use visuals so they work across literacy levels.",
        hours: 4,
        skills: ["writing", "translation"],
        follows: [1],
      },
      {
        name: "Offer accompaniment for appointments",
        description:
          "Arrange for volunteers to go with people to medical, school, or service appointments to interpret and support. Brief volunteers to interpret faithfully, not to give advice they're not qualified for.",
        hours: 3,
        recurringCadence: "month",
        skills: ["translation"],
        follows: [0, 2],
      },
      {
        name: "Set privacy and safety practices",
        description:
          "Collect the minimum information needed and never ask for or record immigration status. Store data securely and train volunteers to handle sensitive situations with discretion.",
        hours: 3,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "community-meal",
    name: "Community Meal / People's Kitchen",
    purpose:
      "Cook and share free communal meals on a regular schedule, no questions asked.",
    whoItServes:
      "Anyone hungry, isolated, or food-insecure; it also builds connection across the neighborhood.",
    whatYoullNeed:
      "A kitchen, cooks, an ingredient pipeline, a serving space, and a volunteer crew. Serving food to the public carries real food-safety responsibilities — check your local rules on permits and certified food handlers, and follow safe storage and temperature practices every time.",
    setupHours: 22,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Your first two conversations are with the kitchen host — a " +
      "church hall or community center — about the days you're " +
      "planning, and with your local health authority about " +
      "permits and food handling; those shape everything else. " +
      "Then ask the people who'd come to eat which day and time " +
      "actually works for them.",
    commonPitfalls:
      "A food-safety slip can hurt someone and end the project — " +
      "temperature and storage rules don't get skipped, not once. " +
      "The slower death is the same three people cooking every " +
      "meal until they burn out, so widen the crew and rotate the " +
      "lead cook from the start.",
    pairsWith: ["gleaning-network", "community-garden", "community-fridge"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Find a kitchen and serving space",
        description:
          "Secure a kitchen large enough to cook at scale — a church hall, community center, or commercial kitchen — plus space to serve. Confirm availability on your planned days.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Sort out food safety and permits",
        description:
          "Check local rules for serving food to the public. You may need a permit, a certified food-handler present, or a licensed kitchen. Learn safe storage and temperature handling.",
        hours: 4,
        skills: ["food safety"],
        follows: [0],
      },
      {
        name: "Build a food supply pipeline",
        description:
          "Combine grocery and restaurant donations, bulk purchases, and any garden or gleaning surplus. Track reliable sources so you can plan menus around what you'll have.",
        hours: 3,
        skills: ["outreach", "driving"],
      },
      {
        name: "Plan menus for scale, diet, and allergies",
        description:
          "Design simple, nutritious meals that cook in volume and stretch ingredients. Offer vegetarian options and label common allergens clearly.",
        hours: 2,
        recurringCadence: "session",
        skills: ["cooking"],
        follows: [2],
      },
      {
        name: "Recruit a cooking and serving crew",
        description:
          "Gather volunteers for prep, cooking, serving, and cleanup. Assign a lead cook per meal and keep roles clear so service runs smoothly.",
        hours: 3,
        skills: ["cooking", "organizing"],
      },
      {
        name: "Set a schedule and spread the word",
        description:
          "Pick a regular day and time so people can rely on it. Promote through flyers, shelters, and word of mouth, keeping the tone warm and open to all.",
        hours: 2,
        skills: ["graphic design"],
        follows: [0, 1],
      },
      {
        name: "Run the meal and clean up",
        description:
          "Cook, serve with dignity (table service feels better than a line where possible), and clean the kitchen to required standards. Pack leftovers safely for redistribution.",
        hours: 5,
        skills: ["cooking"],
        follows: [3, 4, 5],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "seed-library",
    name: "Seed Library & Seed Swap",
    purpose:
      "Share free seeds so people can grow food, while preserving locally adapted and heirloom varieties.",
    whoItServes:
      "Home gardeners, first-time growers, and community gardens.",
    whatYoullNeed:
      "A storage and catalog system, donated seeds, a host spot, and a few stewards.",
    setupHours: 8,
    defaultCategory: "food",
    firstSteps:
      "Talk with the library or community center about hosting " +
      "the cabinet, and with experienced local gardeners about " +
      "what genuinely grows in your region — beginners' success " +
      "rides on regionally suited seed. A nearby nursery or " +
      "community garden will often gladly donate the starter " +
      "stock.",
    commonPitfalls:
      "A seed library dies quietly: old seed that won't " +
      "germinate, beginners who conclude they can't garden and " +
      "never come back. Rotate stock without sentimentality, and " +
      "don't count on returns — almost nobody saves seed back — " +
      "so plan restocking around donations, not deposits.",
    pairsWith: ["community-garden", "free-little-library"],
    tasks: [
      {
        name: "Find a host and storage system",
        description:
          "Partner with a library, community center, or garden to host a small cabinet or drawer set. Store seeds cool, dry, and dark in labeled envelopes.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Source initial seeds",
        description:
          "Gather donations from gardeners, seed companies' surplus, and end-of-season packets. Favor easy, regionally suited varieties so beginners succeed.",
        hours: 2,
        skills: ["outreach", "gardening"],
      },
      {
        name: "Organize and label the collection",
        description:
          "Sort by type (vegetable, herb, flower) and difficulty. Label each with the plant, the year, and basic growing notes. Note which are easy to save seed from.",
        hours: 2,
        skills: ["gardening", "data entry"],
        follows: [1],
      },
      {
        name: "Set borrowing and sharing norms",
        description:
          "Keep it simple: take seeds free, grow them, and ideally save and return some at season's end. Post a one-page how-it-works guide.",
        hours: 1,
        skills: ["writing"],
      },
      {
        name: "Maintain viability and restock",
        description:
          "Seeds lose viability over time. Rotate out old stock, run germination checks on doubtful batches, and refill popular varieties.",
        hours: 1,
        skills: ["gardening"],
        follows: [2],
        recurringCadence: "cycle",
      },
    ],
  },
  {
    id: "digital-literacy",
    name: "Digital Literacy & Device Lending Program",
    purpose:
      "Lend devices and teach digital skills to bridge the gap for people without reliable tech or internet.",
    whoItServes:
      "Elders, low-income neighbors, job seekers, and anyone shut out of online services.",
    whatYoullNeed:
      "Donated devices, internet access, volunteer tutors, and a space.",
    setupHours: 27,
    defaultCategory: "tech",
    firstSteps:
      "Talk first with the people you want to reach — at the " +
      "library, the senior center, the pantry line — and ask what " +
      "they actually want to do: telehealth, job applications, " +
      "photos of the grandkids. Then talk with the library about " +
      "space and connectivity before you collect a single device.",
    commonPitfalls:
      "Lending a device without solving internet access is " +
      "lending a paperweight — connectivity is half the project. " +
      "In sessions, the classic mistake is tutors grabbing the " +
      "mouse and talking in jargon; and never re-lend a device " +
      "without wiping it, because leaking one borrower's data " +
      "breaks all the trust you've built.",
    pairsWith: ["community-wifi-mesh", "skill-share"],
    learnMore: ["install-app", "new-device"],
    tasks: [
      {
        name: "Collect and refurbish devices",
        description:
          "Gather donated laptops, tablets, and phones. Securely wipe each, update it, and set it up for easy use. Test that everything works before lending.",
        hours: 8,
        skills: ["tech support", "driving"],
      },
      {
        name: "Set up a lending system",
        description:
          "Create a simple checkout: who borrowed what, condition, and due date. Decide loan length and a forgiving return policy built on trust.",
        hours: 3,
        skills: ["data entry"],
        follows: [0],
      },
      {
        name: "Arrange internet access",
        description:
          "A device is little use without connectivity. Lend mobile hotspots, partner with the library, or point people to low-cost internet programs and free public WiFi.",
        hours: 3,
        skills: ["tech support", "outreach"],
      },
      {
        name: "Recruit and train tutors",
        description:
          "Find patient volunteers and prep them to teach without jargon. Emphasize going at the learner's pace and never taking over the mouse.",
        hours: 4,
        skills: ["teaching"],
      },
      {
        name: "Design a beginner curriculum",
        description:
          "Build short lessons on the essentials: email, online safety, job applications, telehealth, government forms, and video calls. Provide printed cheat sheets.",
        hours: 4,
        skills: ["teaching", "writing"],
      },
      {
        name: "Schedule classes and drop-in help",
        description:
          "Offer both structured classes and open \"tech help\" hours. Vary times for people who work, and keep groups small.",
        hours: 3,
        recurringCadence: "session",
        skills: ["organizing"],
        follows: [3, 4],
      },
      {
        name: "Set data security and return policies",
        description:
          "Wipe each device between borrowers, teach safe password and privacy habits, and explain how personal data is protected. Have a plan for lost or damaged devices.",
        hours: 2,
        skills: ["tech support", "writing"],
      },
    ],
  },
  {
    id: "weatherization-brigade",
    name: "Weatherization & Home Repair Brigade",
    purpose:
      "Help low-income, elderly, and disabled neighbors with home repairs and weatherization to cut energy bills and improve safety.",
    whoItServes:
      "Low-income homeowners, elders, and disabled neighbors who can't do or afford the work.",
    whatYoullNeed:
      "Skilled volunteers, materials, tools, and a request system. Stick to work within volunteer competence — route electrical, gas, structural, and roofing jobs to licensed professionals.",
    setupHours: 21,
    defaultCategory: "housing",
    suggestsWorkDays: true,
    firstSteps:
      "Gather your most experienced volunteers first and agree on " +
      "the scope line together — which jobs you'll take and which " +
      "go to licensed professionals — before you accept a single " +
      "request. Treat the first visit to each home as a " +
      "conversation, not an inspection: the resident decides what " +
      "gets touched in their house.",
    commonPitfalls:
      "The danger is scope creep: the 'small fix' that turns out " +
      "to be electrical, gas, or roof work beyond volunteer " +
      "competence — that's where someone gets hurt. And don't " +
      "promise more visits than the crew can deliver; leaving an " +
      "elder waiting on help they'd counted on hurts more than an " +
      "honest no up front.",
    pairsWith: ["community-wood-bank", "tool-lending-library"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Recruit skilled volunteers",
        description:
          "Find people comfortable with basic carpentry, caulking, insulation, and weather-stripping. A couple of more experienced leads can guide the rest.",
        hours: 4,
        skills: ["carpentry", "home repair"],
      },
      {
        name: "Set the scope of work",
        description:
          "Define what you will and won't do. Stick to safe, simple jobs (weatherproofing, grab bars, minor fixes) and rule out anything requiring a licensed trade, like major electrical or gas work.",
        hours: 2,
        skills: ["home repair"],
        follows: [0],
      },
      {
        name: "Build a request and assessment system",
        description:
          "Create a way for neighbors to request help, then do a quick visit to scope the job, list materials, and confirm it's within your skills and safety limits.",
        hours: 3,
        skills: ["organizing"],
      },
      {
        name: "Source materials and tools",
        description:
          "Gather caulk, weather-stripping, insulation, and basic hardware through donations, discounts, or a small budget. Maintain a shared tool kit.",
        hours: 4,
        skills: ["driving"],
        follows: [1],
      },
      {
        name: "Sort out safety and liability",
        description:
          "Use simple waivers, carry first-aid supplies, require proper safety gear, and never attempt work beyond your competence. Consult on liability coverage for volunteer repairs.",
        hours: 3,
        skills: ["paperwork"],
      },
      {
        name: "Schedule and run work days",
        description:
          "Match jobs to volunteer teams, confirm with the homeowner, and complete the work in a focused session. Respect the home and the resident's wishes throughout.",
        hours: 5,
        skills: ["organizing", "home repair"],
        follows: [1, 2, 3, 4],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "pet-food-bank",
    name: "Pet Food Bank & Pet Care Support",
    purpose:
      "Provide free pet food and basic care help so people aren't forced to surrender pets over cost.",
    whoItServes:
      "Low-income pet owners, elders on fixed incomes, and unhoused neighbors with animals.",
    whatYoullNeed:
      "Storage, a pet food supply stream, a distribution point, and vet partnerships.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Talk first with the existing food pantry about " +
      "distributing together — the same households often need " +
      "both — and with local vets and pet stores about donations " +
      "and maybe a vaccine or discount partnership.",
    commonPitfalls:
      "Unpredictability does the most damage: one big drive, then " +
      "empty shelves, when pet owners need to be able to count on " +
      "you. And watch the tone — any judgment about whether 'poor " +
      "people should have pets' kills this project faster than " +
      "running out of kibble.",
    pairsWith: ["diaper-hygiene-bank", "community-fridge"],
    tasks: [
      {
        name: "Find storage and a distribution point",
        description:
          "Secure dry, pest-proof storage and a spot to hand out food — often alongside an existing food pantry or community center.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Build a pet food supply stream",
        description:
          "Combine donation drives, pet-store and manufacturer donations, and bulk buying. Track what comes in so you can plan distributions.",
        hours: 3,
        skills: ["outreach", "driving"],
      },
      {
        name: "Sort and inventory by animal and size",
        description:
          "Separate dog and cat food (and other animals), note quantities, and check expiration dates. Keep a running count to guide restocking.",
        hours: 1.5,
        skills: ["organizing", "data entry"],
        follows: [0, 1],
      },
      {
        name: "Set a distribution policy",
        description:
          "Decide how much each household gets and how often, with no proof-of-need barrier. Make it predictable so owners can plan.",
        hours: 1,
        skills: ["facilitation"],
      },
      {
        name: "Schedule and staff distribution",
        description:
          "Set regular distribution times, recruit volunteers, and keep the tone judgment-free. Many people skip meals to feed their pets — meet them with respect.",
        hours: 2.5,
        skills: ["organizing"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "youth-mentorship",
    name: "Youth Mentorship & After-School Program",
    purpose:
      "Give kids and teens a safe space after school with homework help, mentorship, and enrichment.",
    whoItServes:
      "Youth in under-resourced areas and the working parents who need safe care.",
    whatYoullNeed:
      "A safe space, vetted mentors, activities, and snacks. Working with youth carries serious responsibility — vet adults, keep the two-adult rule, follow mandatory-reporting laws, and comply with local rules for youth programs.",
    setupHours: 28,
    defaultCategory: "education",
    suggestsWorkDays: true,
    firstSteps:
      "Before recruiting a single mentor, talk with parents and " +
      "with young people themselves about what they need, and put " +
      "your safety policies in writing — background checks, the " +
      "two-adult rule, mandatory reporting. No adult spends time " +
      "with kids until they've cleared that bar.",
    commonPitfalls:
      "The worst failure is a safety shortcut: an unvetted adult, " +
      "or an adult alone with a child — that's never negotiable. " +
      "The second is mentor churn; for kids who've already been " +
      "let down, an adult who disappears does harm, so start " +
      "small and grow only as far as you can supervise and " +
      "sustain.",
    pairsWith: ["school-supply-program", "childcare-collective", "community-music"],
    learnMore: ["how-vouching-works"],
    tasks: [
      {
        name: "Secure a safe space and set hours",
        description:
          "Find a suitable, accessible venue — a school room, library, or community center — and set consistent after-school hours families can rely on.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Set child safety and vetting standards",
        description:
          "Require background checks for adults working with youth, enforce a two-adult rule so no one is alone with a child, and set clear conduct and reporting policies.",
        hours: 6,
        skills: ["childcare", "writing"],
      },
      {
        name: "Recruit and train mentors",
        description:
          "Find reliable, caring adults and train them on boundaries, youth safety, and how to support without doing the work for kids. Aim for consistency week to week.",
        hours: 6,
        skills: ["outreach", "teaching"],
        follows: [1],
      },
      {
        name: "Plan programming",
        description:
          "Mix homework help with enrichment — reading, art, sports, life skills. Keep it engaging and let youth help shape what's offered.",
        hours: 4,
        skills: ["teaching"],
      },
      {
        name: "Handle enrollment, allergies, and emergency info",
        description:
          "Collect parent permission, allergy and medical details, emergency contacts, and pickup authorizations for each child. Store this securely.",
        hours: 3,
        skills: ["paperwork", "data entry"],
      },
      {
        name: "Source snacks and supplies",
        description:
          "Provide a healthy snack (many kids arrive hungry) and gather books, art materials, and games through donations or a small budget.",
        hours: 2,
        recurringCadence: "month",
        skills: ["outreach"],
      },
      {
        name: "Run sessions and check in with families",
        description:
          "Open the space, supervise closely, run the activities, and keep regular contact with parents about how their kids are doing.",
        hours: 4,
        skills: ["childcare", "teaching"],
        follows: [0, 2, 3, 4],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "gleaning-network",
    name: "Gleaning Network",
    purpose:
      "Rescue surplus produce from farms, orchards, gardens, and markets and redistribute it before it's wasted.",
    whoItServes:
      "Food-insecure neighbors and food projects like fridges, pantries, and community meals.",
    whatYoullNeed:
      "Volunteers, transport, grower relationships, and short-term storage.",
    setupHours: 21,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Start with the growers: farms, orchards, and market " +
      "vendors. Ask what surplus they have and what worries them " +
      "about hosting volunteers — liability, crop damage — and " +
      "lock in where the food will go (fridges, pantries, " +
      "community meals) before the first harvest.",
    commonPitfalls:
      "The classic failure is rescuing fruit that then rots in " +
      "someone's garage — distribution gets arranged before you " +
      "pick, not after. Harvest windows are short, so a small " +
      "crew that moves fast beats a long list of names; and one " +
      "careless glean that damages a field can lose you that " +
      "grower for good.",
    pairsWith: ["community-fridge", "food-preservation", "community-meal"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Find produce sources",
        description:
          "Reach out to farms, orchards, market vendors, and neighbors with overloaded fruit trees. Many are glad to have surplus harvested rather than rot.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Recruit a glean crew",
        description:
          "Build a list of volunteers who can mobilize quickly when produce is ready. Harvest windows are short, so flexibility matters more than numbers.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Arrange transport and storage",
        description:
          "Line up vehicles to move produce and a cool spot to hold it briefly. Coordinate to move food quickly from field to recipients before it spoils.",
        hours: 3,
        skills: ["driving"],
      },
      {
        name: "Set up scheduling and dispatch",
        description:
          "Create a fast way to alert and confirm volunteers when a glean comes up, since growers often give little notice. A group chat or call list works.",
        hours: 2,
        skills: ["organizing"],
        follows: [1],
      },
      {
        name: "Sort out liability and food safety",
        description:
          "Learn your area's Good Samaritan food-donation protections, agree on simple handling rules, and use a basic waiver so growers feel comfortable hosting gleans.",
        hours: 3,
        skills: ["paperwork", "food safety"],
      },
      {
        name: "Build distribution channels",
        description:
          "Line up where gleaned food goes — community fridges, pantries, meal programs, or direct to families — so it never sits unused.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Run gleans and track poundage",
        description:
          "Harvest carefully to protect the site, distribute promptly, and record how much food was rescued. The numbers help recruit volunteers and growers.",
        hours: 4,
        skills: ["gardening", "driving"],
        follows: [0, 2, 3, 5],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "community-mediation",
    name: "Community Mediation & Conflict Resolution Network",
    purpose:
      "Offer free, neutral mediation for neighbor disputes, resolving conflict without courts or police.",
    whoItServes:
      "Neighbors, tenants and landlords, roommates, and community groups in conflict.",
    whatYoullNeed:
      "Trained mediators, a neutral space, and a request process. Mediation is for disputes between willing parties — screen out and refer any situation involving violence, abuse, or danger to the appropriate professional or emergency services.",
    setupHours: 22,
    defaultCategory: "other",
    firstSteps:
      "Talk first with an existing community mediation center or " +
      "trainer — this craft isn't improvised — and before the " +
      "first case, put your screening line in writing: which " +
      "disputes you'll take, and where you refer anything " +
      "involving violence or abuse.",
    commonPitfalls:
      "The dangerous failure is mediating what shouldn't be " +
      "mediated: a 'neighbor dispute' that's really abuse puts " +
      "someone at risk, so screen every intake. And " +
      "confidentiality is the project's whole capital — one " +
      "leaked detail and nobody trusts the service again; look " +
      "after your mediators too, because this work wears people " +
      "down.",
    pairsWith: ["legal-aid-clinic", "tenant-union"],
    learnMore: ["disagree-with-member"],
    tasks: [
      {
        name: "Recruit and train mediators",
        description:
          "Find calm, fair-minded volunteers and get them trained, either through a recognized mediation training or by partnering with an existing community mediation center.",
        hours: 6,
        skills: ["outreach", "facilitation"],
      },
      {
        name: "Set up a request and intake process",
        description:
          "Create a simple way for people to request mediation. During intake, learn the basics from each side and confirm the case is appropriate for mediation.",
        hours: 3,
        skills: ["organizing", "interviewing"],
      },
      {
        name: "Find neutral meeting spaces",
        description:
          "Secure quiet, neutral locations — a library room or community center — where both parties feel safe and on equal footing.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Define the scope and limits",
        description:
          "Decide what you'll mediate (noise, shared spaces, minor disputes) and what you won't. Screen out situations involving violence, abuse, or safety risk and refer those to appropriate professionals.",
        hours: 3,
        skills: ["facilitation", "writing"],
      },
      {
        name: "Establish confidentiality and ground rules",
        description:
          "Set clear rules: confidentiality, voluntary participation, respectful turn-taking, and a mediator who guides but doesn't decide. Put them in writing for participants.",
        hours: 3,
        skills: ["writing"],
      },
      {
        name: "Promote the service",
        description:
          "Let neighbors, housing groups, and local organizations know free mediation exists, so people reach for it before conflicts escalate.",
        hours: 3,
        skills: ["outreach", "graphic design"],
        follows: [1, 3],
      },
      {
        name: "Track outcomes and support mediators",
        description:
          "Note resolution rates (without breaching confidentiality) and debrief mediators regularly. The work is draining, so rotate cases and offer support.",
        hours: 2,
        recurringCadence: "month",
        skills: ["data entry", "facilitation"],
      },
    ],
  },
  {
    id: "reentry-support",
    name: "Reentry Support Network",
    purpose:
      "Help people returning from incarceration secure ID, housing, work, and community, easing a notoriously hard transition.",
    whoItServes:
      "Formerly incarcerated people and their families.",
    whatYoullNeed:
      "Volunteers, partner organizations, and a solid resource directory. Treat people's records and histories as private — lead with respect, follow people's own goals, and refer legal matters to qualified counsel.",
    setupHours: 28,
    defaultCategory: "other",
    firstSteps:
      "Before building anything, sit down with people who have " +
      "come home themselves and with the reentry organizations, " +
      "parole offices, and fair-chance employers already working " +
      "in your area — ask what actually blocks people in the " +
      "first weeks and where your network fits. Line up a " +
      "legal-aid contact or qualified attorney now, so when legal " +
      "questions come up you have somewhere real to send them.",
    commonPitfalls:
      "This project dies when it becomes gatekeeping — volunteers " +
      "deciding who deserves help — or when someone's history " +
      "leaks and costs them a job or an apartment. It also fails " +
      "quietly when enthusiasm outpaces follow-through; a broken " +
      "promise lands harder on someone rebuilding trust than no " +
      "promise at all.",
    pairsWith: ["court-support", "books-to-prisoners"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Build a resource and partner directory",
        description:
          "Map services for ID and documents, housing, employment, healthcare, treatment, and benefits. Identify which employers and landlords are open to people with records.",
        hours: 6,
        skills: ["outreach", "data entry"],
      },
      {
        name: "Recruit and train volunteers",
        description:
          "Find nonjudgmental volunteers and train them in trauma-informed, respectful support. People returning home need partners, not gatekeepers.",
        hours: 5,
        skills: ["outreach", "teaching"],
      },
      {
        name: "Create a welcome and needs intake",
        description:
          "Build a simple, dignified way to learn what each person needs most urgently — often ID, a place to stay, and income — and prioritize from there.",
        hours: 3,
        skills: ["interviewing"],
      },
      {
        name: "Help with documents and benefits",
        description:
          "Assist with replacing ID and Social Security cards, applying for benefits, and other paperwork that's hard to do without an address or internet access.",
        hours: 4,
        recurringCadence: "month",
        skills: ["paperwork"],
      },
      {
        name: "Connect to employment and housing",
        description:
          "Make warm introductions to fair-chance employers and housing options, and help with applications, resumes, and interview prep.",
        hours: 4,
        recurringCadence: "month",
        skills: ["outreach", "writing"],
        follows: [0],
      },
      {
        name: "Offer peer mentorship",
        description:
          "Where possible, pair people with mentors who have lived through reentry themselves. That shared experience builds trust faster than anything.",
        hours: 3,
        recurringCadence: "month",
        skills: ["facilitation"],
      },
      {
        name: "Set privacy and boundary practices",
        description:
          "Handle people's histories with strict confidentiality, never pressure anyone to share more than they want, and route legal questions to qualified attorneys.",
        hours: 3,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "community-wood-bank",
    name: "Community Wood Bank / Heating Assistance",
    purpose:
      "Collect and distribute firewood and coordinate heating help so neighbors stay warm through winter.",
    whoItServes:
      "Low-income and rural households that heat with wood, and elders who can't gather or split their own.",
    whatYoullNeed:
      "A wood source, a processing and storage site, equipment, a trained crew, and a delivery plan. Chainsaws and splitters are dangerous — allow only trained operators, require protective gear, and brief the crew on safety before every session.",
    setupHours: 24,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Start by talking with the households who heat with wood — " +
      "rural elders, families the fuel-assistance office already " +
      "knows — to learn how much they burn and when they run " +
      "short, then call local tree services about where their " +
      "wood goes now. Before any saw starts, decide who owns " +
      "safety: someone experienced enough to train the crew and " +
      "comfortable telling a volunteer no.",
    commonPitfalls:
      "The two ways this hurts people: an untrained volunteer on " +
      "a chainsaw, and delivering green wood that smokes, coats " +
      "chimneys with creosote, and doesn't heat. Cutting in " +
      "October for December means wet wood — the calendar failure " +
      "is as real as the safety one.",
    pairsWith: ["weatherization-brigade", "cooling-warming-center"],
    tasks: [
      {
        name: "Secure a wood source",
        description:
          "Arrange supply from tree services, storm cleanup, downed-tree donations, or sustainably managed lots. Confirm you can legally take and process it.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Find a processing and storage site",
        description:
          "Secure a yard or lot where wood can be cut, split, stacked, and seasoned. You need room to keep this season's supply dry and next season's drying.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Get equipment and safety gear",
        description:
          "Obtain or borrow a log splitter, chainsaws, and protective gear (chaps, eye and ear protection, gloves). Keep tools maintained and a first-aid kit on site.",
        hours: 4,
        skills: ["driving", "tool repair"],
      },
      {
        name: "Recruit and train a wood crew",
        description:
          "Build a crew and ensure that only properly trained people operate chainsaws and splitters. Run a safety briefing before every work day.",
        hours: 4,
        skills: ["teaching", "outreach"],
      },
      {
        name: "Build a request and delivery system",
        description:
          "Create a way for households to request wood and arrange delivery, since many recipients are elderly or without trucks. Confirm safe stacking near the home.",
        hours: 3,
        skills: ["organizing", "driving"],
      },
      {
        name: "Set distribution criteria",
        description:
          "Decide how much wood each household receives and prioritize those most at risk in cold weather. Keep the process simple and low-barrier.",
        hours: 2,
        skills: ["facilitation"],
      },
      {
        name: "Schedule work days and seasoning",
        description:
          "Plan cutting and splitting well ahead of winter, because green wood must dry for months before it burns safely. Track what's seasoned and ready.",
        hours: 3,
        recurringCadence: "cycle",
        skills: ["organizing"],
        follows: [0, 1, 2, 3],
      },
    ],
  },
  {
    id: "community-wifi-mesh",
    name: "Free Community WiFi / Mesh Network",
    purpose:
      "Provide free internet access where it's unaffordable or unavailable.",
    whoItServes:
      "Low-income households, students, job seekers, and anyone cut off from reliable internet.",
    whatYoullNeed:
      "A backhaul internet connection, routers/mesh nodes, technical volunteers, and host sites.",
    setupHours: 32,
    defaultCategory: "tech",
    firstSteps:
      "Walk the blocks you want to cover and knock on doors — " +
      "talk with the households without service about what they'd " +
      "actually use it for, and with the people whose rooftops " +
      "and upper windows could host a node. Before buying " +
      "hardware, have the bandwidth conversation: find the " +
      "business, library, or ISP willing to share a line, and " +
      "confirm in writing that redistribution is allowed.",
    commonPitfalls:
      "Mesh networks usually die of maintenance, not construction " +
      "— the founding techie moves away and nobody else can log " +
      "into the routers, so document everything and train a " +
      "second person from day one. The other quiet failure is " +
      "building where the signal reaches easily instead of where " +
      "people actually lack access.",
    pairsWith: ["digital-literacy", "emergency-preparedness"],
    tasks: [
      {
        name: "Map coverage needs and gaps",
        description:
          "Identify which blocks lack affordable access and where signal could reach. Note buildings with line-of-sight and willing hosts. This shapes the whole design.",
        hours: 4,
        skills: ["tech support"],
      },
      {
        name: "Secure a backhaul internet connection",
        description:
          "Arrange a source of bandwidth to share — a donated business line, an ISP partnership, or a community-network uplink. Confirm the terms allow redistribution.",
        hours: 5,
        skills: ["outreach", "tech support"],
      },
      {
        name: "Recruit technical volunteers",
        description:
          "Find people comfortable with networking who can configure routers and troubleshoot. You only need a couple to start, plus willing learners.",
        hours: 3,
        skills: ["outreach", "tech support"],
      },
      {
        name: "Source and configure equipment",
        description:
          "Gather routers, mesh nodes, and antennas through donations or a small budget. Configure them for an open or simply-shared network and test coverage.",
        hours: 10,
        skills: ["tech support"],
        follows: [2],
      },
      {
        name: "Find host sites for nodes",
        description:
          "Place nodes where they extend reach — rooftops, upper windows, and porches with power and permission. Get written okay from each host and cover any tiny power cost.",
        hours: 5,
        skills: ["outreach"],
        follows: [0],
      },
      {
        name: "Set acceptable-use and privacy norms",
        description:
          "Post simple rules, avoid logging users' activity, and be clear that an open network isn't private. Point users to basic safety practices like HTTPS and VPNs.",
        hours: 2,
        skills: ["writing"],
      },
      {
        name: "Maintain and expand the network",
        description:
          "Check nodes regularly, replace failed hardware, and add coverage as new hosts join. Document the setup so others can help maintain it.",
        hours: 3,
        recurringCadence: "month",
        skills: ["tech support"],
        follows: [3, 4],
      },
    ],
  },
  {
    id: "mental-health-peer-support",
    name: "Mental Health Peer Support Circle",
    purpose:
      "Offer a safe, regular, peer-led space for people to share and support one another — a complement to, not a replacement for, professional care.",
    whoItServes:
      "Anyone navigating stress, isolation, grief, or mental health challenges who wants peer connection.",
    whatYoullNeed:
      "Trained facilitators, a private space, and clear boundaries with a crisis-referral plan. Peer support complements professional mental health care — it doesn't replace it. Facilitators are not therapists, and there must always be a clear plan to connect anyone in crisis to qualified professional or emergency resources.",
    setupHours: 21,
    defaultCategory: "emotional_support",
    firstSteps:
      "Your first conversations are with the people who might " +
      "facilitate and with local mental health providers — a " +
      "clinic, crisis line, or counselor who agrees to be your " +
      "referral path before the first circle ever meets. Don't " +
      "open the doors until facilitators are trained and everyone " +
      "can say plainly what the circle is and isn't.",
    commonPitfalls:
      "The dangerous failure is drift: a warm circle slowly " +
      "becomes the only support someone has, facilitators start " +
      "playing therapist, and there's no plan for the night " +
      "someone is in real crisis. The quieter one is facilitator " +
      "burnout — if the people holding space have no support of " +
      "their own, the circle folds within a year.",
    pairsWith: ["neighborhood-care-network", "disability-support-network", "harm-reduction-supplies"],
    learnMore: ["who-sees-what", "lurking-ok"],
    tasks: [
      {
        name: "Recruit and train facilitators",
        description:
          "Find warm, steady people and have them complete peer-support or active-listening training. Be clear that facilitators are peers who hold space, not clinicians who diagnose or treat.",
        hours: 5,
        skills: ["facilitation", "outreach"],
      },
      {
        name: "Define the circle's scope and boundaries",
        description:
          "Establish that this is peer support, not therapy or crisis care. Write down what the circle is for and what's outside its role, so expectations are clear to everyone.",
        hours: 3,
        skills: ["writing"],
      },
      {
        name: "Build a crisis referral and escalation plan",
        description:
          "Prepare clear steps for when someone is in distress beyond peer support: how to gently connect them to professional help or crisis services, and when to involve emergency support. Keep current local and national resources on hand.",
        hours: 3,
        skills: ["writing"],
        follows: [1],
      },
      {
        name: "Find a private, safe space",
        description:
          "Secure a quiet, comfortable, confidential room where people can speak freely. Consistency of place helps people feel safe to return.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Set confidentiality and group ground rules",
        description:
          "Agree on confidentiality, no advice-giving unless asked, no interrupting, and the right to pass. Share these at the start of every session.",
        hours: 3,
        skills: ["facilitation", "writing"],
      },
      {
        name: "Schedule and promote sessions",
        description:
          "Pick a steady time, keep groups a manageable size, and promote it in a way that reduces stigma. Make clear it's free and open.",
        hours: 3,
        skills: ["outreach", "organizing"],
        follows: [0, 3],
      },
      {
        name: "Support facilitators and prevent burnout",
        description:
          "Hold regular check-ins for facilitators to debrief and decompress. Rotate who leads, and make sure they have their own support too.",
        hours: 2,
        recurringCadence: "month",
        skills: ["facilitation"],
      },
    ],
  },
  {
    id: "community-cleanup",
    name: "Community Cleanup & Green Space Restoration",
    purpose:
      "Clear litter, restore neglected lots and parks, and create shared green space.",
    whoItServes:
      "The whole neighborhood — cleaner, safer, greener space benefits everyone.",
    whatYoullNeed:
      "Volunteers, supplies, site permissions, and a disposal plan. Neglected sites can hold real hazards — never pick up needles or unknown chemicals by hand; use tools and a sharps container, and dispose of hazardous finds under local rules.",
    setupHours: 10,
    defaultCategory: "infrastructure",
    suggestsWorkDays: true,
    firstSteps:
      "Walk the neighborhood with the people who live closest to " +
      "the neglected spots — they know which lots matter, who " +
      "owns them, and what's been tried before — and check " +
      "whether the city or a friends-of-the-park group already " +
      "runs cleanups you can plug into. Sort out ownership, " +
      "permission, and where the trash goes before you pick a " +
      "date.",
    commonPitfalls:
      "Cleanups fail in two ways: bags of collected trash sit on " +
      "the curb for weeks because nobody arranged disposal, and a " +
      "beautifully cleared lot is waist-high again by fall " +
      "because there was no plan past the one big day. And a " +
      "volunteer reaching bare-handed for a needle can turn a " +
      "good morning into a hospital visit.",
    pairsWith: ["community-garden", "community-composting"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Identify and prioritize sites",
        description:
          "Walk the area and list spots that need attention — trash-heavy corners, overgrown lots, neglected parks. Prioritize by impact and feasibility.",
        hours: 1.5,
      },
      {
        name: "Get permissions and a disposal plan",
        description:
          "Confirm who owns each site and get permission. Arrange for trash and debris removal in advance — coordinate a dumpster or a city pickup so bags don't just pile up.",
        hours: 2,
        skills: ["outreach", "paperwork"],
        follows: [0],
      },
      {
        name: "Gather supplies and safety gear",
        description:
          "Collect gloves, bags, grabbers, and high-visibility vests. Include a rigid sharps container and a plan for any hazardous items found.",
        hours: 1.5,
        skills: ["driving"],
      },
      {
        name: "Recruit and organize volunteers",
        description:
          "Spread the word and sign people up. Assign team leads and zones so the day is organized rather than chaotic.",
        hours: 2,
        skills: ["outreach", "organizing"],
      },
      {
        name: "Run the cleanup or restoration day",
        description:
          "Hold the event, keep teams safe and hydrated, and celebrate the visible result together. Take before-and-after photos to motivate future turnout.",
        hours: 3,
        skills: ["organizing", "photography"],
        follows: [1, 2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "free-tax-prep",
    name: "Free Tax Prep & Financial Empowerment Clinic",
    purpose:
      "Help low-income neighbors file taxes for free and claim the credits and refunds they're owed.",
    whoItServes:
      "Low-income workers, families eligible for tax credits, elders, and students.",
    whatYoullNeed:
      "Trained and certified preparers, a space, computers, and a scheduling system. Tax returns must be prepared by certified volunteers through a recognized program — this clinic helps with standard filings, not complex situations that need a tax professional.",
    setupHours: 28,
    defaultCategory: "skilled_labor",
    suggestsWorkDays: true,
    firstSteps:
      "Your first call is to an established free-filing program " +
      "like VITA — talk with their coordinator about " +
      "certification timelines, software, and what a new site " +
      "needs, because you shouldn't run this alone. Then talk " +
      "with the neighbors you hope to serve about when they can " +
      "actually come and what's kept them from filing before.",
    commonPitfalls:
      "One wrong return can cost a family their refund or trigger " +
      "an audit — that's why uncertified volunteers preparing " +
      "taxes is the line this project must never cross. The " +
      "gentler failures: launching in March when certification " +
      "takes months, and someone making the bus trip only to be " +
      "turned away over a document nobody told them to bring.",
    pairsWith: ["legal-aid-clinic", "solidarity-fund"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Get preparers trained and certified",
        description:
          "Have volunteers complete a recognized free-tax-prep certification (such as the IRS VITA program) so returns are accurate and properly authorized. This is non-negotiable.",
        hours: 10,
        recurringCadence: "cycle",
        skills: ["accounting"],
      },
      {
        name: "Partner with a recognized free-filing program",
        description:
          "Affiliate with an established program for software, support, and credibility. They provide the filing tools and quality checks you shouldn't build alone.",
        hours: 4,
        skills: ["outreach", "paperwork"],
      },
      {
        name: "Set up a space and equipment",
        description:
          "Secure a venue with computers, reliable internet, and enough privacy for people to share sensitive financial information comfortably.",
        hours: 3,
        skills: ["tech support"],
      },
      {
        name: "Build an appointment and intake system",
        description:
          "Create appointments and a clear checklist of documents people must bring (ID, income forms, prior return). This avoids wasted trips and long waits.",
        hours: 3,
        skills: ["organizing", "data entry"],
      },
      {
        name: "Promote to eligible neighbors",
        description:
          "Get the word out, emphasizing that filing can unlock refunds and credits many people miss. Reach workers, families, and elders who often qualify.",
        hours: 3,
        recurringCadence: "cycle",
        skills: ["outreach", "graphic design"],
        follows: [3],
      },
      {
        name: "Ensure data security and privacy",
        description:
          "Protect every scrap of personal and financial data: secure devices, no unnecessary copies, locked storage, and a clear retention-and-destruction policy.",
        hours: 3,
        skills: ["tech support"],
      },
      {
        name: "Offer financial empowerment follow-up",
        description:
          "Where wanted, connect people to budgeting help, safe banking, and benefits screening. Keep it optional and refer complex situations to qualified professionals.",
        hours: 2,
        skills: ["accounting"],
      },
    ],
  },
  {
    id: "community-market",
    name: "Community Market / Free Farm Stand",
    purpose:
      "Run a regular free or pay-what-you-can stand distributing fresh produce and staples.",
    whoItServes:
      "Food-insecure neighbors and people in areas without affordable fresh food.",
    whatYoullNeed:
      "A produce supply, a stand or location, volunteers, and a regular schedule.",
    setupHours: 15,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Start with the supply conversations — visit farms, " +
      "grocers, and community gardens to learn what surplus " +
      "actually exists and on what rhythm — and talk with " +
      "neighbors in the area you'd serve about where they already " +
      "walk and what food they'd actually take home. Pick the " +
      "spot with the people who'll use it, not for them.",
    commonPitfalls:
      "A stand that shows up erratically teaches people to stop " +
      "counting on it — consistency matters more than abundance. " +
      "The other failures: supply that dries up after the first " +
      "enthusiastic month, and anything at the table (forms, " +
      "questions, sorting people) that makes taking food feel " +
      "like applying for it.",
    pairsWith: ["gleaning-network", "bulk-buying-coop", "community-garden"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Secure produce and goods supply",
        description:
          "Source food through gleaning, community gardens, farm and grocer donations, and bulk buys. Aim for variety and reliability so the stand isn't bare.",
        hours: 3,
        skills: ["outreach", "driving"],
      },
      {
        name: "Find a location and stand setup",
        description:
          "Pick a visible, accessible spot with permission — a park edge, parking lot, or transit stop. Arrange tables, shade, and signage.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Decide the model",
        description:
          "Choose fully free, pay-what-you-can, or a mix. Whatever you pick, make sure no one is ever turned away for inability to pay.",
        hours: 1,
        skills: ["facilitation"],
      },
      {
        name: "Set up display, storage, and food safety",
        description:
          "Keep produce cool and presentable, handle food safely, and have coolers or shade for hot days. Discard anything spoiled.",
        hours: 2,
        skills: ["food safety"],
        follows: [1],
      },
      {
        name: "Recruit and schedule volunteers",
        description:
          "Line up people to pick up produce, set up, staff the stand, and pack down. Assign clear roles for each market.",
        hours: 2,
        skills: ["organizing", "outreach"],
      },
      {
        name: "Promote and set a regular schedule",
        description:
          "Pick a consistent day and time and publicize it widely. Predictability is what turns a stand into a dependable resource.",
        hours: 2,
        skills: ["outreach", "graphic design"],
        follows: [1, 2],
      },
      {
        name: "Run the stand and handle leftovers",
        description:
          "Set up, distribute warmly with no judgment, and route any leftover produce to fridges, pantries, or meal programs so nothing is wasted.",
        hours: 3,
        skills: ["organizing"],
        follows: [0, 3, 4],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "welcome-wagon",
    name: "Welcome Wagon: New Neighbor & New Parent Support",
    purpose:
      "Greet newcomers and new parents with practical help, local info, and a real welcome into the community.",
    whoItServes:
      "People who've just moved in, new and expecting parents, and anyone needing a friendly start.",
    whatYoullNeed:
      "Volunteers, info packets, donated welcome items, and a referral system.",
    setupHours: 10,
    defaultCategory: "emotional_support",
    firstSteps:
      "Talk first with the people who meet newcomers before you " +
      "do — landlords, school front offices, clinics, midwives " +
      "and pediatric nurses — about how they'd refer someone with " +
      "consent. Then ask a few recent arrivals and new parents " +
      "what would have actually helped in their first month, and " +
      "build the packet and the basket around their answers.",
    commonPitfalls:
      "The way this goes wrong is by feeling like surveillance — " +
      "showing up uninvited at a stranger's door, or passing " +
      "along names without consent, turns a welcome into an " +
      "intrusion. It also fades quietly when the founding " +
      "greeters burn out and newcomers go unnoticed for months at " +
      "a stretch.",
    pairsWith: ["newcomer-translation-network", "diaper-hygiene-bank", "neighborhood-care-network"],
    learnMore: ["invite-someone"],
    tasks: [
      {
        name: "Decide who you'll welcome and how",
        description:
          "Define your focus — new residents, new parents, or both — and the form the welcome takes (a visit, a basket, a call). Keep it opt-in and never intrusive.",
        hours: 1,
        skills: ["facilitation"],
      },
      {
        name: "Build a local info packet",
        description:
          "Assemble a clear guide to local services, transit, schools, healthcare, and your mutual aid program. Offer it in the languages spoken in your area.",
        hours: 3,
        skills: ["writing", "translation"],
        follows: [0],
      },
      {
        name: "Assemble welcome baskets",
        description:
          "Put together useful items — pantry basics, household goods, and for new parents, a few baby essentials or a home-cooked meal. Source through donations.",
        hours: 2,
        recurringCadence: "month",
        skills: ["outreach", "organizing"],
        follows: [0],
      },
      {
        name: "Recruit and train greeters",
        description:
          "Find friendly volunteers and coach them to be warm and respectful, to read whether someone wants connection, and to never pressure or pry.",
        hours: 2,
        skills: ["outreach", "teaching"],
      },
      {
        name: "Set up a referral and sign-up system",
        description:
          "Create simple ways for people to be referred or to opt in — through landlords, clinics, schools, or a sign-up form. Respect privacy throughout.",
        hours: 2,
        skills: ["organizing", "data entry"],
        follows: [0],
      },
    ],
  },
  {
    id: "library-of-things",
    name: "Library of Things",
    purpose:
      "Lend household and event items people rarely need to own — kitchen gear, party and camping supplies, baby equipment, projectors, and more.",
    whoItServes:
      "Anyone; it saves money, cuts clutter, and reduces waste.",
    whatYoullNeed:
      "Storage, donated items, a catalog and checkout system, and a couple of librarians.",
    setupHours: 21,
    defaultCategory: "infrastructure",
    firstSteps:
      "Before collecting a single item, ask members what they'd " +
      "actually borrow — that survey is the project's foundation " +
      "— and talk with the public library or a community center " +
      "about hosting, since a trusted institution solves your " +
      "storage and credibility problems at once. Recruit your two " +
      "librarians before the donations arrive, not after.",
    commonPitfalls:
      "Libraries of things die of clutter: saying yes to every " +
      "donation fills the room with broken breadmakers nobody " +
      "wants, while the pressure washer everyone asked for is " +
      "still missing. The other killer is unpredictable hours — " +
      "if people can't count on when to pick up and return, they " +
      "quietly go back to buying.",
    pairsWith: ["tool-lending-library", "toy-library", "free-store"],
    learnMore: ["confirm-exchange"],
    tasks: [
      {
        name: "Survey what the community wants to borrow",
        description:
          "Ask members what they'd use but hate to buy — folding tables, a punch bowl, a tent, a carpet cleaner, a baby stroller. The answers set your starting inventory.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Find storage and open hours",
        description:
          "Secure a closet, room, or container to hold items, and set predictable pickup/return hours so borrowing is easy.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Collect, clean, and test items",
        description:
          "Gather donations, then clean, test, and check each item for safety. Set aside anything broken, recalled, or unhygienic.",
        hours: 5,
        skills: ["driving"],
        follows: [0, 1],
      },
      {
        name: "Catalog and photograph inventory",
        description:
          "Log each item with a photo and its condition in a spreadsheet or lending app. Number items so they're easy to track in and out.",
        hours: 4,
        skills: ["data entry", "photography"],
        follows: [2],
      },
      {
        name: "Write borrowing rules and a trust policy",
        description:
          "Set loan length, quantity limits, and a forgiving return policy. Keep it built on trust rather than fees, and note items needing extra care or cleaning.",
        hours: 2,
        skills: ["writing"],
      },
      {
        name: "Set up checkout and train librarians",
        description:
          "Create a simple sign-out (name, contact, item, due date) with a quick condition photo. Walk volunteers through the catalog and process.",
        hours: 3,
        skills: ["data entry", "teaching"],
        follows: [3, 4],
      },
      {
        name: "Maintain, sanitize, and grow the collection",
        description:
          "Clean and inspect returned items, repair what you can, and add the most-requested things over time.",
        hours: 2,
        skills: ["repair"],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "laundry-shower-access",
    name: "Laundry & Shower Access Program",
    purpose:
      "Provide free laundry and shower access so people can stay clean with dignity.",
    whoItServes:
      "Unhoused neighbors, people without working facilities, and low-income families.",
    whatYoullNeed:
      "Access to machines and showers (a partner site or mobile unit), supplies, and volunteers. Guests' dignity and privacy come first — require no personal information to use the service, keep shower areas private and secure, and follow local health rules for shared or mobile facilities.",
    setupHours: 19,
    defaultCategory: "infrastructure",
    suggestsWorkDays: true,
    firstSteps:
      "Start with two sets of conversations: with unhoused " +
      "neighbors and the outreach workers who know them, about " +
      "which hours and locations would actually work — and with a " +
      "laundromat owner, gym, or faith site about hosting. That " +
      "host conversation is delicate; be honest about who's " +
      "coming and settle privacy, cleaning, and scheduling " +
      "expectations before the first guest arrives.",
    commonPitfalls:
      "This program dies when the host relationship sours — one " +
      "bad interaction with no protocol behind it, and the space " +
      "is gone — or when hours shift so often that people cross " +
      "town to find a locked door. And every piece of paperwork " +
      "you require at the door turns away someone who needed a " +
      "shower more than you needed their name.",
    pairsWith: ["free-haircut", "cooling-warming-center", "diaper-hygiene-bank"],
    tasks: [
      {
        name: "Secure laundry and shower access",
        description:
          "Partner with a laundromat, gym, faith site, recreation center, or arrange a mobile unit. Confirm dependable times and that the space offers privacy.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Source supplies",
        description:
          "Gather detergent, clean towels, soap, shampoo, and other toiletries through donations or a small budget. Include some clean clothing if you can.",
        hours: 3,
        skills: ["outreach", "driving"],
      },
      {
        name: "Set up a sign-up and time-slot system",
        description:
          "Create a fair way to claim laundry loads and shower slots so wait times stay reasonable and everyone gets a turn.",
        hours: 3,
        skills: ["organizing", "data entry"],
        follows: [0],
      },
      {
        name: "Establish hygiene and safety protocols",
        description:
          "Set cleaning routines between users, ensure private and secure shower areas, and protect everyone's dignity and safety throughout.",
        hours: 3,
        skills: ["writing"],
        follows: [0],
      },
      {
        name: "Recruit and train volunteers",
        description:
          "Find volunteers to run intake, manage supplies, and clean between uses. Train them to treat every guest with warmth and respect.",
        hours: 3,
        skills: ["outreach", "teaching"],
        follows: [3],
      },
      {
        name: "Set a schedule and spread the word",
        description:
          "Pick consistent hours and let outreach workers, shelters, and street-connected neighbors know when and where the service runs.",
        hours: 3,
        skills: ["outreach"],
        follows: [0],
      },
    ],
  },
  {
    id: "voter-registration",
    name: "Voter Registration & Civic Engagement Drive",
    purpose:
      "Register voters and help people take part in elections and local decisions — strictly nonpartisan.",
    whoItServes:
      "Eligible residents, especially those historically underrepresented at the polls.",
    whatYoullNeed:
      "Trained volunteers, registration materials, accurate rules, and good locations. Keep the drive strictly nonpartisan and follow all election and registration laws precisely — provide accurate information only and never advocate for a party or candidate.",
    setupHours: 16,
    defaultCategory: "organizing",
    firstSteps:
      "Before anyone tables, talk with your local election office " +
      "— they'll tell you exactly what drives may and may not do, " +
      "and some areas require training or registration first. " +
      "Then connect with the League of Women Voters or another " +
      "established nonpartisan group; borrowing their materials " +
      "and experience beats learning election law by trial and " +
      "error.",
    commonPitfalls:
      "The unforgivable failures are legal ones: a stack of " +
      "completed forms forgotten in someone's trunk past the " +
      "deadline disenfranchises every person who trusted you, and " +
      "one volunteer talking up a candidate can taint the whole " +
      "drive. The subtler miss is handing out registration cards " +
      "without ever mentioning where or how to actually vote.",
    pairsWith: ["newcomer-translation-network", "legal-aid-clinic"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Learn the rules for registration drives",
        description:
          "Research your area's laws on registering voters: deadlines, what volunteers may and may not do, how forms must be handled, and ID requirements. Following these exactly is essential.",
        hours: 3,
        skills: ["paperwork"],
      },
      {
        name: "Train nonpartisan volunteers",
        description:
          "Coach volunteers to help everyone register regardless of views, and to never promote a party or candidate. Nonpartisanship protects the drive and the community's trust.",
        hours: 3,
        skills: ["teaching"],
        follows: [0],
      },
      {
        name: "Gather materials and accurate information",
        description:
          "Collect registration forms and verified, current info on deadlines, ID rules, polling places, and mail-in options. Bad info does more harm than none.",
        hours: 2,
        skills: ["writing"],
        follows: [0],
      },
      {
        name: "Pick high-traffic locations and events",
        description:
          "Set up where eligible residents already gather — markets, transit hubs, campuses, community events — with any required permission to table.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Run registration tabling",
        description:
          "Staff the table, help people register accurately, and submit forms promptly within legal deadlines. Keep the tone welcoming and informative.",
        hours: 4,
        skills: ["outreach"],
        follows: [1, 2, 3],
        recurringCadence: "event",
      },
      {
        name: "Help with the next steps",
        description:
          "Beyond registering, help people know how, when, and where to vote, including mail-in options and rides to the polls. Registration alone isn't participation.",
        hours: 2,
        skills: ["outreach"],
      },
    ],
  },
  {
    id: "health-navigation",
    name: "Community Health Navigation Program",
    purpose:
      "Help neighbors find and access healthcare — clinics, insurance, prescriptions, and appointments.",
    whoItServes:
      "Uninsured and underinsured people, elders, newcomers, and anyone lost in the health system.",
    whatYoullNeed:
      "Trained navigators, a resource directory, provider partnerships, and a request system. Navigators connect people to care — they don't provide medical advice or diagnosis. Refer all clinical questions to qualified healthcare professionals.",
    setupHours: 26,
    defaultCategory: "other",
    firstSteps:
      "Start by visiting the free and sliding-scale clinics " +
      "you'll refer to — introduce yourselves, ask which " +
      "referrals help them and which swamp them, and let those " +
      "conversations seed your directory. Settle the boundary " +
      "before the first request comes in: navigators handle " +
      "logistics and paperwork, every clinical question goes to a " +
      "professional, so know exactly which nurse line or clinic " +
      "you'll hand those to.",
    commonPitfalls:
      "The sharp edge is a well-meaning navigator sliding into " +
      "medical advice — a casual 'that doesn't sound serious' can " +
      "cost someone weeks of needed care. This also fails when " +
      "the directory quietly goes stale, sending people to " +
      "clinics that closed or programs that ended; a wrong number " +
      "costs someone who was already on their last try.",
    pairsWith: ["rides-transportation", "newcomer-translation-network", "mental-health-peer-support"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Build a healthcare resource directory",
        description:
          "Compile free and low-cost clinics, sliding-scale providers, prescription-assistance programs, dental and vision options, and mental health services. Keep it current.",
        hours: 6,
        skills: ["data entry", "outreach"],
      },
      {
        name: "Recruit and train navigators",
        description:
          "Find volunteers and train them to connect people to care — not to give medical advice. Their job is guidance and logistics, with clinical questions referred to professionals.",
        hours: 5,
        skills: ["outreach", "teaching"],
      },
      {
        name: "Set up a request and intake system",
        description:
          "Create a private, low-barrier way for people to ask for help and describe their situation, with phone and in-person options, not just online.",
        hours: 3,
        skills: ["organizing"],
      },
      {
        name: "Help with insurance and enrollment",
        description:
          "Assist people in understanding and applying for coverage they qualify for (such as Medicaid or marketplace plans) and gathering the needed documents.",
        hours: 4,
        recurringCadence: "month",
        skills: ["paperwork"],
        follows: [2],
      },
      {
        name: "Offer appointment and prescription support",
        description:
          "Help schedule appointments, set reminders, navigate prescription costs, and link to the rides program for transportation to care.",
        hours: 3,
        recurringCadence: "month",
        skills: ["organizing"],
        follows: [2],
      },
      {
        name: "Set privacy practices for health information",
        description:
          "Treat all health details as highly sensitive: collect the minimum, store it securely, and never share without consent. Train navigators on confidentiality.",
        hours: 2,
        skills: ["writing"],
      },
      {
        name: "Partner with clinics and providers",
        description:
          "Build relationships with local clinics and providers for smoother referrals and to learn about new low-cost services as they open.",
        hours: 3,
        skills: ["outreach"],
      },
    ],
  },
  {
    id: "toy-library",
    name: "Toy Library & Play Resource Lending",
    purpose:
      "Lend toys, games, and play equipment so families can access variety without buying.",
    whoItServes:
      "Families with young children, especially on tight budgets; it also cuts waste and clutter.",
    whatYoullNeed:
      "Storage, donated toys, a catalog and checkout, cleaning supplies, and librarians.",
    setupHours: 10,
    defaultCategory: "childcare",
    firstSteps:
      "Talk with the families you hope to serve — at daycare " +
      "pickup, a storytime, a playgroup — about which toys their " +
      "kids outgrow fastest and which hours they could actually " +
      "make, then ask a community center, church, or branch " +
      "library about a shelf or a room. Line up a childcare-savvy " +
      "volunteer to own safety checks before donations start " +
      "arriving.",
    commonPitfalls:
      "Toy libraries fail on safety and on pieces: one recalled " +
      "toy or choking hazard that slips through breaks families' " +
      "trust for good, and puzzles that come back short a piece " +
      "make the whole collection feel junky within months. Strict " +
      "inspection and counted bags are the whole game.",
    pairsWith: ["library-of-things", "childcare-collective", "school-supply-program"],
    tasks: [
      {
        name: "Find storage and open hours",
        description:
          "Secure shelving in a community center, library, or shared space, and set predictable pickup and return hours families can plan around.",
        hours: 1.5,
        skills: ["outreach"],
      },
      {
        name: "Collect, clean, and safety-check toys",
        description:
          "Gather donations, then clean and inspect each toy. Check for recalls, broken parts, and choking hazards, and set aside anything unsafe for young children.",
        hours: 3.5,
        skills: ["driving", "childcare"],
        follows: [0],
      },
      {
        name: "Catalog and bag with all pieces",
        description:
          "Log each toy with a photo and age range, and bag multi-piece sets with a count so nothing goes missing. Number items for easy tracking.",
        hours: 2,
        skills: ["data entry", "photography"],
        follows: [1],
      },
      {
        name: "Write borrowing rules",
        description:
          "Set loan length, how many toys at once, and a gentle return/missing-pieces policy. Keep it trust-based and forgiving.",
        hours: 1,
        skills: ["writing"],
      },
      {
        name: "Set up checkout and train librarians",
        description:
          "Create a simple sign-out (name, contact, item, due date) and walk volunteers through the catalog, the cleaning routine, and the rules.",
        hours: 2,
        skills: ["data entry", "teaching"],
        follows: [2, 3],
      },
    ],
  },
  {
    id: "food-preservation",
    name: "Food Preservation & Canning Collective",
    purpose:
      "Teach and do group canning and preserving so seasonal surplus lasts and less food is wasted.",
    whoItServes:
      "Gardeners, gleaners, and families wanting to stretch food through the year.",
    whatYoullNeed:
      "A kitchen, canning and preserving equipment, knowledgeable leads, and produce. Home preservation carries real food-safety risks, including botulism, when done incorrectly — always follow current, tested guidelines from a reputable source and never improvise processing times or methods.",
    setupHours: 18,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Find your knowledge before your kitchen: call the local " +
      "extension service or a certified master food preserver and " +
      "ask them to train your leads or review your plans, and " +
      "talk with gardeners and gleaners about which surplus " +
      "actually peaks when. Book the kitchen around the harvest " +
      "calendar, not the other way around.",
    commonPitfalls:
      "The failure that matters is invisible: a jar sealed with " +
      "an improvised method or a grandmother's untested recipe " +
      "can carry botulism and look perfectly fine on the shelf. " +
      "The ordinary failure is timing — tomatoes ripen on their " +
      "own schedule, and a collective that holds its first " +
      "session in November preserves nothing.",
    pairsWith: ["gleaning-network", "community-garden", "community-fridge"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Secure a suitable kitchen",
        description:
          "Find a kitchen with stovetops, counter space, and water for processing and cleanup. A church hall, community center, or commercial kitchen works well.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Learn safe preservation methods",
        description:
          "Have your leads study tested, research-based methods from a recognized source (such as a university extension service). Improper canning can cause serious illness, so always follow tested recipes and processing times exactly.",
        hours: 4,
        skills: ["food safety", "cooking"],
      },
      {
        name: "Gather equipment and jars",
        description:
          "Collect water-bath and/or pressure canners, jars, lids, and tools through donations or a small budget. Check that pressure canners are in safe working order.",
        hours: 3,
        skills: ["outreach", "driving"],
      },
      {
        name: "Source produce",
        description:
          "Bring in seasonal surplus from gleaning, gardens, farms, or bulk buys. Time sessions to when produce is abundant and cheap.",
        hours: 2,
        recurringCadence: "cycle",
        skills: ["outreach"],
      },
      {
        name: "Plan group canning sessions",
        description:
          "Pick recipes suited to the produce and the group's skill level, and organize stations so the work flows safely and efficiently.",
        hours: 2,
        recurringCadence: "session",
        skills: ["cooking", "organizing"],
        follows: [1, 3],
      },
      {
        name: "Teach and run sessions safely",
        description:
          "Lead the group through the process, enforcing safe handling, correct processing times, and proper sealing. Make it a teaching session so skills spread.",
        hours: 4,
        skills: ["cooking", "teaching"],
        follows: [0, 2, 4],
        recurringCadence: "session",
      },
      {
        name: "Share preserved food and track",
        description:
          "Divide the preserved goods among participants and projects like the fridge or pantry. Label every jar with contents and date, and note what worked for next time.",
        hours: 1,
        recurringCadence: "session",
        skills: ["organizing"],
        follows: [5],
      },
    ],
  },
  {
    id: "free-haircut",
    name: "Free Haircut & Personal Grooming Days",
    purpose:
      "Offer free haircuts and grooming to restore dignity, confidence, and a fresh start.",
    whoItServes:
      "Unhoused neighbors, job seekers, low-income families, and elders.",
    whatYoullNeed:
      "Volunteer licensed stylists and barbers, a space, supplies, and sanitation.",
    setupHours: 10,
    defaultCategory: "skilled_labor",
    suggestsWorkDays: true,
    firstSteps:
      "Start with two conversations: one with a licensed stylist " +
      "or barber willing to bring a colleague, and one with the " +
      "people you hope to serve — a shelter, day center, or " +
      "workforce program can tell you which days and settings " +
      "would actually feel comfortable. Once a stylist and a host " +
      "site both say yes, the rest is supplies and scheduling.",
    commonPitfalls:
      "This project stumbles when it feels like a charity line " +
      "instead of a salon — rushed cuts, no say in the style, " +
      "cameras out for social media. Ask each person what they " +
      "want, skip the photos unless they offer, and never let " +
      "unlicensed volunteers cut to stretch capacity; one hygiene " +
      "problem can end the whole program.",
    pairsWith: ["laundry-shower-access", "reentry-support"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Recruit licensed stylists and barbers",
        description:
          "Find professionals willing to volunteer their skills. Licensed practitioners ensure safe, quality service and proper sanitation.",
        hours: 2.5,
        skills: ["outreach"],
      },
      {
        name: "Find a space with sanitation",
        description:
          "Secure a venue with water access, good lighting, and cleanable surfaces — a community center, salon after hours, or faith site.",
        hours: 1.5,
        skills: ["outreach"],
      },
      {
        name: "Source equipment and supplies",
        description:
          "Gather clippers, scissors, capes, combs, mirrors, and disposables. Include grooming extras like razors and toiletries to send home.",
        hours: 2,
        skills: ["outreach", "driving"],
      },
      {
        name: "Set up sanitation and licensing compliance",
        description:
          "Establish tool sterilization between clients and follow local rules for offering haircuts to the public. Cleanliness protects everyone.",
        hours: 1.5,
        skills: ["paperwork"],
        follows: [1],
      },
      {
        name: "Run grooming days",
        description:
          "Host the event, keep the atmosphere warm and respectful, and treat each person as a valued guest rather than a recipient of charity.",
        hours: 2.5,
        skills: ["organizing"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "mutual-aid-moving-crew",
    name: "Mutual Aid Moving Crew",
    purpose:
      "Help people move who can't afford movers — those leaving unsafe situations, facing eviction, or downsizing.",
    whoItServes:
      "Low-income neighbors, people fleeing unsafe homes, elders, and disabled neighbors.",
    whatYoullNeed:
      "Volunteers with vehicles and strength, moving supplies, and clear safety practices. For anyone leaving an unsafe situation, keep the new address, dates, and details strictly confidential, and follow that person's lead on timing and safety.",
    setupHours: 14,
    defaultCategory: "transport",
    suggestsWorkDays: true,
    firstSteps:
      "Before recruiting a single truck, talk with the people who " +
      "already field these calls — domestic violence advocates, " +
      "tenant organizers, senior services — about how requests " +
      "should reach you and what confidentiality they'll expect, " +
      "since some moves mean someone leaving an unsafe home. Then " +
      "gather three or four volunteers with strong backs and one " +
      "vehicle, and scope your first small move together.",
    commonPitfalls:
      "Moving crews get hurt or burned out fast: an " +
      "over-ambitious job with too few hands, a volunteer lifting " +
      "wrong, an address shared in a group chat that should never " +
      "have left the coordinator's phone. Keep moves inside your " +
      "stated limits, and treat the details of every " +
      "safety-related move like they could put someone in danger " +
      "— because they could.",
    pairsWith: ["tenant-union", "free-store"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Recruit a crew and vehicles",
        description:
          "Gather volunteers able to lift and carry safely, plus access to trucks or vans. Keep a roster with availability so you can assemble a crew quickly.",
        hours: 2.5,
        skills: ["outreach", "driving"],
      },
      {
        name: "Gather moving supplies",
        description:
          "Collect dollies, furniture straps, moving blankets, and reusable boxes through donations. Shared supplies make moves faster and safer.",
        hours: 1.5,
        skills: ["driving"],
      },
      {
        name: "Build a request and assessment system",
        description:
          "Create a way to request help and scope each move: how much, stairs or elevator, distance, and timing. This lets you plan crew size and equipment.",
        hours: 2,
        skills: ["organizing"],
      },
      {
        name: "Sort out safety and liability",
        description:
          "Train volunteers in safe lifting, use simple waivers, and check insurance for any vehicles used. Protecting volunteers and clients matters.",
        hours: 2,
        skills: ["paperwork"],
        follows: [0],
      },
      {
        name: "Set scheduling and dispatch",
        description:
          "Match requests to available crews and confirm with everyone the day before. Keep a backup list since moves can't easily be postponed.",
        hours: 1.5,
        skills: ["organizing"],
        follows: [0, 2],
      },
      {
        name: "Define scope and limits",
        description:
          "Decide what you'll handle and what you won't (no hazardous materials, pianos, or jobs beyond the crew's safe capacity). Refer those elsewhere.",
        hours: 1,
        skills: ["writing"],
      },
      {
        name: "Run moves and follow up",
        description:
          "Carry out the move safely and respectfully, then check the person is settled. Connect them to other projects (free store, welcome wagon) as needed.",
        hours: 3.5,
        skills: ["driving"],
        follows: [1, 3, 4],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "disability-support-network",
    name: "Disability & Accessibility Support Network",
    purpose:
      "Organize disabled neighbors and allies for mutual support, accessibility, and advocacy — led by disabled people themselves.",
    whoItServes: "Disabled and chronically ill neighbors.",
    whatYoullNeed:
      "An accessible communication system, peer leaders, and a resource directory. Peer support complements professional care — refer medical, personal-care, and legal questions to qualified providers, and treat members' health information as private.",
    setupHours: 24,
    defaultCategory: "organizing",
    firstSteps:
      "This network only works if disabled neighbors are at the " +
      "table from the very first conversation — not consulted " +
      "later, but deciding what it is. Start by asking two or " +
      "three disabled people you know to co-found it with you " +
      "(or, if you're disabled yourself, to share the load), and " +
      "let their access needs shape how the first meeting " +
      "happens: format, location, and pace included.",
    commonPitfalls:
      "The classic failure is well-meaning allies building a " +
      "program for disabled people that disabled people didn't " +
      "ask for, in formats they can't use. The quieter one is " +
      "drifting into an informal care service: peer support can't " +
      "safely substitute for medical or personal care, so keep " +
      "referring those needs to qualified providers and guard " +
      "members' health details like the private information they " +
      "are.",
    pairsWith: ["neighborhood-care-network", "rides-transportation", "health-navigation"],
    learnMore: ["lurking-ok"],
    tasks: [
      {
        name: "Center disabled leadership",
        description:
          "Ensure disabled members lead and shape the network. \"Nothing about us without us\" is the core principle — allies support, they don't direct.",
        hours: 3,
        skills: ["facilitation"],
      },
      {
        name: "Build an accessible communication system",
        description:
          "Offer multiple ways to participate (phone, text, online, in person), use plain language, and ensure materials work with screen readers and varied needs.",
        hours: 3,
        skills: ["accessibility", "tech support"],
      },
      {
        name: "Map needs and resources",
        description:
          "Learn what members need and catalog local resources: accessible transport, equipment sources, services, and benefits help. Identify the biggest gaps.",
        hours: 5,
        skills: ["outreach", "data entry"],
      },
      {
        name: "Set up a mutual support exchange",
        description:
          "Create a way for members to give and receive help — errands, advocacy buddies for appointments, check-ins — matched to capacity and need.",
        hours: 3,
        skills: ["organizing"],
        follows: [2],
      },
      {
        name: "Create an equipment lending pool",
        description:
          "Gather and lend mobility aids and assistive equipment, sanitized between users. Many devices sit unused after they're outgrown or no longer needed.",
        hours: 4,
        skills: ["outreach", "organizing"],
      },
      {
        name: "Offer advocacy and navigation support",
        description:
          "Help members navigate benefits, accommodations, and services. Share information and accompaniment, and refer legal and medical questions to qualified professionals.",
        hours: 3,
        recurringCadence: "month",
        skills: ["paperwork"],
        follows: [2],
      },
      {
        name: "Set accessibility standards for all program events",
        description:
          "Develop a checklist (venue access, seating, interpretation, sensory needs, materials) so every project in your wider program is welcoming to disabled members.",
        hours: 3,
        skills: ["accessibility", "writing"],
      },
    ],
  },
  {
    id: "books-to-prisoners",
    name: "Books to Prisoners & Letter-Writing Program",
    purpose:
      "Send free books and letters to incarcerated people to reduce isolation and support learning.",
    whoItServes:
      "Incarcerated people and, through them, their families and communities.",
    whatYoullNeed:
      "Donated books, volunteers, postage, and knowledge of each facility's mail rules. Every facility's mail rules are strict and different — packages that break them get rejected, so follow them exactly, and have volunteers always use the program's address, never a home address.",
    setupHours: 21,
    defaultCategory: "education",
    suggestsWorkDays: true,
    firstSteps:
      "Before collecting a single book, call an established " +
      "books-to-prisoners group — most will gladly share which " +
      "facilities they cover, which rules trip people up, and " +
      "where requests go unanswered. Then get the current mail " +
      "policy in writing for the one or two facilities you'll " +
      "start with; what incarcerated people actually request " +
      "should shape your collection, not whatever donors clear " +
      "off their shelves.",
    commonPitfalls:
      "This project dies by rejected packages: a used book where " +
      "only new is allowed, a hardcover, a forgotten labeling " +
      "rule — postage wasted and someone's long-awaited parcel " +
      "sent back. It can also hurt volunteers who write from " +
      "home; every letter goes out on the program's address, no " +
      "exceptions, however warm the correspondence becomes.",
    pairsWith: ["reentry-support", "free-little-library"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Learn facility mailing rules",
        description:
          "Each prison has strict, specific rules — many require books be new and sent directly from a publisher or approved retailer, with limits on content and quantity. Research these carefully, because rule-breaking mail is rejected.",
        hours: 5,
        skills: ["paperwork"],
      },
      {
        name: "Gather books and a workspace",
        description:
          "Collect donated books (within facility rules) and set up a sorting and packing area. Keep a varied selection: dictionaries, education, fiction, and reentry resources are often most requested.",
        hours: 4,
        skills: ["outreach", "driving"],
        follows: [0],
      },
      {
        name: "Set up a request-handling system",
        description:
          "Create a process to receive and track requests from incarcerated people, who write in with topics or titles. Match requests to available books.",
        hours: 3,
        skills: ["data entry", "organizing"],
      },
      {
        name: "Recruit and train volunteers",
        description:
          "Train volunteers to match requests, pack within each facility's rules, and write thoughtful notes. Accuracy on the rules prevents wasted postage and rejected parcels.",
        hours: 3,
        skills: ["outreach", "teaching"],
        follows: [0],
      },
      {
        name: "Cover postage and logistics",
        description:
          "Postage is the main ongoing cost. Fundraise for it, use the cheapest compliant shipping, and arrange regular mailing days.",
        hours: 3,
        recurringCadence: "month",
        skills: ["outreach"],
      },
      {
        name: "Organize a letter-writing program",
        description:
          "Match volunteers as pen-pals where wanted, with clear safety and privacy guidelines (use the program's address, not personal ones). Connection matters as much as books.",
        hours: 3,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "community-music",
    name: "Community Music & Instrument Program",
    purpose:
      "Lend instruments and offer free lessons and jam sessions so music is accessible to everyone.",
    whoItServes: "Kids and adults who can't afford instruments or lessons.",
    whatYoullNeed:
      "Donated instruments, volunteer teachers, a space, and a lending system.",
    setupHours: 15,
    defaultCategory: "education",
    firstSteps:
      "Start with the musicians already around you — the " +
      "guitarist at the corner church, the retired band director, " +
      "the teens who play — and ask what they'd enjoy teaching " +
      "and when. One conversation with a music shop about " +
      "discounted repairs and one with a space that tolerates " +
      "noise, and you're most of the way to your first jam.",
    commonPitfalls:
      "The lending pool quietly empties when instruments go out " +
      "faster than they come back playable, so budget repair time " +
      "from the start and keep the return policy forgiving but " +
      "real. And watch for lessons drifting toward the " +
      "already-confident: the kid who has never touched an " +
      "instrument needs the warmest welcome, not the shortest " +
      "slot.",
    pairsWith: ["library-of-things", "skill-share", "youth-mentorship"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Collect and repair instruments",
        description:
          "Gather donated instruments and have them cleaned, restrung, or repaired so they're playable. Build a mix across types and skill levels.",
        hours: 5,
        skills: ["repair", "driving"],
      },
      {
        name: "Set up an instrument lending system",
        description:
          "Create a checkout that tracks who has what, with care instructions and a forgiving return policy. Number and log each instrument.",
        hours: 2,
        skills: ["data entry"],
        follows: [0],
      },
      {
        name: "Recruit volunteer teachers",
        description:
          "Find musicians willing to teach beginners patiently. They needn't be professionals — enthusiasm and basic skill go a long way.",
        hours: 3,
        skills: ["outreach", "music"],
      },
      {
        name: "Find a space for lessons and jams",
        description:
          "Secure a room where noise is fine — a community center, school, or faith hall. Set predictable times for lessons and open playing.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Schedule lessons and jam sessions",
        description:
          "Offer beginner lessons and open jams for all levels. Keep sign-up easy and times varied for people who work or are in school.",
        hours: 2,
        recurringCadence: "session",
        skills: ["organizing"],
        follows: [2, 3],
      },
      {
        name: "Set care and return expectations",
        description:
          "Teach borrowers basic instrument care and what to do if something breaks. Keep it trust-based and supportive, not punitive.",
        hours: 1,
        skills: ["writing"],
        follows: [1],
      },
    ],
  },
  {
    id: "school-supply-program",
    name: "School Supply & Backpack Program",
    purpose:
      "Provide free school supplies and backpacks so kids start the year ready and confident.",
    whoItServes: "Low-income families with school-age children.",
    whatYoullNeed:
      "Supply donations or funds, storage, a distribution point, and volunteers.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Your first conversation is with a school — a counselor, " +
      "family liaison, or parent coordinator who knows the real " +
      "supply lists and which families quietly go without. Let " +
      "them shape what you collect and how families hear about " +
      "it; a giveaway routed through people parents already trust " +
      "reaches kids a flyer never will.",
    commonPitfalls:
      "The predictable failure is a mountain of donated folders " +
      "and none of the notebooks the lists actually ask for — " +
      "collecting what's easy to give instead of what's needed. " +
      "The one that stings is a distribution that feels like a " +
      "means test; skip the income paperwork, let kids pick their " +
      "own backpack, and nobody leaves feeling inspected.",
    pairsWith: ["youth-mentorship", "toy-library"],
    tasks: [
      {
        name: "Get supply lists and gauge need",
        description:
          "Partner with local schools to learn the actual supply lists by grade and estimate how many families need help. This keeps donations relevant.",
        hours: 1.5,
        skills: ["outreach"],
      },
      {
        name: "Run supply drives and bulk-buy",
        description:
          "Combine donation drives with bulk purchases for the most-needed items. Bulk buying stretches money furthest on basics like notebooks and pencils.",
        hours: 3,
        recurringCadence: "cycle",
        skills: ["outreach", "driving"],
        follows: [0],
      },
      {
        name: "Sort and assemble by grade level",
        description:
          "Organize supplies and pack backpacks matched to each grade's list. An assembly-line packing session with volunteers moves quickly.",
        hours: 2,
        skills: ["organizing"],
        follows: [1],
      },
      {
        name: "Set up storage and a distribution point",
        description:
          "Secure dry storage and a welcoming spot to hand out backpacks, often at a school, community center, or alongside another back-to-school event.",
        hours: 1.5,
        skills: ["outreach"],
      },
      {
        name: "Schedule and staff distribution",
        description:
          "Hold the giveaway before school starts, staffed by friendly volunteers. Let kids pick a backpack where possible — choice adds dignity.",
        hours: 2,
        skills: ["organizing"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "legal-aid-clinic",
    name: "Legal Aid Clinic & Know Your Rights Program",
    purpose:
      "Connect neighbors to free legal help and teach people their rights.",
    whoItServes:
      "Anyone facing legal issues without means — housing, immigration, debt, family, or benefits matters.",
    whatYoullNeed:
      "Volunteer lawyers and law students, a space, partner legal aid organizations, and scheduling. Individual legal advice must come from qualified, licensed attorneys (or supervised law students) — this program organizes access and shares general rights information, it is not itself a source of legal advice.",
    setupHours: 26,
    defaultCategory: "other",
    suggestsWorkDays: true,
    firstSteps:
      "Nothing here starts before you have lawyers: your first " +
      "calls are to the local legal aid office, the bar " +
      "association's pro bono program, and a law school clinic, " +
      "asking what they'd need to show up — and where the gaps " +
      "are that a neighborhood clinic could actually fill. Let " +
      "those partners define the clinic's scope with you before " +
      "you announce anything to neighbors.",
    commonPitfalls:
      "The dangerous failure is a caring volunteer sliding from " +
      "information into advice — a well-meant \"you should just " +
      "sign it\" can wreck someone's case, so keep that line " +
      "bright and rehearsed. The slower one is intake outpacing " +
      "attorneys: a waitlist of desperate people with no lawyer " +
      "in the room breaks trust faster than never opening at all.",
    pairsWith: ["tenant-union", "court-support", "newcomer-translation-network"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Partner with lawyers and legal aid",
        description:
          "Recruit licensed attorneys, or law students supervised by attorneys, to provide the actual legal advice. Build referral ties with established legal aid organizations.",
        hours: 6,
        skills: ["outreach"],
      },
      {
        name: "Define scope and referral pathways",
        description:
          "Decide which matters the clinic can address and set clear pathways to refer complex or specialized cases. Be upfront about what the clinic can and can't do.",
        hours: 3,
        skills: ["writing"],
        follows: [0],
      },
      {
        name: "Set up a space and intake",
        description:
          "Secure a private, confidential venue and create an intake with a document checklist so attorneys can use limited time well.",
        hours: 3,
        skills: ["organizing"],
      },
      {
        name: "Build a confidential appointment system",
        description:
          "Create appointments that protect privacy. Legal matters are sensitive, so guard people's information carefully throughout.",
        hours: 3,
        skills: ["organizing", "data entry"],
      },
      {
        name: "Develop know-your-rights materials and workshops",
        description:
          "Create clear, accurate guides and run workshops on common rights (tenant, worker, immigration, encounters with authorities). Frame these as general information, not individual legal advice.",
        hours: 5,
        recurringCadence: "event",
        skills: ["writing", "teaching"],
      },
      {
        name: "Promote and schedule clinics",
        description:
          "Set recurring clinic dates and spread the word through partner organizations and the wider mutual aid program. Offer interpretation for non-English speakers.",
        hours: 3,
        skills: ["outreach", "translation"],
        follows: [0, 3],
      },
      {
        name: "Protect confidentiality and check conflicts",
        description:
          "Establish strict confidentiality and a basic conflict-of-interest check so the same volunteer never advises opposing parties. Train everyone on these duties.",
        hours: 3,
        skills: ["paperwork"],
      },
    ],
  },
  {
    id: "resource-hub-dispatch",
    name: "Mutual Aid Resource Hub & Dispatch",
    purpose:
      "Act as the coordinating backbone — a single point where needs and offers are matched across all of your program's projects.",
    whoItServes:
      "Everyone in the program — members seeking help, volunteers offering it, and project leads needing coordination.",
    whatYoullNeed:
      "An intake system, a volunteer and resource roster, coordinators, and a master directory. The hub holds sensitive information about neighbors' lives — collect only what's needed, guard it carefully, and share details only with the people who need them to help.",
    setupHours: 27,
    defaultCategory: "organizing",
    firstSteps:
      "The hub coordinates projects, so start by sitting down " +
      "with each project's lead: what requests do they get, what " +
      "do they wish they could hand off, and how do they want to " +
      "receive matches. Agree together on one shared intake and a " +
      "privacy baseline — a hub imposed on projects gets routed " +
      "around; one built with them becomes the front door.",
    commonPitfalls:
      "Hubs die two ways: the intake fills with requests nobody " +
      "follows to completion, so word spreads that calling does " +
      "nothing; or one heroic coordinator holds every thread " +
      "until they burn out and the program loses its memory. " +
      "Track each request to a real close, rotate shifts early, " +
      "and collect less information than you think you need.",
    pairsWith: ["emergency-preparedness", "rides-transportation", "solidarity-fund"],
    learnMore: ["post-something", "claim-post"],
    tasks: [
      {
        name: "Set up a single intake for needs and offers",
        description:
          "Create one easy front door — a phone line, form, and in-person option — where anyone can say what they need or what they can give. One point of entry prevents people falling through the cracks.",
        hours: 4,
        skills: ["organizing", "tech support"],
      },
      {
        name: "Build a volunteer and resource roster",
        description:
          "Maintain a current list of volunteers (skills, availability, location) and what each project can offer, so requests can be matched fast.",
        hours: 4,
        skills: ["data entry"],
      },
      {
        name: "Create a matching and dispatch process",
        description:
          "Establish how a request gets routed to the right project or volunteer and how quickly. Define response-time goals and how requests are tracked to completion.",
        hours: 4,
        skills: ["organizing"],
        follows: [0, 1],
      },
      {
        name: "Maintain a master resource directory",
        description:
          "Keep a living directory of all your projects plus external services (shelters, clinics, food, legal aid) so the hub can route people anywhere help exists.",
        hours: 5,
        recurringCadence: "month",
        skills: ["data entry"],
      },
      {
        name: "Recruit and train coordinators",
        description:
          "Build a team to staff rotating dispatch shifts so the hub stays responsive without burning anyone out. Train them on the process and the directory.",
        hours: 3,
        skills: ["outreach", "teaching"],
        follows: [2, 3],
      },
      {
        name: "Set data privacy and follow-up practices",
        description:
          "Decide what information you collect, how it's stored and protected, and how you confirm a need was actually met. Collect the minimum and guard it carefully.",
        hours: 4,
        skills: ["writing"],
      },
      {
        name: "Track unmet needs and gaps",
        description:
          "Log requests you couldn't fill. Recurring gaps reveal where your program should start its next project — turning the hub into a planning tool, not just a switchboard.",
        hours: 3,
        recurringCadence: "month",
        skills: ["data entry"],
      },
    ],
  },
  {
    id: "harm-reduction-supplies",
    name: "Harm Reduction Supply Distribution",
    purpose:
      "Get naloxone, test strips, and safer-use supplies into the hands of people who may need them — meeting neighbors where they are, no judgment attached.",
    whoItServes:
      "People who use drugs, their friends and families, and anyone likely to witness an overdose — which, in most neighborhoods, is anyone.",
    whatYoullNeed:
      "Overdose-response training, a naloxone source (state program, pharmacy, or partner org), kit supplies, and a small distribution crew. Handing out supplies is not medical care — everyone distributing must complete overdose-response training first, and the law on what you can carry (test strips, syringes) varies a lot by place, so confirm yours before you stock anything. Keep local crisis and treatment lines printed in every kit.",
    setupHours: 20,
    defaultCategory: "other",
    suggestsWorkDays: true,
    firstSteps:
      "Don't buy anything yet: your first step is a conversation " +
      "with the nearest established harm reduction program and " +
      "with people who actually use these supplies — they'll tell " +
      "you what's needed, what's already covered, and how to show " +
      "up without judgment. Get your core crew through " +
      "overdose-response training and confirm your local law on " +
      "strips and syringes before a single kit is packed.",
    commonPitfalls:
      "This goes wrong when you show up as strangers — " +
      "distributing where you have no relationships, or attaching " +
      "lectures and conditions that teach people to avoid you — " +
      "and when you get ahead of the law or your training, which " +
      "can cost a volunteer a paraphernalia charge. Slower and " +
      "partnered beats fast and alone here, every time.",
    pairsWith: ["community-first-aid-training", "mental-health-peer-support"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Get trained and find a harm reduction partner",
        description:
          "Have your core crew complete an overdose-response and naloxone training — many health departments and harm reduction orgs run them free. Partner with an established program; they've already solved supply, legal, and trust problems you don't need to re-solve.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Check the local law on supplies",
        description:
          "Naloxone access is protected almost everywhere, but test strips and syringes are still classed as paraphernalia in some places. Find out exactly what you can legally carry and hand out — your partner org or a legal aid clinic can tell you quickly. Write it down for volunteers.",
        hours: 3,
        skills: ["research"],
      },
      {
        name: "Source naloxone and kit supplies",
        description:
          "Order naloxone through a state distribution program, a pharmacy standing order, or your partner org. Add whatever else is legal where you are: fentanyl and xylazine test strips, wound care, hygiene items.",
        hours: 4,
        follows: [1],
      },
      {
        name: "Assemble kits with plain-language inserts",
        description:
          "Pack kits with simple, multilingual instructions: how to recognize an overdose, how to give naloxone, call emergency services, never use alone. Include local crisis and treatment lines in every kit. Assembly goes fast with a table full of people.",
        hours: 3,
        skills: ["translation"],
        follows: [2],
        recurringCadence: "cycle",
      },
      {
        name: "Set up distribution rounds and fixed points",
        description:
          "Plan regular walking or driving rounds through the places people actually are, and ask bars, corner stores, libraries, and venues to keep a no-questions-asked box. Low barrier is the whole point — no forms, no lecture.",
        hours: 4,
        skills: ["outreach", "driving"],
      },
      {
        name: "Restock, track, and keep training fresh",
        description:
          "Note what runs out and what sits, log expiration dates on the naloxone, and hold refresher trainings as new volunteers join. If a kit reverses an overdose, that's worth (gently) recording.",
        hours: 2,
        recurringCadence: "month",
      },
    ],
  },
  {
    id: "court-support",
    name: "Court Support & Accompaniment",
    purpose:
      "Make sure no neighbor faces a court date alone — company in the courtroom, a ride there, childcare during the hearing, and letters of support when the defense asks for them.",
    whoItServes:
      "Neighbors facing criminal, immigration, eviction, or family court dates, and their families — getting to court alone can cost people jobs, childcare, and hope.",
    whatYoullNeed:
      "Reliable volunteers, a hearing calendar, and ties to public defenders. Court support is presence and logistics, not legal advice — volunteers never advise on a case and always follow the lead of the person's own attorney. Courtrooms have strict conduct rules, so everyone attending needs to know them cold.",
    setupHours: 16,
    defaultCategory: "other",
    firstSteps:
      "Start with the people whose dates these are: support " +
      "happens only at the invitation of the person facing court, " +
      "and in step with their attorney. Introduce yourselves " +
      "first to the public defender's office and any court-watch " +
      "or bail-fund groups already at the courthouse, and let " +
      "them tell you which hearings need company and how to be " +
      "useful without ever touching the legal side.",
    commonPitfalls:
      "The harm here comes from freelancing: a volunteer " +
      "\"explaining\" a plea in the hallway, case details " +
      "discussed where a prosecutor can overhear, a visible " +
      "gallery reaction that irritates a judge — any of which can " +
      "hurt the very person you came for. The quieter failure is " +
      "logistics: an unconfirmed court date or a ride that falls " +
      "through can mean a missed hearing and a warrant.",
    pairsWith: ["legal-aid-clinic", "reentry-support", "rides-transportation"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Connect with defenders and existing court groups",
        description:
          "Introduce yourselves to the public defender's office, immigration legal aid, and any court-watch or bail-fund groups already working. They'll tell you where support is most needed and how to plug in without getting in the way.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Write the ground rules: support, not law",
        description:
          "Put it in writing: volunteers never give legal advice, never discuss case details in public areas of the courthouse, and always defer to the person's own lawyer. Add courtroom conduct — arrive early, dress plainly, phones off, no reactions from the gallery.",
        hours: 2,
        skills: ["writing"],
      },
      {
        name: "Build an intake and hearing calendar",
        description:
          "Create a simple way for people to ask for support and a shared calendar of dates, courtrooms, and what each person needs — company, a ride, childcare, or all three. Court dates move constantly, so confirm the day before.",
        hours: 3,
        skills: ["organizing"],
      },
      {
        name: "Train accompaniment volunteers",
        description:
          "Walk volunteers through a courthouse visit: security, finding the room, where to sit, and how to just be steady, warm company through a stressful wait. Pair every new volunteer with an experienced one for their first date.",
        hours: 3,
        skills: ["teaching"],
        follows: [1],
      },
      {
        name: "Coordinate rides and childcare for hearings",
        description:
          "Line up drivers for court mornings and childcare pairs who can watch kids during hearings — many courtrooms don't allow children, and a hearing missed over childcare can mean a warrant.",
        hours: 3,
        skills: ["driving", "childcare"],
        recurringCadence: "event",
      },
      {
        name: "Organize support letters when the defense asks",
        description:
          "When someone's attorney requests character or community-support letters, coordinate neighbors to write them — following the lawyer's guidance on content, tone, and deadline exactly.",
        hours: 2,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "cooling-warming-center",
    name: "Pop-Up Cooling & Warming Center",
    purpose:
      "Open a neighborhood climate refuge — a cool room in a heat wave, a warm one in a cold snap — ready before the weather turns dangerous, not after.",
    whoItServes:
      "Elders, unhoused neighbors, people without working AC or heat, outdoor workers, and anyone whose housing can't keep up with the weather.",
    whatYoullNeed:
      "A host site with climate control and bathrooms, supplies, and trained hosts on shifts. Hosts are neighbors, not medics — train everyone to spot heat exhaustion and hypothermia and to call emergency services early rather than late, and settle the host site's insurance and liability question before the first activation, not during it.",
    setupHours: 21,
    defaultCategory: "other",
    suggestsWorkDays: true,
    firstSteps:
      "The host site is the relationship everything rests on, so " +
      "start there: sit down with the librarian, pastor, or hall " +
      "manager and work through the uncomfortable questions " +
      "together — hours, keys, insurance, what happens if someone " +
      "needs to stay overnight — before the first forecast forces " +
      "them. At the same time, ask outreach workers and " +
      "senior-building staff who actually needs the refuge, so " +
      "the location and hours fit the people it's for.",
    commonPitfalls:
      "This project fails in the gap between planning and " +
      "weather: a trigger nobody quite agreed on, so the center " +
      "opens a day late, or a liability question left vague until " +
      "someone collapses and the host pulls out for good. Put the " +
      "activation threshold in writing, run one practice opening " +
      "before the season, and make sure every host knows to call " +
      "emergency services early, not last.",
    pairsWith: ["emergency-preparedness", "community-wood-bank", "laundry-shower-access"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Find a host site with climate control",
        description:
          "Ask libraries, faith sites, union halls, and community centers for a room with reliable AC and heat, bathrooms, and step-free access. Get a written okay covering hours, who holds keys, and what happens if it's needed overnight.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Set activation triggers and an alert plan",
        description:
          "Decide in advance exactly what opens the center — a forecast temperature, a heat index, a wind chill — so nobody has to make a judgment call at midnight. Set up a phone tree or group chat that puts hosts on standby a day ahead.",
        hours: 2,
      },
      {
        name: "Stock supplies",
        description:
          "Gather water, electrolyte packets, blankets, folding cots or comfortable chairs, fans, phone chargers, and a first-aid kit. Store it all at the site in labeled bins so any host can find things.",
        hours: 3,
        skills: ["driving"],
        follows: [0],
      },
      {
        name: "Recruit and train shift hosts",
        description:
          "Find enough volunteers for two per shift and train them: greeting people without paperwork, spotting heat exhaustion and hypothermia, when to call emergency services, and de-escalation basics. Warmth in the human sense matters as much as the thermostat.",
        hours: 4,
        skills: ["teaching"],
      },
      {
        name: "Build the shift rota",
        description:
          "Prepare a shift schedule you can trigger on a day's notice — openers, closers, and overnight coverage if you offer it. Keep a reserve list, since heat waves flatten volunteers too.",
        hours: 2,
        skills: ["organizing"],
        follows: [3],
        recurringCadence: "event",
      },
      {
        name: "Spread the word before the season",
        description:
          "Make multilingual flyers with the triggers and location, and get them to clinics, senior buildings, outreach workers, and corner stores before the first heat wave or cold snap — not during.",
        hours: 3,
        skills: ["graphic design", "translation"],
      },
      {
        name: "Open, host, and reset each activation",
        description:
          "Run the center for the duration of the weather event: sign people in loosely (a count, not IDs), keep supplies flowing, and check on anyone sleeping. Afterward, clean, restock, and note what ran short.",
        hours: 3,
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "community-oral-history",
    name: "Community Oral History Project",
    purpose:
      "Record elders' and neighbors' stories before they're lost — and keep the tellers in charge of what happens to them.",
    whoItServes:
      "Elders with stories nobody has asked to hear, longtime residents watching the neighborhood change, and every neighbor who comes after.",
    whatYoullNeed:
      "A phone or simple recorder, a quiet spot, consent forms, and a safe place to keep files. Recordings are personal data — each participant owns their story, decides where it's shared, and can change their mind later. Nothing goes public without their written okay.",
    setupHours: 10,
    defaultCategory: "education",
    firstSteps:
      "Start with one elder who trusts you and ask if they'd " +
      "share a story — that first recording teaches you more than " +
      "any plan, and their word vouches for you with the next " +
      "storyteller. Before you press record with anyone, go " +
      "through the consent form together and ask what they'd want " +
      "to happen to the recording; that conversation is the " +
      "project.",
    commonPitfalls:
      "The way this hurts someone is a story traveling further " +
      "than its teller agreed to — a clip posted, a name " +
      "attached, a detail that was meant for you alone. The way " +
      "it quietly dies is recordings piling up unlabeled on one " +
      "person's phone until a lost device erases years of voices; " +
      "label and back up each session the week it happens.",
    pairsWith: ["neighborhood-care-network", "digital-literacy"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Write a plain-language consent form",
        description:
          "One page, no legalese: what's being recorded, where it might be shared, and the participant's right to pause, skip questions, or withdraw the recording later. Translate it into the languages your storytellers actually speak.",
        hours: 2,
        skills: ["writing", "translation"],
      },
      {
        name: "Gather gear and a question list",
        description:
          "A phone with a voice memo app is plenty; add a cheap lapel mic if you can. Draft open questions that invite stories — \"tell me about the street when you arrived\" — and practice on each other once.",
        hours: 2,
      },
      {
        name: "Record story sessions",
        description:
          "Sit with one storyteller at a time in a quiet, comfortable place. Go over the consent form together first, then mostly listen — the best interviews are the ones where you talk least.",
        hours: 4,
        skills: ["listening"],
        follows: [0, 1],
        recurringCadence: "session",
      },
      {
        name: "Archive and share back, on their terms",
        description:
          "Label each recording with the date, names, and what was agreed about sharing. Keep two copies somewhere safe, give every storyteller their own copy, and share publicly only the pieces each person approved.",
        hours: 2,
        follows: [2],
      },
    ],
  },
  {
    id: "community-solar-coop",
    name: "Community Solar & Energy Cooperative",
    purpose:
      "Pool neighbors' resources into shared renewable energy that cuts everyone's bills — especially for the renters and households who could never put panels on a roof of their own.",
    whoItServes:
      "Renters, low-income households, and anyone shut out of rooftop solar by their roof, their landlord, or their budget.",
    whatYoullNeed:
      "Committed members, technical and financial know-how you can borrow or learn, a host site or an existing community-solar program to join, and partner organizations. One thing stated plainly: energy cooperatives carry real financial and legal complexity — get advice from qualified professionals on structure, financing, and contracts before anyone signs anything.",
    setupHours: 27,
    defaultCategory: "infrastructure",
    firstSteps:
      "Before any panels or paperwork, talk to two groups: " +
      "neighbors who'd actually join, to gauge real commitment, " +
      "and a solar co-op a town or state over that's already done " +
      "it — they'll tell you which model fits your area's rules " +
      "and which mistakes cost them money. Then read those local " +
      "rules yourselves, because they, not your enthusiasm, " +
      "decide what's possible.",
    commonPitfalls:
      "Solar co-ops die in the gap between excitement and " +
      "signatures: a year of meetings about a model your state's " +
      "rules never allowed, or a contract signed without " +
      "professional review that locks members into terms nobody " +
      "understood. The other killer is fuzzy money — if members " +
      "can't see plainly what they put in and what comes back, " +
      "trust erodes and the co-op unravels.",
    pairsWith: ["weatherization-brigade", "bulk-buying-coop"],
    tasks: [
      {
        name: "Gather members and assess interest",
        description:
          "Recruit households interested in lower-cost clean energy and find out how committed they really are — vague enthusiasm and a signed-up member are different things. Your numbers shape which models are realistic, so count honestly before you plan.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Learn the models and local rules",
        description:
          "Research how community solar works where you live: state laws, net metering, subscription programs, cooperative structures. The rules vary enormously from place to place and they determine what's actually possible — do this before falling in love with any one model.",
        hours: 5,
        skills: ["research"],
      },
      {
        name: "Find a site or program to join",
        description:
          "Look for a host roof or piece of land for a shared array, or check whether an existing community-solar program will take your group as collective subscribers — joining one is often much faster than building. Weigh both paths with your members before committing.",
        hours: 4,
        skills: ["outreach"],
      },
      {
        name: "Sort out financing and legal structure",
        description:
          "Decide how the project is funded and governed, and form the cooperative properly. This is the step with real legal and financial implications — bring in qualified professionals to review the structure and every contract, and don't sign until they have.",
        hours: 5,
        skills: ["paperwork", "accounting"],
        follows: [1],
      },
      {
        name: "Partner with installers and providers",
        description:
          "Line up reputable installers or providers, compare more than one bid, and confirm warranties and long-term maintenance in writing. A cheap install with no maintenance plan is an expensive one in five years.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Set up the bill-credit and membership system",
        description:
          "Work out exactly how savings or credits flow to members and how membership and payments work. Make it transparent and easy to understand — a member should be able to see, on one page, what they put in and what comes back.",
        hours: 3,
        skills: ["accounting", "data entry"],
        follows: [3],
      },
      {
        name: "Educate members on energy use",
        description:
          "Help members read their bills and cut their consumption — a kilowatt saved beats a kilowatt generated. Pair the solar savings with plain efficiency tips so households see the difference on paper.",
        hours: 3,
        skills: ["teaching"],
      },
    ],
  },
  {
    id: "worker-coop-incubator",
    name: "Worker Cooperative & Job Skills Incubator",
    purpose:
      "Help neighbors build job skills and launch worker-owned cooperatives — livelihoods where the people doing the work own the workplace and make the decisions.",
    whoItServes:
      "Unemployed and underemployed neighbors, and anyone who wants a real stake in where they work.",
    whatYoullNeed:
      "Mentors with business and cooperative experience, training space and materials, startup support you can point ventures toward, and partnerships — cooperative developers, lenders who know co-ops, and your own skill-share program.",
    setupHours: 27,
    defaultCategory: "education",
    firstSteps:
      "Start with conversations, not a curriculum: sit down with " +
      "interested members about what they can do and want to " +
      "build, and look for the skill clusters that could actually " +
      "become a venture. At the same time, find your area's " +
      "cooperative developer or an existing worker co-op willing " +
      "to mentor — their scars are your syllabus, and formation " +
      "without that guidance is where groups get hurt.",
    commonPitfalls:
      "This fails two ways: as a training program that never " +
      "launches anything, because nobody pushed a skills cluster " +
      "toward a real venture — or as a launch that skips the " +
      "boring parts, incorporating on a downloaded template and " +
      "discovering the governance and tax mess two years in. It " +
      "also quietly dies when one organizer holds every mentor " +
      "and funder relationship; share those contacts from day " +
      "one.",
    pairsWith: ["skill-share", "solidarity-fund", "time-bank"],
    tasks: [
      {
        name: "Assess member skills and goals",
        description:
          "Sit down with members and learn what they can do and what they want to build. You're looking for clusters — three people who can cook, a crew with trade skills, five who clean — because a cluster of skills is the seed of a viable cooperative venture.",
        hours: 4,
        skills: ["interviewing"],
      },
      {
        name: "Offer job-readiness and skills training",
        description:
          "Run sessions on resumes, interviews, trades, digital skills, and financial literacy. Draw on your skill-share program and bring in outside experts for what nobody local can teach — the goal is capable members whether or not a co-op forms around them.",
        hours: 5,
        skills: ["teaching"],
      },
      {
        name: "Teach the cooperative model",
        description:
          "Walk members through worker ownership and democratic governance: how profits are shared, how decisions get made, and how it all differs from a traditional business. People can't choose a model they've never seen — use real co-ops as examples.",
        hours: 4,
        skills: ["teaching", "facilitation"],
      },
      {
        name: "Support cooperative formation",
        description:
          "When a group is ready, help them write a business plan and choose a legal structure. Connect them to lawyers and accountants who know cooperatives rather than improvising the legal and accounting steps — incorporation done wrong is expensive to undo.",
        hours: 5,
        skills: ["paperwork"],
        follows: [2],
      },
      {
        name: "Connect to startup resources",
        description:
          "Build a live list of microloans, grants, cooperative-development funds, and incubators, and help ventures actually apply. Most co-op money is out there but badly signposted — your map of it is worth real dollars.",
        hours: 3,
        skills: ["research"],
      },
      {
        name: "Provide mentorship",
        description:
          "Pair each new venture with an experienced cooperator or business mentor who checks in through the early, fragile stages. The first year is where co-ops fail; a steady mentor who has seen the pattern before changes the odds.",
        hours: 3,
      },
      {
        name: "Build peer support among ventures",
        description:
          "Bring the ventures together into a network where co-ops share lessons, refer customers to each other, and buy from each other. Co-ops that trade with each other survive downturns that kill isolated ones.",
        hours: 3,
        skills: ["organizing"],
      },
    ],
  },
  {
    id: "elder-meal-delivery",
    name: "Elder Companionship & Meal Delivery",
    purpose:
      "Bring regular meals and friendly visits to homebound elders — the food matters, and the ten minutes of conversation at the door often matters more.",
    whoItServes:
      "Isolated, homebound, or frail elderly neighbors — and the families who worry about them from far away.",
    whatYoullNeed:
      "Dependable volunteers you've screened, a meal source, planned routes, and simple safety practices for the moment a door goes unanswered.",
    setupHours: 22,
    defaultCategory: "food",
    firstSteps:
      "Start with the meal source and the first five elders, not " +
      "a sign-up sheet: talk to the community meal crew or a " +
      "couple of willing cooks about what they can reliably " +
      "produce, and ask senior-service workers, parish nurses, " +
      "and pharmacists who's actually going without. Screen your " +
      "first volunteers before the first delivery, not after — " +
      "the trust you're building lives or dies on who walks " +
      "through those doors.",
    commonPitfalls:
      "The dangerous failure is a missed signal — a volunteer who " +
      "shrugs off an unanswered door because nobody wrote down " +
      "what to do, or an allergy that never made it onto the " +
      "route sheet. The slow failure is unreliability: elders " +
      "plan their day around the visit, and a route that skips " +
      "weeks teaches them not to count on you. Better five elders " +
      "served every single week than twenty served sometimes.",
    pairsWith: ["community-meal", "neighborhood-care-network", "rides-transportation"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Identify homebound elders",
        description:
          "Find elders through clinics, senior services, faith groups, and word of mouth. Keep it respectful and strictly opt-in — you're offering a meal and company, not signing anyone up for surveillance.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Recruit and screen volunteers",
        description:
          "Anyone entering an elder's home gets vetted: references and basic checks, no exceptions for friends-of-friends. Then aim for consistency — elders do better with the same familiar face at the door each week than with a rotating cast.",
        hours: 4,
        skills: ["organizing"],
      },
      {
        name: "Arrange a meal source",
        description:
          "Line up meals from a people's kitchen, willing home cooks, or restaurants donating portions. Pay attention to nutrition and easy reheating, and label every container with its contents — an unlabeled meal is a gamble for someone with allergies.",
        hours: 4,
        skills: ["cooking", "food safety"],
      },
      {
        name: "Plan delivery routes and schedule",
        description:
          "Group elders into efficient routes and set a dependable rhythm — same days, roughly the same times. Build a few unhurried minutes of conversation into every stop; for many elders, that's the real delivery.",
        hours: 3,
        skills: ["driving", "organizing"],
        follows: [0, 2],
      },
      {
        name: "Record dietary, allergy, and emergency info",
        description:
          "For each elder, record dietary needs, allergies, medications that matter around food, and emergency contacts. Keep it secure and need-to-know — the driver needs the allergy, not the whole medical history.",
        hours: 3,
        skills: ["data entry"],
      },
      {
        name: "Establish a wellness-check protocol",
        description:
          "Write down exactly what a volunteer does when an elder doesn't answer or seems unwell: who to call first, when to involve family or emergency services, and how to note what happened. Deciding this in advance beats improvising on a doorstep.",
        hours: 3,
        skills: ["writing"],
        follows: [4],
      },
      {
        name: "Support volunteers and gather feedback",
        description:
          "Check in with volunteers regularly, rotate routes when someone needs a break, and ask the elders themselves how the project could serve them better. They'll tell you things the volunteers never see.",
        hours: 2,
      },
    ],
  },
  {
    id: "disaster-relief-hub",
    name: "Disaster Relief Distribution Hub",
    purpose:
      "Stand up a hub that can receive, sort, and move supplies fast when disaster hits — because the first days after a flood or fire are won or lost on logistics.",
    whoItServes:
      "Residents hit by floods, storms, fires, and other disasters — starting with the neighbors least able to travel or wait.",
    whatYoullNeed:
      "A pre-arranged site with a backup, supply-sourcing pipelines, a surge volunteer team, and coordination with the emergency preparedness network — nearly all of it arranged before any disaster, because afterward is too late.",
    setupHours: 24,
    defaultCategory: "organizing",
    suggestsWorkDays: true,
    firstSteps:
      "The hub exists on paper long before it exists in a parking " +
      "lot, so start with the emergency preparedness network — " +
      "they hold the contact tree and the risk picture — and with " +
      "the honest question of which building would actually let " +
      "you in at six in the morning after a flood. Get the site " +
      "agreement and the backup settled first; every other task " +
      "keys off an address.",
    commonPitfalls:
      "Relief hubs fail in two directions: the hub that exists " +
      "only as a plan nobody rehearsed, so the real event burns " +
      "its first day on questions a practice run would have " +
      "answered — and the hub that opens its doors to a donation " +
      "flood it can't sort, becoming a warehouse of unusable " +
      "clothes while people need water. The quieter harm is " +
      "distribution with barriers: the moment someone must prove " +
      "they deserve help, you've recreated the system you built " +
      "this to bypass.",
    pairsWith: ["emergency-preparedness", "resource-hub-dispatch"],
    learnMore: ["internet-outage"],
    tasks: [
      {
        name: "Pre-identify a hub site and backup",
        description:
          "Find a building or lot that can take deliveries, sort goods, and host a distribution line — plus a backup in case the first is damaged or unreachable. Confirm access and keys with the owners now, in calm weather; a site you can't get into is no site.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Build supply-sourcing pipelines",
        description:
          "Arrange in advance where water, food, hygiene, and cleanup supplies would come from — suppliers, partner orgs, drives. Just as important: a way to learn what people actually need after an event, so you aren't buried in the wrong things.",
        hours: 4,
        skills: ["outreach", "organizing"],
      },
      {
        name: "Set up intake, sorting, and inventory",
        description:
          "Design how donations get received, sorted, and tracked from the moment a truck arrives. Every hub that's drowned in unsorted goods skipped this step — decide your categories, labels, and simple counts before you need them.",
        hours: 4,
        skills: ["organizing", "data entry"],
      },
      {
        name: "Create a distribution system",
        description:
          "Plan how supplies go out: equitable and low-barrier — no ID checks, no proof of need — with mobile delivery for people who can't reach the hub. Prioritize the most vulnerable first, and write that priority down so it survives the chaos.",
        hours: 3,
        skills: ["driving", "organizing"],
        follows: [2],
      },
      {
        name: "Recruit and train a surge volunteer team",
        description:
          "Build a roster of people who can mobilize on short notice, and pre-train them on their roles, safety rules, and your intake and distribution system. A trained team of twelve outworks a well-meaning crowd of fifty.",
        hours: 4,
        skills: ["teaching"],
      },
      {
        name: "Coordinate with other responders",
        description:
          "Introduce the hub to official emergency agencies and other relief groups before anything happens. Agree on who covers what, so you're filling gaps instead of duplicating — mutual aid moves fastest exactly where the official response is slowest.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Plan communication and safety",
        description:
          "Plan for the networks failing: offline contact methods, printed lists, and a tie into the preparedness network's contact tree. Set hard volunteer-safety rules — nobody enters unsafe structures, ever — and put them in writing.",
        hours: 3,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "recovery-peer-support",
    name: "Recovery & Sober Peer Support Network",
    purpose:
      "Run peer-led support for neighbors in or seeking recovery from substance use — a complement to professional treatment, never a replacement for it.",
    whoItServes:
      "People in recovery, people thinking about it, and the families and friends walking alongside them.",
    whatYoullNeed:
      "Peer facilitators with lived experience and real training, a safe private space, referral pathways, and boundaries stated plainly: peer support complements professional treatment, it does not replace it; facilitators are not medical providers and must never advise on detox or medication; and there is always a clear plan for connecting anyone in crisis to qualified professional or emergency help.",
    setupHours: 22,
    defaultCategory: "emotional_support",
    firstSteps:
      "Begin with the people who'll hold the room: find one or " +
      "two neighbors with solid lived recovery experience, get " +
      "them into formal peer-support training, and together write " +
      "the scope — what this network is and is not — before you " +
      "announce anything. Then meet the local treatment programs " +
      "and crisis services in person, so your referral pathway is " +
      "a relationship, not a phone number on a flyer.",
    commonPitfalls:
      "This gets dangerous when the line blurs — a well-meaning " +
      "facilitator advising someone on detox or medication, which " +
      "can kill, or a group drifting into amateur treatment " +
      "because the referral pathway was never real. It fails " +
      "quietly through broken confidentiality — one leaked story " +
      "empties the room for good — and through facilitator " +
      "burnout, when the person holding everyone else's recovery " +
      "has no support for their own.",
    pairsWith: ["mental-health-peer-support", "harm-reduction-supplies"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Recruit and train peer facilitators",
        description:
          "Look for people with lived recovery experience and get them through a recognized peer-recovery support training. Be clear from the first conversation: facilitators are peers, not medical or clinical providers, and the training is what keeps that line safe.",
        hours: 5,
        skills: ["facilitation", "teaching"],
      },
      {
        name: "Define scope and boundaries",
        description:
          "Write down what the network does — peer support, connection, encouragement — and what it does not: treatment, detox, medical care, medication advice. A written scope protects members from bad advice and protects facilitators from carrying what isn't theirs.",
        hours: 3,
        skills: ["writing"],
      },
      {
        name: "Build referral and crisis pathways",
        description:
          "Build working relationships with professional treatment programs, medical care, and crisis services, and write an overdose-response plan. When someone in the room needs more than peers can give, the handoff should be a warm phone call, not a pamphlet.",
        hours: 4,
        skills: ["outreach", "research"],
        follows: [1],
      },
      {
        name: "Find a safe, private, substance-free space",
        description:
          "Find a room that's confidential, welcoming, and free of judgment and substances — somewhere people can be seen walking into without it broadcasting anything. Libraries, community rooms, and faith spaces with a separate entrance all work.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Set confidentiality and group norms",
        description:
          "Agree on the ground rules: what's said here stays here, respect without advice-pushing, and everyone's right to share or to pass. Reaffirm them out loud at the start of every single meeting — norms only protect people while they're fresh.",
        hours: 3,
        skills: ["facilitation"],
      },
      {
        name: "Schedule and promote meetings",
        description:
          "Offer more than one meeting time so shift workers and parents can come, and promote in plain, low-stigma language — free, open, no requirements. How you word the flyer decides who feels safe showing up.",
        hours: 3,
        skills: ["outreach"],
        follows: [3],
      },
      {
        name: "Support facilitators and prevent burnout",
        description:
          "Check in with facilitators regularly, rotate who leads, and make sure they have support of their own — holding space for recovery is heavy work, and a facilitator's own recovery always comes first.",
        hours: 2,
        skills: ["listening"],
      },
    ],
  },
  {
    id: "community-fitness",
    name: "Community Fitness & Wellness Groups",
    purpose:
      "Get neighbors moving together for free — walking groups, stretching, pickup sports, dance — because feeling good in your body shouldn't cost a gym membership.",
    whoItServes:
      "Anyone who wants to move, especially neighbors priced out of gyms, elders, and isolated folks for whom the company matters as much as the exercise.",
    whatYoullNeed:
      "Volunteer activity leaders, safe accessible spaces, and very little equipment. A welcoming, no-pressure style matters more than credentials — though anyone leading a physically demanding activity should have the qualifications for it, and every session needs water, warm-ups, and a first-aid kit within reach.",
    setupHours: 19,
    defaultCategory: "other",
    firstSteps:
      "Before you schedule anything, ask the people you hope " +
      "will come what they'd actually enjoy — a walking group, " +
      "chair stretching, a dance night — and what feels " +
      "possible for their bodies; the answers should pick your " +
      "activities, not the other way around. Then find one or " +
      "two leaders whose warmth outweighs their expertise, walk " +
      "the candidate spaces together, and launch a single " +
      "reliable weekly session before adding more.",
    commonPitfalls:
      "This dies two ways: it turns into a performance — the " +
      "fittest members set the pace, the talk drifts to weight " +
      "and appearance, and the very people it's for quietly " +
      "stop coming — or it gets inconsistent, because nothing " +
      "kills a walking group faster than showing up to a " +
      "cancelled session twice. Skipping the boring safety " +
      "basics is the third: no warm-up, no water, no first-aid " +
      "kit, and one bad fall ends the whole thing.",
    pairsWith: ["disability-support-network", "neighborhood-care-network"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Survey interests and activity levels",
        description:
          "Ask around — at the laundromat, the senior building, the school gate — about what kinds of movement people enjoy and what feels accessible. Let the answers lead: a template full of sports nobody asked for helps no one.",
        hours: 2,
        skills: ["outreach"],
      },
      {
        name: "Recruit activity leaders",
        description:
          "Find volunteers to lead walks, stretching, dance, or pickup games. A welcoming, no-pressure style beats expertise for most activities — but anyone leading something physically demanding should hold the appropriate qualification for it.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Find safe spaces",
        description:
          "Ask about parks, community halls, and school gyms — free or cheap, and reachable without a car. Check each space for a range of bodies and abilities: level ground, seating, shade, bathrooms, and somewhere to shelter if the weather turns.",
        hours: 3,
      },
      {
        name: "Plan inclusive, all-levels programming",
        description:
          "Design every activity so people can join at their own pace and modify freely — a chair option for the stretch, a short loop inside the long walk. Keep the framing on feeling good, moving, and connecting, never on appearance or performance.",
        hours: 3,
      },
      {
        name: "Address safety and health",
        description:
          "Build warm-ups and hydration into every session, keep a stocked first-aid kit on hand, and suggest people new to exercise check with a doctor first. Teach leaders to watch for overexertion and to make slowing down feel normal, not embarrassing.",
        hours: 3,
        skills: ["first aid"],
      },
      {
        name: "Set a schedule and spread the word",
        description:
          "Pick consistent times people can build a habit around and stick to them. Promote widely — flyers, group chats, word of mouth — and say explicitly that all ages, sizes, and abilities are welcome, because plenty of people assume they aren't.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Build community and consistency",
        description:
          "Make the sessions social: names learned, newcomers greeted, a few minutes of chat built in. Celebrate showing up rather than any metric — the connection is what keeps people coming back long after the novelty wears off.",
        hours: 2,
        skills: ["facilitation"],
      },
    ],
  },
  {
    id: "urban-orchard",
    name: "Urban Orchard & Food Forest",
    purpose:
      "Plant fruit and nut trees and perennial food plants on shared land — a food forest that, once established, feeds the neighborhood for free for decades.",
    whoItServes:
      "The whole community, including neighbors who haven't arrived yet — trees planted this year become a long-term source of free fresh food for everyone.",
    whatYoullNeed:
      "Long-term land access (a season-to-season handshake isn't enough for trees), climate-suited trees and plants, volunteers for planting days, and a small crew of stewards committed for years, not months. Confirm water access before anything goes in the ground.",
    setupHours: 21,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "The land conversation comes before everything: talk to " +
      "land trusts, the parks department, faith congregations " +
      "with unused ground — anyone who can commit a site for a " +
      "decade, not a season — and confirm water while you're at " +
      "it. In parallel, find one person with real fruit-tree " +
      "experience to anchor the design, and ask neighbors what " +
      "they'd actually pick and eat, because an orchard of " +
      "fruit nobody wants just feeds the wasps.",
    commonPitfalls:
      "Orchards rarely fail at the planting day — they fail in " +
      "years two and three, when the crowd is gone and nobody " +
      "organized watering, so the young trees quietly die " +
      "their first dry summer. The other killers are shaky " +
      "land deals revoked just as the trees start bearing, and " +
      "harvest fights because nobody agreed on sharing norms " +
      "before the first big crop. Settle the stewardship rota " +
      "and the sharing rules early, while they're still easy.",
    pairsWith: ["community-garden", "gleaning-network", "seed-library"],
    tasks: [
      {
        name: "Secure long-term land access",
        description:
          "Get a durable written agreement — a long lease, a land trust arrangement, a formal city commitment — because trees need decades, not a season-to-season handshake. Confirm reliable water access on the site before you sign anything.",
        hours: 5,
        skills: ["outreach"],
      },
      {
        name: "Plan the planting design",
        description:
          "Choose species suited to your climate and design in food-forest layers: canopy trees, shrubs, and ground cover working together. Plan for pollination partners and for the spacing mature trees will need, not the size of the saplings you plant.",
        hours: 4,
        skills: ["gardening"],
      },
      {
        name: "Source trees and plants",
        description:
          "Line up trees and plants through nurseries, grants, donations, and seasonal bare-root sales — bare-root and young stock cost a fraction of potted mature trees and usually establish better. Order early; good varieties sell out.",
        hours: 3,
      },
      {
        name: "Prepare the site",
        description:
          "Get the ground ready before the trees arrive: improve the soil, lay mulch, set up watering, and mark and clear each planting spot from the design. A prepared site turns a planting day from chaos into an assembly line.",
        hours: 4,
        skills: ["gardening"],
        follows: [1],
      },
      {
        name: "Host planting days",
        description:
          "Run community planting days with clear instructions, so every tree goes in at the right depth with a watering basin and mulch — planted wrong, trees fail slowly and invisibly. Make it festive; a planting day is how the neighborhood starts to feel the orchard is theirs.",
        hours: 5,
        skills: ["gardening"],
        follows: [3],
        recurringCadence: "cycle",
      },
      {
        name: "Set up long-term stewardship",
        description:
          "Organize the unglamorous work that decides whether the orchard lives: watering young trees through their first summers, pruning, mulching, and pest management, year after year. A named rota of committed stewards beats a big list of vague volunteers.",
        hours: 3,
        skills: ["gardening"],
      },
      {
        name: "Plan harvest sharing",
        description:
          "Agree on picking and sharing norms before the first big crop, not after the first argument — who harvests, when, and how much. Route surplus to community fridges, pantries, and shared meals so nothing rots on the branch.",
        hours: 2,
      },
    ],
  },
  {
    id: "new-parent-support",
    name: "Postpartum & New Parent Support Network",
    purpose:
      "Wrap practical support around new and expecting parents — meals on the doorstep, errands run, dishes done, and peers who've been there — through pregnancy and the raw postpartum weeks.",
    whoItServes:
      "New and expecting parents, especially those without family nearby — the weeks after a birth are when support matters most and often arrives least.",
    whatYoullNeed:
      "Volunteers who can cook, run errands, and listen; a meal-train system; a resource directory; and experienced parents as peer supporters. Peer support is not medical or mental health care — postpartum mood disorders are common and serious, so every peer supporter must know the signs and how to gently connect a parent to professional help. And vet anyone who'll enter homes or help with infants before they do either.",
    setupHours: 21,
    defaultCategory: "childcare",
    firstSteps:
      "Start by asking parents who gave birth in the last year " +
      "what would actually have helped — the answers (a meal " +
      "with no visit attached, someone to hold the baby while " +
      "they shower) are more specific than you'd guess. " +
      "Introduce the network to midwives, doulas, and " +
      "pediatric clinics who can offer it to families, recruit " +
      "two or three experienced parents as your first peer " +
      "supporters, and settle your vetting practice before " +
      "anyone crosses a doorstep.",
    commonPitfalls:
      "The classic failure is support that serves the " +
      "supporter: volunteers who arrive on their own schedule, " +
      "stay too long, and offer parenting opinions instead of " +
      "doing the dishes — exhausted parents will quietly stop " +
      "answering the door rather than say so. The graver one " +
      "is a peer missing the signs of postpartum depression " +
      "because nobody trained them to recognize it or gave " +
      "them the words to name it. And support that vanishes " +
      "after two weeks, just when the casseroles stop and the " +
      "hard part starts, isn't support at all.",
    pairsWith: ["diaper-hygiene-bank", "childcare-collective", "welcome-wagon"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Recruit volunteers and peer supporters",
        description:
          "Gather cooks, errand-runners, and — most importantly — experienced parents willing to be peer supporters. The parent who remembers their own third sleepless week offers something no pamphlet can.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Set up a meal-train system",
        description:
          "Build a simple way to coordinate dropped-off meals through the weeks after a birth: a shared calendar, dietary needs and allergies collected once, food labeled and easy to reheat. Doorstep drop-off should be the default — a meal must never oblige a visit.",
        hours: 3,
        skills: ["cooking", "organizing"],
      },
      {
        name: "Offer practical help",
        description:
          "Organize volunteers for the unglamorous load: errands, laundry, dishes, and watching older siblings so a parent can rest or get to an appointment. Ask what's wanted each time rather than assuming — useful help follows the parent's list, not the volunteer's.",
        hours: 3,
        skills: ["childcare"],
      },
      {
        name: "Build a resource directory",
        description:
          "Compile local lactation support, postpartum mental health care, pediatric clinics, and sources of baby supplies — including the diaper bank and childcare collective if your community runs them. Keep it current; a directory of dead phone numbers is worse than none.",
        hours: 4,
        skills: ["data entry"],
      },
      {
        name: "Create peer support circles",
        description:
          "Start small groups where new parents can be honest about how hard it is, with an experienced parent holding the space. Train peers on the signs of postpartum depression and anxiety and on gently, persistently encouraging professional care — never diagnosing, never waiting.",
        hours: 3,
        skills: ["facilitation"],
      },
      {
        name: "Set safety and boundary practices",
        description:
          "Vet every volunteer who'll enter homes or help with infants — references at minimum — and write down the boundaries: parents set the terms, visits are short unless invited to be longer, and no one shows up unannounced. Support should never feel like surveillance.",
        hours: 3,
      },
      {
        name: "Connect to other projects",
        description:
          "Link families to the diaper bank, the childcare collective, and the welcome wagon so one point of contact opens all of it. A new parent shouldn't have to discover each program separately at the most exhausted moment of their life.",
        hours: 2,
        skills: ["outreach"],
      },
    ],
  },
  {
    id: "foster-kinship-support",
    name: "Foster & Kinship Care Support Network",
    purpose:
      "Stand behind foster, kinship, and other caregiving families — clothes and a bed when a child arrives overnight, respite when caregivers are running on empty, and peers who understand the work.",
    whoItServes:
      "Foster parents, grandparents and relatives raising children — kinship caregivers often start with a phone call and a few hours' notice — and the kids in their care.",
    whatYoullNeed:
      "Volunteers, donated goods across every age and size, respite helpers, and partnerships with agencies and schools. Work involving children in care is sensitive and legally governed: vet everyone who works with children, follow mandatory-reporting and confidentiality rules to the letter, and coordinate with the relevant agencies rather than around them.",
    setupHours: 24,
    defaultCategory: "childcare",
    firstSteps:
      "Start with a sit-down at the local foster agency or " +
      "kinship navigator program: learn the rules that govern " +
      "this work — vetting, mandatory reporting, " +
      "confidentiality — before you recruit a single " +
      "volunteer, and let them tell you where the gaps " +
      "actually are. Then ask a few caregiving families what " +
      "they needed in their first week and their first year; " +
      "build toward those answers, not toward a warehouse of " +
      "goods nobody asked for.",
    commonPitfalls:
      "This project can fail loudly or quietly. Loudly: an " +
      "unvetted volunteer around children, or a family's story " +
      "shared without permission — either can harm a child, " +
      "end a placement, and finish the project in a day. " +
      "Quietly: a mountain of unsorted donations while a " +
      "caregiver waits three weeks for a toddler bed, or " +
      "treating the agencies as adversaries until they stop " +
      "referring families. Small, vetted, and coordinated " +
      "beats big and improvised here, every time.",
    pairsWith: ["diaper-hygiene-bank", "free-store", "childcare-collective"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Connect with caregiving families",
        description:
          "Reach caregiving families through agencies, schools, and faith groups — kinship caregivers especially, who often take in a grandchild or niece overnight with no preparation and little official support. Make the first contact an offer, never a screening.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Build a goods and clothing supply",
        description:
          "Collect clothing, beds, car seats, and everyday supplies across the full range of ages and sizes, since caregivers rarely know who's arriving until they arrive. Check safety items carefully — car seats and cribs have expiration dates and recall lists.",
        hours: 4,
        skills: ["organizing"],
      },
      {
        name: "Create a rapid-response supply system",
        description:
          "Pack ready-to-go bags — a few days of clothes, toiletries, and a comfort item like a stuffed animal — sorted by age and size, deliverable within hours of a new placement. A child who arrives with nothing should not wait a week to have something of their own.",
        hours: 3,
        follows: [1],
      },
      {
        name: "Organize respite support",
        description:
          "Arrange safe, properly vetted care so caregivers can rest, keep appointments, or just breathe — caregiver burnout is one of the main reasons placements break down. Coordinate with the agencies on who may provide respite care and under what rules.",
        hours: 4,
        skills: ["childcare"],
      },
      {
        name: "Offer peer support groups",
        description:
          "Host regular gatherings where foster and kinship caregivers can trade experience and honest advice with people who get it — this work is isolating, and the caregiver three streets over may be carrying the same load alone.",
        hours: 3,
        skills: ["facilitation"],
      },
      {
        name: "Build a resource directory",
        description:
          "Compile the services, benefits, and trauma-informed supports caregiving families can draw on, and help them navigate systems that are confusing even to professionals. Kinship caregivers in particular often qualify for help nobody ever told them about.",
        hours: 3,
        skills: ["data entry"],
      },
      {
        name: "Set child safety and privacy practices",
        description:
          "Write down and follow the non-negotiables: vetting for anyone working with children, what mandatory-reporting laws require of your volunteers, and strict privacy for families and kids — no photos, no stories, no details shared without permission.",
        hours: 4,
        skills: ["writing"],
      },
    ],
  },
  {
    id: "weather-survival-outreach",
    name: "Cold & Hot Weather Survival Outreach",
    purpose:
      "Get survival supplies to unhoused neighbors when the weather turns deadly — blankets and hand-warmers in a cold snap, water and electrolytes in a heat wave — carried out to where people actually are.",
    whoItServes:
      "Unhoused and street-connected neighbors exposed to extreme weather — the people for whom a heat wave or cold snap is a life-threatening event, not an inconvenience.",
    whatYoullNeed:
      "Weather-specific supplies, outreach volunteers, planned routes, and current connections to shelters and services. Extreme heat and cold kill: every volunteer must be trained to recognize hypothermia and heat stroke and to call for professional medical help without delay — never to wait and see.",
    setupHours: 24,
    defaultCategory: "mutual_aid_drive",
    firstSteps:
      "Before you buy a single blanket, talk to the outreach " +
      "workers and organizations already walking these routes " +
      "— they hold the trust and the knowledge of where people " +
      "actually are, and they'll tell you what's covered and " +
      "what's missing. Agree with them on how you'll fit in, " +
      "set the forecast thresholds that trigger your rounds, " +
      "and stock the season's supplies while the weather is " +
      "still mild.",
    commonPitfalls:
      "The predictable failure is starting when the weather " +
      "does: supplies sourced mid-heat-wave arrive after the " +
      "danger has passed, and strangers appearing for the " +
      "first time in a crisis get a wary no from people who've " +
      "learned caution the hard way. The dangerous failures " +
      "are volunteers trying to manage a medical emergency " +
      "themselves instead of calling for help immediately, and " +
      "pressuring people to move or accept shelter — offer, " +
      "inform, and respect the answer.",
    pairsWith: ["cooling-warming-center", "harm-reduction-supplies", "resource-hub-dispatch"],
    tasks: [
      {
        name: "Assemble weather-specific kits",
        description:
          "Pack kits matched to the season: blankets, warm socks, hats, gloves, and hand-warmers for cold; water, electrolyte packets, sunscreen, hats, and cooling cloths for heat. Add a card with shelter locations and crisis numbers to every kit.",
        hours: 4,
      },
      {
        name: "Source supplies",
        description:
          "Run donation drives, make bulk buys, and ask stores and congregations for contributions — and do it before the season, because sourcing blankets during the first freeze means arriving late. Stockpile enough to restock mid-season.",
        hours: 4,
        skills: ["outreach", "driving"],
      },
      {
        name: "Map where to reach people",
        description:
          "Work with existing outreach workers to learn where unhoused neighbors actually stay — they hold trust and knowledge built over years, and showing up alongside them beats showing up cold. Keep the map loose and current; people move, especially in bad weather.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Recruit and train outreach volunteers",
        description:
          "Train every volunteer before their first round: respectful engagement that takes no for an answer, personal safety and always working in pairs, and recognizing weather-related medical emergencies. Nobody distributes until they've been trained.",
        hours: 4,
        skills: ["teaching"],
      },
      {
        name: "Build a distribution and route plan",
        description:
          "Plan routes and timing for the days before and during dangerous weather, reaching the most exposed people first — those farthest from services, sleeping outside rather than in vehicles or shelters. Decide in advance what forecast triggers a round.",
        hours: 3,
        skills: ["organizing"],
        follows: [2],
      },
      {
        name: "Connect people to shelters and services",
        description:
          "Carry current, verified information on warming and cooling centers, shelter beds, and the resource hub — hours and rules change constantly, and a referral to a closed door burns trust. Offer connections without pressure; the relationship outlasts any one night.",
        hours: 3,
        skills: ["outreach"],
      },
      {
        name: "Plan for emergencies",
        description:
          "Train every volunteer to recognize hypothermia and heat stroke — confusion, slurred speech, skin hot and dry or cold and clammy — and to call emergency services immediately, not to wait and see. Rehearse what to do while help is coming: shade and water, or blankets and shelter from wind.",
        hours: 3,
        skills: ["first aid"],
      },
    ],
  },
];

export const PROJECT_TEMPLATES_ES: readonly ProjectTemplate[] = [
  {
    id: "community-fridge",
    name: "Refrigerador comunitario y despensa libre",
    purpose:
      "Ofrecer acceso gratuito, las 24 horas, a alimentos y artículos esenciales, sin preguntas.",
    whoItServes:
      "Cualquiera que necesite comida; especialmente útil para personas con horarios irregulares, vecinas y vecinos indocumentados, y quienes no pueden llegar a un banco de alimentos en horario de oficina.",
    whatYoullNeed:
      "Un refrigerador donado, un lugar exterior protegido con un enchufe, un sitio anfitrión y una pequeña rotación de limpieza.",
    setupHours: 18,
    defaultCategory: "food",
    firstSteps:
      "Empieza por el sitio anfitrión, no por el refrigerador. " +
      "Siéntate con la dueña de la tienda, la iglesia o la " +
      "clínica que tienes en mente y hablen de lo menos glamoroso " +
      "— el recibo de luz, qué pasa cuando alguien deja un " +
      "desastre, a quién llaman cuando se descompone — antes de " +
      "conseguir aparato alguno. De paso, pregunta a las " +
      "despensas y grupos de apoyo mutuo que ya trabajan cerca " +
      "qué huecos ven, para que el refrigerador llene uno en vez " +
      "de duplicarlos.",
    commonPitfalls:
      "Los refrigeradores comunitarios casi nunca mueren por " +
      "falta de donaciones — mueren cuando nadie es claramente " +
      "responsable de la limpieza, el refrigerador se pone feo y " +
      "el sitio anfitrión pide en voz baja que se lo lleven. Pon " +
      "nombres en la rotación antes del día de apertura, y cuida " +
      "la relación con el sitio anfitrión como lo que realmente " +
      "estás manteniendo, no solo el aparato.",
    pairsWith: ["gleaning-network", "food-preservation", "community-meal"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Encuentra un sitio anfitrión con electricidad y tránsito de gente",
        description:
          "Acércate a pequeños negocios, iglesias, clínicas o centros comunitarios. Pregunta si dejan colocar un refrigerador bajo su alero y enchufarlo (la electricidad suele costar unos pocos dólares al mes — ofrece cubrirlo). Consigue un sí por escrito, aunque sea sencillo.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Consigue un refrigerador y un refugio resistente al clima",
        description:
          "Pide un refrigerador en buen estado en grupos locales. Construye o consigue un mueble o cobertizo de madera sencillo a su alrededor para protegerlo de la lluvia y el sol. Ánclalo para que no se vuelque. Incluye buscarlo, transportarlo y armar el refugio.",
        hours: 8,
        skills: ["carpintería", "conducir"],
        follows: [0],
      },
      {
        name: "Define las reglas y etiqueta todo",
        description:
          "Coloca un cartel claro y multilingüe: toma lo que necesites, deja lo que puedas, nada caducado, ni conservas caseras, ni carne cruda. Añade etiquetas y un marcador para que la gente pueda anotar la fecha en los productos.",
        hours: 1.5,
        skills: ["redacción", "traducción"],
        follows: [1],
      },
      {
        name: "Arma una rotación de limpieza y reabastecimiento",
        description:
          "Crea un calendario semanal compartido. Cada turno son unos 15 minutos: limpia las superficies, retira lo dañado o vencido y anota lo que se está acabando. Mantén productos de limpieza en el sitio.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organización"],
        follows: [1],
      },
      {
        name: "Construye relaciones con quienes donan",
        description:
          "Pide a panaderías, tiendas, restaurantes y mercados de productores donaciones regulares al final del día. Coordina a una persona voluntaria para recogerlas. Lleva nota de qué fuentes son confiables.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Establece un contacto para problemas",
        description:
          "Pon un teléfono o correo en el refrigerador para avisos como \"se descompuso / no hay luz / una pregunta\". Decide quién responde y en cuánto tiempo.",
        hours: 0.5,
      },
    ],
  },
  {
    id: "community-garden",
    name: "Huerto comunitario / parcela compartida",
    purpose:
      "Cultivar juntas y juntos comida fresca y crear un espacio de encuentro.",
    whoItServes:
      "Vecinas y vecinos sin patio, personas presionadas por el costo de los alimentos y cualquiera que quiera vínculo y un motivo para estar al aire libre.",
    whatYoullNeed:
      "Un terreno (puede ser un lote baldío o una azotea), tierra o camas de cultivo, acceso a agua, semillas y un grupo base de 5 a 10 personas constantes.",
    setupHours: 25,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Antes de tocar la tierra, habla con dos grupos de " +
      "personas: quien sea dueña del terreno, y las vecinas y " +
      "vecinos que viven justo al lado — su bendición pesa tanto " +
      "como el contrato. Después reúne a tu grupo base y tengan " +
      "pronto la conversación sobre cómo se comparte; saber si " +
      "serán parcelas individuales o cosecha comunal cambia todo " +
      "lo que van a construir.",
    commonPitfalls:
      "Los huertos no suelen morir en primavera — mueren en las " +
      "semanas más calurosas, cuando la rotación de riego se " +
      "desmorona en silencio y las camas se secan. El otro " +
      "peligro lento es que una sola persona lo trate como su " +
      "huerto con ayudantes; pongan por escrito cómo se toman las " +
      "decisiones mientras todavía se llevan bien.",
    pairsWith: ["seed-library", "community-composting", "food-preservation"],
    tasks: [
      {
        name: "Asegura el terreno y el permiso",
        description:
          "Identifica un lote baldío, un patio de iglesia, un terreno escolar o una esquina de parque sin uso. Encuentra a quien sea dueña o dueño (registros municipales, o simplemente pregunta). Consigue un permiso o contrato por escrito, aunque sea un acuerdo de un año estrechado por escrito, y confirma el acceso al agua.",
        hours: 6,
        skills: ["difusión"],
      },
      {
        name: "Analiza el suelo y planea las camas",
        description:
          "Envía una prueba de suelo económica a un servicio de extensión local para descartar plomo u otros contaminantes. Si el suelo está mal, planea camas elevadas con tierra limpia. Esboza dónde irán camas, caminos y un rincón de herramientas.",
        hours: 2,
        skills: ["jardinería"],
        follows: [0],
      },
      {
        name: "Reúne materiales y construye",
        description:
          "Junta madera o usa camas de pacas de paja o tipo \"keyhole\", composta y mantillo. Organiza un día de construcción; muchas manos levantan camas rápido. Instala una manguera o barriles de lluvia.",
        hours: 10,
        skills: ["carpintería"],
        follows: [0, 1],
      },
      {
        name: "Decidan cómo se comparte",
        description:
          "Acuerden en grupo: parcelas individuales, cosecha completamente comunal, o una mezcla. Pongan por escrito cómo se reparte lo cosechado y cómo se toman las decisiones.",
        hours: 1,
        skills: ["facilitación"],
      },
      {
        name: "Siembra según el clima y la temporada",
        description:
          "Elige cultivos fáciles y de buen rendimiento para tu zona (verduras de hoja, frijoles, calabaza, tomate, hierbas). Escalona las siembras para que las cosechas no caigan todas al mismo tiempo. Etiqueta los surcos.",
        hours: 4,
        recurringCadence: "cycle",
        skills: ["jardinería"],
        follows: [2],
      },
      {
        name: "Organiza una rotación de riego y deshierbe",
        description:
          "Las plantas mueren más por descuido que por otra cosa. Arma un calendario compartido sencillo; liga las tareas a recordatorios fáciles. Mantén el compromiso ligero para que nadie se queme.",
        hours: 1,
        skills: ["organización"],
        follows: [4],
      },
      {
        name: "Planea la cosecha y los excedentes",
        description:
          "Decidan los días de cosecha. Manden lo que sobre al refrigerador comunitario, a vecinas y vecinos o a un puesto gratuito en la entrada. Guarden algunas semillas para el año siguiente.",
        hours: 1,
        recurringCadence: "cycle",
        follows: [4],
      },
    ],
  },
  {
    id: "tool-lending-library",
    name: "Biblioteca de herramientas y equipo",
    purpose:
      "Permitir que vecinas y vecinos pidan prestadas herramientas y equipo en lugar de comprarlos, para ahorrar dinero y reducir desperdicio.",
    whoItServes:
      "Personas que rentan, quienes acaban de comprar casa, aficionadas y aficionados, y cualquiera que haga reparaciones o proyectos de vez en cuando.",
    whatYoullNeed:
      "Un espacio de almacenamiento, herramientas donadas, un sistema sencillo de préstamo y un par de \"bibliotecarias\" o \"bibliotecarios\".",
    setupHours: 20,
    defaultCategory: "infrastructure",
    firstSteps:
      "Antes de juntar un solo taladro, habla con la persona que " +
      "ofrece el espacio sobre lo que de verdad implica convivir " +
      "con una biblioteca de herramientas — ruido, cosas que se " +
      "acumulan, gente desconocida en la puerta durante el " +
      "horario. Luego pregunta a tus vecinas y vecinos qué " +
      "pedirían prestado en realidad; una lista de diez " +
      "herramientas solicitadas vale más que un garaje lleno de " +
      "donaciones que nadie quiere.",
    commonPitfalls:
      "Las bibliotecas de herramientas mueren del silencio " +
      "después de la fecha de devolución: nadie da seguimiento, " +
      "las herramientas se vuelven préstamos permanentes y los " +
      "estantes se vacían. Una rutina amable de recordatorios " +
      "importa más que una política estricta de retrasos — y " +
      "aprendan a decir que no a las donaciones, o se convertirán " +
      "en el tiradero de herramientas rotas del barrio.",
    pairsWith: ["library-of-things", "repair-cafe", "weatherization-brigade"],
    learnMore: ["confirm-exchange"],
    tasks: [
      {
        name: "Encuentra dónde guardar y un horario de atención",
        description:
          "Sirve una caseta, una cochera, un clóset en un centro comunitario o un contenedor. Elige de 2 a 4 horas fijas a la semana para que la gente sepa cuándo ir.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Reúne y ordena el inventario",
        description:
          "Haz una convocatoria de donaciones (la gente tiene taladros y escaleras duplicados por todos lados). Limpia, prueba y etiqueta cada herramienta. Descarta o repara lo que esté inseguro.",
        hours: 6,
        skills: ["conducir"],
        follows: [0],
      },
      {
        name: "Cataloga todo",
        description:
          "Usa una hoja de cálculo gratuita o una app de biblioteca de préstamos. Registra cada artículo, su estado y una foto. Numera las herramientas para que sea fácil seguirles la pista.",
        hours: 4,
        skills: ["captura de datos"],
        follows: [1],
      },
      {
        name: "Escribe las reglas de préstamo",
        description:
          "Define el plazo (por ejemplo, una semana), cuántas piezas a la vez y la política de devolución o retraso. Que sea flexible — esto se trata de confianza. Anota qué herramientas requieren una breve explicación de seguridad.",
        hours: 1,
        skills: ["redacción"],
      },
      {
        name: "Arma el registro de salida",
        description:
          "Una tablilla o un formulario sencillo: nombre, contacto, artículo, fecha de salida, fecha de devolución. Toma una foto rápida del estado de la herramienta al salir para evitar disputas.",
        hours: 2,
        skills: ["captura de datos"],
        follows: [2, 3],
      },
      {
        name: "Capacita a quienes atienden",
        description:
          "Lleva a las personas voluntarias por el catálogo, los pasos de préstamo y la seguridad básica (lentes de protección, uso de escaleras). Ten una hoja de referencia de una sola página en el mostrador.",
        hours: 2,
        skills: ["enseñanza"],
        follows: [4],
      },
      {
        name: "Mantén y haz crecer la biblioteca",
        description:
          "Revisa las herramientas devueltas, afila y aceita con regularidad, y observa qué piden más para saber qué sumar después.",
        hours: 2,
        skills: ["reparación de herramientas"],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "neighborhood-care-network",
    name: "Red de cuidado vecinal",
    purpose:
      "Asegurarse de que las personas vecinas en aislamiento sean visitadas, escuchadas y acompañadas.",
    whoItServes:
      "Personas mayores, vecinas y vecinos con discapacidad o enfermedad crónica, madres y padres recientes, y cualquiera que viva en soledad.",
    whatYoullNeed:
      "Una lista de personas voluntarias, una forma de emparejarlas con quienes necesitan compañía y una rutina de contacto. Las personas voluntarias son vecinas, no profesionales del cuidado — revisen a quien haga visitas a domicilio, nunca dejen que una persona voluntaria maneje sola el dinero de alguien, y acuerden de antemano cuándo llamar a la familia o a los servicios de emergencia.",
    setupHours: 18,
    defaultCategory: "emotional_support",
    firstSteps:
      "Empieza escuchando, no reclutando: habla con las vecinas y " +
      "vecinos que esperas apoyar sobre lo que realmente quieren " +
      "— una llamada semanal, un aventón, compañía — porque una " +
      "red construida sobre suposiciones se siente como " +
      "vigilancia. Al mismo tiempo, ten la conversación honesta " +
      "con las primeras personas voluntarias sobre revisión de " +
      "referencias y límites, para que cuando llegue el primer " +
      "emparejamiento las reglas se sientan como cuidado y no " +
      "como desconfianza.",
    commonPitfalls:
      "Las redes de cuidado rara vez fracasan por falta de gente " +
      "voluntaria — queman a las tres personas que siempre dicen " +
      "que sí mientras las demás esperan a que les pidan. Reparte " +
      "los emparejamientos a propósito, sostén los espacios de " +
      "desahogo para voluntarias y voluntarios aunque todo " +
      "parezca bien, y no dejes que los contactos conviertan a " +
      "una vecina en un expediente en vez de una persona.",
    pairsWith: ["rides-transportation", "disability-support-network", "welcome-wagon"],
    learnMore: ["message-someone"],
    tasks: [
      {
        name: "Identifica quién vive cerca",
        description:
          "Con discreción, identifica a personas que puedan estar aisladas, por boca a boca, administración de edificios, clínicas y grupos religiosos. Nunca des por hecho la necesidad — invita, no señales.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Convoca y filtra a las personas voluntarias",
        description:
          "Busca a quienes puedan comprometerse a un contacto regular. Para visitas en casa o apoyo a personas adultas vulnerables, haz revisiones básicas de referencias y nunca dejes que una sola persona voluntaria maneje el dinero de alguien.",
        hours: 5,
        skills: ["difusión", "entrevistas"],
      },
      {
        name: "Empareja con cuidado",
        description:
          "Empareja por idioma, cercanía y comodidad. Pregúntale a cada parte qué desea — una llamada semanal, una vuelta al súper, una charla en el portal — y respeta ese límite.",
        hours: 2,
        skills: ["organización"],
        follows: [0, 1],
      },
      {
        name: "Define un ritmo de contacto",
        description:
          "Acuerden la frecuencia y el medio (llamada, mensaje, tocar la puerta). Dale a las personas voluntarias un guion corto para el primer contacto para que se sienta cálido, no clínico.",
        hours: 1,
        follows: [2],
      },
      {
        name: "Crea un plan de escalamiento",
        description:
          "Decide de antemano qué hacer si alguien no responde o parece estar en crisis: a quién llamar, cuándo involucrar a familia o a servicios de emergencia y cómo registrarlo. Mantenlo por escrito y sencillo.",
        hours: 2,
        skills: ["redacción"],
      },
      {
        name: "Coordina apoyo práctico",
        description:
          "Lleva nota de necesidades recurrentes — traslados a citas, recoger recetas, palear nieve — y conéctalas con otras personas voluntarias o proyectos de tu red.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organización"],
      },
      {
        name: "Cuida también a quienes acompañan",
        description:
          "Organiza un espacio de desahogo para las personas voluntarias. El trabajo de cuidado desgasta; rota tareas y atiende las señales de agotamiento.",
        hours: 2,
        skills: ["facilitación"],
        recurringCadence: "month",
      },
    ],
  },
  {
    id: "emergency-preparedness",
    name: "Red de preparación ante emergencias y desastres",
    purpose:
      "Ayudar al vecindario a prepararse y responder ante desastres (olas de calor, tormentas, inundaciones, apagones) cuando la ayuda oficial llega lento.",
    whoItServes:
      "Todas y todos, con prioridad a quienes no pueden evacuar fácilmente o dependen de la electricidad para equipo médico.",
    whatYoullNeed:
      "Una lista de contactos, un punto de encuentro, insumos básicos y un plan de comunicación que funcione sin internet. Esta red complementa a los servicios oficiales de emergencia — no los sustituye. En una situación que ponga en riesgo la vida, llamen siempre primero a los servicios de emergencia.",
    setupHours: 30,
    defaultCategory: "organizing",
    firstSteps:
      "Construye el plan alrededor de la gente para quien es: " +
      "toca las puertas de vecinas y vecinos que dependen de " +
      "oxígeno, de medicinas refrigeradas o que viven en pisos " +
      "altos sin elevador, y pregúntales cómo se ve una semana " +
      "mala para ellas. Después habla con quien controle tu " +
      "posible punto seguro y con cualquier grupo de emergencias " +
      "que ya exista (protección civil, los bomberos) para que tu " +
      "red llene los huecos alrededor de la respuesta oficial en " +
      "vez de duplicarla.",
    commonPitfalls:
      "Estas redes no fallan durante el desastre — fallan en los " +
      "años tranquilos de antes, cuando la cadena de contactos se " +
      "vuelve vieja, los teléfonos cambian y el plan vive en la " +
      "laptop de una sola persona. Impriman todo, refresquen la " +
      "lista con un ritmo fijo en el calendario y practiquen al " +
      "menos una vez; el primer uso real nunca debería ser el " +
      "primer uso.",
    pairsWith: ["cooling-warming-center", "community-first-aid-training", "community-wifi-mesh"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Mapea los riesgos de tu vecindario",
        description:
          "Enumera los desastres más probables en tu zona. Anota puntos vulnerables: personas en pisos altos sin ascensor, quienes usan oxígeno o medicamentos refrigerados, edificios con una sola salida.",
        hours: 4,
      },
      {
        name: "Arma un árbol de contactos",
        description:
          "Junta datos de contacto, manzana por manzana, con consentimiento. Designa varias \"jefas\" o \"jefes\" de cuadra que revisen unos 10 hogares cada quien. Guarda una copia en papel — los teléfonos e internet fallan en los desastres.",
        hours: 8,
        skills: ["difusión", "captura de datos"],
      },
      {
        name: "Planea comunicación sin internet",
        description:
          "Decidan cómo se comunicarán sin señal celular: tocar puertas, un punto de encuentro, silbatos o radios. Imprime y reparte el plan.",
        hours: 3,
        skills: ["redacción"],
        follows: [1],
      },
      {
        name: "Junta insumos compartidos",
        description:
          "Arma un kit comunitario: agua, primeros auxilios, linternas, baterías, un radio de pilas o manivela, cobijas y herramientas básicas. Guárdalo donde varias personas tengan acceso.",
        hours: 5,
        skills: ["conducir"],
      },
      {
        name: "Identifica lugares seguros",
        description:
          "Encuentra sitios que puedan servir como centro de enfriamiento o calefacción, o de carga eléctrica (un salón con generador, un parque con sombra). Confirma el acceso con anticipación.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Hagan un simulacro o una noche informativa",
        description:
          "Organiza una sesión sobre mochilas de emergencia, cómo cerrar servicios y el árbol de contactos. Practiquen una vez para no estar aprendiendo durante la emergencia real.",
        hours: 5,
        skills: ["enseñanza", "facilitación"],
        follows: [1, 2],
      },
      {
        name: "Define los roles para \"el día de\"",
        description:
          "Asigna por adelantado quién revisa primero a quienes son médicamente vulnerables, quién abre el espacio seguro y quién coordina. Revisen y actualicen el plan dos veces al año.",
        hours: 2,
        skills: ["organización"],
        follows: [4],
      },
    ],
  },
  {
    id: "free-store",
    name: "Tienda gratis / intercambio de objetos",
    purpose:
      "Redistribuir ropa, artículos del hogar y suministros de forma gratuita.",
    whoItServes:
      "Cualquiera — personas en aprietos, personas que están desahogando su casa y el medio ambiente.",
    whatYoullNeed:
      "Un espacio (incluso temporal), mesas o percheros, personas voluntarias para clasificar y un horario regular.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Habla primero con el sitio anfitrión sobre las realidades " +
      "honestas — montones de donaciones, gente entrando y " +
      "saliendo, cómo queda el salón a la mañana siguiente — y " +
      "luego con una tienda de segunda mano o una organización " +
      "cercana sobre lo que ya les llega de sobra, para saber qué " +
      "le falta de verdad a tu barrio. Si puedes, pasa una hora " +
      "en una tienda gratuita que ya funcione antes de tu primer " +
      "evento; el flujo de recepción y exhibición es más fácil de " +
      "copiar que de inventar.",
    commonPitfalls:
      "Las tiendas gratuitas se ahogan antes de pasar hambre: sin " +
      "una lista firme de sí y no en la puerta, las personas " +
      "voluntarias se pasan cada hora clasificando donaciones " +
      "rotas y sucias en vez de recibir a la gente. Y decidan a " +
      "dónde va lo que sobra antes de que termine el primer " +
      "evento — un montón de cosas sin reclamar y sin plan de " +
      "salida es la forma clásica de perder el espacio anfitrión.",
    pairsWith: ["repair-cafe", "library-of-things", "mutual-aid-moving-crew"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Elige el formato y el espacio",
        description:
          "Decidan entre una tienda gratis permanente, una recurrente tipo pop-up o un intercambio de un solo día. Pidan prestado un salón, un local o un quiosco en un parque. Una fecha que se repite crea hábito.",
        hours: 2,
      },
      {
        name: "Define qué se acepta como donación",
        description:
          "Acepten solo cosas limpias, funcionales y usables. Publica una lista clara de \"sí\" y \"no\" (sin aparatos descompuestos, sin ropa manchada, sin artículos de bebé retirados del mercado). Esto ahorra muchísimo tiempo de clasificación.",
        hours: 0.5,
        skills: ["redacción"],
      },
      {
        name: "Organiza recepción y clasificación",
        description:
          "Arma estaciones: recibir, clasificar por categoría y preparar para exhibir. Ten un plan para lo que no puedan usar (donar a otra parte o reciclar).",
        hours: 2,
        skills: ["organización"],
        follows: [0, 1],
      },
      {
        name: "Exhibe para que la gente elija con dignidad",
        description:
          "Cuelga la ropa por talla, agrupa los artículos del hogar, mantén el espacio ordenado y acogedor. Sin solicitud, sin pruebas de necesidad — solo toma lo que vayas a usar.",
        hours: 1.5,
        skills: ["diseño"],
        follows: [2],
      },
      {
        name: "Cubran el evento",
        description:
          "Asigna a personas que reciban, clasifiquen y respondan preguntas. Un trato amable, sin juicios, es todo el punto.",
        hours: 3,
        skills: ["organización"],
        recurringCadence: "event",
      },
      {
        name: "Gestiona lo que sobra",
        description:
          "Acuerden con anticipación a dónde van los artículos que nadie tomó tras cada evento (una organización aliada, reciclaje textil) para que el espacio quede limpio.",
        hours: 1,
        skills: ["conducir"],
      },
    ],
  },
  {
    id: "skill-share",
    name: "Intercambio de saberes y clases gratuitas",
    purpose:
      "Que vecinas y vecinos enseñen y aprendan entre sí, sin costo — cocina, reparaciones, idiomas, presupuestos, primeros auxilios, habilidades digitales.",
    whoItServes:
      "Todas y todos; especialmente quienes no pueden pagar clases y aquellas personas cuyo conocimiento pocas veces se reconoce.",
    whatYoullNeed:
      "Un espacio, personas con ganas de enseñar y una manera de publicar el calendario.",
    setupHours: 9,
    defaultCategory: "education",
    firstSteps:
      "El proyecto empieza con las conversaciones de dos " +
      "preguntas, no con el local: pregunta a la gente qué podría " +
      "enseñar y qué le encantaría aprender, y pon especial " +
      "atención a las vecinas y vecinos cuyo conocimiento rara " +
      "vez se trata como experiencia valiosa. Tu primera tarea " +
      "real es tomarte un café con esa persona nerviosa que " +
      "podría enseñar y convencerla de que su sesión no tiene que " +
      "ser una cátedra.",
    commonPitfalls:
      "Los intercambios de saberes se apagan cuando las mismas " +
      "dos personas seguras terminan enseñándolo todo y el " +
      "calendario se acomoda en silencio a las tardes libres de " +
      "quienes organizan y no a las de quienes asisten. Sigue " +
      "invitando a personas que enseñan por primera vez, pregunta " +
      "quién falta en la sala, y trata una sesión de cinco " +
      "personas como un éxito, porque lo es.",
    pairsWith: ["time-bank", "digital-literacy", "repair-cafe"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Pregunta por saberes e intereses",
        description:
          "Hazles dos preguntas a las personas integrantes: ¿qué podrías enseñar? y ¿qué te encantaría aprender? Reúne las respuestas en un formulario sencillo. Donde se cruzan está tu programa.",
        hours: 1.5,
        skills: ["difusión"],
      },
      {
        name: "Convoca y acompaña a quienes enseñan",
        description:
          "Recuérdales que \"enseñar\" puede ser informal. Ayúdales a esbozar una sesión de una hora y reunir materiales. Empareja a quien dé clase por primera vez con alguien que la acompañe.",
        hours: 3,
        skills: ["enseñanza", "facilitación"],
        follows: [0],
      },
      {
        name: "Encuentra espacio y horario",
        description:
          "Usa una sala de biblioteca, un centro comunitario, un parque o la sala de alguien. Elige horarios recurrentes para que se vuelva rutina.",
        hours: 1.5,
      },
      {
        name: "Arma un calendario",
        description:
          "Lista las sesiones con fecha, tema, persona que enseña y qué llevar. Publícalo donde la gente ya mira. Mantén la inscripción ligera o de entrada libre.",
        hours: 1.5,
        recurringCadence: "month",
        skills: ["organización"],
        follows: [1, 2],
      },
      {
        name: "Hazlo accesible",
        description:
          "Considera necesidades de idioma, cuidado de infancias, acceso físico y horarios para personas que trabajan. Pregúntales a quienes asisten qué les ayudaría a llegar.",
        hours: 1.5,
        skills: ["accesibilidad", "traducción"],
      },
    ],
  },
  {
    id: "bulk-buying-coop",
    name: "Cooperativa de compra de alimentos al mayoreo",
    purpose:
      "Juntar pedidos para comprar comida y básicos al mayoreo a precios más bajos.",
    whoItServes:
      "Hogares apretados por los precios del súper, familias numerosas y vecindarios sin acceso fácil a comida.",
    whatYoullNeed:
      "Un grupo comprometido de hogares, una fuente mayorista, un espacio para recibir y clasificar, y alguien que gestione los pedidos.",
    setupHours: 20,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Reúne a tus hogares antes de llamar a proveedor alguno, y " +
      "ten primero la conversación incómoda sobre el dinero: " +
      "cuánto puede comprometer cada quien, cómo se paga antes de " +
      "hacer el pedido y qué significa saltarse un ciclo. Una " +
      "llamada con un club de compras que ya funcione — la " +
      "mayoría comparte con gusto su hoja de cálculo y sus " +
      "cicatrices — te ahorrará una temporada de prueba y error.",
    commonPitfalls:
      "Las cooperativas de compra mueren por fricciones de dinero " +
      "y por agotamiento de quien coordina: alguien pone el " +
      "dinero por adelantado y lo resiente, un pedido queda sin " +
      "pagar, o una sola persona carga cada ciclo en silencio " +
      "hasta que renuncia y todo se detiene. Cobren antes de " +
      "pedir, sin excepciones, y roten la coordinación desde el " +
      "segundo ciclo, no algún día.",
    pairsWith: ["community-market", "food-preservation"],
    tasks: [
      {
        name: "Junta a tu grupo de compra",
        description:
          "Reúne suficientes hogares para llegar al mínimo del proveedor (suelen ser entre 8 y 15). Acuerden un ciclo de compra (semanal, quincenal, mensual).",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Encuentra a un proveedor",
        description:
          "Contacta mayoristas de alimentos, cooperativas de productoras y productores, proveedores de restaurantes o clubes de compra. Compara mínimos de pedido, opciones de entrega y precios. Confirma qué básicos manejan.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Arma el sistema de pedidos",
        description:
          "Usen una hoja de cálculo o un formulario donde cada hogar anote sus cantidades antes de la fecha de cierre. Designa a una persona que sume y haga el pedido.",
        hours: 3,
        skills: ["captura de datos", "organización"],
        follows: [1],
      },
      {
        name: "Maneja el dinero con transparencia",
        description:
          "Cobren por adelantado (antes de hacer el pedido para no andar adelantando efectivo). Lleven cada peso en un libro compartido. Sumen un pequeño colchón opcional para mermas, no para ganancia.",
        hours: 2,
        skills: ["contabilidad"],
      },
      {
        name: "Organiza entrega y espacio de clasificación",
        description:
          "Elijan un lugar para recibir el pedido a granel — una cochera, un salón, una entrada. Programen suficientes manos para el día de descarga.",
        hours: 3,
        skills: ["organización"],
        follows: [1],
      },
      {
        name: "Reparte los pedidos con justicia",
        description:
          "Pongan estaciones de clasificación con básculas para granos y verduras a granel. Imprime la lista de cada hogar de antemano. Revisen dos veces antes de la entrega.",
        hours: 3,
        skills: ["organización"],
        follows: [2, 4],
        recurringCadence: "cycle",
      },
      {
        name: "Roten el trabajo",
        description:
          "La coordinación, la clasificación y la recogida deben rotar para que ninguna persona cargue con todo. Revisen los precios y la confiabilidad del proveedor cada ciclo.",
        hours: 1,
        recurringCadence: "cycle",
      },
    ],
  },
  {
    id: "repair-cafe",
    name: "Café de reparaciones",
    purpose:
      "Arreglar cosas rotas — ropa, electrónicos, bicicletas, muebles — sin costo, en lugar de tirarlas.",
    whoItServes:
      "Cualquiera con algo roto y sin dinero o habilidad para arreglarlo; mantiene fuera del basurero cosas que todavía sirven.",
    whatYoullNeed:
      "Personas voluntarias con buena mano, herramientas básicas, un espacio con mesas y electricidad, y una fecha recurrente.",
    setupHours: 14,
    defaultCategory: "skilled_labor",
    suggestsWorkDays: true,
    firstSteps:
      "Recluta a tus primeras dos o tres personas reparadoras " +
      "antes que nada — la vecina que cose, el que arregla bicis " +
      "— porque una fecha y un local no significan nada sin " +
      "ellas. Después recorran juntos el espacio hablando de " +
      "mesas, electricidad y luz, y si hay un café de reparación " +
      "en un pueblo cercano, visita una sesión; el flujo de " +
      "recepción es la parte que vale la pena copiar.",
    commonPitfalls:
      "Los cafés de reparación se convierten sin querer en " +
      "talleres gratuitos de encargo: la gente deja sus cosas y " +
      "se va, las personas reparadoras se vuelven técnicas sin " +
      "paga, y quien sabe de electrónica se quema primero. Sostén " +
      "la regla de que cada quien acompaña su propia reparación, " +
      "y avisa con claridad que algunas cosas no tienen arreglo — " +
      "una decepción manejada desde el inicio es más fácil que un " +
      "reclamo después.",
    pairsWith: ["tool-lending-library", "community-bike-workshop", "free-store"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Convoca a quienes reparan, por especialidad",
        description:
          "Busca a personas buenas para coser, electrónica pequeña, bicis, electrodomésticos y carpintería. Solo necesitas una o dos por categoría para empezar.",
        hours: 4,
        skills: ["reparación", "electrónica", "costura"],
      },
      {
        name: "Arma estaciones de reparación",
        description:
          "Cada estación necesita una mesa, las herramientas adecuadas, buena luz y electricidad. Agrupa reparaciones parecidas. Identifica las estaciones con claridad.",
        hours: 3,
        recurringCadence: "session",
        skills: ["organización"],
      },
      {
        name: "Pon una fecha recurrente",
        description:
          "Una vez al mes suele funcionar bien. Elige una sede estable — biblioteca, makerspace, salón comunitario — para que la gente sepa a dónde llevar sus cosas.",
        hours: 1,
      },
      {
        name: "Diseña el flujo de recepción",
        description:
          "Una persona recibe a cada visitante y su objeto, y los canaliza con quien repara. Aclara desde el inicio: las personas se quedan y ayudan con su propia reparación cuando pueden; es un espacio para aprender, no un buzón de objetos.",
        hours: 2,
        skills: ["redacción"],
      },
      {
        name: "Gestiona seguridad y expectativas",
        description:
          "Avisa que algunos objetos no se podrán salvar y que las reparaciones se intentan, no se garantizan. Tengan prácticas seguras para electricidad y baterías. Mantengan un botiquín a la mano.",
        hours: 2,
      },
      {
        name: "Mantén surtidas piezas y consumibles comunes",
        description:
          "Ten a la mano hilo, fusibles, pegamento, sujetadores, cámaras y parches. Anota qué se usa para reabastecer.",
        hours: 2,
        recurringCadence: "session",
        follows: [0],
      },
    ],
  },
  {
    id: "rides-transportation",
    name: "Apoyo de transporte y aventones",
    purpose:
      "Llevar a vecinas y vecinos a citas médicas, al súper y a trámites esenciales cuando el transporte y el dinero son obstáculos.",
    whoItServes:
      "Personas sin auto, vecinas y vecinos con discapacidad, personas mayores y cualquiera atrapada en un hueco de transporte.",
    whatYoullNeed:
      "Personas voluntarias que manejen, un método para pedir y despachar viajes, y reglas claras de seguridad y seguros. Manejar llevando a vecinas y vecinos es una responsabilidad seria — confirmen la licencia y el seguro de cada persona que maneje, revisen a quienes llevarán a personas vulnerables y nunca usen un aventón voluntario en lugar de una ambulancia en una emergencia médica.",
    setupHours: 18,
    defaultCategory: "transport",
    firstSteps:
      "Dos rondas de conversaciones van antes del primer viaje: " +
      "siéntate con cada persona que quiera manejar para " +
      "confirmar licencia y seguro y hablar con honestidad de la " +
      "revisión de antecedentes, y habla con quienes necesitan " +
      "los viajes — y con los centros de personas mayores y las " +
      "clínicas que las conocen — sobre destinos, horarios y " +
      "necesidades de movilidad reales. La conversación de " +
      "revisión es más fácil como norma fundadora que como regla " +
      "impuesta después.",
    commonPitfalls:
      "Las redes de aventones fallan en el despacho, no al " +
      "volante: las solicitudes caen en el teléfono de una sola " +
      "persona hasta agotarla, y las mismas dos personas " +
      "confiables reciben cada pedido mientras a otras no se les " +
      "vuelve a llamar después de un solo no. Roten la " +
      "coordinación, repartan las solicitudes a propósito y nunca " +
      "dejen la pregunta del seguro para después del primer " +
      "golpe.",
    pairsWith: ["health-navigation", "community-bike-workshop", "court-support"],
    learnMore: ["claim-post"],
    tasks: [
      {
        name: "Convoca y revisa a quienes manejan",
        description:
          "Confirma que cada persona tenga licencia vigente, seguro y un vehículo seguro. Para viajes con personas vulnerables, haz revisiones de referencias o de antecedentes según las normas de tu zona.",
        hours: 5,
        skills: ["conducir"],
      },
      {
        name: "Resuelve seguros y responsabilidad",
        description:
          "Revisa qué cubre el seguro personal de cada persona en un trayecto voluntario. Considera un consentimiento sencillo y consulta a una clínica de asistencia legal local — esto protege a todas las partes.",
        hours: 4,
        skills: ["trámites"],
      },
      {
        name: "Arma un sistema de solicitudes",
        description:
          "Elige un solo canal para pedir viajes (línea telefónica, formulario, chat de grupo) con un tiempo de anticipación (por ejemplo, 48 horas). Registra hora de recogida, ubicaciones, necesidades de movilidad y datos de contacto.",
        hours: 2,
        skills: ["organización", "tecnología"],
      },
      {
        name: "Define una rutina de despacho",
        description:
          "Ten a una persona coordinadora (que rote) que empareje solicitudes con personas que manejen y confirme con ambas partes el día anterior. Mantén una lista de respaldo para cancelaciones.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organización"],
        follows: [0, 2],
      },
      {
        name: "Define qué se cubre",
        description:
          "Decidan qué viajes entran (médicos, súper, trámites esenciales) y su zona de servicio. Sean claras y claros sobre tiempos de espera y si quienes manejan ayudan con las bolsas.",
        hours: 1,
        skills: ["facilitación"],
      },
      {
        name: "Maneja los gastos",
        description:
          "Decidan cómo se cubre la gasolina — un pequeño fondo común, aportes opcionales de quien viaja o nada. Que sea transparente y que nunca se vuelva una barrera para quien necesita el viaje.",
        hours: 2,
        follows: [4],
      },
      {
        name: "Mantén seguras a quienes viajan y a quienes manejan",
        description:
          "Establezcan normas: quien maneja no entra a casas sin acompañamiento, no se maneja dinero más allá de los gastos acordados, y se hace un seguimiento después de viajes con personas vulnerables. Registren cada viaje.",
        hours: 2,
        follows: [0],
      },
    ],
  },
  {
    id: "tenant-union",
    name: "Sindicato de inquilinas e inquilinos y red de defensa contra desalojos",
    purpose:
      "Organizar a quienes rentan para defenderse de desalojos, condiciones inseguras y aumentos injustos de renta mediante la acción colectiva.",
    whoItServes:
      "Inquilinas e inquilinos, especialmente en edificios con caseros negligentes o ausentes, y cualquiera que enfrente un desalojo.",
    whatYoullNeed:
      "Un grupo organizador base, información local precisa sobre derechos de inquilinas e inquilinos, un vínculo con asistencia legal y un sistema de contacto rápido. Este proyecto apoya a inquilinas e inquilinos y comparte información legal pública; no sustituye la asesoría legal. Siempre canaliza los casos individuales a asistencia legal calificada antes de las fechas límite.",
    setupHours: 30,
    defaultCategory: "housing",
    firstSteps:
      "Habla con las inquilinas e inquilinos afectados antes de " +
      "cualquier contacto con el casero, siempre — toca puertas, " +
      "escucha lo que la gente teme y quiere de verdad, y deja " +
      "que quienes viven en cada edificio marquen el ritmo, " +
      "porque son ellas quienes cargan el riesgo de represalias, " +
      "no quienes organizan. En paralelo, preséntate pronto con " +
      "la clínica de asistencia legal local; vas a querer esa " +
      "relación antes de que llegue el primer aviso de desalojo, " +
      "no después.",
    commonPitfalls:
      "La forma en que un sindicato de inquilinos lastima a la " +
      "gente es moviéndose más rápido que las propias inquilinas: " +
      "una confrontación lanzada antes de que un edificio esté " +
      "listo expone a las vecinas más vulnerables a represalias " +
      "que no eligieron. El fracaso más silencioso es deslizarse " +
      "de compartir información legal a dar asesoría legal — " +
      "canaliza cada caso individual a asistencia legal " +
      "calificada antes de las fechas límite, todas las veces.",
    pairsWith: ["legal-aid-clinic", "mutual-aid-moving-crew", "solidarity-fund"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Convoca un comité organizador base",
        description:
          "Encuentra de 3 a 6 inquilinas e inquilinos comprometidos para anclar el trabajo. Busca personas respetadas en sus edificios. Acuerden roles, un ritmo de reuniones y metas compartidas.",
        hours: 5,
        skills: ["organización"],
      },
      {
        name: "Mapea edificios y problemas de inquilinas e inquilinos",
        description:
          "Toca puertas o aplica encuestas para saber qué edificios tienen problemas y cuáles son (reparaciones ignoradas, cargos ilegales, acoso). Sigue los patrones y detecta a las personas líderes naturales en cada edificio.",
        hours: 8,
        skills: ["difusión", "entrevistas"],
      },
      {
        name: "Reúne información local precisa sobre derechos",
        description:
          "Compila las leyes reales de tu zona sobre plazos de aviso de desalojo, reparaciones, depósitos y reglas de renta. Asóciate con una clínica de asistencia legal para verificarlas. Esto es información compartida, no asesoría legal — déjenlo claro con las personas integrantes.",
        hours: 4,
        skills: ["trámites", "redacción"],
      },
      {
        name: "Arma un sistema de contacto de respuesta rápida",
        description:
          "Monta un árbol telefónico o un chat de grupo para que quien reciba un aviso de desalojo o un cierre de cerradura pueda llegar al sindicato rápido. Decidan quién responde y en cuánto tiempo.",
        hours: 3,
        skills: ["organización", "soporte técnico"],
      },
      {
        name: "Organiza un taller de \"conoce tus derechos\"",
        description:
          "Realicen una sesión (idealmente con una persona aliada de asistencia legal) que recorra los derechos y qué hacer si reciben papeles. Entreguen guías impresas para llevar a casa en los idiomas que correspondan.",
        hours: 4,
        recurringCadence: "event",
        skills: ["enseñanza", "facilitación"],
        follows: [2],
      },
      {
        name: "Define un protocolo de respuesta ante desalojos",
        description:
          "Escriban un paso a paso sencillo para cuando alguien enfrente un desalojo: documentar todo, contactar a asistencia legal antes de la fecha límite, organizar apoyo vecinal y nunca ignorar fechas de corte.",
        hours: 3,
        skills: ["redacción"],
        follows: [2],
      },
      {
        name: "Conéctate con asistencia legal y apoyo continuo",
        description:
          "Construye una relación de referencia con abogadas y abogados de inquilinas e inquilinos, asistencia legal y asesoras y asesores de vivienda para que el sindicato pueda derivar los casos que necesiten ayuda profesional. Mantén los contactos al día.",
        hours: 3,
        skills: ["difusión"],
      },
    ],
  },
  {
    id: "childcare-collective",
    name: "Colectiva de cuidado infantil y niñeras compartidas",
    purpose:
      "Compartir cuidado infantil de confianza entre familias para que madres, padres y personas cuidadoras puedan trabajar, descansar o atender emergencias sin pagar por ello.",
    whoItServes:
      "Madres, padres y personas cuidadoras, especialmente quienes crían en solitario, trabajan por turnos o tienen ingresos bajos.",
    whatYoullNeed:
      "Un grupo de familias revisadas, un espacio seguro (o casas que rotan), un sistema de calendario y reglas claras de seguridad. Cuidar a las hijas y los hijos de otras personas es una responsabilidad seria — mantén reglas firmes de supervisión, revisa a quienes cuidan y respeta las normas locales sobre cuidado infantil informal.",
    setupHours: 28,
    defaultCategory: "childcare",
    suggestsWorkDays: true,
    firstSteps:
      "Este proyecto se construye en las salas de las casas antes " +
      "que en ningún otro lado: reúne a las familias fundadoras y " +
      "hablen de lo específico e incómodo — revisión de " +
      "antecedentes, supervisión, estilos de disciplina, qué pasa " +
      "cuando una criatura se lastima — antes de que alguien " +
      "agende una sola hora de cuidado. Revisa en ese mismo " +
      "arranque las normas locales sobre cuidado infantil " +
      "informal, para que el modelo que acuerden sea uno que de " +
      "verdad puedan sostener.",
    commonPitfalls:
      "Dos cosas rompen en silencio a los colectivos de cuidado: " +
      "el desequilibrio de créditos, donde las mismas familias " +
      "siempre reciben en casa hasta resentirlo, y las reglas de " +
      "seguridad que se aflojan conforme crece la confianza — la " +
      "excepción de solo por esta vez a la regla de nunca a solas " +
      "es exactamente como se destruye la confianza. Lleven el " +
      "balance a la vista y tomen las reglas de seguridad más en " +
      "serio justamente con las familias que mejor conocen.",
    pairsWith: ["toy-library", "time-bank", "youth-mentorship"],
    learnMore: ["what-is-balance"],
    tasks: [
      {
        name: "Reúne a las familias fundadoras y acuerden un modelo",
        description:
          "Convoca familias que se conozcan o que puedan construir confianza entre sí. Decidan el modelo: una cooperativa rotativa de niñeras donde madres y padres ganan y gastan créditos de cuidado, o un cuidado grupal con horario.",
        hours: 4,
        skills: ["difusión", "facilitación"],
      },
      {
        name: "Definan estándares de seguridad y revisión",
        description:
          "Acuerden cómo revisar a cualquier persona que cuide niñas y niños: referencias, verificaciones de antecedentes cuando corresponda y una regla firme de que ninguna persona adulta queda sola con la hija o el hijo de otra familia sin que nadie sepa. Establezcan proporciones adulto-niñe.",
        hours: 6,
        skills: ["cuidado infantil"],
        follows: [0],
      },
      {
        name: "Encuentra un espacio y hazlo seguro para la infancia",
        description:
          "Elijan un sitio o establezcan estándares para las casas anfitrionas. Revisen riesgos, cubran enchufes, fijen muebles pesados, guarden bajo llave medicinas y químicos, y confirmen un área exterior segura si se usa.",
        hours: 4,
        skills: ["cuidado infantil", "reparaciones del hogar"],
      },
      {
        name: "Creen un sistema de calendario y créditos",
        description:
          "Usen un calendario compartido o una app de cooperativa. En un modelo de créditos, una hora de cuidado da una hora a deber. Lleven cuenta de quién acoge y cuándo para que la carga sea justa.",
        hours: 3,
        skills: ["organización", "captura de datos"],
        follows: [0],
      },
      {
        name: "Establezcan políticas de salud, alergias y emergencias",
        description:
          "Reúnan información de alergias, medicamentos, contactos de emergencia y autorizaciones de recogida para cada niña o niño. Escriban una política clara para niñas y niños enfermos y qué hacer ante una emergencia médica.",
        hours: 3,
        skills: ["trámites", "redacción"],
      },
      {
        name: "Capaciten a quienes cuidan en lo básico",
        description:
          "Cubran supervisión, sueño seguro para bebés, respuesta ante alergias y emergencias, y las reglas de seguridad. Animen a tener al menos una persona adulta certificada en primeros auxilios pediátricos y RCP por sesión.",
        hours: 5,
        skills: ["enseñanza", "primeros auxilios"],
        follows: [1],
      },
      {
        name: "Hagan una sesión piloto y recojan comentarios",
        description:
          "Hagan un piloto corto con unas pocas familias y luego una conversación de cierre. Arreglen lo que no funcionó antes de crecer. Revisen seguido para que la confianza y la seguridad se mantengan firmes.",
        hours: 3,
        skills: ["cuidado infantil"],
        follows: [2, 5],
      },
    ],
  },
  {
    id: "community-composting",
    name: "Programa de compostaje comunitario",
    purpose:
      "Recolectar restos de comida para desviarlos del basurero y producir composta gratuita para huertos locales.",
    whoItServes:
      "Hogares sin forma de hacer composta, huertos comunitarios y el ambiente local.",
    whatYoullNeed:
      "Un sitio de compostaje, contenedores de recolección, equipo básico y una pequeña rotación de mantenimiento.",
    setupHours: 22,
    defaultCategory: "infrastructure",
    suggestsWorkDays: true,
    firstSteps:
      "Habla con el sitio anfitrión y con las vecinas y vecinos " +
      "que viven a distancia de olfato antes de que llegue el " +
      "primer contenedor — el miedo al olor y a las ratas mata " +
      "los sitios de compostaje, y una conversación honesta a " +
      "tiempo lo desactiva mejor que cualquier folleto. Después " +
      "encuentra el destino de tu composta (un huerto comunitario " +
      "que la quiera) y al menos una persona que de verdad haya " +
      "mantenido viva una pila caliente; su criterio va a definir " +
      "qué método elegir.",
    commonPitfalls:
      "Los proyectos de composta mueren cuando nadie es " +
      "responsable de voltear la pila: se estanca o empieza a " +
      "oler, una vecina se queja y el sitio anfitrión retira el " +
      "permiso — esa cadena avanza más rápido de lo que crees. " +
      "Ajusta la cantidad de restos que recolectan a lo que su " +
      "rotación puede procesar de verdad, y trata una tanda " +
      "contaminada como un problema de señalización por arreglar, " +
      "no como una persona voluntaria a quien culpar.",
    pairsWith: ["community-garden", "community-meal"],
    tasks: [
      {
        name: "Encuentra un sitio de compostaje",
        description:
          "Asegura un lugar con espacio y algo de sol — una esquina de un huerto comunitario, un lote baldío o un patio dispuesto. Confirma el permiso y revisa las reglas locales sobre compostaje.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Elige un método de compostaje",
        description:
          "Escoge lo que sea adecuado a tu escala: un sistema caliente de tres compartimentos, tambores o composta con lombrices. Que el método coincida con el material que esperas y con lo que puedas voltear.",
        hours: 3,
        skills: ["compostaje"],
        follows: [0],
      },
      {
        name: "Consigue contenedores y equipo",
        description:
          "Construye o compra contenedores de recolección y la estructura de compostaje. Junta un bieldo, un termómetro y material café (hojas, cartón) para equilibrar los restos de comida.",
        hours: 4,
        skills: ["carpintería", "conducir"],
        follows: [1],
      },
      {
        name: "Arma un sistema de recolección",
        description:
          "Decidan cómo llegan los restos: un contenedor de entrega con horarios o una ruta voluntaria de recogida. Den a quienes participen pequeños botes para la cocina y un calendario claro de entrega.",
        hours: 4,
        skills: ["organización"],
        follows: [2],
      },
      {
        name: "Dejen claro qué se acepta",
        description:
          "Pongan una lista sencilla de sí y no (sí: fruta, verdura, café, cáscaras de huevo; no: carne, lácteos, aceites, excremento de mascotas). Una señalización clara evita la contaminación que arruina una tanda.",
        hours: 2,
        skills: ["redacción", "traducción"],
        follows: [1],
      },
      {
        name: "Convoca y capacita una rotación de mantenimiento",
        description:
          "La composta necesita voltearse, revisarse la humedad y equilibrar verdes y cafés. Hagan un calendario compartido y enseñen lo básico a quienes participen para que las pilas no huelan ni se estanquen.",
        hours: 3,
        skills: ["compostaje", "enseñanza"],
        follows: [2],
      },
      {
        name: "Distribuye la composta terminada",
        description:
          "Una vez lista la composta, compártanla gratis con quienes aportaron y con huertos comunitarios. Anuncien los días de recogida y que lleven bolsas o cubetas.",
        hours: 2,
        skills: ["conducir"],
        recurringCadence: "cycle",
      },
    ],
  },
  {
    id: "free-little-library",
    name: "Pequeña biblioteca libre e intercambio de libros",
    purpose:
      "Ofrecer libros gratis las 24 horas para fomentar la lectura y el compartir, sin credencial ni cuotas.",
    whoItServes:
      "Niñas, niños, familias y personas lectoras de todas las edades, sobre todo en barrios con poco acceso a libros.",
    whatYoullNeed:
      "Una caja de libros resistente al clima, una colección inicial, un sitio anfitrión y un mantenimiento ligero.",
    setupHours: 7.5,
    defaultCategory: "education",
    firstSteps:
      "Empieza con dos conversaciones cortas: una con la persona " +
      "cuya pared o jardín va a recibir la caja, sobre dónde " +
      "ponerla y qué pasa si se deteriora, y otra con las " +
      "familias y la escuela cercanas sobre qué libros se " +
      "llevarían de verdad a casa. Consigue a tu persona " +
      "guardiana — quien la revisará cada semana — antes de " +
      "instalar la caja, no después.",
    commonPitfalls:
      "Las bibliotecas libres no mueren por falta de libros — " +
      "mueren por los equivocados: alguien deja una caja de " +
      "manuales viejos, los buenos títulos quedan enterrados, " +
      "entra la lluvia y la gente deja de asomarse sin decir " +
      "nada. Una visita semanal de cinco minutos de la persona " +
      "guardiana lo previene casi todo; la caja necesita a una " +
      "persona más de lo que necesita donaciones.",
    pairsWith: ["seed-library", "books-to-prisoners"],
    tasks: [
      {
        name: "Construye o consigue una caja de libros resistente al clima",
        description:
          "Hagan o compren una caja firme y a prueba de agua, sobre un poste o en una pared. Sirve un mueble reciclado o una caja de periódicos. Pónganle una puerta clara y un techo inclinado para que los libros no se mojen.",
        hours: 4,
        skills: ["carpintería"],
      },
      {
        name: "Elige y prepara un lugar",
        description:
          "Escojan un sitio con tránsito de gente y permiso — el patio delantero de alguien, un centro comunitario o el borde de un parque. Anclen bien la caja y confirmen que se permite.",
        hours: 1,
        skills: ["difusión"],
        follows: [0],
      },
      {
        name: "Surte la colección inicial",
        description:
          "Reúnan libros donados con una pequeña convocatoria. Busquen variedad: libros infantiles, ficción popular y no ficción práctica. Empiecen medio llena para que haya espacio de sumar.",
        hours: 1.5,
        skills: ["difusión"],
        follows: [1],
      },
      {
        name: "Pongan un letrero y normas sencillas",
        description:
          "Coloquen \"Toma un libro, deja un libro — todo gratis\". Mantengan el tono cálido y con pocas reglas. Añadan una nota que invite a todas las edades e idiomas.",
        hours: 0.5,
        skills: ["redacción"],
        follows: [1],
      },
      {
        name: "Convoca a una persona cuidadora",
        description:
          "Pídanle a alguien cercano que revise la caja cada semana: la ordene, retire lo dañado o inapropiado y reacomode el acervo. Cinco minutos a la semana la mantienen sana.",
        hours: 0.5,
        skills: ["difusión"],
      },
    ],
  },
  {
    id: "community-first-aid-training",
    name: "Capacitación comunitaria en primeros auxilios y respuesta ante sobredosis",
    purpose:
      "Capacitar a vecinas y vecinos en primeros auxilios, RCP y reversión de sobredosis para que la comunidad pueda responder en los minutos antes de que llegue ayuda profesional.",
    whoItServes:
      "Todas las personas; con más impacto donde los servicios de emergencia tardan o las tasas de sobredosis son altas.",
    whatYoullNeed:
      "Personas instructoras certificadas, insumos, un espacio y un calendario recurrente. Toda capacitación médica debe darla personal certificado; este proyecto organiza y aloja esa capacitación, no la sustituye.",
    setupHours: 17,
    defaultCategory: "education",
    firstSteps:
      "Tu primera conversación es con quienes darían la " +
      "capacitación — la Cruz Roja, la secretaría de salud o un " +
      "grupo de reducción de daños. Pregúntales qué necesitan de " +
      "un espacio anfitrión y qué fechas pueden ofrecer, y luego " +
      "platica con las personas que más probablemente presencien " +
      "una emergencia — familiares de personas que usan drogas, " +
      "personal de negocios cercanos — para que las primeras " +
      "sesiones se armen alrededor de ellas.",
    commonPitfalls:
      "Este proyecto se apaga cuando se queda en un solo evento " +
      "grande que nunca se repite: las habilidades se oxidan y la " +
      "naloxona caduca sin que nadie lo note. Y resistan la " +
      "tentación de enseñar el contenido médico por su cuenta — " +
      "su papel es alojar a instructoras e instructores " +
      "certificados, no sustituirlos.",
    pairsWith: ["harm-reduction-supplies", "emergency-preparedness"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Asóciate con personas instructoras certificadas",
        description:
          "Conéctate con personal calificado — la Cruz Roja, la secretaría de salud local o una organización de reducción de daños. Ellas y ellos dan la capacitación médica real; tu papel es organizarla y alojarla.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Consigue insumos",
        description:
          "Obtén botiquines de primeros auxilios, maniquíes para practicar RCP (a menudo prestados por quienes capacitan) y naloxona. Muchos programas de salud pública distribuyen naloxona gratis — pregunta en tu secretaría de salud o a grupos de reducción de daños.",
        hours: 3,
        skills: ["difusión", "conducir"],
        follows: [0],
      },
      {
        name: "Encuentra espacio y agenda las sesiones",
        description:
          "Reserven un salón donde quepa práctica con las manos — un centro comunitario, biblioteca o clínica. Pongan fechas recurrentes para que la gente pueda planear alrededor del trabajo.",
        hours: 2,
      },
      {
        name: "Convoca a quienes participen",
        description:
          "Difundan ampliamente y prioricen a personas que probablemente presencien emergencias. Que la inscripción sea fácil y gratuita, y ofrezcan horarios variados para quien trabaja por turnos.",
        hours: 2,
        skills: ["difusión"],
        follows: [2],
      },
      {
        name: "Realiza las sesiones de capacitación",
        description:
          "Alojen las sesiones que dan las personas instructoras, encárguense del montaje y el registro y asegúrense de que todas las personas hagan práctica con las manos. Entreguen tarjetas de referencia para llevar a casa.",
        hours: 4,
        skills: ["organización"],
        follows: [0, 1, 3],
        recurringCadence: "session",
      },
      {
        name: "Entrega botiquines y refresca conocimientos",
        description:
          "Que las personas capacitadas se lleven un botiquín de primeros auxilios y naloxona donde esté disponible. Programen repasos periódicos para que las habilidades no se enmohezcan.",
        hours: 2,
        recurringCadence: "session",
        follows: [4],
      },
    ],
  },
  {
    id: "time-bank",
    name: "Banco de tiempo",
    purpose:
      "Permitir que las personas integrantes intercambien servicios por tiempo, donde una hora dada equivale a una hora ganada, valorando por igual lo que aporta cada quien.",
    whoItServes:
      "Cualquier persona, sobre todo quienes tienen tiempo y habilidades pero poco dinero.",
    whatYoullNeed:
      "Una lista de personas integrantes, un sistema de registro, una persona coordinadora y reglas acordadas.",
    setupHours: 27,
    defaultCategory: "organizing",
    firstSteps:
      "Empieza con conversaciones, no con software: siéntate con " +
      "diez o quince vecinas y vecinos y pregúntale a cada quien " +
      "qué ofrecería y qué pediría. Si de esas pláticas no sale " +
      "variedad — aventones, tutoría, reparaciones, cocina — " +
      "sigue convocando antes de montar el sistema.",
    commonPitfalls:
      "Los bancos de tiempo rara vez mueren por escándalo; mueren " +
      "por silencio — la gente se inscribe, nadie hace la primera " +
      "solicitud y todo se enfría. Que una persona coordinadora " +
      "empareje intercambios activamente los primeros meses, y " +
      "sostengan la línea de una hora = una hora: en cuanto se " +
      "debate si la hora de plomería vale más que la de cuidado " +
      "infantil, deja de ser un banco de tiempo.",
    pairsWith: ["skill-share", "childcare-collective"],
    learnMore: ["what-is-balance", "negative-balance"],
    tasks: [
      {
        name: "Convoca a integrantes fundadoras e inventaríen habilidades",
        description:
          "Reúne un grupo inicial y pregúntale a cada quien qué puede ofrecer (aventones, tutoría, reparaciones, cocina, jardinería) y qué necesita. La variedad de ofrecimientos es lo que hace que funcione.",
        hours: 5,
        skills: ["difusión"],
      },
      {
        name: "Elige un sistema de registro",
        description:
          "Escojan cómo registrar horas: software dedicado a bancos de tiempo, una hoja de cálculo compartida o un libro sencillo. Debe registrar quién dio y quién recibió horas.",
        hours: 4,
        skills: ["soporte técnico", "captura de datos"],
      },
      {
        name: "Definan las reglas",
        description:
          "Acuerden el principio central (una hora = un crédito, sin importar la tarea), cómo se piden y se confirman los intercambios y qué pasa cuando el saldo de alguien baja mucho.",
        hours: 4,
        skills: ["facilitación", "redacción"],
      },
      {
        name: "Den la bienvenida a las personas integrantes",
        description:
          "Hagan una orientación corta para que la gente entienda la filosofía y el sistema. Den a cada persona algunos créditos iniciales para que los intercambios puedan empezar de inmediato.",
        hours: 4,
        skills: ["enseñanza"],
        follows: [1, 2],
      },
      {
        name: "Lanza un directorio de servicios",
        description:
          "Publiquen una lista buscable de quién ofrece qué. Manténganla al día para que las personas integrantes encuentren ayuda sin preguntarle todo el tiempo a quien coordina.",
        hours: 4,
        skills: ["captura de datos"],
        follows: [0],
      },
      {
        name: "Coordina y conecta intercambios",
        description:
          "Que una persona coordinadora ayude a emparejar necesidades con ofrecimientos, sobre todo al inicio, y dé un empujón a quienes están en silencio. Con el tiempo, las personas integrantes se conectan directo.",
        hours: 2,
        recurringCadence: "month",
        skills: ["organización"],
        follows: [4],
      },
      {
        name: "Construye prácticas de confianza y seguridad",
        description:
          "Pongan normas para intercambios que ocurran en casas o con personas integrantes vulnerables (referencias, no encontrarse a solas si incomoda). Añadan una forma sencilla de levantar alertas.",
        hours: 4,
        skills: ["facilitación"],
      },
    ],
  },
  {
    id: "solidarity-fund",
    name: "Fondo solidario (apoyo en efectivo de ayuda mutua)",
    purpose:
      "Juntar dinero para dar efectivo directo, sin condiciones, a vecinas y vecinos que enfrentan una crisis.",
    whoItServes:
      "Personas golpeadas por emergencias — un faltante de renta, una cuenta médica, un corte de servicios.",
    whatYoullNeed:
      "Un sistema transparente de manejo de dinero, un pequeño equipo responsable, un plan de recaudación y criterios claros. Manejar dinero en común conlleva responsabilidad real — usen doble firma, mantengan registros limpios, protejan la privacidad de quien recibe y busquen asesoría sobre el tratamiento legal y fiscal del fondo.",
    setupHours: 23,
    defaultCategory: "mutual_aid_drive",
    firstSteps:
      "Antes de juntar un solo peso, siéntate con las pocas " +
      "personas a quienes confiarías dinero en común y hablen con " +
      "honestidad: cómo funcionará la doble firma, qué se publica " +
      "y qué pasa cuando las solicitudes superen el fondo. Luego " +
      "busca una asesoría contable o de organizaciones sin fines " +
      "de lucro para entender el lado legal y fiscal antes de " +
      "abrir la cuenta.",
    commonPitfalls:
      "El dinero rompe la confianza más rápido que cualquier otra " +
      "cosa — un pago sin explicar o un registro descuidado puede " +
      "acabar con el fondo aunque nadie haya hecho nada malo. Y " +
      "casi siempre habrá más solicitudes que dinero; si los " +
      "criterios no se acordaron de antemano, decir que no caso " +
      "por caso quema al equipo y siembra resentimiento.",
    pairsWith: ["resource-hub-dispatch", "tenant-union", "free-tax-prep"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Forma un pequeño equipo responsable",
        description:
          "Convoca a unas pocas personas de confianza para administrar el fondo. Definan roles con claridad y comprométanse a la transparencia desde el primer día — aquí la confianza lo es todo.",
        hours: 3,
        skills: ["organización"],
      },
      {
        name: "Arma un manejo transparente del dinero",
        description:
          "Abran una cuenta dedicada o usen un patrocinio fiscal. Pidan que dos personas aprueben los pagos, mantengan un libro contable claro y revisen si la estructura tiene implicaciones fiscales o legales — consulten un recurso local de organizaciones sin fines de lucro o a una persona contadora.",
        hours: 5,
        skills: ["contabilidad", "trámites"],
        follows: [0],
      },
      {
        name: "Definan criterios para solicitar y entregar apoyo",
        description:
          "Decidan quién puede solicitar, los montos típicos, cada cuánto puede pedir alguien y si es por orden de llegada o ponderado por necesidad. Mantengan bajas las barreras y eviten exigir comprobantes de necesidad cuando sea posible.",
        hours: 4,
        skills: ["facilitación"],
      },
      {
        name: "Crea un formulario de solicitud sencillo y de pocas barreras",
        description:
          "Hagan un formulario corto y privado que pida solo lo necesario. Ofrezcan varias formas de aplicar (en línea, por teléfono, en persona) y protejan la privacidad de quienes solicitan.",
        hours: 2,
        skills: ["redacción"],
        follows: [2],
      },
      {
        name: "Pon en marcha la recaudación",
        description:
          "Combinen pequeñas donaciones recurrentes de personas integrantes con campañas ocasionales. Sean claras y claros con quienes donan: los fondos van directo a vecinas y vecinos en necesidad.",
        hours: 4,
        skills: ["difusión"],
        follows: [1],
      },
      {
        name: "Arma un proceso de decisión y de pago",
        description:
          "Pongan un tiempo de respuesta, una revisión rápida del equipo y métodos veloces de pago. En una crisis, la velocidad importa. Documenten cada decisión de manera sencilla.",
        hours: 3,
        skills: ["organización"],
        follows: [1, 2],
      },
      {
        name: "Rinde cuentas con transparencia",
        description:
          "Compartan resúmenes regulares — dinero que entra, dinero que sale, número de vecinas y vecinos apoyados — sin exponer la identidad de quienes recibieron. La transparencia mantiene la donación.",
        hours: 2,
        recurringCadence: "month",
        skills: ["redacción", "contabilidad"],
      },
    ],
  },
  {
    id: "diaper-hygiene-bank",
    name: "Banco de pañales y artículos de higiene",
    purpose:
      "Distribuir gratis pañales, productos menstruales y artículos de higiene, que no se pueden comprar con la mayoría de los apoyos alimentarios.",
    whoItServes:
      "Familias de ingresos bajos, bebés, personas que menstrúan y vecinas y vecinos sin techo.",
    whatYoullNeed:
      "Almacenamiento, un flujo de insumos, puntos de distribución y personas voluntarias.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Habla primero con quienes ya ven a las familias — la " +
      "clínica pediátrica, la despensa de alimentos, la iglesia — " +
      "y pregúntales qué tallas y productos realmente escasean y " +
      "si aceptarían alojar la distribución. Esa sola " +
      "conversación te ahorra meses de adivinar.",
    commonPitfalls:
      "Lo que más daña es la irregularidad: una colecta grande, " +
      "estantes llenos, y luego meses vacíos justo cuando las " +
      "familias ya contaban contigo. Cuida también el inventario " +
      "real — se acumulan pañales de recién nacido mientras " +
      "faltan las tallas grandes — y nunca pidas pruebas de " +
      "necesidad; la dignidad es parte del servicio.",
    pairsWith: ["welcome-wagon", "laundry-shower-access"],
    tasks: [
      {
        name: "Encuentra almacenamiento y un punto de distribución",
        description:
          "Asegura un almacén seco y seguro y un lugar para entregar los artículos — un clóset en una clínica, iglesia o centro comunitario. El sitio de entrega debe sentirse privado y digno.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Establece el abastecimiento",
        description:
          "Combina compras al mayoreo, campañas de donación y vínculos con redes de bancos de pañales o mayoristas. Lleva cuenta de qué fuentes son estables para no quedarte sin existencias.",
        hours: 3,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Clasifica e inventaría por talla y tipo",
        description:
          "Organiza pañales por talla, además de productos menstruales y artículos de higiene. Lleva un conteo corriente para saber qué pedir. Las tallas para bebés más grandes suelen escasear.",
        hours: 1.5,
        skills: ["organización", "captura de datos"],
        follows: [0, 1],
      },
      {
        name: "Define una política de distribución justa",
        description:
          "Decidan cuánto recibe cada familia y cada cuánto, sin barreras de comprobación de necesidad. Que sea predecible para que la gente pueda contar con ello.",
        hours: 1,
        skills: ["facilitación"],
      },
      {
        name: "Agenda la distribución y consigue personal",
        description:
          "Pongan días regulares de distribución, convoquen a personas voluntarias para entregar los insumos y mantengan el trato cálido y sin juicios.",
        hours: 2.5,
        skills: ["organización"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "community-bike-workshop",
    name: "Taller comunitario de bicicletas",
    purpose:
      "Ofrecer espacio, herramientas y ayuda gratis para arreglar, armar y ganarse una bicicleta, haciendo el transporte accesible y económico.",
    whoItServes:
      "Personas sin auto, juventud, quienes se trasladan al trabajo y cualquiera que necesite transporte económico.",
    whatYoullNeed:
      "Un espacio, herramientas, bicicletas y refacciones donadas, y personas mecánicas voluntarias.",
    setupHours: 20,
    defaultCategory: "transport",
    suggestsWorkDays: true,
    firstSteps:
      "Antes de buscar local, habla con quienes usarían el taller " +
      "y con las personas mecánicas que enseñarían — y si hay un " +
      "taller comunitario de bicis en una ciudad cercana, " +
      "visítalo y pregunta qué harían distinto. Con quien preste " +
      "el espacio, aclara desde el inicio almacenamiento, acceso " +
      "y seguros.",
    commonPitfalls:
      "El taller muere cuando las personas voluntarias arreglan " +
      "bicis en lugar de enseñar a arreglarlas: se vuelve un " +
      "taller gratis, la fila crece y las mecánicas se queman. " +
      "Cuidado también con ahogarse en bicis chatarra donadas — " +
      "clasifiquen sin piedad — y que ninguna bici salga sin " +
      "revisión de frenos y llantas.",
    pairsWith: ["repair-cafe", "rides-transportation", "tool-lending-library"],
    tasks: [
      {
        name: "Encuentra un espacio de taller",
        description:
          "Asegura una cochera, un sótano, un contenedor o un espacio comunitario compartido con lugar para trabajar y guardar bicicletas. Confirma el acceso y cualquier necesidad de seguro.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Junta herramientas y un caballete",
        description:
          "Reúne un kit básico de herramientas de bicicleta y al menos un caballete de reparación con donaciones o con un pequeño presupuesto. Organiza las herramientas para que sea fácil encontrarlas y devolverlas.",
        hours: 5,
        skills: ["conducir"],
        follows: [0],
      },
      {
        name: "Recolecta bicicletas y refacciones donadas",
        description:
          "Hagan convocatorias para bicicletas sin uso y refacciones aprovechables. Clasifíquenlas en \"reparables\", \"para refacciones\" y \"listas para rodar\". Una reserva de refacciones es lo que mantiene andando al taller.",
        hours: 4,
        skills: ["reparación", "conducir"],
        follows: [0],
      },
      {
        name: "Convoca a personas mecánicas voluntarias",
        description:
          "Encuentra a unas cuantas personas que sepan arreglar bicicletas y, sobre todo, enseñar a otras. La meta es ayudar a la gente a aprender a reparar la suya, no hacerlo por ella.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Establece horarios y un modelo de \"gánate una bici\"",
        description:
          "Elijan horarios predecibles. Consideren un programa de \"gánate una bici\" donde alguien aprende habilidades de reparación a lo largo de varias sesiones y se va con la bicicleta que reparó.",
        hours: 2,
        skills: ["organización"],
      },
      {
        name: "Establece prácticas de seguridad",
        description:
          "Exijan protección para los ojos, pongan reglas para el uso de herramientas y tengan un botiquín. Hagan siempre un chequeo de seguridad (frenos, llantas, dirección) antes de que cualquier bicicleta salga.",
        hours: 2,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "newcomer-translation-network",
    name: "Red de apoyo a personas recién llegadas y de traducción",
    purpose:
      "Ayudar a personas migrantes y refugiadas a moverse en un lugar nuevo — traducción, trámites, orientación y conexión comunitaria.",
    whoItServes:
      "Personas migrantes y refugiadas recién llegadas, y vecinas y vecinos que no hablan el idioma local.",
    whatYoullNeed:
      "Personas voluntarias bilingües, organizaciones aliadas, materiales de orientación y un sistema de solicitudes. Tengan especial cuidado con la privacidad: no recojan estatus migratorio, canalicen preguntas legales a abogadas y abogados de inmigración calificados, y dejen que las personas de la comunidad guíen qué apoyo realmente quieren.",
    setupHours: 22,
    defaultCategory: "other",
    firstSteps:
      "Empieza hablando con las propias comunidades recién " +
      "llegadas y con las organizaciones que ya las acompañan — " +
      "que ellas digan qué apoyo quieren, en vez de diseñárselo " +
      "desde fuera. Y antes de que llegue la primera solicitud, " +
      "deja lista la canalización: abogadas y abogados de " +
      "inmigración calificados a quienes derivar toda pregunta " +
      "legal.",
    commonPitfalls:
      "El riesgo más serio es que personas voluntarias con buena " +
      "intención pasen de interpretar a dar consejos legales o " +
      "médicos para los que no están calificadas — una mala " +
      "orientación migratoria puede costarle carísimo a alguien. " +
      "Y recojan el mínimo de datos: un registro descuidado sobre " +
      "el estatus de una persona puede ponerla en peligro real.",
    pairsWith: ["welcome-wagon", "legal-aid-clinic", "health-navigation"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Convoca a personas voluntarias bilingües y multilingües",
        description:
          "Encuentra personas voluntarias que hablen los idiomas comunes en tu zona y puedan ayudar con traducción, formularios y acompañamiento. Que los idiomas coincidan con las necesidades locales reales.",
        hours: 4,
        skills: ["traducción", "difusión"],
      },
      {
        name: "Mapea servicios y aliadas y aliados locales",
        description:
          "Arma un directorio de clínicas, escuelas, asistencia legal, clases de ESL, recursos alimentarios y organizaciones que sirven a personas migrantes. A menudo, las personas recién llegadas solo necesitan saber qué existe y cómo llegar.",
        hours: 5,
        skills: ["difusión", "captura de datos"],
      },
      {
        name: "Arma un sistema de solicitudes y emparejamientos",
        description:
          "Crea una forma sencilla para que las personas recién llegadas pidan ayuda y se les empareje con alguien voluntario por idioma y necesidad. Ofrezcan opciones por teléfono y en persona, no solo en línea.",
        hours: 3,
        skills: ["organización", "soporte técnico"],
        follows: [0],
      },
      {
        name: "Crea materiales de orientación",
        description:
          "Junten guías en lenguaje sencillo, en los idiomas que correspondan, sobre transporte, escuelas, salud y derechos. Usen imágenes para que funcionen en distintos niveles de alfabetización.",
        hours: 4,
        skills: ["redacción", "traducción"],
        follows: [1],
      },
      {
        name: "Ofrece acompañamiento a citas",
        description:
          "Coordinen para que personas voluntarias acompañen a la gente a citas médicas, escolares o de servicios para interpretar y apoyar. Indiquen a quienes acompañan que interpreten con fidelidad, no que den consejos para los que no están calificadas.",
        hours: 3,
        recurringCadence: "month",
        skills: ["traducción"],
        follows: [0, 2],
      },
      {
        name: "Establezcan prácticas de privacidad y seguridad",
        description:
          "Recojan la información mínima necesaria y nunca pregunten ni registren estatus migratorio. Guarden los datos de forma segura y capaciten a las personas voluntarias para manejar situaciones sensibles con discreción.",
        hours: 3,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "community-meal",
    name: "Comida comunitaria / Cocina del pueblo",
    purpose:
      "Cocinar y compartir comidas comunitarias gratuitas de forma regular, sin preguntas.",
    whoItServes:
      "Cualquier persona con hambre, aislada o con inseguridad alimentaria; también teje vínculos en el barrio.",
    whatYoullNeed:
      "Una cocina, personas que cocinen, una cadena de ingredientes, un espacio para servir y un equipo voluntario. Servir comida al público conlleva responsabilidades reales de seguridad alimentaria — revisen las reglas locales sobre permisos y personas certificadas en manejo de alimentos, y sigan siempre prácticas seguras de almacenamiento y temperatura.",
    setupHours: 22,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Tus dos primeras conversaciones son con quien prestaría la " +
      "cocina — un salón de iglesia o centro comunitario — sobre " +
      "los días que planeas, y con la autoridad sanitaria local " +
      "sobre permisos y manejo de alimentos; eso define todo lo " +
      "demás. Después pregunta a quienes vendrían a comer qué día " +
      "y hora les sirve de verdad.",
    commonPitfalls:
      "Un descuido de seguridad alimentaria puede lastimar a " +
      "alguien y acabar con el proyecto — las reglas de " +
      "temperatura y almacenamiento no se saltan ni una vez. La " +
      "muerte lenta es que las mismas tres personas cocinen cada " +
      "comida hasta quemarse, así que amplíen el equipo y roten " +
      "quién dirige la cocina desde el inicio.",
    pairsWith: ["gleaning-network", "community-garden", "community-fridge"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Encuentren una cocina y un espacio para servir",
        description:
          "Consigan una cocina lo bastante grande para cocinar a escala — un salón parroquial, centro comunitario o cocina comercial — además de un espacio para servir. Confirmen disponibilidad en los días previstos.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Resuelvan seguridad alimentaria y permisos",
        description:
          "Revisen las reglas locales para servir comida al público. Puede que necesiten un permiso, una persona certificada en manejo de alimentos presente, o una cocina con licencia. Aprendan almacenamiento seguro y manejo de temperaturas.",
        hours: 4,
        skills: ["seguridad alimentaria"],
        follows: [0],
      },
      {
        name: "Construyan una cadena de suministro de alimentos",
        description:
          "Combinen donaciones de tiendas y restaurantes, compras al por mayor y cualquier excedente de huertas o gleaning. Lleven registro de fuentes confiables para planear menús según lo que tendrán.",
        hours: 3,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Planeen menús para escala, dieta y alergias",
        description:
          "Diseñen comidas sencillas y nutritivas que se cocinen en volumen y rindan los ingredientes. Ofrezcan opciones vegetarianas y etiqueten con claridad los alérgenos comunes.",
        hours: 2,
        recurringCadence: "session",
        skills: ["cocina"],
        follows: [2],
      },
      {
        name: "Convoquen un equipo de cocina y servicio",
        description:
          "Reúnan personas voluntarias para preparación, cocción, servicio y limpieza. Asignen una persona líder de cocina por comida y mantengan los roles claros para que el servicio fluya.",
        hours: 3,
        skills: ["cocina", "organización"],
      },
      {
        name: "Definan un horario y corran la voz",
        description:
          "Elijan un día y hora regulares para que la gente pueda contar con ello. Difundan con volantes, en albergues y de boca en boca, con un tono cálido y abierto para todas las personas.",
        hours: 2,
        skills: ["diseño gráfico"],
        follows: [0, 1],
      },
      {
        name: "Sirvan la comida y limpien",
        description:
          "Cocinen, sirvan con dignidad (servir en mesa se siente mejor que una fila, cuando sea posible) y dejen la cocina con los estándares requeridos. Empaquen las sobras de forma segura para redistribuirlas.",
        hours: 5,
        skills: ["cocina"],
        follows: [3, 4, 5],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "seed-library",
    name: "Biblioteca de semillas e intercambio",
    purpose:
      "Compartir semillas gratis para que la gente cultive alimentos, y preservar variedades locales y criollas.",
    whoItServes:
      "Quienes cultivan en casa, quienes empiezan a sembrar y huertas comunitarias.",
    whatYoullNeed:
      "Un sistema de almacenamiento y catálogo, semillas donadas, un lugar anfitrión y unas pocas personas cuidadoras.",
    setupHours: 8,
    defaultCategory: "food",
    firstSteps:
      "Habla con la biblioteca o el centro comunitario sobre " +
      "alojar el mueble, y con jardineras y jardineros con " +
      "experiencia local sobre qué crece de verdad en tu región — " +
      "el éxito de quienes empiezan depende de semillas adecuadas " +
      "al clima. Un vivero o una huerta comunitaria cercana suele " +
      "donar con gusto el arranque.",
    commonPitfalls:
      "Una biblioteca de semillas muere en silencio: semilla " +
      "vieja que no germina, gente que concluye que no sabe " +
      "sembrar y no vuelve. Rota el inventario sin nostalgia, y " +
      "no cuentes con que devuelvan semilla — casi nadie la " +
      "guarda — así que planea el resurtido con donaciones, no " +
      "con retornos.",
    pairsWith: ["community-garden", "free-little-library"],
    tasks: [
      {
        name: "Encuentren un anfitrión y sistema de almacenamiento",
        description:
          "Aliáncense con una biblioteca, centro comunitario o huerta para alojar un pequeño mueble o cajonera. Guarden las semillas en lugar fresco, seco y oscuro, en sobres etiquetados.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Consigan semillas iniciales",
        description:
          "Reúnan donaciones de hortelanas y hortelanos, excedentes de empresas de semillas y paquetes de fin de temporada. Prioricen variedades fáciles y adaptadas a la región para que quienes empiezan tengan éxito.",
        hours: 2,
        skills: ["difusión", "jardinería"],
      },
      {
        name: "Organicen y etiqueten la colección",
        description:
          "Clasifiquen por tipo (hortaliza, hierba, flor) y dificultad. Etiqueten cada sobre con la planta, el año y notas básicas de cultivo. Marquen cuáles son fáciles para guardar semilla.",
        hours: 2,
        skills: ["jardinería", "captura de datos"],
        follows: [1],
      },
      {
        name: "Establezcan normas de préstamo y de intercambio",
        description:
          "Manténganlo sencillo: tomen semillas gratis, cultívenlas y, idealmente, guarden y devuelvan algunas al final de la temporada. Pongan una guía de una página sobre cómo funciona.",
        hours: 1,
        skills: ["redacción"],
      },
      {
        name: "Mantengan la viabilidad y rellenen el stock",
        description:
          "Las semillas pierden viabilidad con el tiempo. Roten el stock viejo, hagan pruebas de germinación en lotes dudosos y rellenen las variedades populares.",
        hours: 1,
        skills: ["jardinería"],
        follows: [2],
        recurringCadence: "cycle",
      },
    ],
  },
  {
    id: "digital-literacy",
    name: "Alfabetización digital y préstamo de dispositivos",
    purpose:
      "Prestar dispositivos y enseñar habilidades digitales para tender un puente a quienes no tienen tecnología ni internet confiables.",
    whoItServes:
      "Personas mayores, vecinas y vecinos de bajos ingresos, personas en búsqueda de empleo y cualquiera que quede fuera de los servicios en línea.",
    whatYoullNeed:
      "Dispositivos donados, acceso a internet, personas voluntarias para tutorías y un espacio.",
    setupHours: 27,
    defaultCategory: "tech",
    firstSteps:
      "Habla primero con las personas que quieres acompañar — en " +
      "la biblioteca, el centro de personas mayores, la fila de " +
      "la despensa — y pregúntales qué quieren lograr: telesalud, " +
      "solicitudes de empleo, las fotos de la familia. Luego " +
      "platica con la biblioteca sobre espacio y conectividad " +
      "antes de juntar un solo dispositivo.",
    commonPitfalls:
      "Prestar un dispositivo sin resolver el internet es prestar " +
      "un pisapapeles — la conectividad es la mitad del proyecto. " +
      "En las sesiones, el error clásico es que quien da la " +
      "tutoría tome el ratón y hable en jerga; y nunca vuelvas a " +
      "prestar un equipo sin borrarlo, porque filtrar los datos " +
      "de alguien rompe toda la confianza construida.",
    pairsWith: ["community-wifi-mesh", "skill-share"],
    learnMore: ["install-app", "new-device"],
    tasks: [
      {
        name: "Recolecten y reacondicionen dispositivos",
        description:
          "Reúnan computadoras portátiles, tabletas y teléfonos donados. Borren cada uno de forma segura, actualícenlo y déjenlo listo para un uso sencillo. Prueben que todo funciona antes de prestarlo.",
        hours: 8,
        skills: ["soporte técnico", "conducir"],
      },
      {
        name: "Armen un sistema de préstamo",
        description:
          "Creen un registro sencillo: quién pidió qué, en qué condición y para cuándo. Definan la duración del préstamo y una política de devolución flexible, basada en la confianza.",
        hours: 3,
        skills: ["captura de datos"],
        follows: [0],
      },
      {
        name: "Gestionen el acceso a internet",
        description:
          "Un dispositivo sirve poco sin conexión. Presten puntos de acceso móviles, aliáncense con la biblioteca, o orienten a la gente hacia programas de internet de bajo costo y WiFi público gratuito.",
        hours: 3,
        skills: ["soporte técnico", "difusión"],
      },
      {
        name: "Convoquen y capaciten a tutoras y tutores",
        description:
          "Encuentren personas voluntarias pacientes y prepárenlas para enseñar sin tecnicismos. Insistan en ir al ritmo de quien aprende y nunca tomar el mouse.",
        hours: 4,
        skills: ["enseñanza"],
      },
      {
        name: "Diseñen un plan de estudios para principiantes",
        description:
          "Armen lecciones cortas sobre lo esencial: correo, seguridad en línea, postulaciones de trabajo, telesalud, formularios oficiales y videollamadas. Entreguen guías impresas.",
        hours: 4,
        skills: ["enseñanza", "redacción"],
      },
      {
        name: "Programen clases y horarios de ayuda libre",
        description:
          "Ofrezcan tanto clases estructuradas como horarios abiertos de \"ayuda tecnológica\". Varíen los horarios para quienes trabajan y mantengan grupos pequeños.",
        hours: 3,
        recurringCadence: "session",
        skills: ["organización"],
        follows: [3, 4],
      },
      {
        name: "Establezcan políticas de seguridad de datos y devolución",
        description:
          "Borren cada dispositivo entre personas usuarias, enseñen hábitos seguros de contraseñas y privacidad y expliquen cómo se protegen los datos personales. Tengan un plan para pérdidas o daños.",
        hours: 2,
        skills: ["soporte técnico", "redacción"],
      },
    ],
  },
  {
    id: "weatherization-brigade",
    name: "Brigada de aislamiento térmico y reparaciones del hogar",
    purpose:
      "Ayudar a vecinas y vecinos de bajos ingresos, personas mayores y con discapacidad con reparaciones y aislamiento para reducir facturas de energía y mejorar la seguridad.",
    whoItServes:
      "Propietarios de bajos ingresos, personas mayores y vecinas y vecinos con discapacidad que no pueden hacer ni costear el trabajo.",
    whatYoullNeed:
      "Personas voluntarias con habilidades, materiales, herramientas y un sistema de solicitudes. Quédense dentro de la competencia voluntaria — deriven trabajos eléctricos, de gas, estructurales y de techos a profesionales con licencia.",
    setupHours: 21,
    defaultCategory: "housing",
    suggestsWorkDays: true,
    firstSteps:
      "Reúne primero a tus personas voluntarias más " +
      "experimentadas y acuerden juntas la línea de alcance — qué " +
      "trabajos toman y cuáles se derivan a profesionales con " +
      "licencia — antes de aceptar una sola solicitud. Trata la " +
      "primera visita a cada hogar como una conversación, no una " +
      "inspección: la persona residente decide qué se toca en su " +
      "casa.",
    commonPitfalls:
      "El peligro es el alcance que crece solo: la 'reparación " +
      "chiquita' que resulta ser trabajo eléctrico, de gas o de " +
      "techo, fuera de la competencia voluntaria — ahí es donde " +
      "alguien sale lastimado. Y no prometan más visitas de las " +
      "que el equipo puede cumplir; dejar esperando a una persona " +
      "mayor que contaba con ustedes duele más que un no honesto " +
      "desde el inicio.",
    pairsWith: ["community-wood-bank", "tool-lending-library"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Convoquen a personas voluntarias con habilidades",
        description:
          "Encuentren gente cómoda con carpintería básica, sellado, aislamiento y burletes. Un par de personas con más experiencia pueden guiar al resto.",
        hours: 4,
        skills: ["carpintería", "reparaciones del hogar"],
      },
      {
        name: "Definan el alcance del trabajo",
        description:
          "Definan qué harán y qué no. Quédense en trabajos seguros y sencillos (impermeabilización, barras de apoyo, arreglos menores) y descarten todo lo que requiera un oficio con licencia, como trabajos mayores de electricidad o gas.",
        hours: 2,
        skills: ["reparaciones del hogar"],
        follows: [0],
      },
      {
        name: "Armen un sistema de solicitudes y evaluación",
        description:
          "Creen una forma para que las vecinas y vecinos pidan ayuda; luego hagan una visita corta para dimensionar la obra, listar materiales y confirmar que está dentro de sus habilidades y límites de seguridad.",
        hours: 3,
        skills: ["organización"],
      },
      {
        name: "Consigan materiales y herramientas",
        description:
          "Reúnan masilla, burletes, aislamiento y ferretería básica mediante donaciones, descuentos o un pequeño presupuesto. Mantengan un kit de herramientas compartido.",
        hours: 4,
        skills: ["conducir"],
        follows: [1],
      },
      {
        name: "Resuelvan seguridad y responsabilidad",
        description:
          "Usen renuncias sencillas, lleven primeros auxilios, exijan equipo de protección adecuado y nunca intenten trabajos fuera de su competencia. Asesórense sobre cobertura de responsabilidad para reparaciones voluntarias.",
        hours: 3,
        skills: ["trámites"],
      },
      {
        name: "Programen y realicen días de trabajo",
        description:
          "Asignen los trabajos a equipos voluntarios, confirmen con la persona del hogar y completen la obra en una sesión enfocada. Respeten la casa y los deseos de quien la habita en todo momento.",
        hours: 5,
        skills: ["organización", "reparaciones del hogar"],
        follows: [1, 2, 3, 4],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "pet-food-bank",
    name: "Banco de alimentos y apoyo para mascotas",
    purpose:
      "Brindar comida gratis para mascotas y apoyo básico de cuidado para que nadie tenga que entregar a sus animales por el costo.",
    whoItServes:
      "Personas de bajos ingresos con mascotas, personas mayores con ingresos fijos y vecinas y vecinos sin hogar con animales.",
    whatYoullNeed:
      "Almacenamiento, una cadena de suministro de comida para mascotas, un punto de distribución y aliados veterinarios.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Habla primero con la despensa de alimentos existente sobre " +
      "distribuir juntos — las mismas familias suelen necesitar " +
      "ambas cosas — y con veterinarias y tiendas de mascotas " +
      "locales sobre donaciones y algún convenio de vacunas o " +
      "descuentos.",
    commonPitfalls:
      "La irregularidad es lo que más daña: una colecta grande y " +
      "luego estantes vacíos, cuando quienes tienen mascotas " +
      "necesitan poder contar contigo. Y vigila el tono — " +
      "cualquier juicio sobre si 'la gente pobre debería tener " +
      "mascotas' mata el proyecto más rápido que quedarse sin " +
      "croquetas.",
    pairsWith: ["diaper-hygiene-bank", "community-fridge"],
    tasks: [
      {
        name: "Encuentren almacenamiento y un punto de distribución",
        description:
          "Consigan un espacio seco y a prueba de plagas, y un lugar para entregar la comida — a menudo junto a una despensa comunitaria o centro comunitario existente.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Construyan una cadena de suministro de comida para mascotas",
        description:
          "Combinen colectas, donaciones de tiendas de mascotas y fabricantes, y compras al por mayor. Lleven registro de lo que entra para planear las distribuciones.",
        hours: 3,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Clasifiquen e inventaríen por animal y tamaño",
        description:
          "Separen comida para perros y gatos (y otros animales), anoten las cantidades y revisen fechas de caducidad. Mantengan una cuenta corriente para guiar el reabastecimiento.",
        hours: 1.5,
        skills: ["organización", "captura de datos"],
        follows: [0, 1],
      },
      {
        name: "Definan una política de distribución",
        description:
          "Decidan cuánto recibe cada hogar y con qué frecuencia, sin barreras de comprobación de necesidad. Háganlo predecible para que las personas puedan planear.",
        hours: 1,
        skills: ["facilitación"],
      },
      {
        name: "Programen y atiendan la distribución",
        description:
          "Fijen horarios regulares de distribución, convoquen voluntariado y mantengan un tono sin juicios. Mucha gente se salta comidas para alimentar a sus mascotas — recíbanlas con respeto.",
        hours: 2.5,
        skills: ["organización"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "youth-mentorship",
    name: "Mentoría juvenil y programa después de la escuela",
    purpose:
      "Dar a niñas, niños y adolescentes un espacio seguro después de clases, con apoyo en tareas, mentoría y enriquecimiento.",
    whoItServes:
      "Juventud en zonas con pocos recursos y madres y padres que trabajan y necesitan cuidado seguro.",
    whatYoullNeed:
      "Un espacio seguro, mentoras y mentores con verificación, actividades y refrigerios. Trabajar con juventud conlleva una responsabilidad seria — verifiquen a las personas adultas, mantengan la regla de dos personas adultas, cumplan las leyes de reporte obligatorio y respeten las reglas locales para programas juveniles.",
    setupHours: 28,
    defaultCategory: "education",
    suggestsWorkDays: true,
    firstSteps:
      "Antes de convocar a una sola persona mentora, habla con " +
      "madres, padres y con la propia juventud sobre qué " +
      "necesitan, y deja por escrito las políticas de seguridad — " +
      "verificación de antecedentes, regla de dos personas " +
      "adultas, reporte obligatorio. Ninguna persona adulta pasa " +
      "tiempo con niñas y niños antes de pasar por ese filtro.",
    commonPitfalls:
      "La peor falla es el atajo en seguridad: una persona adulta " +
      "sin verificar, o a solas con una niña o niño — eso no se " +
      "negocia nunca. La segunda es la rotación de mentores; para " +
      "juventud que ya ha vivido abandonos, un adulto que " +
      "desaparece hace daño, así que empieza en pequeño y crece " +
      "solo hasta donde puedas supervisar y sostener.",
    pairsWith: ["school-supply-program", "childcare-collective", "community-music"],
    learnMore: ["how-vouching-works"],
    tasks: [
      {
        name: "Consigan un espacio seguro y fijen un horario",
        description:
          "Encuentren un lugar adecuado y accesible — un salón escolar, biblioteca o centro comunitario — y fijen un horario constante después de clases con el que las familias puedan contar.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Definan estándares de protección infantil y verificación",
        description:
          "Exijan verificaciones de antecedentes para personas adultas que trabajen con juventud, apliquen la regla de dos personas adultas para que nadie quede a solas con una niña o niño, y fijen políticas claras de conducta y reporte.",
        hours: 6,
        skills: ["cuidado infantil", "redacción"],
      },
      {
        name: "Convoquen y capaciten a mentoras y mentores",
        description:
          "Encuentren personas adultas confiables y cariñosas, y capacítenlas en límites, protección de la juventud y cómo apoyar sin hacer la tarea por las niñas y niños. Apunten a la constancia semana a semana.",
        hours: 6,
        skills: ["difusión", "enseñanza"],
        follows: [1],
      },
      {
        name: "Planeen la programación",
        description:
          "Mezclen apoyo en tareas con enriquecimiento — lectura, arte, deportes, habilidades para la vida. Mantéganlo atractivo y dejen que la juventud ayude a darle forma.",
        hours: 4,
        skills: ["enseñanza"],
      },
      {
        name: "Manejen inscripción, alergias e información de emergencia",
        description:
          "Recojan permisos de las personas adultas a cargo, detalles de alergias y salud, contactos de emergencia y autorizaciones de recogida de cada niña o niño. Guarden esto con seguridad.",
        hours: 3,
        skills: ["trámites", "captura de datos"],
      },
      {
        name: "Consigan refrigerios e insumos",
        description:
          "Ofrezcan un refrigerio saludable (muchas niñas y niños llegan con hambre) y reúnan libros, materiales de arte y juegos por donaciones o con un presupuesto pequeño.",
        hours: 2,
        recurringCadence: "month",
        skills: ["difusión"],
      },
      {
        name: "Realicen las sesiones y mantengan contacto con las familias",
        description:
          "Abran el espacio, supervisen de cerca, lleven las actividades y mantengan contacto regular con las personas adultas a cargo sobre cómo van sus hijas e hijos.",
        hours: 4,
        skills: ["cuidado infantil", "enseñanza"],
        follows: [0, 2, 3, 4],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "gleaning-network",
    name: "Red de rescate de cosechas",
    purpose:
      "Rescatar excedentes de frutas y verduras de granjas, huertos, jardines y mercados, y redistribuirlos antes de que se desperdicien.",
    whoItServes:
      "Vecinas y vecinos con inseguridad alimentaria y proyectos de comida como neveras, despensas y comidas comunitarias.",
    whatYoullNeed:
      "Personas voluntarias, transporte, vínculos con quienes cultivan y almacenamiento de corto plazo.",
    setupHours: 21,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Empieza por quienes cultivan: granjas, huertos y puestos " +
      "del mercado. Pregúntales qué excedente tienen y qué les " +
      "preocupa de recibir voluntarios — responsabilidad, daños " +
      "al cultivo — y deja amarrado a dónde irá la comida " +
      "(neveras, despensas, comidas comunitarias) antes de la " +
      "primera cosecha.",
    commonPitfalls:
      "La falla clásica es rescatar fruta que luego se pudre en " +
      "la cochera de alguien — la distribución se acuerda antes " +
      "de cosechar, no después. Las ventanas de cosecha son " +
      "cortas, así que un equipo chico que responde rápido vale " +
      "más que una lista larga de nombres; y un solo rescate " +
      "descuidado que dañe el campo te puede costar a esa persona " +
      "cultivadora para siempre.",
    pairsWith: ["community-fridge", "food-preservation", "community-meal"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Encuentren fuentes de cosecha",
        description:
          "Acérquense a granjas, huertos, puestos de mercado y vecinas y vecinos con frutales cargados. A muchas personas les alegra que el excedente se coseche en lugar de pudrirse.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Convoquen un equipo de rescate",
        description:
          "Armen una lista de personas voluntarias que puedan movilizarse rápido cuando la fruta o verdura esté lista. Las ventanas de cosecha son cortas, así que la flexibilidad importa más que el número.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Gestionen transporte y almacenamiento",
        description:
          "Alineen vehículos para mover la cosecha y un lugar fresco para guardarla brevemente. Coordinen para mover el alimento rápido del campo a quienes lo reciben antes de que se eche a perder.",
        hours: 3,
        skills: ["conducir"],
      },
      {
        name: "Armen un sistema de programación y despacho",
        description:
          "Creen una forma rápida de avisar y confirmar a las personas voluntarias cuando surja un rescate, ya que quienes cultivan suelen avisar con poca antelación. Un chat grupal o lista de llamadas funciona.",
        hours: 2,
        skills: ["organización"],
        follows: [1],
      },
      {
        name: "Resuelvan responsabilidad y seguridad alimentaria",
        description:
          "Aprendan las protecciones tipo \"Buen Samaritano\" para donación de alimentos en su zona, acuerden reglas sencillas de manejo y usen una renuncia básica para que quienes cultivan reciban con tranquilidad.",
        hours: 3,
        skills: ["trámites", "seguridad alimentaria"],
      },
      {
        name: "Construyan canales de distribución",
        description:
          "Definan a dónde va la cosecha rescatada — neveras comunitarias, despensas, programas de comidas o directo a familias — para que nunca se quede sin usar.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Realicen los rescates y registren los kilos",
        description:
          "Cosechen con cuidado para proteger el sitio, distribuyan pronto y registren cuánto alimento se rescató. Las cifras ayudan a convocar a más voluntariado y a quienes cultivan.",
        hours: 4,
        skills: ["jardinería", "conducir"],
        follows: [0, 2, 3, 5],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "community-mediation",
    name: "Red de mediación y resolución de conflictos comunitaria",
    purpose:
      "Ofrecer mediación gratuita y neutral para disputas vecinales, resolviendo el conflicto sin tribunales ni policía.",
    whoItServes:
      "Vecinas y vecinos, personas inquilinas y propietarias, compañeras y compañeros de vivienda, y grupos comunitarios en conflicto.",
    whatYoullNeed:
      "Personas mediadoras capacitadas, un espacio neutral y un proceso de solicitud. La mediación es para disputas entre partes dispuestas — descarten y deriven cualquier situación con violencia, abuso o peligro a la o el profesional adecuado o a servicios de emergencia.",
    setupHours: 22,
    defaultCategory: "other",
    firstSteps:
      "Habla primero con un centro de mediación comunitaria " +
      "existente o con quien capacite a mediadores — este oficio " +
      "no se improvisa — y antes del primer caso dejen por " +
      "escrito el filtro: qué disputas toman y a dónde derivan " +
      "cualquier situación con violencia o abuso.",
    commonPitfalls:
      "La falla peligrosa es mediar lo que no debe mediarse: una " +
      "'disputa vecinal' que en realidad es abuso pone a alguien " +
      "en riesgo, así que filtren cada solicitud. Y la " +
      "confidencialidad es todo el capital del proyecto — un solo " +
      "detalle filtrado y nadie vuelve a confiar; cuiden también " +
      "a sus mediadoras y mediadores, porque este trabajo " +
      "desgasta.",
    pairsWith: ["legal-aid-clinic", "tenant-union"],
    learnMore: ["disagree-with-member"],
    tasks: [
      {
        name: "Convoquen y capaciten a personas mediadoras",
        description:
          "Encuentren personas voluntarias serenas y ecuánimes y capacítenlas, ya sea en una formación reconocida de mediación o aliándose con un centro de mediación comunitaria existente.",
        hours: 6,
        skills: ["difusión", "facilitación"],
      },
      {
        name: "Armen un proceso de solicitud y admisión",
        description:
          "Creen una forma sencilla para que la gente solicite mediación. En la admisión, escuchen lo básico de cada parte y confirmen que el caso es apropiado para mediación.",
        hours: 3,
        skills: ["organización", "entrevistas"],
      },
      {
        name: "Encuentren espacios neutrales de reunión",
        description:
          "Consigan lugares tranquilos y neutrales — un salón de biblioteca o centro comunitario — donde ambas partes se sientan seguras y en igualdad de condiciones.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Definan el alcance y los límites",
        description:
          "Decidan qué mediarán (ruido, espacios compartidos, disputas menores) y qué no. Descarten situaciones con violencia, abuso o riesgo de seguridad y deriven esos casos a profesionales adecuadas y adecuados.",
        hours: 3,
        skills: ["facilitación", "redacción"],
      },
      {
        name: "Establezcan confidencialidad y reglas básicas",
        description:
          "Fijen reglas claras: confidencialidad, participación voluntaria, turnos con respeto, y una persona mediadora que guía pero no decide. Pónganlas por escrito para quienes participan.",
        hours: 3,
        skills: ["redacción"],
      },
      {
        name: "Difundan el servicio",
        description:
          "Hagan saber a vecinas y vecinos, grupos de vivienda y organizaciones locales que existe una mediación gratuita, para que la gente la busque antes de que los conflictos escalen.",
        hours: 3,
        skills: ["difusión", "diseño gráfico"],
        follows: [1, 3],
      },
      {
        name: "Hagan seguimiento de resultados y cuiden a las personas mediadoras",
        description:
          "Anoten tasas de resolución (sin romper la confidencialidad) y hagan debriefs regulares con quienes median. El trabajo agota, así que roten casos y ofrezcan apoyo.",
        hours: 2,
        recurringCadence: "month",
        skills: ["captura de datos", "facilitación"],
      },
    ],
  },
  {
    id: "reentry-support",
    name: "Red de apoyo al reingreso",
    purpose:
      "Ayudar a personas que regresan de la prisión a conseguir identificación, vivienda, trabajo y comunidad, aliviando una transición notoriamente difícil.",
    whoItServes:
      "Personas anteriormente encarceladas y sus familias.",
    whatYoullNeed:
      "Personas voluntarias, organizaciones aliadas y un directorio sólido de recursos. Traten los antecedentes e historias de las personas como privados — guíense por el respeto, sigan los objetivos propios de cada persona y deriven asuntos legales a asesoría calificada.",
    setupHours: 28,
    defaultCategory: "other",
    firstSteps:
      "Antes de armar nada, siéntense con personas que ya " +
      "vivieron el regreso y con las organizaciones de reingreso, " +
      "oficinas de libertad condicional y empleadores de " +
      "oportunidad justa que ya trabajan en su zona — pregunten " +
      "qué traba de verdad a la gente en las primeras semanas y " +
      "dónde encaja su red. Consigan desde ya un contacto de " +
      "asesoría legal calificada, para que cuando surjan " +
      "preguntas legales tengan a dónde derivarlas de verdad.",
    commonPitfalls:
      "Este proyecto muere cuando se vuelve un filtro — personas " +
      "voluntarias decidiendo quién merece ayuda — o cuando la " +
      "historia de alguien se filtra y le cuesta un trabajo o una " +
      "vivienda. También falla en silencio cuando el entusiasmo " +
      "supera al seguimiento; una promesa rota golpea más fuerte " +
      "a quien está reconstruyendo confianza que ninguna promesa.",
    pairsWith: ["court-support", "books-to-prisoners"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Armen un directorio de recursos y aliadas y aliados",
        description:
          "Mapeen servicios para identificación y documentos, vivienda, empleo, salud, tratamiento y beneficios. Identifiquen qué empleadores y arrendadores están abiertos a personas con antecedentes.",
        hours: 6,
        skills: ["difusión", "captura de datos"],
      },
      {
        name: "Convoquen y capaciten a personas voluntarias",
        description:
          "Encuentren personas voluntarias sin prejuicios y capacítenlas en apoyo respetuoso e informado por el trauma. Quienes regresan a casa necesitan acompañantes, no porteras y porteros.",
        hours: 5,
        skills: ["difusión", "enseñanza"],
      },
      {
        name: "Creen una bienvenida y entrevista de necesidades",
        description:
          "Armen una manera sencilla y digna de saber qué necesita cada persona con más urgencia — a menudo identificación, un lugar donde quedarse e ingresos — y prioricen desde ahí.",
        hours: 3,
        skills: ["entrevistas"],
      },
      {
        name: "Apoyen con documentos y beneficios",
        description:
          "Ayuden a reponer identificación y tarjetas de seguro social, a solicitar beneficios y con otros trámites difíciles de hacer sin domicilio ni acceso a internet.",
        hours: 4,
        recurringCadence: "month",
        skills: ["trámites"],
      },
      {
        name: "Conecten con empleo y vivienda",
        description:
          "Hagan presentaciones cálidas con empleadores de oportunidad justa y opciones de vivienda, y apoyen con postulaciones, currículums y preparación de entrevistas.",
        hours: 4,
        recurringCadence: "month",
        skills: ["difusión", "redacción"],
        follows: [0],
      },
      {
        name: "Ofrezcan mentoría entre pares",
        description:
          "Cuando sea posible, emparejen a las personas con mentoras y mentores que han vivido el reingreso. Esa experiencia compartida construye confianza más rápido que cualquier otra cosa.",
        hours: 3,
        recurringCadence: "month",
        skills: ["facilitación"],
      },
      {
        name: "Establezcan prácticas de privacidad y límites",
        description:
          "Manejen las historias de las personas con estricta confidencialidad, nunca presionen a nadie a compartir más de lo que quiere y deriven preguntas legales a abogadas y abogados calificados.",
        hours: 3,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "community-wood-bank",
    name: "Banco comunitario de leña / Apoyo para calefacción",
    purpose:
      "Recolectar y distribuir leña y coordinar apoyo de calefacción para que las vecinas y los vecinos pasen el invierno en calor.",
    whoItServes:
      "Hogares rurales y de bajos ingresos que se calientan con leña, y personas mayores que no pueden cortar o partir la suya.",
    whatYoullNeed:
      "Una fuente de leña, un sitio de procesamiento y almacenamiento, equipo, una cuadrilla capacitada y un plan de entrega. Las motosierras y las hendidoras son peligrosas — permitan operar solo a personas capacitadas, exijan equipo de protección y hagan una charla de seguridad antes de cada sesión.",
    setupHours: 24,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Empiecen hablando con los hogares que se calientan con " +
      "leña — personas mayores rurales, familias que la oficina " +
      "de asistencia de combustible ya conoce — para saber cuánto " +
      "queman y cuándo se quedan cortos, y luego llamen a los " +
      "servicios de poda locales para preguntar a dónde va su " +
      "madera ahora. Antes de encender una sola motosierra, " +
      "definan quién se hace cargo de la seguridad: alguien con " +
      "suficiente experiencia para capacitar a la cuadrilla y sin " +
      "miedo a decirle que no a una persona voluntaria.",
    commonPitfalls:
      "Las dos formas en que esto lastima: una persona sin " +
      "capacitación operando una motosierra, y entregar leña " +
      "verde que humea, tapa las chimeneas con creosota y no " +
      "calienta. Cortar en octubre para diciembre significa leña " +
      "húmeda — el fracaso de calendario es tan real como el de " +
      "seguridad.",
    pairsWith: ["weatherization-brigade", "cooling-warming-center"],
    tasks: [
      {
        name: "Aseguren una fuente de leña",
        description:
          "Gestionen el suministro con servicios de poda, limpieza tras tormentas, donaciones de árboles caídos o predios manejados de forma sostenible. Confirmen que pueden tomarla y procesarla legalmente.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Encuentren un sitio de procesamiento y almacenamiento",
        description:
          "Consigan un patio o terreno donde se pueda cortar, partir, apilar y secar la leña. Necesitan espacio para mantener seco el suministro de esta temporada y secando el de la próxima.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Consigan equipo y equipo de protección",
        description:
          "Obtengan o pidan prestada una hendidora, motosierras y equipo de protección (perneras, protección de ojos y oídos, guantes). Mantengan las herramientas y un botiquín de primeros auxilios en el sitio.",
        hours: 4,
        skills: ["conducir", "reparación de herramientas"],
      },
      {
        name: "Convoquen y capaciten a la cuadrilla de leña",
        description:
          "Armen la cuadrilla y aseguren que solo personas debidamente capacitadas operen motosierras y hendidoras. Hagan una charla de seguridad antes de cada día de trabajo.",
        hours: 4,
        skills: ["enseñanza", "difusión"],
      },
      {
        name: "Armen un sistema de solicitud y entrega",
        description:
          "Creen una forma para que los hogares pidan leña y coordinen la entrega, dado que muchas personas receptoras son mayores o no tienen camioneta. Confirmen un apilado seguro cerca del hogar.",
        hours: 3,
        skills: ["organización", "conducir"],
      },
      {
        name: "Definan criterios de distribución",
        description:
          "Decidan cuánta leña recibe cada hogar y prioricen a quienes corren más riesgo con el frío. Mantengan el proceso simple y de baja barrera.",
        hours: 2,
        skills: ["facilitación"],
      },
      {
        name: "Programen días de trabajo y el secado",
        description:
          "Planeen el corte y la partición con mucha antelación al invierno, porque la leña verde debe secar meses antes de quemar de forma segura. Lleven registro de lo que ya está seco y listo.",
        hours: 3,
        recurringCadence: "cycle",
        skills: ["organización"],
        follows: [0, 1, 2, 3],
      },
    ],
  },
  {
    id: "community-wifi-mesh",
    name: "WiFi comunitario gratuito / Red en malla",
    purpose:
      "Ofrecer acceso gratuito a internet donde es inaccesible o no se puede pagar.",
    whoItServes:
      "Hogares de bajos ingresos, estudiantes, personas que buscan trabajo y cualquiera que esté desconectada de internet confiable.",
    whatYoullNeed:
      "Una conexión de internet de respaldo, routers y nodos en malla, personas voluntarias con conocimientos técnicos y sitios anfitriones.",
    setupHours: 32,
    defaultCategory: "tech",
    firstSteps:
      "Recorran las cuadras que quieren cubrir y toquen puertas — " +
      "hablen con los hogares sin servicio sobre para qué lo " +
      "usarían de verdad, y con quienes tienen techos y ventanas " +
      "altas que podrían alojar un nodo. Antes de comprar equipo, " +
      "tengan la conversación del ancho de banda: encuentren el " +
      "negocio, biblioteca o ISP dispuesto a compartir una línea " +
      "y confirmen por escrito que se permite redistribuir.",
    commonPitfalls:
      "Las redes en malla suelen morir de mantenimiento, no de " +
      "construcción — la persona técnica fundadora se muda y " +
      "nadie más puede entrar a los routers, así que documenten " +
      "todo y capaciten a una segunda persona desde el primer " +
      "día. El otro fracaso silencioso es construir donde la " +
      "señal llega fácil en vez de donde la gente de verdad no " +
      "tiene acceso.",
    pairsWith: ["digital-literacy", "emergency-preparedness"],
    tasks: [
      {
        name: "Mapeen las necesidades y los vacíos de cobertura",
        description:
          "Identifiquen qué cuadras carecen de acceso asequible y hasta dónde podría llegar la señal. Anoten edificios con línea de vista y personas anfitrionas dispuestas. Esto le da forma a todo el diseño.",
        hours: 4,
        skills: ["soporte técnico"],
      },
      {
        name: "Aseguren una conexión de internet de respaldo",
        description:
          "Consigan una fuente de ancho de banda para compartir — una línea empresarial donada, una alianza con un ISP o un enlace de red comunitaria. Confirmen que los términos permiten redistribuir.",
        hours: 5,
        skills: ["difusión", "soporte técnico"],
      },
      {
        name: "Convoquen personas voluntarias con perfil técnico",
        description:
          "Busquen gente cómoda con redes que pueda configurar routers y resolver problemas. Bastan un par para empezar, más personas dispuestas a aprender.",
        hours: 3,
        skills: ["difusión", "soporte técnico"],
      },
      {
        name: "Consigan y configuren equipo",
        description:
          "Reúnan routers, nodos en malla y antenas mediante donaciones o un presupuesto pequeño. Configúrenlos para una red abierta o de uso compartido simple y prueben la cobertura.",
        hours: 10,
        skills: ["soporte técnico"],
        follows: [2],
      },
      {
        name: "Encuentren sitios anfitriones para los nodos",
        description:
          "Coloquen los nodos donde extiendan el alcance — techos, ventanas altas y porches con corriente y permiso. Obtengan un visto bueno por escrito de cada sitio y cubran cualquier pequeño costo eléctrico.",
        hours: 5,
        skills: ["difusión"],
        follows: [0],
      },
      {
        name: "Definan normas de uso aceptable y de privacidad",
        description:
          "Publiquen reglas simples, eviten registrar la actividad de las personas usuarias y dejen claro que una red abierta no es privada. Orienten sobre prácticas básicas de seguridad como HTTPS y VPN.",
        hours: 2,
        skills: ["redacción"],
      },
      {
        name: "Mantengan y amplíen la red",
        description:
          "Revisen los nodos con regularidad, reemplacen hardware que falle y sumen cobertura cuando se incorporen nuevos anfitriones. Documenten la instalación para que otras personas puedan ayudar a mantenerla.",
        hours: 3,
        recurringCadence: "month",
        skills: ["soporte técnico"],
        follows: [3, 4],
      },
    ],
  },
  {
    id: "mental-health-peer-support",
    name: "Círculo de apoyo entre pares en salud mental",
    purpose:
      "Ofrecer un espacio seguro, regular y dirigido por pares para que las personas compartan y se apoyen mutuamente — un complemento, no un reemplazo, de la atención profesional.",
    whoItServes:
      "Cualquier persona que esté atravesando estrés, aislamiento, duelo o desafíos de salud mental y quiera conexión entre pares.",
    whatYoullNeed:
      "Personas facilitadoras capacitadas, un espacio privado, y límites claros junto con un plan de derivación en crisis. El apoyo entre pares complementa la atención profesional en salud mental — no la reemplaza. Las personas facilitadoras no son terapeutas, y siempre debe existir un plan claro para conectar a quien esté en crisis con recursos profesionales o de emergencia calificados.",
    setupHours: 21,
    defaultCategory: "emotional_support",
    firstSteps:
      "Sus primeras conversaciones son con las personas que " +
      "podrían facilitar y con proveedores locales de salud " +
      "mental — una clínica, línea de crisis o terapeuta que " +
      "acepte ser su ruta de derivación antes de que el primer " +
      "círculo se reúna. No abran las puertas hasta que las " +
      "personas facilitadoras estén capacitadas y todas puedan " +
      "decir con claridad qué es y qué no es el círculo.",
    commonPitfalls:
      "El fracaso peligroso es la deriva: un círculo cálido se " +
      "convierte poco a poco en el único apoyo de alguien, " +
      "quienes facilitan empiezan a hacer de terapeutas, y no hay " +
      "plan para la noche en que alguien está en crisis de " +
      "verdad. El más silencioso es el desgaste — si las personas " +
      "que sostienen el espacio no tienen su propio apoyo, el " +
      "círculo se apaga en un año.",
    pairsWith: ["neighborhood-care-network", "disability-support-network", "harm-reduction-supplies"],
    learnMore: ["who-sees-what", "lurking-ok"],
    tasks: [
      {
        name: "Convoquen y capaciten a personas facilitadoras",
        description:
          "Busquen personas cálidas y estables y pídanles que completen una capacitación en apoyo entre pares o escucha activa. Dejen claro que las personas facilitadoras son pares que sostienen el espacio, no clínicas que diagnostican o tratan.",
        hours: 5,
        skills: ["facilitación", "difusión"],
      },
      {
        name: "Definan el alcance y los límites del círculo",
        description:
          "Establezcan que esto es apoyo entre pares, no terapia ni atención de crisis. Pongan por escrito para qué es el círculo y qué queda fuera de su rol, para que las expectativas queden claras para todas las personas.",
        hours: 3,
        skills: ["redacción"],
      },
      {
        name: "Armen un plan de derivación y escalamiento en crisis",
        description:
          "Preparen pasos claros para cuando alguien esté en angustia más allá del apoyo entre pares: cómo conectarle con cuidado a ayuda profesional o a servicios de crisis, y cuándo activar apoyo de emergencia. Tengan a mano recursos locales y nacionales actualizados.",
        hours: 3,
        skills: ["redacción"],
        follows: [1],
      },
      {
        name: "Encuentren un espacio privado y seguro",
        description:
          "Aseguren una sala tranquila, cómoda y confidencial donde las personas puedan hablar con libertad. La constancia del lugar ayuda a que la gente se sienta segura para volver.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Acuerden confidencialidad y reglas del grupo",
        description:
          "Acuerden confidencialidad, no dar consejos a menos que se pidan, no interrumpir y el derecho a pasar. Compártanlas al inicio de cada sesión.",
        hours: 3,
        skills: ["facilitación", "redacción"],
      },
      {
        name: "Agenden y difundan las sesiones",
        description:
          "Elijan un horario constante, mantengan grupos de un tamaño manejable y difundan de un modo que reduzca el estigma. Dejen claro que es gratuito y abierto.",
        hours: 3,
        skills: ["difusión", "organización"],
        follows: [0, 3],
      },
      {
        name: "Acompañen a las personas facilitadoras y eviten el desgaste",
        description:
          "Hagan reuniones regulares para que las personas facilitadoras descarguen y descompriman. Roten quién guía y asegúrense de que también tengan su propio apoyo.",
        hours: 2,
        recurringCadence: "month",
        skills: ["facilitación"],
      },
    ],
  },
  {
    id: "community-cleanup",
    name: "Limpieza comunitaria y restauración de espacios verdes",
    purpose:
      "Recoger basura, restaurar lotes y parques abandonados y crear espacios verdes compartidos.",
    whoItServes:
      "Todo el barrio — un espacio más limpio, seguro y verde beneficia a todas las personas.",
    whatYoullNeed:
      "Personas voluntarias, insumos, permisos del sitio y un plan de disposición de residuos. Los sitios abandonados pueden esconder peligros reales — nunca recojan agujas ni químicos desconocidos con la mano; usen herramientas y un contenedor rígido para objetos punzantes, y desechen los hallazgos peligrosos según las reglas locales.",
    setupHours: 10,
    defaultCategory: "infrastructure",
    suggestsWorkDays: true,
    firstSteps:
      "Recorran el barrio con quienes viven más cerca de los " +
      "puntos descuidados — saben qué lotes importan, de quién " +
      "son y qué se intentó antes — y averigüen si el municipio o " +
      "un grupo de amigas y amigos del parque ya organiza " +
      "limpiezas a las que puedan sumarse. Resuelvan propiedad, " +
      "permisos y a dónde va la basura antes de elegir la fecha.",
    commonPitfalls:
      "Las limpiezas fracasan de dos maneras: las bolsas de " +
      "basura recolectada se quedan semanas en la banqueta porque " +
      "nadie coordinó la disposición, y el lote hermosamente " +
      "despejado vuelve a estar cubierto de maleza para el otoño " +
      "porque no hubo plan más allá del gran día. Y una persona " +
      "voluntaria que agarra una aguja con la mano puede " +
      "convertir una buena mañana en una visita al hospital.",
    pairsWith: ["community-garden", "community-composting"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Identifiquen y prioricen sitios",
        description:
          "Recorran la zona y enumeren los puntos que necesitan atención — esquinas cargadas de basura, lotes con maleza, parques descuidados. Prioricen por impacto y viabilidad.",
        hours: 1.5,
      },
      {
        name: "Obtengan permisos y un plan de disposición",
        description:
          "Confirmen quién es dueño de cada sitio y obtengan permiso. Arreglen la recolección de basura y escombros con anticipación — coordinen un contenedor o un recoge municipal para que las bolsas no se acumulen.",
        hours: 2,
        skills: ["difusión", "trámites"],
        follows: [0],
      },
      {
        name: "Reúnan insumos y equipo de seguridad",
        description:
          "Recolecten guantes, bolsas, pinzas y chalecos de alta visibilidad. Incluyan un contenedor rígido para objetos punzocortantes y un plan para cualquier material peligroso que encuentren.",
        hours: 1.5,
        skills: ["conducir"],
      },
      {
        name: "Convoquen y organicen personas voluntarias",
        description:
          "Corran la voz y registren a las personas. Asignen líderes de equipo y zonas para que el día sea organizado y no caótico.",
        hours: 2,
        skills: ["difusión", "organización"],
      },
      {
        name: "Lleven a cabo el día de limpieza o restauración",
        description:
          "Realicen el evento, mantengan a los equipos seguros e hidratados y celebren juntas y juntos el resultado visible. Tomen fotos del antes y después para motivar la próxima convocatoria.",
        hours: 3,
        skills: ["organización", "fotografía"],
        follows: [1, 2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "free-tax-prep",
    name: "Preparación gratuita de impuestos y clínica de empoderamiento financiero",
    purpose:
      "Ayudar a vecinas y vecinos de bajos ingresos a presentar impuestos de forma gratuita y reclamar los créditos y reembolsos que les corresponden.",
    whoItServes:
      "Personas trabajadoras de bajos ingresos, familias elegibles para créditos fiscales, personas mayores y estudiantes.",
    whatYoullNeed:
      "Personas preparadoras capacitadas y certificadas, un espacio, computadoras y un sistema de citas. Las declaraciones deben ser preparadas por personas voluntarias certificadas a través de un programa reconocido — esta clínica ayuda con declaraciones estándar, no con situaciones complejas que requieren a un profesional fiscal.",
    setupHours: 28,
    defaultCategory: "skilled_labor",
    suggestsWorkDays: true,
    firstSteps:
      "Su primera llamada es a un programa establecido de " +
      "presentación gratuita como VITA — hablen con su " +
      "coordinación sobre plazos de certificación, software y qué " +
      "necesita un sitio nuevo, porque esto no conviene hacerlo " +
      "por su cuenta. Después hablen con las vecinas y vecinos a " +
      "quienes esperan servir sobre cuándo pueden venir de verdad " +
      "y qué les ha impedido declarar antes.",
    commonPitfalls:
      "Una declaración mal hecha puede costarle a una familia su " +
      "reembolso o provocar una auditoría — por eso la línea que " +
      "este proyecto nunca debe cruzar es que personas sin " +
      "certificación preparen impuestos. Los fracasos más suaves: " +
      "lanzar en marzo cuando la certificación toma meses, y que " +
      "alguien haga todo el viaje solo para ser rechazado por un " +
      "documento que nadie le dijo que trajera.",
    pairsWith: ["legal-aid-clinic", "solidarity-fund"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Capaciten y certifiquen a las personas preparadoras",
        description:
          "Hagan que las personas voluntarias completen una certificación reconocida de preparación gratuita de impuestos (como el programa VITA del IRS) para que las declaraciones sean correctas y estén debidamente autorizadas. Esto no es negociable.",
        hours: 10,
        recurringCadence: "cycle",
        skills: ["contabilidad"],
      },
      {
        name: "Aliense con un programa reconocido de presentación gratuita",
        description:
          "Afílense a un programa establecido para obtener software, soporte y credibilidad. Ellos brindan las herramientas de presentación y los controles de calidad que no conviene construir solos.",
        hours: 4,
        skills: ["difusión", "trámites"],
      },
      {
        name: "Habiliten un espacio y el equipo",
        description:
          "Consigan un local con computadoras, internet confiable y suficiente privacidad para que las personas puedan compartir información financiera sensible con tranquilidad.",
        hours: 3,
        skills: ["soporte técnico"],
      },
      {
        name: "Armen un sistema de citas y de admisión",
        description:
          "Creen citas y una lista clara de documentos que las personas deben traer (identificación, comprobantes de ingresos, declaración anterior). Esto evita viajes en vano y esperas largas.",
        hours: 3,
        skills: ["organización", "captura de datos"],
      },
      {
        name: "Difundan entre vecinas y vecinos elegibles",
        description:
          "Corran la voz, resaltando que presentar puede destrabar reembolsos y créditos que muchas personas se pierden. Lleguen a trabajadores, familias y personas mayores que con frecuencia califican.",
        hours: 3,
        recurringCadence: "cycle",
        skills: ["difusión", "diseño gráfico"],
        follows: [3],
      },
      {
        name: "Aseguren la seguridad y la privacidad de los datos",
        description:
          "Protejan hasta el último dato personal y financiero: dispositivos seguros, sin copias innecesarias, almacenamiento bajo llave y una política clara de retención y destrucción.",
        hours: 3,
        skills: ["soporte técnico"],
      },
      {
        name: "Ofrezcan seguimiento de empoderamiento financiero",
        description:
          "Cuando se quiera, conecten a las personas con apoyo de presupuesto, banca segura y orientación sobre beneficios. Manténganlo opcional y deriven situaciones complejas a profesionales calificados.",
        hours: 2,
        skills: ["contabilidad"],
      },
    ],
  },
  {
    id: "community-market",
    name: "Mercado comunitario / Puesto agrícola gratuito",
    purpose:
      "Operar un puesto regular, gratuito o de pago según puedas, que distribuya frutas, verduras y básicos.",
    whoItServes:
      "Vecinas y vecinos con inseguridad alimentaria y personas en zonas sin acceso a productos frescos asequibles.",
    whatYoullNeed:
      "Una fuente de productos, un puesto o ubicación, personas voluntarias y un horario regular.",
    setupHours: 15,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Empiecen con las conversaciones de suministro — visiten " +
      "granjas, tiendas y huertas comunitarias para saber qué " +
      "excedente existe de verdad y con qué ritmo — y hablen con " +
      "las vecinas y vecinos de la zona sobre por dónde ya " +
      "caminan y qué comida se llevarían de verdad a casa. Elijan " +
      "el lugar con las personas que lo van a usar, no por ellas.",
    commonPitfalls:
      "Un puesto que aparece de forma errática le enseña a la " +
      "gente a dejar de contar con él — la constancia importa más " +
      "que la abundancia. Los otros fracasos: un suministro que " +
      "se seca después del primer mes de entusiasmo, y cualquier " +
      "cosa en la mesa (formularios, preguntas, clasificar a la " +
      "gente) que haga que llevarse comida se sienta como " +
      "solicitarla.",
    pairsWith: ["gleaning-network", "bulk-buying-coop", "community-garden"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Aseguren suministro de productos y artículos",
        description:
          "Consigan alimentos a través de gleaning, huertas comunitarias, donaciones de granjas y tiendas y compras al por mayor. Apunten a variedad y confiabilidad para que el puesto no quede vacío.",
        hours: 3,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Encuentren ubicación y monten el puesto",
        description:
          "Elijan un lugar visible, accesible y con permiso — el borde de un parque, un estacionamiento o una parada de transporte. Acomoden mesas, sombra y señalización.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Decidan el modelo",
        description:
          "Elijan totalmente gratuito, paga lo que puedas o una mezcla. Cualquier opción que tomen, asegúrense de no rechazar nunca a nadie por no poder pagar.",
        hours: 1,
        skills: ["facilitación"],
      },
      {
        name: "Organicen exhibición, almacenamiento y seguridad alimentaria",
        description:
          "Mantengan los productos frescos y presentables, manejen los alimentos con seguridad y tengan hieleras o sombra para los días calurosos. Descarten lo que esté en mal estado.",
        hours: 2,
        skills: ["seguridad alimentaria"],
        follows: [1],
      },
      {
        name: "Convoquen y agenden personas voluntarias",
        description:
          "Organicen personas para recoger producto, montar, atender el puesto y desmontar. Asignen roles claros para cada mercado.",
        hours: 2,
        skills: ["organización", "difusión"],
      },
      {
        name: "Difundan y fijen un horario regular",
        description:
          "Elijan un día y hora constantes y publíquenlo ampliamente. La previsibilidad es lo que convierte un puesto en un recurso confiable.",
        hours: 2,
        skills: ["difusión", "diseño gráfico"],
        follows: [1, 2],
      },
      {
        name: "Operen el puesto y manejen las sobras",
        description:
          "Monten, distribuyan con calidez y sin juicio, y deriven cualquier producto sobrante a refrigeradores, despensas o programas de comidas para que nada se desperdicie.",
        hours: 3,
        skills: ["organización"],
        follows: [0, 3, 4],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "welcome-wagon",
    name: "Carreta de bienvenida: apoyo a vecinas y vecinos nuevos y a madres y padres recientes",
    purpose:
      "Recibir a personas recién llegadas y a quienes acaban de ser madres o padres con ayuda práctica, información local y una bienvenida real a la comunidad.",
    whoItServes:
      "Personas que se acaban de mudar, madres y padres nuevos o en espera, y cualquiera que necesite un comienzo amable.",
    whatYoullNeed:
      "Personas voluntarias, paquetes de información, artículos de bienvenida donados y un sistema de referencias.",
    setupHours: 10,
    defaultCategory: "emotional_support",
    firstSteps:
      "Hablen primero con quienes conocen a las personas recién " +
      "llegadas antes que ustedes — arrendadores, oficinas " +
      "escolares, clínicas, parteras y personal de pediatría — " +
      "sobre cómo referirían a alguien con su consentimiento. " +
      "Después pregúntenle a algunas personas recién mudadas y a " +
      "madres y padres recientes qué les habría ayudado de verdad " +
      "en su primer mes, y armen el paquete y la canasta " +
      "alrededor de sus respuestas.",
    commonPitfalls:
      "La forma en que esto sale mal es cuando se siente como " +
      "vigilancia — presentarse sin invitación en la puerta de " +
      "una persona desconocida, o pasar nombres sin " +
      "consentimiento, convierte una bienvenida en una intrusión. " +
      "También se apaga en silencio cuando las personas " +
      "fundadoras se agotan y nadie nota a las recién llegadas " +
      "durante meses.",
    pairsWith: ["newcomer-translation-network", "diaper-hygiene-bank", "neighborhood-care-network"],
    learnMore: ["invite-someone"],
    tasks: [
      {
        name: "Definan a quién darán la bienvenida y cómo",
        description:
          "Definan su enfoque — residentes nuevos, madres y padres nuevos, o ambos — y la forma que toma la bienvenida (una visita, una canasta, una llamada). Manténganlo opt-in y nunca invasivo.",
        hours: 1,
        skills: ["facilitación"],
      },
      {
        name: "Armen un paquete de información local",
        description:
          "Reúnan una guía clara de servicios locales, transporte, escuelas, atención médica y su programa de apoyo mutuo. Ofrézcanlo en los idiomas que se hablan en su zona.",
        hours: 3,
        skills: ["redacción", "traducción"],
        follows: [0],
      },
      {
        name: "Armen canastas de bienvenida",
        description:
          "Junten cosas útiles — básicos de despensa, artículos del hogar, y para madres y padres nuevos, algunos esenciales de bebé o una comida casera. Consíganlas con donaciones.",
        hours: 2,
        recurringCadence: "month",
        skills: ["difusión", "organización"],
        follows: [0],
      },
      {
        name: "Convoquen y capaciten a personas que reciben",
        description:
          "Busquen personas voluntarias amables y entrénenlas para ser cálidas y respetuosas, para leer si alguien quiere conexión, y para nunca presionar ni meterse de más.",
        hours: 2,
        skills: ["difusión", "enseñanza"],
      },
      {
        name: "Armen un sistema de referencias e inscripción",
        description:
          "Creen formas simples para que las personas sean referidas o se anoten — por arrendadores, clínicas, escuelas o un formulario. Respeten la privacidad en todo el proceso.",
        hours: 2,
        skills: ["organización", "captura de datos"],
        follows: [0],
      },
    ],
  },
  {
    id: "library-of-things",
    name: "Biblioteca de cosas",
    purpose:
      "Prestar artículos del hogar y para eventos que la gente rara vez necesita poseer — utensilios de cocina, equipo para fiestas y campamento, equipo de bebé, proyectores y más.",
    whoItServes:
      "Cualquier persona; ahorra dinero, reduce el desorden y disminuye el desperdicio.",
    whatYoullNeed:
      "Almacenamiento, artículos donados, un catálogo y sistema de préstamos, y un par de personas bibliotecarias.",
    setupHours: 21,
    defaultCategory: "infrastructure",
    firstSteps:
      "Antes de recolectar un solo artículo, pregúntenle a la " +
      "gente qué pediría prestado de verdad — esa encuesta es el " +
      "cimiento del proyecto — y hablen con la biblioteca pública " +
      "o un centro comunitario sobre alojarla, porque una " +
      "institución de confianza resuelve de una vez el " +
      "almacenamiento y la credibilidad. Consigan a sus dos " +
      "personas bibliotecarias antes de que lleguen las " +
      "donaciones, no después.",
    commonPitfalls:
      "Las bibliotecas de cosas mueren de desorden: decirle que " +
      "sí a cada donación llena la sala de panificadoras rotas " +
      "que nadie quiere, mientras la hidrolavadora que todo el " +
      "mundo pidió sigue faltando. El otro asesino son los " +
      "horarios impredecibles — si la gente no puede contar con " +
      "cuándo recoger y devolver, vuelve en silencio a comprar.",
    pairsWith: ["tool-lending-library", "toy-library", "free-store"],
    learnMore: ["confirm-exchange"],
    tasks: [
      {
        name: "Pregunten a la comunidad qué quiere pedir prestado",
        description:
          "Pregúntenle a las personas qué usarían pero odiarían comprar — mesas plegables, una ponchera, una carpa, una limpiadora de alfombras, una carriola. Las respuestas definen su inventario inicial.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Encuentren almacenamiento y horario de atención",
        description:
          "Consigan un clóset, sala o contenedor para guardar los artículos y fijen horas predecibles de recogida y devolución para que pedir prestado sea fácil.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Recolecten, limpien y prueben los artículos",
        description:
          "Junten donaciones y luego limpien, prueben y revisen cada artículo por seguridad. Aparten cualquier cosa rota, retirada del mercado o no higiénica.",
        hours: 5,
        skills: ["conducir"],
        follows: [0, 1],
      },
      {
        name: "Cataloguen y fotografíen el inventario",
        description:
          "Registren cada artículo con una foto y su estado en una hoja de cálculo o app de préstamos. Numeren los artículos para que sean fáciles de rastrear al salir y entrar.",
        hours: 4,
        skills: ["captura de datos", "fotografía"],
        follows: [2],
      },
      {
        name: "Escriban reglas de préstamo y una política de confianza",
        description:
          "Definan duración del préstamo, límites de cantidad y una política de devolución indulgente. Constrúyanla sobre la confianza, no sobre multas, y anoten los artículos que requieran cuidado o limpieza extra.",
        hours: 2,
        skills: ["redacción"],
      },
      {
        name: "Habiliten el préstamo y capaciten a bibliotecarias y bibliotecarios",
        description:
          "Creen un formato simple de salida (nombre, contacto, artículo, fecha de devolución) con una foto rápida del estado. Guíen a las personas voluntarias por el catálogo y el proceso.",
        hours: 3,
        skills: ["captura de datos", "enseñanza"],
        follows: [3, 4],
      },
      {
        name: "Mantengan, sanitizen y hagan crecer la colección",
        description:
          "Limpien e inspeccionen los artículos devueltos, reparen lo que puedan y sumen con el tiempo lo que más se pide.",
        hours: 2,
        skills: ["reparación"],
        recurringCadence: "session",
      },
    ],
  },
  {
    id: "laundry-shower-access",
    name: "Programa de acceso a lavandería y duchas",
    purpose:
      "Ofrecer acceso gratuito a lavandería y duchas para que las personas puedan mantenerse limpias con dignidad.",
    whoItServes:
      "Vecinas y vecinos sin hogar, personas sin instalaciones funcionales y familias de bajos ingresos.",
    whatYoullNeed:
      "Acceso a máquinas y duchas (un sitio aliado o una unidad móvil), insumos y personas voluntarias. La dignidad y la privacidad de quienes llegan van primero — no pidan información personal para usar el servicio, mantengan las duchas privadas y seguras, y sigan las reglas locales de salud para instalaciones compartidas o móviles.",
    setupHours: 19,
    defaultCategory: "infrastructure",
    suggestsWorkDays: true,
    firstSteps:
      "Empiecen con dos rondas de conversaciones: con vecinas y " +
      "vecinos sin hogar y las personas de trabajo de calle que " +
      "los conocen, sobre qué horarios y lugares funcionarían de " +
      "verdad — y con la dueña de una lavandería, un gimnasio o " +
      "un sitio religioso sobre ser anfitrión. Esa conversación " +
      "es delicada; sean honestos sobre quiénes van a venir y " +
      "acuerden expectativas de privacidad, limpieza y horarios " +
      "antes de que llegue la primera persona.",
    commonPitfalls:
      "Este programa muere cuando la relación con el sitio " +
      "anfitrión se agria — una mala interacción sin protocolo " +
      "detrás, y el espacio se pierde — o cuando los horarios " +
      "cambian tanto que la gente cruza la ciudad para encontrar " +
      "la puerta cerrada. Y cada papel que exijan en la entrada " +
      "aleja a alguien que necesitaba una ducha más de lo que " +
      "ustedes necesitaban su nombre.",
    pairsWith: ["free-haircut", "cooling-warming-center", "diaper-hygiene-bank"],
    tasks: [
      {
        name: "Aseguren acceso a lavandería y duchas",
        description:
          "Aliense con una lavandería, gimnasio, sitio religioso, centro recreativo, o coordinen una unidad móvil. Confirmen horarios confiables y que el espacio ofrezca privacidad.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Consigan insumos",
        description:
          "Reúnan detergente, toallas limpias, jabón, champú y otros artículos de higiene mediante donaciones o un presupuesto pequeño. Incluyan algo de ropa limpia si pueden.",
        hours: 3,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Armen un sistema de inscripción y turnos",
        description:
          "Creen una forma justa de reservar cargas de lavado y turnos de ducha para que los tiempos de espera se mantengan razonables y todas las personas tengan su lugar.",
        hours: 3,
        skills: ["organización", "captura de datos"],
        follows: [0],
      },
      {
        name: "Establezcan protocolos de higiene y seguridad",
        description:
          "Definan rutinas de limpieza entre personas usuarias, aseguren áreas de ducha privadas y seguras, y protejan la dignidad y la seguridad de todas las personas en todo momento.",
        hours: 3,
        skills: ["redacción"],
        follows: [0],
      },
      {
        name: "Convoquen y capaciten a personas voluntarias",
        description:
          "Busquen personas voluntarias para hacer la admisión, manejar los insumos y limpiar entre usos. Capacítenlas para tratar a cada persona invitada con calidez y respeto.",
        hours: 3,
        skills: ["difusión", "enseñanza"],
        follows: [3],
      },
      {
        name: "Fijen un horario y corran la voz",
        description:
          "Elijan horas constantes y avísenle a personas de calle, albergues y vecinas y vecinos vinculados a la calle cuándo y dónde funciona el servicio.",
        hours: 3,
        skills: ["difusión"],
        follows: [0],
      },
    ],
  },
  {
    id: "voter-registration",
    name: "Campaña de registro de votantes y participación cívica",
    purpose:
      "Registrar votantes y ayudar a las personas a participar en elecciones y decisiones locales — estrictamente apartidista.",
    whoItServes:
      "Personas residentes elegibles, especialmente quienes históricamente han estado subrepresentadas en las urnas.",
    whatYoullNeed:
      "Personas voluntarias capacitadas, materiales de registro, reglas precisas y buenas ubicaciones. Mantengan la campaña estrictamente apartidista y sigan al pie de la letra todas las leyes electorales y de registro — entreguen solo información precisa y nunca aboguen por un partido o candidatura.",
    setupHours: 16,
    defaultCategory: "organizing",
    firstSteps:
      "Antes de que alguien ponga mesa, hablen con su oficina " +
      "electoral local — les dirán exactamente qué pueden y no " +
      "pueden hacer las campañas, y algunas zonas exigen " +
      "capacitación o registro previo. Luego conéctense con la " +
      "Liga de Mujeres Votantes u otro grupo apartidista " +
      "establecido; apoyarse en sus materiales y experiencia es " +
      "mejor que aprender la ley electoral a prueba y error.",
    commonPitfalls:
      "Los fracasos imperdonables son los legales: una pila de " +
      "formularios llenos olvidada en la cajuela de alguien hasta " +
      "pasado el plazo le quita el voto a cada persona que confió " +
      "en ustedes, y una sola persona voluntaria promoviendo una " +
      "candidatura puede manchar toda la campaña. El error más " +
      "sutil es repartir formularios de registro sin mencionar " +
      "nunca dónde ni cómo se vota de verdad.",
    pairsWith: ["newcomer-translation-network", "legal-aid-clinic"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Aprendan las reglas para campañas de registro",
        description:
          "Investiguen las leyes de su zona sobre registrar votantes: plazos, qué pueden y no pueden hacer las personas voluntarias, cómo se deben manejar los formularios y los requisitos de identificación. Cumplirlas con exactitud es esencial.",
        hours: 3,
        skills: ["trámites"],
      },
      {
        name: "Capaciten a personas voluntarias apartidistas",
        description:
          "Entrenen a las personas voluntarias para ayudar a registrarse a todas las personas sin importar sus opiniones, y para nunca promover un partido o candidatura. La imparcialidad protege a la campaña y a la confianza de la comunidad.",
        hours: 3,
        skills: ["enseñanza"],
        follows: [0],
      },
      {
        name: "Reúnan materiales e información precisa",
        description:
          "Recolecten formularios de registro e información verificada y actual sobre plazos, reglas de identificación, lugares de votación y opciones por correo. La información incorrecta hace más daño que ninguna.",
        hours: 2,
        skills: ["redacción"],
        follows: [0],
      },
      {
        name: "Elijan lugares y eventos de alto tránsito",
        description:
          "Pongan mesa donde la gente elegible ya se reúne — mercados, paradas de transporte, campus universitarios, eventos comunitarios — con cualquier permiso necesario para instalarse.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Atiendan la mesa de registro",
        description:
          "Cubran la mesa, ayuden a registrarse correctamente y entreguen los formularios con prontitud dentro de los plazos legales. Mantengan un tono cálido e informativo.",
        hours: 4,
        skills: ["difusión"],
        follows: [1, 2, 3],
        recurringCadence: "event",
      },
      {
        name: "Acompañen los siguientes pasos",
        description:
          "Más allá de registrar, ayuden a la gente a saber cómo, cuándo y dónde votar, incluidas opciones por correo y traslados a las urnas. Registrarse solo no es participar.",
        hours: 2,
        skills: ["difusión"],
      },
    ],
  },
  {
    id: "health-navigation",
    name: "Programa comunitario de navegación de salud",
    purpose:
      "Ayudar a vecinas y vecinos a encontrar y acceder a atención médica — clínicas, seguros, recetas y citas.",
    whoItServes:
      "Personas sin seguro o con poco seguro, personas mayores, recién llegadas y cualquiera perdida en el sistema de salud.",
    whatYoullNeed:
      "Personas navegadoras capacitadas, un directorio de recursos, alianzas con proveedores y un sistema de solicitudes. Las personas navegadoras conectan a la gente con la atención — no dan consejo médico ni diagnósticos. Deriven todas las preguntas clínicas a profesionales de salud calificados.",
    setupHours: 26,
    defaultCategory: "other",
    firstSteps:
      "Empiecen visitando las clínicas gratuitas y de tarifa " +
      "escalonada a las que van a derivar — preséntense, " +
      "pregunten qué derivaciones les ayudan y cuáles los " +
      "saturan, y dejen que esas conversaciones siembren su " +
      "directorio. Acuerden el límite antes de que llegue la " +
      "primera solicitud: las personas navegadoras se encargan de " +
      "logística y trámites, y cada pregunta clínica va a un " +
      "profesional, así que sepan exactamente a qué línea de " +
      "enfermería o clínica se las van a pasar.",
    commonPitfalls:
      "El filo peligroso es una persona navegadora " +
      "bienintencionada que se desliza hacia el consejo médico — " +
      "un 'eso no suena grave' dicho al pasar puede costarle a " +
      "alguien semanas de atención necesaria. Esto también falla " +
      "cuando el directorio envejece en silencio y manda a la " +
      "gente a clínicas cerradas o programas que ya terminaron; " +
      "un número equivocado le cuesta el último intento a alguien " +
      "que ya venía agotado.",
    pairsWith: ["rides-transportation", "newcomer-translation-network", "mental-health-peer-support"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Armen un directorio de recursos de salud",
        description:
          "Compilen clínicas gratuitas y de bajo costo, proveedores con tarifa escalonada, programas de asistencia para recetas, opciones dentales y de vista, y servicios de salud mental. Manténganlo al día.",
        hours: 6,
        skills: ["captura de datos", "difusión"],
      },
      {
        name: "Convoquen y capaciten a personas navegadoras",
        description:
          "Busquen personas voluntarias y capacítenlas para conectar a la gente con la atención — no para dar consejo médico. Su trabajo es orientación y logística, con las preguntas clínicas derivadas a profesionales.",
        hours: 5,
        skills: ["difusión", "enseñanza"],
      },
      {
        name: "Armen un sistema de solicitud y admisión",
        description:
          "Creen una forma privada y de baja barrera para que la gente pida ayuda y describa su situación, con opciones por teléfono y en persona, no solo en línea.",
        hours: 3,
        skills: ["organización"],
      },
      {
        name: "Ayuden con seguros e inscripción",
        description:
          "Acompañen a las personas a entender y solicitar la cobertura para la que califican (como Medicaid o planes del mercado de seguros) y a reunir los documentos necesarios.",
        hours: 4,
        recurringCadence: "month",
        skills: ["trámites"],
        follows: [2],
      },
      {
        name: "Ofrezcan apoyo con citas y recetas",
        description:
          "Ayuden a agendar citas, fijar recordatorios, navegar los costos de recetas y conectar con el programa de transporte para llegar a la atención.",
        hours: 3,
        recurringCadence: "month",
        skills: ["organización"],
        follows: [2],
      },
      {
        name: "Definan prácticas de privacidad para la información de salud",
        description:
          "Traten todos los datos de salud como altamente sensibles: recojan lo mínimo, almacénenlo de forma segura y nunca lo compartan sin consentimiento. Capaciten a las personas navegadoras en confidencialidad.",
        hours: 2,
        skills: ["redacción"],
      },
      {
        name: "Aliense con clínicas y proveedores",
        description:
          "Construyan relaciones con clínicas y proveedores locales para derivar con más fluidez y conocer nuevos servicios de bajo costo a medida que abren.",
        hours: 3,
        skills: ["difusión"],
      },
    ],
  },
  {
    id: "toy-library",
    name: "Juguetería comunitaria y préstamo de recursos de juego",
    purpose:
      "Prestar juguetes, juegos y equipo de juego para que las familias tengan variedad sin tener que comprarla.",
    whoItServes:
      "Familias con niñas y niños pequeños, especialmente con presupuesto ajustado; también reduce desperdicio y desorden.",
    whatYoullNeed:
      "Almacenamiento, juguetes donados, un catálogo y sistema de préstamo, materiales de limpieza y personas bibliotecarias.",
    setupHours: 10,
    defaultCategory: "childcare",
    firstSteps:
      "Hablen con las familias a las que esperan servir — a la " +
      "salida de la guardería, en una hora de cuentos, en un " +
      "grupo de juego — sobre qué juguetes sus hijas e hijos " +
      "dejan atrás más rápido y qué horarios realmente les " +
      "quedan, y luego pregunten en un centro comunitario, " +
      "iglesia o biblioteca por un estante o una sala. Consigan a " +
      "una persona voluntaria con experiencia en cuidado infantil " +
      "que se encargue de las revisiones de seguridad antes de " +
      "que empiecen a llegar donaciones.",
    commonPitfalls:
      "Las jugueterías comunitarias fallan por seguridad y por " +
      "piezas: un solo juguete retirado del mercado o un riesgo " +
      "de asfixia que se cuela rompe la confianza de las familias " +
      "para siempre, y los rompecabezas que vuelven incompletos " +
      "hacen que toda la colección se sienta de segunda en pocos " +
      "meses. La inspección estricta y las bolsas con conteo lo " +
      "son todo.",
    pairsWith: ["library-of-things", "childcare-collective", "school-supply-program"],
    tasks: [
      {
        name: "Consigan almacenamiento y horarios de apertura",
        description:
          "Aseguren estantería en un centro comunitario, biblioteca o espacio compartido, y fijen horarios predecibles de recogida y devolución que las familias puedan planear.",
        hours: 1.5,
        skills: ["difusión"],
      },
      {
        name: "Recolecten, limpien y revisen la seguridad de los juguetes",
        description:
          "Reúnan donaciones, luego limpien e inspeccionen cada juguete. Revisen retiros del mercado, piezas rotas y riesgos de asfixia, y aparten cualquier cosa insegura para niñas y niños pequeños.",
        hours: 3.5,
        skills: ["conducir", "cuidado infantil"],
        follows: [0],
      },
      {
        name: "Cataloguen y embolsen con todas las piezas",
        description:
          "Registren cada juguete con una foto y rango de edad, y embolsen los sets de varias piezas con el conteo para que nada se pierda. Numeren los artículos para seguimiento fácil.",
        hours: 2,
        skills: ["captura de datos", "fotografía"],
        follows: [1],
      },
      {
        name: "Escriban reglas de préstamo",
        description:
          "Fijen la duración del préstamo, cuántos juguetes a la vez y una política amable para devoluciones y piezas faltantes. Mantengan algo basado en la confianza y flexible.",
        hours: 1,
        skills: ["redacción"],
      },
      {
        name: "Armen el préstamo y capaciten a bibliotecarias y bibliotecarios",
        description:
          "Creen un registro de salida simple (nombre, contacto, artículo, fecha de devolución) y guíen a las personas voluntarias por el catálogo, la rutina de limpieza y las reglas.",
        hours: 2,
        skills: ["captura de datos", "enseñanza"],
        follows: [2, 3],
      },
    ],
  },
  {
    id: "food-preservation",
    name: "Colectivo de conservación de alimentos y enlatado",
    purpose:
      "Enseñar y hacer enlatado y conservación en grupo para que el excedente de temporada dure y se desperdicie menos comida.",
    whoItServes:
      "Personas que cultivan, espigan y familias que quieren estirar la comida durante el año.",
    whatYoullNeed:
      "Una cocina, equipo de enlatado y conservación, personas líderes con conocimiento y productos. La conservación casera implica riesgos reales para la seguridad alimentaria, incluyendo botulismo, cuando se hace mal — sigan siempre guías actualizadas y probadas de una fuente confiable y nunca improvisen tiempos ni métodos de procesamiento.",
    setupHours: 18,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "Encuentren primero el conocimiento, no la cocina: llamen " +
      "al servicio de extensión local o a una persona certificada " +
      "en conservación de alimentos y pídanle que capacite a sus " +
      "líderes o revise sus planes, y hablen con quienes cultivan " +
      "y espigan sobre qué excedente llega y cuándo. Reserven la " +
      "cocina alrededor del calendario de cosecha, no al revés.",
    commonPitfalls:
      "El fracaso que importa es invisible: un frasco sellado con " +
      "un método improvisado o con la receta no probada de la " +
      "abuela puede cargar botulismo y verse perfecto en el " +
      "estante. El fracaso ordinario es el calendario — los " +
      "tomates maduran a su ritmo, y un colectivo que organiza su " +
      "primera sesión en noviembre no conserva nada.",
    pairsWith: ["gleaning-network", "community-garden", "community-fridge"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Aseguren una cocina adecuada",
        description:
          "Encuentren una cocina con estufas, espacio de mesada y agua para procesamiento y limpieza. Un salón parroquial, centro comunitario o cocina comercial funciona bien.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Aprendan métodos seguros de conservación",
        description:
          "Hagan que sus líderes estudien métodos probados, basados en investigación, de una fuente reconocida (como un servicio de extensión universitaria). El enlatado incorrecto puede causar enfermedades graves, así que sigan siempre recetas y tiempos de procesamiento probados al pie de la letra.",
        hours: 4,
        skills: ["seguridad alimentaria", "cocina"],
      },
      {
        name: "Reúnan equipo y frascos",
        description:
          "Consigan enlatadoras de baño de agua y/o de presión, frascos, tapas y herramientas por donación o un pequeño presupuesto. Verifiquen que las enlatadoras de presión estén en condiciones seguras de funcionamiento.",
        hours: 3,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Consigan productos",
        description:
          "Traigan excedente de temporada de espigueo, huertos, granjas o compras al por mayor. Programen las sesiones para cuando los productos abunden y sean baratos.",
        hours: 2,
        recurringCadence: "cycle",
        skills: ["difusión"],
      },
      {
        name: "Planeen sesiones grupales de enlatado",
        description:
          "Elijan recetas adecuadas a los productos y al nivel del grupo, y organicen estaciones para que el trabajo fluya con seguridad y eficiencia.",
        hours: 2,
        recurringCadence: "session",
        skills: ["cocina", "organización"],
        follows: [1, 3],
      },
      {
        name: "Enseñen y conduzcan sesiones con seguridad",
        description:
          "Guíen al grupo por el proceso, haciendo cumplir el manejo seguro, los tiempos correctos de procesamiento y el sellado adecuado. Háganlo una sesión de enseñanza para que las habilidades se difundan.",
        hours: 4,
        skills: ["cocina", "enseñanza"],
        follows: [0, 2, 4],
        recurringCadence: "session",
      },
      {
        name: "Compartan los alimentos conservados y registren",
        description:
          "Repartan los productos conservados entre participantes y proyectos como el refrigerador o la despensa. Etiqueten cada frasco con contenido y fecha, y anoten qué funcionó para la próxima.",
        hours: 1,
        recurringCadence: "session",
        skills: ["organización"],
        follows: [5],
      },
    ],
  },
  {
    id: "free-haircut",
    name: "Días de corte de pelo y arreglo personal gratis",
    purpose:
      "Ofrecer cortes de pelo y arreglo personal gratis para devolver dignidad, confianza y un nuevo comienzo.",
    whoItServes:
      "Vecinas y vecinos sin techo, personas buscando empleo, familias de bajos ingresos y personas mayores.",
    whatYoullNeed:
      "Estilistas y barberas y barberos licenciados voluntarios, un espacio, materiales y sanitización.",
    setupHours: 10,
    defaultCategory: "skilled_labor",
    suggestsWorkDays: true,
    firstSteps:
      "Empieza con dos conversaciones: una con una estilista o " +
      "barbero con licencia dispuesto a traer a un colega, y otra " +
      "con las personas a las que quieres servir — un albergue, " +
      "un centro de día o un programa de empleo te dirán qué días " +
      "y qué ambiente les resultarían cómodos de verdad. Cuando " +
      "un profesional y un sitio anfitrión digan que sí, lo demás " +
      "es cuestión de materiales y agenda.",
    commonPitfalls:
      "Este proyecto tropieza cuando se siente como fila de " +
      "caridad y no como salón — cortes apurados, sin poder " +
      "elegir el estilo, cámaras afuera para las redes. Pregunta " +
      "a cada persona qué quiere, deja las fotos salvo que ella " +
      "las ofrezca, y nunca permitas que alguien sin licencia " +
      "corte por estirar la capacidad; un solo problema de " +
      "higiene puede acabar con todo el programa.",
    pairsWith: ["laundry-shower-access", "reentry-support"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Convoquen estilistas y barberas y barberos licenciados",
        description:
          "Busquen profesionales dispuestos a voluntariar sus habilidades. Las personas licenciadas garantizan un servicio seguro, de calidad y con la sanitización adecuada.",
        hours: 2.5,
        skills: ["difusión"],
      },
      {
        name: "Encuentren un espacio con condiciones de sanitización",
        description:
          "Aseguren un lugar con acceso a agua, buena iluminación y superficies lavables — un centro comunitario, una peluquería fuera de horario o un sitio de fe.",
        hours: 1.5,
        skills: ["difusión"],
      },
      {
        name: "Consigan equipo y materiales",
        description:
          "Reúnan máquinas, tijeras, capas, peines, espejos y desechables. Incluyan extras de arreglo personal como rasuradoras y artículos de aseo para llevar a casa.",
        hours: 2,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Armen sanitización y cumplimiento de licencias",
        description:
          "Establezcan la esterilización de herramientas entre clientes y cumplan las reglas locales para ofrecer cortes al público. La limpieza protege a todas las personas.",
        hours: 1.5,
        skills: ["trámites"],
        follows: [1],
      },
      {
        name: "Conduzcan los días de arreglo personal",
        description:
          "Hagan el evento, mantengan un ambiente cálido y respetuoso, y traten a cada persona como invitada valorada y no como receptora de caridad.",
        hours: 2.5,
        skills: ["organización"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "mutual-aid-moving-crew",
    name: "Cuadrilla de mudanzas de apoyo mutuo",
    purpose:
      "Ayudar a mudarse a quienes no pueden pagar una mudanza — personas saliendo de situaciones inseguras, enfrentando desalojo o reduciendo su espacio.",
    whoItServes:
      "Vecinas y vecinos de bajos ingresos, personas huyendo de hogares inseguros, personas mayores y vecinas y vecinos con discapacidad.",
    whatYoullNeed:
      "Personas voluntarias con vehículos y fuerza, materiales de mudanza y prácticas claras de seguridad. Para quien deja una situación insegura, mantengan la nueva dirección, las fechas y los detalles en estricta confidencialidad, y sigan las decisiones de esa persona sobre los tiempos y su seguridad.",
    setupHours: 14,
    defaultCategory: "transport",
    suggestsWorkDays: true,
    firstSteps:
      "Antes de conseguir un solo camión, habla con quienes ya " +
      "reciben estas llamadas — defensoras de sobrevivientes de " +
      "violencia doméstica, organizadores de inquilinos, " +
      "servicios para personas mayores — sobre cómo deberían " +
      "llegarte las solicitudes y qué confidencialidad van a " +
      "esperar, porque algunas mudanzas son de alguien saliendo " +
      "de un hogar inseguro. Luego junta a tres o cuatro personas " +
      "voluntarias con fuerza y un vehículo, y dimensionen juntas " +
      "la primera mudanza pequeña.",
    commonPitfalls:
      "Las cuadrillas se lastiman o se queman rápido: un trabajo " +
      "demasiado ambicioso con pocas manos, alguien levantando " +
      "mal, una dirección compartida en un chat grupal que nunca " +
      "debió salir del teléfono de quien coordina. Mantén las " +
      "mudanzas dentro de los límites que fijaron, y trata los " +
      "detalles de cada mudanza delicada como si pudieran poner a " +
      "alguien en peligro — porque pueden.",
    pairsWith: ["tenant-union", "free-store"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Convoquen una cuadrilla y vehículos",
        description:
          "Reúnan personas voluntarias capaces de levantar y cargar con seguridad, más acceso a camionetas o vans. Mantengan un listado con disponibilidad para armar una cuadrilla rápido.",
        hours: 2.5,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Reúnan materiales de mudanza",
        description:
          "Consigan carretillas, correas para muebles, cobertores de mudanza y cajas reutilizables por donación. Los materiales compartidos hacen las mudanzas más rápidas y seguras.",
        hours: 1.5,
        skills: ["conducir"],
      },
      {
        name: "Construyan un sistema de solicitud y evaluación",
        description:
          "Creen una forma de pedir ayuda y dimensionar cada mudanza: cuánto, escaleras o ascensor, distancia y tiempos. Esto les permite planear el tamaño de la cuadrilla y el equipo.",
        hours: 2,
        skills: ["organización"],
      },
      {
        name: "Resuelvan seguridad y responsabilidad",
        description:
          "Capaciten a las personas voluntarias en levantamiento seguro, usen renuncias simples y revisen el seguro de cualquier vehículo usado. Proteger a voluntarias y voluntarios y a las personas atendidas importa.",
        hours: 2,
        skills: ["trámites"],
        follows: [0],
      },
      {
        name: "Definan agenda y despacho",
        description:
          "Asignen solicitudes a cuadrillas disponibles y confirmen con todas las personas el día anterior. Mantengan una lista de respaldo, ya que las mudanzas no se pueden posponer fácilmente.",
        hours: 1.5,
        skills: ["organización"],
        follows: [0, 2],
      },
      {
        name: "Definan alcance y límites",
        description:
          "Decidan qué van a manejar y qué no (nada de materiales peligrosos, pianos o trabajos que superen la capacidad segura de la cuadrilla). Deriven esos casos a otro lado.",
        hours: 1,
        skills: ["redacción"],
      },
      {
        name: "Realicen mudanzas y den seguimiento",
        description:
          "Lleven adelante la mudanza con seguridad y respeto, luego confirmen que la persona esté instalada. Conéctenla con otros proyectos (tienda gratis, comité de bienvenida) según haga falta.",
        hours: 3.5,
        skills: ["conducir"],
        follows: [1, 3, 4],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "disability-support-network",
    name: "Red de apoyo a la discapacidad y la accesibilidad",
    purpose:
      "Organizar a vecinas y vecinos con discapacidad y aliadas y aliados para el apoyo mutuo, la accesibilidad y la incidencia — dirigida por las propias personas con discapacidad.",
    whoItServes:
      "Vecinas y vecinos con discapacidad y enfermedades crónicas.",
    whatYoullNeed:
      "Un sistema de comunicación accesible, liderazgos pares y un directorio de recursos. El apoyo entre pares complementa la atención profesional — deriven las preguntas médicas, de cuidado personal y legales a profesionales calificados, y traten la información de salud de las personas integrantes como privada.",
    setupHours: 24,
    defaultCategory: "organizing",
    firstSteps:
      "Esta red solo funciona si las vecinas y vecinos con " +
      "discapacidad están en la mesa desde la primerísima " +
      "conversación — no consultados después, sino decidiendo qué " +
      "es. Empieza pidiendo a dos o tres personas con " +
      "discapacidad que conozcas que la cofunden contigo (o, si " +
      "tú misma vives con discapacidad, que compartan la carga), " +
      "y deja que sus necesidades de acceso definan cómo se hace " +
      "la primera reunión: formato, lugar y ritmo incluidos.",
    commonPitfalls:
      "El fracaso clásico es que personas aliadas " +
      "bienintencionadas construyan un programa para la gente con " +
      "discapacidad que nadie pidió, en formatos que no pueden " +
      "usar. El más silencioso es irse convirtiendo en un " +
      "servicio informal de cuidados: el apoyo entre pares no " +
      "puede sustituir con seguridad la atención médica ni el " +
      "cuidado personal, así que sigue derivando esas necesidades " +
      "a profesionales calificados y cuida la información de " +
      "salud como lo privado que es.",
    pairsWith: ["neighborhood-care-network", "rides-transportation", "health-navigation"],
    learnMore: ["lurking-ok"],
    tasks: [
      {
        name: "Centren el liderazgo de personas con discapacidad",
        description:
          "Aseguren que las personas con discapacidad lideren y den forma a la red. \"Nada sobre nosotras y nosotros sin nosotras y nosotros\" es el principio central — las personas aliadas apoyan, no dirigen.",
        hours: 3,
        skills: ["facilitación"],
      },
      {
        name: "Armen un sistema de comunicación accesible",
        description:
          "Ofrezcan múltiples formas de participar (teléfono, mensaje, en línea, en persona), usen lenguaje claro y aseguren que los materiales funcionen con lectores de pantalla y necesidades diversas.",
        hours: 3,
        skills: ["accesibilidad", "soporte técnico"],
      },
      {
        name: "Mapeen necesidades y recursos",
        description:
          "Conozcan lo que las personas miembro necesitan y cataloguen recursos locales: transporte accesible, fuentes de equipo, servicios y ayuda con prestaciones. Identifiquen los vacíos más grandes.",
        hours: 5,
        skills: ["difusión", "captura de datos"],
      },
      {
        name: "Armen un intercambio de apoyo mutuo",
        description:
          "Creen una forma para que las personas miembro den y reciban ayuda — mandados, compañía para citas como apoyo de incidencia, llamadas de seguimiento — ajustada a la capacidad y la necesidad.",
        hours: 3,
        skills: ["organización"],
        follows: [2],
      },
      {
        name: "Creen un fondo de préstamo de equipos",
        description:
          "Reúnan y presten ayudas de movilidad y equipo de asistencia, sanitizado entre usos. Muchos dispositivos quedan sin uso después de quedarse cortos o ya no ser necesarios.",
        hours: 4,
        skills: ["difusión", "organización"],
      },
      {
        name: "Ofrezcan apoyo de incidencia y navegación",
        description:
          "Ayuden a las personas miembro a navegar prestaciones, adaptaciones y servicios. Compartan información y acompañamiento, y deriven preguntas legales y médicas a profesionales calificados.",
        hours: 3,
        recurringCadence: "month",
        skills: ["trámites"],
        follows: [2],
      },
      {
        name: "Fijen estándares de accesibilidad para todos los eventos del programa",
        description:
          "Desarrollen una lista de verificación (acceso al lugar, asientos, interpretación, necesidades sensoriales, materiales) para que cada proyecto del programa más amplio reciba bien a las personas con discapacidad.",
        hours: 3,
        skills: ["accesibilidad", "redacción"],
      },
    ],
  },
  {
    id: "books-to-prisoners",
    name: "Libros para personas encarceladas y programa de cartas",
    purpose:
      "Enviar libros y cartas gratis a personas encarceladas para reducir el aislamiento y apoyar el aprendizaje.",
    whoItServes:
      "Personas encarceladas y, a través de ellas, sus familias y comunidades.",
    whatYoullNeed:
      "Libros donados, personas voluntarias, franqueo y conocimiento de las reglas de correo de cada institución. Las reglas de correo de cada institución son estrictas y distintas — los paquetes que las incumplen son rechazados, así que síganlas al pie de la letra, y que las personas voluntarias usen siempre la dirección del programa, nunca la de su casa.",
    setupHours: 21,
    defaultCategory: "education",
    suggestsWorkDays: true,
    firstSteps:
      "Antes de recolectar un solo libro, llama a un grupo " +
      "establecido de libros para personas encarceladas — la " +
      "mayoría comparte con gusto qué instituciones cubren, qué " +
      "reglas hacen tropezar a la gente y dónde quedan " +
      "solicitudes sin respuesta. Luego consigue por escrito la " +
      "política de correo vigente de la una o dos instituciones " +
      "con las que van a empezar; lo que las personas " +
      "encarceladas realmente piden debería definir el acervo, no " +
      "lo que las donantes limpien de sus estantes.",
    commonPitfalls:
      "Este proyecto muere por paquetes rechazados: un libro " +
      "usado donde solo aceptan nuevos, una pasta dura, una regla " +
      "de etiquetado olvidada — franqueo desperdiciado y el " +
      "paquete tan esperado de alguien devuelto. También puede " +
      "lastimar a las personas voluntarias que escriben desde su " +
      "casa; toda carta sale con la dirección del programa, sin " +
      "excepciones, por más cálida que se vuelva la " +
      "correspondencia.",
    pairsWith: ["reentry-support", "free-little-library"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Aprendan las reglas de correo de cada institución",
        description:
          "Cada prisión tiene reglas estrictas y específicas — muchas exigen que los libros sean nuevos y vengan directo de una editorial o tienda aprobada, con límites de contenido y cantidad. Investiguen con cuidado, porque el correo que rompe reglas se rechaza.",
        hours: 5,
        skills: ["trámites"],
      },
      {
        name: "Reúnan libros y un espacio de trabajo",
        description:
          "Recolecten libros donados (dentro de las reglas de las instituciones) y armen un área de clasificación y empaque. Mantengan variedad: diccionarios, educación, ficción y recursos de reingreso suelen ser los más pedidos.",
        hours: 4,
        skills: ["difusión", "conducir"],
        follows: [0],
      },
      {
        name: "Armen un sistema para manejar solicitudes",
        description:
          "Creen un proceso para recibir y rastrear solicitudes de personas encarceladas, que escriben pidiendo temas o títulos. Hagan coincidir las solicitudes con los libros disponibles.",
        hours: 3,
        skills: ["captura de datos", "organización"],
      },
      {
        name: "Convoquen y capaciten a personas voluntarias",
        description:
          "Capaciten a las personas voluntarias para hacer coincidir solicitudes, empacar dentro de las reglas de cada institución y escribir notas cuidadas. La exactitud en las reglas evita franqueo desperdiciado y paquetes rechazados.",
        hours: 3,
        skills: ["difusión", "enseñanza"],
        follows: [0],
      },
      {
        name: "Cubran franqueo y logística",
        description:
          "El franqueo es el principal costo continuo. Recauden para él, usen el envío más barato que cumpla las reglas y organicen días regulares de envío.",
        hours: 3,
        recurringCadence: "month",
        skills: ["difusión"],
      },
      {
        name: "Organicen un programa de correspondencia",
        description:
          "Empareje a personas voluntarias como pen-pals donde se quiera, con pautas claras de seguridad y privacidad (usen la dirección del programa, no las personales). La conexión importa tanto como los libros.",
        hours: 3,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "community-music",
    name: "Programa comunitario de música e instrumentos",
    purpose:
      "Prestar instrumentos y ofrecer clases y jam sessions gratis para que la música sea accesible a todas las personas.",
    whoItServes:
      "Niñas, niños y personas adultas que no pueden pagar instrumentos o clases.",
    whatYoullNeed:
      "Instrumentos donados, docentes voluntarias y voluntarios, un espacio y un sistema de préstamo.",
    setupHours: 15,
    defaultCategory: "education",
    firstSteps:
      "Empieza con las músicas y músicos que ya tienes cerca — la " +
      "guitarrista de la iglesia de la esquina, el director de " +
      "banda jubilado, las y los adolescentes que tocan — y " +
      "pregúntales qué les gustaría enseñar y cuándo. Una " +
      "conversación con una tienda de música sobre reparaciones " +
      "con descuento, y otra con un espacio que tolere el ruido, " +
      "y ya recorriste la mayor parte del camino hacia la primera " +
      "jam.",
    commonPitfalls:
      "El fondo de préstamo se vacía en silencio cuando los " +
      "instrumentos salen más rápido de lo que vuelven en " +
      "condiciones de tocarse, así que presupuesta tiempo de " +
      "reparación desde el inicio y mantén una política de " +
      "devolución flexible pero real. Y cuida que las clases no " +
      "se inclinen hacia quienes ya tocan con confianza: la niña " +
      "que nunca ha tocado un instrumento necesita la bienvenida " +
      "más cálida, no el espacio más corto.",
    pairsWith: ["library-of-things", "skill-share", "youth-mentorship"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Recolecten y reparen instrumentos",
        description:
          "Reúnan instrumentos donados y hagan que se limpien, encuerden o reparen para que se puedan tocar. Armen una mezcla de tipos y niveles de habilidad.",
        hours: 5,
        skills: ["reparación", "conducir"],
      },
      {
        name: "Armen un sistema de préstamo de instrumentos",
        description:
          "Creen un sistema de salida que rastree quién tiene qué, con instrucciones de cuidado y una política de devolución flexible. Numeren y registren cada instrumento.",
        hours: 2,
        skills: ["captura de datos"],
        follows: [0],
      },
      {
        name: "Convoquen docentes voluntarias y voluntarios",
        description:
          "Busquen músicas y músicos dispuestas a enseñar con paciencia a principiantes. No necesitan ser profesionales — entusiasmo y habilidad básica alcanzan mucho.",
        hours: 3,
        skills: ["difusión", "música"],
      },
      {
        name: "Encuentren un espacio para clases y jams",
        description:
          "Aseguren una sala donde el ruido no sea problema — un centro comunitario, escuela o salón de fe. Fijen horarios predecibles para clases y tocadas abiertas.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Agenden clases y jam sessions",
        description:
          "Ofrezcan clases para principiantes y jams abiertas para todos los niveles. Mantengan la inscripción sencilla y horarios variados para quienes trabajan o estudian.",
        hours: 2,
        recurringCadence: "session",
        skills: ["organización"],
        follows: [2, 3],
      },
      {
        name: "Fijen expectativas de cuidado y devolución",
        description:
          "Enseñen a quienes piden prestado el cuidado básico del instrumento y qué hacer si algo se rompe. Mantengan algo basado en la confianza y de apoyo, no punitivo.",
        hours: 1,
        skills: ["redacción"],
        follows: [1],
      },
    ],
  },
  {
    id: "school-supply-program",
    name: "Programa de útiles escolares y mochilas",
    purpose:
      "Brindar útiles escolares y mochilas gratis para que las niñas y los niños empiecen el año listos y con confianza.",
    whoItServes: "Familias de bajos ingresos con niñas y niños en edad escolar.",
    whatYoullNeed:
      "Donaciones de útiles o fondos, almacenamiento, un punto de distribución y personas voluntarias.",
    setupHours: 10,
    defaultCategory: "mutual_aid_drive",
    suggestsWorkDays: true,
    firstSteps:
      "Tu primera conversación es con una escuela — una " +
      "consejera, un enlace con familias o una coordinadora de " +
      "madres y padres que conozca las listas reales de útiles y " +
      "qué familias se quedan sin ellos en silencio. Deja que " +
      "definan qué recolectas y cómo se enteran las familias; una " +
      "entrega que pasa por gente en la que las madres y los " +
      "padres ya confían llega a niñas y niños a los que un " +
      "volante nunca llegará.",
    commonPitfalls:
      "El fracaso predecible es una montaña de fólders donados y " +
      "ni uno de los cuadernos que las listas sí piden — juntar " +
      "lo fácil de dar en vez de lo que hace falta. El que duele " +
      "es una entrega que se siente como examen de pobreza; " +
      "sáltate el papeleo de ingresos, deja que cada niña y niño " +
      "elija su mochila, y nadie se va sintiéndose inspeccionado.",
    pairsWith: ["youth-mentorship", "toy-library"],
    tasks: [
      {
        name: "Consigan las listas de útiles y midan la necesidad",
        description:
          "Aliense con escuelas locales para conocer las listas reales de útiles por grado y estimen cuántas familias necesitan ayuda. Esto mantiene las donaciones relevantes.",
        hours: 1.5,
        skills: ["difusión"],
      },
      {
        name: "Hagan colectas y compras al por mayor",
        description:
          "Combinen colectas de donación con compras al por mayor de los artículos más necesarios. La compra al por mayor estira el dinero al máximo en básicos como cuadernos y lápices.",
        hours: 3,
        recurringCadence: "cycle",
        skills: ["difusión", "conducir"],
        follows: [0],
      },
      {
        name: "Clasifiquen y armen por grado",
        description:
          "Organicen los útiles y armen mochilas según la lista de cada grado. Una sesión de empaque tipo línea de armado con personas voluntarias avanza rápido.",
        hours: 2,
        skills: ["organización"],
        follows: [1],
      },
      {
        name: "Armen almacenamiento y un punto de distribución",
        description:
          "Aseguren un almacenamiento seco y un lugar acogedor para entregar las mochilas, a menudo en una escuela, centro comunitario o junto a otro evento de regreso a clases.",
        hours: 1.5,
        skills: ["difusión"],
      },
      {
        name: "Agenden y cubran la distribución",
        description:
          "Hagan la entrega antes del inicio de clases, con personas voluntarias amables. Dejen que las niñas y los niños elijan mochila cuando se pueda — elegir agrega dignidad.",
        hours: 2,
        skills: ["organización"],
        follows: [2, 3],
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "legal-aid-clinic",
    name: "Clínica de ayuda legal y programa Conoce tus derechos",
    purpose:
      "Conectar a vecinas y vecinos con ayuda legal gratuita y enseñarles sus derechos.",
    whoItServes:
      "Cualquier persona que enfrente problemas legales sin medios — temas de vivienda, migración, deudas, familia o prestaciones.",
    whatYoullNeed:
      "Abogadas y abogados y estudiantes de derecho voluntarias y voluntarios, un espacio, organizaciones aliadas de ayuda legal y agendamiento. El consejo legal individual debe venir de abogadas y abogados calificados y con licencia (o de estudiantes de derecho supervisadas y supervisados) — este programa organiza el acceso y comparte información general sobre derechos, no es en sí mismo una fuente de consejo legal.",
    setupHours: 26,
    defaultCategory: "other",
    suggestsWorkDays: true,
    firstSteps:
      "Aquí nada arranca antes de tener abogadas y abogados: tus " +
      "primeras llamadas son a la oficina local de ayuda legal, " +
      "al programa pro bono del colegio de abogados y a una " +
      "clínica de facultad de derecho, preguntando qué " +
      "necesitarían para presentarse — y qué vacíos podría llenar " +
      "de verdad una clínica de barrio. Deja que esas alianzas " +
      "definan contigo el alcance de la clínica antes de anunciar " +
      "nada al vecindario.",
    commonPitfalls:
      "El fracaso peligroso es que una persona voluntaria con " +
      "buenas intenciones pase de la información al consejo — un " +
      "\"tú fírmalo y ya\" bienintencionado puede arruinar el " +
      "caso de alguien, así que mantén esa línea clara y " +
      "ensayada. El más lento es una admisión que rebasa a las " +
      "abogadas y abogados: una lista de espera de gente " +
      "desesperada sin abogado en la sala rompe la confianza más " +
      "rápido que nunca haber abierto.",
    pairsWith: ["tenant-union", "court-support", "newcomer-translation-network"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Aliense con abogadas y abogados y ayuda legal",
        description:
          "Convoquen abogadas y abogados con licencia, o estudiantes de derecho supervisadas y supervisados por abogadas y abogados, para que den el consejo legal real. Construyan vínculos de derivación con organizaciones de ayuda legal establecidas.",
        hours: 6,
        skills: ["difusión"],
      },
      {
        name: "Definan alcance y rutas de derivación",
        description:
          "Decidan qué temas puede atender la clínica y fijen rutas claras para derivar casos complejos o especializados. Sean transparentes sobre lo que la clínica puede y no puede hacer.",
        hours: 3,
        skills: ["redacción"],
        follows: [0],
      },
      {
        name: "Armen un espacio y una admisión",
        description:
          "Aseguren un lugar privado y confidencial y creen una admisión con una lista de documentos para que las abogadas y los abogados aprovechen bien el tiempo limitado.",
        hours: 3,
        skills: ["organización"],
      },
      {
        name: "Armen un sistema confidencial de citas",
        description:
          "Creen citas que protejan la privacidad. Los asuntos legales son delicados, así que cuiden con esmero la información de las personas durante todo el proceso.",
        hours: 3,
        skills: ["organización", "captura de datos"],
      },
      {
        name: "Desarrollen materiales y talleres de Conoce tus derechos",
        description:
          "Creen guías claras y precisas y dicten talleres sobre derechos comunes (inquilinas e inquilinos, trabajadoras y trabajadores, migración, encuentros con autoridades). Enmárquenlos como información general, no como consejo legal individual.",
        hours: 5,
        recurringCadence: "event",
        skills: ["redacción", "enseñanza"],
      },
      {
        name: "Promuevan y agenden clínicas",
        description:
          "Fijen fechas recurrentes de clínica y difundan a través de organizaciones aliadas y del programa más amplio de apoyo mutuo. Ofrezcan interpretación para personas que no hablan inglés.",
        hours: 3,
        skills: ["difusión", "traducción"],
        follows: [0, 3],
      },
      {
        name: "Protejan la confidencialidad y revisen conflictos",
        description:
          "Establezcan confidencialidad estricta y una revisión básica de conflictos de interés para que ninguna persona voluntaria aconseje a partes opuestas. Capaciten a todas las personas en estas obligaciones.",
        hours: 3,
        skills: ["trámites"],
      },
    ],
  },
  {
    id: "resource-hub-dispatch",
    name: "Centro de recursos de apoyo mutuo y despacho",
    purpose:
      "Funcionar como columna vertebral de coordinación — un punto único donde se hacen coincidir necesidades y ofrecimientos entre todos los proyectos del programa.",
    whoItServes:
      "Todas las personas del programa — quienes buscan ayuda, quienes la ofrecen y quienes lideran proyectos y necesitan coordinación.",
    whatYoullNeed:
      "Un sistema de admisión, un listado de personas voluntarias y recursos, personas coordinadoras y un directorio maestro. El centro guarda información sensible sobre la vida de vecinas y vecinos — recojan solo lo necesario, cuídenla bien y compartan los detalles únicamente con quienes los necesitan para ayudar.",
    setupHours: 27,
    defaultCategory: "organizing",
    firstSteps:
      "El centro coordina proyectos, así que empieza sentándote " +
      "con quien lidera cada uno: qué solicitudes reciben, qué " +
      "quisieran poder derivar y cómo quieren recibir los " +
      "emparejamientos. Acuerden juntas una sola admisión y una " +
      "base común de privacidad — un centro impuesto a los " +
      "proyectos termina siendo rodeado; uno construido con ellos " +
      "se vuelve la puerta de entrada.",
    commonPitfalls:
      "Los centros mueren de dos formas: la admisión se llena de " +
      "solicitudes que nadie sigue hasta el final, y se corre la " +
      "voz de que llamar no sirve de nada; o una coordinadora " +
      "heroica sostiene todos los hilos hasta quemarse y el " +
      "programa entero pierde la memoria. Da seguimiento a cada " +
      "solicitud hasta un cierre real, rota los turnos desde " +
      "temprano y recoge menos información de la que crees " +
      "necesitar.",
    pairsWith: ["emergency-preparedness", "rides-transportation", "solidarity-fund"],
    learnMore: ["post-something", "claim-post"],
    tasks: [
      {
        name: "Armen una única admisión para necesidades y ofrecimientos",
        description:
          "Creen una puerta de entrada fácil — una línea telefónica, un formulario y una opción en persona — donde cualquiera pueda decir qué necesita o qué puede dar. Un solo punto de entrada evita que la gente se quede afuera.",
        hours: 4,
        skills: ["organización", "soporte técnico"],
      },
      {
        name: "Armen un listado de personas voluntarias y recursos",
        description:
          "Mantengan una lista actualizada de personas voluntarias (habilidades, disponibilidad, ubicación) y lo que cada proyecto puede ofrecer, para que las solicitudes se asignen rápido.",
        hours: 4,
        skills: ["captura de datos"],
      },
      {
        name: "Creen un proceso de emparejamiento y despacho",
        description:
          "Definan cómo una solicitud se enruta al proyecto o a la persona voluntaria adecuada y con qué rapidez. Fijen metas de tiempo de respuesta y cómo se rastrean las solicitudes hasta completarse.",
        hours: 4,
        skills: ["organización"],
        follows: [0, 1],
      },
      {
        name: "Mantengan un directorio maestro de recursos",
        description:
          "Lleven un directorio vivo de todos los proyectos más servicios externos (refugios, clínicas, comida, ayuda legal) para que el centro pueda enrutar a la gente donde sea que exista la ayuda.",
        hours: 5,
        recurringCadence: "month",
        skills: ["captura de datos"],
      },
      {
        name: "Convoquen y capaciten personas coordinadoras",
        description:
          "Armen un equipo para cubrir turnos rotativos de despacho para que el centro siga respondiendo sin desgastar a nadie. Capacítenlas en el proceso y el directorio.",
        hours: 3,
        skills: ["difusión", "enseñanza"],
        follows: [2, 3],
      },
      {
        name: "Fijen prácticas de privacidad de datos y seguimiento",
        description:
          "Decidan qué información recogen, cómo se almacena y protege, y cómo confirman que una necesidad fue realmente atendida. Recojan lo mínimo y cuídenlo con esmero.",
        hours: 4,
        skills: ["redacción"],
      },
      {
        name: "Registren necesidades no atendidas y brechas",
        description:
          "Anoten las solicitudes que no pudieron cubrir. Las brechas recurrentes revelan dónde el programa debería arrancar su próximo proyecto — convirtiendo al centro en una herramienta de planeación, no solo una central de despacho.",
        hours: 3,
        recurringCadence: "month",
        skills: ["captura de datos"],
      },
    ],
  },
  {
    id: "harm-reduction-supplies",
    name: "Distribución de insumos de reducción de daños",
    purpose:
      "Poner naloxona, tiras reactivas e insumos de uso más seguro en manos de quienes puedan necesitarlos — encontrando a las vecinas y vecinos donde están, sin juicios.",
    whoItServes:
      "Personas que usan drogas, sus amistades y familias, y cualquiera que pueda presenciar una sobredosis — que, en la mayoría de los barrios, es cualquiera.",
    whatYoullNeed:
      "Capacitación en respuesta a sobredosis, una fuente de naloxona (programa estatal, farmacia u organización aliada), insumos para los kits y un pequeño equipo de distribución. Repartir insumos no es atención médica — toda persona que distribuya debe completar primero una capacitación en respuesta a sobredosis, y la ley sobre lo que puedes portar (tiras reactivas, jeringas) varía mucho según el lugar, así que confirma la tuya antes de abastecer nada. Incluye líneas locales de crisis y de tratamiento impresas en cada kit.",
    setupHours: 20,
    defaultCategory: "other",
    suggestsWorkDays: true,
    firstSteps:
      "Todavía no compres nada: tu primer paso es una " +
      "conversación con el programa de reducción de daños " +
      "establecido más cercano y con las personas que realmente " +
      "usan estos insumos — te dirán qué hace falta, qué ya está " +
      "cubierto y cómo llegar sin juicios. Haz que tu equipo base " +
      "complete la capacitación en respuesta a sobredosis y " +
      "confirma la ley local sobre tiras y jeringas antes de " +
      "empacar un solo kit.",
    commonPitfalls:
      "Esto sale mal cuando llegan como extraños — repartiendo " +
      "donde no tienen relaciones, o sumando sermones y " +
      "condiciones que enseñan a la gente a evitarlos — y cuando " +
      "se adelantan a la ley o a su capacitación, lo que puede " +
      "costarle a una persona voluntaria un cargo por " +
      "parafernalia. Aquí, ir despacio y acompañados le gana " +
      "siempre a ir rápido y solos.",
    pairsWith: ["community-first-aid-training", "mental-health-peer-support"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Capacítense y encuentren una organización aliada de reducción de daños",
        description:
          "Pidan a su equipo base que complete una capacitación en respuesta a sobredosis y uso de naloxona — muchos departamentos de salud y organizaciones de reducción de daños las ofrecen gratis. Alíense con un programa establecido; ya resolvieron problemas de suministro, legales y de confianza que ustedes no necesitan volver a resolver.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Revisa la ley local sobre insumos",
        description:
          "El acceso a la naloxona está protegido casi en todas partes, pero las tiras reactivas y las jeringas todavía se clasifican como parafernalia en algunos lugares. Averigua exactamente qué puedes portar y entregar legalmente — tu organización aliada o una clínica de ayuda legal te lo dirá rápido. Déjalo por escrito para las personas voluntarias.",
        hours: 3,
        skills: ["investigación"],
      },
      {
        name: "Consigue naloxona e insumos para los kits",
        description:
          "Pide naloxona a través de un programa estatal de distribución, una orden permanente de farmacia o tu organización aliada. Añade lo demás que sea legal donde estás: tiras reactivas de fentanilo y xilacina, material para cuidado de heridas, artículos de higiene.",
        hours: 4,
        follows: [1],
      },
      {
        name: "Armen kits con instrucciones en lenguaje sencillo",
        description:
          "Empaquen los kits con instrucciones simples y multilingües: cómo reconocer una sobredosis, cómo administrar naloxona, llamar a los servicios de emergencia, nunca usar en soledad. Incluyan líneas locales de crisis y de tratamiento en cada kit. El armado avanza rápido con una mesa llena de gente.",
        hours: 3,
        skills: ["traducción"],
        follows: [2],
        recurringCadence: "cycle",
      },
      {
        name: "Establece rondas de distribución y puntos fijos",
        description:
          "Planea rondas regulares a pie o en auto por los lugares donde la gente realmente está, y pide a bares, tienditas, bibliotecas y locales que mantengan una caja sin preguntas. La barrera baja es todo el punto — sin formularios, sin sermones.",
        hours: 4,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Reabastece, lleva registro y mantén fresca la capacitación",
        description:
          "Anota qué se acaba y qué se queda, registra las fechas de caducidad de la naloxona y organiza capacitaciones de repaso cuando se sumen nuevas personas voluntarias. Si un kit revierte una sobredosis, vale la pena registrarlo (con delicadeza).",
        hours: 2,
        recurringCadence: "month",
      },
    ],
  },
  {
    id: "court-support",
    name: "Apoyo y acompañamiento en cortes",
    purpose:
      "Asegurar que nadie del barrio enfrente una fecha en corte en soledad — compañía en la sala, un aventón para llegar, cuidado infantil durante la audiencia y cartas de apoyo cuando la defensa las pida.",
    whoItServes:
      "Vecinas y vecinos con audiencias penales, migratorias, de desalojo o de familia, y sus familias — llegar a la corte sin compañía puede costar empleos, cuidado infantil y esperanza.",
    whatYoullNeed:
      "Personas voluntarias confiables, un calendario de audiencias y vínculos con las defensorías públicas. El apoyo en cortes es presencia y logística, no asesoría legal — las personas voluntarias nunca opinan sobre el caso y siempre siguen la pauta del abogado o abogada de la propia persona. Las salas de audiencia tienen reglas de conducta estrictas, así que quien asista debe conocerlas al dedillo.",
    setupHours: 16,
    defaultCategory: "other",
    firstSteps:
      "Empieza con las personas dueñas de esas fechas: el apoyo " +
      "solo ocurre por invitación de quien enfrenta la corte, y " +
      "en sintonía con su abogada o abogado. Preséntense primero " +
      "ante la defensoría pública y los grupos de observación de " +
      "cortes o fondos de fianza que ya estén en el juzgado, y " +
      "deja que ellos te digan qué audiencias necesitan compañía " +
      "y cómo ser útiles sin tocar jamás el lado legal.",
    commonPitfalls:
      "El daño aquí viene de actuar por cuenta propia: una " +
      "voluntaria \"explicando\" un acuerdo en el pasillo, " +
      "detalles del caso comentados donde un fiscal puede oír, " +
      "una reacción visible desde la galería que irrite al juez — " +
      "cualquiera puede perjudicar justo a la persona por la que " +
      "vinieron. El fracaso más silencioso es la logística: una " +
      "fecha sin confirmar o un aventón que falla puede " +
      "significar una audiencia perdida y una orden de arresto.",
    pairsWith: ["legal-aid-clinic", "reentry-support", "rides-transportation"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Conecten con defensorías y grupos de corte existentes",
        description:
          "Preséntense ante la defensoría pública, la ayuda legal migratoria y cualquier grupo de observación de cortes o fondo de fianzas que ya esté trabajando. Ellos les dirán dónde hace más falta el apoyo y cómo sumarse sin estorbar.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Escribe las reglas base: apoyo, no derecho",
        description:
          "Ponlo por escrito: las personas voluntarias nunca dan asesoría legal, nunca comentan detalles del caso en las áreas públicas del juzgado y siempre se remiten al abogado o abogada de la propia persona. Añade la conducta en sala — llegar temprano, vestir sencillo, teléfonos apagados, sin reacciones desde la galería.",
        hours: 2,
        skills: ["redacción"],
      },
      {
        name: "Arma una recepción de solicitudes y un calendario de audiencias",
        description:
          "Crea una forma sencilla de pedir apoyo y un calendario compartido con fechas, salas y lo que cada persona necesita — compañía, un aventón, cuidado infantil, o las tres cosas. Las fechas de corte cambian todo el tiempo, así que confirma el día anterior.",
        hours: 3,
        skills: ["organización"],
      },
      {
        name: "Capacita a las personas voluntarias de acompañamiento",
        description:
          "Recorre con ellas una visita al juzgado: el control de seguridad, encontrar la sala, dónde sentarse y cómo simplemente ser compañía serena y cálida durante una espera estresante. Empareja a cada persona nueva con alguien con experiencia para su primera fecha.",
        hours: 3,
        skills: ["enseñanza"],
        follows: [1],
      },
      {
        name: "Coordina aventones y cuidado infantil para las audiencias",
        description:
          "Consigue conductores para las mañanas de corte y parejas de cuidado que atiendan a niñas y niños durante las audiencias — muchas salas no permiten menores, y una audiencia perdida por falta de cuidado infantil puede significar una orden de arresto.",
        hours: 3,
        skills: ["conducir", "cuidado infantil"],
        recurringCadence: "event",
      },
      {
        name: "Organiza cartas de apoyo cuando la defensa las pida",
        description:
          "Cuando el abogado o abogada de alguien solicite cartas de carácter o de apoyo comunitario, coordina a vecinas y vecinos para escribirlas — siguiendo al pie de la letra la pauta de la defensa sobre contenido, tono y plazo.",
        hours: 2,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "cooling-warming-center",
    name: "Centro emergente de enfriamiento y abrigo",
    purpose:
      "Abrir un refugio climático del barrio — una sala fresca en una ola de calor, una cálida en una helada — listo antes de que el clima se vuelva peligroso, no después.",
    whoItServes:
      "Personas mayores, vecinas y vecinos sin techo, gente sin aire acondicionado o calefacción que funcione, quienes trabajan a la intemperie y cualquiera cuya vivienda no aguante el clima.",
    whatYoullNeed:
      "Un sitio anfitrión con climatización y baños, insumos y personas anfitrionas capacitadas por turnos. Las anfitrionas y anfitriones son vecinos, no personal médico — capaciten a todo el mundo para reconocer el agotamiento por calor y la hipotermia y para llamar a los servicios de emergencia temprano y no tarde, y resuelvan la cuestión del seguro y la responsabilidad civil del sitio antes de la primera activación, no durante.",
    setupHours: 21,
    defaultCategory: "other",
    suggestsWorkDays: true,
    firstSteps:
      "El sitio anfitrión es la relación de la que todo depende, " +
      "así que empieza ahí: siéntate con la bibliotecaria, el " +
      "pastor o quien administra el salón y resuelvan juntas las " +
      "preguntas incómodas — horarios, llaves, seguro, qué pasa " +
      "si alguien necesita quedarse de noche — antes de que el " +
      "primer pronóstico las fuerce. Al mismo tiempo, pregunta a " +
      "los equipos de trabajo en calle y al personal de edificios " +
      "de personas mayores quién necesita de verdad el refugio, " +
      "para que la ubicación y los horarios le queden a la gente " +
      "para la que es.",
    commonPitfalls:
      "Este proyecto fracasa en la brecha entre el plan y el " +
      "clima: un umbral que nadie terminó de acordar, y el centro " +
      "abre un día tarde, o una pregunta de responsabilidad civil " +
      "que quedó vaga hasta que alguien se desmaya y el sitio " +
      "anfitrión se retira para siempre. Dejen el umbral de " +
      "activación por escrito, hagan una apertura de práctica " +
      "antes de la temporada y asegúrate de que cada anfitrión " +
      "sepa llamar temprano a los servicios de emergencia, no al " +
      "final.",
    pairsWith: ["emergency-preparedness", "community-wood-bank", "laundry-shower-access"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Encuentra un sitio anfitrión con climatización",
        description:
          "Pregunta en bibliotecas, sitios de fe, salones sindicales y centros comunitarios por una sala con aire acondicionado y calefacción confiables, baños y acceso sin escalones. Consigue un acuerdo por escrito que cubra horarios, quién tiene las llaves y qué pasa si se necesita de noche.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Definan los umbrales de activación y un plan de aviso",
        description:
          "Decidan por adelantado qué abre exactamente el centro — una temperatura pronosticada, un índice de calor, una sensación térmica — para que nadie tenga que tomar la decisión a medianoche. Armen una cadena telefónica o un chat grupal que ponga a las personas anfitrionas en alerta con un día de anticipación.",
        hours: 2,
      },
      {
        name: "Abastece los insumos",
        description:
          "Reúne agua, sobres de electrolitos, cobijas, catres plegables o sillas cómodas, ventiladores, cargadores de teléfono y un botiquín de primeros auxilios. Guárdalo todo en el sitio, en cajas etiquetadas, para que cualquier anfitrión encuentre las cosas.",
        hours: 3,
        skills: ["conducir"],
        follows: [0],
      },
      {
        name: "Convoca y capacita a anfitrionas y anfitriones de turno",
        description:
          "Consigue suficientes personas voluntarias para tener dos por turno y capacítalas: recibir a la gente sin papeleo, reconocer el agotamiento por calor y la hipotermia, cuándo llamar a los servicios de emergencia y nociones básicas de desescalada. La calidez en el sentido humano importa tanto como el termostato.",
        hours: 4,
        skills: ["enseñanza"],
      },
      {
        name: "Arma la rotación de turnos",
        description:
          "Prepara un calendario de turnos que puedas activar con un día de aviso — quién abre, quién cierra y cobertura nocturna si la ofrecen. Mantén una lista de reserva, porque las olas de calor también tumban a las personas voluntarias.",
        hours: 2,
        skills: ["organización"],
        follows: [3],
        recurringCadence: "event",
      },
      {
        name: "Corre la voz antes de la temporada",
        description:
          "Haz volantes multilingües con los umbrales y la ubicación, y llévalos a clínicas, edificios de personas mayores, equipos de trabajo en calle y tienditas antes de la primera ola de calor o helada — no durante.",
        hours: 3,
        skills: ["diseño gráfico", "traducción"],
      },
      {
        name: "Abre, acompaña y reinicia en cada activación",
        description:
          "Mantén el centro abierto mientras dure el evento climático: registra a la gente sin rigidez (un conteo, no identificaciones), mantén los insumos circulando y revisa cómo está quien duerma. Después, limpia, reabastece y anota qué se acabó.",
        hours: 3,
        recurringCadence: "event",
      },
    ],
  },
  {
    id: "community-oral-history",
    name: "Historia oral comunitaria",
    purpose:
      "Grabar las historias de las personas mayores y del vecindario antes de que se pierdan — y dejar a quienes las cuentan al mando de lo que pase con ellas.",
    whoItServes:
      "Personas mayores con historias que nadie ha pedido escuchar, residentes de toda la vida que ven cambiar el barrio y cada vecina y vecino que venga después.",
    whatYoullNeed:
      "Un teléfono o una grabadora sencilla, un lugar tranquilo, formularios de consentimiento y un sitio seguro para guardar los archivos. Las grabaciones son datos personales — cada participante es dueña o dueño de su historia, decide dónde se comparte y puede cambiar de opinión más adelante. Nada se hace público sin su visto bueno por escrito.",
    setupHours: 10,
    defaultCategory: "education",
    firstSteps:
      "Empieza con una persona mayor que confíe en ti y " +
      "pregúntale si compartiría una historia — esa primera " +
      "grabación te enseña más que cualquier plan, y su palabra " +
      "te abre la puerta con la siguiente narradora. Antes de " +
      "apretar grabar con cualquiera, repasen juntos el " +
      "formulario de consentimiento y pregúntale qué quisiera que " +
      "pase con la grabación; esa conversación es el proyecto.",
    commonPitfalls:
      "La forma en que esto lastima a alguien es una historia que " +
      "viaja más lejos de lo que su narradora acordó — un clip " +
      "publicado, un nombre añadido, un detalle que era solo para " +
      "ti. La forma en que muere en silencio es con grabaciones " +
      "acumulándose sin etiquetar en el teléfono de una sola " +
      "persona hasta que un aparato perdido borra años de voces; " +
      "etiqueta y respalda cada sesión la misma semana.",
    pairsWith: ["neighborhood-care-network", "digital-literacy"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Escribe un formulario de consentimiento en lenguaje sencillo",
        description:
          "Una página, sin jerga legal: qué se está grabando, dónde podría compartirse y el derecho de quien participa a pausar, saltarse preguntas o retirar la grabación después. Tradúcelo a los idiomas que de verdad hablan tus narradoras y narradores.",
        hours: 2,
        skills: ["redacción", "traducción"],
      },
      {
        name: "Reúne el equipo y una lista de preguntas",
        description:
          "Un teléfono con una app de notas de voz basta; suma un micrófono de solapa barato si puedes. Redacta preguntas abiertas que inviten historias — \"cuéntame cómo era la calle cuando llegaste\" — y practiquen una vez entre ustedes.",
        hours: 2,
      },
      {
        name: "Graba las sesiones de historias",
        description:
          "Siéntate con una persona narradora a la vez en un lugar tranquilo y cómodo. Repasen juntos el formulario de consentimiento primero, y luego sobre todo escucha — las mejores entrevistas son aquellas en las que menos hablas.",
        hours: 4,
        skills: ["escucha"],
        follows: [0, 1],
        recurringCadence: "session",
      },
      {
        name: "Archiva y devuelve, en sus términos",
        description:
          "Etiqueta cada grabación con la fecha, los nombres y lo acordado sobre compartirla. Guarda dos copias en un lugar seguro, entrega a cada narradora o narrador su propia copia y comparte públicamente solo los fragmentos que cada persona aprobó.",
        hours: 2,
        follows: [2],
      },
    ],
  },
  {
    id: "community-solar-coop",
    name: "Cooperativa comunitaria de energía solar",
    purpose:
      "Juntar los recursos del vecindario en energía renovable compartida que baje las facturas de todos — sobre todo para inquilinos y hogares que nunca podrían poner paneles en un techo propio.",
    whoItServes:
      "Personas que rentan, hogares de bajos ingresos y cualquiera a quien su techo, su casero o su presupuesto le cierra la puerta a los paneles solares propios.",
    whatYoullNeed:
      "Miembros comprometidos, conocimientos técnicos y financieros que puedas pedir prestados o aprender, un sitio anfitrión o un programa de energía solar comunitaria existente al que sumarse, y organizaciones aliadas. Algo dicho sin rodeos: las cooperativas de energía implican una complejidad financiera y legal real — busquen asesoría de profesionales calificados sobre estructura, financiamiento y contratos antes de que alguien firme nada.",
    setupHours: 27,
    defaultCategory: "infrastructure",
    firstSteps:
      "Antes de cualquier panel o papeleo, hablen con dos " +
      "grupos: los vecinos que de verdad se unirían, para medir " +
      "el compromiso real, y una cooperativa solar de un pueblo " +
      "o estado vecino que ya lo haya hecho — ellos te dirán qué " +
      "modelo encaja con las reglas de tu zona y qué errores les " +
      "costaron dinero. Luego lean ustedes mismos esas reglas " +
      "locales, porque son ellas, y no su entusiasmo, las que " +
      "deciden qué es posible.",
    commonPitfalls:
      "Las cooperativas solares mueren en la brecha entre el " +
      "entusiasmo y las firmas: un año de reuniones sobre un " +
      "modelo que las reglas de tu estado nunca permitieron, o " +
      "un contrato firmado sin revisión profesional que amarra a " +
      "los miembros a términos que nadie entendió. El otro " +
      "asesino es el dinero borroso — si los miembros no pueden " +
      "ver con claridad qué pusieron y qué les vuelve, la " +
      "confianza se erosiona y la cooperativa se deshace.",
    pairsWith: ["weatherization-brigade", "bulk-buying-coop"],
    tasks: [
      {
        name: "Reúne miembros y mide el interés",
        description:
          "Convoca hogares interesados en energía limpia más barata y averigua qué tan comprometidos están de verdad — el entusiasmo vago y un miembro inscrito son cosas distintas. Tus números definen qué modelos son realistas, así que cuenta con honestidad antes de planear.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Aprende los modelos y las reglas locales",
        description:
          "Investiga cómo funciona la energía solar comunitaria donde vives: leyes estatales, medición neta, programas de suscripción, estructuras cooperativas. Las reglas varían enormemente de un lugar a otro y determinan qué es posible en realidad — haz esto antes de enamorarte de un modelo.",
        hours: 5,
        skills: ["investigación"],
      },
      {
        name: "Encuentra un sitio o un programa al que sumarse",
        description:
          "Busca un techo anfitrión o un terreno para un arreglo compartido, o averigua si un programa de energía solar comunitaria existente aceptaría a tu grupo como suscriptores colectivos — sumarse a uno suele ser mucho más rápido que construir. Sopesa ambos caminos con tus miembros antes de comprometerte.",
        hours: 4,
        skills: ["difusión"],
      },
      {
        name: "Resuelve el financiamiento y la estructura legal",
        description:
          "Decidan cómo se financia y se gobierna el proyecto, y constituyan la cooperativa como corresponde. Este es el paso con implicaciones legales y financieras reales — traigan profesionales calificados que revisen la estructura y cada contrato, y no firmen hasta que lo hayan hecho.",
        hours: 5,
        skills: ["trámites", "contabilidad"],
        follows: [1],
      },
      {
        name: "Asóciate con instaladores y proveedores",
        description:
          "Consigue instaladores o proveedores de buena reputación, compara más de una cotización y confirma por escrito las garantías y el mantenimiento a largo plazo. Una instalación barata sin plan de mantenimiento resulta carísima a los cinco años.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Monta el sistema de membresías y créditos en la factura",
        description:
          "Definan exactamente cómo llegan los ahorros o créditos a los miembros y cómo funcionan la membresía y los pagos. Háganlo transparente y fácil de entender — un miembro debería poder ver, en una sola página, qué puso y qué le vuelve.",
        hours: 3,
        skills: ["contabilidad", "captura de datos"],
        follows: [3],
      },
      {
        name: "Educa a los miembros sobre su consumo de energía",
        description:
          "Ayuda a los miembros a leer sus facturas y a recortar su consumo — un kilovatio ahorrado vale más que un kilovatio generado. Acompaña los ahorros solares con consejos sencillos de eficiencia para que los hogares vean la diferencia en el papel.",
        hours: 3,
        skills: ["enseñanza"],
      },
    ],
  },
  {
    id: "worker-coop-incubator",
    name: "Incubadora de cooperativas de trabajo y habilidades laborales",
    purpose:
      "Ayudar a las vecinas y vecinos a desarrollar habilidades laborales y lanzar cooperativas de trabajadores — medios de vida donde quienes hacen el trabajo son dueños del lugar y toman las decisiones.",
    whoItServes:
      "Vecinos sin empleo o con empleo precario, y cualquiera que quiera una participación real en el lugar donde trabaja.",
    whatYoullNeed:
      "Mentores con experiencia empresarial y cooperativa, espacio y materiales de capacitación, apoyos de arranque hacia los que orientar a los emprendimientos, y alianzas — desarrolladores de cooperativas, prestamistas que conozcan las cooperativas y tu propio programa de intercambio de habilidades.",
    setupHours: 27,
    defaultCategory: "education",
    firstSteps:
      "Empieza con conversaciones, no con un plan de estudios: " +
      "siéntate con los miembros interesados a hablar de lo que " +
      "saben hacer y quieren construir, y busca los grupos de " +
      "habilidades que de verdad podrían convertirse en un " +
      "emprendimiento. Al mismo tiempo, encuentra al " +
      "desarrollador de cooperativas de tu zona o una " +
      "cooperativa de trabajadores existente dispuesta a ser " +
      "mentora — sus cicatrices son tu plan de estudios, y " +
      "formar una cooperativa sin esa guía es donde los grupos " +
      "salen lastimados.",
    commonPitfalls:
      "Esto fracasa de dos maneras: como un programa de " +
      "capacitación que nunca lanza nada, porque nadie empujó un " +
      "grupo de habilidades hacia un emprendimiento real — o " +
      "como un lanzamiento que se salta las partes aburridas, " +
      "constituyéndose con una plantilla descargada y " +
      "descubriendo el enredo de gobernanza e impuestos dos años " +
      "después. También muere en silencio cuando una sola " +
      "persona organizadora concentra cada relación con mentores " +
      "y financiadores; compartan esos contactos desde el primer " +
      "día.",
    pairsWith: ["skill-share", "solidarity-fund", "time-bank"],
    tasks: [
      {
        name: "Evalúa las habilidades y metas de los miembros",
        description:
          "Siéntate con los miembros y aprende qué saben hacer y qué quieren construir. Buscas grupos afines — tres personas que cocinan, una cuadrilla con oficios, cinco que limpian — porque un grupo de habilidades es la semilla de un emprendimiento cooperativo viable.",
        hours: 4,
        skills: ["entrevistas"],
      },
      {
        name: "Ofrece capacitación laboral y de habilidades",
        description:
          "Organiza sesiones sobre currículums, entrevistas, oficios, habilidades digitales y educación financiera. Apóyate en tu programa de intercambio de habilidades y trae expertos de fuera para lo que nadie local pueda enseñar — la meta es tener miembros capaces, se forme o no una cooperativa a su alrededor.",
        hours: 5,
        skills: ["enseñanza"],
      },
      {
        name: "Enseña el modelo cooperativo",
        description:
          "Guía a los miembros por la propiedad de los trabajadores y la gobernanza democrática: cómo se reparten las ganancias, cómo se toman las decisiones y en qué se diferencia todo de un negocio tradicional. Nadie puede elegir un modelo que nunca ha visto — usa cooperativas reales como ejemplos.",
        hours: 4,
        skills: ["enseñanza", "facilitación"],
      },
      {
        name: "Acompaña la formación de cooperativas",
        description:
          "Cuando un grupo esté listo, ayúdalo a escribir un plan de negocio y elegir una estructura legal. Conéctalo con abogados y contadores que conozcan las cooperativas en lugar de improvisar los pasos legales y contables — una constitución mal hecha sale cara de deshacer.",
        hours: 5,
        skills: ["trámites"],
        follows: [2],
      },
      {
        name: "Conecta con recursos de arranque",
        description:
          "Arma una lista viva de microcréditos, subvenciones, fondos de desarrollo cooperativo e incubadoras, y ayuda a los emprendimientos a postular de verdad. La mayor parte del dinero para cooperativas existe pero está mal señalizado — tu mapa vale dinero real.",
        hours: 3,
        skills: ["investigación"],
      },
      {
        name: "Brinda mentoría",
        description:
          "Empareja cada emprendimiento nuevo con un cooperativista con experiencia o un mentor de negocios que lo acompañe durante las etapas tempranas y frágiles. El primer año es donde fracasan las cooperativas; un mentor constante que ya ha visto el patrón cambia las probabilidades.",
        hours: 3,
      },
      {
        name: "Construye apoyo mutuo entre emprendimientos",
        description:
          "Reúne a los emprendimientos en una red donde las cooperativas compartan lecciones, se refieran clientes y se compren entre sí. Las cooperativas que comercian entre ellas sobreviven crisis que matan a las que están aisladas.",
        hours: 3,
        skills: ["organización"],
      },
    ],
  },
  {
    id: "elder-meal-delivery",
    name: "Compañía y entrega de comidas para personas mayores",
    purpose:
      "Llevar comidas regulares y visitas amistosas a personas mayores que no pueden salir de casa — la comida importa, y los diez minutos de conversación en la puerta muchas veces importan más.",
    whoItServes:
      "Vecinas y vecinos mayores aislados, confinados en casa o frágiles — y las familias que se preocupan por ellos desde lejos.",
    whatYoullNeed:
      "Personas voluntarias confiables y ya verificadas, una fuente de comidas, rutas planificadas y prácticas sencillas de seguridad para el momento en que una puerta no se abre.",
    setupHours: 22,
    defaultCategory: "food",
    firstSteps:
      "Empieza con la fuente de comidas y las primeras cinco " +
      "personas mayores, no con una hoja de inscripción: habla " +
      "con el equipo de la comida comunitaria o con un par de " +
      "cocineros dispuestos sobre lo que pueden producir de " +
      "forma confiable, y pregunta a trabajadores de servicios " +
      "para mayores, enfermeras parroquiales y farmacéuticos " +
      "quién se está quedando de verdad sin comer. Verifica a " +
      "tus primeros voluntarios antes de la primera entrega, no " +
      "después — la confianza que estás construyendo vive o " +
      "muere según quién cruza esas puertas.",
    commonPitfalls:
      "El fracaso peligroso es una señal perdida — un voluntario " +
      "que le resta importancia a una puerta sin respuesta " +
      "porque nadie dejó por escrito qué hacer, o una alergia " +
      "que nunca llegó a la hoja de ruta. El fracaso lento es la " +
      "falta de constancia: las personas mayores organizan su " +
      "día alrededor de la visita, y una ruta que se salta " +
      "semanas les enseña a no contar contigo. Mejor cinco " +
      "personas atendidas todas las semanas sin falta que veinte " +
      "atendidas a veces.",
    pairsWith: ["community-meal", "neighborhood-care-network", "rides-transportation"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Identifica a las personas mayores confinadas en casa",
        description:
          "Encuéntralas a través de clínicas, servicios para mayores, grupos de fe y el boca a boca. Hazlo con respeto y de forma estrictamente voluntaria — estás ofreciendo una comida y compañía, no inscribiendo a nadie en un sistema de vigilancia.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Convoca y verifica voluntarios",
        description:
          "Cualquiera que entre a la casa de una persona mayor pasa por verificación: referencias y revisiones básicas, sin excepciones para amigos de amigos. Luego apunta a la constancia — a las personas mayores les va mejor con la misma cara conocida en la puerta cada semana que con un elenco rotativo.",
        hours: 4,
        skills: ["organización"],
      },
      {
        name: "Consigue una fuente de comidas",
        description:
          "Asegura comidas de una cocina popular, cocineros caseros dispuestos o restaurantes que donen porciones. Presta atención a la nutrición y a que sean fáciles de recalentar, y etiqueta cada envase con su contenido — una comida sin etiqueta es una apuesta para alguien con alergias.",
        hours: 4,
        skills: ["cocina", "seguridad alimentaria"],
      },
      {
        name: "Planifica las rutas y el calendario de entregas",
        description:
          "Agrupa a las personas mayores en rutas eficientes y fija un ritmo confiable — los mismos días, más o menos a las mismas horas. Incluye unos minutos de conversación sin prisa en cada parada; para muchas personas mayores, esa es la verdadera entrega.",
        hours: 3,
        skills: ["conducir", "organización"],
        follows: [0, 2],
      },
      {
        name: "Registra información dietética, de alergias y de emergencia",
        description:
          "Para cada persona mayor, registra necesidades dietéticas, alergias, medicamentos que importan alrededor de la comida y contactos de emergencia. Guárdalo seguro y solo para quien lo necesite — quien conduce necesita saber la alergia, no todo el historial médico.",
        hours: 3,
        skills: ["captura de datos"],
      },
      {
        name: "Establece un protocolo de verificación de bienestar",
        description:
          "Deja por escrito exactamente qué hace un voluntario cuando una persona mayor no responde o se ve mal: a quién llamar primero, cuándo involucrar a la familia o a los servicios de emergencia y cómo anotar lo que pasó. Decidirlo por adelantado es mejor que improvisar en un umbral.",
        hours: 3,
        skills: ["redacción"],
        follows: [4],
      },
      {
        name: "Apoya a los voluntarios y recoge opiniones",
        description:
          "Habla con los voluntarios con regularidad, rota las rutas cuando alguien necesite un descanso y pregunta a las propias personas mayores cómo podría servirles mejor el proyecto. Te dirán cosas que los voluntarios nunca ven.",
        hours: 2,
      },
    ],
  },
  {
    id: "disaster-relief-hub",
    name: "Centro de distribución de ayuda ante desastres",
    purpose:
      "Levantar un centro que pueda recibir, clasificar y mover insumos rápido cuando golpea un desastre — porque los primeros días después de una inundación o un incendio se ganan o se pierden en la logística.",
    whoItServes:
      "Residentes golpeados por inundaciones, tormentas, incendios y otros desastres — empezando por los vecinos con menos posibilidades de trasladarse o de esperar.",
    whatYoullNeed:
      "Un sitio acordado de antemano con un respaldo, canales para conseguir insumos, un equipo de voluntarios de emergencia y coordinación con la red de preparación para emergencias — casi todo arreglado antes de cualquier desastre, porque después ya es tarde.",
    setupHours: 24,
    defaultCategory: "organizing",
    suggestsWorkDays: true,
    firstSteps:
      "El centro existe en papel mucho antes de existir en un " +
      "estacionamiento, así que empieza con la red de " +
      "preparación para emergencias — ellos tienen el árbol de " +
      "contactos y el panorama de riesgos — y con la pregunta " +
      "honesta de qué edificio de verdad te dejaría entrar a las " +
      "seis de la mañana después de una inundación. Cierra " +
      "primero el acuerdo del sitio y el respaldo; todas las " +
      "demás tareas dependen de una dirección.",
    commonPitfalls:
      "Los centros de ayuda fracasan en dos direcciones: el " +
      "centro que existe solo como un plan que nadie ensayó, y " +
      "el evento real quema su primer día en preguntas que un " +
      "simulacro habría respondido — y el centro que abre sus " +
      "puertas a una avalancha de donaciones que no puede " +
      "clasificar, convirtiéndose en una bodega de ropa " +
      "inservible mientras la gente necesita agua. El daño más " +
      "silencioso es la distribución con barreras: en el momento " +
      "en que alguien debe demostrar que merece ayuda, " +
      "recreaste el sistema que construiste esto para esquivar.",
    pairsWith: ["emergency-preparedness", "resource-hub-dispatch"],
    learnMore: ["internet-outage"],
    tasks: [
      {
        name: "Identifica de antemano un sitio y un respaldo",
        description:
          "Busca un edificio o terreno que pueda recibir entregas, clasificar bienes y albergar una fila de distribución — más un respaldo por si el primero queda dañado o inaccesible. Confirma el acceso y las llaves con los dueños ahora, con clima en calma; un sitio al que no puedes entrar no es un sitio.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Construye canales de abastecimiento",
        description:
          "Acuerda por adelantado de dónde vendrían el agua, la comida y los insumos de higiene y limpieza — proveedores, organizaciones aliadas, colectas. Igual de importante: una forma de saber qué necesita de verdad la gente después de un evento, para que no te entierren las cosas equivocadas.",
        hours: 4,
        skills: ["difusión", "organización"],
      },
      {
        name: "Monta la recepción, clasificación e inventario",
        description:
          "Diseña cómo se reciben, clasifican y registran las donaciones desde el momento en que llega un camión. Todos los centros que se han ahogado en bienes sin clasificar se saltaron este paso — define tus categorías, etiquetas y conteos sencillos antes de necesitarlos.",
        hours: 4,
        skills: ["organización", "captura de datos"],
      },
      {
        name: "Crea un sistema de distribución",
        description:
          "Planifica cómo salen los insumos: equitativo y sin barreras — sin pedir identificación ni pruebas de necesidad — con entrega móvil para quien no puede llegar al centro. Prioriza primero a las personas más vulnerables, y deja esa prioridad por escrito para que sobreviva al caos.",
        hours: 3,
        skills: ["conducir", "organización"],
        follows: [2],
      },
      {
        name: "Convoca y entrena un equipo voluntario de emergencia",
        description:
          "Arma una lista de personas que puedan movilizarse con poco aviso y entrénalas de antemano en sus roles, las reglas de seguridad y tu sistema de recepción y distribución. Un equipo entrenado de doce rinde más que una multitud bienintencionada de cincuenta.",
        hours: 4,
        skills: ["enseñanza"],
      },
      {
        name: "Coordina con otros equipos de respuesta",
        description:
          "Presenta el centro a las agencias oficiales de emergencia y a otros grupos de ayuda antes de que pase nada. Acuerden quién cubre qué, para llenar vacíos en lugar de duplicar — la ayuda mutua avanza más rápido justo donde la respuesta oficial es más lenta.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Planifica la comunicación y la seguridad",
        description:
          "Prepárate para que fallen las redes: métodos de contacto sin internet, listas impresas y un enlace con el árbol de contactos de la red de preparación. Fijen reglas duras de seguridad para voluntarios — nadie entra a estructuras inseguras, nunca — y déjenlas por escrito.",
        hours: 3,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "recovery-peer-support",
    name: "Red de apoyo entre pares en recuperación y sobriedad",
    purpose:
      "Sostener apoyo dirigido por pares para vecinos que están en recuperación del consumo de sustancias o que la buscan — un complemento del tratamiento profesional, nunca un reemplazo.",
    whoItServes:
      "Personas en recuperación, personas que la están considerando y las familias y amistades que caminan a su lado.",
    whatYoullNeed:
      "Facilitadores pares con experiencia vivida y capacitación real, un espacio seguro y privado, rutas de derivación y límites dichos con claridad: el apoyo entre pares complementa el tratamiento profesional, no lo reemplaza; los facilitadores no son proveedores médicos y nunca deben aconsejar sobre desintoxicación ni medicamentos; y siempre hay un plan claro para conectar a cualquier persona en crisis con ayuda profesional o de emergencia calificada.",
    setupHours: 22,
    defaultCategory: "emotional_support",
    firstSteps:
      "Empieza por las personas que sostendrán la sala: " +
      "encuentra a una o dos vecinas o vecinos con experiencia " +
      "vivida y sólida de recuperación, inscríbelos en una " +
      "capacitación formal de apoyo entre pares y escriban " +
      "juntos el alcance — qué es y qué no es esta red — antes " +
      "de anunciar nada. Luego conoce en persona los programas " +
      "de tratamiento y los servicios de crisis locales, para " +
      "que tu ruta de derivación sea una relación, no un número " +
      "de teléfono en un volante.",
    commonPitfalls:
      "Esto se vuelve peligroso cuando la línea se difumina — un " +
      "facilitador bienintencionado aconsejando a alguien sobre " +
      "desintoxicación o medicamentos, lo cual puede matar, o un " +
      "grupo deslizándose hacia el tratamiento amateur porque la " +
      "ruta de derivación nunca fue real. Fracasa en silencio " +
      "por la confidencialidad rota — una sola historia filtrada " +
      "vacía la sala para siempre — y por el agotamiento de los " +
      "facilitadores, cuando la persona que sostiene la " +
      "recuperación de todos no tiene apoyo para la suya.",
    pairsWith: ["mental-health-peer-support", "harm-reduction-supplies"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Convoca y capacita facilitadores pares",
        description:
          "Busca personas con experiencia vivida de recuperación y haz que completen una capacitación reconocida de apoyo entre pares en recuperación. Sé claro desde la primera conversación: los facilitadores son pares, no proveedores médicos ni clínicos, y la capacitación es lo que mantiene esa línea segura.",
        hours: 5,
        skills: ["facilitación", "enseñanza"],
      },
      {
        name: "Define el alcance y los límites",
        description:
          "Deja por escrito qué hace la red — apoyo entre pares, conexión, ánimo — y qué no hace: tratamiento, desintoxicación, atención médica, consejos sobre medicamentos. Un alcance escrito protege a los miembros de los malos consejos y protege a los facilitadores de cargar con lo que no les corresponde.",
        hours: 3,
        skills: ["redacción"],
      },
      {
        name: "Construye rutas de derivación y de crisis",
        description:
          "Crea relaciones de trabajo con programas de tratamiento profesional, atención médica y servicios de crisis, y escribe un plan de respuesta ante sobredosis. Cuando alguien en la sala necesite más de lo que los pares pueden dar, el traspaso debería ser una llamada cálida, no un folleto.",
        hours: 4,
        skills: ["difusión", "investigación"],
        follows: [1],
      },
      {
        name: "Encuentra un espacio seguro, privado y libre de sustancias",
        description:
          "Busca una sala confidencial, acogedora y libre de juicios y de sustancias — un lugar al que la gente pueda entrar sin que eso anuncie nada. Funcionan bien las bibliotecas, los salones comunitarios y los espacios de fe con entrada aparte.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Establece la confidencialidad y las normas del grupo",
        description:
          "Acuerden las reglas básicas: lo que se dice aquí se queda aquí, respeto sin empujar consejos y el derecho de cada quien a compartir o a pasar. Reafírmenlas en voz alta al inicio de cada reunión, sin excepción — las normas solo protegen mientras están frescas.",
        hours: 3,
        skills: ["facilitación"],
      },
      {
        name: "Programa y difunde las reuniones",
        description:
          "Ofrece más de un horario de reunión para que puedan venir quienes trabajan por turnos y quienes crían, y difunde con lenguaje sencillo y sin estigma — gratis, abierto, sin requisitos. Cómo redactas el volante decide quién se siente seguro de llegar.",
        hours: 3,
        skills: ["difusión"],
        follows: [3],
      },
      {
        name: "Apoya a los facilitadores y prevén el agotamiento",
        description:
          "Habla con los facilitadores con regularidad, rota quién dirige y asegúrate de que tengan apoyo propio — sostener el espacio para la recuperación ajena es un trabajo pesado, y la propia recuperación de un facilitador siempre va primero.",
        hours: 2,
        skills: ["escucha"],
      },
    ],
  },
  {
    id: "community-fitness",
    name: "Grupos comunitarios de ejercicio y bienestar",
    purpose:
      "Poner a las vecinas y vecinos a moverse juntos y gratis — grupos de caminata, estiramientos, partidos improvisados, baile — porque sentirte bien en tu cuerpo no debería costar una membresía de gimnasio.",
    whoItServes:
      "Cualquiera que quiera moverse, en especial vecinos para quienes el gimnasio queda fuera de alcance, personas mayores y gente aislada para quienes la compañía importa tanto como el ejercicio.",
    whatYoullNeed:
      "Personas voluntarias que guíen las actividades, espacios seguros y accesibles, y muy poco equipo. Un estilo acogedor y sin presión importa más que las credenciales — aunque quien dirija una actividad físicamente exigente debe tener la preparación adecuada, y cada sesión necesita agua, calentamiento y un botiquín de primeros auxilios a la mano.",
    setupHours: 19,
    defaultCategory: "other",
    firstSteps:
      "Antes de agendar nada, pregunta a las personas que " +
      "esperas que vengan qué disfrutarían de verdad — un grupo " +
      "de caminata, estiramientos en silla, una noche de baile " +
      "— y qué se siente posible para sus cuerpos; las " +
      "respuestas deben elegir tus actividades, no al revés. " +
      "Luego encuentra a una o dos personas guía cuya calidez " +
      "pese más que su pericia, recorran juntos los espacios " +
      "candidatos y lancen una sola sesión semanal confiable " +
      "antes de agregar más.",
    commonPitfalls:
      "Esto muere de dos maneras: se vuelve una competencia — " +
      "los miembros más en forma marcan el paso, la charla se " +
      "desvía hacia el peso y la apariencia, y justo la gente " +
      "para la que es deja de venir en silencio — o se vuelve " +
      "inconstante, porque nada mata un grupo de caminata más " +
      "rápido que llegar dos veces a una sesión cancelada. " +
      "Saltarse lo aburrido de la seguridad es la tercera: sin " +
      "calentamiento, sin agua, sin botiquín, y una mala caída " +
      "acaba con todo.",
    pairsWith: ["disability-support-network", "neighborhood-care-network"],
    learnMore: ["community-events"],
    tasks: [
      {
        name: "Sondea intereses y niveles de actividad",
        description:
          "Pregunta por ahí — en la lavandería, el edificio de personas mayores, la puerta de la escuela — qué tipos de movimiento disfruta la gente y qué se siente accesible. Deja que las respuestas guíen: una plantilla llena de deportes que nadie pidió no ayuda a nadie.",
        hours: 2,
        skills: ["difusión"],
      },
      {
        name: "Convoca a personas guía para las actividades",
        description:
          "Encuentra voluntarias y voluntarios que dirijan caminatas, estiramientos, baile o partidos improvisados. Un estilo acogedor y sin presión vale más que la pericia para la mayoría de las actividades — pero quien dirija algo físicamente exigente debe contar con la certificación adecuada.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Encuentra espacios seguros",
        description:
          "Pregunta por parques, salones comunitarios y gimnasios escolares — gratuitos o baratos, y accesibles sin auto. Revisa cada espacio pensando en cuerpos y capacidades diversas: piso parejo, asientos, sombra, baños y un lugar donde resguardarse si el clima cambia.",
        hours: 3,
      },
      {
        name: "Planea una programación inclusiva y para todos los niveles",
        description:
          "Diseña cada actividad para que la gente pueda sumarse a su propio ritmo y adaptarla con libertad — una opción en silla para el estiramiento, un circuito corto dentro de la caminata larga. Mantén el enfoque en sentirse bien, moverse y conectar, nunca en la apariencia o el rendimiento.",
        hours: 3,
      },
      {
        name: "Atiende la seguridad y la salud",
        description:
          "Incluye calentamiento e hidratación en cada sesión, ten a la mano un botiquín de primeros auxilios bien surtido y sugiere que quien recién empieza a ejercitarse consulte antes con su médico. Enseña a las personas guía a detectar el sobreesfuerzo y a hacer que bajar el ritmo se sienta normal, no vergonzoso.",
        hours: 3,
        skills: ["primeros auxilios"],
      },
      {
        name: "Define un horario y corre la voz",
        description:
          "Elige horarios consistentes alrededor de los cuales la gente pueda construir un hábito, y respétalos. Promociona por todas partes — volantes, chats grupales, boca a boca — y di explícitamente que todas las edades, tallas y capacidades son bienvenidas, porque mucha gente asume que no lo son.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Cultiva comunidad y constancia",
        description:
          "Haz que las sesiones sean sociales: nombres aprendidos, recién llegados bien recibidos, unos minutos de charla incluidos. Celebra el simple hecho de presentarse en vez de cualquier métrica — la conexión es lo que hace que la gente siga viniendo mucho después de que pasa la novedad.",
        hours: 2,
        skills: ["facilitación"],
      },
    ],
  },
  {
    id: "urban-orchard",
    name: "Huerto frutal urbano y bosque comestible",
    purpose:
      "Plantar árboles frutales, árboles de nueces y plantas comestibles perennes en terrenos compartidos — un bosque comestible que, una vez establecido, alimenta gratis al vecindario por décadas.",
    whoItServes:
      "Toda la comunidad, incluidos los vecinos que todavía no llegan — los árboles plantados este año se convierten en una fuente de comida fresca y gratuita a largo plazo para todo el mundo.",
    whatYoullNeed:
      "Acceso a la tierra a largo plazo (un acuerdo de palabra de temporada en temporada no basta para árboles), árboles y plantas adecuados al clima, personas voluntarias para las jornadas de plantación y un pequeño equipo de cuidadores comprometidos por años, no por meses. Confirmen el acceso al agua antes de que nada toque la tierra.",
    setupHours: 21,
    defaultCategory: "food",
    suggestsWorkDays: true,
    firstSteps:
      "La conversación sobre la tierra va antes que todo: habla " +
      "con fideicomisos de tierras, el departamento de parques, " +
      "congregaciones de fe con terreno sin usar — cualquiera " +
      "que pueda comprometer un sitio por una década, no por " +
      "una temporada — y de paso confirma el agua. En paralelo, " +
      "encuentra a una persona con experiencia real en árboles " +
      "frutales que ancle el diseño, y pregunta a los vecinos " +
      "qué cosecharían y comerían de verdad, porque un huerto " +
      "de fruta que nadie quiere solo alimenta a las avispas.",
    commonPitfalls:
      "Los huertos rara vez fracasan el día de la plantación — " +
      "fracasan en los años dos y tres, cuando la multitud ya " +
      "se fue y nadie organizó el riego, y los árboles jóvenes " +
      "mueren en silencio en su primer verano seco. Los otros " +
      "asesinos son acuerdos de tierra frágiles revocados justo " +
      "cuando los árboles empiezan a dar fruto, y pleitos de " +
      "cosecha porque nadie acordó normas de reparto antes de " +
      "la primera gran cosecha. Resuelvan la rotación de " +
      "cuidados y las reglas de reparto temprano, mientras " +
      "todavía es fácil.",
    pairsWith: ["community-garden", "gleaning-network", "seed-library"],
    tasks: [
      {
        name: "Asegura el acceso a la tierra a largo plazo",
        description:
          "Consigue un acuerdo escrito duradero — un arrendamiento largo, un arreglo con un fideicomiso de tierras, un compromiso formal de la ciudad — porque los árboles necesitan décadas, no un acuerdo de palabra de temporada en temporada. Confirma un acceso confiable al agua en el sitio antes de firmar nada.",
        hours: 5,
        skills: ["difusión"],
      },
      {
        name: "Planea el diseño de plantación",
        description:
          "Elige especies adecuadas a tu clima y diseña en capas de bosque comestible: árboles de dosel, arbustos y cubierta vegetal trabajando juntos. Planea los compañeros de polinización y el espacio que necesitarán los árboles adultos, no el tamaño de las plántulas que siembras.",
        hours: 4,
        skills: ["jardinería"],
      },
      {
        name: "Consigue los árboles y las plantas",
        description:
          "Asegura árboles y plantas a través de viveros, subvenciones, donaciones y ventas de temporada a raíz desnuda — el material joven y a raíz desnuda cuesta una fracción de los árboles maduros en maceta y suele establecerse mejor. Pide con anticipación; las buenas variedades se agotan.",
        hours: 3,
      },
      {
        name: "Prepara el sitio",
        description:
          "Deja el terreno listo antes de que lleguen los árboles: mejora el suelo, extiende acolchado, instala el riego, y marca y despeja cada punto de plantación según el diseño. Un sitio preparado convierte la jornada de plantación de un caos en una línea de montaje.",
        hours: 4,
        skills: ["jardinería"],
        follows: [1],
      },
      {
        name: "Organiza jornadas de plantación",
        description:
          "Realiza jornadas comunitarias de plantación con instrucciones claras, para que cada árbol quede a la profundidad correcta, con su cazuela de riego y su acolchado — mal plantados, los árboles fallan lenta e invisiblemente. Hazlo festivo; una jornada de plantación es la manera en que el vecindario empieza a sentir que el huerto es suyo.",
        hours: 5,
        skills: ["jardinería"],
        follows: [3],
        recurringCadence: "cycle",
      },
      {
        name: "Establece el cuidado a largo plazo",
        description:
          "Organiza el trabajo sin gloria que decide si el huerto vive: regar los árboles jóvenes durante sus primeros veranos, podar, acolchar y manejar las plagas, año tras año. Una rotación con nombres de cuidadores comprometidos vale más que una gran lista de voluntarios difusos.",
        hours: 3,
        skills: ["jardinería"],
      },
      {
        name: "Planea el reparto de la cosecha",
        description:
          "Acuerden normas de recolección y reparto antes de la primera gran cosecha, no después del primer pleito — quién cosecha, cuándo y cuánto. Encaucen el excedente a refrigeradores comunitarios, despensas y comidas compartidas para que nada se pudra en la rama.",
        hours: 2,
      },
    ],
  },
  {
    id: "new-parent-support",
    name: "Red de apoyo posparto y para nuevas familias",
    purpose:
      "Rodear de apoyo práctico a madres y padres recientes o en espera — comidas en la puerta, mandados hechos, platos lavados y pares que ya pasaron por ahí — durante el embarazo y las semanas crudas del posparto.",
    whoItServes:
      "Madres y padres recientes o en espera, sobre todo quienes no tienen familia cerca — las semanas después de un nacimiento son cuando el apoyo más importa y menos suele llegar.",
    whatYoullNeed:
      "Personas voluntarias que puedan cocinar, hacer mandados y escuchar; un sistema de tren de comidas; un directorio de recursos; y madres y padres con experiencia como pares de apoyo. El apoyo entre pares no es atención médica ni de salud mental — los trastornos del ánimo posparto son comunes y serios, así que cada par de apoyo debe conocer las señales y saber conectar con delicadeza a una madre o un padre con ayuda profesional. Y verifiquen los antecedentes de cualquiera que vaya a entrar a los hogares o ayudar con bebés antes de que haga cualquiera de las dos cosas.",
    setupHours: 21,
    defaultCategory: "childcare",
    firstSteps:
      "Empieza preguntando a madres y padres que dieron a luz " +
      "en el último año qué les habría ayudado de verdad — las " +
      "respuestas (una comida sin visita incluida, alguien que " +
      "cargue al bebé mientras se bañan) son más específicas de " +
      "lo que imaginas. Presenta la red a parteras, doulas y " +
      "clínicas pediátricas que puedan ofrecerla a las " +
      "familias, convoca a dos o tres madres o padres con " +
      "experiencia como tus primeros pares de apoyo, y define " +
      "tu práctica de verificación antes de que alguien cruce " +
      "una puerta.",
    commonPitfalls:
      "El fracaso clásico es un apoyo que sirve a quien apoya: " +
      "voluntarios que llegan según su propio horario, se " +
      "quedan demasiado y opinan sobre la crianza en vez de " +
      "lavar los platos — unas madres y padres agotados " +
      "dejarán de abrir la puerta en silencio antes que " +
      "decirlo. El más grave es que un par no vea las señales " +
      "de la depresión posparto porque nadie lo entrenó para " +
      "reconocerla ni le dio las palabras para nombrarla. Y un " +
      "apoyo que desaparece a las dos semanas, justo cuando se " +
      "acaban los guisados y empieza lo difícil, no es apoyo " +
      "en absoluto.",
    pairsWith: ["diaper-hygiene-bank", "childcare-collective", "welcome-wagon"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Convoca voluntarios y pares de apoyo",
        description:
          "Reúne a quienes cocinan, hacen mandados y — lo más importante — madres y padres con experiencia dispuestos a ser pares de apoyo. Quien recuerda su propia tercera semana sin dormir ofrece algo que ningún folleto puede dar.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Monta un sistema de tren de comidas",
        description:
          "Crea una forma sencilla de coordinar comidas dejadas en la puerta durante las semanas después de un nacimiento: un calendario compartido, necesidades dietéticas y alergias recogidas una sola vez, comida etiquetada y fácil de recalentar. Dejarla en la puerta debe ser lo normal — una comida nunca debe obligar a una visita.",
        hours: 3,
        skills: ["cocina", "organización"],
      },
      {
        name: "Ofrece ayuda práctica",
        description:
          "Organiza voluntarios para la carga sin gloria: mandados, lavandería, platos y cuidar a los hermanos mayores para que una madre o un padre pueda descansar o llegar a una cita. Pregunta qué se necesita cada vez en lugar de asumir — la ayuda útil sigue la lista de la familia, no la del voluntario.",
        hours: 3,
        skills: ["cuidado infantil"],
      },
      {
        name: "Arma un directorio de recursos",
        description:
          "Recopila apoyo local de lactancia, atención de salud mental posparto, clínicas pediátricas y fuentes de artículos para bebé — incluidos el banco de pañales y el colectivo de cuidado infantil si tu comunidad los tiene. Mantenlo al día; un directorio de teléfonos muertos es peor que ninguno.",
        hours: 4,
        skills: ["captura de datos"],
      },
      {
        name: "Crea círculos de apoyo entre pares",
        description:
          "Inicia grupos pequeños donde las madres y padres recientes puedan ser honestos sobre lo difícil que es, con una madre o un padre con experiencia sosteniendo el espacio. Capacita a los pares en las señales de la depresión y la ansiedad posparto y en animar con delicadeza y persistencia a buscar atención profesional — nunca diagnosticar, nunca esperar.",
        hours: 3,
        skills: ["facilitación"],
      },
      {
        name: "Define prácticas de seguridad y de límites",
        description:
          "Verifica a cada voluntario que vaya a entrar a los hogares o ayudar con bebés — referencias como mínimo — y deja los límites por escrito: la familia pone las condiciones, las visitas son cortas salvo invitación a quedarse más, y nadie llega sin avisar. El apoyo nunca debe sentirse como vigilancia.",
        hours: 3,
      },
      {
        name: "Conecta con otros proyectos",
        description:
          "Enlaza a las familias con el banco de pañales, el colectivo de cuidado infantil y el comité de bienvenida, para que un solo punto de contacto lo abra todo. Una madre o un padre reciente no debería tener que descubrir cada programa por separado en el momento más agotador de su vida.",
        hours: 2,
        skills: ["difusión"],
      },
    ],
  },
  {
    id: "foster-kinship-support",
    name: "Red de apoyo a familias de acogida y parientes cuidadores",
    purpose:
      "Respaldar a las familias de acogida, a los parientes cuidadores y a otras familias que crían — ropa y una cama cuando un niño llega de un día para otro, respiro cuando quienes cuidan están al límite, y pares que entienden el trabajo.",
    whoItServes:
      "Madres y padres de acogida, abuelos y parientes criando niños — los parientes cuidadores suelen empezar con una llamada y unas horas de aviso — y los niños y niñas a su cargo.",
    whatYoullNeed:
      "Personas voluntarias, artículos donados de todas las edades y tallas, ayuda de respiro y alianzas con agencias y escuelas. El trabajo con niñez en acogida es delicado y está regulado por ley: verifiquen a todas las personas que trabajen con niños, sigan al pie de la letra las reglas de reporte obligatorio y de confidencialidad, y coordinen con las agencias pertinentes, no a sus espaldas.",
    setupHours: 24,
    defaultCategory: "childcare",
    firstSteps:
      "Empieza con una reunión en la agencia local de acogida o " +
      "el programa orientador de cuidado por parientes: aprende " +
      "las reglas que rigen este trabajo — verificación de " +
      "antecedentes, reporte obligatorio, confidencialidad — " +
      "antes de convocar a una sola persona voluntaria, y deja " +
      "que ellos te digan dónde están de verdad los vacíos. " +
      "Luego pregunta a algunas familias cuidadoras qué " +
      "necesitaron en su primera semana y en su primer año; " +
      "construye hacia esas respuestas, no hacia una bodega de " +
      "cosas que nadie pidió.",
    commonPitfalls:
      "Este proyecto puede fracasar con estruendo o en " +
      "silencio. Con estruendo: un voluntario sin verificar " +
      "cerca de los niños, o la historia de una familia " +
      "compartida sin permiso — cualquiera de las dos puede " +
      "dañar a un niño, terminar una colocación y acabar con " +
      "el proyecto en un día. En silencio: una montaña de " +
      "donaciones sin clasificar mientras una cuidadora espera " +
      "tres semanas una cama para un niño pequeño, o tratar a " +
      "las agencias como adversarias hasta que dejan de " +
      "referir familias. Aquí, lo pequeño, verificado y " +
      "coordinado le gana a lo grande e improvisado, siempre.",
    pairsWith: ["diaper-hygiene-bank", "free-store", "childcare-collective"],
    learnMore: ["who-sees-what"],
    tasks: [
      {
        name: "Conecta con las familias cuidadoras",
        description:
          "Llega a las familias cuidadoras a través de agencias, escuelas y grupos de fe — en especial a los parientes cuidadores, que a menudo reciben a un nieto o una sobrina de la noche a la mañana, sin preparación y con poco apoyo oficial. Haz que el primer contacto sea una oferta, nunca un filtro.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Arma una reserva de ropa y artículos",
        description:
          "Recolecta ropa, camas, sillas de auto y artículos de uso diario en todo el rango de edades y tallas, porque quienes cuidan rara vez saben quién llega hasta que llega. Revisa con cuidado los artículos de seguridad — las sillas de auto y las cunas tienen fechas de caducidad y listas de retiro del mercado.",
        hours: 4,
        skills: ["organización"],
      },
      {
        name: "Crea un sistema de entrega rápida",
        description:
          "Prepara mochilas listas para salir — unos días de ropa, artículos de aseo y algo reconfortante como un peluche — ordenadas por edad y talla, entregables a las pocas horas de una nueva colocación. Un niño que llega sin nada no debería esperar una semana para tener algo propio.",
        hours: 3,
        follows: [1],
      },
      {
        name: "Organiza el apoyo de respiro",
        description:
          "Consigue cuidado seguro y debidamente verificado para que quienes cuidan puedan descansar, cumplir sus citas o simplemente respirar — el agotamiento de quien cuida es una de las principales razones por las que se rompen las colocaciones. Coordina con las agencias quién puede dar cuidado de respiro y bajo qué reglas.",
        hours: 4,
        skills: ["cuidado infantil"],
      },
      {
        name: "Ofrece grupos de apoyo entre pares",
        description:
          "Organiza encuentros regulares donde las familias de acogida y los parientes cuidadores puedan intercambiar experiencia y consejos honestos con gente que lo entiende — este trabajo aísla, y la cuidadora a tres calles de distancia puede estar cargando lo mismo sola.",
        hours: 3,
        skills: ["facilitación"],
      },
      {
        name: "Arma un directorio de recursos",
        description:
          "Recopila los servicios, beneficios y apoyos con enfoque en el trauma a los que pueden recurrir las familias cuidadoras, y ayúdalas a navegar sistemas confusos hasta para los profesionales. Los parientes cuidadores, en particular, suelen calificar para ayudas de las que nadie les habló.",
        hours: 3,
        skills: ["captura de datos"],
      },
      {
        name: "Define prácticas de seguridad infantil y privacidad",
        description:
          "Deja por escrito y cumple lo innegociable: verificación para cualquiera que trabaje con niños, lo que las leyes de reporte obligatorio exigen de tus voluntarios y privacidad estricta para las familias y los niños — sin fotos, sin historias, sin detalles compartidos sin permiso.",
        hours: 4,
        skills: ["redacción"],
      },
    ],
  },
  {
    id: "weather-survival-outreach",
    name: "Brigadas de supervivencia ante frío y calor extremos",
    purpose:
      "Llevar insumos de supervivencia a las vecinas y vecinos sin techo cuando el clima se vuelve mortal — cobijas y calentadores de manos en una helada, agua y electrolitos en una ola de calor — cargados hasta donde la gente realmente está.",
    whoItServes:
      "Vecinas y vecinos sin techo o en situación de calle expuestos al clima extremo — la gente para quien una ola de calor o una helada es un evento que amenaza la vida, no una molestia.",
    whatYoullNeed:
      "Insumos específicos para cada clima, voluntarios de calle, rutas planificadas y conexiones vigentes con refugios y servicios. El calor y el frío extremos matan: cada voluntario debe estar capacitado para reconocer la hipotermia y el golpe de calor y para llamar sin demora a ayuda médica profesional — nunca esperar a ver qué pasa.",
    setupHours: 24,
    defaultCategory: "mutual_aid_drive",
    firstSteps:
      "Antes de comprar una sola cobija, habla con los equipos " +
      "de trabajo en calle y las organizaciones que ya recorren " +
      "estas rutas — ellos tienen la confianza y el " +
      "conocimiento de dónde está realmente la gente, y te " +
      "dirán qué está cubierto y qué falta. Acuerda con ellos " +
      "cómo vas a encajar, define los umbrales de pronóstico " +
      "que activan tus rondas y abastece los insumos de la " +
      "temporada mientras el clima todavía es templado.",
    commonPitfalls:
      "El fracaso predecible es empezar cuando empieza el " +
      "clima: los insumos conseguidos en plena ola de calor " +
      "llegan cuando el peligro ya pasó, y los desconocidos " +
      "que aparecen por primera vez en una crisis reciben un " +
      "no receloso de gente que aprendió la cautela por las " +
      "malas. Los fracasos peligrosos son voluntarios que " +
      "intentan manejar una emergencia médica por su cuenta en " +
      "vez de pedir ayuda de inmediato, y presionar a la gente " +
      "a moverse o a aceptar un refugio — ofrece, informa y " +
      "respeta la respuesta.",
    pairsWith: ["cooling-warming-center", "harm-reduction-supplies", "resource-hub-dispatch"],
    tasks: [
      {
        name: "Arma paquetes según la temporada",
        description:
          "Prepara paquetes acordes a la estación: cobijas, calcetines abrigadores, gorros, guantes y calentadores de manos para el frío; agua, sobres de electrolitos, bloqueador solar, gorras y paños refrescantes para el calor. Agrega a cada paquete una tarjeta con las ubicaciones de los refugios y los números de crisis.",
        hours: 4,
      },
      {
        name: "Consigue los insumos",
        description:
          "Organiza colectas de donaciones, haz compras al por mayor y pide contribuciones a tiendas y congregaciones — y hazlo antes de la temporada, porque buscar cobijas durante la primera helada es llegar tarde. Acumula suficiente para reabastecer a mitad de temporada.",
        hours: 4,
        skills: ["difusión", "conducir"],
      },
      {
        name: "Mapea dónde encontrar a la gente",
        description:
          "Trabaja con los equipos de calle existentes para saber dónde se quedan realmente las vecinas y vecinos sin techo — ellos tienen una confianza y un conocimiento construidos por años, y llegar a su lado vale más que llegar en frío. Mantén el mapa flexible y al día; la gente se mueve, sobre todo con mal clima.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Convoca y capacita a voluntarios de calle",
        description:
          "Capacita a cada voluntario antes de su primera ronda: trato respetuoso que acepta un no por respuesta, seguridad personal y trabajar siempre en pares, y reconocer las emergencias médicas causadas por el clima. Nadie reparte hasta haber sido capacitado.",
        hours: 4,
        skills: ["enseñanza"],
      },
      {
        name: "Arma un plan de distribución y rutas",
        description:
          "Planea rutas y horarios para los días previos al clima peligroso y durante este, llegando primero a las personas más expuestas — las más alejadas de los servicios, las que duermen a la intemperie y no en vehículos o refugios. Decide por adelantado qué pronóstico activa una ronda.",
        hours: 3,
        skills: ["organización"],
        follows: [2],
      },
      {
        name: "Conecta a la gente con refugios y servicios",
        description:
          "Lleva información vigente y verificada sobre centros de abrigo y enfriamiento, camas de refugio y el centro de recursos — los horarios y las reglas cambian todo el tiempo, y una referencia a una puerta cerrada quema la confianza. Ofrece conexiones sin presión; la relación dura más que cualquier noche.",
        hours: 3,
        skills: ["difusión"],
      },
      {
        name: "Prepárate para las emergencias",
        description:
          "Capacita a cada voluntario para reconocer la hipotermia y el golpe de calor — confusión, habla arrastrada, piel caliente y seca o fría y húmeda — y para llamar de inmediato a los servicios de emergencia, no esperar a ver qué pasa. Ensayen qué hacer mientras llega la ayuda: sombra y agua, o cobijas y resguardo del viento.",
        hours: 3,
        skills: ["primeros auxilios"],
      },
    ],
  },
];

/** Returns the locale-appropriate template list. Falls back to en
 *  when the locale isn't supported, so a member with an exotic
 *  `Accept-Language` still sees the gallery (just in English). */
export function getProjectTemplates(
  locale: string,
): readonly ProjectTemplate[] {
  return locale.startsWith("es") ? PROJECT_TEMPLATES_ES : PROJECT_TEMPLATES_EN;
}

export function getTemplate(
  id: string,
  locale: string,
): ProjectTemplate | undefined {
  return getProjectTemplates(locale).find((t) => t.id === id);
}
