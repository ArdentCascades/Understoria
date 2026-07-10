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
import { getTemplate } from "@/content/projectTemplates";

// Per-task tips — one short, task-specific pointer shown on a task's own
// page ("Tips for this task"). Authored content, kept OUT of the giant
// projectTemplates.ts table and off the federated ProjectTask so it stays
// content-only (no schema churn, nothing to sync). Both locales live here
// side by side, index-aligned to each template's `tasks` array; the
// en/es task order is parity-locked in projectTemplates.test.ts, so the
// index recovered from a live task's title resolves the same tip in
// either language. Coverage (every template task has a non-empty en+es
// tip) is CI-pinned in taskTips.test.ts.
export const TASK_TIPS: Record<
  string,
  readonly { readonly en: string; readonly es: string }[]
> = {
  "community-fridge": [
    {
      "en": "Confirm the outlet is a dedicated outdoor GFCI that stays live after closing — plenty of storefront exterior plugs are wired to an inside switch someone flips off at night, and the fridge warms up by morning.",
      "es": "Confirma que el enchufe sea una toma exterior GFCI dedicada que quede encendida después de cerrar — muchos contactos exteriores de locales están conectados a un interruptor interno que alguien apaga de noche, y el refrigerador se calienta para la mañana."
    },
    {
      "en": "Run any donated fridge for a full day before you build around it — and leave a hand's width of clearance behind it, since a boxed-in condenser overheats and quits in the first heat wave.",
      "es": "Haz funcionar cualquier refrigerador donado un día entero antes de construir a su alrededor — y deja una cuarta de espacio detrás, porque un condensador encerrado se sobrecalienta y se apaga en la primera ola de calor."
    },
    {
      "en": "Laminate the sign or it's mush after the first rain — and phrase the 'no' list as safety, not scolding, so people trust the fridge instead of feeling policed.",
      "es": "Plastifica el cartel o quedará hecho papilla tras la primera lluvia — y redacta la lista de 'no' como seguridad, no como regaño, para que la gente confíe en el refrigerador en lugar de sentirse vigilada."
    },
    {
      "en": "Put two names on each shift, not one — a single no-show is how a fridge goes a week without a wipe-down. A dated log taped inside lets the next person see when it was last cleaned.",
      "es": "Pon dos nombres en cada turno, no uno — una sola ausencia es como un refrigerador pasa una semana sin limpiarse. Una bitácora con fecha pegada por dentro deja ver a la siguiente persona cuándo se limpió por última vez."
    },
    {
      "en": "Tell wary grocers about Good Samaritan food-donation protections — fear of liability is the usual 'no,' and knowing they're covered flips it to yes. Then lock a fixed pickup time.",
      "es": "Cuéntales a los comercios desconfiados sobre las protecciones legales para quienes donan alimentos — el miedo a la responsabilidad suele ser el 'no', y saberse cubiertos lo vuelve un 'sí'. Luego fija una hora de recolección."
    },
    {
      "en": "Use a shared line or a free Google Voice number, not one volunteer's personal cell — when that person moves or burns out, the number on the fridge shouldn't die with them.",
      "es": "Usa una línea compartida o un número gratuito de Google Voice, no el celular personal de una persona voluntaria — cuando esa persona se muda o se agota, el número del refrigerador no debería morir con ella."
    }
  ],
  "community-garden": [
    {
      "en": "Nail down two things in writing that handshakes skip: who pays for water, and how much notice the owner must give before reclaiming the lot — a garden evicted mid-season loses a whole year's work.",
      "es": "Deja por escrito dos cosas que los acuerdos de palabra saltan: quién paga el agua, y cuánto aviso debe dar quien es dueña antes de recuperar el terreno — un huerto desalojado a media temporada pierde el trabajo de todo un año."
    },
    {
      "en": "Take samples from several spots, not one — lead pools near old painted walls and fence lines. Send the test weeks before build day, because results lag and you can't plan beds until they're back.",
      "es": "Toma muestras de varios puntos, no de uno — el plomo se concentra cerca de muros viejos pintados y líneas de cerca. Envía la prueba semanas antes del día de construcción, porque los resultados tardan y no puedes planear las camas hasta tenerlos."
    },
    {
      "en": "Skip railroad ties and old pressure-treated lumber for edible beds — they leach creosote and arsenic into your food. Untreated cedar, cinder block, or straw bales are safer.",
      "es": "Evita durmientes de vía y madera tratada vieja en camas de comida — filtran creosota y arsénico a tus alimentos. El cedro sin tratar, el bloque de concreto o las pacas de paja son más seguros."
    },
    {
      "en": "Write the boring clauses now: what happens to a plot when someone disappears mid-season, and who inherits the tools if the group dissolves. Deciding while everyone's friendly saves the friendship later.",
      "es": "Escribe ahora las cláusulas aburridas: qué pasa con una parcela cuando alguien desaparece a media temporada, y quién hereda las herramientas si el grupo se disuelve. Decidir mientras todos son amigos salva la amistad después."
    },
    {
      "en": "Anchor your dates to your local last-frost date, not the calendar or a seed packet from another climate — one surprise frost can wipe a whole opening-weekend planting.",
      "es": "Ancla tus fechas a la última helada local, no al calendario ni a un sobre de semillas de otro clima — una helada sorpresa puede arrasar toda una siembra del fin de semana de apertura."
    },
    {
      "en": "Assign the July and August slots first — that's when the rota collapses and beds die, not spring. Water at dawn, not midday, so it soaks in instead of evaporating off hot leaves.",
      "es": "Asigna primero los turnos de julio y agosto — es cuando la rotación se desmorona y las camas mueren, no en primavera. Riega al amanecer, no al mediodía, para que el agua penetre en vez de evaporarse sobre las hojas calientes."
    },
    {
      "en": "Pick often even when no one's hungry — beans, cucumbers, and zucchini stop producing the moment they're left to go to seed. Route surplus to the fridge same-day; wilted greens help no one.",
      "es": "Cosecha seguido aunque nadie tenga hambre — los ejotes, pepinos y calabacitas dejan de producir en cuanto se les deja madurar. Lleva el excedente al refrigerador el mismo día; las verduras marchitas no ayudan a nadie."
    }
  ],
  "tool-lending-library": [
    {
      "en": "Pick a spot that's dry and lockable, and solve returns before opening: a labeled drop bin or after-hours slot means you're not the only door to the whole collection.",
      "es": "Elige un lugar seco y con cerradura, y resuelve las devoluciones antes de abrir: un buzón etiquetado o una ranura para después del horario evita que seas la única puerta a toda la colección."
    },
    {
      "en": "Plug in and run every power tool before you accept it — a drill that spins free but stalls under load is scrap. Check cords for nicks and that blade guards still work; those are the injuries you'll be liable for.",
      "es": "Enchufa y haz funcionar cada herramienta eléctrica antes de aceptarla — un taladro que gira libre pero se atasca bajo carga es chatarra. Revisa que los cables no estén pelados y que las guardas de las hojas sirvan; esas son las lesiones de las que serás responsable."
    },
    {
      "en": "Note each tool's replacement cost in the catalog now — it's the number you'll want when deciding whether a never-returned item is worth chasing. Tag your library's name on each tool so 'I thought it was mine' can't happen.",
      "es": "Anota ahora el costo de reemplazo de cada herramienta en el catálogo — es el número que querrás al decidir si vale la pena perseguir algo que nunca se devolvió. Etiqueta el nombre de tu biblioteca en cada herramienta para que 'creí que era mía' no ocurra."
    },
    {
      "en": "A short liability waiver at signup matters more than late fees — spell out that borrowers use tools at their own risk. Keep deposits off everyday items so cost isn't a barrier; reserve them for the one or two pricey things.",
      "es": "Una breve exención de responsabilidad al inscribirse importa más que las multas por retraso — deja claro que quien pide usa las herramientas bajo su propio riesgo. Mantén los depósitos fuera de los artículos cotidianos para que el costo no sea barrera; resérvalos para la una o dos cosas caras."
    },
    {
      "en": "Grab a phone number you'll actually text later, not just a name — the reminder nudge is what gets tools back, and you can't send it to a signature. Confirm the number on the spot.",
      "es": "Toma un número de teléfono al que de verdad puedas mandar mensaje después, no sólo un nombre — el recordatorio es lo que hace volver las herramientas, y no puedes enviarlo a una firma. Confirma el número en el momento."
    },
    {
      "en": "Teach the awkward parts, not just checkout: how to decline a broken donation kindly, and how to note damage on return without making the borrower feel accused. Show them where the first-aid kit and eye protection live.",
      "es": "Enseña las partes incómodas, no sólo el préstamo: cómo rechazar con amabilidad una donación rota, y cómo anotar un daño en la devolución sin que quien pidió se sienta acusado. Muéstrales dónde están el botiquín y la protección para los ojos."
    },
    {
      "en": "Log every 'do you have…?' you can't fill — that list, not your guesses, tells you what to buy next. Sharpen and oil on a set date so upkeep doesn't quietly become never.",
      "es": "Registra cada '¿tienen…?' que no puedas cumplir — esa lista, no tus suposiciones, te dice qué comprar después. Afila y aceita en una fecha fija para que el mantenimiento no se vuelva 'nunca' en silencio."
    }
  ],
  "neighborhood-care-network": [
    {
      "en": "Keep this 'map' in your head or somewhere locked, not a shared spreadsheet — a list of isolated, vulnerable neighbors is exactly what you don't want leaking. Let trusted gatekeepers make the introduction rather than cold-knocking.",
      "es": "Guarda este 'mapa' en tu cabeza o en un lugar bajo llave, no en una hoja de cálculo compartida — una lista de vecinas y vecinos aislados y vulnerables es justo lo que no quieres que se filtre. Deja que personas de confianza hagan la presentación en vez de tocar puertas en frío."
    },
    {
      "en": "Actually call the references — don't just collect them. Two people who'll vouch, plus a firm 'never handle a neighbor's cash or keys alone' rule, screens out the rare bad actor drawn to exactly this access.",
      "es": "Llama de verdad a las referencias — no sólo las juntes. Dos personas que respondan por alguien, más una regla firme de 'nunca manejar solo el dinero o las llaves de un vecino', filtran al raro mal actor atraído justo por ese acceso."
    },
    {
      "en": "Frame the first pairing as a trial, and give both people a graceful, no-explanation way out — a mismatch that no one can exit becomes an obligation, and obligations get dropped cold.",
      "es": "Plantea el primer emparejamiento como una prueba, y da a ambas personas una salida elegante y sin explicaciones — una incompatibilidad de la que nadie puede salir se vuelve una obligación, y las obligaciones se abandonan de golpe."
    },
    {
      "en": "Pin the check-in to a consistent day and time so a missed one is noticeable — 'she always answers Tuesdays' is what turns a silent phone into a signal instead of a shrug.",
      "es": "Fija el chequeo a un día y hora constantes para que uno perdido se note — 'ella siempre contesta los martes' es lo que convierte un teléfono en silencio en una señal y no en un encogimiento de hombros."
    },
    {
      "en": "Ask each neighbor now who they want called in a crisis — and whether that's family, not police. A wellness check can go badly for undocumented, disabled, or Black neighbors; honor their preference before it's an emergency.",
      "es": "Pregunta ahora a cada vecino a quién quiere que se llame en una crisis — y si eso es a la familia, no a la policía. Una visita de bienestar puede terminar mal para vecinos indocumentados, con discapacidad o afrodescendientes; honra su preferencia antes de que sea una emergencia."
    },
    {
      "en": "Keep volunteers to non-clinical help — rides, groceries, a shoveled walk. The moment it drifts into medication doses, wound care, or lifting someone, that's a trained professional's job, and saying so protects everyone.",
      "es": "Mantén a las personas voluntarias en ayuda no clínica — traslados, compras, una acera despejada. En cuanto se desliza a dosis de medicamentos, curación de heridas o levantar a alguien, ese es el trabajo de un profesional capacitado, y decirlo protege a todos."
    },
    {
      "en": "Rotate people before they're fried, not after they quit — by the time someone says they're burned out, they've usually been carrying it for months. A private debrief also catches the grief when a neighbor they cared for declines.",
      "es": "Rota a la gente antes de que esté agotada, no después de que renuncie — para cuando alguien dice que está quemado, suele llevar meses cargándolo. Una conversación privada también recoge el duelo cuando un vecino al que cuidaban se deteriora."
    }
  ],
  "emergency-preparedness": [
    {
      "en": "Check your area's actual FEMA flood and wildfire maps instead of guessing — and note who runs medical equipment on power, since utilities keep priority-restoration lists those neighbors can sign up for now.",
      "es": "Revisa los mapas reales de inundación e incendio de tu zona en vez de adivinar — y anota quién depende de la electricidad para equipo médico, ya que las compañías de servicios llevan listas de restablecimiento prioritario en las que esos vecinos pueden inscribirse desde ahora."
    },
    {
      "en": "Store the paper roster in at least two homes, not one — the whole tree is useless if it's in the one house that floods. Mark who needs a knock instead of a call, and which language, right on the sheet.",
      "es": "Guarda el directorio en papel en al menos dos casas, no en una — todo el árbol es inútil si está en la única casa que se inunda. Marca en la hoja quién necesita que le toquen la puerta en vez de una llamada, y en qué idioma."
    },
    {
      "en": "Agree on one radio channel and a fixed check-in time — 'top of every hour' — or everyone's transmitting into dead air. Actually test the radios across the neighborhood's real distance before you count on them.",
      "es": "Acuerden un solo canal de radio y una hora fija de contacto — 'al inicio de cada hora' — o todos estarán transmitiendo al vacío. Prueba de verdad las radios a la distancia real del vecindario antes de depender de ellas."
    },
    {
      "en": "Water and batteries expire — tape a rotation date on the kit and put it on the same calendar as the roster refresh. Store it where two or three people can reach it, so a locked door isn't between you and the supplies.",
      "es": "El agua y las pilas caducan — pega una fecha de rotación en el kit y ponla en el mismo calendario que la actualización del directorio. Guárdalo donde dos o tres personas puedan alcanzarlo, para que una puerta cerrada con llave no esté entre tú y los suministros."
    },
    {
      "en": "Confirm three things a handshake skips: who holds the key at 2 a.m., whether the generator has fuel stored, and if the space is wheelchair-accessible. A safe spot you can't get into is just a building.",
      "es": "Confirma tres cosas que un acuerdo de palabra salta: quién tiene la llave a las 2 de la mañana, si el generador tiene combustible guardado, y si el espacio es accesible para silla de ruedas. Un lugar seguro al que no puedes entrar es sólo un edificio."
    },
    {
      "en": "Have people physically find their gas and water shutoffs and the wrench it takes — reading about it doesn't count. Time the contact tree end to end; you'll find the broken link now instead of during a flood.",
      "es": "Haz que la gente localice físicamente las llaves de paso de gas y agua y la herramienta que se necesita — leer sobre ello no cuenta. Cronometra el árbol de contactos de principio a fin; encontrarás el eslabón roto ahora y no durante una inundación."
    },
    {
      "en": "Name a backup for every role — the block captain may be the one trapped or out of town when it hits. Two-deep on the medically-vulnerable checks especially; that's the list that can't wait.",
      "es": "Nombra un suplente para cada rol — quien es capitán de cuadra puede ser justo la persona atrapada o fuera de la ciudad cuando pase. Doble cobertura sobre todo en los chequeos a personas médicamente vulnerables; esa es la lista que no puede esperar."
    }
  ],
  "free-store": [
    {
      "en": "Favor a ground-floor spot with a curb you can pull up to — you'll be hauling carloads in and out, and a third-floor walk-up burns your volunteers before doors open. A fixed recurring date builds the habit that keeps it alive.",
      "es": "Prefiere un lugar en planta baja con un borde de banqueta al que puedas arrimarte — vas a acarrear cargas de autos para dentro y para fuera, y un tercer piso sin elevador agota a tu gente antes de abrir. Una fecha fija y recurrente crea el hábito que lo mantiene vivo."
    },
    {
      "en": "Post the 'no' list at the drop-off door, not just inside — sorting happens too late. Add used car seats, helmets, and mattresses to it: their safety expires invisibly, and a bedbug in one donation can close your store.",
      "es": "Pon la lista de 'no' en la puerta de recepción de donaciones, no sólo adentro — clasificar ocurre demasiado tarde. Súmale sillas de auto usadas, cascos y colchones: su seguridad caduca de forma invisible, y una chinche en una donación puede cerrar tu tienda."
    },
    {
      "en": "Sort at the door, before anything reaches a table — a broken toaster that makes it to the shelf just becomes your problem twice. Keep a labeled 'onward' bin going all day so the reject pile never becomes a mountain.",
      "es": "Clasifica en la puerta, antes de que algo llegue a una mesa — un tostador roto que alcanza el estante sólo se vuelve tu problema dos veces. Mantén todo el día un contenedor etiquetado de 'para reenviar' para que la pila de rechazos nunca se vuelva una montaña."
    },
    {
      "en": "Put out less than you have and restock from the back as it thins — a half-empty, tidy table reads as dignified shopping; a crammed, dumped pile reads as 'here's our garbage.'",
      "es": "Saca menos de lo que tienes y reabastece desde atrás a medida que se vacía — una mesa medio vacía y ordenada se lee como compra digna; un montón amontonado se lee como 'aquí está nuestra basura'."
    },
    {
      "en": "Brief greeters to never ask why someone's there or how much they're taking — the no-questions rule is the whole point, and one nosy volunteer undoes it. Keep one person floating to tidy so the space never looks ransacked.",
      "es": "Indica a quienes reciben que nunca pregunten por qué alguien está ahí ni cuánto se lleva — la regla de no hacer preguntas es todo el punto, y una sola persona voluntaria entrometida la deshace. Deja a alguien circulando para ordenar y que el espacio nunca luzca saqueado."
    },
    {
      "en": "Confirm your partner charity's hours and what they actually take before the event, not after — plenty won't accept mattresses, electronics, or partial sets. Load out the same day so you hand the space back empty and keep the host.",
      "es": "Confirma el horario de tu organización aliada y qué acepta de verdad antes del evento, no después — muchas no reciben colchones, electrónicos ni juegos incompletos. Saca todo el mismo día para devolver el espacio vacío y conservar al anfitrión."
    }
  ],
  "skill-share": [
    {
      "en": "The best teachers usually call their skill 'nothing special.' Skip 'what are you an expert in?' and ask what people always come to them for help with.",
      "es": "Los mejores maestros suelen decir que su habilidad 'no tiene nada de especial'. En vez de preguntar '¿en qué eres experto?', pregunta para qué le piden ayuda siempre."
    },
    {
      "en": "The fear is dead air, so help each first-timer plan the first five minutes minute by minute; once hands are busy and people are talking, the nerves fade on their own.",
      "es": "El miedo es al silencio incómodo, así que planea con cada principiante los primeros cinco minutos paso a paso; una vez que las manos se ocupan y la gente habla, los nervios se van solos."
    },
    {
      "en": "Match the room to what the session actually needs before booking — a cooking class in a room with no sink fails mid-session. And confirm who unlocks and locks up.",
      "es": "Ajusta la sala a lo que la sesión realmente necesita antes de reservar: una clase de cocina en un salón sin lavabo fracasa a mitad de camino. Y confirma quién abre y cierra el lugar."
    },
    {
      "en": "Confirm each teacher the week before their session. A no-show teacher with a published time costs you the attendees who did come — and some of them won't come back.",
      "es": "Confirma con cada maestro la semana previa a su sesión. Un maestro que no aparece, con horario ya publicado, le cuesta a los asistentes que sí llegaron, y algunos no vuelven."
    },
    {
      "en": "Ask the specific people who aren't showing up, not the room that already came. The barrier is usually one concrete thing — a bus that stops at seven, nowhere to put the kids.",
      "es": "Pregunta a las personas concretas que no están viniendo, no a quienes ya llegaron. La barrera suele ser algo puntual: un autobús que deja de pasar a las siete, o no tener con quién dejar a los niños."
    }
  ],
  "bulk-buying-coop": [
    {
      "en": "Recruit about a fifth more households than the supplier minimum. Every cycle a few will skip, and an order that falls short either won't ship or ships at a worse price for everyone.",
      "es": "Recluta una quinta parte más de hogares que el mínimo del proveedor. En cada ciclo algunos se saltarán su turno, y un pedido que no llega al mínimo no se envía o se envía a peor precio para todos."
    },
    {
      "en": "Ask for the delivery minimum, the short-shipment policy, and whether prices lock at order or at delivery. A 'great price' that floats until delivery can wreck your split math.",
      "es": "Pregunta por el mínimo de entrega, la política ante faltantes y si el precio se fija al pedir o al entregar. Un 'buen precio' que cambia hasta la entrega puede arruinar el reparto."
    },
    {
      "en": "Lock the sheet at the cutoff — copy it and close edits — so no late change alters quantities after the coordinator has already totaled the order and paid the supplier.",
      "es": "Cierra la hoja en la fecha límite: haz una copia y bloquea las ediciones, para que ningún cambio tardío altere las cantidades después de que el coordinador ya sumó el pedido y pagó al proveedor."
    },
    {
      "en": "Price to the penny per unit and round up, not down. The fractions you absorb compound across a cycle, and the buffer should cover a dropped bag of rice, not sit there as slush.",
      "es": "Calcula el precio por unidad al centavo y redondea hacia arriba, no hacia abajo. Las fracciones que absorbes se acumulan en el ciclo, y el margen debe cubrir un saco de arroz que se rompe, no quedar como sobrante."
    },
    {
      "en": "Confirm how the truck actually unloads — liftgate, pallet jack, or just dropped at the curb. A half-ton pallet with no way off the truck is a rough thing to learn on delivery morning.",
      "es": "Confirma cómo descarga realmente el camión: plataforma elevadora, transpaleta o simplemente dejado en la acera. Una tarima de media tonelada sin forma de bajarla es algo duro de descubrir la mañana de la entrega."
    },
    {
      "en": "Tare the container every time and weigh straight into the bag each household takes. Eyeballing 'about a pound' of a six-dollar staple is where both trust and money quietly leak.",
      "es": "Pon la balanza en cero con cada envase y pesa directo en la bolsa que se lleva cada hogar. Calcular 'como medio kilo' a ojo de un producto caro es donde se fugan, callados, la confianza y el dinero."
    },
    {
      "en": "Write down what the coordinator actually did this cycle while it's fresh. The role only rotates smoothly if the next person inherits a checklist instead of a mystery.",
      "es": "Anota lo que el coordinador realmente hizo este ciclo mientras lo recuerdas. El rol solo rota sin problemas si la próxima persona hereda una lista de pasos y no un misterio."
    }
  ],
  "repair-cafe": [
    {
      "en": "Your electronics and appliance fixers draw the longest lines and burn out first — recruit two before you open, and steer easy wins like hems and loose screws to newer hands.",
      "es": "Quienes reparan electrónica y electrodomésticos atraen las filas más largas y se agotan primero: recluta a dos antes de abrir y deriva los arreglos fáciles, como dobladillos y tornillos sueltos, a manos nuevas."
    },
    {
      "en": "Keep soldering, heat, and battery work away from the crowd and near ventilation, and run power through a few surge strips you've tested — tripping the venue's breaker stalls every station at once.",
      "es": "Mantén la soldadura, el calor y el trabajo con baterías lejos del público y cerca de la ventilación, y lleva la corriente por regletas con protección ya probadas: si salta el interruptor del local, se detienen todas las estaciones a la vez."
    },
    {
      "en": "A fixed day-of-month — first Saturday, say — beats a floating date. People remember a rhythm, and your fixers can hold the slot months ahead instead of renegotiating each time.",
      "es": "Un día fijo del mes, digamos el primer sábado, funciona mejor que una fecha variable. La gente recuerda un ritmo, y tus reparadores pueden apartar ese espacio con meses de anticipación en vez de renegociarlo cada vez."
    },
    {
      "en": "Log a rough triage at intake — likely fixable, long shot, or needs a part — so nobody waits an hour in line only to hear their toaster was never coming back.",
      "es": "Registra una clasificación rápida en la recepción: probablemente reparable, difícil, o necesita repuesto, para que nadie espere una hora en la fila solo para enterarse de que su tostadora no tenía arreglo."
    },
    {
      "en": "Draw a hard line on opened mains-powered gear and swollen batteries: a fixer who isn't sure says no, and that's the right call, not a failure. Post it so no one takes the no personally.",
      "es": "Traza un límite firme con aparatos de corriente abiertos y baterías hinchadas: un reparador que no está seguro dice que no, y esa es la decisión correcta, no un fracaso. Publícalo para que nadie lo tome como algo personal."
    },
    {
      "en": "Keep a shared box and a running tally sheet at each station. The patch or fuse always runs out the day nobody checked, and 'who bought the thread last time' is a fight worth heading off.",
      "es": "Mantén una caja común y una hoja de conteo en cada estación. El parche o el fusible siempre se acaban el día que nadie revisó, y '¿quién compró el hilo la última vez?' es una discusión que más vale evitar."
    }
  ],
  "rides-transportation": [
    {
      "en": "See the physical documents — don't take 'yeah, I'm covered.' A photo of the current license and insurance card in the file is what protects everyone the day something actually goes wrong.",
      "es": "Ve los documentos físicos; no te conformes con un 'sí, estoy cubierto'. Una foto de la licencia y la tarjeta de seguro vigentes en el expediente es lo que protege a todos el día en que algo sale mal."
    },
    {
      "en": "Ask each driver's insurer in writing whether volunteer driving is covered. Many personal policies exclude anything that looks like a service, and you want that answer before a claim, not after.",
      "es": "Pregunta por escrito a la aseguradora de cada conductor si cubre el manejo voluntario. Muchas pólizas personales excluyen lo que parezca un servicio, y quieres tener esa respuesta antes de un reclamo, no después."
    },
    {
      "en": "Capture the return trip and any mobility equipment up front. A rider stranded at a clinic because the wheelchair didn't fit the car is the failure people remember longest.",
      "es": "Registra desde el inicio el viaje de regreso y cualquier equipo de movilidad. Un pasajero varado en una clínica porque la silla de ruedas no cabía en el auto es la falla que la gente más recuerda."
    },
    {
      "en": "Confirm with both driver and rider the day before, out loud or in writing. A silent assumption that the ride is still on is exactly how someone misses a dialysis appointment.",
      "es": "Confirma con el conductor y el pasajero el día anterior, de viva voz o por escrito. Dar por hecho en silencio que el viaje sigue en pie es justo la forma en que alguien pierde una cita de diálisis."
    },
    {
      "en": "Name plainly what you don't do — no emergencies, no last-minute, edges of the map — so a 'no' lands as a known rule rather than a personal rejection at a bad moment.",
      "es": "Di con claridad lo que no hacen: nada de emergencias, nada de último minuto, ni los bordes del mapa, para que un 'no' se entienda como una regla conocida y no como un rechazo personal en un mal momento."
    },
    {
      "en": "Never let a rider's inability to chip in show. Keep any contribution genuinely optional and invisible at the moment of the ride, or you've quietly rebuilt the very barrier you set out to remove.",
      "es": "Nunca dejes que se note si un pasajero no puede aportar. Mantén cualquier contribución verdaderamente opcional e invisible en el momento del viaje, o habrás reconstruido en silencio la misma barrera que querías eliminar."
    },
    {
      "en": "Pair a driver's first ride with a familiar rider or a second volunteer, and check in afterward. The ride log isn't red tape — it's what you'll wish you had if a concern ever surfaces.",
      "es": "Empareja el primer viaje de un conductor con un pasajero conocido o un segundo voluntario, y haz un seguimiento después. El registro de viajes no es burocracia: es lo que desearás tener si alguna vez surge una preocupación."
    }
  ],
  "tenant-union": [
    {
      "en": "Choose people who can keep a confidence, not just the loudest voices. This work runs on tenants trusting the committee with real retaliation risk, and a single leak ends that trust.",
      "es": "Elige a personas que sepan guardar una confidencia, no solo a las voces más fuertes. Este trabajo depende de que los inquilinos confíen al comité un riesgo real de represalias, y una sola filtración acaba con esa confianza."
    },
    {
      "en": "Never write a tenant's name beside their complaint where a landlord might see it — code the units, keep the key separate, and ask before recording anyone at all.",
      "es": "Nunca escribas el nombre de un inquilino junto a su queja donde un arrendador pueda verlo: codifica las unidades, guarda la clave por separado y pide permiso antes de anotar a cualquier persona."
    },
    {
      "en": "Date-stamp every fact and note the statute behind it. Tenant law shifts, and 'someone told me last year' is how a union hands out a deadline that's already wrong.",
      "es": "Pon fecha a cada dato y anota la ley que lo respalda. Las normas para inquilinos cambian, y 'alguien me dijo el año pasado' es como un sindicato termina dando un plazo que ya es incorrecto."
    },
    {
      "en": "Run a drill before you need it, and set a realistic response promise. A phone tree nobody has ever tested goes silent at exactly the moment someone is being locked out.",
      "es": "Haz un simulacro antes de necesitarlo y fija una promesa de respuesta realista. Una cadena telefónica que nadie ha probado se queda muda justo en el momento en que a alguien lo dejan fuera de su vivienda."
    },
    {
      "en": "End with the concrete first move for someone served papers — the deadline and the number to call — because that's the one thing a frightened tenant will actually carry home from the night.",
      "es": "Termina con el primer paso concreto para quien recibe una notificación: el plazo y el número al que llamar, porque eso es lo único que un inquilino asustado realmente se llevará a casa esa noche."
    },
    {
      "en": "Put the court-response deadline first and in bold. Missing it usually loses the case by default, no matter how strong the tenant's side actually is.",
      "es": "Pon primero y en negrita el plazo para responder ante el tribunal. No cumplirlo suele hacer perder el caso por incomparecencia, por más sólida que sea la posición del inquilino."
    },
    {
      "en": "Learn each partner's intake hours and capacity, not just their phone number. A referral to a clinic that's full or closed until Monday isn't a handoff when the deadline is Friday.",
      "es": "Conoce los horarios de admisión y la capacidad de cada aliado, no solo su número de teléfono. Derivar a una clínica llena o cerrada hasta el lunes no es una entrega real cuando el plazo vence el viernes."
    }
  ],
  "childcare-collective": [
    {
      "en": "Talk through discipline and screen-time differences now, out loud. The blowup is rarely about the schedule — it's the day someone parents your child in a way you'd never allow.",
      "es": "Habla ahora, en voz alta, sobre las diferencias en disciplina y tiempo de pantalla. El conflicto casi nunca es por el horario: es el día en que alguien cría a tu hijo de una forma que jamás permitirías."
    },
    {
      "en": "Write the never-alone rule as the one you apply hardest with the families you trust most. The 'just this once' exception with a close friend is exactly where these collectives break.",
      "es": "Redacta la regla de nunca-a-solas como la que aplicas con más firmeza justo con las familias en las que más confías. La excepción de 'solo por esta vez' con un buen amigo es precisamente donde estos colectivos se rompen."
    },
    {
      "en": "Get down to a child's eye level and crawl the room — cords, tippy furniture, a visitor's purse with medication in it. The hazards an adult scans past are the ones a toddler finds first.",
      "es": "Ponte a la altura de los ojos de un niño y recorre la sala a gatas: cables, muebles que se vuelcan, el bolso de una visita con medicinas dentro. Los peligros que un adulto pasa por alto son los que un pequeño encuentra primero."
    },
    {
      "en": "Make the credit balance visible to everyone from day one. Resentment grows in secret, and a family that can see it's behind will offer to host before anyone has to ask.",
      "es": "Haz visible para todos el saldo de créditos desde el primer día. El resentimiento crece en secreto, y una familia que ve que está en deuda se ofrecerá a recibir a los niños antes de que alguien tenga que pedírselo."
    },
    {
      "en": "Keep each child's allergy and medication sheet where the caregiver on duty can grab it in seconds, and settle the sick-child line before a feverish morning forces a rushed, resented call.",
      "es": "Mantén la hoja de alergias y medicamentos de cada niño donde el cuidador de turno pueda tomarla en segundos, y define la regla del niño enfermo antes de que una mañana con fiebre obligue a una decisión apurada y resentida."
    },
    {
      "en": "Drill the actual emergency — who calls, who stays with the other kids, where the emergency sheets live. Knowing infant safe-sleep matters little if nobody's clear on the first sixty seconds.",
      "es": "Ensaya la emergencia real: quién llama, quién se queda con los demás niños, dónde están las hojas de emergencia. Saber sobre el sueño seguro del bebé sirve de poco si nadie tiene claros los primeros sesenta segundos."
    },
    {
      "en": "Ask the kids how it went, not just the parents, and debrief the near-misses honestly. A smooth pilot that dodged the hard cases hasn't tested the thing that will actually strain trust.",
      "es": "Pregúntales a los niños cómo les fue, no solo a los padres, y analiza con honestidad los casi-accidentes. Un ensayo tranquilo que esquivó los casos difíciles no ha probado lo que de verdad pondrá a prueba la confianza."
    }
  ],
  "community-composting": [
    {
      "en": "Stand on the site and find the nearest water tap and the nearest neighbor's window; a pile you can't easily wet, or one right under someone's bedroom, is the one you'll be relocating by summer.",
      "es": "Párate en el sitio y ubica la llave de agua más cercana y la ventana del vecino más próximo: una pila difícil de humedecer, o pegada al dormitorio de alguien, es la que habrá que reubicar para el verano."
    },
    {
      "en": "A hot pile needs about a cubic yard of material to actually heat up and kill weed seeds — smaller than that and you've built a cold pile that just sits, whatever the bin is called.",
      "es": "Una pila caliente necesita cerca de un metro cúbico de material para calentar de verdad y matar las semillas de maleza; con menos, se arma una pila fría que solo se queda ahí, se llame como se llame el recipiente."
    },
    {
      "en": "Line up your brown material before the first scrap arrives — a leaf pile or a pallet of cardboard you can draw from — because food scraps show up daily and dry leaves only fall once a year.",
      "es": "Consigue el material café (hojas secas, cartón) antes de que llegue el primer resto de comida y guárdalo en reserva, porque los restos de comida llegan a diario y las hojas secas caen solo una vez al año."
    },
    {
      "en": "Tell people to skip the 'compostable' plastic liner bags; they don't break down in a backyard pile and become the plastic shreds you're picking out of finished compost for months.",
      "es": "Pide a la gente que no use las bolsas plásticas 'compostables': no se degradan en una pila casera y terminan como los trozos de plástico que estarás sacando del compost terminado durante meses."
    },
    {
      "en": "Put the no-list on the bin lid itself, not a nearby poster, and use pictures — a crossed-out chicken bone reads across every language faster than a paragraph does.",
      "es": "Pon la lista de lo que no se acepta en la tapa misma del contenedor, no en un cartel aparte, y usa imágenes: un hueso de pollo tachado se entiende en cualquier idioma más rápido que un párrafo."
    },
    {
      "en": "Teach the wrung-out-sponge moisture test and assign each week to a named person, not 'the team' — a shared duty with no name on it is the week the pile gets skipped.",
      "es": "Enseña la prueba de humedad de la esponja exprimida y asigna cada semana a una persona con nombre, no al 'equipo': una tarea compartida sin nombre asignado es la semana en que nadie voltea la pila."
    },
    {
      "en": "Let a finished batch cure a few extra weeks and screen out the chunks before you hand it out — compost that's still 'cooking' will burn the seedlings it's supposed to feed, and that story travels.",
      "es": "Deja que el lote terminado cure unas semanas más y tamiza los trozos antes de repartirlo: el compost que aún está 'cocinándose' quema las plántulas que debía alimentar, y esa historia corre rápido."
    }
  ],
  "free-little-library": [
    {
      "en": "The leak that ruins books isn't the roof — it's the door gap and water wicking up from the post; seal the bottom, add a lip under the door, and test it with a hose before you fill it.",
      "es": "La filtración que arruina los libros no viene del techo, sino de la ranura de la puerta y del agua que sube por el poste: sella la base, agrega un borde bajo la puerta y pruébala con una manguera antes de llenarla."
    },
    {
      "en": "Place it where people already slow down — a bus stop, a school gate — not where they drive past, and keep it clear of the sidewalk so a wheelchair or stroller can pass.",
      "es": "Colócala donde la gente ya baja el paso —una parada de autobús, la entrada de una escuela—, no donde pasan manejando, y deja libre la acera para que una silla de ruedas o un coche de bebé puedan pasar."
    },
    {
      "en": "Kids' books leave fastest and come back least, so over-stock those; and quietly recycle the water-stained or 1990s-textbook donations before they go in — one shelf of junk and people stop opening the door.",
      "es": "Los libros infantiles son los que más salen y menos regresan, así que abastécelos de sobra; y recicla discretamente los donativos manchados o los libros de texto de los años noventa antes de ponerlos: con un estante de basura, la gente deja de abrir la puerta."
    },
    {
      "en": "Word it as 'take one, leave one if you can' — if people think they owe a book back, they won't take the one they need, and the whole point was no barriers.",
      "es": "Redáctalo como 'lleve uno, deje uno si puede': si la gente cree que debe devolver un libro, no se llevará el que necesita, y la idea era justamente que no hubiera barreras."
    },
    {
      "en": "Line up a backup steward too, and tell both what to pull on sight: anything moldy, anything with a stranger's phone number written in it, and adult titles in a box kids reach into.",
      "es": "Consigue también un encargado suplente y diles a ambos qué retirar de inmediato: cualquier libro con moho, cualquiera con un número de teléfono ajeno escrito adentro y los títulos para adultos en una caja al alcance de los niños."
    }
  ],
  "community-first-aid-training": [
    {
      "en": "Ask what they charge and whether they waive it for community groups — many do — and pin down the student-per-mannequin cap, because a CPR class with more than about eight sharing one is watching, not practicing.",
      "es": "Pregunta cuánto cobran y si lo eximen para grupos comunitarios —muchos lo hacen— y fija el límite de estudiantes por maniquí, porque una clase de RCP con más de unas ocho personas compartiendo uno observa, no practica."
    },
    {
      "en": "Check the naloxone expiration dates the day they arrive and note them somewhere you'll actually see — and don't store it in a hot car or freezing shed; temperature extremes degrade it before the date does.",
      "es": "Revisa las fechas de vencimiento de la naloxona el día que llega y anótalas donde de verdad las veas; y no la guardes en un auto caluroso ni en un cobertizo helado: las temperaturas extremas la degradan antes que la fecha."
    },
    {
      "en": "You need clear floor space to kneel and do compressions, not just chairs and tables — check the room has that, plus a sink and an accessible entrance, before you book it.",
      "es": "Hace falta espacio libre en el piso para arrodillarse y hacer compresiones, no solo sillas y mesas: verifica que la sala lo tenga, además de un lavabo y una entrada accesible, antes de reservarla."
    },
    {
      "en": "Free trainings no-show at 30-40%, so confirm the day before and over-book a little; offering childcare and food does more for turnout among the people you most want there than any flyer.",
      "es": "Las capacitaciones gratuitas tienen un 30-40% de ausencias, así que confirma el día antes y reserva algunos cupos de más; ofrecer cuidado de niños y comida atrae más a las personas que más quieres tener ahí que cualquier volante."
    },
    {
      "en": "Say at the start that practice is on mannequins, nobody has to touch anyone, and people can step out during the overdose section — some in the room have lost someone, and you want them back next time.",
      "es": "Aclara al empezar que la práctica se hace con maniquíes, que nadie tiene que tocar a otra persona y que se puede salir durante la parte de sobredosis: alguien en la sala perdió a un ser querido, y quieres que regrese la próxima vez."
    },
    {
      "en": "Keep a simple list of who took naloxone and when it expires so you can nudge a refill before it lapses, and schedule the first refresher within the year — hands forget compressions faster than people expect.",
      "es": "Lleva una lista sencilla de quién se llevó naloxona y cuándo vence, para recordar la reposición antes de que caduque, y programa el primer repaso dentro del año: las manos olvidan las compresiones más rápido de lo que se cree."
    }
  ],
  "time-bank": [
    {
      "en": "Push people to name what they'd ask for, not just what they'd give — everyone lists offers and no one admits needs, and a bank where nobody spends is one where nobody earns.",
      "es": "Insiste en que la gente nombre lo que pediría, no solo lo que daría: todos enumeran ofertas y nadie admite necesidades, y un banco donde nadie gasta es uno donde nadie gana horas."
    },
    {
      "en": "Pick the simplest thing the coordinator will actually keep current, and make sure you can export the ledger — the day your one tech-savvy volunteer moves away, a locked-in app takes the whole history with it.",
      "es": "Elige lo más simple que el coordinador de verdad mantendrá al día, y asegúrate de poder exportar el registro: el día que se mude el único voluntario con maña técnica, una aplicación cerrada se lleva todo el historial consigo."
    },
    {
      "en": "Decide now what happens when someone leaves owing hours or sits deep in the negative — writing that rule while everyone's friendly is far easier than inventing it the first time it stings.",
      "es": "Decide desde ahora qué pasa cuando alguien se va debiendo horas o queda muy en negativo: escribir esa regla mientras todos están en buenos términos es mucho más fácil que inventarla la primera vez que duele."
    },
    {
      "en": "Get each new member to book one real exchange before they leave orientation — the philosophy sticks when they've spent a credit, not when they've heard the speech.",
      "es": "Logra que cada miembro nuevo agende un intercambio real antes de irse de la orientación: la filosofía se afianza cuando ha gastado un crédito, no cuando ha escuchado el discurso."
    },
    {
      "en": "List when and where people are available, not just what they can do — 'plumbing' helps no one if the member only has Tuesday mornings and no car, and a stale directory quietly teaches people to stop checking it.",
      "es": "Anota cuándo y dónde está disponible cada persona, no solo lo que sabe hacer: 'plomería' no sirve de nada si el miembro solo tiene los martes por la mañana y no tiene auto, y un directorio desactualizado enseña a la gente a dejar de consultarlo."
    },
    {
      "en": "Watch for members who've earned but never spent, or joined and never traded, and reach out by name — the quiet ones don't complain, they just drift off, and you only notice when they're already gone.",
      "es": "Fíjate en los miembros que han ganado horas pero nunca las gastan, o que se inscribieron y nunca intercambiaron, y búscalos por su nombre: los callados no se quejan, simplemente se alejan, y uno lo nota cuando ya se fueron."
    },
    {
      "en": "For in-home exchanges, offer a first meeting in public and an easy, no-questions way to decline a match — and route complaints to a person, not a form, or people quietly stop showing up.",
      "es": "Para los intercambios en casa, ofrece un primer encuentro en un lugar público y una forma fácil de rechazar un match sin dar explicaciones; y dirige las quejas a una persona, no a un formulario, o la gente dejará de aparecer sin decir nada."
    }
  ],
  "solidarity-fund": [
    {
      "en": "Keep the team small and odd-numbered so votes can't deadlock, and agree upfront that anyone recuses when a friend or relative applies — the appearance of favoritism sinks a fund as fast as the real thing.",
      "es": "Mantén el equipo pequeño y con un número impar para que los votos no se empaten, y acuerden de antemano que cualquiera se aparta cuando aplica un amigo o familiar: la apariencia de favoritismo hunde un fondo tan rápido como el favoritismo real."
    },
    {
      "en": "Never route the money through a volunteer's personal Venmo or bank account, however convenient — it blurs whose money it is, creates a tax mess for them, and looks exactly wrong when someone starts asking questions.",
      "es": "Nunca hagas pasar el dinero por el Venmo o la cuenta personal de un voluntario, por más cómodo que sea: confunde de quién es el dinero, le crea un lío de impuestos y se ve exactamente mal cuando alguien empieza a hacer preguntas."
    },
    {
      "en": "Set both a per-request cap and a monthly total you won't exceed, so a few big early asks can't empty the fund and leave you saying no to everyone in week three.",
      "es": "Fija tanto un tope por solicitud como un total mensual que no rebasarás, para que unas pocas peticiones grandes al inicio no vacíen el fondo y te dejen diciendo que no a todos en la tercera semana."
    },
    {
      "en": "Ask how they'd like to receive the money and nothing you don't truly need — no ID numbers, no landlord letters; every proof you demand is a family that quietly gives up and doesn't apply.",
      "es": "Pregunta cómo prefieren recibir el dinero y nada que no necesites de verdad: sin números de identificación, sin cartas del arrendador; cada comprobante que exiges es una familia que se rinde en silencio y no aplica."
    },
    {
      "en": "Lean on recurring small pledges over a single big drive — a fund that gets $200 every month can promise help next month, while one that raised $5,000 once is already rationing by fall.",
      "es": "Apóyate en aportes pequeños y recurrentes más que en una sola gran campaña: un fondo que recibe 200 dólares cada mes puede prometer ayuda el mes que viene, mientras que uno que recaudó 5.000 dólares una vez ya está racionando para el otoño."
    },
    {
      "en": "Set a small amount two people can approve same-day without a full meeting — when someone's power shuts off Friday, a decision that waits for Tuesday's group call isn't help, it's paperwork.",
      "es": "Define un monto pequeño que dos personas puedan aprobar el mismo día sin una reunión completa: cuando a alguien le cortan la luz un viernes, una decisión que espera a la llamada grupal del martes no es ayuda, es papeleo."
    },
    {
      "en": "Report totals and counts, never stories — even a 'de-identified' anecdote about a single mom on Elm Street is recognizable to the neighbors, and one recipient feeling exposed will scare off the next ten who need help.",
      "es": "Informa totales y cifras, nunca historias: incluso una anécdota 'anonimizada' sobre una madre soltera de la calle Olmo la reconocen los vecinos, y un solo beneficiario que se sienta expuesto ahuyentará a los diez siguientes que necesitan ayuda."
    }
  ],
  "diaper-hygiene-bank": [
    {
      "en": "Diapers and pads wick moisture and draw pests, so pick storage that's genuinely dry and sealed — and site the hand-out spot so a family isn't collecting them in front of the whole waiting room.",
      "es": "Los pañales y las toallas sanitarias absorben la humedad y atraen plagas, así que elige un almacenamiento realmente seco y sellado; y ubica el punto de entrega de modo que una familia no los recoja frente a toda la sala de espera."
    },
    {
      "en": "Check whether a diaper-bank network or wholesaler will sell to you at case prices — drives bring a flood of newborn sizes, but the 4s, 5s, and 6s families actually run out of you'll usually have to buy.",
      "es": "Averigua si una red de bancos de pañales o un mayorista te venderá a precio de caja: las campañas traen una avalancha de tallas de recién nacido, pero las tallas 4, 5 y 6 que a las familias de verdad se les acaban casi siempre habrá que comprarlas."
    },
    {
      "en": "Break big cases down into ready-to-hand-out bundles as they arrive, not at the door — and count by size every time, because 'we have diapers' means nothing when it's all size 1 and every request is for size 5.",
      "es": "Divide las cajas grandes en paquetes listos para entregar a medida que llegan, no en la puerta; y cuenta por talla cada vez, porque 'tenemos pañales' no significa nada cuando todo es talla 1 y cada solicitud es de talla 5."
    },
    {
      "en": "Be upfront that a monthly allotment (often around 25-50 diapers) is a supplement, not a full supply — families budget better around an honest number than around a vague 'as many as we have.'",
      "es": "Sé claro en que una asignación mensual (a menudo de unos 25 a 50 pañales) es un complemento, no el suministro completo: las familias se organizan mejor con una cifra honesta que con un vago 'los que tengamos'."
    },
    {
      "en": "Hold it the same day and time every cycle so families can plan their month around it, and coach volunteers to just hand the package over — no questions about the baby, no proof, no story required.",
      "es": "Realízala el mismo día y a la misma hora cada ciclo para que las familias puedan planear su mes en torno a ella, y capacita a los voluntarios para simplemente entregar el paquete: sin preguntas sobre el bebé, sin comprobantes, sin exigir ninguna historia."
    }
  ],
  "community-bike-workshop": [
    {
      "en": "A dozen donated bikes swallow floor space fast — measure for wall or vertical hooks before you sign, and check the space locks up well enough that a rack of frames won't walk overnight.",
      "es": "Una docena de bicicletas donadas ocupa el suelo enseguida; mide para ganchos de pared o verticales antes de firmar, y verifica que el lugar cierre lo bastante bien como para que un estante de cuadros no desaparezca de un día para otro."
    },
    {
      "en": "Trace each tool's outline on a pegboard so a missing wrench is obvious at closing — open workshops lose tools fast, and hunting for the 15mm kills a session's momentum.",
      "es": "Dibuja el contorno de cada herramienta en un panel perforado para que al cerrar se note enseguida cuál falta; los talleres abiertos pierden herramientas rápido, y buscar la llave de 15 mm frena el ritmo de la sesión."
    },
    {
      "en": "Set a hard \"no\" on rusted big-box specials before the calls go out — they cost more hours than a working bike is worth, and \"we'll get to it\" is how a yard fills with scrap.",
      "es": "Pon un \"no\" rotundo a las bicicletas de supermercado oxidadas antes de lanzar la convocatoria: cuestan más horas de las que vale una bicicleta funcional, y el \"ya lo haremos\" es como un patio termina lleno de chatarra."
    },
    {
      "en": "The strongest mechanic and the best teacher are rarely the same person — watch whether a candidate can sit on their hands and let a beginner fumble the bolt, because that's the whole job here.",
      "es": "El mejor mecánico y el mejor maestro rara vez son la misma persona; observa si la persona candidata sabe quedarse quieta y dejar que quien empieza batalle con el perno, porque de eso se trata todo aquí."
    },
    {
      "en": "Give each earn-a-bike learner a punch card or logged hours any mechanic can read — progress that lives only in one volunteer's memory evaporates the week they're out sick.",
      "es": "Dale a cada persona del programa \"gánate una bici\" una tarjeta o un registro de horas que cualquier mecánico pueda leer; el avance que solo vive en la memoria de un voluntario se esfuma la semana en que se enferma."
    },
    {
      "en": "Make the brakes-and-tires check a signed line on a card, ideally by someone other than the builder — a fresh set of eyes catches the loose quick-release that the person who's been on it all afternoon won't.",
      "es": "Convierte la revisión de frenos y llantas en una línea firmada en una tarjeta, de preferencia por alguien distinto de quien armó la bici; una mirada fresca detecta el cierre rápido flojo que no verá quien lleva toda la tarde en ello."
    }
  ],
  "newcomer-translation-network": [
    {
      "en": "Conversational fluency isn't interpreting fluency — ask a candidate to relay a medical or housing sentence in both directions before you count them, and match dialects, not just languages.",
      "es": "La fluidez para conversar no es la fluidez para interpretar; pídele a la persona candidata que traslade una frase médica o de vivienda en ambos sentidos antes de contar con ella, y empareja dialectos, no solo idiomas."
    },
    {
      "en": "Note for each listing whether they ask for ID or status and which languages they actually staff — sending someone to a place that turns them away at the door costs trust you won't easily rebuild.",
      "es": "Anota en cada entrada si piden identificación o estatus y qué idiomas atienden de verdad; mandar a alguien a un lugar que lo rechaza en la puerta cuesta una confianza que no se recupera fácil."
    },
    {
      "en": "Log requests by first name and a callback number, nothing more — a tidy spreadsheet of who needs what, tied to real identities, is exactly the record that can be subpoenaed or leaked.",
      "es": "Registra las solicitudes solo con el nombre de pila y un número de contacto, nada más; una hoja de cálculo ordenada de quién necesita qué, ligada a identidades reales, es justo el registro que puede filtrarse o pedirse por orden judicial."
    },
    {
      "en": "Have someone from each language community read the draft aloud before you print — machine or word-for-word translation of rights and transit info reads as nonsense, or worse, as wrong instructions.",
      "es": "Haz que alguien de cada comunidad lingüística lea el borrador en voz alta antes de imprimir; la traducción automática o palabra por palabra de derechos e información de transporte suena a disparate o, peor, a instrucciones equivocadas."
    },
    {
      "en": "Brief volunteers to voice everything in the first person and add nothing — the moment an interpreter starts answering for the provider or the client, both stop trusting the room, and someone's care suffers.",
      "es": "Instruye a los voluntarios para que digan todo en primera persona y no agreguen nada; en cuanto un intérprete empieza a responder por el proveedor o por la persona, ambos dejan de confiar y la atención de alguien se resiente."
    },
    {
      "en": "Write down how long you keep anything and who can be told \"we don't collect that\" — decide your answer to a records request now, calmly, not in the moment an official is standing at the table.",
      "es": "Deja por escrito cuánto tiempo se conserva cada dato y a quién se le puede decir \"eso no lo recopilamos\"; mejor decidir con calma ahora la respuesta a una solicitud de expedientes, y no en el momento en que un funcionario está parado frente a la mesa."
    }
  ],
  "community-meal": [
    {
      "en": "Before you fall for a pretty hall, check the unglamorous things an inspector will: a separate hand-wash sink, hot water, and enough fridge space — a kitchen that can't pass is a kitchen you can't use.",
      "es": "Antes de enamorarte de un salón bonito, revisa lo poco vistoso que revisará un inspector: un lavamanos aparte, agua caliente y suficiente refrigeración; una cocina que no aprueba es una cocina que no se puede usar."
    },
    {
      "en": "Ask the health department specifically about charitable-meal exemptions — many places have a lighter path for volunteer kitchens — and start the food-handler card now, because the class often books out weeks ahead.",
      "es": "Pregúntale a la autoridad sanitaria específicamente por las exenciones para comidas benéficas —en muchos lugares hay una vía más sencilla para cocinas de voluntarios— y saca ya el carné de manipulador de alimentos, porque el curso suele llenarse con semanas de anticipación."
    },
    {
      "en": "Pin donors to a specific day and amount rather than \"whatever's left\" — a menu planned around a promise that doesn't show up means a grocery run an hour before service, every week.",
      "es": "Compromete a cada donante con un día y una cantidad concretos, no con \"lo que sobre\"; un menú planeado sobre una promesa que no llega significa una carrera al supermercado una hora antes de servir, cada semana."
    },
    {
      "en": "One naturally vegetarian, nut- and shellfish-free main that everyone eats beats a separate \"allergy plate\" you'll forget under pressure — cook down to the strictest need and label it anyway.",
      "es": "Un plato principal naturalmente vegetariano, sin frutos secos ni mariscos, que todos puedan comer, es mejor que un \"plato para alergias\" aparte que se olvidará con la prisa; cocina para la necesidad más estricta y aun así etiquétalo."
    },
    {
      "en": "Roster more hands than a shift strictly needs and cross-train a second lead cook from week one — the meal that hinges on one person showing up is one flu away from cancelled.",
      "es": "Convoca más manos de las que un turno necesita en rigor y forma a un segundo cocinero principal desde la primera semana; la comida que depende de que una sola persona se presente está a una gripe de cancelarse."
    },
    {
      "en": "Pick a day and time you can hold for a year, not the most ambitious one — people arrange their week around a meal they can count on, and a cancelled night teaches them not to rely on you.",
      "es": "Elige un día y una hora que se puedan sostener durante un año, no los más ambiciosos; la gente organiza su semana en torno a una comida con la que puede contar, y una noche cancelada le enseña a no depender de ustedes."
    },
    {
      "en": "Get leftovers into shallow pans and the fridge inside two hours — food held warm on the counter \"to deal with after cleanup\" is exactly how a good meal makes someone sick the next day.",
      "es": "Pasa las sobras a recipientes poco profundos y al refrigerador antes de dos horas; la comida que se deja tibia en la mesa \"para atender después de limpiar\" es justo como una buena comida enferma a alguien al día siguiente."
    }
  ],
  "seed-library": [
    {
      "en": "Keep the cabinet off exterior walls and away from sunny windows and heat vents — it's humidity and temperature swings, not age alone, that kill seed, so cool and dry beats a prominent spot.",
      "es": "Mantén el mueble alejado de los muros exteriores, las ventanas soleadas y las salidas de calefacción; lo que mata la semilla es la humedad y los cambios de temperatura, no solo la edad, así que fresco y seco vale más que un lugar vistoso."
    },
    {
      "en": "Skip the pink- or blue-coated treated seed and the patented hybrids — treated seed isn't safe to handle casually, and hybrids won't grow true if anyone tries to save them back.",
      "es": "Descarta las semillas tratadas con recubrimiento rosa o azul y los híbridos patentados; la semilla tratada no se manipula sin cuidado, y los híbridos no salen iguales si alguien intenta guardarlos."
    },
    {
      "en": "Write the year big on every envelope and shelve oldest-in-front — when a whole batch is a color-coded \"easy for beginners,\" a first-timer can self-serve without a steward hovering.",
      "es": "Escribe el año en grande en cada sobre y coloca los más viejos al frente; cuando un lote entero está marcado por color como \"fácil para principiantes\", quien llega por primera vez puede servirse solo sin que un encargado esté encima."
    },
    {
      "en": "Cap how many packets of one variety a person takes so an enthusiast doesn't clear the drawer, and frame returns as a gift, not a debt — guilt-tripping borrowers just means they stop coming.",
      "es": "Limita cuántos sobres de una misma variedad se lleva cada persona para que un entusiasta no vacíe el cajón, y plantea la devolución como un regalo, no como una deuda; hacer sentir culpable a quien pide solo logra que deje de venir."
    },
    {
      "en": "Test a doubtful batch with ten seeds in a damp paper towel for a week — if fewer than six sprout, pull it rather than send a beginner home with seed that was never going to come up.",
      "es": "Prueba un lote dudoso con diez semillas en una toalla de papel húmeda durante una semana; si brotan menos de seis, mejor retirarlo que mandar a un principiante a casa con semilla que nunca iba a germinar."
    }
  ],
  "digital-literacy": [
    {
      "en": "Get the donor to sign out of their iCloud or Google account before it leaves their hands — an activation-locked tablet is a paperweight no wipe will fix, and chasing them down later rarely works.",
      "es": "Pídele a quien dona que cierre su cuenta de iCloud o Google antes de entregar el equipo; una tableta bloqueada por activación es un pisapapeles que ningún borrado arregla, y localizar a la persona después casi nunca funciona."
    },
    {
      "en": "Tag each device and log its serial with the loan — and lend the charger as a numbered set, because the single most common \"lost\" item isn't the laptop, it's the power brick nobody wrote down.",
      "es": "Etiqueta cada equipo y anota su número de serie junto con el préstamo, y presta el cargador como un conjunto numerado, porque lo que más se \"pierde\" no es la laptop, sino el adaptador que nadie registró."
    },
    {
      "en": "Check the data cap before you hand over a hotspot — a plan that throttles after a few gigs won't survive one telehealth video call, and the borrower blames the device, not the plan.",
      "es": "Revisa el límite de datos antes de entregar un punto de acceso; un plan que se ralentiza tras unos cuantos gigas no aguanta una sola videollamada de telesalud, y quien lo recibe culpará al equipo, no al plan."
    },
    {
      "en": "Run a quick role-play where the tutor must talk a nervous beginner through a task without touching the device — the hardest habit to break is reaching for the mouse, and you want it broken before a real learner is in the chair.",
      "es": "Haz un breve juego de roles en el que el tutor guíe a un principiante nervioso por una tarea sin tocar el equipo; el hábito más difícil de quitar es tomar el ratón, y mejor quitarlo antes de que un aprendiz real esté en la silla."
    },
    {
      "en": "Screenshot the actual screens your learners will see and print them big — a generic \"how to email\" handout confuses people the moment their screen looks different, and one skill per page beats a booklet nobody opens.",
      "es": "Captura las pantallas reales que verán quienes aprenden e imprímelas en grande; un folleto genérico de \"cómo usar el correo\" confunde en cuanto la pantalla se ve distinta, y una habilidad por página vale más que un cuadernillo que nadie abre."
    },
    {
      "en": "Keep a second helper free to float during drop-in hours — one thorny \"my account got locked\" problem will otherwise swallow the whole session while everyone else waits and drifts off.",
      "es": "Ten a un segundo ayudante libre para desplazarse durante las horas de atención abierta; de lo contrario, un problema espinoso de \"se bloqueó mi cuenta\" se traga toda la sesión mientras los demás esperan y se van desanimando."
    },
    {
      "en": "Wipe on the way in and the way out, and remind borrowers to save their photos and files first — people forget everything lives on that device, and a return-day factory reset erasing a grandkid's photos is a wound.",
      "es": "Borra el equipo tanto al recibirlo como al devolverlo, y recuérdale a quien lo usó que guarde antes sus fotos y archivos; la gente olvida que todo vive en ese aparato, y un restablecimiento de fábrica que borra las fotos de un nieto el día de la devolución duele."
    }
  ],
  "weatherization-brigade": [
    {
      "en": "Vet a new volunteer on a low-stakes job before sending them into someone's home, and flag anyone eager to take on more than the scope allows — overconfidence, not inexperience, is what gets a resident's house damaged.",
      "es": "Prueba a un voluntario nuevo en un trabajo de bajo riesgo antes de enviarlo a la casa de alguien, y presta atención a quien esté ansioso por hacer más de lo que permite el alcance; lo que daña la casa de un residente es el exceso de confianza, no la inexperiencia."
    },
    {
      "en": "Add lead paint and old insulation to your \"stop and refer\" list alongside gas and electrical — disturbing them in a pre-1978 home without training is both illegal and a real health hazard, and it hides in exactly the surfaces you'd caulk.",
      "es": "Suma la pintura con plomo y el aislamiento viejo a la lista de \"detenerse y derivar\", junto con el gas y la electricidad; alterarlos en una casa anterior a 1978 sin capacitación es ilegal y un peligro real para la salud, y se esconde justo en las superficies que uno sellaría."
    },
    {
      "en": "Send two people to every assessment, photograph everything, and don't promise a date on the doorstep — the \"quick caulk job\" that opens onto mold or knob-and-tube wiring needs a sober second look, not an eager yes.",
      "es": "Envía a dos personas a cada evaluación, fotografía todo y no prometas una fecha en la puerta; el \"sellado rápido\" que resulta esconder moho o cableado antiguo necesita una segunda mirada serena, no un sí entusiasta."
    },
    {
      "en": "Buy from the assessment's material list, not a guess, and pick low-odor, low-VOC products for occupied homes — an elder can't air out a house for a day, and the wrong exterior caulk peels off by next winter.",
      "es": "Compra según la lista de materiales de la evaluación, no a ojo, y elige productos de bajo olor y bajo COV para casas habitadas; un adulto mayor no puede ventilar la casa un día entero, y el sellador exterior equivocado se despega para el invierno siguiente."
    },
    {
      "en": "Confirm in writing that your coverage actually names volunteer home repair — many general liability policies quietly exclude it — and treat ladders as the real danger here, since falls, not power tools, send these crews to the ER.",
      "es": "Confirma por escrito que el seguro realmente cubra la reparación domiciliaria por voluntarios —muchas pólizas de responsabilidad general la excluyen sin decirlo— y trata las escaleras como el verdadero peligro, porque son las caídas, y no las herramientas eléctricas, las que mandan a estas cuadrillas a urgencias."
    },
    {
      "en": "Call to confirm the morning of, not just the week before — an anxious elder who forgot you're coming may not open the door — and bring your own water and cleanup so the visit doesn't run up their bills.",
      "es": "Llama para confirmar la misma mañana, no solo la semana anterior —un adulto mayor angustiado que olvidó la visita quizá no abra la puerta— y lleva agua y material de limpieza propios para que la visita no le suba las cuentas."
    }
  ],
  "pet-food-bank": [
    {
      "en": "Pet food draws rodents even harder than the human pantry does — store it in sealed bins up off the floor, or you'll be feeding the mice before the neighbors.",
      "es": "El alimento para mascotas atrae más a los roedores que la despensa humana: guárdalo en recipientes sellados y elevados del piso, o estarás alimentando a los ratones antes que a los vecinos."
    },
    {
      "en": "Ask pet stores about torn or damaged bags they can't sell — that food is usually perfectly good, and it's a steadier stream than one-off donation drives.",
      "es": "Pregunta en las tiendas por bolsas rotas o dañadas que no pueden vender: ese alimento suele estar en buen estado y es una fuente más constante que las colectas ocasionales."
    },
    {
      "en": "Keep any prescription or therapeutic vet diets separate and labeled — they aren't interchangeable, and the wrong one can make a sick animal worse.",
      "es": "Aparta y etiqueta cualquier dieta veterinaria o de prescripción: no son intercambiables, y la equivocada puede empeorar a un animal enfermo."
    },
    {
      "en": "Ask how many pets and what size before you set a portion — a two-cat home and a mastiff household are not the same 'one bag.'",
      "es": "Antes de fijar una porción, pregunta cuántas mascotas hay y de qué tamaño: un hogar con dos gatos y otro con un mastín no reciben la misma \"bolsa\"."
    },
    {
      "en": "Stock both cat and dog food each session and let people take only what fits their animal — nothing stings like being handed food your pet can't eat.",
      "es": "Ten comida de gato y de perro en cada distribución y deja que cada quien lleve solo lo que su animal come: nada incomoda más que recibir alimento que la mascota no puede comer."
    }
  ],
  "youth-mentorship": [
    {
      "en": "Confirm the same room is yours for the whole term, not just this month — kids who've been let down need the space to be there every single week.",
      "es": "Confirma que el mismo salón estará disponible todo el ciclo, no solo este mes: los chicos que ya han sido decepcionados necesitan que el espacio esté ahí cada semana."
    },
    {
      "en": "Write the two-adult rule to cover bathrooms, rides home, and one-on-one tutoring too — that's where 'alone with a child' actually happens, not in the main room.",
      "es": "Al redactar la regla de dos adultos, abarca también baños, traslados a casa y la tutoría individual: es ahí donde de verdad ocurre el estar \"a solas con un menor\", no en el salón principal."
    },
    {
      "en": "Screen for who can commit the whole term over who dazzles in the interview — a mentor who quits in October hurts these kids more than a steady, ordinary one.",
      "es": "Elige a quien puede comprometerse todo el ciclo por encima de quien deslumbra en la entrevista: un mentor que renuncia en octubre daña más a estos chicos que uno constante y común."
    },
    {
      "en": "Build a predictable rhythm — snack, then homework, then activity — so kids always know what's next; unstructured stretches are where supervision slips.",
      "es": "Arma un ritmo predecible —merienda, luego tareas, luego actividad— para que los chicos siempre sepan qué sigue: los ratos sin estructura son donde se afloja la supervisión."
    },
    {
      "en": "Put severe allergies where staff see them at snack time, not just filed in a binder, and confirm who's cleared to pick up each child before day one.",
      "es": "Pon las alergias graves donde el equipo las vea a la hora de la merienda, no solo archivadas, y confirma quién puede recoger a cada niño antes del primer día."
    },
    {
      "en": "Keep snacks nut-free by default and label anything you can't vouch for — planning around one allergic kid is far cheaper than reacting to a reaction.",
      "es": "Mantén las meriendas sin frutos secos por defecto y etiqueta lo que no se pueda garantizar: planear en torno a un niño alérgico sale mucho más barato que reaccionar a una crisis."
    },
    {
      "en": "Do a head count at arrival and again before anyone leaves, and note who picked up whom — a quick word with a parent catches trouble before it grows.",
      "es": "Cuenta cabezas al llegar y otra vez antes de que alguien se vaya, y anota quién recogió a quién: una palabra rápida con la familia detecta problemas antes de que crezcan."
    }
  ],
  "gleaning-network": [
    {
      "en": "Ask each grower exactly what NOT to touch and where to park and walk — the fastest way to lose a farm forever is a volunteer trampling a row you weren't offered.",
      "es": "Pregúntale a cada productor qué NO tocar y por dónde estacionar y caminar: la forma más rápida de perder una finca para siempre es un voluntario pisando un surco que no les ofrecieron."
    },
    {
      "en": "Recruit people who can drop everything on a weekday morning, not weekend-only helpers — ripe fruit doesn't wait for Saturday.",
      "es": "Recluta a quienes pueden dejarlo todo una mañana entre semana, no solo ayudantes de fin de semana: la fruta madura no espera al sábado."
    },
    {
      "en": "Line up more crates and vehicle room than you'd guess — a single 'small' tree can yield hundreds of pounds, and produce left in a hot car by noon is compost by evening.",
      "es": "Ten más cajas y espacio en los vehículos de lo que calculas: un solo árbol \"pequeño\" puede dar cientos de kilos, y la fruta dejada en un auto caliente al mediodía es abono para la tarde."
    },
    {
      "en": "Track firm yeses, not maybes — a list of ten who might show is worthless against a grower's two-hour window; know the three who actually will.",
      "es": "Lleva la cuenta de los síes firmes, no de los quizás: una lista de diez que tal vez aparezcan no sirve ante la ventana de dos horas de un productor; debes saber quiénes tres sí irán."
    },
    {
      "en": "Agree on the no-go list up front — nothing off the ground for leafy greens, no rotten fruit mixed in — because one bad batch at a fridge undoes years of trust.",
      "es": "Acuerda de antemano la lista de lo prohibido —nada del suelo para las hojas verdes, nada de fruta podrida mezclada—: un solo lote malo en una nevera comunitaria borra años de confianza."
    },
    {
      "en": "Match the crop to the outlet before you pick — a small pantry can't move 200 pounds of ripe peaches, but a community meal or several fridges can.",
      "es": "Ajusta el cultivo al destino antes de cosechar: una despensa pequeña no da abasto con 90 kilos de duraznos maduros, pero una comida comunitaria o varias neveras sí."
    },
    {
      "en": "Weigh the haul at the field before you split it up — that poundage recruits your next grower and volunteer, and you'll never reconstruct it later.",
      "es": "Pesa la cosecha en el campo antes de repartirla: ese peso convence al próximo productor y voluntario, y después será imposible reconstruirlo."
    }
  ],
  "community-mediation": [
    {
      "en": "The hardest thing to train is staying neutral when you privately think one side is right — screen for people who can sit with that instead of fixing it.",
      "es": "Lo más difícil de enseñar es mantenerse neutral cuando en el fondo uno cree que un lado tiene razón: elige a quienes pueden sostener eso en vez de resolverlo."
    },
    {
      "en": "Talk to each side alone at intake — people won't name their fear or a power imbalance with the other party sitting right there.",
      "es": "Habla con cada parte por separado en la admisión: nadie nombra su miedo ni un desequilibrio de poder con la otra persona sentada al lado."
    },
    {
      "en": "Pick a room on neither person's turf, with two exits and no one waiting outside — a space where one party's friends linger isn't actually neutral.",
      "es": "Elige una sala en terreno de nadie, con dos salidas y sin nadie esperando afuera: un lugar donde los amigos de una parte rondan no es realmente neutral."
    },
    {
      "en": "Write the referral list before your first case — name the DV hotline, a tenant lawyer, the crisis line — so a mediator can hand it over on the spot, not improvise.",
      "es": "Escribe la lista de derivaciones antes del primer caso —la línea de violencia doméstica, un abogado de inquilinos, la línea de crisis— para que el mediador la entregue al instante, sin improvisar."
    },
    {
      "en": "Decide in advance what you'd do if someone discloses a threat or child abuse mid-session — 'everything is confidential' isn't fully true, and promising it can trap you.",
      "es": "Decide de antemano qué hacer si alguien revela una amenaza o abuso infantil durante la sesión: \"todo es confidencial\" no es del todo cierto, y prometerlo puede dejarte atrapado."
    },
    {
      "en": "Reach people through where disputes surface — property managers, HOA boards, the housing office — not just flyers; that's who's standing next to a fight when it starts.",
      "es": "Llega a la gente por donde surgen los conflictos —administradores de edificios, juntas vecinales, la oficina de vivienda— y no solo con volantes: son quienes están junto a una disputa cuando empieza."
    },
    {
      "en": "Debrief after every hard case, not once a month — mediators carry other people's conflict home, and burnout shows up as cynicism before anyone admits it.",
      "es": "Haz una revisión tras cada caso difícil, no una vez al mes: los mediadores se llevan a casa el conflicto ajeno, y el agotamiento aparece como cinismo antes de que alguien lo reconozca."
    }
  ],
  "reentry-support": [
    {
      "en": "Call each listing to confirm it's still real and still fair-chance, and note the actual human contact — a dead referral wastes the scarce first weeks that matter most.",
      "es": "Llama a cada recurso para confirmar que sigue existiendo y sigue siendo de segunda oportunidad, y anota el contacto real: una derivación muerta desperdicia las escasas primeras semanas que más importan."
    },
    {
      "en": "Screen out saviors — the volunteer who wants to fix people burns out and starts gatekeeping; look for the one who can follow someone else's goals without steering.",
      "es": "Descarta a los salvadores: el voluntario que quiere arreglar a la gente se agota y empieza a poner barreras; busca a quien puede seguir las metas del otro sin dirigirlas."
    },
    {
      "en": "Ask what they want first, before you look at what their record says — let them name the top need instead of running down a form; dignity here sets the whole relationship.",
      "es": "Pregunta primero qué quiere la persona, antes de mirar lo que dice su expediente: deja que nombre su necesidad principal en vez de recorrer un formulario; la dignidad aquí define toda la relación."
    },
    {
      "en": "Solve the mailing-address problem first — a partner org's address or a P.O. box — because almost every ID and benefit application dead-ends without one.",
      "es": "Resuelve primero el problema de la dirección postal —la de una organización aliada o un apartado— porque casi todo trámite de identificación y beneficios se estanca sin ella."
    },
    {
      "en": "Prep people for the record question honestly before the interview, and reconfirm the employer is genuinely fair-chance this month — a bait-and-switch rejection cuts deeper than no lead.",
      "es": "Prepara a la persona con honestidad para la pregunta sobre su historial antes de la entrevista, y reconfirma que el empleador sea de verdad de segunda oportunidad ese mes: un rechazo engañoso duele más que no tener pista alguna."
    },
    {
      "en": "Support your peer mentors too — being someone's lifeline while managing your own reentry is heavy, so don't let one mentor carry five people.",
      "es": "Sostén también a los mentores pares: ser el salvavidas de alguien mientras uno gestiona su propia reinserción pesa mucho, así que no dejes que un mentor cargue con cinco personas."
    },
    {
      "en": "Write down exactly who may see someone's history and never share a record without their explicit okay — one careless mention in a group chat can cost them a job.",
      "es": "Escribe con exactitud quién puede ver el historial de una persona y nunca compartas un expediente sin su permiso explícito: una mención descuidada en un chat grupal puede costarle un empleo."
    }
  ],
  "community-wood-bank": [
    {
      "en": "Get it in writing that the wood is yours to take and where the property line runs — a verbal 'help yourself' turns into a trespassing or timber-theft mess fast.",
      "es": "Obtén por escrito que la madera es tuya para llevar y dónde corre el lindero: un \"sírvanse\" de palabra se convierte rápido en un lío de allanamiento o robo de madera."
    },
    {
      "en": "You need room for two years of wood at once — this winter's dry stack and next winter's drying — or you'll always be burning green wood.",
      "es": "Necesitas espacio para dos años de leña a la vez —la pila seca de este invierno y la que se seca para el próximo— o siempre estarás quemando leña verde."
    },
    {
      "en": "Budget chaps, eye, and ear protection for every operator before the second chainsaw — gear that gets 'shared around' means someone ends up cutting without it.",
      "es": "Presupuesta zahones y protección de ojos y oídos para cada operador antes de la segunda motosierra: el equipo que se \"comparte\" termina en que alguien corta sin él."
    },
    {
      "en": "Name one person who owns the go/no-go call and is comfortable telling a willing volunteer no — enthusiasm plus a chainsaw and no gatekeeper is how people get hurt.",
      "es": "Nombra a una persona que tenga la decisión final de seguir o parar y que no tema decirle no a un voluntario dispuesto: entusiasmo más una motosierra y sin control es como la gente se lastima."
    },
    {
      "en": "Ask at request time where the wood should go and whether there's a clear, dry path to it — dumping a cord an 80-year-old can't move helps no one.",
      "es": "Pregunta al recibir el pedido dónde debe ir la leña y si hay un camino despejado y seco hasta ahí: dejar un montón que una persona de 80 años no puede mover no ayuda a nadie."
    },
    {
      "en": "Size portions in real terms — cords, or weeks of heat — not 'a load,' and check back midwinter; the household short in January is the first to catch next fall.",
      "es": "Mide las porciones en términos reales —cuerdas o semanas de calor—, no \"una carga\", y vuelve a consultar a mitad del invierno: el hogar que se quedó corto en enero es el primero a atender el próximo otoño."
    },
    {
      "en": "Cut this winter's wood by spring, not fall — hardwood needs six-plus months to season; October-for-December wood smokes, wastes heat, and cakes chimneys with creosote.",
      "es": "Corta la leña de este invierno para la primavera, no para el otoño: la madera dura necesita más de seis meses para secarse; la leña de octubre para diciembre humea, desperdicia calor y cubre las chimeneas de creosota."
    }
  ],
  "community-wifi-mesh": [
    {
      "en": "Map from the sidewalk, not a satellite view — trees, a single brick wall, or a bus shelter kills line-of-sight that looks clear from above. Note which side of the street has the sun-facing rooftops.",
      "es": "Levanta el mapa desde la acera, no desde una vista satelital: los árboles, un solo muro de ladrillo o una parada de autobús cortan la línea de visión que desde arriba parece despejada. Anota de qué lado de la calle están los techos que dan al sol."
    },
    {
      "en": "Get redistribution permission in writing, and read the ISP's terms yourself — many residential and business plans forbid resharing, and a takedown notice can end the whole network overnight.",
      "es": "Consigue por escrito el permiso para redistribuir, y lee tú mismo los términos del proveedor: muchos planes residenciales y comerciales prohíben recompartir, y un aviso de suspensión puede terminar con toda la red de un día para otro."
    },
    {
      "en": "Recruit at least two techies who don't live together or work the same job — the network dies the week your only admin moves away or takes a night shift.",
      "es": "Recluta al menos dos personas técnicas que no vivan juntas ni tengan el mismo trabajo: la red muere la semana en que tu único administrador se muda o entra a un turno nocturno."
    },
    {
      "en": "Set every router's admin password and record it in a shared vault before mounting anything — a factory-default node on a roof is a two-person ladder job to fix later.",
      "es": "Configura la contraseña de administrador de cada router y guárdala en un gestor compartido antes de montar nada: arreglar después un nodo con la contraseña de fábrica en un techo es un trabajo de escalera entre dos personas."
    },
    {
      "en": "Sign a one-page host agreement covering roof access, the few dollars of power a month, and who pays if the node is damaged — a verbal 'sure' evaporates when the host's landlord changes.",
      "es": "Firma un acuerdo de una página con cada anfitrión que cubra el acceso al techo, los pocos dólares de electricidad al mes y quién paga si el nodo se daña: un 'claro' de palabra se evapora cuando cambia el arrendador del anfitrión."
    },
    {
      "en": "Post the no-logging promise where users see it, and actually turn logging off — if you never collect activity records, there's nothing to hand over when someone comes asking for them.",
      "es": "Publica la promesa de no registrar la actividad donde los usuarios la vean, y desactiva de verdad los registros: si nunca recopilas datos de actividad, no hay nada que entregar cuando alguien venga a pedirlos."
    },
    {
      "en": "Label each node with its location and a check-in date, and keep a spare router charged — the failure you'll actually face is one dead node, not a rebuild, and a swap should take minutes.",
      "es": "Etiqueta cada nodo con su ubicación y una fecha de revisión, y ten un router de repuesto cargado: la falla que enfrentarás de verdad es un nodo muerto, no una reconstrucción, y reemplazarlo debería tomar minutos."
    }
  ],
  "mental-health-peer-support": [
    {
      "en": "Screen for steadiness, not lived experience alone — someone still raw from their own crisis can be pulled under holding space for others. Ask how they handle a room that goes quiet after a hard disclosure.",
      "es": "Selecciona por estabilidad, no solo por experiencia propia: quien todavía está en carne viva por su propia crisis puede hundirse al sostener el espacio para otros. Pregunta cómo maneja una sala que queda en silencio tras una revelación difícil."
    },
    {
      "en": "Write the boundaries as things the circle won't do — no diagnosis, no fixing, no substitute for a therapist — because a list of prohibitions is clearer to a member in distress than a warm mission statement.",
      "es": "Redacta los límites como cosas que el círculo no hará —no diagnosticar, no arreglar, no sustituir a un terapeuta—, porque una lista de lo que no se hace es más clara para un miembro en angustia que una cálida declaración de propósito."
    },
    {
      "en": "Verify each crisis number by calling it yourself, and print the plan on paper for every facilitator — the night you need it, the wifi is down or the line has been disconnected for a year.",
      "es": "Verifica cada número de crisis llamándolo tú mismo, e imprime el plan en papel para cada facilitador: la noche en que lo necesites, el wifi estará caído o la línea llevará un año desconectada."
    },
    {
      "en": "Choose a room with a door that closes and no glass walls, and check who else uses the building that hour — a shared lobby or a passing coworker undoes confidentiality before anyone speaks.",
      "es": "Elige una sala con puerta que cierre y sin paredes de vidrio, y averigua quién más usa el edificio a esa hora: un vestíbulo compartido o un compañero que pasa deshace la confidencialidad antes de que alguien hable."
    },
    {
      "en": "Read the ground rules aloud every session, even to regulars — the newcomer who most needs the 'right to pass' is the one too nervous to ask whether it exists.",
      "es": "Lee las reglas en voz alta en cada sesión, incluso a los habituales: el recién llegado que más necesita el 'derecho a pasar' es quien está demasiado nervioso para preguntar si existe."
    },
    {
      "en": "Cap the group around eight — past that, quiet people never get a turn — and pick a time that isn't Friday night or right after work, when the isolated feel it most and can least travel.",
      "es": "Limita el grupo a unas ocho personas: pasado ese número, las personas calladas nunca tienen turno; y elige un horario que no sea viernes por la noche ni justo al salir del trabajo, cuando los aislados lo sienten más y menos pueden desplazarse."
    },
    {
      "en": "Give facilitators their own place to debrief that isn't the circle itself, and watch for the one who never misses a session and never takes a break — that's the burnout you'll lose them to.",
      "es": "Dales a los facilitadores un lugar propio para desahogarse que no sea el círculo mismo, y observa a quien nunca falta a una sesión ni toma un descanso: ese es el agotamiento por el que lo perderás."
    }
  ],
  "community-cleanup": [
    {
      "en": "Visit candidate sites at different hours before you commit — a lot that's quiet at 10am may be someone's sleeping spot or a dumping ground refilled nightly, which changes everything about the plan.",
      "es": "Visita los sitios candidatos a distintas horas antes de comprometerte: un lote tranquilo a las 10 de la mañana puede ser el lugar donde alguien duerme o un basurero que se rellena cada noche, y eso lo cambia todo en el plan."
    },
    {
      "en": "Nail down the disposal endpoint before the date — a confirmed dumpster or a scheduled city pickup with a reference number — or the bags you collect will sit at the curb until they split open.",
      "es": "Asegura el destino final de los residuos antes de la fecha —un contenedor confirmado o una recolección municipal agendada con número de referencia— o las bolsas que juntes quedarán en la acera hasta que se rompan."
    },
    {
      "en": "Bring one rigid sharps container and heavy puncture-resistant gloves, not just garden gloves — and brief everyone that needles and unknown containers get flagged for a lead, never picked up by hand.",
      "es": "Lleva un contenedor rígido para objetos punzantes y guantes gruesos resistentes a perforaciones, no solo guantes de jardín, e indica a todos que las jeringas y los recipientes desconocidos se avisan a un responsable, nunca se recogen con la mano."
    },
    {
      "en": "Assign a zone and a team lead for each cluster of volunteers before the day, and over-recruit by a third — cleanups run on the people who actually show, which is fewer than those who sign up.",
      "es": "Asigna una zona y un líder de equipo a cada grupo de voluntarios antes del día, y recluta un tercio de más: las limpiezas funcionan con quienes de verdad llegan, que son menos que los que se inscriben."
    },
    {
      "en": "Shoot the before photos from a fixed spot you can stand in again for the after shot — matched angles are what make the difference undeniable and pull people back for the next round.",
      "es": "Toma las fotos del antes desde un punto fijo al que puedas volver para la foto del después: los ángulos coincidentes hacen la diferencia innegable y atraen a la gente para la próxima jornada."
    }
  ],
  "free-tax-prep": [
    {
      "en": "Start certification in the fall — VITA training and testing run for weeks, and a volunteer who begins in January is barely ready before the season is half over.",
      "es": "Empieza la certificación en otoño: la capacitación y los exámenes de VITA duran semanas, y un voluntario que arranca en enero apenas está listo cuando la temporada ya va por la mitad."
    },
    {
      "en": "Affiliate with an established program before you promise anyone a date — they set the site requirements, and their software and quality review are what keep one bad return from wrecking a family's refund.",
      "es": "Afíliate a un programa establecido antes de prometerle una fecha a nadie: ellos fijan los requisitos del sitio, y su software y revisión de calidad son lo que evita que una declaración mal hecha arruine el reembolso de una familia."
    },
    {
      "en": "Check the actual upload speed at the space, not just that wifi exists — filing software stalls on a weak connection, and a room full of waiting people watching a spinner is how trust erodes.",
      "es": "Comprueba la velocidad de subida real del lugar, no solo que haya wifi: el software de declaración se traba con una conexión débil, y una sala llena de gente esperando frente a un ícono girando es como se erosiona la confianza."
    },
    {
      "en": "Put the required-documents checklist in every reminder and hand it out at booking — the most common heartbreak is someone riding the bus in only to be turned away for a missing SSN card or last year's return.",
      "es": "Incluye la lista de documentos requeridos en cada recordatorio y entrégala al agendar: la decepción más común es que alguien tome el autobús solo para ser rechazado por falta de la tarjeta del seguro social o la declaración del año pasado."
    },
    {
      "en": "Aim your outreach at people who assume they earn too little to bother filing — they're often the ones owed the biggest credits, and 'you don't have to file' is exactly the myth costing them money.",
      "es": "Dirige la difusión a quienes suponen que ganan demasiado poco como para molestarse en declarar: suelen ser los que tienen derecho a los créditos más grandes, y 'no tienes que declarar' es justo el mito que les cuesta dinero."
    },
    {
      "en": "Write the retention-and-destruction rule before opening day — no personal files left on desktops, nothing carried home, and a set date to shred — because the breach you'll cause is a laptop left logged in, not a hacker.",
      "es": "Escribe la regla de conservación y destrucción antes de abrir: nada de archivos personales en los escritorios, nada que se lleve a casa, y una fecha fija para destruir documentos, porque la filtración que causarás será una laptop con sesión abierta, no un hacker."
    },
    {
      "en": "Keep follow-up strictly opt-in and offered after the return is done, never as a condition — someone came for a refund, and a budgeting pitch at the table can make free help feel like a sales trap.",
      "es": "Mantén el seguimiento estrictamente voluntario y ofrécelo cuando la declaración esté lista, nunca como condición: la persona vino por su reembolso, y una propuesta de presupuesto en la mesa puede hacer que la ayuda gratuita parezca una trampa de ventas."
    }
  ],
  "community-market": [
    {
      "en": "Pin down each supplier's rhythm and volume in writing, not a friendly 'whenever we have extra' — a stand planned around unpredictable surplus can't promise neighbors a table worth the walk.",
      "es": "Fija por escrito el ritmo y el volumen de cada proveedor, no un amable 'cuando nos sobre': un puesto planeado sobre excedentes impredecibles no puede prometerles a los vecinos una mesa que valga la caminata."
    },
    {
      "en": "Scout the spot for shade and a water source, and check foot traffic at your actual market hour — a corner that's busy at rush hour can be dead at 2pm, and produce cooks in an unshaded lot.",
      "es": "Explora el sitio buscando sombra y una fuente de agua, y observa el flujo de gente a la hora real del mercado: una esquina concurrida en hora pico puede estar muerta a las 2 de la tarde, y las frutas y verduras se cocinan en un lote sin sombra."
    },
    {
      "en": "If you go pay-what-you-can, keep it a single unmarked box and never a suggested price at eye level — the moment paying looks expected, the neighbors who most need the food stop coming.",
      "es": "Si eliges pagar lo que puedas, usa una sola caja sin marcas y nunca un precio sugerido a la altura de los ojos: en el momento en que pagar parezca lo esperado, los vecinos que más necesitan la comida dejan de venir."
    },
    {
      "en": "Bring coolers and ice for anything leafy or cut, and set a plain discard line for volunteers — 'when in doubt, compost it' protects both the people you serve and the stand's reputation.",
      "es": "Lleva neveras portátiles y hielo para todo lo de hoja o cortado, y fija a los voluntarios un criterio claro para descartar: 'ante la duda, al compost' protege tanto a quienes atiendes como la reputación del puesto."
    },
    {
      "en": "Recruit for the unglamorous slots first — the early pickup drive and the pack-down — since those are what fall through, and name a backup for each so one no-show doesn't cancel the market.",
      "es": "Recluta primero para los turnos poco atractivos —el viaje temprano de recolección y el desmontaje—, que son los que se caen, y nombra un suplente para cada uno para que una ausencia no cancele el mercado."
    },
    {
      "en": "Lock one day and time and hold it even on a thin week — a half-empty stand that always shows up builds more trust than an abundant one that skips a Saturday without warning.",
      "es": "Fija un día y una hora y mantenlos incluso en una semana floja: un puesto medio vacío que siempre aparece genera más confianza que uno abundante que se salta un sábado sin avisar."
    },
    {
      "en": "Arrange the leftover-produce handoff before market day, not after — line up a fridge, pantry, or meal program to take the surplus, so pack-down is a five-minute drop-off, not a trunk of rotting greens.",
      "es": "Coordina el destino del excedente antes del día de mercado, no después: ten lista una nevera comunitaria, una despensa o un comedor que reciba lo sobrante, para que el desmontaje sea una entrega de cinco minutos y no un maletero de verduras pudriéndose."
    }
  ],
  "welcome-wagon": [
    {
      "en": "Decide the default is a low-pressure first contact — a note or a call before any doorstep visit — so a newcomer can say yes to a basket without feeling a stranger is about to appear at their home.",
      "es": "Que la opción por defecto sea un primer contacto de baja presión —una nota o una llamada antes de cualquier visita a la puerta—, para que un recién llegado pueda aceptar una canasta sin sentir que un desconocido está por aparecer en su casa."
    },
    {
      "en": "Date the packet and name who to tell when a listing closes — a guide sending people to a clinic that moved or a bus route that changed does more harm than no guide at all.",
      "es": "Ponle fecha al paquete e indica a quién avisar cuando un dato caduque: una guía que envía a la gente a una clínica que se mudó o a una ruta de autobús que cambió hace más daño que no tener guía."
    },
    {
      "en": "Skip anything perishable or scented unless you know the household — a new parent may have allergies, restrictions, or a bare kitchen, so shelf-stable basics beat a well-meant casserole that can't be eaten.",
      "es": "Evita lo perecedero o perfumado a menos que conozcas al hogar: un padre o madre reciente puede tener alergias, restricciones o una cocina vacía, así que los básicos no perecederos superan a un guiso bien intencionado que no se puede comer."
    },
    {
      "en": "Coach greeters to read the doorway in ten seconds — hand over the basket, name one way to reach you, and leave unless invited in; the warmest welcome knows when to end.",
      "es": "Enseña a los saludadores a leer la puerta en diez segundos: entregar la canasta, dejar una forma de contactarte y retirarse salvo que los inviten a pasar; el saludo más cálido sabe cuándo terminar."
    },
    {
      "en": "Make referral partners get the newcomer's consent before passing a name — a landlord or clinic sharing details without asking turns a welcome into surveillance, and word of that spreads fast.",
      "es": "Haz que los socios que refieren obtengan el consentimiento del recién llegado antes de pasar un nombre: un arrendador o una clínica que comparte datos sin preguntar convierte la bienvenida en vigilancia, y eso se corre rápido."
    }
  ],
  "library-of-things": [
    {
      "en": "Frame the survey as a checklist of specific items plus a blank line, and ask what they'd have used \"in the last year\" — that captures real need, not a wishlist of fantasies.",
      "es": "Arma la encuesta como una lista de artículos concretos con un espacio en blanco al final, y pregunta qué se habría usado \"en el último año\": así captas la necesidad real, no la lista de ilusiones."
    },
    {
      "en": "Measure the biggest items first — folding tables, strollers, the carpet cleaner. A closet that holds fifty small things still can't fit the one item everyone asked for.",
      "es": "Mide primero los artículos más grandes —mesas plegables, carriolas, la limpiadora de alfombras—: un clóset que guarda cincuenta cosas pequeñas igual no cabe el único artículo que todos pidieron."
    },
    {
      "en": "Check the recall list (CPSC) for anything with a motor, cord, or a child's name on it, and actually plug in every electrical item before it earns a shelf spot.",
      "es": "Revisa si hay retiros del mercado (CPSC) en todo lo que tenga motor, cable o nombre infantil, y enchufa de verdad cada aparato eléctrico antes de que gane un lugar en el estante."
    },
    {
      "en": "Photograph each item beside its ID number so a return matches its record in seconds, and log accessories — bags, cords, attachments — as their own lines so nothing vanishes.",
      "es": "Fotografía cada artículo junto a su número para emparejar en segundos lo devuelto con su registro, y anota los accesorios —bolsas, cables, aditamentos— en líneas aparte para que nada desaparezca."
    },
    {
      "en": "Set loan length by how fast an item turns over, not one blanket number — a carpet cleaner for a week, a projector for a weekend — so popular things keep circulating.",
      "es": "Fija la duración del préstamo según qué tan rápido rota cada cosa, no con un número único —una limpiadora de alfombras por una semana, un proyector por un fin de semana— para que lo más pedido siga circulando."
    },
    {
      "en": "Take the condition photo at checkout AND at return; it settles \"it was already scratched\" on its own, so no librarian has to play the bad guy.",
      "es": "Toma la foto del estado tanto al prestar como al devolver; así se resuelve solo el \"ya venía rayado\" y nadie de las personas bibliotecarias tiene que hacer de malo."
    },
    {
      "en": "Keep a running list of what people asked for and couldn't get — that waitlist, not your guesses, tells you the next thing actually worth buying.",
      "es": "Lleva un registro de lo que la gente pidió y no había: esa lista de espera, y no las suposiciones, indica qué vale de verdad la pena comprar después."
    }
  ],
  "laundry-shower-access": [
    {
      "en": "Walk the real route from where guests wait to the shower door — a private stall down a hallway where everyone can see who goes in isn't actually private.",
      "es": "Recorre la ruta real desde donde esperan las personas hasta la puerta de la ducha; un cubículo privado al fondo de un pasillo donde todos ven quién entra no es privado de verdad."
    },
    {
      "en": "Buy travel-size and unscented — fragrances trigger some people, and a full bottle walks off while a small one lasts and travels. Add flip-flops for shared showers.",
      "es": "Compra tamaño de viaje y sin fragancia: los aromas afectan a algunas personas, y una botella grande se esfuma mientras una pequeña dura y se puede llevar. Incluye chanclas para las duchas compartidas."
    },
    {
      "en": "Let people hold a slot with just a first name or nothing at all; a sign-up sheet that demands last name and phone empties the very line you were trying to fill.",
      "es": "Deja que la gente aparte su turno con solo un nombre de pila o con nada; una hoja que exige apellido y teléfono vacía justo la fila que se intentaba llenar."
    },
    {
      "en": "Budget real minutes to clean between showers — disinfect, mop, fresh towel — and build them into the slot length, or the schedule quietly runs guests through a dirty stall.",
      "es": "Reserva minutos reales para limpiar entre duchas —desinfectar, trapear, toalla limpia— e inclúyelos en la duración del turno, o el horario hará pasar a la gente por un cubículo sucio."
    },
    {
      "en": "Rehearse the awkward moments — someone intoxicated, a slot running long — so a volunteer's first instinct isn't the panic call that ends your host relationship.",
      "es": "Ensaya los momentos incómodos —alguien intoxicado, un turno que se alarga— para que el primer impulso de la persona voluntaria no sea la llamada de pánico que termina la relación con el anfitrión."
    },
    {
      "en": "Pick hours you can hold for months and post them where people actually are; changing the time even once teaches everyone the door might be locked when they arrive.",
      "es": "Elige horas que puedas sostener por meses e imprímelas donde de verdad está la gente; cambiar el horario una sola vez le enseña a todos que la puerta podría estar cerrada al llegar."
    }
  ],
  "voter-registration": [
    {
      "en": "Write down the exact form-return deadline and who may legally turn forms in; some places require submission within days, counted from when the voter signed, not when you mail.",
      "es": "Anota la fecha límite exacta para entregar los formularios y quién puede hacerlo legalmente; en algunos lugares hay que entregarlos en pocos días, contados desde que la persona firmó, no desde que se envían."
    },
    {
      "en": "Give volunteers a ready answer for \"who should I vote for?\" — a warm \"I can't tell you that, but here's how to research the candidates\" — so nobody improvises the drive into trouble.",
      "es": "Da a las personas voluntarias una respuesta ya lista para \"¿por quién voto?\" —un amable \"eso no puedo decirlo, pero así se puede investigar a las candidaturas\"— para que nadie improvise y meta en problemas a la jornada."
    },
    {
      "en": "Pull deadlines, ID rules, and polling info straight from the election office's own page and date-stamp your printout; secondhand \"I heard\" info sends someone to a closed precinct.",
      "es": "Saca los plazos, las reglas de identificación y la información de votación directamente de la página de la oficina electoral y ponle fecha a la impresión; la información de oídas manda a alguien a un centro cerrado."
    },
    {
      "en": "Get the property's written okay before you table — a market or campus can eject you mid-shift, and \"we assumed it was fine\" loses you the spot for good.",
      "es": "Consigue el permiso por escrito del lugar antes de instalar la mesa; un mercado o campus puede pedir que se retiren a media jornada, y \"supusimos que estaba bien\" hace perder el sitio para siempre."
    },
    {
      "en": "Keep completed forms in one sealed folder that never leaves a named person's hands, and submit within your legal window even if you only collected three.",
      "es": "Guarda los formularios completados en una sola carpeta cerrada que nunca salga de las manos de una persona designada, y entrégalos dentro del plazo legal aunque solo se hayan reunido tres."
    },
    {
      "en": "Hand every new registrant a card with their polling place, the election date, and the mail-in deadline; a registration with no plan to vote often stays home.",
      "es": "Entrega a cada persona recién registrada una tarjeta con su centro de votación, la fecha de la elección y el plazo del voto por correo; un registro sin plan para votar a menudo se queda en casa."
    }
  ],
  "health-navigation": [
    {
      "en": "Capture the direct intake line and current eligibility rules, not just the main number, and note the date you verified each — a clinic that closed still answers its old phone for months.",
      "es": "Registra la línea directa de admisión y las reglas de elegibilidad vigentes, no solo el número principal, y anota la fecha en que se verificó cada dato: una clínica que cerró sigue contestando su teléfono viejo por meses."
    },
    {
      "en": "Drill the exact words for \"I'm not medical — let me connect you to a nurse line,\" because the hardest moment is the scared person on the phone who just wants you to say it's nothing.",
      "es": "Ensaya las palabras exactas para \"no soy personal médico; deja que te comunique con una línea de enfermería\", porque el momento más difícil es la persona asustada al teléfono que solo quiere oír que no es nada."
    },
    {
      "en": "Offer a real phone number and a person, not just a form — the people most lost in the system are often the least able to fill out a web intake.",
      "es": "Ofrece un teléfono real y una persona, no solo un formulario; quienes están más perdidos en el sistema suelen ser los menos capaces de llenar una admisión en línea."
    },
    {
      "en": "Check the enrollment window before you open a case: marketplace plans lock outside open enrollment, and Medicaid turns on income and household size, so gather documents first.",
      "es": "Revisa el periodo de inscripción antes de abrir un caso: los planes del mercado se cierran fuera de la inscripción abierta, y Medicaid depende de los ingresos y del tamaño del hogar, así que reúne los documentos primero."
    },
    {
      "en": "Ask about transportation when you book, not after — a confirmed appointment with no way to get there is the no-show that costs the patient and burns the clinic's slot.",
      "es": "Pregunta por el transporte al agendar, no después: una cita confirmada sin forma de llegar es la ausencia que cuesta a la persona y desperdicia el cupo de la clínica."
    },
    {
      "en": "Decide what you will NOT write down — diagnoses, immigration status — before intake starts; the safest health record is the sensitive detail you never collected.",
      "es": "Decide qué NO vas a anotar —diagnósticos, situación migratoria— antes de empezar la admisión; el dato de salud más seguro es el que nunca se recogió."
    },
    {
      "en": "Ask each clinic which referrals actually help and which swamp them, and give them a named contact on your side — a warm handoff beats sending strangers to their front desk.",
      "es": "Pregunta a cada clínica qué referencias de verdad ayudan y cuáles la saturan, y dale un contacto con nombre de tu lado: una entrega cálida supera enviar a desconocidos a su recepción."
    }
  ],
  "toy-library": [
    {
      "en": "Pick a spot at kid height and stroller width; a shelf up a flight of stairs with nowhere to park the baby is a shelf tired parents quietly skip.",
      "es": "Elige un lugar a la altura de un niño y del ancho de una carriola; un estante subiendo escaleras y sin dónde dejar al bebé es un estante que las familias cansadas evitan en silencio."
    },
    {
      "en": "Keep the CPSC recall list open and run small parts through a toilet-paper tube — if it fits, it's a choking hazard for under-threes, no matter how cute the toy is.",
      "es": "Ten a mano la lista de retiros del mercado (CPSC) y pasa las piezas pequeñas por un tubo de papel higiénico: si cabe, es riesgo de asfixia para menores de tres años, por linda que sea la pieza."
    },
    {
      "en": "Count the pieces onto the bag's label and count them again at return; a puzzle logged as \"24 pcs\" gets checked in thirty seconds instead of trusted and quietly ruined.",
      "es": "Cuenta las piezas sobre la etiqueta de la bolsa y cuéntalas otra vez al devolver; un rompecabezas registrado como \"24 piezas\" se revisa en treinta segundos en vez de darse por bueno y arruinarse en silencio."
    },
    {
      "en": "Name the missing-piece policy out loud and make it gentle — kids lose pieces, and a family afraid of a fine just stops coming instead of returning the set.",
      "es": "Di en voz alta la política de piezas faltantes y hazla amable: los niños pierden piezas, y una familia con miedo a una multa simplemente deja de venir en vez de devolver el juego."
    },
    {
      "en": "Fold the piece-count check and a wipe-down into the return step itself, so nothing hits the shelf uncounted or sticky for the next family.",
      "es": "Integra el conteo de piezas y una limpieza en el propio paso de devolución, para que nada llegue al estante sin contar o pegajoso para la siguiente familia."
    }
  ],
  "food-preservation": [
    {
      "en": "Confirm the stove can hold a full canner's weight and reach a hard rolling boil, and that you can run the vent for hours; a pretty church hall with a light-duty range stalls a pressure-canning day.",
      "es": "Confirma que la estufa aguante el peso de una olla llena y alcance un hervor fuerte y sostenido, y que puedas ventilar por horas; una linda sala parroquial con una hornilla de bajo rendimiento frena un día de enlatado a presión."
    },
    {
      "en": "Anchor everything to one current tested source — the USDA Complete Guide or your extension service — and print the year on it; older times were revised, and \"grandma did it this way\" is how botulism gets in.",
      "es": "Ancla todo a una sola fuente vigente y comprobada —la Guía Completa del USDA o el servicio de extensión— y anótale el año; los tiempos antiguos se revisaron, y \"así lo hacía la abuela\" es por donde entra el botulismo."
    },
    {
      "en": "Have every pressure canner's gauge tested — your extension office does it, often free — and use only new lids; reused sealing lids are the quiet cause of failed seals.",
      "es": "Haz probar el manómetro de cada olla a presión —el servicio de extensión suele hacerlo gratis— y usa solo tapas nuevas; reutilizar las tapas de sellado es la causa silenciosa de sellos fallidos."
    },
    {
      "en": "Line up produce for a specific session date and process it within a day or two of picking; a bumper crop that sits a week loses the quality and safety margin you canned it for.",
      "es": "Consigue los productos para una fecha de sesión concreta y procésalos uno o dos días después de la cosecha; una cosecha abundante que espera una semana pierde la calidad y el margen de seguridad por el que se conservó."
    },
    {
      "en": "Match the recipe to the safe method for that food — high-acid to a water bath, low-acid vegetables and meats to pressure only — and never scale a tested recipe past what it was tested at.",
      "es": "Empareja la receta con el método seguro para ese alimento —lo ácido a baño maría, las verduras y carnes bajas en ácido solo a presión— y nunca aumentes una receta probada más allá de la cantidad con que se probó."
    },
    {
      "en": "Assign one person to time and log every batch's processing; in a busy kitchen, the pot that \"probably had long enough\" is the one you have to throw out.",
      "es": "Asigna a una persona para cronometrar y anotar el tiempo de procesamiento de cada tanda; en una cocina ajetreada, la olla que \"seguro tuvo suficiente\" es la que hay que tirar."
    },
    {
      "en": "Label every jar with contents, method, and date, and tell people to check seals and refrigerate after opening; flag any jar that didn't seal for eating soon, not for the shelf.",
      "es": "Etiqueta cada frasco con contenido, método y fecha, y avisa que se revisen los sellos y se refrigere tras abrir; marca cualquier frasco que no haya sellado para comerlo pronto, no para el estante."
    }
  ],
  "free-haircut": [
    {
      "en": "Ask each stylist how many cuts they can realistically do in a session — most manage six to eight before their hands tire — and recruit to that number, not the crowd you're hoping for.",
      "es": "Pregunta a cada estilista cuántos cortes puede hacer de verdad en una jornada — la mayoría llega a seis u ocho antes de que le fallen las manos — y convoca según ese número, no según la fila que esperas."
    },
    {
      "en": "Check for grounded outlets within a cord's reach of each chair and a hard floor you can sweep between clients — carpet and a distant plug quietly wreck an otherwise good setup.",
      "es": "Verifica que haya enchufes con tierra al alcance del cable de cada silla y un piso duro que se pueda barrer entre clientes — la alfombra y un enchufe lejano arruinan en silencio un buen montaje."
    },
    {
      "en": "Buy two sets of clipper guards and blades per station so one soaks in disinfectant while the other works — sharing a single set between clients is where the line slows and hygiene risk creeps in.",
      "es": "Compra dos juegos de guías y cuchillas por estación para que uno se desinfecte mientras el otro trabaja — compartir un solo juego entre clientes es donde la fila se frena y se cuela el riesgo de higiene."
    },
    {
      "en": "Call your state cosmetology or barber board directly, not just city hall — many require an EPA-registered disinfectant at a set soak time and treat a free event as a licensed establishment anyway.",
      "es": "Llama directo a la junta estatal de cosmetología o barbería, no solo a la alcaldía — muchas exigen un desinfectante registrado ante la EPA con un tiempo de remojo fijo y tratan un evento gratuito como establecimiento con licencia igual."
    },
    {
      "en": "Give each person a mirror and a real consult before the first snip, and set one chair where the room can't watch — dignity is in the choosing, and some people won't relax in a fishbowl.",
      "es": "Dale a cada persona un espejo y una consulta real antes del primer corte, y reserva una silla donde el salón no pueda mirar — la dignidad está en poder elegir, y hay quien no se relaja en una pecera."
    }
  ],
  "mutual-aid-moving-crew": [
    {
      "en": "For moves out of unsafe homes, staff from a small vetted core, not the open sign-up — a survivor should never wonder whether a stranger on the crew knows their new address.",
      "es": "Para mudanzas desde hogares inseguros, arma el equipo con un núcleo pequeño y de confianza, no con la inscripción abierta — quien huye de un peligro nunca debería preguntarse si un desconocido del equipo conoce su nueva dirección."
    },
    {
      "en": "One good four-wheel furniture dolly prevents more injuries than any pep talk about lifting — prioritize it, and stencil your program name on everything so it actually comes back.",
      "es": "Una buena carretilla de cuatro ruedas para muebles previene más lesiones que cualquier charla sobre cómo levantar — priorízala, y marca todo con el nombre del programa para que de verdad regrese."
    },
    {
      "en": "Ask two questions people forget: is anything still unpacked, and how far is legal parking from the door? Unboxed belongings and a long carry are what turn a two-hour move into six.",
      "es": "Haz dos preguntas que la gente olvida: ¿queda algo sin empacar y a qué distancia está el estacionamiento legal de la puerta? Las cosas sin empacar y un acarreo largo son lo que convierte una mudanza de dos horas en seis."
    },
    {
      "en": "Write a firm weight rule — nothing over about fifty pounds moves with fewer than two people — before you write the waiver. A signed form doesn't mend a torn back; the limit does.",
      "es": "Escribe una regla firme de peso — nada de más de unos veintitrés kilos se mueve con menos de dos personas — antes de escribir el descargo. Un formulario firmado no repara una espalda lesionada; el límite sí."
    },
    {
      "en": "In your day-before call, confirm the person is truly packed, not 'almost' — an unpacked apartment is the most common reason a crew stands around and the whole schedule collapses.",
      "es": "En tu llamada del día anterior, confirma que la persona esté realmente empacada, no 'casi' — un departamento sin empacar es la razón más común de que un equipo se quede parado y la agenda se desmorone."
    },
    {
      "en": "Pair every limit with a referral — the piano, the fourth-floor walk-up, the hoarding cleanout — so turning a job down hands someone a next call instead of a dead end.",
      "es": "Acompaña cada límite con una referencia — el piano, el cuarto piso sin ascensor, la casa acumulada — para que decir que no entregue una próxima llamada en vez de un callejón sin salida."
    },
    {
      "en": "Walk the old place with the person one last time before you pull away — the forgotten closet and the overlooked charger are found now or never, and going back later rarely happens.",
      "es": "Recorre el lugar viejo con la persona una última vez antes de arrancar — el clóset olvidado y el cargador que quedó se encuentran ahora o nunca, y volver después casi nunca ocurre."
    }
  ],
  "disability-support-network": [
    {
      "en": "Budget from day one to cover leaders' access costs and time — unpaid 'leadership' quietly filters down to whoever can afford to work for free, which is rarely the disabled neighbors most affected.",
      "es": "Presupuesta desde el primer día para cubrir los costos de accesibilidad y el tiempo de quienes lideran — el 'liderazgo' no remunerado termina en silencio en manos de quien puede trabajar gratis, que rara vez es la vecina o el vecino con discapacidad más afectado."
    },
    {
      "en": "Have an actual screen-reader user test your setup before launch — automated checkers pass plenty of pages that are miserable to use, and image-only flyers lock people out entirely.",
      "es": "Pide a una persona que use lector de pantalla que pruebe tu sistema antes de lanzarlo — los verificadores automáticos aprueban muchas páginas que resultan penosas de usar, y los volantes que son solo imagen dejan a la gente afuera por completo."
    },
    {
      "en": "Verify each resource is accessible before you list it — call and ask about the lift, the bathroom, the intake process. A directory that sends someone to a broken elevator costs more trust than it builds.",
      "es": "Verifica que cada recurso sea accesible antes de listarlo — llama y pregunta por el elevador, el baño, el proceso de admisión. Un directorio que manda a alguien a un ascensor descompuesto cuesta más confianza de la que genera."
    },
    {
      "en": "Design an easy, no-explanation way to pause — chronic illness means capacity swings week to week, and a member who can't gracefully step back will disappear entirely instead.",
      "es": "Diseña una forma fácil y sin explicaciones de hacer una pausa — la enfermedad crónica hace que la capacidad varíe semana a semana, y quien no pueda retirarse con gracia desaparecerá por completo en vez de dar un paso al costado."
    },
    {
      "en": "Don't lend anything that contacts breath or skin intimately — used CPAP masks, mattresses — and log serial numbers, since assistive devices do get recalled and you'll need to reach borrowers fast.",
      "es": "No prestes nada que toque de cerca la respiración o la piel — mascarillas de CPAP usadas, colchones — y registra los números de serie, porque los dispositivos de asistencia sí se retiran del mercado y necesitarás ubicar rápido a quien los tenga."
    },
    {
      "en": "Learn the benefits cliffs before you advise anyone — a gift, a job, or savings over the limit can cut someone's coverage. When in doubt, route them to a benefits counselor rather than guess.",
      "es": "Aprende los límites de los beneficios antes de aconsejar a nadie — un regalo, un empleo o ahorros por encima del tope pueden cortarle a alguien su cobertura médica. Ante la duda, deriva a una consejera de beneficios en vez de adivinar."
    },
    {
      "en": "Put an access-needs question on every event RSVP and book interpreters or CART the moment you set a date — good captioners are reserved weeks out, and 'we couldn't find one in time' is how the standard quietly slips.",
      "es": "Pon una pregunta sobre necesidades de acceso en cada inscripción y reserva intérpretes o subtitulado en vivo apenas fijes la fecha — los buenos intérpretes se apartan con semanas de anticipación, y 'no encontramos a tiempo' es como el estándar se afloja en silencio."
    }
  ],
  "books-to-prisoners": [
    {
      "en": "Get the policy in writing and date it — facilities change rules without notice, and a photocopied page from last year is exactly the kind of proof that won't save a rejected box. Re-verify every few months.",
      "es": "Consigue la política por escrito y féchala — las instituciones cambian las reglas sin aviso, y una fotocopia del año pasado es justo la clase de prueba que no salvará una caja rechazada. Vuelve a verificar cada pocos meses."
    },
    {
      "en": "Cull hardcovers, water-stained, and marked-up books at the door — most facilities reject them, and a packing room buried in unmailable donations is slower than one with half the stock.",
      "es": "Descarta en la puerta los libros de tapa dura, manchados o rayados — la mayoría de las instituciones los rechaza, y una sala de empaque sepultada en donaciones que no se pueden enviar es más lenta que una con la mitad del acervo."
    },
    {
      "en": "Copy each writer's name, ID number, and housing unit exactly as they wrote it, letter for letter — one transposed digit and the whole parcel bounces back weeks later with no way to tell them why.",
      "es": "Copia el nombre completo, el número de identificación y la unidad de alojamiento de cada persona tal como lo escribió, letra por letra — un solo dígito cambiado y todo el paquete rebota semanas después sin forma de avisarle por qué."
    },
    {
      "en": "Put a rules checklist on the wall and have a second volunteer verify every package before it's taped — new folks mean well and mis-pack, and the mistake isn't caught until it's returned postage-paid.",
      "es": "Pon una lista de verificación de reglas en la pared y haz que una segunda persona revise cada paquete antes de sellarlo — la gente nueva tiene buena intención y empaca mal, y el error no se detecta hasta que vuelve con el franqueo ya pagado."
    },
    {
      "en": "Media Mail is far cheaper for books, but it legally can't contain a personal letter — tuck notes only where the facility and postal rules both allow, or your bargain rate becomes a returned package.",
      "es": "El correo de medios (Media Mail) es mucho más barato para libros, pero legalmente no puede incluir una carta personal — mete notas solo donde la institución y las reglas postales lo permitan, o tu tarifa de ganga se vuelve un paquete devuelto."
    },
    {
      "en": "Coach writers before their first letter on the two hard boundaries — no home address or last name, and a kind but firm script for money and romance requests — so warmth never turns into a volunteer feeling trapped.",
      "es": "Capacita a quien escribe, antes de su primera carta, en los dos límites difíciles — nada de dirección de casa ni apellido, y un guion amable pero firme para pedidos de dinero o romance — para que la calidez nunca se vuelva una persona voluntaria sintiéndose atrapada."
    }
  ],
  "community-music": [
    {
      "en": "Play-test or open the case before accepting anything — a warped neck or a cracked pad can cost more than a new starter instrument, and 'free' pianos are almost never worth the move and tuning.",
      "es": "Prueba tocar el instrumento o abre el estuche antes de aceptar cualquier cosa — un mástil torcido o una zapatilla agrietada pueden costar más que un instrumento nuevo de principiante, y los pianos 'gratis' casi nunca valen la mudanza ni la afinación."
    },
    {
      "en": "Photograph each instrument's condition at checkout — it settles every 'it was already scratched' conversation kindly, and it's the record you'll want if one never comes back.",
      "es": "Fotografía el estado de cada instrumento al momento del préstamo — resuelve con amabilidad toda conversación de 'ya venía rayado', y es el registro que querrás si uno nunca regresa."
    },
    {
      "en": "If lessons include kids, run background checks before the first session, no exceptions — it's the unglamorous step that protects children and the program, and it's far harder to add after someone's already teaching.",
      "es": "Si las clases incluyen a menores, haz verificaciones de antecedentes antes de la primera sesión, sin excepción — es el paso poco glamoroso que protege a la niñez y al programa, y es mucho más difícil de agregar cuando alguien ya está enseñando."
    },
    {
      "en": "Confirm the space is yours at the hours you'll actually use — a hall that's free Tuesday mornings is useless for after-school kids — and ask about a locked closet so the lending pool lives where it's played.",
      "es": "Confirma que el espacio sea tuyo en las horas que de verdad usarás — un salón libre los martes por la mañana no sirve para chicos después de clases — y pregunta por un clóset con llave para que el fondo de préstamo viva donde se toca."
    },
    {
      "en": "Run at least one jam billed explicitly for beginners — put a fast player and a first-timer in the same circle and the beginner usually goes home quiet and doesn't come back.",
      "es": "Ofrece al menos una jam anunciada explícitamente para principiantes — junta a alguien que toca rápido con quien recién empieza en el mismo círculo y el principiante suele irse callado y no vuelve."
    },
    {
      "en": "Tell borrowers plainly: if something breaks, bring it back, don't fix it — a home glue job or an over-tightened string does the real damage, and fear of a bill is what makes people hide it.",
      "es": "Dile claro a quien pide prestado: si algo se rompe, tráelo de vuelta, no lo arregles — un pegado casero o una cuerda demasiado tensa hacen el daño real, y el miedo a una factura es lo que hace que la gente lo esconda."
    }
  ],
  "school-supply-program": [
    {
      "en": "Get the exact lists, brands and all — a teacher who asked for wide-ruled will send home the college-ruled you bought — and ask the counselor for a real family count so you're not guessing quantities.",
      "es": "Consigue las listas exactas, marcas incluidas — una maestra que pidió renglón ancho devolverá a casa el renglón universitario que compraste — y pide a la consejera un conteo real de familias para no andar adivinando cantidades."
    },
    {
      "en": "Buy the unglamorous staples — pencils, wide-ruled paper, glue sticks — in bulk yourself and let the drive bring the fun extras; those basics are exactly what donation bins never produce enough of.",
      "es": "Compra tú mismo, al por mayor, los básicos poco vistosos — lápices, hojas de renglón ancho, barras de pegamento — y deja que la colecta traiga los extras divertidos; esos básicos son justo lo que los buzones de donación nunca producen en cantidad suficiente."
    },
    {
      "en": "Post the per-grade list at each packing station and leave backpacks unsealed — a kid who needs left-handed scissors or a bigger size should be able to swap at pickup without unpacking a taped bag.",
      "es": "Pon la lista por grado en cada estación de empaque y deja las mochilas sin sellar — un niño que necesita tijeras para zurdos o una talla más grande debería poder cambiarlo en la entrega sin desarmar una bolsa con cinta."
    },
    {
      "en": "Keep stock off the floor and somewhere dry and locked — cardboard wicks moisture and a garage flood ruins a summer's collecting — and pick a pickup spot on a bus line families already visit.",
      "es": "Mantén el inventario levantado del piso y en un lugar seco y bajo llave — el cartón absorbe humedad y una inundación en el garaje arruina la colecta de todo un verano — y elige un punto de entrega sobre una ruta de autobús que las familias ya frecuenten."
    },
    {
      "en": "Hold the giveaway a week or two before day one, not the frantic weekend before, and skip every income form — let kids pick their own backpack color and no one leaves feeling inspected.",
      "es": "Haz la entrega una o dos semanas antes del primer día, no el fin de semana frenético previo, y omite todo formulario de ingresos — deja que los chicos elijan el color de su mochila y nadie se va sintiéndose inspeccionado."
    }
  ],
  "legal-aid-clinic": [
    {
      "en": "Ask each attorney whether their malpractice insurance covers volunteer work — many bar pro bono programs provide free coverage, but only if the clinic registers first. An uncovered lawyer will quietly decline the hard cases.",
      "es": "Pregunta a cada abogado si su seguro de responsabilidad profesional cubre el trabajo voluntario; muchos programas pro bono del colegio de abogados lo cubren gratis, pero solo si la clínica se registra primero. Un abogado sin cobertura rechazará en silencio los casos difíciles."
    },
    {
      "en": "Get a named person and a realistic wait-time at each referral org before you open, not a general phone number — 'call legal aid' with a three-month waitlist behind it feels like a brush-off to someone in crisis.",
      "es": "Consigue un contacto con nombre y un tiempo de espera realista en cada organización de derivación antes de abrir, no un número general: un 'llame a asistencia legal' con tres meses de lista detrás se siente como un desaire para quien está en crisis."
    },
    {
      "en": "Stand in the waiting area and see if you can hear a normal voice from the consult room — a shared table or a glass-door office quietly voids the confidentiality the whole clinic depends on.",
      "es": "Párate en la sala de espera y comprueba si se oye una voz normal desde el consultorio: una mesa compartida o una oficina con puerta de vidrio anula en silencio la confidencialidad de la que depende toda la clínica."
    },
    {
      "en": "Keep the substance of the problem off the booking form — a shared scheduling sheet listing 'eviction, undocumented' is a breach waiting to happen. Names and time slots only; the details belong in the room.",
      "es": "Deja el fondo del problema fuera del formulario de cita: una hoja de agenda compartida que diga 'desalojo, indocumentado' es una filtración esperando a ocurrir. Solo nombres y horarios; los detalles pertenecen a la sala."
    },
    {
      "en": "Date every handout and have an attorney review it before printing — rights law shifts, and a flyer citing a repealed rule sends people into court sure of something that's no longer true.",
      "es": "Fecha cada folleto y haz que un abogado lo revise antes de imprimir: las leyes de derechos cambian, y un volante que cita una norma derogada manda a la gente al tribunal segura de algo que ya no es cierto."
    },
    {
      "en": "Confirm the interpreter is booked before you advertise a clinic in that language, and never let a client's child interpret legal details — line up an adult interpreter or reschedule.",
      "es": "Confirma que el intérprete está reservado antes de anunciar una clínica en ese idioma, y nunca dejes que el hijo de un cliente interprete detalles legales: consigue un intérprete adulto o reprograma."
    },
    {
      "en": "Run the conflict check against your client list before the appointment, not when they sit down — in a small neighborhood you'll eventually book a landlord and their tenant, and by the table it's already too late.",
      "es": "Revisa el conflicto de interés contra la lista de clientes antes de la cita, no cuando la persona se sienta: en un barrio pequeño tarde o temprano se agendará a un casero y a su inquilino, y en la mesa ya es demasiado tarde."
    }
  ],
  "resource-hub-dispatch": [
    {
      "en": "Assign a real person and a checking schedule to every channel before you publish it — an unanswered voicemail box or a form nobody reads teaches people the hub is theater, and that reputation is hard to undo.",
      "es": "Asigna una persona real y un horario de revisión a cada canal antes de publicarlo: un buzón de voz sin responder o un formulario que nadie lee enseña a la gente que el centro es pura fachada, y esa reputación cuesta revertir."
    },
    {
      "en": "Capture each volunteer's hard limits and preferred contact method, not just their skills — and re-confirm the whole roster quarterly, because a list of people who said yes eight months ago is mostly fiction.",
      "es": "Anota los límites firmes de cada voluntario y su forma de contacto preferida, no solo sus habilidades, y reconfirma toda la lista cada trimestre, porque un listado de gente que dijo que sí hace ocho meses es en su mayoría ficción."
    },
    {
      "en": "Assign every request to one named coordinator who owns it to close — 'the team is on it' means no one is. Even a 'we can't fill this' within a day beats silence that leaves someone waiting on nothing.",
      "es": "Asigna cada solicitud a un coordinador con nombre que la lleve hasta el cierre: 'el equipo se encarga' significa que nadie lo hace. Incluso un 'no podemos con esto' en un día es mejor que un silencio que deja a alguien esperando en vano."
    },
    {
      "en": "Call each listing as if you were a client and note eligibility rules and real hours — directories rot fast, and sending someone across town to a program that closed or won't take them wastes the trust you're building.",
      "es": "Llama a cada entrada como si fueras un usuario y anota los requisitos y el horario real: los directorios se desactualizan rápido, y mandar a alguien al otro lado de la ciudad a un programa que cerró o no lo acepta desperdicia la confianza que se está construyendo."
    },
    {
      "en": "Write the dispatch process down so a new coordinator can run a shift from the page alone — the hub's real risk isn't a slow day, it's every routing decision living in one exhausted person's head.",
      "es": "Pon el proceso de despacho por escrito para que un coordinador nuevo pueda cubrir un turno solo con la hoja: el verdadero riesgo del centro no es un día lento, sino que cada decisión de derivación viva en la cabeza de una sola persona agotada."
    },
    {
      "en": "Decide what gets deleted and when, not just how it's stored — the record you've purged can't be subpoenaed, leaked, or breached. Close a request, keep the outcome count, drop the personal details.",
      "es": "Decide qué se elimina y cuándo, no solo cómo se guarda: el registro que ya se borró no se puede citar en un juicio, filtrar ni vulnerar. Al cerrar una solicitud, guarda el conteo del resultado y descarta los datos personales."
    },
    {
      "en": "Log each unmet need in a fixed category the moment it happens, not from memory at month's end — 'we keep failing at X' only becomes a fundable case for a new project when the entries add up to a number.",
      "es": "Registra cada necesidad no cubierta en una categoría fija en el momento en que ocurre, no de memoria a fin de mes: 'seguimos fallando en X' solo se convierte en un argumento con financiamiento para un proyecto nuevo cuando los registros suman una cifra real."
    }
  ],
  "harm-reduction-supplies": [
    {
      "en": "Ask whether you can distribute under your partner org's legal umbrella and standing order — it often extends their overdose-protection coverage to your crew and skips months of solving the same paperwork alone.",
      "es": "Pregunta si puedes distribuir bajo el paraguas legal y la orden permanente de la organización aliada: a menudo extiende su cobertura de protección ante sobredosis a tu equipo y ahorra meses de resolver el mismo papeleo en soledad."
    },
    {
      "en": "Write down the actual statute or the source who told you, with a date — 'someone said strips are fine' won't help a volunteer explaining a backpack of them to a cop, and these laws change year to year.",
      "es": "Anota la ley concreta o la fuente que lo dijo, con fecha: 'alguien dijo que las tiras están bien' no le sirve a un voluntario que le explica una mochila llena a un policía, y estas leyes cambian de un año a otro."
    },
    {
      "en": "Check expiration dates the day naloxone arrives and store it out of heat and cold — a dose cooked in a summer trunk or frozen in winter can fail at the one moment it's needed.",
      "es": "Revisa las fechas de caducidad el día que llega la naloxona y guárdala lejos del calor y del frío: una dosis cocida en un maletero en verano o congelada en invierno puede fallar justo en el momento en que se necesita."
    },
    {
      "en": "Call every crisis and treatment number before you print a few hundred inserts — a disconnected or wrong-county line discovered mid-overdose is a cruel surprise, and reprinting kits is far more work than one afternoon of dialing.",
      "es": "Llama a cada número de crisis y tratamiento antes de imprimir unos cientos de instructivos: una línea desconectada o de otro condado descubierta en plena sobredosis es una sorpresa cruel, y reimprimir los kits da mucho más trabajo que una tarde marcando."
    },
    {
      "en": "Keep the same route and times each round so people learn when to find you — reliability is the whole relationship. And give every fixed-point host one named contact who restocks their box, or it empties and quietly disappears.",
      "es": "Mantén la misma ruta y los mismos horarios en cada recorrido para que la gente aprenda cuándo encontrarte: la constancia es toda la relación. Y dale a cada punto fijo un contacto con nombre que reponga su caja, o se vacía y desaparece sin ruido."
    },
    {
      "en": "Count supplies moved, not the people who took them — a sign-in sheet or ID ask at the table rebuilds exactly the barrier you tore down. Reversals are worth noting only when someone offers the story freely.",
      "es": "Cuenta los insumos entregados, no a las personas que los tomaron: una hoja de firmas o pedir identificación en la mesa reconstruye justo la barrera que se derribó. Las reversiones vale la pena anotarlas solo cuando alguien ofrece la historia por voluntad propia."
    }
  ],
  "court-support": [
    {
      "en": "Ask the defender's office how they want you to reach them and what would actually help — arrive as extra hands, not as watchdogs grading their work, or the relationship closes before it opens.",
      "es": "Pregunta a la defensoría pública cómo prefiere que la contacten y qué ayudaría de verdad: llega como manos extra, no como fiscalizadores que califican su trabajo, o la relación se cierra antes de abrirse."
    },
    {
      "en": "Rehearse the exact words for 'I can't advise on that — ask your lawyer' until they come automatically; the hallway question arrives fast and warm, and the instinct to help is precisely what wrecks a case.",
      "es": "Ensaya en voz alta las palabras exactas de 'no puedo asesorar sobre eso, pregúntele a su abogado' hasta que salgan solas: la pregunta en el pasillo llega rápido y con calidez, y el instinto de ayudar es justo lo que arruina un caso."
    },
    {
      "en": "Verify each date and courtroom against the court's own docket the afternoon before — not the client's memory. Hearings get moved and rooms reassigned constantly, and a good-faith no-show can turn into a warrant.",
      "es": "Verifica cada fecha y sala contra el registro del propio tribunal la tarde anterior, no contra la memoria del cliente: las audiencias se mueven y las salas se reasignan constantemente, y una ausencia de buena fe puede convertirse en una orden de arresto."
    },
    {
      "en": "Walk new volunteers through security before their first date — the line eats 30 minutes, pocketknives and sometimes phones get turned away, and a hearing can mean three hours of waiting for two minutes in the room.",
      "es": "Explica a los voluntarios nuevos el control de seguridad antes de su primera fecha: la fila se lleva 30 minutos, las navajas y a veces los teléfonos no pasan, y una audiencia puede significar tres horas de espera por dos minutos en la sala."
    },
    {
      "en": "Line up a backup driver for every court morning and confirm the primary the night before — a ride that falls through here isn't an inconvenience, it's a missed hearing and possibly a warrant.",
      "es": "Ten un conductor de respaldo para cada mañana de tribunal y confirma al principal la noche anterior: un traslado que se cae aquí no es una molestia, es una audiencia perdida y posiblemente una orden de arresto."
    },
    {
      "en": "Get the attorney's instructions on content, addressee, and deadline in writing, and hold every letter for them to review before it's sent — a well-meant line admitting fault or contradicting the defense can do real damage.",
      "es": "Obtén por escrito las instrucciones del abogado sobre contenido, destinatario y plazo, y retén cada carta para que él la revise antes de enviarla: una frase bienintencionada que admita culpa o contradiga a la defensa puede causar un daño real."
    }
  ],
  "cooling-warming-center": [
    {
      "en": "Test the AC or heat on a genuinely extreme day, not a mild one — a room that's pleasant in spring can lose to a 100-degree wave, and you'll learn that with vulnerable people inside if you don't check first.",
      "es": "Prueba el aire acondicionado o la calefacción en un día realmente extremo, no en uno templado: una sala agradable en primavera puede no aguantar una ola de 38 grados, y eso se descubre con gente vulnerable dentro si no se comprueba antes."
    },
    {
      "en": "Peg the trigger to a specific National Weather Service number so no one argues about 'is it bad enough' at midnight — and name one person with authority to call it, so the decision never stalls.",
      "es": "Ata el disparador a una cifra específica del servicio meteorológico para que nadie discuta a medianoche si 'ya es suficientemente grave', y nombra a una persona con autoridad para activarlo, de modo que la decisión nunca se atore."
    },
    {
      "en": "Label every bin plainly and tape a contents list inside the storage closet door — during an activation a brand-new host needs to find the first-aid kit or the chargers in seconds, not dig through unmarked boxes.",
      "es": "Rotula cada caja con claridad y pega una lista de contenido por dentro de la puerta del armario: durante una activación, un anfitrión recién llegado necesita encontrar el botiquín o los cargadores en segundos, no hurgar en cajas sin marcar."
    },
    {
      "en": "Drill the one judgment call that matters: what heat stroke and hypothermia look like, and a standing rule to call 911 early. Tell hosts plainly they'll never be second-guessed for calling — hesitation is the danger, not overreaction.",
      "es": "Practica la única decisión que importa: cómo se ven un golpe de calor y la hipotermia, y una regla permanente de llamar temprano a emergencias. Diles a los anfitriones con claridad que nunca se les cuestionará por llamar: el peligro es dudar, no exagerar."
    },
    {
      "en": "Never schedule a host alone — two per shift covers breaks, bathroom runs, and the moment someone needs help while another calls 911. Keep a named reserve list, because the same weather that fills the center also sidelines volunteers.",
      "es": "No programes nunca a un anfitrión solo: dos por turno cubren descansos, idas al baño y el momento en que alguien necesita ayuda mientras otro llama a emergencias. Mantén una lista de reserva con nombres, porque el mismo clima que llena el centro también deja fuera a voluntarios."
    },
    {
      "en": "Route flyers through the people who physically reach isolated elders — meal-delivery drivers, building managers, outreach workers — because the neighbors at highest risk are exactly the ones not seeing your posts online.",
      "es": "Haz llegar los volantes a través de quienes alcanzan físicamente a los mayores aislados —repartidores de comida, encargados de edificios, trabajadores de calle—, porque los vecinos de mayor riesgo son justamente los que no ven las publicaciones en internet."
    },
    {
      "en": "Check on anyone sleeping rather than assuming they're just resting — you can't tell a nap from heat stroke or hypothermia without gently rousing them, and that quiet check is the reason the center exists.",
      "es": "Revisa a quien esté durmiendo en lugar de suponer que solo descansa: no se distingue una siesta de un golpe de calor o una hipotermia sin despertar a la persona con suavidad, y esa revisión callada es la razón de ser del centro."
    }
  ],
  "community-oral-history": [
    {
      "en": "Break 'sharing' into specific checkboxes — name attached or not, family only, public online — instead of one blanket yes, and give them a way to reach you later to change their mind. Consent is a dial, not a switch.",
      "es": "Divide el 'compartir' en casillas específicas —con nombre o sin él, solo la familia, público en internet— en lugar de un sí general, y dale a la persona una forma de contactarte después para cambiar de opinión. El consentimiento es un dial, no un interruptor."
    },
    {
      "en": "Record a 30-second test and listen back before the real session — a humming fridge, an echoey room, or a nearly-full phone that dies at the good part can't be fixed afterward, and you rarely get the story twice.",
      "es": "Graba una prueba de 30 segundos y escúchala antes de la sesión real: un refrigerador que zumba, una sala con eco o un teléfono casi lleno que se apaga en la mejor parte no tienen arreglo después, y rara vez se consigue la historia dos veces."
    },
    {
      "en": "When a story turns raw or sensitive, stop and ask again whether that part is okay to keep — a yes given before recording can feel very different once the words are actually out loud, and re-asking costs you nothing.",
      "es": "Cuando una historia se vuelve cruda o delicada, detente y vuelve a preguntar si esa parte se puede conservar: un sí dado antes de grabar puede sentirse muy distinto una vez que las palabras ya se dijeron en voz alta, y volver a preguntar no cuesta nada."
    },
    {
      "en": "Keep the two backups in genuinely different places — a phone and a cloud account, not two folders on the same laptop — and re-check the consent form before anything goes public, since people's wishes drift over the years.",
      "es": "Guarda las dos copias en lugares realmente distintos —un teléfono y una cuenta en la nube, no dos carpetas en la misma computadora— y revisa de nuevo el formulario de consentimiento antes de publicar nada, porque los deseos de la gente cambian con los años."
    }
  ]
};

/**
 * The tip for one live task, in the viewer's language, or null.
 *
 * A `ProjectTask.title` is the template task's `name` verbatim at
 * instantiation — in whichever locale the project was created. We recover
 * the task's index by matching that title against the en task list first,
 * then es (both orders are identical by the parity guard), and return the
 * index-aligned tip. Any drift (renamed/added task, unknown template)
 * simply yields null and the block doesn't render.
 */
export function getTaskTips(
  templateId: string | null | undefined,
  taskTitle: string,
  locale: string,
): string | null {
  if (!templateId) return null;
  const tips = TASK_TIPS[templateId];
  if (!tips) return null;
  const en = getTemplate(templateId, "en");
  if (!en) return null;
  let idx = en.tasks.findIndex((t) => t.name === taskTitle);
  if (idx < 0) {
    const es = getTemplate(templateId, "es");
    idx = es ? es.tasks.findIndex((t) => t.name === taskTitle) : -1;
  }
  if (idx < 0) return null;
  const entry = tips[idx];
  if (!entry) return null;
  const text = locale.startsWith("es") ? entry.es : entry.en;
  return text && text.trim() ? text : null;
}
