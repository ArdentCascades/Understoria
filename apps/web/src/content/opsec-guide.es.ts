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

// Spanish translation of opsec-guide.ts. Same shape, same ids —
// only the prose changes. IDs are stable and never translated; the
// section/paragraph structure is enforced by guides.parity.test.ts,
// so mirror any change to opsec-guide.ts here.

import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE_ES: readonly GuideSection[] = [
  {
    id: "device",
    title: "Sobre tu dispositivo",
    body: [
      "Bloquea tu teléfono con un PIN de seis dígitos o una frase " +
        "fuerte. Activa el cifrado de disco completo (todo teléfono " +
        "moderno lo trae activado de fábrica; en un portátil usa " +
        "FileVault, BitLocker o LUKS). Mantén tu sistema operativo " +
        "actualizado — la mayoría de los ataques reales explotan " +
        "errores que ya fueron corregidos.",
    ],
  },
  {
    id: "accounts",
    title: "Sobre tu identidad",
    body: [
      "Understoria no pide correo ni número de teléfono. Si " +
        "alguien que dice ser de Understoria te los pide, es un " +
        "intento de phishing.",
      "Tu identidad es una clave criptográfica en este " +
        "dispositivo. Puedes exportar un respaldo — guárdalo en un " +
        "lugar seguro y sin conexión. Un papel impreso en un cajón " +
        "suele ser mejor que un servicio en la nube.",
      "Si pierdes el teléfono o te lo roban, el bloqueo que le " +
        "pusiste a tu clave (tu llave de acceso de huella, cara o " +
        "PIN, o una frase) es lo que la protege — por eso la " +
        "bienvenida te ofrece uno. No hay revocación central ni " +
        "nadie que pueda mover una palanca por ti: cuéntale a tu " +
        "comunidad lo que pasó, para que la gente sepa dejar de " +
        "confiar en esa identidad, y luego empieza de cero con una " +
        "clave nueva (Perfil → Emergencia → Borrado duro en " +
        "cualquier dispositivo que aún tenga la anterior).",
    ],
  },
  {
    id: "communication",
    title: "Sobre tu comunicación",
    body: [
      "No hables de organización en dispositivos ni redes del " +
        "empleador. Los portátiles de trabajo y el WiFi " +
        "corporativo registran, y a veces vigilan, la actividad.",
      "No hagas capturas de pantalla del contenido de la " +
        "plataforma para compartirlas fuera del grupo. Una vez que " +
        "sale de Understoria, deja de estar protegido.",
      "Para las conversaciones delicadas, reúnanse en persona. " +
        "Una caminata de diez minutos vale más que un hilo de " +
        "mensajes de dos horas.",
    ],
  },
  {
    id: "social",
    title: "Sobre tu huella social",
    body: [
      "Mantén tu nombre visible de Understoria separado de tu " +
        "identidad laboral. Un seudónimo es parte del diseño, no " +
        "una señal de mala fe.",
      "No publiques sobre el trabajo de organización en redes " +
        "sociales públicas con tu nombre legal adjunto. Incluso " +
        "las publicaciones de \"inspiración general\" crean un " +
        "patrón que un observador decidido puede mapear.",
    ],
  },
  {
    id: "wrong",
    title: "Si algo se siente mal",
    body: [
      "Si alguien que no conoces quiere que lo añadan, ve " +
        "despacio. Pide un aval.",
      "Si un miembro existente empieza a hacer preguntas extrañas " +
        "sobre las listas de miembros o sobre quién ayudó a quién " +
        "— toma nota. Habla con otro miembro. Las infiltraciones " +
        "ocurren.",
      "Si un proveedor, un empleador o un agente te pide compartir " +
        "información sobre miembros o actividad: no estás en la " +
        "obligación. No lo manejes en soledad — habla con miembros " +
        "de tu confianza antes de responder nada.",
    ],
  },
  {
    id: "rights",
    title: "Conoce tus derechos",
    body: [
      "No tienes que responder preguntas de la policía sin un " +
        "abogado presente. No tienes que consentir el registro de " +
        "tu dispositivo — normalmente necesitan una orden " +
        "judicial. No tienes que identificar a otros miembros. Sí " +
        "tienes derecho a guardar silencio.",
      "Las huellas y las caras no son palabras. En muchos " +
        "lugares, los tribunales tratan el desbloqueo biométrico " +
        "como una llave física — la policía puede presionar tu " +
        "dedo contra el teléfono o sostenerlo frente a tu cara — " +
        "mientras que algo que sabes, como una frase, se trata " +
        "como testimonio que puedes negarte a dar. Esto varía " +
        "según el país y el tribunal, así que consulta con una " +
        "organización legal de tu zona; pero si existe la " +
        "posibilidad de que te detengan, asume que un biométrico " +
        "puede ser forzado y una frase no.",
      "Aprende el gesto de bloqueo duro de tu teléfono antes de " +
        "necesitarlo. En iPhone, mantén presionados el botón " +
        "lateral y cualquiera de los botones de volumen durante " +
        "dos segundos (hasta que aparezca la pantalla de apagado) " +
        "— Face ID y Touch ID quedan desactivados hasta que se " +
        "escriba el código. En Android, mantén presionado el " +
        "botón de encendido y toca Bloqueo total (Lockdown; " +
        "actívalo primero en Ajustes → Pantalla → Pantalla de " +
        "bloqueo si no aparece). Practícalo hasta que sea memoria " +
        "muscular.",
      "Dentro de la propia Understoria: si el desbloqueo forzado " +
        "forma parte de tu modelo de amenazas, protege tu clave " +
        "con una frase en lugar de una huella — o quita el " +
        "desbloqueo con huella (Perfil → Ajustes → Seguridad) " +
        "antes de una protesta, un cruce de frontera o cualquier " +
        "momento en que la detención sea posible; puedes volver a " +
        "añadirlo después. Solo una frase que escribes conserva de " +
        "punta a punta la propiedad de poder negarte. Y recuerda " +
        "que el botón de pánico (Perfil → Emergencia → Borrado " +
        "duro) existe para cuando bloquear no basta.",
      "Las organizaciones legales de tu zona (NLG en Estados " +
        "Unidos, LDAN en el Reino Unido) pueden darte tarjetas de " +
        "\"Conoce tus derechos\" específicas para tu jurisdicción. " +
        "Lleva una en la billetera.",
    ],
  },
];
