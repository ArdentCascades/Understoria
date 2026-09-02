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
import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_ID: readonly GuideSection[] = [
  {
    "id": "what-it-is",
    "title": "Apa itu Understoria",
    "body": [
      "Understoria adalah bank waktu: cara sebuah komunitas bertukar bantuan, dengan setiap jam dihitung setara. Satu jam memperbaiki wastafel sama nilainya dengan satu jam mendengarkan seseorang setelah hari yang berat.",
      "Ini bukan aplikasi untuk mencari kerja lepasan. Ini perangkat lunak yang menopang komunitas yang sudah ada — tempat kerja, lingkungan tetangga, kelompok sehaluan — yang sudah saling percaya dan ingin cara yang ringan untuk menjaga tolong-menolong tetap terlihat."
    ]
  },
  {
    "id": "credits",
    "title": "Cara kerja jam bantuan",
    "body": [
      "Setiap anggota baru mulai dengan 5 jam benih. Kamu boleh minta tolong sebelum pernah memberi apa-apa. Meminta bukan utang — justru begitulah jaringan ini menjadi hidup.",
      "Saat kamu membantu seseorang, kalian berdua mengonfirmasi pertukarannya. Jam bantuanmu bertambah sebanyak jam yang diberikan; jam bantuannya berkurang. Tidak ada uang yang berpindah; tidak ada yang sibuk mencatat skor.",
      "Jam bantuanmu dihitung dari catatan bertanda tangan atas setiap pertukaran. Kalau ada yang terlihat janggal, kamu bisa memeriksanya sendiri."
    ]
  },
  {
    "id": "identity",
    "title": "Identitasmu",
    "body": [
      "Identitasmu adalah sepasang kunci kriptografi. Tidak ada email, nomor telepon, atau kata sandi akun. Nama panggilanmu bebas kamu pilih — ia label, bukan bukti diri.",
      "Kamu bisa mengunci kunci di sisi perangkatmu dengan sidik jari, wajah, atau PIN perangkat (sebuah passkey — ditawarkan langsung di alur sambutan, dan bekerja tanpa internet sama sekali), atau dengan frasa sandi yang kamu ketik; boleh juga dua-duanya, dengan frasa sandi sebagai jalan masuk cadangan. Tidak ada apa pun soal kunci ini yang dikirim ke Apple, Google, atau server mana pun — pemeriksaannya terjadi di perangkatmu sendiri.",
      "Kalau frasa sandimu hilang — atau ponselmu hilang bersama kunci sidik jarinya — tidak ada yang bisa memulihkannya untukmu. Memang begitu kesepakatannya — tidak ada otoritas pusat yang bisa membaca datamu, dan itu berarti tidak ada juga otoritas pusat yang bisa menyelamatkannya. Yang membawamu kembali adalah cadangan yang kamu buat selagi semuanya baik-baik saja: perangkat kedua yang dipasangkan, pemegang amanah yang kamu pilih, atau kit pemulihan — masing-masing hanya butuh sekitar satu menit di Pengaturan.",
      "Kalau suatu saat kamu perlu menghapus semuanya dengan cepat — hapus sebagian (samarkan identitas) atau hapus total (mulai dari awal) — ada tombol genting di Profil, di bagian Keadaan darurat."
    ]
  },
  {
    "id": "trust",
    "title": "Kepercayaan dan penyambutan",
    "body": [
      "Anggota baru butuh jaminan dari dua anggota yang sudah ada untuk menjadi dipercaya penuh. Saat seseorang memakai undanganmu, itu terhitung sebagai jaminan tersiratmu.",
      "Anggota boleh menempel kiriman di papan dan mengambil bantuan sebelum dipercaya penuh — minta tolong tidak pernah dihalangi — tapi komunitas melihat penanda kecil yang menunjukkan status kepercayaannya, supaya bisa memberikan jaminan sendiri di tempat yang memang pantas."
    ]
  },
  {
    "id": "governance",
    "title": "Keputusan dan konflik",
    "body": [
      "Keputusan komunitas diambil bersama-sama, bukan oleh admin — memang sengaja tidak ada peran admin atau moderator di aplikasi ini. Pilihan yang menyangkut seluruh komunitas berjalan lewat usulan terbuka: siapa pun bisa memulainya dari Profil → Usulan komunitas, semua orang bisa melihatnya, dan usulan itu tetap terbuka selama masa musyawarah sebelum ditutup.",
      "Konflik soal satu pertukaran tertentu berjalan lewat mesin yang sama: buka beda pendapat dari Profil → Beda pendapat komunitas, dan ia menjadi usulan yang dimusyawarahkan komunitas, dengan hasilnya diterapkan otomatis begitu usulan itu ditutup.",
      "Apa pun yang tidak diputuskan aplikasi — norma, ritme pertemuan, cara kalian saling bicara — terjadi di saluran mana pun yang sudah dipakai komunitasmu. Aplikasi mencatat keputusan; ia tidak menggantikan percakapan."
    ]
  },
  {
    "id": "where-from-here",
    "title": "Ke mana setelah ini",
    "body": [
      "Buka Papan untuk melihat apa yang sedang ditawarkan dan dibutuhkan tetanggamu sekarang.",
      "Buka Denyut untuk melihat keadaan komunitasmu — total jam yang dipertukarkan, ke mana bantuan mengalir, apa saja yang sudah dirayakan.",
      "Buka Profil untuk memperbarui keahlian dan waktu luangmu, mengundang orang baru, atau membaca panduan yang lebih panjang di disk."
    ]
  }
];
