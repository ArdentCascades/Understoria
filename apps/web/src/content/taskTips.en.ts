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
// English per-task tips (i18n Phase 2a split from taskTips.ts —
// index-aligned to each template's tasks; coverage CI-pinned in
// taskTips.test.ts). Eager: English is the fallback.
export const TASK_TIPS_EN: Record<string, readonly string[]> = {
  "community-fridge": [
    "Confirm the outlet is a dedicated outdoor GFCI that stays live after closing — plenty of storefront exterior plugs are wired to an inside switch someone flips off at night, and the fridge warms up by morning.",
    "Run any donated fridge for a full day before you build around it — and leave a hand's width of clearance behind it, since a boxed-in condenser overheats and quits in the first heat wave.",
    "Laminate the sign or it's mush after the first rain — and phrase the 'no' list as safety, not scolding, so people trust the fridge instead of feeling policed.",
    "Put two names on each shift, not one — a single no-show is how a fridge goes a week without a wipe-down. A dated log taped inside lets the next person see when it was last cleaned.",
    "Tell wary grocers about Good Samaritan food-donation protections — fear of liability is the usual 'no,' and knowing they're covered flips it to yes. Then lock a fixed pickup time.",
    "Use a shared line or a free Google Voice number, not one volunteer's personal cell — when that person moves or burns out, the number on the fridge shouldn't die with them."
  ],
  "community-garden": [
    "Nail down two things in writing that handshakes skip: who pays for water, and how much notice the owner must give before reclaiming the lot — a garden evicted mid-season loses a whole year's work.",
    "Take samples from several spots, not one — lead pools near old painted walls and fence lines. Send the test weeks before build day, because results lag and you can't plan beds until they're back.",
    "Skip railroad ties and old pressure-treated lumber for edible beds — they leach creosote and arsenic into your food. Untreated cedar, cinder block, or straw bales are safer.",
    "Write the boring clauses now: what happens to a plot when someone disappears mid-season, and who inherits the tools if the group dissolves. Deciding while everyone's friendly saves the friendship later.",
    "Anchor your dates to your local last-frost date, not the calendar or a seed packet from another climate — one surprise frost can wipe a whole opening-weekend planting.",
    "Assign the July and August slots first — that's when the rota collapses and beds die, not spring. Water at dawn, not midday, so it soaks in instead of evaporating off hot leaves.",
    "Pick often even when no one's hungry — beans, cucumbers, and zucchini stop producing the moment they're left to go to seed. Route surplus to the fridge same-day; wilted greens help no one."
  ],
  "tool-lending-library": [
    "Pick a spot that's dry and lockable, and solve returns before opening: a labeled drop bin or after-hours slot means you're not the only door to the whole collection.",
    "Plug in and run every power tool before you accept it — a drill that spins free but stalls under load is scrap. Check cords for nicks and that blade guards still work; those are the injuries you'll be liable for.",
    "Note each tool's replacement cost in the catalog now — it's the number you'll want when deciding whether a never-returned item is worth chasing. Tag your library's name on each tool so 'I thought it was mine' can't happen.",
    "A short liability waiver at signup matters more than late fees — spell out that borrowers use tools at their own risk. Keep deposits off everyday items so cost isn't a barrier; reserve them for the one or two pricey things.",
    "Grab a phone number you'll actually text later, not just a name — the reminder nudge is what gets tools back, and you can't send it to a signature. Confirm the number on the spot.",
    "Teach the awkward parts, not just checkout: how to decline a broken donation kindly, and how to note damage on return without making the borrower feel accused. Show them where the first-aid kit and eye protection live.",
    "Log every 'do you have…?' you can't fill — that list, not your guesses, tells you what to buy next. Sharpen and oil on a set date so upkeep doesn't quietly become never."
  ],
  "neighborhood-care-network": [
    "Keep this 'map' in your head or somewhere locked, not a shared spreadsheet — a list of isolated, vulnerable neighbors is exactly what you don't want leaking. Let trusted gatekeepers make the introduction rather than cold-knocking.",
    "Actually call the references — don't just collect them. Two people who'll vouch, plus a firm 'never handle a neighbor's cash or keys alone' rule, screens out the rare bad actor drawn to exactly this access.",
    "Frame the first pairing as a trial, and give both people a graceful, no-explanation way out — a mismatch that no one can exit becomes an obligation, and obligations get dropped cold.",
    "Pin the check-in to a consistent day and time so a missed one is noticeable — 'she always answers Tuesdays' is what turns a silent phone into a signal instead of a shrug.",
    "Ask each neighbor now who they want called in a crisis — and whether that's family, not police. A wellness check can go badly for undocumented, disabled, or Black neighbors; honor their preference before it's an emergency.",
    "Keep volunteers to non-clinical help — rides, groceries, a shoveled walk. The moment it drifts into medication doses, wound care, or lifting someone, that's a trained professional's job, and saying so protects everyone.",
    "Rotate people before they're fried, not after they quit — by the time someone says they're burned out, they've usually been carrying it for months. A private debrief also catches the grief when a neighbor they cared for declines."
  ],
  "emergency-preparedness": [
    "Check your area's actual FEMA flood and wildfire maps instead of guessing — and note who runs medical equipment on power, since utilities keep priority-restoration lists those neighbors can sign up for now.",
    "Store the paper roster in at least two homes, not one — the whole tree is useless if it's in the one house that floods. Mark who needs a knock instead of a call, and which language, right on the sheet.",
    "Agree on one radio channel and a fixed check-in time — 'top of every hour' — or everyone's transmitting into dead air. Actually test the radios across the neighborhood's real distance before you count on them.",
    "Water and batteries expire — tape a rotation date on the kit and put it on the same calendar as the roster refresh. Store it where two or three people can reach it, so a locked door isn't between you and the supplies.",
    "Confirm three things a handshake skips: who holds the key at 2 a.m., whether the generator has fuel stored, and if the space is wheelchair-accessible. A safe spot you can't get into is just a building.",
    "Have people physically find their gas and water shutoffs and the wrench it takes — reading about it doesn't count. Time the contact tree end to end; you'll find the broken link now instead of during a flood.",
    "Name a backup for every role — the block captain may be the one trapped or out of town when it hits. Two-deep on the medically-vulnerable checks especially; that's the list that can't wait."
  ],
  "free-store": [
    "Favor a ground-floor spot with a curb you can pull up to — you'll be hauling carloads in and out, and a third-floor walk-up burns your volunteers before doors open. A fixed recurring date builds the habit that keeps it alive.",
    "Post the 'no' list at the drop-off door, not just inside — sorting happens too late. Add used car seats, helmets, and mattresses to it: their safety expires invisibly, and a bedbug in one donation can close your store.",
    "Sort at the door, before anything reaches a table — a broken toaster that makes it to the shelf just becomes your problem twice. Keep a labeled 'onward' bin going all day so the reject pile never becomes a mountain.",
    "Put out less than you have and restock from the back as it thins — a half-empty, tidy table reads as dignified shopping; a crammed, dumped pile reads as 'here's our garbage.'",
    "Brief greeters to never ask why someone's there or how much they're taking — the no-questions rule is the whole point, and one nosy volunteer undoes it. Keep one person floating to tidy so the space never looks ransacked.",
    "Confirm your partner charity's hours and what they actually take before the event, not after — plenty won't accept mattresses, electronics, or partial sets. Load out the same day so you hand the space back empty and keep the host."
  ],
  "skill-share": [
    "The best teachers usually call their skill 'nothing special.' Skip 'what are you an expert in?' and ask what people always come to them for help with.",
    "The fear is dead air, so help each first-timer plan the first five minutes minute by minute; once hands are busy and people are talking, the nerves fade on their own.",
    "Match the room to what the session actually needs before booking — a cooking class in a room with no sink fails mid-session. And confirm who unlocks and locks up.",
    "Confirm each teacher the week before their session. A no-show teacher with a published time costs you the attendees who did come — and some of them won't come back.",
    "Ask the specific people who aren't showing up, not the room that already came. The barrier is usually one concrete thing — a bus that stops at seven, nowhere to put the kids."
  ],
  "bulk-buying-coop": [
    "Recruit about a fifth more households than the supplier minimum. Every cycle a few will skip, and an order that falls short either won't ship or ships at a worse price for everyone.",
    "Ask for the delivery minimum, the short-shipment policy, and whether prices lock at order or at delivery. A 'great price' that floats until delivery can wreck your split math.",
    "Lock the sheet at the cutoff — copy it and close edits — so no late change alters quantities after the coordinator has already totaled the order and paid the supplier.",
    "Price to the penny per unit and round up, not down. The fractions you absorb compound across a cycle, and the buffer should cover a dropped bag of rice, not sit there as slush.",
    "Confirm how the truck actually unloads — liftgate, pallet jack, or just dropped at the curb. A half-ton pallet with no way off the truck is a rough thing to learn on delivery morning.",
    "Tare the container every time and weigh straight into the bag each household takes. Eyeballing 'about a pound' of a six-dollar staple is where both trust and money quietly leak.",
    "Write down what the coordinator actually did this cycle while it's fresh. The role only rotates smoothly if the next person inherits a checklist instead of a mystery."
  ],
  "repair-cafe": [
    "Your electronics and appliance fixers draw the longest lines and burn out first — recruit two before you open, and steer easy wins like hems and loose screws to newer hands.",
    "Keep soldering, heat, and battery work away from the crowd and near ventilation, and run power through a few surge strips you've tested — tripping the venue's breaker stalls every station at once.",
    "A fixed day-of-month — first Saturday, say — beats a floating date. People remember a rhythm, and your fixers can hold the slot months ahead instead of renegotiating each time.",
    "Log a rough triage at intake — likely fixable, long shot, or needs a part — so nobody waits an hour in line only to hear their toaster was never coming back.",
    "Draw a hard line on opened mains-powered gear and swollen batteries: a fixer who isn't sure says no, and that's the right call, not a failure. Post it so no one takes the no personally.",
    "Keep a shared box and a running tally sheet at each station. The patch or fuse always runs out the day nobody checked, and 'who bought the thread last time' is a fight worth heading off."
  ],
  "rides-transportation": [
    "See the physical documents — don't take 'yeah, I'm covered.' A photo of the current license and insurance card in the file is what protects everyone the day something actually goes wrong.",
    "Ask each driver's insurer in writing whether volunteer driving is covered. Many personal policies exclude anything that looks like a service, and you want that answer before a claim, not after.",
    "Capture the return trip and any mobility equipment up front. A rider stranded at a clinic because the wheelchair didn't fit the car is the failure people remember longest.",
    "Confirm with both driver and rider the day before, out loud or in writing. A silent assumption that the ride is still on is exactly how someone misses a dialysis appointment.",
    "Name plainly what you don't do — no emergencies, no last-minute, edges of the map — so a 'no' lands as a known rule rather than a personal rejection at a bad moment.",
    "Never let a rider's inability to chip in show. Keep any contribution genuinely optional and invisible at the moment of the ride, or you've quietly rebuilt the very barrier you set out to remove.",
    "Pair a driver's first ride with a familiar rider or a second volunteer, and check in afterward. The ride log isn't red tape — it's what you'll wish you had if a concern ever surfaces."
  ],
  "tenant-union": [
    "Choose people who can keep a confidence, not just the loudest voices. This work runs on tenants trusting the committee with real retaliation risk, and a single leak ends that trust.",
    "Never write a tenant's name beside their complaint where a landlord might see it — code the units, keep the key separate, and ask before recording anyone at all.",
    "Date-stamp every fact and note the statute behind it. Tenant law shifts, and 'someone told me last year' is how a union hands out a deadline that's already wrong.",
    "Run a drill before you need it, and set a realistic response promise. A phone tree nobody has ever tested goes silent at exactly the moment someone is being locked out.",
    "End with the concrete first move for someone served papers — the deadline and the number to call — because that's the one thing a frightened tenant will actually carry home from the night.",
    "Put the court-response deadline first and in bold. Missing it usually loses the case by default, no matter how strong the tenant's side actually is.",
    "Learn each partner's intake hours and capacity, not just their phone number. A referral to a clinic that's full or closed until Monday isn't a handoff when the deadline is Friday."
  ],
  "childcare-collective": [
    "Talk through discipline and screen-time differences now, out loud. The blowup is rarely about the schedule — it's the day someone parents your child in a way you'd never allow.",
    "Write the never-alone rule as the one you apply hardest with the families you trust most. The 'just this once' exception with a close friend is exactly where these collectives break.",
    "Get down to a child's eye level and crawl the room — cords, tippy furniture, a visitor's purse with medication in it. The hazards an adult scans past are the ones a toddler finds first.",
    "Make the credit balance visible to everyone from day one. Resentment grows in secret, and a family that can see it's behind will offer to host before anyone has to ask.",
    "Keep each child's allergy and medication sheet where the caregiver on duty can grab it in seconds, and settle the sick-child line before a feverish morning forces a rushed, resented call.",
    "Drill the actual emergency — who calls, who stays with the other kids, where the emergency sheets live. Knowing infant safe-sleep matters little if nobody's clear on the first sixty seconds.",
    "Ask the kids how it went, not just the parents, and debrief the near-misses honestly. A smooth pilot that dodged the hard cases hasn't tested the thing that will actually strain trust."
  ],
  "community-composting": [
    "Stand on the site and find the nearest water tap and the nearest neighbor's window; a pile you can't easily wet, or one right under someone's bedroom, is the one you'll be relocating by summer.",
    "A hot pile needs about a cubic yard of material to actually heat up and kill weed seeds — smaller than that and you've built a cold pile that just sits, whatever the bin is called.",
    "Line up your brown material before the first scrap arrives — a leaf pile or a pallet of cardboard you can draw from — because food scraps show up daily and dry leaves only fall once a year.",
    "Tell people to skip the 'compostable' plastic liner bags; they don't break down in a backyard pile and become the plastic shreds you're picking out of finished compost for months.",
    "Put the no-list on the bin lid itself, not a nearby poster, and use pictures — a crossed-out chicken bone reads across every language faster than a paragraph does.",
    "Teach the wrung-out-sponge moisture test and assign each week to a named person, not 'the team' — a shared duty with no name on it is the week the pile gets skipped.",
    "Let a finished batch cure a few extra weeks and screen out the chunks before you hand it out — compost that's still 'cooking' will burn the seedlings it's supposed to feed, and that story travels."
  ],
  "free-little-library": [
    "The leak that ruins books isn't the roof — it's the door gap and water wicking up from the post; seal the bottom, add a lip under the door, and test it with a hose before you fill it.",
    "Place it where people already slow down — a bus stop, a school gate — not where they drive past, and keep it clear of the sidewalk so a wheelchair or stroller can pass.",
    "Kids' books leave fastest and come back least, so over-stock those; and quietly recycle the water-stained or 1990s-textbook donations before they go in — one shelf of junk and people stop opening the door.",
    "Whatever the sign says, make it read as an invitation, not an obligation — people will take books without leaving one back, and that's fine; if they feel they owe one, they won't take the one they need, and the whole point was no barriers.",
    "Line up a backup steward too, and tell both what to pull on sight: anything moldy, anything with a stranger's phone number written in it, and adult titles in a box kids reach into."
  ],
  "community-first-aid-training": [
    "Ask what they charge and whether they waive it for community groups — many do — and pin down the student-per-mannequin cap, because a CPR class with more than about eight sharing one is watching, not practicing.",
    "Check the naloxone expiration dates the day they arrive and note them somewhere you'll actually see — and don't store it in a hot car or freezing shed; temperature extremes degrade it before the date does.",
    "You need clear floor space to kneel and do compressions, not just chairs and tables — check the room has that, plus a sink and an accessible entrance, before you book it.",
    "Free trainings no-show at 30-40%, so confirm the day before and over-book a little; offering childcare and food does more for turnout among the people you most want there than any flyer.",
    "Say at the start that practice is on mannequins, nobody has to touch anyone, and people can step out during the overdose section — some in the room have lost someone, and you want them back next time.",
    "Keep a simple list of who took naloxone and when it expires so you can nudge a refill before it lapses, and schedule the first refresher within the year — hands forget compressions faster than people expect."
  ],
  "time-bank": [
    "Push people to name what they'd ask for, not just what they'd give — everyone lists offers and no one admits needs, and a bank where nobody spends is one where nobody earns.",
    "Pick the simplest thing the coordinator will actually keep current, and make sure you can export the ledger — the day your one tech-savvy volunteer moves away, a locked-in app takes the whole history with it.",
    "Decide now what happens when someone leaves owing hours or sits deep in the negative — writing that rule while everyone's friendly is far easier than inventing it the first time it stings.",
    "Get each new member to book one real exchange before they leave orientation — the philosophy sticks when they've spent a credit, not when they've heard the speech.",
    "List when and where people are available, not just what they can do — 'plumbing' helps no one if the member only has Tuesday mornings and no car, and a stale directory quietly teaches people to stop checking it.",
    "Watch for members who've earned but never spent, or joined and never traded, and reach out by name — the quiet ones don't complain, they just drift off, and you only notice when they're already gone.",
    "For in-home exchanges, offer a first meeting in public and an easy, no-questions way to decline a match — and route complaints to a person, not a form, or people quietly stop showing up."
  ],
  "solidarity-fund": [
    "Keep the team small and odd-numbered so votes can't deadlock, and agree upfront that anyone recuses when a friend or relative applies — the appearance of favoritism sinks a fund as fast as the real thing.",
    "Never route the money through a volunteer's personal Venmo or bank account, however convenient — it blurs whose money it is, creates a tax mess for them, and looks exactly wrong when someone starts asking questions.",
    "Set both a per-request cap and a monthly total you won't exceed, so a few big early asks can't empty the fund and leave you saying no to everyone in week three.",
    "Ask how they'd like to receive the money and nothing you don't truly need — no ID numbers, no landlord letters; every proof you demand is a family that quietly gives up and doesn't apply.",
    "Lean on recurring small pledges over a single big drive — a fund that gets $200 every month can promise help next month, while one that raised $5,000 once is already rationing by fall.",
    "Set a small amount two people can approve same-day without a full meeting — when someone's power shuts off Friday, a decision that waits for Tuesday's group call isn't help, it's paperwork.",
    "Report totals and counts, never stories — even a 'de-identified' anecdote about a single mom on Elm Street is recognizable to the neighbors, and one recipient feeling exposed will scare off the next ten who need help."
  ],
  "diaper-hygiene-bank": [
    "Diapers and pads wick moisture and draw pests, so pick storage that's genuinely dry and sealed — and site the hand-out spot so a family isn't collecting them in front of the whole waiting room.",
    "Check whether a diaper-bank network or wholesaler will sell to you at case prices — drives bring a flood of newborn sizes, but the 4s, 5s, and 6s families actually run out of you'll usually have to buy.",
    "Break big cases down into ready-to-hand-out bundles as they arrive, not at the door — and count by size every time, because 'we have diapers' means nothing when it's all size 1 and every request is for size 5.",
    "Be upfront that a monthly allotment (often around 25-50 diapers) is a supplement, not a full supply — families budget better around an honest number than around a vague 'as many as we have.'",
    "Hold it the same day and time every cycle so families can plan their month around it, and coach volunteers to just hand the package over — no questions about the baby, no proof, no story required."
  ],
  "community-bike-workshop": [
    "A dozen donated bikes swallow floor space fast — measure for wall or vertical hooks before you sign, and check the space locks up well enough that a rack of frames won't walk overnight.",
    "Trace each tool's outline on a pegboard so a missing wrench is obvious at closing — open workshops lose tools fast, and hunting for the 15mm kills a session's momentum.",
    "Set a hard \"no\" on rusted big-box specials before the calls go out — they cost more hours than a working bike is worth, and \"we'll get to it\" is how a yard fills with scrap.",
    "The strongest mechanic and the best teacher are rarely the same person — watch whether a candidate can sit on their hands and let a beginner fumble the bolt, because that's the whole job here.",
    "Give each earn-a-bike learner a punch card or logged hours any mechanic can read — progress that lives only in one volunteer's memory evaporates the week they're out sick.",
    "Make the brakes-and-tires check a signed line on a card, ideally by someone other than the builder — a fresh set of eyes catches the loose quick-release that the person who's been on it all afternoon won't."
  ],
  "newcomer-translation-network": [
    "Conversational fluency isn't interpreting fluency — ask a candidate to relay a medical or housing sentence in both directions before you count them, and match dialects, not just languages.",
    "Note for each listing whether they ask for ID or status and which languages they actually staff — sending someone to a place that turns them away at the door costs trust you won't easily rebuild.",
    "Log requests by first name and a callback number, nothing more — a tidy spreadsheet of who needs what, tied to real identities, is exactly the record that can be subpoenaed or leaked.",
    "Have someone from each language community read the draft aloud before you print — machine or word-for-word translation of rights and transit info reads as nonsense, or worse, as wrong instructions.",
    "Brief volunteers to voice everything in the first person and add nothing — the moment an interpreter starts answering for the provider or the client, both stop trusting the room, and someone's care suffers.",
    "Write down how long you keep anything and who can be told \"we don't collect that\" — decide your answer to a records request now, calmly, not in the moment an official is standing at the table."
  ],
  "community-meal": [
    "Before you fall for a pretty hall, check the unglamorous things an inspector will: a separate hand-wash sink, hot water, and enough fridge space — a kitchen that can't pass is a kitchen you can't use.",
    "Ask the health department specifically about charitable-meal exemptions — many places have a lighter path for volunteer kitchens — and start the food-handler card now, because the class often books out weeks ahead.",
    "Pin donors to a specific day and amount rather than \"whatever's left\" — a menu planned around a promise that doesn't show up means a grocery run an hour before service, every week.",
    "One naturally vegetarian, nut- and shellfish-free main that everyone eats beats a separate \"allergy plate\" you'll forget under pressure — cook down to the strictest need and label it anyway.",
    "Roster more hands than a shift strictly needs and cross-train a second lead cook from week one — the meal that hinges on one person showing up is one flu away from cancelled.",
    "Pick a day and time you can hold for a year, not the most ambitious one — people arrange their week around a meal they can count on, and a cancelled night teaches them not to rely on you.",
    "Get leftovers into shallow pans and the fridge inside two hours — food held warm on the counter \"to deal with after cleanup\" is exactly how a good meal makes someone sick the next day."
  ],
  "seed-library": [
    "Keep the cabinet off exterior walls and away from sunny windows and heat vents — it's humidity and temperature swings, not age alone, that kill seed, so cool and dry beats a prominent spot.",
    "Skip the pink- or blue-coated treated seed and the patented hybrids — treated seed isn't safe to handle casually, and hybrids won't grow true if anyone tries to save them back.",
    "Write the year big on every envelope and shelve oldest-in-front — when a whole batch is a color-coded \"easy for beginners,\" a first-timer can self-serve without a steward hovering.",
    "Cap how many packets of one variety a person takes so an enthusiast doesn't clear the drawer, and frame returns as a gift, not a debt — guilt-tripping borrowers just means they stop coming.",
    "Test a doubtful batch with ten seeds in a damp paper towel for a week — if fewer than six sprout, pull it rather than send a beginner home with seed that was never going to come up."
  ],
  "digital-literacy": [
    "Get the donor to sign out of their iCloud or Google account before it leaves their hands — an activation-locked tablet is a paperweight no wipe will fix, and chasing them down later rarely works.",
    "Tag each device and log its serial with the loan — and lend the charger as a numbered set, because the single most common \"lost\" item isn't the laptop, it's the power brick nobody wrote down.",
    "Check the data cap before you hand over a hotspot — a plan that throttles after a few gigs won't survive one telehealth video call, and the borrower blames the device, not the plan.",
    "Run a quick role-play where the tutor must talk a nervous beginner through a task without touching the device — the hardest habit to break is reaching for the mouse, and you want it broken before a real learner is in the chair.",
    "Screenshot the actual screens your learners will see and print them big — a generic \"how to email\" handout confuses people the moment their screen looks different, and one skill per page beats a booklet nobody opens.",
    "Keep a second helper free to float during drop-in hours — one thorny \"my account got locked\" problem will otherwise swallow the whole session while everyone else waits and drifts off.",
    "Wipe on the way in and the way out, and remind borrowers to save their photos and files first — people forget everything lives on that device, and a return-day factory reset erasing a grandkid's photos is a wound."
  ],
  "weatherization-brigade": [
    "Vet a new volunteer on a low-stakes job before sending them into someone's home, and flag anyone eager to take on more than the scope allows — overconfidence, not inexperience, is what gets a resident's house damaged.",
    "Add lead paint and old insulation to your \"stop and refer\" list alongside gas and electrical — disturbing them in a pre-1978 home without training is both illegal and a real health hazard, and it hides in exactly the surfaces you'd caulk.",
    "Send two people to every assessment, photograph everything, and don't promise a date on the doorstep — the \"quick caulk job\" that opens onto mold or knob-and-tube wiring needs a sober second look, not an eager yes.",
    "Buy from the assessment's material list, not a guess, and pick low-odor, low-VOC products for occupied homes — an elder can't air out a house for a day, and the wrong exterior caulk peels off by next winter.",
    "Confirm in writing that your coverage actually names volunteer home repair — many general liability policies quietly exclude it — and treat ladders as the real danger here, since falls, not power tools, send these crews to the ER.",
    "Call to confirm the morning of, not just the week before — an anxious elder who forgot you're coming may not open the door — and bring your own water and cleanup so the visit doesn't run up their bills."
  ],
  "pet-food-bank": [
    "Pet food draws rodents even harder than the human pantry does — store it in sealed bins up off the floor, or you'll be feeding the mice before the neighbors.",
    "Ask pet stores about torn or damaged bags they can't sell — that food is usually perfectly good, and it's a steadier stream than one-off donation drives.",
    "Keep any prescription or therapeutic vet diets separate and labeled — they aren't interchangeable, and the wrong one can make a sick animal worse.",
    "Ask how many pets and what size before you set a portion — a two-cat home and a mastiff household are not the same 'one bag.'",
    "Stock both cat and dog food each session and let people take only what fits their animal — nothing stings like being handed food your pet can't eat."
  ],
  "youth-mentorship": [
    "Confirm the same room is yours for the whole term, not just this month — kids who've been let down need the space to be there every single week.",
    "Write the two-adult rule to cover bathrooms, rides home, and one-on-one tutoring too — that's where 'alone with a child' actually happens, not in the main room.",
    "Screen for who can commit the whole term over who dazzles in the interview — a mentor who quits in October hurts these kids more than a steady, ordinary one.",
    "Build a predictable rhythm — snack, then homework, then activity — so kids always know what's next; unstructured stretches are where supervision slips.",
    "Put severe allergies where staff see them at snack time, not just filed in a binder, and confirm who's cleared to pick up each child before day one.",
    "Keep snacks nut-free by default and label anything you can't vouch for — planning around one allergic kid is far cheaper than reacting to a reaction.",
    "Do a head count at arrival and again before anyone leaves, and note who picked up whom — a quick word with a parent catches trouble before it grows."
  ],
  "gleaning-network": [
    "Ask each grower exactly what NOT to touch and where to park and walk — the fastest way to lose a farm forever is a volunteer trampling a row you weren't offered.",
    "Recruit people who can drop everything on a weekday morning, not weekend-only helpers — ripe fruit doesn't wait for Saturday.",
    "Line up more crates and vehicle room than you'd guess — a single 'small' tree can yield hundreds of pounds, and produce left in a hot car by noon is compost by evening.",
    "Track firm yeses, not maybes — a list of ten who might show is worthless against a grower's two-hour window; know the three who actually will.",
    "Agree on the no-go list up front — nothing off the ground for leafy greens, no rotten fruit mixed in — because one bad batch at a fridge undoes years of trust.",
    "Match the crop to the outlet before you pick — a small pantry can't move 200 pounds of ripe peaches, but a community meal or several fridges can.",
    "Weigh the haul at the field before you split it up — that poundage recruits your next grower and volunteer, and you'll never reconstruct it later."
  ],
  "community-mediation": [
    "The hardest thing to train is staying neutral when you privately think one side is right — screen for people who can sit with that instead of fixing it.",
    "Talk to each side alone at intake — people won't name their fear or a power imbalance with the other party sitting right there.",
    "Pick a room on neither person's turf, with two exits and no one waiting outside — a space where one party's friends linger isn't actually neutral.",
    "Write the referral list before your first case — name the DV hotline, a tenant lawyer, the crisis line — so a mediator can hand it over on the spot, not improvise.",
    "Decide in advance what you'd do if someone discloses a threat or child abuse mid-session — 'everything is confidential' isn't fully true, and promising it can trap you.",
    "Reach people through where disputes surface — property managers, HOA boards, the housing office — not just flyers; that's who's standing next to a fight when it starts.",
    "Debrief after every hard case, not once a month — mediators carry other people's conflict home, and burnout shows up as cynicism before anyone admits it."
  ],
  "reentry-support": [
    "Call each listing to confirm it's still real and still fair-chance, and note the actual human contact — a dead referral wastes the scarce first weeks that matter most.",
    "Screen out saviors — the volunteer who wants to fix people burns out and starts gatekeeping; look for the one who can follow someone else's goals without steering.",
    "Ask what they want first, before you look at what their record says — let them name the top need instead of running down a form; dignity here sets the whole relationship.",
    "Solve the mailing-address problem first — a partner org's address or a P.O. box — because almost every ID and benefit application dead-ends without one.",
    "Prep people for the record question honestly before the interview, and reconfirm the employer is genuinely fair-chance this month — a bait-and-switch rejection cuts deeper than no lead.",
    "Support your peer mentors too — being someone's lifeline while managing your own reentry is heavy, so don't let one mentor carry five people.",
    "Write down exactly who may see someone's history and never share a record without their explicit okay — one careless mention in a group chat can cost them a job."
  ],
  "community-wood-bank": [
    "Get it in writing that the wood is yours to take and where the property line runs — a verbal 'help yourself' turns into a trespassing or timber-theft mess fast.",
    "You need room for two years of wood at once — this winter's dry stack and next winter's drying — or you'll always be burning green wood.",
    "Budget chaps, eye, and ear protection for every operator before the second chainsaw — gear that gets 'shared around' means someone ends up cutting without it.",
    "Name one person who owns the go/no-go call and is comfortable telling a willing volunteer no — enthusiasm plus a chainsaw and no gatekeeper is how people get hurt.",
    "Ask at request time where the wood should go and whether there's a clear, dry path to it — dumping a cord an 80-year-old can't move helps no one.",
    "Size portions in real terms — cords, or weeks of heat — not 'a load,' and check back midwinter; the household short in January is the first to catch next fall.",
    "Cut this winter's wood by spring, not fall — hardwood needs six-plus months to season; October-for-December wood smokes, wastes heat, and cakes chimneys with creosote."
  ],
  "community-wifi-mesh": [
    "Map from the sidewalk, not a satellite view — trees, a single brick wall, or a bus shelter kills line-of-sight that looks clear from above. Note which side of the street has the sun-facing rooftops.",
    "Get redistribution permission in writing, and read the ISP's terms yourself — many residential and business plans forbid resharing, and a takedown notice can end the whole network overnight.",
    "Recruit at least two techies who don't live together or work the same job — the network dies the week your only admin moves away or takes a night shift.",
    "Set every router's admin password and record it in a shared vault before mounting anything — a factory-default node on a roof is a two-person ladder job to fix later.",
    "Sign a one-page host agreement covering roof access, the few dollars of power a month, and who pays if the node is damaged — a verbal 'sure' evaporates when the host's landlord changes.",
    "Post the no-logging promise where users see it, and actually turn logging off — if you never collect activity records, there's nothing to hand over when someone comes asking for them.",
    "Label each node with its location and a check-in date, and keep a spare router charged — the failure you'll actually face is one dead node, not a rebuild, and a swap should take minutes."
  ],
  "mental-health-peer-support": [
    "Screen for steadiness, not lived experience alone — someone still raw from their own crisis can be pulled under holding space for others. Ask how they handle a room that goes quiet after a hard disclosure.",
    "Write the boundaries as things the circle won't do — no diagnosis, no fixing, no substitute for a therapist — because a list of prohibitions is clearer to a member in distress than a warm mission statement.",
    "Verify each crisis number by calling it yourself, and print the plan on paper for every facilitator — the night you need it, the wifi is down or the line has been disconnected for a year.",
    "Choose a room with a door that closes and no glass walls, and check who else uses the building that hour — a shared lobby or a passing coworker undoes confidentiality before anyone speaks.",
    "Read the ground rules aloud every session, even to regulars — the newcomer who most needs the 'right to pass' is the one too nervous to ask whether it exists.",
    "Cap the group around eight — past that, quiet people never get a turn — and pick a time that isn't Friday night or right after work, when the isolated feel it most and can least travel.",
    "Give facilitators their own place to debrief that isn't the circle itself, and watch for the one who never misses a session and never takes a break — that's the burnout you'll lose them to."
  ],
  "community-cleanup": [
    "Visit candidate sites at different hours before you commit — a lot that's quiet at 10am may be someone's sleeping spot or a dumping ground refilled nightly, which changes everything about the plan.",
    "Nail down the disposal endpoint before the date — a confirmed dumpster or a scheduled city pickup with a reference number — or the bags you collect will sit at the curb until they split open.",
    "Bring one rigid sharps container and heavy puncture-resistant gloves, not just garden gloves — and brief everyone that needles and unknown containers get flagged for a lead, never picked up by hand.",
    "Assign a zone and a team lead for each cluster of volunteers before the day, and over-recruit by a third — cleanups run on the people who actually show, which is fewer than those who sign up.",
    "Shoot the before photos from a fixed spot you can stand in again for the after shot — matched angles are what make the difference undeniable and pull people back for the next round."
  ],
  "free-tax-prep": [
    "Start certification in the fall — VITA training and testing run for weeks, and a volunteer who begins in January is barely ready before the season is half over.",
    "Affiliate with an established program before you promise anyone a date — they set the site requirements, and their software and quality review are what keep one bad return from wrecking a family's refund.",
    "Check the actual upload speed at the space, not just that wifi exists — filing software stalls on a weak connection, and a room full of waiting people watching a spinner is how trust erodes.",
    "Put the required-documents checklist in every reminder and hand it out at booking — the most common heartbreak is someone riding the bus in only to be turned away for a missing SSN card or last year's return.",
    "Aim your outreach at people who assume they earn too little to bother filing — they're often the ones owed the biggest credits, and 'you don't have to file' is exactly the myth costing them money.",
    "Write the retention-and-destruction rule before opening day — no personal files left on desktops, nothing carried home, and a set date to shred — because the breach you'll cause is a laptop left logged in, not a hacker.",
    "Keep follow-up strictly opt-in and offered after the return is done, never as a condition — someone came for a refund, and a budgeting pitch at the table can make free help feel like a sales trap."
  ],
  "community-market": [
    "Pin down each supplier's rhythm and volume in writing, not a friendly 'whenever we have extra' — a stand planned around unpredictable surplus can't promise neighbors a table worth the walk.",
    "Scout the spot for shade and a water source, and check foot traffic at your actual market hour — a corner that's busy at rush hour can be dead at 2pm, and produce cooks in an unshaded lot.",
    "If you go pay-what-you-can, keep it a single unmarked box and never a suggested price at eye level — the moment paying looks expected, the neighbors who most need the food stop coming.",
    "Bring coolers and ice for anything leafy or cut, and set a plain discard line for volunteers — 'when in doubt, compost it' protects both the people you serve and the stand's reputation.",
    "Recruit for the unglamorous slots first — the early pickup drive and the pack-down — since those are what fall through, and name a backup for each so one no-show doesn't cancel the market.",
    "Lock one day and time and hold it even on a thin week — a half-empty stand that always shows up builds more trust than an abundant one that skips a Saturday without warning.",
    "Arrange the leftover-produce handoff before market day, not after — line up a fridge, pantry, or meal program to take the surplus, so pack-down is a five-minute drop-off, not a trunk of rotting greens."
  ],
  "welcome-wagon": [
    "Decide the default is a low-pressure first contact — a note or a call before any doorstep visit — so a newcomer can say yes to a basket without feeling a stranger is about to appear at their home.",
    "Date the packet and name who to tell when a listing closes — a guide sending people to a clinic that moved or a bus route that changed does more harm than no guide at all.",
    "Skip anything perishable or scented unless you know the household — a new parent may have allergies, restrictions, or a bare kitchen, so shelf-stable basics beat a well-meant casserole that can't be eaten.",
    "Coach greeters to read the doorway in ten seconds — hand over the basket, name one way to reach you, and leave unless invited in; the warmest welcome knows when to end.",
    "Make referral partners get the newcomer's consent before passing a name — a landlord or clinic sharing details without asking turns a welcome into surveillance, and word of that spreads fast."
  ],
  "library-of-things": [
    "Frame the survey as a checklist of specific items plus a blank line, and ask what they'd have used \"in the last year\" — that captures real need, not a wishlist of fantasies.",
    "Measure the biggest items first — folding tables, strollers, the carpet cleaner. A closet that holds fifty small things still can't fit the one item everyone asked for.",
    "Check the recall list (CPSC) for anything with a motor, cord, or a child's name on it, and actually plug in every electrical item before it earns a shelf spot.",
    "Photograph each item beside its ID number so a return matches its record in seconds, and log accessories — bags, cords, attachments — as their own lines so nothing vanishes.",
    "Set loan length by how fast an item turns over, not one blanket number — a carpet cleaner for a week, a projector for a weekend — so popular things keep circulating.",
    "Take the condition photo at checkout AND at return; it settles \"it was already scratched\" on its own, so no librarian has to play the bad guy.",
    "Keep a running list of what people asked for and couldn't get — that waitlist, not your guesses, tells you the next thing actually worth buying."
  ],
  "laundry-shower-access": [
    "Walk the real route from where guests wait to the shower door — a private stall down a hallway where everyone can see who goes in isn't actually private.",
    "Buy travel-size and unscented — fragrances trigger some people, and a full bottle walks off while a small one lasts and travels. Add flip-flops for shared showers.",
    "Let people hold a slot with just a first name or nothing at all; a sign-up sheet that demands last name and phone empties the very line you were trying to fill.",
    "Budget real minutes to clean between showers — disinfect, mop, fresh towel — and build them into the slot length, or the schedule quietly runs guests through a dirty stall.",
    "Rehearse the awkward moments — someone intoxicated, a slot running long — so a volunteer's first instinct isn't the panic call that ends your host relationship.",
    "Pick hours you can hold for months and post them where people actually are; changing the time even once teaches everyone the door might be locked when they arrive."
  ],
  "voter-registration": [
    "Write down the exact form-return deadline and who may legally turn forms in; some places require submission within days, counted from when the voter signed, not when you mail.",
    "Give volunteers a ready answer for \"who should I vote for?\" — a warm \"I can't tell you that, but here's how to research the candidates\" — so nobody improvises the drive into trouble.",
    "Pull deadlines, ID rules, and polling info straight from the election office's own page and date-stamp your printout; secondhand \"I heard\" info sends someone to a closed precinct.",
    "Get the property's written okay before you table — a market or campus can eject you mid-shift, and \"we assumed it was fine\" loses you the spot for good.",
    "Keep completed forms in one sealed folder that never leaves a named person's hands, and submit within your legal window even if you only collected three.",
    "Hand every new registrant a card with their polling place, the election date, and the mail-in deadline; a registration with no plan to vote often stays home."
  ],
  "health-navigation": [
    "Capture the direct intake line and current eligibility rules, not just the main number, and note the date you verified each — a clinic that closed still answers its old phone for months.",
    "Drill the exact words for \"I'm not medical — let me connect you to a nurse line,\" because the hardest moment is the scared person on the phone who just wants you to say it's nothing.",
    "Offer a real phone number and a person, not just a form — the people most lost in the system are often the least able to fill out a web intake.",
    "Check the enrollment window before you open a case: marketplace plans lock outside open enrollment, and Medicaid turns on income and household size, so gather documents first.",
    "Ask about transportation when you book, not after — a confirmed appointment with no way to get there is the no-show that costs the patient and burns the clinic's slot.",
    "Decide what you will NOT write down — diagnoses, immigration status — before intake starts; the safest health record is the sensitive detail you never collected.",
    "Ask each clinic which referrals actually help and which swamp them, and give them a named contact on your side — a warm handoff beats sending strangers to their front desk."
  ],
  "toy-library": [
    "Pick a spot at kid height and stroller width; a shelf up a flight of stairs with nowhere to park the baby is a shelf tired parents quietly skip.",
    "Keep the CPSC recall list open and run small parts through a toilet-paper tube — if it fits, it's a choking hazard for under-threes, no matter how cute the toy is.",
    "Count the pieces onto the bag's label and count them again at return; a puzzle logged as \"24 pcs\" gets checked in thirty seconds instead of trusted and quietly ruined.",
    "Name the missing-piece policy out loud and make it gentle — kids lose pieces, and a family afraid of a fine just stops coming instead of returning the set.",
    "Fold the piece-count check and a wipe-down into the return step itself, so nothing hits the shelf uncounted or sticky for the next family."
  ],
  "food-preservation": [
    "Confirm the stove can hold a full canner's weight and reach a hard rolling boil, and that you can run the vent for hours; a pretty church hall with a light-duty range stalls a pressure-canning day.",
    "Anchor everything to one current tested source — the USDA Complete Guide or your extension service — and print the year on it; older times were revised, and \"grandma did it this way\" is how botulism gets in.",
    "Have every pressure canner's gauge tested — your extension office does it, often free — and use only new lids; reused sealing lids are the quiet cause of failed seals.",
    "Line up produce for a specific session date and process it within a day or two of picking; a bumper crop that sits a week loses the quality and safety margin you canned it for.",
    "Match the recipe to the safe method for that food — high-acid to a water bath, low-acid vegetables and meats to pressure only — and never scale a tested recipe past what it was tested at.",
    "Assign one person to time and log every batch's processing; in a busy kitchen, the pot that \"probably had long enough\" is the one you have to throw out.",
    "Label every jar with contents, method, and date, and tell people to check seals and refrigerate after opening; flag any jar that didn't seal for eating soon, not for the shelf."
  ],
  "free-haircut": [
    "Ask each stylist how many cuts they can realistically do in a session — most manage six to eight before their hands tire — and recruit to that number, not the crowd you're hoping for.",
    "Check for grounded outlets within a cord's reach of each chair and a hard floor you can sweep between clients — carpet and a distant plug quietly wreck an otherwise good setup.",
    "Buy two sets of clipper guards and blades per station so one soaks in disinfectant while the other works — sharing a single set between clients is where the line slows and hygiene risk creeps in.",
    "Call your state cosmetology or barber board directly, not just city hall — many require an EPA-registered disinfectant at a set soak time and treat a free event as a licensed establishment anyway.",
    "Give each person a mirror and a real consult before the first snip, and set one chair where the room can't watch — dignity is in the choosing, and some people won't relax in a fishbowl."
  ],
  "mutual-aid-moving-crew": [
    "For moves out of unsafe homes, staff from a small vetted core, not the open sign-up — a survivor should never wonder whether a stranger on the crew knows their new address.",
    "One good four-wheel furniture dolly prevents more injuries than any pep talk about lifting — prioritize it, and stencil your program name on everything so it actually comes back.",
    "Ask two questions people forget: is anything still unpacked, and how far is legal parking from the door? Unboxed belongings and a long carry are what turn a two-hour move into six.",
    "Write a firm weight rule — nothing over about fifty pounds moves with fewer than two people — before you write the waiver. A signed form doesn't mend a torn back; the limit does.",
    "In your day-before call, confirm the person is truly packed, not 'almost' — an unpacked apartment is the most common reason a crew stands around and the whole schedule collapses.",
    "Pair every limit with a referral — the piano, the fourth-floor walk-up, the hoarding cleanout — so turning a job down hands someone a next call instead of a dead end.",
    "Walk the old place with the person one last time before you pull away — the forgotten closet and the overlooked charger are found now or never, and going back later rarely happens."
  ],
  "disability-support-network": [
    "Budget from day one to cover leaders' access costs and time — unpaid 'leadership' quietly filters down to whoever can afford to work for free, which is rarely the disabled neighbors most affected.",
    "Have an actual screen-reader user test your setup before launch — automated checkers pass plenty of pages that are miserable to use, and image-only flyers lock people out entirely.",
    "Verify each resource is accessible before you list it — call and ask about the lift, the bathroom, the intake process. A directory that sends someone to a broken elevator costs more trust than it builds.",
    "Design an easy, no-explanation way to pause — chronic illness means capacity swings week to week, and a member who can't gracefully step back will disappear entirely instead.",
    "Don't lend anything that contacts breath or skin intimately — used CPAP masks, mattresses — and log serial numbers, since assistive devices do get recalled and you'll need to reach borrowers fast.",
    "Learn the benefits cliffs before you advise anyone — a gift, a job, or savings over the limit can cut someone's coverage. When in doubt, route them to a benefits counselor rather than guess.",
    "Put an access-needs question on every event RSVP and book interpreters or CART the moment you set a date — good captioners are reserved weeks out, and 'we couldn't find one in time' is how the standard quietly slips."
  ],
  "books-to-prisoners": [
    "Get the policy in writing and date it — facilities change rules without notice, and a photocopied page from last year is exactly the kind of proof that won't save a rejected box. Re-verify every few months.",
    "Cull hardcovers, water-stained, and marked-up books at the door — most facilities reject them, and a packing room buried in unmailable donations is slower than one with half the stock.",
    "Copy each writer's name, ID number, and housing unit exactly as they wrote it, letter for letter — one transposed digit and the whole parcel bounces back weeks later with no way to tell them why.",
    "Put a rules checklist on the wall and have a second volunteer verify every package before it's taped — new folks mean well and mis-pack, and the mistake isn't caught until it's returned postage-paid.",
    "Media Mail is far cheaper for books, but it legally can't contain a personal letter — tuck notes only where the facility and postal rules both allow, or your bargain rate becomes a returned package.",
    "Coach writers before their first letter on the two hard boundaries — no home address or last name, and a kind but firm script for money and romance requests — so warmth never turns into a volunteer feeling trapped."
  ],
  "community-music": [
    "Play-test or open the case before accepting anything — a warped neck or a cracked pad can cost more than a new starter instrument, and 'free' pianos are almost never worth the move and tuning.",
    "Photograph each instrument's condition at checkout — it settles every 'it was already scratched' conversation kindly, and it's the record you'll want if one never comes back.",
    "If lessons include kids, run background checks before the first session, no exceptions — it's the unglamorous step that protects children and the program, and it's far harder to add after someone's already teaching.",
    "Confirm the space is yours at the hours you'll actually use — a hall that's free Tuesday mornings is useless for after-school kids — and ask about a locked closet so the lending pool lives where it's played.",
    "Run at least one jam billed explicitly for beginners — put a fast player and a first-timer in the same circle and the beginner usually goes home quiet and doesn't come back.",
    "Tell borrowers plainly: if something breaks, bring it back, don't fix it — a home glue job or an over-tightened string does the real damage, and fear of a bill is what makes people hide it."
  ],
  "school-supply-program": [
    "Get the exact lists, brands and all — a teacher who asked for wide-ruled will send home the college-ruled you bought — and ask the counselor for a real family count so you're not guessing quantities.",
    "Buy the unglamorous staples — pencils, wide-ruled paper, glue sticks — in bulk yourself and let the drive bring the fun extras; those basics are exactly what donation bins never produce enough of.",
    "Post the per-grade list at each packing station and leave backpacks unsealed — a kid who needs left-handed scissors or a bigger size should be able to swap at pickup without unpacking a taped bag.",
    "Keep stock off the floor and somewhere dry and locked — cardboard wicks moisture and a garage flood ruins a summer's collecting — and pick a pickup spot on a bus line families already visit.",
    "Hold the giveaway a week or two before day one, not the frantic weekend before, and skip every income form — let kids pick their own backpack color and no one leaves feeling inspected."
  ],
  "legal-aid-clinic": [
    "Ask each attorney whether their malpractice insurance covers volunteer work — many bar pro bono programs provide free coverage, but only if the clinic registers first. An uncovered lawyer will quietly decline the hard cases.",
    "Get a named person and a realistic wait-time at each referral org before you open, not a general phone number — 'call legal aid' with a three-month waitlist behind it feels like a brush-off to someone in crisis.",
    "Stand in the waiting area and see if you can hear a normal voice from the consult room — a shared table or a glass-door office quietly voids the confidentiality the whole clinic depends on.",
    "Keep the substance of the problem off the booking form — a shared scheduling sheet listing 'eviction, undocumented' is a breach waiting to happen. Names and time slots only; the details belong in the room.",
    "Date every handout and have an attorney review it before printing — rights law shifts, and a flyer citing a repealed rule sends people into court sure of something that's no longer true.",
    "Confirm the interpreter is booked before you advertise a clinic in that language, and never let a client's child interpret legal details — line up an adult interpreter or reschedule.",
    "Run the conflict check against your client list before the appointment, not when they sit down — in a small neighborhood you'll eventually book a landlord and their tenant, and by the table it's already too late."
  ],
  "resource-hub-dispatch": [
    "Assign a real person and a checking schedule to every channel before you publish it — an unanswered voicemail box or a form nobody reads teaches people the hub is theater, and that reputation is hard to undo.",
    "Capture each volunteer's hard limits and preferred contact method, not just their skills — and re-confirm the whole roster quarterly, because a list of people who said yes eight months ago is mostly fiction.",
    "Assign every request to one named coordinator who owns it to close — 'the team is on it' means no one is. Even a 'we can't fill this' within a day beats silence that leaves someone waiting on nothing.",
    "Call each listing as if you were a client and note eligibility rules and real hours — directories rot fast, and sending someone across town to a program that closed or won't take them wastes the trust you're building.",
    "Write the dispatch process down so a new coordinator can run a shift from the page alone — the hub's real risk isn't a slow day, it's every routing decision living in one exhausted person's head.",
    "Decide what gets deleted and when, not just how it's stored — the record you've purged can't be subpoenaed, leaked, or breached. Close a request, keep the outcome count, drop the personal details.",
    "Log each unmet need in a fixed category the moment it happens, not from memory at month's end — 'we keep failing at X' only becomes a fundable case for a new project when the entries add up to a number."
  ],
  "harm-reduction-supplies": [
    "Ask whether you can distribute under your partner org's legal umbrella and standing order — it often extends their overdose-protection coverage to your crew and skips months of solving the same paperwork alone.",
    "Write down the actual statute or the source who told you, with a date — 'someone said strips are fine' won't help a volunteer explaining a backpack of them to a cop, and these laws change year to year.",
    "Check expiration dates the day naloxone arrives and store it out of heat and cold — a dose cooked in a summer trunk or frozen in winter can fail at the one moment it's needed.",
    "Call every crisis and treatment number before you print a few hundred inserts — a disconnected or wrong-county line discovered mid-overdose is a cruel surprise, and reprinting kits is far more work than one afternoon of dialing.",
    "Keep the same route and times each round so people learn when to find you — reliability is the whole relationship. And give every fixed-point host one named contact who restocks their box, or it empties and quietly disappears.",
    "Count supplies moved, not the people who took them — a sign-in sheet or ID ask at the table rebuilds exactly the barrier you tore down. Reversals are worth noting only when someone offers the story freely."
  ],
  "court-support": [
    "Ask the defender's office how they want you to reach them and what would actually help — arrive as extra hands, not as watchdogs grading their work, or the relationship closes before it opens.",
    "Rehearse the exact words for 'I can't advise on that — ask your lawyer' until they come automatically; the hallway question arrives fast and warm, and the instinct to help is precisely what wrecks a case.",
    "Verify each date and courtroom against the court's own docket the afternoon before — not the client's memory. Hearings get moved and rooms reassigned constantly, and a good-faith no-show can turn into a warrant.",
    "Walk new volunteers through security before their first date — the line eats 30 minutes, pocketknives and sometimes phones get turned away, and a hearing can mean three hours of waiting for two minutes in the room.",
    "Line up a backup driver for every court morning and confirm the primary the night before — a ride that falls through here isn't an inconvenience, it's a missed hearing and possibly a warrant.",
    "Get the attorney's instructions on content, addressee, and deadline in writing, and hold every letter for them to review before it's sent — a well-meant line admitting fault or contradicting the defense can do real damage."
  ],
  "cooling-warming-center": [
    "Test the AC or heat on a genuinely extreme day, not a mild one — a room that's pleasant in spring can lose to a 100-degree wave, and you'll learn that with vulnerable people inside if you don't check first.",
    "Peg the trigger to a specific National Weather Service number so no one argues about 'is it bad enough' at midnight — and name one person with authority to call it, so the decision never stalls.",
    "Label every bin plainly and tape a contents list inside the storage closet door — during an activation a brand-new host needs to find the first-aid kit or the chargers in seconds, not dig through unmarked boxes.",
    "Drill the one judgment call that matters: what heat stroke and hypothermia look like, and a standing rule to call 911 early. Tell hosts plainly they'll never be second-guessed for calling — hesitation is the danger, not overreaction.",
    "Never schedule a host alone — two per shift covers breaks, bathroom runs, and the moment someone needs help while another calls 911. Keep a named reserve list, because the same weather that fills the center also sidelines volunteers.",
    "Route flyers through the people who physically reach isolated elders — meal-delivery drivers, building managers, outreach workers — because the neighbors at highest risk are exactly the ones not seeing your posts online.",
    "Check on anyone sleeping rather than assuming they're just resting — you can't tell a nap from heat stroke or hypothermia without gently rousing them, and that quiet check is the reason the center exists."
  ],
  "community-oral-history": [
    "Break 'sharing' into specific checkboxes — name attached or not, family only, public online — instead of one blanket yes, and give them a way to reach you later to change their mind. Consent is a dial, not a switch.",
    "Record a 30-second test and listen back before the real session — a humming fridge, an echoey room, or a nearly-full phone that dies at the good part can't be fixed afterward, and you rarely get the story twice.",
    "When a story turns raw or sensitive, stop and ask again whether that part is okay to keep — a yes given before recording can feel very different once the words are actually out loud, and re-asking costs you nothing.",
    "Keep the two backups in genuinely different places — a phone and a cloud account, not two folders on the same laptop — and re-check the consent form before anything goes public, since people's wishes drift over the years."
  ],
  "community-solar-coop": [
    "Ask interested households for something small but real — a signed pledge or a refundable deposit — and note which utility serves each one; a show of hands at a meeting overcounts your co-op by half.",
    "Start with the DSIRE database and your utility's own community-solar page, then call the state energy office to confirm — a rule that changed last legislative session can quietly invalidate a year of planning.",
    "Before anyone falls for a roof, check its age and shading — a roof due for replacement in eight years means paying to remove and reinstall the whole array mid-life. Ask existing programs about waitlists first.",
    "Hold the line: no member signs anything — subscription, lease, loan — until a lawyer who knows energy co-ops has read it. Budget for that review up front; it costs less than any clause it catches.",
    "Call references from each installer's five-year-old projects, not last month's — you're hiring for how they handle year-four problems. Get the maintenance plan priced into the bid, not promised verbally.",
    "Mock up a member's actual monthly statement before launch and test it on your least numbers-friendly member — and show a low-production winter month, not just the sunny-June example, so nobody feels tricked later.",
    "Have members bring a real bill to a walk-through session — decoding rate tiers and delivery charges together lands better than any handout, and the neighbor who cut usage twenty percent is your best teacher."
  ],
  "worker-coop-incubator": [
    "Ask about unpaid and informal work, not just job history — the person who 'just' cooked for a church of two hundred or fixed every cousin's car has venture-grade skills they won't volunteer.",
    "Offer every session at least twice, including one evening or weekend slot, and arrange childcare — the members who most need this training are precisely the ones a weekday-morning class filters out.",
    "Take the group to visit a working co-op and let members grill the worker-owners alone — and teach honestly when a co-op is the wrong fit, because a bad match discovered after incorporation is brutal.",
    "Make the group write the uncomfortable bylaws first — how a member leaves, how a deadlock breaks, how someone gets removed. Ventures that only draft the happy-path rules discover the rest mid-crisis.",
    "For each funding source, record the deadline, the paperwork it demands, and a contact human — then recheck quarterly. Half the co-op grants on any list you find are closed, renamed, or out of money.",
    "Agree on cadence and scope at the first meeting — a monthly hour on the calendar with an agenda outlives goodwill. Match mentors by industry where you can; a bakery's margins baffle a consultant.",
    "Seed the network with actual transactions, not just meetups — have the cleaning co-op quote the catering co-op's kitchen, and make a round of referral asks a standing agenda item at every gathering."
  ],
  "elder-meal-delivery": [
    "Let a trusted face make the introduction — the parish nurse or senior-center worker who already knows the elder — because a stranger's knock gets a polite no from the exact people who need this most.",
    "Background checks take two to four weeks, so start them before you announce a launch date. In interviews, probe for reliability over enthusiasm — ask what regular weekly commitment they've kept for a year.",
    "Test-reheat a sample meal in an ordinary microwave before committing to any container — some warp or stay cold in the middle — and date every label, because contents without 'made on' still forces a guess.",
    "Cap each route at what leaves ten unhurried minutes per door — five or six stops, usually — and schedule the frailest elders early in the run, so a delay never pushes them to tomorrow.",
    "Print only the allergy and access notes on the route sheet and keep the rest locked away — and set a standing prompt to re-ask after any hospital stay, because that's when medication lists change.",
    "Collect a key-holder and a backup contact for every elder when they join, not during the first scare — and shrink the protocol to a wallet card, because nobody reads a binder on a doorstep.",
    "Ask elders in person, one on one — a mailed survey to this group mostly returns silence — and treat a volunteer's first missed week as a conversation, not a failure; it's usually the early sign of burnout."
  ],
  "disaster-relief-hub": [
    "Check both candidate sites against the flood map and pick a backup on different ground — a hub and its backup on the same low street fail in the same storm. Test the keys yourself.",
    "Open vendor accounts and pre-negotiate a purchase agreement now — after a disaster, cash buys exactly what's needed while drives deliver mystery boxes. Ask each supplier in writing what stock they'd commit during an event.",
    "Decide now what you'll refuse — used clothing is the classic hub-killer — and script the polite no for volunteers at the door. A tarp-and-marker floor grid plus a whiteboard count beats software you'll abandon mid-crisis.",
    "Set per-household quantities before opening day and post them in every local language — visible limits read as fairness, while ad-hoc rationing under pressure reads as favoritism and starts the arguments that empty your volunteer line.",
    "Run one real rehearsal a year — trucks, sorting, a mock distribution line — and give every role a named person plus a backup. A no-notice text-tree test tells you who is actually still reachable.",
    "Get yourselves onto the county's emergency-management contact list and into their meetings now — and trade cell numbers with a named person at each agency, because after a disaster the switchboards are the first thing to drown.",
    "Keep printed, laminated copies of the contact tree and site plans at both sites and in two coordinators' cars — and write down the mundane injury rules too: gloves for sorting, two people on every heavy lift."
  ],
  "recovery-peer-support": [
    "Set a minimum of stable recovery time for facilitators — many programs use two years — and always train at least two, so no meeting and no member ever depends on one person's hardest week.",
    "Give facilitators the exact sentence for the moment someone asks about detox or medication: 'That's a medical question, and here's who can answer it safely.' Rehearsed words hold when the room's need is pulling hard.",
    "Keep naloxone at every meeting and train each facilitator to use it, and post the crisis-line numbers where everyone can see them — the overdose plan only counts if it works in the room tonight.",
    "Visit the space at your actual meeting hour and see who's around — a building that hosts a bar night or a loud lobby crowd at seven undoes the discretion a quiet afternoon tour promised.",
    "Name the exceptions out loud along with the promise — imminent danger to self or others gets help, not silence — because members deserve to know confidentiality's limits before they share, not after.",
    "Hand flyers to the people who talk with folks at decision moments — discharge planners, court navigators, clinic staff — and never post photos from meetings. A consistent room and hour matter more than wide reach.",
    "Arrange a monthly debrief for facilitators with someone outside the group, and decide together, in advance, how a facilitator steps back if their own recovery wobbles — a dignified exit ramp designed early prevents a crisis later."
  ],
  "community-fitness": [
    "Ask what would stop people from coming — time of day, childcare, feeling judged — not just what sounds fun. The barriers you hear will shape the program more than the activity list does.",
    "Watch each candidate lead ten minutes before you commit them — warmth shows fast, and so does its absence — and recruit two leaders per activity, because a single leader's vacation cancels the session.",
    "Visit each space at your planned session hour — the shady, quiet park of a morning visit can be a scorching or sketchy one at 6 pm — and confirm the bathrooms are actually unlocked then.",
    "Demo the gentlest version of every move first and treat it as the default, not the modification — when the chair option leads, nobody has to publicly opt down to use it.",
    "Have leaders carry a charged phone and know the exact address or park entrance to give emergency services — 'the big field by the school' wastes minutes — and keep a simple emergency-contact card for each regular.",
    "Decide the bad-weather plan before the season starts and announce changes in one consistent place — and remember a personal 'come with me' fills more spots than any flyer; ask each regular to bring one neighbor.",
    "Notice absences out loud — a friendly 'we missed you' text after two skipped sessions brings people back, while silence teaches them nobody noticed they were gone. Keep it warm, never guilt-tripping."
  ],
  "urban-orchard": [
    "Ask what happens to the trees if the land changes hands, and get the answer into the agreement itself — a decade-long lease that dies at sale is a season-to-season handshake wearing a suit.",
    "Test the soil for lead and contaminants and call utility-locate before the design is final — a buried gas line or a high lead reading will redraw your map, so let it redraw the paper version.",
    "Ask your extension office which disease-resistant varieties actually thrive locally, and be picky about donated trees — a free sapling carrying fire blight into a young orchard is the most expensive gift you'll ever take.",
    "Sheet-mulch or clear each planting circle weeks ahead, not the morning of, and have water running at the site before planting day — hauling buckets for forty new trees breaks volunteers fast.",
    "Plant one demonstration tree together before anyone picks up a shovel, and station an experienced captain per five or six trees — the fatal mistake is planting too deep, so make 'find the root flare' the day's mantra.",
    "Assign watering by name and month on a posted calendar — 'whoever's around' means nobody — and log each visit, because a young tree needs roughly ten to fifteen gallons a week its first two summers.",
    "Expect passersby to pick fruit and decide now whether that's fine — most orchards do well posting 'take a few, leave some' — and put the norms on a sign at the gate, not in meeting minutes."
  ],
  "new-parent-support": [
    "Recruit peer supporters whose youngest is past the baby stage but under five — recent enough to remember it truthfully, far enough out to have capacity. A parent mid-newborn-fog can't hold someone else's.",
    "Schedule meals every second or third day across six or eight weeks rather than daily for two — the hard stretch outlasts the casserole rush — and suggest a porch cooler so drop-offs never require a doorbell.",
    "Offer a specific menu — 'laundry, dishes, or a park hour with the sibling?' — because 'what do you need?' reliably gets 'nothing, we're fine' from a parent too tired to assign tasks to strangers.",
    "Record for each entry what insurance it takes, the real wait time, and whether anyone answers at 2 am — a new parent's crises keep newborn hours, and most directories only list the daytime facts.",
    "Give every peer the same short script for naming it — 'this sounds bigger than tiredness, and it's treatable; can we call together?' — and treat any mention of self-harm as a same-day handoff, never a wait-and-see.",
    "Actually call the references — two minutes of 'would you leave your baby with them?' beats any form — and give parents a no-explanation pause button; needing to justify a break is its own burden.",
    "Make every referral a warm handoff — a named person expecting their call, not a phone number on a list — and share basics between programs with consent, so an exhausted parent never retells their story from scratch."
  ],
  "foster-kinship-support": [
    "Remember many kinship caregivers never touch the agency system — reach them through school counselors, pediatricians, and benefits offices — and lead every contact with one concrete offer, like a ready bed, not a program description.",
    "Take no car seat with an unknown history — crashes leave invisible damage — and check every seat and crib against the recall list the day it arrives. Sort clothing by size at intake, not 'later.'",
    "Pack everything in a real backpack or duffel the child keeps — kids in care too often move their lives in trash bags — and make underwear, socks, and toiletries new, always, no exceptions.",
    "Confirm with the agency, child by child, who is allowed to provide respite before offering it — some placements permit only licensed providers, and a well-meant unauthorized babysit can jeopardize the placement itself.",
    "Provide vetted on-site childcare or the caregivers you most want simply can't come — and consider an occasional kinship-only circle, since a grandmother raising her daughter's kids carries griefs a licensed foster parent doesn't.",
    "Lead the directory with the money nobody mentions — child-only benefit grants, foster clothing allowances, kinship navigator programs — and pair it with one veteran caregiver willing to walk newcomers through the first application.",
    "Train every volunteer on mandatory reporting before their first shift — what must be reported, to whom, by when — and make the photo rule absolute: no image of a child in care goes anywhere, ever."
  ],
  "weather-survival-outreach": [
    "Size each kit to be carried all day by someone on foot — a drawstring bag, not a bulky box — and skip cotton socks; wet cotton pulls heat from the body, while wool warms even damp.",
    "Buy each season's stock at the previous season's clearance — blankets in March, coolers in September, at a third of the price — and ask hotels and gyms for their retired towels and blankets in bulk.",
    "Guard the map like the sensitive document it is — shared carelessly, it becomes a guide for sweeps and harassment. Keep it with trained outreach volunteers only, and never post locations in any group chat.",
    "Pair every new volunteer with a veteran for their first three rounds, and role-play hearing 'no' until accepting it gracefully is automatic — the person who declines tonight will remember who respected that tomorrow.",
    "Trigger on heat index and overnight lows, not the bare thermometer — a 55-degree night in soaking rain kills — and run routes the day before the peak, while moving to safety is still possible.",
    "Verify beds by phone the same day, and learn each shelter's dealbreakers — pets, partners, curfews, sobriety rules — so you can say honestly what someone would give up by going. Honest referrals keep trust.",
    "Drill the counterintuitive sign: someone who was shivering and has stopped is getting worse, not better. The rule stays absolute — call emergency services first, then give shade and water or wind shelter while help comes."
  ]
};
