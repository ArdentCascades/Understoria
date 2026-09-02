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
import type { StartCommunityGuide } from "./startCommunity";

export const START_COMMUNITY_ID: StartCommunityGuide = {
  "intro": [
    "Komunitasmu berjalan dengan Understoria. Kamu bisa memulai satu untuk lingkunganmu, tempat kerjamu, keluargamu di seberang kota — hanya bermodal server milik komunitasmu sendiri. Tanpa akun GitHub, tanpa app store, tanpa wajib Docker, tanpa perlu izin dari siapa pun.",
    "Ini bisa terjadi karena Understoria adalah perangkat lunak bebas (berlisensi AGPL) dan setiap server menyediakan kode sumbernya sendiri — kode persis yang sedang dijalankannya. Itu bukan basa-basi: lisensinya mewajibkannya, dan aplikasinya membawanya terpasang dari lahir supaya tidak pernah ada satu perusahaan, satu tempat hosting, atau satu repositori yang menjadi satu-satunya tempat perangkat lunak ini hidup. Setiap komunitas adalah benih.",
    "Untuk siapa panduan ini: orang yang nyaman mengikuti petunjuk terminal dengan hati-hati, tapi belum pernah menyiapkan server. Kalau kata “terminal” dan “perintah” masih asing bagimu, kerjakan ini di samping anggota yang sudah pernah — memang begitulah pengetahuan ini seharusnya berpindah."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. Apa yang kamu perlukan",
      "paragraphs": [
        "Komputer dengan terminal (perintah-perintah di bawah untuk Linux atau Mac; Raspberry Pi juga bisa). Sekitar 15 menit untuk mencoba aplikasinya di mesinmu sendiri. Menyiapkan server sungguhan untuk anggota makan waktu satu sore penuh dan butuh nama domain plus server kecil — panduan yang ikut di dalam unduhan mencakup semua itu."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Dapatkan perangkat lunaknya",
      "paragraphs": [
        "Cara mudahnya: di komunitas pemilik halaman ini — atau komunitas Understoria mana pun yang bisa kamu jangkau — buka Menu (pojok kanan atas) → Infrastruktur komunitas → kartu “Perangkat lunaknya sendiri”. Unduh KEDUA file-nya: arsip kode sumber dan checksum-nya. Taruh keduanya di folder yang sama.",
        "Cara terminalnya (ganti alamatnya dengan alamat komunitasmu):",
        "Sebagian server juga menyediakan “Bundel riwayat lengkap”. Ukurannya lebih besar, dan kalau git sudah terpasang di komputermu, inilah unduhan yang lebih baik: kamu mendapat seluruh riwayat pengembangan dan nantinya bisa menarik pembaruan seperti biasa. Kalau kamu mengambil bundelnya, buka dengan git, bukan tar:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Verifikasi unduhanmu",
      "paragraphs": [
        "Checksum adalah sidik jari yang dihitung dari byte persis sebuah file. Kalau satu byte saja berubah dalam perjalanan ke tempatmu — koneksi yang tersendat, unduhan yang terpotong — sidik jarinya berubah seluruhnya. Periksa dulu sebelum membangun apa pun. Yang ingin kamu lihat adalah “OK”. Selain itu: hapus dan unduh ulang.",
        "Jujurlah pada dirimu soal apa yang dibuktikannya: checksum-nya datang dari server yang sama dengan file-nya, jadi ia membuktikan unduhannya tiba utuh — ia tidak bisa membuktikan tidak ada yang mengubah kode di server itu. Kepercayaan sebesar itu sebenarnya sudah kamu berikan setiap hari pada yang menjalankan node-mu (dialah yang menyajikan aplikasi berjalan ini untukmu). Untuk penegasan yang independen, ambil checksum versi yang sama dari komunitas kedua dan bandingkan — dua operator harus bersekongkol untuk mengelabui pemeriksaan itu.",
        "Lalu buka arsipnya. Isinya mengekstrak ke folder tempatmu berada, jadi buat satu folder dulu:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Coba dulu sebelum memutuskan apa pun",
      "paragraphs": [
        "Kamu bisa menjalankan seluruh aplikasinya di mesinmu sendiri dan menjalani satu pertukaran sungguhan dari awal sampai akhir. Folder yang baru kamu buka berisi setiap panduan yang dimiliki proyek ini, di folder docs-nya — buka docs/quickstart.md di editor teks apa saja dan ikuti dari langkah pertamanya. Di bagian yang menyuruh meng-clone repositori, lewati saja: kamu sudah duduk di dalam folder sumbernya.",
        "Ini layak dilakukan bahkan kalau kamu sudah yakin. Kamu akan menyambut dirimu sendiri sebagai anggota, menempel satu kebutuhan, dan mengonfirmasi satu pertukaran — jadi saat anggota sungguhan pertamamu kebingungan, kamu sudah pernah melihat layarnya."
      ]
    },
    {
      "id": "deploy",
      "title": "5. Pasang untuk komunitasmu",
      "paragraphs": [
        "Panduan server lengkapnya ada di folder docs yang sama, ditulis persis untuk momen ini. Pilih menurut cara kamu ingin menjalankannya: docs/deploy-linode.md (Docker di server kecil kelas lima dolar — jalur yang paling sering dilalui, sebagian besar otomatis lewat skrip penyiapan) atau docs/deploy-alternatives.md (Podman, atau Linux polos tanpa kontainer sama sekali — bentuk yang pas untuk perangkat keras sumbangan).",
        "Satu penyesuaian saat membacanya, karena keduanya dibuka dengan meng-clone dari repositori publik: di bagian yang menyuruh meng-clone ke sebuah folder di server, salin saja arsipmu yang sudah terverifikasi ke sana lalu ekstrak. Selebihnya — kunci sistem, file pengaturan, kunci pendiri, cadangan, daftar periksa “sebelum dibuka untuk umum” — berlaku tanpa perubahan.",
        "Memperbarui nanti, tanpa git: unduh arsip yang lebih baru dari server mana pun yang menjalankan versi lebih baru, verifikasi dengan cara yang sama, ekstrak ke folder baru, bawa serta file pengaturanmu, lalu pasang ulang. Data komunitasmu aman sepanjang proses ini — dia tidak pernah tinggal di folder sumber."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Sekarang kamu juga benih",
      "paragraphs": [
        "Begitu server-mu menyala, dia menawarkan kode sumbernya SENDIRI dengan cara yang sama — otomatis, dari build yang sama. Anggotamu bisa memverifikasi apa yang sedang mereka jalankan, dan lingkungan berikutnya bisa bertumbuh dari kamu, seperti kamu baru saja bertumbuh dari komunitasmu. Tidak ada satu titik pun — bukan GitHub, bukan para penulis proyek ini, bukan satu operator mana pun — yang bisa merenggut perangkat lunak ini dari semua orang sekaligus.",
        "Dua kebiasaan menjaga rantainya tetap kuat: pasang ulang sesekali (server-mu menawarkan sumber dari apa yang dijalankannya, jadi menjalankan yang terbaru berarti menyemai yang terbaru), dan kenali server komunitas kedua — pemeriksaan bandingkan-dua-server di atas hanya jalan kalau komunitas bisa saling menyebut nama."
      ]
    }
  ],
  "closing": [
    "Pertanyaan yang tidak terjawab halaman ini hidup di folder docs unduhannya — docs/bootstrap-from-a-node.md adalah panduan yang sama ini dengan detail lebih banyak, dan docs/operator-guide.md adalah buku pegangan harian untuk siapa pun yang menjaga server tetap menyala."
  ]
};
