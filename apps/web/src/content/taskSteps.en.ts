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
// English suggested starter steps (i18n Phase 2a split from
// taskSteps.ts — index-aligned to each template's tasks; coverage
// CI-pinned in taskSteps.test.ts). Eager: English is the fallback.
export const TASK_STEPS_EN: Record<string, readonly (readonly string[])[]> = {
  "community-fridge": [
    [
      "Jot down three nearby shops, churches, or clinics with a sheltered outside wall",
      "Visit your top pick and ask for ten minutes with the owner or manager",
      "Talk through the unglamorous parts: the power bill, messes, who to call when it breaks",
      "Check the outlet is an outdoor GFCI that stays live overnight",
      "Sum up the agreement in a short email and get their okay in writing"
    ],
    [
      "Post a one-line ask for a working fridge in one local group right now",
      "Line up a friend with a truck and a dolly for pickup day",
      "Plug the donated fridge in and run it a full day before building anything around it",
      "Sketch a simple lean-to that leaves a hand's width behind the fridge for airflow",
      "Build it, anchor the fridge so it can't tip, and plug in at the host site"
    ],
    [
      "Draft the sign in your notes app: take what you need, leave what you can, plus the no's",
      "Rewrite each no with its safety reason next to it, so it reads as care, not scolding",
      "Ask two neighbors to translate the sign into the languages your block speaks",
      "Print it, laminate it, and tape it at eye level",
      "Clip a marker and blank labels inside so people can date items"
    ],
    [
      "Message three likely volunteers and ask each for one 15-minute weekly slot",
      "Make a shared calendar with two names on every shift, not one",
      "Put a bucket of cleaning supplies at the fridge",
      "Tape a dated cleaning log inside the door",
      "Fill the last empty slots before opening day, even if you have to ask twice"
    ],
    [
      "List the bakeries, grocers, and restaurants within walking distance",
      "Visit one at a quiet hour and ask about end-of-day extras",
      "Mention Good Samaritan donation protections if they worry about liability",
      "Agree a fixed weekly pickup time and put it in your calendar",
      "Keep a note of which sources actually come through each week"
    ],
    [
      "Send one group message asking who'll share problem-contact duty",
      "Set up a free shared number like Google Voice, never one person's own cell",
      "Agree how fast someone replies and who covers vacations",
      "Write the number on a weatherproof label and stick it on the fridge"
    ]
  ],
  "community-garden": [
    [
      "Take a photo of the lot you have in mind next time you walk past",
      "Look up the owner in city land records, or knock and ask",
      "Ask for a written one-year license, even a short signed note",
      "Put who pays for water and how much notice to vacate into the written agreement",
      "Knock on the doors either side of the lot and ask what they'd think of a garden"
    ],
    [
      "Look up your local extension service's soil test and order the kit",
      "Take samples from several spots, especially near old walls and fence lines",
      "Mail the kit weeks before build day, since results take a while",
      "While you wait, sketch beds, paths, and a tool corner on paper",
      "If results show lead, plan raised beds with clean bought soil"
    ],
    [
      "Post a call for untreated lumber, compost, and mulch in one local group",
      "Turn down railroad ties and old treated wood; use cedar, block, or straw bales",
      "Pick a build day date and invite people to it",
      "Stage materials and tools at the site the day before",
      "Raise the beds with the group and set up the hose or rain barrels"
    ],
    [
      "Message the group to pick a date for a 30-minute sharing-model chat",
      "At the meeting, put the three options on paper: individual plots, communal, hybrid",
      "Also decide what happens to a plot when someone disappears mid-season",
      "Write down the choice and how decisions get made, and share it with everyone"
    ],
    [
      "Look up your local last-frost date right now and write it down",
      "Pick five easy crops for your zone: greens, beans, squash, tomatoes, herbs",
      "Sketch a planting order two weeks apart so harvests don't all hit at once",
      "Plant the first round after the frost date and label every row"
    ],
    [
      "Start a shared calendar and put your own name on the first slot",
      "Fill July and August first, since that's when rotas collapse",
      "Ask each regular for one short slot a week, no more",
      "Add a note to water at dawn, not midday",
      "Tie each slot to a phone reminder"
    ],
    [
      "Put the first harvest day on the shared calendar",
      "Ask the community fridge or a neighbor stand if they'll take surplus same-day",
      "Set a twice-weekly phone reminder to pick beans, cucumbers, and zucchini",
      "Set aside a labeled envelope of saved seed for next year"
    ]
  ],
  "tool-lending-library": [
    [
      "Text one friend with a shed or garage and ask if they'd host a tool shelf",
      "Visit the space and check it's dry, lockable, and reachable without stairs",
      "Ask the host how a drop bin or slot could handle after-hours returns",
      "Agree on 2–4 weekly open hours with the host and write them down"
    ],
    [
      "Post one message in the neighborhood chat listing the five tools you want most",
      "Set out three boxes labeled keep, repair, and scrap before donations arrive",
      "Plug in and run each power tool under load; scrap anything that stalls",
      "Check cords for nicks and that blade guards work before shelving a tool"
    ],
    [
      "Open a blank spreadsheet and type five headers: number, item, condition, cost, photo",
      "Number ten tools with tape or paint pen and photograph each beside its number",
      "Look up each tool's replacement cost and record it in its row",
      "Mark every tool with the library's name so ownership is never in doubt"
    ],
    [
      "Look up one other tool library's rules page for a starting point",
      "Draft loan length, item limit, and a friendly late policy in ten lines",
      "Add a short use-at-your-own-risk waiver line to the signup sheet",
      "List the two or three pricey tools that need a deposit or safety briefing",
      "Ask one likely borrower to read the draft and flag anything confusing"
    ],
    [
      "Dig out a clipboard and clip a pen to it — that's the checkout desk",
      "Make a sign-out sheet: name, phone, item number, date out, due date; print ten",
      "Text each new borrower on the spot so you know the number works",
      "Photograph every tool's condition at checkout before it leaves"
    ],
    [
      "Message your two volunteers to pick one hour this week for a walkthrough",
      "Write a one-page cheat sheet: checkout steps, catalog, safety basics",
      "Role-play declining a broken donation and noting damage without blame",
      "Show them where the first-aid kit and eye protection live",
      "Watch each one run a practice checkout start to finish"
    ],
    [
      "Tape a blank wish-list sheet to the desk for requests you can't fill",
      "Put a monthly sharpen-and-oil date on the calendar right now",
      "Inspect this week's returns and pull anything damaged into the repair box",
      "Review the wish list monthly and pick the one tool to add next"
    ]
  ],
  "neighborhood-care-network": [
    [
      "Text one gatekeeper — a pastor, super, or clinic worker — to ask who might be isolated",
      "Start a paper list at home; keep it out of shared docs and group chats",
      "Ask two trusted neighbors to introduce you instead of cold-knocking doors",
      "Visit one building manager or faith group in person and leave your number",
      "Word every invite as an offer — a weekly call? — never as singling someone out"
    ],
    [
      "Message three dependable friends and ask if they could commit to one weekly contact",
      "Draft a short recruitment post that names the commitment plainly",
      "Collect two references from anyone who'll make home visits",
      "Block an hour and actually phone every reference — don't just file them",
      "State the rule up front: no volunteer handles a neighbor's cash or keys alone"
    ],
    [
      "Pull up your roster and jot each volunteer's language, street, and comfort zone",
      "Call each neighbor and ask what they'd actually like: a call, a ride, a porch chat",
      "Pair the first match on proximity and language, and note your reasoning",
      "Tell both people it's a trial either can end gracefully, no explanation needed"
    ],
    [
      "Text one matched pair and ask which day and hour suits them both",
      "Fix every check-in to the same day and time so a missed one stands out",
      "Write a three-line first-contact script and send it to each volunteer",
      "Keep all pairs' schedules in one place the coordinator can check"
    ],
    [
      "Ask one neighbor today who they'd want called if they ever didn't answer",
      "Record each neighbor's crisis contact — and whether to avoid calling police",
      "Draft one page: no answer → retry, call their contact, then when to escalate",
      "Print copies for every volunteer instead of leaving the plan in one phone"
    ],
    [
      "Text one volunteer and ask what recurring needs came up on their last visit",
      "Start a running list of repeat needs: rides, prescriptions, snow shoveling",
      "Match each need to a volunteer or sister project and confirm the handoff happened",
      "Route anything clinical — meds, wound care, lifting — to professionals, kindly"
    ],
    [
      "Message all volunteers with two candidate dates for a debrief",
      "Book a comfortable spot and put the debrief on everyone's calendar",
      "Check in privately with each volunteer before the group meets",
      "Rotate whoever sounds stretched thin now, before they have to quit"
    ]
  ],
  "emergency-preparedness": [
    [
      "Pull up your area's official flood and wildfire maps and screenshot your blocks",
      "Walk your street and note single-exit buildings and upper floors with no elevator",
      "Knock on doors and ask who relies on power for oxygen or refrigerated meds",
      "Mark it all on one paper map — hazards in one color, people to check in another"
    ],
    [
      "Write your own household's row first: name, phone, address, needs",
      "Knock on ten doors with a paper form and ask for opt-in contact info",
      "Ask one steady neighbor per block to captain about ten households each",
      "Print the roster, note who needs a knock not a call, and store copies in two homes"
    ],
    [
      "Text two neighbors to pick a meeting spot everyone can walk to",
      "Choose the no-service signals: door knocks, one radio channel, a fixed check-in hour",
      "Walk the radios to the far ends of the neighborhood and test them at real distance",
      "Print the one-page plan and hand it out door to door"
    ],
    [
      "Start the kit right now: put a flashlight and spare batteries in one labeled bin",
      "List what's missing — water, first aid, crank radio, blankets — and split the buying",
      "Store the bin where two or three people can reach it without one keyholder",
      "Tape a rotation date on the lid and put it on the group calendar"
    ],
    [
      "List three candidate spots from memory: a hall, a church, a shaded park",
      "Visit each and ask about the 2 a.m. key, stored generator fuel, and wheelchair access",
      "Get each yes in writing with the host's name and phone number",
      "Add the confirmed spots to the printed plan"
    ],
    [
      "Ask your safe-spot host by text for one evening date next month",
      "Plan three hands-on stations: go-bags, finding utility shutoffs, and the contact tree",
      "Invite in person the neighbors who most need the practice",
      "During the drill, time the contact tree end to end and note where it breaks"
    ],
    [
      "List the jobs on one page: medical checks, open the safe spot, coordinate",
      "Call each person and get a spoken yes to their specific role",
      "Name a backup for every role, starting with the medically-vulnerable checks",
      "Put two review dates a year on the calendar and staple the roles to the roster"
    ]
  ],
  "free-store": [
    [
      "Text two places with space — a church hall, a community center — and ask about one date",
      "Visit the top option and check for ground-floor access and a curb to pull up to",
      "Decide with your crew: one-day swap, recurring pop-up, or standing store",
      "Book the same recurring slot before you leave the building"
    ],
    [
      "Copy a yes/no list from an existing free store or thrift shop as your draft",
      "Add used car seats, helmets, and mattresses to the \"no\" side",
      "Get a quick thumbs-up on the final list from the crew",
      "Make two big-print copies: one for the drop-off door, one for inside"
    ],
    [
      "List your station names on one sheet: receive, sort, stage",
      "Ask the host what tables and bins you can borrow, and label one bin \"onward\"",
      "Sketch the room flow so donations get checked at the door, not at the tables",
      "Recruit two sorters for the first hour, when the pile is biggest"
    ],
    [
      "Ask your group chat for spare hangers and a clothing rack",
      "Hang clothes by size and pin a size card on each rack section",
      "Group household goods by kind on separate tables",
      "Set out less than you have and keep a restock box under each table"
    ],
    [
      "Message the volunteer list with the date and three roles: greeter, sorter, floater",
      "Brief greeters: never ask why someone's here or how much they're taking",
      "Post a shift list so everyone knows their hour and their station",
      "Walk the room mid-event and send the floater wherever it looks ransacked"
    ],
    [
      "Call one partner charity or textile recycler and ask what they actually accept",
      "Confirm their open hours for the day right after your event",
      "Line up one driver with a big trunk before doors open",
      "Load out the same day so the host gets the space back empty"
    ]
  ],
  "skill-share": [
    [
      "Put the two questions in your notes app: what could you teach, what do you want to learn",
      "Swap \"what are you an expert in\" for \"what do people always ask you for help with\"",
      "Ask the first three people today — in person, by text, whatever's fastest",
      "Drop every answer into one simple form or sheet as you go",
      "Circle the overlaps — that's your first curriculum"
    ],
    [
      "Text one would-be teacher and invite them for a coffee this week",
      "Tell them a session is a conversation with busy hands, not a lecture",
      "Plan their first five minutes together, minute by minute",
      "List the materials they'll need and who's bringing each one",
      "Offer a co-host to any first-timer who still looks nervous"
    ],
    [
      "List three free rooms to ask about: library, community center, someone's living room",
      "Message each one asking about free evenings and weekend slots",
      "Walk the space and check it fits the sessions — a cooking class needs a sink",
      "Ask exactly who unlocks and who locks up, and write it down",
      "Book the same recurring slot so showing up becomes routine"
    ],
    [
      "Open a blank sheet and list each confirmed session: date, topic, teacher, what to bring",
      "Post the schedule where members already look, not somewhere new",
      "Keep sign-ups drop-in or one tap, nothing heavier",
      "Set a weekly reminder to confirm next week's teacher personally"
    ],
    [
      "Write down three people you expected to see who haven't come",
      "Ask each one directly what would make it possible to come",
      "Fix the one concrete barrier you hear most — timing, kids, language, bus schedule",
      "Try one session at a different time or with childcare and compare turnout"
    ]
  ],
  "bulk-buying-coop": [
    [
      "Text three neighbors: want to split a bulk food order to cut grocery costs?",
      "Write down each interested household and the staples they buy most",
      "Recruit a fifth more households than you need — some will skip each cycle",
      "Set one kitchen-table meeting date to agree on a buying cycle"
    ],
    [
      "Search for food wholesalers near you and jot down three phone numbers",
      "Call the first one and ask for their catalog and minimum order",
      "Ask each about short-shipment policy and whether prices lock at order or delivery",
      "Ask a nearby buying club which supplier they use and why",
      "Compare all three on minimums, delivery, and staples in one quick table"
    ],
    [
      "Open a blank spreadsheet with columns: item, unit price, household, quantity",
      "Share the link in the group chat with the cutoff date in the message",
      "Ask one person by name to coordinate this cycle",
      "At the cutoff, copy the sheet and lock edits before totaling the order"
    ],
    [
      "Open a shared ledger doc and title it with this cycle's dates",
      "Message the group: payment lands before the order goes in, no exceptions",
      "Price each item per unit to the penny and round up, not down",
      "Record every payment in the ledger the moment it arrives"
    ],
    [
      "Text one person with a garage or driveway to ask about delivery day",
      "Call the supplier and ask exactly how the truck unloads — liftgate, pallet, or curb",
      "Book three helpers for unloading with a specific date and time",
      "Stage the space the night before: clear floor, folding tables, room for a hand truck"
    ],
    [
      "Print each household's order list before anyone arrives",
      "Set up one station per bulk item with a scale, scoop, and bags",
      "Tare the scale for each container and weigh straight into the household's bag",
      "Have a second person tick off each list before pickup"
    ],
    [
      "Start a note titled 'cycle checklist' and jot the first three things you did",
      "Ask at pickup who takes coordination next cycle and write the name down",
      "Hand over the checklist and spreadsheet access in one sit-down",
      "Add five minutes at each pickup to review supplier prices and reliability"
    ]
  ],
  "repair-cafe": [
    [
      "Text the neighbor who sews and the friend who tinkers with electronics",
      "Write a gap list: which repair categories still have nobody",
      "Recruit two electronics or appliance fixers, not one — theirs is the longest line",
      "Ask each yes what tools they'd bring and which dates work"
    ],
    [
      "Sketch the room on paper and mark every outlet and window",
      "Give each station a table, a lamp, and the tools its fixer asked for",
      "Put soldering and battery work near ventilation, away from the crowd",
      "Test every surge strip at home before it touches the venue's circuits",
      "Tape a big label on each station so visitors route themselves"
    ],
    [
      "Text your fixers two candidate dates and see which gets more yeses",
      "Pick a fixed day of the month — first Saturday, say — not a floating date",
      "Book the venue for the next three sessions in one ask"
    ],
    [
      "Ask one friendly volunteer to be the greeter for the first session",
      "Make a half-page intake slip: name, item, what's wrong with it",
      "Add a triage line to the slip: likely fixable, long shot, or needs a part",
      "Print \"owners stay with their repair\" on the slip and say it at the door"
    ],
    [
      "Put a first-aid kit in the bag you'll take to the venue",
      "Make an entrance sign: repairs are attempted, never guaranteed",
      "Write the hard noes: no opened mains-powered gear, no swollen batteries",
      "Tell fixers an unsure no is the right call, and back them when they say it"
    ],
    [
      "Ask each fixer to text you the three supplies they always run out of",
      "Do one shopping run: thread, fuses, glue, fasteners, tubes, patches",
      "Put a shared box and a tally sheet at every station",
      "Check the tallies after each session and restock before the next"
    ]
  ],
  "rides-transportation": [
    [
      "Text two people who drive and ask if they'd take one ride a month",
      "Sit down with each yes and look at the actual license and insurance card",
      "Photograph both documents for the file — \"yeah, I'm covered\" isn't a record",
      "Do reference checks before anyone drives a vulnerable rider",
      "Note each driver's vehicle, seats, and whether a wheelchair fits"
    ],
    [
      "Email one driver's insurer asking whether volunteer driving is covered",
      "Get every insurer's answer in writing before anyone takes a first ride",
      "Ask a legal aid clinic to look over a simple waiver draft",
      "File each written confirmation with that driver's license photos"
    ],
    [
      "Pick the one channel requests will use and write down its number or link",
      "Draft the intake questions: pickup time, locations, and contact info",
      "Always ask about the return trip and any wheelchair or walker up front",
      "Set a lead time — 48 hours, say — and post it wherever the channel is shared",
      "Run one practice request through the whole flow before going live"
    ],
    [
      "Ask one other person to alternate coordinator weeks with you",
      "Match each request to a driver and line up a backup for cancellations",
      "Confirm with driver and rider the day before, out loud or in writing",
      "Spread the asks across the whole driver list, not just the reliable two"
    ],
    [
      "List the trip types you'll take: medical, groceries, essential errands",
      "Draw your service area on a map and pick real boundary streets",
      "Write the don'ts just as plainly: no emergencies, no last-minute, no beyond the map",
      "Agree wait-time and bag-carrying norms so every driver answers the same"
    ],
    [
      "Text your drivers and ask what gas costs them on a typical trip",
      "Pick one model: a small shared fund, optional contributions, or nothing",
      "Keep money out of the car — any contribution happens elsewhere, quietly",
      "Write the policy in one sentence and share it with drivers and riders alike"
    ],
    [
      "Set up the ride log now: date, driver, rider, destination, done",
      "Write the norms: no entering homes alone, no money beyond agreed costs",
      "Pair each driver's first ride with a familiar rider or a second volunteer",
      "Check in with vulnerable riders after each ride and note anything off"
    ]
  ],
  "tenant-union": [
    [
      "Write down five tenants that neighbors already trust and respect",
      "Ask yourself which of them can keep a confidence — cross off any you doubt",
      "Invite each one to a one-on-one coffee, not a group meeting",
      "At the sit-down, ask what they'd want the union to win first",
      "Close by proposing a meeting rhythm and one role each"
    ],
    [
      "Print or sketch a block map and mark the buildings you hear complaints about",
      "Pick one building and knock ten doors with a partner this week",
      "Ask what's broken, what's feared, and who neighbors go to for help",
      "Ask permission before writing anyone's story down",
      "Code the units in your notes and keep the name key somewhere separate"
    ],
    [
      "Look up your city or state's official tenant-rights page and bookmark it",
      "List the numbers that matter: notice periods, repair timelines, deposit rules",
      "Write the statute and the date you checked next to every fact",
      "Email a legal aid clinic asking them to verify your draft",
      "Stamp every page \"information, not legal advice\""
    ],
    [
      "Start a group chat or phone-tree list with the committee right now",
      "Decide who answers first and who backs them up, by name",
      "Agree on a response promise you can actually keep — say, within two hours",
      "Run a drill: send a test alert and time how long everyone takes to reply",
      "Fix whatever the drill broke before you publish the number"
    ],
    [
      "Message your legal aid contact to ask for a presenter and two possible dates",
      "Book a room tenants can reach easily and set the date",
      "Print take-home guides in the languages your buildings speak",
      "Script the closing: the court deadline and the number to call, repeated twice",
      "Invite through building leaders, not just flyers"
    ],
    [
      "Open a blank page titled \"If you get eviction papers\"",
      "Put the court-response deadline first, in bold",
      "List the next moves in order: document everything, call legal aid, tell the union",
      "Add \"never skip a court date\" as its own line",
      "Have your legal aid contact read it before anyone else does"
    ],
    [
      "Start a list of tenant lawyers, legal aid offices, and housing counselors near you",
      "Call each one and ask for a named contact, their intake hours, and real capacity",
      "Note who takes emergencies and who has a waitlist",
      "Put the contact sheet where every committee member can grab it",
      "Set a reminder to re-verify the sheet every three months"
    ]
  ],
  "childcare-collective": [
    [
      "Text two families you trust: want to trade childcare instead of paying for it?",
      "Set one living-room evening with snacks and a firm date",
      "At the meeting, ask each family to say their discipline and screen-time rules aloud",
      "End the meeting with a decision: credit co-op or scheduled group care",
      "Write the model in one paragraph and send it to everyone that night"
    ],
    [
      "Write the never-alone rule at the top of a blank page before the meeting",
      "List what you'll ask of every caregiver: references, checks where they fit",
      "Agree on adult-to-child ratios by age and write the numbers down",
      "Say it aloud together: the rule applies hardest with the families you trust most",
      "Have every founding family sign or reply agreed to the final list"
    ],
    [
      "Text the family with the likeliest living room and ask to walk it together",
      "Get on your knees and crawl the room at toddler height, listing every hazard",
      "Buy or borrow outlet covers, cabinet locks, and furniture straps in one trip",
      "Lock medicines and cleaning products in one high cabinet and test the latch",
      "Walk any outdoor area and note gates, gaps, and water hazards"
    ],
    [
      "Open a shared calendar on your phone and add one trial care slot",
      "Make a credit sheet with a row per family: hours given, hours received",
      "Share the sheet so every family can see every balance from day one",
      "Log who hosts each slot so the load stays visibly fair"
    ],
    [
      "Open a blank doc and type four headings: allergies, meds, contacts, pickup",
      "Fill in a line for each heading and send the form with a one-week deadline",
      "Put the filled sheets in one bright folder the on-duty caregiver can grab in seconds",
      "Write the sick-child rule now — fever, vomit, rash — before a rough morning tests it",
      "Write the emergency steps in three lines and tape them inside the folder"
    ],
    [
      "Text the group to find one date when every caregiver can meet for two hours",
      "Look up a pediatric first-aid and CPR course nearby and share the signup link",
      "Walk through supervision, safe sleep, and allergy response with the real forms in hand",
      "Run the emergency drill aloud: who calls, who stays with the kids, where the sheets live"
    ],
    [
      "Message two or three families to book a two-hour pilot on a specific date",
      "Keep the pilot small: few kids, two adults, the full safety rules in force",
      "Afterward, ask the kids how it went, not just the parents",
      "Debrief the near-misses honestly and list what to fix",
      "Set the next session's date only after the fixes are agreed"
    ]
  ],
  "community-composting": [
    [
      "Text the community garden coordinator to ask about a spare corner",
      "Stand on each candidate spot and find the nearest water tap and neighbor's window",
      "Knock on the closest neighbors' doors and talk odor and rats before they worry",
      "Get the host's permission in writing and check your local composting rules"
    ],
    [
      "Message someone who's kept a hot pile alive and ask what they'd pick for your site",
      "Estimate your weekly scraps in buckets: households times roughly one pail each",
      "Check the cubic-yard rule: a hot pile needs that much material or it just sits cold",
      "Match the method to how much turning you can truly do and write the choice down"
    ],
    [
      "Ask the group chat who has spare pallets, a pitchfork, or a compost thermometer",
      "Stockpile brown material now — bag leaves or flatten cardboard — before scraps arrive",
      "Build or buy the bin structure and set it on the agreed spot",
      "Do one supply run for what's still missing: thermometer, pitchfork, drop-off bin"
    ],
    [
      "Message five likely households to ask which drop-off day suits them",
      "Hand out countertop pails with the drop schedule taped to each lid",
      "Tell everyone to skip compostable liner bags — they survive the pile as plastic shreds",
      "Post the drop-off hours on the bin and in the group chat"
    ],
    [
      "Draft the yes/no list on paper: fruit, veg, coffee yes; meat, dairy, oils no",
      "Find or draw a picture for each item — a crossed-out chicken bone beats a paragraph",
      "Print it weatherproof and stick it on the bin lid itself, not a nearby post",
      "Ask two neighbors who speak the area's other languages to check the wording"
    ],
    [
      "Ask three reliable people, by name, for one turning shift a month",
      "Hold one hands-on session: turn the pile together and teach the wrung-out-sponge test",
      "Put a named person on every week of the calendar — the team means nobody",
      "Hang a laminated log at the site: date, temperature, moisture, who turned"
    ],
    [
      "Text the community garden that a batch is nearly ready and ask how much they can use",
      "Let the batch cure a few extra weeks and screen out chunks before promising a date",
      "Announce a pickup day to contributors: bring your own buckets or bags",
      "Save a photo of the finished pile for the next round of recruiting"
    ]
  ],
  "free-little-library": [
    [
      "Search your buy-nothing group or marketplace for a free cabinet or newspaper box",
      "Sketch the box on paper: sloped roof, clear door, a lip under the door to block rain",
      "Gather materials and build it, sealing the bottom and every seam",
      "Spray it with a hose for a minute and fix anywhere water gets in"
    ],
    [
      "Text the person whose yard or wall you have in mind and ask if they're open to it",
      "Stand at the spot and check a stroller or wheelchair can still pass on the sidewalk",
      "Ask about any permit or HOA rule if it's not private property",
      "Set the post or mount, then shake the box hard to confirm it's anchored"
    ],
    [
      "Post one message in your group chat asking for gently used books, especially kids' books",
      "Set a labeled box at your porch or the host spot for drop-offs and give it a week",
      "Pull anything stained, moldy, or outdated before it ever reaches the shelf",
      "Shelve a half-full mix with kids' books front and center"
    ],
    [
      "Write \"Take a book, leave a book — all free\" on scrap paper as your draft",
      "Add one line welcoming all ages and languages",
      "Read it aloud and cut anything that sounds like an obligation",
      "Make the final sign and fix it inside the door where rain can't reach"
    ],
    [
      "Text the neighbor who lives closest to the box and ask for five minutes a week",
      "Meet them at the box once and do a quick tidy together",
      "Agree on what gets pulled on sight: anything moldy, adult titles in kids' reach",
      "Ask a second person to be the backup for vacations and sick weeks"
    ]
  ],
  "community-first-aid-training": [
    [
      "Look up your local Red Cross chapter's number and save it in your contacts",
      "Call to ask about hosting a class and whether they waive fees for community groups",
      "Ask their student-per-mannequin cap and what they need from a host space",
      "Contact one harm-reduction group or the health department about overdose training",
      "Write down each trainer's available dates in one place"
    ],
    [
      "Text the trainer to ask if they bring their own CPR mannequins",
      "Email your health department asking about free naloxone distribution",
      "Price basic first-aid kits at two suppliers and pick one",
      "The day the naloxone arrives, note its expiry and store it indoors at room temperature"
    ],
    [
      "List three rooms you could ask about: library, community center, clinic",
      "Visit one and check for clear floor space to kneel, a sink, and an accessible entrance",
      "Ask about booking the same weekday each month",
      "Match the room's dates against the trainer's and book the first two sessions"
    ],
    [
      "Message two people who'd likely come and ask each to bring one more person",
      "Ask nearby businesses and family-support groups to share sign-ups with their people",
      "Set up a free sign-up form with two time options for shift workers",
      "Offer childcare and food, and say so right in the invite",
      "Over-book by a few seats and plan a day-before confirmation message"
    ],
    [
      "Text the trainer two days before to confirm time and headcount",
      "Arrive an hour early to set up floor space, the sign-in sheet, and water",
      "Open by saying practice is on mannequins and anyone can step out during overdose talk",
      "Check every attendee gets hands-on practice, not just a seat",
      "Hand out take-home reference cards as people leave"
    ],
    [
      "Count your kits and naloxone doses and write the number down",
      "Hand each person a kit before they leave, noting who took naloxone and its expiry",
      "Put the first refresher on the calendar within the year, before people scatter",
      "Set a reminder a month before the earliest naloxone expiry to nudge refills"
    ]
  ],
  "time-bank": [
    [
      "Write a list of ten to fifteen neighbors you could realistically sit down with",
      "Message the first three today to set up short one-on-one chats",
      "In each chat, ask for one offer and insist on one ask too",
      "Log every offer and ask in a single sheet as you go",
      "Keep recruiting until the sheet shows variety — rides, repairs, tutoring, cooking"
    ],
    [
      "Ask the likely coordinator what tool they already use every week",
      "Try logging three fake exchanges in a plain spreadsheet",
      "Test one time-bank app only if the spreadsheet fell short",
      "Confirm you can export the full ledger before committing to anything",
      "Pick the simplest option that survived the test and write down how it works"
    ],
    [
      "Put a rules meeting on the calendar and invite the founding members",
      "Write the first rule at the top: one hour equals one credit, no exceptions",
      "Agree how members request, confirm, and log an exchange",
      "Decide now what happens when someone leaves owing hours or sits deep in the negative",
      "Keep it all to one page and read it aloud before anyone signs off"
    ],
    [
      "Pick a date and message members a short orientation invite",
      "Prepare a ten-minute walkthrough: the philosophy, then a live logged exchange",
      "Load a few starter credits into each new member's balance",
      "Before anyone leaves, have them book one real exchange on the spot",
      "Follow up in a week with anyone whose first exchange hasn't happened"
    ],
    [
      "Open the member sheet and pull every offer into one list",
      "Add columns for when and where each person is available",
      "Message members whose entries are missing days or travel range",
      "Publish the directory where members already look",
      "Put a monthly reminder in your calendar to prune stale entries"
    ],
    [
      "Open the ledger and find one unmet need you can match to an offer today",
      "Text both members to propose the match and offer to make the intro",
      "Scan for people who've earned but never spent, and message each by name",
      "Nudge one member who joined but hasn't traded with a specific suggestion",
      "Note which matches landed so next month's brokering gets easier"
    ],
    [
      "Draft three safety norms in your notes: references, public first meetings, easy declines",
      "Add a no-questions way to turn down any match",
      "Name one person — not a form — who hears concerns",
      "Bring the norms to the next meeting and adjust them out loud",
      "Post the final norms where members sign up"
    ]
  ],
  "solidarity-fund": [
    [
      "Write down the three or five people you'd trust with pooled money",
      "Message each one asking for a one-hour conversation about the fund",
      "Talk honestly about payouts, publishing, and what happens when money runs short",
      "Agree that anyone steps out of a decision when a friend or relative applies",
      "Keep the team odd-numbered so votes can't deadlock"
    ],
    [
      "Email one local nonprofit resource or accountant to ask for a short advice call",
      "Ask about the legal and tax side before opening anything",
      "Open a dedicated account or sign with a fiscal sponsor — never a personal account",
      "Set the rule in writing: two signers on every payout",
      "Start the ledger with columns for date, amount, purpose, and who approved"
    ],
    [
      "Put a criteria meeting on the team's calendar this week",
      "Draft who's eligible, typical amounts, and how often someone can ask",
      "Set a per-request cap and a monthly total you won't exceed",
      "Cut every proof-of-hardship requirement you can live without",
      "Write the final criteria on one page everyone signs off on"
    ],
    [
      "Open a blank form and add just three fields: name, contact, what's needed",
      "Add one question: how would you like to receive the money",
      "Delete anything that smells like proof — no ID numbers, no landlord letters",
      "Set up phone and in-person ways to apply alongside the form",
      "Ask one outside person to try it and tell you where it feels intrusive"
    ],
    [
      "Text five members asking if they'd pledge a small monthly amount",
      "Set up a recurring-donation option before planning any big drive",
      "Write the donor line: money goes straight to neighbors in a crisis",
      "Announce the fund where members already talk and ask people to share it",
      "Note each pledge in the ledger so the team can forecast next month"
    ],
    [
      "Message the team a proposed turnaround promise — say, a decision within 48 hours",
      "Set a small amount two stewards can approve same-day, no meeting needed",
      "List the payout methods that land fastest — cash, transfer, direct to the biller",
      "Write the review steps on one page: who reads, who signs, who pays",
      "Log each decision in one line: date, amount, and the two approvers"
    ],
    [
      "Open the ledger and jot this month's three numbers: in, out, neighbors helped",
      "Draft a three-line summary using only numbers — no anecdotes, ever",
      "Read it back checking nothing could identify a recipient",
      "Post it where donors and members already look",
      "Repeat on the same date each month so people learn to expect it"
    ]
  ],
  "diaper-hygiene-bank": [
    [
      "Text one person at a clinic, church, or pantry to ask if they have a spare closet",
      "Visit the two most promising spots and check for dampness, pests, and a door that locks",
      "Stand where families would collect and check they're not in view of a waiting room",
      "Get a yes in writing on which shelf or closet is yours and who holds the key"
    ],
    [
      "Search 'diaper bank network' plus your region and jot the nearest member's contact",
      "Email the network or a wholesaler asking about case prices for sizes 4, 5, and 6",
      "List three likely donation-drive hosts — school, gym, workplace — and message one today",
      "Start a one-page tracker: source, what they give, and how steady each has been"
    ],
    [
      "Grab a marker and label one shelf or bin per diaper size before touching any boxes",
      "Break each case into hand-out bundles as you shelve it, not later at the door",
      "Count what's on each shelf and write totals by size on a clipboard sheet",
      "Circle the two shortest sizes and pass those numbers to whoever handles sourcing"
    ],
    [
      "Call one nearby diaper bank and ask what monthly amount per child they settled on",
      "Draft one sentence: how many per child, how often, and never any proof of need",
      "Read it to two volunteers and one parent and adjust anything that sounds like a test",
      "Post the honest number where families can see it so nobody has to ask"
    ],
    [
      "Ask the host site by text which same day and time works every single month",
      "Message three potential volunteers with the fixed date and ask for a standing yes",
      "Walk volunteers through the one rule: hand the bundle over, ask nothing",
      "Set a phone reminder to confirm helpers two days before each distribution"
    ]
  ],
  "community-bike-workshop": [
    [
      "Text three people who might lend a garage, basement, or unused corner",
      "Walk each option and measure wall space for hanging bikes vertically",
      "Check the locks and ask the host how the space secures overnight",
      "Settle storage, access hours, and insurance with the host before saying yes"
    ],
    [
      "Message the group chat asking who has spare bike tools in a drawer",
      "Ask a local bike shop if they'd donate worn tools or sell a used repair stand",
      "List the kit you still lack — tire levers, cone wrenches, cable cutters — and price it",
      "Hang a pegboard and trace each tool's outline so a missing wrench shows at closing"
    ],
    [
      "Jot the hard no in your notes app: no rusted big-box bikes",
      "Write a short donation call with the no up front, plus a drop-off day and address",
      "Post it in two neighborhood channels",
      "Triage each arrival on the spot: fixable, for parts, or ready to ride",
      "Strip the for-parts bikes soon and shelve parts by type so they're findable"
    ],
    [
      "Text the two best bike-fixers you know and ask for one open-hours shift each",
      "Ask each one to walk you through fixing a flat without touching the wheel themselves",
      "Pick the ones who can let a learner fumble — teaching patience is the whole job",
      "Put each mechanic's name on a specific open-hours slot in the calendar"
    ],
    [
      "Poll the group chat for the two weekly time slots most people can make",
      "Write the open hours on the door and post them in the same channels every week",
      "Sketch the earn-a-bike deal on one card: sessions attended, skills learned, bike earned",
      "Make a punch card for each learner so any mechanic can read their progress"
    ],
    [
      "Put a first-aid kit and two pairs of safety glasses in a bag for the workshop",
      "Write the tool rules on one poster: glasses on, long hair tied, ask before power tools",
      "Make a checkout card with a signed line for brakes, tires, and headset on every bike",
      "Ask someone other than the builder to sign that final safety check"
    ]
  ],
  "newcomer-translation-network": [
    [
      "Text two bilingual people you know and ask if they'd help interpret sometimes",
      "Write down the three languages you hear most at local schools and shops",
      "Ask one ESL teacher or congregation leader to pass your ask along",
      "Have each candidate relay a medical sentence both directions before counting them",
      "Log each yes with language, dialect, and availability in one place"
    ],
    [
      "Open a note and list the five services you already know by name",
      "Call one clinic today and ask which languages they actually staff",
      "Note for every listing whether they ask for ID or immigration status",
      "Ask one immigrant-serving org which places they trust and which to skip",
      "Put addresses, hours, and a contact name for each into one shared directory"
    ],
    [
      "Message one volunteer to ask if they'd take intake calls for a trial month",
      "Set up a single phone line or form where every request lands",
      "Keep the intake sheet to first name, language, need, and a callback number",
      "Match each request by language and need, then confirm with both sides",
      "Run one practice request from a friend through the whole flow"
    ],
    [
      "Write down the five questions newcomers ask you most often",
      "Draft one plain-language page on the top topic, pictures over paragraphs",
      "Have a native speaker from each community read the draft aloud before printing",
      "Print a small first batch, hand it out, and fix whatever confuses people"
    ],
    [
      "Ask one newcomer with an upcoming appointment if they'd like company",
      "Match a volunteer by language and confirm time and meeting spot with both",
      "Brief the volunteer: interpret in first person, add nothing, give no advice",
      "Check in with both afterward and note what to do differently next time"
    ],
    [
      "Write one line at the top of your intake sheet: never ask immigration status",
      "Cross out every form field you could do the work without",
      "Decide how long records live and calendar the day you delete them",
      "Script your answer to a records request: what you keep, what you never collect",
      "Walk every volunteer through the rules before their first request"
    ]
  ],
  "community-meal": [
    [
      "List three halls with kitchens: a church, a community center, a school",
      "Call or message one to ask for a walk-through",
      "On the visit, check for a separate hand-wash sink, hot water, and fridge space",
      "Confirm the hall is free on the days you're planning",
      "Get the okay in writing, even a short email"
    ],
    [
      "Look up your local health department's number and note it",
      "Call and ask specifically about charitable-meal exemptions",
      "Sign up now for the food-handler class — it books out weeks ahead",
      "Write the temperature and storage rules where every cook will see them"
    ],
    [
      "Text one grocer or restaurant you know and ask about donating",
      "Visit two more suppliers in person during a quiet hour",
      "Pin each donor to a specific day and amount, not \"whatever's left\"",
      "Ask the community garden or gleaning crew what surplus they can send",
      "Keep one list of who gives what and when, and update it after every meal"
    ],
    [
      "Check your supply list and jot what next week's donations actually include",
      "Pick one main that's naturally vegetarian and nut- and shellfish-free",
      "Scale the recipe on paper and list quantities to buy or request",
      "Write allergen labels for every dish before cooking day"
    ],
    [
      "Message five people and ask each for one specific job: prep, cook, serve, or cleanup",
      "Add two extra names to each shift beyond what it strictly needs",
      "Name a lead cook for the first meal and a second lead to cross-train from week one",
      "Share the roster and confirm everyone two days before the meal"
    ],
    [
      "Message three people who'd come to eat and ask which day and time works",
      "Pick a day and time you can hold for a year, not the most ambitious one",
      "Make one warm, simple flyer: day, time, place, free, everyone welcome",
      "Drop flyers at shelters, laundromats, and corner stores",
      "Ask hosts and partners to spread it by word of mouth"
    ],
    [
      "Text the crew the day before to confirm shifts and arrival times",
      "Post the day's run sheet in the kitchen: who preps, cooks, serves, cleans",
      "Serve at tables where possible instead of a line",
      "Move leftovers into shallow pans and the fridge within two hours of serving",
      "Leave the kitchen inspection-clean and note anything running low"
    ]
  ],
  "seed-library": [
    [
      "Look up the library's front-desk email or phone and note the branch manager's name",
      "Send one message asking if they'd host a small seed cabinet or drawer set",
      "Visit and pick a spot away from windows, exterior walls, and heat vents",
      "Bring a box of small envelopes and a marker to leave with the cabinet"
    ],
    [
      "Text one experienced gardener to ask which varieties actually grow well here",
      "Email a nearby nursery and a community garden asking for end-of-season surplus",
      "Post one ask for seed donations where members already look",
      "Sort donations as they arrive, setting aside coated treated seed and patented hybrids"
    ],
    [
      "Grab the donation box and sort packets into vegetable, herb, and flower piles",
      "Write the plant name and year, big, on every envelope",
      "Mark beginner-friendly varieties with one color so first-timers can self-serve",
      "Shelve each section with the oldest seed at the front",
      "Add a short growing note to the trickier varieties"
    ],
    [
      "Open a blank page and write the three rules: take free, grow, return if you can",
      "Add a per-person cap of a couple packets per variety",
      "Phrase returns as a welcome gift, never an obligation",
      "Print the one-pager and tape it inside the cabinet door"
    ],
    [
      "Pick a day this week to visit the cabinet and put it in your calendar",
      "Pull every envelope more than two years old",
      "Test doubtful batches: ten seeds in a damp paper towel for a week",
      "Pull any batch where fewer than six sprout",
      "List the three emptiest varieties and message donors for refills"
    ]
  ],
  "digital-literacy": [
    [
      "Post one ask for unused laptops and tablets in a group chat you're already in",
      "At pickup, watch the donor sign out of iCloud or Google before the device leaves",
      "Set one box for 'works' and one for 'parts' and sort each device as it arrives",
      "Wipe, update, and test one device end to end before batching the rest"
    ],
    [
      "Open a blank sheet and type five columns: who, device, serial, condition, due date",
      "Number each device and its charger as one set with matching stickers",
      "Write the loan length and a no-shame late policy in two sentences",
      "Run one pretend checkout with a volunteer to catch what the form misses"
    ],
    [
      "Look up your library's hotspot lending page and note what they offer",
      "Call two carriers or a low-cost program and ask the real data cap on each plan",
      "Print a half-page list of free WiFi spots near where borrowers live",
      "Test one hotspot with a ten-minute video call before it goes out the door"
    ],
    [
      "Message two patient friends and ask if they'd sit with a beginner once a month",
      "Write your three tutor rules on a card: learner drives, no jargon, hands off the mouse",
      "Run the role-play: each tutor guides someone through a task without touching the device",
      "Pair every new tutor with a real learner and sit in on the first session"
    ],
    [
      "Text one future learner and ask the single thing they most want to do online",
      "Pick the top four topics and give each its own page — one skill per page",
      "Screenshot the exact screens learners will see and paste them in big",
      "Hand a draft page to one learner and watch where their finger hesitates"
    ],
    [
      "Ask the host space by text for two weekly slots: one daytime, one evening",
      "Cap sign-ups at six per class so nobody waits silent in the back",
      "Recruit a second helper to float during drop-in hours for the thorny problems",
      "Put the schedule on paper flyers in the places your learners already go"
    ],
    [
      "Look up the factory-reset steps for your two most common device models",
      "Tape a checklist at the return desk: save the borrower's photos first, then wipe",
      "Write a one-paragraph plan for lost or damaged devices that keeps the door open",
      "Add a five-minute passwords-and-privacy chat to every device handoff"
    ]
  ],
  "weatherization-brigade": [
    [
      "Text the three handiest people you know and ask for one work day a month",
      "Post the ask on the hardware store and lumber yard bulletin boards",
      "Ask each volunteer what jobs they've actually done, not what they could do",
      "Pair every newcomer with an experienced lead on a low-stakes first job"
    ],
    [
      "Invite your two most experienced leads to a one-hour scope talk",
      "List the jobs you'll take: caulking, weather-stripping, grab bars, minor fixes",
      "Write the stop-and-refer list: electrical, gas, roofing, structural",
      "Add lead paint and old insulation to that list for pre-1978 homes",
      "Print the two lists on one page for every crew member"
    ],
    [
      "Pick the phone number that will take requests and text the crew to confirm",
      "Make a paper request form and leave copies at the pantry and senior center",
      "Draft a one-page visit checklist: job scope, materials, safety limits",
      "Book assessments in pairs — two people walk through every home",
      "Photograph everything on the visit and say you'll confirm the plan later"
    ],
    [
      "Pull the material list from your latest assessment and add up quantities",
      "Ask the hardware store manager for a discount or donation for the brigade",
      "Buy low-odor, low-VOC caulk and products for occupied homes",
      "Label a shared tool bin and list what's inside on the lid"
    ],
    [
      "Email your insurer or a local nonprofit asking about volunteer repair coverage",
      "Get written confirmation that the policy names volunteer home repair",
      "Draft a simple waiver and print copies for every homeowner and volunteer",
      "Buy or check first-aid kits and set a ladder rule: feet held, never top rungs"
    ],
    [
      "Pick one Saturday and match two or three assessed jobs to crews",
      "Call each homeowner the week before to agree on the plan and arrival time",
      "Call again the morning of, so no one is startled by the crew",
      "Pack water, trash bags, and cleanup gear so the visit costs the home nothing",
      "Walk the finished work with the resident before the crew leaves"
    ]
  ],
  "pet-food-bank": [
    [
      "Text the food pantry coordinator about sharing their space and distribution day",
      "Walk the space and check it's dry, pest-free, and lockable",
      "Price sealed bins and a shelf or pallet to keep food off the floor",
      "Confirm the handout spot and hours with whoever hosts you"
    ],
    [
      "Call one pet store and ask what they do with torn or damaged bags",
      "Send a short donation ask to two more stores and a vet clinic",
      "Set a monthly pickup day with everyone who says yes",
      "Start a simple log of what comes in each week so you can spot gaps"
    ],
    [
      "Grab a marker and label three bins: dog, cat, other",
      "Check every bag's expiration date and pull anything past it",
      "Set prescription and vet diets apart in their own labeled bin",
      "Count each bin and post the totals where the team can see them"
    ],
    [
      "Text one pet-owning friend and ask how much food their animals go through in a month",
      "Set portions by animal count and size, not one flat bag per household",
      "Fix a frequency people can plan around — same amount, same schedule",
      "Write the policy in one paragraph with no proof-of-need requirement"
    ],
    [
      "Message two volunteers and ask which recurring day they could staff",
      "Set the same day and time each month so owners can count on you",
      "Check before each session that both dog and cat food are on the table",
      "Brief the crew: no comments on anyone's choices — just hand over the food"
    ]
  ],
  "youth-mentorship": [
    [
      "Email the school, library, and community center asking about an after-school room",
      "Visit the top option and check exits, bathrooms, and space to move",
      "Ask for the same room for the whole term in writing, not month to month",
      "Set the weekly hours and share them with families before opening"
    ],
    [
      "Download a sample youth-protection policy from an established program",
      "Write the background-check requirement: no adult starts before clearing it",
      "Spell out the two-adult rule to cover bathrooms, rides home, and tutoring",
      "Look up your mandatory-reporting law and write the reporting steps in",
      "Have every adult sign the policy before their first session"
    ],
    [
      "Ask two trusted community groups to each suggest one reliable adult",
      "In each interview, ask directly: can you commit every week, all term",
      "Start background checks the day someone says yes",
      "Run a training on boundaries, safety rules, and helping without doing the work"
    ],
    [
      "Ask three kids what they'd actually want to do after school",
      "Sketch the fixed rhythm on one page: snack, then homework, then activity",
      "Plan the first two weeks of activities, borrowing ideas the kids named",
      "Leave one slot a week the youth themselves get to program"
    ],
    [
      "List on your phone what the form needs: permission, allergies, contacts, pickup",
      "Draft the one-page enrollment form from that list",
      "Hand it to families in person and help anyone fill it out on the spot",
      "Post severe allergies where staff see them at snack time, not in a binder",
      "Confirm who may pick up each child, then lock the forms away"
    ],
    [
      "Text one grocery store or bakery asking about a weekly snack donation",
      "Write the shopping list nut-free by default",
      "Label anything donated whose ingredients you can't vouch for",
      "Put out a call for books, art supplies, and games in the community chat"
    ],
    [
      "Set a phone alarm so you arrive before the first kid does",
      "Set out the sign-in sheet and snack before doors open",
      "Count heads at arrival and again before anyone leaves; note who picked up whom",
      "Say one specific good thing to a parent at pickup",
      "Jot two lines after closing: what worked, which kid needs a check-in"
    ]
  ],
  "gleaning-network": [
    [
      "List five nearby sources from memory: farms, orchards, vendors, loaded fruit trees",
      "Visit or call the two most likely and ask what surplus goes unpicked",
      "Ask each grower what NOT to touch and where crews may park and walk",
      "Note each yes with crop, rough timing, and a contact number"
    ],
    [
      "Ask your group chat who could drop everything for a weekday-morning harvest",
      "Ask each yes for their real availability, not their good intentions",
      "Keep a list of firm yeses with numbers — three reliable beats ten maybes",
      "Run one practice call-up and see who actually answers within the hour"
    ],
    [
      "Text two friends with trucks or hatchbacks and ask about weekday availability",
      "Ask a church, restaurant, or grocer for a cool corner to hold food a day at a time",
      "Collect more crates than you think you need — one tree can yield hundreds of pounds",
      "Write the plan on one card: who drives, where food waits, who moves it on"
    ],
    [
      "Create the dispatch group chat now and add your confirmed crew",
      "Write a template alert: crop, address, time window, what to bring",
      "Agree that only written yeses count as coming — a reply, not a thumbs-up",
      "Send one test alert and time how fast three people confirm"
    ],
    [
      "Look up your area's Good Samaritan food-donation law",
      "Borrow a waiver template from an established gleaning group",
      "Write the no-go list with growers: nothing off the ground for greens, no rot mixed in",
      "Print waivers and handling rules for the glean-day folder"
    ],
    [
      "Text one fridge, pantry, or meal program and ask what produce they can actually move",
      "Ask each outlet its capacity and drop-off hours, and write both down",
      "Match big crops to big outlets — a small pantry can't move 200 pounds of peaches",
      "Confirm a named person at each outlet who answers on harvest day"
    ],
    [
      "Put a bathroom scale or hanging scale in the glean-day kit tonight",
      "Walk the site with the grower first and flag what's off-limits",
      "Weigh the haul at the field before splitting it — you can't reconstruct it later",
      "Deliver within hours and text each grower their poundage with a thank-you"
    ]
  ],
  "community-mediation": [
    [
      "Look up the nearest community mediation center and note their contact",
      "Call and ask about training options or partnering",
      "Write a short list of calm, fair-minded people you'd trust with a dispute",
      "Ask each in person; look for people who stay neutral even when they privately disagree",
      "Book the training dates and confirm who's committed"
    ],
    [
      "Jot down two options for the single contact point: a shared email or a voicemail number",
      "Set up the one you pick and send yourself a test message",
      "Draft five intake questions, including one that surfaces fear or a power imbalance",
      "Write \"each side separately, never together\" at the top of the intake sheet",
      "Decide who takes intake calls and how fast you reply"
    ],
    [
      "Email the library about booking a quiet meeting room",
      "Visit and check for two exits and nowhere for one side's friends to linger",
      "Confirm it sits on neither party's turf — not one side's church or building",
      "Get a second option booked so scheduling never forces a bad room"
    ],
    [
      "Write one sentence in your notes: what we take, what we refer out",
      "List the disputes you'll take: noise, shared spaces, minor neighbor conflicts",
      "Name what you won't touch: anything involving violence, abuse, or danger",
      "Build the referral list now: DV hotline, tenant lawyer, crisis line",
      "Share the written scope with every mediator and intake volunteer"
    ],
    [
      "Draft the ground rules as five plain lines in your notes app",
      "Decide now what you'd do if someone discloses a threat or child abuse mid-session",
      "Word the confidentiality promise with that limit, so you never overpromise",
      "Format it as a one-page handout participants read before starting"
    ],
    [
      "Text one property manager you know that free neighbor mediation now exists",
      "List where disputes surface — HOA boards, managers, housing office — and visit each",
      "Make a small flyer that says free, voluntary, and confidential",
      "Ask partner orgs to hand your contact to both sides of a brewing conflict"
    ],
    [
      "Open a note with three tallies: taken, referred out, resolved — never names",
      "Update it right after each case closes",
      "Debrief after every hard case, not just once a month",
      "Rotate cases so nobody carries the heavy ones back to back",
      "Book a standing monthly check-in with each mediator, even when things seem fine"
    ]
  ],
  "reentry-support": [
    [
      "List five services you already know: ID help, shelter, benefits office",
      "Call each one to confirm it still exists and still takes people with records",
      "Write down a named contact at each place, not just the front-desk number",
      "Ask a reentry org which fair-chance employers and landlords actually deliver",
      "Add a \"last verified\" date to every line of the directory"
    ],
    [
      "Message two steady, nonjudgmental people you'd trust with a hard story",
      "In each conversation, listen for fixers — you want partners, not saviors",
      "Ask a local reentry org to run one trauma-informed training for your crew",
      "Walk every volunteer through confidentiality before they meet anyone"
    ],
    [
      "Write your opening question on a card: \"What do you need most right now?\"",
      "Keep the form to one page — name, top three needs, best way to reach them",
      "Practice the conversation once with a volunteer playing the other side",
      "Agree the record never comes up unless the person raises it themselves"
    ],
    [
      "Call one partner org and ask if they'll receive mail for people you support",
      "Write the order on paper: mailing address, birth certificate, ID, then benefits",
      "Gather your county's actual forms and fee amounts into one folder",
      "Sit with each person through the first application instead of handing it over"
    ],
    [
      "Text one fair-chance employer contact to confirm they're still hiring this month",
      "Help draft a one-page resume that leads with skills and recent work",
      "Practice the record question out loud together before any interview",
      "Make every intro warm — a call to a named person, not a job-board link",
      "Check in after each interview or viewing and log how it went"
    ],
    [
      "Ask one person with lived reentry experience if they'd consider mentoring",
      "Pair each mentor with one person, not a caseload",
      "Set a monthly check-in where the mentors themselves get support",
      "Agree what mentors handle and where they hand off to volunteers or pros"
    ],
    [
      "Open a doc and write the first rule: nothing shared without the person's okay",
      "List exactly who may see any record and lock everyone else out",
      "Decide what you refuse to write down at all",
      "Route every legal question to your named attorney contact, never group advice",
      "Read the rules aloud with volunteers before they start"
    ]
  ],
  "community-wood-bank": [
    [
      "Call one local tree service and ask where their wood goes now",
      "List other leads: storm cleanup crews, the county, landowners with downed trees",
      "Visit the best lead and look at the wood — species, size, how green it is",
      "Get written permission naming what you can take and where the property line runs"
    ],
    [
      "List three possible yards: a church lot, a farm corner, a member's rural acreage",
      "Ask each owner for a walk-through this week",
      "Measure for two years of wood — this winter's dry stack plus next winter's drying",
      "Check truck access, neighbors' noise tolerance, and drainage on the walk",
      "Get a written okay covering saw noise, hours, and how long wood can sit"
    ],
    [
      "Write a list: splitter, two saws, and full protective gear per operator",
      "Post one borrow-or-donate ask to members and local farm or firewood groups",
      "Price chaps, eye, and ear protection for every operator — no shared gear",
      "Have someone who knows saws inspect each donated tool before it's accepted",
      "Stock a first-aid kit and stage everything in one labeled spot at the site"
    ],
    [
      "Text members and neighbors asking who has real chainsaw experience",
      "Name one experienced person as safety lead with the final go/no-go call",
      "Ask the extension office or a sawyer about a basic chainsaw safety course",
      "Sort the crew: trained operators on saws, everyone else stacking and hauling",
      "Write the five-minute safety briefing you'll run before every work day"
    ],
    [
      "Text the group asking whose phone number can take wood requests",
      "Ask at request time where the wood should go and if there's a clear, dry path",
      "List members with trucks and match each one to a delivery day",
      "Call the fuel-assistance office and ask them to pass your number along",
      "Stack the first delivery yourself to see how long one household takes"
    ],
    [
      "Text two wood-heating households and ask how much they burn in a cold month",
      "Draft portions in real terms — cords or weeks of heat, not \"a load\"",
      "Write who comes first: elders, medical needs, homes with kids, no backup heat",
      "Keep the ask simple — no proof or paperwork, just name, address, and stove type",
      "Put a midwinter check-in on the calendar for households that ran short"
    ],
    [
      "Count back from November: mark the spring cutoff for cutting this winter's wood",
      "Put the first two work days on the calendar and invite the trained crew",
      "Start a simple log of each stack: date split, wood type, ready-by date",
      "Tag stacks seasoned and green so nobody delivers wet wood in a rush",
      "Set a monthly reminder to update the log and book the next work day"
    ]
  ],
  "community-wifi-mesh": [
    [
      "Print or sketch a map of the blocks you want to cover",
      "Walk the blocks with the map, marking trees, brick walls, and tall buildings",
      "Knock on doors and ask who lacks service and what they'd use it for",
      "Star the rooftops and upper windows with clear line-of-sight and friendly owners",
      "Photograph the marked map and share it with the group"
    ],
    [
      "List three candidates with a spare line: a business, the library, a friendly ISP",
      "Email or visit one today and ask plainly about sharing bandwidth with neighbors",
      "Read the plan's terms of service yourself for any resharing ban",
      "Get the redistribution okay in writing before spending a dollar on hardware"
    ],
    [
      "Message the two most network-comfortable people you know and ask for an hour",
      "Post one ask in local tech, maker, or ham radio groups",
      "Aim for two admins with different jobs and addresses, plus a willing learner",
      "Hold a short kickoff where each admin logs into a test router themselves"
    ],
    [
      "Post one ask for spare routers in local groups and group chats",
      "List the nodes and antennas your map calls for and price what donations won't cover",
      "Set a strong admin password on each router and store it in a shared vault",
      "Configure each node at a table and label it with its planned site",
      "Test two nodes meshing across your own street before any rooftop work"
    ],
    [
      "Text the three friendliest starred spots from your map to ask for a visit",
      "Visit each with a node in hand and check power, mounting spot, and sight lines",
      "Draft a one-page host agreement: roof access, power dollars, damage responsibility",
      "Sign it with each host and offer to cover the few dollars of monthly power"
    ],
    [
      "Open a blank page and write rule one: what the network is for",
      "Add the no-logging promise and a line that an open network isn't private",
      "Turn logging off in each router's settings and have a second admin verify",
      "Add one line pointing users to HTTPS and VPNs for their own safety",
      "Post the page at host sites and as the network's welcome page"
    ],
    [
      "Set a monthly phone reminder to check every node",
      "Label each node with its location and a check-in date",
      "Keep one spare router configured and charged so a swap takes minutes",
      "Write the setup doc as you go and have the second admin follow it once without you",
      "Keep a waiting list of hosts and add a node each time the network runs stable"
    ]
  ],
  "mental-health-peer-support": [
    [
      "Text two warm, steady people you know and ask if they'd consider facilitating",
      "Look up one peer-support or active-listening training nearby and note the dates",
      "Ask each candidate how they'd handle a room gone quiet after a hard disclosure",
      "Gently pass on anyone still raw from their own crisis — for now",
      "Book the training and confirm both facilitators can make every session"
    ],
    [
      "Set a 20-minute timer and draft what the circle won't do",
      "Write the boundaries as prohibitions: no diagnosing, no fixing, no replacing therapy",
      "Add three plain lines on what it is: listening, company, shared experience",
      "Read the draft aloud to a facilitator and cut whatever they stumble over"
    ],
    [
      "Look up your local crisis line and nearest walk-in clinic; save both numbers",
      "Call each number yourself to confirm it's live and note the hours",
      "Write the mid-session steps: pause the group, step aside, warm handoff",
      "Print a copy for every facilitator — the night it's needed, wifi may be down"
    ],
    [
      "List three possible rooms: the library, a faith site, a community center",
      "Visit the best one and check for a door that closes and no glass walls",
      "Ask the host who else uses the building during your hour",
      "Lock in the same room, same time, every week — consistency helps people return"
    ],
    [
      "Jot the five rules you already know you need, starting with confidentiality",
      "Add the right to pass and no advice unless someone asks for it",
      "Ask both facilitators to rewrite the draft in plainer words",
      "Print it big enough to read aloud at the start of every session"
    ],
    [
      "Text your facilitators one question: which weeknight can you hold for six months",
      "Skip Friday nights and right-after-work hours — pick a kinder time",
      "Write a stigma-free blurb: free, peer-led, no diagnosis needed",
      "Send it to clinics, faith groups, and the community board",
      "Decide now to cap the circle near eight and how you'll handle overflow"
    ],
    [
      "Put a monthly facilitator check-in on the calendar right now",
      "Hold it somewhere that isn't the circle's room — coffee works",
      "Ask each facilitator which session moments have stuck with them",
      "Set a rotation so nobody leads three sessions in a row",
      "Watch for the one who never misses and never rests — offer them the first break"
    ]
  ],
  "community-cleanup": [
    [
      "Snap a photo of the messiest spot you pass on your way home today",
      "Walk two more blocks and photograph every corner that needs work",
      "Ask two nearby residents which lot bothers them most and who owns it",
      "Revisit your top spots at a different hour — morning and evening tell different stories",
      "Rank the list by impact and how doable each site is in one day"
    ],
    [
      "Look up the top site's owner on the city parcel map or ask a longtime neighbor",
      "Call or write the owner for written permission with the date you have in mind",
      "Call the city about a bulk pickup and write down the reference number they give you",
      "If the city can't, price a dumpster and confirm drop-off and pickup dates in writing"
    ],
    [
      "Ask the group chat who already owns gloves, grabbers, and high-vis vests",
      "Buy one rigid sharps container and two pairs of puncture-resistant gloves",
      "Count bags and gloves against your signup list and fill the gaps in one trip",
      "Pack everything in labeled bins the night before, sharps container on top"
    ],
    [
      "Post the date, meeting spot, and time in two neighborhood channels right now",
      "Keep a signup list and recruit a third more people than you think you need",
      "Ask three dependable people to be team leads and confirm each one by name",
      "Sketch the site into zones and assign each lead a zone before the day"
    ],
    [
      "Write tonight's welcome card: zones, leads, water, never pick up needles by hand",
      "Arrive early and shoot the before photos from a spot you can stand in again",
      "Read the welcome card to everyone, then send each team out with its lead",
      "Walk the zones mid-morning topping up bags, water, and encouragement",
      "Take the after photos from the same spots, share the pair, and set the next date"
    ]
  ],
  "free-tax-prep": [
    [
      "Look up this year's VITA certification dates and where the training runs",
      "Ask three would-be preparers if they can commit to the full training",
      "Register everyone before fall ends — certification takes weeks, not days",
      "Set a group study session before the certification test"
    ],
    [
      "Find your regional free-filing coordinator's email and send a two-line intro",
      "Book a call and ask what a new site needs: software, site rules, quality review",
      "Write down their timeline before promising anyone an opening date",
      "Send back the paperwork they need to add you as a site"
    ],
    [
      "Text two venues with rooms and wifi — a library branch, a community center",
      "Run a speed test on your phone at each; filing software stalls on weak upload",
      "Count outlets and tables, and check chairs can sit apart for privacy",
      "Reserve the space for the whole season, not week by week"
    ],
    [
      "Ask your partner program for their standard required-documents checklist",
      "Pick a booking method people can use by phone, not just online",
      "Put the document checklist into every confirmation and reminder",
      "Make a test booking yourself and fix anything confusing"
    ],
    [
      "Draft one line — \"Free tax help; you may be owed a refund\" — and test it on a friend",
      "Print flyers with dates, location, and the document checklist on the back",
      "Hand flyers to places workers already go: laundromats, corner stores, bus stops",
      "Aim outreach at people who think they earn too little to bother filing"
    ],
    [
      "List every place client data could live: laptops, drives, the paper stack",
      "Write the retention rule: nothing carried home, and a set shred date",
      "Set screen-lock timers and separate logins on every site laptop",
      "Get a lockbox for paper and a shredder for destruction day"
    ],
    [
      "List three local referrals: benefits screening, safe banking, budgeting help",
      "Call each one to confirm they're taking people and how to send someone",
      "Make a small take-home card, offered after the return is done — never at the table",
      "Agree with preparers on the one sentence they'll use to offer it, no pitch"
    ]
  ],
  "community-market": [
    [
      "List three possible sources: a farm, a grocer, a community garden",
      "Visit each and ask what surplus they actually have and on what rhythm",
      "Pin down each supplier's day and rough volume in writing, not \"whenever we have extra\"",
      "Add one backup source so a bad week doesn't empty the stand"
    ],
    [
      "Write down two or three candidate spots where neighbors already walk",
      "Visit each at the actual market hour and count who walks by",
      "Check for shade and a water source nearby",
      "Ask permission from whoever runs the spot and get it in a text or email",
      "Round up tables, a canopy, and a simple sign"
    ],
    [
      "Message your core crew to set a 20-minute decision chat",
      "Talk through free, pay-what-you-can, or a mix, and what never-turned-away means",
      "If pay-what-you-can, agree on one unmarked box with no suggested price on display",
      "Write the choice down in one sentence everyone can repeat at the table"
    ],
    [
      "Send one group text asking what coolers, tables, and ice packs people already own",
      "Line up coolers and ice for anything leafy or cut",
      "Plan shade over the produce: a canopy or the shady side of the lot",
      "Agree the discard line with the crew: when in doubt, compost it"
    ],
    [
      "Message three reliable people and ask which market job they'd take",
      "Fill the unglamorous slots first: the early pickup drive and pack-down",
      "Name a backup for every role so one no-show doesn't cancel the market",
      "Put the roster where everyone sees it and confirm two days before each market"
    ],
    [
      "Text the crew two day-and-time options and ask for a quick vote",
      "Make one simple flyer with day, time, place, and \"free, everyone welcome\"",
      "Post it where neighbors already pass: laundromat, bus stop, corner store",
      "Tell the neighbors you met while scouting so they hear it in person",
      "Set the market as a repeating event in the shared calendar, even on thin weeks"
    ],
    [
      "Text a fridge, pantry, or meal program before market day to take the leftovers",
      "Arrive early to set up tables, shade, and coolers",
      "Greet people warmly and skip forms, questions, and sorting anyone",
      "At close, drive the surplus straight to your arranged drop-off",
      "Note what ran out and what was left, for next week's plan"
    ]
  ],
  "welcome-wagon": [
    [
      "Message two or three interested neighbors to pick a time to talk this week",
      "Choose your focus together: new residents, new parents, or both",
      "Agree the first contact is a note or call — never an unannounced knock",
      "Write the one-line offer people can say yes or no to"
    ],
    [
      "Start a list on your phone: clinic, transit, schools, food help, your program",
      "Call or check each listing to confirm hours and location are current",
      "Write the date and an \"updates go to…\" contact on the front page",
      "Ask a bilingual neighbor to translate it into the languages spoken nearby"
    ],
    [
      "Post one ask in the neighborhood chat for pantry basics and household goods",
      "Pick a packing spot and set a date to fill the first five baskets",
      "Keep items shelf-stable and unscented unless you know the household",
      "Tuck the info packet and a handwritten hello into each basket"
    ],
    [
      "Text the two friendliest people you know and ask them to be greeters",
      "Meet for an hour and role-play a doorstep visit together",
      "Practice the short version: hand the basket, name one way to reach you, go",
      "Agree on the signal for \"they'd rather be left alone\" and honor it"
    ],
    [
      "List the places that meet newcomers first: landlords, schools, clinics, midwives",
      "Visit or call each one and explain the welcome program in two minutes",
      "Ask them to get the newcomer's consent before passing along any name",
      "Make a simple opt-in form and leave copies at each partner's desk"
    ]
  ],
  "library-of-things": [
    [
      "Type ten candidate items into your notes app: tables, tent, carpet cleaner, drill",
      "Add a blank line and the question: what would you have used in the last year?",
      "Post the survey on the board and hand paper copies to five neighbors",
      "Tally the answers after a week and rank the top ten requests"
    ],
    [
      "Text the public library or community center to ask about a spare closet or room",
      "Measure your two bulkiest requested items — they size the space you need",
      "Visit the best option with a tape measure and check the door width too",
      "Agree on pickup and return hours the host can sustain, and write them down"
    ],
    [
      "Post a wanted list of your top ten survey items — not an open call for anything",
      "Set one drop-off day and ask donors to bring cords, bags, and parts along",
      "Plug in and run every electrical item before it earns a shelf spot",
      "Check motorized and kids' items against the CPSC recall list",
      "Box the rejects for disposal the same day so they don't pile up"
    ],
    [
      "Number twenty masking-tape labels and stick the first one on an item",
      "Photograph each item right beside its number in decent light",
      "Log number, name, condition, and photo — one spreadsheet row per item",
      "Give accessories — bags, cords, attachments — their own numbered lines"
    ],
    [
      "List your five most-requested items and guess how fast each will turn over",
      "Set loan lengths per item: a weekend for the projector, a week for the cleaner",
      "Write a forgiving late policy — a friendly nudge, never a fee",
      "Note in one line which items need extra care or cleaning on return",
      "Ask a librarian volunteer to read the rules and cut what confuses them"
    ],
    [
      "Rule a sign-out sheet with four columns: name, contact, item, due date",
      "Add the step everyone skips: a condition photo at checkout and again at return",
      "Walk both librarians through one practice checkout, start to finish",
      "Watch each librarian run one solo checkout before opening day"
    ],
    [
      "Tape a 'requests we couldn't fill' sheet next to the checkout sheet",
      "Clean and inspect each return the day it comes back, not in batches",
      "Set a monthly repair hour and keep fixable items where you'll see them",
      "Buy or hunt down the top item from the unfilled list — not your own guess"
    ]
  ],
  "laundry-shower-access": [
    [
      "List three possible hosts: a laundromat, a gym, a faith site with showers",
      "Call the friendliest one and ask for a fifteen-minute visit this week",
      "Walk the route from the waiting area to the shower door — is it truly private?",
      "Tell the host plainly who's coming and what cleaning your team will cover",
      "Confirm the agreed days and terms in one follow-up text or email"
    ],
    [
      "Write the needs list: detergent, towels, soap, shampoo, flip-flops",
      "Ask for travel-size and unscented right in the donation post",
      "Call one congregation or store about covering the first month",
      "Pack arrivals into shower kits — one bag per guest, ready to hand over"
    ],
    [
      "Text the host to confirm how many machines and showers you get per session",
      "Make a paper sign-up sheet that asks for a first name — or nothing at all",
      "Decide the fair-turn rule — first come, returning guests, or a mix — and post it",
      "Run one session on paper before trying anything fancier"
    ],
    [
      "Ask the host which cleaning products they require between uses",
      "Time one full stall clean: disinfect, mop, fresh towel",
      "Build those minutes into every slot so no guest gets a dirty stall",
      "Write the routine as a checklist and tape it inside the supply closet",
      "Agree with the host on who restocks and who handles plumbing trouble"
    ],
    [
      "Message three patient, unflappable people you'd trust at a front desk",
      "Shadow each recruit through one full session before they run intake alone",
      "Rehearse the awkward scenarios together: an intoxicated guest, a slot running long",
      "Agree who gets called first — so nobody panic-calls the host",
      "Set the tone plainly: greet guests like a hotel, not a clinic"
    ],
    [
      "Text your volunteers one question: which weekly hours can you hold for six months",
      "Set the schedule to what's sustainable, not what's impressive",
      "Print simple cards with hours and location — no paperwork mentioned",
      "Hand the cards to outreach workers, shelters, and street-connected neighbors",
      "Hold the hours fixed — one changed week teaches people the door may be locked"
    ]
  ],
  "voter-registration": [
    [
      "Look up your election office's phone number and email right now",
      "Call and ask what registration drives may and may not do locally",
      "Write down the exact form-return deadline and who may legally submit forms",
      "Ask whether volunteers need training or registration before tabling",
      "Email an established nonpartisan group to borrow materials and advice"
    ],
    [
      "Message your volunteers two possible one-hour training times today",
      "Write the stock reply to \"who should I vote for?\" on a card for every volunteer",
      "Walk through one real registration form together, field by field",
      "Role-play a pushy political question until the neutral answer comes easily"
    ],
    [
      "Open the election office's official page and bookmark it",
      "Print deadlines, ID rules, and polling info straight from that page",
      "Write today's date on every printout so stale copies are obvious",
      "Pick up blank registration forms from the election office itself"
    ],
    [
      "List five spots where eligible neighbors already gather — market, transit, campus",
      "Message each spot's manager asking permission to set up a table",
      "Get the yes in writing, even just an email, before you schedule a shift",
      "Match each confirmed spot to a date and time on the calendar"
    ],
    [
      "Write a packing list on your phone: forms, pens, clipboards, dated info sheets",
      "Pack the kit the night before and put it by the door",
      "Name one person to hold the sealed folder of completed forms all shift",
      "Read each form back with the registrant before they leave the table",
      "Deliver the folder to the election office the same day, well inside the deadline"
    ],
    [
      "Look up the official polling-place finder link and save it on your phone",
      "Draft a wallet-size card: election date, that lookup link, mail-in deadline",
      "Print a stack and keep them in the table kit next to the forms",
      "Hand one to each new registrant and ask if they'll need a ride to vote"
    ]
  ],
  "health-navigation": [
    [
      "Search \"free clinic near me\" and paste the first three results into a doc",
      "Call each one for the direct intake line and current eligibility rules",
      "Add columns for languages, sliding scale, and the date you verified each entry",
      "Set a recurring reminder to re-check every entry before it goes stale"
    ],
    [
      "Text three patient, organized people you know and ask if they'd be navigators",
      "Write the boundary in one line: logistics and paperwork yes, medical advice never",
      "Drill the exact words: \"I'm not medical — let me connect you to a nurse line\"",
      "Role-play one scared-caller scenario with each new navigator"
    ],
    [
      "Ask the crew chat who can lend a phone number for intake this month",
      "Set up voicemail with a warm greeting in the languages you serve",
      "Add an in-person option: fixed hours at a library or community center",
      "Decide what you'll never write down — diagnoses, immigration status — before call one"
    ],
    [
      "Look up today whether open enrollment is currently open in your area",
      "Print the document list people need: income proof, household size, ID",
      "Gather documents with each person before opening their application",
      "Find a certified enrollment assister to shadow on your first case"
    ],
    [
      "Save the rides program contact in your phone right now",
      "Ask about transportation in the same call that books the appointment",
      "Set a day-before reminder text for every appointment you book",
      "Look up two prescription discount programs and keep them on a card"
    ],
    [
      "Write rule one on a sticky note: collect the minimum, share nothing without consent",
      "List what intake actually needs and cut everything else",
      "Pick one locked place — physical or encrypted — where notes live",
      "Review the rules with every navigator before they take a first call"
    ],
    [
      "Email one clinic asking for fifteen minutes with their intake coordinator",
      "Visit and ask which referrals actually help them and which swamp them",
      "Give them one named contact on your side for warm handoffs",
      "Set a quarterly check-in to hear about new low-cost services"
    ]
  ],
  "toy-library": [
    [
      "Text the community center or branch library asking about one spare shelf",
      "Visit with a stroller and check the route in — no stairs, room to park it",
      "Ask three parents at pickup which two weekly hours they could actually make",
      "Confirm the shelf sits at kid height and post the hours on it"
    ],
    [
      "Bookmark the CPSC recall page on your phone",
      "Set out a labeled donation bin at the storage spot",
      "Check each donated toy against the recall list before anything else",
      "Drop small parts through a toilet-paper tube; if they fit, pull it for under-threes",
      "Wash and dry each keeper, and bin anything cracked or missing parts"
    ],
    [
      "Ask in the community chat for zip-top bags and a permanent marker",
      "Photograph each toy beside its number and log it with an age range",
      "Count multi-piece sets into their bag and write the count on the label",
      "Shelve bagged sets label-out so the count shows at return"
    ],
    [
      "Look up one other toy library's borrowing rules for a starting point",
      "Draft loan length and how many toys per family, in plain words",
      "Write the missing-pieces policy as one kind sentence — no fines, just tell us",
      "Ask two parents to read it and flag anything that feels like a scolding"
    ],
    [
      "Print five blank sign-out sheets: name, contact, toy number, due date",
      "Walk each volunteer through one practice checkout and return",
      "Fold the piece count and a quick wipe-down into the return step itself",
      "Post the cleaning routine and rules where the librarian sits"
    ]
  ],
  "food-preservation": [
    [
      "Text one church hall or community center to ask about using their kitchen",
      "Visit and check the stove holds a full canner's weight and hits a hard rolling boil",
      "Check counters, sinks, and a corner where hot jars can cool undisturbed",
      "Book dates around harvest peaks, not whenever the room happens to be free"
    ],
    [
      "Download the current USDA Complete Guide or your extension service's version",
      "Check the publication year and write it on the cover",
      "Call the extension office and ask them to train your leads or review your plan",
      "Agree as leads: tested recipes only, no scaling, no grandmother exceptions"
    ],
    [
      "Post one ask for canners, jars, and rings in a local group you're already in",
      "Book a gauge test for each pressure canner at your extension office — often free",
      "Run a finger around every donated jar rim and cull any with chips",
      "Buy new lids for every planned jar and note which rings and tools are still missing"
    ],
    [
      "Text one gardener or gleaner and ask what's about to peak",
      "Sketch a quick harvest calendar: which crop floods in, in which weeks",
      "Commit a specific quantity to a specific session date with each source",
      "Schedule pickup within a day or two of harvest so nothing sits and softens"
    ],
    [
      "Ask the group by text who has canned before and who's brand new",
      "Pick one tested recipe that fits the produce and the least experienced hands",
      "Match the food to its safe method — water bath for high-acid, pressure for low",
      "Sketch the stations on paper: wash, prep, fill, process, cool",
      "Assign one named person per station before anyone shows up"
    ],
    [
      "Print the tested recipe and processing times and tape them at eye level",
      "Open with a five-minute safety talk: why times and methods aren't negotiable",
      "Name one person as timekeeper to log every batch in and out",
      "Pair each newcomer with an experienced hand at every station",
      "Walk the room narrating what you're doing so the skill actually spreads"
    ],
    [
      "Grab a marker and label the first cooled jar: contents, method, date",
      "Press each lid center and pull aside any jar that didn't seal — fridge, not shelf",
      "Count jars per person and set aside the share for the fridge or pantry",
      "Jot three lines while it's fresh: what worked, what jammed, what to change"
    ]
  ],
  "free-haircut": [
    [
      "Message one stylist or barber you know and ask for ten minutes to pitch the idea",
      "Ask each yes how many cuts they can really do in a session — usually six to eight",
      "Ask each recruit to bring one colleague along",
      "Collect license numbers and preferred dates in one list"
    ],
    [
      "Text a shelter, day center, or church about hosting for one afternoon",
      "Walk the room and check for water, good light, and floors you can sweep",
      "Count grounded outlets within a cord's reach of where each chair would sit",
      "Confirm the date and who unlocks in one message you can point back to"
    ],
    [
      "Text your stylists to ask what gear they bring, so you only buy the gaps",
      "Buy two sets of clipper guards and blades per station — one soaks while one works",
      "Ask a beauty supply shop to donate capes, combs, and disposable neck strips",
      "Pack take-home bags: razor, soap, deodorant, and a comb in each"
    ],
    [
      "Call your state cosmetology or barber board and ask their rules for free events",
      "Buy the EPA-registered disinfectant they name and note the required soak time",
      "Set up a soak station per chair: labeled tub, timer, and the printed soak time",
      "Write the between-clients routine on one card and tape it at each station"
    ],
    [
      "Text every stylist and the host two days out to confirm",
      "Set one chair where the room can't watch, for anyone who wants privacy",
      "Hand each guest a mirror and start with 'what would you like?' before any snip",
      "Keep phones pocketed — photos only if a guest asks for one",
      "Close by restocking take-home bags and booking the next date with the host"
    ]
  ],
  "mutual-aid-moving-crew": [
    [
      "Text four strong-backed friends and ask about their weekend availability",
      "Ask around for anyone with a truck, van, or trailer you could borrow",
      "Start a roster: name, phone, lifting ability, vehicle, usual free days",
      "Mark a small vetted core for sensitive moves — never staffed from open sign-up"
    ],
    [
      "Post one ask on the board: dollies, straps, moving blankets, sturdy boxes",
      "Prioritize a four-wheel furniture dolly — buy one if nobody donates it",
      "Stencil or write the program name on every piece so it comes back",
      "Pick one garage or closet as the gear's home and tell the crew where"
    ],
    [
      "Type five intake questions into your notes: rooms, stairs, distance, date",
      "Add the two everyone forgets: is it all packed, and how far is legal parking",
      "Decide how requests reach you — one phone number beats a form here",
      "Test the intake on a friend pretending to book a move"
    ],
    [
      "Look up one good safe-lifting video and send it to the whole crew",
      "Write the weight rule first: nothing over fifty pounds with fewer than two people",
      "Draft a one-page waiver and have everyone sign before the first move",
      "Ask each driver to confirm their insurance covers volunteer hauling"
    ],
    [
      "Open the roster and mark who's free for the next requested date",
      "Call the person the day before and confirm they're truly packed — not 'almost'",
      "Keep two backup names per move; moves can't easily be postponed",
      "Share addresses one-to-one from the coordinator's phone, never in a group chat"
    ],
    [
      "Jot the jobs you already know are too much: pianos, hazmat, hoarding cleanouts",
      "Look up who locally handles each one — movers, haulers, county services",
      "Pair every limit with that referral so a no still hands someone a next call",
      "Type it up as half a page and share it with the whole crew"
    ],
    [
      "Text the crew the night before: time, meeting spot, what to wear",
      "Load the heaviest furniture first and let the dolly do the lifting",
      "Walk the old place with the person one final time before pulling away",
      "Check in a few days later — are they settled, could the free store help",
      "Note what went well and what hurt while the move is still fresh"
    ]
  ],
  "disability-support-network": [
    [
      "Text two disabled neighbors you know and ask if they'd co-found this with you",
      "Let them pick the first meeting's format, place, and pace before you set anything",
      "Add a line to the budget for leaders' access costs and time",
      "Agree out loud on the rule: allies support, disabled members decide"
    ],
    [
      "Ask three members how they prefer to be reached: call, text, email, or in person",
      "Set up one channel per preference and name a person who tends each",
      "Have a screen-reader user try your sign-up and flyer before anything goes out",
      "Rewrite your first announcement in plain language and send it every way at once"
    ],
    [
      "Ask one member what errand or barrier cost them the most this month",
      "Draft five short questions and put them to members by phone, text, and in person",
      "List every local resource named, one per line, with a contact for each",
      "Call each listed place and ask about the lift, the bathroom, and the intake process",
      "Mark the three biggest gaps between what members need and what exists"
    ],
    [
      "Text three members and ask one thing they could offer and one they could use",
      "Make a two-column sheet — offers and needs — and pencil in the obvious matches",
      "Add a no-explanation pause option so anyone can step back for a week",
      "Make the first match yourself and check in with both people afterward"
    ],
    [
      "Post one ask for unused walkers, canes, and shower chairs in a local group",
      "Write the no-lend list first: nothing that touches breath or skin intimately",
      "Sanitize each aid, then tag it with a number, its serial, and your program name",
      "Set a simple sign-out sheet: item number, borrower, contact, date out"
    ],
    [
      "Save the number of your nearest benefits counselor in your phone",
      "Ask two members which office or form they'd most want company for",
      "Pair each request with a buddy who takes notes and asks for things in writing",
      "When money or benefits rules come up, route to the counselor instead of guessing"
    ],
    [
      "Jot the access wins and failures from the last event you went to",
      "Draft the checklist with disabled members: entry, seating, bathrooms, sound, materials",
      "Add an access-needs question to every RSVP form your program uses",
      "Walk one upcoming event through the checklist and fix what fails before the date"
    ]
  ],
  "books-to-prisoners": [
    [
      "Look up the mail policy page for one nearby facility on your phone",
      "Call or email the mailroom to ask for the current book policy in writing",
      "Save the policy as a dated file and note when to re-verify it",
      "Repeat for the second facility and jot down which rules differ",
      "Write the deal-breaker rules (new only, no hardcovers) on one index card"
    ],
    [
      "Text one friend to ask for paperback dictionaries or novels they'd donate",
      "Ask a church, library, or garage for a corner with a table for packing",
      "Post a donation call listing only what facilities accept — paperbacks in good shape",
      "Set a cull box at the door for hardcovers and marked-up books before sorting",
      "Sort what's left into rough shelves: dictionaries, fiction, education, reentry"
    ],
    [
      "Grab a notebook or open a spreadsheet with columns: name, ID number, unit, request",
      "Enter the letters you have, copying each name and ID exactly as written",
      "Add a request date and a sent column so nothing sits unanswered",
      "Pick one box or folder where every incoming letter lands before entry"
    ],
    [
      "Text two friends who love books and invite them to a packing evening",
      "Print the facility rules as a one-page checklist and tape it above the packing table",
      "Walk each new volunteer through packing one parcel while you watch",
      "Say the norm out loud: a second person checks every box before it's taped"
    ],
    [
      "Look up the Media Mail rate for a two-pound book parcel",
      "Ask the group chat for postage donations with a concrete amount per parcel",
      "Put a recurring mailing day on the calendar and invite two helpers",
      "Write a rule card for packers: no personal letters inside Media Mail parcels"
    ],
    [
      "Ask one volunteer if they'd like to pilot the pen-pal program",
      "Write the two boundary rules on a card: program address only, first names only",
      "Draft a kind, firm reply to money or romance requests and share it with writers",
      "Match the first pair and set a check-in after their first exchange"
    ]
  ],
  "community-music": [
    [
      "Post one ask for playable instruments in a group chat or local online group",
      "Text a music shop to ask about discounted repairs for a community program",
      "Play-test or open each case before accepting — skip free pianos and major cracks",
      "Pick up the yeses and tag each instrument with what repair it needs",
      "Drop the fixable ones at the shop and note the promised date"
    ],
    [
      "Open a blank sheet with columns: number, type, condition, who has it, date out",
      "Put a numbered sticker or tag on every instrument",
      "Photograph each instrument's condition and file the photos by number",
      "Write a three-line checkout note: care basics, return window, no repair bills",
      "Test the system by checking one instrument out to yourself"
    ],
    [
      "Text the two musicians you already know and ask if they'd teach a beginner",
      "Ask the church, school band, and senior center to name patient players",
      "Meet each yes for ten minutes to hear what and when they'd teach",
      "Start background checks now for anyone who'll teach kids",
      "Write names, instruments, and available times in one shared list"
    ],
    [
      "List three noise-tolerant rooms nearby: community center, school, faith hall",
      "Call or visit each and ask about evenings and weekend afternoons specifically",
      "Ask the friendliest yes about a locked closet for storing instruments",
      "Walk the room once at your planned hour to check noise and neighbors",
      "Get the okay in writing, with your exact days and times named"
    ],
    [
      "Text your teachers one message asking for their two best weekly time slots",
      "Draft a first-month calendar with lessons plus one jam labeled beginners only",
      "Set up sign-up: a paper sheet at the space and one phone number to text",
      "Confirm the calendar with the space host before announcing anything",
      "Post the schedule where families already look and pin it in the group chat"
    ],
    [
      "Jot three care rules for the instrument type you know best",
      "Add the key line in bold: if something breaks, bring it back — don't fix it at home",
      "Ask one of your teachers to check the sheet for anything wrong or missing",
      "Print copies and tuck one into every case before it goes out",
      "Say the broken-instrument line out loud at each checkout"
    ]
  ],
  "school-supply-program": [
    [
      "Look up the front-office number for the nearest school and save it in your phone",
      "Call or email to ask for the counselor or family liaison by name",
      "Ask them for the exact per-grade supply lists, brands included",
      "Ask for a realistic count of families who'd need a backpack",
      "Type the lists and count into one doc and share it with the project"
    ],
    [
      "Pull up the supply lists and circle the five most-needed basics",
      "Price those basics by the case at two bulk or wholesale stores",
      "Place one bulk order for pencils, paper, and glue before the drive starts",
      "Ask two shops or congregations to host a donation bin for the fun extras",
      "Set a weekly reminder to empty bins and tally what's still missing"
    ],
    [
      "Print one copy of each grade's supply list",
      "Text three volunteers a date and time for a packing session",
      "Set up one table per grade with its list taped where packers can see it",
      "Pack assembly-line style, checking each backpack against the grade list",
      "Leave every backpack unsealed so kids can swap items at pickup"
    ],
    [
      "Text two people who might have a dry, lockable room or garage to spare",
      "Visit the best option and check it's dry, locks, and has shelves or pallets",
      "Put boxes on shelves or pallets, never straight on the floor",
      "Pick a handout spot on a bus route families already use and confirm the date"
    ],
    [
      "Look up the school year's first day and put the giveaway one to two weeks before it",
      "Ask the school liaison to spread the date through their family channels",
      "Text your volunteer list asking who can take a two-hour shift",
      "Set up backpacks by color so each kid picks their own",
      "Do a walk-through the day before: no forms at the door, just a greeter and a table"
    ]
  ],
  "legal-aid-clinic": [
    [
      "Look up your legal aid office and the bar's pro bono program; save both numbers",
      "Call each and ask what they'd need from you to send attorneys",
      "Email the nearest law school clinic about supervised student volunteers",
      "Ask every attorney whether their malpractice coverage extends to volunteering",
      "Register with the bar program if that's what unlocks free coverage"
    ],
    [
      "Text your partner attorneys one question: which three matters will you take?",
      "List what's out of scope and where each of those cases should go instead",
      "Get a named contact and an honest wait time at every referral org — no hotlines",
      "Write the scope in words a neighbor could repeat back to you"
    ],
    [
      "Text one partner site to ask about a room with a real door for consults",
      "Stand in the waiting area while someone talks inside — if you hear them, keep looking",
      "Draft a document checklist per case type: lease, notices, pay stubs, ID",
      "Set up intake so attorneys start each session with the papers already sorted"
    ],
    [
      "Sketch the booking sheet on paper: names and time slots, nothing else",
      "Decide who takes appointments and where that single list lives",
      "Keep the case's substance off every shared sheet — details belong in the room",
      "Make reminder calls that say time and place, never the legal matter"
    ],
    [
      "Text one partner org: which rights questions come up most in your work?",
      "Draft a single-page guide on the top topic in plain language",
      "Have an attorney review every handout and put a date on each one",
      "Book a room and a speaker for the first workshop",
      "Say it aloud and in print: this is general information, not legal advice"
    ],
    [
      "Text your attorneys two candidate clinic dates and ask which one holds",
      "Set the recurring date and add it to the community calendar",
      "Book the interpreter before advertising in any language — never a client's child",
      "Send flyers through partner orgs rather than open social posts",
      "Confirm each attorney the week before — a clinic with no lawyer breaks trust"
    ],
    [
      "Start a master client list that only the coordinator can open",
      "Write the rule: every new booking gets checked against that list first",
      "Run the conflict check at booking time, not when the person sits down",
      "Draft a two-line confidentiality pledge for every volunteer to sign",
      "Walk the whole team through both rules before the first clinic opens"
    ]
  ],
  "resource-hub-dispatch": [
    [
      "Write down the one number or form link that will be the front door",
      "Set up phone, form, and in-person intake asking the same short questions",
      "Name a person and a checking schedule for every channel before you publish it",
      "Send a test request through each channel and time how long until it's seen"
    ],
    [
      "Start a sheet with columns: name, skills, availability, contact, hard limits",
      "Message five volunteers for their availability and preferred contact method",
      "Add each project lead and what their project can actually offer",
      "Calendar a quarterly re-confirm — a roster of old yeses is mostly fiction"
    ],
    [
      "Walk one recent request through on paper: who saw it, who acted, who closed it",
      "Write the routing rules: which kind of need goes to which project or volunteer",
      "Give every request one named owner who carries it to a real close",
      "Set a response-time goal, with a same-day \"we can't fill this\" as the floor",
      "Track every request's status somewhere the whole team can see"
    ],
    [
      "Start the list with your own projects — those you can write from memory",
      "Call each outside listing as if you were a client and note the real hours",
      "Record eligibility rules — who they take and what they ask for at the door",
      "Date every entry and set a monthly slot to re-verify the oldest ones"
    ],
    [
      "Message three organized people about taking one dispatch shift a week",
      "Write the shift guide so a new coordinator can run it from the page alone",
      "Shadow each new coordinator through their first shift, then hand it over",
      "Build the rotation so nobody covers more than two shifts in a row"
    ],
    [
      "Read your intake form and cross out every field you could work without",
      "Write the deletion rule: when a request closes, keep the count, drop the details",
      "List who can see open requests and lock everyone else out",
      "Add a follow-up step: confirm the need was actually met before you close it"
    ],
    [
      "Add an \"unfilled\" tag or column to your request tracker right now",
      "Pick a fixed set of categories so the entries add up instead of scattering",
      "Log every miss the moment it happens, not from memory at month's end",
      "Tally the misses monthly and bring the biggest gap to the next planning meeting"
    ]
  ],
  "harm-reduction-supplies": [
    [
      "Search for the nearest harm reduction org or health-department naloxone training",
      "Email or call them: introduce the crew and ask when the next free training runs",
      "Book training slots for everyone who'll distribute — no exceptions",
      "Ask about distributing under their legal umbrella and standing order"
    ],
    [
      "Email your partner org or a legal aid clinic to ask what's legal to carry here",
      "Ask specifically about test strips and syringes, not just naloxone",
      "Write down the statute or the source's name, with the date you checked",
      "Turn it into a one-page card every volunteer carries"
    ],
    [
      "Look up your state's naloxone distribution program or pharmacy standing order",
      "Place the order, plus whatever your legal list allows: strips, wound care, hygiene",
      "Check expiration dates the day the box arrives and note them where you'll see them",
      "Store everything away from heat and cold — no car trunks, no sheds"
    ],
    [
      "Ask your partner org to send a sample kit insert you can copy",
      "Draft yours: spot an overdose, give naloxone, call emergency services, never use alone",
      "Get it translated into the languages your neighbors actually speak",
      "Call every number on the insert before you print hundreds of copies",
      "Run an assembly line, one person per station: bag, insert, supplies, seal"
    ],
    [
      "Ask one bar or corner store you already know to keep a no-questions box",
      "Walk the route with your partner org and let them introduce you where they're known",
      "Pick fixed days and times for rounds and keep them identical every week",
      "Give each host box one named contact who restocks it"
    ],
    [
      "Start a tally sheet: item, count out, date — track supplies moved, never people",
      "Log every naloxone expiration date with a reminder a month before",
      "Walk the fixed points monthly and refill before boxes sit empty",
      "Book a refresher training whenever new volunteers join"
    ]
  ],
  "court-support": [
    [
      "Look up the public defender's office number and the local court-watch group",
      "Send one short email offering extra hands and asking how they prefer contact",
      "Ask each group what would actually help — then listen, don't pitch",
      "Visit the courthouse once with a court-watch member to see how they work",
      "Note each contact's name, role, and preferred channel in one shared list"
    ],
    [
      "Open a note and write the headline rule: we never give legal advice",
      "Add the exact script: \"I can't advise on that — ask your lawyer\"",
      "List courtroom conduct: arrive early, dress plainly, phones off, no reactions",
      "Add the hallway rule: no case talk anywhere a prosecutor could overhear",
      "Send the draft to a public defender contact for a quick sanity check"
    ],
    [
      "Text the group asking whose phone number can take support requests",
      "Make a shared calendar with date, courtroom, and what each person needs",
      "Bookmark the court's online docket and practice looking up one case",
      "Set a standing reminder: verify each date against the docket the afternoon before",
      "Ask each person, not the paperwork, whether they need a ride or childcare too"
    ],
    [
      "Text volunteers two quiet-morning options for a courthouse walkthrough",
      "Walk them through security: the 30-minute line, banned pocketknives, phone rules",
      "Show them the courtroom: where to sit and how to wait three hours calmly",
      "Rehearse the no-advice script in pairs until it comes out automatically",
      "Pair every new volunteer with an experienced one for their first court date"
    ],
    [
      "Text members asking who can drive weekday mornings and who can watch kids",
      "Make a roster with each driver's mornings and each childcare pair's availability",
      "Assign a primary and a backup driver to every hearing — never just one",
      "Confirm the primary driver and the childcare pair the night before, every time",
      "Check which courtrooms allow children so childcare plans match the building"
    ],
    [
      "Reply to the attorney asking for content, addressee, and deadline in writing",
      "List the neighbors who know the person well and text each one the ask",
      "Send writers the attorney's guidance and one good example letter",
      "Collect every letter and hold it for the attorney's review before anything is sent",
      "Track who promised a letter and nudge them three days before the deadline"
    ]
  ],
  "cooling-warming-center": [
    [
      "List three candidates with real AC and heat: the library, a faith hall, a union hall",
      "Call one today and ask for twenty minutes with whoever holds the keys",
      "Walk the room checking bathrooms, step-free entry, and outlet locations",
      "Ask the uncomfortable questions now: hours, keys, insurance, overnight stays",
      "Get the okay in writing and plan to test the AC or heat on a truly extreme day"
    ],
    [
      "Look up the weather service's heat index and wind chill advisory thresholds",
      "Propose exact numbers to the group — a forecast figure, not \"when it's bad\"",
      "Name one person with the authority to call an activation, plus a backup",
      "Make the group chat or phone tree and run one test alert today",
      "Write the trigger and the caller's name where every host can see them"
    ],
    [
      "Write the list: water, electrolytes, blankets, cots, fans, chargers, first aid",
      "Post one ask to members for what can be donated and price the rest",
      "Do one shopping run and drive everything to the site",
      "Pack labeled bins so a brand-new host finds anything in seconds",
      "Tape a contents list inside the storage closet door"
    ],
    [
      "Message members asking who could sit a four-hour shift in extreme weather",
      "Book one two-hour training at the site and invite every yes",
      "Drill the signs of heat stroke and hypothermia until hosts can name them cold",
      "Say it plainly: call 911 early, and nobody is ever second-guessed for calling",
      "Practice a no-paperwork greeting and one de-escalation script in pairs"
    ],
    [
      "Sketch the shift grid for one activation day: openers, daytime blocks, closers",
      "Fill every slot with two names — never one host alone",
      "Ask three more people to be a named reserve for when weather flattens hosts",
      "Share the rota in the group chat and confirm each person saw their slot",
      "Run one dry-run activation call to see how fast the grid actually fills"
    ],
    [
      "List where at-risk neighbors already go: clinics, senior buildings, corner stores",
      "Draft one plain-language flyer with the triggers, address, and hours",
      "Ask members to translate it into the neighborhood's other languages",
      "Hand stacks to meal-delivery drivers, building managers, and outreach workers",
      "Finish the rounds weeks before the season turns — not during the first heat wave"
    ],
    [
      "Text your co-host to confirm the shift and who holds the keys",
      "Arrive an hour early, start the AC or heat, and set water by the door",
      "Keep a loose tally of visitors — a count, not IDs",
      "Gently rouse anyone sleeping to check on them; a nap can hide heat stroke",
      "After closing, clean and restock the bins, and note what ran short"
    ]
  ],
  "community-oral-history": [
    [
      "Open a blank note and list what you'll record and where it could end up",
      "Draft one page: what's recorded, sharing options, right to pause, skip, or withdraw",
      "Make sharing separate checkboxes: name or no name, family only, public online",
      "Add your phone number so a storyteller can change their mind later",
      "Ask someone to translate it into the languages your storytellers speak"
    ],
    [
      "Open your phone's voice memo app and check your free storage",
      "Record a 30-second test in the room you'll use and listen back for hum or echo",
      "Write eight open questions like \"tell me about the street when you arrived\"",
      "Practice a ten-minute interview on a friend and cut the questions that fell flat"
    ],
    [
      "Text one elder who trusts you and ask for an hour at their kitchen table",
      "Charge your phone, clear storage, and put the consent form and questions in a bag",
      "Go through the consent form together before pressing record",
      "If a story turns raw, pause and ask again whether that part is okay to keep",
      "Before leaving, book the next session or ask who they'd introduce you to"
    ],
    [
      "Rename this week's recording now: date, storyteller's name, sharing agreement",
      "Copy it to a second, genuinely different place — cloud plus phone, not one laptop",
      "Get the storyteller their own copy, on a USB stick or by whatever app they use",
      "Re-read the consent form before posting anything public, and honor any change"
    ]
  ],
  "community-solar-coop": [
    [
      "Text five neighbors who complain about their power bills and ask for ten minutes each",
      "Draft a sign-up form that asks for a real commitment level, not just an email",
      "Host a kitchen-table info night and count who actually shows up",
      "Sort responses into committed, curious, and no — plan around the committed only"
    ],
    [
      "Search your state's name plus 'community solar rules' and save the top official page",
      "Call a solar co-op a town or state over and ask which model their rules allowed",
      "Write a one-page cheat sheet: net metering, subscriptions, co-op ownership — allowed here or not",
      "Flag every rule you don't understand for a lawyer to explain later"
    ],
    [
      "List three big sunny roofs nearby: schools, churches, warehouses",
      "Check whether an existing community-solar program will take your group as subscribers",
      "Walk your top host site with the owner and note roof age and open space",
      "Put build vs. join on one page and bring it to the members"
    ],
    [
      "Ask your state co-op association for lawyers who know energy co-ops",
      "Book one consult with a lawyer who has formed an energy co-op before",
      "Sketch the money flow on one page: who pays in, who owns what, who gets credits",
      "Compare co-op, LLC, and subscription structures with the professionals",
      "Sign nothing until the lawyer and accountant have read every contract"
    ],
    [
      "Ask two nearby solar owners which installer they used and if they'd rehire them",
      "Request at least three written bids for the same specs",
      "Ask each bidder who handles maintenance in year five and what the warranty covers",
      "Get warranty and maintenance terms into the contract in writing"
    ],
    [
      "Open a spreadsheet with one row per member: paid in, credits back, date",
      "Write the credit rules in plain words a new member can read in one minute",
      "Pick one tool for payments and statements and stick to it",
      "Walk one member through their first statement and fix whatever confused them"
    ],
    [
      "Ask three members to bring a recent power bill to the next meeting",
      "Walk through one bill together, line by line",
      "Share five cheap fixes: LED bulbs, smart strips, thermostat, door seals",
      "Check bills again in a month so members see the difference on paper"
    ]
  ],
  "worker-coop-incubator": [
    [
      "Book three 20-minute chats with interested members this week",
      "Ask each one: what can you do, what do you want to build, what hours do you have",
      "Log every answer in one shared sheet and highlight repeated skills",
      "Circle any cluster of three or more matching skills — that's a possible venture"
    ],
    [
      "Poll members on which skills they want most: resumes, trades, digital, money",
      "Ask the skill-share program who can teach the top two requests",
      "Book one outside expert for the topic nobody local can cover",
      "Schedule the first session and keep it under two hours",
      "Collect feedback at the door and adjust the next session"
    ],
    [
      "Invite a member of a real worker co-op to speak to the group",
      "Make a one-page comparison: co-op vs. traditional business — profits, decisions, ownership",
      "Walk through how a real co-op votes and splits profits, with numbers",
      "Leave time for the hard questions: pay, conflict, people leaving"
    ],
    [
      "Look up your region's cooperative developer and book an intro call",
      "Help the group draft a one-page business plan before any paperwork",
      "Get names of a lawyer and an accountant who have formed co-ops before",
      "Review structure options with the professionals in the room",
      "Hold off on incorporating until the plan and the advisors line up"
    ],
    [
      "Start a shared doc listing every microloan, grant, and co-op fund you know of",
      "Ask the cooperative developer which funders you're missing",
      "Note each fund's deadline, amount, and requirements",
      "Sit with one venture and finish their first application together"
    ],
    [
      "Write down three experienced cooperators or business owners you could ask",
      "Invite each to mentor one venture with a monthly check-in",
      "Match mentors to ventures by trade, not just availability",
      "Put the first check-in on the calendar before the venture launches"
    ],
    [
      "Invite every venture to one shared lunch or evening meet-up",
      "Have each venture share one problem and one win",
      "Start a group chat for referrals and quick questions",
      "List what the ventures could buy from each other and pin it in the chat"
    ]
  ],
  "elder-meal-delivery": [
    [
      "Call one senior center or parish nurse and ask who could use meals and a visit",
      "List the clinics, faith groups, and pharmacists who see isolated elders",
      "Draft a short opt-in blurb: a meal and a visit, free, no strings",
      "Call or visit each referred elder and ask — never assume",
      "Start a yes-list with address and best contact time"
    ],
    [
      "Message five dependable people you'd trust in your own grandmother's home",
      "Write the screening rule down: references plus a basic check, no exceptions",
      "Run every volunteer through it before their first delivery",
      "Assign each elder one regular visitor instead of a rotation"
    ],
    [
      "Ask the community meal crew what they can reliably produce each week",
      "Line up two backup cooks or a restaurant willing to donate portions",
      "Agree on portion count, pickup time, and easy-reheat packaging",
      "Label every container with contents and date before it leaves the kitchen"
    ],
    [
      "Plot the yes-list addresses on a map and group them into short routes",
      "Set fixed days and rough times, the same every week",
      "Pad every stop with ten unhurried minutes for conversation",
      "Do a dry run of each route before the first real delivery"
    ],
    [
      "Make one simple form: dietary needs, allergies, emergency contact",
      "Fill it in with each elder or their family, in person or by phone",
      "Keep the forms locked up or password-protected",
      "Give drivers only what they need at the door: allergies and one contact number"
    ],
    [
      "Write the first line: what a volunteer does at an unanswered door",
      "List who gets called, in order: elder's phone, family, emergency services",
      "Add how to write down what happened after any incident",
      "Print the protocol on a wallet card for every volunteer",
      "Walk the team through it out loud before it's ever needed"
    ],
    [
      "Text every volunteer after their first week: how did it go, what felt awkward",
      "Ask each elder one open question: what would make this better",
      "Rotate or pause routes for anyone who sounds stretched",
      "Share one small win with the whole team each month"
    ]
  ],
  "disaster-relief-hub": [
    [
      "List three buildings with a loading area: schools, churches, union halls",
      "Ask each owner the blunt question: could we get in at 6 a.m. after a flood",
      "Get a written yes and a key arrangement for your top pick and a backup",
      "Walk both sites and note power, water, and where trucks would park"
    ],
    [
      "List where water, food, and hygiene supplies would come from: supplier, partner, or drive",
      "Call one wholesaler and ask about emergency bulk orders on short notice",
      "Agree with partner orgs on who sources what",
      "Decide how you'll learn real needs after an event — one call tree or intake form"
    ],
    [
      "Pick your sorting categories now: water, food, hygiene, cleanup, clothing",
      "Sketch the flow on paper: truck arrives, unload, sort, shelve, count",
      "Make a one-page tally sheet for counts in and out",
      "Print category signs and store them with tape at the site"
    ],
    [
      "Write the rule at the top of the page: no ID checks, no proof of need",
      "Put in writing who gets served first when supplies run short",
      "Map delivery runs for people who can't reach the hub",
      "Sketch the pickup line so it moves one way, in one door and out another"
    ],
    [
      "Message ten likely volunteers and ask: could you show up within hours",
      "Write role cards: intake, sorting, distribution, delivery, safety",
      "Run a two-hour practice day with real boxes",
      "Note who did what well and pre-assign roles for the real thing"
    ],
    [
      "Email your county emergency management office and introduce the hub",
      "List the other relief groups nearby and what each one covers",
      "Meet once and agree on who fills which gap",
      "Swap after-hours contacts and keep a copy on paper"
    ],
    [
      "Print the volunteer roster and key contacts — assume no internet",
      "Pick an offline fallback: radios, a message board, or runners",
      "Write the hard safety rules: nobody enters unsafe structures, ever",
      "Tie into the preparedness network's contact tree and test it once"
    ]
  ],
  "recovery-peer-support": [
    [
      "Write down one or two neighbors with solid lived recovery experience",
      "Ask each privately if they'd consider facilitating — no pressure, no announcements",
      "Find the nearest recognized peer-recovery training and its next date",
      "Enroll every future facilitator before the first meeting",
      "Say the line out loud from day one: peers, not providers"
    ],
    [
      "Open a doc with two columns: what we do, what we never do",
      "Put detox and medication advice at the top of the never column",
      "Have every facilitator read it and sign it",
      "Show the scope to a local treatment professional for a sanity check"
    ],
    [
      "List the local treatment programs, clinics, and crisis lines",
      "Visit or call each one and introduce the network in person",
      "Ask each: who exactly do we call, and may we use your name",
      "Write an overdose-response plan and post it where meetings happen",
      "Print the contact list and re-check it monthly"
    ],
    [
      "List rooms with a discreet entrance: library, community room, faith space",
      "Visit your top two and check them for privacy and noise",
      "Confirm the room is substance-free and open on your meeting nights",
      "Book a standing slot so the room is always the same one"
    ],
    [
      "Draft the ground rules: what's said here stays here, no advice-pushing, right to pass",
      "Read them to the facilitators and trim anything that sounds preachy",
      "Print them on one card for the meeting room",
      "Plan to read them aloud at the start of every single meeting"
    ],
    [
      "Pick two meeting times: one evening, one daytime or weekend",
      "Draft a flyer in plain words: free, open, no requirements",
      "Cut any wording that hints at shame or diagnosis",
      "Post it where people already go: clinics, laundromats, coffee shops",
      "Ask partner programs to hand it to people directly"
    ],
    [
      "Put a monthly one-on-one with each facilitator on the calendar",
      "Set up a leading rotation so nobody holds every meeting",
      "Ask each facilitator where they get their own support",
      "Say it before anyone needs it: stepping back is always allowed"
    ]
  ],
  "community-fitness": [
    [
      "Write five quick questions about what movement people enjoy and what feels doable",
      "Ask them this week at the laundromat, the senior building, and the school gate",
      "Post the same questions in one neighborhood group chat",
      "Tally the answers and circle the two most-wanted activities"
    ],
    [
      "List three warm, reliable people you'd trust to lead a walk or a stretch session",
      "Message each with a specific ask: one session a week, no expertise required",
      "For anything physically demanding, ask about qualifications before saying yes",
      "Pair each new leader with a backup who can cover a missed week"
    ],
    [
      "List nearby parks, halls, and school gyms reachable without a car",
      "Call or visit each one to ask about cost, hours, and booking",
      "Walk the top two checking level ground, seating, shade, and bathrooms",
      "Note where people could shelter if the weather turns",
      "Book your first choice for a trial month"
    ],
    [
      "Write a one-page plan for your first activity, starting from the easiest version",
      "Add a modification to every move: a chair option, a shorter loop",
      "Cut any mention of weight or appearance from the plan and the flyers",
      "Run the plan past one elder and one beginner and adjust it"
    ],
    [
      "Buy or borrow a first-aid kit and check what's inside",
      "Write a five-minute warm-up into the start of every session plan",
      "Add water breaks to the schedule and a reminder to bring bottles",
      "Brief leaders on spotting overexertion and making rest feel normal",
      "Draft a line suggesting people new to exercise check with a doctor first"
    ],
    [
      "Pick one weekly day and time you can keep for three months",
      "Make a simple flyer that says all ages, sizes, and abilities are welcome",
      "Post it at the laundromat, library, senior building, and clinics",
      "Share it in group chats and ask each member to forward it once",
      "Set a reminder to announce any cancellation early, never silently"
    ],
    [
      "Start each session with a quick round of names",
      "Ask one regular to greet newcomers at every session",
      "Build five minutes of chat time into the schedule",
      "Celebrate showing up consistently, never weight or performance"
    ]
  ],
  "urban-orchard": [
    [
      "List possible sites: land trusts, parks land, congregations with unused ground",
      "Email or call the most promising owner and ask for a meeting",
      "Ask directly for ten-plus years of access and confirm water on the site",
      "Get the terms into a written agreement before buying a single tree"
    ],
    [
      "Look up your hardiness zone and list the fruit trees that thrive in it",
      "Ask neighbors which fruits they'd actually pick and eat",
      "Sketch the site in layers: canopy trees, shrubs, ground cover",
      "Check pollination partners for every variety on your list",
      "Space trees for their mature size, not the sapling's"
    ],
    [
      "Find your nearest nurseries and note their bare-root season",
      "Price your plant list bare-root versus potted",
      "Ask about nonprofit discounts, grants, and donation programs",
      "Place the order early — good varieties sell out"
    ],
    [
      "Mark every planting spot from the design with flags or stakes",
      "Schedule a workday to clear weeds and lay down mulch",
      "Test the water source and lay out hoses or barrels",
      "Stage compost, tools, and stakes next to each planting spot"
    ],
    [
      "Pick a date in planting season and invite widely",
      "Write a one-page how-to: right depth, watering basin, mulch ring",
      "Assign an experienced planter to roam and check every tree",
      "Line up water, snacks, and music — make it a party",
      "End the day by watering every tree in deeply"
    ],
    [
      "List the year-round jobs: watering, pruning, mulching, pest checks",
      "Ask three people for a named yearly commitment, not vague interest",
      "Make a summer watering rota for the young trees",
      "Put a spring pruning date on the calendar now"
    ],
    [
      "Draft simple picking norms: who harvests, when, and how much",
      "Bring the draft to a community meeting before the first crop",
      "Line up homes for surplus: fridges, pantries, shared meals",
      "Post the agreed norms on a sign at the orchard"
    ]
  ],
  "new-parent-support": [
    [
      "List people you know who cook, drive, or have raised a baby",
      "Message each one with a specific role: meals, errands, or peer support",
      "Ask two or three experienced parents to be your first peer supporters",
      "Note every volunteer's availability and limits in one place"
    ],
    [
      "Pick a free meal-train tool or shared calendar and set up a test run",
      "Make a short intake form for dietary needs and allergies, asked once",
      "Write the drop-off rules: doorstep by default, labeled, easy to reheat",
      "Test the whole flow with one volunteer family"
    ],
    [
      "Draft a checklist of offers: errands, laundry, dishes, sibling care",
      "Match each offer with the volunteers who signed up for it",
      "Set the rule: ask the parent what's wanted each visit and follow their list",
      "Schedule the first two weeks of help for your first family"
    ],
    [
      "Start a simple spreadsheet: name, service, phone, hours",
      "Add lactation support, postpartum mental health care, and pediatric clinics",
      "Add local sources of baby supplies, including the diaper bank",
      "Call every number once to confirm it works",
      "Put a directory review date on your calendar every three months"
    ],
    [
      "Pick a small, comfortable space and a consistent time",
      "Ask an experienced parent to hold the first circle",
      "Train peers on the signs of postpartum depression and anxiety",
      "Agree the rule: encourage professional care, never diagnose, never wait",
      "Invite three or four parents personally for the first session"
    ],
    [
      "Write your vetting steps: references at minimum for anyone entering homes",
      "Draft the boundaries: parents set the terms, visits stay short unless invited longer",
      "Add the rule: no unannounced visits, ever",
      "Walk every volunteer through the practices before their first visit"
    ],
    [
      "List the sibling projects: diaper bank, childcare collective, welcome wagon",
      "Meet one organizer from each to agree how referrals flow",
      "Make one shared intake so families tell their story only once",
      "Give every family a single point of contact"
    ]
  ],
  "foster-kinship-support": [
    [
      "Call the local foster agency or kinship navigator and ask for a meeting",
      "Ask schools and faith groups to pass your offer along to caregiving families",
      "Write the first-contact message as an offer, never a screening",
      "Ask early families what they needed in week one and in year one"
    ],
    [
      "List needs by age: clothes, beds, car seats, everyday supplies newborn to teen",
      "Run a targeted donation drive naming the sizes and items you lack",
      "Check every car seat and crib against expiration dates and recall lists",
      "Sort and label everything by age and size as it arrives",
      "Find dry storage someone can reach on short notice"
    ],
    [
      "Draft the packing list: a few days of clothes, toiletries, one comfort item",
      "Pack the first bags sorted by age and size",
      "Recruit two on-call drivers who can deliver within hours",
      "Set up one phone number or inbox for placement requests",
      "Do a timed test run from request to doorstep"
    ],
    [
      "Ask the agency who may provide respite care and under what rules",
      "Recruit and vet respite volunteers to those exact rules",
      "Make a simple booking sheet caregivers can use without begging",
      "Start with short, regular blocks — a predictable evening beats a rare weekend"
    ],
    [
      "Pick a regular time and a private, comfortable space",
      "Ask an experienced foster or kinship caregiver to co-host",
      "Invite through the agency and schools — never share family lists",
      "Arrange child care during meetings so caregivers can actually attend",
      "Open every meeting with a confidentiality reminder"
    ],
    [
      "Start a spreadsheet of services, benefits, and trauma-informed supports",
      "Add the kinship-specific benefits nobody tells caregivers about",
      "Call each entry to confirm it's current before listing it",
      "Offer to sit with families while they navigate applications"
    ],
    [
      "Get the vetting and mandatory-reporting rules in writing from the agency",
      "Write your own one-page policy: vetting, reporting duties, confidentiality",
      "Set the privacy rule: no photos, no stories, no details without permission",
      "Walk every volunteer through the policy before any contact with families",
      "Put an annual policy review date on the calendar"
    ]
  ],
  "weather-survival-outreach": [
    [
      "Write two packing lists: one for cold season, one for heat",
      "Print cards with shelter locations and crisis numbers for every kit",
      "Host a packing session and assemble the first twenty kits",
      "Store them somewhere dry that volunteers can reach fast"
    ],
    [
      "Price bulk blankets, socks, water, and electrolytes at two or three suppliers",
      "Ask stores and congregations for donations before the season starts",
      "Run one focused donation drive naming the exact items",
      "Set aside enough stock for a mid-season restock"
    ],
    [
      "Contact outreach workers already walking these routes and ask to tag along",
      "Join a round or two before mapping anything on your own",
      "Note locations loosely — people move, especially in bad weather",
      "Make it a habit to update the map after every round"
    ],
    [
      "Draft the training outline: respectful engagement, working in pairs, emergencies",
      "Ask an experienced outreach worker to co-lead the first training",
      "Schedule the session before the season starts",
      "Keep a list of who's trained — nobody distributes without it"
    ],
    [
      "Decide the forecast numbers that trigger a round and write them down",
      "Draft routes that reach the most exposed people first",
      "Assign pairs to each route, with a backup for both",
      "Choose who watches the forecast and sends the go message"
    ],
    [
      "List warming and cooling centers, shelter beds, and the resource hub",
      "Call each one to verify hours and rules before printing anything",
      "Print small cards volunteers can hand out on rounds",
      "Set a weekly re-check — a referral to a closed door burns trust"
    ],
    [
      "Print a pocket card of hypothermia and heat stroke warning signs",
      "Drill the rule at training: call emergency services immediately, never wait and see",
      "Practice what to do while help comes: shade and water, or blankets and windbreak",
      "Have every volunteer save local emergency and crisis numbers in their phone"
    ]
  ]
};
