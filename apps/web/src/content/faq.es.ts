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
            "la página de detalle. Una persona mediadora de la comunidad " +
            "puede ayudar a resolverlo; los créditos quedan pendientes " +
            "mientras tanto.",
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
          "Instalarla no cambia nada de tus datos — todo sigue viviendo " +
            "en tu dispositivo, exactamente igual que antes.",
        ],
      },
      {
        id: "lost-passphrase",
        question: "¿Qué pasa si pierdo mi contraseña?",
        answer: [
          "No hay recuperación, por diseño. El trato es: ninguna " +
            "autoridad central puede leer tus datos, y por eso ninguna " +
            "autoridad central puede rescatarlos tampoco.",
          "Si te preocupa, el camino más seguro es elegir una contraseña " +
            "que puedas recordar y anotarla en algún lugar fuera de línea. " +
            "Si pierdes el acceso, la única opción que queda es Perfil → " +
            "Emergencia → Borrado duro, que vacía el dispositivo y te " +
            "deja empezar de cero con una identidad nueva. No vas a " +
            "recuperar tu historial de créditos anterior.",
        ],
      },
      {
        id: "new-device",
        question: "¿Cómo paso a un dispositivo nuevo?",
        answer: [
          "Usa la vinculación de dispositivos. En el dispositivo que ya " +
            "tiene tu identidad, ve a Perfil → Vincular otro dispositivo. " +
            "Te muestra un código QR y una contraseña corta. En el " +
            "dispositivo nuevo, elige 'Ya tengo otro dispositivo' en la " +
            "pantalla de bienvenida, escanea el código (o pégalo), y " +
            "escribe la contraseña. Tu identidad y tu perfil se mueven " +
            "directamente, de dispositivo a dispositivo — nada pasa por " +
            "ningún servidor.",
          "Dos cosas no viajan: tu historial de mensajes (los mensajes " +
            "están cifrados a las claves propias de cada dispositivo, así " +
            "que se quedan donde fueron recibidos) y los ajustes por " +
            "dispositivo como el tema y el tamaño de texto. Todo lo que " +
            "vive en el registro compartido de la comunidad — " +
            "publicaciones, intercambios, avales — aparece en el " +
            "dispositivo nuevo por la sincronización normal.",
        ],
      },
    ],
  },
  {
    id: "community",
    title: "Comunidad e invitaciones",
    entries: [
      {
        id: "invite-someone",
        question: "¿Cómo invito a alguien?",
        answer: [
          "Perfil → Invitaciones → Generar invitación. Vas a recibir un " +
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
            "tu historial de intercambios. Las otras comunidades pueden " +
            "ver las publicaciones federadas que publicas, pero no pueden " +
            "ver tu saldo ni tu historial de actividad.",
          "Los mensajes directos son distintos: están cifrados de extremo " +
            "a extremo entre tu dispositivo y el de la otra persona, así " +
            "que solo ustedes dos pueden leerlos — ni el nodo, ni las " +
            "demás personas. Mira '¿Cómo envío un mensaje a otra " +
            "persona?' en Mensajes para los detalles.",
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
