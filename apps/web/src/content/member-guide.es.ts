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

// Spanish translation of member-guide.ts. Same shape, same ids —
// only the prose changes. IDs are stable and never translated; the
// section/paragraph structure is enforced by guides.parity.test.ts,
// so mirror any change to member-guide.ts here.

import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_ES: readonly GuideSection[] = [
  {
    id: "what-it-is",
    title: "Qué es Understoria",
    body: [
      "Understoria es un banco de tiempo: una forma de que una " +
        "comunidad intercambie ayuda, con cada hora contada por " +
        "igual. Una hora arreglando un fregadero vale lo mismo que " +
        "una hora escuchando a alguien después de un día difícil.",
      "No es una app para conseguir encargos. Es software que apoya " +
        "a una comunidad que ya existe — un lugar de trabajo, un " +
        "vecindario, un grupo de afinidad — que ya confía entre sí " +
        "y quiere una forma ligera de mantener visible la ayuda " +
        "mutua.",
    ],
  },
  {
    id: "credits",
    title: "Cómo funcionan los créditos",
    body: [
      "Cada miembro nuevo empieza con 5 horas de crédito semilla. " +
        "Puedes pedir ayuda antes de haber dado ninguna. Pedir no " +
        "es una deuda — es la forma en que la red cobra vida.",
      "Cuando ayudas a alguien, ambas personas confirman el " +
        "intercambio. Tu saldo sube por las horas dadas; el suyo " +
        "baja. No se mueve dinero; nadie lleva un marcador.",
      "Tu saldo se calcula a partir de un registro firmado de cada " +
        "intercambio. Si algo se ve mal, puedes auditarlo.",
    ],
  },
  {
    id: "identity",
    title: "Tu identidad",
    body: [
      "Tu identidad es un par de claves criptográficas. No hay " +
        "correo, número de teléfono ni contraseña de cuenta. Tu " +
        "nombre visible es el que tú elijas — es una etiqueta, no " +
        "una credencial.",
      "Puedes bloquear las claves de tu dispositivo con tu huella, " +
        "tu cara o el PIN del dispositivo (una llave de acceso — se " +
        "ofrece durante la propia bienvenida, y funciona sin " +
        "internet alguno), o con una frase que escribes; también " +
        "puedes tener ambas, con la frase como vía de respaldo. " +
        "Nada del bloqueo se envía a Apple, a Google ni a ningún " +
        "servidor — la comprobación ocurre en tu dispositivo.",
      "Si pierdes tu frase — o tu teléfono con su bloqueo de " +
        "huella — nadie puede recuperarla por ti. Ese es el trato: " +
        "ninguna autoridad central puede leer tus datos, y eso " +
        "significa que ninguna autoridad central puede rescatarlos " +
        "tampoco. Lo que te trae de vuelta es un respaldo hecho " +
        "cuando todo iba bien: un segundo dispositivo vinculado, " +
        "guardianes que elegiste, o un kit de recuperación — cada " +
        "uno toma más o menos un minuto en Ajustes.",
      "Si alguna vez necesitas borrarlo todo rápido — suave " +
        "(anonimizar) o duro (empezar de cero) — hay un botón de " +
        "pánico en Perfil, bajo Emergencia.",
    ],
  },
  {
    id: "trust",
    title: "Confianza y llegada",
    body: [
      "Los miembros nuevos necesitan el aval de dos miembros " +
        "existentes para pasar a ser de plena confianza. Cuando " +
        "alguien canjea tu invitación, eso cuenta como tu aval " +
        "implícito.",
      "Los miembros pueden publicar y tomar ayuda antes de ser de " +
        "plena confianza — pedir nunca está cerrado — pero la " +
        "comunidad ve un distintivo con el estado de confianza, " +
        "para poder extender un aval manual donde tenga sentido.",
    ],
  },
  {
    id: "governance",
    title: "Decisiones y conflicto",
    body: [
      "Las decisiones de la comunidad se toman en conjunto, no por " +
        "administradores — a propósito no existe un rol de " +
        "administración ni de moderación en la app. Las decisiones " +
        "que afectan a toda la comunidad pasan por propuestas " +
        "abiertas: cualquiera puede abrir una desde Perfil → " +
        "Propuestas comunitarias, todo el mundo puede verla, y " +
        "queda abierta durante un periodo de deliberación antes de " +
        "cerrarse.",
      "Los conflictos sobre un intercambio concreto pasan por la " +
        "misma maquinaria: abre una disputa desde Perfil → Disputas " +
        "de la comunidad y se convierte en una propuesta en la que " +
        "la comunidad opina, con el resultado aplicado " +
        "automáticamente cuando se cierra.",
      "Todo lo que la app no decide — las normas, el ritmo de las " +
        "reuniones, cómo se hablan entre ustedes — ocurre en el " +
        "canal que tu comunidad ya use. La app registra las " +
        "decisiones; no reemplaza la conversación.",
    ],
  },
  {
    id: "where-from-here",
    title: "Por dónde seguir",
    body: [
      "Abre el Tablero para ver qué están ofreciendo y pidiendo " +
        "tus vecinos ahora mismo.",
      "Abre el Panel para ver cómo va tu comunidad — el total de " +
        "horas intercambiadas, por dónde fluye la ayuda, qué se ha " +
        "celebrado.",
      "Abre Perfil para actualizar tus habilidades y tu " +
        "disponibilidad, invitar a alguien nuevo o leer las guías " +
        "más largas en disco.",
    ],
  },
] as const;
