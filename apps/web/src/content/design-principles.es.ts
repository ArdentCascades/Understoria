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

// Spanish translation of design-principles.ts. Same shape, same ids —
// only the prose changes. Register follows the shipped Spanish UI:
// tú throughout, "créditos de semilla" for seed credits, "apoyo
// mutuo" for mutual aid, "sigue a" for the follows framing, and the
// established equal-time formula ("una hora de ayuda = una hora de
// crédito, sea cual sea el trabajo"). Proper nouns (Couchsurfing,
// WhatsApp, Strava, Mondragón) stay as they are.
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_ES: readonly DesignPrinciple[] = [
  {
    id: "equal-time",
    title: "Créditos de tiempo iguales",
    statement:
      "Una hora de ayuda siempre vale una hora de crédito, sea cual sea el trabajo.",
    example:
      "Los primeros bancos de tiempo que probaron precios de mercado descubrieron que el apoyo emocional y el cuidado de niños — el trabajo que más suelen hacer las mujeres y los miembros con discapacidad — quedaba siempre valorado por debajo. El tiempo igual es el arreglo estructural.",
  },
  {
    id: "no-leaderboards",
    title: "Sin clasificaciones ni puntajes individuales",
    statement:
      "El progreso se registra a nivel de comunidad. La unidad de medida es nosotros, no yo.",
    example:
      "Cuando Couchsurfing añadió un puntaje de reputación, los anfitriones empezaron a jugar con él, y los huéspedes más vulnerables — quienes no podían devolver calificaciones altas — quedaron completamente fuera del sistema.",
  },
  {
    id: "no-notifications",
    title: "Sin notificaciones push",
    statement:
      "Te mostramos lo que necesita tu atención cuando abres la app. Nada vibra, ningún contador te persigue de pantalla en pantalla, nada de teatro de urgencia.",
    example:
      "Quienes organizaron apoyo mutuo durante el COVID contaron una y otra vez que las herramientas movidas por notificaciones quemaban primero a sus miembros más comprometidos — la gente que las comunidades menos podían permitirse perder. Esa experiencia, no un estudio formal, es lo que sostiene este principio.",
  },
  {
    id: "solidarity-not-shame",
    title: "Solidaridad, no vergüenza",
    statement:
      "Nunca presentamos una situación como estancada, atrasada o fracasada. La capacidad cambia; el sistema se adapta sin culpar a nadie.",
    example:
      "Las plataformas de trabajo por encargo usan avisos de «te estás quedando atrás» para extraer más trabajo. Las personas más afectadas son las que ya atraviesan una crisis — exactamente la gente a la que el apoyo mutuo existe para sostener.",
  },
  {
    id: "community-authority",
    title: "La comunidad es la autoridad",
    statement:
      "No hay rol de administración. Las decisiones de gobierno pasan por propuestas comunitarias, no por el poder de una persona.",
    example:
      "Las cooperativas de Mondragón demostraron durante más de 60 años que el gobierno de quienes trabajan supera al de los gerentes tanto en equidad como en longevidad. El rol de «admin» es una decisión de diseño, no una necesidad.",
  },
  {
    id: "asking-never-gated",
    title: "Pedir ayuda nunca tiene barreras",
    statement:
      "Cada nuevo miembro empieza con créditos de semilla. Puedes recibir antes de dar.",
    example:
      "Los bancos de tiempo que exigían ganar antes de gastar vieron que sus miembros más vulnerables — personas mayores, recién llegadas, en crisis — nunca pedían ayuda. Los créditos de semilla son el arreglo estructural.",
  },
  {
    id: "privacy-precondition",
    title: "La privacidad es una condición previa",
    statement:
      "Sin correo, sin número de teléfono, con registros mínimos. Tu identidad es una llave criptográfica en tu dispositivo.",
    example:
      "A centros de trabajadores que usaban hojas de registro digitales les exigieron judicialmente sus listas de miembros, o se las filtraron a los patrones. Organizarse exige proteger la membresía misma, no solo el contenido.",
  },
  {
    id: "deliberation-over-speed",
    title: "Deliberación antes que velocidad",
    statement:
      "Las propuestas quedan abiertas por un período configurable. El consenso necesita tiempo, no solo quórum.",
    example:
      "Las votaciones rápidas en línea en cooperativas dejaron sin voz, una y otra vez, a quienes trabajan de noche, cuidan de otras personas o tienen internet limitado. La ventana de deliberación de 3 días por defecto le da a todo el mundo una oportunidad real de opinar (cada comunidad puede ajustarla, con un mínimo de 1 día).",
  },
  {
    id: "no-post-editing",
    title: "Por qué republicar en vez de editar",
    statement:
      "Una vez que una publicación se comparte con la comunidad, no puede editarse ni borrarse en silencio — el registro de lo que se pidió sigue siendo confiable para todos los que lo vieron.",
    example:
      "Las plataformas que permiten ediciones silenciosas crean problemas de negación — «yo nunca dije eso» se vuelve imposible de resolver. Conservar el original tal como fue, más un flujo de republicación para los cambios, preserva la flexibilidad y la responsabilidad a la vez.",
  },
  {
    id: "no-read-receipts",
    title: "Sin confirmaciones de lectura en los mensajes",
    statement:
      "No le decimos a quien envía cuándo se leyó su mensaje. Quién habla con quién es el grafo de relaciones que el modelo de amenazas más protege.",
    example:
      "Las marcas azules de WhatsApp crearon presión social para responder de inmediato y permitieron que parejas abusivas vigilaran los tiempos de respuesta. Quitar las confirmaciones de lectura elimina por completo esa vía de vigilancia.",
  },
  {
    id: "no-activity-search",
    title: "Sin búsqueda de miembros por actividad",
    statement:
      "No puedes buscar «quién ha estado más activo» ni «quién ayudó más». Los patrones de actividad son datos de vigilancia.",
    example:
      "Cuando Strava publicó mapas de calor de actividad agregada, reveló sin querer la ubicación de bases militares secretas. Los patrones de actividad individuales revelan aún más: muestran quién se está organizando, cuándo y con quién.",
  },
  {
    id: "follows-not-blocked",
    title: "Las tareas «siguen a» otras — nunca están «bloqueadas»",
    statement:
      "Una tarea que espera a otra viene en secuencia, no está atascada. El encuadre moldea cómo se siente la gente con el trabajo.",
    example:
      "Las herramientas de gestión de proyectos que etiquetan tareas como «bloqueadas» crean una dinámica de culpa — alguien está «bloqueando» a alguien. «Sigue a» encuadra la misma dependencia como una secuencia natural y elimina la fricción entre personas.",
  },
];
