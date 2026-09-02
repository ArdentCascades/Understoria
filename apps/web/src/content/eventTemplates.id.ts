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
// Indonesian translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/id.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_ID: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Makan bersama",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Makan bersama — ",
    "descriptionScaffold": "Bawa satu hidangan untuk dibagi dan datanglah dengan perut lapar — selalu ada lebih dari cukup kalau semua ikut urun. Kabari kalau ada yang perlu dibawa selain makanan.",
    "suggestedDurationMinutes": 120,
    "blurb": "Setiap orang membawa satu hidangan untuk dimakan bersama."
  },
  {
    "id": "shared-meal",
    "name": "Masak dan makan bersama",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Masak dan makan bersama — ",
    "descriptionScaffold": "Masakan hangat yang dimakan bersama-sama. Sebutkan menunya, dan apakah ada yang bisa ikut turun tangan memasak atau beres-beres.",
    "suggestedDurationMinutes": 90,
    "blurb": "Masakan hangat, dimakan bersama-sama."
  },
  {
    "id": "game-night",
    "name": "Malam permainan",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Malam permainan — ",
    "descriptionScaffold": "Board game, kartu, apa saja yang kamu punya. Yang baru pertama datang disambut hangat — ada yang akan mengajarimu aturannya.",
    "suggestedDurationMinutes": 150,
    "blurb": "Board game, kartu, dan teman-teman yang menyenangkan."
  },
  {
    "id": "movie-night",
    "name": "Nonton bareng",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Nonton bareng — ",
    "descriptionScaffold": "Pilih tontonan untuk dinikmati bersama-sama. Sebutkan apa yang diputar, dan perlu tidaknya membawa bantal duduk atau camilan untuk diedarkan.",
    "suggestedDurationMinutes": 150,
    "blurb": "Menonton sesuatu bersama-sama."
  },
  {
    "id": "skill-share",
    "name": "Berbagi keahlian",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Berbagi keahlian — ",
    "descriptionScaffold": "Satu orang berbagi, semua ikut belajar — tidak perlu jadi ahli dulu. Sebutkan keahlian apa yang dibagikan dan apa yang perlu dibawa, kalau ada.",
    "suggestedDurationMinutes": 90,
    "blurb": "Satu orang berbagi, semua ikut belajar."
  },
  {
    "id": "craft-circle",
    "name": "Lingkar kerajinan",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Lingkar kerajinan — ",
    "descriptionScaffold": "Bawa apa pun yang sedang kamu kerjakan dan berkaryalah berdampingan dengan yang lain. Pemula dan karya yang masih setengah jadi sama-sama punya tempat di sini.",
    "suggestedDurationMinutes": 120,
    "blurb": "Berkarya berdampingan dengan yang lain."
  },
  {
    "id": "walk-hike",
    "name": "Jalan santai / mendaki",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Jalan santai — ",
    "descriptionScaffold": "Jalan kaki bersama dengan langkah santai. Catat panjang rute dan tingkat kesulitannya supaya orang tahu apa yang menanti, dan ingatkan juga soal air minum dan sepatu yang nyaman.",
    "suggestedDurationMinutes": 90,
    "blurb": "Jalan kaki bersama-sama, dengan langkah santai."
  },
  {
    "id": "welcome-gathering",
    "name": "Temu sapa",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Temu sapa — ",
    "descriptionScaffold": "Cara santai untuk berkenalan dengan tetangga baru dan bertemu lagi dengan wajah-wajah yang sudah akrab. Tanpa agenda — cukup saling berkenalan dan menikmati kebersamaan.",
    "suggestedDurationMinutes": 90,
    "blurb": "Berkenalan dengan tetangga baru, tanpa agenda."
  },
  {
    "id": "music-jam",
    "name": "Main musik bareng",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Main musik bareng — ",
    "descriptionScaffold": "Bawa alat musik atau cukup bawa suaramu. Semua tingkat kemampuan disambut — intinya bermain bersama, bukan tampil di panggung.",
    "suggestedDurationMinutes": 120,
    "blurb": "Bermain musik bersama — semua tingkat kemampuan."
  },
  {
    "id": "celebration",
    "name": "Perayaan",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Perayaan — ",
    "descriptionScaffold": "Rayakan sesuatu bersama-sama. Sebutkan apa yang sedang dirayakan dan perlu tidaknya membawa sesuatu untuk dibagi.",
    "suggestedDurationMinutes": 120,
    "blurb": "Merayakan sesuatu bersama-sama."
  },
  {
    "id": "work-day",
    "name": "Gotong royong",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Gotong royong — ",
    "descriptionScaffold": "Waktu turun tangan untuk menuntaskan sesuatu bersama-sama. Jelaskan pekerjaannya dan apa yang perlu dibawa — berat sama dipikul, ringan sama dijinjing.",
    "suggestedDurationMinutes": 240,
    "blurb": "Waktu turun tangan, dikerjakan bersama."
  },
  {
    "id": "repair-cafe",
    "name": "Bengkel bersama",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Bengkel bersama — ",
    "descriptionScaffold": "Bawa barang yang rusak dan perbaiki dengan bantuan tetangga yang cekatan memakai alat-alat. Sebutkan jenis perbaikan apa saja yang bisa dibantu di sana.",
    "suggestedDurationMinutes": 180,
    "blurb": "Memperbaiki barang rusak, bersama-sama."
  },
  {
    "id": "care-circle",
    "name": "Lingkar saling jaga",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Lingkar saling jaga — ",
    "descriptionScaffold": "Ruang yang lembut untuk saling menanyakan kabar dan saling menguatkan. Apa yang dibagikan di sini, tinggal di sini.",
    "suggestedDurationMinutes": 90,
    "blurb": "Saling menanyakan kabar, saling menguatkan."
  },
  {
    "id": "meeting",
    "name": "Rapat",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Rapat — ",
    "descriptionScaffold": "Waktu untuk membicarakan berbagai hal sampai tuntas dan memutuskannya bersama. Bagikan agendanya supaya orang bisa datang dengan siap.",
    "suggestedDurationMinutes": 60,
    "blurb": "Bicarakan sampai tuntas, putuskan bersama."
  }
];
