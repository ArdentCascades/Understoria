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
