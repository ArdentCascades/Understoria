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
import { getTemplate } from "@/content/projectTemplates";

// Suggested starter steps — the one-tap head start for the private
// plan on a claimed TEMPLATE task ("Start with suggested steps" in
// TaskPrivateChecklist). Same mechanism and discipline as
// content/taskTips.ts: authored content, index-aligned to each
// template's `tasks` array, both locales side by side, kept OUT of
// the federated ProjectTask (content-only, no schema churn, nothing
// to sync). Coverage (every template task has 3-5 non-empty steps in
// both locales) is CI-pinned in taskSteps.test.ts.
//
// Voice: each step is a short imperative the claimer could have
// written for themselves — a personal to-do, not documentation. The
// first step of every list is deliberately tiny (a two-minute
// action), because the feature exists for the executive-function gap
// between claiming and starting: the description says what done looks
// like; these say how to BEGIN. Once seeded they are ordinary private
// checklist items — editable, deletable, invisible to everyone else.
export const TASK_STEPS: Record<
  string,
  readonly { readonly en: readonly string[]; readonly es: readonly string[] }[]
> = {
  "community-fridge": [
    {
      "en": ["Jot down three nearby shops, churches, or clinics with a sheltered outside wall","Visit your top pick and ask for ten minutes with the owner or manager","Talk through the unglamorous parts: the power bill, messes, who to call when it breaks","Check the outlet is an outdoor GFCI that stays live overnight","Sum up the agreement in a short email and get their okay in writing"],
      "es": ["Apunta tres tiendas, iglesias o clínicas cercanas con un rincón exterior techado","Visita tu favorita y pide diez minutos con la persona dueña o encargada","Habla sin rodeos del recibo de luz, los desastres y a quién llamar si se descompone","Revisa que el enchufe sea exterior GFCI y siga prendido de noche","Resume el acuerdo en un correo corto y consigue su sí por escrito"]
    },
    {
      "en": ["Post a one-line ask for a working fridge in one local group right now","Line up a friend with a truck and a dolly for pickup day","Plug the donated fridge in and run it a full day before building anything around it","Sketch a simple lean-to that leaves a hand's width behind the fridge for airflow","Build it, anchor the fridge so it can't tip, and plug in at the host site"],
      "es": ["Publica ahora mismo una petición de refrigerador funcionando en un grupo local","Consigue a alguien con camioneta y un diablito para el día de la recogida","Enchufa el refrigerador donado y déjalo andar un día entero antes de construir nada","Dibuja un cobertizo sencillo que deje una cuarta de espacio detrás para que ventile","Constrúyelo, ancla el refrigerador para que no se vuelque y conéctalo en el sitio"]
    },
    {
      "en": ["Draft the sign in your notes app: take what you need, leave what you can, plus the no's","Rewrite each no with its safety reason next to it, so it reads as care, not scolding","Ask two neighbors to translate the sign into the languages your block speaks","Print it, laminate it, and tape it at eye level","Clip a marker and blank labels inside so people can date items"],
      "es": ["Redacta el cartel en tu celular: toma lo que necesites, deja lo que puedas, y los no","Reescribe cada no con su razón de seguridad al lado, que suene a cuidado y no a regaño","Pide a dos vecinas o vecinos traducir el cartel a los idiomas de tu cuadra","Imprímelo, plastifícalo y pégalo a la altura de los ojos","Deja dentro un marcador y etiquetas en blanco para fechar los productos"]
    },
    {
      "en": ["Message three likely volunteers and ask each for one 15-minute weekly slot","Make a shared calendar with two names on every shift, not one","Put a bucket of cleaning supplies at the fridge","Tape a dated cleaning log inside the door","Fill the last empty slots before opening day, even if you have to ask twice"],
      "es": ["Escribe a tres posibles voluntarias o voluntarios y pide un turno semanal de 15 minutos","Arma un calendario compartido con dos nombres por turno, no uno","Deja una cubeta con productos de limpieza junto al refrigerador","Pega por dentro de la puerta una bitácora de limpieza con fechas","Llena los últimos turnos vacíos antes de abrir, aunque tengas que insistir"]
    },
    {
      "en": ["List the bakeries, grocers, and restaurants within walking distance","Visit one at a quiet hour and ask about end-of-day extras","Mention Good Samaritan donation protections if they worry about liability","Agree a fixed weekly pickup time and put it in your calendar","Keep a note of which sources actually come through each week"],
      "es": ["Apunta las panaderías, tiendas y restaurantes a distancia caminable","Visita uno a una hora tranquila y pregunta por lo que sobra al final del día","Si les preocupa la responsabilidad legal, cuéntales de las protecciones para donantes","Acuerden una hora fija de recolección semanal y ponla en tu calendario","Lleva nota de qué fuentes de verdad cumplen cada semana"]
    },
    {
      "en": ["Send one group message asking who'll share problem-contact duty","Set up a free shared number like Google Voice, never one person's own cell","Agree how fast someone replies and who covers vacations","Write the number on a weatherproof label and stick it on the fridge"],
      "es": ["Manda un mensaje al grupo preguntando quiénes comparten la guardia de avisos","Crea un número compartido gratuito tipo Google Voice, nunca el celular de una persona","Acuerda con el grupo en cuánto tiempo se responde y quién cubre las vacaciones","Escribe el número en una etiqueta a prueba de agua y pégala en el refrigerador"]
    }
  ],
  "community-garden": [
    {
      "en": ["Take a photo of the lot you have in mind next time you walk past","Look up the owner in city land records, or knock and ask","Ask for a written one-year license, even a short signed note","Put who pays for water and how much notice to vacate into the written agreement","Knock on the doors either side of the lot and ask what they'd think of a garden"],
      "es": ["Tómale una foto al terreno que tienes en mente la próxima vez que pases","Busca a la persona dueña en los registros municipales, o toca la puerta y pregunta","Pide un permiso escrito de un año, aunque sea una nota corta firmada","Deja en el acuerdo quién paga el agua y con cuánto aviso pueden recuperar el terreno","Toca las puertas junto al lote y pregunta qué les parecería un huerto"]
    },
    {
      "en": ["Look up your local extension service's soil test and order the kit","Take samples from several spots, especially near old walls and fence lines","Mail the kit weeks before build day, since results take a while","While you wait, sketch beds, paths, and a tool corner on paper","If results show lead, plan raised beds with clean bought soil"],
      "es": ["Busca la prueba de suelo del servicio de extensión local y pide el kit","Toma muestras de varios puntos, sobre todo cerca de muros viejos y cercas","Envía el kit semanas antes del día de construcción, porque los resultados tardan","Mientras esperas, dibuja en papel las camas, los caminos y el rincón de herramientas","Si sale plomo, planea camas elevadas con tierra limpia comprada"]
    },
    {
      "en": ["Post a call for untreated lumber, compost, and mulch in one local group","Turn down railroad ties and old treated wood; use cedar, block, or straw bales","Pick a build day date and invite people to it","Stage materials and tools at the site the day before","Raise the beds with the group and set up the hose or rain barrels"],
      "es": ["Publica en un grupo local una petición de madera sin tratar, composta y mantillo","Rechaza durmientes y madera tratada vieja; usa cedro, bloque o pacas de paja","Ponle fecha al día de construcción e invita a la gente","Deja materiales y herramientas en el sitio desde el día anterior","Levanta las camas con el grupo e instala la manguera o los barriles de lluvia"]
    },
    {
      "en": ["Message the group to pick a date for a 30-minute sharing-model chat","At the meeting, put the three options on paper: individual plots, communal, hybrid","Also decide what happens to a plot when someone disappears mid-season","Write down the choice and how decisions get made, and share it with everyone"],
      "es": ["Escríbele al grupo para fijar una charla de 30 minutos sobre cómo compartir","En la reunión, pongan las tres opciones en papel: parcelas, comunal o mezcla","Decidan también qué pasa con una parcela si alguien desaparece a media temporada","Anoten la decisión y cómo se toman los acuerdos, y compártanlo con todo el grupo"]
    },
    {
      "en": ["Look up your local last-frost date right now and write it down","Pick five easy crops for your zone: greens, beans, squash, tomatoes, herbs","Sketch a planting order two weeks apart so harvests don't all hit at once","Plant the first round after the frost date and label every row"],
      "es": ["Busca ahora mismo la fecha de la última helada local y anótala","Elige cinco cultivos fáciles para tu zona: hojas, frijol, calabaza, tomate, hierbas","Traza un orden de siembra con dos semanas entre tandas para escalonar cosechas","Siembra la primera tanda después de la helada y etiqueta cada surco"]
    },
    {
      "en": ["Start a shared calendar and put your own name on the first slot","Fill July and August first, since that's when rotas collapse","Ask each regular for one short slot a week, no more","Add a note to water at dawn, not midday","Tie each slot to a phone reminder"],
      "es": ["Crea un calendario compartido y anótate tú en el primer turno","Llena primero julio y agosto: ahí es donde las rotaciones se caen","Pide a cada persona constante un turno corto a la semana, no más","Agrega la nota de regar al amanecer, no al mediodía","Liga cada turno a un recordatorio en el celular"]
    },
    {
      "en": ["Put the first harvest day on the shared calendar","Ask the community fridge or a neighbor stand if they'll take surplus same-day","Set a twice-weekly phone reminder to pick beans, cucumbers, and zucchini","Set aside a labeled envelope of saved seed for next year"],
      "es": ["Pon el primer día de cosecha en el calendario compartido","Pregunta al refri comunitario o a un puesto si reciben excedente el mismo día","Ponte un recordatorio dos veces por semana para cosechar ejotes, pepinos y calabacitas","Aparta un sobre etiquetado con semillas guardadas para el próximo año"]
    }
  ],
  "tool-lending-library": [
    {
      "en": ["Text one friend with a shed or garage and ask if they'd host a tool shelf","Visit the space and check it's dry, lockable, and reachable without stairs","Ask the host how a drop bin or slot could handle after-hours returns","Agree on 2–4 weekly open hours with the host and write them down"],
      "es": ["Mándale un mensaje a una amistad con cochera o caseta y pregunta si prestaría el espacio","Visita el lugar y revisa que esté seco, tenga cerradura y no haya escaleras de por medio","Pregúntale al anfitrión cómo funcionaría un buzón para devoluciones fuera de horario","Acuerda con el anfitrión entre 2 y 4 horas fijas por semana y anótalas"]
    },
    {
      "en": ["Post one message in the neighborhood chat listing the five tools you want most","Set out three boxes labeled keep, repair, and scrap before donations arrive","Plug in and run each power tool under load; scrap anything that stalls","Check cords for nicks and that blade guards work before shelving a tool"],
      "es": ["Publica un solo mensaje en el chat vecinal pidiendo las cinco herramientas más buscadas","Prepara tres cajas rotuladas: se queda, a reparar y a desechar","Enchufa y prueba cada herramienta eléctrica con carga; desecha la que se atasque","Revisa que los cables no estén pelados y que las guardas sirvan antes de acomodar nada"]
    },
    {
      "en": ["Open a blank spreadsheet and type five headers: number, item, condition, cost, photo","Number ten tools with tape or paint pen and photograph each beside its number","Look up each tool's replacement cost and record it in its row","Mark every tool with the library's name so ownership is never in doubt"],
      "es": ["Abre una hoja de cálculo y escribe cinco columnas: número, artículo, estado, costo, foto","Numera diez herramientas con cinta o marcador y fotografía cada una junto a su número","Busca el costo de reemplazo de cada herramienta y anótalo en su fila","Marca cada herramienta con el nombre de la biblioteca para que nadie dude de quién es"]
    },
    {
      "en": ["Look up one other tool library's rules page for a starting point","Draft loan length, item limit, and a friendly late policy in ten lines","Add a short use-at-your-own-risk waiver line to the signup sheet","List the two or three pricey tools that need a deposit or safety briefing","Ask one likely borrower to read the draft and flag anything confusing"],
      "es": ["Busca en línea las reglas de otra biblioteca de herramientas como punto de partida","Redacta en diez líneas el plazo, el límite de piezas y una política amable de retrasos","Agrega al registro una línea breve de préstamo bajo tu propio riesgo","Anota las dos o tres herramientas caras que sí piden depósito o charla de seguridad","Pídele a alguien que planee pedir prestado que lea el borrador y marque lo confuso"]
    },
    {
      "en": ["Dig out a clipboard and clip a pen to it — that's the checkout desk","Make a sign-out sheet: name, phone, item number, date out, due date; print ten","Text each new borrower on the spot so you know the number works","Photograph every tool's condition at checkout before it leaves"],
      "es": ["Consigue una tablilla y engánchale una pluma: ese es tu mostrador de préstamo","Haz una hoja de registro (nombre, teléfono, número, fechas) e imprime diez copias","Manda un mensaje al momento a cada persona nueva para confirmar que su número sirve","Fotografía el estado de cada herramienta antes de que salga por la puerta"]
    },
    {
      "en": ["Message your two volunteers to pick one hour this week for a walkthrough","Write a one-page cheat sheet: checkout steps, catalog, safety basics","Role-play declining a broken donation and noting damage without blame","Show them where the first-aid kit and eye protection live","Watch each one run a practice checkout start to finish"],
      "es": ["Escríbeles a tus dos voluntarias para apartar una hora de práctica esta semana","Escribe una hoja de referencia: pasos de préstamo, catálogo y seguridad básica","Practiquen rechazar con amabilidad una donación rota y anotar daños sin acusar","Muéstrales dónde están el botiquín y los lentes de protección","Observa a cada quien hacer un préstamo de prueba de principio a fin"]
    },
    {
      "en": ["Tape a blank wish-list sheet to the desk for requests you can't fill","Put a monthly sharpen-and-oil date on the calendar right now","Inspect this week's returns and pull anything damaged into the repair box","Review the wish list monthly and pick the one tool to add next"],
      "es": ["Pega en el mostrador una hoja en blanco para anotar cada pedido que no puedas cumplir","Agenda ahora mismo una fecha mensual para afilar y aceitar","Revisa las devoluciones de la semana y aparta lo dañado en la caja de reparación","Repasa la lista de deseos cada mes y elige la próxima herramienta a sumar"]
    }
  ],
  "neighborhood-care-network": [
    {
      "en": ["Text one gatekeeper — a pastor, super, or clinic worker — to ask who might be isolated","Start a paper list at home; keep it out of shared docs and group chats","Ask two trusted neighbors to introduce you instead of cold-knocking doors","Visit one building manager or faith group in person and leave your number","Word every invite as an offer — a weekly call? — never as singling someone out"],
      "es": ["Escribe a una persona puente —pastor o conserje— y pregunta quién podría estar aislado","Empieza una lista en papel en tu casa; nada de hojas compartidas ni chats de grupo","Pide a dos vecinos de confianza que te presenten en vez de tocar puertas en frío","Visita en persona a un administrador o grupo de fe y deja tu número","Plantea cada invitación como oferta —¿una llamada semanal?— sin señalar a nadie"]
    },
    {
      "en": ["Message three dependable friends and ask if they could commit to one weekly contact","Draft a short recruitment post that names the commitment plainly","Collect two references from anyone who'll make home visits","Block an hour and actually phone every reference — don't just file them","State the rule up front: no volunteer handles a neighbor's cash or keys alone"],
      "es": ["Escribe a tres amistades confiables: ¿pueden comprometerse a un contacto semanal?","Redacta una convocatoria corta que diga el compromiso sin rodeos","Pide dos referencias a quien vaya a hacer visitas a domicilio","Aparta una hora y llama de verdad a cada referencia; no solo las archives","Deja clara la regla desde el inicio: nadie maneja solo el dinero ni llaves de un vecino"]
    },
    {
      "en": ["Pull up your roster and jot each volunteer's language, street, and comfort zone","Call each neighbor and ask what they'd actually like: a call, a ride, a porch chat","Pair the first match on proximity and language, and note your reasoning","Tell both people it's a trial either can end gracefully, no explanation needed"],
      "es": ["Abre tu lista y anota el idioma, la calle y las preferencias de cada voluntario","Llama a cada vecino y pregunta qué quiere de verdad: llamada, traslado o charla","Arma la primera pareja por cercanía e idioma, y anota tus razones","Diles a ambos que es una prueba que cualquiera puede terminar sin dar explicaciones"]
    },
    {
      "en": ["Text one matched pair and ask which day and hour suits them both","Fix every check-in to the same day and time so a missed one stands out","Write a three-line first-contact script and send it to each volunteer","Keep all pairs' schedules in one place the coordinator can check"],
      "es": ["Escribe a la primera pareja y pregunta qué día y hora les acomoda a ambos","Fija cada chequeo al mismo día y hora para que uno perdido se note de inmediato","Redacta un guion de tres líneas para el primer contacto y envíalo a cada voluntario","Guarda los horarios de todas las parejas en un solo lugar visible para la coordinación"]
    },
    {
      "en": ["Ask one neighbor today who they'd want called if they ever didn't answer","Record each neighbor's crisis contact — and whether to avoid calling police","Draft one page: no answer → retry, call their contact, then when to escalate","Print copies for every volunteer instead of leaving the plan in one phone"],
      "es": ["Pregunta hoy a un vecino a quién querría que llamaran si un día no contesta","Registra el contacto de crisis de cada vecino, y si prefiere evitar a la policía","Escribe una página: sin respuesta → reintentar, llamar al contacto, cuándo escalar","Imprime copias para cada voluntario en vez de dejar el plan en un solo teléfono"]
    },
    {
      "en": ["Text one volunteer and ask what recurring needs came up on their last visit","Start a running list of repeat needs: rides, prescriptions, snow shoveling","Match each need to a volunteer or sister project and confirm the handoff happened","Route anything clinical — meds, wound care, lifting — to professionals, kindly"],
      "es": ["Escribe a un voluntario y pregunta qué necesidades se repitieron en su última visita","Empieza una lista de necesidades recurrentes: traslados, medicinas, palear nieve","Conecta cada necesidad con un voluntario u otro proyecto y confirma que se cumplió","Deriva lo clínico —dosis, curaciones, levantar a alguien— a profesionales, con cariño"]
    },
    {
      "en": ["Message all volunteers with two candidate dates for a debrief","Book a comfortable spot and put the debrief on everyone's calendar","Check in privately with each volunteer before the group meets","Rotate whoever sounds stretched thin now, before they have to quit"],
      "es": ["Manda a todo el equipo dos fechas posibles para una sesión de desahogo","Aparta un lugar cómodo y pon la reunión en el calendario de todos","Habla en privado con cada voluntario antes de la reunión grupal","Rota ya a quien suene agotado, antes de que tenga que renunciar"]
    }
  ],
  "emergency-preparedness": [
    {
      "en": ["Pull up your area's official flood and wildfire maps and screenshot your blocks","Walk your street and note single-exit buildings and upper floors with no elevator","Knock on doors and ask who relies on power for oxygen or refrigerated meds","Mark it all on one paper map — hazards in one color, people to check in another"],
      "es": ["Abre los mapas oficiales de inundación e incendio de tu zona y toma captura de tus cuadras","Camina tu calle y anota edificios con una sola salida y pisos altos sin elevador","Toca puertas y pregunta quién depende de la luz para oxígeno o medicinas refrigeradas","Marca todo en un mapa de papel: riesgos en un color, personas a cuidar en otro"]
    },
    {
      "en": ["Write your own household's row first: name, phone, address, needs","Knock on ten doors with a paper form and ask for opt-in contact info","Ask one steady neighbor per block to captain about ten households each","Print the roster, note who needs a knock not a call, and store copies in two homes"],
      "es": ["Escribe primero la fila de tu propia casa: nombre, teléfono, dirección, necesidades","Toca diez puertas con una hoja en mano y pide datos de contacto voluntarios","Pide a un vecino constante por cuadra que sea capitán de unas diez casas","Imprime el directorio, marca a quién tocarle la puerta y guarda copias en dos casas"]
    },
    {
      "en": ["Text two neighbors to pick a meeting spot everyone can walk to","Choose the no-service signals: door knocks, one radio channel, a fixed check-in hour","Walk the radios to the far ends of the neighborhood and test them at real distance","Print the one-page plan and hand it out door to door"],
      "es": ["Manda mensaje a dos vecinos para elegir un punto de encuentro al que se llegue a pie","Acuerda las señales sin cobertura: toques de puerta, un canal de radio y hora fija","Lleva las radios a los extremos del vecindario y pruébalas a la distancia real","Imprime el plan de una página y repártelo puerta por puerta"]
    },
    {
      "en": ["Start the kit right now: put a flashlight and spare batteries in one labeled bin","List what's missing — water, first aid, crank radio, blankets — and split the buying","Store the bin where two or three people can reach it without one keyholder","Tape a rotation date on the lid and put it on the group calendar"],
      "es": ["Empieza el kit ya mismo: pon una linterna y pilas de repuesto en una caja rotulada","Lista lo que falta — agua, botiquín, radio de manivela, cobijas — y divide las compras","Guarda la caja donde dos o tres personas la alcancen sin depender de una sola llave","Pega una fecha de rotación en la tapa y ponla en el calendario del grupo"]
    },
    {
      "en": ["List three candidate spots from memory: a hall, a church, a shaded park","Visit each and ask about the 2 a.m. key, stored generator fuel, and wheelchair access","Get each yes in writing with the host's name and phone number","Add the confirmed spots to the printed plan"],
      "es": ["Anota de memoria tres lugares candidatos: un salón, una iglesia, un parque con sombra","Visita cada uno y pregunta por la llave a las 2 a.m., el combustible y el acceso en silla","Consigue cada sí por escrito con el nombre y teléfono del anfitrión","Suma los lugares confirmados al plan impreso"]
    },
    {
      "en": ["Ask your safe-spot host by text for one evening date next month","Plan three hands-on stations: go-bags, finding utility shutoffs, and the contact tree","Invite in person the neighbors who most need the practice","During the drill, time the contact tree end to end and note where it breaks"],
      "es": ["Pide por mensaje al anfitrión del lugar seguro una tarde del mes que viene","Prepara tres estaciones prácticas: mochilas, llaves de paso y el árbol de contactos","Invita en persona a los vecinos que más necesitan practicar","Durante el simulacro, cronometra el árbol de contactos y anota dónde se rompe"]
    },
    {
      "en": ["List the jobs on one page: medical checks, open the safe spot, coordinate","Call each person and get a spoken yes to their specific role","Name a backup for every role, starting with the medically-vulnerable checks","Put two review dates a year on the calendar and staple the roles to the roster"],
      "es": ["Lista los roles en una hoja: chequeos médicos, abrir el lugar seguro, coordinar","Llama a cada persona y consigue un sí de viva voz para su rol específico","Nombra un suplente para cada rol, empezando por los chequeos a personas vulnerables","Agenda dos revisiones al año y engrapa la hoja de roles al directorio"]
    }
  ],
  "free-store": [
    {
      "en": ["Text two places with space — a church hall, a community center — and ask about one date","Visit the top option and check for ground-floor access and a curb to pull up to","Decide with your crew: one-day swap, recurring pop-up, or standing store","Book the same recurring slot before you leave the building"],
      "es": ["Escribe a dos lugares con espacio —una parroquia, un centro comunitario— y pide una fecha","Visita la mejor opción y revisa que sea planta baja con banqueta para arrimar un auto","Decidan en equipo: intercambio de un día, evento recurrente o tienda fija","Aparta la misma fecha recurrente antes de salir del edificio"]
    },
    {
      "en": ["Copy a yes/no list from an existing free store or thrift shop as your draft","Add used car seats, helmets, and mattresses to the \"no\" side","Get a quick thumbs-up on the final list from the crew","Make two big-print copies: one for the drop-off door, one for inside"],
      "es": ["Copia la lista de sí/no de una tienda gratuita o de segunda mano como borrador","Agrega sillas de auto usadas, cascos y colchones al lado del \"no\"","Pide al equipo un visto bueno rápido para la lista final","Haz dos copias en letra grande: una para la puerta de donaciones y otra para adentro"]
    },
    {
      "en": ["List your station names on one sheet: receive, sort, stage","Ask the host what tables and bins you can borrow, and label one bin \"onward\"","Sketch the room flow so donations get checked at the door, not at the tables","Recruit two sorters for the first hour, when the pile is biggest"],
      "es": ["Anota en una hoja los nombres de tus estaciones: recepción, clasificación, exhibición","Pregunta al anfitrión qué mesas y cajas presta, y etiqueta una como \"para reenviar\"","Dibuja el flujo del salón para revisar donaciones en la puerta, no en las mesas","Consigue a dos personas que clasifiquen la primera hora, cuando la pila es más grande"]
    },
    {
      "en": ["Ask your group chat for spare hangers and a clothing rack","Hang clothes by size and pin a size card on each rack section","Group household goods by kind on separate tables","Set out less than you have and keep a restock box under each table"],
      "es": ["Pide en tu chat ganchos y un perchero que a alguien le sobren","Cuelga la ropa por talla y pon una tarjeta de talla en cada sección del perchero","Agrupa los artículos del hogar por tipo en mesas separadas","Exhibe menos de lo que tienes y deja una caja para reabastecer bajo cada mesa"]
    },
    {
      "en": ["Message the volunteer list with the date and three roles: greeter, sorter, floater","Brief greeters: never ask why someone's here or how much they're taking","Post a shift list so everyone knows their hour and their station","Walk the room mid-event and send the floater wherever it looks ransacked"],
      "es": ["Manda al grupo la fecha y tres roles: recibir gente, clasificar y ordenar el salón","Indica a quienes reciben: nunca preguntar por qué viene alguien ni cuánto se lleva","Publica la lista de turnos para que cada quien sepa su hora y su estación","Recorre el salón a media jornada y manda refuerzos adonde se vea saqueado"]
    },
    {
      "en": ["Call one partner charity or textile recycler and ask what they actually accept","Confirm their open hours for the day right after your event","Line up one driver with a big trunk before doors open","Load out the same day so the host gets the space back empty"],
      "es": ["Llama a una organización aliada o recicladora textil y pregunta qué acepta de verdad","Confirma su horario para el día siguiente a tu evento","Deja apalabrada a una persona con auto grande antes de abrir","Saca todo el mismo día para devolverle al anfitrión el espacio vacío"]
    }
  ],
  "skill-share": [
    {
      "en": ["Put the two questions in your notes app: what could you teach, what do you want to learn","Swap \"what are you an expert in\" for \"what do people always ask you for help with\"","Ask the first three people today — in person, by text, whatever's fastest","Drop every answer into one simple form or sheet as you go","Circle the overlaps — that's your first curriculum"],
      "es": ["Anota las dos preguntas en tu celular: qué podrías enseñar y qué te gustaría aprender","En vez de \"¿en qué eres experto?\", pregunta para qué le piden ayuda siempre","Pregunta hoy a las primeras tres personas: en persona o por mensaje, como sea más rápido","Pasa cada respuesta a un formulario o una hoja sencilla sobre la marcha","Marca con un círculo las coincidencias: ese es tu primer plan de clases"]
    },
    {
      "en": ["Text one would-be teacher and invite them for a coffee this week","Tell them a session is a conversation with busy hands, not a lecture","Plan their first five minutes together, minute by minute","List the materials they'll need and who's bringing each one","Offer a co-host to any first-timer who still looks nervous"],
      "es": ["Escríbele a una persona que podría enseñar e invítala a un café esta semana","Dile que una sesión es una charla con las manos ocupadas, no una conferencia","Planeen juntos sus primeros cinco minutos, minuto a minuto","Anoten los materiales necesarios y quién trae cada uno","Ofrece un co-anfitrión a quien enseñe por primera vez y siga con nervios"]
    },
    {
      "en": ["List three free rooms to ask about: library, community center, someone's living room","Message each one asking about free evenings and weekend slots","Walk the space and check it fits the sessions — a cooking class needs a sink","Ask exactly who unlocks and who locks up, and write it down","Book the same recurring slot so showing up becomes routine"],
      "es": ["Anota tres espacios gratis a los que preguntar: biblioteca, centro comunitario, una sala","Escribe a cada uno preguntando por tardes y fines de semana libres","Recorre el lugar y revisa que sirva: una clase de cocina necesita lavabo","Pregunta exactamente quién abre y quién cierra, y anótalo","Reserva el mismo horario recurrente para que asistir se vuelva costumbre"]
    },
    {
      "en": ["Open a blank sheet and list each confirmed session: date, topic, teacher, what to bring","Post the schedule where members already look, not somewhere new","Keep sign-ups drop-in or one tap, nothing heavier","Set a weekly reminder to confirm next week's teacher personally"],
      "es": ["Abre una hoja y anota cada sesión confirmada: fecha, tema, quién enseña y qué traer","Publica el calendario donde la gente ya mira, no en un lugar nuevo","Mantén la inscripción libre o de un solo toque, nada más pesado","Ponte un recordatorio semanal para confirmar en persona a quien enseña la próxima"]
    },
    {
      "en": ["Write down three people you expected to see who haven't come","Ask each one directly what would make it possible to come","Fix the one concrete barrier you hear most — timing, kids, language, bus schedule","Try one session at a different time or with childcare and compare turnout"],
      "es": ["Anota a tres personas que esperabas ver y no han venido","Pregúntale a cada una directamente qué necesitaría para poder venir","Resuelve la barrera concreta que más escuches: horario, niños, idioma o autobús","Prueba una sesión en otro horario o con cuidado de niños y compara la asistencia"]
    }
  ],
  "bulk-buying-coop": [
    {
      "en": ["Text three neighbors: want to split a bulk food order to cut grocery costs?","Write down each interested household and the staples they buy most","Recruit a fifth more households than you need — some will skip each cycle","Set one kitchen-table meeting date to agree on a buying cycle"],
      "es": ["Escríbele a tres vecinos: ¿y si juntamos un pedido al mayoreo para ahorrar?","Anota cada hogar interesado y los básicos que más compra","Suma una quinta parte más de hogares de los que necesitas — algunos se saltarán ciclos","Fija una fecha para reunirse en una cocina y acordar el ciclo de compra"]
    },
    {
      "en": ["Search for food wholesalers near you and jot down three phone numbers","Call the first one and ask for their catalog and minimum order","Ask each about short-shipment policy and whether prices lock at order or delivery","Ask a nearby buying club which supplier they use and why","Compare all three on minimums, delivery, and staples in one quick table"],
      "es": ["Busca mayoristas de alimentos en tu zona y apunta tres teléfonos","Llama al primero y pide su catálogo y su pedido mínimo","Pregunta a cada uno por faltantes y si el precio se fija al pedir o al entregar","Pregunta a un club de compras cercano qué proveedor usa y por qué","Compara los tres en mínimos, entrega y básicos en una tabla rápida"]
    },
    {
      "en": ["Open a blank spreadsheet with columns: item, unit price, household, quantity","Share the link in the group chat with the cutoff date in the message","Ask one person by name to coordinate this cycle","At the cutoff, copy the sheet and lock edits before totaling the order"],
      "es": ["Abre una hoja de cálculo con columnas: producto, precio unitario, hogar, cantidad","Comparte el enlace en el chat del grupo con la fecha de cierre en el mensaje","Pide por su nombre a una persona que coordine este ciclo","Al cierre, copia la hoja y bloquea las ediciones antes de sumar el pedido"]
    },
    {
      "en": ["Open a shared ledger doc and title it with this cycle's dates","Message the group: payment lands before the order goes in, no exceptions","Price each item per unit to the penny and round up, not down","Record every payment in the ledger the moment it arrives"],
      "es": ["Abre un libro de cuentas compartido con las fechas de este ciclo en el título","Avisa al grupo: se paga antes de hacer el pedido, sin excepciones","Calcula el precio por unidad al centavo y redondea hacia arriba, no hacia abajo","Registra cada pago en el libro en el momento en que llega"]
    },
    {
      "en": ["Text one person with a garage or driveway to ask about delivery day","Call the supplier and ask exactly how the truck unloads — liftgate, pallet, or curb","Book three helpers for unloading with a specific date and time","Stage the space the night before: clear floor, folding tables, room for a hand truck"],
      "es": ["Escríbele a alguien con cochera o entrada para preguntarle por el día de entrega","Llama al proveedor y pregunta cómo descarga el camión: ¿plataforma, tarima o acera?","Aparta a tres personas para descargar, con fecha y hora concretas","Prepara el espacio la víspera: piso libre, mesas plegables y paso para la carretilla"]
    },
    {
      "en": ["Print each household's order list before anyone arrives","Set up one station per bulk item with a scale, scoop, and bags","Tare the scale for each container and weigh straight into the household's bag","Have a second person tick off each list before pickup"],
      "es": ["Imprime la lista de pedido de cada hogar antes de que llegue nadie","Arma una estación por producto a granel con báscula, cucharón y bolsas","Pon la báscula en cero con cada envase y pesa directo en la bolsa de cada hogar","Pide a una segunda persona marcar cada lista antes de la entrega"]
    },
    {
      "en": ["Start a note titled 'cycle checklist' and jot the first three things you did","Ask at pickup who takes coordination next cycle and write the name down","Hand over the checklist and spreadsheet access in one sit-down","Add five minutes at each pickup to review supplier prices and reliability"],
      "es": ["Crea una nota llamada 'lista del ciclo' y apunta las primeras tres cosas que hiciste","Pregunta en la entrega quién coordina el próximo ciclo y anota el nombre","Entrega la lista y el acceso a la hoja en una sola sentada","Suma cinco minutos en cada entrega para revisar precios y cumplimiento del proveedor"]
    }
  ],
  "repair-cafe": [
    {
      "en": ["Text the neighbor who sews and the friend who tinkers with electronics","Write a gap list: which repair categories still have nobody","Recruit two electronics or appliance fixers, not one — theirs is the longest line","Ask each yes what tools they'd bring and which dates work"],
      "es": ["Escríbele a la vecina que cose y al amigo que arregla electrónicos","Haz una lista de huecos: qué categorías de reparación siguen sin nadie","Consigue dos personas de electrónica o electrodomésticos, no una: su fila es la más larga","Pregunta a cada sí qué herramientas traería y qué fechas le sirven"]
    },
    {
      "en": ["Sketch the room on paper and mark every outlet and window","Give each station a table, a lamp, and the tools its fixer asked for","Put soldering and battery work near ventilation, away from the crowd","Test every surge strip at home before it touches the venue's circuits","Tape a big label on each station so visitors route themselves"],
      "es": ["Dibuja el salón en papel y marca cada toma de corriente y ventana","Da a cada estación una mesa, una lámpara y las herramientas que pidió quien repara","Pon la soldadura y las baterías cerca de la ventilación, lejos del público","Prueba cada regleta en casa antes de conectarla a la instalación del local","Pega un letrero grande en cada estación para que la gente se ubique sola"]
    },
    {
      "en": ["Text your fixers two candidate dates and see which gets more yeses","Pick a fixed day of the month — first Saturday, say — not a floating date","Book the venue for the next three sessions in one ask"],
      "es": ["Mándales a quienes reparan dos fechas posibles y ve cuál junta más síes","Elige un día fijo del mes, digamos el primer sábado, no una fecha variable","Aparta la sede para las próximas tres sesiones en una sola solicitud"]
    },
    {
      "en": ["Ask one friendly volunteer to be the greeter for the first session","Make a half-page intake slip: name, item, what's wrong with it","Add a triage line to the slip: likely fixable, long shot, or needs a part","Print \"owners stay with their repair\" on the slip and say it at the door"],
      "es": ["Pídele a una persona voluntaria amable recibir a la gente en la primera sesión","Prepara una ficha de media página: nombre, objeto y qué le pasa","Agrega una línea de clasificación: probablemente reparable, difícil o necesita repuesto","Pon en la ficha \"cada quien acompaña su reparación\" y dilo en la puerta"]
    },
    {
      "en": ["Put a first-aid kit in the bag you'll take to the venue","Make an entrance sign: repairs are attempted, never guaranteed","Write the hard noes: no opened mains-powered gear, no swollen batteries","Tell fixers an unsure no is the right call, and back them when they say it"],
      "es": ["Mete un botiquín en la bolsa que llevarás a la sede","Haz un letrero de entrada: las reparaciones se intentan, no se garantizan","Escribe los noes firmes: nada de aparatos de corriente abiertos ni baterías hinchadas","Diles a quienes reparan que un no por duda es la decisión correcta, y respáldalos"]
    },
    {
      "en": ["Ask each fixer to text you the three supplies they always run out of","Do one shopping run: thread, fuses, glue, fasteners, tubes, patches","Put a shared box and a tally sheet at every station","Check the tallies after each session and restock before the next"],
      "es": ["Pide a cada persona que repara mandarte las tres cosas que siempre se le acaban","Haz una sola compra: hilo, fusibles, pegamento, sujetadores, cámaras y parches","Coloca una caja común y una hoja de conteo en cada estación","Revisa los conteos después de cada sesión y reabastece antes de la siguiente"]
    }
  ],
  "rides-transportation": [
    {
      "en": ["Text two people who drive and ask if they'd take one ride a month","Sit down with each yes and look at the actual license and insurance card","Photograph both documents for the file — \"yeah, I'm covered\" isn't a record","Do reference checks before anyone drives a vulnerable rider","Note each driver's vehicle, seats, and whether a wheelchair fits"],
      "es": ["Escríbeles a dos personas que manejan y pregunta si tomarían un viaje al mes","Siéntate con cada sí y mira la licencia y la tarjeta de seguro en físico","Fotografía ambos documentos para el expediente: un \"sí, estoy cubierto\" no es registro","Haz revisiones de referencias antes de que alguien lleve a una persona vulnerable","Anota el vehículo de cada quien, sus asientos y si cabe una silla de ruedas"]
    },
    {
      "en": ["Email one driver's insurer asking whether volunteer driving is covered","Get every insurer's answer in writing before anyone takes a first ride","Ask a legal aid clinic to look over a simple waiver draft","File each written confirmation with that driver's license photos"],
      "es": ["Escríbele a la aseguradora de un conductor y pregunta si cubre el manejo voluntario","Consigue cada respuesta por escrito antes de que alguien haga su primer viaje","Pide a una clínica de asistencia legal revisar un borrador de consentimiento sencillo","Archiva cada confirmación escrita junto con las fotos de la licencia de esa persona"]
    },
    {
      "en": ["Pick the one channel requests will use and write down its number or link","Draft the intake questions: pickup time, locations, and contact info","Always ask about the return trip and any wheelchair or walker up front","Set a lead time — 48 hours, say — and post it wherever the channel is shared","Run one practice request through the whole flow before going live"],
      "es": ["Elige el único canal para pedir viajes y anota su número o enlace","Redacta las preguntas de admisión: hora de recogida, ubicaciones y contacto","Pregunta siempre desde el inicio por el viaje de regreso y por sillas o andadores","Fija una anticipación, digamos 48 horas, y publícala donde compartas el canal","Corre una solicitud de práctica por todo el flujo antes de arrancar"]
    },
    {
      "en": ["Ask one other person to alternate coordinator weeks with you","Match each request to a driver and line up a backup for cancellations","Confirm with driver and rider the day before, out loud or in writing","Spread the asks across the whole driver list, not just the reliable two"],
      "es": ["Pídele a otra persona alternar contigo las semanas de coordinación","Empareja cada solicitud con alguien que maneje y ten un respaldo por si cancelan","Confirma con quien maneja y quien viaja el día anterior, de viva voz o por escrito","Reparte los pedidos entre toda la lista, no solo entre los dos de confianza"]
    },
    {
      "en": ["List the trip types you'll take: medical, groceries, essential errands","Draw your service area on a map and pick real boundary streets","Write the don'ts just as plainly: no emergencies, no last-minute, no beyond the map","Agree wait-time and bag-carrying norms so every driver answers the same"],
      "es": ["Enlista los viajes que sí cubren: médicos, súper y trámites esenciales","Dibuja la zona de servicio en un mapa y elige calles límite reales","Escribe igual de claro los noes: sin emergencias, sin último minuto, sin salir del mapa","Acuerda normas de espera y de cargar bolsas para que todo el equipo responda igual"]
    },
    {
      "en": ["Text your drivers and ask what gas costs them on a typical trip","Pick one model: a small shared fund, optional contributions, or nothing","Keep money out of the car — any contribution happens elsewhere, quietly","Write the policy in one sentence and share it with drivers and riders alike"],
      "es": ["Pregúntales a quienes manejan cuánto les cuesta la gasolina en un viaje típico","Elige un modelo: fondo común pequeño, aportes opcionales o nada","Que el dinero no entre al auto: cualquier aporte se hace en otro momento y en silencio","Escribe la política en una frase y compártela con quienes manejan y quienes viajan"]
    },
    {
      "en": ["Set up the ride log now: date, driver, rider, destination, done","Write the norms: no entering homes alone, no money beyond agreed costs","Pair each driver's first ride with a familiar rider or a second volunteer","Check in with vulnerable riders after each ride and note anything off"],
      "es": ["Crea ya el registro de viajes: fecha, quién maneja, quién viaja, destino, hecho","Escribe las normas: no entrar a casas sin compañía, ni dinero fuera de lo acordado","Empareja el primer viaje de cada conductor con alguien conocido o un segundo voluntario","Haz seguimiento a las personas vulnerables tras cada viaje y anota lo que no cuadre"]
    }
  ],
  "tenant-union": [
    {
      "en": ["Write down five tenants that neighbors already trust and respect","Ask yourself which of them can keep a confidence — cross off any you doubt","Invite each one to a one-on-one coffee, not a group meeting","At the sit-down, ask what they'd want the union to win first","Close by proposing a meeting rhythm and one role each"],
      "es": ["Escribe los nombres de cinco inquilinos en quienes los vecinos ya confían","Pregúntate quiénes saben guardar una confidencia y tacha a quien te genere duda","Invita a cada uno a un café a solas, no a una reunión grupal","En la charla, pregúntale qué querría que el sindicato lograra primero","Cierra proponiendo un ritmo de reuniones y un rol para cada quien"]
    },
    {
      "en": ["Print or sketch a block map and mark the buildings you hear complaints about","Pick one building and knock ten doors with a partner this week","Ask what's broken, what's feared, and who neighbors go to for help","Ask permission before writing anyone's story down","Code the units in your notes and keep the name key somewhere separate"],
      "es": ["Imprime o dibuja un mapa de la cuadra y marca los edificios con quejas","Elige un edificio y toca diez puertas con alguien más esta semana","Pregunta qué está roto, qué temen y a quién acuden los vecinos por ayuda","Pide permiso antes de anotar la historia de cualquier persona","Codifica las unidades en tus notas y guarda la clave de nombres aparte"]
    },
    {
      "en": ["Look up your city or state's official tenant-rights page and bookmark it","List the numbers that matter: notice periods, repair timelines, deposit rules","Write the statute and the date you checked next to every fact","Email a legal aid clinic asking them to verify your draft","Stamp every page \"information, not legal advice\""],
      "es": ["Busca la página oficial de derechos de inquilinos de tu ciudad o estado y guárdala","Anota las cifras clave: plazos de aviso, tiempos de reparación, reglas de depósito","Escribe la ley y la fecha en que verificaste junto a cada dato","Escribe a una clínica de asistencia legal pidiendo que revise tu borrador","Marca cada página con \"información, no asesoría legal\""]
    },
    {
      "en": ["Start a group chat or phone-tree list with the committee right now","Decide who answers first and who backs them up, by name","Agree on a response promise you can actually keep — say, within two hours","Run a drill: send a test alert and time how long everyone takes to reply","Fix whatever the drill broke before you publish the number"],
      "es": ["Crea ahora mismo un chat grupal o la lista de la cadena telefónica con el comité","Decidan quién responde primero y quién es el respaldo, con nombres","Acuerden una promesa de respuesta que puedan cumplir: por ejemplo, dos horas","Hagan un simulacro: manda una alerta de prueba y mide cuánto tardan en responder","Corrige lo que el simulacro reveló antes de difundir el número"]
    },
    {
      "en": ["Message your legal aid contact to ask for a presenter and two possible dates","Book a room tenants can reach easily and set the date","Print take-home guides in the languages your buildings speak","Script the closing: the court deadline and the number to call, repeated twice","Invite through building leaders, not just flyers"],
      "es": ["Escríbele a tu contacto de asistencia legal pidiendo un ponente y dos fechas posibles","Reserva un salón al que los inquilinos lleguen fácil y fija la fecha","Imprime guías para llevar a casa en los idiomas de tus edificios","Prepara el cierre: el plazo del tribunal y el número al que llamar, dicho dos veces","Invita a través de los líderes de cada edificio, no solo con volantes"]
    },
    {
      "en": ["Open a blank page titled \"If you get eviction papers\"","Put the court-response deadline first, in bold","List the next moves in order: document everything, call legal aid, tell the union","Add \"never skip a court date\" as its own line","Have your legal aid contact read it before anyone else does"],
      "es": ["Abre una página en blanco titulada \"Si recibes papeles de desalojo\"","Pon primero, y en negrita, el plazo para responder al tribunal","Lista los pasos en orden: documenta todo, llama a asistencia legal, avisa al sindicato","Agrega \"nunca faltes a una cita en el tribunal\" como línea aparte","Pide a tu contacto legal que lo lea antes que nadie"]
    },
    {
      "en": ["Start a list of tenant lawyers, legal aid offices, and housing counselors near you","Call each one and ask for a named contact, their intake hours, and real capacity","Note who takes emergencies and who has a waitlist","Put the contact sheet where every committee member can grab it","Set a reminder to re-verify the sheet every three months"],
      "es": ["Empieza una lista de abogados de inquilinos, oficinas legales y consejeros de vivienda","Llama a cada uno y pide un contacto con nombre, horarios de admisión y capacidad real","Anota quién atiende emergencias y quién tiene lista de espera","Deja la hoja de contactos donde todo el comité pueda tomarla","Ponte un recordatorio para volver a verificar la hoja cada tres meses"]
    }
  ],
  "childcare-collective": [
    {
      "en": ["Text two families you trust: want to trade childcare instead of paying for it?","Set one living-room evening with snacks and a firm date","At the meeting, ask each family to say their discipline and screen-time rules aloud","End the meeting with a decision: credit co-op or scheduled group care","Write the model in one paragraph and send it to everyone that night"],
      "es": ["Escríbele a dos familias de confianza: ¿y si intercambiamos cuidado en vez de pagarlo?","Fija una tarde en una sala, con botana y fecha firme","En la reunión, pide a cada familia decir en voz alta sus reglas de disciplina y pantallas","Cierra la reunión con una decisión: cooperativa de créditos o cuidado grupal con horario","Escribe el modelo en un párrafo y envíalo a todas esa misma noche"]
    },
    {
      "en": ["Write the never-alone rule at the top of a blank page before the meeting","List what you'll ask of every caregiver: references, checks where they fit","Agree on adult-to-child ratios by age and write the numbers down","Say it aloud together: the rule applies hardest with the families you trust most","Have every founding family sign or reply agreed to the final list"],
      "es": ["Escribe la regla de nunca-a-solas al inicio de una hoja en blanco antes de la reunión","Enlista qué pedirás a cada persona cuidadora: referencias y verificaciones necesarias","Acuerda las proporciones de adultos por criatura según la edad y anótalas","Di en voz alta con el grupo: la regla pesa más con las familias más cercanas","Pide a cada familia fundadora firmar o responder de acuerdo a la lista final"]
    },
    {
      "en": ["Text the family with the likeliest living room and ask to walk it together","Get on your knees and crawl the room at toddler height, listing every hazard","Buy or borrow outlet covers, cabinet locks, and furniture straps in one trip","Lock medicines and cleaning products in one high cabinet and test the latch","Walk any outdoor area and note gates, gaps, and water hazards"],
      "es": ["Escríbele a la familia con la sala más probable y pide recorrerla juntos","Ponte de rodillas y recorre el cuarto a la altura de un bebé, anotando cada peligro","Compra o pide prestados cubre-enchufes, seguros de gabinetes y correas para muebles","Guarda medicinas y limpiadores bajo llave en un gabinete alto y prueba el seguro","Recorre el área exterior y anota portones, huecos y riesgos de agua"]
    },
    {
      "en": ["Open a shared calendar on your phone and add one trial care slot","Make a credit sheet with a row per family: hours given, hours received","Share the sheet so every family can see every balance from day one","Log who hosts each slot so the load stays visibly fair"],
      "es": ["Abre un calendario compartido en tu teléfono y agrega un primer turno de prueba","Haz una hoja de créditos con una fila por familia: horas dadas, horas recibidas","Comparte la hoja para que cada familia vea todos los saldos desde el día uno","Registra quién recibe en casa cada turno para que la carga se vea justa"]
    },
    {
      "en": ["Open a blank doc and type four headings: allergies, meds, contacts, pickup","Fill in a line for each heading and send the form with a one-week deadline","Put the filled sheets in one bright folder the on-duty caregiver can grab in seconds","Write the sick-child rule now — fever, vomit, rash — before a rough morning tests it","Write the emergency steps in three lines and tape them inside the folder"],
      "es": ["Abre un documento con cuatro encabezados: alergias, medicinas, contactos, quién recoge","Completa cada encabezado y envía el formato a las familias con una semana de plazo","Pon las hojas llenas en una carpeta llamativa que quien cuida tome en segundos","Define ya la regla del niño enfermo antes de que una mañana con fiebre la ponga a prueba","Escribe los pasos de emergencia en tres líneas y pégalos dentro de la carpeta"]
    },
    {
      "en": ["Text the group to find one date when every caregiver can meet for two hours","Look up a pediatric first-aid and CPR course nearby and share the signup link","Walk through supervision, safe sleep, and allergy response with the real forms in hand","Run the emergency drill aloud: who calls, who stays with the kids, where the sheets live"],
      "es": ["Escribe al grupo para hallar una fecha en que todas las personas cuidadoras coincidan","Busca un curso cercano de primeros auxilios pediátricos y RCP y comparte el enlace","Repasa supervisión, sueño seguro y alergias con los formatos reales en la mano","Ensaya la emergencia en voz alta: quién llama, quién se queda, dónde están las hojas"]
    },
    {
      "en": ["Message two or three families to book a two-hour pilot on a specific date","Keep the pilot small: few kids, two adults, the full safety rules in force","Afterward, ask the kids how it went, not just the parents","Debrief the near-misses honestly and list what to fix","Set the next session's date only after the fixes are agreed"],
      "es": ["Escribe a dos o tres familias para agendar un piloto de dos horas en fecha concreta","Haz el piloto pequeño: pocas criaturas, dos adultos y todas las reglas activas","Después, pregúntales a las niñas y los niños cómo les fue, no solo a sus familias","Habla con honestidad de los casi-accidentes y enlista qué arreglar","Fija la fecha de la siguiente sesión solo cuando los arreglos estén acordados"]
    }
  ],
  "community-composting": [
    {
      "en": ["Text the community garden coordinator to ask about a spare corner","Stand on each candidate spot and find the nearest water tap and neighbor's window","Knock on the closest neighbors' doors and talk odor and rats before they worry","Get the host's permission in writing and check your local composting rules"],
      "es": ["Escríbele a quien coordina el huerto comunitario para preguntar por un rincón libre","Párate en cada sitio candidato y ubica la llave de agua y la ventana vecina más cercanas","Toca las puertas más próximas y habla de olores y ratas antes de que la duda crezca","Consigue el permiso por escrito y revisa las reglas locales de compostaje"]
    },
    {
      "en": ["Message someone who's kept a hot pile alive and ask what they'd pick for your site","Estimate your weekly scraps in buckets: households times roughly one pail each","Check the cubic-yard rule: a hot pile needs that much material or it just sits cold","Match the method to how much turning you can truly do and write the choice down"],
      "es": ["Escríbele a alguien que haya mantenido una pila caliente y pregúntale qué elegiría aquí","Calcula tus restos semanales en cubetas: hogares por más o menos un bote cada uno","Revisa la regla del metro cúbico: sin ese volumen la pila se queda fría y no avanza","Ajusta el método a cuánto pueden voltear de verdad y anota la decisión para el grupo"]
    },
    {
      "en": ["Ask the group chat who has spare pallets, a pitchfork, or a compost thermometer","Stockpile brown material now — bag leaves or flatten cardboard — before scraps arrive","Build or buy the bin structure and set it on the agreed spot","Do one supply run for what's still missing: thermometer, pitchfork, drop-off bin"],
      "es": ["Pregunta en el chat quién tiene tarimas, un bieldo o un termómetro de composta","Junta ya material café — hojas en bolsas o cartón aplanado — antes del primer resto","Construye o compra la estructura y colócala en el punto acordado","Haz un solo viaje por lo que falte: termómetro, bieldo, contenedor de entrega"]
    },
    {
      "en": ["Message five likely households to ask which drop-off day suits them","Hand out countertop pails with the drop schedule taped to each lid","Tell everyone to skip compostable liner bags — they survive the pile as plastic shreds","Post the drop-off hours on the bin and in the group chat"],
      "es": ["Escríbele a cinco hogares probables para preguntar qué día de entrega les acomoda","Reparte botes de cocina con el calendario de entrega pegado en cada tapa","Avisa que nada de bolsas compostables: sobreviven la pila hechas tiras de plástico","Publica los horarios de entrega en el contenedor y en el chat del grupo"]
    },
    {
      "en": ["Draft the yes/no list on paper: fruit, veg, coffee yes; meat, dairy, oils no","Find or draw a picture for each item — a crossed-out chicken bone beats a paragraph","Print it weatherproof and stick it on the bin lid itself, not a nearby post","Ask two neighbors who speak the area's other languages to check the wording"],
      "es": ["Escribe en papel la lista de sí y no: fruta y café sí; carne, lácteos y aceites no","Busca o dibuja una imagen por elemento: un hueso de pollo tachado dice más que un párrafo","Imprímela a prueba de agua y pégala en la tapa misma del contenedor, no en un poste","Pide a dos personas que hablen los otros idiomas del barrio que revisen el texto"]
    },
    {
      "en": ["Ask three reliable people, by name, for one turning shift a month","Hold one hands-on session: turn the pile together and teach the wrung-out-sponge test","Put a named person on every week of the calendar — the team means nobody","Hang a laminated log at the site: date, temperature, moisture, who turned"],
      "es": ["Pide a tres personas confiables, por su nombre, un turno de volteo al mes","Haz una sesión práctica: voltea la pila con el grupo y enseña la prueba de la esponja","Pon un nombre en cada semana del calendario: 'el equipo' es lo mismo que nadie","Cuelga una bitácora plastificada en el sitio: fecha, temperatura, humedad, quién volteó"]
    },
    {
      "en": ["Text the community garden that a batch is nearly ready and ask how much they can use","Let the batch cure a few extra weeks and screen out chunks before promising a date","Announce a pickup day to contributors: bring your own buckets or bags","Save a photo of the finished pile for the next round of recruiting"],
      "es": ["Avísale al huerto comunitario que casi hay una tanda lista y pregunta cuánta usarían","Deja curar la tanda unas semanas extra y tamiza los trozos antes de prometer fecha","Anuncia un día de recogida para quienes aportaron: que traigan cubetas o bolsas","Guarda una foto de la pila terminada para la próxima convocatoria"]
    }
  ],
  "free-little-library": [
    {
      "en": ["Search your buy-nothing group or marketplace for a free cabinet or newspaper box","Sketch the box on paper: sloped roof, clear door, a lip under the door to block rain","Gather materials and build it, sealing the bottom and every seam","Spray it with a hose for a minute and fix anywhere water gets in"],
      "es": ["Busca en tu grupo de regalos o en marketplace un gabinete o caja de periódicos gratis","Dibuja la caja: techo inclinado, puerta clara y un borde bajo la puerta contra la lluvia","Reúne los materiales y constrúyela, sellando la base y cada unión","Rocíala un minuto con la manguera y arregla por donde entre agua"]
    },
    {
      "en": ["Text the person whose yard or wall you have in mind and ask if they're open to it","Stand at the spot and check a stroller or wheelchair can still pass on the sidewalk","Ask about any permit or HOA rule if it's not private property","Set the post or mount, then shake the box hard to confirm it's anchored"],
      "es": ["Escríbele a la persona del jardín o muro que tienes en mente y pregunta si acepta","Párate en el lugar y verifica que una silla de ruedas o carriola aún pase por la acera","Pregunta por permisos o reglas del vecindario si no es propiedad privada","Instala el poste o soporte y sacude la caja con fuerza para confirmar que quedó firme"]
    },
    {
      "en": ["Post one message in your group chat asking for gently used books, especially kids' books","Set a labeled box at your porch or the host spot for drop-offs and give it a week","Pull anything stained, moldy, or outdated before it ever reaches the shelf","Shelve a half-full mix with kids' books front and center"],
      "es": ["Publica un mensaje en tu chat pidiendo libros en buen estado, sobre todo infantiles","Pon una caja rotulada en tu puerta o en el punto anfitrión y dale una semana","Retira todo lo manchado, con moho o desactualizado antes de que llegue al estante","Acomoda una mezcla a medio llenar, con los libros infantiles al frente"]
    },
    {
      "en": ["Write \"Take a book, leave a book — all free\" on scrap paper as your draft","Add one line welcoming all ages and languages","Read it aloud and cut anything that sounds like an obligation","Make the final sign and fix it inside the door where rain can't reach"],
      "es": ["Escribe \"Llévate un libro, deja un libro — todo gratis\" en un papel como borrador","Agrega una línea dando la bienvenida a todas las edades e idiomas","Léelo en voz alta y quita todo lo que suene a obligación","Haz el letrero final y fíjalo por dentro de la puerta, donde no llegue la lluvia"]
    },
    {
      "en": ["Text the neighbor who lives closest to the box and ask for five minutes a week","Meet them at the box once and do a quick tidy together","Agree on what gets pulled on sight: anything moldy, adult titles in kids' reach","Ask a second person to be the backup for vacations and sick weeks"],
      "es": ["Escríbele al vecino que vive más cerca de la caja y pídele cinco minutos por semana","Reúnete con esa persona en la caja y hagan juntos una ordenada rápida","Acuerda qué se retira al momento: lo mohoso y títulos para adultos al alcance de niños","Pide a una segunda persona que sea suplente para vacaciones y semanas de enfermedad"]
    }
  ],
  "community-first-aid-training": [
    {
      "en": ["Look up your local Red Cross chapter's number and save it in your contacts","Call to ask about hosting a class and whether they waive fees for community groups","Ask their student-per-mannequin cap and what they need from a host space","Contact one harm-reduction group or the health department about overdose training","Write down each trainer's available dates in one place"],
      "es": ["Busca el teléfono de tu Cruz Roja local y guárdalo en tus contactos","Llama para preguntar por una clase y si eximen el costo a grupos comunitarios","Pregunta el límite de estudiantes por maniquí y qué necesitan del espacio anfitrión","Contacta a un grupo de reducción de daños o a salud sobre capacitación en sobredosis","Anota en un solo lugar las fechas que ofrece cada quien"]
    },
    {
      "en": ["Text the trainer to ask if they bring their own CPR mannequins","Email your health department asking about free naloxone distribution","Price basic first-aid kits at two suppliers and pick one","The day the naloxone arrives, note its expiry and store it indoors at room temperature"],
      "es": ["Escríbele a la persona instructora para preguntar si trae sus maniquíes de RCP","Manda un correo a la secretaría de salud preguntando por naloxona gratuita","Cotiza botiquines básicos con dos proveedores y elige uno","Al llegar la naloxona, anota su vencimiento y guárdala dentro, a temperatura ambiente"]
    },
    {
      "en": ["List three rooms you could ask about: library, community center, clinic","Visit one and check for clear floor space to kneel, a sink, and an accessible entrance","Ask about booking the same weekday each month","Match the room's dates against the trainer's and book the first two sessions"],
      "es": ["Anota tres salones que podrías pedir: biblioteca, centro comunitario, clínica","Visita uno y revisa que haya piso libre para arrodillarse, lavabo y entrada accesible","Pregunta si puedes reservar el mismo día del mes de forma recurrente","Cruza las fechas del salón con las de la persona instructora y reserva dos sesiones"]
    },
    {
      "en": ["Message two people who'd likely come and ask each to bring one more person","Ask nearby businesses and family-support groups to share sign-ups with their people","Set up a free sign-up form with two time options for shift workers","Offer childcare and food, and say so right in the invite","Over-book by a few seats and plan a day-before confirmation message"],
      "es": ["Escríbeles a dos personas que probablemente irían y pide que traigan a alguien más","Pide a negocios cercanos y grupos de apoyo a familias que compartan la inscripción","Arma un formulario gratuito con dos horarios para quienes trabajan por turnos","Ofrece cuidado de niños y algo de comer, y dilo desde la invitación","Apunta unos cupos de más y planea un mensaje de confirmación el día anterior"]
    },
    {
      "en": ["Text the trainer two days before to confirm time and headcount","Arrive an hour early to set up floor space, the sign-in sheet, and water","Open by saying practice is on mannequins and anyone can step out during overdose talk","Check every attendee gets hands-on practice, not just a seat","Hand out take-home reference cards as people leave"],
      "es": ["Escríbele a la persona instructora dos días antes para confirmar hora y asistencia","Llega una hora antes para preparar el piso, la hoja de registro y agua","Abre diciendo que se practica con maniquíes y que pueden salir en la parte de sobredosis","Verifica que cada persona practique con las manos, no solo mire","Entrega las tarjetas de referencia a la salida"]
    },
    {
      "en": ["Count your kits and naloxone doses and write the number down","Hand each person a kit before they leave, noting who took naloxone and its expiry","Put the first refresher on the calendar within the year, before people scatter","Set a reminder a month before the earliest naloxone expiry to nudge refills"],
      "es": ["Cuenta tus botiquines y dosis de naloxona y anota el número","Entrega un botiquín a cada persona y apunta quién llevó naloxona y su vencimiento","Agenda el primer repaso dentro del año, antes de que la gente se disperse","Pon un recordatorio un mes antes del primer vencimiento de naloxona para reponerla"]
    }
  ],
  "time-bank": [
    {
      "en": ["Write a list of ten to fifteen neighbors you could realistically sit down with","Message the first three today to set up short one-on-one chats","In each chat, ask for one offer and insist on one ask too","Log every offer and ask in a single sheet as you go","Keep recruiting until the sheet shows variety — rides, repairs, tutoring, cooking"],
      "es": ["Escribe una lista de diez o quince vecinos con quienes de verdad podrías sentarte","Escríbeles hoy a los primeros tres para agendar charlas cortas uno a uno","En cada charla, pide una oferta e insiste también en una necesidad","Registra cada oferta y necesidad en una sola hoja sobre la marcha","Sigue convocando hasta que la hoja muestre variedad: transporte, arreglos, clases"]
    },
    {
      "en": ["Ask the likely coordinator what tool they already use every week","Try logging three fake exchanges in a plain spreadsheet","Test one time-bank app only if the spreadsheet fell short","Confirm you can export the full ledger before committing to anything","Pick the simplest option that survived the test and write down how it works"],
      "es": ["Pregúntale a quien coordinará qué herramienta ya usa cada semana","Prueba registrar tres intercambios inventados en una hoja de cálculo simple","Prueba una app de banco de tiempo solo si la hoja se quedó corta","Confirma que puedes exportar todo el registro antes de comprometerte con nada","Elige lo más simple que pasó la prueba y anota cómo funciona"]
    },
    {
      "en": ["Put a rules meeting on the calendar and invite the founding members","Write the first rule at the top: one hour equals one credit, no exceptions","Agree how members request, confirm, and log an exchange","Decide now what happens when someone leaves owing hours or sits deep in the negative","Keep it all to one page and read it aloud before anyone signs off"],
      "es": ["Agenda la reunión de reglas e invita a las personas fundadoras","Escribe la primera regla arriba: una hora es un crédito, sin excepciones","Acuerden cómo se pide, se confirma y se registra un intercambio","Decidan desde ya qué pasa si alguien se va debiendo horas o queda muy en negativo","Resume todo en una página y léela en voz alta antes de aprobarla"]
    },
    {
      "en": ["Pick a date and message members a short orientation invite","Prepare a ten-minute walkthrough: the philosophy, then a live logged exchange","Load a few starter credits into each new member's balance","Before anyone leaves, have them book one real exchange on the spot","Follow up in a week with anyone whose first exchange hasn't happened"],
      "es": ["Elige una fecha y envía a los miembros una invitación breve a la orientación","Prepara diez minutos: la filosofía y luego un intercambio registrado en vivo","Carga unos créditos iniciales en el saldo de cada nuevo miembro","Antes de que alguien se vaya, que agende un intercambio real ahí mismo","A la semana, busca a quien aún no haya tenido su primer intercambio"]
    },
    {
      "en": ["Open the member sheet and pull every offer into one list","Add columns for when and where each person is available","Message members whose entries are missing days or travel range","Publish the directory where members already look","Put a monthly reminder in your calendar to prune stale entries"],
      "es": ["Abre la hoja de miembros y pasa todas las ofertas a una sola lista","Agrega columnas de cuándo y dónde está disponible cada persona","Escríbele a quien le falte anotar sus días disponibles o hasta dónde llega","Publica el directorio donde los miembros ya miran","Pon un recordatorio mensual en tu calendario para depurar entradas viejas"]
    },
    {
      "en": ["Open the ledger and find one unmet need you can match to an offer today","Text both members to propose the match and offer to make the intro","Scan for people who've earned but never spent, and message each by name","Nudge one member who joined but hasn't traded with a specific suggestion","Note which matches landed so next month's brokering gets easier"],
      "es": ["Abre el registro y encuentra hoy una necesidad pendiente que empate con una oferta","Escríbeles a ambos miembros para proponer el intercambio y ofrecer presentarlos","Busca a quienes ganaron horas y nunca las gastaron, y escríbeles por su nombre","Anima con una sugerencia concreta a alguien que se unió y no ha intercambiado","Anota qué emparejamientos funcionaron para que el próximo mes sea más fácil"]
    },
    {
      "en": ["Draft three safety norms in your notes: references, public first meetings, easy declines","Add a no-questions way to turn down any match","Name one person — not a form — who hears concerns","Bring the norms to the next meeting and adjust them out loud","Post the final norms where members sign up"],
      "es": ["Anota tres normas de seguridad: referencias, primer encuentro en público, rechazo fácil","Agrega una forma de rechazar un emparejamiento sin dar explicaciones","Nombra a una persona, no un formulario, que reciba las inquietudes","Lleva las normas a la próxima reunión y ajústenlas en voz alta","Publica las normas finales donde la gente se inscribe"]
    }
  ],
  "solidarity-fund": [
    {
      "en": ["Write down the three or five people you'd trust with pooled money","Message each one asking for a one-hour conversation about the fund","Talk honestly about payouts, publishing, and what happens when money runs short","Agree that anyone steps out of a decision when a friend or relative applies","Keep the team odd-numbered so votes can't deadlock"],
      "es": ["Escribe los nombres de las tres o cinco personas a quienes confiarías dinero común","Escríbele a cada una pidiendo una hora para hablar del fondo","Hablen con franqueza de pagos, transparencia y qué pasa cuando el dinero no alcanza","Acuerden que cualquiera se aparta de una decisión si aplica un amigo o familiar","Mantengan el equipo en número impar para que los votos no se empaten"]
    },
    {
      "en": ["Email one local nonprofit resource or accountant to ask for a short advice call","Ask about the legal and tax side before opening anything","Open a dedicated account or sign with a fiscal sponsor — never a personal account","Set the rule in writing: two signers on every payout","Start the ledger with columns for date, amount, purpose, and who approved"],
      "es": ["Escríbele a un contador o a una organización que asesore a grupos y pide una llamada corta","Pregunta por el lado legal y de impuestos antes de abrir nada","Abran una cuenta dedicada o usen un patrocinador fiscal; nunca una cuenta personal","Dejen por escrito la regla: dos firmas para cada pago","Inicia el libro de cuentas con columnas de fecha, monto, propósito y quién aprobó"]
    },
    {
      "en": ["Put a criteria meeting on the team's calendar this week","Draft who's eligible, typical amounts, and how often someone can ask","Set a per-request cap and a monthly total you won't exceed","Cut every proof-of-hardship requirement you can live without","Write the final criteria on one page everyone signs off on"],
      "es": ["Agenda esta semana una reunión del equipo para definir criterios","Redacta un borrador: quién puede pedir, montos típicos y cada cuánto se puede pedir","Fijen un tope por solicitud y un total mensual que no rebasarán","Eliminen todo comprobante de necesidad del que puedan prescindir","Escriban los criterios finales en una página que todo el equipo apruebe"]
    },
    {
      "en": ["Open a blank form and add just three fields: name, contact, what's needed","Add one question: how would you like to receive the money","Delete anything that smells like proof — no ID numbers, no landlord letters","Set up phone and in-person ways to apply alongside the form","Ask one outside person to try it and tell you where it feels intrusive"],
      "es": ["Abre un formulario en blanco y pon solo tres campos: nombre, contacto y qué se necesita","Agrega una pregunta: cómo prefieres recibir el dinero","Borra todo lo que huela a comprobante: ni números de ID ni cartas del arrendador","Habilita también solicitudes por teléfono y en persona, no solo en línea","Pide a alguien de fuera que lo pruebe y te diga dónde se siente invasivo"]
    },
    {
      "en": ["Text five members asking if they'd pledge a small monthly amount","Set up a recurring-donation option before planning any big drive","Write the donor line: money goes straight to neighbors in a crisis","Announce the fund where members already talk and ask people to share it","Note each pledge in the ledger so the team can forecast next month"],
      "es": ["Escríbeles a cinco miembros preguntando si aportarían un monto pequeño mensual","Configura la opción de donación recurrente antes de planear una campaña grande","Escribe la frase para donantes: el dinero va directo a vecinos en crisis","Anuncia el fondo donde la gente ya conversa y pide que lo compartan","Registra cada aporte prometido en el libro de cuentas para prever el próximo mes"]
    },
    {
      "en": ["Message the team a proposed turnaround promise — say, a decision within 48 hours","Set a small amount two stewards can approve same-day, no meeting needed","List the payout methods that land fastest — cash, transfer, direct to the biller","Write the review steps on one page: who reads, who signs, who pays","Log each decision in one line: date, amount, and the two approvers"],
      "es": ["Mándale al equipo una propuesta de plazo: por ejemplo, decidir en 48 horas","Definan un monto pequeño que dos personas aprueben el mismo día, sin reunión","Anoten los pagos más rápidos: efectivo, transferencia o pago directo a la factura","Escriban en una página los pasos: quién revisa, quién firma, quién paga","Registra cada decisión en una línea: fecha, monto y las dos personas que aprobaron"]
    },
    {
      "en": ["Open the ledger and jot this month's three numbers: in, out, neighbors helped","Draft a three-line summary using only numbers — no anecdotes, ever","Read it back checking nothing could identify a recipient","Post it where donors and members already look","Repeat on the same date each month so people learn to expect it"],
      "es": ["Abre el libro de cuentas y apunta las cifras del mes: entradas, salidas, vecinos apoyados","Redacta un resumen de tres líneas solo con números, sin anécdotas, nunca","Reléelo revisando que nada pueda identificar a un beneficiario","Publícalo donde donantes y miembros ya miran","Repítelo el mismo día de cada mes para que la gente aprenda a esperarlo"]
    }
  ],
  "diaper-hygiene-bank": [
    {
      "en": ["Text one person at a clinic, church, or pantry to ask if they have a spare closet","Visit the two most promising spots and check for dampness, pests, and a door that locks","Stand where families would collect and check they're not in view of a waiting room","Get a yes in writing on which shelf or closet is yours and who holds the key"],
      "es": ["Escribe a alguien de una clínica, iglesia o despensa y pregunta si les sobra un clóset","Visita los dos lugares más prometedores y revisa humedad, plagas y una puerta con llave","Párate donde las familias recogerían y confirma que no quedan a la vista de la sala","Consigue por escrito qué clóset o repisa es tuya y quién guarda la llave"]
    },
    {
      "en": ["Search 'diaper bank network' plus your region and jot the nearest member's contact","Email the network or a wholesaler asking about case prices for sizes 4, 5, and 6","List three likely donation-drive hosts — school, gym, workplace — and message one today","Start a one-page tracker: source, what they give, and how steady each has been"],
      "es": ["Busca 'banco de pañales' junto con tu región y anota el contacto del más cercano","Escribe a la red o a un mayorista y pregunta el precio por caja de las tallas 4, 5 y 6","Anota tres posibles sedes de colecta — escuela, gimnasio, trabajo — y escribe a una hoy","Arma una hoja sencilla: fuente, qué aporta y qué tan constante ha sido"]
    },
    {
      "en": ["Grab a marker and label one shelf or bin per diaper size before touching any boxes","Break each case into hand-out bundles as you shelve it, not later at the door","Count what's on each shelf and write totals by size on a clipboard sheet","Circle the two shortest sizes and pass those numbers to whoever handles sourcing"],
      "es": ["Toma un marcador y rotula una repisa o caja por talla antes de mover ninguna caja","Divide cada caja en paquetes listos para entregar mientras acomodas, no en la puerta","Cuenta lo que hay en cada repisa y apunta los totales por talla en una hoja","Encierra las dos tallas más escasas y pásale esas cifras a quien consigue el suministro"]
    },
    {
      "en": ["Call one nearby diaper bank and ask what monthly amount per child they settled on","Draft one sentence: how many per child, how often, and never any proof of need","Read it to two volunteers and one parent and adjust anything that sounds like a test","Post the honest number where families can see it so nobody has to ask"],
      "es": ["Llama a un banco de pañales cercano y pregunta qué cantidad mensual por niño fijaron","Redacta una sola frase: cuántos por niño, cada cuánto, y nunca pedir comprobantes","Léesela a dos voluntarios y a una madre o padre y ajusta lo que suene a examen","Publica la cifra honesta donde las familias la vean, para que nadie tenga que preguntar"]
    },
    {
      "en": ["Ask the host site by text which same day and time works every single month","Message three potential volunteers with the fixed date and ask for a standing yes","Walk volunteers through the one rule: hand the bundle over, ask nothing","Set a phone reminder to confirm helpers two days before each distribution"],
      "es": ["Pregunta por mensaje a la sede qué día y hora fijos les funcionan cada mes","Escribe a tres posibles voluntarios con la fecha fija y pide un sí permanente","Repasa con el equipo la única regla: entregar el paquete sin hacer preguntas","Pon un recordatorio para confirmar a tu gente dos días antes de cada entrega"]
    }
  ],
  "community-bike-workshop": [
    {
      "en": ["Text three people who might lend a garage, basement, or unused corner","Walk each option and measure wall space for hanging bikes vertically","Check the locks and ask the host how the space secures overnight","Settle storage, access hours, and insurance with the host before saying yes"],
      "es": ["Escríbele a tres personas que puedan prestar cochera, sótano o un rincón sin uso","Recorre cada opción y mide la pared para colgar bicis en vertical","Revisa las cerraduras y pregunta cómo queda asegurado el espacio de noche","Antes del sí, acuerda con quien presta almacenamiento, horarios de acceso y seguro"]
    },
    {
      "en": ["Message the group chat asking who has spare bike tools in a drawer","Ask a local bike shop if they'd donate worn tools or sell a used repair stand","List the kit you still lack — tire levers, cone wrenches, cable cutters — and price it","Hang a pegboard and trace each tool's outline so a missing wrench shows at closing"],
      "es": ["Pregunta en el chat del grupo quién tiene herramientas de bici arrumbadas en un cajón","Pregunta en una tienda de bicis si donarían herramientas usadas o venden un caballete","Enlista el kit que falta — desmontables, llaves de conos, cortacables — y cotízalo","Cuelga un panel y traza el contorno de cada herramienta para ver al cierre cuál falta"]
    },
    {
      "en": ["Jot the hard no in your notes app: no rusted big-box bikes","Write a short donation call with the no up front, plus a drop-off day and address","Post it in two neighborhood channels","Triage each arrival on the spot: fixable, for parts, or ready to ride","Strip the for-parts bikes soon and shelve parts by type so they're findable"],
      "es": ["Apunta en tu teléfono el no rotundo: nada de bicis de súper oxidadas","Redacta una convocatoria corta con ese no al inicio, más día y dirección de entrega","Publícala en dos canales del barrio","Clasifica cada bici al llegar: reparable, para refacciones o lista para rodar","Desarma pronto las de refacciones y ordena las piezas por tipo para hallarlas fácil"]
    },
    {
      "en": ["Text the two best bike-fixers you know and ask for one open-hours shift each","Ask each one to walk you through fixing a flat without touching the wheel themselves","Pick the ones who can let a learner fumble — teaching patience is the whole job","Put each mechanic's name on a specific open-hours slot in the calendar"],
      "es": ["Escríbeles a las dos personas que mejor arreglan bicis y pídeles un turno a cada una","Pide a cada una que te guíe a parchar una llanta sin que toque la rueda","Elige a quienes dejan que alguien nuevo batalle: esa paciencia es todo el trabajo","Pon el nombre de cada mecánica o mecánico en un turno concreto del calendario"]
    },
    {
      "en": ["Poll the group chat for the two weekly time slots most people can make","Write the open hours on the door and post them in the same channels every week","Sketch the earn-a-bike deal on one card: sessions attended, skills learned, bike earned","Make a punch card for each learner so any mechanic can read their progress"],
      "es": ["Pregunta en el chat cuáles dos horarios semanales le quedan a más gente","Escribe los horarios en la puerta y publícalos cada semana en los mismos canales","Dibuja el trato de gánate-una-bici en una tarjeta: sesiones, habilidades, bici ganada","Haz una tarjeta perforable por aprendiz para que cualquier mecánico lea su avance"]
    },
    {
      "en": ["Put a first-aid kit and two pairs of safety glasses in a bag for the workshop","Write the tool rules on one poster: glasses on, long hair tied, ask before power tools","Make a checkout card with a signed line for brakes, tires, and headset on every bike","Ask someone other than the builder to sign that final safety check"],
      "es": ["Mete en una bolsa un botiquín y dos pares de lentes de seguridad para el taller","Escribe las reglas en un cartel: lentes, pelo recogido, preguntar antes del taladro","Haz una tarjeta de salida con firma para frenos, llantas y dirección de cada bici","Pide que esa revisión final la firme alguien distinto de quien armó la bici"]
    }
  ],
  "newcomer-translation-network": [
    {
      "en": ["Text two bilingual people you know and ask if they'd help interpret sometimes","Write down the three languages you hear most at local schools and shops","Ask one ESL teacher or congregation leader to pass your ask along","Have each candidate relay a medical sentence both directions before counting them","Log each yes with language, dialect, and availability in one place"],
      "es": ["Escríbeles a dos personas bilingües y pregúntales si ayudarían a interpretar","Anota los tres idiomas que más escuchas en las escuelas y tiendas de tu zona","Pide a una maestra de ESL o líder de congregación que corra la voz","Pide a cada persona que interprete una frase médica ida y vuelta antes de sumarla","Registra cada sí con idioma, dialecto y disponibilidad en un solo lugar"]
    },
    {
      "en": ["Open a note and list the five services you already know by name","Call one clinic today and ask which languages they actually staff","Note for every listing whether they ask for ID or immigration status","Ask one immigrant-serving org which places they trust and which to skip","Put addresses, hours, and a contact name for each into one shared directory"],
      "es": ["Abre una nota y apunta los cinco servicios que ya conoces por nombre","Llama hoy a una clínica y pregunta qué idiomas atienden de verdad","Anota en cada entrada si piden identificación o estatus migratorio","Pregunta a una organización de personas migrantes qué lugares recomienda y cuáles no","Reúne direcciones, horarios y un contacto de cada lugar en un solo directorio"]
    },
    {
      "en": ["Message one volunteer to ask if they'd take intake calls for a trial month","Set up a single phone line or form where every request lands","Keep the intake sheet to first name, language, need, and a callback number","Match each request by language and need, then confirm with both sides","Run one practice request from a friend through the whole flow"],
      "es": ["Escríbele a una persona voluntaria y pregúntale si tomaría llamadas un mes de prueba","Prepara una sola línea telefónica o formulario donde caigan todas las solicitudes","Limita la ficha a nombre de pila, idioma, necesidad y un número para devolver la llamada","Empareja cada solicitud por idioma y necesidad, y confirma con ambas partes","Pide a un amigo hacer una solicitud de prueba y síguela por todo el flujo"]
    },
    {
      "en": ["Write down the five questions newcomers ask you most often","Draft one plain-language page on the top topic, pictures over paragraphs","Have a native speaker from each community read the draft aloud before printing","Print a small first batch, hand it out, and fix whatever confuses people"],
      "es": ["Apunta las cinco preguntas que más te hacen las personas recién llegadas","Redacta una página en lenguaje sencillo del tema principal, con más imágenes que texto","Haz que alguien nativo de cada comunidad lea el borrador en voz alta antes de imprimir","Imprime un primer lote pequeño, repártelo y corrige lo que confunda"]
    },
    {
      "en": ["Ask one newcomer with an upcoming appointment if they'd like company","Match a volunteer by language and confirm time and meeting spot with both","Brief the volunteer: interpret in first person, add nothing, give no advice","Check in with both afterward and note what to do differently next time"],
      "es": ["Pregúntale a una persona recién llegada con cita próxima si quiere compañía","Empareja por idioma y confirma hora y punto de encuentro con ambas partes","Prepara a la persona voluntaria: interpretar en primera persona, sin agregar ni aconsejar","Haz seguimiento con ambas partes y anota qué harías distinto la próxima vez"]
    },
    {
      "en": ["Write one line at the top of your intake sheet: never ask immigration status","Cross out every form field you could do the work without","Decide how long records live and calendar the day you delete them","Script your answer to a records request: what you keep, what you never collect","Walk every volunteer through the rules before their first request"],
      "es": ["Escribe una línea arriba de la ficha: nunca se pregunta el estatus migratorio","Tacha del formulario cada campo sin el cual podrías trabajar igual","Decide cuánto tiempo viven los registros y agenda el día en que los borras","Escribe tu respuesta a una solicitud de expedientes: qué guardas y qué nunca recopilas","Repasa las reglas con cada persona voluntaria antes de su primera solicitud"]
    }
  ],
  "community-meal": [
    {
      "en": ["List three halls with kitchens: a church, a community center, a school","Call or message one to ask for a walk-through","On the visit, check for a separate hand-wash sink, hot water, and fridge space","Confirm the hall is free on the days you're planning","Get the okay in writing, even a short email"],
      "es": ["Apunta tres salones con cocina: una iglesia, un centro comunitario, una escuela","Llama o escribe a uno para pedir una visita","En la visita revisa lavamanos aparte, agua caliente y espacio de refrigerador","Confirma que el salón esté libre los días que planeas","Consigue el sí por escrito, aunque sea un correo corto"]
    },
    {
      "en": ["Look up your local health department's number and note it","Call and ask specifically about charitable-meal exemptions","Sign up now for the food-handler class — it books out weeks ahead","Write the temperature and storage rules where every cook will see them"],
      "es": ["Busca el teléfono de la autoridad sanitaria local y anótalo","Llama y pregunta específicamente por exenciones para comidas benéficas","Inscríbete ya al curso de manejo de alimentos: se llena con semanas de anticipación","Escribe las reglas de temperatura y almacenamiento donde todo el equipo las vea"]
    },
    {
      "en": ["Text one grocer or restaurant you know and ask about donating","Visit two more suppliers in person during a quiet hour","Pin each donor to a specific day and amount, not \"whatever's left\"","Ask the community garden or gleaning crew what surplus they can send","Keep one list of who gives what and when, and update it after every meal"],
      "es": ["Escríbele a una tienda o restaurante que conozcas y pregunta si donarían","Visita a dos proveedores más en persona a una hora tranquila","Compromete a cada donante con un día y una cantidad concretos, no \"lo que sobre\"","Pregunta a la huerta comunitaria o al grupo de recolección qué excedente pueden mandar","Lleva una sola lista de quién da qué y cuándo, y actualízala tras cada comida"]
    },
    {
      "en": ["Check your supply list and jot what next week's donations actually include","Pick one main that's naturally vegetarian and nut- and shellfish-free","Scale the recipe on paper and list quantities to buy or request","Write allergen labels for every dish before cooking day"],
      "es": ["Revisa tu lista de fuentes y anota qué incluye de verdad la donación de la semana","Elige un plato principal naturalmente vegetariano, sin frutos secos ni mariscos","Escala la receta en papel y lista las cantidades por comprar o pedir","Escribe las etiquetas de alérgenos de cada platillo antes del día de cocina"]
    },
    {
      "en": ["Message five people and ask each for one specific job: prep, cook, serve, or cleanup","Add two extra names to each shift beyond what it strictly needs","Name a lead cook for the first meal and a second lead to cross-train from week one","Share the roster and confirm everyone two days before the meal"],
      "es": ["Escribe a cinco personas y pide a cada una un rol: preparar, cocinar, servir o limpiar","Suma a cada turno dos personas más de las que estrictamente necesita","Nombra a quien lidere la primera cocina y a una segunda persona para formarse desde ya","Comparte la lista y confirma con todos dos días antes de la comida"]
    },
    {
      "en": ["Message three people who'd come to eat and ask which day and time works","Pick a day and time you can hold for a year, not the most ambitious one","Make one warm, simple flyer: day, time, place, free, everyone welcome","Drop flyers at shelters, laundromats, and corner stores","Ask hosts and partners to spread it by word of mouth"],
      "es": ["Pregúntales a tres personas que vendrían a comer qué día y hora les sirve de verdad","Elige un día y hora que puedan sostener un año, no los más ambiciosos","Haz un volante cálido y simple: día, hora, lugar, gratis, todo el mundo bienvenido","Deja volantes en albergues, lavanderías y tiendas de la esquina","Pide a anfitriones y aliados que corran la voz"]
    },
    {
      "en": ["Text the crew the day before to confirm shifts and arrival times","Post the day's run sheet in the kitchen: who preps, cooks, serves, cleans","Serve at tables where possible instead of a line","Move leftovers into shallow pans and the fridge within two hours of serving","Leave the kitchen inspection-clean and note anything running low"],
      "es": ["Escríbele al equipo el día anterior para confirmar turnos y horas de llegada","Pega en la cocina el plan del día: quién prepara, cocina, sirve y limpia","Sirve en mesas donde se pueda, en vez de formar una fila","Pasa las sobras a recipientes bajos y al refri antes de dos horas de servidas","Deja la cocina lista para inspección y anota lo que se esté acabando"]
    }
  ],
  "seed-library": [
    {
      "en": ["Look up the library's front-desk email or phone and note the branch manager's name","Send one message asking if they'd host a small seed cabinet or drawer set","Visit and pick a spot away from windows, exterior walls, and heat vents","Bring a box of small envelopes and a marker to leave with the cabinet"],
      "es": ["Busca el correo o teléfono de la biblioteca y anota el nombre de quien la dirige","Envía un mensaje preguntando si recibirían un pequeño mueble de semillas","Visita el lugar y elige un rincón lejos de ventanas, muros exteriores y calefacción","Lleva una caja de sobres pequeños y un marcador para dejarlos junto al mueble"]
    },
    {
      "en": ["Text one experienced gardener to ask which varieties actually grow well here","Email a nearby nursery and a community garden asking for end-of-season surplus","Post one ask for seed donations where members already look","Sort donations as they arrive, setting aside coated treated seed and patented hybrids"],
      "es": ["Escríbele a un jardinero con experiencia y pregúntale qué variedades se dan bien aquí","Escribe a un vivero cercano y a un huerto comunitario pidiendo sobrantes de temporada","Publica una sola petición de semillas donde la gente del grupo ya mira","Revisa lo donado al llegar y aparta la semilla tratada de colores y los híbridos"]
    },
    {
      "en": ["Grab the donation box and sort packets into vegetable, herb, and flower piles","Write the plant name and year, big, on every envelope","Mark beginner-friendly varieties with one color so first-timers can self-serve","Shelve each section with the oldest seed at the front","Add a short growing note to the trickier varieties"],
      "es": ["Toma la caja de donaciones y separa los sobres en verduras, hierbas y flores","Escribe en grande el nombre de la planta y el año en cada sobre","Marca con un color las variedades fáciles para que un principiante se sirva solo","Acomoda cada sección con la semilla más vieja al frente","Agrega una nota breve de cultivo a las variedades más exigentes"]
    },
    {
      "en": ["Open a blank page and write the three rules: take free, grow, return if you can","Add a per-person cap of a couple packets per variety","Phrase returns as a welcome gift, never an obligation","Print the one-pager and tape it inside the cabinet door"],
      "es": ["Abre una hoja y escribe las tres reglas: toma gratis, cultiva, devuelve si puedes","Agrega un límite de un par de sobres por variedad por persona","Redacta la devolución como un regalo bienvenido, nunca como una obligación","Imprime la hoja y pégala por dentro de la puerta del mueble"]
    },
    {
      "en": ["Pick a day this week to visit the cabinet and put it in your calendar","Pull every envelope more than two years old","Test doubtful batches: ten seeds in a damp paper towel for a week","Pull any batch where fewer than six sprout","List the three emptiest varieties and message donors for refills"],
      "es": ["Elige un día de esta semana para visitar el mueble y anótalo en tu calendario","Saca todos los sobres con más de dos años","Prueba los lotes dudosos: diez semillas en una toalla de papel húmeda por una semana","Retira cualquier lote donde broten menos de seis","Anota las tres variedades más vacías y escribe a quienes donan para reponerlas"]
    }
  ],
  "digital-literacy": [
    {
      "en": ["Post one ask for unused laptops and tablets in a group chat you're already in","At pickup, watch the donor sign out of iCloud or Google before the device leaves","Set one box for 'works' and one for 'parts' and sort each device as it arrives","Wipe, update, and test one device end to end before batching the rest"],
      "es": ["Publica una petición de laptops y tabletas sin uso en un chat grupal que ya tengas","Al recoger, mira que quien dona cierre su cuenta de iCloud o Google antes de entregar","Pon una caja de 'funciona' y otra de 'piezas' y clasifica cada equipo al llegar","Borra, actualiza y prueba un equipo de principio a fin antes de seguir con el resto"]
    },
    {
      "en": ["Open a blank sheet and type five columns: who, device, serial, condition, due date","Number each device and its charger as one set with matching stickers","Write the loan length and a no-shame late policy in two sentences","Run one pretend checkout with a volunteer to catch what the form misses"],
      "es": ["Abre una hoja en blanco y escribe cinco columnas: quién, equipo, serie, estado, fecha","Numera cada equipo y su cargador como un solo juego con etiquetas iguales","Escribe en dos frases el plazo del préstamo y una política de retraso sin regaños","Haz un préstamo de prueba con alguien del equipo para ver qué le falta al formato"]
    },
    {
      "en": ["Look up your library's hotspot lending page and note what they offer","Call two carriers or a low-cost program and ask the real data cap on each plan","Print a half-page list of free WiFi spots near where borrowers live","Test one hotspot with a ten-minute video call before it goes out the door"],
      "es": ["Busca la página de préstamo de puntos de acceso de tu biblioteca y anota qué ofrecen","Llama a dos compañías o a un programa de bajo costo y pregunta el límite real de datos","Imprime media hoja con los puntos de WiFi gratis cerca de donde vive la gente","Prueba un punto de acceso con una videollamada de diez minutos antes de prestarlo"]
    },
    {
      "en": ["Message two patient friends and ask if they'd sit with a beginner once a month","Write your three tutor rules on a card: learner drives, no jargon, hands off the mouse","Run the role-play: each tutor guides someone through a task without touching the device","Pair every new tutor with a real learner and sit in on the first session"],
      "es": ["Escribe a dos amistades pacientes y pregunta si acompañarían a un principiante al mes","Anota tres reglas en una tarjeta: quien aprende maneja, sin jerga, sin tocar el mouse","Haz el juego de roles: cada tutor guía una tarea completa sin tocar el equipo","Empareja a cada tutor nuevo con un aprendiz real y acompaña la primera sesión"]
    },
    {
      "en": ["Text one future learner and ask the single thing they most want to do online","Pick the top four topics and give each its own page — one skill per page","Screenshot the exact screens learners will see and paste them in big","Hand a draft page to one learner and watch where their finger hesitates"],
      "es": ["Escribe a un futuro aprendiz y pregúntale qué es lo que más quiere hacer en línea","Elige los cuatro temas principales y dale a cada uno su página — una habilidad por hoja","Captura las pantallas exactas que van a ver y pégalas en grande en cada página","Dale un borrador a un aprendiz y observa dónde duda su dedo"]
    },
    {
      "en": ["Ask the host space by text for two weekly slots: one daytime, one evening","Cap sign-ups at six per class so nobody waits silent in the back","Recruit a second helper to float during drop-in hours for the thorny problems","Put the schedule on paper flyers in the places your learners already go"],
      "es": ["Pide por mensaje al espacio anfitrión dos horarios semanales: uno de día, otro de noche","Limita la inscripción a seis por clase para que nadie espere callado al fondo","Consigue a una segunda persona que circule en las horas abiertas para los casos difíciles","Pon el horario en volantes de papel en los lugares donde ya va tu gente"]
    },
    {
      "en": ["Look up the factory-reset steps for your two most common device models","Tape a checklist at the return desk: save the borrower's photos first, then wipe","Write a one-paragraph plan for lost or damaged devices that keeps the door open","Add a five-minute passwords-and-privacy chat to every device handoff"],
      "es": ["Busca los pasos de restablecimiento de fábrica de tus dos modelos más comunes","Pega una lista en la mesa de devolución: guarda primero las fotos, luego borra todo","Escribe en un párrafo qué pasa si un equipo se pierde o se daña, sin cerrar la puerta","Suma una charla de cinco minutos sobre contraseñas y privacidad a cada entrega"]
    }
  ],
  "weatherization-brigade": [
    {
      "en": ["Text the three handiest people you know and ask for one work day a month","Post the ask on the hardware store and lumber yard bulletin boards","Ask each volunteer what jobs they've actually done, not what they could do","Pair every newcomer with an experienced lead on a low-stakes first job"],
      "es": ["Escríbeles a las tres personas más hábiles con las manos y pídeles un día al mes","Publica el aviso en los tableros de la ferretería y la maderería","Pregunta a cada quien qué trabajos ha hecho de verdad, no cuáles podría hacer","Empareja a cada persona nueva con alguien con experiencia en un trabajo sencillo"]
    },
    {
      "en": ["Invite your two most experienced leads to a one-hour scope talk","List the jobs you'll take: caulking, weather-stripping, grab bars, minor fixes","Write the stop-and-refer list: electrical, gas, roofing, structural","Add lead paint and old insulation to that list for pre-1978 homes","Print the two lists on one page for every crew member"],
      "es": ["Invita a tus dos líderes con más experiencia a una charla de una hora sobre el alcance","Anota los trabajos que sí tomarán: sellado, burletes, barras de apoyo, arreglos menores","Escribe la lista de detenerse y derivar: electricidad, gas, techos, estructura","Suma la pintura con plomo y el aislamiento viejo para casas anteriores a 1978","Imprime ambas listas en una hoja para cada integrante de la cuadrilla"]
    },
    {
      "en": ["Pick the phone number that will take requests and text the crew to confirm","Make a paper request form and leave copies at the pantry and senior center","Draft a one-page visit checklist: job scope, materials, safety limits","Book assessments in pairs — two people walk through every home","Photograph everything on the visit and say you'll confirm the plan later"],
      "es": ["Elige el número de teléfono que recibirá los pedidos y confírmalo con la cuadrilla","Haz un formulario en papel y deja copias en la despensa y el centro de adultos mayores","Redacta una lista de visita de una página: alcance, materiales y límites de seguridad","Agenda las evaluaciones en pares: dos personas recorren cada casa","Fotografía todo en la visita y di que confirmarás el plan después, no en la puerta"]
    },
    {
      "en": ["Pull the material list from your latest assessment and add up quantities","Ask the hardware store manager for a discount or donation for the brigade","Buy low-odor, low-VOC caulk and products for occupied homes","Label a shared tool bin and list what's inside on the lid"],
      "es": ["Toma la lista de materiales de la última evaluación y suma cantidades","Pide a la ferretería un descuento o donación para la cuadrilla","Compra selladores de bajo olor y bajo COV para casas habitadas","Rotula una caja de herramientas compartida y anota su contenido en la tapa"]
    },
    {
      "en": ["Email your insurer or a local nonprofit asking about volunteer repair coverage","Get written confirmation that the policy names volunteer home repair","Draft a simple waiver and print copies for every homeowner and volunteer","Buy or check first-aid kits and set a ladder rule: feet held, never top rungs"],
      "es": ["Escríbele a la aseguradora o a una ONG local por la cobertura de reparaciones voluntarias","Consigue por escrito que la póliza cubra la reparación domiciliaria voluntaria","Redacta una exención sencilla e imprime copias para cada residente y voluntaria","Revisa el botiquín y fija la regla de escaleras: alguien sostiene, nunca el último peldaño"]
    },
    {
      "en": ["Pick one Saturday and match two or three assessed jobs to crews","Call each homeowner the week before to agree on the plan and arrival time","Call again the morning of, so no one is startled by the crew","Pack water, trash bags, and cleanup gear so the visit costs the home nothing","Walk the finished work with the resident before the crew leaves"],
      "es": ["Elige un sábado y asigna dos o tres trabajos ya evaluados a las cuadrillas","Llama a cada residente la semana anterior para acordar el plan y la hora de llegada","Vuelve a llamar la misma mañana, para que nadie se sorprenda con la cuadrilla","Lleva agua, bolsas de basura y material de limpieza para no generarle gastos a la casa","Recorre el trabajo terminado con la persona residente antes de irse"]
    }
  ],
  "pet-food-bank": [
    {
      "en": ["Text the food pantry coordinator about sharing their space and distribution day","Walk the space and check it's dry, pest-free, and lockable","Price sealed bins and a shelf or pallet to keep food off the floor","Confirm the handout spot and hours with whoever hosts you"],
      "es": ["Escríbele a quien coordina la despensa y pregunta si comparten espacio y día de entrega","Recorre el lugar y revisa que sea seco, sin plagas y con llave","Cotiza recipientes sellados y una tarima o repisa para elevar el alimento del piso","Confirma el punto de entrega y los horarios con quien te presta el espacio"]
    },
    {
      "en": ["Call one pet store and ask what they do with torn or damaged bags","Send a short donation ask to two more stores and a vet clinic","Set a monthly pickup day with everyone who says yes","Start a simple log of what comes in each week so you can spot gaps"],
      "es": ["Llama a una tienda de mascotas y pregunta qué hacen con las bolsas rotas o dañadas","Manda una solicitud breve de donación a dos tiendas más y a una veterinaria","Fija un día de recolección mensual con quienes digan que sí","Lleva un registro sencillo de lo que entra cada semana para detectar huecos"]
    },
    {
      "en": ["Grab a marker and label three bins: dog, cat, other","Check every bag's expiration date and pull anything past it","Set prescription and vet diets apart in their own labeled bin","Count each bin and post the totals where the team can see them"],
      "es": ["Toma un marcador y rotula tres recipientes: perro, gato, otros","Revisa la fecha de caducidad de cada bolsa y retira lo vencido","Aparta las dietas veterinarias o de prescripción en su propio recipiente rotulado","Cuenta cada recipiente y pon los totales donde el equipo los vea"]
    },
    {
      "en": ["Text one pet-owning friend and ask how much food their animals go through in a month","Set portions by animal count and size, not one flat bag per household","Fix a frequency people can plan around — same amount, same schedule","Write the policy in one paragraph with no proof-of-need requirement"],
      "es": ["Escríbele a un amigo con mascotas y pregúntale cuánta comida gastan sus animales al mes","Define porciones según número y tamaño de animales, no una bolsa igual para todos","Fija una frecuencia con la que la gente pueda contar: misma cantidad, mismo calendario","Escribe la política en un párrafo, sin exigir pruebas de necesidad"]
    },
    {
      "en": ["Message two volunteers and ask which recurring day they could staff","Set the same day and time each month so owners can count on you","Check before each session that both dog and cat food are on the table","Brief the crew: no comments on anyone's choices — just hand over the food"],
      "es": ["Escríbeles a dos personas voluntarias y pregunta qué día recurrente pueden cubrir","Fija el mismo día y hora cada mes para que la gente pueda contar contigo","Antes de cada sesión, revisa que haya comida de perro y de gato en la mesa","Acuerda con el equipo: nada de juicios, solo entregar la comida con respeto"]
    }
  ],
  "youth-mentorship": [
    {
      "en": ["Email the school, library, and community center asking about an after-school room","Visit the top option and check exits, bathrooms, and space to move","Ask for the same room for the whole term in writing, not month to month","Set the weekly hours and share them with families before opening"],
      "es": ["Escribe a la escuela, la biblioteca y el centro comunitario preguntando por un salón","Visita la mejor opción y revisa salidas, baños y espacio para moverse","Pide por escrito el mismo salón para todo el ciclo, no mes a mes","Define el horario semanal y compártelo con las familias antes de abrir"]
    },
    {
      "en": ["Download a sample youth-protection policy from an established program","Write the background-check requirement: no adult starts before clearing it","Spell out the two-adult rule to cover bathrooms, rides home, and tutoring","Look up your mandatory-reporting law and write the reporting steps in","Have every adult sign the policy before their first session"],
      "es": ["Descarga como modelo una política de protección infantil de un programa establecido","Escribe el requisito de verificación de antecedentes: nadie empieza sin aprobarla","Detalla la regla de dos adultos para baños, traslados a casa y tutoría individual","Busca la ley local de denuncia obligatoria y anota los pasos a seguir","Haz que cada adulto firme la política antes de su primera sesión"]
    },
    {
      "en": ["Ask two trusted community groups to each suggest one reliable adult","In each interview, ask directly: can you commit every week, all term","Start background checks the day someone says yes","Run a training on boundaries, safety rules, and helping without doing the work"],
      "es": ["Pide a dos grupos comunitarios de confianza que cada uno sugiera a un adulto confiable","En cada entrevista pregunta directo: ¿puedes venir cada semana, todo el ciclo?","Inicia la verificación de antecedentes el mismo día que alguien diga que sí","Da una capacitación sobre límites, seguridad y ayudar sin hacerles la tarea"]
    },
    {
      "en": ["Ask three kids what they'd actually want to do after school","Sketch the fixed rhythm on one page: snack, then homework, then activity","Plan the first two weeks of activities, borrowing ideas the kids named","Leave one slot a week the youth themselves get to program"],
      "es": ["Pregúntales a tres chicos qué les gustaría hacer de verdad después de clases","Dibuja el ritmo fijo en una hoja: merienda, luego tareas, luego actividad","Planea las primeras dos semanas con las ideas que los chicos nombraron","Deja un espacio a la semana que los propios jóvenes programen"]
    },
    {
      "en": ["List on your phone what the form needs: permission, allergies, contacts, pickup","Draft the one-page enrollment form from that list","Hand it to families in person and help anyone fill it out on the spot","Post severe allergies where staff see them at snack time, not in a binder","Confirm who may pick up each child, then lock the forms away"],
      "es": ["Anota en el teléfono qué pedirá el formulario: permiso, alergias, contactos, quién recoge","Redacta el formulario de inscripción de una página a partir de esa lista","Entrégalo a las familias en persona y ayuda a llenarlo ahí mismo","Pon las alergias graves a la vista del equipo a la hora de la merienda, no archivadas","Confirma quién puede recoger a cada niño y guarda los formularios bajo llave"]
    },
    {
      "en": ["Text one grocery store or bakery asking about a weekly snack donation","Write the shopping list nut-free by default","Label anything donated whose ingredients you can't vouch for","Put out a call for books, art supplies, and games in the community chat"],
      "es": ["Manda un mensaje a una tienda o panadería sobre una donación semanal de merienda","Arma la lista de compras sin frutos secos como regla general","Etiqueta cualquier donación cuyos ingredientes no puedas garantizar","Publica en el chat comunitario un pedido de libros, material de arte y juegos"]
    },
    {
      "en": ["Set a phone alarm so you arrive before the first kid does","Set out the sign-in sheet and snack before doors open","Count heads at arrival and again before anyone leaves; note who picked up whom","Say one specific good thing to a parent at pickup","Jot two lines after closing: what worked, which kid needs a check-in"],
      "es": ["Pon una alarma para llegar antes que el primer niño","Prepara la hoja de asistencia y la merienda antes de abrir","Cuenta cabezas al llegar y antes de que alguien se vaya; anota quién recogió a quién","Dile algo bueno y concreto a mamá o papá cuando pasen a recoger","Apunta dos líneas al cerrar: qué funcionó y qué niño necesita seguimiento"]
    }
  ],
  "gleaning-network": [
    {
      "en": ["List five nearby sources from memory: farms, orchards, vendors, loaded fruit trees","Visit or call the two most likely and ask what surplus goes unpicked","Ask each grower what NOT to touch and where crews may park and walk","Note each yes with crop, rough timing, and a contact number"],
      "es": ["Anota de memoria cinco fuentes cercanas: fincas, huertas, puestos, árboles cargados","Visita o llama a las dos más probables y pregunta qué excedente se queda sin cosechar","Pregunta a cada productor qué NO tocar y por dónde puede estacionar y caminar el equipo","Apunta cada sí con cultivo, temporada aproximada y un teléfono de contacto"]
    },
    {
      "en": ["Ask your group chat who could drop everything for a weekday-morning harvest","Ask each yes for their real availability, not their good intentions","Keep a list of firm yeses with numbers — three reliable beats ten maybes","Run one practice call-up and see who actually answers within the hour"],
      "es": ["Pregunta en tu chat quién podría soltarlo todo para cosechar una mañana entre semana","Pide a cada sí su disponibilidad real, no sus buenas intenciones","Lleva la lista de síes firmes con teléfono: tres confiables valen más que diez quizás","Haz un simulacro de convocatoria y mira quién contesta dentro de la hora"]
    },
    {
      "en": ["Text two friends with trucks or hatchbacks and ask about weekday availability","Ask a church, restaurant, or grocer for a cool corner to hold food a day at a time","Collect more crates than you think you need — one tree can yield hundreds of pounds","Write the plan on one card: who drives, where food waits, who moves it on"],
      "es": ["Escríbele a dos amistades con camioneta o auto amplio y pregunta por días entre semana","Pide a una iglesia, restaurante o tiendita un rincón fresco para guardar por un día","Junta más cajas de las que crees necesitar: un solo árbol puede dar cientos de kilos","Escribe el plan en una tarjeta: quién maneja, dónde espera la comida, quién la reparte"]
    },
    {
      "en": ["Create the dispatch group chat now and add your confirmed crew","Write a template alert: crop, address, time window, what to bring","Agree that only written yeses count as coming — a reply, not a thumbs-up","Send one test alert and time how fast three people confirm"],
      "es": ["Crea ahora mismo el chat de convocatoria y agrega a tu equipo confirmado","Redacta un mensaje modelo: cultivo, dirección, horario y qué traer","Acuerden que solo cuentan los síes escritos: una respuesta, no un pulgar arriba","Manda una alerta de prueba y mide cuánto tardan tres personas en confirmar"]
    },
    {
      "en": ["Look up your area's Good Samaritan food-donation law","Borrow a waiver template from an established gleaning group","Write the no-go list with growers: nothing off the ground for greens, no rot mixed in","Print waivers and handling rules for the glean-day folder"],
      "es": ["Busca la ley del buen samaritano sobre donación de alimentos en tu región","Pide prestada una plantilla de exención a una red de rescate ya establecida","Escribe con los productores la lista prohibida: nada del suelo para hojas, nada podrido","Imprime exenciones y reglas de manejo para la carpeta del día de cosecha"]
    },
    {
      "en": ["Text one fridge, pantry, or meal program and ask what produce they can actually move","Ask each outlet its capacity and drop-off hours, and write both down","Match big crops to big outlets — a small pantry can't move 200 pounds of peaches","Confirm a named person at each outlet who answers on harvest day"],
      "es": ["Escríbele a una nevera, despensa o comedor y pregunta qué producto mueven de verdad","Pregunta a cada destino su capacidad y horario de entrega, y anota ambos","Empareja cosechas grandes con destinos grandes: una despensa chica no absorbe 90 kilos","Confirma en cada destino una persona con nombre que conteste el día de cosecha"]
    },
    {
      "en": ["Put a bathroom scale or hanging scale in the glean-day kit tonight","Walk the site with the grower first and flag what's off-limits","Weigh the haul at the field before splitting it — you can't reconstruct it later","Deliver within hours and text each grower their poundage with a thank-you"],
      "es": ["Mete hoy mismo una báscula de baño o de gancho al kit del día de cosecha","Recorre el sitio con el productor primero y marca lo que queda fuera de límites","Pesa la cosecha en el campo antes de repartirla: después es imposible reconstruirlo","Entrega en pocas horas y mándale a cada productor su peso con un agradecimiento"]
    }
  ],
  "community-mediation": [
    {
      "en": ["Look up the nearest community mediation center and note their contact","Call and ask about training options or partnering","Write a short list of calm, fair-minded people you'd trust with a dispute","Ask each in person; look for people who stay neutral even when they privately disagree","Book the training dates and confirm who's committed"],
      "es": ["Busca el centro de mediación comunitaria más cercano y anota su contacto","Llama y pregunta por opciones de formación o de alianza","Escribe una lista corta de personas serenas y justas a quienes confiarías una disputa","Invítalas en persona; busca a quien se mantenga neutral aunque no esté de acuerdo","Reserva las fechas de formación y confirma quiénes se comprometen"]
    },
    {
      "en": ["Jot down two options for the single contact point: a shared email or a voicemail number","Set up the one you pick and send yourself a test message","Draft five intake questions, including one that surfaces fear or a power imbalance","Write \"each side separately, never together\" at the top of the intake sheet","Decide who takes intake calls and how fast you reply"],
      "es": ["Anota dos opciones de punto único de contacto: un correo compartido o un buzón de voz","Configura la que elijas y mándate un mensaje de prueba","Redacta cinco preguntas de admisión, una que deje ver miedo o desequilibrio de poder","Escribe al inicio de la hoja de admisión: \"cada parte por separado, nunca juntas\"","Decide quién atiende las llamadas de admisión y en cuánto tiempo responde"]
    },
    {
      "en": ["Email the library about booking a quiet meeting room","Visit and check for two exits and nowhere for one side's friends to linger","Confirm it sits on neither party's turf — not one side's church or building","Get a second option booked so scheduling never forces a bad room"],
      "es": ["Escribe a la biblioteca para preguntar por una sala de reuniones tranquila","Visítala y revisa que tenga dos salidas y que nadie pueda quedarse rondando afuera","Confirma que sea terreno de nadie: ni la iglesia ni el edificio de una de las partes","Deja apalabrada una segunda opción para que la agenda nunca obligue a una mala sala"]
    },
    {
      "en": ["Write one sentence in your notes: what we take, what we refer out","List the disputes you'll take: noise, shared spaces, minor neighbor conflicts","Name what you won't touch: anything involving violence, abuse, or danger","Build the referral list now: DV hotline, tenant lawyer, crisis line","Share the written scope with every mediator and intake volunteer"],
      "es": ["Escribe una frase en tus notas: qué casos tomamos y cuáles derivamos","Lista las disputas que sí tomarán: ruido, espacios compartidos, conflictos menores","Nombra lo que no tocarán: cualquier situación con violencia, abuso o peligro","Arma ya la lista de derivaciones: línea de violencia, abogado de inquilinos, crisis","Comparte el alcance escrito con todo el equipo de mediación y admisión"]
    },
    {
      "en": ["Draft the ground rules as five plain lines in your notes app","Decide now what you'd do if someone discloses a threat or child abuse mid-session","Word the confidentiality promise with that limit, so you never overpromise","Format it as a one-page handout participants read before starting"],
      "es": ["Escribe las reglas básicas como cinco líneas simples en tus notas","Acuerda con el equipo qué harán si alguien revela una amenaza o abuso infantil en sesión","Redacta la promesa de confidencialidad con ese límite, para nunca prometer de más","Dale forma de hoja de una página que las partes lean antes de empezar"]
    },
    {
      "en": ["Text one property manager you know that free neighbor mediation now exists","List where disputes surface — HOA boards, managers, housing office — and visit each","Make a small flyer that says free, voluntary, and confidential","Ask partner orgs to hand your contact to both sides of a brewing conflict"],
      "es": ["Escribe a un administrador de edificio que conozcas: ya hay mediación vecinal gratuita","Lista dónde surgen los conflictos —juntas, administradores, vivienda— y visítalos","Haz un volante pequeño que diga gratuito, voluntario y confidencial","Pide a organizaciones aliadas pasar tu contacto a ambas partes de un conflicto que asoma"]
    },
    {
      "en": ["Open a note with three tallies: taken, referred out, resolved — never names","Update it right after each case closes","Debrief after every hard case, not just once a month","Rotate cases so nobody carries the heavy ones back to back","Book a standing monthly check-in with each mediator, even when things seem fine"],
      "es": ["Abre una nota con tres conteos: tomados, derivados y resueltos, nunca nombres","Actualízala justo después de cerrar cada caso","Haz una revisión con el equipo tras cada caso difícil, no solo una vez al mes","Rota los casos para que nadie cargue los pesados uno tras otro","Agenda una charla mensual fija con cada mediador, aunque todo parezca en orden"]
    }
  ],
  "reentry-support": [
    {
      "en": ["List five services you already know: ID help, shelter, benefits office","Call each one to confirm it still exists and still takes people with records","Write down a named contact at each place, not just the front-desk number","Ask a reentry org which fair-chance employers and landlords actually deliver","Add a \"last verified\" date to every line of the directory"],
      "es": ["Apunta cinco servicios que ya conozcas: identificación, albergue, beneficios","Llama a cada uno para confirmar que sigue activo y acepta a personas con antecedentes","Anota un contacto con nombre en cada lugar, no solo el número de recepción","Pregunta a una organización de reingreso qué empleadores de segunda oportunidad cumplen","Agrega una fecha de \"verificado por última vez\" a cada línea del directorio"]
    },
    {
      "en": ["Message two steady, nonjudgmental people you'd trust with a hard story","In each conversation, listen for fixers — you want partners, not saviors","Ask a local reentry org to run one trauma-informed training for your crew","Walk every volunteer through confidentiality before they meet anyone"],
      "es": ["Escríbeles a dos personas constantes y sin prejuicios a quienes confiarías algo difícil","En cada charla, fíjate si alguien llega de rescatista: buscas acompañantes, no salvadores","Pide a una organización de reingreso que dé una capacitación informada en trauma","Repasa la confidencialidad con cada persona voluntaria antes del primer encuentro"]
    },
    {
      "en": ["Write your opening question on a card: \"What do you need most right now?\"","Keep the form to one page — name, top three needs, best way to reach them","Practice the conversation once with a volunteer playing the other side","Agree the record never comes up unless the person raises it themselves"],
      "es": ["Escribe tu pregunta inicial en una tarjeta: \"¿Qué necesitas más ahora mismo?\"","Limita el formulario a una página: nombre, tres necesidades y un medio de contacto","Ensaya la conversación una vez con una persona voluntaria en el otro papel","Acuerda con el equipo que los antecedentes no se tocan salvo que la persona los mencione"]
    },
    {
      "en": ["Call one partner org and ask if they'll receive mail for people you support","Write the order on paper: mailing address, birth certificate, ID, then benefits","Gather your county's actual forms and fee amounts into one folder","Sit with each person through the first application instead of handing it over"],
      "es": ["Llama a una organización aliada y pregunta si recibiría correo para quienes apoyas","Escribe el orden: dirección postal, acta de nacimiento, identificación y beneficios","Reúne en una carpeta los formularios reales de tu zona y el costo de cada trámite","Acompaña a cada persona en su primera solicitud en vez de solo entregarle el papel"]
    },
    {
      "en": ["Text one fair-chance employer contact to confirm they're still hiring this month","Help draft a one-page resume that leads with skills and recent work","Practice the record question out loud together before any interview","Make every intro warm — a call to a named person, not a job-board link","Check in after each interview or viewing and log how it went"],
      "es": ["Escríbele a un empleador de segunda oportunidad y confirma que aún contrata este mes","Ayuda a armar un currículum de una página que abra con habilidades y trabajo reciente","Ensaya con la persona, en voz alta, la pregunta de antecedentes antes de la entrevista","Que cada presentación sea cálida: una llamada a alguien con nombre, no un enlace","Haz seguimiento tras cada entrevista o visita y anota cómo salió"]
    },
    {
      "en": ["Ask one person with lived reentry experience if they'd consider mentoring","Pair each mentor with one person, not a caseload","Set a monthly check-in where the mentors themselves get support","Agree what mentors handle and where they hand off to volunteers or pros"],
      "es": ["Pregúntale a una persona que ya vivió el reingreso si le interesaría dar mentoría","Empareja a cada mentor con una sola persona, no con una lista de casos","Fija un encuentro mensual donde los propios mentores reciban apoyo","Acuerda qué atiende cada mentor y cuándo pasa el tema a voluntarios o profesionales"]
    },
    {
      "en": ["Open a doc and write the first rule: nothing shared without the person's okay","List exactly who may see any record and lock everyone else out","Decide what you refuse to write down at all","Route every legal question to your named attorney contact, never group advice","Read the rules aloud with volunteers before they start"],
      "es": ["Abre un documento y escribe la primera regla: nada se comparte sin el sí de la persona","Enumera exactamente quién puede ver un expediente y cierra el acceso a los demás","Decide qué cosas simplemente no se escriben","Deriva toda pregunta legal a tu contacto de asistencia legal, nunca al chat del grupo","Lee las reglas en voz alta con las personas voluntarias antes de empezar"]
    }
  ],
  "community-wood-bank": [
    {
      "en": ["Call one local tree service and ask where their wood goes now","List other leads: storm cleanup crews, the county, landowners with downed trees","Visit the best lead and look at the wood — species, size, how green it is","Get written permission naming what you can take and where the property line runs"],
      "es": ["Llama a un servicio de poda local y pregunta a dónde va su madera ahora","Anota otras pistas: limpieza tras tormentas, el municipio, terrenos con árboles caídos","Visita la mejor pista y mira la madera: especie, tamaño y qué tan verde está","Consigue permiso escrito que diga qué puedes llevarte y por dónde corre el lindero"]
    },
    {
      "en": ["List three possible yards: a church lot, a farm corner, a member's rural acreage","Ask each owner for a walk-through this week","Measure for two years of wood — this winter's dry stack plus next winter's drying","Check truck access, neighbors' noise tolerance, and drainage on the walk","Get a written okay covering saw noise, hours, and how long wood can sit"],
      "es": ["Anota tres patios posibles: el lote de una iglesia, una granja, el terreno de un miembro","Pide a cada dueño un recorrido esta misma semana","Mide espacio para dos años de leña: la seca de este invierno y la del próximo secándose","En el recorrido revisa acceso de camioneta, tolerancia al ruido y drenaje","Consigue un sí por escrito que cubra ruido de sierra, horarios y tiempo de apilado"]
    },
    {
      "en": ["Write a list: splitter, two saws, and full protective gear per operator","Post one borrow-or-donate ask to members and local farm or firewood groups","Price chaps, eye, and ear protection for every operator — no shared gear","Have someone who knows saws inspect each donated tool before it's accepted","Stock a first-aid kit and stage everything in one labeled spot at the site"],
      "es": ["Escribe la lista: hendidora, dos motosierras y protección completa por operador","Publica una sola petición de préstamo o donación a miembros y grupos locales","Cotiza zahones y protección de ojos y oídos para cada operador — sin compartir","Pide a alguien que sepa de sierras revisar cada herramienta donada antes de aceptarla","Arma un botiquín y deja todo junto en un lugar etiquetado en el sitio"]
    },
    {
      "en": ["Text members and neighbors asking who has real chainsaw experience","Name one experienced person as safety lead with the final go/no-go call","Ask the extension office or a sawyer about a basic chainsaw safety course","Sort the crew: trained operators on saws, everyone else stacking and hauling","Write the five-minute safety briefing you'll run before every work day"],
      "es": ["Escribe a miembros y vecinos preguntando quién tiene experiencia real con motosierra","Nombra a una persona con experiencia como responsable de seguridad con la última palabra","Pregunta en la oficina de extensión o a un aserrador por un curso básico de motosierra","Divide la cuadrilla: operadores capacitados en sierras, el resto apila y acarrea","Escribe la charla de seguridad de cinco minutos para antes de cada día de trabajo"]
    },
    {
      "en": ["Text the group asking whose phone number can take wood requests","Ask at request time where the wood should go and if there's a clear, dry path","List members with trucks and match each one to a delivery day","Call the fuel-assistance office and ask them to pass your number along","Stack the first delivery yourself to see how long one household takes"],
      "es": ["Pregunta en el chat del grupo qué número recibirá los pedidos de leña","Al recibir el pedido pregunta dónde va la leña y si hay camino despejado y seco","Lista a los miembros con camioneta y asigna a cada uno un día de entrega","Llama a la oficina de asistencia de combustible y pide que compartan tu número","Apila tú la primera entrega para medir cuánto toma un hogar"]
    },
    {
      "en": ["Text two wood-heating households and ask how much they burn in a cold month","Draft portions in real terms — cords or weeks of heat, not \"a load\"","Write who comes first: elders, medical needs, homes with kids, no backup heat","Keep the ask simple — no proof or paperwork, just name, address, and stove type","Put a midwinter check-in on the calendar for households that ran short"],
      "es": ["Escribe a dos hogares que usan leña y pregunta cuánto queman en un mes frío","Define porciones en términos reales — cuerdas o semanas de calor, no \"una carga\"","Escribe quién va primero: mayores, necesidades médicas, niños, sin otra calefacción","Pide poco: sin comprobantes ni papeleo, solo nombre, dirección y tipo de estufa","Agenda una revisión a mitad de invierno para los hogares que se quedaron cortos"]
    },
    {
      "en": ["Count back from November: mark the spring cutoff for cutting this winter's wood","Put the first two work days on the calendar and invite the trained crew","Start a simple log of each stack: date split, wood type, ready-by date","Tag stacks seasoned and green so nobody delivers wet wood in a rush","Set a monthly reminder to update the log and book the next work day"],
      "es": ["Cuenta hacia atrás desde noviembre y marca la fecha límite de primavera para cortar","Pon los dos primeros días de trabajo en el calendario e invita a la cuadrilla","Empieza un registro simple por pila: fecha de partida, tipo de leña, fecha lista","Marca cada pila como seca o verde para que nadie entregue leña húmeda con prisa","Pon un recordatorio mensual para actualizar el registro y agendar el siguiente día"]
    }
  ],
  "community-wifi-mesh": [
    {
      "en": ["Print or sketch a map of the blocks you want to cover","Walk the blocks with the map, marking trees, brick walls, and tall buildings","Knock on doors and ask who lacks service and what they'd use it for","Star the rooftops and upper windows with clear line-of-sight and friendly owners","Photograph the marked map and share it with the group"],
      "es": ["Imprime o dibuja un mapa de las cuadras que quieres cubrir","Recorre las cuadras con mapa en mano y marca árboles, muros de ladrillo y edificios altos","Toca puertas y pregunta quién no tiene servicio y para qué lo usaría","Marca con estrella los techos y ventanas altas con línea de vista y dueños dispuestos","Fotografía el mapa marcado y compártelo con el grupo"]
    },
    {
      "en": ["List three candidates with a spare line: a business, the library, a friendly ISP","Email or visit one today and ask plainly about sharing bandwidth with neighbors","Read the plan's terms of service yourself for any resharing ban","Get the redistribution okay in writing before spending a dollar on hardware"],
      "es": ["Anota tres candidatos con línea de sobra: un negocio, la biblioteca, un ISP amigable","Escribe o visita a uno hoy y pregunta sin rodeos por compartir el ancho de banda","Lee tú los términos del plan buscando cualquier prohibición de recompartir","Consigue el permiso de redistribución por escrito antes de gastar en equipo"]
    },
    {
      "en": ["Message the two most network-comfortable people you know and ask for an hour","Post one ask in local tech, maker, or ham radio groups","Aim for two admins with different jobs and addresses, plus a willing learner","Hold a short kickoff where each admin logs into a test router themselves"],
      "es": ["Escríbele a las dos personas más cómodas con redes que conozcas y pídeles una hora","Publica una sola convocatoria en grupos locales de tecnología o radioaficionados","Apunta a dos admins con trabajos y domicilios distintos, más alguien que quiera aprender","Haz un arranque corto donde cada admin entre por su cuenta a un router de prueba"]
    },
    {
      "en": ["Post one ask for spare routers in local groups and group chats","List the nodes and antennas your map calls for and price what donations won't cover","Set a strong admin password on each router and store it in a shared vault","Configure each node at a table and label it with its planned site","Test two nodes meshing across your own street before any rooftop work"],
      "es": ["Publica una petición de routers de sobra en grupos y chats locales","Lista los nodos y antenas que pide tu mapa y cotiza lo que no llegue donado","Pon contraseña fuerte de admin a cada router y guárdala en un gestor compartido","Configura cada nodo en una mesa y etiquétalo con su sitio previsto","Prueba dos nodos en malla a lo largo de tu calle antes de subir a un techo"]
    },
    {
      "en": ["Text the three friendliest starred spots from your map to ask for a visit","Visit each with a node in hand and check power, mounting spot, and sight lines","Draft a one-page host agreement: roof access, power dollars, damage responsibility","Sign it with each host and offer to cover the few dollars of monthly power"],
      "es": ["Escríbele a los tres sitios más amables marcados en tu mapa y pide una visita","Visita cada uno con un nodo en mano y revisa corriente, montaje y línea de vista","Redacta un acuerdo de una página: acceso al techo, luz y quién responde por daños","Fírmalo con cada anfitrión y ofrece cubrir los pocos dólares de luz al mes"]
    },
    {
      "en": ["Open a blank page and write rule one: what the network is for","Add the no-logging promise and a line that an open network isn't private","Turn logging off in each router's settings and have a second admin verify","Add one line pointing users to HTTPS and VPNs for their own safety","Post the page at host sites and as the network's welcome page"],
      "es": ["Abre una página en blanco y escribe la regla uno: para qué es la red","Agrega la promesa de no registrar actividad y que una red abierta no es privada","Desactiva los registros en cada router y pide a otro admin verificarlo","Suma una línea que recomiende HTTPS y VPN para la seguridad de cada quien","Publica la página en los sitios anfitriones y como pantalla de bienvenida"]
    },
    {
      "en": ["Set a monthly phone reminder to check every node","Label each node with its location and a check-in date","Keep one spare router configured and charged so a swap takes minutes","Write the setup doc as you go and have the second admin follow it once without you","Keep a waiting list of hosts and add a node each time the network runs stable"],
      "es": ["Pon un recordatorio mensual en tu teléfono para revisar cada nodo","Etiqueta cada nodo con su ubicación y una fecha de revisión","Ten un router de repuesto configurado y cargado para que el cambio tome minutos","Documenta la instalación sobre la marcha y pide al otro admin seguirla una vez sin ti","Lleva una lista de espera de anfitriones y suma un nodo cuando la red esté estable"]
    }
  ],
  "mental-health-peer-support": [
    {
      "en": ["Text two warm, steady people you know and ask if they'd consider facilitating","Look up one peer-support or active-listening training nearby and note the dates","Ask each candidate how they'd handle a room gone quiet after a hard disclosure","Gently pass on anyone still raw from their own crisis — for now","Book the training and confirm both facilitators can make every session"],
      "es": ["Escribe a dos personas cálidas y estables y pregunta si considerarían facilitar","Busca una capacitación cercana en apoyo entre pares o escucha activa y anota fechas","Pregunta a cada candidato cómo manejaría una sala en silencio tras una revelación dura","Descarta con cariño a quien siga en carne viva por su propia crisis, por ahora","Reserva la capacitación y confirma que ambos puedan asistir a todas las sesiones"]
    },
    {
      "en": ["Set a 20-minute timer and draft what the circle won't do","Write the boundaries as prohibitions: no diagnosing, no fixing, no replacing therapy","Add three plain lines on what it is: listening, company, shared experience","Read the draft aloud to a facilitator and cut whatever they stumble over"],
      "es": ["Pon un temporizador de 20 minutos y escribe un borrador de lo que el círculo no hará","Escribe los límites como prohibiciones: no diagnosticar, no arreglar, no sustituir terapia","Agrega tres líneas simples sobre lo que sí es: escucha, compañía, experiencia compartida","Léeselo en voz alta a un facilitador y recorta lo que lo haga tropezar"]
    },
    {
      "en": ["Look up your local crisis line and nearest walk-in clinic; save both numbers","Call each number yourself to confirm it's live and note the hours","Write the mid-session steps: pause the group, step aside, warm handoff","Print a copy for every facilitator — the night it's needed, wifi may be down"],
      "es": ["Busca la línea de crisis local y la clínica sin cita más cercana; guarda ambos números","Llama tú a cada número para confirmar que funciona y anota los horarios","Escribe los pasos para una crisis en sesión: pausar, hablar aparte, entrega cálida","Imprime una copia para cada facilitador: la noche que haga falta, el wifi puede fallar"]
    },
    {
      "en": ["List three possible rooms: the library, a faith site, a community center","Visit the best one and check for a door that closes and no glass walls","Ask the host who else uses the building during your hour","Lock in the same room, same time, every week — consistency helps people return"],
      "es": ["Anota tres salas posibles: la biblioteca, un sitio de fe, un centro comunitario","Visita la mejor y revisa que la puerta cierre y no haya paredes de vidrio","Pregunta al anfitrión quién más usa el edificio a esa hora","Asegura la misma sala a la misma hora cada semana; la constancia invita a volver"]
    },
    {
      "en": ["Jot the five rules you already know you need, starting with confidentiality","Add the right to pass and no advice unless someone asks for it","Ask both facilitators to rewrite the draft in plainer words","Print it big enough to read aloud at the start of every session"],
      "es": ["Apunta las cinco reglas que ya sabes necesarias, empezando por la confidencialidad","Agrega el derecho a pasar y nada de consejos si nadie los pide","Pide a ambos facilitadores que reescriban el borrador en palabras más simples","Imprímelo en grande para leerlo en voz alta al inicio de cada sesión"]
    },
    {
      "en": ["Text your facilitators one question: which weeknight can you hold for six months","Skip Friday nights and right-after-work hours — pick a kinder time","Write a stigma-free blurb: free, peer-led, no diagnosis needed","Send it to clinics, faith groups, and the community board","Decide now to cap the circle near eight and how you'll handle overflow"],
      "es": ["Pregunta por mensaje a tus facilitadores qué noche pueden sostener seis meses","Evita el viernes por la noche y la salida del trabajo; elige una hora más amable","Escribe un anuncio sin estigma: gratuito, entre pares, sin diagnóstico necesario","Envíalo a clínicas, grupos de fe y la cartelera comunitaria","Decide desde ya el tope de unas ocho personas y qué harás si llegan más"]
    },
    {
      "en": ["Put a monthly facilitator check-in on the calendar right now","Hold it somewhere that isn't the circle's room — coffee works","Ask each facilitator which session moments have stuck with them","Set a rotation so nobody leads three sessions in a row","Watch for the one who never misses and never rests — offer them the first break"],
      "es": ["Agenda ahora mismo un chequeo mensual con los facilitadores","Háganlo en un lugar que no sea la sala del círculo; un café funciona","Pregunta a cada facilitador qué momentos de las sesiones se le quedaron grabados","Arma una rotación para que nadie dirija tres sesiones seguidas","Observa a quien nunca falta y nunca descansa, y ofrécele el primer respiro"]
    }
  ],
  "community-cleanup": [
    {
      "en": ["Snap a photo of the messiest spot you pass on your way home today","Walk two more blocks and photograph every corner that needs work","Ask two nearby residents which lot bothers them most and who owns it","Revisit your top spots at a different hour — morning and evening tell different stories","Rank the list by impact and how doable each site is in one day"],
      "es": ["Hoy de regreso a casa, tómale una foto al punto más descuidado que veas","Camina dos cuadras más y fotografía cada esquina que necesite trabajo","Pregunta a dos vecinos qué lote les molesta más y de quién es","Vuelve a tus sitios principales a otra hora: la mañana y la noche cuentan cosas distintas","Ordena la lista por impacto y por qué tan realizable es cada sitio en un día"]
    },
    {
      "en": ["Look up the top site's owner on the city parcel map or ask a longtime neighbor","Call or write the owner for written permission with the date you have in mind","Call the city about a bulk pickup and write down the reference number they give you","If the city can't, price a dumpster and confirm drop-off and pickup dates in writing"],
      "es": ["Busca al dueño del sitio en el mapa catastral o pregúntale a alguien de años en el barrio","Llama o escribe al dueño para pedir permiso por escrito con la fecha que tienes en mente","Llama al municipio por una recolección y anota el número de referencia que te den","Si el municipio no puede, cotiza un contenedor y confirma por escrito entrega y retiro"]
    },
    {
      "en": ["Ask the group chat who already owns gloves, grabbers, and high-vis vests","Buy one rigid sharps container and two pairs of puncture-resistant gloves","Count bags and gloves against your signup list and fill the gaps in one trip","Pack everything in labeled bins the night before, sharps container on top"],
      "es": ["Pregunta en el chat quién ya tiene guantes, pinzas y chalecos reflejantes","Compra un contenedor rígido para punzocortantes y dos pares de guantes gruesos","Cuenta bolsas y guantes contra tu lista de inscritos y completa lo que falte","Empaca todo en cajas etiquetadas la víspera, con el contenedor rígido encima"]
    },
    {
      "en": ["Post the date, meeting spot, and time in two neighborhood channels right now","Keep a signup list and recruit a third more people than you think you need","Ask three dependable people to be team leads and confirm each one by name","Sketch the site into zones and assign each lead a zone before the day"],
      "es": ["Publica ya la fecha, el punto de encuentro y la hora en dos canales del barrio","Lleva una lista de inscritos y convoca a un tercio más de lo que crees necesitar","Pide a tres personas confiables liderar equipos y confirma a cada una por su nombre","Divide el sitio en zonas en un croquis y asigna una a cada líder antes del día"]
    },
    {
      "en": ["Write tonight's welcome card: zones, leads, water, never pick up needles by hand","Arrive early and shoot the before photos from a spot you can stand in again","Read the welcome card to everyone, then send each team out with its lead","Walk the zones mid-morning topping up bags, water, and encouragement","Take the after photos from the same spots, share the pair, and set the next date"],
      "es": ["Escribe hoy la tarjeta de bienvenida: zonas, líderes, agua y jamás agujas con la mano","Llega temprano y toma las fotos del antes desde un punto al que puedas volver","Lee la tarjeta al grupo y manda a cada equipo a su zona con su líder","Recorre las zonas a media mañana reponiendo bolsas, agua y ánimo","Repite las fotos desde los mismos puntos, comparte el par y anuncia la próxima fecha"]
    }
  ],
  "free-tax-prep": [
    {
      "en": ["Look up this year's VITA certification dates and where the training runs","Ask three would-be preparers if they can commit to the full training","Register everyone before fall ends — certification takes weeks, not days","Set a group study session before the certification test"],
      "es": ["Busca las fechas de la certificación VITA de este año y dónde se imparte","Pregunta a tres posibles preparadores si pueden comprometerse con toda la capacitación","Inscribe a todo el equipo antes de que acabe el otoño: certificarse toma semanas","Agenda una sesión de estudio en grupo antes del examen de certificación"]
    },
    {
      "en": ["Find your regional free-filing coordinator's email and send a two-line intro","Book a call and ask what a new site needs: software, site rules, quality review","Write down their timeline before promising anyone an opening date","Send back the paperwork they need to add you as a site"],
      "es": ["Busca el correo de la coordinación regional y mándale una presentación de dos líneas","Agenda una llamada y pregunta qué necesita un sitio nuevo: software, requisitos, revisión","Anota sus plazos antes de prometerle a nadie una fecha de apertura","Devuélveles los papeles que piden para registrarte como sitio"]
    },
    {
      "en": ["Text two venues with rooms and wifi — a library branch, a community center","Run a speed test on your phone at each; filing software stalls on weak upload","Count outlets and tables, and check chairs can sit apart for privacy","Reserve the space for the whole season, not week by week"],
      "es": ["Escríbele a dos lugares con salas y wifi: una biblioteca o un centro comunitario","Haz una prueba de velocidad en cada uno; el software se traba con subida débil","Cuenta enchufes y mesas, y revisa que haya distancia entre sillas para la privacidad","Reserva el espacio para toda la temporada, no semana a semana"]
    },
    {
      "en": ["Ask your partner program for their standard required-documents checklist","Pick a booking method people can use by phone, not just online","Put the document checklist into every confirmation and reminder","Make a test booking yourself and fix anything confusing"],
      "es": ["Pide al programa aliado su lista estándar de documentos requeridos","Elige una forma de agendar que funcione por teléfono, no solo en línea","Incluye la lista de documentos en cada confirmación y recordatorio","Haz tú una reserva de prueba y corrige lo que confunda"]
    },
    {
      "en": ["Draft one line — \"Free tax help; you may be owed a refund\" — and test it on a friend","Print flyers with dates, location, and the document checklist on the back","Hand flyers to places workers already go: laundromats, corner stores, bus stops","Aim outreach at people who think they earn too little to bother filing"],
      "es": ["Escribe una línea —\"Impuestos gratis; quizá te deben dinero\"— y pruébala con alguien","Imprime volantes con fechas, lugar y la lista de documentos al reverso","Reparte volantes donde ya va la gente trabajadora: lavanderías, tienditas, paradas","Dirige la difusión a quienes creen que ganan muy poco para declarar"]
    },
    {
      "en": ["List every place client data could live: laptops, drives, the paper stack","Write the retention rule: nothing carried home, and a set shred date","Set screen-lock timers and separate logins on every site laptop","Get a lockbox for paper and a shredder for destruction day"],
      "es": ["Anota cada lugar donde vivirían los datos: laptops, memorias, la pila de papeles","Escribe la regla de conservación: nada se lleva a casa y una fecha fija para triturar","Configura bloqueo de pantalla y cuentas separadas en cada laptop del sitio","Consigue una caja con llave para papeles y una trituradora para el día de destrucción"]
    },
    {
      "en": ["List three local referrals: benefits screening, safe banking, budgeting help","Call each one to confirm they're taking people and how to send someone","Make a small take-home card, offered after the return is done — never at the table","Agree with preparers on the one sentence they'll use to offer it, no pitch"],
      "es": ["Anota tres referencias locales: revisión de beneficios, banca segura, presupuesto","Llama a cada una para confirmar que reciben gente y cómo enviar a alguien","Haz una tarjetita para llevar y ofrécela cuando la declaración esté lista, no antes","Acuerda con el equipo la única frase para ofrecerla, sin discurso de venta"]
    }
  ],
  "community-market": [
    {
      "en": ["List three possible sources: a farm, a grocer, a community garden","Visit each and ask what surplus they actually have and on what rhythm","Pin down each supplier's day and rough volume in writing, not \"whenever we have extra\"","Add one backup source so a bad week doesn't empty the stand"],
      "es": ["Apunta tres fuentes posibles: una granja, una tienda y una huerta comunitaria","Visítalas y pregunta qué excedente tienen de verdad y con qué ritmo","Fija por escrito el día y el volumen aproximado de cada una, no un \"cuando sobre\"","Suma una fuente de respaldo para que una mala semana no deje el puesto vacío"]
    },
    {
      "en": ["Write down two or three candidate spots where neighbors already walk","Visit each at the actual market hour and count who walks by","Check for shade and a water source nearby","Ask permission from whoever runs the spot and get it in a text or email","Round up tables, a canopy, and a simple sign"],
      "es": ["Anota dos o tres lugares posibles por donde la gente ya camina","Visítalos a la hora real del mercado y cuenta cuánta gente pasa","Revisa que haya sombra y una fuente de agua cerca","Pide permiso a quien administre el lugar y consíguelo por mensaje o correo","Reúne mesas, un toldo y un letrero sencillo"]
    },
    {
      "en": ["Message your core crew to set a 20-minute decision chat","Talk through free, pay-what-you-can, or a mix, and what never-turned-away means","If pay-what-you-can, agree on one unmarked box with no suggested price on display","Write the choice down in one sentence everyone can repeat at the table"],
      "es": ["Escríbele a tu equipo base para fijar una charla de 20 minutos y decidir","Hablen de gratuito, paga lo que puedas o mezcla, y qué significa no rechazar a nadie","Si es paga lo que puedas, acuerden una sola caja sin marcas y sin precio sugerido","Anoten la decisión en una frase que cualquiera pueda repetir en la mesa"]
    },
    {
      "en": ["Send one group text asking what coolers, tables, and ice packs people already own","Line up coolers and ice for anything leafy or cut","Plan shade over the produce: a canopy or the shady side of the lot","Agree the discard line with the crew: when in doubt, compost it"],
      "es": ["Manda un mensaje al grupo preguntando qué hieleras, mesas y refrigerantes ya tienen","Consigue hieleras y hielo para todo lo de hoja o cortado","Planea sombra sobre los productos: un toldo o el lado sombreado del lote","Acuerda con el equipo el criterio de descarte: ante la duda, a la composta"]
    },
    {
      "en": ["Message three reliable people and ask which market job they'd take","Fill the unglamorous slots first: the early pickup drive and pack-down","Name a backup for every role so one no-show doesn't cancel the market","Put the roster where everyone sees it and confirm two days before each market"],
      "es": ["Escríbeles a tres personas confiables y pregúntales qué rol tomarían","Llena primero los turnos ingratos: el viaje temprano de recolección y el desmontaje","Nombra un suplente para cada rol para que una ausencia no cancele el mercado","Pon la lista donde todos la vean y confirma dos días antes de cada mercado"]
    },
    {
      "en": ["Text the crew two day-and-time options and ask for a quick vote","Make one simple flyer with day, time, place, and \"free, everyone welcome\"","Post it where neighbors already pass: laundromat, bus stop, corner store","Tell the neighbors you met while scouting so they hear it in person","Set the market as a repeating event in the shared calendar, even on thin weeks"],
      "es": ["Manda al equipo dos opciones de día y hora y pide un voto rápido","Haz un volante sencillo con día, hora, lugar y \"gratis, bienvenido todo el mundo\"","Pégalo donde la gente ya pasa: la lavandería, la parada del bus, la tienda","Cuéntaselo en persona a las vecinas y vecinos que conociste explorando la zona","Deja el mercado como evento repetido en el calendario compartido, aun en semanas flojas"]
    },
    {
      "en": ["Text a fridge, pantry, or meal program before market day to take the leftovers","Arrive early to set up tables, shade, and coolers","Greet people warmly and skip forms, questions, and sorting anyone","At close, drive the surplus straight to your arranged drop-off","Note what ran out and what was left, for next week's plan"],
      "es": ["Antes del mercado, escribe a un refri, despensa o comedor que reciba lo sobrante","Llega temprano a montar mesas, sombra e hieleras","Recibe a la gente con calidez, sin formularios, preguntas ni clasificar a nadie","Al cerrar, lleva el excedente directo al lugar acordado","Anota qué se acabó y qué sobró para planear la próxima semana"]
    }
  ],
  "welcome-wagon": [
    {
      "en": ["Message two or three interested neighbors to pick a time to talk this week","Choose your focus together: new residents, new parents, or both","Agree the first contact is a note or call — never an unannounced knock","Write the one-line offer people can say yes or no to"],
      "es": ["Escríbeles a dos o tres personas interesadas para fijar una hora de charla esta semana","Definan en conjunto el enfoque: recién llegados, familias con bebé o ambos","Acuerden que el primer contacto sea una nota o llamada, nunca tocar sin avisar","Redacta la oferta en una línea, a la que se pueda decir sí o no"]
    },
    {
      "en": ["Start a list on your phone: clinic, transit, schools, food help, your program","Call or check each listing to confirm hours and location are current","Write the date and an \"updates go to…\" contact on the front page","Ask a bilingual neighbor to translate it into the languages spoken nearby"],
      "es": ["Abre una lista en el teléfono: clínica, transporte, escuelas, despensas, tu programa","Llama o verifica cada dato para confirmar horarios y direcciones vigentes","Escribe la fecha y un contacto de \"avisa aquí si algo cambia\" en la primera página","Pídele a alguien bilingüe que lo traduzca a los idiomas que se hablan en la zona"]
    },
    {
      "en": ["Post one ask in the neighborhood chat for pantry basics and household goods","Pick a packing spot and set a date to fill the first five baskets","Keep items shelf-stable and unscented unless you know the household","Tuck the info packet and a handwritten hello into each basket"],
      "es": ["Publica un solo aviso en el chat vecinal pidiendo despensa básica y artículos del hogar","Elige un lugar y una fecha para armar las primeras cinco canastas","Usa productos no perecederos y sin fragancia, salvo que conozcas bien a la familia","Mete en cada canasta el paquete informativo y un saludo escrito a mano"]
    },
    {
      "en": ["Text the two friendliest people you know and ask them to be greeters","Meet for an hour and role-play a doorstep visit together","Practice the short version: hand the basket, name one way to reach you, go","Agree on the signal for \"they'd rather be left alone\" and honor it"],
      "es": ["Escríbeles a las dos personas más cálidas que conozcas y pídeles dar la bienvenida","Reúnanse una hora y ensayen una visita a la puerta","Practiquen la versión corta: entregar la canasta, dejar un contacto y retirarse","Acuerden una señal para \"prefiere estar a solas\" y respétenla"]
    },
    {
      "en": ["List the places that meet newcomers first: landlords, schools, clinics, midwives","Visit or call each one and explain the welcome program in two minutes","Ask them to get the newcomer's consent before passing along any name","Make a simple opt-in form and leave copies at each partner's desk"],
      "es": ["Lista quiénes reciben primero a la gente nueva: arrendadores, escuelas, clínicas, parteras","Visita o llama a cada lugar y explica el programa de bienvenida en dos minutos","Pídeles que consigan el consentimiento de la persona antes de pasar cualquier nombre","Haz un formulario sencillo de inscripción voluntaria y deja copias en cada lugar"]
    }
  ],
  "library-of-things": [
    {
      "en": ["Type ten candidate items into your notes app: tables, tent, carpet cleaner, drill","Add a blank line and the question: what would you have used in the last year?","Post the survey on the board and hand paper copies to five neighbors","Tally the answers after a week and rank the top ten requests"],
      "es": ["Escribe diez artículos candidatos en tus notas: mesas, carpa, limpiadora, taladro","Agrega una línea en blanco y la pregunta: ¿qué habrías usado en el último año?","Publica la encuesta en la cartelera y reparte copias en papel a cinco vecinos","Cuenta las respuestas tras una semana y ordena los diez artículos más pedidos"]
    },
    {
      "en": ["Text the public library or community center to ask about a spare closet or room","Measure your two bulkiest requested items — they size the space you need","Visit the best option with a tape measure and check the door width too","Agree on pickup and return hours the host can sustain, and write them down"],
      "es": ["Escribe a la biblioteca pública o al centro comunitario y pregunta por un clóset libre","Mide los dos artículos más voluminosos de la lista; ellos dictan el espacio necesario","Visita la mejor opción con cinta métrica y mide también el ancho de la puerta","Acuerda horarios de entrega y devolución que el anfitrión pueda sostener, y anótalos"]
    },
    {
      "en": ["Post a wanted list of your top ten survey items — not an open call for anything","Set one drop-off day and ask donors to bring cords, bags, and parts along","Plug in and run every electrical item before it earns a shelf spot","Check motorized and kids' items against the CPSC recall list","Box the rejects for disposal the same day so they don't pile up"],
      "es": ["Publica una lista de los diez artículos más pedidos; nada de 'se acepta todo'","Fija un día de entrega y pide a los donantes traer cables, bolsas y piezas completas","Enchufa y prueba cada aparato eléctrico antes de darle lugar en el estante","Revisa lo motorizado y lo infantil contra la lista de retiros del mercado (CPSC)","Empaca lo rechazado para desecharlo el mismo día, para que no se acumule"]
    },
    {
      "en": ["Number twenty masking-tape labels and stick the first one on an item","Photograph each item right beside its number in decent light","Log number, name, condition, and photo — one spreadsheet row per item","Give accessories — bags, cords, attachments — their own numbered lines"],
      "es": ["Numera veinte etiquetas de cinta adhesiva y pega la primera en un artículo","Fotografía cada artículo justo al lado de su número, con buena luz","Registra número, nombre, estado y foto: una fila de la hoja por artículo","Dale a los accesorios —bolsas, cables, aditamentos— sus propias líneas numeradas"]
    },
    {
      "en": ["List your five most-requested items and guess how fast each will turn over","Set loan lengths per item: a weekend for the projector, a week for the cleaner","Write a forgiving late policy — a friendly nudge, never a fee","Note in one line which items need extra care or cleaning on return","Ask a librarian volunteer to read the rules and cut what confuses them"],
      "es": ["Anota tus cinco artículos más pedidos y calcula qué tan rápido rotará cada uno","Fija plazos por artículo: un fin de semana el proyector, una semana la limpiadora","Escribe una política de retraso amable: un recordatorio cordial, nunca una multa","Apunta en una línea qué artículos requieren limpieza o cuidado especial al volver","Pide a alguien del equipo bibliotecario que lea las reglas y recorte lo confuso"]
    },
    {
      "en": ["Rule a sign-out sheet with four columns: name, contact, item, due date","Add the step everyone skips: a condition photo at checkout and again at return","Walk both librarians through one practice checkout, start to finish","Watch each librarian run one solo checkout before opening day"],
      "es": ["Traza una hoja de préstamo con cuatro columnas: nombre, contacto, artículo, fecha","Agrega el paso que todos saltan: foto del estado al prestar y otra al devolver","Guía a ambos bibliotecarios por un préstamo de práctica, de principio a fin","Mira a cada uno hacer un préstamo por su cuenta antes del día de apertura"]
    },
    {
      "en": ["Tape a 'requests we couldn't fill' sheet next to the checkout sheet","Clean and inspect each return the day it comes back, not in batches","Set a monthly repair hour and keep fixable items where you'll see them","Buy or hunt down the top item from the unfilled list — not your own guess"],
      "es": ["Pega una hoja de 'pedidos que no pudimos cumplir' junto a la hoja de préstamos","Limpia y revisa cada devolución el mismo día que llega, no por tandas","Fija una hora mensual de reparación y deja lo arreglable donde lo veas","Compra o consigue el artículo más pedido de esa lista, no tu corazonada"]
    }
  ],
  "laundry-shower-access": [
    {
      "en": ["List three possible hosts: a laundromat, a gym, a faith site with showers","Call the friendliest one and ask for a fifteen-minute visit this week","Walk the route from the waiting area to the shower door — is it truly private?","Tell the host plainly who's coming and what cleaning your team will cover","Confirm the agreed days and terms in one follow-up text or email"],
      "es": ["Anota tres anfitriones posibles: una lavandería, un gimnasio, un sitio de fe con duchas","Llama al más amigable y pide una visita de quince minutos esta semana","Recorre la ruta de la sala de espera a la ducha: ¿de verdad es privada?","Dile al anfitrión con claridad quién vendrá y qué limpieza cubrirá tu equipo","Confirma los días y condiciones acordados en un mensaje o correo de seguimiento"]
    },
    {
      "en": ["Write the needs list: detergent, towels, soap, shampoo, flip-flops","Ask for travel-size and unscented right in the donation post","Call one congregation or store about covering the first month","Pack arrivals into shower kits — one bag per guest, ready to hand over"],
      "es": ["Escribe la lista de necesidades: detergente, toallas, jabón, champú, chanclas","Pide tamaño de viaje y sin fragancia desde el anuncio de donaciones","Llama a una congregación o tienda para cubrir el primer mes","Arma kits de ducha con lo que llegue: una bolsa por persona, lista para entregar"]
    },
    {
      "en": ["Text the host to confirm how many machines and showers you get per session","Make a paper sign-up sheet that asks for a first name — or nothing at all","Decide the fair-turn rule — first come, returning guests, or a mix — and post it","Run one session on paper before trying anything fancier"],
      "es": ["Escribe al anfitrión y confirma cuántas máquinas y duchas tendrás por sesión","Haz una hoja de turnos en papel que pida solo un nombre de pila, o nada","Decide la regla de turnos —orden de llegada, habituales o mixta— y publícala","Prueba una sesión completa en papel antes de intentar algo más elaborado"]
    },
    {
      "en": ["Ask the host which cleaning products they require between uses","Time one full stall clean: disinfect, mop, fresh towel","Build those minutes into every slot so no guest gets a dirty stall","Write the routine as a checklist and tape it inside the supply closet","Agree with the host on who restocks and who handles plumbing trouble"],
      "es": ["Pregunta al anfitrión qué productos de limpieza exige entre usos","Cronometra una limpieza completa de cubículo: desinfectar, trapear, toalla limpia","Incluye esos minutos en cada turno para que nadie reciba un cubículo sucio","Escribe la rutina como lista de verificación y pégala dentro del clóset de insumos","Acuerda con el anfitrión quién repone insumos y quién atiende fallas de plomería"]
    },
    {
      "en": ["Message three patient, unflappable people you'd trust at a front desk","Shadow each recruit through one full session before they run intake alone","Rehearse the awkward scenarios together: an intoxicated guest, a slot running long","Agree who gets called first — so nobody panic-calls the host","Set the tone plainly: greet guests like a hotel, not a clinic"],
      "es": ["Escribe a tres personas pacientes e imperturbables que pondrías en una recepción","Acompaña a cada nuevo voluntario una sesión completa antes de dejarlo solo","Ensaya con ellos los momentos incómodos: alguien intoxicado, un turno que se alarga","Acuerda a quién se llama primero, para que nadie llame al anfitrión en pánico","Marca el tono sin rodeos: se recibe como hotel, no como clínica"]
    },
    {
      "en": ["Text your volunteers one question: which weekly hours can you hold for six months","Set the schedule to what's sustainable, not what's impressive","Print simple cards with hours and location — no paperwork mentioned","Hand the cards to outreach workers, shelters, and street-connected neighbors","Hold the hours fixed — one changed week teaches people the door may be locked"],
      "es": ["Pregunta por mensaje a tu equipo qué horas semanales pueden sostener seis meses","Fija el horario según lo sostenible, no según lo impresionante","Imprime tarjetas simples con horario y lugar, sin mencionar trámites","Reparte las tarjetas a trabajadores de calle, albergues y vecinos sin techo","Mantén el horario fijo: una sola semana cambiada enseña que la puerta puede estar cerrada"]
    }
  ],
  "voter-registration": [
    {
      "en": ["Look up your election office's phone number and email right now","Call and ask what registration drives may and may not do locally","Write down the exact form-return deadline and who may legally submit forms","Ask whether volunteers need training or registration before tabling","Email an established nonpartisan group to borrow materials and advice"],
      "es": ["Busca ahora mismo el teléfono y correo de tu oficina electoral","Llama y pregunta qué puede y qué no puede hacer una jornada de registro en tu zona","Anota la fecha límite exacta de entrega y quién puede entregar los formularios","Pregunta si las personas voluntarias necesitan capacitación o registro previo","Escribe a un grupo no partidista establecido para pedir materiales y consejos"]
    },
    {
      "en": ["Message your volunteers two possible one-hour training times today","Write the stock reply to \"who should I vote for?\" on a card for every volunteer","Walk through one real registration form together, field by field","Role-play a pushy political question until the neutral answer comes easily"],
      "es": ["Manda hoy a tus voluntarias dos opciones de horario para una capacitación de una hora","Escribe en una tarjeta la respuesta fija a \"¿por quién voto?\" para cada persona","Repasen juntos un formulario real, campo por campo","Ensayen una pregunta política insistente hasta que la respuesta neutral salga sola"]
    },
    {
      "en": ["Open the election office's official page and bookmark it","Print deadlines, ID rules, and polling info straight from that page","Write today's date on every printout so stale copies are obvious","Pick up blank registration forms from the election office itself"],
      "es": ["Abre la página oficial de la oficina electoral y guárdala en favoritos","Imprime plazos, reglas de identificación y datos de votación directo de esa página","Escribe la fecha de hoy en cada impresión para detectar copias viejas","Recoge formularios en blanco en la propia oficina electoral"]
    },
    {
      "en": ["List five spots where eligible neighbors already gather — market, transit, campus","Message each spot's manager asking permission to set up a table","Get the yes in writing, even just an email, before you schedule a shift","Match each confirmed spot to a date and time on the calendar"],
      "es": ["Anota cinco lugares donde ya se junta la gente: mercado, transporte, campus","Escribe a quien administra cada lugar para pedir permiso de poner una mesa","Consigue el sí por escrito, aunque sea un correo, antes de agendar un turno","Asigna fecha y hora en el calendario a cada lugar confirmado"]
    },
    {
      "en": ["Write a packing list on your phone: forms, pens, clipboards, dated info sheets","Pack the kit the night before and put it by the door","Name one person to hold the sealed folder of completed forms all shift","Read each form back with the registrant before they leave the table","Deliver the folder to the election office the same day, well inside the deadline"],
      "es": ["Escribe en tu teléfono la lista del kit: formularios, plumas, tablillas, hojas con fecha","Empaca el kit la noche anterior y déjalo junto a la puerta","Nombra a una sola persona que cargue la carpeta cerrada con los formularios todo el turno","Repasa cada formulario con la persona antes de que se retire de la mesa","Entrega la carpeta a la oficina electoral el mismo día, bien dentro del plazo"]
    },
    {
      "en": ["Look up the official polling-place finder link and save it on your phone","Draft a wallet-size card: election date, that lookup link, mail-in deadline","Print a stack and keep them in the table kit next to the forms","Hand one to each new registrant and ask if they'll need a ride to vote"],
      "es": ["Busca el enlace oficial para ubicar el centro de votación y guárdalo en tu teléfono","Arma una tarjeta de bolsillo: fecha de elección, ese enlace y plazo del voto por correo","Imprime varias y guárdalas en el kit junto a los formularios","Entrega una a cada persona registrada y pregunta si necesitará transporte para votar"]
    }
  ],
  "health-navigation": [
    {
      "en": ["Search \"free clinic near me\" and paste the first three results into a doc","Call each one for the direct intake line and current eligibility rules","Add columns for languages, sliding scale, and the date you verified each entry","Set a recurring reminder to re-check every entry before it goes stale"],
      "es": ["Busca \"clínica gratuita cerca de mí\" y pega los tres primeros resultados en un documento","Llama a cada una y pide la línea directa de admisión y las reglas vigentes","Agrega columnas de idiomas, tarifa escalonada y la fecha en que verificaste cada dato","Ponte un recordatorio fijo para reverificar cada entrada antes de que envejezca"]
    },
    {
      "en": ["Text three patient, organized people you know and ask if they'd be navigators","Write the boundary in one line: logistics and paperwork yes, medical advice never","Drill the exact words: \"I'm not medical — let me connect you to a nurse line\"","Role-play one scared-caller scenario with each new navigator"],
      "es": ["Escríbele a tres personas pacientes y organizadas: ¿se animan a ser navegadoras?","Redacta el límite en una línea: logística y trámites sí, consejo médico nunca","Ensaya las palabras exactas: \"no soy personal médico; te comunico con enfermería\"","Practica con cada persona navegadora nueva una llamada de alguien asustado"]
    },
    {
      "en": ["Ask the crew chat who can lend a phone number for intake this month","Set up voicemail with a warm greeting in the languages you serve","Add an in-person option: fixed hours at a library or community center","Decide what you'll never write down — diagnoses, immigration status — before call one"],
      "es": ["Pregunta en el chat quién presta un número para la admisión este mes","Configura el buzón de voz con un saludo cálido en los idiomas que atiendes","Suma una opción presencial: horario fijo en una biblioteca o centro comunitario","Decide qué no anotarás nunca —diagnósticos, estatus migratorio— antes de empezar"]
    },
    {
      "en": ["Look up today whether open enrollment is currently open in your area","Print the document list people need: income proof, household size, ID","Gather documents with each person before opening their application","Find a certified enrollment assister to shadow on your first case"],
      "es": ["Averigua hoy si el periodo de inscripción abierta está vigente en tu zona","Imprime la lista de documentos: comprobante de ingresos, tamaño del hogar, identificación","Reúne los documentos con cada persona antes de abrir su solicitud","Busca a alguien certificado en inscripciones para acompañar tu primer caso"]
    },
    {
      "en": ["Save the rides program contact in your phone right now","Ask about transportation in the same call that books the appointment","Set a day-before reminder text for every appointment you book","Look up two prescription discount programs and keep them on a card"],
      "es": ["Guarda ahora mismo el contacto del programa de transporte en tu teléfono","Pregunta por el transporte en la misma llamada en que agendas la cita","Programa un mensaje recordatorio el día anterior para cada cita que agendes","Busca dos programas de descuento de medicamentos y tenlos en una tarjeta"]
    },
    {
      "en": ["Write rule one on a sticky note: collect the minimum, share nothing without consent","List what intake actually needs and cut everything else","Pick one locked place — physical or encrypted — where notes live","Review the rules with every navigator before they take a first call"],
      "es": ["Escribe la regla uno en un papelito: recopilar lo mínimo y no compartir sin permiso","Enlista lo que la admisión de verdad necesita y recorta todo lo demás","Elige un solo lugar bajo llave —físico o cifrado— donde vivan las notas","Repasa las reglas con cada persona navegadora antes de su primera llamada"]
    },
    {
      "en": ["Email one clinic asking for fifteen minutes with their intake coordinator","Visit and ask which referrals actually help them and which swamp them","Give them one named contact on your side for warm handoffs","Set a quarterly check-in to hear about new low-cost services"],
      "es": ["Escríbele a una clínica pidiendo quince minutos con su coordinación de admisión","Visítala y pregunta qué derivaciones de verdad ayudan y cuáles la saturan","Dales un contacto con nombre de tu lado para entregas cálidas","Agenda un contacto trimestral para enterarte de servicios nuevos de bajo costo"]
    }
  ],
  "toy-library": [
    {
      "en": ["Text the community center or branch library asking about one spare shelf","Visit with a stroller and check the route in — no stairs, room to park it","Ask three parents at pickup which two weekly hours they could actually make","Confirm the shelf sits at kid height and post the hours on it"],
      "es": ["Manda un mensaje al centro comunitario o a la biblioteca preguntando por un estante libre","Visita el lugar con carriola y revisa la entrada: sin escaleras y con dónde dejarla","Pregunta a tres familias a la salida qué dos horas semanales sí les sirven","Confirma que el estante quede a la altura de un niño y pega ahí el horario"]
    },
    {
      "en": ["Bookmark the CPSC recall page on your phone","Set out a labeled donation bin at the storage spot","Check each donated toy against the recall list before anything else","Drop small parts through a toilet-paper tube; if they fit, pull it for under-threes","Wash and dry each keeper, and bin anything cracked or missing parts"],
      "es": ["Guarda en tu teléfono la página de retiros del mercado (CPSC)","Pon un contenedor rotulado para donaciones junto al estante de la biblioteca","Coteja cada juguete donado con la lista de retiros antes que nada","Pasa las piezas por un tubo de papel higiénico; si caben, apártalo de menores de tres","Lava y seca cada juguete aprobado, y desecha lo roto o incompleto"]
    },
    {
      "en": ["Ask in the community chat for zip-top bags and a permanent marker","Photograph each toy beside its number and log it with an age range","Count multi-piece sets into their bag and write the count on the label","Shelve bagged sets label-out so the count shows at return"],
      "es": ["Pide en el chat comunitario bolsas con cierre y un marcador permanente","Fotografía cada juguete junto a su número y regístralo con su rango de edad","Cuenta las piezas de cada juego al embolsarlas y escribe el total en la etiqueta","Acomoda las bolsas con la etiqueta a la vista para revisar el conteo al devolver"]
    },
    {
      "en": ["Look up one other toy library's borrowing rules for a starting point","Draft loan length and how many toys per family, in plain words","Write the missing-pieces policy as one kind sentence — no fines, just tell us","Ask two parents to read it and flag anything that feels like a scolding"],
      "es": ["Busca en línea las reglas de otra biblioteca de juguetes como punto de partida","Redacta en palabras sencillas el plazo y cuántos juguetes por familia","Escribe la política de piezas perdidas en una frase amable: sin multas, solo avísanos","Pide a dos familias que lo lean y marquen lo que suene a regaño"]
    },
    {
      "en": ["Print five blank sign-out sheets: name, contact, toy number, due date","Walk each volunteer through one practice checkout and return","Fold the piece count and a quick wipe-down into the return step itself","Post the cleaning routine and rules where the librarian sits"],
      "es": ["Imprime cinco hojas de registro: nombre, contacto, número de juguete y fecha de devolución","Acompaña a cada voluntaria en un préstamo y una devolución de práctica","Integra el conteo de piezas y una limpiada rápida al propio paso de devolución","Pega la rutina de limpieza y las reglas donde se sienta quien atiende"]
    }
  ],
  "food-preservation": [
    {
      "en": ["Text one church hall or community center to ask about using their kitchen","Visit and check the stove holds a full canner's weight and hits a hard rolling boil","Check counters, sinks, and a corner where hot jars can cool undisturbed","Book dates around harvest peaks, not whenever the room happens to be free"],
      "es": ["Escribe a una parroquia o centro comunitario y pregunta si prestan su cocina","Visítala y comprueba que la estufa aguante una olla llena y logre un hervor fuerte","Revisa mesas, fregaderos y un rincón donde los frascos calientes enfríen sin estorbos","Aparta fechas según los picos de cosecha, no según cuándo esté libre el salón"]
    },
    {
      "en": ["Download the current USDA Complete Guide or your extension service's version","Check the publication year and write it on the cover","Call the extension office and ask them to train your leads or review your plan","Agree as leads: tested recipes only, no scaling, no grandmother exceptions"],
      "es": ["Descarga la guía vigente del USDA o la del servicio de extensión de tu zona","Revisa el año de publicación y anótalo en la portada","Llama a la oficina de extensión y pide que capaciten a tus líderes o revisen tu plan","Acuerden entre líderes: solo recetas probadas, sin aumentar cantidades, sin excepciones"]
    },
    {
      "en": ["Post one ask for canners, jars, and rings in a local group you're already in","Book a gauge test for each pressure canner at your extension office — often free","Run a finger around every donated jar rim and cull any with chips","Buy new lids for every planned jar and note which rings and tools are still missing"],
      "es": ["Publica en un grupo local una petición de ollas, frascos y aros para conservas","Agenda la prueba del manómetro de cada olla en la oficina de extensión — suele ser gratis","Pasa el dedo por el borde de cada frasco donado y descarta los despostillados","Compra tapas nuevas para todos los frascos previstos y anota qué herramientas faltan"]
    },
    {
      "en": ["Text one gardener or gleaner and ask what's about to peak","Sketch a quick harvest calendar: which crop floods in, in which weeks","Commit a specific quantity to a specific session date with each source","Schedule pickup within a day or two of harvest so nothing sits and softens"],
      "es": ["Escribe a alguien que cultiva o cosecha y pregunta qué está por llegar a su punto","Dibuja un calendario rápido de cosecha: qué producto abunda en qué semanas","Acuerda con cada fuente una cantidad concreta para una fecha de sesión concreta","Programa la recolección uno o dos días después de la cosecha para que nada se pase"]
    },
    {
      "en": ["Ask the group by text who has canned before and who's brand new","Pick one tested recipe that fits the produce and the least experienced hands","Match the food to its safe method — water bath for high-acid, pressure for low","Sketch the stations on paper: wash, prep, fill, process, cool","Assign one named person per station before anyone shows up"],
      "es": ["Pregunta por mensaje quién ya ha envasado antes y quién es primerizo","Elige una receta probada que le quede al producto y a las manos menos expertas","Empareja el alimento con su método seguro: baño maría lo ácido, presión lo bajo en ácido","Dibuja las estaciones en papel: lavar, preparar, llenar, procesar, enfriar","Asigna a una persona con nombre a cada estación antes de que llegue nadie"]
    },
    {
      "en": ["Print the tested recipe and processing times and tape them at eye level","Open with a five-minute safety talk: why times and methods aren't negotiable","Name one person as timekeeper to log every batch in and out","Pair each newcomer with an experienced hand at every station","Walk the room narrating what you're doing so the skill actually spreads"],
      "es": ["Imprime la receta probada y los tiempos de proceso y pégalos a la altura de los ojos","Abre con cinco minutos de seguridad: por qué los tiempos y métodos no se negocian","Nombra a una persona cronometrista que anote la entrada y salida de cada tanda","Empareja a cada principiante con alguien con experiencia en cada estación","Recorre la cocina narrando lo que haces para que la habilidad de verdad se contagie"]
    },
    {
      "en": ["Grab a marker and label the first cooled jar: contents, method, date","Press each lid center and pull aside any jar that didn't seal — fridge, not shelf","Count jars per person and set aside the share for the fridge or pantry","Jot three lines while it's fresh: what worked, what jammed, what to change"],
      "es": ["Toma un marcador y etiqueta el primer frasco frío: contenido, método y fecha","Presiona el centro de cada tapa y aparta los frascos sin sellar — al refri, no al estante","Cuenta los frascos por persona y separa la parte para el refri comunitario o la despensa","Apunta tres líneas en caliente: qué funcionó, qué se atoró y qué cambiar"]
    }
  ],
  "free-haircut": [
    {
      "en": ["Message one stylist or barber you know and ask for ten minutes to pitch the idea","Ask each yes how many cuts they can really do in a session — usually six to eight","Ask each recruit to bring one colleague along","Collect license numbers and preferred dates in one list"],
      "es": ["Escribe a un estilista o barbero que conozcas y pídele diez minutos para contarle","A cada sí pregúntale cuántos cortes hace de verdad por jornada — suelen ser seis u ocho","Pide a cada persona reclutada que traiga a un colega","Reúne números de licencia y fechas disponibles en una sola lista"]
    },
    {
      "en": ["Text a shelter, day center, or church about hosting for one afternoon","Walk the room and check for water, good light, and floors you can sweep","Count grounded outlets within a cord's reach of where each chair would sit","Confirm the date and who unlocks in one message you can point back to"],
      "es": ["Escribe a un albergue, centro de día o iglesia y pregunta si prestan el lugar una tarde","Recorre el salón y revisa agua, buena luz y pisos que se puedan barrer","Cuenta los enchufes con tierra al alcance del cable donde iría cada silla","Confirma fecha y quién abre en un solo mensaje al que puedas volver después"]
    },
    {
      "en": ["Text your stylists to ask what gear they bring, so you only buy the gaps","Buy two sets of clipper guards and blades per station — one soaks while one works","Ask a beauty supply shop to donate capes, combs, and disposable neck strips","Pack take-home bags: razor, soap, deodorant, and a comb in each"],
      "es": ["Pregunta por mensaje a tus estilistas qué equipo traen, para comprar solo lo que falte","Compra dos juegos de guías y cuchillas por estación: uno se desinfecta y el otro corta","Pide a una tienda de belleza que done capas, peines y tiras desechables para el cuello","Arma bolsas para llevar: rastrillo, jabón, desodorante y un peine en cada una"]
    },
    {
      "en": ["Call your state cosmetology or barber board and ask their rules for free events","Buy the EPA-registered disinfectant they name and note the required soak time","Set up a soak station per chair: labeled tub, timer, and the printed soak time","Write the between-clients routine on one card and tape it at each station"],
      "es": ["Llama a la junta de cosmetología o barbería y pregunta sus reglas para eventos gratis","Compra el desinfectante registrado que te indiquen y anota el tiempo de remojo exigido","Monta una estación de remojo por silla: tina rotulada, temporizador y el tiempo impreso","Escribe la rutina entre clientes en una tarjeta y pégala en cada estación"]
    },
    {
      "en": ["Text every stylist and the host two days out to confirm","Set one chair where the room can't watch, for anyone who wants privacy","Hand each guest a mirror and start with 'what would you like?' before any snip","Keep phones pocketed — photos only if a guest asks for one","Close by restocking take-home bags and booking the next date with the host"],
      "es": ["Manda mensaje a cada estilista y al anfitrión dos días antes para confirmar","Coloca una silla donde el salón no pueda mirar, para quien prefiera privacidad","Dale a cada invitado un espejo y empieza con '¿cómo lo quieres?' antes de cortar","Mantén los teléfonos guardados — fotos solo si el invitado las pide","Cierra reponiendo las bolsas para llevar y apartando la próxima fecha con el anfitrión"]
    }
  ],
  "mutual-aid-moving-crew": [
    {
      "en": ["Text four strong-backed friends and ask about their weekend availability","Ask around for anyone with a truck, van, or trailer you could borrow","Start a roster: name, phone, lifting ability, vehicle, usual free days","Mark a small vetted core for sensitive moves — never staffed from open sign-up"],
      "es": ["Escribe a cuatro amigos con buena espalda y pregunta si tienen libre el fin de semana","Pregunta por ahí quién tiene camioneta, van o remolque que pueda prestar","Arma una lista: nombre, teléfono, fuerza, vehículo, días libres habituales","Marca un núcleo pequeño y de confianza para mudanzas delicadas; nunca de lista abierta"]
    },
    {
      "en": ["Post one ask on the board: dollies, straps, moving blankets, sturdy boxes","Prioritize a four-wheel furniture dolly — buy one if nobody donates it","Stencil or write the program name on every piece so it comes back","Pick one garage or closet as the gear's home and tell the crew where"],
      "es": ["Publica un solo pedido en la cartelera: carretillas, correas, cobijas, cajas firmes","Prioriza una carretilla de cuatro ruedas para muebles; cómprala si nadie la dona","Marca cada pieza con el nombre del programa para que de verdad regrese","Elige un garaje o clóset como casa del equipo y avisa a la cuadrilla dónde está"]
    },
    {
      "en": ["Type five intake questions into your notes: rooms, stairs, distance, date","Add the two everyone forgets: is it all packed, and how far is legal parking","Decide how requests reach you — one phone number beats a form here","Test the intake on a friend pretending to book a move"],
      "es": ["Escribe cinco preguntas de admisión en tus notas: cuartos, escaleras, distancia, fecha","Agrega las dos que todos olvidan: ¿está todo empacado y a qué distancia se estaciona?","Decide cómo te llegan los pedidos; aquí un teléfono le gana a un formulario","Prueba la admisión con un amigo que finja pedir una mudanza"]
    },
    {
      "en": ["Look up one good safe-lifting video and send it to the whole crew","Write the weight rule first: nothing over fifty pounds with fewer than two people","Draft a one-page waiver and have everyone sign before the first move","Ask each driver to confirm their insurance covers volunteer hauling"],
      "es": ["Busca un buen video de levantamiento seguro y envíalo a toda la cuadrilla","Escribe primero la regla de peso: nada de más de 23 kilos entre menos de dos personas","Redacta un descargo de una página y que todos firmen antes de la primera mudanza","Pide a cada conductor confirmar que su seguro cubre acarreos voluntarios"]
    },
    {
      "en": ["Open the roster and mark who's free for the next requested date","Call the person the day before and confirm they're truly packed — not 'almost'","Keep two backup names per move; moves can't easily be postponed","Share addresses one-to-one from the coordinator's phone, never in a group chat"],
      "es": ["Abre la lista y marca quién está libre para la próxima fecha pedida","Llama a la persona el día anterior y confirma que está empacada de verdad, no 'casi'","Ten dos nombres de respaldo por mudanza; una mudanza no se pospone fácil","Comparte direcciones uno a uno desde el teléfono de quien coordina, jamás en chat grupal"]
    },
    {
      "en": ["Jot the jobs you already know are too much: pianos, hazmat, hoarding cleanouts","Look up who locally handles each one — movers, haulers, county services","Pair every limit with that referral so a no still hands someone a next call","Type it up as half a page and share it with the whole crew"],
      "es": ["Apunta los trabajos que ya sabes que son demasiado: pianos, químicos, casas acumuladas","Averigua quién los atiende en tu zona: mudanceros, fleteros, servicios del condado","Acompaña cada límite con esa referencia, para que un no entregue una próxima llamada","Pásalo en limpio en media página y compártelo con toda la cuadrilla"]
    },
    {
      "en": ["Text the crew the night before: time, meeting spot, what to wear","Load the heaviest furniture first and let the dolly do the lifting","Walk the old place with the person one final time before pulling away","Check in a few days later — are they settled, could the free store help","Note what went well and what hurt while the move is still fresh"],
      "es": ["Manda a la cuadrilla un mensaje la noche anterior: hora, punto de encuentro, ropa","Carga primero los muebles más pesados y deja que la carretilla haga la fuerza","Recorre el lugar viejo con la persona una última vez antes de arrancar","Pregunta unos días después: ¿ya se instaló, le serviría la tienda gratuita?","Apunta qué salió bien y qué dolió mientras la mudanza sigue fresca"]
    }
  ],
  "disability-support-network": [
    {
      "en": ["Text two disabled neighbors you know and ask if they'd co-found this with you","Let them pick the first meeting's format, place, and pace before you set anything","Add a line to the budget for leaders' access costs and time","Agree out loud on the rule: allies support, disabled members decide"],
      "es": ["Escribe a dos vecinos con discapacidad que conozcas y pregunta si lo fundarían contigo","Deja que elijan formato, lugar y ritmo de la primera reunión antes de fijar nada","Agrega una línea al presupuesto para los costos de acceso y el tiempo de quienes lideran","Acuerden en voz alta la regla: quienes son aliados apoyan, los miembros deciden"]
    },
    {
      "en": ["Ask three members how they prefer to be reached: call, text, email, or in person","Set up one channel per preference and name a person who tends each","Have a screen-reader user try your sign-up and flyer before anything goes out","Rewrite your first announcement in plain language and send it every way at once"],
      "es": ["Pregunta a tres miembros cómo prefieren el contacto: llamada, texto, correo o en persona","Abre un canal por cada preferencia y nombra a alguien que cuide cada uno","Pide a alguien que usa lector de pantalla que pruebe tu inscripción y tu volante","Reescribe tu primer anuncio en lenguaje sencillo y mándalo por todas las vías a la vez"]
    },
    {
      "en": ["Ask one member what errand or barrier cost them the most this month","Draft five short questions and put them to members by phone, text, and in person","List every local resource named, one per line, with a contact for each","Call each listed place and ask about the lift, the bathroom, and the intake process","Mark the three biggest gaps between what members need and what exists"],
      "es": ["Pregunta a un miembro qué trámite o barrera le costó más este mes","Redacta cinco preguntas cortas y hazlas por teléfono, mensaje y en persona","Anota cada recurso local mencionado, uno por línea, con un contacto","Llama a cada lugar y pregunta por el elevador, el baño y el proceso de admisión","Marca las tres brechas más grandes entre lo que la gente necesita y lo que existe"]
    },
    {
      "en": ["Text three members and ask one thing they could offer and one they could use","Make a two-column sheet — offers and needs — and pencil in the obvious matches","Add a no-explanation pause option so anyone can step back for a week","Make the first match yourself and check in with both people afterward"],
      "es": ["Escribe a tres miembros y pregunta qué podrían ofrecer y qué les vendría bien","Haz una hoja de dos columnas — ofertas y necesidades — y marca los pares obvios","Agrega una opción de pausa sin explicaciones para retirarse una semana sin pena","Haz tú el primer emparejamiento y pregunta después a ambas personas cómo les fue"]
    },
    {
      "en": ["Post one ask for unused walkers, canes, and shower chairs in a local group","Write the no-lend list first: nothing that touches breath or skin intimately","Sanitize each aid, then tag it with a number, its serial, and your program name","Set a simple sign-out sheet: item number, borrower, contact, date out"],
      "es": ["Publica en un grupo local una petición de andaderas, bastones y sillas de baño sin uso","Escribe primero la lista de lo que no se presta: nada que toque de cerca boca o piel","Desinfecta cada aparato y ponle un número, su serie y el nombre del programa","Arma una hoja de salida simple: número del aparato, quién lo lleva, contacto y fecha"]
    },
    {
      "en": ["Save the number of your nearest benefits counselor in your phone","Ask two members which office or form they'd most want company for","Pair each request with a buddy who takes notes and asks for things in writing","When money or benefits rules come up, route to the counselor instead of guessing"],
      "es": ["Guarda en tu teléfono el número de la consejería de beneficios más cercana","Pregunta a dos miembros a qué oficina o trámite les gustaría ir con compañía","Asigna a cada solicitud un acompañante que tome notas y pida todo por escrito","Cuando surjan reglas de dinero o beneficios, deriva a la consejería en vez de adivinar"]
    },
    {
      "en": ["Jot the access wins and failures from the last event you went to","Draft the checklist with disabled members: entry, seating, bathrooms, sound, materials","Add an access-needs question to every RSVP form your program uses","Walk one upcoming event through the checklist and fix what fails before the date"],
      "es": ["Apunta lo que sí y lo que no funcionó de acceso en el último evento al que fuiste","Arma la lista con miembros con discapacidad: entrada, asientos, baños, sonido, materiales","Agrega una pregunta de necesidades de acceso a cada formulario de inscripción","Pasa un evento próximo por la lista y corrige lo que falle antes de la fecha"]
    }
  ],
  "books-to-prisoners": [
    {
      "en": ["Look up the mail policy page for one nearby facility on your phone","Call or email the mailroom to ask for the current book policy in writing","Save the policy as a dated file and note when to re-verify it","Repeat for the second facility and jot down which rules differ","Write the deal-breaker rules (new only, no hardcovers) on one index card"],
      "es": ["Busca en tu teléfono la política de correo de una institución cercana","Llama o escribe al área de correspondencia para pedir la política de libros por escrito","Guarda la política en un archivo con fecha y anota cuándo volver a verificarla","Repite con la segunda institución y apunta qué reglas cambian","Escribe en una tarjeta las reglas sin excepción: solo nuevos, sin pasta dura"]
    },
    {
      "en": ["Text one friend to ask for paperback dictionaries or novels they'd donate","Ask a church, library, or garage for a corner with a table for packing","Post a donation call listing only what facilities accept — paperbacks in good shape","Set a cull box at the door for hardcovers and marked-up books before sorting","Sort what's left into rough shelves: dictionaries, fiction, education, reentry"],
      "es": ["Escríbele a una amistad para pedirle diccionarios o novelas de bolsillo que done","Consigue un rincón con mesa para empacar en una iglesia, biblioteca o cochera","Publica una convocatoria pidiendo solo lo que aceptan: libros de bolsillo en buen estado","Pon una caja de descarte en la entrada para pasta dura y libros rayados","Ordena lo que quede en secciones: diccionarios, ficción, educación, reingreso"]
    },
    {
      "en": ["Grab a notebook or open a spreadsheet with columns: name, ID number, unit, request","Enter the letters you have, copying each name and ID exactly as written","Add a request date and a sent column so nothing sits unanswered","Pick one box or folder where every incoming letter lands before entry"],
      "es": ["Toma un cuaderno o abre una hoja con columnas: nombre, número, unidad, pedido","Captura las cartas que tengas, copiando nombre y número tal como los escribieron","Agrega fecha de solicitud y una columna de enviado para que nada quede sin respuesta","Elige una caja o carpeta donde caiga cada carta entrante antes de capturarla"]
    },
    {
      "en": ["Text two friends who love books and invite them to a packing evening","Print the facility rules as a one-page checklist and tape it above the packing table","Walk each new volunteer through packing one parcel while you watch","Say the norm out loud: a second person checks every box before it's taped"],
      "es": ["Escríbele a dos amistades lectoras e invítalas a una tarde de empaque","Imprime las reglas en una lista de una página y pégala sobre la mesa de empaque","Acompaña a cada persona nueva mientras empaca su primer paquete","Di la norma en voz alta: una segunda persona revisa cada caja antes de sellarla"]
    },
    {
      "en": ["Look up the Media Mail rate for a two-pound book parcel","Ask the group chat for postage donations with a concrete amount per parcel","Put a recurring mailing day on the calendar and invite two helpers","Write a rule card for packers: no personal letters inside Media Mail parcels"],
      "es": ["Busca cuánto cuesta enviar un paquete de libros por Media Mail, la tarifa económica","Pide en el chat del grupo donativos de franqueo con una cifra concreta por paquete","Agenda un día fijo de envíos en el calendario e invita a dos personas a ayudar","Escribe una tarjeta de regla: nada de cartas personales dentro de envíos Media Mail"]
    },
    {
      "en": ["Ask one volunteer if they'd like to pilot the pen-pal program","Write the two boundary rules on a card: program address only, first names only","Draft a kind, firm reply to money or romance requests and share it with writers","Match the first pair and set a check-in after their first exchange"],
      "es": ["Pregunta a una persona voluntaria si quiere estrenar el programa de correspondencia","Escribe las dos reglas en una tarjeta: solo la dirección del programa y nombres de pila","Redacta una respuesta amable y firme para pedidos de dinero o romance y compártela","Haz la primera pareja y agenda una plática después de su primer intercambio"]
    }
  ],
  "community-music": [
    {
      "en": ["Post one ask for playable instruments in a group chat or local online group","Text a music shop to ask about discounted repairs for a community program","Play-test or open each case before accepting — skip free pianos and major cracks","Pick up the yeses and tag each instrument with what repair it needs","Drop the fixable ones at the shop and note the promised date"],
      "es": ["Publica un mensaje pidiendo instrumentos en buen estado en un chat o grupo local","Escríbele a una tienda de música y pregunta por reparaciones con descuento","Prueba o abre cada estuche antes de aceptar — rechaza pianos gratis y grietas grandes","Recoge los que digan que sí y etiqueta cada uno con la reparación que necesita","Deja los reparables en la tienda y anota la fecha prometida"]
    },
    {
      "en": ["Open a blank sheet with columns: number, type, condition, who has it, date out","Put a numbered sticker or tag on every instrument","Photograph each instrument's condition and file the photos by number","Write a three-line checkout note: care basics, return window, no repair bills","Test the system by checking one instrument out to yourself"],
      "es": ["Abre una hoja con columnas: número, tipo, estado, quién lo tiene, fecha de salida","Pon una etiqueta numerada a cada instrumento","Fotografía el estado de cada instrumento y guarda las fotos por número","Escribe una nota de préstamo de tres líneas: cuidado, plazo, sin cobros por daños","Prueba el sistema registrando un préstamo a tu nombre"]
    },
    {
      "en": ["Text the two musicians you already know and ask if they'd teach a beginner","Ask the church, school band, and senior center to name patient players","Meet each yes for ten minutes to hear what and when they'd teach","Start background checks now for anyone who'll teach kids","Write names, instruments, and available times in one shared list"],
      "es": ["Escríbele a dos músicos que ya conozcas y pregunta si le enseñarían a un principiante","Pide nombres de gente paciente en la iglesia, la banda y el centro de adultos mayores","Reúnete diez minutos con cada sí para saber qué enseñarían y cuándo","Inicia ya la verificación de antecedentes de quienes darán clases a menores","Anota nombres, instrumentos y horarios disponibles en una sola lista compartida"]
    },
    {
      "en": ["List three noise-tolerant rooms nearby: community center, school, faith hall","Call or visit each and ask about evenings and weekend afternoons specifically","Ask the friendliest yes about a locked closet for storing instruments","Walk the room once at your planned hour to check noise and neighbors","Get the okay in writing, with your exact days and times named"],
      "es": ["Anota tres salas cercanas que aguanten ruido: centro comunitario, escuela, iglesia","Llama o visita cada una y pregunta en concreto por tardes y fines de semana","Donde te digan que sí, pregunta por un clóset con llave para guardar instrumentos","Recorre la sala una vez a la hora prevista para revisar ruido y vecinos","Consigue el visto bueno por escrito, con tus días y horarios exactos"]
    },
    {
      "en": ["Text your teachers one message asking for their two best weekly time slots","Draft a first-month calendar with lessons plus one jam labeled beginners only","Set up sign-up: a paper sheet at the space and one phone number to text","Confirm the calendar with the space host before announcing anything","Post the schedule where families already look and pin it in the group chat"],
      "es": ["Manda a tus docentes un solo mensaje pidiendo sus dos mejores horarios semanales","Arma el calendario del primer mes con clases y una jam solo para principiantes","Prepara la inscripción: una hoja en el local y un número para mandar mensajes","Confirma el calendario con el sitio anfitrión antes de anunciar nada","Publica los horarios donde las familias ya miran y fíjalos en el chat del grupo"]
    },
    {
      "en": ["Jot three care rules for the instrument type you know best","Add the key line in bold: if something breaks, bring it back — don't fix it at home","Ask one of your teachers to check the sheet for anything wrong or missing","Print copies and tuck one into every case before it goes out","Say the broken-instrument line out loud at each checkout"],
      "es": ["Apunta tres reglas de cuidado para el tipo de instrumento que mejor conoces","Agrega en negritas la línea clave: si algo se rompe, tráelo — no lo arregles en casa","Pídele a una de tus profes que revise la hoja por si algo falta o está mal","Imprime copias y mete una en cada estuche antes de que salga","Di la línea del instrumento roto en voz alta en cada préstamo"]
    }
  ],
  "school-supply-program": [
    {
      "en": ["Look up the front-office number for the nearest school and save it in your phone","Call or email to ask for the counselor or family liaison by name","Ask them for the exact per-grade supply lists, brands included","Ask for a realistic count of families who'd need a backpack","Type the lists and count into one doc and share it with the project"],
      "es": ["Busca el teléfono de la escuela más cercana y guárdalo en tu celular","Llama o escribe pidiendo hablar con la consejera o el enlace con familias","Pídele las listas de útiles exactas por grado, marcas incluidas","Pregúntale cuántas familias necesitarían mochila, un número realista","Pasa las listas y el conteo a un solo documento y compártelo con el proyecto"]
    },
    {
      "en": ["Pull up the supply lists and circle the five most-needed basics","Price those basics by the case at two bulk or wholesale stores","Place one bulk order for pencils, paper, and glue before the drive starts","Ask two shops or congregations to host a donation bin for the fun extras","Set a weekly reminder to empty bins and tally what's still missing"],
      "es": ["Abre las listas de útiles y marca los cinco básicos que más se necesitan","Cotiza esos básicos por caja en dos tiendas mayoristas","Haz un pedido al por mayor de lápices, hojas y pegamento antes de la colecta","Pide a dos comercios o iglesias que pongan un buzón para los extras divertidos","Ponte un recordatorio semanal para vaciar buzones y anotar lo que aún falta"]
    },
    {
      "en": ["Print one copy of each grade's supply list","Text three volunteers a date and time for a packing session","Set up one table per grade with its list taped where packers can see it","Pack assembly-line style, checking each backpack against the grade list","Leave every backpack unsealed so kids can swap items at pickup"],
      "es": ["Imprime una copia de la lista de útiles de cada grado","Escríbeles a tres voluntarios con fecha y hora para una sesión de empaque","Arma una mesa por grado con su lista pegada a la vista de quienes empacan","Empaquen en cadena, cotejando cada mochila con la lista de su grado","Deja las mochilas sin sellar para que los niños puedan cambiar cosas al recogerlas"]
    },
    {
      "en": ["Text two people who might have a dry, lockable room or garage to spare","Visit the best option and check it's dry, locks, and has shelves or pallets","Put boxes on shelves or pallets, never straight on the floor","Pick a handout spot on a bus route families already use and confirm the date"],
      "es": ["Escríbeles a dos personas que puedan tener un cuarto o garaje seco y con llave","Visita la mejor opción y revisa que esté seca, cierre bien y tenga estantes","Coloca las cajas sobre estantes o tarimas, nunca directo en el piso","Elige un punto en una ruta de autobús que las familias ya usen y confirma la fecha"]
    },
    {
      "en": ["Look up the school year's first day and put the giveaway one to two weeks before it","Ask the school liaison to spread the date through their family channels","Text your volunteer list asking who can take a two-hour shift","Set up backpacks by color so each kid picks their own","Do a walk-through the day before: no forms at the door, just a greeter and a table"],
      "es": ["Busca la fecha del primer día de clases y agenda la entrega una o dos semanas antes","Pídele al enlace escolar que corra la voz con las familias por sus canales","Escribe a tu lista de voluntarios preguntando quién toma un turno de dos horas","Acomoda las mochilas por color para que cada niño elija la suya","Recorre el lugar el día antes: sin formularios, solo una mesa y una bienvenida"]
    }
  ],
  "legal-aid-clinic": [
    {
      "en": ["Look up your legal aid office and the bar's pro bono program; save both numbers","Call each and ask what they'd need from you to send attorneys","Email the nearest law school clinic about supervised student volunteers","Ask every attorney whether their malpractice coverage extends to volunteering","Register with the bar program if that's what unlocks free coverage"],
      "es": ["Busca la oficina de ayuda legal y el programa pro bono del colegio; guarda ambos números","Llama a cada uno y pregunta qué necesitarían de ti para enviar abogados","Escribe a la clínica de derecho más cercana y pregunta por estudiantes supervisados","Pregunta a cada abogado si su seguro profesional cubre el trabajo voluntario","Registra la clínica en el programa del colegio si eso activa la cobertura gratuita"]
    },
    {
      "en": ["Text your partner attorneys one question: which three matters will you take?","List what's out of scope and where each of those cases should go instead","Get a named contact and an honest wait time at every referral org — no hotlines","Write the scope in words a neighbor could repeat back to you"],
      "es": ["Pregunta por mensaje a los abogados aliados: ¿qué tres asuntos van a atender?","Enumera lo que queda fuera y a dónde debe ir cada uno de esos casos","Consigue un contacto con nombre y un tiempo de espera honesto en cada organización","Escribe el alcance en palabras que un vecino pueda repetirte de vuelta"]
    },
    {
      "en": ["Text one partner site to ask about a room with a real door for consults","Stand in the waiting area while someone talks inside — if you hear them, keep looking","Draft a document checklist per case type: lease, notices, pay stubs, ID","Set up intake so attorneys start each session with the papers already sorted"],
      "es": ["Escribe a un sitio aliado y pregunta por una sala con puerta de verdad para consultas","Párate en la sala de espera mientras alguien habla adentro; si lo oyes, sigue buscando","Haz una lista de documentos por tipo de caso: contrato, avisos, recibos, identificación","Organiza la admisión para que cada sesión empiece con los papeles ya en orden"]
    },
    {
      "en": ["Sketch the booking sheet on paper: names and time slots, nothing else","Decide who takes appointments and where that single list lives","Keep the case's substance off every shared sheet — details belong in the room","Make reminder calls that say time and place, never the legal matter"],
      "es": ["Dibuja en papel la hoja de citas: nombres y horarios, nada más","Decide quién agenda las citas y dónde vive esa única lista","Deja el fondo del caso fuera de toda hoja compartida; los detalles van en la sala","Haz recordatorios que digan hora y lugar, nunca el asunto legal"]
    },
    {
      "en": ["Text one partner org: which rights questions come up most in your work?","Draft a single-page guide on the top topic in plain language","Have an attorney review every handout and put a date on each one","Book a room and a speaker for the first workshop","Say it aloud and in print: this is general information, not legal advice"],
      "es": ["Pregunta por mensaje a una organización aliada qué dudas de derechos surgen más","Redacta una guía de una página sobre el tema principal, en lenguaje llano","Haz que un abogado revise cada folleto y ponle fecha a cada uno","Aparta una sala y consigue quien dé el primer taller","Dilo en voz alta y por escrito: es información general, no asesoría legal"]
    },
    {
      "en": ["Text your attorneys two candidate clinic dates and ask which one holds","Set the recurring date and add it to the community calendar","Book the interpreter before advertising in any language — never a client's child","Send flyers through partner orgs rather than open social posts","Confirm each attorney the week before — a clinic with no lawyer breaks trust"],
      "es": ["Manda a tus abogados dos fechas posibles de clínica y pregunta cuál les funciona","Fija la fecha recurrente y súbela al calendario comunitario","Reserva al intérprete antes de anunciar en ese idioma; nunca el hijo de un cliente","Difunde con volantes por organizaciones aliadas, no con publicaciones abiertas","Confirma a cada abogado la semana previa; una clínica sin abogado rompe confianza"]
    },
    {
      "en": ["Start a master client list that only the coordinator can open","Write the rule: every new booking gets checked against that list first","Run the conflict check at booking time, not when the person sits down","Draft a two-line confidentiality pledge for every volunteer to sign","Walk the whole team through both rules before the first clinic opens"],
      "es": ["Crea una lista maestra de clientes que solo la coordinación pueda abrir","Escribe la regla: toda cita nueva se coteja primero contra esa lista","Haz el cotejo de conflictos al agendar, no cuando la persona se sienta","Redacta un compromiso de confidencialidad de dos líneas para que todos firmen","Repasa ambas reglas con todo el equipo antes de abrir la primera clínica"]
    }
  ],
  "resource-hub-dispatch": [
    {
      "en": ["Write down the one number or form link that will be the front door","Set up phone, form, and in-person intake asking the same short questions","Name a person and a checking schedule for every channel before you publish it","Send a test request through each channel and time how long until it's seen"],
      "es": ["Anota el único número o enlace de formulario que será la puerta de entrada","Prepara teléfono, formulario y atención en persona con las mismas preguntas breves","Asigna una persona y un horario de revisión a cada canal antes de publicarlo","Manda una solicitud de prueba por cada canal y mide cuánto tarda en verse"]
    },
    {
      "en": ["Start a sheet with columns: name, skills, availability, contact, hard limits","Message five volunteers for their availability and preferred contact method","Add each project lead and what their project can actually offer","Calendar a quarterly re-confirm — a roster of old yeses is mostly fiction"],
      "es": ["Crea una hoja con columnas: nombre, habilidades, disponibilidad, contacto y límites","Pregunta a cinco voluntarios su disponibilidad y cómo prefieren que les contacten","Agrega a cada líder de proyecto y lo que su proyecto puede ofrecer de verdad","Agenda una reconfirmación trimestral: una lista de síes viejos es casi ficción"]
    },
    {
      "en": ["Walk one recent request through on paper: who saw it, who acted, who closed it","Write the routing rules: which kind of need goes to which project or volunteer","Give every request one named owner who carries it to a real close","Set a response-time goal, with a same-day \"we can't fill this\" as the floor","Track every request's status somewhere the whole team can see"],
      "es": ["Sigue en papel una solicitud reciente: quién la vio, quién actuó, quién la cerró","Escribe las reglas de derivación: qué necesidad va a qué proyecto o voluntario","Da a cada solicitud una persona dueña con nombre que la lleve hasta el cierre","Fija una meta de respuesta, con un \"no podemos con esto\" el mismo día como mínimo","Registra el estado de cada solicitud donde todo el equipo pueda verlo"]
    },
    {
      "en": ["Start the list with your own projects — those you can write from memory","Call each outside listing as if you were a client and note the real hours","Record eligibility rules — who they take and what they ask for at the door","Date every entry and set a monthly slot to re-verify the oldest ones"],
      "es": ["Empieza la lista con los proyectos propios: esos te los sabes de memoria","Llama a cada servicio externo como si fueras usuario y anota el horario real","Registra los requisitos: a quién aceptan y qué piden en la puerta","Fecha cada entrada y aparta un rato al mes para reverificar las más viejas"]
    },
    {
      "en": ["Message three organized people about taking one dispatch shift a week","Write the shift guide so a new coordinator can run it from the page alone","Shadow each new coordinator through their first shift, then hand it over","Build the rotation so nobody covers more than two shifts in a row"],
      "es": ["Escríbeles a tres personas organizadas y proponles un turno de despacho a la semana","Escribe la guía del turno para que alguien nuevo lo cubra solo con la hoja","Acompaña a cada persona nueva en su primer turno y luego entrégale el mando","Arma la rotación para que nadie cubra más de dos turnos seguidos"]
    },
    {
      "en": ["Read your intake form and cross out every field you could work without","Write the deletion rule: when a request closes, keep the count, drop the details","List who can see open requests and lock everyone else out","Add a follow-up step: confirm the need was actually met before you close it"],
      "es": ["Lee el formulario de admisión y tacha cada campo sin el que podrías trabajar","Escribe la regla de borrado: al cerrar, guarda el conteo y descarta los detalles","Enumera quién puede ver solicitudes abiertas y cierra el acceso a los demás","Agrega un paso de seguimiento: confirma que la necesidad se cubrió antes de cerrar"]
    },
    {
      "en": ["Add an \"unfilled\" tag or column to your request tracker right now","Pick a fixed set of categories so the entries add up instead of scattering","Log every miss the moment it happens, not from memory at month's end","Tally the misses monthly and bring the biggest gap to the next planning meeting"],
      "es": ["Agrega ahora mismo una etiqueta o columna de \"sin cubrir\" a tu registro","Elige categorías fijas para que los registros sumen en vez de dispersarse","Anota cada falla en el momento en que ocurre, no de memoria a fin de mes","Suma las fallas cada mes y lleva la brecha mayor a la próxima reunión de planeación"]
    }
  ],
  "harm-reduction-supplies": [
    {
      "en": ["Search for the nearest harm reduction org or health-department naloxone training","Email or call them: introduce the crew and ask when the next free training runs","Book training slots for everyone who'll distribute — no exceptions","Ask about distributing under their legal umbrella and standing order"],
      "es": ["Busca la organización de reducción de daños o capacitación de naloxona más cercana","Escríbeles o llámalos: presenta al equipo y pregunta cuándo es la próxima capacitación","Aparta lugar para cada persona que va a distribuir, sin excepciones","Pregunta si tu equipo puede distribuir bajo su paraguas legal y orden permanente"]
    },
    {
      "en": ["Email your partner org or a legal aid clinic to ask what's legal to carry here","Ask specifically about test strips and syringes, not just naloxone","Write down the statute or the source's name, with the date you checked","Turn it into a one-page card every volunteer carries"],
      "es": ["Escríbele a la organización aliada o a una clínica legal: ¿qué es legal portar aquí?","Pregunta en específico por tiras reactivas y jeringas, no solo por la naloxona","Anota la ley concreta o el nombre de la fuente, con la fecha en que lo verificaste","Conviértelo en una tarjeta de una página que cada voluntario lleve consigo"]
    },
    {
      "en": ["Look up your state's naloxone distribution program or pharmacy standing order","Place the order, plus whatever your legal list allows: strips, wound care, hygiene","Check expiration dates the day the box arrives and note them where you'll see them","Store everything away from heat and cold — no car trunks, no sheds"],
      "es": ["Busca el programa estatal de distribución de naloxona o la orden permanente de farmacia","Haz el pedido, más lo que permita tu lista legal: tiras, curación de heridas, higiene","Revisa las fechas de caducidad el día que llegue la caja y anótalas donde las veas","Guarda todo lejos del calor y del frío: nada de maleteros ni cobertizos"]
    },
    {
      "en": ["Ask your partner org to send a sample kit insert you can copy","Draft yours: spot an overdose, give naloxone, call emergency services, never use alone","Get it translated into the languages your neighbors actually speak","Call every number on the insert before you print hundreds of copies","Run an assembly line, one person per station: bag, insert, supplies, seal"],
      "es": ["Pídele a la organización aliada un instructivo de muestra para copiar","Redacta el tuyo: detectar sobredosis, dar naloxona, llamar a emergencias, nunca a solas","Haz que lo traduzcan a los idiomas que de verdad se hablan en tu zona","Llama a cada número del instructivo antes de imprimir cientos de copias","Arma una línea de ensamblaje, una persona por paso: bolsa, instructivo, insumos, sello"]
    },
    {
      "en": ["Ask one bar or corner store you already know to keep a no-questions box","Walk the route with your partner org and let them introduce you where they're known","Pick fixed days and times for rounds and keep them identical every week","Give each host box one named contact who restocks it"],
      "es": ["Pídele a un bar o tiendita que ya conozcas que acepte una caja sin preguntas","Recorre la ruta con la organización aliada y deja que te presenten donde los conocen","Fija días y horarios para los recorridos y mantenlos idénticos cada semana","Dale a cada caja anfitriona un contacto con nombre que la reponga"]
    },
    {
      "en": ["Start a tally sheet: item, count out, date — track supplies moved, never people","Log every naloxone expiration date with a reminder a month before","Walk the fixed points monthly and refill before boxes sit empty","Book a refresher training whenever new volunteers join"],
      "es": ["Empieza una hoja de conteo: insumo, cantidad, fecha — cuenta insumos, nunca personas","Registra cada fecha de caducidad de la naloxona con recordatorio un mes antes","Recorre los puntos fijos cada mes y reabastece antes de que las cajas queden vacías","Agenda un repaso cada vez que se sumen personas voluntarias nuevas"]
    }
  ],
  "court-support": [
    {
      "en": ["Look up the public defender's office number and the local court-watch group","Send one short email offering extra hands and asking how they prefer contact","Ask each group what would actually help — then listen, don't pitch","Visit the courthouse once with a court-watch member to see how they work","Note each contact's name, role, and preferred channel in one shared list"],
      "es": ["Busca el número de la defensoría pública y el grupo local de observación de cortes","Manda un correo corto ofreciendo manos extra y preguntando cómo prefieren el contacto","Pregunta a cada grupo qué ayudaría de verdad — y escucha, no vendas tu plan","Visita el juzgado una vez con alguien de observación de cortes para ver cómo trabajan","Anota nombre, rol y canal preferido de cada contacto en una sola lista"]
    },
    {
      "en": ["Open a note and write the headline rule: we never give legal advice","Add the exact script: \"I can't advise on that — ask your lawyer\"","List courtroom conduct: arrive early, dress plainly, phones off, no reactions","Add the hallway rule: no case talk anywhere a prosecutor could overhear","Send the draft to a public defender contact for a quick sanity check"],
      "es": ["Abre una nota y escribe la regla principal: nunca damos asesoría legal","Agrega el guion exacto: \"no puedo asesorar sobre eso, pregúntele a su abogado\"","Lista la conducta en sala: llegar temprano, ropa sencilla, celulares apagados, sin gestos","Suma la regla del pasillo: nada del caso donde un fiscal pueda oír","Envía el borrador a tu contacto en la defensoría para una revisión rápida"]
    },
    {
      "en": ["Text the group asking whose phone number can take support requests","Make a shared calendar with date, courtroom, and what each person needs","Bookmark the court's online docket and practice looking up one case","Set a standing reminder: verify each date against the docket the afternoon before","Ask each person, not the paperwork, whether they need a ride or childcare too"],
      "es": ["Pregunta en el chat del grupo qué número de teléfono recibirá los pedidos de apoyo","Arma un calendario compartido con fecha, sala y lo que cada persona necesita","Guarda el enlace del registro del tribunal y practica buscar una causa","Pon un recordatorio fijo: verificar cada fecha en el registro la tarde anterior","Pregúntale a la persona, no al papeleo, si necesita transporte o quién cuide a sus hijos"]
    },
    {
      "en": ["Text volunteers two quiet-morning options for a courthouse walkthrough","Walk them through security: the 30-minute line, banned pocketknives, phone rules","Show them the courtroom: where to sit and how to wait three hours calmly","Rehearse the no-advice script in pairs until it comes out automatically","Pair every new volunteer with an experienced one for their first court date"],
      "es": ["Manda a tus voluntarios dos opciones de mañana tranquila para recorrer el juzgado","Explícales seguridad: la fila de 30 minutos, navajas prohibidas, reglas del teléfono","Enséñales la sala: dónde sentarse y cómo esperar tres horas con calma","Ensayen en parejas el guion de no dar consejos hasta que salga solo","Empareja a cada voluntario nuevo con alguien con experiencia para su primera audiencia"]
    },
    {
      "en": ["Text members asking who can drive weekday mornings and who can watch kids","Make a roster with each driver's mornings and each childcare pair's availability","Assign a primary and a backup driver to every hearing — never just one","Confirm the primary driver and the childcare pair the night before, every time","Check which courtrooms allow children so childcare plans match the building"],
      "es": ["Escribe al grupo: ¿quién puede manejar entre semana y quién puede cuidar niños?","Arma una lista con las mañanas de cada conductor y la disponibilidad de cada pareja","Asigna conductor principal y de respaldo a cada audiencia — nunca uno solo","Confirma al conductor principal y a la pareja de cuidado la noche anterior, siempre","Averigua qué salas permiten menores para que el plan de cuidado cuadre"]
    },
    {
      "en": ["Reply to the attorney asking for content, addressee, and deadline in writing","List the neighbors who know the person well and text each one the ask","Send writers the attorney's guidance and one good example letter","Collect every letter and hold it for the attorney's review before anything is sent","Track who promised a letter and nudge them three days before the deadline"],
      "es": ["Responde al abogado pidiendo por escrito contenido, destinatario y plazo","Haz la lista de vecinos que conocen bien a la persona y escríbele a cada uno","Mándales la pauta del abogado y una carta de ejemplo a quienes van a escribir","Reúne cada carta y retenla para revisión del abogado antes de enviar nada","Anota quién prometió carta y mándales un recordatorio tres días antes del plazo"]
    }
  ],
  "cooling-warming-center": [
    {
      "en": ["List three candidates with real AC and heat: the library, a faith hall, a union hall","Call one today and ask for twenty minutes with whoever holds the keys","Walk the room checking bathrooms, step-free entry, and outlet locations","Ask the uncomfortable questions now: hours, keys, insurance, overnight stays","Get the okay in writing and plan to test the AC or heat on a truly extreme day"],
      "es": ["Anota tres lugares con buen aire y calefacción: biblioteca, iglesia, salón sindical","Llama hoy a uno y pide veinte minutos con quien tenga las llaves","Recorre la sala revisando baños, entrada sin escalones y enchufes","Haz ya las preguntas incómodas: horarios, llaves, seguro, quedarse de noche","Consigue el sí por escrito y prueba el aire o la calefacción un día realmente extremo"]
    },
    {
      "en": ["Look up the weather service's heat index and wind chill advisory thresholds","Propose exact numbers to the group — a forecast figure, not \"when it's bad\"","Name one person with the authority to call an activation, plus a backup","Make the group chat or phone tree and run one test alert today","Write the trigger and the caller's name where every host can see them"],
      "es": ["Busca los umbrales de índice de calor y sensación térmica del servicio meteorológico","Propón cifras exactas al grupo — un número del pronóstico, no \"cuando esté feo\"","Nombra a una persona con autoridad para activar el centro, más un respaldo","Arma el chat grupal o la cadena telefónica y haz una alerta de prueba hoy","Escribe el umbral y el nombre de quien decide donde cada anfitrión lo vea"]
    },
    {
      "en": ["Write the list: water, electrolytes, blankets, cots, fans, chargers, first aid","Post one ask to members for what can be donated and price the rest","Do one shopping run and drive everything to the site","Pack labeled bins so a brand-new host finds anything in seconds","Tape a contents list inside the storage closet door"],
      "es": ["Haz la lista: agua, electrolitos, cobijas, catres, ventiladores, cargadores, botiquín","Publica una petición a miembros por lo donable y cotiza el resto","Haz una sola vuelta de compras y lleva todo al sitio","Arma cajas etiquetadas para que un anfitrión nuevo encuentre todo en segundos","Pega una lista de contenido por dentro de la puerta del armario"]
    },
    {
      "en": ["Message members asking who could sit a four-hour shift in extreme weather","Book one two-hour training at the site and invite every yes","Drill the signs of heat stroke and hypothermia until hosts can name them cold","Say it plainly: call 911 early, and nobody is ever second-guessed for calling","Practice a no-paperwork greeting and one de-escalation script in pairs"],
      "es": ["Escribe a miembros: ¿quién podría cubrir un turno de cuatro horas en clima extremo?","Agenda una capacitación de dos horas en el sitio e invita a cada sí","Practica las señales de golpe de calor e hipotermia hasta saberlas de memoria","Dilo claro: llamen temprano a emergencias, y nadie será cuestionado por llamar","Ensayen en parejas una bienvenida sin papeleo y un guion de desescalada"]
    },
    {
      "en": ["Sketch the shift grid for one activation day: openers, daytime blocks, closers","Fill every slot with two names — never one host alone","Ask three more people to be a named reserve for when weather flattens hosts","Share the rota in the group chat and confirm each person saw their slot","Run one dry-run activation call to see how fast the grid actually fills"],
      "es": ["Dibuja la cuadrícula de turnos de un día de activación: apertura, bloques, cierre","Llena cada turno con dos nombres — nunca una persona anfitriona sola","Pide a tres personas más quedar de reserva por si el clima tumba a algún anfitrión","Comparte la rotación en el chat y confirma que cada quien vio su turno","Haz un simulacro de activación para ver qué tan rápido se llena la cuadrícula"]
    },
    {
      "en": ["List where at-risk neighbors already go: clinics, senior buildings, corner stores","Draft one plain-language flyer with the triggers, address, and hours","Ask members to translate it into the neighborhood's other languages","Hand stacks to meal-delivery drivers, building managers, and outreach workers","Finish the rounds weeks before the season turns — not during the first heat wave"],
      "es": ["Lista a dónde ya va la gente en riesgo: clínicas, edificios de adultos mayores, tienditas","Redacta un volante en lenguaje simple con los umbrales, la dirección y los horarios","Pide a miembros traducirlo a los otros idiomas del barrio","Da paquetes a repartidores de comida, encargados de edificio y trabajadores de calle","Termina el recorrido semanas antes de la temporada — no en la primera ola"]
    },
    {
      "en": ["Text your co-host to confirm the shift and who holds the keys","Arrive an hour early, start the AC or heat, and set water by the door","Keep a loose tally of visitors — a count, not IDs","Gently rouse anyone sleeping to check on them; a nap can hide heat stroke","After closing, clean and restock the bins, and note what ran short"],
      "es": ["Escríbele a tu pareja de turno para confirmar y ver quién lleva las llaves","Llega una hora antes, prende el aire o la calefacción y deja agua en la puerta","Lleva un conteo suelto de visitas — un número, no identificaciones","Despierta con suavidad a quien duerma para ver cómo está; una siesta puede engañar","Al cerrar, limpia, reabastece las cajas y anota qué se acabó"]
    }
  ],
  "community-oral-history": [
    {
      "en": ["Open a blank note and list what you'll record and where it could end up","Draft one page: what's recorded, sharing options, right to pause, skip, or withdraw","Make sharing separate checkboxes: name or no name, family only, public online","Add your phone number so a storyteller can change their mind later","Ask someone to translate it into the languages your storytellers speak"],
      "es": ["Abre una nota en blanco y lista qué grabarás y dónde podría terminar","Redacta una página: qué se graba, opciones de compartir, derecho a pausar o retirar","Divide el compartir en casillas separadas: con nombre o sin él, solo familia, público","Agrega tu teléfono para que la persona pueda cambiar de opinión después","Pídele a alguien que lo traduzca a los idiomas que hablan tus narradores"]
    },
    {
      "en": ["Open your phone's voice memo app and check your free storage","Record a 30-second test in the room you'll use and listen back for hum or echo","Write eight open questions like \"tell me about the street when you arrived\"","Practice a ten-minute interview on a friend and cut the questions that fell flat"],
      "es": ["Abre la app de notas de voz de tu teléfono y revisa el espacio libre","Graba una prueba de 30 segundos en la sala que usarás y busca zumbidos o eco","Escribe ocho preguntas abiertas como \"cuéntame cómo era la calle cuando llegaste\"","Ensaya diez minutos con alguien de confianza y quita las preguntas que caigan flojas"]
    },
    {
      "en": ["Text one elder who trusts you and ask for an hour at their kitchen table","Charge your phone, clear storage, and put the consent form and questions in a bag","Go through the consent form together before pressing record","If a story turns raw, pause and ask again whether that part is okay to keep","Before leaving, book the next session or ask who they'd introduce you to"],
      "es": ["Escríbele a una persona mayor que confíe en ti y pídele una hora en su cocina","Carga tu teléfono, libera espacio y mete el formulario y las preguntas en una bolsa","Repasen juntos el formulario de consentimiento antes de apretar grabar","Si la historia se pone dura, pausa y vuelve a preguntar si esa parte se queda","Antes de irte, agenda la próxima sesión o pregunta a quién más podrías entrevistar"]
    },
    {
      "en": ["Rename this week's recording now: date, storyteller's name, sharing agreement","Copy it to a second, genuinely different place — cloud plus phone, not one laptop","Get the storyteller their own copy, on a USB stick or by whatever app they use","Re-read the consent form before posting anything public, and honor any change"],
      "es": ["Renombra ya la grabación de esta semana: fecha, nombre y acuerdo de compartir","Cópiala a un segundo lugar realmente distinto — nube y teléfono, no una sola laptop","Entrega su copia a quien narró, en una memoria USB o por la app que use","Relee el consentimiento antes de publicar algo y respeta cualquier cambio"]
    }
  ]
};

/**
 * The suggested starter steps for one live task, in the viewer's
 * language, or null.
 *
 * Same title→index recovery as `getTaskTips`: a `ProjectTask.title`
 * is the template task's `name` verbatim at instantiation, in
 * whichever locale created the project; both orders are identical by
 * the template parity guard, so matching en first and es second finds
 * the same index either way. Drift (renamed/added task, unknown
 * template) yields null and the affordance doesn't render.
 */
export function getTaskSteps(
  templateId: string | null | undefined,
  taskTitle: string,
  locale: string,
): string[] | null {
  if (!templateId) return null;
  const steps = TASK_STEPS[templateId];
  if (!steps) return null;
  const en = getTemplate(templateId, "en");
  if (!en) return null;
  let idx = en.tasks.findIndex((t) => t.name === taskTitle);
  if (idx < 0) {
    const es = getTemplate(templateId, "es");
    idx = es ? es.tasks.findIndex((t) => t.name === taskTitle) : -1;
  }
  if (idx < 0) return null;
  const entry = steps[idx];
  if (!entry) return null;
  const list = locale.startsWith("es") ? entry.es : entry.en;
  return list && list.length > 0 ? [...list] : null;
}
