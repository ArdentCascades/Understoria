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

// Spanish translation of faq.ts. Same shape, same ids — only the
// prose changes. Help.tsx picks this module when i18n.language is
// "es"; any other locale falls through to the English faq.ts so a
// future, untranslated locale just shows English rather than an
// empty page.
//
// IDs are stable URL fragments shared across languages — never
// translate them. When adding or renaming an entry in faq.ts,
// mirror the change here so the parity test (faq.parity.test.ts)
// stays green.
//
// Voice notes: warm, neighborly, formal-but-warm "ustedes" (no
// "vosotros"). Term-of-art alignment with es.json:
//   exchange   → intercambio
//   credit     → crédito
//   vouch      → avalar / aval
//   block      → bloquear contacto
//   node       → nodo
//   co-organizer → co-organizador/a
//   follows    → sigue a / sigue (la tarea sigue a otra)
//   hard purge → Borrado duro
//   neighborhood → zona / vecindario

import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_ES: readonly FaqSection[] = [
  {
    id: "posts",
    title: "Publicaciones e intercambios",
    entries: [
      {
        id: "post-something",
        question: "¿Cómo publico una necesidad o una oferta?",
        answer: [
          "En el Tablero, toca el botón verde + Publicar necesidad o " +
            "+ Publicar oferta al pie de la pantalla. Pon un título corto, " +
            "describe qué necesitas o qué puedes dar, y publícalo. Más " +
            "tarde puedes editarlo o cancelarlo desde la página de detalle " +
            "de la publicación.",
        ],
      },
      {
        id: "claim-post",
        question: "¿Cómo tomo la publicación de otra persona?",
        answer: [
          "Toca cualquier publicación del Tablero para abrir su detalle " +
            "y luego toca Tomar. La publicación pasa al estado 'esperando " +
            "confirmación' y quien la publicó tiene la oportunidad de " +
            "confirmar antes de que se mueva crédito alguno.",
          "Si cambias de idea, puedes soltar la publicación desde la " +
            "misma página — vuelve a quedar abierta para otra persona.",
        ],
      },
      {
        id: "confirm-exchange",
        question: "¿Cómo funciona confirmar un intercambio?",
        answer: [
          "Una vez que la ayuda realmente ocurrió, ambas personas tocan " +
            "Confirmar en la página de detalle de la publicación. El " +
            "crédito solo se mueve cuando las dos han confirmado.",
          "El orden no importa — una confirma primero, la otra ve que la " +
            "publicación queda esperándole, y confirma cuando tiene un " +
            "momento.",
        ],
      },
      {
        id: "other-not-confirmed",
        question: "La otra persona no ha confirmado todavía. ¿Qué hago?",
        answer: [
          "Primero, escríbele fuera de la app. Casi siempre es una " +
            "confirmación olvidada, no una negativa.",
          "Si de verdad hay un desacuerdo sobre si el intercambio ocurrió " +
            "o si contó como ayuda completa, usa Señalar para revisión en " +
            "la página de detalle. Eso lo lleva a la página de Disputas, " +
            "donde la comunidad puede ayudar a resolverlo — no hay " +
            "administradores. El crédito queda pendiente hasta que se " +
            "resuelva.",
          "Tampoco te quedas esperando para siempre. Si tu comunidad " +
            "tiene la confirmación automática activada, el nodo comunitario " +
            "interviene tras el tiempo de espera acordado y completa una " +
            "confirmación que claramente quedó olvidada, para que el " +
            "crédito de nadie quede en el limbo indefinidamente.",
        ],
      },
      {
        id: "cancel-post",
        question: "¿Cómo cancelo una publicación que ya no necesito?",
        answer: [
          "Abre la publicación (desde el Tablero o desde el historial de " +
            "tu perfil) y toca Cancelar publicación. Las publicaciones " +
            "canceladas siguen visibles para que la comunidad vea qué se " +
            "pidió u ofreció, pero ya no se pueden tomar.",
        ],
      },
    ],
  },
  {
    id: "balance",
    title: "Saldo y créditos",
    entries: [
      {
        id: "what-is-balance",
        question: "¿Qué significa mi saldo?",
        answer: [
          "Tu saldo es el total acumulado de las horas que has dado menos " +
            "las que has recibido. Todo el mundo empieza en 5 (el crédito " +
            "semilla), así que una persona recién llegada está en 5, no " +
            "en 0.",
          "Un saldo negativo está bien — pedir ayuda no es una deuda. Los " +
            "saldos los ve tu comunidad, pero no son una puntuación, y no " +
            "hay tabla de clasificación.",
        ],
      },
      {
        id: "negative-balance",
        question: "¿Mi saldo puede ponerse en negativo?",
        answer: [
          "Sí. Recibir más de lo que has dado es parte de cómo funciona " +
            "la ayuda mutua — la red está hecha para fluir. La comunidad " +
            "solo verá una alerta si te acercas al límite diario de " +
            "intercambios o si un patrón se ve inusual; fuera de eso, " +
            "nadie está vigilando tu número.",
        ],
      },
    ],
  },
  {
    id: "identity",
    title: "Tu identidad y tus dispositivos",
    entries: [
      {
        id: "getting-around",
        question: "¿Dónde quedó la pestaña Perfil? ¿Cómo me muevo por la app?",
        answer: [
          "Cinco pestañas viven en la parte de abajo de la pantalla " +
            "(una barra a la izquierda en pantallas anchas): Tablero, " +
            "Panel, Calendario, Mensajes y A mi cuidado — cada tarea que " +
            "has tomado y cada proyecto que organizas, reunidos en un " +
            "solo lugar.",
          "Todo lo que trata de TI se movió detrás del botón Menú, en " +
            "la esquina superior derecha: tu Perfil (aparece bajo tu " +
            "propio nombre), Ajustes, Invitar a alguien, esta página de " +
            "Ayuda, Buscar e Infraestructura comunitaria.",
          "Buscar encuentra publicaciones, proyectos, eventos, " +
            "personas y estas respuestas de ayuda — todo desde lo que " +
            "ya está en tu dispositivo. Con teclado, Ctrl+K (⌘K en " +
            "Mac) lo abre desde cualquier parte.",
        ],
      },
      {
        id: "change-name",
        question: "¿Cómo cambio mi nombre visible o mi zona?",
        answer: [
          "Perfil → Editar datos. Los nombres son etiquetas, no " +
            "credenciales, así que puedes cambiar el tuyo cuando quieras. " +
            "Tu identidad criptográfica sigue siendo la misma.",
        ],
      },
      {
        id: "install-app",
        question: "¿Puedo instalar Understoria como una app?",
        answer: [
          "Sí. Understoria es una aplicación web que puedes poner en " +
            "tu pantalla de inicio como cualquier otra app: obtienes " +
            "un icono, se abre a pantalla completa sin las barras del " +
            "navegador, arranca más rápido y sigue funcionando sin " +
            "conexión.",
          "En iPhone o iPad, abre Understoria en Safari, toca el botón " +
            "Compartir y elige 'Añadir a pantalla de inicio.'",
          "En Android, ábrela en Chrome, toca el menú (⋮) en la esquina " +
            "superior y elige 'Añadir a pantalla de inicio' o 'Instalar " +
            "aplicación.'",
          "En un navegador de escritorio, busca el icono de instalación " +
            "al final derecho de la barra de direcciones.",
          "Algo que debes saber antes de instalar: en iPhone y iPad la " +
            "app instalada tiene su PROPIO almacenamiento separado, así " +
            "que arranca sin sesión aunque la copia del navegador sí " +
            "tenga tu identidad — no se pierde nada, simplemente tienes " +
            "dos 'dispositivos' separados en un mismo teléfono. La app " +
            "instalada lo pregunta en su primera pantalla: elige 'Ya " +
            "uso Understoria en el navegador de este teléfono' y te " +
            "guía paso a paso para traer tu identidad. (En Android y en " +
            "computadora la app instalada comparte el almacenamiento " +
            "del navegador, así que tu sesión se mantiene.)",
        ],
      },
      {
        id: "lost-passphrase",
        question: "¿Qué pasa si pierdo mi contraseña?",
        answer: [
          "Nadie puede restablecerla por ti, por diseño. El trato es: " +
            "ninguna autoridad central puede leer tus datos, y por eso " +
            "ninguna autoridad central puede rescatarlos tampoco.",
          "Pero una contraseña olvidada ya no tiene por qué significar " +
            "una identidad perdida. Si tienes un segundo dispositivo " +
            "vinculado, tu identidad sigue ahí. Si creaste un kit de " +
            "recuperación (Ajustes → Kit de recuperación), restaura tu " +
            "cuenta con su propia frase, separada. Si elegiste " +
            "guardianes, un grupo suficiente de ellos puede devolverte " +
            "tu cuenta sin contraseña alguna. Mira '¿Qué pasa si pierdo " +
            "mi teléfono?' abajo para el orden completo.",
          "Solo si nada de eso existe la respuesta es Perfil → " +
            "Emergencia → Borrado duro: vaciar el dispositivo y empezar " +
            "de cero con una identidad nueva, sin tu historial anterior.",
        ],
      },
      {
        id: "lost-phone",
        question: "¿Qué pasa si pierdo mi teléfono?",
        answer: [
          "Tu cuenta puede volver — este es el orden honesto a " +
            "intentar, de mejor a peor.",
          "1. Un segundo dispositivo vinculado. Si añadiste uno " +
            "(Perfil → Añadir otro dispositivo), tu identidad ya vive " +
            "ahí; sigue usándolo y vincula el teléfono de reemplazo " +
            "desde él.",
          "2. Un kit de recuperación. Si creaste uno (Ajustes → Kit de " +
            "recuperación), abre la aplicación en cualquier dispositivo " +
            "nuevo, elige '¿Perdiste tu dispositivo pero tienes un kit " +
            "de recuperación?' y escribe la frase del kit. El saldo, " +
            "los avales, los roles y la membresía vuelven; la historia " +
            "de la comunidad se sincroniza desde su servidor.",
          "3. Tus guardianes. Si repartiste tu clave entre guardianes " +
            "(Ajustes → Guardianes), reúnete con suficientes: el " +
            "dispositivo nuevo muestra un código de solicitud, cada " +
            "guardián responde con un código de liberación, y al " +
            "llegar al umbral tu cuenta vuelve — sin kit y sin " +
            "contraseña.",
          "4. Una invitación nueva. Si nada de lo anterior existe, " +
            "pide que te inviten de nuevo. Serás un miembro nuevo: tu " +
            "historia anterior sigue visible para la comunidad bajo tu " +
            "nombre anterior, pero la clave nueva empieza de cero. " +
            "Exactamente por eso la aplicación insiste en un segundo " +
            "dispositivo, un kit o guardianes ANTES de la mala semana.",
          "Lo que nunca vuelve en un dispositivo nuevo: los mensajes " +
            "directos y los borradores sin enviar — solo vivían en el " +
            "teléfono perdido, por diseño.",
        ],
      },
      {
        id: "new-device",
        question: "¿Cómo paso a un dispositivo nuevo?",
        answer: [
          "Nada que escribir. En el dispositivo nuevo, abre Understoria " +
            "y elige 'Traer mi identidad' — muestra dos emoji y espera. " +
            "En el dispositivo que ya tiene tu identidad, ve a Perfil → " +
            "Vincular otro dispositivo: la solicitud aparece ahí sola. " +
            "Revisa que los emoji coincidan, toca 'Vincularlo', y el " +
            "dispositivo nuevo inicia sesión solo. Ambos dispositivos " +
            "deben estar en la misma red (en un mismo teléfono siempre " +
            "lo están). ¿En otro lugar, o sin servidor comunitario? " +
            "'Otras formas de vincular' tiene un código hablado de 6 " +
            "palabras y un QR que no pasa por ningún servidor.",
          "Dos cosas no viajan: tu historial de mensajes (los mensajes " +
            "están cifrados a las claves propias de cada dispositivo, así " +
            "que se quedan donde fueron recibidos) y los ajustes por " +
            "dispositivo como el tema y el tamaño de texto. Todo lo " +
            "demás — publicaciones, proyectos, eventos, miembros, " +
            "intercambios — viaja con la vinculación misma, así que el " +
            "dispositivo nuevo se ve como el anterior de inmediato y " +
            "sigue sincronizando después.",
        ],
      },
      {
        id: "link-safety",
        question: "¿Qué debo vigilar al vincular dispositivos?",
        answer: [
          "Tres hábitos simples mantienen segura la vinculación. " +
            "Primero: solo toca 'Vincularlo' cuando TÚ tengas en la " +
            "mano el dispositivo que está pidiendo, y los dos emoji de " +
            "tu pantalla coincidan con los dos de la suya. Si aparece " +
            "una solicitud cuando no estás vinculando nada, ignórala — " +
            "alguien en tu red podría estar probando suerte, y no pasa " +
            "nada a menos que tú toques.",
          "Segundo: cuando el dispositivo nuevo inicie sesión, mira el " +
            "nombre con que te saluda. Si no eres tú, alguien coló su " +
            "propia identidad en tu transferencia — no se llevaron " +
            "nada tuyo, y el botón 'Esta no soy yo' limpia el " +
            "dispositivo para que empieces de nuevo.",
          "Tercero, la letra pequeña honesta: vincular con un toque " +
            "pasa por el servidor de tu propia comunidad, que solo " +
            "transmite datos sellados que no puede leer — pero si no " +
            "confías en quien lo administra, usa el método QR en " +
            "'Otras formas de vincular'. El QR va de pantalla a cámara " +
            "sin ningún servidor de por medio.",
          "Una nota práctica: vincular con un toque necesita que " +
            "ambos dispositivos parezcan estar en la misma red. Una " +
            "VPN o iCloud Private Relay puede interponerse sin que lo " +
            "notes — si la solicitud nunca aparece, páusala un minuto " +
            "y pide de nuevo, o usa 'Otras formas de vincular'.",
        ],
      },
    ],
  },
  {
    id: "community",
    title: "Comunidad e invitaciones",
    entries: [
      {
        id: "internet-outage",
        question:
          "¿Qué podemos hacer si se corta el internet — como durante un huracán?",
        answer: [
          "Más de lo que crees, porque la app entera se construyó " +
            "exactamente para esto. Tu dispositivo ya lleva todo: el " +
            "tablón, el registro, la lista de miembros, tu identidad. " +
            "Puedes seguir leyendo, publicando y confirmando — cada " +
            "cambio se guarda en cola y se envía solo en cuanto vuelvas " +
            "a conectarte. Nada se pierde mientras no hay internet.",
          "Si alguien cerca necesita ayuda AHORA: ayúdale, y luego " +
            "confírmenlo juntos en persona. En la página de la " +
            "publicación, elige \"Confirmar en persona\" — un teléfono " +
            "muestra un código, el otro lo escanea y firma. Ambos " +
            "teléfonos guardan el registro y lo llevan a casa cuando " +
            "vuelva el internet.",
          "Si tu comunidad tiene un nodo de tormenta — un pequeño " +
            "servidor de respaldo que alguien mantiene listo para " +
            "cortes — únete a su WiFi cuando no haya internet y la app " +
            "simplemente vuelve a funcionar para todos en el refugio: " +
            "las publicaciones fluyen, la ayuda se confirma, sin " +
            "configurar nada. Pregunta a quien administra el servidor " +
            "de tu comunidad si existe un nodo de tormenta; si no, " +
            "docs/offline-resilience.md es la receta para construirlo " +
            "en tiempos buenos.",
          "Incluso puedes invitar a alguien nuevo. Tu código de " +
            "invitación funciona sin internet — lo firmas tú y vale " +
            "por dos semanas — así que muéstrale el código QR o dale " +
            "el enlace en papel y que guarde una foto. En un nodo de " +
            "tormenta puede instalar la app y unirse en el momento; " +
            "si no, termina de unirse en cuanto consiga cualquier " +
            "conexión. Lo único que no puede pasar sin ninguna red es " +
            "descargar la app en sí — la invitación espera paciente " +
            "hasta que pueda.",
          "Los buenos tiempos son el momento de ponerlo en papel: la " +
            "página de Infraestructura comunitaria puede imprimir un " +
            "kit de cortes — un cartel de pared y tarjetas de bolsillo " +
            "con los pasos para unirse al centro — para que las " +
            "instrucciones sobrevivan también a las baterías muertas.",
        ],
      },
      {
        id: "add-a-node",
        question:
          "¿Qué protege a esta comunidad si alguien se lleva nuestro servidor?",
        answer: [
          "Dos cosas, y son el corazón de por qué Understoria está " +
            "construida de otra manera que los servicios corporativos. " +
            "Primero: el dispositivo de cada integrante ya guarda una " +
            "copia completa y firmada de la comunidad — el tablón, el " +
            "registro, los proyectos, todo. Confiscar el servidor no " +
            "se lleva nada que no esté ya en los teléfonos de todo el " +
            "mundo, y un servidor nuevo se puede rellenar desde esas " +
            "copias.",
          "Segundo: el servidor no tiene que ser una sola máquina, ni " +
            "la máquina de una sola persona. Cualquier integrante " +
            "puede correr un nodo comunitario — un portátil viejo en " +
            "un armario es de verdad suficiente. Cada nodo adicional " +
            "significa que no existe una sola persona a la que un " +
            "grupo antisindical o contrario a la ayuda mutua pueda " +
            "presionar para romper la comunidad. La tarjeta de " +
            "resiliencia del Panel muestra cuántas raíces ha echado " +
            "tu comunidad.",
          "¿Lista para añadir uno? El paso a paso vive en la " +
            "documentación del proyecto — docs/add-a-node.md en el " +
            "repositorio de Understoria explica cómo reutilizar una " +
            "computadora vieja, y la guía de operación cubre los " +
            "detalles. Es una tarde de trabajo, y quien corre el " +
            "servidor actual puede ayudarte a intercambiar los dos " +
            "ajustes que enlazan los nodos.",
        ],
      },
      {
        id: "start-a-community",
        question: "¿Podría crear una comunidad como esta para mi barrio?",
        answer: [
          "Sí — y no necesitas el permiso de nadie, ni cuenta de " +
            "GitHub, ni una tienda de aplicaciones. Understoria es " +
            "software libre, y el propio servidor de esta comunidad " +
            "ofrece su código fuente completo para descargar.",
          "El camino completo está escrito dentro de la app: abre el " +
            "Menú (arriba a la derecha) → Infraestructura comunitaria " +
            "→ la tarjeta 'El software mismo' → 'Crea una comunidad " +
            "nueva desde esta descarga'. Te lleva desde descargar y " +
            "verificar el código hasta montar tu propio servidor, en " +
            "lenguaje sencillo.",
        ],
      },
      {
        id: "invite-someone",
        question: "¿Cómo invito a alguien?",
        answer: [
          "El camino más rápido: abre el Menú (arriba a la derecha) y " +
            "elige Invitar a alguien — te lleva directo a la tarjeta " +
            "de invitaciones. El camino largo es Perfil → Invitaciones.",
          "Toca Generar invitación y vas a recibir un " +
            "enlace de un solo uso. Compártelo en persona, por Signal o " +
            "por cualquier canal en el que puedas confirmar que llegó a " +
            "la persona que querías. No publiques enlaces de invitación " +
            "en abierto.",
          "También puedes mostrar una invitación como código QR para " +
            "compartirla en persona. Cada invitación es de un solo uso, " +
            "caduca por sí sola y puede revocarse desde Perfil → " +
            "Invitaciones hasta que se canjea. Cuando alguien entra con " +
            "tu invitación, eso cuenta como un aval tuyo — tu nombre " +
            "respalda su llegada, así que invita a personas que de verdad " +
            "conoces.",
        ],
      },
      {
        id: "how-vouching-works",
        question: "¿Cómo funcionan los avales?",
        answer: [
          "Un aval es una declaración pública y firmada de que " +
            "conoces a esta persona y respaldas su lugar en la " +
            "comunidad. Alguien pasa a ser 'de confianza' cuando dos " +
            "miembros distintos le han avalado — e invitar a alguien " +
            "cuenta automáticamente como tu aval, así que avalar a " +
            "mano es la forma de respaldar a una persona que trajo " +
            "otra gente.",
          "Avalas desde la página de una persona: toca su nombre en " +
            "cualquier parte de la app y busca la sección Avalar. El " +
            "botón aparece cuando tu aval realmente sumaría confianza " +
            "— tú ya eres de confianza, la persona aún está juntando " +
            "avales y no la has avalado antes. Si no, la sección " +
            "explica por qué no, para que nunca te quedes adivinando.",
          "Vale la pena pensarlo un momento: tu nombre respalda el " +
            "suyo, de forma visible y permanente — un aval no se " +
            "puede retirar desde la app. Si después te arrepientes, " +
            "el camino es una conversación con tu comunidad, no un " +
            "botón. Avala a personas que de verdad conoces.",
        ],
      },
      {
        id: "disagree-with-member",
        question: "¿Qué hago si no estoy de acuerdo con otra persona?",
        answer: [
          "Habla con ella primero. La mayoría de los desacuerdos no son " +
            "sobre la app y no necesitan que la app se meta.",
          "Si es sobre un intercambio concreto, usa Señalar para revisión " +
            "en la página de detalle de la publicación. Si es sobre " +
            "comportamientos más allá de un solo intercambio, puedes " +
            "abrir una disputa desde Perfil → Disputas — las disputas " +
            "pasan por el proceso abierto de propuestas de la comunidad, " +
            "porque no hay administración que decida por ti.",
          "Y si lo que necesitas es simplemente distancia, bloquear " +
            "siempre está disponible — ve '¿Qué hago si alguien me está " +
            "molestando?' en Mensajes.",
        ],
      },
      {
        id: "member-removal",
        question: "¿Cómo funciona expulsar a alguien de la comunidad?",
        answer: [
          "La expulsión es lo más grave que esta comunidad puede " +
            "hacer, y la aplicación la trata así. Es el último " +
            "recurso: un bloqueo personal ya impide que el contenido " +
            "de alguien te llegue, una disputa puede impugnar un " +
            "intercambio concreto, y una conversación arregla más que " +
            "cualquiera de las dos.",
          "Ninguna persona sola puede expulsar a nadie — ni quien " +
            "organiza, ni quien opera el servidor. Hacen falta varias " +
            "personas (el número lo fija tu comunidad y es visible " +
            "para todas) firmando cada una con su nombre un registro " +
            "público. Proponer empieza en el perfil del miembro; " +
            "cofirmar ocurre en persona, desde la página de Propuestas.",
          "Una expulsión es pública dentro de la comunidad — quién " +
            "fue expulsado, cuándo, por qué y exactamente quiénes " +
            "firmaron, todo visible en la página de Propuestas. Las " +
            "expulsiones secretas son la manera en que las comunidades " +
            "se pudren.",
          "No es un borrado. Los intercambios pasados de la persona " +
            "expulsada permanecen — equilibran los libros de otros " +
            "miembros — y todo lo que hay en su propio dispositivo " +
            "sigue siendo suyo. Lo que termina es su acceso: la " +
            "lectura se detiene y la escritura nueva se rechaza. Las " +
            "personas que invitó antes de la expulsión siguen siendo " +
            "miembros; sus invitaciones sin usar mueren con ella.",
          "Y la puerta puede reabrirse: la readmisión requiere el " +
            "mismo número de firmas, iniciada desde el propio registro " +
            "de expulsión en la página de Propuestas.",
        ],
      },
      {
        id: "lurking-ok",
        question: "¿Puedo solo mirar sin publicar nada?",
        answer: [
          "Sí. Leer lo que otras personas ofrecen y piden es una forma " +
            "válida de participar. Algunas personas miran durante semanas " +
            "antes de publicar su primera necesidad; otras nunca publican " +
            "y solo responden a otras. Las dos formas son bienvenidas.",
        ],
      },
      {
        id: "who-sees-what",
        question: "¿Quién puede ver lo que publico?",
        answer: [
          "Todo el mundo en el nodo de tu comunidad puede ver tus " +
            "publicaciones, tu nombre visible, tu zona (si pusiste una) y " +
            "tu historial de intercambios. Las comunidades vecinas " +
            "reciben los registros firmados que publicas — publicaciones, " +
            "intercambios confirmados, eventos — bajo tu llave pública, " +
            "no tu nombre visible. Como los intercambios se federan, un " +
            "nodo vecino puede ver la actividad de intercambios de tu " +
            "llave y deducir su saldo; lo que nunca sale de tu comunidad " +
            "son las confirmaciones de asistencia, los turnos, las tareas " +
            "de proyectos, los bloqueos, los borradores y los mensajes.",
          "Los mensajes directos son distintos: están cifrados de extremo " +
            "a extremo entre tu dispositivo y el de la otra persona, así " +
            "que solo ustedes dos pueden leerlos — ni el nodo, ni las " +
            "demás personas. Mira '¿Cómo envío un mensaje a otra " +
            "persona?' en Mensajes para los detalles.",
        ],
      },
      {
        id: "beta-status",
        question:
          "¿Qué tan terminada está esta aplicación? ¿Qué no debería poner en ella?",
        answer: [
          "Understoria es software en fase beta. Gran parte de su " +
            "código fue escrito con herramientas de IA y revisado " +
            "por personas, y todavía no ha pasado una auditoría de " +
            "seguridad independiente.",
          "Las protecciones que ves son reales y están probadas — " +
            "los mensajes van cifrados de extremo a extremo, los " +
            "registros están firmados, el borrado de emergencia " +
            "funciona. Pero beta significa que puede haber errores, " +
            "incluidos algunos que nadie ha encontrado todavía.",
          "Está hecha para coordinar la ayuda vecinal de cada día. " +
            "No pongas nada que pudiera hacerte daño a ti o a otra " +
            "persona si se filtrara — documentos de identidad, " +
            "detalles médicos o migratorios, ni nada que solo dirías " +
            "fuera de registro. Ante la duda, dilo en persona.",
        ],
      },
    ],
  },
  {
    id: "messages",
    title: "Mensajes",
    entries: [
      {
        id: "message-someone",
        question: "¿Cómo envío un mensaje a otra persona?",
        answer: [
          "Abre cualquier publicación y toca el botón Mensaje para " +
            "escribir — el mensaje va a quien publicó, o, si es tu propia " +
            "publicación, a quien te está ayudando. También puedes " +
            "empezar una conversación desde la página de una persona, o " +
            "abrir Mensajes en la navegación para ver todas tus " +
            "conversaciones y buscar dentro de ellas.",
          "Los mensajes están cifrados de extremo a extremo y viajan de " +
            "dispositivo a dispositivo. Solo tú y la persona a la que " +
            "escribes pueden leerlos — el nodo comunitario los lleva de " +
            "un lado al otro, pero no puede ver dentro.",
          "A propósito, no hay confirmaciones de lectura ni indicadores " +
            "de que estás escribiendo. Nadie puede ver cuándo (ni si) has " +
            "leído un mensaje, y nadie está mirando mientras redactas " +
            "una respuesta. Lee cuando leas, responde cuando tengas " +
            "capacidad — la app no te delata en ninguno de los dos casos.",
        ],
      },
      {
        id: "someone-bothering-me",
        question: "¿Qué hago si alguien me está molestando?",
        answer: [
          "Puedes bloquear a esa persona. Abre tu conversación con ella " +
            "y elige Bloquear contacto en el menú de arriba, o usa la " +
            "opción de bloqueo en su página de persona.",
          "Bloquear es inmediato y privado. Dejas de ver sus " +
            "publicaciones, sus eventos, sus comentarios y sus mensajes, " +
            "y ninguna de las dos personas puede ya enviarse mensajes, " +
            "avalarse, tomar publicaciones de la otra ni invitarla. A la " +
            "otra persona no se le avisa — no hay notificación, ni marca " +
            "en su perfil, ni nada que el resto de la comunidad pueda ver.",
          "Bloquear NO es presentar una queja. No se alerta a ninguna " +
            "persona moderadora, no se abre una disputa, y los " +
            "intercambios anteriores quedan tal como estaban. Si quieres " +
            "que la comunidad opine, abre una disputa desde Perfil → " +
            "Disputas — el bloqueo y la disputa conviven sin problema. " +
            "El bloqueo te da calma ahora; la disputa sigue el proceso " +
            "comunitario a su propio ritmo.",
          "Puedes revisar, editar o deshacer tus bloqueos en cualquier " +
            "momento en Ajustes → Contactos bloqueados.",
        ],
      },
    ],
  },
  {
    id: "events",
    title: "Eventos y calendario",
    entries: [
      {
        id: "community-events",
        question: "¿Cómo funcionan los eventos comunitarios?",
        answer: [
          "Cualquiera puede crear un evento: abre el Calendario y toca " +
            "el botón +. Pon una hora, un lugar y una descripción, y " +
            "aparece en el calendario comunitario para todo el mundo.",
          "Toca un evento para confirmar asistencia — voy, tal vez o no " +
            "voy. Tu confirmación de asistencia se queda en el nodo de " +
            "esta comunidad: quien organiza y las demás personas que " +
            "confirmaron pueden ver tu nombre, las personas que no han " +
            "confirmado ven solo los conteos, y las comunidades vecinas " +
            "no ven tu confirmación nunca. Si cambias tu respuesta a 'no " +
            "voy', tu nombre sale de la lista al momento.",
          "Algunos eventos también tienen turnos — franjas horarias " +
            "donde quien organiza necesita cierto número de manos, como " +
            "un equipo de montaje o una rotación para servir. Apuntarte " +
            "a un turno también confirma tu asistencia como 'voy'. La " +
            "lista de turnos funciona como la lista de asistencia: se " +
            "queda en el nodo de esta comunidad, y cambiar tu respuesta " +
            "a 'no voy' te quita también de los turnos.",
          "Los eventos no se pueden editar después de creados — un " +
            "evento firmado se queda siendo exactamente aquello a lo que " +
            "la gente dijo que sí. Si cambian los detalles, quien " +
            "organiza lo cancela y publica uno nuevo. Cuando un evento " +
            "al que confirmaste asistencia se cancela, vas a ver un " +
            "aviso al respecto (con el motivo de quien organiza, si lo " +
            "dejó) la próxima vez que abras la app.",
        ],
      },
    ],
  },
  {
    id: "projects",
    title: "Proyectos y tareas",
    entries: [
      {
        id: "task-follows",
        question: "¿Por qué una tarea dice 'Sigue a: …'?",
        answer: [
          "Las tareas de un proyecto se pueden ordenar en secuencia. " +
            "'Sigue a' quiere decir que esta tarea va naturalmente " +
            "después de otra — colar los cimientos antes de levantar las " +
            "paredes. Nada está atascado y nadie le está cerrando el " +
            "paso a nadie; es solo un orden.",
          "Aun así puedes tomar una tarea que sigue a otra cuando " +
            "quieras. La única diferencia es que la app, a propósito, no " +
            "te va a preguntar cómo va hasta que la tarea anterior esté " +
            "lista — no tiene sentido preguntar cómo va algo cuando la " +
            "base sobre la que se apoya todavía no está. El sistema " +
            "espera contigo, no a ti.",
        ],
      },
    ],
  },
] as const;
