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
// Spanish per-task tips (i18n Phase 2a split from taskTips.ts).
// Loaded lazily via content/bundles/es.ts — never import this
// statically from app code.
export const TASK_TIPS_ES: Record<string, readonly string[]> = {
  "community-fridge": [
    "Confirma que el enchufe sea una toma exterior GFCI dedicada que quede encendida después de cerrar — muchos contactos exteriores de locales están conectados a un interruptor interno que alguien apaga de noche, y el refrigerador se calienta para la mañana.",
    "Haz funcionar cualquier refrigerador donado un día entero antes de construir a su alrededor — y deja una cuarta de espacio detrás, porque un condensador encerrado se sobrecalienta y se apaga en la primera ola de calor.",
    "Plastifica el cartel o quedará hecho papilla tras la primera lluvia — y redacta la lista de 'no' como seguridad, no como regaño, para que la gente confíe en el refrigerador en lugar de sentirse vigilada.",
    "Pon dos nombres en cada turno, no uno — una sola ausencia es como un refrigerador pasa una semana sin limpiarse. Una bitácora con fecha pegada por dentro deja ver a la siguiente persona cuándo se limpió por última vez.",
    "Cuéntales a los comercios desconfiados sobre las protecciones legales para quienes donan alimentos — el miedo a la responsabilidad suele ser el 'no', y saberse cubiertos lo vuelve un 'sí'. Luego fija una hora de recolección.",
    "Usa una línea compartida o un número gratuito de Google Voice, no el celular personal de una persona voluntaria — cuando esa persona se muda o se agota, el número del refrigerador no debería morir con ella."
  ],
  "community-garden": [
    "Deja por escrito dos cosas que los acuerdos de palabra saltan: quién paga el agua, y cuánto aviso debe dar quien es dueña antes de recuperar el terreno — un huerto desalojado a media temporada pierde el trabajo de todo un año.",
    "Toma muestras de varios puntos, no de uno — el plomo se concentra cerca de muros viejos pintados y líneas de cerca. Envía la prueba semanas antes del día de construcción, porque los resultados tardan y no puedes planear las camas hasta tenerlos.",
    "Evita durmientes de vía y madera tratada vieja en camas de comida — filtran creosota y arsénico a tus alimentos. El cedro sin tratar, el bloque de concreto o las pacas de paja son más seguros.",
    "Escribe ahora las cláusulas aburridas: qué pasa con una parcela cuando alguien desaparece a media temporada, y quién hereda las herramientas si el grupo se disuelve. Decidir mientras todos son amigos salva la amistad después.",
    "Ancla tus fechas a la última helada local, no al calendario ni a un sobre de semillas de otro clima — una helada sorpresa puede arrasar toda una siembra del fin de semana de apertura.",
    "Asigna primero los turnos de julio y agosto — es cuando la rotación se desmorona y las camas mueren, no en primavera. Riega al amanecer, no al mediodía, para que el agua penetre en vez de evaporarse sobre las hojas calientes.",
    "Cosecha seguido aunque nadie tenga hambre — los ejotes, pepinos y calabacitas dejan de producir en cuanto se les deja madurar. Lleva el excedente al refrigerador el mismo día; las verduras marchitas no ayudan a nadie."
  ],
  "tool-lending-library": [
    "Elige un lugar seco y con cerradura, y resuelve las devoluciones antes de abrir: un buzón etiquetado o una ranura para después del horario evita que seas la única puerta a toda la colección.",
    "Enchufa y haz funcionar cada herramienta eléctrica antes de aceptarla — un taladro que gira libre pero se atasca bajo carga es chatarra. Revisa que los cables no estén pelados y que las guardas de las hojas sirvan; esas son las lesiones de las que serás responsable.",
    "Anota ahora el costo de reemplazo de cada herramienta en el catálogo — es el número que querrás al decidir si vale la pena perseguir algo que nunca se devolvió. Etiqueta el nombre de tu biblioteca en cada herramienta para que 'creí que era mía' no ocurra.",
    "Una breve exención de responsabilidad al inscribirse importa más que las multas por retraso — deja claro que quien pide usa las herramientas bajo su propio riesgo. Mantén los depósitos fuera de los artículos cotidianos para que el costo no sea barrera; resérvalos para la una o dos cosas caras.",
    "Toma un número de teléfono al que de verdad puedas mandar mensaje después, no solo un nombre — el recordatorio es lo que hace volver las herramientas, y no puedes enviarlo a una firma. Confirma el número en el momento.",
    "Enseña las partes incómodas, no solo el préstamo: cómo rechazar con amabilidad una donación rota, y cómo anotar un daño en la devolución sin que quien pidió se sienta acusado. Muéstrales dónde están el botiquín y la protección para los ojos.",
    "Registra cada '¿tienen…?' que no puedas cumplir — esa lista, no tus suposiciones, te dice qué comprar después. Afila y aceita en una fecha fija para que el mantenimiento no se vuelva 'nunca' en silencio."
  ],
  "neighborhood-care-network": [
    "Guarda este 'mapa' en tu cabeza o en un lugar bajo llave, no en una hoja de cálculo compartida — una lista de vecinas y vecinos aislados y vulnerables es justo lo que no quieres que se filtre. Deja que personas de confianza hagan la presentación en vez de tocar puertas en frío.",
    "Llama de verdad a las referencias — no solo las juntes. Dos personas que respondan por alguien, más una regla firme de 'nunca manejar solo el dinero o las llaves de un vecino', filtran al raro mal actor atraído justo por ese acceso.",
    "Plantea el primer emparejamiento como una prueba, y da a ambas personas una salida elegante y sin explicaciones — una incompatibilidad de la que nadie puede salir se vuelve una obligación, y las obligaciones se abandonan de golpe.",
    "Fija el chequeo a un día y hora constantes para que uno perdido se note — 'ella siempre contesta los martes' es lo que convierte un teléfono en silencio en una señal y no en un encogimiento de hombros.",
    "Pregunta ahora a cada vecino a quién quiere que se llame en una crisis — y si eso es a la familia, no a la policía. Una visita de bienestar puede terminar mal para vecinos indocumentados, con discapacidad o afrodescendientes; honra su preferencia antes de que sea una emergencia.",
    "Mantén a las personas voluntarias en ayuda no clínica — traslados, compras, una acera despejada. En cuanto se desliza a dosis de medicamentos, curación de heridas o levantar a alguien, ese es el trabajo de un profesional capacitado, y decirlo protege a todos.",
    "Rota a la gente antes de que esté agotada, no después de que renuncie — para cuando alguien dice que está quemado, suele llevar meses cargándolo. Una conversación privada también recoge el duelo cuando un vecino al que cuidaban se deteriora."
  ],
  "emergency-preparedness": [
    "Revisa los mapas reales de inundación e incendio de tu zona en vez de adivinar — y anota quién depende de la electricidad para equipo médico, ya que las compañías de servicios llevan listas de restablecimiento prioritario en las que esos vecinos pueden inscribirse desde ahora.",
    "Guarda el directorio en papel en al menos dos casas, no en una — todo el árbol es inútil si está en la única casa que se inunda. Marca en la hoja quién necesita que le toquen la puerta en vez de una llamada, y en qué idioma.",
    "Acuerden un solo canal de radio y una hora fija de contacto — 'al inicio de cada hora' — o todos estarán transmitiendo al vacío. Prueba de verdad las radios a la distancia real del vecindario antes de depender de ellas.",
    "El agua y las pilas caducan — pega una fecha de rotación en el kit y ponla en el mismo calendario que la actualización del directorio. Guárdalo donde dos o tres personas puedan alcanzarlo, para que una puerta cerrada con llave no esté entre tú y los suministros.",
    "Confirma tres cosas que un acuerdo de palabra salta: quién tiene la llave a las 2 de la mañana, si el generador tiene combustible guardado, y si el espacio es accesible para silla de ruedas. Un lugar seguro al que no puedes entrar es solo un edificio.",
    "Haz que la gente localice físicamente las llaves de paso de gas y agua y la herramienta que se necesita — leer sobre ello no cuenta. Cronometra el árbol de contactos de principio a fin; encontrarás el eslabón roto ahora y no durante una inundación.",
    "Nombra un suplente para cada rol — quien es capitán de cuadra puede ser justo la persona atrapada o fuera de la ciudad cuando pase. Doble cobertura sobre todo en los chequeos a personas médicamente vulnerables; esa es la lista que no puede esperar."
  ],
  "free-store": [
    "Prefiere un lugar en planta baja con un borde de banqueta al que puedas arrimarte — vas a acarrear cargas de autos para dentro y para fuera, y un tercer piso sin elevador agota a tu gente antes de abrir. Una fecha fija y recurrente crea el hábito que lo mantiene vivo.",
    "Pon la lista de 'no' en la puerta de recepción de donaciones, no solo adentro — clasificar ocurre demasiado tarde. Súmale sillas de auto usadas, cascos y colchones: su seguridad caduca de forma invisible, y una chinche en una donación puede cerrar tu tienda.",
    "Clasifica en la puerta, antes de que algo llegue a una mesa — un tostador roto que alcanza el estante solo se vuelve tu problema dos veces. Mantén todo el día un contenedor etiquetado de 'para reenviar' para que la pila de rechazos nunca se vuelva una montaña.",
    "Saca menos de lo que tienes y reabastece desde atrás a medida que se vacía — una mesa medio vacía y ordenada se lee como compra digna; un montón amontonado se lee como 'aquí está nuestra basura'.",
    "Indica a quienes reciben que nunca pregunten por qué alguien está ahí ni cuánto se lleva — la regla de no hacer preguntas es todo el punto, y una sola persona voluntaria entrometida la deshace. Deja a alguien circulando para ordenar y que el espacio nunca luzca saqueado.",
    "Confirma el horario de tu organización aliada y qué acepta de verdad antes del evento, no después — muchas no reciben colchones, electrónicos ni juegos incompletos. Saca todo el mismo día para devolver el espacio vacío y conservar al anfitrión."
  ],
  "skill-share": [
    "Los mejores maestros suelen decir que su habilidad 'no tiene nada de especial'. En vez de preguntar '¿en qué eres experto?', pregunta para qué le piden ayuda siempre.",
    "El miedo es al silencio incómodo, así que planea con cada principiante los primeros cinco minutos paso a paso; una vez que las manos se ocupan y la gente habla, los nervios se van solos.",
    "Ajusta la sala a lo que la sesión realmente necesita antes de reservar: una clase de cocina en un salón sin lavabo fracasa a mitad de camino. Y confirma quién abre y cierra el lugar.",
    "Confirma con cada maestro la semana previa a su sesión. Un maestro que no aparece, con horario ya publicado, le cuesta a los asistentes que sí llegaron, y algunos no vuelven.",
    "Pregunta a las personas concretas que no están viniendo, no a quienes ya llegaron. La barrera suele ser algo puntual: un autobús que deja de pasar a las siete, o no tener con quién dejar a los niños."
  ],
  "bulk-buying-coop": [
    "Recluta una quinta parte más de hogares que el mínimo del proveedor. En cada ciclo algunos se saltarán su turno, y un pedido que no llega al mínimo no se envía o se envía a peor precio para todos.",
    "Pregunta por el mínimo de entrega, la política ante faltantes y si el precio se fija al pedir o al entregar. Un 'buen precio' que cambia hasta la entrega puede arruinar el reparto.",
    "Cierra la hoja en la fecha límite: haz una copia y bloquea las ediciones, para que ningún cambio tardío altere las cantidades después de que el coordinador ya sumó el pedido y pagó al proveedor.",
    "Calcula el precio por unidad al centavo y redondea hacia arriba, no hacia abajo. Las fracciones que absorbes se acumulan en el ciclo, y el margen debe cubrir un saco de arroz que se rompe, no quedar como sobrante.",
    "Confirma cómo descarga realmente el camión: plataforma elevadora, transpaleta o simplemente dejado en la acera. Una tarima de media tonelada sin forma de bajarla es algo duro de descubrir la mañana de la entrega.",
    "Pon la balanza en cero con cada envase y pesa directo en la bolsa que se lleva cada hogar. Calcular 'como medio kilo' a ojo de un producto caro es donde se fugan, callados, la confianza y el dinero.",
    "Anota lo que el coordinador realmente hizo este ciclo mientras lo recuerdas. El rol solo rota sin problemas si la próxima persona hereda una lista de pasos y no un misterio."
  ],
  "repair-cafe": [
    "Quienes reparan electrónica y electrodomésticos atraen las filas más largas y se agotan primero: recluta a dos antes de abrir y deriva los arreglos fáciles, como dobladillos y tornillos sueltos, a manos nuevas.",
    "Mantén la soldadura, el calor y el trabajo con baterías lejos del público y cerca de la ventilación, y lleva la corriente por regletas con protección ya probadas: si salta el interruptor del local, se detienen todas las estaciones a la vez.",
    "Un día fijo del mes, digamos el primer sábado, funciona mejor que una fecha variable. La gente recuerda un ritmo, y tus reparadores pueden apartar ese espacio con meses de anticipación en vez de renegociarlo cada vez.",
    "Registra una clasificación rápida en la recepción: probablemente reparable, difícil, o necesita repuesto, para que nadie espere una hora en la fila solo para enterarse de que su tostadora no tenía arreglo.",
    "Traza un límite firme con aparatos de corriente abiertos y baterías hinchadas: un reparador que no está seguro dice que no, y esa es la decisión correcta, no un fracaso. Publícalo para que nadie lo tome como algo personal.",
    "Mantén una caja común y una hoja de conteo en cada estación. El parche o el fusible siempre se acaban el día que nadie revisó, y '¿quién compró el hilo la última vez?' es una discusión que más vale evitar."
  ],
  "rides-transportation": [
    "Ve los documentos físicos; no te conformes con un 'sí, estoy cubierto'. Una foto de la licencia y la tarjeta de seguro vigentes en el expediente es lo que protege a todos el día en que algo sale mal.",
    "Pregunta por escrito a la aseguradora de cada conductor si cubre el manejo voluntario. Muchas pólizas personales excluyen lo que parezca un servicio, y quieres tener esa respuesta antes de un reclamo, no después.",
    "Registra desde el inicio el viaje de regreso y cualquier equipo de movilidad. Un pasajero varado en una clínica porque la silla de ruedas no cabía en el auto es la falla que la gente más recuerda.",
    "Confirma con el conductor y el pasajero el día anterior, de viva voz o por escrito. Dar por hecho en silencio que el viaje sigue en pie es justo la forma en que alguien pierde una cita de diálisis.",
    "Di con claridad lo que no hacen: nada de emergencias, nada de último minuto, ni los bordes del mapa, para que un 'no' se entienda como una regla conocida y no como un rechazo personal en un mal momento.",
    "Nunca dejes que se note si un pasajero no puede aportar. Mantén cualquier contribución verdaderamente opcional e invisible en el momento del viaje, o habrás reconstruido en silencio la misma barrera que querías eliminar.",
    "Empareja el primer viaje de un conductor con un pasajero conocido o un segundo voluntario, y haz un seguimiento después. El registro de viajes no es burocracia: es lo que desearás tener si alguna vez surge una preocupación."
  ],
  "tenant-union": [
    "Elige a personas que sepan guardar una confidencia, no solo a las voces más fuertes. Este trabajo depende de que los inquilinos confíen al comité un riesgo real de represalias, y una sola filtración acaba con esa confianza.",
    "Nunca escribas el nombre de un inquilino junto a su queja donde un arrendador pueda verlo: codifica las unidades, guarda la clave por separado y pide permiso antes de anotar a cualquier persona.",
    "Pon fecha a cada dato y anota la ley que lo respalda. Las normas para inquilinos cambian, y 'alguien me dijo el año pasado' es como un sindicato termina dando un plazo que ya es incorrecto.",
    "Haz un simulacro antes de necesitarlo y fija una promesa de respuesta realista. Una cadena telefónica que nadie ha probado se queda muda justo en el momento en que a alguien lo dejan fuera de su vivienda.",
    "Termina con el primer paso concreto para quien recibe una notificación: el plazo y el número al que llamar, porque eso es lo único que un inquilino asustado realmente se llevará a casa esa noche.",
    "Pon primero y en negrita el plazo para responder ante el tribunal. No cumplirlo suele hacer perder el caso por incomparecencia, por más sólida que sea la posición del inquilino.",
    "Conoce los horarios de admisión y la capacidad de cada aliado, no solo su número de teléfono. Derivar a una clínica llena o cerrada hasta el lunes no es una entrega real cuando el plazo vence el viernes."
  ],
  "childcare-collective": [
    "Habla ahora, en voz alta, sobre las diferencias en disciplina y tiempo de pantalla. El conflicto casi nunca es por el horario: es el día en que alguien cría a tu hijo de una forma que jamás permitirías.",
    "Redacta la regla de nunca-a-solas como la que aplicas con más firmeza justo con las familias en las que más confías. La excepción de 'solo por esta vez' con un buen amigo es precisamente donde estos colectivos se rompen.",
    "Ponte a la altura de los ojos de un niño y recorre la sala a gatas: cables, muebles que se vuelcan, el bolso de una visita con medicinas dentro. Los peligros que un adulto pasa por alto son los que un pequeño encuentra primero.",
    "Haz visible para todos el saldo de créditos desde el primer día. El resentimiento crece en secreto, y una familia que ve que está en deuda se ofrecerá a recibir a los niños antes de que alguien tenga que pedírselo.",
    "Mantén la hoja de alergias y medicamentos de cada niño donde el cuidador de turno pueda tomarla en segundos, y define la regla del niño enfermo antes de que una mañana con fiebre obligue a una decisión apurada y resentida.",
    "Ensaya la emergencia real: quién llama, quién se queda con los demás niños, dónde están las hojas de emergencia. Saber sobre el sueño seguro del bebé sirve de poco si nadie tiene claros los primeros sesenta segundos.",
    "Pregúntales a los niños cómo les fue, no solo a los padres, y analiza con honestidad los casi-accidentes. Un ensayo tranquilo que esquivó los casos difíciles no ha probado lo que de verdad pondrá a prueba la confianza."
  ],
  "community-composting": [
    "Párate en el sitio y ubica la llave de agua más cercana y la ventana del vecino más próximo: una pila difícil de humedecer, o pegada al dormitorio de alguien, es la que habrá que reubicar para el verano.",
    "Una pila caliente necesita cerca de un metro cúbico de material para calentar de verdad y matar las semillas de maleza; con menos, se arma una pila fría que solo se queda ahí, se llame como se llame el recipiente.",
    "Consigue el material café (hojas secas, cartón) antes de que llegue el primer resto de comida y guárdalo en reserva, porque los restos de comida llegan a diario y las hojas secas caen solo una vez al año.",
    "Pide a la gente que no use las bolsas plásticas 'compostables': no se degradan en una pila casera y terminan como los trozos de plástico que estarás sacando del compost terminado durante meses.",
    "Pon la lista de lo que no se acepta en la tapa misma del contenedor, no en un cartel aparte, y usa imágenes: un hueso de pollo tachado se entiende en cualquier idioma más rápido que un párrafo.",
    "Enseña la prueba de humedad de la esponja exprimida y asigna cada semana a una persona con nombre, no al 'equipo': una tarea compartida sin nombre asignado es la semana en que nadie voltea la pila.",
    "Deja que el lote terminado cure unas semanas más y tamiza los trozos antes de repartirlo: el compost que aún está 'cocinándose' quema las plántulas que debía alimentar, y esa historia corre rápido."
  ],
  "free-little-library": [
    "La filtración que arruina los libros no viene del techo, sino de la ranura de la puerta y del agua que sube por el poste: sella la base, agrega un borde bajo la puerta y pruébala con una manguera antes de llenarla.",
    "Colócala donde la gente ya baja el paso —una parada de autobús, la entrada de una escuela—, no donde pasan manejando, y deja libre la acera para que una silla de ruedas o un coche de bebé puedan pasar.",
    "Los libros infantiles son los que más salen y menos regresan, así que abastécelos de sobra; y recicla discretamente los donativos manchados o los libros de texto de los años noventa antes de ponerlos: con un estante de basura, la gente deja de abrir la puerta.",
    "Diga lo que diga el letrero, que se lea como una invitación y no como una obligación: la gente tomará libros sin dejar otro, y está bien; si sienten que deben uno, no se llevarán el que necesitan, y la idea era justamente que no hubiera barreras.",
    "Consigue también un encargado suplente y diles a ambos qué retirar de inmediato: cualquier libro con moho, cualquiera con un número de teléfono ajeno escrito adentro y los títulos para adultos en una caja al alcance de los niños."
  ],
  "community-first-aid-training": [
    "Pregunta cuánto cobran y si lo eximen para grupos comunitarios —muchos lo hacen— y fija el límite de estudiantes por maniquí, porque una clase de RCP con más de unas ocho personas compartiendo uno observa, no practica.",
    "Revisa las fechas de vencimiento de la naloxona el día que llega y anótalas donde de verdad las veas; y no la guardes en un auto caluroso ni en un cobertizo helado: las temperaturas extremas la degradan antes que la fecha.",
    "Hace falta espacio libre en el piso para arrodillarse y hacer compresiones, no solo sillas y mesas: verifica que la sala lo tenga, además de un lavabo y una entrada accesible, antes de reservarla.",
    "Las capacitaciones gratuitas tienen un 30-40% de ausencias, así que confirma el día antes y reserva algunos cupos de más; ofrecer cuidado de niños y comida atrae más a las personas que más quieres tener ahí que cualquier volante.",
    "Aclara al empezar que la práctica se hace con maniquíes, que nadie tiene que tocar a otra persona y que se puede salir durante la parte de sobredosis: alguien en la sala perdió a un ser querido, y quieres que regrese la próxima vez.",
    "Lleva una lista sencilla de quién se llevó naloxona y cuándo vence, para recordar la reposición antes de que caduque, y programa el primer repaso dentro del año: las manos olvidan las compresiones más rápido de lo que se cree."
  ],
  "time-bank": [
    "Insiste en que la gente nombre lo que pediría, no solo lo que daría: todos enumeran ofertas y nadie admite necesidades, y un banco donde nadie gasta es uno donde nadie gana horas.",
    "Elige lo más simple que el coordinador de verdad mantendrá al día, y asegúrate de poder exportar el registro: el día que se mude el único voluntario con maña técnica, una aplicación cerrada se lleva todo el historial consigo.",
    "Decide desde ahora qué pasa cuando alguien se va debiendo horas o queda muy en negativo: escribir esa regla mientras todos están en buenos términos es mucho más fácil que inventarla la primera vez que duele.",
    "Logra que cada miembro nuevo agende un intercambio real antes de irse de la orientación: la filosofía se afianza cuando ha gastado un crédito, no cuando ha escuchado el discurso.",
    "Anota cuándo y dónde está disponible cada persona, no solo lo que sabe hacer: 'plomería' no sirve de nada si el miembro solo tiene los martes por la mañana y no tiene auto, y un directorio desactualizado enseña a la gente a dejar de consultarlo.",
    "Fíjate en los miembros que han ganado horas pero nunca las gastan, o que se inscribieron y nunca intercambiaron, y búscalos por su nombre: los callados no se quejan, simplemente se alejan, y uno lo nota cuando ya se fueron.",
    "Para los intercambios en casa, ofrece un primer encuentro en un lugar público y una forma fácil de rechazar un match sin dar explicaciones; y dirige las quejas a una persona, no a un formulario, o la gente dejará de aparecer sin decir nada."
  ],
  "solidarity-fund": [
    "Mantén el equipo pequeño y con un número impar para que los votos no se empaten, y acuerden de antemano que cualquiera se aparta cuando aplica un amigo o familiar: la apariencia de favoritismo hunde un fondo tan rápido como el favoritismo real.",
    "Nunca hagas pasar el dinero por el Venmo o la cuenta personal de un voluntario, por más cómodo que sea: confunde de quién es el dinero, le crea un lío de impuestos y se ve exactamente mal cuando alguien empieza a hacer preguntas.",
    "Fija tanto un tope por solicitud como un total mensual que no rebasarás, para que unas pocas peticiones grandes al inicio no vacíen el fondo y te dejen diciendo que no a todos en la tercera semana.",
    "Pregunta cómo prefieren recibir el dinero y nada que no necesites de verdad: sin números de identificación, sin cartas del arrendador; cada comprobante que exiges es una familia que se rinde en silencio y no aplica.",
    "Apóyate en aportes pequeños y recurrentes más que en una sola gran campaña: un fondo que recibe 200 dólares cada mes puede prometer ayuda el mes que viene, mientras que uno que recaudó 5.000 dólares una vez ya está racionando para el otoño.",
    "Define un monto pequeño que dos personas puedan aprobar el mismo día sin una reunión completa: cuando a alguien le cortan la luz un viernes, una decisión que espera a la llamada grupal del martes no es ayuda, es papeleo.",
    "Informa totales y cifras, nunca historias: incluso una anécdota 'anonimizada' sobre una madre soltera de la calle Olmo la reconocen los vecinos, y un solo beneficiario que se sienta expuesto ahuyentará a los diez siguientes que necesitan ayuda."
  ],
  "diaper-hygiene-bank": [
    "Los pañales y las toallas sanitarias absorben la humedad y atraen plagas, así que elige un almacenamiento realmente seco y sellado; y ubica el punto de entrega de modo que una familia no los recoja frente a toda la sala de espera.",
    "Averigua si una red de bancos de pañales o un mayorista te venderá a precio de caja: las campañas traen una avalancha de tallas de recién nacido, pero las tallas 4, 5 y 6 que a las familias de verdad se les acaban casi siempre habrá que comprarlas.",
    "Divide las cajas grandes en paquetes listos para entregar a medida que llegan, no en la puerta; y cuenta por talla cada vez, porque 'tenemos pañales' no significa nada cuando todo es talla 1 y cada solicitud es de talla 5.",
    "Sé claro en que una asignación mensual (a menudo de unos 25 a 50 pañales) es un complemento, no el suministro completo: las familias se organizan mejor con una cifra honesta que con un vago 'los que tengamos'.",
    "Realízala el mismo día y a la misma hora cada ciclo para que las familias puedan planear su mes en torno a ella, y capacita a los voluntarios para simplemente entregar el paquete: sin preguntas sobre el bebé, sin comprobantes, sin exigir ninguna historia."
  ],
  "community-bike-workshop": [
    "Una docena de bicicletas donadas ocupa el suelo enseguida; mide para ganchos de pared o verticales antes de firmar, y verifica que el lugar cierre lo bastante bien como para que un estante de cuadros no desaparezca de un día para otro.",
    "Dibuja el contorno de cada herramienta en un panel perforado para que al cerrar se note enseguida cuál falta; los talleres abiertos pierden herramientas rápido, y buscar la llave de 15 mm frena el ritmo de la sesión.",
    "Pon un \"no\" rotundo a las bicicletas de supermercado oxidadas antes de lanzar la convocatoria: cuestan más horas de las que vale una bicicleta funcional, y el \"ya lo haremos\" es como un patio termina lleno de chatarra.",
    "El mejor mecánico y el mejor maestro rara vez son la misma persona; observa si la persona candidata sabe quedarse quieta y dejar que quien empieza batalle con el perno, porque de eso se trata todo aquí.",
    "Dale a cada persona del programa \"gánate una bici\" una tarjeta o un registro de horas que cualquier mecánico pueda leer; el avance que solo vive en la memoria de un voluntario se esfuma la semana en que se enferma.",
    "Convierte la revisión de frenos y llantas en una línea firmada en una tarjeta, de preferencia por alguien distinto de quien armó la bici; una mirada fresca detecta el cierre rápido flojo que no verá quien lleva toda la tarde en ello."
  ],
  "newcomer-translation-network": [
    "La fluidez para conversar no es la fluidez para interpretar; pídele a la persona candidata que traslade una frase médica o de vivienda en ambos sentidos antes de contar con ella, y empareja dialectos, no solo idiomas.",
    "Anota en cada entrada si piden identificación o estatus y qué idiomas atienden de verdad; mandar a alguien a un lugar que lo rechaza en la puerta cuesta una confianza que no se recupera fácil.",
    "Registra las solicitudes solo con el nombre de pila y un número de contacto, nada más; una hoja de cálculo ordenada de quién necesita qué, ligada a identidades reales, es justo el registro que puede filtrarse o pedirse por orden judicial.",
    "Haz que alguien de cada comunidad lingüística lea el borrador en voz alta antes de imprimir; la traducción automática o palabra por palabra de derechos e información de transporte suena a disparate o, peor, a instrucciones equivocadas.",
    "Instruye a los voluntarios para que digan todo en primera persona y no agreguen nada; en cuanto un intérprete empieza a responder por el proveedor o por la persona, ambos dejan de confiar y la atención de alguien se resiente.",
    "Deja por escrito cuánto tiempo se conserva cada dato y a quién se le puede decir \"eso no lo recopilamos\"; mejor decidir con calma ahora la respuesta a una solicitud de expedientes, y no en el momento en que un funcionario está parado frente a la mesa."
  ],
  "community-meal": [
    "Antes de enamorarte de un salón bonito, revisa lo poco vistoso que revisará un inspector: un lavamanos aparte, agua caliente y suficiente refrigeración; una cocina que no aprueba es una cocina que no se puede usar.",
    "Pregúntale a la autoridad sanitaria específicamente por las exenciones para comidas benéficas —en muchos lugares hay una vía más sencilla para cocinas de voluntarios— y saca ya el carné de manipulador de alimentos, porque el curso suele llenarse con semanas de anticipación.",
    "Compromete a cada donante con un día y una cantidad concretos, no con \"lo que sobre\"; un menú planeado sobre una promesa que no llega significa una carrera al supermercado una hora antes de servir, cada semana.",
    "Un plato principal naturalmente vegetariano, sin frutos secos ni mariscos, que todos puedan comer, es mejor que un \"plato para alergias\" aparte que se olvidará con la prisa; cocina para la necesidad más estricta y aun así etiquétalo.",
    "Convoca más manos de las que un turno necesita en rigor y forma a un segundo cocinero principal desde la primera semana; la comida que depende de que una sola persona se presente está a una gripe de cancelarse.",
    "Elige un día y una hora que se puedan sostener durante un año, no los más ambiciosos; la gente organiza su semana en torno a una comida con la que puede contar, y una noche cancelada le enseña a no depender de ustedes.",
    "Pasa las sobras a recipientes poco profundos y al refrigerador antes de dos horas; la comida que se deja tibia en la mesa \"para atender después de limpiar\" es justo como una buena comida enferma a alguien al día siguiente."
  ],
  "seed-library": [
    "Mantén el mueble alejado de los muros exteriores, las ventanas soleadas y las salidas de calefacción; lo que mata la semilla es la humedad y los cambios de temperatura, no solo la edad, así que fresco y seco vale más que un lugar vistoso.",
    "Descarta las semillas tratadas con recubrimiento rosa o azul y los híbridos patentados; la semilla tratada no se manipula sin cuidado, y los híbridos no salen iguales si alguien intenta guardarlos.",
    "Escribe el año en grande en cada sobre y coloca los más viejos al frente; cuando un lote entero está marcado por color como \"fácil para principiantes\", quien llega por primera vez puede servirse solo sin que un encargado esté encima.",
    "Limita cuántos sobres de una misma variedad se lleva cada persona para que un entusiasta no vacíe el cajón, y plantea la devolución como un regalo, no como una deuda; hacer sentir culpable a quien pide solo logra que deje de venir.",
    "Prueba un lote dudoso con diez semillas en una toalla de papel húmeda durante una semana; si brotan menos de seis, mejor retirarlo que mandar a un principiante a casa con semilla que nunca iba a germinar."
  ],
  "digital-literacy": [
    "Pídele a quien dona que cierre su cuenta de iCloud o Google antes de entregar el equipo; una tableta bloqueada por activación es un pisapapeles que ningún borrado arregla, y localizar a la persona después casi nunca funciona.",
    "Etiqueta cada equipo y anota su número de serie junto con el préstamo, y presta el cargador como un conjunto numerado, porque lo que más se \"pierde\" no es la laptop, sino el adaptador que nadie registró.",
    "Revisa el límite de datos antes de entregar un punto de acceso; un plan que se ralentiza tras unos cuantos gigas no aguanta una sola videollamada de telesalud, y quien lo recibe culpará al equipo, no al plan.",
    "Haz un breve juego de roles en el que el tutor guíe a un principiante nervioso por una tarea sin tocar el equipo; el hábito más difícil de quitar es tomar el ratón, y mejor quitarlo antes de que un aprendiz real esté en la silla.",
    "Captura las pantallas reales que verán quienes aprenden e imprímelas en grande; un folleto genérico de \"cómo usar el correo\" confunde en cuanto la pantalla se ve distinta, y una habilidad por página vale más que un cuadernillo que nadie abre.",
    "Ten a un segundo ayudante libre para desplazarse durante las horas de atención abierta; de lo contrario, un problema espinoso de \"se bloqueó mi cuenta\" se traga toda la sesión mientras los demás esperan y se van desanimando.",
    "Borra el equipo tanto al recibirlo como al devolverlo, y recuérdale a quien lo usó que guarde antes sus fotos y archivos; la gente olvida que todo vive en ese aparato, y un restablecimiento de fábrica que borra las fotos de un nieto el día de la devolución duele."
  ],
  "weatherization-brigade": [
    "Prueba a un voluntario nuevo en un trabajo de bajo riesgo antes de enviarlo a la casa de alguien, y presta atención a quien esté ansioso por hacer más de lo que permite el alcance; lo que daña la casa de un residente es el exceso de confianza, no la inexperiencia.",
    "Suma la pintura con plomo y el aislamiento viejo a la lista de \"detenerse y derivar\", junto con el gas y la electricidad; alterarlos en una casa anterior a 1978 sin capacitación es ilegal y un peligro real para la salud, y se esconde justo en las superficies que uno sellaría.",
    "Envía a dos personas a cada evaluación, fotografía todo y no prometas una fecha en la puerta; el \"sellado rápido\" que resulta esconder moho o cableado antiguo necesita una segunda mirada serena, no un sí entusiasta.",
    "Compra según la lista de materiales de la evaluación, no a ojo, y elige productos de bajo olor y bajo COV para casas habitadas; un adulto mayor no puede ventilar la casa un día entero, y el sellador exterior equivocado se despega para el invierno siguiente.",
    "Confirma por escrito que el seguro realmente cubra la reparación domiciliaria por voluntarios —muchas pólizas de responsabilidad general la excluyen sin decirlo— y trata las escaleras como el verdadero peligro, porque son las caídas, y no las herramientas eléctricas, las que mandan a estas cuadrillas a urgencias.",
    "Llama para confirmar la misma mañana, no solo la semana anterior —un adulto mayor angustiado que olvidó la visita quizá no abra la puerta— y lleva agua y material de limpieza propios para que la visita no le suba las cuentas."
  ],
  "pet-food-bank": [
    "El alimento para mascotas atrae más a los roedores que la despensa humana: guárdalo en recipientes sellados y elevados del piso, o estarás alimentando a los ratones antes que a los vecinos.",
    "Pregunta en las tiendas por bolsas rotas o dañadas que no pueden vender: ese alimento suele estar en buen estado y es una fuente más constante que las colectas ocasionales.",
    "Aparta y etiqueta cualquier dieta veterinaria o de prescripción: no son intercambiables, y la equivocada puede empeorar a un animal enfermo.",
    "Antes de fijar una porción, pregunta cuántas mascotas hay y de qué tamaño: un hogar con dos gatos y otro con un mastín no reciben la misma \"bolsa\".",
    "Ten comida de gato y de perro en cada distribución y deja que cada quien lleve solo lo que su animal come: nada incomoda más que recibir alimento que la mascota no puede comer."
  ],
  "youth-mentorship": [
    "Confirma que el mismo salón estará disponible todo el ciclo, no solo este mes: los chicos que ya han sido decepcionados necesitan que el espacio esté ahí cada semana.",
    "Al redactar la regla de dos adultos, abarca también baños, traslados a casa y la tutoría individual: es ahí donde de verdad ocurre el estar \"a solas con un menor\", no en el salón principal.",
    "Elige a quien puede comprometerse todo el ciclo por encima de quien deslumbra en la entrevista: un mentor que renuncia en octubre daña más a estos chicos que uno constante y común.",
    "Arma un ritmo predecible —merienda, luego tareas, luego actividad— para que los chicos siempre sepan qué sigue: los ratos sin estructura son donde se afloja la supervisión.",
    "Pon las alergias graves donde el equipo las vea a la hora de la merienda, no solo archivadas, y confirma quién puede recoger a cada niño antes del primer día.",
    "Mantén las meriendas sin frutos secos por defecto y etiqueta lo que no se pueda garantizar: planear en torno a un niño alérgico sale mucho más barato que reaccionar a una crisis.",
    "Cuenta cabezas al llegar y otra vez antes de que alguien se vaya, y anota quién recogió a quién: una palabra rápida con la familia detecta problemas antes de que crezcan."
  ],
  "gleaning-network": [
    "Pregúntale a cada productor qué NO tocar y por dónde estacionar y caminar: la forma más rápida de perder una finca para siempre es un voluntario pisando un surco que no les ofrecieron.",
    "Recluta a quienes pueden dejarlo todo una mañana entre semana, no solo ayudantes de fin de semana: la fruta madura no espera al sábado.",
    "Ten más cajas y espacio en los vehículos de lo que calculas: un solo árbol \"pequeño\" puede dar más de cien kilos, y la fruta dejada en un auto caliente al mediodía es abono para la tarde.",
    "Lleva la cuenta de los síes firmes, no de los quizás: una lista de diez que tal vez aparezcan no sirve ante la ventana de dos horas de un productor; debes saber quiénes tres sí irán.",
    "Acuerda de antemano la lista de lo prohibido —nada del suelo para las hojas verdes, nada de fruta podrida mezclada—: un solo lote malo en una nevera comunitaria borra años de confianza.",
    "Ajusta el cultivo al destino antes de cosechar: una despensa pequeña no da abasto con 90 kilos de duraznos maduros, pero una comida comunitaria o varias neveras sí.",
    "Pesa la cosecha en el campo antes de repartirla: ese peso convence al próximo productor y voluntario, y después será imposible reconstruirlo."
  ],
  "community-mediation": [
    "Lo más difícil de enseñar es mantenerse neutral cuando en el fondo uno cree que un lado tiene razón: elige a quienes pueden sostener eso en vez de resolverlo.",
    "Habla con cada parte por separado en la admisión: nadie nombra su miedo ni un desequilibrio de poder con la otra persona sentada al lado.",
    "Elige una sala en terreno de nadie, con dos salidas y sin nadie esperando afuera: un lugar donde los amigos de una parte rondan no es realmente neutral.",
    "Escribe la lista de derivaciones antes del primer caso —la línea de violencia doméstica, un abogado de inquilinos, la línea de crisis— para que el mediador la entregue al instante, sin improvisar.",
    "Decide de antemano qué hacer si alguien revela una amenaza o abuso infantil durante la sesión: \"todo es confidencial\" no es del todo cierto, y prometerlo puede dejarte atrapado.",
    "Llega a la gente por donde surgen los conflictos —administradores de edificios, juntas vecinales, la oficina de vivienda— y no solo con volantes: son quienes están junto a una disputa cuando empieza.",
    "Haz una revisión tras cada caso difícil, no una vez al mes: los mediadores se llevan a casa el conflicto ajeno, y el agotamiento aparece como cinismo antes de que alguien lo reconozca."
  ],
  "reentry-support": [
    "Llama a cada recurso para confirmar que sigue existiendo y sigue siendo de segunda oportunidad, y anota el contacto real: una derivación muerta desperdicia las escasas primeras semanas que más importan.",
    "Descarta a los salvadores: el voluntario que quiere arreglar a la gente se agota y empieza a poner barreras; busca a quien puede seguir las metas del otro sin dirigirlas.",
    "Pregunta primero qué quiere la persona, antes de mirar lo que dice su expediente: deja que nombre su necesidad principal en vez de recorrer un formulario; la dignidad aquí define toda la relación.",
    "Resuelve primero el problema de la dirección postal —la de una organización aliada o un apartado— porque casi todo trámite de identificación y beneficios se estanca sin ella.",
    "Prepara a la persona con honestidad para la pregunta sobre su historial antes de la entrevista, y reconfirma que el empleador sea de verdad de segunda oportunidad ese mes: un rechazo engañoso duele más que no tener pista alguna.",
    "Sostén también a los mentores pares: ser el salvavidas de alguien mientras uno gestiona su propia reinserción pesa mucho, así que no dejes que un mentor cargue con cinco personas.",
    "Escribe con exactitud quién puede ver el historial de una persona y nunca compartas un expediente sin su permiso explícito: una mención descuidada en un chat grupal puede costarle un empleo."
  ],
  "community-wood-bank": [
    "Obtén por escrito que la madera es tuya para llevar y dónde corre el lindero: un \"sírvanse\" de palabra se convierte rápido en un lío de allanamiento o robo de madera.",
    "Necesitas espacio para dos años de leña a la vez —la pila seca de este invierno y la que se seca para el próximo— o siempre estarás quemando leña verde.",
    "Presupuesta zahones y protección de ojos y oídos para cada operador antes de la segunda motosierra: el equipo que se \"comparte\" termina en que alguien corta sin él.",
    "Nombra a una persona que tenga la decisión final de seguir o parar y que no tema decirle no a un voluntario dispuesto: entusiasmo más una motosierra y sin control es como la gente se lastima.",
    "Pregunta al recibir el pedido dónde debe ir la leña y si hay un camino despejado y seco hasta ahí: dejar un montón que una persona de 80 años no puede mover no ayuda a nadie.",
    "Mide las porciones en términos reales —cuerdas o semanas de calor—, no \"una carga\", y vuelve a consultar a mitad del invierno: el hogar que se quedó corto en enero es el primero a atender el próximo otoño.",
    "Corta la leña de este invierno para la primavera, no para el otoño: la madera dura necesita más de seis meses para secarse; la leña de octubre para diciembre humea, desperdicia calor y cubre las chimeneas de creosota."
  ],
  "community-wifi-mesh": [
    "Levanta el mapa desde la acera, no desde una vista satelital: los árboles, un solo muro de ladrillo o una parada de autobús cortan la línea de visión que desde arriba parece despejada. Anota de qué lado de la calle están los techos que dan al sol.",
    "Consigue por escrito el permiso para redistribuir, y lee tú mismo los términos del proveedor: muchos planes residenciales y comerciales prohíben recompartir, y un aviso de suspensión puede terminar con toda la red de un día para otro.",
    "Recluta al menos dos personas técnicas que no vivan juntas ni tengan el mismo trabajo: la red muere la semana en que tu único administrador se muda o entra a un turno nocturno.",
    "Configura la contraseña de administrador de cada router y guárdala en un gestor compartido antes de montar nada: arreglar después un nodo con la contraseña de fábrica en un techo es un trabajo de escalera entre dos personas.",
    "Firma un acuerdo de una página con cada anfitrión que cubra el acceso al techo, los pocos dólares de electricidad al mes y quién paga si el nodo se daña: un 'claro' de palabra se evapora cuando cambia el arrendador del anfitrión.",
    "Publica la promesa de no registrar la actividad donde los usuarios la vean, y desactiva de verdad los registros: si nunca recopilas datos de actividad, no hay nada que entregar cuando alguien venga a pedirlos.",
    "Etiqueta cada nodo con su ubicación y una fecha de revisión, y ten un router de repuesto cargado: la falla que enfrentarás de verdad es un nodo muerto, no una reconstrucción, y reemplazarlo debería tomar minutos."
  ],
  "mental-health-peer-support": [
    "Selecciona por estabilidad, no solo por experiencia propia: quien todavía está en carne viva por su propia crisis puede hundirse al sostener el espacio para otros. Pregunta cómo maneja una sala que queda en silencio tras una revelación difícil.",
    "Redacta los límites como cosas que el círculo no hará —no diagnosticar, no arreglar, no sustituir a un terapeuta—, porque una lista de lo que no se hace es más clara para un miembro en angustia que una cálida declaración de propósito.",
    "Verifica cada número de crisis llamándolo tú mismo, e imprime el plan en papel para cada facilitador: la noche en que lo necesites, el wifi estará caído o la línea llevará un año desconectada.",
    "Elige una sala con puerta que cierre y sin paredes de vidrio, y averigua quién más usa el edificio a esa hora: un vestíbulo compartido o un compañero que pasa deshace la confidencialidad antes de que alguien hable.",
    "Lee las reglas en voz alta en cada sesión, incluso a los habituales: el recién llegado que más necesita el 'derecho a pasar' es quien está demasiado nervioso para preguntar si existe.",
    "Limita el grupo a unas ocho personas: pasado ese número, las personas calladas nunca tienen turno; y elige un horario que no sea viernes por la noche ni justo al salir del trabajo, cuando los aislados lo sienten más y menos pueden desplazarse.",
    "Dales a los facilitadores un lugar propio para desahogarse que no sea el círculo mismo, y observa a quien nunca falta a una sesión ni toma un descanso: ese es el agotamiento por el que lo perderás."
  ],
  "community-cleanup": [
    "Visita los sitios candidatos a distintas horas antes de comprometerte: un lote tranquilo a las 10 de la mañana puede ser el lugar donde alguien duerme o un basurero que se rellena cada noche, y eso lo cambia todo en el plan.",
    "Asegura el destino final de los residuos antes de la fecha —un contenedor confirmado o una recolección municipal agendada con número de referencia— o las bolsas que juntes quedarán en la acera hasta que se rompan.",
    "Lleva un contenedor rígido para objetos punzantes y guantes gruesos resistentes a perforaciones, no solo guantes de jardín, e indica a todos que las jeringas y los recipientes desconocidos se avisan a un responsable, nunca se recogen con la mano.",
    "Asigna una zona y un líder de equipo a cada grupo de voluntarios antes del día, y recluta un tercio de más: las limpiezas funcionan con quienes de verdad llegan, que son menos que los que se inscriben.",
    "Toma las fotos del antes desde un punto fijo al que puedas volver para la foto del después: los ángulos coincidentes hacen la diferencia innegable y atraen a la gente para la próxima jornada."
  ],
  "free-tax-prep": [
    "Empieza la certificación en otoño: la capacitación y los exámenes de VITA duran semanas, y un voluntario que arranca en enero apenas está listo cuando la temporada ya va por la mitad.",
    "Afíliate a un programa establecido antes de prometerle una fecha a nadie: ellos fijan los requisitos del sitio, y su software y revisión de calidad son lo que evita que una declaración mal hecha arruine el reembolso de una familia.",
    "Comprueba la velocidad de subida real del lugar, no solo que haya wifi: el software de declaración se traba con una conexión débil, y una sala llena de gente esperando frente a un ícono girando es como se erosiona la confianza.",
    "Incluye la lista de documentos requeridos en cada recordatorio y entrégala al agendar: la decepción más común es que alguien tome el autobús solo para ser rechazado por falta de la tarjeta del seguro social o la declaración del año pasado.",
    "Dirige la difusión a quienes suponen que ganan demasiado poco como para molestarse en declarar: suelen ser los que tienen derecho a los créditos más grandes, y 'no tienes que declarar' es justo el mito que les cuesta dinero.",
    "Escribe la regla de conservación y destrucción antes de abrir: nada de archivos personales en los escritorios, nada que se lleve a casa, y una fecha fija para destruir documentos, porque la filtración que causarás será una laptop con sesión abierta, no un hacker.",
    "Mantén el seguimiento estrictamente voluntario y ofrécelo cuando la declaración esté lista, nunca como condición: la persona vino por su reembolso, y una propuesta de presupuesto en la mesa puede hacer que la ayuda gratuita parezca una trampa de ventas."
  ],
  "community-market": [
    "Fija por escrito el ritmo y el volumen de cada proveedor, no un amable 'cuando nos sobre': un puesto planeado sobre excedentes impredecibles no puede prometerles a los vecinos una mesa que valga la caminata.",
    "Explora el sitio buscando sombra y una fuente de agua, y observa el flujo de gente a la hora real del mercado: una esquina concurrida en hora pico puede estar muerta a las 2 de la tarde, y las frutas y verduras se cocinan en un lote sin sombra.",
    "Si eliges pagar lo que puedas, usa una sola caja sin marcas y nunca un precio sugerido a la altura de los ojos: en el momento en que pagar parezca lo esperado, los vecinos que más necesitan la comida dejan de venir.",
    "Lleva neveras portátiles y hielo para todo lo de hoja o cortado, y fija a los voluntarios un criterio claro para descartar: 'ante la duda, al compost' protege tanto a quienes atiendes como la reputación del puesto.",
    "Recluta primero para los turnos poco atractivos —el viaje temprano de recolección y el desmontaje—, que son los que se caen, y nombra un suplente para cada uno para que una ausencia no cancele el mercado.",
    "Fija un día y una hora y mantenlos incluso en una semana floja: un puesto medio vacío que siempre aparece genera más confianza que uno abundante que se salta un sábado sin avisar.",
    "Coordina el destino del excedente antes del día de mercado, no después: ten lista una nevera comunitaria, una despensa o un comedor que reciba lo sobrante, para que el desmontaje sea una entrega de cinco minutos y no un maletero de verduras pudriéndose."
  ],
  "welcome-wagon": [
    "Que la opción por defecto sea un primer contacto de baja presión —una nota o una llamada antes de cualquier visita a la puerta—, para que un recién llegado pueda aceptar una canasta sin sentir que un desconocido está por aparecer en su casa.",
    "Ponle fecha al paquete e indica a quién avisar cuando un dato caduque: una guía que envía a la gente a una clínica que se mudó o a una ruta de autobús que cambió hace más daño que no tener guía.",
    "Evita lo perecedero o perfumado a menos que conozcas al hogar: un padre o madre reciente puede tener alergias, restricciones o una cocina vacía, así que los básicos no perecederos superan a un guiso bien intencionado que no se puede comer.",
    "Enseña a los saludadores a leer la puerta en diez segundos: entregar la canasta, dejar una forma de contactarte y retirarse salvo que los inviten a pasar; el saludo más cálido sabe cuándo terminar.",
    "Haz que los socios que refieren obtengan el consentimiento del recién llegado antes de pasar un nombre: un arrendador o una clínica que comparte datos sin preguntar convierte la bienvenida en vigilancia, y eso se corre rápido."
  ],
  "library-of-things": [
    "Arma la encuesta como una lista de artículos concretos con un espacio en blanco al final, y pregunta qué se habría usado \"en el último año\": así captas la necesidad real, no la lista de ilusiones.",
    "Mide primero los artículos más grandes —mesas plegables, carriolas, la limpiadora de alfombras—: un clóset que guarda cincuenta cosas pequeñas igual no cabe el único artículo que todos pidieron.",
    "Revisa si hay retiros del mercado (CPSC) en todo lo que tenga motor, cable o nombre infantil, y enchufa de verdad cada aparato eléctrico antes de que gane un lugar en el estante.",
    "Fotografía cada artículo junto a su número para emparejar en segundos lo devuelto con su registro, y anota los accesorios —bolsas, cables, aditamentos— en líneas aparte para que nada desaparezca.",
    "Fija la duración del préstamo según qué tan rápido rota cada cosa, no con un número único —una limpiadora de alfombras por una semana, un proyector por un fin de semana— para que lo más pedido siga circulando.",
    "Toma la foto del estado tanto al prestar como al devolver; así se resuelve solo el \"ya venía rayado\" y nadie de las personas bibliotecarias tiene que hacer de malo.",
    "Lleva un registro de lo que la gente pidió y no había: esa lista de espera, y no las suposiciones, indica qué vale de verdad la pena comprar después."
  ],
  "laundry-shower-access": [
    "Recorre la ruta real desde donde esperan las personas hasta la puerta de la ducha; un cubículo privado al fondo de un pasillo donde todos ven quién entra no es privado de verdad.",
    "Compra tamaño de viaje y sin fragancia: los aromas afectan a algunas personas, y una botella grande se esfuma mientras una pequeña dura y se puede llevar. Incluye chanclas para las duchas compartidas.",
    "Deja que la gente aparte su turno con solo un nombre de pila o con nada; una hoja que exige apellido y teléfono vacía justo la fila que se intentaba llenar.",
    "Reserva minutos reales para limpiar entre duchas —desinfectar, trapear, toalla limpia— e inclúyelos en la duración del turno, o el horario hará pasar a la gente por un cubículo sucio.",
    "Ensaya los momentos incómodos —alguien intoxicado, un turno que se alarga— para que el primer impulso de la persona voluntaria no sea la llamada de pánico que termina la relación con el anfitrión.",
    "Elige horas que puedas sostener por meses e imprímelas donde de verdad está la gente; cambiar el horario una sola vez le enseña a todos que la puerta podría estar cerrada al llegar."
  ],
  "voter-registration": [
    "Anota la fecha límite exacta para entregar los formularios y quién puede hacerlo legalmente; en algunos lugares hay que entregarlos en pocos días, contados desde que la persona firmó, no desde que se envían.",
    "Da a las personas voluntarias una respuesta ya lista para \"¿por quién voto?\" —un amable \"eso no puedo decirlo, pero así se puede investigar a las candidaturas\"— para que nadie improvise y meta en problemas a la jornada.",
    "Saca los plazos, las reglas de identificación y la información de votación directamente de la página de la oficina electoral y ponle fecha a la impresión; la información de oídas manda a alguien a un centro cerrado.",
    "Consigue el permiso por escrito del lugar antes de instalar la mesa; un mercado o campus puede pedir que se retiren a media jornada, y \"supusimos que estaba bien\" hace perder el sitio para siempre.",
    "Guarda los formularios completados en una sola carpeta cerrada que nunca salga de las manos de una persona designada, y entrégalos dentro del plazo legal aunque solo se hayan reunido tres.",
    "Entrega a cada persona recién registrada una tarjeta con su centro de votación, la fecha de la elección y el plazo del voto por correo; un registro sin plan para votar a menudo se queda en casa."
  ],
  "health-navigation": [
    "Registra la línea directa de admisión y las reglas de elegibilidad vigentes, no solo el número principal, y anota la fecha en que se verificó cada dato: una clínica que cerró sigue contestando su teléfono viejo por meses.",
    "Ensaya las palabras exactas para \"no soy personal médico; deja que te comunique con una línea de enfermería\", porque el momento más difícil es la persona asustada al teléfono que solo quiere oír que no es nada.",
    "Ofrece un teléfono real y una persona, no solo un formulario; quienes están más perdidos en el sistema suelen ser los menos capaces de llenar una admisión en línea.",
    "Revisa el periodo de inscripción antes de abrir un caso: los planes del mercado se cierran fuera de la inscripción abierta, y Medicaid depende de los ingresos y del tamaño del hogar, así que reúne los documentos primero.",
    "Pregunta por el transporte al agendar, no después: una cita confirmada sin forma de llegar es la ausencia que cuesta a la persona y desperdicia el cupo de la clínica.",
    "Decide qué NO vas a anotar —diagnósticos, situación migratoria— antes de empezar la admisión; el dato de salud más seguro es el que nunca se recogió.",
    "Pregunta a cada clínica qué referencias de verdad ayudan y cuáles la saturan, y dale un contacto con nombre de tu lado: una entrega cálida supera enviar a desconocidos a su recepción."
  ],
  "toy-library": [
    "Elige un lugar a la altura de un niño y del ancho de una carriola; un estante subiendo escaleras y sin dónde dejar al bebé es un estante que las familias cansadas evitan en silencio.",
    "Ten a mano la lista de retiros del mercado (CPSC) y pasa las piezas pequeñas por un tubo de papel higiénico: si cabe, es riesgo de asfixia para menores de tres años, por linda que sea la pieza.",
    "Cuenta las piezas sobre la etiqueta de la bolsa y cuéntalas otra vez al devolver; un rompecabezas registrado como \"24 piezas\" se revisa en treinta segundos en vez de darse por bueno y arruinarse en silencio.",
    "Di en voz alta la política de piezas faltantes y hazla amable: los niños pierden piezas, y una familia con miedo a una multa simplemente deja de venir en vez de devolver el juego.",
    "Integra el conteo de piezas y una limpieza en el propio paso de devolución, para que nada llegue al estante sin contar o pegajoso para la siguiente familia."
  ],
  "food-preservation": [
    "Confirma que la estufa aguante el peso de una olla llena y alcance un hervor fuerte y sostenido, y que puedas ventilar por horas; una linda sala parroquial con una hornilla de bajo rendimiento frena un día de enlatado a presión.",
    "Ancla todo a una sola fuente vigente y comprobada —la Guía Completa del USDA o el servicio de extensión— y anótale el año; los tiempos antiguos se revisaron, y \"así lo hacía la abuela\" es por donde entra el botulismo.",
    "Haz probar el manómetro de cada olla a presión —el servicio de extensión suele hacerlo gratis— y usa solo tapas nuevas; reutilizar las tapas de sellado es la causa silenciosa de sellos fallidos.",
    "Consigue los productos para una fecha de sesión concreta y procésalos uno o dos días después de la cosecha; una cosecha abundante que espera una semana pierde la calidad y el margen de seguridad por el que se conservó.",
    "Empareja la receta con el método seguro para ese alimento —lo ácido a baño maría, las verduras y carnes bajas en ácido solo a presión— y nunca aumentes una receta probada más allá de la cantidad con que se probó.",
    "Asigna a una persona para cronometrar y anotar el tiempo de procesamiento de cada tanda; en una cocina ajetreada, la olla que \"seguro tuvo suficiente\" es la que hay que tirar.",
    "Etiqueta cada frasco con contenido, método y fecha, y avisa que se revisen los sellos y se refrigere tras abrir; marca cualquier frasco que no haya sellado para comerlo pronto, no para el estante."
  ],
  "free-haircut": [
    "Pregunta a cada estilista cuántos cortes puede hacer de verdad en una jornada — la mayoría llega a seis u ocho antes de que le fallen las manos — y convoca según ese número, no según la fila que esperas.",
    "Verifica que haya enchufes con tierra al alcance del cable de cada silla y un piso duro que se pueda barrer entre clientes — la alfombra y un enchufe lejano arruinan en silencio un buen montaje.",
    "Compra dos juegos de guías y cuchillas por estación para que uno se desinfecte mientras el otro trabaja — compartir un solo juego entre clientes es donde la fila se frena y se cuela el riesgo de higiene.",
    "Llama directo a la junta estatal de cosmetología o barbería, no solo a la alcaldía — muchas exigen un desinfectante registrado ante la EPA con un tiempo de remojo fijo y tratan un evento gratuito como establecimiento con licencia igual.",
    "Dale a cada persona un espejo y una consulta real antes del primer corte, y reserva una silla donde el salón no pueda mirar — la dignidad está en poder elegir, y hay quien no se relaja en una pecera."
  ],
  "mutual-aid-moving-crew": [
    "Para mudanzas desde hogares inseguros, arma el equipo con un núcleo pequeño y de confianza, no con la inscripción abierta — quien huye de un peligro nunca debería preguntarse si un desconocido del equipo conoce su nueva dirección.",
    "Una buena carretilla de cuatro ruedas para muebles previene más lesiones que cualquier charla sobre cómo levantar — priorízala, y marca todo con el nombre del programa para que de verdad regrese.",
    "Haz dos preguntas que la gente olvida: ¿queda algo sin empacar y a qué distancia está el estacionamiento legal de la puerta? Las cosas sin empacar y un acarreo largo son lo que convierte una mudanza de dos horas en seis.",
    "Escribe una regla firme de peso — nada de más de unos veintitrés kilos se mueve con menos de dos personas — antes de escribir el descargo. Un formulario firmado no repara una espalda lesionada; el límite sí.",
    "En tu llamada del día anterior, confirma que la persona esté realmente empacada, no 'casi' — un departamento sin empacar es la razón más común de que un equipo se quede parado y la agenda se desmorone.",
    "Acompaña cada límite con una referencia — el piano, el cuarto piso sin ascensor, la casa acumulada — para que decir que no entregue una próxima llamada en vez de un callejón sin salida.",
    "Recorre el lugar viejo con la persona una última vez antes de arrancar — el clóset olvidado y el cargador que quedó se encuentran ahora o nunca, y volver después casi nunca ocurre."
  ],
  "disability-support-network": [
    "Presupuesta desde el primer día para cubrir los costos de accesibilidad y el tiempo de quienes lideran — el 'liderazgo' no remunerado termina en silencio en manos de quien puede trabajar gratis, que rara vez es la vecina o el vecino con discapacidad más afectado.",
    "Pide a una persona que use lector de pantalla que pruebe tu sistema antes de lanzarlo — los verificadores automáticos aprueban muchas páginas que resultan penosas de usar, y los volantes que son solo imagen dejan a la gente afuera por completo.",
    "Verifica que cada recurso sea accesible antes de listarlo — llama y pregunta por el elevador, el baño, el proceso de admisión. Un directorio que manda a alguien a un ascensor descompuesto cuesta más confianza de la que genera.",
    "Diseña una forma fácil y sin explicaciones de hacer una pausa — la enfermedad crónica hace que la capacidad varíe semana a semana, y quien no pueda retirarse con gracia desaparecerá por completo en vez de dar un paso al costado.",
    "No prestes nada que toque de cerca la respiración o la piel — mascarillas de CPAP usadas, colchones — y registra los números de serie, porque los dispositivos de asistencia sí se retiran del mercado y necesitarás ubicar rápido a quien los tenga.",
    "Aprende los límites de los beneficios antes de aconsejar a nadie — un regalo, un empleo o ahorros por encima del tope pueden cortarle a alguien su cobertura médica. Ante la duda, deriva a una consejera de beneficios en vez de adivinar.",
    "Pon una pregunta sobre necesidades de acceso en cada inscripción y reserva intérpretes o subtitulado en vivo apenas fijes la fecha — los buenos intérpretes se apartan con semanas de anticipación, y 'no encontramos a tiempo' es como el estándar se afloja en silencio."
  ],
  "books-to-prisoners": [
    "Consigue la política por escrito y féchala — las instituciones cambian las reglas sin aviso, y una fotocopia del año pasado es justo la clase de prueba que no salvará una caja rechazada. Vuelve a verificar cada pocos meses.",
    "Descarta en la puerta los libros de tapa dura, manchados o rayados — la mayoría de las instituciones los rechaza, y una sala de empaque sepultada en donaciones que no se pueden enviar es más lenta que una con la mitad del acervo.",
    "Copia el nombre completo, el número de identificación y la unidad de alojamiento de cada persona tal como lo escribió, letra por letra — un solo dígito cambiado y todo el paquete rebota semanas después sin forma de avisarle por qué.",
    "Pon una lista de verificación de reglas en la pared y haz que una segunda persona revise cada paquete antes de sellarlo — la gente nueva tiene buena intención y empaca mal, y el error no se detecta hasta que vuelve con el franqueo ya pagado.",
    "El correo de medios (Media Mail) es mucho más barato para libros, pero legalmente no puede incluir una carta personal — mete notas solo donde la institución y las reglas postales lo permitan, o tu tarifa de ganga se vuelve un paquete devuelto.",
    "Capacita a quien escribe, antes de su primera carta, en los dos límites difíciles — nada de dirección de casa ni apellido, y un guion amable pero firme para pedidos de dinero o romance — para que la calidez nunca se vuelva una persona voluntaria sintiéndose atrapada."
  ],
  "community-music": [
    "Prueba tocar el instrumento o abre el estuche antes de aceptar cualquier cosa — un mástil torcido o una zapatilla agrietada pueden costar más que un instrumento nuevo de principiante, y los pianos 'gratis' casi nunca valen la mudanza ni la afinación.",
    "Fotografía el estado de cada instrumento al momento del préstamo — resuelve con amabilidad toda conversación de 'ya venía rayado', y es el registro que querrás si uno nunca regresa.",
    "Si las clases incluyen a menores, haz verificaciones de antecedentes antes de la primera sesión, sin excepción — es el paso poco glamoroso que protege a la niñez y al programa, y es mucho más difícil de agregar cuando alguien ya está enseñando.",
    "Confirma que el espacio sea tuyo en las horas que de verdad usarás — un salón libre los martes por la mañana no sirve para chicos después de clases — y pregunta por un clóset con llave para que el fondo de préstamo viva donde se toca.",
    "Ofrece al menos una jam anunciada explícitamente para principiantes — junta a alguien que toca rápido con quien recién empieza en el mismo círculo y el principiante suele irse callado y no vuelve.",
    "Dile claro a quien pide prestado: si algo se rompe, tráelo de vuelta, no lo arregles — un pegado casero o una cuerda demasiado tensa hacen el daño real, y el miedo a una factura es lo que hace que la gente lo esconda."
  ],
  "school-supply-program": [
    "Consigue las listas exactas, marcas incluidas — una maestra que pidió renglón ancho devolverá a casa el renglón universitario que compraste — y pide a la consejera un conteo real de familias para no andar adivinando cantidades.",
    "Compra tú mismo, al por mayor, los básicos poco vistosos — lápices, hojas de renglón ancho, barras de pegamento — y deja que la colecta traiga los extras divertidos; esos básicos son justo lo que los buzones de donación nunca producen en cantidad suficiente.",
    "Pon la lista por grado en cada estación de empaque y deja las mochilas sin sellar — un niño que necesita tijeras para zurdos o una talla más grande debería poder cambiarlo en la entrega sin desarmar una bolsa con cinta.",
    "Mantén el inventario levantado del piso y en un lugar seco y bajo llave — el cartón absorbe humedad y una inundación en el garaje arruina la colecta de todo un verano — y elige un punto de entrega sobre una ruta de autobús que las familias ya frecuenten.",
    "Haz la entrega una o dos semanas antes del primer día, no el fin de semana frenético previo, y omite todo formulario de ingresos — deja que los chicos elijan el color de su mochila y nadie se va sintiéndose inspeccionado."
  ],
  "legal-aid-clinic": [
    "Pregunta a cada abogado si su seguro de responsabilidad profesional cubre el trabajo voluntario; muchos programas pro bono del colegio de abogados lo cubren gratis, pero solo si la clínica se registra primero. Un abogado sin cobertura rechazará en silencio los casos difíciles.",
    "Consigue un contacto con nombre y un tiempo de espera realista en cada organización de derivación antes de abrir, no un número general: un 'llame a asistencia legal' con tres meses de lista detrás se siente como un desaire para quien está en crisis.",
    "Párate en la sala de espera y comprueba si se oye una voz normal desde el consultorio: una mesa compartida o una oficina con puerta de vidrio anula en silencio la confidencialidad de la que depende toda la clínica.",
    "Deja el fondo del problema fuera del formulario de cita: una hoja de agenda compartida que diga 'desalojo, indocumentado' es una filtración esperando a ocurrir. Solo nombres y horarios; los detalles pertenecen a la sala.",
    "Fecha cada folleto y haz que un abogado lo revise antes de imprimir: las leyes de derechos cambian, y un volante que cita una norma derogada manda a la gente al tribunal segura de algo que ya no es cierto.",
    "Confirma que el intérprete está reservado antes de anunciar una clínica en ese idioma, y nunca dejes que el hijo de un cliente interprete detalles legales: consigue un intérprete adulto o reprograma.",
    "Revisa el conflicto de interés contra la lista de clientes antes de la cita, no cuando la persona se sienta: en un barrio pequeño tarde o temprano se agendará a un casero y a su inquilino, y en la mesa ya es demasiado tarde."
  ],
  "resource-hub-dispatch": [
    "Asigna una persona real y un horario de revisión a cada canal antes de publicarlo: un buzón de voz sin responder o un formulario que nadie lee enseña a la gente que el centro es pura fachada, y esa reputación cuesta revertir.",
    "Anota los límites firmes de cada voluntario y su forma de contacto preferida, no solo sus habilidades, y reconfirma toda la lista cada trimestre, porque un listado de gente que dijo que sí hace ocho meses es en su mayoría ficción.",
    "Asigna cada solicitud a un coordinador con nombre que la lleve hasta el cierre: 'el equipo se encarga' significa que nadie lo hace. Incluso un 'no podemos con esto' en un día es mejor que un silencio que deja a alguien esperando en vano.",
    "Llama a cada entrada como si fueras un usuario y anota los requisitos y el horario real: los directorios se desactualizan rápido, y mandar a alguien al otro lado de la ciudad a un programa que cerró o no lo acepta desperdicia la confianza que se está construyendo.",
    "Pon el proceso de despacho por escrito para que un coordinador nuevo pueda cubrir un turno solo con la hoja: el verdadero riesgo del centro no es un día lento, sino que cada decisión de derivación viva en la cabeza de una sola persona agotada.",
    "Decide qué se elimina y cuándo, no solo cómo se guarda: el registro que ya se borró no se puede citar en un juicio, filtrar ni vulnerar. Al cerrar una solicitud, guarda el conteo del resultado y descarta los datos personales.",
    "Registra cada necesidad no cubierta en una categoría fija en el momento en que ocurre, no de memoria a fin de mes: 'seguimos fallando en X' solo se convierte en un argumento con financiamiento para un proyecto nuevo cuando los registros suman una cifra real."
  ],
  "harm-reduction-supplies": [
    "Pregunta si puedes distribuir bajo el paraguas legal y la orden permanente de la organización aliada: a menudo extiende su cobertura de protección ante sobredosis a tu equipo y ahorra meses de resolver el mismo papeleo en soledad.",
    "Anota la ley concreta o la fuente que lo dijo, con fecha: 'alguien dijo que las tiras están bien' no le sirve a un voluntario que le explica una mochila llena a un policía, y estas leyes cambian de un año a otro.",
    "Revisa las fechas de caducidad el día que llega la naloxona y guárdala lejos del calor y del frío: una dosis cocida en un maletero en verano o congelada en invierno puede fallar justo en el momento en que se necesita.",
    "Llama a cada número de crisis y tratamiento antes de imprimir unos cientos de instructivos: una línea desconectada o de otro condado descubierta en plena sobredosis es una sorpresa cruel, y reimprimir los kits da mucho más trabajo que una tarde marcando.",
    "Mantén la misma ruta y los mismos horarios en cada recorrido para que la gente aprenda cuándo encontrarte: la constancia es toda la relación. Y dale a cada punto fijo un contacto con nombre que reponga su caja, o se vacía y desaparece sin ruido.",
    "Cuenta los insumos entregados, no a las personas que los tomaron: una hoja de firmas o pedir identificación en la mesa reconstruye justo la barrera que se derribó. Las reversiones vale la pena anotarlas solo cuando alguien ofrece la historia por voluntad propia."
  ],
  "court-support": [
    "Pregunta a la defensoría pública cómo prefiere que la contacten y qué ayudaría de verdad: llega como manos extra, no como fiscalizadores que califican su trabajo, o la relación se cierra antes de abrirse.",
    "Ensaya en voz alta las palabras exactas de 'no puedo asesorar sobre eso, pregúntele a su abogado' hasta que salgan solas: la pregunta en el pasillo llega rápido y con calidez, y el instinto de ayudar es justo lo que arruina un caso.",
    "Verifica cada fecha y sala contra el registro del propio tribunal la tarde anterior, no contra la memoria del cliente: las audiencias se mueven y las salas se reasignan constantemente, y una ausencia de buena fe puede convertirse en una orden de arresto.",
    "Explica a los voluntarios nuevos el control de seguridad antes de su primera fecha: la fila se lleva 30 minutos, las navajas y a veces los teléfonos no pasan, y una audiencia puede significar tres horas de espera por dos minutos en la sala.",
    "Ten un conductor de respaldo para cada mañana de tribunal y confirma al principal la noche anterior: un traslado que se cae aquí no es una molestia, es una audiencia perdida y posiblemente una orden de arresto.",
    "Obtén por escrito las instrucciones del abogado sobre contenido, destinatario y plazo, y retén cada carta para que él la revise antes de enviarla: una frase bienintencionada que admita culpa o contradiga a la defensa puede causar un daño real."
  ],
  "cooling-warming-center": [
    "Prueba el aire acondicionado o la calefacción en un día realmente extremo, no en uno templado: una sala agradable en primavera puede no aguantar una ola de 38 grados, y eso se descubre con gente vulnerable dentro si no se comprueba antes.",
    "Ata el disparador a una cifra específica del servicio meteorológico para que nadie discuta a medianoche si 'ya es suficientemente grave', y nombra a una persona con autoridad para activarlo, de modo que la decisión nunca se atore.",
    "Rotula cada caja con claridad y pega una lista de contenido por dentro de la puerta del armario: durante una activación, un anfitrión recién llegado necesita encontrar el botiquín o los cargadores en segundos, no hurgar en cajas sin marcar.",
    "Practica la única decisión que importa: cómo se ven un golpe de calor y la hipotermia, y una regla permanente de llamar temprano a emergencias. Diles a los anfitriones con claridad que nunca se les cuestionará por llamar: el peligro es dudar, no exagerar.",
    "No programes nunca a un anfitrión solo: dos por turno cubren descansos, idas al baño y el momento en que alguien necesita ayuda mientras otro llama a emergencias. Mantén una lista de reserva con nombres, porque el mismo clima que llena el centro también deja fuera a voluntarios.",
    "Haz llegar los volantes a través de quienes alcanzan físicamente a los mayores aislados —repartidores de comida, encargados de edificios, trabajadores de calle—, porque los vecinos de mayor riesgo son justamente los que no ven las publicaciones en internet.",
    "Revisa a quien esté durmiendo en lugar de suponer que solo descansa: no se distingue una siesta de un golpe de calor o una hipotermia sin despertar a la persona con suavidad, y esa revisión callada es la razón de ser del centro."
  ],
  "community-oral-history": [
    "Divide el 'compartir' en casillas específicas —con nombre o sin él, solo la familia, público en internet— en lugar de un sí general, y dale a la persona una forma de contactarte después para cambiar de opinión. El consentimiento es un dial, no un interruptor.",
    "Graba una prueba de 30 segundos y escúchala antes de la sesión real: un refrigerador que zumba, una sala con eco o un teléfono casi lleno que se apaga en la mejor parte no tienen arreglo después, y rara vez se consigue la historia dos veces.",
    "Cuando una historia se vuelve cruda o delicada, detente y vuelve a preguntar si esa parte se puede conservar: un sí dado antes de grabar puede sentirse muy distinto una vez que las palabras ya se dijeron en voz alta, y volver a preguntar no cuesta nada.",
    "Guarda las dos copias en lugares realmente distintos —un teléfono y una cuenta en la nube, no dos carpetas en la misma computadora— y revisa de nuevo el formulario de consentimiento antes de publicar nada, porque los deseos de la gente cambian con los años."
  ],
  "community-solar-coop": [
    "Pide a los hogares interesados algo pequeño pero real —un compromiso firmado o un depósito reembolsable— y anota qué empresa eléctrica atiende a cada uno: las manos alzadas en una reunión sobreestiman la cooperativa a la mitad.",
    "Empieza por la base de datos DSIRE y la página de energía solar comunitaria de tu propia empresa eléctrica, y luego confirma con la oficina estatal de energía: una regla que cambió en la última legislatura puede invalidar en silencio un año de planificación.",
    "Antes de que alguien se enamore de un techo, revisa su antigüedad y la sombra que recibe: un techo que habrá que cambiar en ocho años implica pagar por desmontar y reinstalar todo el arreglo a media vida útil. Pregunta primero por las listas de espera de los programas existentes.",
    "Mantén la regla sin excepciones: ningún miembro firma nada —suscripción, arriendo, préstamo— hasta que lo haya leído un abogado que conozca cooperativas de energía. Presupuesta esa revisión desde el inicio; cuesta menos que cualquier cláusula que detecte.",
    "Llama a referencias de proyectos que el instalador hizo hace cinco años, no el mes pasado: lo que estás contratando es cómo responde a los problemas del cuarto año. Exige que el plan de mantenimiento venga cotizado en la oferta, no prometido de palabra.",
    "Haz una maqueta del estado de cuenta mensual real de un miembro antes de lanzar y pruébala con el miembro menos amigo de los números; muestra también un mes de invierno con poca producción, no solo el ejemplo de junio soleado, para que nadie se sienta engañado después.",
    "Pide a los miembros que lleven una factura real a una sesión conjunta: descifrar entre todos los tramos de tarifa y los cargos de distribución funciona mejor que cualquier folleto, y el vecino que bajó su consumo un veinte por ciento es tu mejor maestro."
  ],
  "worker-coop-incubator": [
    "Pregunta por el trabajo informal y no remunerado, no solo por el historial laboral: la persona que 'solo' cocinaba para una parroquia de doscientos o arreglaba el auto de todos los primos tiene habilidades de nivel empresarial que no va a mencionar por sí sola.",
    "Ofrece cada sesión al menos dos veces, incluida una en la noche o el fin de semana, y organiza cuidado infantil: los miembros que más necesitan la capacitación son justo los que una clase entre semana por la mañana deja fuera.",
    "Lleva al grupo a visitar una cooperativa en funcionamiento y deja que los miembros interroguen a los socios trabajadores sin ti en la sala; enseña también con honestidad cuándo una cooperativa no es la opción adecuada, porque descubrir el mal encaje después de constituirse es brutal.",
    "Haz que el grupo redacte primero los estatutos incómodos: cómo se retira un socio, cómo se rompe un empate, cómo se destituye a alguien. Las empresas que solo redactan las reglas del escenario feliz descubren el resto en plena crisis.",
    "Para cada fuente de financiamiento, registra el plazo, los documentos que exige y una persona de contacto, y vuelve a verificar cada trimestre: la mitad de los fondos para cooperativas de cualquier lista están cerrados, con otro nombre o sin dinero.",
    "Acuerden ritmo y alcance en la primera reunión: una hora mensual en el calendario, con agenda, dura más que la buena voluntad. Empareja a los mentores por rubro cuando se pueda; los márgenes de una panadería desconciertan a un consultor.",
    "Arranca la red con transacciones reales, no solo con encuentros: que la cooperativa de limpieza le cotice la cocina a la de banquetes, y haz que una ronda de pedidos de referidos sea punto fijo de la agenda en cada reunión."
  ],
  "elder-meal-delivery": [
    "Deja que una cara de confianza haga la presentación —la enfermera de la parroquia o la trabajadora del centro de mayores que ya conoce a la persona—, porque el toque de un desconocido recibe un no cortés justo de quienes más lo necesitan.",
    "La verificación de antecedentes tarda de dos a cuatro semanas, así que iníciala antes de anunciar una fecha de arranque. En las entrevistas, indaga más la constancia que el entusiasmo: pregunta qué compromiso semanal han mantenido durante un año.",
    "Prueba a recalentar una muestra en un microondas común antes de comprometerte con un envase —algunos se deforman o quedan fríos por dentro— y ponle fecha a cada etiqueta, porque el contenido sin el 'preparado el' sigue obligando a adivinar.",
    "Limita cada ruta a lo que deje diez minutos sin prisa por puerta —cinco o seis paradas, por lo general— y programa a las personas más frágiles al inicio del recorrido, para que un retraso nunca las empuje al día siguiente.",
    "Imprime en la hoja de ruta solo las alergias y las notas de acceso, y guarda lo demás bajo llave; fija además el hábito de volver a preguntar tras cualquier hospitalización, porque es cuando cambian las listas de medicamentos.",
    "Averigua quién tiene llave y un contacto de respaldo de cada persona mayor cuando se incorpora, no durante el primer susto, y reduce el protocolo a una tarjeta de bolsillo: nadie lee una carpeta parado frente a una puerta.",
    "Pregunta a los mayores en persona y a solas —una encuesta por correo a este grupo devuelve sobre todo silencio— y toma la primera semana faltada de un voluntario como una conversación, no como una falla: suele ser la señal temprana del desgaste."
  ],
  "disaster-relief-hub": [
    "Compara ambos sitios candidatos con el mapa de inundaciones y elige un respaldo en otro terreno: un centro y su respaldo en la misma calle baja fallan con la misma tormenta. Prueba las llaves tú mismo.",
    "Abre cuentas con proveedores y negocia desde ahora un acuerdo de compra: después del desastre, el efectivo compra justo lo que hace falta mientras las colectas entregan cajas sorpresa. Pide a cada proveedor por escrito qué inventario comprometería durante un evento.",
    "Decide desde ahora qué vas a rechazar —la ropa usada es el clásico verdugo de estos centros— y dales a los voluntarios el 'no' amable ya redactado. Una cuadrícula en el piso con lona y marcador, más un conteo en pizarra, vale más que un software que abandonarás a media crisis.",
    "Define las cantidades por hogar antes del primer día y publícalas en todos los idiomas locales: los límites visibles se leen como equidad, mientras que racionar sobre la marcha bajo presión se lee como favoritismo y desata las peleas que vacían tu fila de voluntarios.",
    "Haz un ensayo real al año —camiones, clasificación, una fila de entrega simulada— y asigna cada rol a una persona con nombre más un suplente. Una prueba sorpresa de la cadena de mensajes te dice quién sigue de verdad localizable.",
    "Entren desde ya a la lista de contactos de la gestión de emergencias del condado y a sus reuniones, e intercambien celulares con una persona concreta de cada agencia, porque tras un desastre las centralitas telefónicas son lo primero que colapsa.",
    "Guarda copias impresas y plastificadas de la cadena de contactos y los planos en ambos sitios y en los autos de dos coordinadores; deja también por escrito las reglas mundanas contra lesiones: guantes para clasificar y dos personas para cada carga pesada."
  ],
  "recovery-peer-support": [
    "Fija un mínimo de recuperación estable para los facilitadores —muchos programas piden dos años— y capacita siempre al menos a dos, para que ninguna reunión ni ningún miembro dependa jamás de la peor semana de una sola persona.",
    "Dales a los facilitadores la frase exacta para cuando alguien pregunte por la desintoxicación o los medicamentos: 'Esa es una pregunta médica, y aquí está quién puede responderla con seguridad'. Las palabras ensayadas resisten cuando la necesidad de la sala jala fuerte.",
    "Ten naloxona en cada reunión y capacita a cada facilitador para usarla, y coloca los números de las líneas de crisis a la vista de todos: el plan ante sobredosis solo cuenta si funciona en la sala esta misma noche.",
    "Visita el lugar a la hora real de la reunión y mira quién anda cerca: un edificio con noche de bar o un vestíbulo bullicioso a las siete deshace la discreción que prometía un recorrido en una tarde tranquila.",
    "Nombra en voz alta las excepciones junto con la promesa —el peligro inminente para sí o para otros recibe ayuda, no silencio—, porque los miembros merecen conocer los límites de la confidencialidad antes de compartir, no después.",
    "Entrega los volantes a quienes hablan con la gente en los momentos de decisión —planificadores de alta, orientadores de tribunales, personal de clínicas— y nunca publiques fotos de las reuniones. Una sala y un horario constantes importan más que el gran alcance.",
    "Organiza una sesión mensual de descarga para los facilitadores con alguien de fuera del grupo, y decidan juntos, por adelantado, cómo un facilitador da un paso al costado si su propia recuperación tambalea: una salida digna diseñada temprano evita una crisis después."
  ],
  "community-fitness": [
    "Pregunta qué impediría que la gente venga —el horario, el cuidado de los niños, sentirse juzgada—, no solo qué suena divertido. Las barreras que escuches moldearán el programa más que la lista de actividades.",
    "Observa a cada candidato dirigir diez minutos antes de confirmarlo —la calidez se nota rápido, igual que su ausencia— y recluta dos líderes por actividad, porque las vacaciones de un líder único cancelan la sesión.",
    "Visita cada espacio a la hora prevista de la sesión —el parque sombreado y tranquilo del recorrido matutino puede ser sofocante o inseguro a las seis de la tarde— y confirma que los baños de verdad estén abiertos a esa hora.",
    "Muestra primero la versión más suave de cada movimiento y trátala como la opción por defecto, no como la adaptación: cuando la variante con silla va primero, nadie tiene que rebajarse en público para usarla.",
    "Que los líderes lleven un teléfono cargado y sepan la dirección exacta o la entrada del parque para darla a los servicios de emergencia —'el campo grande junto a la escuela' hace perder minutos— y ten una tarjeta sencilla de contacto de emergencia por cada asistente habitual.",
    "Define el plan para mal clima antes de que empiece la temporada y anuncia los cambios siempre en el mismo lugar; recuerda que un 'ven conmigo' personal llena más cupos que cualquier volante: pide a cada habitual que traiga a un vecino.",
    "Haz notar las ausencias: un mensaje amable de 'te extrañamos' tras dos sesiones perdidas hace volver a la gente, mientras que el silencio le enseña que nadie notó su falta. Que sea cálido, nunca con reproche."
  ],
  "urban-orchard": [
    "Pregunta qué pasa con los árboles si el terreno cambia de dueño, y mete la respuesta en el propio acuerdo: un arriendo de diez años que muere con la venta es un apretón de manos de temporada vestido de contrato.",
    "Analiza el suelo por plomo y contaminantes y pide el trazado de servicios enterrados antes de cerrar el diseño: una tubería de gas o un nivel alto de plomo te va a redibujar el mapa, así que deja que redibuje la versión en papel.",
    "Pregunta a la oficina de extensión agrícola qué variedades resistentes a enfermedades prosperan de verdad en tu zona, y sé exigente con los árboles donados: un arbolito gratis que trae fuego bacteriano a un huerto joven es el regalo más caro que aceptarás.",
    "Cubre con cartón y mantillo o despeja cada círculo de plantación con semanas de anticipación, no esa mañana, y ten agua corriendo en el sitio antes del día de plantación: acarrear baldes para cuarenta árboles nuevos agota a los voluntarios enseguida.",
    "Planten juntos un árbol de demostración antes de que alguien tome una pala, y pon un capitán con experiencia por cada cinco o seis árboles: el error fatal es plantar demasiado hondo, así que haz de 'busca el cuello de la raíz' el mantra del día.",
    "Asigna el riego por nombre y mes en un calendario a la vista —'el que ande por ahí' significa nadie— y registra cada visita, porque un árbol joven necesita unos cuarenta a sesenta litros por semana en sus dos primeros veranos.",
    "Cuenta con que los transeúntes tomarán fruta y decide desde ahora si eso está bien —a la mayoría de los huertos les va bien con un letrero de 'toma unas pocas, deja algunas'— y pon las normas en un cartel en la entrada, no en actas de reunión."
  ],
  "new-parent-support": [
    "Recluta acompañantes pares cuyo hijo menor ya haya pasado la etapa de bebé pero tenga menos de cinco años: lo bastante reciente para recordarla con honestidad, lo bastante lejos para tener energía. Alguien en plena bruma del recién nacido no puede sostener la de otro.",
    "Programa comidas cada dos o tres días durante seis u ocho semanas, en vez de a diario por dos: la etapa dura sobrevive a la avalancha inicial de guisos. Sugiere una hielera en el porche para que la entrega nunca exija tocar el timbre.",
    "Ofrece un menú concreto —'¿lavo ropa, friego platos o llevo al hermano una hora al parque?'—, porque el '¿qué necesitas?' recibe casi siempre un 'nada, estamos bien' de un padre demasiado cansado para asignar tareas a extraños.",
    "Anota en cada entrada qué seguros acepta, la espera real y si alguien contesta a las dos de la madrugada: las crisis de un padre primerizo siguen el horario del recién nacido, y la mayoría de los directorios solo registran los datos de oficina.",
    "Dale a cada acompañante el mismo guion breve para nombrarlo —'esto suena a algo más que cansancio, y tiene tratamiento; ¿llamamos juntas?'— y trata cualquier mención de hacerse daño como una derivación el mismo día, nunca como un esperar a ver.",
    "Llama de verdad a las referencias —dos minutos de '¿le dejarías tu bebé?' valen más que cualquier formulario— y dales a los padres un botón de pausa sin explicaciones: tener que justificar un descanso es una carga en sí misma.",
    "Convierte cada derivación en una entrega cálida —una persona con nombre que espera la llamada, no un número en una lista— y comparte los datos básicos entre programas con consentimiento, para que un padre agotado nunca repita su historia desde cero."
  ],
  "foster-kinship-support": [
    "Recuerda que muchos cuidadores por parentesco nunca pasan por la agencia: llégales a través de orientadores escolares, pediatras y oficinas de asistencia, y abre cada contacto con una oferta concreta, como una cama lista, no con la descripción de un programa.",
    "No aceptes ninguna silla de auto con historial desconocido —los choques dejan daños invisibles— y coteja cada silla y cuna con la lista de retiros el día que llega. Clasifica la ropa por talla al recibirla, no 'después'.",
    "Empaca todo en una mochila o bolso de verdad que el niño conserve —los niños del sistema demasiadas veces mudan su vida en bolsas de basura— y que la ropa interior, los calcetines y los artículos de aseo sean siempre nuevos, sin excepción.",
    "Confirma con la agencia, niño por niño, quién está autorizado a dar relevo antes de ofrecerlo: algunas colocaciones solo admiten proveedores con licencia, y un cuidado bienintencionado pero no autorizado puede poner en riesgo la colocación misma.",
    "Ofrece cuidado infantil verificado en el mismo lugar o los cuidadores que más quieres alcanzar simplemente no podrán venir; considera además un círculo ocasional solo de parentesco, porque una abuela que cría a los hijos de su hija carga duelos que un padre de acogida no.",
    "Encabeza el directorio con el dinero que nadie menciona —subsidios exclusivos para el niño, asignaciones de ropa para acogida, programas de navegación por parentesco— y acompáñalo con un cuidador veterano dispuesto a guiar a los nuevos en la primera solicitud.",
    "Capacita a cada voluntario en el reporte obligatorio antes de su primer turno —qué debe reportarse, a quién y en qué plazo— y haz absoluta la regla de fotos: ninguna imagen de un niño bajo cuidado va a ningún lado, jamás."
  ],
  "weather-survival-outreach": [
    "Dimensiona cada kit para que alguien a pie lo cargue todo el día —una bolsa con cordón, no una caja voluminosa— y evita los calcetines de algodón: mojado, el algodón le roba calor al cuerpo, mientras que la lana abriga incluso húmeda.",
    "Compra el inventario de cada temporada en las liquidaciones de la anterior —cobijas en marzo, hieleras en septiembre, a un tercio del precio— y pide a hoteles y gimnasios sus toallas y cobijas dadas de baja, por lote.",
    "Cuida el mapa como el documento delicado que es: compartido a la ligera, se vuelve una guía para desalojos y acoso. Déjalo solo en manos de voluntarios de calle capacitados y nunca publiques ubicaciones en ningún chat grupal.",
    "Empareja a cada voluntario nuevo con un veterano en sus primeras tres rondas, y practiquen en juego de roles escuchar el 'no' hasta que aceptarlo con gracia sea automático: quien declina esta noche recordará mañana quién lo respetó.",
    "Activa las rondas según el índice de calor y las mínimas nocturnas, no el termómetro a secas —una noche de 13 grados bajo lluvia empapada mata—, y recorre las rutas el día antes del pico, cuando moverse a un lugar seguro todavía es posible.",
    "Verifica las camas por teléfono el mismo día y aprende los impedimentos de cada albergue —mascotas, parejas, toques de queda, reglas de sobriedad— para poder decir con honestidad a qué renunciaría alguien al ir. Las derivaciones honestas conservan la confianza.",
    "Practica la señal contraintuitiva: quien temblaba de frío y dejó de temblar está empeorando, no mejorando. La regla es absoluta: llama primero a emergencias, y mientras llega la ayuda ofrece sombra y agua, o abrigo y resguardo del viento."
  ]
};
