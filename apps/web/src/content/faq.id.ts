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
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_ID: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Kiriman dan pertukaran",
    "entries": [
      {
        "id": "post-something",
        "question": "Bagaimana cara menempel kebutuhan atau tawaran?",
        "answer": [
          "Di Papan, ketuk tombol hijau + Tempel kebutuhan atau + Tempel tawaran di bagian bawah layar. Tulis judul singkat, jelaskan apa yang kamu butuhkan atau bisa kamu berikan, lalu tempelkan. Nanti kamu bisa membatalkannya dari halaman detail kirimannya, atau menempelnya ulang dengan perubahan lewat menu kiriman."
        ]
      },
      {
        "id": "claim-post",
        "question": "Bagaimana cara mengambil kiriman orang lain?",
        "answer": [
          "Ketuk kiriman mana pun di Papan untuk membuka halaman detailnya. Di sebuah kebutuhan, ketuk Tawarkan bantuan; di sebuah tawaran, ketuk Ambil tawaran ini. Kirimannya berpindah ke keadaan “Menunggu konfirmasi”, dan penempelnya mendapat kesempatan mengonfirmasi sebelum ada jam yang berpindah.",
          "Kalau kamu berubah pikiran, ketuk Batal ambil di halaman yang sama — kirimannya terbuka lagi untuk orang lain."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Bagaimana cara kerja konfirmasi pertukaran?",
        "answer": [
          "Setelah bantuannya benar-benar terjadi, kalian berdua mengetuk Konfirmasi sudah selesai di halaman detail kiriman. Jam baru berpindah setelah kalian berdua mengonfirmasi.",
          "Urutannya tidak penting — satu orang mengonfirmasi duluan, satunya melihat kirimannya masih menunggu dia, lalu mengonfirmasi saat sempat."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "Orang satunya belum juga mengonfirmasi. Aku harus bagaimana?",
        "answer": [
          "Pertama, tanyakan langsung padanya di luar aplikasi. Kebanyakan cuma ketukan yang terlupa, bukan penolakan.",
          "Kalau memang ada beda pendapat sungguhan soal apakah pertukarannya terjadi atau apakah bantuannya terhitung utuh, pakai Ada yang tidak beres — tandai di halaman detail kiriman. Itu memunculkannya di halaman Beda pendapat, tempat komunitas bisa membantu membereskannya — tidak ada admin di sini. Jamnya tertahan dulu sampai semuanya beres.",
          "Kamu juga tidak akan tersangkut menunggu selamanya. Kalau komunitasmu menyalakan konfirmasi otomatis, node komunitas turun tangan setelah masa tunggu yang disepakati dan menuntaskan konfirmasi yang jelas-jelas cuma terlupa, jadi jam siapa pun tidak menggantung tanpa ujung."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Bagaimana cara membatalkan kiriman yang tidak kubutuhkan lagi?",
        "answer": [
          "Buka kirimannya dari Papan lalu ketuk Batalkan kiriman. Kirimannya langsung turun dari papan, jadi tidak ada yang bisa mengambilnya. Kiriman itu tidak dihapus — halamannya sendiri tetap ada, tercatat sebagai dibatalkan, dan siapa pun yang memegang tautannya masih bisa melihat apa yang dulu diminta atau ditawarkan."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Jam bantuan dan benih awal",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "Apa arti jam bantuanku?",
        "answer": [
          "Jam bantuanmu adalah hitungan berjalan: jam yang kamu berikan dikurangi jam yang kamu terima. Semua orang mulai dengan 5 (jam benih), jadi anggota yang baru saja bergabung ada di 5, bukan 0.",
          "Jam bantuan yang minus tidak apa-apa — minta tolong bukan utang. Jam bantuanmu terlihat oleh komunitasmu, tapi ia bukan nilai rapor, dan tidak ada papan peringkat."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Boleh tidak jam bantuanku minus?",
        "answer": [
          "Boleh. Menerima lebih banyak daripada yang kamu berikan adalah bagian dari cara tolong-menolong bekerja — jaringannya memang dibuat untuk mengalir. Komunitas hanya akan melihat tanda kalau batas pertukaran harian hampir tersentuh atau ada pola yang tampak tidak biasa; selain itu, tidak ada yang mengawasi angkamu."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Identitasmu dan perangkatmu",
    "entries": [
      {
        "id": "getting-around",
        "question": "Ke mana perginya tab Profil? Bagaimana cara berpindah-pindah?",
        "answer": [
          "Lima tab ada di bagian bawah layar (menjadi bilah di sisi kiri pada layar lebar): Papan, Denyut, Kalender, Pesan, dan Yang kurawat — setiap tugas yang kamu ambil dan setiap proyek yang kamu gerakkan, terkumpul di satu tempat.",
          "Semua yang tentang KAMU pindah ke balik tombol Menu di pojok kanan atas: Profil (tercantum di bawah namamu sendiri), Pengaturan, Undang seseorang, halaman Bantuan ini, Cari, dan Infrastruktur komunitas.",
          "Cari menemukan kiriman, proyek, acara, orang, dan jawaban-jawaban bantuan ini — semuanya dari apa yang sudah ada di perangkatmu. Dengan keyboard, Ctrl+K (⌘K di Mac) membukanya dari mana saja."
        ]
      },
      {
        "id": "change-name",
        "question": "Bagaimana cara mengganti nama panggilan atau daerahku?",
        "answer": [
          "Profil → bagian “Tentang kamu”. Nama hanyalah label, bukan bukti diri, jadi kamu boleh menggantinya kapan pun kamu mau. Identitas kriptografimu tetap sama."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "Bagaimana kalau aku lupa frasa sandiku?",
        "answer": [
          "Tidak ada yang bisa meresetnya untukmu — memang begitu rancangannya. Pertukarannya: tidak ada otoritas pusat yang bisa membaca datamu, maka tidak ada otoritas pusat yang bisa menyelamatkannya juga.",
          "Tapi frasa sandi yang terlupa tidak lagi harus berarti kehilangan diri. Kalau kamu punya perangkat kedua yang tertaut, identitasmu masih tersimpan di sana. Kalau kamu sempat membuat kit pemulihan (Pengaturan → Kit pemulihan), kit itu mengembalikan akunmu dengan frasa sandinya sendiri yang terpisah. Kalau kamu memilih pemegang amanah, cukup banyak dari mereka bersama-sama bisa memulangkanmu tanpa frasa sandi sama sekali. Lihat “Bagaimana kalau ponselku hilang?” di bawah untuk urutan lengkap yang bisa dicoba.",
          "Hanya kalau semua itu tidak ada, jawabannya adalah Profil → Keadaan darurat → Hapus total: bersihkan perangkat ini dan mulai lagi dengan identitas segar, tanpa riwayat jam bantuanmu yang lama."
        ]
      },
      {
        "id": "lost-phone",
        "question": "Bagaimana kalau ponselku hilang?",
        "answer": [
          "Akunmu bisa kembali — ini urutan jujurnya, dari yang terbaik.",
          "1. Perangkat kedua yang tertaut. Kalau kamu sempat menambahkannya (Profil → “Tambah perangkat lain”), identitasmu sudah tinggal di sana; pakai saja terus, dan tautkan ponsel pengganti dari perangkat itu.",
          "2. Kit pemulihan. Kalau kamu sempat membuatnya (Pengaturan → Kit pemulihan), buka aplikasinya di perangkat baru mana pun, pilih tautan “Kehilangan perangkat tapi punya kit pemulihan”, lalu masukkan frasa sandi kit-nya. Jam bantuan, jaminan, peran, dan keanggotaan semuanya kembali; sejarah komunitas menyinkron lagi dari server-nya.",
          "3. Para pemegang amanahmu. Kalau kamu membagi kuncimu ke para pemegang amanah (Pengaturan → Pemegang amanah), temui cukup banyak dari mereka: perangkat baru menampilkan kode permintaan pemulihan, tiap pemegang amanah menjawab dengan kode pelepasan, dan begitu ambangnya tercapai, akunmu melangkah pulang — tanpa kit, tanpa frasa sandi.",
          "4. Undangan baru. Kalau semua di atas tidak ada, minta seseorang mengundangmu lagi. Kamu menjadi anggota baru: riwayat lamamu tetap terlihat oleh komunitas di bawah nama lamamu, tapi kunci barunya mulai dari nol. Justru karena inilah aplikasi mendorong semua orang menyiapkan perangkat kedua, kit, atau pemegang amanah SEBELUM minggu yang berat itu datang.",
          "Yang tidak pernah ikut kembali di perangkat baru: pesan pribadi dan draf yang belum terkirim — keduanya memang hanya pernah hidup di ponsel yang hilang itu, sesuai rancangannya."
        ]
      },
      {
        "id": "install-app",
        "question": "Bisakah Understoria dipasang seperti aplikasi?",
        "answer": [
          "Bisa. Understoria adalah aplikasi web yang bisa kamu taruh di layar utama seperti aplikasi lain: kamu mendapat ikon, dia terbuka penuh tanpa bilah browser, mulainya lebih cepat, dan tetap bekerja saat offline.",
          "Di iPhone atau iPad, buka Understoria di Safari, ketuk tombol Bagikan, lalu pilih “Tambahkan ke Layar Utama”.",
          "Di Android, buka lewat Chrome, ketuk menu (⋮) di pojok atas, lalu pilih “Tambahkan ke layar utama” atau “Instal aplikasi”.",
          "Di browser desktop, cari ikon pasang di ujung kanan bilah alamat.",
          "Di komputer Linux ada juga aplikasi desktopnya — satu file (AppImage) yang bisa dibagikan komunitasmu, dan berjalan tanpa browser sama sekali. Buat file-nya bisa dijalankan (klik kanan → Properti → izinkan eksekusi, atau chmod +x), buka, lalu pasangkan dari ponselmu: Pengaturan → “Tambah perangkat lain” di ponsel, lalu jalur memasukkan kode 6 kata di komputernya. Dia terhitung sebagai perangkatnya sendiri, persis seperti kasus iPhone di bawah, dan hanya diperbarui saat kamu mengganti file-nya dengan yang lebih baru.",
          "Satu hal yang perlu kamu tahu sebelum memasang: di iPhone dan iPad, aplikasi yang terpasang mendapat penyimpanan terpisahnya SENDIRI, jadi dia mulai dalam keadaan belum masuk meskipun salinan di browser sudah masuk — tidak ada yang hilang, kamu hanya punya dua “perangkat” terpisah di satu ponsel. Aplikasi yang terpasang menanyakan ini di layar pertamanya: pilih “Aku sudah pakai Understoria di browser ponsel ini” dan dia menuntunmu membawa identitasmu pindah, selangkah demi selangkah. (Di Android dan desktop, aplikasi yang terpasang berbagi penyimpanan dengan browser, jadi kamu tetap masuk.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Bagaimana cara pindah ke perangkat baru?",
        "answer": [
          "Tidak ada yang perlu diketik. Di perangkat baru, buka Understoria dan pilih “Bawa identitasku ke sini” — dia menampilkan dua emoji dan menunggu. Di perangkat yang sudah memegang identitasmu, buka Profil → “Tambah perangkat lain”: permintaannya muncul di sana dengan sendirinya. Periksa emojinya cocok, ketuk “Tautkan”, dan perangkat baru masuk sendiri. Kedua perangkat harus berada di jaringan yang sama (di satu ponsel yang sama, keduanya selalu begitu). Sedang berjauhan, atau tidak ada server komunitas? “Cara lain menautkan” punya kode 6 kata untuk dibacakan dan QR yang melewatkan server sama sekali.",
          "Dua hal tidak ikut pindah: riwayat pesanmu (pesan dienkripsi ke kunci masing-masing perangkat, jadi dia tinggal di tempat dia diterima) dan pengaturan per perangkat seperti tema dan ukuran teks. Selebihnya — kiriman, proyek, acara, anggota, pertukaran — ikut bersama tautannya, jadi perangkat baru langsung tampak seperti yang lama dan terus menyinkron setelahnya."
        ]
      },
      {
        "id": "link-safety",
        "question": "Apa yang perlu kuwaspadai saat menautkan perangkat?",
        "answer": [
          "Tiga kebiasaan sederhana menjaga penautan tetap aman. Pertama: ketuk “Tautkan” hanya saat KAMU yang memegang perangkat yang sedang meminta, dan dua emoji di layarmu cocok dengan dua emoji di layarnya. Kalau sebuah permintaan muncul saat kamu tidak sedang menautkan apa pun, abaikan — bisa jadi ada orang di jaringanmu yang sedang coba-coba, dan tidak ada yang terjadi kecuali kamu mengetuk.",
          "Kedua: setelah perangkat baru masuk, lirik nama yang menyapamu. Kalau itu bukan kamu, ada yang menyelipkan identitasnya sendiri ke transfermu — tidak ada milikmu yang terambil, dan tombol “Ini bukan aku” membersihkan perangkat itu sepenuhnya supaya kamu bisa mulai dari awal.",
          "Ketiga, catatan jujurnya: tautkan-dengan-ketuk berjalan lewat server komunitasmu sendiri, yang hanya meneruskan data tersegel yang tidak bisa dibacanya — tapi kalau kamu tidak percaya pada siapa pun yang menjalankan server itu, pakai cara QR di bawah “Cara lain menautkan”. QR-nya berpindah dari layar ke kamera tanpa server terlibat sama sekali.",
          "Satu catatan praktis: tautkan-dengan-ketuk butuh kedua perangkat tampak berada di jaringan yang sama. VPN atau iCloud Private Relay bisa diam-diam menghalanginya — kalau permintaannya tidak pernah muncul, jeda dulu semenit lalu minta lagi, atau pakai “Cara lain menautkan”."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Komunitas dan undangan",
    "entries": [
      {
        "id": "internet-outage",
        "question": "Apa yang masih bisa kita lakukan saat internet padam — misalnya saat badai besar?",
        "answer": [
          "Lebih banyak dari yang kamu kira, karena seluruh aplikasi ini memang dibangun untuk saat-saat seperti itu. Perangkatmu sudah membawa semuanya: papan, catatan bersama komunitas, daftar anggota, identitasmu. Kamu tetap bisa membaca, menempel, dan mengonfirmasi — setiap perubahan mengantre dengan aman dan terkirim sendiri begitu kamu tersambung lagi. Tidak ada yang hilang selama internet padam.",
          "Kalau ada orang di dekatmu yang butuh bantuan SEKARANG: bantu dia, lalu konfirmasikan bersama di tempat. Di halaman kirimannya, pilih “Konfirmasi langsung di tempat” — satu ponsel menampilkan kode, ponsel satunya memindai dan menandatangani. Kedua ponsel menyimpan catatannya dan membawanya pulang saat internet kembali.",
          "Kalau komunitasmu menjalankan tempat berteduh — server cadangan kecil yang disiapkan seseorang untuk saat internet padam — sambungkan ke WiFi-nya saat internet mati, dan aplikasinya berjalan lagi begitu saja untuk semua orang yang berteduh di sana: kiriman mengalir, bantuan terkonfirmasi, tanpa penyiapan apa pun. Tanyakan ke siapa pun yang menjalankan server komunitasmu apakah tempat berteduh sudah ada; kalau belum, docs/offline-resilience.md adalah resep membangunnya selagi keadaan baik.",
          "Kamu bahkan bisa mengundang orang baru. Kode undanganmu bekerja tanpa internet sama sekali — dia ditandatangani olehmu dan berlaku dua minggu — jadi tunjukkan kode QR-nya atau serahkan tautannya di atas kertas dan biarkan dia menyimpan fotonya. Di tempat berteduh, dia bisa memasang aplikasinya dan bergabung saat itu juga; kalau tidak, dia menuntaskan bergabungnya begitu mendapat koneksi apa pun. Satu-satunya yang tidak bisa terjadi tanpa jaringan sama sekali adalah mengunduh aplikasinya sendiri — undangannya menunggu dengan sabar sampai dia bisa.",
          "Selagi keadaan baik, itulah saatnya menaruh semua ini di atas kertas: halaman Infrastruktur komunitas bisa mencetak kit saat internet padam — poster dinding dan kartu dompet berisi langkah-langkah bergabung ke tempat berteduh — supaya petunjuknya tetap hidup meski baterai habis."
        ]
      },
      {
        "id": "add-a-node",
        "question": "Apa yang menjaga komunitas ini tetap aman kalau ada yang merampas server kita?",
        "answer": [
          "Dua hal, dan keduanya adalah jantung dari cara Understoria dibangun — berbeda dari aplikasi milik korporasi. Pertama: perangkat setiap anggota sudah membawa salinan lengkap komunitas yang bertanda tangan — papan, catatan bersama komunitas, proyek-proyek, semuanya. Menyita server tidak mengambil apa pun yang belum ada di ponsel semua orang, dan server pengganti bisa diisi kembali dari salinan-salinan itu.",
          "Kedua: server tidak harus satu mesin, atau mesin milik satu orang. Anggota mana pun bisa menjalankan node komunitas — laptop tua di lemari dengan layar tertutup pun sungguh cukup. Setiap node tambahan berarti tidak ada satu orang pun yang bisa ditekan kelompok anti-serikat atau anti-tolong-menolong untuk memecah komunitas. Kartu “Daya tahan komunitas” di Denyut menunjukkan sudah berapa banyak akar yang ditumbuhkan komunitasmu.",
          "Siap menambah satu? Langkah demi langkahnya ada di dokumen proyeknya — docs/add-a-node.md di repositori Understoria menuntun memfungsikan ulang komputer tua, dan panduan operator mencakup detailnya. Kerjanya satu sore, dan anggota yang menjalankan server-mu sekarang bisa membantumu saling menukar dua pengaturan yang menautkan kedua node."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Bisakah aku memulai komunitas seperti ini untuk lingkunganku?",
        "answer": [
          "Bisa — dan kamu tidak butuh izin siapa pun, akun GitHub, atau app store. Understoria adalah perangkat lunak bebas, dan server komunitas ini sendiri menyediakan kode sumber lengkapnya untuk diunduh.",
          "Seluruh jalannya sudah dituliskan di dalam aplikasi: buka Menu (pojok kanan atas) → Infrastruktur komunitas → kartu “Perangkat lunaknya sendiri” → “Mulai komunitas baru dari unduhan ini — panduan lengkapnya”. Panduan itu menuntunmu dari mengunduh dan memverifikasi kodenya sampai menjalankan server-mu sendiri, dengan bahasa sehari-hari."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Bagaimana cara mengundang seseorang?",
        "answer": [
          "Pertama-tama: mengundang adalah hal yang dilakukan anggota terpercaya. Sampai dua anggota terpercaya menjamin kamu (undangan yang kamu pakai saat bergabung terhitung sebagai yang pertama), tombol undangannya menampilkan sejauh mana kamu, bukan undangan. Ini melindungi komunitas — rantai orang asing tidak bisa mengundang lebih banyak orang asing lagi. Jalannya adalah melakukan apa yang memang jadi tujuan aplikasi ini: bantu orang. Begitu tetangga mengenalmu, anggota terpercaya mana pun bisa menjamin kamu dari profilmu.",
          "Jalan tercepat: buka Menu (pojok kanan atas) dan pilih Undang seseorang — kamu langsung dibawa ke kartu undangannya. Jalan memutarnya lewat Profil → “Undangan yang kamu buat”.",
          "Ketuk Buat tautan undangan dan kamu mendapat tautan sekali pakai. Bagikan langsung bertemu muka, lewat Signal, atau lewat kanal mana pun yang membuatmu yakin tautannya benar-benar sampai ke orang yang kamu maksud. Jangan sebarkan tautan undangan secara terbuka.",
          "Undangan juga bisa kamu tunjukkan sebagai kode QR untuk berbagi bertemu muka. Tiap undangan sekali pakai, kedaluwarsa dengan sendirinya, dan bisa dicabut dari Profil → “Undangan yang kamu buat” sampai ada yang memakainya. Saat seseorang bergabung lewat undanganmu, itu terhitung sebagai kamu menjaminnya — namamu yang menjadi jaminan kedatangannya, jadi undanglah orang yang benar-benar kamu kenal."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Bagaimana cara kerja jaminan?",
        "answer": [
          "Jaminan adalah pernyataan publik bertanda tangan bahwa kamu mengenal orang ini dan berdiri di belakang tempatnya di komunitas. Seseorang menjadi “terpercaya” begitu dua anggota berbeda menjaminnya — dan mengundang seseorang otomatis terhitung sebagai jaminanmu, jadi menjamin dengan tanganmu sendiri adalah caramu mendukung orang yang dibawa masuk orang lain.",
          "Kamu menjamin dari halaman anggotanya: ketuk namanya di mana pun dalam aplikasi dan cari bagian Jaminan. Tombolnya tampil saat jaminanmu memang akan menambah kepercayaan — kamu sendiri sudah terpercaya, dia masih mengumpulkan jaminan, dan kamu belum pernah menjaminnya. Kalau tidak, bagian itu menjelaskan kenapa, jadi kamu tidak pernah menebak-nebak.",
          "Layak dipikirkan sejenak: namamu berdiri di belakang namanya, terlihat dan permanen — jaminan tidak bisa ditarik kembali lewat aplikasi. Kalau belakangan kamu menyesalinya, jalannya adalah percakapan dengan komunitasmu, bukan sebuah tombol. Jaminlah orang yang benar-benar kamu kenal.",
          "Dijamin penuh juga membuka wewenang kepercayaan komunitas: mengundang orang baru, menjamin orang lain, ikut menandatangani pengeluaran anggota — dan tautan yang kamu bagikan menjadi bisa diketuk semua orang (sebelum itu, orang melihat alamat lengkapnya tapi tidak bisa mengetuknya — penjagaan dari tautan jahat, bukan cap buruk untukmu). Batas harian menempel untuk anggota baru — yang memang sudah longgar — hilang pada saat yang sama."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "Bagaimana kalau aku tidak sepaham dengan anggota lain?",
        "answer": [
          "Bicaralah dengannya dulu. Kebanyakan ketidaksepakatan bukan soal aplikasi dan tidak butuh campur tangan aplikasi.",
          "Kalau soal satu pertukaran tertentu, pakai Ada yang tidak beres — tandai di halaman detail kiriman. Kalau soal perilaku di luar satu pertukaran, kamu bisa membuka beda pendapat dari Profil → Beda pendapat — beda pendapat berjalan lewat proses usulan komunitas yang terbuka, karena tidak ada admin yang mengambil keputusan untukmu.",
          "Dan kalau yang kamu butuhkan sekadar jarak dari seseorang, memblokir juga selalu tersedia — lihat “Bagaimana kalau ada yang menggangguku?” di bagian Pesan."
        ]
      },
      {
        "id": "member-removal",
        "question": "Bagaimana cara kerja mengeluarkan seseorang dari komunitas?",
        "answer": [
          "Mengeluarkan anggota adalah hal terberat yang bisa dilakukan komunitas ini, dan aplikasi memperlakukannya seperti itu. Ia jalan terakhir: blokir pribadi sudah menghentikan konten seseorang sampai kepadamu, beda pendapat bisa mempersoalkan satu pertukaran tertentu, dan obrolan membereskan lebih banyak daripada keduanya.",
          "Tidak ada satu orang pun yang bisa mengeluarkan siapa pun — bukan penggerak, bukan pula yang menjalankan server. Butuh beberapa anggota (jumlahnya ditetapkan komunitasmu dan diperlihatkan ke semua orang) yang masing-masing menandatangani satu catatan publik dengan namanya sendiri. Mengusulkan dimulai dari profil anggotanya; tanda tangan berikutnya dibubuhkan tiap orang dengan tangannya sendiri, dari halaman Usulan.",
          "Pengeluaran anggota bersifat terbuka di dalam komunitas — siapa yang dikeluarkan, kapan, kenapa, dan siapa persisnya yang menandatangani, semuanya terlihat di halaman Usulan. Mengeluarkan orang secara diam-diam adalah awal komunitas membusuk.",
          "Ini bukan penghapusan. Pertukaran-pertukaran lama anggota yang dikeluarkan tetap ada — pertukaran itu menyeimbangkan catatan anggota lain — dan semua yang ada di perangkatnya sendiri tetap miliknya. Yang berakhir adalah aksesnya: membaca berhenti, dan tulisan baru ditolak. Orang-orang yang dia undang sebelum dikeluarkan tetap anggota; undangannya yang belum terpakai ikut mati.",
          "Dan pintunya bisa terbuka lagi: menyambut kembali butuh jumlah tanda tangan yang sama, dimulai dari catatan pengeluarannya sendiri di halaman Usulan."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Boleh tidak aku cuma melihat-lihat tanpa menempel apa pun?",
        "answer": [
          "Boleh. Membaca apa yang ditawarkan dan diminta orang lain adalah cara ikut serta yang sah. Ada anggota yang berminggu-minggu hanya mengamati sebelum menempel kebutuhan pertamanya; ada yang tidak pernah menempel dan hanya menanggapi orang lain. Dua-duanya disambut baik."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Siapa yang bisa melihat apa yang kutempel?",
        "answer": [
          "Semua orang di node komunitasmu bisa melihat kirimanmu, nama panggilanmu, daerahmu (kalau kamu mengisinya), dan riwayat pertukaranmu. Komunitas sahabat menerima catatan bertanda tangan yang kamu bagikan — kiriman, pertukaran terkonfirmasi, acara — di bawah kunci publikmu, bukan nama panggilanmu. Karena pertukaran ikut mengalir antarkomunitas, node sahabat bisa melihat aktivitas pertukaran kuncimu dan menghitung jam bantuannya; yang tidak pernah keluar dari komunitasmu: jawaban kehadiran, tulis nama di sesi, tugas proyek, blokir, draf, dan pesan.",
          "Pesan pribadi berbeda: dia terenkripsi ujung ke ujung antara perangkatmu dan perangkat lawan bicaramu, jadi hanya kalian berdua yang bisa membacanya — node tidak, anggota lain juga tidak. Lihat “Bagaimana cara mengirim pesan ke anggota lain?” di bagian Pesan untuk detailnya."
        ]
      },
      {
        "id": "beta-status",
        "question": "Seberapa rampung aplikasi ini? Apa yang sebaiknya tidak kutaruh di dalamnya?",
        "answer": [
          "Understoria adalah perangkat lunak beta. Sebagian besar kodenya ditulis dengan alat AI dan ditinjau oleh manusia, dan belum ada audit keamanan independen.",
          "Perlindungan yang kamu lihat nyata dan teruji — pesan terenkripsi ujung ke ujung, catatan bertanda tangan, penghapusan saat genting berfungsi. Tapi beta berarti bug tetap mungkin ada, termasuk yang belum ditemukan siapa pun.",
          "Aplikasi ini dibuat untuk mengatur bantuan bertetangga sehari-hari. Jangan menaruh apa pun di dalamnya yang bisa mencelakaimu atau orang lain kalau sampai bocor — dokumen identitas dari pemerintah, detail medis atau imigrasi, atau apa pun yang hanya berani kamu ucapkan secara lisan. Kalau ragu, sampaikan langsung saja."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Pesan",
    "entries": [
      {
        "id": "message-someone",
        "question": "Bagaimana cara mengirim pesan ke anggota lain?",
        "answer": [
          "Buka kiriman mana pun dan ketuk tombol Pesan untuk menyapa — pesannya sampai ke penempelnya, atau, kalau itu kirimanmu sendiri, ke orang yang sedang membantumu. Percakapan sengaja dimulai dari sebuah kiriman — itu menjaga pesan tetap terikat pada bantuan sungguhan, bukan sapaan dingin tanpa sebab. Buka Pesan di navigasi untuk melihat semua percakapanmu dan mencari di dalamnya.",
          "Pesan terenkripsi ujung ke ujung dan berjalan dari perangkat ke perangkat. Hanya kamu dan orang yang kamu tulisi yang bisa membacanya — node komunitas meneruskannya tapi tidak bisa melihat isinya.",
          "Sengaja tidak ada tanda dibaca dan tidak ada penanda sedang mengetik. Tidak ada yang bisa melihat kapan (atau apakah) kamu membaca sebuah pesan, dan tidak ada yang mengawasimu menyusun balasan. Bacalah saat kamu membaca, jawablah saat kamu sanggup — aplikasi diam saja, dua-duanya."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Bagaimana cara kerja catatan suara? Mikrofonku tidak berfungsi.",
        "answer": [
          "Di dalam percakapan, tombol mikrofon ada di kotak pesan selama kotaknya kosong — begitu kamu mulai mengetik, dia berganti menjadi Kirim; hapus teksnya dan mikrofonnya kembali. Ketuk untuk merekam catatan suara sampai 45 detik, dengarkan dulu sebelum ada yang keluar, dan kirim hanya saat kamu sudah puas. Catatan suara tersegel ujung ke ujung persis seperti pesan ketikan — hanya kamu dan lawan bicaramu yang bisa mendengarnya.",
          "Suara di kiriman Papan bekerja berbeda. Kiriman papan adalah konten komunitas, jadi rekaman yang kamu lampirkan ke sebuah kiriman bisa didengar seluruh komunitas — pendengarnya sama dengan pembaca kata-kata yang kamu tulis di sana.",
          "Kalau mikrofonnya tidak mau menyala: browser atau ponselmu meminta izin saat pertama kali kamu merekam. Kalau izinnya sempat ditolak — meski tidak sengaja — merekam tetap terkunci sampai kamu mengizinkan mikrofon untuk situs ini di pengaturan browser atau ponselmu. Begitu diizinkan, kembali dan coba lagi."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "Bagaimana kalau ada yang menggangguku?",
        "answer": [
          "Kamu bisa memblokirnya. Buka percakapanmu dengannya dan pilih Blokir kontak dari menu di bagian atas, atau pakai pilihan blokir di halaman anggotanya.",
          "Blokir berlaku seketika dan bersifat pribadi. Kamu berhenti melihat kiriman, acara, komentar, dan pesannya, dan kalian berdua tidak lagi bisa saling mengirim pesan, menjamin, mengambil kiriman, atau mengundang. Dia tidak diberi tahu — tidak ada pemberitahuan, tidak ada tanda di profilnya, tidak ada apa pun yang bisa dilihat orang lain.",
          "Memblokir TIDAK mengadukan siapa-siapa. Tidak ada moderator yang dihubungi, tidak ada beda pendapat yang terbuka, dan pertukaran yang sudah lewat tetap seperti adanya. Kalau kamu ingin komunitas ikut menimbang, buka beda pendapat dari Profil → Beda pendapat — blokir dan beda pendapat berjalan baik berdampingan. Blokir memberimu ketenangan sekarang; beda pendapat mengikuti proses komunitas dengan iramanya sendiri.",
          "Kamu bisa meninjau, mengubah, atau membatalkan blokirmu kapan saja di Pengaturan → Kontak yang diblokir."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Acara dan kalender",
    "entries": [
      {
        "id": "community-events",
        "question": "Bagaimana cara kerja acara komunitas?",
        "answer": [
          "Siapa pun bisa membuat acara: buka Kalender dan ketuk tombol +. Beri waktu, tempat, dan deskripsi, dan acaranya tampil di kalender komunitas untuk semua orang.",
          "Ketuk sebuah acara untuk memberi jawaban kehadiran — Datang, Mungkin, atau Tidak datang. Jawaban kehadiranmu tinggal di node komunitas ini: penggerak dan orang-orang lain yang sudah menjawab bisa melihat namamu, anggota yang belum menjawab hanya melihat jumlahnya, dan komunitas sahabat tidak pernah melihat jawabanmu sama sekali. Kalau kamu mengubah jawabanmu menjadi “Tidak datang”, namamu langsung turun dari daftar.",
          "Sebagian acara juga punya sesi — petak waktu tempat penggerak butuh sejumlah tangan, seperti tim persiapan atau giliran menyajikan makanan. Menulis namamu di sebuah sesi sekaligus menjawab kehadiranmu “Datang” di acaranya. Daftar nama sesi bekerja seperti daftar jawaban kehadiran: dia tinggal di node komunitas ini, dan mengubah jawabanmu menjadi “Tidak datang” juga menurunkanmu dari semua sesi.",
          "Acara tidak bisa diubah setelah dibuat — acara yang sudah ditandatangani tetap persis seperti yang orang-orang iyakan. Kalau detailnya berubah, penggerak membatalkannya dan menempel yang baru. Saat acara yang sudah kamu jawab kehadirannya dibatalkan, kamu akan melihat pemberitahuannya (beserta alasan penggeraknya, kalau dia menuliskannya) saat berikutnya kamu membuka aplikasi."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Proyek dan tugas",
    "entries": [
      {
        "id": "task-follows",
        "question": "Kenapa sebuah tugas bertuliskan “Setelah: …”?",
        "answer": [
          "Tugas dalam sebuah proyek bisa diurutkan. “Setelah” berarti tugas ini secara alami datang sesudah tugas lain — cor dulu fondasinya sebelum mendirikan rangka dinding. Tidak ada yang macet dan tidak ada yang menghalangi siapa pun; ini sekadar urutan.",
          "Kamu tetap boleh mengambil tugas ber-“Setelah” kapan pun kamu mau. Satu-satunya bedanya, aplikasi sengaja tidak akan menanyakan kabarnya padamu sampai tugas sebelumnya selesai — buat apa bertanya bagaimana jalannya kalau pijakan yang menopangnya belum ada. Sistemnya menunggu bersamamu, bukan menunggu-nunggu kamu."
        ]
      }
    ]
  }
];
