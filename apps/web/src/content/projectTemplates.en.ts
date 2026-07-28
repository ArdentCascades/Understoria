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
// English project templates (i18n Phase 2a split from
// projectTemplates.ts — authored content lives here now; the
// selectors and types stay in projectTemplates.ts). Eager: English
// is the app-wide content fallback.
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_EN: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Community Fridge & Free Pantry",
    "purpose": "Provide free, 24/7 access to food and essentials with no questions asked.",
    "whoItServes": "Anyone who needs food; especially helpful for people working irregular hours, undocumented neighbors, and those who can't reach a food bank during business hours.",
    "whatYoullNeed": "A donated fridge, a sheltered outdoor spot with an outlet, a host site, and a small cleaning rota.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Start with the host, not the fridge. Sit down with the shop owner, church, or clinic you have in mind and talk through the unglamorous parts — the power bill, what happens when someone leaves a mess, who they call when it breaks — before you source a single appliance. While you're at it, ask the food pantries and mutual aid groups already working nearby what gaps they see, so the fridge fills one instead of duplicating them.",
    "commonPitfalls": "Community fridges almost never die from a lack of donations — they die when nobody clearly owns the cleaning, the fridge gets grim, and the host quietly asks for it to go. Put names on the rota before opening day, and treat the host relationship as the thing you're maintaining, not just the appliance.",
    "pairsWith": [
      "gleaning-network",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Find a host site with power and foot traffic",
        "description": "Approach small businesses, churches, clinics, or community centers. Ask if they'll let you place a fridge under their awning and plug it in (electricity cost is usually a few dollars a month — offer to cover it). Get a simple written okay.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Source a fridge and a weatherproof shelter",
        "description": "Put out a call for a working fridge on local groups. Build or buy a simple wooden cabinet/lean-to around it to protect it from rain and sun. Anchor it so it can't tip. Includes locating, transporting, and building.",
        "hours": 8,
        "skills": [
          "carpentry",
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Set the ground rules and label everything",
        "description": "Post a clear, multilingual sign: take what you need, leave what you can, no expired/home-canned/raw meat. Add labels and a marker so people can date items.",
        "hours": 1.5,
        "skills": [
          "writing",
          "translation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recruit a cleaning and restocking rota",
        "description": "Make a shared weekly schedule. Each shift is ~15 minutes: wipe surfaces, toss anything spoiled or past-date, and note what's running low. Keep cleaning supplies on site.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organizing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Build supply relationships",
        "description": "Ask bakeries, grocers, restaurants, and farmers' markets for regular end-of-day donations. Coordinate a pickup volunteer. Track which sources are reliable.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set up a problem contact",
        "description": "Put one phone number or email on the fridge for \"fridge is broken / power is out / question.\" Decide who answers it and how fast.",
        "hours": 0.5
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Community Garden / Shared Growing Plot",
    "purpose": "Grow free fresh produce together and create a gathering space.",
    "whoItServes": "Neighbors without yard space, people facing food costs, and anyone wanting connection and a reason to be outside.",
    "whatYoullNeed": "A plot of land (even a vacant lot or rooftop), soil/beds, water access, seeds, and a core group of 5–10 regulars.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Before you touch the soil, talk to two groups of people: whoever owns the land, and the neighbors who live right next to it — their blessing matters as much as the lease. Then gather your likely regulars and have the sharing-model conversation early; knowing whether this is individual plots or a communal harvest changes everything you build.",
    "commonPitfalls": "Gardens don't usually die in spring — they die in the hottest weeks, when the watering rota quietly collapses and the beds go brown. The other slow killer is one person treating it as their garden with helpers; write down how decisions get made while everyone still likes each other.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Secure land and permission",
        "description": "Identify a vacant lot, church yard, school ground, or unused park corner. Find the owner (city land records, or just ask). Get a written license or lease, even a one-year handshake-in-writing, and confirm water access.",
        "hours": 6,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Test the soil and plan beds",
        "description": "Send a cheap soil test to a local extension service to rule out lead/contaminants. If soil is bad, plan raised beds with clean soil. Sketch where beds, paths, and a tool spot will go.",
        "hours": 2,
        "skills": [
          "gardening"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gather materials and build",
        "description": "Collect lumber or use straw-bale/keyhole beds, compost, and mulch. Host a build day; many hands raise beds quickly. Set up a hose or rain barrels.",
        "hours": 10,
        "skills": [
          "carpentry"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Decide the sharing model",
        "description": "Agree as a group: individual plots, fully communal harvest, or a hybrid. Write down how produce is divided and how decisions get made.",
        "hours": 1,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Plant for your climate and season",
        "description": "Pick easy, high-yield crops for your zone (greens, beans, squash, tomatoes, herbs). Stagger planting so harvests don't all hit at once. Label rows.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "gardening"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Set a watering and weeding rota",
        "description": "Plants die from neglect more than anything. Build a simple shared calendar; tie tasks to easy reminders. Keep it low-commitment so people don't burn out.",
        "hours": 1,
        "skills": [
          "organizing"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Plan the harvest and surplus",
        "description": "Decide harvest days. Route extra produce to the community fridge, neighbors, or a free stand at the gate. Save some seeds for next year.",
        "hours": 1,
        "recurringCadence": "cycle",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "tool-lending-library",
    "name": "Tool & Equipment Lending Library",
    "purpose": "Let neighbors borrow tools and gear instead of buying them, saving money and reducing waste.",
    "whoItServes": "Renters, new homeowners, hobbyists, and anyone doing occasional repairs or projects.",
    "whatYoullNeed": "Storage space, donated tools, a simple check-out system, and a couple of \"librarians.\"",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Before collecting a single drill, talk to the person offering the space about what living with a tool library actually means — noise, storage creep, strangers at the door during open hours. Then ask neighbors what they'd actually borrow; a list of ten requested tools beats a garage of donated ones nobody wants.",
    "commonPitfalls": "Tool libraries die from silence after the due date: nobody follows up, tools drift into permanent loans, and the shelves empty out. A friendly reminder routine matters more than a strict late policy — and be ready to say no to donations, or you'll become the neighborhood's dump for broken gear.",
    "pairsWith": [
      "library-of-things",
      "repair-cafe",
      "weatherization-brigade"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Find storage and open hours",
        "description": "A shed, garage, closet at a community center, or shipping container works. Pick 2–4 predictable open hours a week so people know when to come.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Collect and sort the inventory",
        "description": "Put out a donation call (people have duplicate drills and ladders everywhere). Clean, test, and label each tool. Discard or repair anything unsafe.",
        "hours": 6,
        "skills": [
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Catalog everything",
        "description": "Use a free spreadsheet or lending-library app. Record each item, its condition, and a photo. Number tools so they're easy to track.",
        "hours": 4,
        "skills": [
          "data entry"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Write borrowing rules",
        "description": "Set loan length (e.g., one week), how many items at once, and a return/late policy. Keep it forgiving — this is about trust. Note any tool that needs a safety briefing.",
        "hours": 1,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Set up sign-out",
        "description": "A clipboard or simple form: name, contact, item, date out, due date. Take a quick photo of the tool's condition at checkout to avoid disputes.",
        "hours": 2,
        "skills": [
          "data entry"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Train your librarians",
        "description": "Walk volunteers through the catalog, checkout steps, and basic safety (eye protection, ladder use). Have a one-page cheat sheet at the desk.",
        "hours": 2,
        "skills": [
          "teaching"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Maintain and grow",
        "description": "Inspect returned tools, sharpen and oil regularly, and track what people request most so you know what to add next.",
        "hours": 2,
        "skills": [
          "tool repair"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Neighborhood Care Network",
    "purpose": "Make sure isolated neighbors are checked on, connected, and supported.",
    "whoItServes": "Elderly people, disabled and chronically ill neighbors, new parents, and anyone living alone.",
    "whatYoullNeed": "A list of volunteers, a way to match them to neighbors, and a check-in routine. Volunteers are neighbors, not care professionals — screen anyone making home visits, never let a volunteer handle a neighbor's money alone, and agree in advance on when to call family or emergency services.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Start by listening, not recruiting: talk with the neighbors you hope to support about what they actually want — a weekly call, a ride, company — because a network built on assumptions feels like surveillance. At the same time, have the honest conversation with early volunteers about screening and boundaries, so the rules in place feel like care, not suspicion, when the first match happens.",
    "commonPitfalls": "Care networks rarely fail from too few volunteers — they burn out the three people who always say yes while everyone else waits to be asked. Spread the matches deliberately, hold the volunteer debriefs even when things seem fine, and don't let check-ins turn into treating a neighbor as a case instead of a person.",
    "pairsWith": [
      "rides-transportation",
      "disability-support-network",
      "welcome-wagon"
    ],
    "learnMore": [
      "message-someone"
    ],
    "tasks": [
      {
        "name": "Map who's around",
        "description": "Quietly identify neighbors who might be isolated through word of mouth, building managers, clinics, and faith groups. Never assume need — invite people in, don't single them out.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Recruit and screen volunteers",
        "description": "Ask for people who can commit to regular contact. For any in-home visits or help with vulnerable adults, do basic reference checks and never have a volunteer handle a neighbor's money alone.",
        "hours": 5,
        "skills": [
          "outreach",
          "interviewing"
        ]
      },
      {
        "name": "Match thoughtfully",
        "description": "Pair on language, proximity, and comfort. Ask both people what they want — a weekly call, a grocery run, a chat on the porch — and respect that boundary.",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Set a check-in rhythm",
        "description": "Agree on frequency and method (call, text, knock). Give volunteers a short script for the first contact so it feels warm, not clinical.",
        "hours": 1,
        "follows": [
          2
        ]
      },
      {
        "name": "Create an escalation plan",
        "description": "Decide in advance what to do if someone doesn't answer or seems in crisis: who to call, when to involve family or emergency services, and how to log it. Keep it written and simple.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Coordinate practical help",
        "description": "Track recurring needs — rides to appointments, prescription pickups, snow shoveling — and connect them to other volunteers or projects in your program.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Support the volunteers too",
        "description": "Hold a check-in for them to debrief. Caring work is draining; rotate tasks and watch for burnout.",
        "hours": 2,
        "skills": [
          "facilitation"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Emergency & Disaster Preparedness Network",
    "purpose": "Help the neighborhood prepare for and respond to disasters (heat waves, storms, floods, power outages) when official help is slow.",
    "whoItServes": "Everyone, with priority to people who can't easily evacuate or who depend on power for medical equipment.",
    "whatYoullNeed": "A contact list, a meeting spot, basic supplies, and a communication plan that works without internet. This network complements official emergency services — it doesn't replace them. In a life-threatening situation, always call emergency services first.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Build the plan around the people it's for: knock on the doors of neighbors on oxygen, refrigerated meds, or upper floors without elevators, and ask what a bad week looks like for them. Then talk to whoever controls your likely safe spot and to any existing emergency group (CERT, the fire department's outreach) so your network fills the gaps around official response instead of duplicating it.",
    "commonPitfalls": "These networks don't fail during the disaster — they fail in the quiet years before it, when the contact tree goes stale, phone numbers change, and the plan lives on one person's laptop. Print everything, refresh the list on a calendar rhythm, and drill at least once; the first real use should never be the first use.",
    "pairsWith": [
      "cooling-warming-center",
      "community-first-aid-training",
      "community-wifi-mesh"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Map your neighborhood's risks",
        "description": "List the disasters most likely where you are. Note vulnerable points: people on the upper floors with no elevator, those on oxygen or refrigerated meds, single-exit buildings.",
        "hours": 4
      },
      {
        "name": "Build a contact tree",
        "description": "Collect opt-in contact info block by block. Designate a few \"block captains\" who each check on ~10 households. Keep a paper copy — phones and internet fail in disasters.",
        "hours": 8,
        "skills": [
          "outreach",
          "data entry"
        ]
      },
      {
        "name": "Plan offline communication",
        "description": "Decide how you'll reach each other without cell service: door knocks, a meeting spot, whistles, or radios. Print and distribute the plan.",
        "hours": 3,
        "skills": [
          "writing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Stock shared supplies",
        "description": "Assemble a community kit: water, first aid, flashlights, batteries, a battery/crank radio, blankets, and basic tools. Store it where a few people can access it.",
        "hours": 5,
        "skills": [
          "driving"
        ]
      },
      {
        "name": "Identify safe spots",
        "description": "Find places that could serve as a cooling/warming center or charging point (a hall with a generator, a shaded park). Confirm access ahead of time.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Run a drill or info night",
        "description": "Host a session on personal go-bags, shutting off utilities, and the contact tree. Practice once so people aren't learning during the actual emergency.",
        "hours": 5,
        "skills": [
          "teaching",
          "facilitation"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Define roles for \"day of\"",
        "description": "Pre-assign who checks on the medically vulnerable first, who opens the safe spot, and who coordinates. Review and update the plan twice a year.",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Free Store / Goods Swap",
    "purpose": "Redistribute clothing, household goods, and supplies for free.",
    "whoItServes": "Anyone — people in tight spots, people decluttering, and the environment.",
    "whatYoullNeed": "A space (even pop-up), tables or racks, sorting volunteers, and a regular schedule.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Talk first with the space host about the honest realities — donation piles, foot traffic, what the room looks like the morning after — and then with a nearby thrift store or charity about what already floods in, so you know what your neighborhood actually lacks. If you can, spend an hour at an existing free store before your first event; the flow of intake and display is easier to copy than to invent.",
    "commonPitfalls": "Free stores drown before they starve: without a firm yes/no list at the door, volunteers spend every hour sorting broken and soiled donations instead of welcoming people. And decide where leftovers go before the first event ends — a pile of unclaimed goods with no exit plan is how host spaces get lost.",
    "pairsWith": [
      "repair-cafe",
      "library-of-things",
      "mutual-aid-moving-crew"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Pick a format and space",
        "description": "Decide between a standing free store, a recurring pop-up, or a one-day swap. Borrow a hall, storefront, or park pavilion. A recurring date builds habit.",
        "hours": 2
      },
      {
        "name": "Set donation standards",
        "description": "Accept clean, working, usable items only. Post a clear \"yes\" and \"no\" list (no broken electronics, no soiled clothing, no recalled baby gear). This saves enormous sorting time.",
        "hours": 0.5,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Organize intake and sorting",
        "description": "Set up stations: receive, sort by category, and stage for display. Have a plan for items you can't use (donate onward or recycle).",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Display so people can browse with dignity",
        "description": "Hang clothes by size, group household goods, keep it tidy and welcoming. No application, no proof of need — just take what you'll use.",
        "hours": 1.5,
        "skills": [
          "design"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Staff the event",
        "description": "Assign greeters, sorters, and someone for questions. A friendly, no-judgment tone is the whole point.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Handle the leftovers",
        "description": "Pre-arrange where unclaimed items go after each event (a partner charity, textile recycling) so the space resets clean.",
        "hours": 1,
        "skills": [
          "driving"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Skill Share & Free Classes",
    "purpose": "Let neighbors teach and learn from each other for free — cooking, repairs, language, budgeting, first aid, digital skills.",
    "whoItServes": "Everyone; especially people who can't afford paid classes and those whose knowledge is rarely valued.",
    "whatYoullNeed": "A space, people willing to teach, and a way to publish a schedule.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "The project starts with the two-question conversations, not the venue: ask people what they could teach and what they'd love to learn, and pay special attention to neighbors whose knowledge is rarely treated as expertise. Your first real task is reassuring one nervous would-be teacher over coffee that their session doesn't need to be a lecture.",
    "commonPitfalls": "Skill shares fade when the same two confident people end up teaching everything and the schedule quietly bends to the organizers' free evenings instead of the attendees'. Keep recruiting first-time teachers, ask who's missing from the room, and treat a five-person session as a success, because it is.",
    "pairsWith": [
      "time-bank",
      "digital-literacy",
      "repair-cafe"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Survey skills and interests",
        "description": "Ask members two questions: what could you teach, and what would you love to learn? Collect answers in a simple form. The overlap is your curriculum.",
        "hours": 1.5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Recruit and prep teachers",
        "description": "Reassure people that \"teaching\" can be informal. Help them outline a one-hour session and gather any materials. Pair nervous first-timers with a co-host.",
        "hours": 3,
        "skills": [
          "teaching",
          "facilitation"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Find space and time",
        "description": "Use a library room, community center, park, or someone's living room. Pick recurring slots so it becomes routine.",
        "hours": 1.5
      },
      {
        "name": "Build a schedule",
        "description": "List sessions with date, topic, teacher, and what to bring. Publish it where members already look. Keep sign-ups light or drop-in.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "organizing"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Make it accessible",
        "description": "Consider language needs, childcare, physical access, and timing for people who work. Ask attendees what would help them come.",
        "hours": 1.5,
        "skills": [
          "accessibility",
          "translation"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Bulk-Buying Food Co-op",
    "purpose": "Pool orders to buy food and staples in bulk at lower prices.",
    "whoItServes": "Households squeezed by grocery prices, large families, and food-desert neighborhoods.",
    "whatYoullNeed": "A group of committed households, a wholesale source, a pickup/sort space, and someone to manage orders.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Gather your households before you call any supplier, and have the awkward money conversation first: what people can commit to, how payment happens before orders go in, and what a missed cycle means. A call with an existing buying club — most are happy to share their spreadsheet and their scars — will save you a season of trial and error.",
    "commonPitfalls": "Buying co-ops die from money friction and coordinator fatigue: someone fronts cash and resents it, an order goes unpaid, or one person quietly runs every cycle until they quit and the whole thing stops. Collect payment before ordering without exception, and rotate the coordinator role from cycle two, not someday.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Gather your buying group",
        "description": "Recruit enough households to hit supplier minimums (often 8–15). Agree on a buying cycle (weekly, biweekly, monthly).",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Find a supplier",
        "description": "Contact food wholesalers, farm co-ops, restaurant suppliers, or buying clubs. Compare minimum orders, delivery options, and prices. Confirm what staples they carry.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set up ordering",
        "description": "Use a shared spreadsheet or form where members enter quantities by the cutoff. Designate one coordinator to total and place the order.",
        "hours": 3,
        "skills": [
          "data entry",
          "organizing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Handle money transparently",
        "description": "Decide payment up front (collect before ordering to avoid fronting cash). Track every dollar in a shared ledger. Add a tiny optional buffer for spillage, not profit.",
        "hours": 2,
        "skills": [
          "accounting"
        ]
      },
      {
        "name": "Arrange delivery and a sort space",
        "description": "Pick a spot to receive the bulk delivery — a garage, hall, or driveway. Schedule enough hands for unloading day.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Split orders fairly",
        "description": "Set up sorting stations with scales for bulk grains/produce. Pre-print each household's list. Double-check before pickup.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Rotate the work",
        "description": "Coordinating, sorting, and pickup duties should rotate so no one person carries it all. Review pricing and supplier reliability each cycle.",
        "hours": 1,
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Repair Café",
    "purpose": "Fix broken items — clothing, electronics, bikes, furniture — for free instead of throwing them away.",
    "whoItServes": "Anyone with something broken and no money or skill to fix it; keeps usable goods out of landfills.",
    "whatYoullNeed": "Handy volunteers, basic tools, a space with tables and power, and a recurring date.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Recruit your first two or three fixers before anything else — the neighbor who sews, the bike tinkerer — because a date and venue mean nothing without them. Then walk the venue with them, talking through tables, power, and light, and if there's a repair café in a nearby town, visit one session; the intake flow is the part worth stealing.",
    "commonPitfalls": "Repair cafés quietly turn into free drop-off repair shops: visitors leave items and walk away, fixers become unpaid technicians, and the one electronics person burns out first. Hold the line that owners stay with their repair, and post clearly that some things can't be saved — disappointment handled up front is easier than blame afterward.",
    "pairsWith": [
      "tool-lending-library",
      "community-bike-workshop",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recruit fixers by specialty",
        "description": "Find people good with sewing, small electronics, bikes, appliances, and woodwork. You only need one or two per category to start.",
        "hours": 4,
        "skills": [
          "repair",
          "electronics",
          "sewing"
        ]
      },
      {
        "name": "Set up repair stations",
        "description": "Each station needs a table, the right tools, good light, and power. Group similar repairs together. Label stations clearly.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Schedule a recurring date",
        "description": "Monthly works well. Pick a steady venue — library, makerspace, community hall — so people know where to bring things.",
        "hours": 1
      },
      {
        "name": "Create an intake flow",
        "description": "A greeter logs each visitor and item, then routes them to the right fixer. Set the expectation: visitors stay and help with their own repair when they can; it's a learning space, not a drop-off.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Manage safety and expectations",
        "description": "Post that some items can't be saved and repairs are attempted, not guaranteed. Have safe practices for electrical and battery items. Keep a first-aid kit handy.",
        "hours": 2
      },
      {
        "name": "Stock common parts and consumables",
        "description": "Keep thread, fuses, glue, fasteners, tubes, and patches on hand. Track what gets used so you can restock.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "rides-transportation",
    "name": "Rides & Transportation Support",
    "purpose": "Get neighbors to medical appointments, grocery stores, and essential errands when transit and money are barriers.",
    "whoItServes": "People without cars, disabled neighbors, elders, and anyone in a transit gap.",
    "whatYoullNeed": "Volunteer drivers, a request/dispatch method, and clear safety and insurance ground rules. Driving neighbors is a serious responsibility — confirm every driver's license and insurance, screen anyone who'll drive vulnerable riders, and never use a volunteer ride in place of an ambulance in a medical emergency.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Two sets of conversations come before the first ride: sit down with each would-be driver to confirm license and insurance and talk honestly about screening, and talk with the people who need rides — and the senior centers and clinics that know them — about real destinations, times, and mobility needs. The vetting conversation is easier as a founding norm than as a rule imposed later.",
    "commonPitfalls": "Ride networks fail at dispatch, not driving: requests land on one person's phone until that person is exhausted, and the same two reliable drivers get every ask while others are never called again after one no. Rotate the coordinator role, spread requests deliberately, and never let the insurance question wait until after the first fender-bender.",
    "pairsWith": [
      "health-navigation",
      "community-bike-workshop",
      "court-support"
    ],
    "learnMore": [
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Recruit and vet drivers",
        "description": "Confirm each driver has a valid license, insurance, and a safe vehicle. For rides with vulnerable people, do reference or background checks per your local norms.",
        "hours": 5,
        "skills": [
          "driving"
        ]
      },
      {
        "name": "Sort out insurance and liability",
        "description": "Check what each driver's personal insurance covers for volunteer driving. Consider a simple waiver and consult a local legal aid clinic — this protects everyone.",
        "hours": 4,
        "skills": [
          "paperwork"
        ]
      },
      {
        "name": "Set up a request system",
        "description": "Pick one channel for ride requests (phone line, form, group chat) with a lead time (e.g., 48 hours). Capture pickup time, locations, mobility needs, and contact info.",
        "hours": 2,
        "skills": [
          "organizing",
          "tech"
        ]
      },
      {
        "name": "Build a dispatch routine",
        "description": "Have one coordinator (rotating) match requests to available drivers and confirm with both sides the day before. Keep a backup driver list for cancellations.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Define what's covered",
        "description": "Decide which trips qualify (medical, groceries, essential errands) and your service area. Be clear about wait times and whether drivers help carry bags.",
        "hours": 1,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Handle costs",
        "description": "Decide how gas is covered — a small shared fund, optional rider contributions, or nothing. Keep it transparent and never let it become a barrier for the rider.",
        "hours": 2,
        "follows": [
          4
        ]
      },
      {
        "name": "Keep riders and drivers safe",
        "description": "Set norms: drivers don't enter homes alone, no handling of money beyond agreed costs, and a check-in after rides with vulnerable people. Log each ride.",
        "hours": 2,
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Tenant Union & Eviction Defense Network",
    "purpose": "Organize renters to defend against evictions, unsafe conditions, and unfair rent hikes through collective action.",
    "whoItServes": "Renters, especially in buildings with negligent or absentee landlords, and anyone facing eviction.",
    "whatYoullNeed": "A core organizing group, accurate local tenant-rights info, a connection to legal aid, and a fast contact system. This project supports tenants and shares public legal information; it does not replace legal advice. Always route individual cases to qualified legal aid before deadlines.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Talk to affected tenants before any contact with a landlord, ever — door-knock, listen to what people actually fear and want, and let the tenants in each building set the pace, because they carry the retaliation risk, not the organizers. In parallel, introduce yourself to the local legal aid clinic early; you'll want that relationship before the first eviction notice arrives, not after.",
    "commonPitfalls": "The way tenant unions hurt people is by moving faster than the tenants themselves: a confrontation launched before a building is ready exposes the most vulnerable neighbors to retaliation they didn't sign up for. The quieter failure is drift into giving legal advice instead of legal information — route individual cases to qualified legal aid before deadlines, every time.",
    "pairsWith": [
      "legal-aid-clinic",
      "mutual-aid-moving-crew",
      "solidarity-fund"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruit a core organizing committee",
        "description": "Find 3–6 committed tenants to anchor the work. Look for people respected in their buildings. Agree on roles, a meeting rhythm, and shared goals.",
        "hours": 5,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Map buildings and tenant issues",
        "description": "Door-knock or survey to learn which buildings have problems and what they are (repairs ignored, illegal fees, harassment). Track patterns and find natural leaders in each building.",
        "hours": 8,
        "skills": [
          "outreach",
          "interviewing"
        ]
      },
      {
        "name": "Gather accurate local tenant-rights information",
        "description": "Compile your area's actual laws on eviction notice periods, repairs, deposits, and rent rules. Partner with a legal aid clinic to verify it. This is shared information, not legal advice — make that clear to members.",
        "hours": 4,
        "skills": [
          "paperwork",
          "writing"
        ]
      },
      {
        "name": "Build a rapid-response contact system",
        "description": "Set up a phone tree or group chat so a tenant getting an eviction notice or lockout can reach the union fast. Decide who responds and how quickly.",
        "hours": 3,
        "skills": [
          "organizing",
          "tech support"
        ]
      },
      {
        "name": "Host a know-your-rights workshop",
        "description": "Run a session (ideally with a legal aid partner) walking tenants through their rights and what to do if served papers. Provide printed take-home guides in relevant languages.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "teaching",
          "facilitation"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Set up an eviction-response protocol",
        "description": "Write a simple step-by-step for when someone faces eviction: document everything, contact legal aid by the deadline, organize neighbor support, and never ignore court dates.",
        "hours": 3,
        "skills": [
          "writing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Connect to legal aid and ongoing support",
        "description": "Build a referral relationship with tenant lawyers, legal aid, and housing counselors so the union can hand off cases that need professional help. Keep contacts current.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Childcare / Babysitting Collective",
    "purpose": "Share trusted childcare among families so parents can work, rest, or handle emergencies without paying for it.",
    "whoItServes": "Parents and caregivers, especially single parents, shift workers, and lower-income families.",
    "whatYoullNeed": "A group of vetted families, a safe space (or rotating homes), a scheduling system, and clear safety rules. Caring for other people's children is a serious responsibility — keep firm supervision rules, screen caregivers, and follow your local rules on informal childcare.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "This project is built in living rooms before it's built anywhere else: gather the founding families and talk through the uncomfortable specifics — screening, supervision, discipline styles, what happens when a kid gets hurt — before anyone schedules a single hour of care. Check your local rules on informal childcare in that same first stretch, so the model you agree on is one you can actually run.",
    "commonPitfalls": "Two things quietly break childcare collectives: credit imbalance, where the same families always host until they resent it, and safety rules that soften as everyone gets comfortable — the just-this-once exception to never-alone is exactly how trust gets destroyed. Track the balance openly and treat the safety rules as most important with the families you know best.",
    "pairsWith": [
      "toy-library",
      "time-bank",
      "youth-mentorship"
    ],
    "learnMore": [
      "what-is-balance"
    ],
    "tasks": [
      {
        "name": "Gather founding families and agree on a model",
        "description": "Recruit families who know or can build trust with each other. Decide the model: a rotating babysitting co-op where parents earn and spend care credits, or scheduled group care.",
        "hours": 4,
        "skills": [
          "outreach",
          "facilitation"
        ]
      },
      {
        "name": "Set safety and vetting standards",
        "description": "Agree on screening for anyone caring for children: references, background checks where appropriate, and a firm rule that no single adult is ever alone with another family's child unaccounted for. Set adult-to-child ratios.",
        "hours": 6,
        "skills": [
          "childcare"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Find and child-proof a space",
        "description": "Choose a venue or set standards for host homes. Check for hazards, cover outlets, secure heavy furniture, lock away medicines and chemicals, and confirm a safe outdoor area if used.",
        "hours": 4,
        "skills": [
          "childcare",
          "home repair"
        ]
      },
      {
        "name": "Create a scheduling and credit system",
        "description": "Use a shared calendar or co-op app. In a credit model, one hour of care earns one hour owed. Track who's hosting when so the load stays fair.",
        "hours": 3,
        "skills": [
          "organizing",
          "data entry"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Set health, allergy, and emergency policies",
        "description": "Collect allergy info, medications, emergency contacts, and pickup authorizations for each child. Write a clear sick-child policy and what to do in a medical emergency.",
        "hours": 3,
        "skills": [
          "paperwork",
          "writing"
        ]
      },
      {
        "name": "Train caregivers on basics",
        "description": "Cover supervision, safe sleep for infants, allergy and emergency response, and the safety rules. Encourage at least one pediatric first-aid/CPR-certified adult per session.",
        "hours": 5,
        "skills": [
          "teaching",
          "first aid"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Run a trial session and gather feedback",
        "description": "Hold a short pilot with a few families, then debrief. Fix what didn't work before scaling. Check in regularly so trust and safety stay strong.",
        "hours": 3,
        "skills": [
          "childcare"
        ],
        "follows": [
          2,
          5
        ]
      }
    ]
  },
  {
    "id": "community-composting",
    "name": "Community Composting Program",
    "purpose": "Collect food scraps to divert waste from landfill and produce free compost for local gardens.",
    "whoItServes": "Households without a way to compost, community gardens, and the local environment.",
    "whatYoullNeed": "A composting site, collection bins, basic equipment, and a small maintenance rota.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Talk to the site host and to the neighbors within smelling distance before the first bin arrives — fear of odor and rats kills compost sites, and an early honest conversation defuses it better than any pamphlet. Then find your compost's future home (a community garden that wants it) and at least one person who's actually kept a hot pile alive; their judgment will shape which method you pick.",
    "commonPitfalls": "Compost projects die when nobody owns the turning: the pile stalls or starts to smell, a neighbor complains, and the host pulls permission — that chain moves faster than you'd think. Match how many scraps you collect to what your rota can actually process, and treat one contaminated batch as a signage problem to fix, not a volunteer to blame.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Find a composting site",
        "description": "Secure a spot with space and some sun — a community garden corner, vacant lot, or willing backyard. Confirm permission and check local rules on composting.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Choose a composting method",
        "description": "Pick what fits your scale: a three-bin hot-compost system, tumblers, or worm bins. Match the method to how much material you expect and how much turning you can manage.",
        "hours": 3,
        "skills": [
          "composting"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Source bins and equipment",
        "description": "Build or buy collection bins and the composting structure. Gather a pitchfork, thermometer, and brown material (leaves, cardboard) to balance the food scraps.",
        "hours": 4,
        "skills": [
          "carpentry",
          "driving"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Set up a collection system",
        "description": "Decide how scraps arrive: a drop-off bin with set hours, or a volunteer pickup route. Give participants small countertop pails and a clear drop schedule.",
        "hours": 4,
        "skills": [
          "organizing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Make clear what's accepted",
        "description": "Post a simple yes/no list (yes: fruit, veg, coffee, eggshells; no: meat, dairy, oils, pet waste). Clear signage prevents contamination that ruins a batch.",
        "hours": 2,
        "skills": [
          "writing",
          "translation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recruit and train a maintenance rota",
        "description": "Compost needs regular turning, moisture checks, and balancing greens and browns. Build a shared schedule and teach volunteers the basics so piles don't smell or stall.",
        "hours": 3,
        "skills": [
          "composting",
          "teaching"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Distribute finished compost",
        "description": "Once compost is ready, share it free with contributors and community gardens. Announce pickup days and bring bags or buckets.",
        "hours": 2,
        "skills": [
          "driving"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Free Little Library & Book Exchange",
    "purpose": "Provide free books 24/7 to encourage reading and sharing, with no library card or fees.",
    "whoItServes": "Kids, families, and readers of all ages, especially in neighborhoods with limited book access.",
    "whatYoullNeed": "A weatherproof book box, a starting collection, a host spot, and light upkeep.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Start with two short conversations: one with whoever's wall or yard will host the box, about placement and what happens if it gets shabby, and one with the families and school nearby about what books they'd actually take home. Line up your steward — the person who'll check it weekly — before the box goes up, not after.",
    "commonPitfalls": "Little libraries don't die from a shortage of books — they die from the wrong ones: someone dumps a box of outdated textbooks, the good titles get buried, rain gets in, and people quietly stop looking. A five-minute weekly steward visit prevents almost all of it; the box needs a person more than it needs donations.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Build or get a weatherproof book box",
        "description": "Make or buy a sturdy, waterproof box on a post or wall. A repurposed cabinet or newspaper box works. Add a clear door and a sloped roof so books stay dry.",
        "hours": 4,
        "skills": [
          "carpentry"
        ]
      },
      {
        "name": "Choose and prep a location",
        "description": "Pick a spot with foot traffic and permission — your own front yard, a community center, or a park edge. Anchor the box firmly and confirm it's allowed.",
        "hours": 1,
        "skills": [
          "outreach"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Stock the initial collection",
        "description": "Gather donated books through a small drive. Aim for a mix: children's books, popular fiction, and practical nonfiction. Start it half-full so there's room to add.",
        "hours": 1.5,
        "skills": [
          "outreach"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Add a sign and simple norms",
        "description": "Post \"Take a book, leave a book — all free.\" Keep it welcoming and rule-light. Add a note inviting all ages and languages.",
        "hours": 0.5,
        "skills": [
          "writing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recruit a steward",
        "description": "Ask someone nearby to check the box weekly: tidy it, remove anything damaged or inappropriate, and rebalance the stock. Five minutes a week keeps it healthy.",
        "hours": 0.5,
        "skills": [
          "outreach"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Community First Aid & Overdose Response Training",
    "purpose": "Train neighbors in first aid, CPR, and overdose reversal so the community can respond in the minutes before professionals arrive.",
    "whoItServes": "Everyone; especially high-impact where EMS response is slow or overdose rates are high.",
    "whatYoullNeed": "Certified trainers, supplies, a space, and a recurring schedule. All medical training should be delivered by certified instructors; this project organizes and hosts that training, it doesn't replace it.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Your first conversation is with the people who'll actually teach — a Red Cross chapter, your health department, or a harm-reduction group. Ask what they need from a host and which dates they can offer, then talk with the folks most likely to witness an emergency — family of people who use drugs, staff at nearby businesses — so the first sessions get built around them.",
    "commonPitfalls": "This project fades when it becomes one big training event that never repeats — skills rust and naloxone expires with nobody noticing. And resist the urge to teach the medical content yourselves; your job is hosting certified instructors, not standing in for them.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Partner with certified trainers",
        "description": "Connect with qualified instructors — the Red Cross, your local health department, or a harm-reduction organization. They deliver the actual medical training; your role is to organize and host it.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Source supplies",
        "description": "Obtain first-aid kits, CPR practice mannequins (often loaned by trainers), and naloxone. Many public health programs distribute naloxone free — ask your health department or harm-reduction groups.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Find space and schedule sessions",
        "description": "Book a room that fits hands-on practice — a community center, library, or clinic. Set recurring dates so people can plan around work.",
        "hours": 2
      },
      {
        "name": "Recruit participants",
        "description": "Promote sessions widely and prioritize people likely to witness emergencies. Keep sign-up easy and free, and offer varied times for shift workers.",
        "hours": 2,
        "skills": [
          "outreach"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Run the training sessions",
        "description": "Host the trainer-led sessions, handle setup and check-in, and make sure everyone gets hands-on practice. Provide take-home reference cards.",
        "hours": 4,
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Distribute kits and refreshers",
        "description": "Send trained people home with a first-aid kit and naloxone where available. Schedule periodic refreshers so skills stay sharp.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "time-bank",
    "name": "Time Bank",
    "purpose": "Let members exchange services by time, where one hour given equals one hour earned, valuing everyone's contribution equally.",
    "whoItServes": "Anyone, especially people rich in time and skills but short on cash.",
    "whatYoullNeed": "A member list, a tracking system, a coordinator, and agreed rules.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Start with conversations, not software: sit down with ten or fifteen neighbors and ask each one what they'd offer and what they'd ask for. If those conversations don't surface variety — rides, tutoring, repairs, cooking — keep recruiting before you build the system.",
    "commonPitfalls": "Time banks rarely die of scandal; they die of silence — people sign up, nobody makes the first request, and it all goes quiet. Have a coordinator actively broker matches for the first months, and hold the one-hour-equals-one-hour line: the moment you debate whether a plumber's hour outranks a babysitter's, it stops being a time bank.",
    "pairsWith": [
      "skill-share",
      "childcare-collective"
    ],
    "learnMore": [
      "what-is-balance",
      "negative-balance"
    ],
    "tasks": [
      {
        "name": "Recruit founding members and inventory skills",
        "description": "Gather an initial group and ask each what they can offer (rides, tutoring, repairs, cooking, gardening) and what they need. The variety of offers is what makes it work.",
        "hours": 5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Choose a tracking system",
        "description": "Pick a way to log hours: dedicated time-bank software, a shared spreadsheet, or a simple ledger. It must record who gave and received hours.",
        "hours": 4,
        "skills": [
          "tech support",
          "data entry"
        ]
      },
      {
        "name": "Set the rules",
        "description": "Agree on the core principle (one hour = one credit, regardless of the task), how members request and confirm exchanges, and what happens if someone's balance runs low.",
        "hours": 4,
        "skills": [
          "facilitation",
          "writing"
        ]
      },
      {
        "name": "Onboard members",
        "description": "Hold a short orientation so people understand the philosophy and the system. Give everyone a few starter credits so exchanges can begin immediately.",
        "hours": 4,
        "skills": [
          "teaching"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Launch a service directory",
        "description": "Publish a searchable list of who offers what. Keep it current so members can find help without asking the coordinator every time.",
        "hours": 4,
        "skills": [
          "data entry"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Coordinate and broker exchanges",
        "description": "Have a coordinator help match needs to offers, especially early on, and nudge quiet members. Over time members connect directly.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "organizing"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Build trust and safety practices",
        "description": "Set norms for exchanges involving homes or vulnerable members (references, not meeting alone where uncomfortable). Add a simple way to flag problems.",
        "hours": 4,
        "skills": [
          "facilitation"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Solidarity Fund (Mutual Aid Cash Assistance)",
    "purpose": "Pool money to give direct, no-strings cash to neighbors facing a crisis.",
    "whoItServes": "People hit by emergencies — a rent shortfall, a medical bill, a utility shutoff.",
    "whatYoullNeed": "A transparent money system, a small stewardship team, a fundraising plan, and clear criteria. Handling pooled money carries real responsibility — use dual sign-off, keep clean records, protect recipient privacy, and get advice on the legal and tax treatment of your fund.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Before you collect a dollar, sit down with the few people you'd trust with pooled money and talk honestly: how dual sign-off will work, what gets published, and what happens when requests outrun the fund. Then find a local nonprofit resource or accountant to walk you through the legal and tax side before the account opens.",
    "commonPitfalls": "Money breaks trust faster than anything else — one unexplained payout or a sloppy ledger can end the fund even when nobody did anything wrong. And there will almost always be more requests than money; if the criteria weren't agreed in advance, saying no case by case burns out the team and breeds resentment.",
    "pairsWith": [
      "resource-hub-dispatch",
      "tenant-union",
      "free-tax-prep"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Form a small stewardship team",
        "description": "Recruit a few trusted people to manage the fund. Define roles clearly and commit to transparency from day one — trust is everything here.",
        "hours": 3,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Set up transparent money handling",
        "description": "Open a dedicated account or use a fiscal sponsor. Require two people to approve payouts, keep a clear ledger, and check whether your structure has tax or legal implications — consult a local nonprofit resource or accountant.",
        "hours": 5,
        "skills": [
          "accounting",
          "paperwork"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Define request and disbursement criteria",
        "description": "Decide who's eligible, typical amounts, how often someone can request, and whether it's first-come or need-weighted. Keep barriers low and avoid requiring proof of hardship where you can.",
        "hours": 4,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Create a simple, low-barrier request form",
        "description": "Build a short, private form asking only what's necessary. Offer multiple ways to apply (online, phone, in person) and protect applicants' privacy.",
        "hours": 2,
        "skills": [
          "writing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Set up fundraising",
        "description": "Combine recurring small donations from members with occasional drives. Be clear with donors that funds go directly to neighbors in need.",
        "hours": 4,
        "skills": [
          "outreach"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Build a decision and payout process",
        "description": "Set a turnaround time, a quick review by the team, and fast payout methods. Speed matters in a crisis. Document each decision simply.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Report back transparently",
        "description": "Share regular summaries — money in, money out, number of neighbors helped — without exposing recipients' identities. Transparency keeps donors giving.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "writing",
          "accounting"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Diaper & Hygiene Supply Bank",
    "purpose": "Distribute free diapers, period products, and hygiene items, which can't be bought with most food assistance.",
    "whoItServes": "Low-income families, infants, menstruating people, and unhoused neighbors.",
    "whatYoullNeed": "Storage, a supply stream, distribution points, and volunteers.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Talk first with the people who already see the families — the pediatric clinic, the food pantry, the church — and ask which sizes and products actually run short and whether they'd host distribution. That one conversation saves you months of guessing.",
    "commonPitfalls": "What hurts most is unpredictability: one big drive, full shelves, then empty months right when families have started counting on you. Watch the real inventory too — newborn sizes pile up while the big sizes run out — and never ask for proof of need; dignity is part of the service.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Find storage and a distribution point",
        "description": "Secure dry, secure storage and a place to hand items out — a closet at a clinic, church, or community center. The distribution spot should feel private and dignified.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set up supply sourcing",
        "description": "Combine bulk buying, donation drives, and connections to diaper-bank networks or wholesalers. Track which sources are steady so you don't run dry.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Sort and inventory by size and type",
        "description": "Organize diapers by size, plus period products and hygiene items. Keep a running count so you know what to request. Sizes for older babies often run short.",
        "hours": 1.5,
        "skills": [
          "organizing",
          "data entry"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Set a fair distribution policy",
        "description": "Decide how much each family gets and how often, with no proof-of-need barrier. Make it predictable so people can rely on it.",
        "hours": 1,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Schedule distribution and staff it",
        "description": "Set regular distribution days, recruit volunteers to hand out supplies, and keep the tone warm and judgment-free.",
        "hours": 2.5,
        "skills": [
          "organizing"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-bike-workshop",
    "name": "Community Bike Workshop",
    "purpose": "Offer free space, tools, and help to fix, build, and earn bikes, making transport affordable and accessible.",
    "whoItServes": "People without cars, youth, commuters, and anyone needing affordable transportation.",
    "whatYoullNeed": "A space, tools, donated bikes and parts, and volunteer mechanics.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Before hunting for a space, talk with the people who'd use the workshop and the mechanics who'd teach — and if there's a community bike shop in a nearby city, visit it and ask what they'd do differently. With your site host, settle storage, access, and insurance up front.",
    "commonPitfalls": "The workshop dies when volunteers fix bikes instead of teaching people to fix them: it becomes a free repair shop, the line grows, and your mechanics burn out. Watch out for drowning in donated junk bikes too — triage ruthlessly — and never let a bike roll out without a brakes-and-tires safety check.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Find a workshop space",
        "description": "Secure a garage, basement, shipping container, or shared community space with room to work and store bikes. Confirm access and any insurance needs.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Gather tools and a workstand",
        "description": "Collect a basic bike toolkit and at least one repair stand through donations or a small budget. Organize tools so they're easy to find and return.",
        "hours": 5,
        "skills": [
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Collect donated bikes and parts",
        "description": "Put out calls for unused bikes and salvageable parts. Sort into \"fixable,\" \"for parts,\" and \"ready to ride.\" A parts stockpile is what keeps the workshop running.",
        "hours": 4,
        "skills": [
          "repair",
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruit volunteer mechanics",
        "description": "Find a few people who can fix bikes and, more importantly, teach others. The goal is helping people learn to repair their own, not doing it for them.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set open hours and an earn-a-bike model",
        "description": "Pick predictable open hours. Consider an earn-a-bike program where someone learns repair skills over a few sessions and leaves with a bike they fixed themselves.",
        "hours": 2,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Establish safety practices",
        "description": "Require eye protection, set rules for tool use, and have a first-aid kit. Always do a safety check (brakes, tires, headset) before any bike leaves.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Newcomer & Translation Support Network",
    "purpose": "Help immigrants and refugees navigate a new place — translation, paperwork, orientation, and community connection.",
    "whoItServes": "Newly arrived immigrants and refugees, and non-English-speaking neighbors.",
    "whatYoullNeed": "Bilingual volunteers, partner organizations, orientation materials, and a request system. Be especially careful with privacy: don't collect immigration status, route legal questions to qualified immigration lawyers, and let community members lead on what support they actually want.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Start by talking with newcomer communities themselves and the organizations already walking alongside them — let them say what support they want rather than designing it for them. And before the first request arrives, have your handoff ready: qualified immigration lawyers you can route every legal question to.",
    "commonPitfalls": "The most serious risk is well-meaning volunteers sliding from interpreting into giving legal or medical advice they're not qualified for — bad immigration guidance can cost someone dearly. And collect the bare minimum of data: one careless record about someone's status can put them in real danger.",
    "pairsWith": [
      "welcome-wagon",
      "legal-aid-clinic",
      "health-navigation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruit bilingual and multilingual volunteers",
        "description": "Find volunteers who speak the languages common in your area and can help with translation, forms, and accompaniment. Match languages to actual local needs.",
        "hours": 4,
        "skills": [
          "translation",
          "outreach"
        ]
      },
      {
        "name": "Map local services and partners",
        "description": "Build a directory of clinics, schools, legal aid, ESL classes, food resources, and immigrant-serving organizations. Newcomers often just need to know what exists and how to reach it.",
        "hours": 5,
        "skills": [
          "outreach",
          "data entry"
        ]
      },
      {
        "name": "Build a request and matching system",
        "description": "Create a simple way for newcomers to ask for help and get matched to a volunteer by language and need. Offer phone and in-person options, not just online.",
        "hours": 3,
        "skills": [
          "organizing",
          "tech support"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Create orientation materials",
        "description": "Put together plain-language guides in relevant languages covering transit, schools, healthcare, and rights. Use visuals so they work across literacy levels.",
        "hours": 4,
        "skills": [
          "writing",
          "translation"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Offer accompaniment for appointments",
        "description": "Arrange for volunteers to go with people to medical, school, or service appointments to interpret and support. Brief volunteers to interpret faithfully, not to give advice they're not qualified for.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "translation"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Set privacy and safety practices",
        "description": "Collect the minimum information needed and never ask for or record immigration status. Store data securely and train volunteers to handle sensitive situations with discretion.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Community Meal / People's Kitchen",
    "purpose": "Cook and share free communal meals on a regular schedule, no questions asked.",
    "whoItServes": "Anyone hungry, isolated, or food-insecure; it also builds connection across the neighborhood.",
    "whatYoullNeed": "A kitchen, cooks, an ingredient pipeline, a serving space, and a volunteer crew. Serving food to the public carries real food-safety responsibilities — check your local rules on permits and certified food handlers, and follow safe storage and temperature practices every time.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Your first two conversations are with the kitchen host — a church hall or community center — about the days you're planning, and with your local health authority about permits and food handling; those shape everything else. Then ask the people who'd come to eat which day and time actually works for them.",
    "commonPitfalls": "A food-safety slip can hurt someone and end the project — temperature and storage rules don't get skipped, not once. The slower death is the same three people cooking every meal until they burn out, so widen the crew and rotate the lead cook from the start.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Find a kitchen and serving space",
        "description": "Secure a kitchen large enough to cook at scale — a church hall, community center, or commercial kitchen — plus space to serve. Confirm availability on your planned days.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Sort out food safety and permits",
        "description": "Check local rules for serving food to the public. You may need a permit, a certified food-handler present, or a licensed kitchen. Learn safe storage and temperature handling.",
        "hours": 4,
        "skills": [
          "food safety"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Build a food supply pipeline",
        "description": "Combine grocery and restaurant donations, bulk purchases, and any garden or gleaning surplus. Track reliable sources so you can plan menus around what you'll have.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Plan menus for scale, diet, and allergies",
        "description": "Design simple, nutritious meals that cook in volume and stretch ingredients. Offer vegetarian options and label common allergens clearly.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cooking"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Recruit a cooking and serving crew",
        "description": "Gather volunteers for prep, cooking, serving, and cleanup. Assign a lead cook per meal and keep roles clear so service runs smoothly.",
        "hours": 3,
        "skills": [
          "cooking",
          "organizing"
        ]
      },
      {
        "name": "Set a schedule and spread the word",
        "description": "Pick a regular day and time so people can rely on it. Promote through flyers, shelters, and word of mouth, keeping the tone warm and open to all.",
        "hours": 2,
        "skills": [
          "graphic design"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Run the meal and clean up",
        "description": "Cook, serve with dignity (table service feels better than a line where possible), and clean the kitchen to required standards. Pack leftovers safely for redistribution.",
        "hours": 5,
        "skills": [
          "cooking"
        ],
        "follows": [
          3,
          4,
          5
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "seed-library",
    "name": "Seed Library & Seed Swap",
    "purpose": "Share free seeds so people can grow food, while preserving locally adapted and heirloom varieties.",
    "whoItServes": "Home gardeners, first-time growers, and community gardens.",
    "whatYoullNeed": "A storage and catalog system, donated seeds, a host spot, and a few stewards.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Talk with the library or community center about hosting the cabinet, and with experienced local gardeners about what genuinely grows in your region — beginners' success rides on regionally suited seed. A nearby nursery or community garden will often gladly donate the starter stock.",
    "commonPitfalls": "A seed library dies quietly: old seed that won't germinate, beginners who conclude they can't garden and never come back. Rotate stock without sentimentality, and don't count on returns — almost nobody saves seed back — so plan restocking around donations, not deposits.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Find a host and storage system",
        "description": "Partner with a library, community center, or garden to host a small cabinet or drawer set. Store seeds cool, dry, and dark in labeled envelopes.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Source initial seeds",
        "description": "Gather donations from gardeners, seed companies' surplus, and end-of-season packets. Favor easy, regionally suited varieties so beginners succeed.",
        "hours": 2,
        "skills": [
          "outreach",
          "gardening"
        ]
      },
      {
        "name": "Organize and label the collection",
        "description": "Sort by type (vegetable, herb, flower) and difficulty. Label each with the plant, the year, and basic growing notes. Note which are easy to save seed from.",
        "hours": 2,
        "skills": [
          "gardening",
          "data entry"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Set borrowing and sharing norms",
        "description": "Keep it simple: take seeds free, grow them, and ideally save and return some at season's end. Post a one-page how-it-works guide.",
        "hours": 1,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Maintain viability and restock",
        "description": "Seeds lose viability over time. Rotate out old stock, run germination checks on doubtful batches, and refill popular varieties.",
        "hours": 1,
        "skills": [
          "gardening"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "digital-literacy",
    "name": "Digital Literacy & Device Lending Program",
    "purpose": "Lend devices and teach digital skills to bridge the gap for people without reliable tech or internet.",
    "whoItServes": "Elders, low-income neighbors, job seekers, and anyone shut out of online services.",
    "whatYoullNeed": "Donated devices, internet access, volunteer tutors, and a space.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Talk first with the people you want to reach — at the library, the senior center, the pantry line — and ask what they actually want to do: telehealth, job applications, photos of the grandkids. Then talk with the library about space and connectivity before you collect a single device.",
    "commonPitfalls": "Lending a device without solving internet access is lending a paperweight — connectivity is half the project. In sessions, the classic mistake is tutors grabbing the mouse and talking in jargon; and never re-lend a device without wiping it, because leaking one borrower's data breaks all the trust you've built.",
    "pairsWith": [
      "community-wifi-mesh",
      "skill-share"
    ],
    "learnMore": [
      "install-app",
      "new-device"
    ],
    "tasks": [
      {
        "name": "Collect and refurbish devices",
        "description": "Gather donated laptops, tablets, and phones. Securely wipe each, update it, and set it up for easy use. Test that everything works before lending.",
        "hours": 8,
        "skills": [
          "tech support",
          "driving"
        ]
      },
      {
        "name": "Set up a lending system",
        "description": "Create a simple checkout: who borrowed what, condition, and due date. Decide loan length and a forgiving return policy built on trust.",
        "hours": 3,
        "skills": [
          "data entry"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Arrange internet access",
        "description": "A device is little use without connectivity. Lend mobile hotspots, partner with the library, or point people to low-cost internet programs and free public WiFi.",
        "hours": 3,
        "skills": [
          "tech support",
          "outreach"
        ]
      },
      {
        "name": "Recruit and train tutors",
        "description": "Find patient volunteers and prep them to teach without jargon. Emphasize going at the learner's pace and never taking over the mouse.",
        "hours": 4,
        "skills": [
          "teaching"
        ]
      },
      {
        "name": "Design a beginner curriculum",
        "description": "Build short lessons on the essentials: email, online safety, job applications, telehealth, government forms, and video calls. Provide printed cheat sheets.",
        "hours": 4,
        "skills": [
          "teaching",
          "writing"
        ]
      },
      {
        "name": "Schedule classes and drop-in help",
        "description": "Offer both structured classes and open \"tech help\" hours. Vary times for people who work, and keep groups small.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "organizing"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Set data security and return policies",
        "description": "Wipe each device between borrowers, teach safe password and privacy habits, and explain how personal data is protected. Have a plan for lost or damaged devices.",
        "hours": 2,
        "skills": [
          "tech support",
          "writing"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Weatherization & Home Repair Brigade",
    "purpose": "Help low-income, elderly, and disabled neighbors with home repairs and weatherization to cut energy bills and improve safety.",
    "whoItServes": "Low-income homeowners, elders, and disabled neighbors who can't do or afford the work.",
    "whatYoullNeed": "Skilled volunteers, materials, tools, and a request system. Stick to work within volunteer competence — route electrical, gas, structural, and roofing jobs to licensed professionals.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Gather your most experienced volunteers first and agree on the scope line together — which jobs you'll take and which go to licensed professionals — before you accept a single request. Treat the first visit to each home as a conversation, not an inspection: the resident decides what gets touched in their house.",
    "commonPitfalls": "The danger is scope creep: the 'small fix' that turns out to be electrical, gas, or roof work beyond volunteer competence — that's where someone gets hurt. And don't promise more visits than the crew can deliver; leaving an elder waiting on help they'd counted on hurts more than an honest no up front.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recruit skilled volunteers",
        "description": "Find people comfortable with basic carpentry, caulking, insulation, and weather-stripping. A couple of more experienced leads can guide the rest.",
        "hours": 4,
        "skills": [
          "carpentry",
          "home repair"
        ]
      },
      {
        "name": "Set the scope of work",
        "description": "Define what you will and won't do. Stick to safe, simple jobs (weatherproofing, grab bars, minor fixes) and rule out anything requiring a licensed trade, like major electrical or gas work.",
        "hours": 2,
        "skills": [
          "home repair"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Build a request and assessment system",
        "description": "Create a way for neighbors to request help, then do a quick visit to scope the job, list materials, and confirm it's within your skills and safety limits.",
        "hours": 3,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Source materials and tools",
        "description": "Gather caulk, weather-stripping, insulation, and basic hardware through donations, discounts, or a small budget. Maintain a shared tool kit.",
        "hours": 4,
        "skills": [
          "driving"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Sort out safety and liability",
        "description": "Use simple waivers, carry first-aid supplies, require proper safety gear, and never attempt work beyond your competence. Consult on liability coverage for volunteer repairs.",
        "hours": 3,
        "skills": [
          "paperwork"
        ]
      },
      {
        "name": "Schedule and run work days",
        "description": "Match jobs to volunteer teams, confirm with the homeowner, and complete the work in a focused session. Respect the home and the resident's wishes throughout.",
        "hours": 5,
        "skills": [
          "organizing",
          "home repair"
        ],
        "follows": [
          1,
          2,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "pet-food-bank",
    "name": "Pet Food Bank & Pet Care Support",
    "purpose": "Provide free pet food and basic care help so people aren't forced to surrender pets over cost.",
    "whoItServes": "Low-income pet owners, elders on fixed incomes, and unhoused neighbors with animals.",
    "whatYoullNeed": "Storage, a pet food supply stream, a distribution point, and vet partnerships.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Talk first with the existing food pantry about distributing together — the same households often need both — and with local vets and pet stores about donations and maybe a vaccine or discount partnership.",
    "commonPitfalls": "Unpredictability does the most damage: one big drive, then empty shelves, when pet owners need to be able to count on you. And watch the tone — any judgment about whether 'poor people should have pets' kills this project faster than running out of kibble.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Find storage and a distribution point",
        "description": "Secure dry, pest-proof storage and a spot to hand out food — often alongside an existing food pantry or community center.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Build a pet food supply stream",
        "description": "Combine donation drives, pet-store and manufacturer donations, and bulk buying. Track what comes in so you can plan distributions.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Sort and inventory by animal and size",
        "description": "Separate dog and cat food (and other animals), note quantities, and check expiration dates. Keep a running count to guide restocking.",
        "hours": 1.5,
        "skills": [
          "organizing",
          "data entry"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Set a distribution policy",
        "description": "Decide how much each household gets and how often, with no proof-of-need barrier. Make it predictable so owners can plan.",
        "hours": 1,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Schedule and staff distribution",
        "description": "Set regular distribution times, recruit volunteers, and keep the tone judgment-free. Many people skip meals to feed their pets — meet them with respect.",
        "hours": 2.5,
        "skills": [
          "organizing"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "youth-mentorship",
    "name": "Youth Mentorship & After-School Program",
    "purpose": "Give kids and teens a safe space after school with homework help, mentorship, and enrichment.",
    "whoItServes": "Youth in under-resourced areas and the working parents who need safe care.",
    "whatYoullNeed": "A safe space, vetted mentors, activities, and snacks. Working with youth carries serious responsibility — vet adults, keep the two-adult rule, follow mandatory-reporting laws, and comply with local rules for youth programs.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Before recruiting a single mentor, talk with parents and with young people themselves about what they need, and put your safety policies in writing — background checks, the two-adult rule, mandatory reporting. No adult spends time with kids until they've cleared that bar.",
    "commonPitfalls": "The worst failure is a safety shortcut: an unvetted adult, or an adult alone with a child — that's never negotiable. The second is mentor churn; for kids who've already been let down, an adult who disappears does harm, so start small and grow only as far as you can supervise and sustain.",
    "pairsWith": [
      "school-supply-program",
      "childcare-collective",
      "community-music"
    ],
    "learnMore": [
      "how-vouching-works"
    ],
    "tasks": [
      {
        "name": "Secure a safe space and set hours",
        "description": "Find a suitable, accessible venue — a school room, library, or community center — and set consistent after-school hours families can rely on.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set child safety and vetting standards",
        "description": "Require background checks for adults working with youth, enforce a two-adult rule so no one is alone with a child, and set clear conduct and reporting policies.",
        "hours": 6,
        "skills": [
          "childcare",
          "writing"
        ]
      },
      {
        "name": "Recruit and train mentors",
        "description": "Find reliable, caring adults and train them on boundaries, youth safety, and how to support without doing the work for kids. Aim for consistency week to week.",
        "hours": 6,
        "skills": [
          "outreach",
          "teaching"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Plan programming",
        "description": "Mix homework help with enrichment — reading, art, sports, life skills. Keep it engaging and let youth help shape what's offered.",
        "hours": 4,
        "skills": [
          "teaching"
        ]
      },
      {
        "name": "Handle enrollment, allergies, and emergency info",
        "description": "Collect parent permission, allergy and medical details, emergency contacts, and pickup authorizations for each child. Store this securely.",
        "hours": 3,
        "skills": [
          "paperwork",
          "data entry"
        ]
      },
      {
        "name": "Source snacks and supplies",
        "description": "Provide a healthy snack (many kids arrive hungry) and gather books, art materials, and games through donations or a small budget.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Run sessions and check in with families",
        "description": "Open the space, supervise closely, run the activities, and keep regular contact with parents about how their kids are doing.",
        "hours": 4,
        "skills": [
          "childcare",
          "teaching"
        ],
        "follows": [
          0,
          2,
          3,
          4
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "gleaning-network",
    "name": "Gleaning Network",
    "purpose": "Rescue surplus produce from farms, orchards, gardens, and markets and redistribute it before it's wasted.",
    "whoItServes": "Food-insecure neighbors and food projects like fridges, pantries, and community meals.",
    "whatYoullNeed": "Volunteers, transport, grower relationships, and short-term storage.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Start with the growers: farms, orchards, and market vendors. Ask what surplus they have and what worries them about hosting volunteers — liability, crop damage — and lock in where the food will go (fridges, pantries, community meals) before the first harvest.",
    "commonPitfalls": "The classic failure is rescuing fruit that then rots in someone's garage — distribution gets arranged before you pick, not after. Harvest windows are short, so a small crew that moves fast beats a long list of names; and one careless glean that damages a field can lose you that grower for good.",
    "pairsWith": [
      "community-fridge",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Find produce sources",
        "description": "Reach out to farms, orchards, market vendors, and neighbors with overloaded fruit trees. Many are glad to have surplus harvested rather than rot.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Recruit a glean crew",
        "description": "Build a list of volunteers who can mobilize quickly when produce is ready. Harvest windows are short, so flexibility matters more than numbers.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Arrange transport and storage",
        "description": "Line up vehicles to move produce and a cool spot to hold it briefly. Coordinate to move food quickly from field to recipients before it spoils.",
        "hours": 3,
        "skills": [
          "driving"
        ]
      },
      {
        "name": "Set up scheduling and dispatch",
        "description": "Create a fast way to alert and confirm volunteers when a glean comes up, since growers often give little notice. A group chat or call list works.",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Sort out liability and food safety",
        "description": "Learn your area's Good Samaritan food-donation protections, agree on simple handling rules, and use a basic waiver so growers feel comfortable hosting gleans.",
        "hours": 3,
        "skills": [
          "paperwork",
          "food safety"
        ]
      },
      {
        "name": "Build distribution channels",
        "description": "Line up where gleaned food goes — community fridges, pantries, meal programs, or direct to families — so it never sits unused.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Run gleans and track poundage",
        "description": "Harvest carefully to protect the site, distribute promptly, and record how much food was rescued. The numbers help recruit volunteers and growers.",
        "hours": 4,
        "skills": [
          "gardening",
          "driving"
        ],
        "follows": [
          0,
          2,
          3,
          5
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-mediation",
    "name": "Community Mediation & Conflict Resolution Network",
    "purpose": "Offer free, neutral mediation for neighbor disputes, resolving conflict without courts or police.",
    "whoItServes": "Neighbors, tenants and landlords, roommates, and community groups in conflict.",
    "whatYoullNeed": "Trained mediators, a neutral space, and a request process. Mediation is for disputes between willing parties — screen out and refer any situation involving violence, abuse, or danger to the appropriate professional or emergency services.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Talk first with an existing community mediation center or trainer — this craft isn't improvised — and before the first case, put your screening line in writing: which disputes you'll take, and where you refer anything involving violence or abuse.",
    "commonPitfalls": "The dangerous failure is mediating what shouldn't be mediated: a 'neighbor dispute' that's really abuse puts someone at risk, so screen every intake. And confidentiality is the project's whole capital — one leaked detail and nobody trusts the service again; look after your mediators too, because this work wears people down.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Recruit and train mediators",
        "description": "Find calm, fair-minded volunteers and get them trained, either through a recognized mediation training or by partnering with an existing community mediation center.",
        "hours": 6,
        "skills": [
          "outreach",
          "facilitation"
        ]
      },
      {
        "name": "Set up a request and intake process",
        "description": "Create a simple way for people to request mediation. During intake, learn the basics from each side and confirm the case is appropriate for mediation.",
        "hours": 3,
        "skills": [
          "organizing",
          "interviewing"
        ]
      },
      {
        "name": "Find neutral meeting spaces",
        "description": "Secure quiet, neutral locations — a library room or community center — where both parties feel safe and on equal footing.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Define the scope and limits",
        "description": "Decide what you'll mediate (noise, shared spaces, minor disputes) and what you won't. Screen out situations involving violence, abuse, or safety risk and refer those to appropriate professionals.",
        "hours": 3,
        "skills": [
          "facilitation",
          "writing"
        ]
      },
      {
        "name": "Establish confidentiality and ground rules",
        "description": "Set clear rules: confidentiality, voluntary participation, respectful turn-taking, and a mediator who guides but doesn't decide. Put them in writing for participants.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Promote the service",
        "description": "Let neighbors, housing groups, and local organizations know free mediation exists, so people reach for it before conflicts escalate.",
        "hours": 3,
        "skills": [
          "outreach",
          "graphic design"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Track outcomes and support mediators",
        "description": "Note resolution rates (without breaching confidentiality) and debrief mediators regularly. The work is draining, so rotate cases and offer support.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "data entry",
          "facilitation"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Reentry Support Network",
    "purpose": "Help people returning from incarceration secure ID, housing, work, and community, easing a notoriously hard transition.",
    "whoItServes": "Formerly incarcerated people and their families.",
    "whatYoullNeed": "Volunteers, partner organizations, and a solid resource directory. Treat people's records and histories as private — lead with respect, follow people's own goals, and refer legal matters to qualified counsel.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Before building anything, sit down with people who have come home themselves and with the reentry organizations, parole offices, and fair-chance employers already working in your area — ask what actually blocks people in the first weeks and where your network fits. Line up a legal-aid contact or qualified attorney now, so when legal questions come up you have somewhere real to send them.",
    "commonPitfalls": "This project dies when it becomes gatekeeping — volunteers deciding who deserves help — or when someone's history leaks and costs them a job or an apartment. It also fails quietly when enthusiasm outpaces follow-through; a broken promise lands harder on someone rebuilding trust than no promise at all.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Build a resource and partner directory",
        "description": "Map services for ID and documents, housing, employment, healthcare, treatment, and benefits. Identify which employers and landlords are open to people with records.",
        "hours": 6,
        "skills": [
          "outreach",
          "data entry"
        ]
      },
      {
        "name": "Recruit and train volunteers",
        "description": "Find nonjudgmental volunteers and train them in trauma-informed, respectful support. People returning home need partners, not gatekeepers.",
        "hours": 5,
        "skills": [
          "outreach",
          "teaching"
        ]
      },
      {
        "name": "Create a welcome and needs intake",
        "description": "Build a simple, dignified way to learn what each person needs most urgently — often ID, a place to stay, and income — and prioritize from there.",
        "hours": 3,
        "skills": [
          "interviewing"
        ]
      },
      {
        "name": "Help with documents and benefits",
        "description": "Assist with replacing ID and Social Security cards, applying for benefits, and other paperwork that's hard to do without an address or internet access.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "paperwork"
        ]
      },
      {
        "name": "Connect to employment and housing",
        "description": "Make warm introductions to fair-chance employers and housing options, and help with applications, resumes, and interview prep.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "outreach",
          "writing"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Offer peer mentorship",
        "description": "Where possible, pair people with mentors who have lived through reentry themselves. That shared experience builds trust faster than anything.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Set privacy and boundary practices",
        "description": "Handle people's histories with strict confidentiality, never pressure anyone to share more than they want, and route legal questions to qualified attorneys.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Community Wood Bank / Heating Assistance",
    "purpose": "Collect and distribute firewood and coordinate heating help so neighbors stay warm through winter.",
    "whoItServes": "Low-income and rural households that heat with wood, and elders who can't gather or split their own.",
    "whatYoullNeed": "A wood source, a processing and storage site, equipment, a trained crew, and a delivery plan. Chainsaws and splitters are dangerous — allow only trained operators, require protective gear, and brief the crew on safety before every session.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Start by talking with the households who heat with wood — rural elders, families the fuel-assistance office already knows — to learn how much they burn and when they run short, then call local tree services about where their wood goes now. Before any saw starts, decide who owns safety: someone experienced enough to train the crew and comfortable telling a volunteer no.",
    "commonPitfalls": "The two ways this hurts people: an untrained volunteer on a chainsaw, and delivering green wood that smokes, coats chimneys with creosote, and doesn't heat. Cutting in October for December means wet wood — the calendar failure is as real as the safety one.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Secure a wood source",
        "description": "Arrange supply from tree services, storm cleanup, downed-tree donations, or sustainably managed lots. Confirm you can legally take and process it.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Find a processing and storage site",
        "description": "Secure a yard or lot where wood can be cut, split, stacked, and seasoned. You need room to keep this season's supply dry and next season's drying.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Get equipment and safety gear",
        "description": "Obtain or borrow a log splitter, chainsaws, and protective gear (chaps, eye and ear protection, gloves). Keep tools maintained and a first-aid kit on site.",
        "hours": 4,
        "skills": [
          "driving",
          "tool repair"
        ]
      },
      {
        "name": "Recruit and train a wood crew",
        "description": "Build a crew and ensure that only properly trained people operate chainsaws and splitters. Run a safety briefing before every work day.",
        "hours": 4,
        "skills": [
          "teaching",
          "outreach"
        ]
      },
      {
        "name": "Build a request and delivery system",
        "description": "Create a way for households to request wood and arrange delivery, since many recipients are elderly or without trucks. Confirm safe stacking near the home.",
        "hours": 3,
        "skills": [
          "organizing",
          "driving"
        ]
      },
      {
        "name": "Set distribution criteria",
        "description": "Decide how much wood each household receives and prioritize those most at risk in cold weather. Keep the process simple and low-barrier.",
        "hours": 2,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Schedule work days and seasoning",
        "description": "Plan cutting and splitting well ahead of winter, because green wood must dry for months before it burns safely. Track what's seasoned and ready.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "community-wifi-mesh",
    "name": "Free Community WiFi / Mesh Network",
    "purpose": "Provide free internet access where it's unaffordable or unavailable.",
    "whoItServes": "Low-income households, students, job seekers, and anyone cut off from reliable internet.",
    "whatYoullNeed": "A backhaul internet connection, routers/mesh nodes, technical volunteers, and host sites.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Walk the blocks you want to cover and knock on doors — talk with the households without service about what they'd actually use it for, and with the people whose rooftops and upper windows could host a node. Before buying hardware, have the bandwidth conversation: find the business, library, or ISP willing to share a line, and confirm in writing that redistribution is allowed.",
    "commonPitfalls": "Mesh networks usually die of maintenance, not construction — the founding techie moves away and nobody else can log into the routers, so document everything and train a second person from day one. The other quiet failure is building where the signal reaches easily instead of where people actually lack access.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Map coverage needs and gaps",
        "description": "Identify which blocks lack affordable access and where signal could reach. Note buildings with line-of-sight and willing hosts. This shapes the whole design.",
        "hours": 4,
        "skills": [
          "tech support"
        ]
      },
      {
        "name": "Secure a backhaul internet connection",
        "description": "Arrange a source of bandwidth to share — a donated business line, an ISP partnership, or a community-network uplink. Confirm the terms allow redistribution.",
        "hours": 5,
        "skills": [
          "outreach",
          "tech support"
        ]
      },
      {
        "name": "Recruit technical volunteers",
        "description": "Find people comfortable with networking who can configure routers and troubleshoot. You only need a couple to start, plus willing learners.",
        "hours": 3,
        "skills": [
          "outreach",
          "tech support"
        ]
      },
      {
        "name": "Source and configure equipment",
        "description": "Gather routers, mesh nodes, and antennas through donations or a small budget. Configure them for an open or simply-shared network and test coverage.",
        "hours": 10,
        "skills": [
          "tech support"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Find host sites for nodes",
        "description": "Place nodes where they extend reach — rooftops, upper windows, and porches with power and permission. Get written okay from each host and cover any tiny power cost.",
        "hours": 5,
        "skills": [
          "outreach"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Set acceptable-use and privacy norms",
        "description": "Post simple rules, avoid logging users' activity, and be clear that an open network isn't private. Point users to basic safety practices like HTTPS and VPNs.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Maintain and expand the network",
        "description": "Check nodes regularly, replace failed hardware, and add coverage as new hosts join. Document the setup so others can help maintain it.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "tech support"
        ],
        "follows": [
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "mental-health-peer-support",
    "name": "Mental Health Peer Support Circle",
    "purpose": "Offer a safe, regular, peer-led space for people to share and support one another — a complement to, not a replacement for, professional care.",
    "whoItServes": "Anyone navigating stress, isolation, grief, or mental health challenges who wants peer connection.",
    "whatYoullNeed": "Trained facilitators, a private space, and clear boundaries with a crisis-referral plan. Peer support complements professional mental health care — it doesn't replace it. Facilitators are not therapists, and there must always be a clear plan to connect anyone in crisis to qualified professional or emergency resources.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Your first conversations are with the people who might facilitate and with local mental health providers — a clinic, crisis line, or counselor who agrees to be your referral path before the first circle ever meets. Don't open the doors until facilitators are trained and everyone can say plainly what the circle is and isn't.",
    "commonPitfalls": "The dangerous failure is drift: a warm circle slowly becomes the only support someone has, facilitators start playing therapist, and there's no plan for the night someone is in real crisis. The quieter one is facilitator burnout — if the people holding space have no support of their own, the circle folds within a year.",
    "pairsWith": [
      "neighborhood-care-network",
      "disability-support-network",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what",
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Recruit and train facilitators",
        "description": "Find warm, steady people and have them complete peer-support or active-listening training. Be clear that facilitators are peers who hold space, not clinicians who diagnose or treat.",
        "hours": 5,
        "skills": [
          "facilitation",
          "outreach"
        ]
      },
      {
        "name": "Define the circle's scope and boundaries",
        "description": "Establish that this is peer support, not therapy or crisis care. Write down what the circle is for and what's outside its role, so expectations are clear to everyone.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Build a crisis referral and escalation plan",
        "description": "Prepare clear steps for when someone is in distress beyond peer support: how to gently connect them to professional help or crisis services, and when to involve emergency support. Keep current local and national resources on hand.",
        "hours": 3,
        "skills": [
          "writing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Find a private, safe space",
        "description": "Secure a quiet, comfortable, confidential room where people can speak freely. Consistency of place helps people feel safe to return.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set confidentiality and group ground rules",
        "description": "Agree on confidentiality, no advice-giving unless asked, no interrupting, and the right to pass. Share these at the start of every session.",
        "hours": 3,
        "skills": [
          "facilitation",
          "writing"
        ]
      },
      {
        "name": "Schedule and promote sessions",
        "description": "Pick a steady time, keep groups a manageable size, and promote it in a way that reduces stigma. Make clear it's free and open.",
        "hours": 3,
        "skills": [
          "outreach",
          "organizing"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Support facilitators and prevent burnout",
        "description": "Hold regular check-ins for facilitators to debrief and decompress. Rotate who leads, and make sure they have their own support too.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "facilitation"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Community Cleanup & Green Space Restoration",
    "purpose": "Clear litter, restore neglected lots and parks, and create shared green space.",
    "whoItServes": "The whole neighborhood — cleaner, safer, greener space benefits everyone.",
    "whatYoullNeed": "Volunteers, supplies, site permissions, and a disposal plan. Neglected sites can hold real hazards — never pick up needles or unknown chemicals by hand; use tools and a sharps container, and dispose of hazardous finds under local rules.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Walk the neighborhood with the people who live closest to the neglected spots — they know which lots matter, who owns them, and what's been tried before — and check whether the city or a friends-of-the-park group already runs cleanups you can plug into. Sort out ownership, permission, and where the trash goes before you pick a date.",
    "commonPitfalls": "Cleanups fail in two ways: bags of collected trash sit on the curb for weeks because nobody arranged disposal, and a beautifully cleared lot is waist-high again by fall because there was no plan past the one big day. And a volunteer reaching bare-handed for a needle can turn a good morning into a hospital visit.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Identify and prioritize sites",
        "description": "Walk the area and list spots that need attention — trash-heavy corners, overgrown lots, neglected parks. Prioritize by impact and feasibility.",
        "hours": 1.5
      },
      {
        "name": "Get permissions and a disposal plan",
        "description": "Confirm who owns each site and get permission. Arrange for trash and debris removal in advance — coordinate a dumpster or a city pickup so bags don't just pile up.",
        "hours": 2,
        "skills": [
          "outreach",
          "paperwork"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gather supplies and safety gear",
        "description": "Collect gloves, bags, grabbers, and high-visibility vests. Include a rigid sharps container and a plan for any hazardous items found.",
        "hours": 1.5,
        "skills": [
          "driving"
        ]
      },
      {
        "name": "Recruit and organize volunteers",
        "description": "Spread the word and sign people up. Assign team leads and zones so the day is organized rather than chaotic.",
        "hours": 2,
        "skills": [
          "outreach",
          "organizing"
        ]
      },
      {
        "name": "Run the cleanup or restoration day",
        "description": "Hold the event, keep teams safe and hydrated, and celebrate the visible result together. Take before-and-after photos to motivate future turnout.",
        "hours": 3,
        "skills": [
          "organizing",
          "photography"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "free-tax-prep",
    "name": "Free Tax Prep & Financial Empowerment Clinic",
    "purpose": "Help low-income neighbors file taxes for free and claim the credits and refunds they're owed.",
    "whoItServes": "Low-income workers, families eligible for tax credits, elders, and students.",
    "whatYoullNeed": "Trained and certified preparers, a space, computers, and a scheduling system. Tax returns must be prepared by certified volunteers through a recognized program — this clinic helps with standard filings, not complex situations that need a tax professional.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Your first call is to an established free-filing program like VITA — talk with their coordinator about certification timelines, software, and what a new site needs, because you shouldn't run this alone. Then talk with the neighbors you hope to serve about when they can actually come and what's kept them from filing before.",
    "commonPitfalls": "One wrong return can cost a family their refund or trigger an audit — that's why uncertified volunteers preparing taxes is the line this project must never cross. The gentler failures: launching in March when certification takes months, and someone making the bus trip only to be turned away over a document nobody told them to bring.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Get preparers trained and certified",
        "description": "Have volunteers complete a recognized free-tax-prep certification (such as the IRS VITA program) so returns are accurate and properly authorized. This is non-negotiable.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "accounting"
        ]
      },
      {
        "name": "Partner with a recognized free-filing program",
        "description": "Affiliate with an established program for software, support, and credibility. They provide the filing tools and quality checks you shouldn't build alone.",
        "hours": 4,
        "skills": [
          "outreach",
          "paperwork"
        ]
      },
      {
        "name": "Set up a space and equipment",
        "description": "Secure a venue with computers, reliable internet, and enough privacy for people to share sensitive financial information comfortably.",
        "hours": 3,
        "skills": [
          "tech support"
        ]
      },
      {
        "name": "Build an appointment and intake system",
        "description": "Create appointments and a clear checklist of documents people must bring (ID, income forms, prior return). This avoids wasted trips and long waits.",
        "hours": 3,
        "skills": [
          "organizing",
          "data entry"
        ]
      },
      {
        "name": "Promote to eligible neighbors",
        "description": "Get the word out, emphasizing that filing can unlock refunds and credits many people miss. Reach workers, families, and elders who often qualify.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "outreach",
          "graphic design"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Ensure data security and privacy",
        "description": "Protect every scrap of personal and financial data: secure devices, no unnecessary copies, locked storage, and a clear retention-and-destruction policy.",
        "hours": 3,
        "skills": [
          "tech support"
        ]
      },
      {
        "name": "Offer financial empowerment follow-up",
        "description": "Where wanted, connect people to budgeting help, safe banking, and benefits screening. Keep it optional and refer complex situations to qualified professionals.",
        "hours": 2,
        "skills": [
          "accounting"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Community Market / Free Farm Stand",
    "purpose": "Run a regular free or pay-what-you-can stand distributing fresh produce and staples.",
    "whoItServes": "Food-insecure neighbors and people in areas without affordable fresh food.",
    "whatYoullNeed": "A produce supply, a stand or location, volunteers, and a regular schedule.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Start with the supply conversations — visit farms, grocers, and community gardens to learn what surplus actually exists and on what rhythm — and talk with neighbors in the area you'd serve about where they already walk and what food they'd actually take home. Pick the spot with the people who'll use it, not for them.",
    "commonPitfalls": "A stand that shows up erratically teaches people to stop counting on it — consistency matters more than abundance. The other failures: supply that dries up after the first enthusiastic month, and anything at the table (forms, questions, sorting people) that makes taking food feel like applying for it.",
    "pairsWith": [
      "gleaning-network",
      "bulk-buying-coop",
      "community-garden"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Secure produce and goods supply",
        "description": "Source food through gleaning, community gardens, farm and grocer donations, and bulk buys. Aim for variety and reliability so the stand isn't bare.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Find a location and stand setup",
        "description": "Pick a visible, accessible spot with permission — a park edge, parking lot, or transit stop. Arrange tables, shade, and signage.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Decide the model",
        "description": "Choose fully free, pay-what-you-can, or a mix. Whatever you pick, make sure no one is ever turned away for inability to pay.",
        "hours": 1,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Set up display, storage, and food safety",
        "description": "Keep produce cool and presentable, handle food safely, and have coolers or shade for hot days. Discard anything spoiled.",
        "hours": 2,
        "skills": [
          "food safety"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Recruit and schedule volunteers",
        "description": "Line up people to pick up produce, set up, staff the stand, and pack down. Assign clear roles for each market.",
        "hours": 2,
        "skills": [
          "organizing",
          "outreach"
        ]
      },
      {
        "name": "Promote and set a regular schedule",
        "description": "Pick a consistent day and time and publicize it widely. Predictability is what turns a stand into a dependable resource.",
        "hours": 2,
        "skills": [
          "outreach",
          "graphic design"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Run the stand and handle leftovers",
        "description": "Set up, distribute warmly with no judgment, and route any leftover produce to fridges, pantries, or meal programs so nothing is wasted.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "welcome-wagon",
    "name": "Welcome Wagon: New Neighbor & New Parent Support",
    "purpose": "Greet newcomers and new parents with practical help, local info, and a real welcome into the community.",
    "whoItServes": "People who've just moved in, new and expecting parents, and anyone needing a friendly start.",
    "whatYoullNeed": "Volunteers, info packets, donated welcome items, and a referral system.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Talk first with the people who meet newcomers before you do — landlords, school front offices, clinics, midwives and pediatric nurses — about how they'd refer someone with consent. Then ask a few recent arrivals and new parents what would have actually helped in their first month, and build the packet and the basket around their answers.",
    "commonPitfalls": "The way this goes wrong is by feeling like surveillance — showing up uninvited at a stranger's door, or passing along names without consent, turns a welcome into an intrusion. It also fades quietly when the founding greeters burn out and newcomers go unnoticed for months at a stretch.",
    "pairsWith": [
      "newcomer-translation-network",
      "diaper-hygiene-bank",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "invite-someone"
    ],
    "tasks": [
      {
        "name": "Decide who you'll welcome and how",
        "description": "Define your focus — new residents, new parents, or both — and the form the welcome takes (a visit, a basket, a call). Keep it opt-in and never intrusive.",
        "hours": 1,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Build a local info packet",
        "description": "Assemble a clear guide to local services, transit, schools, healthcare, and your mutual aid program. Offer it in the languages spoken in your area.",
        "hours": 3,
        "skills": [
          "writing",
          "translation"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Assemble welcome baskets",
        "description": "Put together useful items — pantry basics, household goods, and for new parents, a few baby essentials or a home-cooked meal. Source through donations.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "outreach",
          "organizing"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruit and train greeters",
        "description": "Find friendly volunteers and coach them to be warm and respectful, to read whether someone wants connection, and to never pressure or pry.",
        "hours": 2,
        "skills": [
          "outreach",
          "teaching"
        ]
      },
      {
        "name": "Set up a referral and sign-up system",
        "description": "Create simple ways for people to be referred or to opt in — through landlords, clinics, schools, or a sign-up form. Respect privacy throughout.",
        "hours": 2,
        "skills": [
          "organizing",
          "data entry"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Library of Things",
    "purpose": "Lend household and event items people rarely need to own — kitchen gear, party and camping supplies, baby equipment, projectors, and more.",
    "whoItServes": "Anyone; it saves money, cuts clutter, and reduces waste.",
    "whatYoullNeed": "Storage, donated items, a catalog and checkout system, and a couple of librarians.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Before collecting a single item, ask members what they'd actually borrow — that survey is the project's foundation — and talk with the public library or a community center about hosting, since a trusted institution solves your storage and credibility problems at once. Recruit your two librarians before the donations arrive, not after.",
    "commonPitfalls": "Libraries of things die of clutter: saying yes to every donation fills the room with broken breadmakers nobody wants, while the pressure washer everyone asked for is still missing. The other killer is unpredictable hours — if people can't count on when to pick up and return, they quietly go back to buying.",
    "pairsWith": [
      "tool-lending-library",
      "toy-library",
      "free-store"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Survey what the community wants to borrow",
        "description": "Ask members what they'd use but hate to buy — folding tables, a punch bowl, a tent, a carpet cleaner, a baby stroller. The answers set your starting inventory.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Find storage and open hours",
        "description": "Secure a closet, room, or container to hold items, and set predictable pickup/return hours so borrowing is easy.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Collect, clean, and test items",
        "description": "Gather donations, then clean, test, and check each item for safety. Set aside anything broken, recalled, or unhygienic.",
        "hours": 5,
        "skills": [
          "driving"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Catalog and photograph inventory",
        "description": "Log each item with a photo and its condition in a spreadsheet or lending app. Number items so they're easy to track in and out.",
        "hours": 4,
        "skills": [
          "data entry",
          "photography"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Write borrowing rules and a trust policy",
        "description": "Set loan length, quantity limits, and a forgiving return policy. Keep it built on trust rather than fees, and note items needing extra care or cleaning.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Set up checkout and train librarians",
        "description": "Create a simple sign-out (name, contact, item, due date) with a quick condition photo. Walk volunteers through the catalog and process.",
        "hours": 3,
        "skills": [
          "data entry",
          "teaching"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Maintain, sanitize, and grow the collection",
        "description": "Clean and inspect returned items, repair what you can, and add the most-requested things over time.",
        "hours": 2,
        "skills": [
          "repair"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Laundry & Shower Access Program",
    "purpose": "Provide free laundry and shower access so people can stay clean with dignity.",
    "whoItServes": "Unhoused neighbors, people without working facilities, and low-income families.",
    "whatYoullNeed": "Access to machines and showers (a partner site or mobile unit), supplies, and volunteers. Guests' dignity and privacy come first — require no personal information to use the service, keep shower areas private and secure, and follow local health rules for shared or mobile facilities.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Start with two sets of conversations: with unhoused neighbors and the outreach workers who know them, about which hours and locations would actually work — and with a laundromat owner, gym, or faith site about hosting. That host conversation is delicate; be honest about who's coming and settle privacy, cleaning, and scheduling expectations before the first guest arrives.",
    "commonPitfalls": "This program dies when the host relationship sours — one bad interaction with no protocol behind it, and the space is gone — or when hours shift so often that people cross town to find a locked door. And every piece of paperwork you require at the door turns away someone who needed a shower more than you needed their name.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Secure laundry and shower access",
        "description": "Partner with a laundromat, gym, faith site, recreation center, or arrange a mobile unit. Confirm dependable times and that the space offers privacy.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Source supplies",
        "description": "Gather detergent, clean towels, soap, shampoo, and other toiletries through donations or a small budget. Include some clean clothing if you can.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Set up a sign-up and time-slot system",
        "description": "Create a fair way to claim laundry loads and shower slots so wait times stay reasonable and everyone gets a turn.",
        "hours": 3,
        "skills": [
          "organizing",
          "data entry"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Establish hygiene and safety protocols",
        "description": "Set cleaning routines between users, ensure private and secure shower areas, and protect everyone's dignity and safety throughout.",
        "hours": 3,
        "skills": [
          "writing"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruit and train volunteers",
        "description": "Find volunteers to run intake, manage supplies, and clean between uses. Train them to treat every guest with warmth and respect.",
        "hours": 3,
        "skills": [
          "outreach",
          "teaching"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Set a schedule and spread the word",
        "description": "Pick consistent hours and let outreach workers, shelters, and street-connected neighbors know when and where the service runs.",
        "hours": 3,
        "skills": [
          "outreach"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Voter Registration & Civic Engagement Drive",
    "purpose": "Register voters and help people take part in elections and local decisions — strictly nonpartisan.",
    "whoItServes": "Eligible residents, especially those historically underrepresented at the polls.",
    "whatYoullNeed": "Trained volunteers, registration materials, accurate rules, and good locations. Keep the drive strictly nonpartisan and follow all election and registration laws precisely — provide accurate information only and never advocate for a party or candidate.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Before anyone tables, talk with your local election office — they'll tell you exactly what drives may and may not do, and some areas require training or registration first. Then connect with the League of Women Voters or another established nonpartisan group; borrowing their materials and experience beats learning election law by trial and error.",
    "commonPitfalls": "The unforgivable failures are legal ones: a stack of completed forms forgotten in someone's trunk past the deadline disenfranchises every person who trusted you, and one volunteer talking up a candidate can taint the whole drive. The subtler miss is handing out registration cards without ever mentioning where or how to actually vote.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Learn the rules for registration drives",
        "description": "Research your area's laws on registering voters: deadlines, what volunteers may and may not do, how forms must be handled, and ID requirements. Following these exactly is essential.",
        "hours": 3,
        "skills": [
          "paperwork"
        ]
      },
      {
        "name": "Train nonpartisan volunteers",
        "description": "Coach volunteers to help everyone register regardless of views, and to never promote a party or candidate. Nonpartisanship protects the drive and the community's trust.",
        "hours": 3,
        "skills": [
          "teaching"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gather materials and accurate information",
        "description": "Collect registration forms and verified, current info on deadlines, ID rules, polling places, and mail-in options. Bad info does more harm than none.",
        "hours": 2,
        "skills": [
          "writing"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pick high-traffic locations and events",
        "description": "Set up where eligible residents already gather — markets, transit hubs, campuses, community events — with any required permission to table.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Run registration tabling",
        "description": "Staff the table, help people register accurately, and submit forms promptly within legal deadlines. Keep the tone welcoming and informative.",
        "hours": 4,
        "skills": [
          "outreach"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Help with the next steps",
        "description": "Beyond registering, help people know how, when, and where to vote, including mail-in options and rides to the polls. Registration alone isn't participation.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Community Health Navigation Program",
    "purpose": "Help neighbors find and access healthcare — clinics, insurance, prescriptions, and appointments.",
    "whoItServes": "Uninsured and underinsured people, elders, newcomers, and anyone lost in the health system.",
    "whatYoullNeed": "Trained navigators, a resource directory, provider partnerships, and a request system. Navigators connect people to care — they don't provide medical advice or diagnosis. Refer all clinical questions to qualified healthcare professionals.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Start by visiting the free and sliding-scale clinics you'll refer to — introduce yourselves, ask which referrals help them and which swamp them, and let those conversations seed your directory. Settle the boundary before the first request comes in: navigators handle logistics and paperwork, every clinical question goes to a professional, so know exactly which nurse line or clinic you'll hand those to.",
    "commonPitfalls": "The sharp edge is a well-meaning navigator sliding into medical advice — a casual 'that doesn't sound serious' can cost someone weeks of needed care. This also fails when the directory quietly goes stale, sending people to clinics that closed or programs that ended; a wrong number costs someone who was already on their last try.",
    "pairsWith": [
      "rides-transportation",
      "newcomer-translation-network",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Build a healthcare resource directory",
        "description": "Compile free and low-cost clinics, sliding-scale providers, prescription-assistance programs, dental and vision options, and mental health services. Keep it current.",
        "hours": 6,
        "skills": [
          "data entry",
          "outreach"
        ]
      },
      {
        "name": "Recruit and train navigators",
        "description": "Find volunteers and train them to connect people to care — not to give medical advice. Their job is guidance and logistics, with clinical questions referred to professionals.",
        "hours": 5,
        "skills": [
          "outreach",
          "teaching"
        ]
      },
      {
        "name": "Set up a request and intake system",
        "description": "Create a private, low-barrier way for people to ask for help and describe their situation, with phone and in-person options, not just online.",
        "hours": 3,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Help with insurance and enrollment",
        "description": "Assist people in understanding and applying for coverage they qualify for (such as Medicaid or marketplace plans) and gathering the needed documents.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "paperwork"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Offer appointment and prescription support",
        "description": "Help schedule appointments, set reminders, navigate prescription costs, and link to the rides program for transportation to care.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "organizing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Set privacy practices for health information",
        "description": "Treat all health details as highly sensitive: collect the minimum, store it securely, and never share without consent. Train navigators on confidentiality.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Partner with clinics and providers",
        "description": "Build relationships with local clinics and providers for smoother referrals and to learn about new low-cost services as they open.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Toy Library & Play Resource Lending",
    "purpose": "Lend toys, games, and play equipment so families can access variety without buying.",
    "whoItServes": "Families with young children, especially on tight budgets; it also cuts waste and clutter.",
    "whatYoullNeed": "Storage, donated toys, a catalog and checkout, cleaning supplies, and librarians.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Talk with the families you hope to serve — at daycare pickup, a storytime, a playgroup — about which toys their kids outgrow fastest and which hours they could actually make, then ask a community center, church, or branch library about a shelf or a room. Line up a childcare-savvy volunteer to own safety checks before donations start arriving.",
    "commonPitfalls": "Toy libraries fail on safety and on pieces: one recalled toy or choking hazard that slips through breaks families' trust for good, and puzzles that come back short a piece make the whole collection feel junky within months. Strict inspection and counted bags are the whole game.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Find storage and open hours",
        "description": "Secure shelving in a community center, library, or shared space, and set predictable pickup and return hours families can plan around.",
        "hours": 1.5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Collect, clean, and safety-check toys",
        "description": "Gather donations, then clean and inspect each toy. Check for recalls, broken parts, and choking hazards, and set aside anything unsafe for young children.",
        "hours": 3.5,
        "skills": [
          "driving",
          "childcare"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Catalog and bag with all pieces",
        "description": "Log each toy with a photo and age range, and bag multi-piece sets with a count so nothing goes missing. Number items for easy tracking.",
        "hours": 2,
        "skills": [
          "data entry",
          "photography"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Write borrowing rules",
        "description": "Set loan length, how many toys at once, and a gentle return/missing-pieces policy. Keep it trust-based and forgiving.",
        "hours": 1,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Set up checkout and train librarians",
        "description": "Create a simple sign-out (name, contact, item, due date) and walk volunteers through the catalog, the cleaning routine, and the rules.",
        "hours": 2,
        "skills": [
          "data entry",
          "teaching"
        ],
        "follows": [
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "food-preservation",
    "name": "Food Preservation & Canning Collective",
    "purpose": "Teach and do group canning and preserving so seasonal surplus lasts and less food is wasted.",
    "whoItServes": "Gardeners, gleaners, and families wanting to stretch food through the year.",
    "whatYoullNeed": "A kitchen, canning and preserving equipment, knowledgeable leads, and produce. Home preservation carries real food-safety risks, including botulism, when done incorrectly — always follow current, tested guidelines from a reputable source and never improvise processing times or methods.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Find your knowledge before your kitchen: call the local extension service or a certified master food preserver and ask them to train your leads or review your plans, and talk with gardeners and gleaners about which surplus actually peaks when. Book the kitchen around the harvest calendar, not the other way around.",
    "commonPitfalls": "The failure that matters is invisible: a jar sealed with an improvised method or a grandmother's untested recipe can carry botulism and look perfectly fine on the shelf. The ordinary failure is timing — tomatoes ripen on their own schedule, and a collective that holds its first session in November preserves nothing.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Secure a suitable kitchen",
        "description": "Find a kitchen with stovetops, counter space, and water for processing and cleanup. A church hall, community center, or commercial kitchen works well.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Learn safe preservation methods",
        "description": "Have your leads study tested, research-based methods from a recognized source (such as a university extension service). Improper canning can cause serious illness, so always follow tested recipes and processing times exactly.",
        "hours": 4,
        "skills": [
          "food safety",
          "cooking"
        ]
      },
      {
        "name": "Gather equipment and jars",
        "description": "Collect water-bath and/or pressure canners, jars, lids, and tools through donations or a small budget. Check that pressure canners are in safe working order.",
        "hours": 3,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Source produce",
        "description": "Bring in seasonal surplus from gleaning, gardens, farms, or bulk buys. Time sessions to when produce is abundant and cheap.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Plan group canning sessions",
        "description": "Pick recipes suited to the produce and the group's skill level, and organize stations so the work flows safely and efficiently.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "cooking",
          "organizing"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Teach and run sessions safely",
        "description": "Lead the group through the process, enforcing safe handling, correct processing times, and proper sealing. Make it a teaching session so skills spread.",
        "hours": 4,
        "skills": [
          "cooking",
          "teaching"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Share preserved food and track",
        "description": "Divide the preserved goods among participants and projects like the fridge or pantry. Label every jar with contents and date, and note what worked for next time.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "organizing"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Free Haircut & Personal Grooming Days",
    "purpose": "Offer free haircuts and grooming to restore dignity, confidence, and a fresh start.",
    "whoItServes": "Unhoused neighbors, job seekers, low-income families, and elders.",
    "whatYoullNeed": "Volunteer licensed stylists and barbers, a space, supplies, and sanitation.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Start with two conversations: one with a licensed stylist or barber willing to bring a colleague, and one with the people you hope to serve — a shelter, day center, or workforce program can tell you which days and settings would actually feel comfortable. Once a stylist and a host site both say yes, the rest is supplies and scheduling.",
    "commonPitfalls": "This project stumbles when it feels like a charity line instead of a salon — rushed cuts, no say in the style, cameras out for social media. Ask each person what they want, skip the photos unless they offer, and never let unlicensed volunteers cut to stretch capacity; one hygiene problem can end the whole program.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recruit licensed stylists and barbers",
        "description": "Find professionals willing to volunteer their skills. Licensed practitioners ensure safe, quality service and proper sanitation.",
        "hours": 2.5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Find a space with sanitation",
        "description": "Secure a venue with water access, good lighting, and cleanable surfaces — a community center, salon after hours, or faith site.",
        "hours": 1.5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Source equipment and supplies",
        "description": "Gather clippers, scissors, capes, combs, mirrors, and disposables. Include grooming extras like razors and toiletries to send home.",
        "hours": 2,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Set up sanitation and licensing compliance",
        "description": "Establish tool sterilization between clients and follow local rules for offering haircuts to the public. Cleanliness protects everyone.",
        "hours": 1.5,
        "skills": [
          "paperwork"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Run grooming days",
        "description": "Host the event, keep the atmosphere warm and respectful, and treat each person as a valued guest rather than a recipient of charity.",
        "hours": 2.5,
        "skills": [
          "organizing"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "mutual-aid-moving-crew",
    "name": "Mutual Aid Moving Crew",
    "purpose": "Help people move who can't afford movers — those leaving unsafe situations, facing eviction, or downsizing.",
    "whoItServes": "Low-income neighbors, people fleeing unsafe homes, elders, and disabled neighbors.",
    "whatYoullNeed": "Volunteers with vehicles and strength, moving supplies, and clear safety practices. For anyone leaving an unsafe situation, keep the new address, dates, and details strictly confidential, and follow that person's lead on timing and safety.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Before recruiting a single truck, talk with the people who already field these calls — domestic violence advocates, tenant organizers, senior services — about how requests should reach you and what confidentiality they'll expect, since some moves mean someone leaving an unsafe home. Then gather three or four volunteers with strong backs and one vehicle, and scope your first small move together.",
    "commonPitfalls": "Moving crews get hurt or burned out fast: an over-ambitious job with too few hands, a volunteer lifting wrong, an address shared in a group chat that should never have left the coordinator's phone. Keep moves inside your stated limits, and treat the details of every safety-related move like they could put someone in danger — because they could.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Recruit a crew and vehicles",
        "description": "Gather volunteers able to lift and carry safely, plus access to trucks or vans. Keep a roster with availability so you can assemble a crew quickly.",
        "hours": 2.5,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Gather moving supplies",
        "description": "Collect dollies, furniture straps, moving blankets, and reusable boxes through donations. Shared supplies make moves faster and safer.",
        "hours": 1.5,
        "skills": [
          "driving"
        ]
      },
      {
        "name": "Build a request and assessment system",
        "description": "Create a way to request help and scope each move: how much, stairs or elevator, distance, and timing. This lets you plan crew size and equipment.",
        "hours": 2,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Sort out safety and liability",
        "description": "Train volunteers in safe lifting, use simple waivers, and check insurance for any vehicles used. Protecting volunteers and clients matters.",
        "hours": 2,
        "skills": [
          "paperwork"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Set scheduling and dispatch",
        "description": "Match requests to available crews and confirm with everyone the day before. Keep a backup list since moves can't easily be postponed.",
        "hours": 1.5,
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Define scope and limits",
        "description": "Decide what you'll handle and what you won't (no hazardous materials, pianos, or jobs beyond the crew's safe capacity). Refer those elsewhere.",
        "hours": 1,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Run moves and follow up",
        "description": "Carry out the move safely and respectfully, then check the person is settled. Connect them to other projects (free store, welcome wagon) as needed.",
        "hours": 3.5,
        "skills": [
          "driving"
        ],
        "follows": [
          1,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "disability-support-network",
    "name": "Disability & Accessibility Support Network",
    "purpose": "Organize disabled neighbors and allies for mutual support, accessibility, and advocacy — led by disabled people themselves.",
    "whoItServes": "Disabled and chronically ill neighbors.",
    "whatYoullNeed": "An accessible communication system, peer leaders, and a resource directory. Peer support complements professional care — refer medical, personal-care, and legal questions to qualified providers, and treat members' health information as private.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "This network only works if disabled neighbors are at the table from the very first conversation — not consulted later, but deciding what it is. Start by asking two or three disabled people you know to co-found it with you (or, if you're disabled yourself, to share the load), and let their access needs shape how the first meeting happens: format, location, and pace included.",
    "commonPitfalls": "The classic failure is well-meaning allies building a program for disabled people that disabled people didn't ask for, in formats they can't use. The quieter one is drifting into an informal care service: peer support can't safely substitute for medical or personal care, so keep referring those needs to qualified providers and guard members' health details like the private information they are.",
    "pairsWith": [
      "neighborhood-care-network",
      "rides-transportation",
      "health-navigation"
    ],
    "learnMore": [
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Center disabled leadership",
        "description": "Ensure disabled members lead and shape the network. \"Nothing about us without us\" is the core principle — allies support, they don't direct.",
        "hours": 3,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Build an accessible communication system",
        "description": "Offer multiple ways to participate (phone, text, online, in person), use plain language, and ensure materials work with screen readers and varied needs.",
        "hours": 3,
        "skills": [
          "accessibility",
          "tech support"
        ]
      },
      {
        "name": "Map needs and resources",
        "description": "Learn what members need and catalog local resources: accessible transport, equipment sources, services, and benefits help. Identify the biggest gaps.",
        "hours": 5,
        "skills": [
          "outreach",
          "data entry"
        ]
      },
      {
        "name": "Set up a mutual support exchange",
        "description": "Create a way for members to give and receive help — errands, advocacy buddies for appointments, check-ins — matched to capacity and need.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Create an equipment lending pool",
        "description": "Gather and lend mobility aids and assistive equipment, sanitized between users. Many devices sit unused after they're outgrown or no longer needed.",
        "hours": 4,
        "skills": [
          "outreach",
          "organizing"
        ]
      },
      {
        "name": "Offer advocacy and navigation support",
        "description": "Help members navigate benefits, accommodations, and services. Share information and accompaniment, and refer legal and medical questions to qualified professionals.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "paperwork"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Set accessibility standards for all program events",
        "description": "Develop a checklist (venue access, seating, interpretation, sensory needs, materials) so every project in your wider program is welcoming to disabled members.",
        "hours": 3,
        "skills": [
          "accessibility",
          "writing"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Books to Prisoners & Letter-Writing Program",
    "purpose": "Send free books and letters to incarcerated people to reduce isolation and support learning.",
    "whoItServes": "Incarcerated people and, through them, their families and communities.",
    "whatYoullNeed": "Donated books, volunteers, postage, and knowledge of each facility's mail rules. Every facility's mail rules are strict and different — packages that break them get rejected, so follow them exactly, and have volunteers always use the program's address, never a home address.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Before collecting a single book, call an established books-to-prisoners group — most will gladly share which facilities they cover, which rules trip people up, and where requests go unanswered. Then get the current mail policy in writing for the one or two facilities you'll start with; what incarcerated people actually request should shape your collection, not whatever donors clear off their shelves.",
    "commonPitfalls": "This project dies by rejected packages: a used book where only new is allowed, a hardcover, a forgotten labeling rule — postage wasted and someone's long-awaited parcel sent back. It can also hurt volunteers who write from home; every letter goes out on the program's address, no exceptions, however warm the correspondence becomes.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Learn facility mailing rules",
        "description": "Each prison has strict, specific rules — many require books be new and sent directly from a publisher or approved retailer, with limits on content and quantity. Research these carefully, because rule-breaking mail is rejected.",
        "hours": 5,
        "skills": [
          "paperwork"
        ]
      },
      {
        "name": "Gather books and a workspace",
        "description": "Collect donated books (within facility rules) and set up a sorting and packing area. Keep a varied selection: dictionaries, education, fiction, and reentry resources are often most requested.",
        "hours": 4,
        "skills": [
          "outreach",
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Set up a request-handling system",
        "description": "Create a process to receive and track requests from incarcerated people, who write in with topics or titles. Match requests to available books.",
        "hours": 3,
        "skills": [
          "data entry",
          "organizing"
        ]
      },
      {
        "name": "Recruit and train volunteers",
        "description": "Train volunteers to match requests, pack within each facility's rules, and write thoughtful notes. Accuracy on the rules prevents wasted postage and rejected parcels.",
        "hours": 3,
        "skills": [
          "outreach",
          "teaching"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cover postage and logistics",
        "description": "Postage is the main ongoing cost. Fundraise for it, use the cheapest compliant shipping, and arrange regular mailing days.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Organize a letter-writing program",
        "description": "Match volunteers as pen-pals where wanted, with clear safety and privacy guidelines (use the program's address, not personal ones). Connection matters as much as books.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Community Music & Instrument Program",
    "purpose": "Lend instruments and offer free lessons and jam sessions so music is accessible to everyone.",
    "whoItServes": "Kids and adults who can't afford instruments or lessons.",
    "whatYoullNeed": "Donated instruments, volunteer teachers, a space, and a lending system.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Start with the musicians already around you — the guitarist at the corner church, the retired band director, the teens who play — and ask what they'd enjoy teaching and when. One conversation with a music shop about discounted repairs and one with a space that tolerates noise, and you're most of the way to your first jam.",
    "commonPitfalls": "The lending pool quietly empties when instruments go out faster than they come back playable, so budget repair time from the start and keep the return policy forgiving but real. And watch for lessons drifting toward the already-confident: the kid who has never touched an instrument needs the warmest welcome, not the shortest slot.",
    "pairsWith": [
      "library-of-things",
      "skill-share",
      "youth-mentorship"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Collect and repair instruments",
        "description": "Gather donated instruments and have them cleaned, restrung, or repaired so they're playable. Build a mix across types and skill levels.",
        "hours": 5,
        "skills": [
          "repair",
          "driving"
        ]
      },
      {
        "name": "Set up an instrument lending system",
        "description": "Create a checkout that tracks who has what, with care instructions and a forgiving return policy. Number and log each instrument.",
        "hours": 2,
        "skills": [
          "data entry"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruit volunteer teachers",
        "description": "Find musicians willing to teach beginners patiently. They needn't be professionals — enthusiasm and basic skill go a long way.",
        "hours": 3,
        "skills": [
          "outreach",
          "music"
        ]
      },
      {
        "name": "Find a space for lessons and jams",
        "description": "Secure a room where noise is fine — a community center, school, or faith hall. Set predictable times for lessons and open playing.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Schedule lessons and jam sessions",
        "description": "Offer beginner lessons and open jams for all levels. Keep sign-up easy and times varied for people who work or are in school.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "organizing"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Set care and return expectations",
        "description": "Teach borrowers basic instrument care and what to do if something breaks. Keep it trust-based and supportive, not punitive.",
        "hours": 1,
        "skills": [
          "writing"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "School Supply & Backpack Program",
    "purpose": "Provide free school supplies and backpacks so kids start the year ready and confident.",
    "whoItServes": "Low-income families with school-age children.",
    "whatYoullNeed": "Supply donations or funds, storage, a distribution point, and volunteers.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Your first conversation is with a school — a counselor, family liaison, or parent coordinator who knows the real supply lists and which families quietly go without. Let them shape what you collect and how families hear about it; a giveaway routed through people parents already trust reaches kids a flyer never will.",
    "commonPitfalls": "The predictable failure is a mountain of donated folders and none of the notebooks the lists actually ask for — collecting what's easy to give instead of what's needed. The one that stings is a distribution that feels like a means test; skip the income paperwork, let kids pick their own backpack, and nobody leaves feeling inspected.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Get supply lists and gauge need",
        "description": "Partner with local schools to learn the actual supply lists by grade and estimate how many families need help. This keeps donations relevant.",
        "hours": 1.5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Run supply drives and bulk-buy",
        "description": "Combine donation drives with bulk purchases for the most-needed items. Bulk buying stretches money furthest on basics like notebooks and pencils.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "outreach",
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Sort and assemble by grade level",
        "description": "Organize supplies and pack backpacks matched to each grade's list. An assembly-line packing session with volunteers moves quickly.",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Set up storage and a distribution point",
        "description": "Secure dry storage and a welcoming spot to hand out backpacks, often at a school, community center, or alongside another back-to-school event.",
        "hours": 1.5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Schedule and staff distribution",
        "description": "Hold the giveaway before school starts, staffed by friendly volunteers. Let kids pick a backpack where possible — choice adds dignity.",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "legal-aid-clinic",
    "name": "Legal Aid Clinic & Know Your Rights Program",
    "purpose": "Connect neighbors to free legal help and teach people their rights.",
    "whoItServes": "Anyone facing legal issues without means — housing, immigration, debt, family, or benefits matters.",
    "whatYoullNeed": "Volunteer lawyers and law students, a space, partner legal aid organizations, and scheduling. Individual legal advice must come from qualified, licensed attorneys (or supervised law students) — this program organizes access and shares general rights information, it is not itself a source of legal advice.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Nothing here starts before you have lawyers: your first calls are to the local legal aid office, the bar association's pro bono program, and a law school clinic, asking what they'd need to show up — and where the gaps are that a neighborhood clinic could actually fill. Let those partners define the clinic's scope with you before you announce anything to neighbors.",
    "commonPitfalls": "The dangerous failure is a caring volunteer sliding from information into advice — a well-meant \"you should just sign it\" can wreck someone's case, so keep that line bright and rehearsed. The slower one is intake outpacing attorneys: a waitlist of desperate people with no lawyer in the room breaks trust faster than never opening at all.",
    "pairsWith": [
      "tenant-union",
      "court-support",
      "newcomer-translation-network"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Partner with lawyers and legal aid",
        "description": "Recruit licensed attorneys, or law students supervised by attorneys, to provide the actual legal advice. Build referral ties with established legal aid organizations.",
        "hours": 6,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Define scope and referral pathways",
        "description": "Decide which matters the clinic can address and set clear pathways to refer complex or specialized cases. Be upfront about what the clinic can and can't do.",
        "hours": 3,
        "skills": [
          "writing"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Set up a space and intake",
        "description": "Secure a private, confidential venue and create an intake with a document checklist so attorneys can use limited time well.",
        "hours": 3,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Build a confidential appointment system",
        "description": "Create appointments that protect privacy. Legal matters are sensitive, so guard people's information carefully throughout.",
        "hours": 3,
        "skills": [
          "organizing",
          "data entry"
        ]
      },
      {
        "name": "Develop know-your-rights materials and workshops",
        "description": "Create clear, accurate guides and run workshops on common rights (tenant, worker, immigration, encounters with authorities). Frame these as general information, not individual legal advice.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "writing",
          "teaching"
        ]
      },
      {
        "name": "Promote and schedule clinics",
        "description": "Set recurring clinic dates and spread the word through partner organizations and the wider mutual aid program. Offer interpretation for non-English speakers.",
        "hours": 3,
        "skills": [
          "outreach",
          "translation"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Protect confidentiality and check conflicts",
        "description": "Establish strict confidentiality and a basic conflict-of-interest check so the same volunteer never advises opposing parties. Train everyone on these duties.",
        "hours": 3,
        "skills": [
          "paperwork"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Mutual Aid Resource Hub & Dispatch",
    "purpose": "Act as the coordinating backbone — a single point where needs and offers are matched across all of your program's projects.",
    "whoItServes": "Everyone in the program — members seeking help, volunteers offering it, and project leads needing coordination.",
    "whatYoullNeed": "An intake system, a volunteer and resource roster, coordinators, and a master directory. The hub holds sensitive information about neighbors' lives — collect only what's needed, guard it carefully, and share details only with the people who need them to help.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "The hub coordinates projects, so start by sitting down with each project's lead: what requests do they get, what do they wish they could hand off, and how do they want to receive matches. Agree together on one shared intake and a privacy baseline — a hub imposed on projects gets routed around; one built with them becomes the front door.",
    "commonPitfalls": "Hubs die two ways: the intake fills with requests nobody follows to completion, so word spreads that calling does nothing; or one heroic coordinator holds every thread until they burn out and the program loses its memory. Track each request to a real close, rotate shifts early, and collect less information than you think you need.",
    "pairsWith": [
      "emergency-preparedness",
      "rides-transportation",
      "solidarity-fund"
    ],
    "learnMore": [
      "post-something",
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Set up a single intake for needs and offers",
        "description": "Create one easy front door — a phone line, form, and in-person option — where anyone can say what they need or what they can give. One point of entry prevents people falling through the cracks.",
        "hours": 4,
        "skills": [
          "organizing",
          "tech support"
        ]
      },
      {
        "name": "Build a volunteer and resource roster",
        "description": "Maintain a current list of volunteers (skills, availability, location) and what each project can offer, so requests can be matched fast.",
        "hours": 4,
        "skills": [
          "data entry"
        ]
      },
      {
        "name": "Create a matching and dispatch process",
        "description": "Establish how a request gets routed to the right project or volunteer and how quickly. Define response-time goals and how requests are tracked to completion.",
        "hours": 4,
        "skills": [
          "organizing"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Maintain a master resource directory",
        "description": "Keep a living directory of all your projects plus external services (shelters, clinics, food, legal aid) so the hub can route people anywhere help exists.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "data entry"
        ]
      },
      {
        "name": "Recruit and train coordinators",
        "description": "Build a team to staff rotating dispatch shifts so the hub stays responsive without burning anyone out. Train them on the process and the directory.",
        "hours": 3,
        "skills": [
          "outreach",
          "teaching"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Set data privacy and follow-up practices",
        "description": "Decide what information you collect, how it's stored and protected, and how you confirm a need was actually met. Collect the minimum and guard it carefully.",
        "hours": 4,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Track unmet needs and gaps",
        "description": "Log requests you couldn't fill. Recurring gaps reveal where your program should start its next project — turning the hub into a planning tool, not just a switchboard.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "data entry"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Harm Reduction Supply Distribution",
    "purpose": "Get naloxone, test strips, and safer-use supplies into the hands of people who may need them — meeting neighbors where they are, no judgment attached.",
    "whoItServes": "People who use drugs, their friends and families, and anyone likely to witness an overdose — which, in most neighborhoods, is anyone.",
    "whatYoullNeed": "Overdose-response training, a naloxone source (state program, pharmacy, or partner org), kit supplies, and a small distribution crew. Handing out supplies is not medical care — everyone distributing must complete overdose-response training first, and the law on what you can carry (test strips, syringes) varies a lot by place, so confirm yours before you stock anything. Keep local crisis and treatment lines printed in every kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Don't buy anything yet: your first step is a conversation with the nearest established harm reduction program and with people who actually use these supplies — they'll tell you what's needed, what's already covered, and how to show up without judgment. Get your core crew through overdose-response training and confirm your local law on strips and syringes before a single kit is packed.",
    "commonPitfalls": "This goes wrong when you show up as strangers — distributing where you have no relationships, or attaching lectures and conditions that teach people to avoid you — and when you get ahead of the law or your training, which can cost a volunteer a paraphernalia charge. Slower and partnered beats fast and alone here, every time.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Get trained and find a harm reduction partner",
        "description": "Have your core crew complete an overdose-response and naloxone training — many health departments and harm reduction orgs run them free. Partner with an established program; they've already solved supply, legal, and trust problems you don't need to re-solve.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Check the local law on supplies",
        "description": "Naloxone access is protected almost everywhere, but test strips and syringes are still classed as paraphernalia in some places. Find out exactly what you can legally carry and hand out — your partner org or a legal aid clinic can tell you quickly. Write it down for volunteers.",
        "hours": 3,
        "skills": [
          "research"
        ]
      },
      {
        "name": "Source naloxone and kit supplies",
        "description": "Order naloxone through a state distribution program, a pharmacy standing order, or your partner org. Add whatever else is legal where you are: fentanyl and xylazine test strips, wound care, hygiene items.",
        "hours": 4,
        "follows": [
          1
        ]
      },
      {
        "name": "Assemble kits with plain-language inserts",
        "description": "Pack kits with simple, multilingual instructions: how to recognize an overdose, how to give naloxone, call emergency services, never use alone. Include local crisis and treatment lines in every kit. Assembly goes fast with a table full of people.",
        "hours": 3,
        "skills": [
          "translation"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Set up distribution rounds and fixed points",
        "description": "Plan regular walking or driving rounds through the places people actually are, and ask bars, corner stores, libraries, and venues to keep a no-questions-asked box. Low barrier is the whole point — no forms, no lecture.",
        "hours": 4,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Restock, track, and keep training fresh",
        "description": "Note what runs out and what sits, log expiration dates on the naloxone, and hold refresher trainings as new volunteers join. If a kit reverses an overdose, that's worth (gently) recording.",
        "hours": 2,
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Court Support & Accompaniment",
    "purpose": "Make sure no neighbor faces a court date alone — company in the courtroom, a ride there, childcare during the hearing, and letters of support when the defense asks for them.",
    "whoItServes": "Neighbors facing criminal, immigration, eviction, or family court dates, and their families — getting to court alone can cost people jobs, childcare, and hope.",
    "whatYoullNeed": "Reliable volunteers, a hearing calendar, and ties to public defenders. Court support is presence and logistics, not legal advice — volunteers never advise on a case and always follow the lead of the person's own attorney. Courtrooms have strict conduct rules, so everyone attending needs to know them cold.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Start with the people whose dates these are: support happens only at the invitation of the person facing court, and in step with their attorney. Introduce yourselves first to the public defender's office and any court-watch or bail-fund groups already at the courthouse, and let them tell you which hearings need company and how to be useful without ever touching the legal side.",
    "commonPitfalls": "The harm here comes from freelancing: a volunteer \"explaining\" a plea in the hallway, case details discussed where a prosecutor can overhear, a visible gallery reaction that irritates a judge — any of which can hurt the very person you came for. The quieter failure is logistics: an unconfirmed court date or a ride that falls through can mean a missed hearing and a warrant.",
    "pairsWith": [
      "legal-aid-clinic",
      "reentry-support",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Connect with defenders and existing court groups",
        "description": "Introduce yourselves to the public defender's office, immigration legal aid, and any court-watch or bail-fund groups already working. They'll tell you where support is most needed and how to plug in without getting in the way.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Write the ground rules: support, not law",
        "description": "Put it in writing: volunteers never give legal advice, never discuss case details in public areas of the courthouse, and always defer to the person's own lawyer. Add courtroom conduct — arrive early, dress plainly, phones off, no reactions from the gallery.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Build an intake and hearing calendar",
        "description": "Create a simple way for people to ask for support and a shared calendar of dates, courtrooms, and what each person needs — company, a ride, childcare, or all three. Court dates move constantly, so confirm the day before.",
        "hours": 3,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Train accompaniment volunteers",
        "description": "Walk volunteers through a courthouse visit: security, finding the room, where to sit, and how to just be steady, warm company through a stressful wait. Pair every new volunteer with an experienced one for their first date.",
        "hours": 3,
        "skills": [
          "teaching"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Coordinate rides and childcare for hearings",
        "description": "Line up drivers for court mornings and childcare pairs who can watch kids during hearings — many courtrooms don't allow children, and a hearing missed over childcare can mean a warrant.",
        "hours": 3,
        "skills": [
          "driving",
          "childcare"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Organize support letters when the defense asks",
        "description": "When someone's attorney requests character or community-support letters, coordinate neighbors to write them — following the lawyer's guidance on content, tone, and deadline exactly.",
        "hours": 2,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Pop-Up Cooling & Warming Center",
    "purpose": "Open a neighborhood climate refuge — a cool room in a heat wave, a warm one in a cold snap — ready before the weather turns dangerous, not after.",
    "whoItServes": "Elders, unhoused neighbors, people without working AC or heat, outdoor workers, and anyone whose housing can't keep up with the weather.",
    "whatYoullNeed": "A host site with climate control and bathrooms, supplies, and trained hosts on shifts. Hosts are neighbors, not medics — train everyone to spot heat exhaustion and hypothermia and to call emergency services early rather than late, and settle the host site's insurance and liability question before the first activation, not during it.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "The host site is the relationship everything rests on, so start there: sit down with the librarian, pastor, or hall manager and work through the uncomfortable questions together — hours, keys, insurance, what happens if someone needs to stay overnight — before the first forecast forces them. At the same time, ask outreach workers and senior-building staff who actually needs the refuge, so the location and hours fit the people it's for.",
    "commonPitfalls": "This project fails in the gap between planning and weather: a trigger nobody quite agreed on, so the center opens a day late, or a liability question left vague until someone collapses and the host pulls out for good. Put the activation threshold in writing, run one practice opening before the season, and make sure every host knows to call emergency services early, not last.",
    "pairsWith": [
      "emergency-preparedness",
      "community-wood-bank",
      "laundry-shower-access"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Find a host site with climate control",
        "description": "Ask libraries, faith sites, union halls, and community centers for a room with reliable AC and heat, bathrooms, and step-free access. Get a written okay covering hours, who holds keys, and what happens if it's needed overnight.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set activation triggers and an alert plan",
        "description": "Decide in advance exactly what opens the center — a forecast temperature, a heat index, a wind chill — so nobody has to make a judgment call at midnight. Set up a phone tree or group chat that puts hosts on standby a day ahead.",
        "hours": 2
      },
      {
        "name": "Stock supplies",
        "description": "Gather water, electrolyte packets, blankets, folding cots or comfortable chairs, fans, phone chargers, and a first-aid kit. Store it all at the site in labeled bins so any host can find things.",
        "hours": 3,
        "skills": [
          "driving"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Recruit and train shift hosts",
        "description": "Find enough volunteers for two per shift and train them: greeting people without paperwork, spotting heat exhaustion and hypothermia, when to call emergency services, and de-escalation basics. Warmth in the human sense matters as much as the thermostat.",
        "hours": 4,
        "skills": [
          "teaching"
        ]
      },
      {
        "name": "Build the shift rota",
        "description": "Prepare a shift schedule you can trigger on a day's notice — openers, closers, and overnight coverage if you offer it. Keep a reserve list, since heat waves flatten volunteers too.",
        "hours": 2,
        "skills": [
          "organizing"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Spread the word before the season",
        "description": "Make multilingual flyers with the triggers and location, and get them to clinics, senior buildings, outreach workers, and corner stores before the first heat wave or cold snap — not during.",
        "hours": 3,
        "skills": [
          "graphic design",
          "translation"
        ]
      },
      {
        "name": "Open, host, and reset each activation",
        "description": "Run the center for the duration of the weather event: sign people in loosely (a count, not IDs), keep supplies flowing, and check on anyone sleeping. Afterward, clean, restock, and note what ran short.",
        "hours": 3,
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Community Oral History Project",
    "purpose": "Record elders' and neighbors' stories before they're lost — and keep the tellers in charge of what happens to them.",
    "whoItServes": "Elders with stories nobody has asked to hear, longtime residents watching the neighborhood change, and every neighbor who comes after.",
    "whatYoullNeed": "A phone or simple recorder, a quiet spot, consent forms, and a safe place to keep files. Recordings are personal data — each participant owns their story, decides where it's shared, and can change their mind later. Nothing goes public without their written okay.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Start with one elder who trusts you and ask if they'd share a story — that first recording teaches you more than any plan, and their word vouches for you with the next storyteller. Before you press record with anyone, go through the consent form together and ask what they'd want to happen to the recording; that conversation is the project.",
    "commonPitfalls": "The way this hurts someone is a story traveling further than its teller agreed to — a clip posted, a name attached, a detail that was meant for you alone. The way it quietly dies is recordings piling up unlabeled on one person's phone until a lost device erases years of voices; label and back up each session the week it happens.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Write a plain-language consent form",
        "description": "One page, no legalese: what's being recorded, where it might be shared, and the participant's right to pause, skip questions, or withdraw the recording later. Translate it into the languages your storytellers actually speak.",
        "hours": 2,
        "skills": [
          "writing",
          "translation"
        ]
      },
      {
        "name": "Gather gear and a question list",
        "description": "A phone with a voice memo app is plenty; add a cheap lapel mic if you can. Draft open questions that invite stories — \"tell me about the street when you arrived\" — and practice on each other once.",
        "hours": 2
      },
      {
        "name": "Record story sessions",
        "description": "Sit with one storyteller at a time in a quiet, comfortable place. Go over the consent form together first, then mostly listen — the best interviews are the ones where you talk least.",
        "hours": 4,
        "skills": [
          "listening"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Archive and share back, on their terms",
        "description": "Label each recording with the date, names, and what was agreed about sharing. Keep two copies somewhere safe, give every storyteller their own copy, and share publicly only the pieces each person approved.",
        "hours": 2,
        "follows": [
          2
        ]
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Community Solar & Energy Cooperative",
    "purpose": "Pool neighbors' resources into shared renewable energy that cuts everyone's bills — especially for the renters and households who could never put panels on a roof of their own.",
    "whoItServes": "Renters, low-income households, and anyone shut out of rooftop solar by their roof, their landlord, or their budget.",
    "whatYoullNeed": "Committed members, technical and financial know-how you can borrow or learn, a host site or an existing community-solar program to join, and partner organizations. One thing stated plainly: energy cooperatives carry real financial and legal complexity — get advice from qualified professionals on structure, financing, and contracts before anyone signs anything.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Before any panels or paperwork, talk to two groups: neighbors who'd actually join, to gauge real commitment, and a solar co-op a town or state over that's already done it — they'll tell you which model fits your area's rules and which mistakes cost them money. Then read those local rules yourselves, because they, not your enthusiasm, decide what's possible.",
    "commonPitfalls": "Solar co-ops die in the gap between excitement and signatures: a year of meetings about a model your state's rules never allowed, or a contract signed without professional review that locks members into terms nobody understood. The other killer is fuzzy money — if members can't see plainly what they put in and what comes back, trust erodes and the co-op unravels.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Gather members and assess interest",
        "description": "Recruit households interested in lower-cost clean energy and find out how committed they really are — vague enthusiasm and a signed-up member are different things. Your numbers shape which models are realistic, so count honestly before you plan.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Learn the models and local rules",
        "description": "Research how community solar works where you live: state laws, net metering, subscription programs, cooperative structures. The rules vary enormously from place to place and they determine what's actually possible — do this before falling in love with any one model.",
        "hours": 5,
        "skills": [
          "research"
        ]
      },
      {
        "name": "Find a site or program to join",
        "description": "Look for a host roof or piece of land for a shared array, or check whether an existing community-solar program will take your group as collective subscribers — joining one is often much faster than building. Weigh both paths with your members before committing.",
        "hours": 4,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Sort out financing and legal structure",
        "description": "Decide how the project is funded and governed, and form the cooperative properly. This is the step with real legal and financial implications — bring in qualified professionals to review the structure and every contract, and don't sign until they have.",
        "hours": 5,
        "skills": [
          "paperwork",
          "accounting"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Partner with installers and providers",
        "description": "Line up reputable installers or providers, compare more than one bid, and confirm warranties and long-term maintenance in writing. A cheap install with no maintenance plan is an expensive one in five years.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set up the bill-credit and membership system",
        "description": "Work out exactly how savings or credits flow to members and how membership and payments work. Make it transparent and easy to understand — a member should be able to see, on one page, what they put in and what comes back.",
        "hours": 3,
        "skills": [
          "accounting",
          "data entry"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Educate members on energy use",
        "description": "Help members read their bills and cut their consumption — a kilowatt saved beats a kilowatt generated. Pair the solar savings with plain efficiency tips so households see the difference on paper.",
        "hours": 3,
        "skills": [
          "teaching"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Worker Cooperative & Job Skills Incubator",
    "purpose": "Help neighbors build job skills and launch worker-owned cooperatives — livelihoods where the people doing the work own the workplace and make the decisions.",
    "whoItServes": "Unemployed and underemployed neighbors, and anyone who wants a real stake in where they work.",
    "whatYoullNeed": "Mentors with business and cooperative experience, training space and materials, startup support you can point ventures toward, and partnerships — cooperative developers, lenders who know co-ops, and your own skill-share program.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Start with conversations, not a curriculum: sit down with interested members about what they can do and want to build, and look for the skill clusters that could actually become a venture. At the same time, find your area's cooperative developer or an existing worker co-op willing to mentor — their scars are your syllabus, and formation without that guidance is where groups get hurt.",
    "commonPitfalls": "This fails two ways: as a training program that never launches anything, because nobody pushed a skills cluster toward a real venture — or as a launch that skips the boring parts, incorporating on a downloaded template and discovering the governance and tax mess two years in. It also quietly dies when one organizer holds every mentor and funder relationship; share those contacts from day one.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Assess member skills and goals",
        "description": "Sit down with members and learn what they can do and what they want to build. You're looking for clusters — three people who can cook, a crew with trade skills, five who clean — because a cluster of skills is the seed of a viable cooperative venture.",
        "hours": 4,
        "skills": [
          "interviewing"
        ]
      },
      {
        "name": "Offer job-readiness and skills training",
        "description": "Run sessions on resumes, interviews, trades, digital skills, and financial literacy. Draw on your skill-share program and bring in outside experts for what nobody local can teach — the goal is capable members whether or not a co-op forms around them.",
        "hours": 5,
        "skills": [
          "teaching"
        ]
      },
      {
        "name": "Teach the cooperative model",
        "description": "Walk members through worker ownership and democratic governance: how profits are shared, how decisions get made, and how it all differs from a traditional business. People can't choose a model they've never seen — use real co-ops as examples.",
        "hours": 4,
        "skills": [
          "teaching",
          "facilitation"
        ]
      },
      {
        "name": "Support cooperative formation",
        "description": "When a group is ready, help them write a business plan and choose a legal structure. Connect them to lawyers and accountants who know cooperatives rather than improvising the legal and accounting steps — incorporation done wrong is expensive to undo.",
        "hours": 5,
        "skills": [
          "paperwork"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Connect to startup resources",
        "description": "Build a live list of microloans, grants, cooperative-development funds, and incubators, and help ventures actually apply. Most co-op money is out there but badly signposted — your map of it is worth real dollars.",
        "hours": 3,
        "skills": [
          "research"
        ]
      },
      {
        "name": "Provide mentorship",
        "description": "Pair each new venture with an experienced cooperator or business mentor who checks in through the early, fragile stages. The first year is where co-ops fail; a steady mentor who has seen the pattern before changes the odds.",
        "hours": 3
      },
      {
        "name": "Build peer support among ventures",
        "description": "Bring the ventures together into a network where co-ops share lessons, refer customers to each other, and buy from each other. Co-ops that trade with each other survive downturns that kill isolated ones.",
        "hours": 3,
        "skills": [
          "organizing"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Elder Companionship & Meal Delivery",
    "purpose": "Bring regular meals and friendly visits to homebound elders — the food matters, and the ten minutes of conversation at the door often matters more.",
    "whoItServes": "Isolated, homebound, or frail elderly neighbors — and the families who worry about them from far away.",
    "whatYoullNeed": "Dependable volunteers you've screened, a meal source, planned routes, and simple safety practices for the moment a door goes unanswered.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Start with the meal source and the first five elders, not a sign-up sheet: talk to the community meal crew or a couple of willing cooks about what they can reliably produce, and ask senior-service workers, parish nurses, and pharmacists who's actually going without. Screen your first volunteers before the first delivery, not after — the trust you're building lives or dies on who walks through those doors.",
    "commonPitfalls": "The dangerous failure is a missed signal — a volunteer who shrugs off an unanswered door because nobody wrote down what to do, or an allergy that never made it onto the route sheet. The slow failure is unreliability: elders plan their day around the visit, and a route that skips weeks teaches them not to count on you. Better five elders served every single week than twenty served sometimes.",
    "pairsWith": [
      "community-meal",
      "neighborhood-care-network",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Identify homebound elders",
        "description": "Find elders through clinics, senior services, faith groups, and word of mouth. Keep it respectful and strictly opt-in — you're offering a meal and company, not signing anyone up for surveillance.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Recruit and screen volunteers",
        "description": "Anyone entering an elder's home gets vetted: references and basic checks, no exceptions for friends-of-friends. Then aim for consistency — elders do better with the same familiar face at the door each week than with a rotating cast.",
        "hours": 4,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Arrange a meal source",
        "description": "Line up meals from a people's kitchen, willing home cooks, or restaurants donating portions. Pay attention to nutrition and easy reheating, and label every container with its contents — an unlabeled meal is a gamble for someone with allergies.",
        "hours": 4,
        "skills": [
          "cooking",
          "food safety"
        ]
      },
      {
        "name": "Plan delivery routes and schedule",
        "description": "Group elders into efficient routes and set a dependable rhythm — same days, roughly the same times. Build a few unhurried minutes of conversation into every stop; for many elders, that's the real delivery.",
        "hours": 3,
        "skills": [
          "driving",
          "organizing"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Record dietary, allergy, and emergency info",
        "description": "For each elder, record dietary needs, allergies, medications that matter around food, and emergency contacts. Keep it secure and need-to-know — the driver needs the allergy, not the whole medical history.",
        "hours": 3,
        "skills": [
          "data entry"
        ]
      },
      {
        "name": "Establish a wellness-check protocol",
        "description": "Write down exactly what a volunteer does when an elder doesn't answer or seems unwell: who to call first, when to involve family or emergency services, and how to note what happened. Deciding this in advance beats improvising on a doorstep.",
        "hours": 3,
        "skills": [
          "writing"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Support volunteers and gather feedback",
        "description": "Check in with volunteers regularly, rotate routes when someone needs a break, and ask the elders themselves how the project could serve them better. They'll tell you things the volunteers never see.",
        "hours": 2
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Disaster Relief Distribution Hub",
    "purpose": "Stand up a hub that can receive, sort, and move supplies fast when disaster hits — because the first days after a flood or fire are won or lost on logistics.",
    "whoItServes": "Residents hit by floods, storms, fires, and other disasters — starting with the neighbors least able to travel or wait.",
    "whatYoullNeed": "A pre-arranged site with a backup, supply-sourcing pipelines, a surge volunteer team, and coordination with the emergency preparedness network — nearly all of it arranged before any disaster, because afterward is too late.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "The hub exists on paper long before it exists in a parking lot, so start with the emergency preparedness network — they hold the contact tree and the risk picture — and with the honest question of which building would actually let you in at six in the morning after a flood. Get the site agreement and the backup settled first; every other task keys off an address.",
    "commonPitfalls": "Relief hubs fail in two directions: the hub that exists only as a plan nobody rehearsed, so the real event burns its first day on questions a practice run would have answered — and the hub that opens its doors to a donation flood it can't sort, becoming a warehouse of unusable clothes while people need water. The quieter harm is distribution with barriers: the moment someone must prove they deserve help, you've recreated the system you built this to bypass.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Pre-identify a hub site and backup",
        "description": "Find a building or lot that can take deliveries, sort goods, and host a distribution line — plus a backup in case the first is damaged or unreachable. Confirm access and keys with the owners now, in calm weather; a site you can't get into is no site.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Build supply-sourcing pipelines",
        "description": "Arrange in advance where water, food, hygiene, and cleanup supplies would come from — suppliers, partner orgs, drives. Just as important: a way to learn what people actually need after an event, so you aren't buried in the wrong things.",
        "hours": 4,
        "skills": [
          "outreach",
          "organizing"
        ]
      },
      {
        "name": "Set up intake, sorting, and inventory",
        "description": "Design how donations get received, sorted, and tracked from the moment a truck arrives. Every hub that's drowned in unsorted goods skipped this step — decide your categories, labels, and simple counts before you need them.",
        "hours": 4,
        "skills": [
          "organizing",
          "data entry"
        ]
      },
      {
        "name": "Create a distribution system",
        "description": "Plan how supplies go out: equitable and low-barrier — no ID checks, no proof of need — with mobile delivery for people who can't reach the hub. Prioritize the most vulnerable first, and write that priority down so it survives the chaos.",
        "hours": 3,
        "skills": [
          "driving",
          "organizing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Recruit and train a surge volunteer team",
        "description": "Build a roster of people who can mobilize on short notice, and pre-train them on their roles, safety rules, and your intake and distribution system. A trained team of twelve outworks a well-meaning crowd of fifty.",
        "hours": 4,
        "skills": [
          "teaching"
        ]
      },
      {
        "name": "Coordinate with other responders",
        "description": "Introduce the hub to official emergency agencies and other relief groups before anything happens. Agree on who covers what, so you're filling gaps instead of duplicating — mutual aid moves fastest exactly where the official response is slowest.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Plan communication and safety",
        "description": "Plan for the networks failing: offline contact methods, printed lists, and a tie into the preparedness network's contact tree. Set hard volunteer-safety rules — nobody enters unsafe structures, ever — and put them in writing.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Recovery & Sober Peer Support Network",
    "purpose": "Run peer-led support for neighbors in or seeking recovery from substance use — a complement to professional treatment, never a replacement for it.",
    "whoItServes": "People in recovery, people thinking about it, and the families and friends walking alongside them.",
    "whatYoullNeed": "Peer facilitators with lived experience and real training, a safe private space, referral pathways, and boundaries stated plainly: peer support complements professional treatment, it does not replace it; facilitators are not medical providers and must never advise on detox or medication; and there is always a clear plan for connecting anyone in crisis to qualified professional or emergency help.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Begin with the people who'll hold the room: find one or two neighbors with solid lived recovery experience, get them into formal peer-support training, and together write the scope — what this network is and is not — before you announce anything. Then meet the local treatment programs and crisis services in person, so your referral pathway is a relationship, not a phone number on a flyer.",
    "commonPitfalls": "This gets dangerous when the line blurs — a well-meaning facilitator advising someone on detox or medication, which can kill, or a group drifting into amateur treatment because the referral pathway was never real. It fails quietly through broken confidentiality — one leaked story empties the room for good — and through facilitator burnout, when the person holding everyone else's recovery has no support for their own.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruit and train peer facilitators",
        "description": "Look for people with lived recovery experience and get them through a recognized peer-recovery support training. Be clear from the first conversation: facilitators are peers, not medical or clinical providers, and the training is what keeps that line safe.",
        "hours": 5,
        "skills": [
          "facilitation",
          "teaching"
        ]
      },
      {
        "name": "Define scope and boundaries",
        "description": "Write down what the network does — peer support, connection, encouragement — and what it does not: treatment, detox, medical care, medication advice. A written scope protects members from bad advice and protects facilitators from carrying what isn't theirs.",
        "hours": 3,
        "skills": [
          "writing"
        ]
      },
      {
        "name": "Build referral and crisis pathways",
        "description": "Build working relationships with professional treatment programs, medical care, and crisis services, and write an overdose-response plan. When someone in the room needs more than peers can give, the handoff should be a warm phone call, not a pamphlet.",
        "hours": 4,
        "skills": [
          "outreach",
          "research"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Find a safe, private, substance-free space",
        "description": "Find a room that's confidential, welcoming, and free of judgment and substances — somewhere people can be seen walking into without it broadcasting anything. Libraries, community rooms, and faith spaces with a separate entrance all work.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set confidentiality and group norms",
        "description": "Agree on the ground rules: what's said here stays here, respect without advice-pushing, and everyone's right to share or to pass. Reaffirm them out loud at the start of every single meeting — norms only protect people while they're fresh.",
        "hours": 3,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Schedule and promote meetings",
        "description": "Offer more than one meeting time so shift workers and parents can come, and promote in plain, low-stigma language — free, open, no requirements. How you word the flyer decides who feels safe showing up.",
        "hours": 3,
        "skills": [
          "outreach"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Support facilitators and prevent burnout",
        "description": "Check in with facilitators regularly, rotate who leads, and make sure they have support of their own — holding space for recovery is heavy work, and a facilitator's own recovery always comes first.",
        "hours": 2,
        "skills": [
          "listening"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Community Fitness & Wellness Groups",
    "purpose": "Get neighbors moving together for free — walking groups, stretching, pickup sports, dance — because feeling good in your body shouldn't cost a gym membership.",
    "whoItServes": "Anyone who wants to move, especially neighbors priced out of gyms, elders, and isolated folks for whom the company matters as much as the exercise.",
    "whatYoullNeed": "Volunteer activity leaders, safe accessible spaces, and very little equipment. A welcoming, no-pressure style matters more than credentials — though anyone leading a physically demanding activity should have the qualifications for it, and every session needs water, warm-ups, and a first-aid kit within reach.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Before you schedule anything, ask the people you hope will come what they'd actually enjoy — a walking group, chair stretching, a dance night — and what feels possible for their bodies; the answers should pick your activities, not the other way around. Then find one or two leaders whose warmth outweighs their expertise, walk the candidate spaces together, and launch a single reliable weekly session before adding more.",
    "commonPitfalls": "This dies two ways: it turns into a performance — the fittest members set the pace, the talk drifts to weight and appearance, and the very people it's for quietly stop coming — or it gets inconsistent, because nothing kills a walking group faster than showing up to a cancelled session twice. Skipping the boring safety basics is the third: no warm-up, no water, no first-aid kit, and one bad fall ends the whole thing.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Survey interests and activity levels",
        "description": "Ask around — at the laundromat, the senior building, the school gate — about what kinds of movement people enjoy and what feels accessible. Let the answers lead: a template full of sports nobody asked for helps no one.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Recruit activity leaders",
        "description": "Find volunteers to lead walks, stretching, dance, or pickup games. A welcoming, no-pressure style beats expertise for most activities — but anyone leading something physically demanding should hold the appropriate qualification for it.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Find safe spaces",
        "description": "Ask about parks, community halls, and school gyms — free or cheap, and reachable without a car. Check each space for a range of bodies and abilities: level ground, seating, shade, bathrooms, and somewhere to shelter if the weather turns.",
        "hours": 3
      },
      {
        "name": "Plan inclusive, all-levels programming",
        "description": "Design every activity so people can join at their own pace and modify freely — a chair option for the stretch, a short loop inside the long walk. Keep the framing on feeling good, moving, and connecting, never on appearance or performance.",
        "hours": 3
      },
      {
        "name": "Address safety and health",
        "description": "Build warm-ups and hydration into every session, keep a stocked first-aid kit on hand, and suggest people new to exercise check with a doctor first. Teach leaders to watch for overexertion and to make slowing down feel normal, not embarrassing.",
        "hours": 3,
        "skills": [
          "first aid"
        ]
      },
      {
        "name": "Set a schedule and spread the word",
        "description": "Pick consistent times people can build a habit around and stick to them. Promote widely — flyers, group chats, word of mouth — and say explicitly that all ages, sizes, and abilities are welcome, because plenty of people assume they aren't.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Build community and consistency",
        "description": "Make the sessions social: names learned, newcomers greeted, a few minutes of chat built in. Celebrate showing up rather than any metric — the connection is what keeps people coming back long after the novelty wears off.",
        "hours": 2,
        "skills": [
          "facilitation"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Urban Orchard & Food Forest",
    "purpose": "Plant fruit and nut trees and perennial food plants on shared land — a food forest that, once established, feeds the neighborhood for free for decades.",
    "whoItServes": "The whole community, including neighbors who haven't arrived yet — trees planted this year become a long-term source of free fresh food for everyone.",
    "whatYoullNeed": "Long-term land access (a season-to-season handshake isn't enough for trees), climate-suited trees and plants, volunteers for planting days, and a small crew of stewards committed for years, not months. Confirm water access before anything goes in the ground.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "The land conversation comes before everything: talk to land trusts, the parks department, faith congregations with unused ground — anyone who can commit a site for a decade, not a season — and confirm water while you're at it. In parallel, find one person with real fruit-tree experience to anchor the design, and ask neighbors what they'd actually pick and eat, because an orchard of fruit nobody wants just feeds the wasps.",
    "commonPitfalls": "Orchards rarely fail at the planting day — they fail in years two and three, when the crowd is gone and nobody organized watering, so the young trees quietly die their first dry summer. The other killers are shaky land deals revoked just as the trees start bearing, and harvest fights because nobody agreed on sharing norms before the first big crop. Settle the stewardship rota and the sharing rules early, while they're still easy.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Secure long-term land access",
        "description": "Get a durable written agreement — a long lease, a land trust arrangement, a formal city commitment — because trees need decades, not a season-to-season handshake. Confirm reliable water access on the site before you sign anything.",
        "hours": 5,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Plan the planting design",
        "description": "Choose species suited to your climate and design in food-forest layers: canopy trees, shrubs, and ground cover working together. Plan for pollination partners and for the spacing mature trees will need, not the size of the saplings you plant.",
        "hours": 4,
        "skills": [
          "gardening"
        ]
      },
      {
        "name": "Source trees and plants",
        "description": "Line up trees and plants through nurseries, grants, donations, and seasonal bare-root sales — bare-root and young stock cost a fraction of potted mature trees and usually establish better. Order early; good varieties sell out.",
        "hours": 3
      },
      {
        "name": "Prepare the site",
        "description": "Get the ground ready before the trees arrive: improve the soil, lay mulch, set up watering, and mark and clear each planting spot from the design. A prepared site turns a planting day from chaos into an assembly line.",
        "hours": 4,
        "skills": [
          "gardening"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Host planting days",
        "description": "Run community planting days with clear instructions, so every tree goes in at the right depth with a watering basin and mulch — planted wrong, trees fail slowly and invisibly. Make it festive; a planting day is how the neighborhood starts to feel the orchard is theirs.",
        "hours": 5,
        "skills": [
          "gardening"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Set up long-term stewardship",
        "description": "Organize the unglamorous work that decides whether the orchard lives: watering young trees through their first summers, pruning, mulching, and pest management, year after year. A named rota of committed stewards beats a big list of vague volunteers.",
        "hours": 3,
        "skills": [
          "gardening"
        ]
      },
      {
        "name": "Plan harvest sharing",
        "description": "Agree on picking and sharing norms before the first big crop, not after the first argument — who harvests, when, and how much. Route surplus to community fridges, pantries, and shared meals so nothing rots on the branch.",
        "hours": 2
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Postpartum & New Parent Support Network",
    "purpose": "Wrap practical support around new and expecting parents — meals on the doorstep, errands run, dishes done, and peers who've been there — through pregnancy and the raw postpartum weeks.",
    "whoItServes": "New and expecting parents, especially those without family nearby — the weeks after a birth are when support matters most and often arrives least.",
    "whatYoullNeed": "Volunteers who can cook, run errands, and listen; a meal-train system; a resource directory; and experienced parents as peer supporters. Peer support is not medical or mental health care — postpartum mood disorders are common and serious, so every peer supporter must know the signs and how to gently connect a parent to professional help. And vet anyone who'll enter homes or help with infants before they do either.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Start by asking parents who gave birth in the last year what would actually have helped — the answers (a meal with no visit attached, someone to hold the baby while they shower) are more specific than you'd guess. Introduce the network to midwives, doulas, and pediatric clinics who can offer it to families, recruit two or three experienced parents as your first peer supporters, and settle your vetting practice before anyone crosses a doorstep.",
    "commonPitfalls": "The classic failure is support that serves the supporter: volunteers who arrive on their own schedule, stay too long, and offer parenting opinions instead of doing the dishes — exhausted parents will quietly stop answering the door rather than say so. The graver one is a peer missing the signs of postpartum depression because nobody trained them to recognize it or gave them the words to name it. And support that vanishes after two weeks, just when the casseroles stop and the hard part starts, isn't support at all.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "childcare-collective",
      "welcome-wagon"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Recruit volunteers and peer supporters",
        "description": "Gather cooks, errand-runners, and — most importantly — experienced parents willing to be peer supporters. The parent who remembers their own third sleepless week offers something no pamphlet can.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Set up a meal-train system",
        "description": "Build a simple way to coordinate dropped-off meals through the weeks after a birth: a shared calendar, dietary needs and allergies collected once, food labeled and easy to reheat. Doorstep drop-off should be the default — a meal must never oblige a visit.",
        "hours": 3,
        "skills": [
          "cooking",
          "organizing"
        ]
      },
      {
        "name": "Offer practical help",
        "description": "Organize volunteers for the unglamorous load: errands, laundry, dishes, and watching older siblings so a parent can rest or get to an appointment. Ask what's wanted each time rather than assuming — useful help follows the parent's list, not the volunteer's.",
        "hours": 3,
        "skills": [
          "childcare"
        ]
      },
      {
        "name": "Build a resource directory",
        "description": "Compile local lactation support, postpartum mental health care, pediatric clinics, and sources of baby supplies — including the diaper bank and childcare collective if your community runs them. Keep it current; a directory of dead phone numbers is worse than none.",
        "hours": 4,
        "skills": [
          "data entry"
        ]
      },
      {
        "name": "Create peer support circles",
        "description": "Start small groups where new parents can be honest about how hard it is, with an experienced parent holding the space. Train peers on the signs of postpartum depression and anxiety and on gently, persistently encouraging professional care — never diagnosing, never waiting.",
        "hours": 3,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Set safety and boundary practices",
        "description": "Vet every volunteer who'll enter homes or help with infants — references at minimum — and write down the boundaries: parents set the terms, visits are short unless invited to be longer, and no one shows up unannounced. Support should never feel like surveillance.",
        "hours": 3
      },
      {
        "name": "Connect to other projects",
        "description": "Link families to the diaper bank, the childcare collective, and the welcome wagon so one point of contact opens all of it. A new parent shouldn't have to discover each program separately at the most exhausted moment of their life.",
        "hours": 2,
        "skills": [
          "outreach"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Foster & Kinship Care Support Network",
    "purpose": "Stand behind foster, kinship, and other caregiving families — clothes and a bed when a child arrives overnight, respite when caregivers are running on empty, and peers who understand the work.",
    "whoItServes": "Foster parents, grandparents and relatives raising children — kinship caregivers often start with a phone call and a few hours' notice — and the kids in their care.",
    "whatYoullNeed": "Volunteers, donated goods across every age and size, respite helpers, and partnerships with agencies and schools. Work involving children in care is sensitive and legally governed: vet everyone who works with children, follow mandatory-reporting and confidentiality rules to the letter, and coordinate with the relevant agencies rather than around them.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Start with a sit-down at the local foster agency or kinship navigator program: learn the rules that govern this work — vetting, mandatory reporting, confidentiality — before you recruit a single volunteer, and let them tell you where the gaps actually are. Then ask a few caregiving families what they needed in their first week and their first year; build toward those answers, not toward a warehouse of goods nobody asked for.",
    "commonPitfalls": "This project can fail loudly or quietly. Loudly: an unvetted volunteer around children, or a family's story shared without permission — either can harm a child, end a placement, and finish the project in a day. Quietly: a mountain of unsorted donations while a caregiver waits three weeks for a toddler bed, or treating the agencies as adversaries until they stop referring families. Small, vetted, and coordinated beats big and improvised here, every time.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "free-store",
      "childcare-collective"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Connect with caregiving families",
        "description": "Reach caregiving families through agencies, schools, and faith groups — kinship caregivers especially, who often take in a grandchild or niece overnight with no preparation and little official support. Make the first contact an offer, never a screening.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Build a goods and clothing supply",
        "description": "Collect clothing, beds, car seats, and everyday supplies across the full range of ages and sizes, since caregivers rarely know who's arriving until they arrive. Check safety items carefully — car seats and cribs have expiration dates and recall lists.",
        "hours": 4,
        "skills": [
          "organizing"
        ]
      },
      {
        "name": "Create a rapid-response supply system",
        "description": "Pack ready-to-go bags — a few days of clothes, toiletries, and a comfort item like a stuffed animal — sorted by age and size, deliverable within hours of a new placement. A child who arrives with nothing should not wait a week to have something of their own.",
        "hours": 3,
        "follows": [
          1
        ]
      },
      {
        "name": "Organize respite support",
        "description": "Arrange safe, properly vetted care so caregivers can rest, keep appointments, or just breathe — caregiver burnout is one of the main reasons placements break down. Coordinate with the agencies on who may provide respite care and under what rules.",
        "hours": 4,
        "skills": [
          "childcare"
        ]
      },
      {
        "name": "Offer peer support groups",
        "description": "Host regular gatherings where foster and kinship caregivers can trade experience and honest advice with people who get it — this work is isolating, and the caregiver three streets over may be carrying the same load alone.",
        "hours": 3,
        "skills": [
          "facilitation"
        ]
      },
      {
        "name": "Build a resource directory",
        "description": "Compile the services, benefits, and trauma-informed supports caregiving families can draw on, and help them navigate systems that are confusing even to professionals. Kinship caregivers in particular often qualify for help nobody ever told them about.",
        "hours": 3,
        "skills": [
          "data entry"
        ]
      },
      {
        "name": "Set child safety and privacy practices",
        "description": "Write down and follow the non-negotiables: vetting for anyone working with children, what mandatory-reporting laws require of your volunteers, and strict privacy for families and kids — no photos, no stories, no details shared without permission.",
        "hours": 4,
        "skills": [
          "writing"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Cold & Hot Weather Survival Outreach",
    "purpose": "Get survival supplies to unhoused neighbors when the weather turns deadly — blankets and hand-warmers in a cold snap, water and electrolytes in a heat wave — carried out to where people actually are.",
    "whoItServes": "Unhoused and street-connected neighbors exposed to extreme weather — the people for whom a heat wave or cold snap is a life-threatening event, not an inconvenience.",
    "whatYoullNeed": "Weather-specific supplies, outreach volunteers, planned routes, and current connections to shelters and services. Extreme heat and cold kill: every volunteer must be trained to recognize hypothermia and heat stroke and to call for professional medical help without delay — never to wait and see.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Before you buy a single blanket, talk to the outreach workers and organizations already walking these routes — they hold the trust and the knowledge of where people actually are, and they'll tell you what's covered and what's missing. Agree with them on how you'll fit in, set the forecast thresholds that trigger your rounds, and stock the season's supplies while the weather is still mild.",
    "commonPitfalls": "The predictable failure is starting when the weather does: supplies sourced mid-heat-wave arrive after the danger has passed, and strangers appearing for the first time in a crisis get a wary no from people who've learned caution the hard way. The dangerous failures are volunteers trying to manage a medical emergency themselves instead of calling for help immediately, and pressuring people to move or accept shelter — offer, inform, and respect the answer.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Assemble weather-specific kits",
        "description": "Pack kits matched to the season: blankets, warm socks, hats, gloves, and hand-warmers for cold; water, electrolyte packets, sunscreen, hats, and cooling cloths for heat. Add a card with shelter locations and crisis numbers to every kit.",
        "hours": 4
      },
      {
        "name": "Source supplies",
        "description": "Run donation drives, make bulk buys, and ask stores and congregations for contributions — and do it before the season, because sourcing blankets during the first freeze means arriving late. Stockpile enough to restock mid-season.",
        "hours": 4,
        "skills": [
          "outreach",
          "driving"
        ]
      },
      {
        "name": "Map where to reach people",
        "description": "Work with existing outreach workers to learn where unhoused neighbors actually stay — they hold trust and knowledge built over years, and showing up alongside them beats showing up cold. Keep the map loose and current; people move, especially in bad weather.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Recruit and train outreach volunteers",
        "description": "Train every volunteer before their first round: respectful engagement that takes no for an answer, personal safety and always working in pairs, and recognizing weather-related medical emergencies. Nobody distributes until they've been trained.",
        "hours": 4,
        "skills": [
          "teaching"
        ]
      },
      {
        "name": "Build a distribution and route plan",
        "description": "Plan routes and timing for the days before and during dangerous weather, reaching the most exposed people first — those farthest from services, sleeping outside rather than in vehicles or shelters. Decide in advance what forecast triggers a round.",
        "hours": 3,
        "skills": [
          "organizing"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Connect people to shelters and services",
        "description": "Carry current, verified information on warming and cooling centers, shelter beds, and the resource hub — hours and rules change constantly, and a referral to a closed door burns trust. Offer connections without pressure; the relationship outlasts any one night.",
        "hours": 3,
        "skills": [
          "outreach"
        ]
      },
      {
        "name": "Plan for emergencies",
        "description": "Train every volunteer to recognize hypothermia and heat stroke — confusion, slurred speech, skin hot and dry or cold and clammy — and to call emergency services immediately, not to wait and see. Rehearse what to do while help is coming: shade and water, or blankets and shelter from wind.",
        "hours": 3,
        "skills": [
          "first aid"
        ]
      }
    ]
  }
];
