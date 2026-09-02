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

export const OPSEC_GUIDE_ID: readonly GuideSection[] = [
  {
    "id": "device",
    "title": "Di perangkatmu",
    "body": [
      "Kunci ponselmu dengan PIN enam digit atau frasa sandi yang kuat. Nyalakan enkripsi seluruh disk (setiap ponsel modern sudah menyalakannya sejak bawaan; di laptop pakai FileVault, BitLocker, atau LUKS). Jaga sistem operasimu selalu terbarui — kebanyakan serangan di dunia nyata memanfaatkan celah yang sebenarnya sudah ditambal."
    ]
  },
  {
    "id": "accounts",
    "title": "Soal identitasmu",
    "body": [
      "Understoria tidak pernah meminta email atau nomor telepon. Kalau ada yang mengaku dari Understoria dan memintanya, itu percobaan phishing.",
      "Identitasmu adalah kunci kriptografi di perangkat ini. Kamu bisa mengekspor cadangannya — simpan di tempat yang aman dan offline. Kertas yang dicetak dan disimpan di laci sering kali lebih baik daripada cloud.",
      "Kalau ponselmu hilang atau dicuri, kunci yang kamu pasang pada kuncimu (passkey sidik jari, wajah, atau PIN-mu, atau sebuah frasa sandi) itulah yang melindunginya — karena itulah alur sambutan menawarkannya. Tidak ada pencabutan terpusat, dan tidak ada siapa pun yang bisa menekan sakelar untukmu: kabari komunitasmu apa yang terjadi supaya semua tahu identitas itu tidak lagi bisa dipercaya, lalu mulai dari awal dengan kunci baru (Profil → Keadaan darurat → Hapus total di perangkat mana pun yang masih menyimpan kunci lamanya)."
    ]
  },
  {
    "id": "communication",
    "title": "Soal komunikasimu",
    "body": [
      "Jangan membicarakan kerja pengorganisasian di perangkat atau jaringan milik pemberi kerja. Laptop kantor dan WiFi kantor mencatat, dan kadang memantau, aktivitas.",
      "Jangan mengambil tangkapan layar isi platform lalu menyebarkannya ke luar kelompok. Begitu keluar dari Understoria, ia tidak lagi terlindungi.",
      "Untuk percakapan yang sensitif, bertemulah langsung. Jalan kaki sepuluh menit mengalahkan dua jam balas-balasan pesan."
    ]
  },
  {
    "id": "social",
    "title": "Soal jejak sosialmu",
    "body": [
      "Pisahkan nama panggilan Understoria-mu dari identitas kerjamu. Nama samaran itu bagian dari desain, bukan tanda niat buruk.",
      "Jangan menulis soal kerja pengorganisasian di media sosial publik dengan nama resmimu tercantum. Bahkan kiriman “sekadar inspirasi” pun membentuk pola yang bisa dipetakan oleh pengamat yang gigih."
    ]
  },
  {
    "id": "wrong",
    "title": "Kalau ada yang terasa janggal",
    "body": [
      "Kalau orang yang tidak kamu kenal ingin ditambahkan, pelan-pelan saja. Minta jaminan dulu.",
      "Kalau anggota lama mulai bertanya hal-hal aneh soal daftar anggota atau siapa membantu siapa — catat itu. Bicaralah dengan anggota lain. Penyusupan itu nyata.",
      "Kalau vendor, pemberi kerja, atau aparat memintamu membagikan informasi tentang anggota atau kegiatan: kamu tidak wajib. Jangan menghadapinya sendirian — bicaralah dulu dengan anggota yang kamu percaya sebelum menjawab apa pun."
    ]
  },
  {
    "id": "rights",
    "title": "Kenali hakmu",
    "body": [
      "Kamu tidak wajib menjawab pertanyaan polisi tanpa didampingi pengacara. Kamu tidak wajib mengizinkan penggeledahan perangkatmu — biasanya mereka butuh surat perintah. Kamu tidak wajib menyebut anggota lain. Kamu punya hak untuk tetap diam.",
      "Sidik jari dan wajah bukanlah kata-kata. Di banyak tempat, pengadilan memperlakukan pembukaan kunci biometrik seperti kunci fisik — polisi bisa menekan jarimu ke ponsel atau mengarahkannya ke wajahmu — sedangkan sesuatu yang kamu tahu, seperti frasa sandi, diperlakukan sebagai kesaksian yang boleh kamu tolak berikan. Ini berbeda-beda antarnegara dan antarpengadilan, jadi tanyakan ke organisasi bantuan hukum setempat; tapi kalau ada kemungkinan kamu ditahan, anggap saja biometrik bisa dipaksa dan frasa sandi tidak.",
      "Pelajari gerakan penguncian keras ponselmu sebelum kamu membutuhkannya. Di iPhone, tahan tombol samping dan salah satu tombol volume selama dua detik (sampai layar mematikan daya muncul) — Face ID dan Touch ID langsung mati sampai kode sandi dimasukkan. Di Android, tahan tombol daya lalu ketuk Kunci total (Lockdown; nyalakan dulu lewat Setelan → Tampilan → Layar kunci kalau belum ada). Latih terus sampai jadi refleks.",
      "Di Understoria sendiri: kalau pembukaan kunci secara paksa termasuk dalam model ancamanmu, lindungi kuncimu dengan frasa sandi alih-alih sidik jari — atau hapus pembukaan kunci sidik jari (Profil → Pengaturan → Keamanan) sebelum aksi protes, penyeberangan perbatasan, atau momen apa pun ketika penahanan mungkin terjadi; setelahnya bisa kamu pasang lagi. Hanya frasa sandi yang kamu ketik yang membawa sifat boleh-menolak itu dari ujung ke ujung. Dan ingat, tombol genting (Profil → Keadaan darurat → Hapus total) ada untuk saat mengunci saja tidak cukup.",
      "Organisasi bantuan hukum di tempatmu (NLG di Amerika Serikat, LDAN di Inggris) bisa menyediakan kartu “Kenali hakmu” yang sesuai dengan yurisdiksimu. Simpan satu di dompetmu."
    ]
  }
];
