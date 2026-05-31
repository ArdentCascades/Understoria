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
    setupHours: 23,
    defaultCategory: "food",
    tasks: [
      {
        name: "Find a host site with power and foot traffic",
        description:
          "Approach small businesses, churches, clinics, or community centers. Ask if they'll let you place a fridge under their awning and plug it in (electricity cost is usually a few dollars a month — offer to cover it). Get a simple written okay.",
        hours: 3,
      },
      {
        name: "Source a fridge and a weatherproof shelter",
        description:
          "Put out a call for a working fridge on local groups. Build or buy a simple wooden cabinet/lean-to around it to protect it from rain and sun. Anchor it so it can't tip. Includes locating, transporting, and building.",
        hours: 8,
      },
      {
        name: "Set the ground rules and label everything",
        description:
          "Post a clear, multilingual sign: take what you need, leave what you can, no expired/home-canned/raw meat. Add labels and a marker so people can date items.",
        hours: 2,
      },
      {
        name: "Recruit a cleaning and restocking rota",
        description:
          "Make a shared weekly schedule. Each shift is ~15 minutes: wipe surfaces, toss anything spoiled or past-date, and note what's running low. Keep cleaning supplies on site.",
        hours: 2,
      },
      {
        name: "Build supply relationships",
        description:
          "Ask bakeries, grocers, restaurants, and farmers' markets for regular end-of-day donations. Coordinate a pickup volunteer. Track which sources are reliable.",
        hours: 4,
      },
      {
        name: "Spread the word",
        description:
          "Make a small flyer and a map pin/social post. Tell nearby shelters, schools, and clinics it exists. Word of mouth from current users matters most.",
        hours: 3,
      },
      {
        name: "Set up a problem contact",
        description:
          "Put one phone number or email on the fridge for \"fridge is broken / power is out / question.\" Decide who answers it and how fast.",
        hours: 1,
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
    setupHours: 27,
    defaultCategory: "food",
    tasks: [
      {
        name: "Secure land and permission",
        description:
          "Identify a vacant lot, church yard, school ground, or unused park corner. Find the owner (city land records, or just ask). Get a written license or lease, even a one-year handshake-in-writing, and confirm water access.",
        hours: 6,
      },
      {
        name: "Test the soil and plan beds",
        description:
          "Send a cheap soil test to a local extension service to rule out lead/contaminants. If soil is bad, plan raised beds with clean soil. Sketch where beds, paths, and a tool spot will go.",
        hours: 3,
      },
      {
        name: "Gather materials and build",
        description:
          "Collect lumber or use straw-bale/keyhole beds, compost, and mulch. Host a build day; many hands raise beds quickly. Set up a hose or rain barrels.",
        hours: 8,
      },
      {
        name: "Decide the sharing model",
        description:
          "Agree as a group: individual plots, fully communal harvest, or a hybrid. Write down how produce is divided and how decisions get made.",
        hours: 2,
      },
      {
        name: "Plant for your climate and season",
        description:
          "Pick easy, high-yield crops for your zone (greens, beans, squash, tomatoes, herbs). Stagger planting so harvests don't all hit at once. Label rows.",
        hours: 4,
      },
      {
        name: "Set a watering and weeding rota",
        description:
          "Plants die from neglect more than anything. Build a simple shared calendar; tie tasks to easy reminders. Keep it low-commitment so people don't burn out.",
        hours: 2,
      },
      {
        name: "Plan the harvest and surplus",
        description:
          "Decide harvest days. Route extra produce to the community fridge, neighbors, or a free stand at the gate. Save some seeds for next year.",
        hours: 2,
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
    setupHours: 21,
    defaultCategory: "skilled_labor",
    tasks: [
      {
        name: "Find storage and open hours",
        description:
          "A shed, garage, closet at a community center, or shipping container works. Pick 2–4 predictable open hours a week so people know when to come.",
        hours: 3,
      },
      {
        name: "Collect and sort the inventory",
        description:
          "Put out a donation call (people have duplicate drills and ladders everywhere). Clean, test, and label each tool. Discard or repair anything unsafe.",
        hours: 6,
      },
      {
        name: "Catalog everything",
        description:
          "Use a free spreadsheet or lending-library app. Record each item, its condition, and a photo. Number tools so they're easy to track.",
        hours: 4,
      },
      {
        name: "Write borrowing rules",
        description:
          "Set loan length (e.g., one week), how many items at once, and a return/late policy. Keep it forgiving — this is about trust. Note any tool that needs a safety briefing.",
        hours: 2,
      },
      {
        name: "Set up sign-out",
        description:
          "A clipboard or simple form: name, contact, item, date out, due date. Take a quick photo of the tool's condition at checkout to avoid disputes.",
        hours: 2,
      },
      {
        name: "Train your librarians",
        description:
          "Walk volunteers through the catalog, checkout steps, and basic safety (eye protection, ladder use). Have a one-page cheat sheet at the desk.",
        hours: 2,
      },
      {
        name: "Maintain and grow",
        description:
          "Inspect returned tools, sharpen and oil regularly, and track what people request most so you know what to add next.",
        hours: 2,
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
      "A list of volunteers, a way to match them to neighbors, and a check-in routine.",
    setupHours: 18,
    defaultCategory: "emotional_support",
    tasks: [
      {
        name: "Map who's around",
        description:
          "Quietly identify neighbors who might be isolated through word of mouth, building managers, clinics, and faith groups. Never assume need — invite people in, don't single them out.",
        hours: 4,
      },
      {
        name: "Recruit and screen volunteers",
        description:
          "Ask for people who can commit to regular contact. For any in-home visits or help with vulnerable adults, do basic reference checks and never have a volunteer handle a neighbor's money alone.",
        hours: 5,
      },
      {
        name: "Match thoughtfully",
        description:
          "Pair on language, proximity, and comfort. Ask both people what they want — a weekly call, a grocery run, a chat on the porch — and respect that boundary.",
        hours: 2,
      },
      {
        name: "Set a check-in rhythm",
        description:
          "Agree on frequency and method (call, text, knock). Give volunteers a short script for the first contact so it feels warm, not clinical.",
        hours: 1,
      },
      {
        name: "Create an escalation plan",
        description:
          "Decide in advance what to do if someone doesn't answer or seems in crisis: who to call, when to involve family or emergency services, and how to log it. Keep it written and simple.",
        hours: 2,
      },
      {
        name: "Coordinate practical help",
        description:
          "Track recurring needs — rides to appointments, prescription pickups, snow shoveling — and connect them to other volunteers or projects in your program.",
        hours: 2,
      },
      {
        name: "Support the volunteers too",
        description:
          "Hold a check-in for them to debrief. Caring work is draining; rotate tasks and watch for burnout.",
        hours: 2,
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
      "A contact list, a meeting spot, basic supplies, and a communication plan that works without internet.",
    setupHours: 24,
    defaultCategory: "other",
    tasks: [
      {
        name: "Map your neighborhood's risks",
        description:
          "List the disasters most likely where you are. Note vulnerable points: people on the upper floors with no elevator, those on oxygen or refrigerated meds, single-exit buildings.",
        hours: 3,
      },
      {
        name: "Build a contact tree",
        description:
          "Collect opt-in contact info block by block. Designate a few \"block captains\" who each check on ~10 households. Keep a paper copy — phones and internet fail in disasters.",
        hours: 6,
      },
      {
        name: "Plan offline communication",
        description:
          "Decide how you'll reach each other without cell service: door knocks, a meeting spot, whistles, or radios. Print and distribute the plan.",
        hours: 2,
      },
      {
        name: "Stock shared supplies",
        description:
          "Assemble a community kit: water, first aid, flashlights, batteries, a battery/crank radio, blankets, and basic tools. Store it where a few people can access it.",
        hours: 4,
      },
      {
        name: "Identify safe spots",
        description:
          "Find places that could serve as a cooling/warming center or charging point (a hall with a generator, a shaded park). Confirm access ahead of time.",
        hours: 3,
      },
      {
        name: "Run a drill or info night",
        description:
          "Host a session on personal go-bags, shutting off utilities, and the contact tree. Practice once so people aren't learning during the actual emergency.",
        hours: 4,
      },
      {
        name: "Define roles for \"day of\"",
        description:
          "Pre-assign who checks on the medically vulnerable first, who opens the safe spot, and who coordinates. Review and update the plan twice a year.",
        hours: 2,
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
    setupHours: 19,
    defaultCategory: "other",
    tasks: [
      {
        name: "Pick a format and space",
        description:
          "Decide between a standing free store, a recurring pop-up, or a one-day swap. Borrow a hall, storefront, or park pavilion. A recurring date builds habit.",
        hours: 3,
      },
      {
        name: "Set donation standards",
        description:
          "Accept clean, working, usable items only. Post a clear \"yes\" and \"no\" list (no broken electronics, no soiled clothing, no recalled baby gear). This saves enormous sorting time.",
        hours: 1,
      },
      {
        name: "Organize intake and sorting",
        description:
          "Set up stations: receive, sort by category, and stage for display. Have a plan for items you can't use (donate onward or recycle).",
        hours: 4,
      },
      {
        name: "Display so people can browse with dignity",
        description:
          "Hang clothes by size, group household goods, keep it tidy and welcoming. No application, no proof of need — just take what you'll use.",
        hours: 3,
      },
      {
        name: "Staff the event",
        description:
          "Assign greeters, sorters, and someone for questions. A friendly, no-judgment tone is the whole point.",
        hours: 4,
        recurringCadence: "event",
      },
      {
        name: "Handle the leftovers",
        description:
          "Pre-arrange where unclaimed items go after each event (a partner charity, textile recycling) so the space resets clean.",
        hours: 2,
      },
      {
        name: "Promote and repeat",
        description:
          "Flyer locally, post the next date, and ask attendees to spread the word. Consistency turns a one-off into a reliable resource.",
        hours: 2,
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
    setupHours: 16,
    defaultCategory: "education",
    tasks: [
      {
        name: "Survey skills and interests",
        description:
          "Ask members two questions: what could you teach, and what would you love to learn? Collect answers in a simple form. The overlap is your curriculum.",
        hours: 2,
      },
      {
        name: "Recruit and prep teachers",
        description:
          "Reassure people that \"teaching\" can be informal. Help them outline a one-hour session and gather any materials. Pair nervous first-timers with a co-host.",
        hours: 4,
      },
      {
        name: "Find space and time",
        description:
          "Use a library room, community center, park, or someone's living room. Pick recurring slots so it becomes routine.",
        hours: 2,
      },
      {
        name: "Build a schedule",
        description:
          "List sessions with date, topic, teacher, and what to bring. Publish it where members already look. Keep sign-ups light or drop-in.",
        hours: 2,
      },
      {
        name: "Gather materials",
        description:
          "Note what each class needs and source it through donations or a tiny shared budget. Keep reusable kits for popular classes.",
        hours: 2,
      },
      {
        name: "Make it accessible",
        description:
          "Consider language needs, childcare, physical access, and timing for people who work. Ask attendees what would help them come.",
        hours: 2,
      },
      {
        name: "Capture and pass on knowledge",
        description:
          "Take notes or short handouts so a class can be re-run by someone new. This keeps the project alive when a teacher moves on.",
        hours: 2,
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
    tasks: [
      {
        name: "Gather your buying group",
        description:
          "Recruit enough households to hit supplier minimums (often 8–15). Agree on a buying cycle (weekly, biweekly, monthly).",
        hours: 4,
      },
      {
        name: "Find a supplier",
        description:
          "Contact food wholesalers, farm co-ops, restaurant suppliers, or buying clubs. Compare minimum orders, delivery options, and prices. Confirm what staples they carry.",
        hours: 4,
      },
      {
        name: "Set up ordering",
        description:
          "Use a shared spreadsheet or form where members enter quantities by the cutoff. Designate one coordinator to total and place the order.",
        hours: 3,
      },
      {
        name: "Handle money transparently",
        description:
          "Decide payment up front (collect before ordering to avoid fronting cash). Track every dollar in a shared ledger. Add a tiny optional buffer for spillage, not profit.",
        hours: 2,
      },
      {
        name: "Arrange delivery and a sort space",
        description:
          "Pick a spot to receive the bulk delivery — a garage, hall, or driveway. Schedule enough hands for unloading day.",
        hours: 3,
      },
      {
        name: "Split orders fairly",
        description:
          "Set up sorting stations with scales for bulk grains/produce. Pre-print each household's list. Double-check before pickup.",
        hours: 3,
        recurringCadence: "cycle",
      },
      {
        name: "Rotate the work",
        description:
          "Coordinating, sorting, and pickup duties should rotate so no one person carries it all. Review pricing and supplier reliability each cycle.",
        hours: 1,
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
    setupHours: 16,
    defaultCategory: "skilled_labor",
    tasks: [
      {
        name: "Recruit fixers by specialty",
        description:
          "Find people good with sewing, small electronics, bikes, appliances, and woodwork. You only need one or two per category to start.",
        hours: 4,
      },
      {
        name: "Set up repair stations",
        description:
          "Each station needs a table, the right tools, good light, and power. Group similar repairs together. Label stations clearly.",
        hours: 3,
      },
      {
        name: "Schedule a recurring date",
        description:
          "Monthly works well. Pick a steady venue — library, makerspace, community hall — so people know where to bring things.",
        hours: 2,
      },
      {
        name: "Create an intake flow",
        description:
          "A greeter logs each visitor and item, then routes them to the right fixer. Set the expectation: visitors stay and help with their own repair when they can; it's a learning space, not a drop-off.",
        hours: 2,
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
      },
      {
        name: "Track impact and follow up",
        description:
          "Count items fixed and roughly what was saved/diverted. Share the numbers — it motivates volunteers and helps with any future funding.",
        hours: 1,
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
      "Volunteer drivers, a request/dispatch method, and clear safety and insurance ground rules.",
    setupHours: 18,
    defaultCategory: "transport",
    tasks: [
      {
        name: "Recruit and vet drivers",
        description:
          "Confirm each driver has a valid license, insurance, and a safe vehicle. For rides with vulnerable people, do reference or background checks per your local norms.",
        hours: 5,
      },
      {
        name: "Sort out insurance and liability",
        description:
          "Check what each driver's personal insurance covers for volunteer driving. Consider a simple waiver and consult a local legal aid clinic — this protects everyone.",
        hours: 4,
      },
      {
        name: "Set up a request system",
        description:
          "Pick one channel for ride requests (phone line, form, group chat) with a lead time (e.g., 48 hours). Capture pickup time, locations, mobility needs, and contact info.",
        hours: 2,
      },
      {
        name: "Build a dispatch routine",
        description:
          "Have one coordinator (rotating) match requests to available drivers and confirm with both sides the day before. Keep a backup driver list for cancellations.",
        hours: 2,
      },
      {
        name: "Define what's covered",
        description:
          "Decide which trips qualify (medical, groceries, essential errands) and your service area. Be clear about wait times and whether drivers help carry bags.",
        hours: 1,
      },
      {
        name: "Handle costs",
        description:
          "Decide how gas is covered — a small shared fund, optional rider contributions, or nothing. Keep it transparent and never let it become a barrier for the rider.",
        hours: 2,
      },
      {
        name: "Keep riders and drivers safe",
        description:
          "Set norms: drivers don't enter homes alone, no handling of money beyond agreed costs, and a check-in after rides with vulnerable people. Log each ride.",
        hours: 2,
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
    setupHours: 26,
    defaultCategory: "organizing",
    tasks: [
      {
        name: "Recruit a core organizing committee",
        description:
          "Find 3–6 committed tenants to anchor the work. Look for people respected in their buildings. Agree on roles, a meeting rhythm, and shared goals.",
        hours: 4,
      },
      {
        name: "Map buildings and tenant issues",
        description:
          "Door-knock or survey to learn which buildings have problems and what they are (repairs ignored, illegal fees, harassment). Track patterns and find natural leaders in each building.",
        hours: 5,
      },
      {
        name: "Gather accurate local tenant-rights information",
        description:
          "Compile your area's actual laws on eviction notice periods, repairs, deposits, and rent rules. Partner with a legal aid clinic to verify it. This is shared information, not legal advice — make that clear to members.",
        hours: 4,
      },
      {
        name: "Build a rapid-response contact system",
        description:
          "Set up a phone tree or group chat so a tenant getting an eviction notice or lockout can reach the union fast. Decide who responds and how quickly.",
        hours: 3,
      },
      {
        name: "Host a know-your-rights workshop",
        description:
          "Run a session (ideally with a legal aid partner) walking tenants through their rights and what to do if served papers. Provide printed take-home guides in relevant languages.",
        hours: 4,
      },
      {
        name: "Set up an eviction-response protocol",
        description:
          "Write a simple step-by-step for when someone faces eviction: document everything, contact legal aid by the deadline, organize neighbor support, and never ignore court dates.",
        hours: 3,
      },
      {
        name: "Connect to legal aid and ongoing support",
        description:
          "Build a referral relationship with tenant lawyers, legal aid, and housing counselors so the union can hand off cases that need professional help. Keep contacts current.",
        hours: 3,
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
    setupHours: 26,
    defaultCategory: "childcare",
    tasks: [
      {
        name: "Gather founding families and agree on a model",
        description:
          "Recruit families who know or can build trust with each other. Decide the model: a rotating babysitting co-op where parents earn and spend care credits, or scheduled group care.",
        hours: 4,
      },
      {
        name: "Set safety and vetting standards",
        description:
          "Agree on screening for anyone caring for children: references, background checks where appropriate, and a firm rule that no single adult is ever alone with another family's child unaccounted for. Set adult-to-child ratios.",
        hours: 5,
      },
      {
        name: "Find and child-proof a space",
        description:
          "Choose a venue or set standards for host homes. Check for hazards, cover outlets, secure heavy furniture, lock away medicines and chemicals, and confirm a safe outdoor area if used.",
        hours: 4,
      },
      {
        name: "Create a scheduling and credit system",
        description:
          "Use a shared calendar or co-op app. In a credit model, one hour of care earns one hour owed. Track who's hosting when so the load stays fair.",
        hours: 3,
      },
      {
        name: "Set health, allergy, and emergency policies",
        description:
          "Collect allergy info, medications, emergency contacts, and pickup authorizations for each child. Write a clear sick-child policy and what to do in a medical emergency.",
        hours: 3,
      },
      {
        name: "Train caregivers on basics",
        description:
          "Cover supervision, safe sleep for infants, allergy and emergency response, and the safety rules. Encourage at least one pediatric first-aid/CPR-certified adult per session.",
        hours: 4,
      },
      {
        name: "Run a trial session and gather feedback",
        description:
          "Hold a short pilot with a few families, then debrief. Fix what didn't work before scaling. Check in regularly so trust and safety stay strong.",
        hours: 3,
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
    setupHours: 20,
    defaultCategory: "infrastructure",
    tasks: [
      {
        name: "Find a composting site",
        description:
          "Secure a spot with space and some sun — a community garden corner, vacant lot, or willing backyard. Confirm permission and check local rules on composting.",
        hours: 4,
      },
      {
        name: "Choose a composting method",
        description:
          "Pick what fits your scale: a three-bin hot-compost system, tumblers, or worm bins. Match the method to how much material you expect and how much turning you can manage.",
        hours: 3,
      },
      {
        name: "Source bins and equipment",
        description:
          "Build or buy collection bins and the composting structure. Gather a pitchfork, thermometer, and brown material (leaves, cardboard) to balance the food scraps.",
        hours: 4,
      },
      {
        name: "Set up a collection system",
        description:
          "Decide how scraps arrive: a drop-off bin with set hours, or a volunteer pickup route. Give participants small countertop pails and a clear drop schedule.",
        hours: 4,
      },
      {
        name: "Make clear what's accepted",
        description:
          "Post a simple yes/no list (yes: fruit, veg, coffee, eggshells; no: meat, dairy, oils, pet waste). Clear signage prevents contamination that ruins a batch.",
        hours: 2,
      },
      {
        name: "Recruit and train a maintenance rota",
        description:
          "Compost needs regular turning, moisture checks, and balancing greens and browns. Build a shared schedule and teach volunteers the basics so piles don't smell or stall.",
        hours: 3,
      },
      {
        name: "Distribute finished compost",
        description:
          "Once compost is ready, share it free with contributors and community gardens. Announce pickup days and bring bags or buckets.",
        hours: 2,
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
    setupHours: 16,
    defaultCategory: "education",
    tasks: [
      {
        name: "Build or get a weatherproof book box",
        description:
          "Make or buy a sturdy, waterproof box on a post or wall. A repurposed cabinet or newspaper box works. Add a clear door and a sloped roof so books stay dry.",
        hours: 5,
      },
      {
        name: "Choose and prep a location",
        description:
          "Pick a spot with foot traffic and permission — your own front yard, a community center, or a park edge. Anchor the box firmly and confirm it's allowed.",
        hours: 2,
      },
      {
        name: "Stock the initial collection",
        description:
          "Gather donated books through a small drive. Aim for a mix: children's books, popular fiction, and practical nonfiction. Start it half-full so there's room to add.",
        hours: 3,
      },
      {
        name: "Add a sign and simple norms",
        description:
          "Post \"Take a book, leave a book — all free.\" Keep it welcoming and rule-light. Add a note inviting all ages and languages.",
        hours: 1,
      },
      {
        name: "Recruit a steward",
        description:
          "Ask someone nearby to check the box weekly: tidy it, remove anything damaged or inappropriate, and rebalance the stock. Five minutes a week keeps it healthy.",
        hours: 1,
      },
      {
        name: "Curate for the community",
        description:
          "Stock books that fit your neighborhood — multiple languages, children's books if there are families, practical guides. Quietly remove worn or unsuitable items.",
        hours: 2,
      },
      {
        name: "Promote and connect to literacy efforts",
        description:
          "Tell schools, the local library, and neighbors it exists. Consider tie-ins like a summer reading nudge or themed restocks.",
        hours: 2,
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
    setupHours: 18,
    defaultCategory: "education",
    tasks: [
      {
        name: "Partner with certified trainers",
        description:
          "Connect with qualified instructors — the Red Cross, your local health department, or a harm-reduction organization. They deliver the actual medical training; your role is to organize and host it.",
        hours: 4,
      },
      {
        name: "Source supplies",
        description:
          "Obtain first-aid kits, CPR practice mannequins (often loaned by trainers), and naloxone. Many public health programs distribute naloxone free — ask your health department or harm-reduction groups.",
        hours: 4,
      },
      {
        name: "Find space and schedule sessions",
        description:
          "Book a room that fits hands-on practice — a community center, library, or clinic. Set recurring dates so people can plan around work.",
        hours: 3,
      },
      {
        name: "Recruit participants",
        description:
          "Promote sessions widely and prioritize people likely to witness emergencies. Keep sign-up easy and free, and offer varied times for shift workers.",
        hours: 3,
      },
      {
        name: "Run the training sessions",
        description:
          "Host the trainer-led sessions, handle setup and check-in, and make sure everyone gets hands-on practice. Provide take-home reference cards.",
        hours: 4,
        recurringCadence: "session",
      },
      {
        name: "Distribute kits and refreshers",
        description:
          "Send trained people home with a first-aid kit and naloxone where available. Schedule periodic refreshers so skills stay sharp.",
        hours: 2,
      },
      {
        name: "Track trained responders and restock",
        description:
          "Keep an opt-in list of trained neighbors and where supplies are kept. Replace used or expired naloxone and kit contents.",
        hours: 2,
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
    setupHours: 21,
    defaultCategory: "organizing",
    tasks: [
      {
        name: "Recruit founding members and inventory skills",
        description:
          "Gather an initial group and ask each what they can offer (rides, tutoring, repairs, cooking, gardening) and what they need. The variety of offers is what makes it work.",
        hours: 4,
      },
      {
        name: "Choose a tracking system",
        description:
          "Pick a way to log hours: dedicated time-bank software, a shared spreadsheet, or a simple ledger. It must record who gave and received hours.",
        hours: 3,
      },
      {
        name: "Set the rules",
        description:
          "Agree on the core principle (one hour = one credit, regardless of the task), how members request and confirm exchanges, and what happens if someone's balance runs low.",
        hours: 3,
      },
      {
        name: "Onboard members",
        description:
          "Hold a short orientation so people understand the philosophy and the system. Give everyone a few starter credits so exchanges can begin immediately.",
        hours: 3,
      },
      {
        name: "Launch a service directory",
        description:
          "Publish a searchable list of who offers what. Keep it current so members can find help without asking the coordinator every time.",
        hours: 3,
      },
      {
        name: "Coordinate and broker exchanges",
        description:
          "Have a coordinator help match needs to offers, especially early on, and nudge quiet members. Over time members connect directly.",
        hours: 2,
      },
      {
        name: "Build trust and safety practices",
        description:
          "Set norms for exchanges involving homes or vulnerable members (references, not meeting alone where uncomfortable). Add a simple way to flag problems.",
        hours: 3,
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
    tasks: [
      {
        name: "Form a small stewardship team",
        description:
          "Recruit a few trusted people to manage the fund. Define roles clearly and commit to transparency from day one — trust is everything here.",
        hours: 3,
      },
      {
        name: "Set up transparent money handling",
        description:
          "Open a dedicated account or use a fiscal sponsor. Require two people to approve payouts, keep a clear ledger, and check whether your structure has tax or legal implications — consult a local nonprofit resource or accountant.",
        hours: 5,
      },
      {
        name: "Define request and disbursement criteria",
        description:
          "Decide who's eligible, typical amounts, how often someone can request, and whether it's first-come or need-weighted. Keep barriers low and avoid requiring proof of hardship where you can.",
        hours: 4,
      },
      {
        name: "Create a simple, low-barrier request form",
        description:
          "Build a short, private form asking only what's necessary. Offer multiple ways to apply (online, phone, in person) and protect applicants' privacy.",
        hours: 2,
      },
      {
        name: "Set up fundraising",
        description:
          "Combine recurring small donations from members with occasional drives. Be clear with donors that funds go directly to neighbors in need.",
        hours: 4,
      },
      {
        name: "Build a decision and payout process",
        description:
          "Set a turnaround time, a quick review by the team, and fast payout methods. Speed matters in a crisis. Document each decision simply.",
        hours: 3,
      },
      {
        name: "Report back transparently",
        description:
          "Share regular summaries — money in, money out, number of neighbors helped — without exposing recipients' identities. Transparency keeps donors giving.",
        hours: 2,
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
    setupHours: 17,
    defaultCategory: "mutual_aid_drive",
    tasks: [
      {
        name: "Find storage and a distribution point",
        description:
          "Secure dry, secure storage and a place to hand items out — a closet at a clinic, church, or community center. The distribution spot should feel private and dignified.",
        hours: 3,
      },
      {
        name: "Set up supply sourcing",
        description:
          "Combine bulk buying, donation drives, and connections to diaper-bank networks or wholesalers. Track which sources are steady so you don't run dry.",
        hours: 4,
      },
      {
        name: "Sort and inventory by size and type",
        description:
          "Organize diapers by size, plus period products and hygiene items. Keep a running count so you know what to request. Sizes for older babies often run short.",
        hours: 3,
      },
      {
        name: "Set a fair distribution policy",
        description:
          "Decide how much each family gets and how often, with no proof-of-need barrier. Make it predictable so people can rely on it.",
        hours: 2,
      },
      {
        name: "Schedule distribution and staff it",
        description:
          "Set regular distribution days, recruit volunteers to hand out supplies, and keep the tone warm and judgment-free.",
        hours: 4,
        recurringCadence: "event",
      },
      {
        name: "Run supply drives",
        description:
          "Hold periodic drives at schools, workplaces, and faith groups. Give a specific wish list (especially larger diaper sizes and period products) so donations match needs.",
        hours: 3,
      },
      {
        name: "Track needs and restock",
        description:
          "Watch which items move fastest and reorder ahead of shortages. Note recurring gaps to guide your next drive or bulk order.",
        hours: 2,
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
    setupHours: 23,
    defaultCategory: "transport",
    tasks: [
      {
        name: "Find a workshop space",
        description:
          "Secure a garage, basement, shipping container, or shared community space with room to work and store bikes. Confirm access and any insurance needs.",
        hours: 4,
      },
      {
        name: "Gather tools and a workstand",
        description:
          "Collect a basic bike toolkit and at least one repair stand through donations or a small budget. Organize tools so they're easy to find and return.",
        hours: 5,
      },
      {
        name: "Collect donated bikes and parts",
        description:
          "Put out calls for unused bikes and salvageable parts. Sort into \"fixable,\" \"for parts,\" and \"ready to ride.\" A parts stockpile is what keeps the workshop running.",
        hours: 4,
      },
      {
        name: "Recruit volunteer mechanics",
        description:
          "Find a few people who can fix bikes and, more importantly, teach others. The goal is helping people learn to repair their own, not doing it for them.",
        hours: 3,
      },
      {
        name: "Set open hours and an earn-a-bike model",
        description:
          "Pick predictable open hours. Consider an earn-a-bike program where someone learns repair skills over a few sessions and leaves with a bike they fixed themselves.",
        hours: 3,
      },
      {
        name: "Establish safety practices",
        description:
          "Require eye protection, set rules for tool use, and have a first-aid kit. Always do a safety check (brakes, tires, headset) before any bike leaves.",
        hours: 2,
      },
      {
        name: "Promote and track repairs and bikes given",
        description:
          "Spread the word through schools, shelters, and transit-poor areas. Count repairs done and bikes rehomed — useful for volunteers' morale and any future funding.",
        hours: 2,
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
    setupHours: 25,
    defaultCategory: "other",
    tasks: [
      {
        name: "Recruit bilingual and multilingual volunteers",
        description:
          "Find volunteers who speak the languages common in your area and can help with translation, forms, and accompaniment. Match languages to actual local needs.",
        hours: 4,
      },
      {
        name: "Map local services and partners",
        description:
          "Build a directory of clinics, schools, legal aid, ESL classes, food resources, and immigrant-serving organizations. Newcomers often just need to know what exists and how to reach it.",
        hours: 5,
      },
      {
        name: "Build a request and matching system",
        description:
          "Create a simple way for newcomers to ask for help and get matched to a volunteer by language and need. Offer phone and in-person options, not just online.",
        hours: 3,
      },
      {
        name: "Create orientation materials",
        description:
          "Put together plain-language guides in relevant languages covering transit, schools, healthcare, and rights. Use visuals so they work across literacy levels.",
        hours: 4,
      },
      {
        name: "Offer accompaniment for appointments",
        description:
          "Arrange for volunteers to go with people to medical, school, or service appointments to interpret and support. Brief volunteers to interpret faithfully, not to give advice they're not qualified for.",
        hours: 3,
      },
      {
        name: "Host welcome gatherings",
        description:
          "Hold regular informal events where newcomers meet each other and longtime residents. Connection and belonging matter as much as paperwork.",
        hours: 3,
      },
      {
        name: "Set privacy and safety practices",
        description:
          "Collect the minimum information needed and never ask for or record immigration status. Store data securely and train volunteers to handle sensitive situations with discretion.",
        hours: 3,
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
    setupHours: 23,
    defaultCategory: "food",
    tasks: [
      {
        name: "Encuentra un sitio anfitrión con electricidad y tránsito de gente",
        description:
          "Acércate a pequeños negocios, iglesias, clínicas o centros comunitarios. Pregunta si dejan colocar un refrigerador bajo su alero y enchufarlo (la electricidad suele costar unos pocos dólares al mes — ofrece cubrirlo). Consigue un sí por escrito, aunque sea sencillo.",
        hours: 3,
      },
      {
        name: "Consigue un refrigerador y un refugio resistente al clima",
        description:
          "Pide un refrigerador en buen estado en grupos locales. Construye o consigue un mueble o cobertizo de madera sencillo a su alrededor para protegerlo de la lluvia y el sol. Ánclalo para que no se vuelque. Incluye buscarlo, transportarlo y armar el refugio.",
        hours: 8,
      },
      {
        name: "Define las reglas y etiqueta todo",
        description:
          "Coloca un cartel claro y multilingüe: toma lo que necesites, deja lo que puedas, nada caducado, ni conservas caseras, ni carne cruda. Añade etiquetas y un marcador para que la gente pueda anotar la fecha en los productos.",
        hours: 2,
      },
      {
        name: "Arma una rotación de limpieza y reabastecimiento",
        description:
          "Crea un calendario semanal compartido. Cada turno son unos 15 minutos: limpia las superficies, retira lo dañado o vencido y anota lo que se está acabando. Mantén productos de limpieza en el sitio.",
        hours: 2,
      },
      {
        name: "Construye relaciones con quienes donan",
        description:
          "Pide a panaderías, tiendas, restaurantes y mercados de productores donaciones regulares al final del día. Coordina a una persona voluntaria para recogerlas. Lleva nota de qué fuentes son confiables.",
        hours: 4,
      },
      {
        name: "Corre la voz",
        description:
          "Haz un pequeño volante y un punto en el mapa o una publicación en redes. Cuéntales a refugios, escuelas y clínicas cercanas que existe. El boca a boca de quienes ya lo usan es lo que más importa.",
        hours: 3,
      },
      {
        name: "Establece un contacto para problemas",
        description:
          "Pon un teléfono o correo en el refrigerador para avisos como \"se descompuso / no hay luz / una pregunta\". Decide quién responde y en cuánto tiempo.",
        hours: 1,
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
    setupHours: 27,
    defaultCategory: "food",
    tasks: [
      {
        name: "Asegura el terreno y el permiso",
        description:
          "Identifica un lote baldío, un patio de iglesia, un terreno escolar o una esquina de parque sin uso. Encuentra a quien sea dueña o dueño (registros municipales, o simplemente pregunta). Consigue un permiso o contrato por escrito, aunque sea un acuerdo de un año estrechado por escrito, y confirma el acceso al agua.",
        hours: 6,
      },
      {
        name: "Analiza el suelo y planea las camas",
        description:
          "Envía una prueba de suelo económica a un servicio de extensión local para descartar plomo u otros contaminantes. Si el suelo está mal, planea camas elevadas con tierra limpia. Esboza dónde irán camas, caminos y un rincón de herramientas.",
        hours: 3,
      },
      {
        name: "Reúne materiales y construye",
        description:
          "Junta madera o usa camas de pacas de paja o tipo \"keyhole\", composta y mantillo. Organiza un día de construcción; muchas manos levantan camas rápido. Instala una manguera o barriles de lluvia.",
        hours: 8,
      },
      {
        name: "Decidan cómo se comparte",
        description:
          "Acuerden en grupo: parcelas individuales, cosecha completamente comunal, o una mezcla. Pongan por escrito cómo se reparte lo cosechado y cómo se toman las decisiones.",
        hours: 2,
      },
      {
        name: "Siembra según el clima y la temporada",
        description:
          "Elige cultivos fáciles y de buen rendimiento para tu zona (verduras de hoja, frijoles, calabaza, tomate, hierbas). Escalona las siembras para que las cosechas no caigan todas al mismo tiempo. Etiqueta los surcos.",
        hours: 4,
      },
      {
        name: "Organiza una rotación de riego y deshierbe",
        description:
          "Las plantas mueren más por descuido que por otra cosa. Arma un calendario compartido sencillo; liga las tareas a recordatorios fáciles. Mantén el compromiso ligero para que nadie se queme.",
        hours: 2,
      },
      {
        name: "Planea la cosecha y los excedentes",
        description:
          "Decidan los días de cosecha. Manden lo que sobre al refrigerador comunitario, a vecinas y vecinos o a un puesto gratuito en la entrada. Guarden algunas semillas para el año siguiente.",
        hours: 2,
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
    setupHours: 21,
    defaultCategory: "skilled_labor",
    tasks: [
      {
        name: "Encuentra dónde guardar y un horario de atención",
        description:
          "Sirve una caseta, una cochera, un clóset en un centro comunitario o un contenedor. Elige de 2 a 4 horas fijas a la semana para que la gente sepa cuándo ir.",
        hours: 3,
      },
      {
        name: "Reúne y ordena el inventario",
        description:
          "Haz una convocatoria de donaciones (la gente tiene taladros y escaleras duplicados por todos lados). Limpia, prueba y etiqueta cada herramienta. Descarta o repara lo que esté inseguro.",
        hours: 6,
      },
      {
        name: "Cataloga todo",
        description:
          "Usa una hoja de cálculo gratuita o una app de biblioteca de préstamos. Registra cada artículo, su estado y una foto. Numera las herramientas para que sea fácil seguirles la pista.",
        hours: 4,
      },
      {
        name: "Escribe las reglas de préstamo",
        description:
          "Define el plazo (por ejemplo, una semana), cuántas piezas a la vez y la política de devolución o retraso. Que sea flexible — esto se trata de confianza. Anota qué herramientas requieren una breve explicación de seguridad.",
        hours: 2,
      },
      {
        name: "Arma el registro de salida",
        description:
          "Una tablilla o un formulario sencillo: nombre, contacto, artículo, fecha de salida, fecha de devolución. Toma una foto rápida del estado de la herramienta al salir para evitar disputas.",
        hours: 2,
      },
      {
        name: "Capacita a quienes atienden",
        description:
          "Lleva a las personas voluntarias por el catálogo, los pasos de préstamo y la seguridad básica (lentes de protección, uso de escaleras). Ten una hoja de referencia de una sola página en el mostrador.",
        hours: 2,
      },
      {
        name: "Mantén y haz crecer la biblioteca",
        description:
          "Revisa las herramientas devueltas, afila y aceita con regularidad, y observa qué piden más para saber qué sumar después.",
        hours: 2,
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
      "Una lista de personas voluntarias, una forma de emparejarlas con quienes necesitan compañía y una rutina de contacto.",
    setupHours: 18,
    defaultCategory: "emotional_support",
    tasks: [
      {
        name: "Identifica quién vive cerca",
        description:
          "Con discreción, identifica a personas que puedan estar aisladas, por boca a boca, administración de edificios, clínicas y grupos religiosos. Nunca des por hecho la necesidad — invita, no señales.",
        hours: 4,
      },
      {
        name: "Convoca y filtra a las personas voluntarias",
        description:
          "Busca a quienes puedan comprometerse a un contacto regular. Para visitas en casa o apoyo a personas adultas vulnerables, haz revisiones básicas de referencias y nunca dejes que una sola persona voluntaria maneje el dinero de alguien.",
        hours: 5,
      },
      {
        name: "Empareja con cuidado",
        description:
          "Empareja por idioma, cercanía y comodidad. Pregúntale a cada parte qué desea — una llamada semanal, una vuelta al súper, una charla en el portal — y respeta ese límite.",
        hours: 2,
      },
      {
        name: "Define un ritmo de contacto",
        description:
          "Acuerden la frecuencia y el medio (llamada, mensaje, tocar la puerta). Dale a las personas voluntarias un guion corto para el primer contacto para que se sienta cálido, no clínico.",
        hours: 1,
      },
      {
        name: "Crea un plan de escalamiento",
        description:
          "Decide de antemano qué hacer si alguien no responde o parece estar en crisis: a quién llamar, cuándo involucrar a familia o a servicios de emergencia y cómo registrarlo. Mantenlo por escrito y sencillo.",
        hours: 2,
      },
      {
        name: "Coordina apoyo práctico",
        description:
          "Lleva nota de necesidades recurrentes — traslados a citas, recoger recetas, palear nieve — y conéctalas con otras personas voluntarias o proyectos de tu red.",
        hours: 2,
      },
      {
        name: "Cuida también a quienes acompañan",
        description:
          "Organiza un espacio de desahogo para las personas voluntarias. El trabajo de cuidado desgasta; rota tareas y atiende las señales de agotamiento.",
        hours: 2,
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
      "Una lista de contactos, un punto de encuentro, insumos básicos y un plan de comunicación que funcione sin internet.",
    setupHours: 24,
    defaultCategory: "other",
    tasks: [
      {
        name: "Mapea los riesgos de tu vecindario",
        description:
          "Enumera los desastres más probables en tu zona. Anota puntos vulnerables: personas en pisos altos sin ascensor, quienes usan oxígeno o medicamentos refrigerados, edificios con una sola salida.",
        hours: 3,
      },
      {
        name: "Arma un árbol de contactos",
        description:
          "Junta datos de contacto, manzana por manzana, con consentimiento. Designa varias \"jefas\" o \"jefes\" de cuadra que revisen unos 10 hogares cada quien. Guarda una copia en papel — los teléfonos e internet fallan en los desastres.",
        hours: 6,
      },
      {
        name: "Planea comunicación sin internet",
        description:
          "Decidan cómo se comunicarán sin señal celular: tocar puertas, un punto de encuentro, silbatos o radios. Imprime y reparte el plan.",
        hours: 2,
      },
      {
        name: "Junta insumos compartidos",
        description:
          "Arma un kit comunitario: agua, primeros auxilios, linternas, baterías, un radio de pilas o manivela, cobijas y herramientas básicas. Guárdalo donde varias personas tengan acceso.",
        hours: 4,
      },
      {
        name: "Identifica lugares seguros",
        description:
          "Encuentra sitios que puedan servir como centro de enfriamiento o calefacción, o de carga eléctrica (un salón con generador, un parque con sombra). Confirma el acceso con anticipación.",
        hours: 3,
      },
      {
        name: "Hagan un simulacro o una noche informativa",
        description:
          "Organiza una sesión sobre mochilas de emergencia, cómo cerrar servicios y el árbol de contactos. Practiquen una vez para no estar aprendiendo durante la emergencia real.",
        hours: 4,
      },
      {
        name: "Define los roles para \"el día de\"",
        description:
          "Asigna por adelantado quién revisa primero a quienes son médicamente vulnerables, quién abre el espacio seguro y quién coordina. Revisen y actualicen el plan dos veces al año.",
        hours: 2,
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
    setupHours: 19,
    defaultCategory: "other",
    tasks: [
      {
        name: "Elige el formato y el espacio",
        description:
          "Decidan entre una tienda gratis permanente, una recurrente tipo pop-up o un intercambio de un solo día. Pidan prestado un salón, un local o un quiosco en un parque. Una fecha que se repite crea hábito.",
        hours: 3,
      },
      {
        name: "Define qué se acepta como donación",
        description:
          "Acepten solo cosas limpias, funcionales y usables. Publica una lista clara de \"sí\" y \"no\" (sin aparatos descompuestos, sin ropa manchada, sin artículos de bebé retirados del mercado). Esto ahorra muchísimo tiempo de clasificación.",
        hours: 1,
      },
      {
        name: "Organiza recepción y clasificación",
        description:
          "Arma estaciones: recibir, clasificar por categoría y preparar para exhibir. Ten un plan para lo que no puedan usar (donar a otra parte o reciclar).",
        hours: 4,
      },
      {
        name: "Exhibe para que la gente elija con dignidad",
        description:
          "Cuelga la ropa por talla, agrupa los artículos del hogar, mantén el espacio ordenado y acogedor. Sin solicitud, sin pruebas de necesidad — solo toma lo que vayas a usar.",
        hours: 3,
      },
      {
        name: "Cubran el evento",
        description:
          "Asigna a personas que reciban, clasifiquen y respondan preguntas. Un trato amable, sin juicios, es todo el punto.",
        hours: 4,
        recurringCadence: "event",
      },
      {
        name: "Gestiona lo que sobra",
        description:
          "Acuerden con anticipación a dónde van los artículos que nadie tomó tras cada evento (una organización aliada, reciclaje textil) para que el espacio quede limpio.",
        hours: 2,
      },
      {
        name: "Difunde y repite",
        description:
          "Reparte volantes en tu zona, publica la próxima fecha y pide a quienes asistieron que corran la voz. La constancia convierte un evento aislado en un recurso confiable.",
        hours: 2,
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
    setupHours: 16,
    defaultCategory: "education",
    tasks: [
      {
        name: "Pregunta por saberes e intereses",
        description:
          "Hazles dos preguntas a las personas integrantes: ¿qué podrías enseñar? y ¿qué te encantaría aprender? Reúne las respuestas en un formulario sencillo. Donde se cruzan está tu programa.",
        hours: 2,
      },
      {
        name: "Convoca y acompaña a quienes enseñan",
        description:
          "Recuérdales que \"enseñar\" puede ser informal. Ayúdales a esbozar una sesión de una hora y reunir materiales. Empareja a quien dé clase por primera vez con alguien que la acompañe.",
        hours: 4,
      },
      {
        name: "Encuentra espacio y horario",
        description:
          "Usa una sala de biblioteca, un centro comunitario, un parque o la sala de alguien. Elige horarios recurrentes para que se vuelva rutina.",
        hours: 2,
      },
      {
        name: "Arma un calendario",
        description:
          "Lista las sesiones con fecha, tema, persona que enseña y qué llevar. Publícalo donde la gente ya mira. Mantén la inscripción ligera o de entrada libre.",
        hours: 2,
      },
      {
        name: "Reúne materiales",
        description:
          "Anota qué necesita cada clase y consíguelo con donaciones o con un pequeño fondo común. Guarda kits reutilizables para las clases más populares.",
        hours: 2,
      },
      {
        name: "Hazlo accesible",
        description:
          "Considera necesidades de idioma, cuidado de infancias, acceso físico y horarios para personas que trabajan. Pregúntales a quienes asisten qué les ayudaría a llegar.",
        hours: 2,
      },
      {
        name: "Recoge y transmite el conocimiento",
        description:
          "Toma notas o haz pequeños folletos para que alguien nuevo pueda volver a dar la clase. Eso mantiene viva la iniciativa cuando una persona que enseña se va.",
        hours: 2,
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
    tasks: [
      {
        name: "Junta a tu grupo de compra",
        description:
          "Reúne suficientes hogares para llegar al mínimo del proveedor (suelen ser entre 8 y 15). Acuerden un ciclo de compra (semanal, quincenal, mensual).",
        hours: 4,
      },
      {
        name: "Encuentra a un proveedor",
        description:
          "Contacta mayoristas de alimentos, cooperativas de productoras y productores, proveedores de restaurantes o clubes de compra. Compara mínimos de pedido, opciones de entrega y precios. Confirma qué básicos manejan.",
        hours: 4,
      },
      {
        name: "Arma el sistema de pedidos",
        description:
          "Usen una hoja de cálculo o un formulario donde cada hogar anote sus cantidades antes de la fecha de cierre. Designa a una persona que sume y haga el pedido.",
        hours: 3,
      },
      {
        name: "Maneja el dinero con transparencia",
        description:
          "Cobren por adelantado (antes de hacer el pedido para no andar adelantando efectivo). Lleven cada peso en un libro compartido. Sumen un pequeño colchón opcional para mermas, no para ganancia.",
        hours: 2,
      },
      {
        name: "Organiza entrega y espacio de clasificación",
        description:
          "Elijan un lugar para recibir el pedido a granel — una cochera, un salón, una entrada. Programen suficientes manos para el día de descarga.",
        hours: 3,
      },
      {
        name: "Reparte los pedidos con justicia",
        description:
          "Pongan estaciones de clasificación con básculas para granos y verduras a granel. Imprime la lista de cada hogar de antemano. Revisen dos veces antes de la entrega.",
        hours: 3,
        recurringCadence: "cycle",
      },
      {
        name: "Roten el trabajo",
        description:
          "La coordinación, la clasificación y la recogida deben rotar para que ninguna persona cargue con todo. Revisen los precios y la confiabilidad del proveedor cada ciclo.",
        hours: 1,
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
    setupHours: 16,
    defaultCategory: "skilled_labor",
    tasks: [
      {
        name: "Convoca a quienes reparan, por especialidad",
        description:
          "Busca a personas buenas para coser, electrónica pequeña, bicis, electrodomésticos y carpintería. Solo necesitas una o dos por categoría para empezar.",
        hours: 4,
      },
      {
        name: "Arma estaciones de reparación",
        description:
          "Cada estación necesita una mesa, las herramientas adecuadas, buena luz y electricidad. Agrupa reparaciones parecidas. Identifica las estaciones con claridad.",
        hours: 3,
      },
      {
        name: "Pon una fecha recurrente",
        description:
          "Una vez al mes suele funcionar bien. Elige una sede estable — biblioteca, makerspace, salón comunitario — para que la gente sepa a dónde llevar sus cosas.",
        hours: 2,
      },
      {
        name: "Diseña el flujo de recepción",
        description:
          "Una persona recibe a cada visitante y su objeto, y los canaliza con quien repara. Aclara desde el inicio: las personas se quedan y ayudan con su propia reparación cuando pueden; es un espacio para aprender, no un buzón de objetos.",
        hours: 2,
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
      },
      {
        name: "Lleva cuenta del impacto y dale seguimiento",
        description:
          "Cuenten cuántos objetos se arreglaron y, a grandes rasgos, lo que se evitó tirar. Compartan los números — motiva a quienes participan y ayuda a conseguir apoyo a futuro.",
        hours: 1,
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
      "Personas voluntarias que manejen, un método para pedir y despachar viajes, y reglas claras de seguridad y seguros.",
    setupHours: 18,
    defaultCategory: "transport",
    tasks: [
      {
        name: "Convoca y revisa a quienes manejan",
        description:
          "Confirma que cada persona tenga licencia vigente, seguro y un vehículo seguro. Para viajes con personas vulnerables, haz revisiones de referencias o de antecedentes según las normas de tu zona.",
        hours: 5,
      },
      {
        name: "Resuelve seguros y responsabilidad",
        description:
          "Revisa qué cubre el seguro personal de cada persona en un trayecto voluntario. Considera un consentimiento sencillo y consulta a una clínica de asistencia legal local — esto protege a todas las partes.",
        hours: 4,
      },
      {
        name: "Arma un sistema de solicitudes",
        description:
          "Elige un solo canal para pedir viajes (línea telefónica, formulario, chat de grupo) con un tiempo de anticipación (por ejemplo, 48 horas). Registra hora de recogida, ubicaciones, necesidades de movilidad y datos de contacto.",
        hours: 2,
      },
      {
        name: "Define una rutina de despacho",
        description:
          "Ten a una persona coordinadora (que rote) que empareje solicitudes con personas que manejen y confirme con ambas partes el día anterior. Mantén una lista de respaldo para cancelaciones.",
        hours: 2,
      },
      {
        name: "Define qué se cubre",
        description:
          "Decidan qué viajes entran (médicos, súper, trámites esenciales) y su zona de servicio. Sean claras y claros sobre tiempos de espera y si quienes manejan ayudan con las bolsas.",
        hours: 1,
      },
      {
        name: "Maneja los gastos",
        description:
          "Decidan cómo se cubre la gasolina — un pequeño fondo común, aportes opcionales de quien viaja o nada. Que sea transparente y que nunca se vuelva una barrera para quien necesita el viaje.",
        hours: 2,
      },
      {
        name: "Mantén seguras a quienes viajan y a quienes manejan",
        description:
          "Establezcan normas: quien maneja no entra a casas sin acompañamiento, no se maneja dinero más allá de los gastos acordados, y se hace un seguimiento después de viajes con personas vulnerables. Registren cada viaje.",
        hours: 2,
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
    setupHours: 26,
    defaultCategory: "organizing",
    tasks: [
      {
        name: "Convoca un comité organizador base",
        description:
          "Encuentra de 3 a 6 inquilinas e inquilinos comprometidos para anclar el trabajo. Busca personas respetadas en sus edificios. Acuerden roles, un ritmo de reuniones y metas compartidas.",
        hours: 4,
      },
      {
        name: "Mapea edificios y problemas de inquilinas e inquilinos",
        description:
          "Toca puertas o aplica encuestas para saber qué edificios tienen problemas y cuáles son (reparaciones ignoradas, cargos ilegales, acoso). Sigue los patrones y detecta a las personas líderes naturales en cada edificio.",
        hours: 5,
      },
      {
        name: "Reúne información local precisa sobre derechos",
        description:
          "Compila las leyes reales de tu zona sobre plazos de aviso de desalojo, reparaciones, depósitos y reglas de renta. Asóciate con una clínica de asistencia legal para verificarlas. Esto es información compartida, no asesoría legal — déjenlo claro con las personas integrantes.",
        hours: 4,
      },
      {
        name: "Arma un sistema de contacto de respuesta rápida",
        description:
          "Monta un árbol telefónico o un chat de grupo para que quien reciba un aviso de desalojo o un cierre de cerradura pueda llegar al sindicato rápido. Decidan quién responde y en cuánto tiempo.",
        hours: 3,
      },
      {
        name: "Organiza un taller de \"conoce tus derechos\"",
        description:
          "Realicen una sesión (idealmente con una persona aliada de asistencia legal) que recorra los derechos y qué hacer si reciben papeles. Entreguen guías impresas para llevar a casa en los idiomas que correspondan.",
        hours: 4,
      },
      {
        name: "Define un protocolo de respuesta ante desalojos",
        description:
          "Escriban un paso a paso sencillo para cuando alguien enfrente un desalojo: documentar todo, contactar a asistencia legal antes de la fecha límite, organizar apoyo vecinal y nunca ignorar fechas de corte.",
        hours: 3,
      },
      {
        name: "Conéctate con asistencia legal y apoyo continuo",
        description:
          "Construye una relación de referencia con abogadas y abogados de inquilinas e inquilinos, asistencia legal y asesoras y asesores de vivienda para que el sindicato pueda derivar los casos que necesiten ayuda profesional. Mantén los contactos al día.",
        hours: 3,
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
    setupHours: 26,
    defaultCategory: "childcare",
    tasks: [
      {
        name: "Reúne a las familias fundadoras y acuerden un modelo",
        description:
          "Convoca familias que se conozcan o que puedan construir confianza entre sí. Decidan el modelo: una cooperativa rotativa de niñeras donde madres y padres ganan y gastan créditos de cuidado, o un cuidado grupal con horario.",
        hours: 4,
      },
      {
        name: "Definan estándares de seguridad y revisión",
        description:
          "Acuerden cómo revisar a cualquier persona que cuide niñas y niños: referencias, verificaciones de antecedentes cuando corresponda y una regla firme de que ninguna persona adulta queda sola con la hija o el hijo de otra familia sin que nadie sepa. Establezcan proporciones adulto-niñe.",
        hours: 5,
      },
      {
        name: "Encuentra un espacio y hazlo seguro para la infancia",
        description:
          "Elijan un sitio o establezcan estándares para las casas anfitrionas. Revisen riesgos, cubran enchufes, fijen muebles pesados, guarden bajo llave medicinas y químicos, y confirmen un área exterior segura si se usa.",
        hours: 4,
      },
      {
        name: "Creen un sistema de calendario y créditos",
        description:
          "Usen un calendario compartido o una app de cooperativa. En un modelo de créditos, una hora de cuidado da una hora a deber. Lleven cuenta de quién acoge y cuándo para que la carga sea justa.",
        hours: 3,
      },
      {
        name: "Establezcan políticas de salud, alergias y emergencias",
        description:
          "Reúnan información de alergias, medicamentos, contactos de emergencia y autorizaciones de recogida para cada niña o niño. Escriban una política clara para niñas y niños enfermos y qué hacer ante una emergencia médica.",
        hours: 3,
      },
      {
        name: "Capaciten a quienes cuidan en lo básico",
        description:
          "Cubran supervisión, sueño seguro para bebés, respuesta ante alergias y emergencias, y las reglas de seguridad. Animen a tener al menos una persona adulta certificada en primeros auxilios pediátricos y RCP por sesión.",
        hours: 4,
      },
      {
        name: "Hagan una sesión piloto y recojan comentarios",
        description:
          "Hagan un piloto corto con unas pocas familias y luego una conversación de cierre. Arreglen lo que no funcionó antes de crecer. Revisen seguido para que la confianza y la seguridad se mantengan firmes.",
        hours: 3,
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
    setupHours: 20,
    defaultCategory: "infrastructure",
    tasks: [
      {
        name: "Encuentra un sitio de compostaje",
        description:
          "Asegura un lugar con espacio y algo de sol — una esquina de un huerto comunitario, un lote baldío o un patio dispuesto. Confirma el permiso y revisa las reglas locales sobre compostaje.",
        hours: 4,
      },
      {
        name: "Elige un método de compostaje",
        description:
          "Escoge lo que sea adecuado a tu escala: un sistema caliente de tres compartimentos, tambores o composta con lombrices. Que el método coincida con el material que esperas y con lo que puedas voltear.",
        hours: 3,
      },
      {
        name: "Consigue contenedores y equipo",
        description:
          "Construye o compra contenedores de recolección y la estructura de compostaje. Junta un bieldo, un termómetro y material café (hojas, cartón) para equilibrar los restos de comida.",
        hours: 4,
      },
      {
        name: "Arma un sistema de recolección",
        description:
          "Decidan cómo llegan los restos: un contenedor de entrega con horarios o una ruta voluntaria de recogida. Den a quienes participen pequeños botes para la cocina y un calendario claro de entrega.",
        hours: 4,
      },
      {
        name: "Dejen claro qué se acepta",
        description:
          "Pongan una lista sencilla de sí y no (sí: fruta, verdura, café, cáscaras de huevo; no: carne, lácteos, aceites, excremento de mascotas). Una señalización clara evita la contaminación que arruina una tanda.",
        hours: 2,
      },
      {
        name: "Convoca y capacita una rotación de mantenimiento",
        description:
          "La composta necesita voltearse, revisarse la humedad y equilibrar verdes y cafés. Hagan un calendario compartido y enseñen lo básico a quienes participen para que las pilas no huelan ni se estanquen.",
        hours: 3,
      },
      {
        name: "Distribuye la composta terminada",
        description:
          "Una vez lista la composta, compártanla gratis con quienes aportaron y con huertos comunitarios. Anuncien los días de recogida y que lleven bolsas o cubetas.",
        hours: 2,
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
    setupHours: 16,
    defaultCategory: "education",
    tasks: [
      {
        name: "Construye o consigue una caja de libros resistente al clima",
        description:
          "Hagan o compren una caja firme y a prueba de agua, sobre un poste o en una pared. Sirve un mueble reciclado o una caja de periódicos. Pónganle una puerta clara y un techo inclinado para que los libros no se mojen.",
        hours: 5,
      },
      {
        name: "Elige y prepara un lugar",
        description:
          "Escojan un sitio con tránsito de gente y permiso — el patio delantero de alguien, un centro comunitario o el borde de un parque. Anclen bien la caja y confirmen que se permite.",
        hours: 2,
      },
      {
        name: "Surte la colección inicial",
        description:
          "Reúnan libros donados con una pequeña convocatoria. Busquen variedad: libros infantiles, ficción popular y no ficción práctica. Empiecen medio llena para que haya espacio de sumar.",
        hours: 3,
      },
      {
        name: "Pongan un letrero y normas sencillas",
        description:
          "Coloquen \"Toma un libro, deja un libro — todo gratis\". Mantengan el tono cálido y con pocas reglas. Añadan una nota que invite a todas las edades e idiomas.",
        hours: 1,
      },
      {
        name: "Convoca a una persona cuidadora",
        description:
          "Pídanle a alguien cercano que revise la caja cada semana: la ordene, retire lo dañado o inapropiado y reacomode el acervo. Cinco minutos a la semana la mantienen sana.",
        hours: 1,
      },
      {
        name: "Curen el acervo para la comunidad",
        description:
          "Surtan libros que encajen con su barrio — varios idiomas, libros infantiles si hay familias, guías prácticas. Retiren con discreción lo gastado o lo que no encaje.",
        hours: 2,
      },
      {
        name: "Difundan y conecten con esfuerzos de lectura",
        description:
          "Cuéntenles a las escuelas, a la biblioteca local y a las personas vecinas que existe. Consideren ligas como un empujón de lectura de verano o reabastecimientos temáticos.",
        hours: 2,
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
    setupHours: 18,
    defaultCategory: "education",
    tasks: [
      {
        name: "Asóciate con personas instructoras certificadas",
        description:
          "Conéctate con personal calificado — la Cruz Roja, la secretaría de salud local o una organización de reducción de daños. Ellas y ellos dan la capacitación médica real; tu papel es organizarla y alojarla.",
        hours: 4,
      },
      {
        name: "Consigue insumos",
        description:
          "Obtén botiquines de primeros auxilios, maniquíes para practicar RCP (a menudo prestados por quienes capacitan) y naloxona. Muchos programas de salud pública distribuyen naloxona gratis — pregunta en tu secretaría de salud o a grupos de reducción de daños.",
        hours: 4,
      },
      {
        name: "Encuentra espacio y agenda las sesiones",
        description:
          "Reserven un salón donde quepa práctica con las manos — un centro comunitario, biblioteca o clínica. Pongan fechas recurrentes para que la gente pueda planear alrededor del trabajo.",
        hours: 3,
      },
      {
        name: "Convoca a quienes participen",
        description:
          "Difundan ampliamente y prioricen a personas que probablemente presencien emergencias. Que la inscripción sea fácil y gratuita, y ofrezcan horarios variados para quien trabaja por turnos.",
        hours: 3,
      },
      {
        name: "Realiza las sesiones de capacitación",
        description:
          "Alojen las sesiones que dan las personas instructoras, encárguense del montaje y el registro y asegúrense de que todas las personas hagan práctica con las manos. Entreguen tarjetas de referencia para llevar a casa.",
        hours: 4,
        recurringCadence: "session",
      },
      {
        name: "Entrega botiquines y refresca conocimientos",
        description:
          "Que las personas capacitadas se lleven un botiquín de primeros auxilios y naloxona donde esté disponible. Programen repasos periódicos para que las habilidades no se enmohezcan.",
        hours: 2,
      },
      {
        name: "Lleva cuenta de las personas capacitadas y reabastece",
        description:
          "Mantén una lista opcional de vecinas y vecinos capacitados y dónde se guardan los insumos. Reemplaza la naloxona y el contenido del botiquín cuando se use o caduque.",
        hours: 2,
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
    setupHours: 21,
    defaultCategory: "organizing",
    tasks: [
      {
        name: "Convoca a integrantes fundadoras e inventaríen habilidades",
        description:
          "Reúne un grupo inicial y pregúntale a cada quien qué puede ofrecer (aventones, tutoría, reparaciones, cocina, jardinería) y qué necesita. La variedad de ofrecimientos es lo que hace que funcione.",
        hours: 4,
      },
      {
        name: "Elige un sistema de registro",
        description:
          "Escojan cómo registrar horas: software dedicado a bancos de tiempo, una hoja de cálculo compartida o un libro sencillo. Debe registrar quién dio y quién recibió horas.",
        hours: 3,
      },
      {
        name: "Definan las reglas",
        description:
          "Acuerden el principio central (una hora = un crédito, sin importar la tarea), cómo se piden y se confirman los intercambios y qué pasa cuando el saldo de alguien baja mucho.",
        hours: 3,
      },
      {
        name: "Den la bienvenida a las personas integrantes",
        description:
          "Hagan una orientación corta para que la gente entienda la filosofía y el sistema. Den a cada persona algunos créditos iniciales para que los intercambios puedan empezar de inmediato.",
        hours: 3,
      },
      {
        name: "Lanza un directorio de servicios",
        description:
          "Publiquen una lista buscable de quién ofrece qué. Manténganla al día para que las personas integrantes encuentren ayuda sin preguntarle todo el tiempo a quien coordina.",
        hours: 3,
      },
      {
        name: "Coordina y conecta intercambios",
        description:
          "Que una persona coordinadora ayude a emparejar necesidades con ofrecimientos, sobre todo al inicio, y dé un empujón a quienes están en silencio. Con el tiempo, las personas integrantes se conectan directo.",
        hours: 2,
      },
      {
        name: "Construye prácticas de confianza y seguridad",
        description:
          "Pongan normas para intercambios que ocurran en casas o con personas integrantes vulnerables (referencias, no encontrarse a solas si incomoda). Añadan una forma sencilla de levantar alertas.",
        hours: 3,
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
    tasks: [
      {
        name: "Forma un pequeño equipo responsable",
        description:
          "Convoca a unas pocas personas de confianza para administrar el fondo. Definan roles con claridad y comprométanse a la transparencia desde el primer día — aquí la confianza lo es todo.",
        hours: 3,
      },
      {
        name: "Arma un manejo transparente del dinero",
        description:
          "Abran una cuenta dedicada o usen un patrocinio fiscal. Pidan que dos personas aprueben los pagos, mantengan un libro contable claro y revisen si la estructura tiene implicaciones fiscales o legales — consulten un recurso local de organizaciones sin fines de lucro o a una persona contadora.",
        hours: 5,
      },
      {
        name: "Definan criterios para solicitar y entregar apoyo",
        description:
          "Decidan quién puede solicitar, los montos típicos, cada cuánto puede pedir alguien y si es por orden de llegada o ponderado por necesidad. Mantengan bajas las barreras y eviten exigir comprobantes de necesidad cuando sea posible.",
        hours: 4,
      },
      {
        name: "Crea un formulario de solicitud sencillo y de pocas barreras",
        description:
          "Hagan un formulario corto y privado que pida sólo lo necesario. Ofrezcan varias formas de aplicar (en línea, por teléfono, en persona) y protejan la privacidad de quienes solicitan.",
        hours: 2,
      },
      {
        name: "Pon en marcha la recaudación",
        description:
          "Combinen pequeñas donaciones recurrentes de personas integrantes con campañas ocasionales. Sean claras y claros con quienes donan: los fondos van directo a vecinas y vecinos en necesidad.",
        hours: 4,
      },
      {
        name: "Arma un proceso de decisión y de pago",
        description:
          "Pongan un tiempo de respuesta, una revisión rápida del equipo y métodos veloces de pago. En una crisis, la velocidad importa. Documenten cada decisión de manera sencilla.",
        hours: 3,
      },
      {
        name: "Rinde cuentas con transparencia",
        description:
          "Compartan resúmenes regulares — dinero que entra, dinero que sale, número de vecinas y vecinos apoyados — sin exponer la identidad de quienes recibieron. La transparencia mantiene la donación.",
        hours: 2,
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
    setupHours: 17,
    defaultCategory: "mutual_aid_drive",
    tasks: [
      {
        name: "Encuentra almacenamiento y un punto de distribución",
        description:
          "Asegura un almacén seco y seguro y un lugar para entregar los artículos — un clóset en una clínica, iglesia o centro comunitario. El sitio de entrega debe sentirse privado y digno.",
        hours: 3,
      },
      {
        name: "Establece el abastecimiento",
        description:
          "Combina compras al mayoreo, campañas de donación y vínculos con redes de bancos de pañales o mayoristas. Lleva cuenta de qué fuentes son estables para no quedarte sin existencias.",
        hours: 4,
      },
      {
        name: "Clasifica e inventaría por talla y tipo",
        description:
          "Organiza pañales por talla, además de productos menstruales y artículos de higiene. Lleva un conteo corriente para saber qué pedir. Las tallas para bebés más grandes suelen escasear.",
        hours: 3,
      },
      {
        name: "Define una política de distribución justa",
        description:
          "Decidan cuánto recibe cada familia y cada cuánto, sin barreras de comprobación de necesidad. Que sea predecible para que la gente pueda contar con ello.",
        hours: 2,
      },
      {
        name: "Agenda la distribución y consigue personal",
        description:
          "Pongan días regulares de distribución, convoquen a personas voluntarias para entregar los insumos y mantengan el trato cálido y sin juicios.",
        hours: 4,
        recurringCadence: "event",
      },
      {
        name: "Organicen campañas de insumos",
        description:
          "Hagan campañas periódicas en escuelas, lugares de trabajo y grupos de fe. Den una lista de deseos específica (especialmente tallas grandes de pañales y productos menstruales) para que las donaciones coincidan con las necesidades.",
        hours: 3,
      },
      {
        name: "Sigue las necesidades y reabastece",
        description:
          "Observen qué artículos salen más rápido y pidan antes de que se acaben. Anoten los huecos recurrentes para guiar la siguiente campaña o compra al mayoreo.",
        hours: 2,
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
    setupHours: 23,
    defaultCategory: "transport",
    tasks: [
      {
        name: "Encuentra un espacio de taller",
        description:
          "Asegura una cochera, un sótano, un contenedor o un espacio comunitario compartido con lugar para trabajar y guardar bicicletas. Confirma el acceso y cualquier necesidad de seguro.",
        hours: 4,
      },
      {
        name: "Junta herramientas y un caballete",
        description:
          "Reúne un kit básico de herramientas de bicicleta y al menos un caballete de reparación con donaciones o con un pequeño presupuesto. Organiza las herramientas para que sea fácil encontrarlas y devolverlas.",
        hours: 5,
      },
      {
        name: "Recolecta bicicletas y refacciones donadas",
        description:
          "Hagan convocatorias para bicicletas sin uso y refacciones aprovechables. Clasifíquenlas en \"reparables\", \"para refacciones\" y \"listas para rodar\". Una reserva de refacciones es lo que mantiene andando al taller.",
        hours: 4,
      },
      {
        name: "Convoca a personas mecánicas voluntarias",
        description:
          "Encuentra a unas cuantas personas que sepan arreglar bicicletas y, sobre todo, enseñar a otras. La meta es ayudar a la gente a aprender a reparar la suya, no hacerlo por ella.",
        hours: 3,
      },
      {
        name: "Establece horarios y un modelo de \"gánate una bici\"",
        description:
          "Elijan horarios predecibles. Consideren un programa de \"gánate una bici\" donde alguien aprende habilidades de reparación a lo largo de varias sesiones y se va con la bicicleta que reparó.",
        hours: 3,
      },
      {
        name: "Establece prácticas de seguridad",
        description:
          "Exijan protección para los ojos, pongan reglas para el uso de herramientas y tengan un botiquín. Hagan siempre un chequeo de seguridad (frenos, llantas, dirección) antes de que cualquier bicicleta salga.",
        hours: 2,
      },
      {
        name: "Difunde y lleva cuenta de reparaciones y bicicletas entregadas",
        description:
          "Corran la voz en escuelas, refugios y zonas con poco transporte. Cuenten las reparaciones hechas y las bicicletas reubicadas — sirve para el ánimo de quienes participan y para apoyos futuros.",
        hours: 2,
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
    setupHours: 25,
    defaultCategory: "other",
    tasks: [
      {
        name: "Convoca a personas voluntarias bilingües y multilingües",
        description:
          "Encuentra personas voluntarias que hablen los idiomas comunes en tu zona y puedan ayudar con traducción, formularios y acompañamiento. Que los idiomas coincidan con las necesidades locales reales.",
        hours: 4,
      },
      {
        name: "Mapea servicios y aliadas y aliados locales",
        description:
          "Arma un directorio de clínicas, escuelas, asistencia legal, clases de ESL, recursos alimentarios y organizaciones que sirven a personas migrantes. A menudo, las personas recién llegadas sólo necesitan saber qué existe y cómo llegar.",
        hours: 5,
      },
      {
        name: "Arma un sistema de solicitudes y emparejamientos",
        description:
          "Crea una forma sencilla para que las personas recién llegadas pidan ayuda y se les empareje con alguien voluntario por idioma y necesidad. Ofrezcan opciones por teléfono y en persona, no sólo en línea.",
        hours: 3,
      },
      {
        name: "Crea materiales de orientación",
        description:
          "Junten guías en lenguaje sencillo, en los idiomas que correspondan, sobre transporte, escuelas, salud y derechos. Usen imágenes para que funcionen en distintos niveles de alfabetización.",
        hours: 4,
      },
      {
        name: "Ofrece acompañamiento a citas",
        description:
          "Coordinen para que personas voluntarias acompañen a la gente a citas médicas, escolares o de servicios para interpretar y apoyar. Indiquen a quienes acompañan que interpreten con fidelidad, no que den consejos para los que no están calificadas.",
        hours: 3,
      },
      {
        name: "Organicen encuentros de bienvenida",
        description:
          "Hagan encuentros informales regulares donde las personas recién llegadas conozcan a otras y a quienes llevan tiempo en el lugar. El vínculo y la pertenencia importan tanto como los trámites.",
        hours: 3,
      },
      {
        name: "Establezcan prácticas de privacidad y seguridad",
        description:
          "Recojan la información mínima necesaria y nunca pregunten ni registren estatus migratorio. Guarden los datos de forma segura y capaciten a las personas voluntarias para manejar situaciones sensibles con discreción.",
        hours: 3,
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
