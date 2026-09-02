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
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_ID: readonly DesignPrinciple[] = [
  {
    "id": "equal-time",
    "title": "Satu jam tetap satu jam",
    "statement": "Satu jam bantuan selalu dihitung satu jam, apa pun jenis pekerjaannya.",
    "example": "Bank-bank waktu generasi awal yang mencoba harga pasar mendapati bahwa dukungan emosional dan pengasuhan anak — pekerjaan yang paling sering dikerjakan perempuan dan anggota difabel — selalu dihargai paling rendah. Jam yang setara adalah perbaikan strukturalnya."
  },
  {
    "id": "no-leaderboards",
    "title": "Tanpa papan peringkat, tanpa skor pribadi",
    "statement": "Kemajuan dicatat di tingkat komunitas. Satuan ukurnya adalah kita, bukan aku.",
    "example": "Ketika Couchsurfing menambahkan skor reputasi, para tuan rumah mulai mengakalinya, dan tamu yang paling rentan — mereka yang tidak bisa membalas dengan nilai tinggi — benar-benar tersingkir dari sistem."
  },
  {
    "id": "no-notifications",
    "title": "Tanpa notifikasi push",
    "statement": "Yang butuh perhatianmu ditampilkan saat kamu membuka aplikasi. Tidak ada yang berdengung, tidak ada angka yang mengejarmu dari layar ke layar, tidak ada sandiwara serba mendesak.",
    "example": "Para penggerak tolong-menolong di masa COVID banyak bercerita bahwa alat yang digerakkan notifikasi justru lebih dulu membuat anggota yang paling berdedikasi kehabisan tenaga — orang-orang yang paling tidak boleh hilang dari komunitas. Pengalaman itulah, bukan studi formal, yang menjadi pijakan prinsip ini."
  },
  {
    "id": "solidarity-not-shame",
    "title": "Solidaritas, bukan rasa malu",
    "statement": "Tidak pernah ada keadaan yang dibingkai sebagai macet, terlambat, atau gagal. Kapasitas orang berubah-ubah; sistem menyesuaikan diri tanpa menyalahkan siapa pun.",
    "example": "Platform ekonomi gig memakai sentilan “kamu mulai tertinggal” untuk memeras lebih banyak tenaga. Pekerja yang paling terdampak justru yang sedang menghadapi krisis — persis orang-orang yang seharusnya disokong oleh tolong-menolong."
  },
  {
    "id": "community-authority",
    "title": "Komunitaslah yang berwenang",
    "statement": "Tidak ada peran admin. Keputusan tata kelola berjalan lewat usulan komunitas, bukan kuasa perorangan.",
    "example": "Koperasi Mondragón membuktikan selama lebih dari 60 tahun bahwa tata kelola oleh pekerja mengungguli tata kelola oleh manajer, baik dalam keadilan maupun daya tahan. Peran “admin” adalah pilihan desain, bukan keharusan."
  },
  {
    "id": "asking-never-gated",
    "title": "Minta tolong tidak pernah pakai syarat",
    "statement": "Setiap anggota baru mulai dengan jam benih. Kamu boleh menerima sebelum memberi.",
    "example": "Bank waktu yang mengharuskan anggota mengumpulkan jam dulu sebelum memakainya mendapati anggota yang paling rentan — para lansia, pendatang baru, mereka yang sedang dilanda krisis — tidak pernah minta tolong. Jam benih adalah perbaikan strukturalnya."
  },
  {
    "id": "privacy-precondition",
    "title": "Privasi adalah prasyarat",
    "statement": "Tanpa email, tanpa nomor telepon, pencatatan seminimal mungkin. Identitasmu adalah kunci kriptografis di perangkatmu sendiri.",
    "example": "Organisasi pekerja yang memakai daftar hadir digital pernah dipaksa pengadilan menyerahkan daftar anggotanya, atau daftarnya bocor ke majikan. Berorganisasi menuntut keanggotaan itu sendiri ikut terlindungi, bukan hanya isi pembicaraannya."
  },
  {
    "id": "deliberation-over-speed",
    "title": "Musyawarah, bukan kecepatan",
    "statement": "Usulan tetap terbuka selama jangka waktu yang bisa diatur. Mufakat butuh waktu, bukan sekadar kuorum.",
    "example": "Pemungutan suara daring yang serba cepat di koperasi-koperasi terus-menerus membuat pekerja malam, orang yang merawat keluarganya, dan anggota dengan internet terbatas tidak kebagian suara. Jendela musyawarah bawaan 3 hari memberi semua orang kesempatan sungguhan untuk ikut menimbang (tiap komunitas bisa menyetelnya, sampai batas bawah 1 hari)."
  },
  {
    "id": "no-post-editing",
    "title": "Kenapa tempel ulang, bukan edit",
    "statement": "Begitu sebuah kiriman dibagikan ke komunitas, ia tidak bisa diam-diam diedit atau dihapus — catatan tentang apa yang diminta tetap bisa dipercaya oleh semua yang sudah melihatnya.",
    "example": "Platform yang membiarkan kiriman diedit diam-diam membuka masalah penyangkalan — “aku tidak pernah bilang begitu” jadi tidak mungkin diurai. Menjaga kiriman asli apa adanya, ditambah jalur tempel ulang untuk perubahan, mempertahankan keluwesan sekaligus tanggung jawab."
  },
  {
    "id": "no-read-receipts",
    "title": "Tanpa tanda dibaca di pesan",
    "statement": "Pengirim tidak diberi tahu kapan pesannya dibaca. Siapa-bicara-dengan-siapa adalah peta hubungan yang paling dilindungi oleh model ancaman aplikasi ini.",
    "example": "Centang biru WhatsApp melahirkan tekanan sosial untuk membalas seketika dan memberi pasangan yang abusif cara memantau kecepatan balasan. Menghapus tanda dibaca mencabut celah pengawasan itu sampai ke akarnya."
  },
  {
    "id": "no-activity-search",
    "title": "Tanpa pencarian anggota berdasarkan aktivitas",
    "statement": "Kamu tidak bisa mencari “siapa yang paling aktif” atau “siapa yang paling banyak membantu”. Pola aktivitas adalah data pengawasan.",
    "example": "Ketika Strava menerbitkan peta panas aktivitas gabungan, lokasi pangkalan-pangkalan militer rahasia ikut terbongkar tanpa sengaja. Pola aktivitas perorangan malah lebih banyak bercerita — memperlihatkan siapa yang sedang berorganisasi, kapan, dan dengan siapa."
  },
  {
    "id": "follows-not-blocked",
    "title": "Tugas datang “setelah” — tidak pernah “terhalang”",
    "statement": "Tugas yang menunggu tugas lain sedang berurutan, bukan macet. Cara membingkainya membentuk perasaan orang terhadap pekerjaannya.",
    "example": "Alat manajemen proyek yang menandai tugas sebagai “terhalang” menciptakan dinamika saling menyalahkan — seolah ada yang “menghalangi” orang lain. “Setelah” membingkai ketergantungan yang sama sebagai urutan yang wajar, dan menghilangkan gesekan antarorang."
  }
];
