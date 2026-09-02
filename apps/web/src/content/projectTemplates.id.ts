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
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_ID: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Kulkas komunitas dan rak makanan gratis",
    "purpose": "Menyediakan makanan dan kebutuhan pokok gratis, bisa diambil 24 jam, tanpa ditanya-tanya.",
    "whoItServes": "Siapa pun yang butuh makanan; terutama membantu orang yang kerja dengan jam tidak tetap, tetangga tanpa dokumen resmi, dan mereka yang tidak sempat ke bank makanan pada jam kerja.",
    "whatYoullNeed": "Kulkas sumbangan, sudut terlindung di luar ruangan dengan stopkontak, satu tuan rumah, dan giliran bersih-bersih kecil.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Mulailah dari tuan rumah, bukan dari kulkas. Duduklah bersama pemilik warung, rumah ibadah, atau klinik yang kamu incar dan bicarakan bagian-bagian yang tidak glamor — biaya listrik, bagaimana kalau ada yang meninggalkan kekacauan, siapa yang mereka hubungi kalau kulkas rusak — sebelum kamu mencari satu kulkas pun. Sekalian, tanyakan ke rak makanan dan kelompok tolong-menolong yang sudah bergerak di dekatmu celah apa yang mereka lihat, supaya kulkas ini mengisi satu celah, bukan menduplikasinya.",
    "commonPitfalls": "Kulkas komunitas hampir tidak pernah mati karena kurang sumbangan — ia mati saat tidak ada yang jelas memegang urusan bersih-bersih, kulkas jadi kumuh, dan tuan rumah pelan-pelan minta kulkasnya dipindahkan. Isi nama-nama di jadwal giliran sebelum hari pembukaan, dan hubungan dengan tuan rumah itulah yang sebenarnya kamu rawat — bukan cuma kulkasnya.",
    "pairsWith": [
      "gleaning-network",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Cari tuan rumah yang ada listrik dan ramai orang lewat",
        "description": "Datangi warung dan usaha kecil, rumah ibadah, klinik, atau balai warga. Tanyakan apakah mereka mau kulkas ditaruh di bawah kanopi mereka dan dicolokkan ke listrik (biayanya biasanya kecil saja per bulan — tawarkan untuk membayarnya). Minta persetujuan tertulis yang sederhana.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari kulkas dan pelindung tahan cuaca",
        "description": "Sebarkan kabar mencari kulkas yang masih berfungsi di grup-grup sekitar. Buat atau beli lemari kayu atau atap sandar sederhana di sekelilingnya untuk melindunginya dari hujan dan panas. Pasang jangkar supaya tidak roboh. Termasuk mencari, mengangkut, dan membangunnya.",
        "hours": 8,
        "skills": [
          "pertukangan",
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tetapkan aturan main dan beri label semuanya",
        "description": "Pasang papan aturan yang jelas dalam beberapa bahasa: ambil seperlunya, tinggalkan semampunya, jangan makanan kedaluwarsa, awetan rumahan, atau daging mentah. Sediakan label dan spidol supaya orang bisa menulis tanggal di tiap barang.",
        "hours": 1.5,
        "skills": [
          "menulis",
          "menerjemahkan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ajak orang untuk giliran bersih-bersih dan isi ulang",
        "description": "Buat jadwal mingguan bersama. Tiap sesi cuma sekitar 15 menit: lap permukaan, buang yang busuk atau lewat tanggal, dan catat apa yang mulai menipis. Simpan alat kebersihan di tempat.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bangun hubungan dengan pemasok",
        "description": "Minta toko roti, toko kelontong, rumah makan, dan pasar tani menyumbangkan sisa dagangan akhir hari secara rutin. Atur satu penolong untuk menjemputnya. Catat sumber mana saja yang bisa diandalkan.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Siapkan kontak untuk masalah",
        "description": "Pasang satu nomor telepon atau email di kulkas untuk “kulkas rusak / listrik padam / mau tanya”. Tentukan siapa yang menjawab dan seberapa cepat.",
        "hours": 0.5,
        "skills": []
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Kebun komunitas / lahan tanam bersama",
    "purpose": "Menanam sayur segar gratis bersama-sama dan menciptakan ruang berkumpul.",
    "whoItServes": "Tetangga yang tidak punya pekarangan, orang yang terhimpit harga pangan, dan siapa pun yang ingin terhubung dan punya alasan keluar rumah.",
    "whatYoullNeed": "Sebidang lahan (lahan kosong atau atap pun bisa), tanah atau bedengan, akses air, benih, dan kelompok inti 5–10 orang yang rutin datang.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Sebelum menyentuh tanah, bicaralah dengan dua kelompok orang: pemilik lahannya, dan tetangga yang tinggal persis di sebelahnya — restu mereka sama pentingnya dengan surat sewanya. Lalu kumpulkan calon anggota rutinmu dan bicarakan model berbaginya sejak awal; tahu apakah ini petak perorangan atau panen bersama mengubah semua yang akan kalian bangun.",
    "commonPitfalls": "Kebun biasanya tidak mati di awal musim tanam — ia mati di minggu-minggu terpanas, saat giliran siram diam-diam bubar dan bedengan mengering kecokelatan. Pembunuh pelan yang lain: satu orang memperlakukannya sebagai kebunnya sendiri dan menganggap yang lain cuma membantu; tuliskan cara mengambil keputusan selagi semua orang masih saling suka.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Amankan lahan dan izinnya",
        "description": "Cari lahan kosong, halaman rumah ibadah, pekarangan sekolah, atau pojok taman yang tidak terpakai. Temukan pemiliknya (lewat catatan tanah di kantor kota, atau tanya-tanya saja). Minta izin atau sewa tertulis, walau cuma kesepakatan setahun yang ditulis tangan, dan pastikan akses air.",
        "hours": 6,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Uji tanah dan rencanakan bedengan",
        "description": "Kirim sampel untuk uji tanah murah lewat dinas pertanian setempat untuk memastikan bebas timbal dan cemaran. Kalau tanahnya buruk, rencanakan bedengan tinggi berisi tanah bersih. Buat sketsa letak bedengan, jalur, dan pojok alat.",
        "hours": 2,
        "skills": [
          "berkebun"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kumpulkan bahan dan bangun",
        "description": "Kumpulkan kayu, atau pakai bedengan balok jerami atau model keyhole, kompos, dan mulsa. Adakan gotong royong membangun; banyak tangan membuat bedengan cepat jadi. Pasang selang atau tong air hujan.",
        "hours": 10,
        "skills": [
          "pertukangan"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Sepakati model berbagi",
        "description": "Sepakati bersama: petak perorangan, panen sepenuhnya bersama, atau campuran. Tuliskan cara membagi hasil dan cara mengambil keputusan.",
        "hours": 1,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Tanam sesuai iklim dan musimmu",
        "description": "Pilih tanaman yang mudah dan hasilnya banyak untuk daerahmu (sayuran daun, kacang panjang, labu, tomat, tanaman bumbu). Atur tanam bergelombang supaya panen tidak datang serentak. Beri label tiap barisnya.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "berkebun"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Atur giliran siram dan cabut gulma",
        "description": "Tanaman lebih sering mati karena terabaikan daripada sebab lain. Buat kalender bersama yang sederhana; kaitkan tugas dengan pengingat yang gampang. Buat seringan mungkin supaya orang tidak kehabisan tenaga.",
        "hours": 1,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Rencanakan panen dan kelebihannya",
        "description": "Tentukan hari panen. Alirkan kelebihan hasil ke kulkas komunitas, tetangga, atau lapak gratis di gerbang. Sisihkan sebagian benih untuk musim berikutnya.",
        "hours": 1,
        "recurringCadence": "cycle",
        "follows": [
          4
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "tool-lending-library",
    "name": "Perpustakaan alat dan perlengkapan",
    "purpose": "Membuat tetangga bisa meminjam alat dan perlengkapan alih-alih membelinya — hemat uang, kurangi barang terbuang.",
    "whoItServes": "Penyewa rumah, pemilik rumah baru, penghobi, dan siapa pun yang sesekali memperbaiki sesuatu atau punya proyek.",
    "whatYoullNeed": "Ruang penyimpanan, alat-alat sumbangan, sistem pinjam-catat yang sederhana, dan satu-dua “pustakawan”.",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Sebelum mengumpulkan satu bor pun, bicaralah dengan orang yang menawarkan ruangnya tentang apa artinya hidup berdampingan dengan perpustakaan alat — kebisingan, barang yang terus menumpuk, orang tak dikenal mengetuk pintu di jam buka. Lalu tanyakan ke tetangga apa yang benar-benar akan mereka pinjam; daftar sepuluh alat yang diminta jauh lebih berharga daripada segarasi alat sumbangan yang tidak diinginkan siapa pun.",
    "commonPitfalls": "Perpustakaan alat mati oleh keheningan setelah tanggal kembali lewat: tidak ada yang menyusul kabar, alat pelan-pelan tak pernah pulang, dan rak pun kosong. Rutinitas pengingat yang ramah lebih penting daripada aturan telat yang keras — dan beranilah menolak sumbangan, atau kamu jadi tempat buangan barang rusak sekampung.",
    "pairsWith": [
      "library-of-things",
      "repair-cafe",
      "weatherization-brigade"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Cari ruang simpan dan tentukan jam buka",
        "description": "Gudang kecil, garasi, lemari di balai warga, atau kontainer pun jadi. Pilih 2–4 jam buka yang tetap tiap minggu supaya orang tahu kapan datang.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Kumpulkan dan pilah inventaris",
        "description": "Sebarkan ajakan menyumbang (banyak orang punya bor dan tangga dobel di mana-mana). Bersihkan, uji, dan beri label tiap alat. Singkirkan atau perbaiki apa pun yang tidak aman.",
        "hours": 6,
        "skills": [
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Katalogkan semuanya",
        "description": "Pakai spreadsheet gratis atau aplikasi perpustakaan pinjam. Catat tiap barang, kondisinya, dan satu foto. Beri nomor supaya alat mudah dilacak.",
        "hours": 4,
        "skills": [
          "input data"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tulis aturan meminjam",
        "description": "Tentukan lama pinjam (misalnya seminggu), berapa barang sekaligus, dan aturan pengembalian serta keterlambatan. Buat yang pemaaf — intinya soal saling percaya. Catat alat mana saja yang butuh penjelasan keselamatan.",
        "hours": 1,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Siapkan pencatatan keluar",
        "description": "Papan jalan atau formulir sederhana: nama, kontak, barang, tanggal keluar, tanggal kembali. Foto cepat kondisi alat saat keluar supaya tidak ada beda pendapat belakangan.",
        "hours": 2,
        "skills": [
          "input data"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Latih para pustakawanmu",
        "description": "Ajak para penolong menelusuri katalog, langkah peminjaman, dan keselamatan dasar (pelindung mata, cara pakai tangga). Sediakan contekan satu halaman di meja.",
        "hours": 2,
        "skills": [
          "mengajar"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Rawat dan kembangkan",
        "description": "Periksa alat yang kembali, asah dan minyaki secara rutin, dan catat apa yang paling sering diminta supaya kamu tahu apa yang perlu ditambah berikutnya.",
        "hours": 2,
        "skills": [
          "memperbaiki alat"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Jaringan peduli tetangga",
    "purpose": "Memastikan tetangga yang terisolasi tetap ditengok, terhubung, dan didukung.",
    "whoItServes": "Orang lanjut usia, tetangga difabel dan yang sakit menahun, orang tua baru, dan siapa pun yang tinggal sendirian.",
    "whatYoullNeed": "Daftar penolong, cara menjodohkan mereka dengan tetangga, dan ritme menengok yang rutin. Para penolong adalah tetangga, bukan tenaga profesional perawatan — periksa latar belakang siapa pun yang berkunjung ke rumah, jangan pernah biarkan satu penolong memegang uang tetangga sendirian, dan sepakati sejak awal kapan menghubungi keluarga atau nomor darurat.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Mulailah dengan mendengarkan, bukan merekrut: bicaralah dengan tetangga yang ingin kamu dukung tentang apa yang sebenarnya mereka mau — telepon mingguan, tebengan, teman ngobrol — karena jaringan yang dibangun di atas asumsi terasa seperti pengawasan. Pada saat yang sama, bicarakan dengan jujur bersama penolong-penolong awal soal pemeriksaan latar belakang dan batasan, supaya saat perjodohan pertama terjadi, aturan yang ada terasa sebagai bentuk peduli, bukan curiga.",
    "commonPitfalls": "Jaringan peduli jarang gagal karena kekurangan penolong — ia menghanguskan tiga orang yang selalu bilang ya sementara yang lain menunggu diminta. Sebar perjodohan dengan sengaja, tetap adakan obrolan evaluasi penolong walau semuanya tampak baik-baik saja, dan jangan biarkan tengokan berubah jadi memperlakukan tetangga sebagai kasus, bukan manusia.",
    "pairsWith": [
      "rides-transportation",
      "disability-support-network",
      "welcome-wagon"
    ],
    "learnMore": [
      "message-someone"
    ],
    "tasks": [
      {
        "name": "Petakan siapa saja di sekitar",
        "description": "Cari tahu pelan-pelan tetangga yang mungkin terisolasi lewat obrolan, penjaga gedung, klinik, dan rumah ibadah. Jangan pernah berasumsi orang butuh — undang mereka masuk, jangan menunjuk-nunjuk.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Ajak dan periksa calon penolong",
        "description": "Cari orang yang sanggup berkomitmen kontak rutin. Untuk kunjungan ke rumah atau bantuan bagi orang dewasa yang rentan, lakukan pengecekan referensi dasar dan jangan pernah biarkan satu penolong memegang uang tetangga sendirian.",
        "hours": 5,
        "skills": [
          "menjangkau warga",
          "wawancara"
        ]
      },
      {
        "name": "Jodohkan dengan penuh pertimbangan",
        "description": "Pasangkan berdasarkan bahasa, jarak, dan kenyamanan. Tanyakan ke kedua orang apa yang mereka mau — telepon mingguan, dibelanjakan ke pasar, ngobrol di teras — dan hormati batas itu.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Tentukan ritme menengok",
        "description": "Sepakati frekuensi dan caranya (telepon, pesan, ketukan pintu). Beri penolong naskah singkat untuk kontak pertama supaya terasa hangat, bukan klinis.",
        "hours": 1,
        "follows": [
          2
        ],
        "skills": []
      },
      {
        "name": "Buat rencana eskalasi",
        "description": "Putuskan sejak awal apa yang dilakukan kalau seseorang tidak menjawab atau tampak dalam krisis: siapa yang dihubungi, kapan melibatkan keluarga atau nomor darurat, dan bagaimana mencatatnya. Simpan tertulis dan sederhana.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Koordinasikan bantuan praktis",
        "description": "Catat kebutuhan berulang — antar ke janji berobat, menebus obat, menyekop salju — dan hubungkan dengan penolong atau proyek lain di programmu.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Dukung juga para penolongnya",
        "description": "Adakan sesi tengok untuk mereka bercerita. Kerja merawat itu menguras; putar tugas dan waspadai kelelahan.",
        "hours": 2,
        "skills": [
          "memandu diskusi"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Jaringan siaga darurat dan bencana",
    "purpose": "Membantu lingkungan bersiap dan bergerak saat bencana (gelombang panas, badai, banjir, listrik padam) ketika bantuan resmi datang lambat.",
    "whoItServes": "Semua orang, dengan prioritas bagi yang sulit mengungsi atau yang bergantung pada listrik untuk alat medis.",
    "whatYoullNeed": "Daftar kontak, titik kumpul, perlengkapan dasar, dan rencana komunikasi yang tetap jalan tanpa internet. Jaringan ini melengkapi petugas darurat resmi — bukan menggantikannya. Dalam situasi yang mengancam nyawa, selalu hubungi nomor darurat lebih dulu.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Bangun rencananya di sekitar orang-orang yang jadi tujuannya: ketuk pintu tetangga yang memakai oksigen, obat yang harus didinginkan, atau tinggal di lantai atas tanpa lift, dan tanyakan seperti apa minggu yang buruk bagi mereka. Lalu bicaralah dengan pemegang kunci calon titik amanmu dan dengan kelompok kesiapsiagaan yang sudah ada (tim siaga bencana warga, pemadam kebakaran) supaya jaringanmu mengisi celah di sekeliling respons resmi, bukan menduplikasinya.",
    "commonPitfalls": "Jaringan seperti ini tidak gagal saat bencana — ia gagal di tahun-tahun tenang sebelumnya, saat pohon kontak menua, nomor telepon berganti, dan rencananya hidup di laptop satu orang. Cetak semuanya, segarkan daftarnya dengan ritme kalender, dan berlatihlah setidaknya sekali; pemakaian sungguhan yang pertama jangan pernah jadi pemakaian yang pertama.",
    "pairsWith": [
      "cooling-warming-center",
      "community-first-aid-training",
      "community-wifi-mesh"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Petakan risiko lingkunganmu",
        "description": "Tulis bencana yang paling mungkin terjadi di tempatmu. Catat titik-titik rentan: orang di lantai atas tanpa lift, yang memakai oksigen atau obat berpendingin, gedung dengan satu pintu keluar.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Bangun pohon kontak",
        "description": "Kumpulkan kontak atas persetujuan, blok demi blok. Tunjuk beberapa “kepala blok” yang masing-masing menengok sekitar 10 rumah tangga. Simpan salinan kertas — ponsel dan internet tumbang saat bencana.",
        "hours": 8,
        "skills": [
          "menjangkau warga",
          "input data"
        ]
      },
      {
        "name": "Rencanakan komunikasi tanpa jaringan",
        "description": "Putuskan cara saling menghubungi tanpa sinyal: ketuk pintu, titik kumpul, peluit, atau radio. Cetak dan bagikan rencananya.",
        "hours": 3,
        "skills": [
          "menulis"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Isi perlengkapan bersama",
        "description": "Susun kit komunitas: air, kotak P3K, senter, baterai, radio baterai atau engkol, selimut, dan alat-alat dasar. Simpan di tempat yang bisa dijangkau beberapa orang.",
        "hours": 5,
        "skills": [
          "menyetir"
        ]
      },
      {
        "name": "Tentukan titik-titik aman",
        "description": "Cari tempat yang bisa jadi ruang pendingin atau penghangat, atau titik mengisi daya (aula dengan genset, taman yang teduh). Pastikan aksesnya jauh-jauh hari.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Adakan latihan atau malam informasi",
        "description": "Adakan sesi tentang tas siaga pribadi, cara mematikan aliran listrik-gas-air, dan pohon kontak. Berlatihlah sekali supaya orang tidak baru belajar saat darurat sungguhan.",
        "hours": 5,
        "skills": [
          "mengajar",
          "memandu diskusi"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Tetapkan peran untuk “hari-H”",
        "description": "Tentukan dari awal siapa yang menengok tetangga rentan medis lebih dulu, siapa yang membuka titik aman, dan siapa yang mengoordinasikan. Tinjau dan perbarui rencananya dua kali setahun.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Toko gratis / tukar barang",
    "purpose": "Mengalirkan kembali pakaian, perabot rumah, dan perlengkapan secara gratis.",
    "whoItServes": "Siapa saja — orang yang sedang sempit, orang yang sedang berbenah, dan lingkungan hidup.",
    "whatYoullNeed": "Sebuah ruang (pop-up pun bisa), meja atau rak gantung, penolong untuk memilah, dan jadwal yang rutin.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Bicaralah dulu dengan tuan rumah ruangnya soal kenyataan yang sejujurnya — tumpukan sumbangan, lalu-lalang orang, seperti apa ruangan itu keesokan paginya — lalu dengan toko barang bekas atau lembaga sosial terdekat soal apa yang sudah membanjiri mereka, supaya kamu tahu apa yang benar-benar kurang di lingkunganmu. Kalau bisa, habiskan satu jam di toko gratis yang sudah berjalan sebelum acara pertamamu; alur penerimaan dan penataan lebih mudah ditiru daripada diciptakan.",
    "commonPitfalls": "Toko gratis tenggelam sebelum sempat kelaparan: tanpa daftar boleh dan tidak yang tegas di pintu, para penolong menghabiskan tiap jam memilah sumbangan rusak dan kotor alih-alih menyambut orang. Dan putuskan ke mana sisa barang pergi sebelum acara pertama berakhir — tumpukan barang tak diambil tanpa rencana keluar adalah cara ruang tuan rumah hilang.",
    "pairsWith": [
      "repair-cafe",
      "library-of-things",
      "mutual-aid-moving-crew"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Pilih format dan ruangnya",
        "description": "Putuskan antara toko gratis tetap, pop-up berkala, atau tukar barang sehari. Pinjam aula, kios, atau pendopo taman. Tanggal yang berulang membangun kebiasaan.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Tetapkan standar sumbangan",
        "description": "Terima hanya barang bersih, berfungsi, dan layak pakai. Pasang daftar “boleh” dan “tidak” yang jelas (jangan elektronik rusak, jangan pakaian kotor, jangan perlengkapan bayi yang sudah ditarik dari peredaran). Ini menghemat waktu memilah luar biasa banyak.",
        "hours": 0.5,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Atur penerimaan dan pemilahan",
        "description": "Siapkan titik-titik kerja: terima, pilah per kategori, dan siapkan untuk dipajang. Punya rencana untuk barang yang tak terpakai (teruskan ke tempat lain atau daur ulang).",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Tata supaya orang bisa memilih dengan bermartabat",
        "description": "Gantung pakaian per ukuran, kelompokkan perabot rumah, jaga tetap rapi dan ramah. Tanpa formulir, tanpa bukti kekurangan — ambil saja yang akan kamu pakai.",
        "hours": 1.5,
        "skills": [
          "desain"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Isi acara dengan penolong",
        "description": "Bagi peran penyambut, pemilah, dan satu orang untuk pertanyaan. Nada yang ramah dan tidak menghakimi adalah intinya.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Urus sisa barang",
        "description": "Atur sejak awal ke mana barang tak diambil pergi setelah tiap acara (lembaga sosial mitra, daur ulang tekstil) supaya ruangnya kembali bersih.",
        "hours": 1,
        "skills": [
          "menyetir"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Berbagi keahlian dan kelas gratis",
    "purpose": "Membuat tetangga saling mengajar dan belajar secara gratis — memasak, memperbaiki barang, bahasa, mengatur uang, pertolongan pertama, keahlian digital.",
    "whoItServes": "Semua orang; terutama yang tidak sanggup membayar kelas berbayar dan mereka yang pengetahuannya jarang dihargai.",
    "whatYoullNeed": "Sebuah ruang, orang-orang yang mau mengajar, dan cara menyebarkan jadwal.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "Proyek ini dimulai dari obrolan dua pertanyaan, bukan dari tempatnya: tanyakan ke orang-orang apa yang bisa mereka ajarkan dan apa yang ingin sekali mereka pelajari, dan beri perhatian khusus ke tetangga yang pengetahuannya jarang dianggap keahlian. Tugas nyatamu yang pertama adalah menenangkan satu calon pengajar yang gugup sambil ngopi, meyakinkannya bahwa sesinya tidak harus berupa ceramah.",
    "commonPitfalls": "Berbagi keahlian meredup saat dua orang percaya diri yang itu-itu saja terus mengajar segalanya dan jadwal diam-diam menekuk mengikuti malam kosong para penggerak, bukan para peserta. Terus ajak pengajar baru, tanyakan siapa yang belum ada di ruangan, dan anggap sesi berisi lima orang sebagai keberhasilan — karena memang begitu.",
    "pairsWith": [
      "time-bank",
      "digital-literacy",
      "repair-cafe"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jajaki keahlian dan minat",
        "description": "Ajukan dua pertanyaan ke para anggota: apa yang bisa kamu ajarkan, dan apa yang ingin sekali kamu pelajari? Kumpulkan jawabannya lewat formulir sederhana. Irisannya adalah kurikulummu.",
        "hours": 1.5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Ajak dan siapkan pengajar",
        "description": "Yakinkan orang bahwa “mengajar” bisa santai saja. Bantu mereka menyusun kerangka sesi satu jam dan menyiapkan bahan. Pasangkan pemula yang gugup dengan pendamping.",
        "hours": 3,
        "skills": [
          "mengajar",
          "memandu diskusi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cari tempat dan waktunya",
        "description": "Pakai ruang perpustakaan, balai warga, taman, atau ruang tamu seseorang. Pilih jadwal berulang supaya jadi rutinitas.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Susun jadwal",
        "description": "Tulis daftar sesi dengan tanggal, topik, pengajar, dan apa yang perlu dibawa. Sebarkan di tempat yang sudah biasa dilihat anggota. Biarkan ikutnya ringan saja atau datang langsung.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Buat mudah diikuti semua orang",
        "description": "Pikirkan kebutuhan bahasa, penitipan anak, akses fisik, dan jam untuk orang yang bekerja. Tanyakan ke peserta apa yang akan membantu mereka datang.",
        "hours": 1.5,
        "skills": [
          "aksesibilitas",
          "menerjemahkan"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Patungan borongan bahan makanan",
    "purpose": "Menggabungkan pesanan untuk membeli makanan dan bahan pokok secara borongan dengan harga lebih murah.",
    "whoItServes": "Rumah tangga yang terjepit harga belanja, keluarga besar, dan lingkungan yang jauh dari sumber pangan.",
    "whatYoullNeed": "Kelompok rumah tangga yang berkomitmen, satu sumber grosir, tempat ambil dan pilah, dan seseorang yang memegang urusan pesanan.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Kumpulkan rumah tanggamu sebelum menelepon pemasok mana pun, dan bicarakan dulu soal uang yang canggung itu: berapa yang sanggup dijanjikan tiap orang, bagaimana pembayaran masuk sebelum pesanan dikirim, dan apa artinya melewatkan satu putaran. Menelepon kelompok belanja yang sudah berjalan — kebanyakan senang berbagi spreadsheet dan bekas lukanya — akan menghematmu semusim coba-coba.",
    "commonPitfalls": "Patungan belanja mati karena gesekan uang dan lelahnya koordinator: ada yang menalangi pakai uang sendiri lalu memendam kesal, ada pesanan yang tidak dibayar, atau satu orang diam-diam menjalankan tiap putaran sampai dia berhenti dan semuanya ikut berhenti. Kumpulkan pembayaran sebelum memesan tanpa kecuali, dan gilir peran koordinator mulai putaran kedua, bukan kapan-kapan.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Kumpulkan kelompok belanjamu",
        "description": "Ajak rumah tangga secukupnya untuk mencapai minimum pemasok (sering 8–15). Sepakati putaran belanja (mingguan, dua mingguan, atau bulanan).",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari pemasok",
        "description": "Hubungi grosir pangan, kelompok tani, pemasok rumah makan, atau kelompok belanja lain. Bandingkan pesanan minimum, opsi antar, dan harga. Pastikan bahan pokok apa saja yang mereka sediakan.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Siapkan cara memesan",
        "description": "Pakai spreadsheet atau formulir bersama tempat anggota mengisi jumlah sebelum tenggat. Tunjuk satu koordinator untuk menjumlahkan dan mengirim pesanan.",
        "hours": 3,
        "skills": [
          "input data",
          "koordinasi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Kelola uang dengan terbuka",
        "description": "Putuskan pembayaran di muka (kumpulkan sebelum memesan supaya tidak ada yang menalangi). Catat setiap rupiah di catatan keuangan bersama. Tambahkan sedikit cadangan opsional untuk tumpahan, bukan keuntungan.",
        "hours": 2,
        "skills": [
          "pembukuan"
        ]
      },
      {
        "name": "Atur pengantaran dan tempat memilah",
        "description": "Pilih tempat menerima kiriman borongan — garasi, aula, atau halaman. Jadwalkan cukup banyak tangan untuk hari bongkar muatan.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bagi pesanan dengan adil",
        "description": "Siapkan meja pemilahan dengan timbangan untuk biji-bijian dan hasil bumi curah. Cetak lebih dulu daftar tiap rumah tangga. Periksa ulang sebelum diambil.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Gilir pekerjaannya",
        "description": "Tugas koordinasi, memilah, dan pengambilan harus bergilir supaya tidak dipikul satu orang saja. Tinjau harga dan keandalan pemasok tiap putaran.",
        "hours": 1,
        "recurringCadence": "cycle",
        "skills": []
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Kafe Reparasi",
    "purpose": "Perbaiki barang rusak — pakaian, elektronik, sepeda, mebel — tanpa biaya, daripada dibuang begitu saja.",
    "whoItServes": "Siapa pun yang punya barang rusak tanpa uang atau keahlian untuk memperbaikinya; barang yang masih layak pakai tidak berakhir di TPA.",
    "whatYoullNeed": "Tetangga cekatan yang mau bantu, perkakas dasar, ruang dengan meja dan listrik, serta tanggal yang berulang.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Ajak dulu dua-tiga ahli reparasi pertamamu sebelum apa pun — tetangga yang bisa menjahit, si penggemar utak-atik sepeda — karena tanggal dan tempat tak ada artinya tanpa mereka. Lalu susuri tempatnya bersama mereka sambil membahas meja, listrik, dan cahaya, dan kalau ada kafe reparasi di kota tetangga, datangi satu sesinya; alur penerimaan barang adalah bagian yang paling layak ditiru.",
    "commonPitfalls": "Kafe reparasi diam-diam berubah jadi bengkel titip-servis gratisan: pengunjung meninggalkan barang lalu pergi, para ahli reparasi jadi teknisi tak dibayar, dan satu-satunya orang elektronik kelelahan duluan. Pegang teguh aturan bahwa pemilik menemani reparasi barangnya sendiri, dan tuliskan jelas-jelas bahwa sebagian barang tak bisa diselamatkan — kecewa yang diurus di awal lebih ringan daripada saling menyalahkan belakangan.",
    "pairsWith": [
      "tool-lending-library",
      "community-bike-workshop",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Ajak ahli reparasi per keahlian",
        "description": "Cari orang yang jago menjahit, elektronik kecil, sepeda, peralatan rumah tangga, dan pertukangan kayu. Cukup satu-dua orang per kategori untuk mulai.",
        "hours": 4,
        "skills": [
          "memperbaiki",
          "elektronik",
          "menjahit"
        ]
      },
      {
        "name": "Siapkan stasiun reparasi",
        "description": "Tiap stasiun butuh meja, perkakas yang pas, cahaya cukup, dan listrik. Kelompokkan reparasi yang mirip. Beri label stasiun yang jelas.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Tetapkan tanggal berulang",
        "description": "Sebulan sekali biasanya pas. Pilih tempat yang tetap — perpustakaan, makerspace, balai warga — supaya orang tahu ke mana membawa barangnya.",
        "hours": 1,
        "skills": []
      },
      {
        "name": "Buat alur penerimaan barang",
        "description": "Seorang penyambut mencatat tiap pengunjung dan barangnya, lalu mengarahkan ke ahli reparasi yang tepat. Tegaskan harapannya: pengunjung tinggal dan ikut membantu reparasi barangnya sendiri sebisanya; ini ruang belajar, bukan tempat titip barang.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Jaga keselamatan dan ekspektasi",
        "description": "Pasang tulisan bahwa sebagian barang tak bisa diselamatkan dan reparasi itu diupayakan, bukan dipastikan berhasil. Terapkan cara aman untuk barang listrik dan baterai. Sediakan kotak P3K di dekatmu.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Sediakan suku cadang dan bahan habis pakai",
        "description": "Simpan stok benang, sekring, lem, mur-baut, ban dalam, dan tambalan. Catat apa yang terpakai supaya bisa diisi ulang.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          0
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "rides-transportation",
    "name": "Antar-Jemput & Bantuan Transportasi",
    "purpose": "Antar tetangga ke jadwal berobat, belanja kebutuhan pokok, dan urusan penting lain saat angkutan umum dan uang jadi penghalang.",
    "whoItServes": "Orang tanpa kendaraan, tetangga difabel, para lansia, dan siapa pun yang tak terjangkau angkutan umum.",
    "whatYoullNeed": "Tetangga yang mau menyetir, cara menerima dan membagi permintaan antar-jemput, serta aturan dasar yang jelas soal keselamatan dan asuransi. Mengantar tetangga adalah tanggung jawab serius — pastikan SIM dan asuransi tiap pengemudi, periksa dulu siapa pun yang akan mengantar penumpang rentan, dan jangan pernah memakai antar-jemput sukarela sebagai pengganti ambulans dalam kegawatan medis.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Dua rangkaian obrolan mendahului perjalanan pertama: duduk bersama tiap calon pengemudi untuk memastikan SIM dan asuransinya sambil bicara jujur soal pemeriksaan latar belakang, dan bicaralah dengan orang-orang yang butuh tumpangan — juga posyandu lansia dan klinik yang mengenal mereka — soal tujuan, jam, dan kebutuhan mobilitas yang sebenarnya. Obrolan soal pemeriksaan lebih mudah dijadikan kebiasaan sejak awal daripada aturan yang dipaksakan belakangan.",
    "commonPitfalls": "Jaringan antar-jemput gagalnya di pembagian tugas, bukan di setiran: permintaan menumpuk di ponsel satu orang sampai orang itu kehabisan tenaga, dan dua pengemudi yang paling bisa diandalkan terus-terusan diminta sementara yang lain tak pernah dihubungi lagi setelah sekali menolak. Gilir peran koordinator, sebar permintaan dengan sengaja, dan jangan tunda urusan asuransi sampai setelah senggolan pertama.",
    "pairsWith": [
      "health-navigation",
      "community-bike-workshop",
      "court-support"
    ],
    "learnMore": [
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Ajak dan periksa pengemudi",
        "description": "Pastikan tiap pengemudi punya SIM yang masih berlaku, asuransi, dan kendaraan yang aman. Untuk mengantar orang rentan, minta referensi atau cek latar belakang sesuai kebiasaan setempat.",
        "hours": 5,
        "skills": [
          "menyetir"
        ]
      },
      {
        "name": "Bereskan urusan asuransi dan tanggung jawab",
        "description": "Cek apa saja yang dicakup asuransi pribadi tiap pengemudi untuk menyetir sukarela. Pertimbangkan surat pernyataan sederhana dan tanyakan ke lembaga bantuan hukum setempat — ini melindungi semua orang.",
        "hours": 4,
        "skills": [
          "urusan berkas"
        ]
      },
      {
        "name": "Siapkan sistem permintaan",
        "description": "Pilih satu saluran untuk permintaan antar-jemput (jalur telepon, form isian, grup chat) dengan tenggat pengajuan (mis. 48 jam). Catat jam jemput, lokasi, kebutuhan mobilitas, dan info kontak.",
        "hours": 2,
        "skills": [
          "koordinasi",
          "teknologi"
        ]
      },
      {
        "name": "Bangun rutinitas pembagian antaran",
        "description": "Minta satu koordinator (bergiliran) menjodohkan permintaan dengan pengemudi yang ada dan memastikan ke kedua pihak sehari sebelumnya. Simpan daftar pengemudi cadangan untuk pembatalan.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Tentukan apa saja yang tercakup",
        "description": "Sepakati perjalanan mana yang bisa diambil (berobat, belanja kebutuhan, urusan penting) dan wilayah jangkauanmu. Jelaskan soal waktu tunggu dan apakah pengemudi membantu membawa belanjaan.",
        "hours": 1,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Atur biayanya",
        "description": "Sepakati cara menutup bensin — kas kecil bersama, urunan sukarela penumpang, atau tidak sama sekali. Buat transparan dan jangan sampai jadi penghalang bagi penumpang.",
        "hours": 2,
        "follows": [
          4
        ],
        "skills": []
      },
      {
        "name": "Jaga penumpang dan pengemudi tetap aman",
        "description": "Sepakati kebiasaannya: pengemudi tak masuk rumah sendirian, tak ada urusan uang di luar biaya yang disepakati, dan ada kabar susulan setelah mengantar orang rentan. Catat tiap perjalanan.",
        "hours": 2,
        "follows": [
          0
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Serikat Penyewa & Jaringan Pembelaan dari Pengusiran",
    "purpose": "Organisir para penyewa untuk membela diri dari pengusiran, hunian tak layak, dan kenaikan sewa semena-mena lewat aksi bersama.",
    "whoItServes": "Para penyewa, terutama di bangunan dengan pemilik yang abai atau tak pernah muncul, dan siapa pun yang terancam diusir.",
    "whatYoullNeed": "Kelompok inti penggerak, info hak penyewa setempat yang akurat, hubungan dengan lembaga bantuan hukum, dan sistem kontak yang cepat. Proyek ini mendukung penyewa dan membagikan informasi hukum publik; ia tidak menggantikan nasihat hukum. Selalu arahkan kasus perorangan ke bantuan hukum yang berkompeten sebelum tenggat.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Bicaralah dengan penyewa yang terdampak sebelum kontak apa pun dengan pemilik, kapan pun juga — ketuk pintu, dengarkan apa yang sebenarnya ditakutkan dan diinginkan orang, dan biarkan penyewa di tiap bangunan menentukan temponya, karena merekalah yang menanggung risiko pembalasan, bukan para penggerak. Sambil jalan, kenalkan dirimu ke lembaga bantuan hukum setempat sejak awal; hubungan itu perlu ada sebelum surat pengusiran pertama datang, bukan sesudahnya.",
    "commonPitfalls": "Serikat penyewa justru melukai orang ketika bergerak lebih cepat dari penyewanya sendiri: konfrontasi yang diluncurkan sebelum satu bangunan siap membuat tetangga paling rentan kena pembalasan yang tak pernah mereka setujui. Kegagalan yang lebih senyap adalah tergelincir memberi nasihat hukum alih-alih informasi hukum — arahkan kasus perorangan ke bantuan hukum yang berkompeten sebelum tenggat, setiap kali.",
    "pairsWith": [
      "legal-aid-clinic",
      "mutual-aid-moving-crew",
      "solidarity-fund"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Bentuk komite inti penggerak",
        "description": "Cari 3–6 penyewa berkomitmen sebagai jangkar kerja ini. Cari orang yang dihormati di bangunannya. Sepakati peran, ritme pertemuan, dan tujuan bersama.",
        "hours": 5,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Petakan bangunan dan masalah penyewanya",
        "description": "Ketuk pintu atau adakan survei untuk tahu bangunan mana yang bermasalah dan apa masalahnya (perbaikan diabaikan, pungutan liar, intimidasi). Catat polanya dan temukan tokoh alami di tiap bangunan.",
        "hours": 8,
        "skills": [
          "menjangkau warga",
          "wawancara"
        ]
      },
      {
        "name": "Kumpulkan info hak penyewa setempat yang akurat",
        "description": "Rangkum aturan yang benar-benar berlaku di daerahmu soal masa pemberitahuan pengusiran, perbaikan, deposit, dan aturan sewa. Gandeng lembaga bantuan hukum untuk memeriksanya. Ini informasi bersama, bukan nasihat hukum — tegaskan itu ke para anggota.",
        "hours": 4,
        "skills": [
          "urusan berkas",
          "menulis"
        ]
      },
      {
        "name": "Bangun sistem kontak tanggap cepat",
        "description": "Siapkan rantai kontak atau grup chat supaya penyewa yang menerima surat pengusiran atau digembok pemilik bisa cepat menghubungi serikat. Tentukan siapa yang merespons dan seberapa cepat.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "bantuan teknis"
        ]
      },
      {
        "name": "Adakan kelas kenali-hakmu",
        "description": "Gelar satu sesi (idealnya bersama mitra bantuan hukum) yang memandu penyewa memahami haknya dan apa yang harus dilakukan bila menerima surat panggilan. Sediakan panduan cetak untuk dibawa pulang dalam bahasa-bahasa yang dipakai warga.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "mengajar",
          "memandu diskusi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Susun protokol tanggap pengusiran",
        "description": "Tulis langkah sederhana saat seseorang terancam diusir: dokumentasikan semuanya, hubungi bantuan hukum sebelum tenggat, galang dukungan tetangga, dan jangan pernah abaikan jadwal sidang.",
        "hours": 3,
        "skills": [
          "menulis"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Jalin hubungan dengan bantuan hukum dan dukungan lanjutan",
        "description": "Bangun hubungan rujukan dengan pengacara penyewa, lembaga bantuan hukum, dan pendamping perumahan supaya serikat bisa mengoper kasus yang butuh penanganan profesional. Jaga kontak tetap mutakhir.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Kolektif Jaga Anak",
    "purpose": "Berbagi pengasuhan anak yang terpercaya antarkeluarga supaya orang tua bisa bekerja, beristirahat, atau mengurus keadaan mendesak tanpa membayar.",
    "whoItServes": "Orang tua dan pengasuh, terutama orang tua tunggal, pekerja dengan jam kerja tak menentu, dan keluarga berpenghasilan pas-pasan.",
    "whatYoullNeed": "Sekelompok keluarga yang sudah saling diperiksa, ruang yang aman (atau rumah bergantian), sistem penjadwalan, dan aturan keselamatan yang jelas. Mengasuh anak orang lain adalah tanggung jawab serius — pegang teguh aturan pengawasan, periksa para pengasuh, dan ikuti aturan setempat soal pengasuhan anak informal.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Proyek ini dibangun di ruang keluarga sebelum di mana pun: kumpulkan keluarga-keluarga pendiri dan bahas hal-hal spesifik yang tak nyaman — pemeriksaan, pengawasan, gaya mendisiplinkan, apa yang terjadi kalau ada anak terluka — sebelum siapa pun menjadwalkan satu jam pengasuhan pun. Cek aturan setempat soal pengasuhan anak informal di masa awal yang sama, supaya model yang kalian sepakati memang bisa dijalankan.",
    "commonPitfalls": "Dua hal yang diam-diam merusak kolektif jaga anak: jam yang timpang, saat keluarga yang itu-itu saja terus jadi tuan rumah sampai memendam kesal, dan aturan keselamatan yang mengendur begitu semua mulai merasa nyaman — pengecualian sekali-ini-saja atas aturan tidak-pernah-sendirian persis di situlah kepercayaan hancur. Catat jamnya secara terbuka dan terapkan aturan keselamatan paling ketat justru pada keluarga yang paling kamu kenal.",
    "pairsWith": [
      "toy-library",
      "time-bank",
      "youth-mentorship"
    ],
    "learnMore": [
      "what-is-balance"
    ],
    "tasks": [
      {
        "name": "Kumpulkan keluarga pendiri dan sepakati model",
        "description": "Ajak keluarga-keluarga yang saling kenal atau bisa saling membangun percaya. Putuskan modelnya: jaga anak bergantian di mana orang tua mengumpulkan dan memakai jam rawat, atau pengasuhan kelompok terjadwal.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "memandu diskusi"
        ]
      },
      {
        "name": "Tetapkan standar keselamatan dan pemeriksaan",
        "description": "Sepakati pemeriksaan bagi siapa pun yang mengasuh: referensi, cek latar belakang bila pas, dan aturan tegas bahwa tak ada satu orang dewasa pun berduaan tanpa pengawasan dengan anak keluarga lain. Tetapkan rasio orang dewasa terhadap anak.",
        "hours": 6,
        "skills": [
          "mengasuh anak"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cari ruang dan amankan untuk anak",
        "description": "Pilih satu tempat atau tetapkan standar untuk rumah tuan rumah. Periksa bahayanya, tutup stopkontak, kokohkan perabot berat, kunci obat dan bahan kimia, dan pastikan area luar yang aman bila dipakai.",
        "hours": 4,
        "skills": [
          "mengasuh anak",
          "perbaikan rumah"
        ]
      },
      {
        "name": "Buat sistem jadwal dan catatan jam",
        "description": "Pakai kalender bersama atau aplikasi khusus. Dalam model jam rawat, satu jam mengasuh berarti satu jam yang kelak bisa kamu pakai. Catat siapa jadi tuan rumah kapan supaya bebannya tetap adil.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "input data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Susun aturan kesehatan, alergi, dan darurat",
        "description": "Kumpulkan info alergi, obat-obatan, kontak darurat, dan siapa saja yang boleh menjemput tiap anak. Tulis aturan anak-sakit yang jelas dan langkah saat ada kegawatan medis.",
        "hours": 3,
        "skills": [
          "urusan berkas",
          "menulis"
        ]
      },
      {
        "name": "Latih pengasuh soal dasar-dasarnya",
        "description": "Bahas pengawasan, tidur aman untuk bayi, penanganan alergi dan kegawatan, serta aturan keselamatan. Upayakan minimal satu orang dewasa bersertifikat pertolongan pertama anak/CPR di tiap sesi.",
        "hours": 5,
        "skills": [
          "mengajar",
          "pertolongan pertama"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Jalankan sesi uji coba dan kumpulkan masukan",
        "description": "Adakan uji coba singkat dengan beberapa keluarga, lalu evaluasi bersama. Perbaiki yang belum jalan sebelum diperbesar. Saling cek kabar secara rutin supaya kepercayaan dan keselamatan tetap kuat.",
        "hours": 3,
        "skills": [
          "mengasuh anak"
        ],
        "follows": [
          2,
          5
        ]
      }
    ]
  },
  {
    "id": "community-composting",
    "name": "Kompos Komunitas",
    "purpose": "Kumpulkan sisa dapur supaya sampah tak berakhir di TPA dan jadi kompos gratis untuk kebun-kebun sekitar.",
    "whoItServes": "Rumah tangga yang tak punya cara mengompos, kebun komunitas, dan lingkungan sekitar.",
    "whatYoullNeed": "Lahan kompos, wadah pengumpul, peralatan dasar, dan jadwal rawat bergiliran yang kecil.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Bicaralah dengan tuan rumah lahan dan tetangga yang masih kecium baunya sebelum wadah pertama datang — takut bau dan tikus itulah yang mematikan lahan kompos, dan obrolan jujur di awal meredakannya lebih ampuh daripada selebaran mana pun. Lalu temukan calon rumah bagi komposmu (kebun komunitas yang menginginkannya) dan setidaknya satu orang yang pernah benar-benar menjaga tumpukan panas tetap hidup; pertimbangan merekalah yang menentukan metode pilihanmu.",
    "commonPitfalls": "Proyek kompos mati saat tak ada yang merasa memiliki urusan membalik: tumpukan mandek atau mulai bau, tetangga mengeluh, dan tuan rumah menarik izinnya — rantai itu bergerak lebih cepat dari dugaanmu. Sesuaikan banyaknya sisa dapur yang kamu kumpulkan dengan yang sanggup diolah giliran rawatmu, dan perlakukan satu adonan terkontaminasi sebagai masalah papan tanda yang harus dibenahi, bukan orang yang harus disalahkan.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Cari lahan kompos",
        "description": "Amankan tempat yang lapang dan cukup kena matahari — pojok kebun komunitas, lahan kosong, atau pekarangan yang rela. Pastikan izinnya dan cek aturan setempat soal mengompos.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Pilih metode mengompos",
        "description": "Pilih yang pas dengan skalamu: sistem tiga kotak kompos panas, komposter putar, atau kotak cacing. Sesuaikan metode dengan banyaknya bahan yang kamu perkirakan dan seberapa sering kamu sanggup membalik.",
        "hours": 3,
        "skills": [
          "mengompos"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cari wadah dan peralatan",
        "description": "Buat atau beli wadah pengumpul dan kotak komposnya. Siapkan garpu kompos, termometer, dan bahan cokelat (daun kering, kardus) untuk mengimbangi sisa dapur.",
        "hours": 4,
        "skills": [
          "pertukangan",
          "menyetir"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Susun sistem pengumpulan",
        "description": "Tentukan cara sisa dapur datang: wadah setor dengan jam tertentu, atau rute jemput bergiliran. Bagikan ember dapur kecil ke peserta beserta jadwal setor yang jelas.",
        "hours": 4,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Perjelas apa yang diterima",
        "description": "Pasang daftar boleh/tidak yang sederhana (boleh: buah, sayur, ampas kopi, cangkang telur; tidak: daging, susu, minyak, kotoran hewan). Papan tanda yang jelas mencegah kontaminasi yang merusak satu adonan.",
        "hours": 2,
        "skills": [
          "menulis",
          "menerjemahkan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ajak dan latih tim rawat bergiliran",
        "description": "Kompos butuh dibalik rutin, dicek kelembapannya, dan diimbangi bahan hijau dan cokelatnya. Susun jadwal bersama dan ajarkan dasar-dasarnya supaya tumpukan tak bau atau mandek.",
        "hours": 3,
        "skills": [
          "mengompos",
          "mengajar"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Bagikan kompos jadi",
        "description": "Begitu kompos siap, bagikan gratis ke para penyetor dan kebun komunitas. Umumkan hari pengambilan dan bawa kantong atau ember.",
        "hours": 2,
        "skills": [
          "menyetir"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Perpustakaan Mini & Tukar Buku",
    "purpose": "Sediakan buku gratis 24 jam nonstop untuk menumbuhkan kebiasaan membaca dan berbagi, tanpa kartu anggota atau biaya.",
    "whoItServes": "Anak-anak, keluarga, dan pembaca segala umur, terutama di lingkungan yang aksesnya ke buku terbatas.",
    "whatYoullNeed": "Kotak buku tahan hujan, koleksi awal, tempat menumpang, dan perawatan ringan.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Mulai dengan dua obrolan pendek: satu dengan pemilik tembok atau halaman yang akan ditumpangi kotaknya, soal penempatan dan apa jadinya kalau kotak mulai kumal, dan satu lagi dengan keluarga serta sekolah terdekat soal buku apa yang benar-benar akan mereka bawa pulang. Pastikan dulu siapa yang akan merawatnya — orang yang mengeceknya tiap minggu — sebelum kotaknya berdiri, bukan sesudahnya.",
    "commonPitfalls": "Perpustakaan mini tidak mati karena kekurangan buku — ia mati karena buku yang keliru: ada yang menurunkan sekardus buku pelajaran usang, judul-judul bagus tertimbun, air hujan masuk, dan orang diam-diam berhenti menengok. Kunjungan lima menit seminggu dari si perawat kotak mencegah hampir semuanya; kotak ini lebih butuh satu orang daripada butuh sumbangan.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Buat atau cari kotak buku tahan hujan",
        "description": "Buat atau beli kotak kokoh dan kedap air di atas tiang atau tembok. Lemari bekas atau kotak koran bekas juga bisa. Pasang pintu bening dan atap miring supaya buku tetap kering.",
        "hours": 4,
        "skills": [
          "pertukangan"
        ]
      },
      {
        "name": "Pilih dan siapkan lokasinya",
        "description": "Pilih titik yang ramai dilewati orang dan sudah dapat izin — halaman rumahmu sendiri, balai warga, atau pinggir taman. Tanam kotaknya kokoh-kokoh dan pastikan memang boleh.",
        "hours": 1,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Isi koleksi awalnya",
        "description": "Kumpulkan buku sumbangan lewat ajakan kecil. Usahakan campuran: buku anak, fiksi populer, dan nonfiksi praktis. Mulai setengah penuh supaya masih ada ruang menambah.",
        "hours": 1.5,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Pasang papan tanda dan aturan sederhana",
        "description": "Tulis “Ambil satu buku, tinggalkan satu buku — semuanya gratis.” Buat yang ramah dan minim aturan. Tambahkan catatan yang menyambut segala umur dan bahasa.",
        "hours": 0.5,
        "skills": [
          "menulis"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Cari orang yang mau merawatnya",
        "description": "Minta seseorang di dekat situ mengecek kotaknya tiap minggu: merapikan, menyingkirkan yang rusak atau tak pantas, dan menyeimbangkan isinya. Lima menit seminggu cukup menjaganya sehat.",
        "hours": 0.5,
        "skills": [
          "menjangkau warga"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Pelatihan Pertolongan Pertama & Penanganan Overdosis",
    "purpose": "Latih para tetangga dalam pertolongan pertama, CPR, dan penanganan overdosis supaya komunitas bisa bertindak di menit-menit sebelum petugas tiba.",
    "whoItServes": "Semua orang; dampaknya paling terasa di tempat yang ambulansnya lama datang atau angka overdosisnya tinggi.",
    "whatYoullNeed": "Pelatih bersertifikat, perlengkapan, ruang, dan jadwal berulang. Semua pelatihan medis harus dibawakan instruktur bersertifikat; proyek ini mengorganisir dan menjadi tuan rumah pelatihan itu, bukan menggantikannya.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Obrolan pertamamu adalah dengan orang-orang yang akan benar-benar mengajar — Palang Merah setempat, dinas kesehatan, atau kelompok pengurangan dampak buruk. Tanyakan apa yang mereka butuhkan dari tuan rumah dan tanggal mana yang bisa mereka tawarkan, lalu bicaralah dengan orang-orang yang paling mungkin menyaksikan kegawatan — keluarga dari orang yang memakai narkoba, pegawai usaha di sekitar — supaya sesi-sesi pertama dibangun di sekitar mereka.",
    "commonPitfalls": "Proyek ini meredup saat cuma jadi satu acara pelatihan besar yang tak pernah diulang — keterampilan tumpul dan nalokson kedaluwarsa tanpa ada yang sadar. Dan tahan keinginan mengajarkan materi medisnya sendiri; tugasmu menjadi tuan rumah bagi instruktur bersertifikat, bukan menggantikan mereka.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Gandeng pelatih bersertifikat",
        "description": "Hubungi instruktur yang berkompeten — Palang Merah, dinas kesehatan setempat, atau organisasi pengurangan dampak buruk. Merekalah yang membawakan pelatihan medisnya; peranmu mengorganisir dan menjadi tuan rumah.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari perlengkapan",
        "description": "Siapkan kotak P3K, manekin latihan CPR (sering dipinjamkan pelatih), dan nalokson. Banyak program kesehatan publik membagikan nalokson gratis — tanyakan ke dinas kesehatan atau kelompok pengurangan dampak buruk.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Cari ruang dan jadwalkan sesi",
        "description": "Pesan ruangan yang muat untuk praktik langsung — balai warga, perpustakaan, atau klinik. Tetapkan tanggal berulang supaya orang bisa mengaturnya di sela kerja.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Ajak peserta",
        "description": "Sebarkan info sesinya seluas-luasnya dan utamakan orang yang paling mungkin menyaksikan kegawatan. Buat cara ikutnya mudah dan tanpa biaya, dan sediakan pilihan jam beragam untuk yang jam kerjanya tak menentu.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Jalankan sesi pelatihan",
        "description": "Jadilah tuan rumah sesi yang dibawakan pelatih, urus persiapan dan penyambutan, dan pastikan semua orang dapat praktik langsung. Sediakan kartu panduan untuk dibawa pulang.",
        "hours": 4,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Bagikan kit dan jadwalkan penyegaran",
        "description": "Bekali yang sudah terlatih dengan kotak P3K dan nalokson bila tersedia. Jadwalkan penyegaran berkala supaya keterampilan tetap tajam.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          4
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "time-bank",
    "name": "Bank Waktu",
    "purpose": "Biarkan anggota saling bertukar bantuan dihitung dengan waktu — satu jam memberi setara satu jam menerima — dan sumbangsih tiap orang dihargai sama.",
    "whoItServes": "Siapa saja, terutama orang yang kaya waktu dan keahlian tapi tipis uang.",
    "whatYoullNeed": "Daftar anggota, sistem pencatatan, seorang koordinator, dan aturan yang disepakati.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Mulailah dengan obrolan, bukan perangkat lunak: duduklah bersama sepuluh-lima belas tetangga dan tanyai satu per satu apa yang mau mereka tawarkan dan apa yang mau mereka minta. Kalau obrolan itu belum memunculkan keragaman — antar-jemput, les, reparasi, memasak — teruslah mengajak orang sebelum membangun sistemnya.",
    "commonPitfalls": "Bank waktu jarang mati karena skandal; ia mati karena sunyi — orang bergabung, tak ada yang membuat permintaan pertama, lalu semuanya hening. Minta seorang koordinator aktif menjodohkan pertukaran di bulan-bulan pertama, dan pegang garis satu-jam-sama-dengan-satu-jam: begitu kalian berdebat apakah jam tukang ledeng lebih tinggi dari jam penjaga anak, ia berhenti jadi bank waktu.",
    "pairsWith": [
      "skill-share",
      "childcare-collective"
    ],
    "learnMore": [
      "what-is-balance",
      "negative-balance"
    ],
    "tasks": [
      {
        "name": "Ajak anggota pendiri dan data keahlian mereka",
        "description": "Kumpulkan kelompok awal dan tanyai masing-masing apa yang bisa ditawarkan (antar-jemput, les, reparasi, memasak, berkebun) dan apa yang dibutuhkan. Keragaman tawaran itulah yang membuatnya jalan.",
        "hours": 5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Pilih sistem pencatatan",
        "description": "Pilih cara mencatat jam: perangkat lunak khusus bank waktu, spreadsheet bersama, atau buku catatan sederhana. Yang penting tercatat siapa memberi dan siapa menerima jam.",
        "hours": 4,
        "skills": [
          "bantuan teknis",
          "input data"
        ]
      },
      {
        "name": "Tetapkan aturannya",
        "description": "Sepakati prinsip intinya (satu jam ya satu jam, apa pun tugasnya), cara anggota meminta dan mengonfirmasi pertukaran, dan apa yang terjadi bila jam seseorang menipis jauh.",
        "hours": 4,
        "skills": [
          "memandu diskusi",
          "menulis"
        ]
      },
      {
        "name": "Sambut anggota baru",
        "description": "Adakan orientasi singkat supaya orang paham filosofi dan sistemnya. Beri setiap orang beberapa jam awal supaya pertukaran bisa langsung dimulai.",
        "hours": 4,
        "skills": [
          "mengajar"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Buat direktori tawaran bantuan",
        "description": "Susun daftar yang mudah dicari tentang siapa menawarkan apa. Jaga tetap mutakhir supaya anggota bisa menemukan bantuan tanpa sedikit-sedikit bertanya ke koordinator.",
        "hours": 4,
        "skills": [
          "input data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Koordinasikan dan jodohkan pertukaran",
        "description": "Minta koordinator membantu menjodohkan kebutuhan dengan tawaran, terutama di awal, dan menyapa anggota yang diam. Lama-lama anggota terhubung langsung.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Bangun kebiasaan percaya dan aman",
        "description": "Sepakati kebiasaan untuk pertukaran yang melibatkan rumah atau anggota rentan (referensi, tak bertemu berdua saja bila tak nyaman). Tambahkan cara sederhana menandai masalah.",
        "hours": 4,
        "skills": [
          "memandu diskusi"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Dana solidaritas (bantuan tunai tolong-menolong)",
    "purpose": "Kumpulkan uang bersama untuk memberi bantuan tunai langsung, tanpa syarat, kepada tetangga yang sedang dilanda krisis.",
    "whoItServes": "Orang-orang yang tertimpa keadaan darurat — kekurangan uang sewa, biaya berobat, listrik terancam diputus.",
    "whatYoullNeed": "Sistem uang yang transparan, tim kecil terpercaya yang merawat dana, rencana penggalangan dana, dan kriteria yang jelas. Memegang uang bersama membawa tanggung jawab nyata — pakai persetujuan dua orang untuk tiap pengeluaran, jaga catatan tetap rapi, lindungi privasi penerima, dan cari nasihat soal sisi hukum dan pajak danamu.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Sebelum mengumpulkan satu rupiah pun, duduklah bersama beberapa orang yang kamu percaya memegang uang bersama dan bicaralah jujur: bagaimana persetujuan dua orang akan berjalan, apa saja yang diumumkan terbuka, dan apa yang terjadi kalau permintaan melebihi isi dana. Lalu cari lembaga nirlaba setempat atau akuntan yang bisa menemanimu memahami sisi hukum dan pajaknya sebelum rekening dibuka.",
    "commonPitfalls": "Uang merusak kepercayaan lebih cepat daripada apa pun — satu pengeluaran tanpa penjelasan atau catatan yang berantakan bisa mengakhiri dana ini bahkan saat tidak ada yang berbuat salah. Dan permintaan hampir selalu lebih banyak daripada uangnya; kalau kriterianya tidak disepakati sejak awal, menolak kasus demi kasus akan menguras tenaga tim dan menanam rasa kesal.",
    "pairsWith": [
      "resource-hub-dispatch",
      "tenant-union",
      "free-tax-prep"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Bentuk tim kecil yang merawat dana",
        "description": "Ajak beberapa orang terpercaya untuk mengurus dana. Perjelas peran masing-masing dan berkomitmenlah pada keterbukaan sejak hari pertama — di sini kepercayaan adalah segalanya.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Atur penanganan uang yang transparan",
        "description": "Buka rekening khusus atau menumpang ke lembaga nirlaba sebagai payung resmi. Wajibkan dua orang menyetujui setiap pengeluaran, jaga catatan keuangan tetap jelas, dan periksa apakah bentuk danamu punya urusan pajak atau hukum — tanyakan ke lembaga nirlaba setempat atau akuntan.",
        "hours": 5,
        "skills": [
          "pembukuan",
          "urusan berkas"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Sepakati kriteria meminta dan menyalurkan dana",
        "description": "Putuskan siapa yang bisa meminta, besaran yang wajar, seberapa sering seseorang boleh meminta, dan apakah urutannya siapa cepat atau menimbang kebutuhan. Jaga syarat tetap ringan dan sebisa mungkin jangan minta bukti kesusahan.",
        "hours": 4,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Buat formulir permintaan yang sederhana dan ringan syarat",
        "description": "Susun formulir singkat dan privat yang hanya menanyakan hal-hal yang perlu. Sediakan beberapa cara meminta (online, telepon, datang langsung) dan lindungi privasi yang mengisi.",
        "hours": 2,
        "skills": [
          "menulis"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Mulai penggalangan dana",
        "description": "Padukan sumbangan kecil rutin dari anggota dengan penggalangan sesekali. Jelaskan terus terang ke para penyumbang: uangnya langsung ke tetangga yang sedang kesusahan.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Susun alur keputusan dan penyaluran",
        "description": "Tetapkan janji waktu jawaban, tinjauan cepat oleh tim, dan cara penyaluran yang cepat sampai. Dalam krisis, kecepatan itu penting. Catat tiap keputusan dengan sederhana.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Kabarkan hasilnya secara terbuka",
        "description": "Bagikan ringkasan berkala — uang masuk, uang keluar, jumlah tetangga yang terbantu — tanpa membuka identitas penerima. Keterbukaan membuat penyumbang terus memberi.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "menulis",
          "pembukuan"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Bank popok dan perlengkapan kebersihan",
    "purpose": "Bagikan gratis popok, pembalut, dan perlengkapan kebersihan — barang-barang yang tak bisa dibeli dengan kebanyakan bantuan pangan.",
    "whoItServes": "Keluarga berpenghasilan rendah, bayi, orang yang haid, dan tetangga yang tak punya tempat tinggal.",
    "whatYoullNeed": "Tempat penyimpanan, aliran pasokan, titik pembagian, dan para penolong.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Bicara dulu dengan orang-orang yang sehari-hari bertemu keluarga-keluarga itu — klinik anak, pos sembako, rumah ibadah — dan tanyakan ukuran serta barang apa yang benar-benar sering habis, juga apakah mereka mau menjadi tuan rumah pembagian. Satu obrolan itu menghematmu dari berbulan-bulan menebak-nebak.",
    "commonPitfalls": "Yang paling menyakitkan adalah ketidakpastian: satu penggalangan besar, rak penuh, lalu berbulan-bulan kosong justru saat keluarga mulai mengandalkanmu. Perhatikan juga stok yang sebenarnya — ukuran bayi baru lahir menumpuk sementara ukuran besar habis — dan jangan pernah minta bukti kebutuhan; martabat adalah bagian dari bantuan itu sendiri.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Cari tempat simpan dan titik pembagian",
        "description": "Amankan gudang kecil yang kering dan terkunci serta tempat menyerahkan barang — lemari di klinik, rumah ibadah, atau balai warga. Titik pembagiannya harus terasa privat dan bermartabat.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Atur sumber pasokan",
        "description": "Padukan beli borongan, penggalangan sumbangan, dan hubungan dengan jaringan bank popok atau grosir. Catat sumber mana yang stabil supaya stok tidak pernah kosong.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Pilah dan data stok per ukuran dan jenis",
        "description": "Susun popok per ukuran, plus pembalut dan perlengkapan kebersihan. Jaga hitungan berjalan supaya tahu apa yang perlu diminta. Ukuran untuk bayi yang lebih besar sering kurang.",
        "hours": 1.5,
        "skills": [
          "koordinasi",
          "input data"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Sepakati aturan pembagian yang adil",
        "description": "Putuskan berapa banyak untuk tiap keluarga dan seberapa sering, tanpa syarat bukti kebutuhan. Buat pola yang bisa ditebak supaya orang bisa mengandalkannya.",
        "hours": 1,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Jadwalkan pembagian dan siapkan orangnya",
        "description": "Tetapkan hari pembagian yang rutin, ajak para penolong untuk membagikan barang, dan jaga suasananya hangat tanpa menghakimi.",
        "hours": 2.5,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-bike-workshop",
    "name": "Bengkel sepeda komunitas",
    "purpose": "Sediakan ruang, alat, dan bantuan gratis untuk memperbaiki, merakit, dan memperoleh sepeda, supaya transportasi jadi terjangkau untuk semua.",
    "whoItServes": "Orang tanpa kendaraan, anak muda, pekerja yang pulang-pergi, dan siapa pun yang butuh transportasi murah.",
    "whatYoullNeed": "Sebuah ruang, alat-alat, sepeda dan onderdil sumbangan, serta montir yang mau membantu.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Sebelum berburu ruang, bicaralah dengan orang-orang yang akan memakai bengkel ini dan para montir yang akan mengajar — dan kalau ada bengkel sepeda komunitas di kota terdekat, kunjungi dan tanyakan apa yang akan mereka lakukan berbeda. Dengan tuan rumah tempatnya, bereskan soal penyimpanan, akses, dan asuransi sejak awal.",
    "commonPitfalls": "Bengkel ini mati saat para penolong memperbaiki sepeda alih-alih mengajari orang memperbaikinya: ia berubah jadi bengkel reparasi gratis, antrean memanjang, dan montirmu kehabisan tenaga. Hati-hati juga tenggelam dalam sumbangan sepeda rongsok — pilah tanpa ampun — dan jangan pernah biarkan sepeda keluar tanpa pemeriksaan keselamatan rem dan ban.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Cari ruang bengkel",
        "description": "Amankan garasi, ruang bawah, kontainer, atau ruang bersama warga yang cukup untuk bekerja dan menyimpan sepeda. Pastikan soal akses dan kebutuhan asuransinya.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Kumpulkan alat dan stand reparasi",
        "description": "Kumpulkan perkakas dasar sepeda dan setidaknya satu stand reparasi lewat sumbangan atau anggaran kecil. Tata alat supaya mudah dicari dan dikembalikan.",
        "hours": 5,
        "skills": [
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kumpulkan sepeda dan onderdil sumbangan",
        "description": "Sebar ajakan menyumbang sepeda tak terpakai dan onderdil yang masih layak. Pilah menjadi “bisa diperbaiki”, “untuk onderdil”, dan “siap jalan”. Timbunan onderdil itulah yang membuat bengkel terus hidup.",
        "hours": 4,
        "skills": [
          "memperbaiki",
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ajak montir yang mau membantu",
        "description": "Cari beberapa orang yang bisa memperbaiki sepeda dan, lebih penting lagi, bisa mengajari orang lain. Tujuannya membantu orang belajar memperbaiki sepedanya sendiri, bukan mengerjakannya untuk mereka.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Tetapkan jam buka dan program rakit-bawa-pulang",
        "description": "Pilih jam buka yang gampang diingat. Pertimbangkan program rakit-bawa-pulang: seseorang belajar memperbaiki selama beberapa sesi dan pulang membawa sepeda yang ia perbaiki sendiri.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Bangun kebiasaan keselamatan",
        "description": "Wajibkan kacamata pelindung, buat aturan pakai alat, dan sediakan kotak P3K. Selalu lakukan pemeriksaan keselamatan (rem, ban, headset) sebelum sepeda mana pun keluar.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Jaringan bantuan pendatang baru dan penerjemahan",
    "purpose": "Bantu para imigran dan pengungsi menapak di tempat baru — penerjemahan, urusan berkas, orientasi, dan sambungan ke komunitas.",
    "whoItServes": "Imigran dan pengungsi yang baru tiba, serta tetangga yang belum lancar bahasa setempat.",
    "whatYoullNeed": "Penolong dwibahasa, organisasi mitra, bahan orientasi, dan sistem permintaan. Ekstra hati-hati soal privasi: jangan kumpulkan status imigrasi, arahkan semua pertanyaan hukum ke pengacara imigrasi yang berkompeten, dan biarkan warga komunitasnya sendiri yang menentukan bantuan seperti apa yang mereka mau.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Mulailah dengan berbicara langsung dengan komunitas pendatang dan organisasi yang sudah mendampingi mereka — biarkan mereka yang mengatakan bantuan apa yang diinginkan, bukan kamu yang merancangkannya. Dan sebelum permintaan pertama datang, siapkan jalur serah terimamu: pengacara imigrasi berkompeten tempat mengarahkan setiap pertanyaan hukum.",
    "commonPitfalls": "Risiko paling serius adalah penolong yang berniat baik tergelincir dari menerjemahkan menjadi memberi nasihat hukum atau medis yang bukan keahliannya — arahan imigrasi yang keliru bisa berharga sangat mahal bagi seseorang. Dan kumpulkan data sesedikit mungkin: satu catatan ceroboh tentang status seseorang bisa menempatkannya dalam bahaya sungguhan.",
    "pairsWith": [
      "welcome-wagon",
      "legal-aid-clinic",
      "health-navigation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Ajak penolong dwibahasa dan multibahasa",
        "description": "Cari orang-orang yang menguasai bahasa-bahasa yang umum di daerahmu dan bisa membantu penerjemahan, pengisian berkas, dan pendampingan. Cocokkan bahasanya dengan kebutuhan nyata setempat.",
        "hours": 4,
        "skills": [
          "menerjemahkan",
          "menjangkau warga"
        ]
      },
      {
        "name": "Petakan lembaga dan mitra setempat",
        "description": "Susun direktori klinik, sekolah, bantuan hukum, kelas bahasa (ESL), sumber pangan, dan organisasi pendamping imigran. Sering kali pendatang baru cuma perlu tahu apa yang ada dan bagaimana menjangkaunya.",
        "hours": 5,
        "skills": [
          "menjangkau warga",
          "input data"
        ]
      },
      {
        "name": "Bangun sistem permintaan dan pencocokan",
        "description": "Buat cara sederhana bagi pendatang baru untuk minta tolong dan dicocokkan dengan penolong berdasarkan bahasa dan kebutuhan. Sediakan jalur telepon dan tatap muka, bukan cuma online.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "bantuan teknis"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Buat bahan orientasi",
        "description": "Susun panduan berbahasa sederhana dalam bahasa-bahasa yang relevan, mencakup transportasi umum, sekolah, kesehatan, dan hak-hak dasar. Pakai gambar supaya berguna untuk semua tingkat baca-tulis.",
        "hours": 4,
        "skills": [
          "menulis",
          "menerjemahkan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tawarkan pendampingan ke janji temu",
        "description": "Atur penolong untuk menemani orang ke janji temu medis, sekolah, atau urusan lain untuk menerjemahkan dan menemani. Bekali penolong untuk menerjemahkan apa adanya, bukan memberi nasihat di luar keahliannya.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "menerjemahkan"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Tetapkan kebiasaan privasi dan keamanan",
        "description": "Kumpulkan informasi seminimal yang diperlukan dan jangan pernah menanyakan atau mencatat status imigrasi. Simpan data dengan aman dan bekali para penolong menghadapi situasi sensitif dengan hati-hati.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Makan bersama komunitas / dapur umum",
    "purpose": "Masak dan bagikan makanan gratis bersama-sama secara rutin, tanpa banyak tanya.",
    "whoItServes": "Siapa pun yang lapar, kesepian, atau rawan pangan; sekaligus merajut hubungan antartetangga.",
    "whatYoullNeed": "Dapur, para juru masak, aliran bahan makanan, ruang saji, dan kru penolong. Menyajikan makanan untuk umum membawa tanggung jawab keamanan pangan yang nyata — cek aturan setempat soal izin dan penjamah makanan bersertifikat, dan patuhi cara simpan serta suhu yang aman setiap kali.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Dua obrolan pertamamu: dengan tuan rumah dapur — aula rumah ibadah atau balai warga — soal hari-hari yang kamu rencanakan, dan dengan dinas kesehatan setempat soal izin dan penanganan makanan; dua hal itu membentuk segalanya. Lalu tanyakan ke orang-orang yang akan datang makan: hari dan jam berapa yang benar-benar pas buat mereka.",
    "commonPitfalls": "Satu kelalaian keamanan pangan bisa mencelakai orang dan mengakhiri proyek — aturan suhu dan penyimpanan tidak boleh dilewati, sekali pun tidak. Kematian yang lebih pelan: tiga orang yang sama memasak setiap kali sampai tumbang, jadi perlebar kru dan gilir kepala masak sejak awal.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Cari dapur dan ruang saji",
        "description": "Amankan dapur yang cukup besar untuk memasak dalam jumlah banyak — aula rumah ibadah, balai warga, atau dapur komersial — plus ruang untuk menyajikan. Pastikan tersedia di hari-hari yang kamu rencanakan.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Bereskan keamanan pangan dan izin",
        "description": "Cek aturan setempat untuk menyajikan makanan ke umum. Mungkin perlu izin, penjamah makanan bersertifikat yang hadir, atau dapur berizin. Pelajari cara simpan dan penanganan suhu yang aman.",
        "hours": 4,
        "skills": [
          "keamanan pangan"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Bangun aliran pasokan makanan",
        "description": "Padukan sumbangan toko dan rumah makan, belanja borongan, dan kelebihan panen kebun atau hasil memungut sisa panen. Catat sumber yang bisa diandalkan supaya menu bisa direncanakan dari yang pasti ada.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Rencanakan menu untuk porsi besar, pantangan, dan alergi",
        "description": "Rancang masakan sederhana bergizi yang enak dimasak banyak dan hemat bahan. Sediakan pilihan tanpa daging dan tandai jelas pemicu alergi yang umum.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "memasak"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Kumpulkan kru masak dan saji",
        "description": "Kumpulkan para penolong untuk menyiapkan, memasak, menyajikan, dan beres-beres. Tunjuk kepala masak untuk tiap sesi makan dan perjelas peran supaya penyajian berjalan lancar.",
        "hours": 3,
        "skills": [
          "memasak",
          "koordinasi"
        ]
      },
      {
        "name": "Tetapkan jadwal dan kabarkan",
        "description": "Pilih hari dan jam tetap supaya orang bisa mengandalkannya. Sebarkan lewat selebaran, rumah singgah, dan dari mulut ke mulut, dengan nada hangat dan terbuka untuk semua.",
        "hours": 2,
        "skills": [
          "desain grafis"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Jalankan sesi makan dan beres-beres",
        "description": "Masak, sajikan dengan bermartabat (mengantar ke meja terasa lebih baik daripada antrean bila memungkinkan), dan bersihkan dapur sesuai standar. Kemas sisa makanan dengan aman untuk dibagikan lagi.",
        "hours": 5,
        "skills": [
          "memasak"
        ],
        "follows": [
          3,
          4,
          5
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "seed-library",
    "name": "Perpustakaan benih dan tukar benih",
    "purpose": "Bagikan benih gratis supaya orang bisa menanam pangan, sambil menjaga varietas lokal dan warisan tetap lestari.",
    "whoItServes": "Petani rumahan, penanam pemula, dan kebun komunitas.",
    "whatYoullNeed": "Sistem simpan dan katalog, benih sumbangan, tempat tuan rumah, dan beberapa orang yang merawatnya.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Bicaralah dengan perpustakaan atau balai warga soal menampung lemarinya, dan dengan pekebun setempat yang berpengalaman soal apa yang sungguh tumbuh di daerahmu — keberhasilan pemula bergantung pada benih yang cocok dengan wilayahnya. Pembibitan atau kebun komunitas terdekat sering dengan senang hati menyumbang stok awal.",
    "commonPitfalls": "Perpustakaan benih mati pelan-pelan: benih tua yang tak mau berkecambah, pemula yang merasa dirinya tak bisa berkebun dan tak pernah kembali. Putar stok tanpa sentimental, dan jangan berharap pada pengembalian — hampir tak ada yang menyimpan benih untuk dikembalikan — jadi rencanakan pengisian ulang dari sumbangan.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Cari tuan rumah dan sistem simpan",
        "description": "Bermitralah dengan perpustakaan, balai warga, atau kebun untuk menampung lemari kecil atau laci susun. Simpan benih di tempat sejuk, kering, dan gelap dalam amplop berlabel.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari benih awal",
        "description": "Kumpulkan sumbangan dari para pekebun, kelebihan stok penjual benih, dan sisa bungkus akhir musim. Utamakan varietas mudah yang cocok dengan wilayahmu supaya pemula berhasil.",
        "hours": 2,
        "skills": [
          "menjangkau warga",
          "berkebun"
        ]
      },
      {
        "name": "Tata dan beri label koleksinya",
        "description": "Pilah menurut jenis (sayur, bumbu, bunga) dan tingkat kesulitan. Beri label nama tanaman, tahun, dan catatan tanam singkat. Tandai mana yang benihnya mudah disimpan kembali.",
        "hours": 2,
        "skills": [
          "berkebun",
          "input data"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tetapkan kebiasaan pinjam dan berbagi",
        "description": "Buat sederhana: ambil benih gratis, tanam, dan kalau bisa simpan lalu kembalikan sebagian di akhir musim. Tempel panduan satu halaman tentang cara kerjanya.",
        "hours": 1,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Jaga daya tumbuh dan isi ulang",
        "description": "Benih kehilangan daya tumbuh seiring waktu. Keluarkan stok lama, uji kecambah pada batch yang meragukan, dan isi ulang varietas yang laris.",
        "hours": 1,
        "skills": [
          "berkebun"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "digital-literacy",
    "name": "Program melek digital dan pinjam perangkat",
    "purpose": "Pinjamkan perangkat dan ajarkan keahlian digital untuk menjembatani kesenjangan bagi orang tanpa teknologi atau internet yang memadai.",
    "whoItServes": "Para lansia, tetangga berpenghasilan rendah, pencari kerja, dan siapa pun yang tertinggal dari urusan serba online.",
    "whatYoullNeed": "Perangkat sumbangan, akses internet, pengajar yang mau membantu, dan sebuah ruang.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Bicara dulu dengan orang-orang yang ingin kamu jangkau — di perpustakaan, posyandu lansia, antrean pos sembako — dan tanyakan apa yang sebenarnya ingin mereka lakukan: konsultasi dokter online, melamar kerja, foto cucu. Lalu bicarakan ruang dan koneksi dengan perpustakaan sebelum mengumpulkan satu perangkat pun.",
    "commonPitfalls": "Meminjamkan perangkat tanpa membereskan akses internet sama saja meminjamkan pemberat kertas — koneksi adalah separuh proyeknya. Di sesi belajar, kekeliruan klasiknya pengajar merebut mouse dan bicara penuh istilah; dan jangan pernah meminjamkan lagi perangkat tanpa menghapusnya bersih, karena bocornya data satu peminjam meruntuhkan semua kepercayaan yang sudah kamu bangun.",
    "pairsWith": [
      "community-wifi-mesh",
      "skill-share"
    ],
    "learnMore": [
      "install-app",
      "new-device"
    ],
    "tasks": [
      {
        "name": "Kumpulkan dan segarkan perangkat",
        "description": "Kumpulkan laptop, tablet, dan ponsel sumbangan. Hapus bersih tiap perangkat dengan aman, perbarui, dan siapkan supaya mudah dipakai. Uji semuanya berfungsi sebelum dipinjamkan.",
        "hours": 8,
        "skills": [
          "bantuan teknis",
          "menyetir"
        ]
      },
      {
        "name": "Siapkan sistem peminjaman",
        "description": "Buat pencatatan sederhana: siapa meminjam apa, kondisinya, dan tanggal kembali. Tentukan lama pinjam dan aturan pengembalian yang pemaaf, dibangun di atas kepercayaan.",
        "hours": 3,
        "skills": [
          "input data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Atur akses internet",
        "description": "Perangkat tak banyak berguna tanpa koneksi. Pinjamkan hotspot, bermitra dengan perpustakaan, atau tunjukkan program internet murah dan Wi-Fi publik gratis.",
        "hours": 3,
        "skills": [
          "bantuan teknis",
          "menjangkau warga"
        ]
      },
      {
        "name": "Ajak dan bekali para pengajar",
        "description": "Cari orang-orang sabar dan siapkan mereka mengajar tanpa istilah teknis. Tekankan mengikuti kecepatan si pembelajar dan tak pernah mengambil alih mouse.",
        "hours": 4,
        "skills": [
          "mengajar"
        ]
      },
      {
        "name": "Rancang kurikulum pemula",
        "description": "Susun pelajaran pendek tentang yang pokok-pokok: email, aman berinternet, melamar kerja, konsultasi dokter online, urusan surat-surat pemerintah, dan panggilan video. Sediakan contekan tercetak.",
        "hours": 4,
        "skills": [
          "mengajar",
          "menulis"
        ]
      },
      {
        "name": "Jadwalkan kelas dan jam bantuan bebas",
        "description": "Sediakan kelas terstruktur sekaligus jam terbuka “bantuan teknologi”. Variasikan waktunya untuk orang yang bekerja, dan jaga kelompok tetap kecil.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Tetapkan aturan keamanan data dan pengembalian",
        "description": "Hapus bersih tiap perangkat di antara peminjam, ajarkan kebiasaan kata sandi dan privasi yang aman, dan jelaskan bagaimana data pribadi dilindungi. Siapkan rencana untuk perangkat hilang atau rusak.",
        "hours": 2,
        "skills": [
          "bantuan teknis",
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Brigade perapatan dan perbaikan rumah",
    "purpose": "Bantu tetangga berpenghasilan rendah, lansia, dan difabel dengan perbaikan rumah dan perapatan dari cuaca, untuk memangkas biaya listrik dan menambah keselamatan.",
    "whoItServes": "Pemilik rumah berpenghasilan rendah, para lansia, dan tetangga difabel yang tak sanggup mengerjakan atau membiayainya.",
    "whatYoullNeed": "Penolong yang terampil, bahan, alat, dan sistem permintaan. Kerjakan hanya yang sesuai kemampuan penolongmu — arahkan pekerjaan listrik, gas, struktur, dan atap ke tukang berizin profesional.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Kumpulkan dulu penolong-penolongmu yang paling berpengalaman dan sepakati bersama garis batasnya — pekerjaan mana yang diambil dan mana yang diarahkan ke ahli berizin — sebelum menerima satu permintaan pun. Perlakukan kunjungan pertama ke tiap rumah sebagai obrolan, bukan pemeriksaan: penghuninya yang memutuskan apa yang boleh disentuh di rumahnya.",
    "commonPitfalls": "Bahayanya adalah pekerjaan yang melebar: “perbaikan kecil” yang ternyata urusan listrik, gas, atau atap di luar kemampuan — di situlah orang bisa celaka. Dan jangan menjanjikan kunjungan lebih banyak daripada yang sanggup dipenuhi kru; membiarkan seorang lansia menunggu bantuan yang sudah ia andalkan lebih menyakitkan daripada penolakan jujur di awal.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Ajak penolong yang terampil",
        "description": "Cari orang yang nyaman dengan pertukangan dasar, menambal celah dengan sealant, insulasi, dan karet perapat pintu-jendela. Satu-dua orang berpengalaman bisa memandu sisanya.",
        "hours": 4,
        "skills": [
          "pertukangan",
          "perbaikan rumah"
        ]
      },
      {
        "name": "Tetapkan batas pekerjaan",
        "description": "Tentukan apa yang akan dan tidak akan dikerjakan. Berpeganglah pada pekerjaan aman dan sederhana (merapatkan dari cuaca, pegangan kamar mandi, perbaikan kecil) dan coret apa pun yang butuh tukang berizin, seperti pekerjaan listrik atau gas besar.",
        "hours": 2,
        "skills": [
          "perbaikan rumah"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Bangun sistem permintaan dan peninjauan",
        "description": "Buat jalur bagi tetangga untuk minta tolong, lalu lakukan kunjungan singkat untuk menakar pekerjaannya, mendata bahan, dan memastikan masih dalam batas keahlian dan keselamatanmu.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Cari bahan dan alat",
        "description": "Kumpulkan sealant, karet perapat, insulasi, dan perkakas dasar lewat sumbangan, harga miring, atau anggaran kecil. Rawat satu kotak alat bersama.",
        "hours": 4,
        "skills": [
          "menyetir"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bereskan keselamatan dan tanggung jawab",
        "description": "Pakai surat pernyataan sederhana, bawa perlengkapan P3K, wajibkan alat pelindung, dan jangan pernah mencoba pekerjaan di luar kemampuan. Mintalah nasihat soal perlindungan asuransi untuk perbaikan oleh penolong.",
        "hours": 3,
        "skills": [
          "urusan berkas"
        ]
      },
      {
        "name": "Jadwalkan dan jalankan gotong royong",
        "description": "Cocokkan pekerjaan dengan tim penolong, pastikan dengan pemilik rumah, dan selesaikan pekerjaannya dalam satu sesi yang terfokus. Hormati rumah dan keinginan penghuninya sepanjang waktu.",
        "hours": 5,
        "skills": [
          "koordinasi",
          "perbaikan rumah"
        ],
        "follows": [
          1,
          2,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "pet-food-bank",
    "name": "Bank makanan hewan & dukungan perawatan hewan peliharaan",
    "purpose": "Sediakan makanan hewan gratis dan bantuan perawatan dasar supaya tidak ada yang terpaksa menyerahkan hewan peliharaannya karena biaya.",
    "whoItServes": "Pemilik hewan berpenghasilan rendah, lansia dengan pemasukan pas-pasan, dan tetangga tanpa tempat tinggal yang punya hewan.",
    "whatYoullNeed": "Tempat penyimpanan, pasokan makanan hewan yang berkelanjutan, titik pembagian, dan kerja sama dengan dokter hewan.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Bicara dulu dengan bank makanan yang sudah ada soal membagikan bersama — rumah tangga yang sama sering butuh keduanya — dan dengan dokter hewan serta toko hewan setempat soal donasi, mungkin juga kerja sama vaksin atau keringanan biaya.",
    "commonPitfalls": "Yang paling merusak adalah ketidakpastian: satu penggalangan besar, lalu rak kosong, padahal pemilik hewan perlu bisa mengandalkanmu. Jaga juga nada bicara — penghakiman sekecil apa pun soal “pantas tidaknya orang susah memelihara hewan” mematikan proyek ini lebih cepat daripada stok makanan yang habis.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Cari tempat penyimpanan dan titik pembagian",
        "description": "Amankan penyimpanan yang kering dan bebas hama serta tempat membagikan makanan — sering kali menumpang di bank makanan atau balai warga yang sudah ada.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Bangun pasokan makanan hewan",
        "description": "Gabungkan penggalangan donasi, sumbangan toko hewan dan produsen, serta belanja borongan. Catat apa yang masuk supaya pembagian bisa direncanakan.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Pilah dan data stok per jenis hewan dan ukuran",
        "description": "Pisahkan makanan anjing dan kucing (juga hewan lain), catat jumlahnya, dan periksa tanggal kedaluwarsa. Jaga hitungan berjalan untuk memandu pengisian ulang.",
        "hours": 1.5,
        "skills": [
          "koordinasi",
          "input data"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Tetapkan aturan pembagian",
        "description": "Sepakati berapa banyak untuk tiap rumah tangga dan seberapa sering, tanpa syarat bukti kesulitan. Buat pola yang bisa ditebak supaya pemilik hewan bisa berencana.",
        "hours": 1,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Jadwalkan dan siapkan orang untuk pembagian",
        "description": "Tetapkan waktu pembagian yang rutin, ajak warga yang mau membantu, dan jaga suasana bebas penghakiman. Banyak orang melewatkan makan demi memberi makan hewannya — sambut mereka dengan hormat.",
        "hours": 2.5,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "youth-mentorship",
    "name": "Pendampingan remaja & kegiatan sepulang sekolah",
    "purpose": "Beri anak dan remaja ruang aman sepulang sekolah dengan bantuan PR, pendampingan, dan kegiatan pengayaan.",
    "whoItServes": "Anak dan remaja di daerah yang minim dukungan, serta orang tua bekerja yang butuh pengasuhan yang aman.",
    "whatYoullNeed": "Ruang yang aman, mentor yang sudah diperiksa, kegiatan, dan camilan. Bekerja dengan anak-anak membawa tanggung jawab serius — periksa setiap orang dewasa, pegang aturan dua orang dewasa, patuhi aturan wajib lapor, dan ikuti ketentuan setempat untuk kegiatan anak dan remaja.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Sebelum mengajak satu mentor pun, bicaralah dengan orang tua dan dengan anak-anak muda itu sendiri tentang apa yang mereka butuhkan, lalu tuliskan kebijakan keselamatanmu — pemeriksaan latar belakang, aturan dua orang dewasa, kewajiban lapor. Tidak ada orang dewasa yang menghabiskan waktu bersama anak-anak sebelum lolos semua itu.",
    "commonPitfalls": "Kegagalan terburuk adalah jalan pintas keselamatan: orang dewasa yang belum diperiksa, atau orang dewasa berduaan dengan seorang anak — itu tidak pernah bisa ditawar. Yang kedua adalah mentor yang silih berganti; bagi anak yang sudah sering dikecewakan, orang dewasa yang menghilang itu melukai, jadi mulailah kecil dan tumbuh hanya sejauh yang bisa kamu awasi dan jaga.",
    "pairsWith": [
      "school-supply-program",
      "childcare-collective",
      "community-music"
    ],
    "learnMore": [
      "how-vouching-works"
    ],
    "tasks": [
      {
        "name": "Amankan ruang yang aman dan tetapkan jamnya",
        "description": "Cari tempat yang layak dan mudah dijangkau — ruang kelas, perpustakaan, atau balai warga — dan tetapkan jam sepulang sekolah yang tetap sehingga keluarga bisa mengandalkannya.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Tetapkan standar keselamatan anak dan pemeriksaan",
        "description": "Wajibkan pemeriksaan latar belakang bagi orang dewasa yang bekerja dengan anak, tegakkan aturan dua orang dewasa supaya tak ada yang berduaan dengan seorang anak, dan tetapkan kebijakan perilaku dan pelaporan yang jelas.",
        "hours": 6,
        "skills": [
          "mengasuh anak",
          "menulis"
        ]
      },
      {
        "name": "Ajak dan latih para mentor",
        "description": "Cari orang dewasa yang andal dan peduli, lalu latih soal batasan, keselamatan anak, dan cara mendukung tanpa mengerjakan tugas anak. Kejar konsistensi dari minggu ke minggu.",
        "hours": 6,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Rencanakan kegiatannya",
        "description": "Campur bantuan PR dengan pengayaan — membaca, seni, olahraga, kecakapan hidup. Buat tetap seru dan biarkan para remaja ikut menentukan isinya.",
        "hours": 4,
        "skills": [
          "mengajar"
        ]
      },
      {
        "name": "Urus pendaftaran, alergi, dan info darurat",
        "description": "Kumpulkan izin orang tua, catatan alergi dan medis, kontak darurat, dan siapa yang boleh menjemput tiap anak. Simpan semuanya dengan aman.",
        "hours": 3,
        "skills": [
          "urusan berkas",
          "input data"
        ]
      },
      {
        "name": "Cari camilan dan perlengkapan",
        "description": "Sediakan camilan sehat (banyak anak datang kelaparan) dan kumpulkan buku, alat gambar, dan permainan lewat donasi atau anggaran kecil.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Jalankan sesi dan sapa keluarga",
        "description": "Buka ruangnya, awasi dengan cermat, jalankan kegiatan, dan jaga kontak rutin dengan orang tua tentang perkembangan anak-anak mereka.",
        "hours": 4,
        "skills": [
          "mengasuh anak",
          "mengajar"
        ],
        "follows": [
          0,
          2,
          3,
          4
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "gleaning-network",
    "name": "Jaringan pemungut sisa panen",
    "purpose": "Selamatkan kelebihan hasil panen dari ladang, kebun buah, pekarangan, dan pasar, lalu bagikan sebelum terbuang.",
    "whoItServes": "Tetangga yang rawan pangan dan proyek pangan seperti kulkas komunitas, bank makanan, dan makan bersama.",
    "whatYoullNeed": "Orang-orang yang siap membantu, transportasi, hubungan baik dengan para petani, dan penyimpanan jangka pendek.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Mulailah dari para penanamnya: petani, pemilik kebun buah, dan pedagang pasar. Tanyakan kelebihan panen apa yang mereka punya dan apa yang mereka khawatirkan kalau kedatangan tim — tanggung jawab hukum, kerusakan tanaman — dan pastikan ke mana makanannya pergi (kulkas komunitas, bank makanan, makan bersama) sebelum panen pertama.",
    "commonPitfalls": "Kegagalan klasiknya: buah yang diselamatkan lalu membusuk di garasi seseorang — penyaluran diatur sebelum memetik, bukan sesudahnya. Jendela panen itu pendek, jadi tim kecil yang gesit mengalahkan daftar nama yang panjang; dan satu pemungutan ceroboh yang merusak ladang bisa membuatmu kehilangan petani itu selamanya.",
    "pairsWith": [
      "community-fridge",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Cari sumber hasil panen",
        "description": "Hubungi petani, pemilik kebun buah, pedagang pasar, dan tetangga dengan pohon buah yang sarat. Banyak yang senang kelebihannya dipanen daripada membusuk.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Bentuk tim pemungut",
        "description": "Susun daftar orang yang bisa bergerak cepat saat panen siap. Jendela panen itu pendek, jadi keluwesan lebih penting daripada jumlah.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Atur transportasi dan penyimpanan",
        "description": "Siapkan kendaraan untuk memindahkan hasil panen dan tempat sejuk untuk menampungnya sebentar. Koordinasikan supaya makanan cepat berpindah dari ladang ke penerima sebelum rusak.",
        "hours": 3,
        "skills": [
          "menyetir"
        ]
      },
      {
        "name": "Siapkan penjadwalan dan pengerahan",
        "description": "Buat cara cepat untuk mengabari dan mengonfirmasi tim saat ada panen, karena petani sering memberi tahu mendadak. Grup obrolan atau daftar telepon sudah cukup.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bereskan tanggung jawab hukum dan keamanan pangan",
        "description": "Pelajari perlindungan hukum donasi makanan di daerahmu (di beberapa tempat disebut hukum “Good Samaritan”), sepakati aturan penanganan sederhana, dan pakai surat pernyataan dasar supaya petani nyaman menerima tim pemungut.",
        "hours": 3,
        "skills": [
          "urusan berkas",
          "keamanan pangan"
        ]
      },
      {
        "name": "Bangun jalur penyaluran",
        "description": "Pastikan ke mana hasil pungutan pergi — kulkas komunitas, bank makanan, program makan, atau langsung ke keluarga — supaya tak pernah teronggok sia-sia.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Jalankan pemungutan dan catat beratnya",
        "description": "Panen dengan hati-hati untuk menjaga lahan, salurkan segera, dan catat berapa kilo makanan terselamatkan. Angka-angka itu membantu mengajak penolong dan petani baru.",
        "hours": 4,
        "skills": [
          "berkebun",
          "menyetir"
        ],
        "follows": [
          0,
          2,
          3,
          5
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-mediation",
    "name": "Jaringan mediasi & penyelesaian konflik komunitas",
    "purpose": "Tawarkan mediasi gratis dan netral untuk beda pendapat antartetangga, menyelesaikan konflik tanpa pengadilan atau polisi.",
    "whoItServes": "Tetangga, penyewa dan pemilik rumah, teman serumah, dan kelompok warga yang sedang berkonflik.",
    "whatYoullNeed": "Penengah terlatih, ruang netral, dan alur permintaan. Mediasi hanya untuk beda pendapat antara pihak-pihak yang sama-sama mau — saring dan alihkan situasi apa pun yang melibatkan kekerasan, penganiayaan, atau bahaya ke tenaga profesional yang tepat atau bantuan darurat.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Bicara dulu dengan pusat mediasi komunitas yang sudah ada atau seorang pelatih — keterampilan ini tidak bisa dikarang sendiri — dan sebelum kasus pertama, tuliskan garis penyaringmu: beda pendapat mana yang kalian tangani, dan ke mana mengalihkan apa pun yang melibatkan kekerasan atau penganiayaan.",
    "commonPitfalls": "Kegagalan yang berbahaya adalah memediasi yang seharusnya tidak dimediasi: “beda pendapat antartetangga” yang sebenarnya penganiayaan menempatkan seseorang dalam bahaya, jadi saring setiap permintaan yang masuk. Dan kerahasiaan adalah seluruh modal proyek ini — satu detail bocor dan tak ada lagi yang percaya; jaga juga para penengahmu, karena kerja ini menggerus pelan-pelan.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Ajak dan latih para penengah",
        "description": "Cari orang yang tenang dan adil, lalu latih mereka — lewat pelatihan mediasi yang diakui atau dengan bermitra bersama pusat mediasi komunitas yang sudah ada.",
        "hours": 6,
        "skills": [
          "menjangkau warga",
          "memandu diskusi"
        ]
      },
      {
        "name": "Siapkan alur permintaan dan penerimaan",
        "description": "Buat cara sederhana bagi orang untuk meminta mediasi. Saat penerimaan, dengarkan garis besar dari tiap sisi dan pastikan kasusnya memang cocok untuk dimediasi.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "wawancara"
        ]
      },
      {
        "name": "Cari tempat pertemuan yang netral",
        "description": "Amankan lokasi yang tenang dan netral — ruang perpustakaan atau balai warga — tempat kedua pihak merasa aman dan setara.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Tetapkan cakupan dan batasnya",
        "description": "Putuskan apa yang kalian mediasi (kebisingan, ruang bersama, gesekan kecil) dan apa yang tidak. Saring situasi yang melibatkan kekerasan, penganiayaan, atau risiko keselamatan dan alihkan ke tenaga profesional yang tepat.",
        "hours": 3,
        "skills": [
          "memandu diskusi",
          "menulis"
        ]
      },
      {
        "name": "Tegakkan kerahasiaan dan aturan main",
        "description": "Tetapkan aturan yang jelas: kerahasiaan, keikutsertaan sukarela, bicara bergantian dengan hormat, dan penengah yang memandu tapi tidak memutuskan. Tuliskan semuanya untuk para peserta.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Kabarkan bahwa mediasi ini ada",
        "description": "Beri tahu tetangga, kelompok perumahan, dan organisasi setempat bahwa ada mediasi gratis, supaya orang meraihnya sebelum konflik membesar.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "desain grafis"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Pantau hasil dan rawat para penengah",
        "description": "Catat angka penyelesaian (tanpa membocorkan kerahasiaan) dan ajak para penengah berevaluasi rutin. Kerja ini menguras, jadi gilir kasus dan beri dukungan.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "input data",
          "memandu diskusi"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Jaringan dukungan kepulangan dari penjara",
    "purpose": "Bantu orang yang pulang dari penjara mengurus dokumen identitas, tempat tinggal, pekerjaan, dan komunitas — meringankan masa peralihan yang terkenal berat.",
    "whoItServes": "Orang yang pernah dipenjara dan keluarganya.",
    "whatYoullNeed": "Orang-orang yang mau membantu, organisasi mitra, dan direktori sumber bantuan yang kokoh. Perlakukan riwayat dan masa lalu tiap orang sebagai hal pribadi — utamakan hormat, ikuti tujuan orangnya sendiri, dan alihkan urusan hukum ke penasihat yang cakap.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Sebelum membangun apa pun, duduklah bersama orang-orang yang sudah menjalani kepulangan itu sendiri dan dengan organisasi pendamping, kantor pembebasan bersyarat, serta pemberi kerja terbuka yang sudah bergerak di daerahmu — tanyakan apa yang benar-benar mengganjal orang di minggu-minggu pertama dan di mana jaringanmu pas. Siapkan sejak sekarang kontak bantuan hukum atau pengacara yang cakap, supaya saat pertanyaan hukum muncul kamu punya tempat rujukan yang sungguhan.",
    "commonPitfalls": "Proyek ini mati saat berubah jadi penjagaan gerbang — orang-orang yang membantu malah menimbang siapa yang pantas ditolong — atau saat masa lalu seseorang bocor dan merenggut pekerjaan atau tempat tinggalnya. Ia juga gagal diam-diam saat semangat melampaui tindak lanjut; janji yang diingkari terasa lebih berat bagi orang yang sedang membangun ulang kepercayaan daripada tanpa janji sama sekali.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Susun direktori sumber bantuan dan mitra",
        "description": "Petakan tempat mengurus dokumen identitas, tempat tinggal, pekerjaan, kesehatan, pengobatan, dan bantuan sosial. Kenali pemberi kerja dan pemilik kontrakan yang terbuka pada orang dengan riwayat pidana.",
        "hours": 6,
        "skills": [
          "menjangkau warga",
          "input data"
        ]
      },
      {
        "name": "Ajak dan latih para penolong",
        "description": "Cari orang yang tak menghakimi dan latih mereka mendampingi dengan hormat dan peka-trauma. Orang yang pulang butuh kawan seperjalanan, bukan penjaga gerbang.",
        "hours": 5,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ]
      },
      {
        "name": "Buat penyambutan dan penggalian kebutuhan",
        "description": "Bangun cara sederhana dan bermartabat untuk tahu apa yang paling mendesak bagi tiap orang — sering kali dokumen identitas, tempat menginap, dan penghasilan — lalu urutkan dari sana.",
        "hours": 3,
        "skills": [
          "wawancara"
        ]
      },
      {
        "name": "Bantu urus dokumen dan bantuan sosial",
        "description": "Dampingi mengurus penggantian kartu identitas dan dokumen kependudukan, mengajukan bantuan sosial, dan berkas lain yang sulit diurus tanpa alamat atau akses internet.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "urusan berkas"
        ]
      },
      {
        "name": "Hubungkan ke pekerjaan dan tempat tinggal",
        "description": "Buat perkenalan hangat ke pemberi kerja yang terbuka dan pilihan hunian, lalu bantu dengan lamaran, riwayat kerja, dan persiapan wawancara.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "menjangkau warga",
          "menulis"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tawarkan pendampingan sebaya",
        "description": "Bila memungkinkan, pasangkan orang dengan mentor yang pernah menjalani kepulangan itu sendiri. Pengalaman yang sama membangun kepercayaan lebih cepat dari apa pun.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Tetapkan praktik privasi dan batasan",
        "description": "Pegang masa lalu tiap orang dengan kerahasiaan ketat, jangan pernah menekan siapa pun untuk bercerita lebih dari yang ia mau, dan alihkan pertanyaan hukum ke pengacara yang cakap.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Bank kayu bakar komunitas / bantuan penghangatan",
    "purpose": "Kumpulkan dan bagikan kayu bakar serta koordinasikan bantuan penghangatan supaya tetangga tetap hangat sepanjang musim dingin.",
    "whoItServes": "Rumah tangga berpenghasilan rendah dan pedesaan yang menghangatkan rumah dengan kayu, serta lansia yang tak sanggup mengumpulkan atau membelah sendiri.",
    "whatYoullNeed": "Sumber kayu, lokasi pengolahan dan penyimpanan, peralatan, tim terlatih, dan rencana pengantaran. Gergaji mesin dan mesin pembelah itu berbahaya — hanya operator terlatih yang boleh memakainya, wajibkan pelindung diri, dan bekali tim soal keselamatan sebelum tiap sesi.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Mulailah dengan berbicara pada rumah tangga yang menghangatkan rumah dengan kayu — lansia pedesaan, keluarga yang sudah dikenal kantor bantuan bahan bakar — untuk tahu berapa banyak yang mereka bakar dan kapan mereka kehabisan, lalu telepon usaha penebangan pohon setempat soal ke mana kayu mereka selama ini. Sebelum satu gergaji pun menyala, tentukan siapa pemegang urusan keselamatan: seseorang yang cukup berpengalaman untuk melatih tim dan tak sungkan berkata tidak.",
    "commonPitfalls": "Dua cara proyek ini melukai orang: orang tak terlatih memegang gergaji mesin, dan mengantar kayu basah yang berasap, melapisi cerobong dengan kerak kreosot, dan tak menghangatkan. Menebang bulan Oktober untuk Desember berarti kayu basah — kegagalan kalender sama nyatanya dengan kegagalan keselamatan.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Amankan sumber kayu",
        "description": "Atur pasokan dari usaha penebangan pohon, pembersihan pascabadai, donasi pohon tumbang, atau lahan yang dikelola lestari. Pastikan kamu boleh mengambil dan mengolahnya secara sah.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari lokasi pengolahan dan penyimpanan",
        "description": "Amankan halaman atau lahan tempat kayu bisa dipotong, dibelah, ditumpuk, dan dikeringkan. Perlu ruang untuk menjaga pasokan musim ini tetap kering sambil pasokan musim depan mengering.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Siapkan peralatan dan pelindung diri",
        "description": "Dapatkan atau pinjam mesin pembelah kayu, gergaji mesin, dan pelindung diri (celana pelindung, pelindung mata dan telinga, sarung tangan). Rawat semua alat dan sediakan kotak P3K di lokasi.",
        "hours": 4,
        "skills": [
          "menyetir",
          "memperbaiki alat"
        ]
      },
      {
        "name": "Bentuk dan latih tim kayu",
        "description": "Bangun tim dan pastikan hanya orang yang benar-benar terlatih yang memegang gergaji mesin dan mesin pembelah. Adakan arahan keselamatan sebelum tiap gotong royong.",
        "hours": 4,
        "skills": [
          "mengajar",
          "menjangkau warga"
        ]
      },
      {
        "name": "Bangun alur permintaan dan pengantaran",
        "description": "Buat cara bagi rumah tangga untuk meminta kayu dan mengatur pengantaran, karena banyak penerima sudah sepuh atau tak punya truk. Pastikan penumpukan yang aman dekat rumah.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "menyetir"
        ]
      },
      {
        "name": "Tetapkan urutan pembagian",
        "description": "Sepakati berapa banyak kayu untuk tiap rumah tangga dan dahulukan yang paling terancam saat cuaca dingin. Jaga prosesnya sederhana dan tanpa hambatan.",
        "hours": 2,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Jadwalkan gotong royong dan pengeringan",
        "description": "Rencanakan penebangan dan pembelahan jauh sebelum musim dingin, karena kayu basah butuh berbulan-bulan mengering sebelum aman dibakar. Catat mana yang sudah kering dan siap.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "community-wifi-mesh",
    "name": "Wi-Fi komunitas gratis / jaringan mesh",
    "purpose": "Sediakan akses internet gratis di tempat yang harganya tak terjangkau atau jaringannya memang tak ada.",
    "whoItServes": "Rumah tangga berpenghasilan rendah, pelajar, pencari kerja, dan siapa pun yang terputus dari internet yang andal.",
    "whatYoullNeed": "Koneksi internet utama (backhaul), router dan node mesh, orang-orang yang paham teknologi, dan lokasi tuan rumah.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Susuri blok-blok yang ingin kamu jangkau dan ketuk pintunya — bicaralah dengan rumah tangga tanpa akses tentang untuk apa mereka akan memakainya, dan dengan orang-orang yang atap serta jendela atasnya bisa menampung node. Sebelum membeli perangkat, bereskan urusan bandwidth: cari usaha, perpustakaan, atau ISP yang mau berbagi jalur, dan pastikan secara tertulis bahwa distribusi ulang diizinkan.",
    "commonPitfalls": "Jaringan mesh biasanya mati karena perawatan, bukan pembangunan — perintis teknisnya pindah dan tak ada lagi yang bisa masuk ke router, jadi dokumentasikan semuanya dan latih orang kedua sejak hari pertama. Kegagalan senyap lainnya: membangun di tempat sinyal mudah menjangkau, bukan di tempat orang benar-benar tak punya akses.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Petakan kebutuhan dan celah jangkauan",
        "description": "Kenali blok mana yang tak punya akses terjangkau dan sampai mana sinyal bisa menembus. Catat bangunan dengan garis pandang bersih dan tuan rumah yang bersedia. Ini membentuk seluruh rancangan.",
        "hours": 4,
        "skills": [
          "bantuan teknis"
        ]
      },
      {
        "name": "Amankan koneksi internet utama",
        "description": "Atur sumber bandwidth untuk dibagi — jalur usaha yang didonasikan, kemitraan dengan ISP, atau sambungan dari jaringan komunitas lain. Pastikan ketentuannya mengizinkan distribusi ulang.",
        "hours": 5,
        "skills": [
          "menjangkau warga",
          "bantuan teknis"
        ]
      },
      {
        "name": "Ajak orang-orang yang paham teknologi",
        "description": "Cari orang yang nyaman dengan urusan jaringan, yang bisa mengonfigurasi router dan menelusuri gangguan. Dua orang sudah cukup untuk mulai, plus yang mau belajar.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "bantuan teknis"
        ]
      },
      {
        "name": "Kumpulkan dan konfigurasikan perangkat",
        "description": "Kumpulkan router, node mesh, dan antena lewat donasi atau anggaran kecil. Konfigurasikan sebagai jaringan terbuka atau berbagi sederhana, lalu uji jangkauannya.",
        "hours": 10,
        "skills": [
          "bantuan teknis"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Cari lokasi tuan rumah untuk node",
        "description": "Tempatkan node di titik yang memperluas jangkauan — atap, jendela atas, dan teras yang ada listrik dan izinnya. Minta persetujuan tertulis dari tiap tuan rumah dan ganti biaya listriknya yang kecil.",
        "hours": 5,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tetapkan norma pemakaian dan privasi",
        "description": "Pasang aturan sederhana, jangan mencatat aktivitas siapa pun, dan jujurlah bahwa jaringan terbuka itu tidak privat. Arahkan orang ke kebiasaan aman dasar seperti HTTPS dan VPN.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Rawat dan perluas jaringan",
        "description": "Periksa node secara rutin, ganti perangkat yang rusak, dan tambah jangkauan saat tuan rumah baru bergabung. Dokumentasikan pemasangannya supaya orang lain bisa ikut merawat.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "bantuan teknis"
        ],
        "follows": [
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "mental-health-peer-support",
    "name": "Lingkar dukungan sebaya kesehatan mental",
    "purpose": "Sediakan ruang yang aman, rutin, dan dipandu sesama untuk saling bercerita dan saling menguatkan — pelengkap perawatan profesional, bukan penggantinya.",
    "whoItServes": "Siapa pun yang sedang melalui tekanan, kesepian, kehilangan, atau tantangan kesehatan mental dan ingin terhubung dengan sesama.",
    "whatYoullNeed": "Pemandu terlatih, ruang privat, dan batasan yang jelas berikut rencana rujukan krisis. Dukungan sebaya melengkapi perawatan kesehatan mental profesional — bukan menggantikannya. Pemandu bukan terapis, dan harus selalu ada rencana jelas untuk menghubungkan siapa pun yang sedang krisis ke tenaga profesional atau bantuan darurat.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Percakapan pertamamu adalah dengan orang-orang yang mungkin memandu dan dengan tenaga kesehatan mental setempat — klinik, hotline krisis, atau konselor yang setuju menjadi jalur rujukanmu sebelum lingkar pertama berkumpul. Jangan buka pintu sebelum para pemandu terlatih dan semua orang bisa berkata gamblang apa lingkar ini dan apa yang bukan.",
    "commonPitfalls": "Kegagalan yang berbahaya adalah pergeseran pelan: lingkar yang hangat pelan-pelan jadi satu-satunya sandaran seseorang, pemandu mulai berperan jadi terapis, dan tak ada rencana untuk malam ketika seseorang benar-benar krisis. Yang lebih senyap adalah pemandu yang kelelahan — bila orang yang menjaga ruang tak punya dukungan sendiri, lingkar ini tutup dalam setahun.",
    "pairsWith": [
      "neighborhood-care-network",
      "disability-support-network",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what",
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Ajak dan latih para pemandu",
        "description": "Cari orang yang hangat dan tenang, lalu minta mereka menuntaskan pelatihan dukungan sebaya atau mendengarkan aktif. Tegaskan: pemandu adalah sesama yang menjaga ruang, bukan klinisi yang mendiagnosis atau mengobati.",
        "hours": 5,
        "skills": [
          "memandu diskusi",
          "menjangkau warga"
        ]
      },
      {
        "name": "Tetapkan cakupan dan batas lingkar",
        "description": "Tegaskan bahwa ini dukungan sebaya, bukan terapi atau penanganan krisis. Tuliskan untuk apa lingkar ini dan apa yang di luar perannya, supaya harapan semua orang jelas.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Susun rencana rujukan dan eskalasi krisis",
        "description": "Siapkan langkah yang jelas saat seseorang tertekan melampaui dukungan sebaya: cara menghubungkannya dengan lembut ke bantuan profesional atau hotline krisis, dan kapan melibatkan bantuan darurat. Simpan daftar kontak setempat dan nasional yang terbaru.",
        "hours": 3,
        "skills": [
          "menulis"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Cari ruang yang privat dan aman",
        "description": "Amankan ruangan yang tenang, nyaman, dan terjaga kerahasiaannya, tempat orang bisa bicara lepas. Tempat yang tetap membantu orang merasa aman untuk kembali.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Sepakati kerahasiaan dan aturan main kelompok",
        "description": "Sepakati kerahasiaan, tanpa saran kecuali diminta, tanpa memotong pembicaraan, dan hak melewati giliran. Bagikan aturan ini di awal setiap sesi.",
        "hours": 3,
        "skills": [
          "memandu diskusi",
          "menulis"
        ]
      },
      {
        "name": "Jadwalkan dan kabarkan sesinya",
        "description": "Pilih waktu yang tetap, jaga ukuran kelompok tetap terjaga, dan kabarkan dengan cara yang mengikis stigma. Perjelas bahwa ini gratis dan terbuka.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "koordinasi"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Dukung para pemandu dan cegah kelelahan",
        "description": "Adakan obrolan rutin tempat para pemandu berevaluasi dan melepas beban. Gilir siapa yang memandu, dan pastikan mereka juga punya dukungan sendiri.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "memandu diskusi"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Bersih-bersih lingkungan & menghidupkan kembali ruang hijau",
    "purpose": "Memunguti sampah, menata kembali lahan dan taman terbengkalai, dan menciptakan ruang hijau bersama.",
    "whoItServes": "Seluruh lingkungan — ruang yang lebih bersih, aman, dan hijau bermanfaat untuk semua orang.",
    "whatYoullNeed": "Orang-orang yang mau turun tangan, perlengkapan, izin lokasi, dan rencana pembuangan sampah. Lahan terbengkalai bisa menyimpan bahaya nyata — jangan pernah memungut jarum suntik atau bahan kimia tak dikenal dengan tangan; pakai alat dan wadah kaku untuk benda tajam, dan buang temuan berbahaya sesuai aturan setempat.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Susuri lingkungan bersama warga yang tinggal paling dekat dengan titik-titik terbengkalai — mereka tahu lahan mana yang penting, siapa pemiliknya, dan apa saja yang pernah dicoba — dan cari tahu apakah pemerintah kota atau kelompok pencinta taman sudah rutin mengadakan bersih-bersih yang bisa kamu ikuti. Bereskan soal kepemilikan, izin, dan ke mana sampah dibawa sebelum menentukan tanggal.",
    "commonPitfalls": "Bersih-bersih gagal dengan dua cara: kantong-kantong sampah hasil kerja teronggok berminggu-minggu di pinggir jalan karena tidak ada yang mengurus pembuangannya, dan lahan yang sudah rapi kembali penuh semak beberapa bulan kemudian karena tidak ada rencana setelah hari besarnya. Dan satu orang yang meraih jarum suntik dengan tangan kosong bisa mengubah pagi yang baik menjadi kunjungan ke rumah sakit.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Petakan dan urutkan lokasi",
        "description": "Susuri daerahmu dan catat titik-titik yang butuh perhatian — sudut penuh sampah, lahan penuh semak, taman terbengkalai. Urutkan berdasarkan dampak dan kelayakannya.",
        "hours": 1.5,
        "skills": []
      },
      {
        "name": "Urus izin dan rencana pembuangan",
        "description": "Pastikan siapa pemilik tiap lokasi dan minta izinnya. Atur pengangkutan sampah dan puing dari jauh hari — pesan kontainer sampah atau jadwalkan penjemputan dari dinas kebersihan supaya kantong-kantong tidak menumpuk begitu saja.",
        "hours": 2,
        "skills": [
          "menjangkau warga",
          "urusan berkas"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kumpulkan perlengkapan dan alat keselamatan",
        "description": "Kumpulkan sarung tangan, kantong, penjepit sampah, dan rompi keselamatan yang mencolok. Sertakan wadah kaku untuk benda tajam dan rencana untuk barang berbahaya yang mungkin ditemukan.",
        "hours": 1.5,
        "skills": [
          "menyetir"
        ]
      },
      {
        "name": "Ajak dan atur orang-orangnya",
        "description": "Sebarkan kabarnya dan catat siapa saja yang mau ikut. Tunjuk ketua tim dan bagi zona supaya harinya berjalan teratur, bukan kacau.",
        "hours": 2,
        "skills": [
          "menjangkau warga",
          "koordinasi"
        ]
      },
      {
        "name": "Gelar gotong royong bersih-bersihnya",
        "description": "Jalankan harinya, jaga tiap tim tetap aman dan cukup minum, lalu rayakan hasil yang terlihat bersama-sama. Ambil foto sebelum-sesudah untuk memancing semangat di kesempatan berikutnya.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "memotret"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "free-tax-prep",
    "name": "Klinik lapor pajak gratis & penguatan keuangan",
    "purpose": "Membantu tetangga berpenghasilan rendah lapor pajak tanpa biaya dan mendapatkan keringanan serta pengembalian pajak yang memang hak mereka.",
    "whoItServes": "Pekerja berpenghasilan rendah, keluarga yang berhak atas keringanan pajak, lansia, dan pelajar.",
    "whatYoullNeed": "Penyusun laporan pajak yang terlatih dan bersertifikat, sebuah ruangan, komputer, dan sistem janji temu. Laporan pajak harus disusun oleh orang bersertifikat lewat program yang diakui — klinik ini membantu pelaporan standar, bukan situasi rumit yang butuh profesional pajak.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Telepon pertamamu adalah ke program lapor pajak gratis yang sudah mapan seperti VITA — bicarakan dengan koordinatornya soal jadwal sertifikasi, perangkat lunak, dan apa saja yang dibutuhkan lokasi baru, karena proyek ini memang tidak untuk dijalankan sendirian. Lalu mengobrollah dengan tetangga yang ingin kamu bantu: kapan mereka benar-benar bisa datang, dan apa yang selama ini membuat mereka tidak lapor pajak.",
    "commonPitfalls": "Satu laporan yang keliru bisa membuat sebuah keluarga kehilangan pengembalian pajaknya atau malah memicu pemeriksaan kantor pajak — karena itulah garis yang tidak boleh dilanggar proyek ini: orang tanpa sertifikasi menyusun laporan pajak. Kegagalan yang lebih halus: mulai di bulan Maret padahal sertifikasi makan waktu berbulan-bulan, dan seseorang yang jauh-jauh naik bus hanya untuk ditolak gara-gara satu dokumen yang tidak pernah diberitahukan.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Latih dan sertifikasi para penyusun laporan",
        "description": "Minta orang-orangmu menuntaskan sertifikasi lapor pajak gratis yang diakui (seperti program VITA dari IRS) supaya laporan akurat dan sah disusunnya. Yang satu ini tidak bisa ditawar.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "pembukuan"
        ]
      },
      {
        "name": "Bermitra dengan program lapor pajak gratis yang diakui",
        "description": "Bergabunglah dengan program yang sudah mapan untuk perangkat lunak, pendampingan, dan kepercayaan orang. Merekalah yang menyediakan alat pelaporan dan pemeriksaan mutu yang tidak seharusnya kamu bangun sendirian.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "urusan berkas"
        ]
      },
      {
        "name": "Siapkan ruangan dan peralatan",
        "description": "Amankan tempat dengan komputer, internet yang andal, dan privasi yang cukup supaya orang nyaman membuka informasi keuangannya yang sensitif.",
        "hours": 3,
        "skills": [
          "bantuan teknis"
        ]
      },
      {
        "name": "Bangun sistem janji temu dan penerimaan",
        "description": "Buat jadwal janji temu dan daftar jelas dokumen yang wajib dibawa (kartu identitas, bukti penghasilan, laporan pajak sebelumnya). Ini mencegah orang datang sia-sia dan antrean panjang.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "input data"
        ]
      },
      {
        "name": "Kabarkan ke tetangga yang berhak",
        "description": "Sebarkan kabarnya, tegaskan bahwa lapor pajak bisa membuka pengembalian dan keringanan yang sering terlewat. Jangkau pekerja, keluarga, dan lansia yang sering kali memenuhi syarat.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "menjangkau warga",
          "desain grafis"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Pastikan keamanan dan privasi data",
        "description": "Lindungi setiap serpih data pribadi dan keuangan: perangkat yang aman, tanpa salinan yang tidak perlu, penyimpanan terkunci, dan aturan jelas kapan data disimpan dan kapan dimusnahkan.",
        "hours": 3,
        "skills": [
          "bantuan teknis"
        ]
      },
      {
        "name": "Tawarkan lanjutan penguatan keuangan",
        "description": "Kalau memang diinginkan, hubungkan orang ke bantuan mengatur uang, rekening bank yang aman, dan pengecekan bantuan sosial. Jaga agar tetap pilihan, dan arahkan situasi rumit ke profesional yang cakap.",
        "hours": 2,
        "skills": [
          "pembukuan"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Pasar komunitas / lapak hasil bumi gratis",
    "purpose": "Menjalankan lapak rutin yang gratis atau bayar semampunya untuk membagikan sayur-buah segar dan bahan pokok.",
    "whoItServes": "Tetangga yang sering kesulitan mendapat makanan dan warga di daerah tanpa bahan pangan segar yang terjangkau.",
    "whatYoullNeed": "Pasokan hasil bumi, lapak atau lokasi, orang-orang yang siap membantu, dan jadwal yang rutin.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Mulailah dari obrolan pasokan — kunjungi petani, toko, dan kebun komunitas untuk tahu kelebihan panen apa yang benar-benar ada dan seperti apa ritmenya — dan ngobrol dengan tetangga di daerah yang ingin kamu jangkau soal jalur yang biasa mereka lewati dan makanan apa yang benar-benar akan mereka bawa pulang. Pilih tempatnya bersama orang-orang yang akan memakainya, bukan atas nama mereka.",
    "commonPitfalls": "Lapak yang muncul sesukanya mengajari orang untuk berhenti mengandalkannya — konsistensi lebih penting daripada kelimpahan. Kegagalan lainnya: pasokan yang kering setelah bulan pertama yang penuh semangat, dan apa pun di meja (formulir, pertanyaan, memilah-milah orang) yang membuat mengambil makanan terasa seperti mengajukan permohonan.",
    "pairsWith": [
      "gleaning-network",
      "bulk-buying-coop",
      "community-garden"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Amankan pasokan hasil bumi dan barang",
        "description": "Cari makanan lewat memungut sisa panen, kebun komunitas, sumbangan petani dan toko, serta belanja borongan. Kejar keragaman dan keandalan supaya lapak tidak kosong.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Cari lokasi dan siapkan lapaknya",
        "description": "Pilih tempat yang terlihat, mudah dijangkau, dan berizin — pinggir taman, pelataran parkir, atau dekat halte. Siapkan meja, peneduh, dan papan penanda.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Putuskan modelnya",
        "description": "Pilih sepenuhnya gratis, bayar semampunya, atau campuran. Apa pun pilihannya, pastikan tidak ada orang yang ditolak karena tidak mampu membayar.",
        "hours": 1,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Atur tampilan, penyimpanan, dan keamanan makanan",
        "description": "Jaga hasil bumi tetap segar dan enak dilihat, tangani makanan dengan aman, dan sediakan boks pendingin atau peneduh untuk hari panas. Singkirkan apa pun yang sudah rusak.",
        "hours": 2,
        "skills": [
          "keamanan pangan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Ajak dan jadwalkan orang-orangnya",
        "description": "Susun siapa yang menjemput hasil bumi, memasang lapak, menjaga meja, dan membereskan. Bagikan peran yang jelas untuk tiap pasar.",
        "hours": 2,
        "skills": [
          "koordinasi",
          "menjangkau warga"
        ]
      },
      {
        "name": "Kabarkan dan tetapkan jadwal rutin",
        "description": "Pilih hari dan jam yang tetap lalu sebarkan kabarnya seluas-luasnya. Jadwal yang bisa ditebak itulah yang mengubah lapak menjadi sesuatu yang bisa diandalkan.",
        "hours": 2,
        "skills": [
          "menjangkau warga",
          "desain grafis"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Jalankan lapak dan urus sisanya",
        "description": "Pasang lapak, bagikan dengan hangat tanpa menghakimi, dan salurkan sisa hasil bumi ke kulkas bersama, tempat berbagi bahan makanan, atau dapur umum supaya tidak ada yang terbuang.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "welcome-wagon",
    "name": "Sambutan hangat: tetangga baru & orang tua baru",
    "purpose": "Menyambut pendatang baru dan orang tua baru dengan bantuan nyata, info lokal, dan sambutan yang sungguh-sungguh ke dalam komunitas.",
    "whoItServes": "Orang yang baru pindah, orang tua baru atau yang sedang menanti kelahiran, dan siapa pun yang butuh awal yang ramah.",
    "whatYoullNeed": "Orang-orang yang mau membantu, paket informasi, barang sambutan hasil sumbangan, dan sistem rujukan.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Bicaralah dulu dengan orang-orang yang bertemu pendatang baru sebelum kamu — pemilik kontrakan, tata usaha sekolah, klinik, bidan dan perawat anak — soal bagaimana mereka bisa merujuk seseorang dengan seizinnya. Lalu tanya beberapa orang yang baru pindah dan orang tua baru: apa yang sebenarnya akan menolong di bulan pertama mereka, dan susun paket serta bingkisannya dari jawaban itu.",
    "commonPitfalls": "Ini jadi keliru kalau terasa seperti pengawasan — muncul tak diundang di pintu orang asing, atau meneruskan nama tanpa izin, mengubah sambutan menjadi gangguan. Proyek ini juga padam pelan-pelan saat para penyambut pertama kehabisan tenaga dan pendatang baru luput dari perhatian berbulan-bulan.",
    "pairsWith": [
      "newcomer-translation-network",
      "diaper-hygiene-bank",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "invite-someone"
    ],
    "tasks": [
      {
        "name": "Tentukan siapa yang disambut dan bagaimana",
        "description": "Tentukan fokusmu — penghuni baru, orang tua baru, atau keduanya — dan bentuk sambutannya (kunjungan, bingkisan, telepon). Jaga agar selalu atas kemauan mereka dan tidak pernah memaksa.",
        "hours": 1,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Susun paket informasi lokal",
        "description": "Rangkai panduan yang jelas tentang fasilitas setempat, transportasi, sekolah, tempat berobat, dan program tolong-menolongmu. Sediakan dalam bahasa-bahasa yang dipakai di daerahmu.",
        "hours": 3,
        "skills": [
          "menulis",
          "menerjemahkan"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rangkai bingkisan sambutan",
        "description": "Kumpulkan barang yang berguna — bahan pokok dapur, perkakas rumah tangga, dan untuk orang tua baru, beberapa keperluan bayi atau masakan rumahan. Carikan lewat sumbangan.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "menjangkau warga",
          "koordinasi"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ajak dan latih para penyambut",
        "description": "Cari orang yang ramah dan latih mereka untuk hangat dan menghormati, membaca apakah seseorang ingin ditemani, dan tidak pernah mendesak atau mengorek-ngorek.",
        "hours": 2,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ]
      },
      {
        "name": "Siapkan jalur rujukan dan cara ikut",
        "description": "Buat cara sederhana agar orang bisa dirujuk atau menyatakan mau disambut — lewat pemilik kontrakan, klinik, sekolah, atau formulir sederhana. Jaga privasi di setiap langkahnya.",
        "hours": 2,
        "skills": [
          "koordinasi",
          "input data"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Perpustakaan barang",
    "purpose": "Meminjamkan barang rumah tangga dan perlengkapan acara yang jarang perlu dimiliki sendiri — alat dapur, perlengkapan pesta dan berkemah, peralatan bayi, proyektor, dan banyak lagi.",
    "whoItServes": "Siapa saja; menghemat uang, mengurangi barang menumpuk, dan mengurangi sampah.",
    "whatYoullNeed": "Tempat penyimpanan, barang sumbangan, katalog dan sistem peminjaman, serta dua orang pustakawan.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Sebelum mengumpulkan satu barang pun, tanya anggota apa yang benar-benar akan mereka pinjam — survei itulah fondasi proyeknya — dan bicarakan dengan perpustakaan umum atau balai warga soal menumpang tempat, karena lembaga yang sudah dipercaya menyelesaikan urusan penyimpanan dan kepercayaan sekaligus. Cari dua pustakawanmu sebelum sumbangan berdatangan, bukan sesudahnya.",
    "commonPitfalls": "Perpustakaan barang mati karena tumpukan: mengiyakan setiap sumbangan memenuhi ruangan dengan mesin pembuat roti rusak yang tak ada yang mau, sementara mesin steam yang diminta semua orang justru tak kunjung ada. Pembunuh lainnya jam buka yang tak menentu — kalau orang tidak bisa memastikan kapan mengambil dan mengembalikan, diam-diam mereka kembali membeli.",
    "pairsWith": [
      "tool-lending-library",
      "toy-library",
      "free-store"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Survei apa yang ingin dipinjam warga",
        "description": "Tanya anggota apa yang akan mereka pakai tapi malas beli — meja lipat, mangkuk saji besar, tenda, mesin pembersih karpet, stroller bayi. Jawabannya menentukan koleksi awalmu.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari tempat penyimpanan dan jam buka",
        "description": "Amankan lemari, ruangan, atau kontainer untuk menyimpan barang, dan tetapkan jam ambil-kembali yang bisa ditebak supaya meminjam itu mudah.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Kumpulkan, bersihkan, dan uji barang",
        "description": "Kumpulkan sumbangan, lalu bersihkan, uji, dan periksa keamanan tiap barang. Sisihkan apa pun yang rusak, kena penarikan produk, atau tidak higienis.",
        "hours": 5,
        "skills": [
          "menyetir"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Katalogkan dan foto semua barang",
        "description": "Catat tiap barang beserta foto dan kondisinya di spreadsheet atau aplikasi peminjaman. Beri nomor supaya mudah dilacak keluar-masuknya.",
        "hours": 4,
        "skills": [
          "input data",
          "memotret"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tulis aturan pinjam dan asas percaya",
        "description": "Tetapkan lama pinjam, batas jumlah, dan aturan pengembalian yang pemaaf. Bangun di atas rasa percaya, bukan denda, dan catat barang yang butuh perawatan atau pembersihan ekstra.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Siapkan pencatatan pinjam dan latih pustakawan",
        "description": "Buat pencatatan keluar yang sederhana (nama, kontak, barang, tanggal kembali) plus foto kondisi singkat. Ajak para pustakawan menyusuri katalog dan alurnya.",
        "hours": 3,
        "skills": [
          "input data",
          "mengajar"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Rawat, bersihkan, dan kembangkan koleksi",
        "description": "Bersihkan dan periksa barang yang kembali, perbaiki yang bisa, dan tambahkan barang yang paling banyak diminta seiring waktu.",
        "hours": 2,
        "skills": [
          "memperbaiki"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Program akses cuci baju & mandi",
    "purpose": "Membuka akses cuci baju dan mandi tanpa biaya supaya semua orang bisa tetap bersih dengan bermartabat.",
    "whoItServes": "Tetangga yang hidup tanpa rumah, orang yang fasilitas di rumahnya tidak berfungsi, dan keluarga berpenghasilan rendah.",
    "whatYoullNeed": "Akses ke mesin cuci dan kamar mandi (tempat mitra atau unit keliling), perlengkapan, dan orang-orang yang siap membantu. Martabat dan privasi tamu nomor satu — jangan minta data pribadi apa pun untuk ikut, jaga area mandi tetap tertutup dan aman, dan ikuti aturan kesehatan setempat untuk fasilitas bersama atau keliling.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Mulailah dengan dua rangkaian obrolan: dengan tetangga yang hidup tanpa rumah dan para pendamping lapangan yang mengenal mereka, soal jam dan lokasi mana yang benar-benar cocok — dan dengan pemilik usaha laundry, gym, atau rumah ibadah soal menjadi tuan rumah. Obrolan dengan tuan rumah itu perlu hati-hati; jujurlah soal siapa yang akan datang dan sepakati soal privasi, kebersihan, dan jadwal sebelum tamu pertama tiba.",
    "commonPitfalls": "Program ini mati saat hubungan dengan tuan rumah memburuk — satu kejadian buruk tanpa aturan main di baliknya, dan tempat itu hilang — atau saat jamnya berpindah-pindah sampai orang menyeberangi kota hanya untuk menemukan pintu terkunci. Dan tiap lembar isian yang kamu wajibkan di pintu menjauhkan seseorang yang lebih butuh mandi daripada kamu butuh namanya.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Amankan akses cuci baju dan mandi",
        "description": "Bermitralah dengan usaha laundry, gym, rumah ibadah, gelanggang olahraga, atau atur unit keliling. Pastikan waktunya bisa diandalkan dan tempatnya menjaga privasi.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari perlengkapan",
        "description": "Kumpulkan deterjen, handuk bersih, sabun, sampo, dan keperluan mandi lain lewat sumbangan atau anggaran kecil. Sertakan pakaian bersih kalau bisa.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Siapkan sistem tulis nama dan pembagian sesi",
        "description": "Buat cara yang adil untuk mengambil jatah cuci dan sesi mandi supaya waktu tunggu masuk akal dan semua orang kebagian.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "input data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tetapkan tata cara kebersihan dan keamanan",
        "description": "Atur rutinitas bersih-bersih di antara pemakaian, pastikan area mandi tertutup dan aman, dan jaga martabat serta keselamatan semua orang dari awal sampai akhir.",
        "hours": 3,
        "skills": [
          "menulis"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ajak dan latih orang-orang yang membantu",
        "description": "Cari orang untuk menyambut tamu, mengurus perlengkapan, dan membersihkan di antara pemakaian. Latih mereka memperlakukan setiap tamu dengan hangat dan hormat.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Tetapkan jadwal dan sebarkan kabarnya",
        "description": "Pilih jam yang tetap dan kabari para pendamping lapangan, penampungan, dan tetangga yang hidup di jalanan kapan dan di mana tempat ini buka.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Gerakan pendaftaran pemilih & keterlibatan warga",
    "purpose": "Mendaftarkan pemilih dan membantu orang ikut serta dalam pemilu serta keputusan-keputusan lokal — ketat nonpartisan.",
    "whoItServes": "Warga yang berhak memilih, terutama mereka yang selama ini kurang terwakili di bilik suara.",
    "whatYoullNeed": "Orang-orang terlatih, bahan pendaftaran, aturan yang akurat, dan lokasi yang bagus. Jaga gerakan ini ketat nonpartisan dan patuhi semua hukum pemilu dan pendaftaran dengan cermat — berikan hanya informasi akurat dan jangan pernah mengarahkan ke partai atau kandidat mana pun.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Sebelum ada yang membuka meja, bicaralah dengan kantor pemilu setempat — mereka akan memberi tahu persis apa yang boleh dan tidak boleh dilakukan gerakan pendaftaran, dan beberapa daerah mensyaratkan pelatihan atau pendaftaran lebih dulu. Lalu hubungi League of Women Voters atau kelompok nonpartisan mapan lainnya; meminjam bahan dan pengalaman mereka jauh lebih baik daripada belajar hukum pemilu lewat coba-coba.",
    "commonPitfalls": "Kegagalan yang tak termaafkan adalah yang menyangkut hukum: setumpuk formulir terisi yang terlupa di bagasi mobil sampai lewat tenggat membuat setiap orang yang percaya padamu kehilangan hak pilihnya, dan satu orang saja yang menjagokan kandidat bisa mencoreng seluruh gerakan. Luputan yang lebih halus: membagikan formulir pendaftaran tanpa pernah menyinggung di mana dan bagaimana cara mencoblos.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Pelajari aturan gerakan pendaftaran",
        "description": "Telusuri hukum daerahmu soal mendaftarkan pemilih: tenggat, apa yang boleh dan tidak boleh dilakukan, bagaimana formulir harus ditangani, dan syarat identitas. Mematuhinya dengan tepat itu mutlak.",
        "hours": 3,
        "skills": [
          "urusan berkas"
        ]
      },
      {
        "name": "Latih orang-orang agar nonpartisan",
        "description": "Latih mereka membantu siapa pun mendaftar apa pun pandangannya, dan tidak pernah menjagokan partai atau kandidat. Sikap nonpartisan melindungi gerakan ini dan kepercayaan komunitas.",
        "hours": 3,
        "skills": [
          "mengajar"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kumpulkan bahan dan informasi akurat",
        "description": "Kumpulkan formulir pendaftaran serta info terkini yang sudah dicek kebenarannya soal tenggat, aturan identitas, lokasi TPS, dan pilihan lewat pos. Info keliru lebih merusak daripada tidak ada info.",
        "hours": 2,
        "skills": [
          "menulis"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Pilih tempat dan acara yang ramai",
        "description": "Buka meja di tempat warga yang berhak memilih memang berkumpul — pasar, terminal, kampus, acara komunitas — lengkap dengan izin yang diperlukan.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Jalankan meja pendaftaran",
        "description": "Jaga mejanya, bantu orang mendaftar dengan benar, dan serahkan formulir segera dalam tenggat hukum. Jaga suasananya ramah dan penuh informasi.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Bantu langkah selanjutnya",
        "description": "Lebih dari sekadar mendaftar, bantu orang tahu bagaimana, kapan, dan di mana mencoblos, termasuk pilihan lewat pos dan tumpangan ke TPS. Terdaftar saja belum berarti ikut serta.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Program pemandu kesehatan komunitas",
    "purpose": "Membantu tetangga menemukan dan menjangkau tempat berobat — klinik, asuransi, resep obat, dan janji temu.",
    "whoItServes": "Orang tanpa asuransi atau yang asuransinya tidak memadai, lansia, pendatang baru, dan siapa pun yang tersesat di sistem kesehatan.",
    "whatYoullNeed": "Pemandu terlatih, direktori sumber bantuan, hubungan baik dengan klinik dan tenaga kesehatan, dan sistem permintaan. Pemandu menghubungkan orang ke tempat berobat — bukan memberi saran medis atau diagnosis. Arahkan semua pertanyaan klinis ke tenaga kesehatan profesional.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Mulailah dengan mengunjungi klinik gratis dan klinik bertarif sesuai kemampuan yang akan kamu tuju — perkenalkan diri, tanya rujukan seperti apa yang menolong mereka dan yang mana yang bikin kewalahan, dan biarkan obrolan itu menjadi benih direktorimu. Sepakati batasnya sebelum permintaan pertama masuk: pemandu mengurus logistik dan berkas, setiap pertanyaan klinis diserahkan ke profesional — jadi ketahui persis hotline perawat atau klinik mana yang akan menerimanya.",
    "commonPitfalls": "Sisi tajamnya adalah pemandu berniat baik yang keterusan memberi saran medis — ucapan ringan “kayaknya bukan apa-apa” bisa membuat seseorang kehilangan berminggu-minggu perawatan yang dia butuhkan. Ini juga gagal saat direktori diam-diam basi, mengirim orang ke klinik yang sudah tutup atau program yang sudah berakhir; satu nomor yang salah bisa menghabiskan kesempatan terakhir orang yang sudah nyaris menyerah.",
    "pairsWith": [
      "rides-transportation",
      "newcomer-translation-network",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Susun direktori sumber bantuan kesehatan",
        "description": "Himpun klinik gratis dan murah, tempat praktik bertarif sesuai kemampuan, program bantuan resep obat, pilihan perawatan gigi dan mata, serta dukungan kesehatan jiwa. Jaga tetap mutakhir.",
        "hours": 6,
        "skills": [
          "input data",
          "menjangkau warga"
        ]
      },
      {
        "name": "Ajak dan latih para pemandu",
        "description": "Cari orang dan latih mereka menghubungkan warga ke tempat berobat — bukan memberi saran medis. Tugas mereka arahan dan logistik; pertanyaan klinis diserahkan ke profesional.",
        "hours": 5,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ]
      },
      {
        "name": "Siapkan jalur permintaan dan penerimaan",
        "description": "Buat cara yang privat dan mudah bagi orang untuk minta tolong dan menceritakan keadaannya, dengan pilihan telepon dan tatap muka, bukan cuma daring.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Bantu urusan asuransi dan pendaftarannya",
        "description": "Dampingi orang memahami dan mengajukan perlindungan yang menjadi haknya (seperti Medicaid atau asuransi bersubsidi lain) serta melengkapi dokumen yang dibutuhkan.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "urusan berkas"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tawarkan bantuan janji temu dan resep obat",
        "description": "Bantu mengatur janji temu, memasang pengingat, menyiasati biaya resep obat, dan menyambungkan ke program tumpangan untuk berangkat berobat.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tetapkan aturan privasi untuk informasi kesehatan",
        "description": "Perlakukan semua detail kesehatan sebagai hal yang sangat sensitif: kumpulkan seminimal mungkin, simpan dengan aman, dan jangan pernah bagikan tanpa izin. Latih para pemandu soal kerahasiaan.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Bangun kemitraan dengan klinik dan tenaga kesehatan",
        "description": "Rawat hubungan dengan klinik dan tenaga kesehatan setempat supaya rujukan lebih lancar dan kamu tahu lebih awal saat ada tempat berobat murah yang baru buka.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Perpustakaan mainan & peminjaman alat bermain",
    "purpose": "Meminjamkan mainan, permainan, dan alat bermain supaya keluarga bisa menikmati ragamnya tanpa harus membeli.",
    "whoItServes": "Keluarga dengan anak kecil, terutama yang keuangannya pas-pasan; juga mengurangi sampah dan tumpukan barang.",
    "whatYoullNeed": "Tempat penyimpanan, mainan sumbangan, katalog dan pencatatan pinjam, alat kebersihan, dan pustakawan.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Ngobrollah dengan keluarga yang ingin kamu bantu — saat jemput anak di penitipan, di sesi dongeng, di kelompok bermain — tentang mainan apa yang paling cepat ditinggalkan anak mereka dan jam mana yang benar-benar bisa mereka datangi, lalu tanyakan ke balai warga, gereja, atau perpustakaan terdekat soal satu rak atau satu ruangan. Siapkan satu penolong yang paham dunia anak untuk memegang pemeriksaan keamanan sebelum sumbangan mulai berdatangan.",
    "commonPitfalls": "Perpustakaan mainan gagal karena keamanan dan kepingan: satu saja mainan kena penarikan produk atau berisiko tersedak yang lolos, kepercayaan keluarga putus untuk selamanya, dan puzzle yang pulang kurang satu keping membuat seluruh koleksi terasa rongsokan dalam hitungan bulan. Pemeriksaan ketat dan kantong berhitung adalah intinya.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Cari tempat simpan dan tentukan jam buka",
        "description": "Amankan rak di balai warga, perpustakaan, atau ruang bersama, dan tetapkan jam ambil dan jam kembali yang tetap supaya keluarga bisa mengatur rencana.",
        "hours": 1.5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Kumpulkan, bersihkan, dan periksa keamanan mainan",
        "description": "Kumpulkan sumbangan, lalu bersihkan dan periksa tiap mainan. Cek penarikan produk, bagian yang patah, dan risiko tersedak, dan sisihkan apa pun yang tak aman untuk anak kecil.",
        "hours": 3.5,
        "skills": [
          "menyetir",
          "mengasuh anak"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Catat di katalog dan kantongi lengkap kepingannya",
        "description": "Catat tiap mainan dengan foto dan rentang usia, dan masukkan set berkeping banyak ke kantong dengan jumlah tertulis supaya tak ada yang hilang. Beri nomor supaya mudah dilacak.",
        "hours": 2,
        "skills": [
          "input data",
          "memotret"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tulis aturan pinjam",
        "description": "Tentukan lama pinjam, berapa mainan sekaligus, dan aturan yang lembut soal pengembalian dan keping hilang. Jaga tetap berbasis percaya dan pemaaf.",
        "hours": 1,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Siapkan pencatatan pinjam dan latih pustakawan",
        "description": "Buat lembar pinjam sederhana (nama, kontak, barang, tanggal kembali) dan ajak para penolong mengenal katalog, rutinitas bersih-bersih, dan aturannya.",
        "hours": 2,
        "skills": [
          "input data",
          "mengajar"
        ],
        "follows": [
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "food-preservation",
    "name": "Kolektif pengawetan & pengalengan makanan",
    "purpose": "Mengajarkan dan mengerjakan pengalengan serta pengawetan bersama supaya panen berlimpah awet dan makanan tak terbuang.",
    "whoItServes": "Para pekebun, pemungut sisa panen, dan keluarga yang ingin makanannya cukup sepanjang tahun.",
    "whatYoullNeed": "Dapur, alat pengalengan dan pengawetan, pemandu yang paham, dan bahan pangan. Pengawetan rumahan membawa risiko keamanan pangan yang nyata, termasuk botulisme, kalau dikerjakan keliru — selalu ikuti panduan teruji terbaru dari sumber terpercaya dan jangan pernah mengarang sendiri waktu atau cara pemrosesan.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Temukan ilmunya sebelum dapurnya: hubungi dinas penyuluhan setempat atau ahli pengawetan pangan bersertifikat dan minta mereka melatih para pemandumu atau meninjau rencanamu, lalu ngobrol dengan pekebun dan pemungut sisa panen tentang panen apa yang benar-benar memuncak dan kapan. Pesan dapurnya mengikuti kalender panen, bukan sebaliknya.",
    "commonPitfalls": "Kegagalan yang paling berbahaya justru tak terlihat: stoples yang disegel dengan cara karangan sendiri atau resep nenek yang tak teruji bisa membawa botulisme dan tampak baik-baik saja di rak. Kegagalan yang biasa adalah soal waktu — tomat matang mengikuti jadwalnya sendiri, dan kolektif yang baru menggelar sesi pertama di bulan November tak mengawetkan apa-apa.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Amankan dapur yang layak",
        "description": "Temukan dapur dengan kompor, meja kerja, dan air untuk pemrosesan dan bersih-bersih. Aula gereja, balai warga, atau dapur komersial cocok untuk ini.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Pelajari cara pengawetan yang aman",
        "description": "Minta para pemandumu mempelajari metode teruji dan berbasis riset dari sumber yang diakui (misalnya dinas penyuluhan universitas). Pengalengan yang keliru bisa menyebabkan sakit parah, jadi selalu ikuti resep dan waktu pemrosesan teruji dengan persis.",
        "hours": 4,
        "skills": [
          "keamanan pangan",
          "memasak"
        ]
      },
      {
        "name": "Kumpulkan alat dan stoples",
        "description": "Kumpulkan panci pengalengan rendam air dan/atau bertekanan, stoples, tutup, dan perkakas lewat sumbangan atau dana kecil. Pastikan panci bertekanan masih aman dipakai.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Cari bahan pangan",
        "description": "Datangkan panen musiman berlimpah dari pemungutan sisa panen, kebun, ladang, atau belanja borongan. Atur sesi saat bahan sedang banyak dan murah.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Rencanakan sesi pengalengan bersama",
        "description": "Pilih resep yang cocok dengan bahan dan tingkat kemampuan kelompok, dan susun pos-pos kerja supaya alurnya aman dan lancar.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "memasak",
          "koordinasi"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Ajari dan pandu sesi dengan aman",
        "description": "Pandu kelompok melewati seluruh proses, dengan disiplin pada penanganan aman, waktu pemrosesan yang benar, dan penyegelan yang rapat. Jadikan sesi belajar supaya keahliannya menyebar.",
        "hours": 4,
        "skills": [
          "memasak",
          "mengajar"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Bagikan hasil awetan dan catat",
        "description": "Bagi hasil awetan ke peserta dan proyek lain seperti kulkas komunitas atau rak pangan. Beri label tiap stoples dengan isi dan tanggal, dan catat apa yang berhasil untuk kali berikutnya.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Hari potong rambut & rapi diri gratis",
    "purpose": "Menawarkan potong rambut dan perawatan diri gratis untuk memulihkan martabat, percaya diri, dan awal yang baru.",
    "whoItServes": "Tetangga tunawisma, pencari kerja, keluarga berpenghasilan rendah, dan para lansia.",
    "whatYoullNeed": "Penata rambut dan tukang cukur berlisensi yang mau membantu, tempat, perlengkapan, dan sanitasi.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Mulailah dengan dua obrolan: satu dengan penata rambut atau tukang cukur berlisensi yang bersedia mengajak rekannya, satu lagi dengan orang-orang yang ingin kamu bantu — rumah singgah, pusat kegiatan harian, atau program pencari kerja bisa memberi tahu hari dan suasana seperti apa yang benar-benar terasa nyaman. Begitu penata rambut dan tempat tuan rumah sama-sama bilang ya, sisanya tinggal perlengkapan dan jadwal.",
    "commonPitfalls": "Proyek ini tersandung ketika terasa seperti antrean amal alih-alih salon — potongan terburu-buru, tak boleh memilih gaya, kamera keluar demi media sosial. Tanyai tiap orang apa maunya, jangan memotret kecuali mereka sendiri yang menawarkan, dan jangan pernah membiarkan orang tanpa lisensi ikut memotong demi menambah kapasitas; satu masalah kebersihan bisa mengakhiri seluruh program.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Ajak penata rambut dan tukang cukur berlisensi",
        "description": "Cari profesional yang mau menyumbangkan keahliannya. Praktisi berlisensi menjaga hasil yang aman dan rapi serta sanitasi yang benar.",
        "hours": 2.5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari tempat dengan sanitasi memadai",
        "description": "Amankan tempat dengan akses air, cahaya bagus, dan permukaan yang mudah dibersihkan — balai warga, salon di luar jam buka, atau rumah ibadah.",
        "hours": 1.5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Kumpulkan alat dan perlengkapan",
        "description": "Kumpulkan alat cukur, gunting, kain penutup, sisir, cermin, dan barang sekali pakai. Sertakan bekal rapi diri seperti pisau cukur dan perlengkapan mandi untuk dibawa pulang.",
        "hours": 2,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Siapkan sanitasi dan patuhi aturan lisensi",
        "description": "Terapkan sterilisasi alat antar-tamu dan ikuti aturan setempat soal memotong rambut untuk umum. Kebersihan melindungi semua orang.",
        "hours": 1.5,
        "skills": [
          "urusan berkas"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Gelar hari rapi diri",
        "description": "Jalankan acaranya, jaga suasana hangat dan penuh hormat, dan perlakukan tiap orang sebagai tamu yang dihargai, bukan penerima belas kasihan.",
        "hours": 2.5,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "mutual-aid-moving-crew",
    "name": "Regu pindahan tolong-menolong",
    "purpose": "Membantu pindah rumah bagi yang tak sanggup membayar tukang pindahan — yang meninggalkan situasi tak aman, terancam diusir, atau pindah ke tempat lebih kecil.",
    "whoItServes": "Tetangga berpenghasilan rendah, orang yang menyelamatkan diri dari rumah yang tak aman, lansia, dan tetangga difabel.",
    "whatYoullNeed": "Penolong dengan kendaraan dan tenaga, perlengkapan pindahan, dan aturan keselamatan yang jelas. Untuk siapa pun yang meninggalkan situasi tak aman, jaga alamat baru, tanggal, dan detailnya benar-benar rahasia, dan ikuti keputusan orang itu soal waktu dan keamanannya.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Sebelum mencari satu truk pun, ngobrollah dengan mereka yang sudah biasa menerima permintaan seperti ini — pendamping korban KDRT, penggerak hak penyewa, pendamping lansia — tentang bagaimana permintaan sebaiknya sampai ke kamu dan kerahasiaan seperti apa yang mereka harapkan, karena sebagian pindahan berarti seseorang meninggalkan rumah yang tak aman. Lalu kumpulkan tiga-empat penolong bertenaga kuat dan satu kendaraan, dan ukur bersama pindahan kecil pertamamu.",
    "commonPitfalls": "Regu pindahan cepat cedera atau kehabisan tenaga: pekerjaan kelewat besar dengan tangan terlalu sedikit, penolong yang salah cara mengangkat, alamat yang tersebar di grup chat padahal seharusnya tak pernah keluar dari ponsel koordinator. Jaga pindahan tetap dalam batas yang sudah kalian tetapkan, dan perlakukan detail tiap pindahan yang menyangkut keselamatan seolah bisa membahayakan seseorang — karena memang bisa.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Kumpulkan regu dan kendaraan",
        "description": "Kumpulkan penolong yang mampu mengangkat dan memikul dengan aman, plus akses ke truk atau mobil bak. Simpan daftar nama beserta waktu kosongnya supaya regu bisa terbentuk cepat.",
        "hours": 2.5,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Kumpulkan perlengkapan pindahan",
        "description": "Kumpulkan troli, tali pengikat perabot, selimut pindahan, dan kardus yang bisa dipakai ulang lewat sumbangan. Perlengkapan bersama bikin pindahan lebih cepat dan aman.",
        "hours": 1.5,
        "skills": [
          "menyetir"
        ]
      },
      {
        "name": "Bangun alur permintaan dan penakaran",
        "description": "Buat cara meminta bantuan dan menakar tiap pindahan: seberapa banyak barangnya, tangga atau lift, jarak, dan waktunya. Dari sini kamu bisa merencanakan jumlah regu dan alat.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Bereskan keselamatan dan tanggung jawab",
        "description": "Latih penolong mengangkat dengan aman, pakai surat pernyataan sederhana, dan cek asuransi tiap kendaraan yang dipakai. Melindungi penolong dan yang dibantu itu penting.",
        "hours": 2,
        "skills": [
          "urusan berkas"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Atur jadwal dan pembagian tugas",
        "description": "Cocokkan permintaan dengan regu yang tersedia dan konfirmasi ke semua orang sehari sebelumnya. Simpan daftar cadangan karena pindahan sulit ditunda.",
        "hours": 1.5,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Tetapkan cakupan dan batas",
        "description": "Putuskan apa yang kalian tangani dan apa yang tidak (tanpa bahan berbahaya, piano, atau pekerjaan di luar kemampuan aman regu). Arahkan yang begitu ke tempat lain.",
        "hours": 1,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Jalankan pindahan dan tindak lanjut",
        "description": "Laksanakan pindahan dengan aman dan penuh hormat, lalu pastikan orangnya sudah mapan. Sambungkan mereka ke proyek lain (toko gratis, penyambut warga baru) sesuai kebutuhan.",
        "hours": 3.5,
        "skills": [
          "menyetir"
        ],
        "follows": [
          1,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "disability-support-network",
    "name": "Jaringan dukungan difabel & aksesibilitas",
    "purpose": "Mengorganisasi tetangga difabel dan para sekutunya untuk saling dukung, aksesibilitas, dan advokasi — dipimpin oleh difabel sendiri.",
    "whoItServes": "Tetangga difabel dan yang hidup dengan penyakit kronis.",
    "whatYoullNeed": "Sistem komunikasi yang aksesibel, pemimpin sebaya, dan direktori sumber daya. Dukungan sebaya melengkapi perawatan profesional — arahkan pertanyaan medis, perawatan pribadi, dan hukum ke ahli yang berkompeten, dan perlakukan informasi kesehatan anggota sebagai hal pribadi.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Jaringan ini hanya berjalan kalau tetangga difabel duduk di meja sejak obrolan paling pertama — bukan dimintai pendapat belakangan, tapi ikut menentukan jaringan ini mau jadi apa. Mulailah dengan mengajak dua-tiga difabel yang kamu kenal untuk mendirikannya bersamamu (atau, kalau kamu sendiri difabel, untuk berbagi beban), dan biarkan kebutuhan akses mereka membentuk pertemuan pertama: format, tempat, sampai temponya.",
    "commonPitfalls": "Kegagalan klasiknya adalah sekutu berniat baik membangun program untuk difabel yang tak pernah diminta difabel sendiri, dalam format yang tak bisa mereka pakai. Yang lebih senyap: pelan-pelan berubah jadi perawatan informal — dukungan sebaya tak bisa menggantikan perawatan medis atau perawatan pribadi dengan aman, jadi teruslah mengarahkan kebutuhan itu ke ahli yang berkompeten dan jaga detail kesehatan anggota seperti rahasia pribadi yang memang begitu adanya.",
    "pairsWith": [
      "neighborhood-care-network",
      "rides-transportation",
      "health-navigation"
    ],
    "learnMore": [
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Utamakan kepemimpinan difabel",
        "description": "Pastikan anggota difabel yang memimpin dan membentuk jaringan ini. “Tak ada apa pun tentang kami tanpa kami” adalah prinsip intinya — sekutu mendukung, bukan mengarahkan.",
        "hours": 3,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Bangun sistem komunikasi yang aksesibel",
        "description": "Sediakan banyak cara ikut serta (telepon, SMS, daring, tatap muka), pakai bahasa yang sederhana, dan pastikan semua materi terbaca pembaca layar dan ramah beragam kebutuhan.",
        "hours": 3,
        "skills": [
          "aksesibilitas",
          "bantuan teknis"
        ]
      },
      {
        "name": "Petakan kebutuhan dan sumber daya",
        "description": "Pelajari apa yang anggota butuhkan dan catat sumber daya setempat: angkutan yang aksesibel, sumber alat bantu, dinas terkait, dan bantuan mengurus tunjangan. Temukan celah terbesarnya.",
        "hours": 5,
        "skills": [
          "menjangkau warga",
          "input data"
        ]
      },
      {
        "name": "Siapkan pertukaran saling dukung",
        "description": "Buat cara bagi anggota untuk memberi dan menerima bantuan — titip belanja, kawan pendamping ke janji temu, saling menyapa — dicocokkan dengan kapasitas dan kebutuhan.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Bangun peminjaman alat bantu bersama",
        "description": "Kumpulkan dan pinjamkan alat bantu gerak dan alat asistif, disanitasi tiap ganti pemakai. Banyak alat cuma teronggok begitu tak lagi terpakai atau sudah tak muat.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "koordinasi"
        ]
      },
      {
        "name": "Tawarkan pendampingan advokasi dan urusan",
        "description": "Bantu anggota mengurus tunjangan, akomodasi, dan bantuan resmi. Bagikan informasi dan temani prosesnya, dan arahkan pertanyaan hukum dan medis ke ahli yang berkompeten.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "urusan berkas"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tetapkan standar aksesibilitas semua acara program",
        "description": "Susun daftar periksa (akses tempat, tempat duduk, juru bahasa, kebutuhan sensorik, materi) supaya tiap proyek dalam program besarmu ramah untuk anggota difabel.",
        "hours": 3,
        "skills": [
          "aksesibilitas",
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Buku untuk penghuni penjara & program tulis surat",
    "purpose": "Mengirim buku dan surat gratis ke orang-orang di penjara untuk mengurangi keterasingan dan mendukung belajar.",
    "whoItServes": "Orang-orang yang sedang dipenjara dan, lewat mereka, keluarga dan komunitasnya.",
    "whatYoullNeed": "Buku sumbangan, para penolong, ongkos kirim, dan pengetahuan tentang aturan surat-menyurat tiap lapas. Aturan kiriman tiap lapas ketat dan berbeda-beda — paket yang melanggar akan ditolak, jadi ikuti persis, dan pastikan penolong selalu memakai alamat program, jangan pernah alamat rumah.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Sebelum mengumpulkan satu buku pun, hubungi kelompok pengirim buku ke penjara yang sudah mapan — kebanyakan dengan senang hati berbagi lapas mana yang sudah mereka jangkau, aturan mana yang sering menjegal, dan di mana permintaan tak terjawab. Lalu minta kebijakan surat-menyurat terbaru secara tertulis dari satu-dua lapas tempat kalian akan memulai; yang seharusnya membentuk koleksimu adalah apa yang benar-benar diminta penghuni penjara, bukan apa pun yang kebetulan disingkirkan penyumbang dari raknya.",
    "commonPitfalls": "Proyek ini mati oleh paket yang ditolak: buku bekas di tempat yang hanya menerima baru, sampul keras, aturan label yang terlupa — ongkos kirim melayang dan paket yang lama dinanti seseorang dikembalikan. Ia juga bisa mencelakai penolong yang menulis dari rumah; tiap surat keluar dengan alamat program, tanpa kecuali, sehangat apa pun surat-menyuratnya.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Pelajari aturan kiriman tiap lapas",
        "description": "Tiap penjara punya aturan ketat dan spesifik — banyak yang mensyaratkan buku baru dan dikirim langsung dari penerbit atau toko yang disetujui, dengan batasan isi dan jumlah. Telitilah, karena kiriman yang melanggar aturan pasti ditolak.",
        "hours": 5,
        "skills": [
          "urusan berkas"
        ]
      },
      {
        "name": "Kumpulkan buku dan ruang kerja",
        "description": "Kumpulkan buku sumbangan (sesuai aturan lapas) dan siapkan area sortir dan pengepakan. Jaga koleksi tetap beragam: kamus, buku pelajaran, fiksi, dan bekal kembali ke masyarakat paling sering diminta.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Siapkan pencatatan permintaan",
        "description": "Buat alur menerima dan melacak permintaan dari penghuni penjara, yang berkirim surat berisi topik atau judul. Cocokkan permintaan dengan buku yang ada.",
        "hours": 3,
        "skills": [
          "input data",
          "koordinasi"
        ]
      },
      {
        "name": "Ajak dan latih para penolong",
        "description": "Latih penolong mencocokkan permintaan, mengepak sesuai aturan tiap lapas, dan menulis catatan yang tulus. Ketelitian pada aturan mencegah ongkos kirim terbuang dan paket ditolak.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tanggung ongkos kirim dan logistik",
        "description": "Ongkos kirim adalah biaya rutin terbesar. Galang dana untuknya, pakai pengiriman termurah yang sesuai aturan, dan jadwalkan hari-hari kirim rutin.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Susun program sahabat pena",
        "description": "Pasangkan penolong sebagai sahabat pena bila diinginkan, dengan pedoman keamanan dan privasi yang jelas (pakai alamat program, bukan alamat pribadi). Rasa terhubung sama pentingnya dengan buku.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Program musik & alat musik komunitas",
    "purpose": "Meminjamkan alat musik dan menawarkan les gratis serta sesi main bareng supaya musik terjangkau untuk semua.",
    "whoItServes": "Anak-anak dan orang dewasa yang tak mampu membeli alat musik atau membayar les.",
    "whatYoullNeed": "Alat musik sumbangan, pengajar yang mau membantu, tempat, dan pencatatan pinjam.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Mulailah dari para pemusik yang sudah ada di sekitarmu — gitaris gereja di ujung jalan, pensiunan pelatih band, para remaja yang suka main — dan tanyakan apa yang mereka senang ajarkan dan kapan. Satu obrolan dengan toko musik soal keringanan biaya perbaikan, satu lagi dengan tempat yang tak keberatan berisik, dan kamu sudah hampir sampai ke sesi main bareng pertamamu.",
    "commonPitfalls": "Stok alat pinjam diam-diam menyusut ketika alat musik keluar lebih cepat daripada kembalinya dalam kondisi layak main, jadi anggarkan waktu perbaikan sejak awal dan buat aturan pengembalian yang pemaaf tapi sungguh-sungguh. Dan awasi jangan sampai les condong ke yang sudah percaya diri: anak yang belum pernah menyentuh alat musik butuh sambutan paling hangat, bukan jatah waktu paling pendek.",
    "pairsWith": [
      "library-of-things",
      "skill-share",
      "youth-mentorship"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Kumpulkan dan perbaiki alat musik",
        "description": "Kumpulkan alat musik sumbangan dan pastikan dibersihkan, diganti senar, atau diperbaiki sampai layak main. Susun campuran lintas jenis dan tingkat kemampuan.",
        "hours": 5,
        "skills": [
          "memperbaiki",
          "menyetir"
        ]
      },
      {
        "name": "Siapkan pencatatan pinjam alat musik",
        "description": "Buat catatan pinjam yang melacak siapa memegang apa, dengan petunjuk perawatan dan aturan pengembalian yang pemaaf. Beri nomor dan catat tiap alat.",
        "hours": 2,
        "skills": [
          "input data"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ajak pengajar yang mau membantu",
        "description": "Cari pemusik yang mau sabar mengajar pemula. Tak perlu profesional — semangat dan kemampuan dasar sudah sangat membantu.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "musik"
        ]
      },
      {
        "name": "Cari tempat untuk les dan main bareng",
        "description": "Amankan ruangan yang boleh berisik — balai warga, sekolah, atau aula rumah ibadah. Tetapkan jadwal tetap untuk les dan main bebas.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Jadwalkan les dan sesi main bareng",
        "description": "Buka les pemula dan sesi main bareng untuk semua tingkat. Buat tulis nama gampang dan jamnya beragam untuk yang bekerja atau bersekolah.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Tetapkan harapan rawat dan pengembalian",
        "description": "Ajari peminjam perawatan dasar alat musik dan apa yang harus dilakukan kalau ada yang rusak. Jaga tetap berbasis percaya dan mendukung, bukan menghukum.",
        "hours": 1,
        "skills": [
          "menulis"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Program perlengkapan sekolah & tas sekolah",
    "purpose": "Menyediakan perlengkapan sekolah dan tas gratis supaya anak-anak memulai tahun ajaran dengan siap dan percaya diri.",
    "whoItServes": "Keluarga berpenghasilan rendah dengan anak usia sekolah.",
    "whatYoullNeed": "Sumbangan perlengkapan atau dana, tempat simpan, titik pembagian, dan para penolong.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Obrolan pertamamu adalah dengan sekolah — guru BK, penghubung keluarga, atau koordinator orang tua yang tahu daftar perlengkapan yang sebenarnya dan keluarga mana yang diam-diam tak punya. Biarkan mereka menentukan apa yang kamu kumpulkan dan bagaimana keluarga mendengarnya; pembagian yang lewat orang-orang yang sudah dipercaya para orang tua akan sampai ke anak-anak yang tak akan pernah terjangkau selebaran.",
    "commonPitfalls": "Kegagalan yang gampang ditebak adalah gunungan map sumbangan tanpa satu pun buku tulis yang justru diminta daftar — mengumpulkan yang mudah diberi, bukan yang dibutuhkan. Yang perih adalah pembagian yang terasa seperti pemeriksaan kemiskinan; buang formulir penghasilan, biarkan anak memilih tasnya sendiri, dan tak seorang pun pulang merasa diperiksa.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Minta daftar perlengkapan dan ukur kebutuhan",
        "description": "Gandeng sekolah setempat untuk tahu daftar perlengkapan tiap kelas yang sebenarnya dan perkirakan berapa keluarga yang butuh bantuan. Ini menjaga sumbangan tetap tepat guna.",
        "hours": 1.5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Galang sumbangan dan belanja borongan",
        "description": "Gabungkan penggalangan sumbangan dengan belanja borongan untuk barang yang paling dibutuhkan. Membeli borongan membuat uang melangkah paling jauh untuk barang dasar seperti buku tulis dan pensil.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "menjangkau warga",
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Sortir dan rakit per jenjang kelas",
        "description": "Kelompokkan perlengkapan dan isi tas sesuai daftar tiap kelas. Sesi pengepakan berantai bersama para penolong jalannya cepat.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Siapkan tempat simpan dan titik pembagian",
        "description": "Amankan gudang kering dan tempat yang ramah untuk membagikan tas, sering kali di sekolah, balai warga, atau menempel pada acara jelang tahun ajaran lainnya.",
        "hours": 1.5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Jadwalkan dan isi regu pembagian",
        "description": "Gelar pembagian sebelum sekolah mulai, dijaga penolong yang ramah. Sebisa mungkin biarkan anak memilih tasnya — bisa memilih itu menambah martabat.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "legal-aid-clinic",
    "name": "Klinik Bantuan Hukum & Program Kenali Hakmu",
    "purpose": "Menghubungkan tetangga dengan bantuan hukum gratis dan mengajarkan hak-hak mereka.",
    "whoItServes": "Siapa pun yang menghadapi masalah hukum tanpa biaya — urusan tempat tinggal, imigrasi, utang, keluarga, atau tunjangan.",
    "whatYoullNeed": "Pengacara pro bono dan mahasiswa hukum, sebuah ruang, organisasi bantuan hukum sebagai mitra, dan pengaturan jadwal. Nasihat hukum untuk kasus perorangan harus datang dari pengacara berizin yang kompeten (atau mahasiswa hukum di bawah pengawasan) — program ini mengatur akses dan membagikan informasi umum tentang hak, bukan menjadi sumber nasihat hukum itu sendiri.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Belum ada yang bisa jalan sebelum kamu punya pengacara: telepon pertamamu adalah ke kantor bantuan hukum setempat, program pro bono organisasi advokat, dan klinik hukum kampus, menanyakan apa yang mereka perlukan untuk bisa hadir — dan celah mana yang benar-benar bisa diisi oleh klinik tingkat kampung. Biarkan para mitra itu menentukan cakupan klinik bersamamu sebelum kamu mengumumkan apa pun ke tetangga.",
    "commonPitfalls": "Kegagalan yang berbahaya adalah penolong yang penuh perhatian tergelincir dari memberi informasi menjadi memberi nasihat — ucapan bermaksud baik seperti “tanda tangani saja” bisa menghancurkan kasus seseorang, jadi jaga garis itu tetap terang dan terus dilatih. Kegagalan yang lebih lambat: penerimaan berjalan lebih cepat daripada jumlah pengacara — antrean orang-orang yang putus asa tanpa satu pengacara pun di ruangan menghancurkan kepercayaan lebih cepat daripada tidak pernah buka sama sekali.",
    "pairsWith": [
      "tenant-union",
      "court-support",
      "newcomer-translation-network"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Gandeng pengacara dan lembaga bantuan hukum",
        "description": "Ajak pengacara berizin, atau mahasiswa hukum yang diawasi pengacara, untuk memberikan nasihat hukum yang sebenarnya. Bangun jalur rujukan dengan organisasi bantuan hukum yang sudah mapan.",
        "hours": 6,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Tentukan cakupan dan jalur rujukan",
        "description": "Putuskan perkara mana yang bisa ditangani klinik dan siapkan jalur yang jelas untuk merujuk kasus yang rumit atau butuh spesialis. Jujur sejak awal soal apa yang bisa dan tidak bisa dilakukan klinik.",
        "hours": 3,
        "skills": [
          "menulis"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Siapkan ruang dan alur penerimaan",
        "description": "Cari tempat yang privat dan menjaga rahasia, lalu buat alur penerimaan dengan daftar periksa dokumen supaya pengacara bisa memakai waktunya yang terbatas dengan baik.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Bangun sistem janji temu yang menjaga rahasia",
        "description": "Buat janji temu yang melindungi privasi. Urusan hukum itu sensitif, jadi jaga informasi orang dengan hati-hati dari awal sampai akhir.",
        "hours": 3,
        "skills": [
          "koordinasi",
          "input data"
        ]
      },
      {
        "name": "Susun materi kenali-hakmu dan adakan lokakarya",
        "description": "Buat panduan yang jelas dan akurat, lalu adakan lokakarya tentang hak-hak yang umum (penyewa, pekerja, imigrasi, saat berhadapan dengan aparat). Bingkai semuanya sebagai informasi umum, bukan nasihat hukum perorangan.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "menulis",
          "mengajar"
        ]
      },
      {
        "name": "Sebarkan kabar dan jadwalkan klinik",
        "description": "Tetapkan tanggal klinik yang rutin dan sebarkan kabar lewat organisasi mitra dan program tolong-menolong yang lebih luas. Sediakan juru bahasa untuk yang tidak bisa berbahasa Inggris.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "menerjemahkan"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Jaga kerahasiaan dan periksa benturan kepentingan",
        "description": "Tetapkan kerahasiaan yang ketat dan pemeriksaan benturan kepentingan sederhana supaya penolong yang sama tidak pernah menasihati dua pihak yang berlawanan. Latih semua orang soal kewajiban ini.",
        "hours": 3,
        "skills": [
          "urusan berkas"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Pusat Sumber Daya & Penyaluran Tolong-Menolong",
    "purpose": "Menjadi tulang punggung koordinasi — satu titik tempat kebutuhan dan tawaran dipertemukan lintas semua proyek programmu.",
    "whoItServes": "Semua orang di program ini — anggota yang mencari bantuan, penolong yang menawarkannya, dan penggerak proyek yang butuh koordinasi.",
    "whatYoullNeed": "Sistem penerimaan, daftar penolong dan sumber daya, para koordinator, dan direktori induk. Pusat ini menyimpan informasi sensitif tentang kehidupan tetangga — kumpulkan hanya yang perlu, jaga baik-baik, dan bagikan detail hanya kepada orang yang membutuhkannya untuk menolong.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Pusat ini mengoordinasikan proyek-proyek, jadi mulailah dengan duduk bersama penggerak tiap proyek: permintaan apa yang mereka terima, apa yang ingin bisa mereka oper, dan bagaimana mereka mau menerima pasangan kebutuhan-tawaran. Sepakati bersama satu penerimaan bersama dan batas dasar privasi — pusat yang dipaksakan ke proyek akan dilewati orang; yang dibangun bersama mereka menjadi pintu depan.",
    "commonPitfalls": "Pusat seperti ini mati lewat dua jalan: penerimaan penuh permintaan yang tak seorang pun kawal sampai selesai, sehingga tersebar kabar bahwa menelepon tidak ada gunanya; atau satu koordinator heroik memegang semua benang sampai tumbang dan program kehilangan ingatannya. Kawal tiap permintaan sampai benar-benar tuntas, gilir sesi sejak awal, dan kumpulkan informasi lebih sedikit dari yang kamu kira perlu.",
    "pairsWith": [
      "emergency-preparedness",
      "rides-transportation",
      "solidarity-fund"
    ],
    "learnMore": [
      "post-something",
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Buka satu pintu penerimaan untuk kebutuhan dan tawaran",
        "description": "Buat satu pintu depan yang gampang — nomor telepon, formulir, dan jalur tatap muka — tempat siapa pun bisa menyampaikan apa yang dibutuhkan atau apa yang bisa diberikan. Satu pintu masuk mencegah orang jatuh lewat celah.",
        "hours": 4,
        "skills": [
          "koordinasi",
          "bantuan teknis"
        ]
      },
      {
        "name": "Susun daftar penolong dan sumber daya",
        "description": "Rawat daftar terkini para penolong (keahlian, waktu luang, lokasi) dan apa yang bisa ditawarkan tiap proyek, supaya permintaan bisa cepat dipertemukan.",
        "hours": 4,
        "skills": [
          "input data"
        ]
      },
      {
        "name": "Buat alur mempertemukan dan menyalurkan",
        "description": "Tetapkan bagaimana sebuah permintaan diarahkan ke proyek atau penolong yang tepat, dan seberapa cepat. Tentukan target waktu merespons dan cara mengawal permintaan sampai selesai.",
        "hours": 4,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Rawat direktori induk sumber daya",
        "description": "Jaga direktori hidup berisi semua proyekmu plus bantuan dari luar (penampungan, klinik, pangan, bantuan hukum) supaya pusat bisa mengarahkan orang ke mana pun bantuan ada.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "input data"
        ]
      },
      {
        "name": "Ajak dan latih koordinator",
        "description": "Bangun tim untuk mengisi sesi penyaluran bergiliran supaya pusat tetap sigap tanpa membuat siapa pun tumbang. Latih mereka soal alur kerja dan direktorinya.",
        "hours": 3,
        "skills": [
          "menjangkau warga",
          "mengajar"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Tetapkan kebiasaan privasi data dan tindak lanjut",
        "description": "Putuskan informasi apa yang dikumpulkan, bagaimana disimpan dan dilindungi, dan bagaimana memastikan sebuah kebutuhan benar-benar terpenuhi. Kumpulkan seminimal mungkin dan jaga baik-baik.",
        "hours": 4,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Catat kebutuhan yang belum terpenuhi dan celahnya",
        "description": "Catat permintaan yang tidak bisa kamu penuhi. Celah yang berulang menunjukkan di mana programmu sebaiknya memulai proyek berikutnya — mengubah pusat ini jadi alat perencanaan, bukan sekadar meja operator.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "input data"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Pembagian Perlengkapan Pengurangan Dampak Buruk",
    "purpose": "Mengantarkan nalokson, strip tes, dan perlengkapan pemakaian yang lebih aman ke tangan orang-orang yang mungkin membutuhkannya — menemui tetangga di tempat mereka berada, tanpa menghakimi.",
    "whoItServes": "Orang yang memakai narkoba, teman dan keluarganya, dan siapa pun yang mungkin menyaksikan overdosis — yang di kebanyakan lingkungan berarti siapa saja.",
    "whatYoullNeed": "Pelatihan menangani overdosis, sumber nalokson (program pemerintah, apotek, atau organisasi mitra), isi kit, dan regu kecil untuk membagikannya. Membagikan perlengkapan bukan perawatan medis — semua yang ikut membagikan harus lulus pelatihan menangani overdosis dulu, dan hukum soal apa yang boleh kamu bawa (strip tes, jarum suntik) sangat berbeda-beda antartempat, jadi pastikan aturan di tempatmu sebelum menyetok apa pun. Selalu sertakan nomor krisis dan pengobatan setempat tercetak di setiap kit.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Jangan beli apa-apa dulu: langkah pertamamu adalah mengobrol dengan program pengurangan dampak buruk terdekat yang sudah mapan dan dengan orang-orang yang benar-benar memakai perlengkapan ini — merekalah yang akan memberi tahu apa yang dibutuhkan, apa yang sudah tersedia, dan cara hadir tanpa menghakimi. Pastikan regu intimu lulus pelatihan menangani overdosis dan pastikan hukum setempat soal strip tes dan jarum suntik sebelum satu kit pun dikemas.",
    "commonPitfalls": "Ini jadi kacau saat kalian datang sebagai orang asing — membagikan di tempat yang tak punya hubungan denganmu, atau menempelkan ceramah dan syarat yang mengajari orang untuk menghindarimu — dan saat kamu melangkahi hukum atau pelatihanmu, yang bisa membuat seorang penolong kena tuduhan membawa alat narkoba. Di sini, pelan dan bersama mitra selalu menang atas cepat dan sendirian.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Ikuti pelatihan dan cari mitra pengurangan dampak buruk",
        "description": "Pastikan regu intimu lulus pelatihan menangani overdosis dan memakai nalokson — banyak dinas kesehatan dan organisasi pengurangan dampak buruk mengadakannya gratis. Bermitralah dengan program yang sudah mapan; mereka sudah memecahkan urusan pasokan, hukum, dan kepercayaan yang tak perlu kamu pecahkan ulang.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Periksa hukum setempat soal perlengkapan",
        "description": "Akses nalokson dilindungi hampir di mana-mana, tapi strip tes dan jarum suntik di sebagian tempat masih digolongkan alat narkoba. Cari tahu persis apa yang boleh kamu bawa dan bagikan secara hukum — organisasi mitramu atau klinik bantuan hukum bisa cepat menjawabnya. Tuliskan untuk para penolong.",
        "hours": 3,
        "skills": [
          "riset"
        ]
      },
      {
        "name": "Dapatkan nalokson dan isi kit",
        "description": "Pesan nalokson lewat program distribusi pemerintah, kerja sama tetap dengan apotek, atau organisasi mitramu. Tambahkan apa pun yang legal di tempatmu: strip tes fentanil dan xilazin, perawatan luka, barang kebersihan.",
        "hours": 4,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Rakit kit dengan lembar petunjuk berbahasa sederhana",
        "description": "Kemasi kit dengan petunjuk sederhana dalam beberapa bahasa: cara mengenali overdosis, cara memberi nalokson, telepon nomor darurat, jangan pernah pakai sendirian. Sertakan nomor krisis dan pengobatan setempat di tiap kit. Perakitan cepat selesai kalau satu meja penuh orang.",
        "hours": 3,
        "skills": [
          "menerjemahkan"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Atur keliling pembagian dan titik tetap",
        "description": "Rencanakan keliling rutin jalan kaki atau berkendara lewat tempat orang benar-benar berada, dan minta bar, warung, perpustakaan, dan tempat berkumpul menyediakan kotak ambil-tanpa-ditanya. Hambatan serendah mungkin adalah intinya — tanpa formulir, tanpa ceramah.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Isi ulang, catat, dan jaga pelatihan tetap segar",
        "description": "Catat apa yang cepat habis dan apa yang mengendap, catat tanggal kedaluwarsa nalokson, dan adakan pelatihan penyegaran saat penolong baru bergabung. Kalau sebuah kit berhasil membalikkan overdosis, itu layak dicatat (pelan-pelan saja).",
        "hours": 2,
        "recurringCadence": "month",
        "skills": []
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Dukungan & Pendampingan di Pengadilan",
    "purpose": "Memastikan tidak ada tetangga yang menghadapi jadwal sidang sendirian — ditemani di ruang sidang, diantar ke sana, anaknya dijaga selama sidang, dan surat dukungan saat pembela memintanya.",
    "whoItServes": "Tetangga yang menghadapi sidang pidana, imigrasi, penggusuran, atau pengadilan keluarga, beserta keluarganya — pergi ke pengadilan sendirian bisa membuat orang kehilangan pekerjaan, penjaga anak, dan harapan.",
    "whatYoullNeed": "Penolong yang bisa diandalkan, kalender sidang, dan hubungan dengan pembela publik. Dukungan pengadilan adalah soal kehadiran dan logistik, bukan nasihat hukum — penolong tidak pernah menasihati soal perkara dan selalu mengikuti arahan pengacara orang itu sendiri. Ruang sidang punya aturan perilaku yang ketat, jadi semua yang hadir harus hafal betul aturannya.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Mulailah dari orang-orang yang punya jadwal sidang itu: dukungan hanya terjadi atas undangan orang yang menghadapi sidang, dan seirama dengan pengacaranya. Perkenalkan diri lebih dulu ke kantor pembela publik dan kelompok pemantau sidang atau dana pembebasan tahanan yang sudah ada di gedung pengadilan, dan biarkan mereka memberi tahu sidang mana yang butuh teman dan cara membantu tanpa menyentuh sisi hukumnya.",
    "commonPitfalls": "Bahayanya datang dari bertindak sendiri: penolong yang “menjelaskan” tawaran damai di lorong, detail perkara dibicarakan di tempat jaksa bisa mendengar, reaksi mencolok dari bangku pengunjung yang membuat hakim kesal — semuanya bisa merugikan justru orang yang kamu datangi untuk dibantu. Kegagalan yang lebih senyap adalah logistik: jadwal sidang yang tidak dicek ulang atau tumpangan yang batal bisa berarti sidang terlewat dan surat perintah penangkapan.",
    "pairsWith": [
      "legal-aid-clinic",
      "reentry-support",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jalin hubungan dengan pembela dan kelompok pengadilan yang ada",
        "description": "Perkenalkan diri ke kantor pembela publik, bantuan hukum imigrasi, dan kelompok pemantau sidang atau dana pembebasan tahanan yang sudah bekerja. Merekalah yang akan memberi tahu di mana dukungan paling dibutuhkan dan cara turun tangan tanpa menghalangi.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Tulis aturan mainnya: mendukung, bukan mengurus hukum",
        "description": "Tuliskan hitam di atas putih: penolong tidak pernah memberi nasihat hukum, tidak pernah membicarakan detail perkara di area umum gedung pengadilan, dan selalu tunduk pada pengacara orang itu sendiri. Tambahkan tata krama ruang sidang — datang lebih awal, berpakaian sederhana, ponsel mati, tanpa reaksi dari bangku pengunjung.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Bangun penerimaan dan kalender sidang",
        "description": "Buat cara sederhana bagi orang untuk minta dukungan dan kalender bersama berisi tanggal, ruang sidang, dan apa yang dibutuhkan tiap orang — teman, tumpangan, penjaga anak, atau ketiganya. Jadwal sidang terus berpindah, jadi cek ulang sehari sebelumnya.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Latih penolong pendamping",
        "description": "Ajak penolong mengenal gedung pengadilan: pemeriksaan keamanan, mencari ruang sidang, tempat duduk, dan cara sekadar hadir dengan tenang dan hangat sepanjang penantian yang menegangkan. Pasangkan tiap penolong baru dengan yang berpengalaman untuk jadwal pertamanya.",
        "hours": 3,
        "skills": [
          "mengajar"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Koordinasikan tumpangan dan penjagaan anak untuk sidang",
        "description": "Siapkan pengemudi untuk pagi-pagi sidang dan pasangan penjaga anak yang bisa mengasuh selama sidang — banyak ruang sidang tidak mengizinkan anak-anak, dan sidang yang terlewat gara-gara urusan anak bisa berarti surat perintah penangkapan.",
        "hours": 3,
        "skills": [
          "menyetir",
          "mengasuh anak"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Atur surat dukungan saat pembela memintanya",
        "description": "Saat pengacara seseorang meminta surat keterangan baik atau dukungan komunitas, koordinasikan tetangga untuk menulisnya — mengikuti persis arahan pengacara soal isi, nada, dan tenggat.",
        "hours": 2,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Ruang Sejuk & Hangat Dadakan",
    "purpose": "Membuka tempat berlindung dari cuaca di lingkunganmu — ruangan sejuk saat gelombang panas, ruangan hangat saat dingin menggigit — yang siap sebelum cuaca berubah berbahaya, bukan sesudahnya.",
    "whoItServes": "Warga lanjut usia, tetangga tanpa rumah, orang yang AC atau pemanasnya tidak berfungsi, pekerja lapangan, dan siapa pun yang tempat tinggalnya tak sanggup mengimbangi cuaca.",
    "whatYoullNeed": "Lokasi tuan rumah dengan pendingin dan pemanas ruangan serta kamar mandi, perlengkapan, dan tuan rumah terlatih yang bergiliran sesi. Tuan rumah adalah tetangga, bukan tenaga medis — latih semua orang mengenali kelelahan akibat panas dan hipotermia serta menelepon nomor darurat lebih awal, bukan terlambat, dan bereskan urusan asuransi dan tanggung jawab hukum lokasi sebelum aktivasi pertama, bukan di tengah-tengahnya.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Lokasi tuan rumah adalah hubungan yang menopang segalanya, jadi mulailah dari sana: duduklah bersama pustakawan, pemuka agama, atau pengelola aula dan bahas bersama pertanyaan-pertanyaan yang tidak enak — jam buka, kunci, asuransi, apa yang terjadi kalau ada yang perlu menginap — sebelum prakiraan cuaca pertama memaksa mereka. Sambil jalan, tanyai para penjangkau warga dan staf gedung lansia siapa yang benar-benar membutuhkan tempat ini, supaya lokasi dan jamnya cocok dengan orang-orang yang ditujunya.",
    "commonPitfalls": "Proyek ini gagal di celah antara rencana dan cuaca: pemicu yang tidak benar-benar disepakati, sehingga tempat baru buka sehari terlambat, atau soal tanggung jawab hukum yang dibiarkan kabur sampai ada yang pingsan dan tuan rumah mundur selamanya. Tuliskan ambang aktivasi hitam di atas putih, lakukan satu latihan buka sebelum musimnya, dan pastikan tiap tuan rumah tahu untuk menelepon nomor darurat lebih awal, bukan paling akhir.",
    "pairsWith": [
      "emergency-preparedness",
      "community-wood-bank",
      "laundry-shower-access"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Cari lokasi tuan rumah dengan pendingin dan pemanas",
        "description": "Tanyai perpustakaan, rumah ibadah, aula serikat, dan balai warga soal ruangan dengan AC dan pemanas yang andal, kamar mandi, dan akses tanpa tangga. Minta persetujuan tertulis yang mencakup jam buka, siapa pemegang kunci, dan apa yang terjadi kalau dibutuhkan semalaman.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Tetapkan pemicu aktivasi dan rencana siaga",
        "description": "Putuskan dari jauh hari apa persisnya yang membuka tempat ini — suhu prakiraan, indeks panas, dinginnya angin — supaya tak ada yang harus menimbang-nimbang tengah malam. Siapkan rantai telepon atau grup chat yang membuat tuan rumah bersiaga sehari sebelumnya.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Setok perlengkapan",
        "description": "Kumpulkan air, bubuk elektrolit, selimut, velbed lipat atau kursi nyaman, kipas, pengisi daya ponsel, dan kotak P3K. Simpan semuanya di lokasi dalam boks berlabel supaya tuan rumah mana pun bisa menemukan barang.",
        "hours": 3,
        "skills": [
          "menyetir"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ajak dan latih tuan rumah sesi",
        "description": "Cari cukup orang untuk dua tuan rumah per sesi dan latih mereka: menyambut orang tanpa berkas, mengenali kelelahan akibat panas dan hipotermia, kapan menelepon nomor darurat, dan dasar meredakan ketegangan. Kehangatan dalam arti manusiawi sama pentingnya dengan termostat.",
        "hours": 4,
        "skills": [
          "mengajar"
        ]
      },
      {
        "name": "Susun giliran sesi",
        "description": "Siapkan jadwal sesi yang bisa diaktifkan dengan pemberitahuan sehari — pembuka, penutup, dan penjaga malam kalau kalian menyediakannya. Simpan daftar cadangan, karena gelombang panas juga menumbangkan para penolong.",
        "hours": 2,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Sebarkan kabar sebelum musimnya",
        "description": "Buat selebaran dalam beberapa bahasa berisi pemicu dan lokasi, lalu antarkan ke klinik, gedung lansia, para penjangkau warga, dan warung-warung sebelum gelombang panas atau dingin pertama — bukan di tengah-tengahnya.",
        "hours": 3,
        "skills": [
          "desain grafis",
          "menerjemahkan"
        ]
      },
      {
        "name": "Buka, jaga, dan bereskan tiap aktivasi",
        "description": "Jalankan tempat ini selama cuaca ekstrem berlangsung: catat kedatangan dengan longgar (hitungan, bukan KTP), jaga perlengkapan terus mengalir, dan tengok siapa pun yang tertidur. Sesudahnya, bersihkan, isi ulang, dan catat apa yang sempat kurang.",
        "hours": 3,
        "recurringCadence": "event",
        "skills": []
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Proyek Sejarah Lisan Komunitas",
    "purpose": "Merekam kisah para sesepuh dan tetangga sebelum hilang — dan menjaga si empunya cerita tetap memegang kendali atas nasib kisahnya.",
    "whoItServes": "Para sesepuh dengan kisah yang belum pernah ada yang memintanya, warga lama yang menyaksikan kampungnya berubah, dan setiap tetangga yang datang sesudahnya.",
    "whatYoullNeed": "Ponsel atau perekam sederhana, sudut yang tenang, formulir persetujuan, dan tempat aman untuk menyimpan file. Rekaman adalah data pribadi — tiap peserta memiliki kisahnya sendiri, menentukan ke mana kisah itu dibagikan, dan boleh berubah pikiran belakangan. Tidak ada yang dipublikasikan tanpa persetujuan tertulisnya.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Mulailah dari satu sesepuh yang percaya padamu dan tanyakan apakah dia mau berbagi cerita — rekaman pertama itu mengajarimu lebih banyak daripada rencana mana pun, dan dialah yang menjamin kamu di mata pencerita berikutnya. Sebelum menekan tombol rekam dengan siapa pun, baca formulir persetujuan bersama-sama dan tanyakan apa yang dia inginkan terjadi pada rekamannya; percakapan itulah proyeknya.",
    "commonPitfalls": "Cara proyek ini melukai seseorang: cerita yang melanglang lebih jauh daripada yang disetujui penceritanya — potongan yang diunggah, nama yang dicantumkan, detail yang sebenarnya hanya untukmu. Cara proyek ini mati pelan-pelan: rekaman menumpuk tanpa label di ponsel satu orang sampai perangkat yang hilang menghapus bertahun-tahun suara; beri label dan cadangkan tiap sesi pada minggu yang sama.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Tulis formulir persetujuan berbahasa sederhana",
        "description": "Satu halaman, tanpa bahasa hukum: apa yang direkam, ke mana mungkin dibagikan, dan hak peserta untuk jeda, melewati pertanyaan, atau menarik rekamannya belakangan. Terjemahkan ke bahasa yang benar-benar dipakai para penceritamu.",
        "hours": 2,
        "skills": [
          "menulis",
          "menerjemahkan"
        ]
      },
      {
        "name": "Siapkan alat dan daftar pertanyaan",
        "description": "Ponsel dengan aplikasi perekam suara sudah cukup; tambahkan mic jepit murah kalau bisa. Susun pertanyaan terbuka yang mengundang cerita — “ceritakan jalan ini waktu kamu pertama datang” — dan berlatihlah sekali satu sama lain.",
        "hours": 2,
        "skills": []
      },
      {
        "name": "Rekam sesi cerita",
        "description": "Duduklah dengan satu pencerita dalam satu waktu di tempat yang tenang dan nyaman. Baca formulir persetujuan bersama dulu, lalu lebih banyak mendengarkan — wawancara terbaik adalah saat kamu paling sedikit bicara.",
        "hours": 4,
        "skills": [
          "mendengarkan"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Arsipkan dan bagikan kembali, sesuai keinginan mereka",
        "description": "Label tiap rekaman dengan tanggal, nama, dan apa yang disepakati soal berbagi. Simpan dua salinan di tempat aman, beri tiap pencerita salinannya sendiri, dan bagikan ke publik hanya potongan yang disetujui masing-masing.",
        "hours": 2,
        "follows": [
          2
        ],
        "skills": []
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Koperasi Surya & Energi Komunitas",
    "purpose": "Menggabungkan daya tetangga menjadi energi terbarukan bersama yang meringankan tagihan listrik semua orang — terutama para penyewa dan rumah tangga yang tak mungkin memasang panel di atap sendiri.",
    "whoItServes": "Penyewa, rumah tangga berpenghasilan rendah, dan siapa pun yang terhalang dari panel surya atap oleh atapnya, pemilik rumahnya, atau kantongnya.",
    "whatYoullNeed": "Anggota yang berkomitmen, pengetahuan teknis dan keuangan yang bisa kamu pinjam atau pelajari, lokasi tuan rumah atau program surya komunitas yang bisa diikuti, dan organisasi mitra. Satu hal yang perlu dikatakan terang-terangan: koperasi energi membawa kerumitan keuangan dan hukum yang nyata — mintalah nasihat profesional yang kompeten soal struktur, pendanaan, dan kontrak sebelum siapa pun menandatangani apa pun.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Sebelum ada panel atau berkas apa pun, bicaralah dengan dua kelompok: tetangga yang benar-benar mau ikut, untuk mengukur komitmen yang sesungguhnya, dan koperasi surya di kota atau daerah sebelah yang sudah menjalaninya — merekalah yang akan memberi tahu model mana yang cocok dengan aturan daerahmu dan kesalahan mana yang menguras uang mereka. Lalu baca sendiri aturan setempat itu, karena aturan itulah — bukan semangatmu — yang menentukan apa yang mungkin.",
    "commonPitfalls": "Koperasi surya mati di celah antara semangat dan tanda tangan: setahun rapat membahas model yang tak pernah diizinkan aturan daerahmu, atau kontrak yang diteken tanpa ditinjau profesional dan mengunci anggota pada syarat yang tak seorang pun pahami. Pembunuh lainnya adalah uang yang buram — kalau anggota tak bisa melihat dengan jelas apa yang mereka setor dan apa yang kembali, kepercayaan terkikis dan koperasi terurai.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Kumpulkan anggota dan ukur minat",
        "description": "Ajak rumah tangga yang tertarik energi bersih berbiaya lebih rendah dan cari tahu seberapa sungguh-sungguh komitmen mereka — semangat samar dan anggota yang sudah menandatangani itu dua hal berbeda. Jumlahmu menentukan model mana yang masuk akal, jadi hitunglah dengan jujur sebelum merencanakan.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Pelajari model dan aturan setempat",
        "description": "Riset cara kerja surya komunitas di tempat tinggalmu: peraturan daerah, ekspor-impor listrik ke jaringan (net metering), program berlangganan, struktur koperasi. Aturannya sangat berbeda antartempat dan itulah yang menentukan apa yang benar-benar mungkin — lakukan ini sebelum jatuh cinta pada satu model.",
        "hours": 5,
        "skills": [
          "riset"
        ]
      },
      {
        "name": "Cari lokasi atau program untuk diikuti",
        "description": "Cari atap tuan rumah atau sepetak lahan untuk deretan panel bersama, atau cek apakah program surya komunitas yang sudah ada mau menerima kelompokmu sebagai peserta berlangganan kolektif — ikut program yang ada sering jauh lebih cepat daripada membangun. Timbang kedua jalan bersama anggotamu sebelum memutuskan.",
        "hours": 4,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Bereskan pendanaan dan struktur hukum",
        "description": "Putuskan bagaimana proyek didanai dan dikelola, lalu bentuk koperasinya dengan benar. Inilah langkah dengan akibat hukum dan keuangan yang nyata — datangkan profesional yang kompeten untuk meninjau struktur dan setiap kontrak, dan jangan tanda tangan sebelum mereka selesai.",
        "hours": 5,
        "skills": [
          "urusan berkas",
          "pembukuan"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bermitra dengan pemasang dan penyedia",
        "description": "Cari pemasang atau penyedia bereputasi baik, bandingkan tawaran harga dari beberapa pemasang, dan pastikan garansi serta perawatan jangka panjang tertulis. Pemasangan murah tanpa rencana perawatan akan jadi mahal lima tahun lagi.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Siapkan sistem potongan tagihan dan keanggotaan",
        "description": "Rumuskan persis bagaimana penghematan atau potongan tagihan mengalir ke anggota dan bagaimana keanggotaan serta pembayaran berjalan. Buat transparan dan gampang dipahami — seorang anggota harus bisa melihat, di satu halaman, apa yang dia setor dan apa yang kembali.",
        "hours": 3,
        "skills": [
          "pembukuan",
          "input data"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Ajari anggota soal pemakaian energi",
        "description": "Bantu anggota membaca tagihan listriknya dan memangkas pemakaian — satu kilowatt yang dihemat mengalahkan satu kilowatt yang dihasilkan. Sandingkan penghematan surya dengan kiat hemat energi sederhana supaya rumah tangga melihat bedanya di atas kertas.",
        "hours": 3,
        "skills": [
          "mengajar"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Inkubator Koperasi Pekerja & Keahlian Kerja",
    "purpose": "Membantu tetangga membangun keahlian kerja dan meluncurkan koperasi milik pekerja — mata pencaharian tempat orang-orang yang mengerjakan pekerjaannya memiliki tempat kerjanya dan mengambil keputusannya.",
    "whoItServes": "Tetangga yang menganggur atau kekurangan kerja, dan siapa pun yang ingin benar-benar punya andil di tempatnya bekerja.",
    "whatYoullNeed": "Mentor berpengalaman bisnis dan koperasi, ruang dan bahan pelatihan, dukungan rintisan yang bisa kamu tunjukkan ke usaha-usaha baru, dan kemitraan — pengembang koperasi, lembaga pembiayaan yang paham koperasi, dan program berbagi keahlianmu sendiri.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Mulailah dengan obrolan, bukan kurikulum: duduklah bersama anggota yang berminat soal apa yang mereka bisa dan ingin bangun, lalu cari gugus keahlian yang sungguh bisa menjadi sebuah usaha. Sambil jalan, temukan pengembang koperasi di daerahmu atau koperasi pekerja yang sudah ada dan mau jadi mentor — bekas luka mereka adalah silabusmu, dan pendirian tanpa bimbingan itulah tempat kelompok-kelompok terluka.",
    "commonPitfalls": "Ini gagal lewat dua jalan: sebagai program pelatihan yang tak pernah meluncurkan apa-apa, karena tak ada yang mendorong gugus keahlian menjadi usaha sungguhan — atau sebagai peluncuran yang melompati bagian membosankan, mendirikan badan hukum dari contoh unduhan dan menemukan kekacauan tata kelola dan pajak dua tahun kemudian. Proyek ini juga mati pelan-pelan saat satu penggerak memegang semua hubungan mentor dan pendana; bagikan kontak-kontak itu sejak hari pertama.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Petakan keahlian dan cita-cita anggota",
        "description": "Duduklah bersama anggota dan pelajari apa yang mereka bisa dan ingin bangun. Kamu mencari gugus — tiga orang yang bisa memasak, satu regu dengan keahlian pertukangan, lima yang bisa bebersih — karena gugus keahlian adalah benih usaha koperasi yang layak.",
        "hours": 4,
        "skills": [
          "wawancara"
        ]
      },
      {
        "name": "Adakan pelatihan kesiapan kerja dan keahlian",
        "description": "Adakan sesi tentang riwayat hidup, wawancara kerja, pertukangan, keahlian digital, dan melek keuangan. Manfaatkan program berbagi keahlianmu dan datangkan ahli dari luar untuk hal yang tak bisa diajarkan orang setempat — tujuannya anggota yang mampu, terbentuk koperasi ataupun tidak.",
        "hours": 5,
        "skills": [
          "mengajar"
        ]
      },
      {
        "name": "Ajarkan model koperasi",
        "description": "Ajak anggota memahami kepemilikan pekerja dan tata kelola yang demokratis: bagaimana keuntungan dibagi, bagaimana keputusan diambil, dan apa bedanya dengan bisnis biasa. Orang tak bisa memilih model yang belum pernah dilihatnya — pakai koperasi sungguhan sebagai contoh.",
        "hours": 4,
        "skills": [
          "mengajar",
          "memandu diskusi"
        ]
      },
      {
        "name": "Dampingi pendirian koperasi",
        "description": "Saat sebuah kelompok siap, bantu mereka menulis rencana bisnis dan memilih bentuk badan hukum. Hubungkan mereka dengan pengacara dan akuntan yang paham koperasi alih-alih mengarang sendiri langkah hukum dan pembukuannya — pendirian yang keliru mahal untuk diperbaiki.",
        "hours": 5,
        "skills": [
          "urusan berkas"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Hubungkan ke sumber daya rintisan",
        "description": "Susun daftar hidup pembiayaan mikro, hibah, dana pengembangan koperasi, dan inkubator, lalu bantu usaha-usaha itu benar-benar mengajukan. Sebagian besar dana koperasi memang ada tapi papan penunjuknya buruk — petamu atasnya bernilai uang sungguhan.",
        "hours": 3,
        "skills": [
          "riset"
        ]
      },
      {
        "name": "Sediakan pendampingan mentor",
        "description": "Pasangkan tiap usaha baru dengan koperator berpengalaman atau mentor bisnis yang rutin menengok selama masa-masa awal yang rapuh. Tahun pertama adalah tempat koperasi gagal; mentor yang tenang dan pernah melihat polanya mengubah peluang.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Bangun dukungan antarusaha",
        "description": "Pertemukan usaha-usaha itu dalam satu jaringan tempat koperasi saling berbagi pelajaran, saling merujuk pembeli, dan saling membeli. Koperasi yang saling berdagang selamat dari masa sulit yang membunuh koperasi yang sendirian.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Menemani lansia dan mengantar makanan",
    "purpose": "Antarkan makanan rutin dan kunjungan hangat untuk lansia yang tak bisa keluar rumah — makanannya penting, dan sepuluh menit mengobrol di depan pintu sering kali lebih penting lagi.",
    "whoItServes": "Tetangga lansia yang kesepian, tak bisa keluar rumah, atau ringkih — juga keluarga yang mencemaskan mereka dari jauh.",
    "whatYoullNeed": "Penolong andal yang sudah kamu periksa latar belakangnya, sumber makanan, rute yang terencana, dan langkah keselamatan sederhana untuk saat pintu tidak dibuka.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Mulai dari sumber makanan dan lima lansia pertama, bukan dari selembar formulir: ajak bicara tim dapur umum atau beberapa tetangga yang bisa masak tentang apa yang sanggup mereka siapkan secara rutin, lalu tanyakan ke petugas pendamping lansia, perawat jemaat, dan apoteker siapa yang benar-benar sering tidak makan. Periksa penolong pertamamu sebelum antaran pertama, bukan sesudahnya — kepercayaan yang sedang kamu bangun hidup atau mati tergantung siapa yang melangkah masuk lewat pintu-pintu itu.",
    "commonPitfalls": "Kegagalan yang berbahaya adalah sinyal yang terlewat — penolong yang menganggap enteng pintu yang tak dibuka karena tidak ada yang menuliskan apa yang harus dilakukan, atau alergi yang tak pernah sampai ke lembar rute. Kegagalan yang pelan adalah ketidakteraturan: para lansia menata harinya di sekitar kunjungan itu, dan rute yang bolong berminggu-minggu mengajari mereka untuk tidak mengandalkanmu. Lebih baik lima lansia dikunjungi setiap minggu tanpa absen daripada dua puluh yang hanya kadang-kadang.",
    "pairsWith": [
      "community-meal",
      "neighborhood-care-network",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Cari lansia yang tak bisa keluar rumah",
        "description": "Temukan mereka lewat klinik, posyandu lansia, kelompok keagamaan, dan dari mulut ke mulut. Lakukan dengan hormat dan sepenuhnya atas persetujuan mereka — kamu menawarkan makanan dan teman mengobrol, bukan memasukkan siapa pun ke dalam pengawasan.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Ajak dan periksa calon penolong",
        "description": "Siapa pun yang masuk ke rumah lansia harus diperiksa dulu: referensi dan pengecekan dasar, tanpa kecuali meski teman dari teman. Setelah itu utamakan konsistensi — lansia lebih nyaman dengan wajah yang sama di pintu setiap minggu daripada orang yang berganti-ganti.",
        "hours": 4,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Siapkan sumber makanan",
        "description": "Atur pasokan makanan dari dapur umum, tetangga yang mau memasak, atau rumah makan yang menyumbang porsi. Perhatikan gizi dan kemudahan menghangatkan, dan beri label isi pada setiap wadah — makanan tanpa label adalah pertaruhan bagi orang dengan alergi.",
        "hours": 4,
        "skills": [
          "memasak",
          "keamanan pangan"
        ]
      },
      {
        "name": "Rencanakan rute dan jadwal antar",
        "description": "Kelompokkan para lansia ke rute yang efisien dan pasang ritme yang bisa diandalkan — hari yang sama, jam yang kurang lebih sama. Sisihkan beberapa menit santai untuk mengobrol di setiap pemberhentian; bagi banyak lansia, itulah antaran yang sesungguhnya.",
        "hours": 3,
        "skills": [
          "menyetir",
          "koordinasi"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Catat info makan, alergi, dan kontak darurat",
        "description": "Untuk setiap lansia, catat kebutuhan makan, alergi, obat yang berkaitan dengan makanan, dan kontak darurat. Simpan dengan aman dan hanya untuk yang perlu tahu — pengantar cukup tahu alerginya, bukan seluruh riwayat kesehatannya.",
        "hours": 3,
        "skills": [
          "input data"
        ]
      },
      {
        "name": "Susun protokol cek keadaan",
        "description": "Tuliskan persis apa yang dilakukan penolong saat lansia tidak menjawab atau tampak tidak sehat: siapa yang ditelepon lebih dulu, kapan menghubungi keluarga atau nomor darurat, dan bagaimana mencatat kejadiannya. Memutuskan dari awal jauh lebih baik daripada berimprovisasi di depan pintu.",
        "hours": 3,
        "skills": [
          "menulis"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Dampingi penolong dan kumpulkan masukan",
        "description": "Sapa para penolong secara rutin, rotasikan rute saat ada yang butuh jeda, dan tanyakan langsung ke para lansia bagaimana proyek ini bisa lebih membantu mereka. Mereka akan menceritakan hal-hal yang tak pernah terlihat oleh para penolong.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Pusat distribusi bantuan bencana",
    "purpose": "Dirikan pusat yang bisa menerima, memilah, dan menyalurkan pasokan dengan cepat begitu bencana melanda — karena hari-hari pertama setelah banjir atau kebakaran dimenangkan atau dikalahkan lewat logistik.",
    "whoItServes": "Warga yang terdampak banjir, badai, kebakaran, dan bencana lain — dimulai dari tetangga yang paling tak sanggup bepergian atau menunggu.",
    "whatYoullNeed": "Lokasi yang sudah disepakati dari awal berikut cadangannya, jalur pasokan barang, tim penolong siaga, dan koordinasi dengan jaringan kesiapsiagaan bencana — hampir semuanya diatur sebelum bencana apa pun, karena sesudahnya sudah terlambat.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "Pusat ini ada di atas kertas jauh sebelum ada di pelataran parkir, jadi mulailah dari jaringan kesiapsiagaan bencana — merekalah yang memegang pohon kontak dan peta risikonya — dan dari pertanyaan jujur: gedung mana yang benar-benar mau membukakan pintu jam enam pagi setelah banjir. Bereskan dulu kesepakatan lokasi dan cadangannya; semua tugas lain bergantung pada satu alamat.",
    "commonPitfalls": "Pusat bantuan gagal ke dua arah: pusat yang cuma ada sebagai rencana yang tak pernah dilatih, sehingga kejadian sungguhan menghabiskan hari pertamanya untuk pertanyaan yang seharusnya terjawab lewat satu geladi — dan pusat yang membuka pintunya bagi banjir sumbangan yang tak sanggup dipilah, lalu berubah jadi gudang pakaian tak terpakai sementara orang butuh air. Bahaya yang lebih senyap adalah distribusi berpagar: begitu seseorang harus membuktikan dirinya layak dibantu, kamu sudah menghidupkan kembali sistem yang justru ingin kamu lewati.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Tentukan lokasi pusat dan cadangannya sejak awal",
        "description": "Cari gedung atau lahan yang bisa menerima kiriman, jadi tempat memilah barang, dan menampung antrean distribusi — plus satu cadangan kalau yang pertama rusak atau tak terjangkau. Pastikan akses dan kuncinya dengan pemilik sekarang, selagi cuaca tenang; lokasi yang tak bisa kamu masuki bukanlah lokasi.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Bangun jalur pasokan barang",
        "description": "Atur dari sekarang dari mana air, makanan, perlengkapan kebersihan, dan alat bersih-bersih akan datang — pemasok, organisasi mitra, penggalangan barang. Sama pentingnya: cara mengetahui apa yang benar-benar dibutuhkan orang setelah kejadian, supaya kamu tidak tertimbun barang yang salah.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "koordinasi"
        ]
      },
      {
        "name": "Siapkan alur terima, pilah, dan stok",
        "description": "Rancang bagaimana sumbangan diterima, dipilah, dan dicatat sejak truk pertama tiba. Setiap pusat yang tenggelam dalam barang tak terpilah pasti melewatkan langkah ini — tentukan kategori, label, dan hitungan sederhanamu sebelum dibutuhkan.",
        "hours": 4,
        "skills": [
          "koordinasi",
          "input data"
        ]
      },
      {
        "name": "Buat sistem distribusi",
        "description": "Rencanakan bagaimana pasokan keluar: adil dan tanpa pagar — tanpa periksa KTP, tanpa bukti kebutuhan — dengan antaran keliling untuk orang yang tak bisa datang ke pusat. Dahulukan yang paling rentan, dan tuliskan prioritas itu supaya selamat dari kekacauan.",
        "hours": 3,
        "skills": [
          "menyetir",
          "koordinasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Rekrut dan latih tim penolong siaga",
        "description": "Kumpulkan orang-orang yang bisa bergerak dalam hitungan jam, dan latih mereka dari awal soal peran, aturan keselamatan, serta sistem terima dan distribusimu. Tim terlatih berisi dua belas orang mengalahkan kerumunan lima puluh orang yang bermaksud baik.",
        "hours": 4,
        "skills": [
          "mengajar"
        ]
      },
      {
        "name": "Berkoordinasi dengan penanggap lain",
        "description": "Perkenalkan pusat ini ke lembaga penanggulangan bencana resmi dan kelompok bantuan lain sebelum apa pun terjadi. Sepakati siapa menangani apa, supaya kalian mengisi celah dan bukan menduplikasi — tolong-menolong bergerak paling cepat justru di titik yang paling lambat dijangkau respons resmi.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Rencanakan komunikasi dan keselamatan",
        "description": "Bersiaplah untuk jaringan yang lumpuh: cara kontak tanpa internet, daftar tercetak, dan sambungan ke pohon kontak jaringan kesiapsiagaan. Tetapkan aturan keselamatan yang keras — tidak ada yang masuk bangunan tak aman, kapan pun — dan tuliskan hitam di atas putih.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Jaringan dukungan sebaya untuk pulih dari kecanduan",
    "purpose": "Jalankan dukungan yang dipandu sesama penyintas untuk tetangga yang sedang atau ingin pulih dari kecanduan zat — pelengkap penanganan profesional, bukan sekali-kali penggantinya.",
    "whoItServes": "Orang yang sedang menjalani proses pulih, orang yang mulai memikirkannya, serta keluarga dan sahabat yang berjalan di samping mereka.",
    "whatYoullNeed": "Fasilitator sebaya yang punya pengalaman pulih sendiri dan pelatihan sungguhan, ruang aman yang privat, jalur rujukan, dan batasan yang diucapkan gamblang: dukungan sebaya melengkapi penanganan profesional, bukan menggantikannya; fasilitator bukan tenaga medis dan tak boleh sekali pun memberi saran soal detoks atau obat; dan selalu ada rencana jelas untuk menghubungkan siapa pun yang sedang krisis ke bantuan profesional atau nomor darurat.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Mulailah dari orang-orang yang akan menjaga ruangan: temukan satu dua tetangga dengan pengalaman pulih yang kokoh, ikutkan mereka ke pelatihan resmi pendamping sebaya, dan tulis bersama cakupannya — jaringan ini apa dan bukan apa — sebelum mengumumkan apa pun. Lalu temui langsung program penanganan dan lembaga krisis setempat, supaya jalur rujukanmu berupa hubungan, bukan nomor telepon di selebaran.",
    "commonPitfalls": "Ini jadi berbahaya saat garisnya kabur — fasilitator bermaksud baik yang memberi saran soal detoks atau obat, yang bisa membunuh, atau kelompok yang tergelincir jadi penanganan amatiran karena jalur rujukannya tak pernah nyata. Ia gagal diam-diam lewat kerahasiaan yang bocor — satu cerita yang tersebar mengosongkan ruangan untuk selamanya — dan lewat kelelahan fasilitator, saat orang yang menopang proses pulih semua orang tak punya penopang untuk dirinya sendiri.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Rekrut dan latih fasilitator sebaya",
        "description": "Cari orang yang punya pengalaman pulih sendiri dan ikutkan mereka ke pelatihan pendamping sebaya yang diakui. Tegaskan sejak obrolan pertama: fasilitator adalah teman sesama, bukan tenaga medis atau klinis, dan pelatihanlah yang menjaga garis itu tetap aman.",
        "hours": 5,
        "skills": [
          "memandu diskusi",
          "mengajar"
        ]
      },
      {
        "name": "Tetapkan cakupan dan batasan",
        "description": "Tuliskan apa yang jaringan ini lakukan — dukungan sebaya, keterhubungan, semangat — dan apa yang tidak: penanganan, detoks, perawatan medis, saran obat. Cakupan tertulis melindungi anggota dari saran keliru dan melindungi fasilitator dari memikul yang bukan bagiannya.",
        "hours": 3,
        "skills": [
          "menulis"
        ]
      },
      {
        "name": "Bangun jalur rujukan dan krisis",
        "description": "Jalin hubungan kerja dengan program penanganan profesional, fasilitas kesehatan, dan lembaga krisis, lalu tulis rencana tanggap overdosis. Saat seseorang di ruangan butuh lebih dari yang bisa diberikan sesamanya, serah terimanya harus berupa telepon yang hangat, bukan selebaran.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "riset"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Cari ruang yang aman, privat, dan bebas zat",
        "description": "Cari ruangan yang rahasia, ramah, dan bebas dari penghakiman maupun zat — tempat yang bisa dimasuki orang tanpa mengumumkan apa-apa. Perpustakaan, ruang warga, dan rumah ibadah dengan pintu masuk terpisah semuanya cocok.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Sepakati kerahasiaan dan aturan kelompok",
        "description": "Sepakati aturan dasarnya: yang diucapkan di sini tinggal di sini, saling menghormati tanpa mendesakkan saran, dan hak setiap orang untuk bercerita atau memilih diam. Ucapkan ulang dengan lantang di awal setiap pertemuan tanpa kecuali — aturan hanya melindungi selama masih segar.",
        "hours": 3,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Jadwalkan dan kabarkan pertemuan",
        "description": "Sediakan lebih dari satu waktu pertemuan supaya yang bekerja sampai malam dan para orang tua bisa datang, dan kabarkan dengan bahasa sederhana tanpa stigma — cuma-cuma, terbuka, tanpa syarat. Cara kamu menulis selebarannya menentukan siapa yang merasa aman untuk datang.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Topang fasilitator dan cegah kelelahan",
        "description": "Sapa fasilitator secara rutin, rotasikan siapa yang memimpin, dan pastikan mereka punya penopang sendiri — menjaga ruang bagi proses pulih orang lain adalah kerja yang berat, dan proses pulih fasilitator sendiri selalu nomor satu.",
        "hours": 2,
        "skills": [
          "mendengarkan"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Kelompok olahraga dan kebugaran komunitas",
    "purpose": "Ajak tetangga bergerak bersama tanpa biaya — kelompok jalan kaki, peregangan, olahraga dadakan, menari — karena merasa nyaman di tubuh sendiri tak seharusnya berharga sebesar iuran gym.",
    "whoItServes": "Siapa pun yang ingin bergerak, terutama tetangga yang tak terjangkau biaya gym, para lansia, dan orang-orang kesepian yang bagi mereka kebersamaannya sama penting dengan olahraganya.",
    "whatYoullNeed": "Penolong yang memandu kegiatan, ruang yang aman dan mudah diakses, dan nyaris tanpa peralatan. Gaya yang ramah dan tanpa tekanan lebih penting daripada sertifikat — meski siapa pun yang memimpin kegiatan berat secara fisik harus punya kualifikasi untuk itu, dan setiap sesi butuh air, pemanasan, dan kotak P3K dalam jangkauan.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Sebelum menjadwalkan apa pun, tanyai orang-orang yang ingin kamu ajak datang apa yang benar-benar mereka nikmati — kelompok jalan kaki, peregangan di kursi, malam menari — dan apa yang terasa mungkin bagi tubuh mereka; jawaban itulah yang harus memilih kegiatanmu, bukan sebaliknya. Lalu cari satu dua pemandu yang kehangatannya melebihi keahliannya, susuri bersama ruang-ruang kandidat, dan mulai dengan satu sesi mingguan yang andal sebelum menambah yang lain.",
    "commonPitfalls": "Ini mati lewat dua jalan: berubah jadi ajang pamer — anggota paling bugar memasang tempo, obrolan melantur ke berat badan dan penampilan, dan justru orang-orang yang jadi tujuan kelompok ini berhenti datang diam-diam — atau jadi tak menentu, karena tak ada yang membunuh kelompok jalan kaki lebih cepat daripada dua kali datang ke sesi yang batal. Melewatkan dasar keselamatan yang membosankan adalah jalan ketiga: tanpa pemanasan, tanpa air, tanpa kotak P3K, dan satu kali jatuh mengakhiri semuanya.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Jajaki minat dan tingkat aktivitas",
        "description": "Bertanyalah ke mana-mana — di tempat laundry, hunian lansia, gerbang sekolah — gerak badan macam apa yang orang nikmati dan yang terasa terjangkau. Biarkan jawabannya memimpin: contoh proyek penuh olahraga yang tak diminta siapa pun tidak menolong siapa-siapa.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Cari pemandu kegiatan",
        "description": "Cari tetangga yang mau memimpin jalan kaki, peregangan, menari, atau permainan dadakan. Gaya yang ramah dan tanpa tekanan mengalahkan keahlian untuk kebanyakan kegiatan — tapi siapa pun yang memimpin sesuatu yang berat secara fisik harus memegang kualifikasi yang sesuai.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Temukan ruang yang aman",
        "description": "Tanyakan soal taman, balai warga, dan aula olahraga sekolah — cuma-cuma atau murah, dan terjangkau tanpa mobil. Periksa tiap ruang untuk beragam tubuh dan kemampuan: tanah rata, tempat duduk, keteduhan, toilet, dan tempat berlindung kalau cuaca berubah.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Rancang program inklusif untuk semua tingkat",
        "description": "Rancang tiap kegiatan supaya orang bisa ikut dengan temponya sendiri dan bebas menyesuaikan — pilihan kursi untuk peregangan, putaran pendek di dalam rute jalan yang panjang. Jaga bingkainya pada rasa nyaman, bergerak, dan terhubung, jangan pernah pada penampilan atau prestasi.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Urus keselamatan dan kesehatan",
        "description": "Masukkan pemanasan dan minum ke setiap sesi, sediakan kotak P3K yang lengkap, dan sarankan orang yang baru mulai berolahraga memeriksakan diri ke dokter dulu. Ajari pemandu mengenali gejala kelelahan berlebih dan membuat memperlambat tempo terasa wajar, bukan memalukan.",
        "hours": 3,
        "skills": [
          "pertolongan pertama"
        ]
      },
      {
        "name": "Tetapkan jadwal dan sebarkan kabarnya",
        "description": "Pilih waktu yang ajek supaya orang bisa membangun kebiasaan, dan patuhi. Kabarkan seluas-luasnya — selebaran, grup chat, dari mulut ke mulut — dan katakan terang-terangan bahwa segala usia, ukuran tubuh, dan kemampuan diterima, karena banyak orang menganggap dirinya tidak.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Rawat kebersamaan dan keteraturan",
        "description": "Buat sesinya guyub: nama-nama dihafal, pendatang baru disapa, beberapa menit mengobrol disediakan. Rayakan kehadiran, bukan angka apa pun — keterhubunganlah yang membuat orang terus datang lama setelah rasa barunya pudar.",
        "hours": 2,
        "skills": [
          "memandu diskusi"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Kebun buah kota dan hutan pangan",
    "purpose": "Tanam pohon buah, pohon kacang, dan tanaman pangan tahunan di lahan bersama — hutan pangan yang, sekali mapan, memberi makan lingkunganmu cuma-cuma selama puluhan tahun.",
    "whoItServes": "Seluruh komunitas, termasuk tetangga yang belum datang — pohon yang ditanam tahun ini menjadi sumber pangan segar jangka panjang untuk semua orang.",
    "whatYoullNeed": "Akses lahan jangka panjang (kesepakatan lisan musim demi musim tak cukup untuk pohon), pohon dan tanaman yang cocok dengan iklim, banyak tangan untuk hari gotong royong tanam, dan regu kecil perawat kebun yang berkomitmen bertahun-tahun, bukan berbulan-bulan. Pastikan akses air sebelum apa pun masuk ke tanah.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Obrolan soal lahan mendahului segalanya: bicaralah dengan lembaga nirlaba pengelola lahan, dinas pertamanan, jemaat dengan tanah menganggur — siapa pun yang bisa menjanjikan lokasi untuk sepuluh tahun, bukan satu musim — dan sekalian pastikan airnya. Sambil jalan, cari satu orang yang benar-benar berpengalaman dengan pohon buah untuk menjadi jangkar rancangan, dan tanyai tetangga buah apa yang benar-benar akan mereka petik dan makan, karena kebun berisi buah yang tak diinginkan siapa pun cuma memberi makan tawon.",
    "commonPitfalls": "Kebun buah jarang gagal di hari tanam — ia gagal di tahun kedua dan ketiga, saat keramaian sudah bubar dan tak ada yang mengatur penyiraman, sehingga pohon-pohon muda mati pelan-pelan di musim kemarau pertamanya. Pembunuh lainnya adalah kesepakatan lahan rapuh yang dicabut tepat saat pohon mulai berbuah, dan pertengkaran panen karena tak ada yang menyepakati aturan berbagi sebelum panen besar pertama. Bereskan rawat bergiliran dan aturan berbaginya sejak awal, selagi semuanya masih mudah.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Amankan akses lahan jangka panjang",
        "description": "Dapatkan kesepakatan tertulis yang awet — sewa panjang, pengaturan dengan lembaga pengelola lahan, komitmen resmi pemerintah kota — karena pohon butuh puluhan tahun, bukan kesepakatan lisan musim demi musim. Pastikan akses air yang andal di lokasi sebelum menandatangani apa pun.",
        "hours": 5,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Rancang pola tanam",
        "description": "Pilih jenis yang cocok dengan iklimmu dan rancang dalam lapisan hutan pangan: pohon tajuk, perdu, dan penutup tanah yang bekerja bersama. Rencanakan pasangan penyerbukan dan jarak yang dibutuhkan pohon dewasa, bukan ukuran bibit yang kamu tanam.",
        "hours": 4,
        "skills": [
          "berkebun"
        ]
      },
      {
        "name": "Dapatkan pohon dan tanaman",
        "description": "Dapatkan pohon dan tanaman lewat pembibitan, hibah, sumbangan, dan penjualan musiman akar telanjang — bibit muda dan akar telanjang harganya sepersekian pohon dewasa dalam pot dan biasanya tumbuh lebih mantap. Pesan lebih awal; varietas bagus cepat habis.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Siapkan lahannya",
        "description": "Bereskan tanah sebelum pohonnya tiba: perbaiki tanahnya, hamparkan mulsa, siapkan penyiraman, lalu tandai dan bersihkan tiap titik tanam sesuai rancangan. Lahan yang siap mengubah hari tanam dari kekacauan menjadi barisan kerja yang rapi.",
        "hours": 4,
        "skills": [
          "berkebun"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Adakan gotong royong tanam",
        "description": "Gelar hari tanam bersama dengan petunjuk yang jelas, supaya tiap pohon tertanam di kedalaman yang pas dengan cekungan siram dan mulsanya — salah tanam, pohon gagal pelan-pelan tanpa kelihatan. Buat meriah; hari tanam adalah cara lingkunganmu mulai merasa kebun ini milik mereka.",
        "hours": 5,
        "skills": [
          "berkebun"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Susun perawatan jangka panjang",
        "description": "Atur kerja tak bergemerlap yang menentukan hidup matinya kebun: menyirami pohon muda sepanjang musim-musim kemarau pertamanya, memangkas, memulsa, dan mengurus hama, tahun demi tahun. Rawat bergiliran dengan nama-nama yang berkomitmen mengalahkan daftar panjang orang yang samar-samar bersedia.",
        "hours": 3,
        "skills": [
          "berkebun"
        ]
      },
      {
        "name": "Rencanakan berbagi panen",
        "description": "Sepakati aturan memetik dan berbagi sebelum panen besar pertama, bukan setelah pertengkaran pertama — siapa yang memanen, kapan, dan seberapa banyak. Alirkan kelebihan panen ke kulkas komunitas, rak pangan bersama, dan makan bersama supaya tak ada yang membusuk di dahan.",
        "hours": 2,
        "skills": []
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Jaringan dukungan pascamelahirkan dan orang tua baru",
    "purpose": "Selimuti orang tua baru dan yang sedang menanti dengan bantuan nyata — makanan di depan pintu, belanjaan diurus, piring dicuci, dan sesama orang tua yang pernah mengalaminya — sepanjang kehamilan dan minggu-minggu rapuh setelah melahirkan.",
    "whoItServes": "Orang tua baru dan yang sedang menanti kelahiran, terutama yang keluarganya jauh — minggu-minggu setelah kelahiran adalah saat dukungan paling dibutuhkan dan paling jarang datang.",
    "whatYoullNeed": "Penolong yang bisa memasak, mengurus belanjaan, dan mendengarkan; sistem estafet antar makanan; direktori bantuan; dan orang tua berpengalaman sebagai pendamping sebaya. Dukungan sebaya bukan perawatan medis atau kejiwaan — gangguan suasana hati pascamelahirkan itu umum dan serius, jadi setiap pendamping sebaya harus tahu tanda-tandanya dan cara menghubungkan orang tua ke bantuan profesional dengan lembut. Dan periksa dulu siapa pun yang akan masuk rumah atau membantu mengurus bayi, sebelum ia melakukan salah satunya.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Mulailah dengan bertanya kepada orang tua yang melahirkan dalam setahun terakhir apa yang sebenarnya akan menolong — jawabannya (makanan tanpa harus menerima tamu, seseorang yang menggendong bayi selagi mereka mandi) lebih spesifik dari dugaanmu. Perkenalkan jaringan ini ke bidan, doula, dan klinik anak yang bisa menawarkannya ke keluarga-keluarga, ajak dua tiga orang tua berpengalaman sebagai pendamping sebaya pertamamu, dan tetapkan cara pemeriksaanmu sebelum ada yang melangkahi ambang pintu.",
    "commonPitfalls": "Kegagalan klasiknya adalah dukungan yang berpusat pada penolongnya: datang seenak jadwalnya sendiri, berlama-lama, dan menawarkan pendapat soal pengasuhan alih-alih mencuci piring — orang tua yang kelelahan akan diam-diam berhenti membukakan pintu ketimbang mengatakannya. Yang lebih gawat adalah pendamping yang tak melihat tanda-tanda depresi pascamelahirkan karena tak ada yang melatihnya mengenali atau memberinya kata-kata untuk menyebutkannya. Dan dukungan yang lenyap setelah dua minggu, tepat saat kiriman rantang berhenti dan bagian sulitnya dimulai, sama sekali bukan dukungan.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "childcare-collective",
      "welcome-wagon"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Kumpulkan penolong dan pendamping sebaya",
        "description": "Kumpulkan juru masak, pengurus belanjaan, dan — yang terpenting — orang tua berpengalaman yang bersedia jadi pendamping sebaya. Orang tua yang masih ingat minggu ketiganya sendiri tanpa tidur menawarkan sesuatu yang tak bisa diberikan selebaran mana pun.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Siapkan sistem estafet antar makanan",
        "description": "Bangun cara sederhana untuk mengatur makanan yang diantar sepanjang minggu-minggu setelah kelahiran: kalender bersama, kebutuhan makan dan alergi ditanyakan sekali saja, makanan berlabel dan gampang dihangatkan. Menaruh di depan pintu harus jadi kebiasaan — makanan tak boleh sekali pun mewajibkan kunjungan.",
        "hours": 3,
        "skills": [
          "memasak",
          "koordinasi"
        ]
      },
      {
        "name": "Tawarkan bantuan sehari-hari",
        "description": "Atur penolong untuk beban yang tak bergemerlap: belanjaan, cucian, piring, dan menjaga kakak-kakaknya supaya orang tua bisa istirahat atau pergi ke janji periksa. Tanyakan apa yang diinginkan setiap kali, jangan berasumsi — bantuan yang berguna mengikuti daftar si orang tua, bukan daftar penolongnya.",
        "hours": 3,
        "skills": [
          "mengasuh anak"
        ]
      },
      {
        "name": "Susun direktori bantuan",
        "description": "Kumpulkan konselor menyusui, penanganan kejiwaan pascamelahirkan, klinik anak, dan sumber perlengkapan bayi setempat — termasuk bank popok dan kolektif pengasuhan anak kalau komunitasmu menjalankannya. Jaga tetap mutakhir; direktori berisi nomor mati lebih buruk daripada tidak ada sama sekali.",
        "hours": 4,
        "skills": [
          "input data"
        ]
      },
      {
        "name": "Bentuk lingkar dukungan sebaya",
        "description": "Mulai kelompok-kelompok kecil tempat orang tua baru bisa jujur tentang beratnya semua ini, dengan orang tua berpengalaman yang menjaga ruangnya. Latih para pendamping mengenali tanda depresi dan kecemasan pascamelahirkan serta mendorong dengan lembut dan gigih ke penanganan profesional — jangan pernah mendiagnosis, jangan pernah menunggu.",
        "hours": 3,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Tetapkan praktik keselamatan dan batasan",
        "description": "Periksa setiap penolong yang akan masuk rumah atau membantu mengurus bayi — minimal referensi — dan tuliskan batasannya: orang tua yang menentukan syaratnya, kunjungan singkat kecuali diundang lebih lama, dan tak seorang pun datang tanpa kabar. Dukungan tak boleh terasa seperti pengawasan.",
        "hours": 3,
        "skills": []
      },
      {
        "name": "Sambungkan ke proyek lain",
        "description": "Hubungkan keluarga-keluarga ke bank popok, kolektif pengasuhan anak, dan tim penyambut warga baru supaya satu titik kontak membuka semuanya. Orang tua baru tak seharusnya menemukan tiap program sendiri-sendiri di saat paling melelahkan dalam hidupnya.",
        "hours": 2,
        "skills": [
          "menjangkau warga"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Jaringan pendukung keluarga asuh dan kerabat pengasuh",
    "purpose": "Berdirilah di belakang keluarga asuh, kerabat pengasuh, dan keluarga pengasuh lainnya — pakaian dan ranjang saat seorang anak datang malam itu juga, jeda saat pengasuh nyaris kehabisan tenaga, dan sesama pengasuh yang memahami beratnya.",
    "whoItServes": "Orang tua asuh, kakek nenek dan kerabat yang membesarkan anak — kerabat pengasuh sering memulai dari satu telepon dengan tenggat beberapa jam saja — serta anak-anak dalam asuhan mereka.",
    "whatYoullNeed": "Penolong, barang sumbangan untuk segala usia dan ukuran, penolong jeda, dan kemitraan dengan lembaga serta sekolah. Kerja yang melibatkan anak dalam pengasuhan itu sensitif dan diatur hukum: periksa semua orang yang bekerja dengan anak, patuhi aturan wajib lapor dan kerahasiaan sampai ke hurufnya, dan berkoordinasilah dengan lembaga terkait, bukan mengitarinya.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Mulailah dengan duduk bersama lembaga pengasuhan anak setempat atau program pendamping kerabat pengasuh: pelajari aturan yang menaungi kerja ini — pemeriksaan latar belakang, wajib lapor, kerahasiaan — sebelum mengajak satu penolong pun, dan biarkan mereka menunjukkan di mana celah yang sebenarnya. Lalu tanyai beberapa keluarga pengasuh apa yang mereka butuhkan di minggu pertama dan tahun pertama; bangunlah ke arah jawaban itu, bukan ke arah gudang barang yang tak diminta siapa pun.",
    "commonPitfalls": "Proyek ini bisa gagal dengan gaduh atau diam-diam. Gaduh: penolong yang belum diperiksa berada di dekat anak-anak, atau kisah sebuah keluarga tersebar tanpa izin — keduanya bisa melukai anak, mengakhiri penempatan, dan menamatkan proyek dalam sehari. Diam-diam: gunung sumbangan tak terpilah sementara seorang pengasuh menunggu tiga minggu demi ranjang balita, atau memperlakukan lembaga sebagai lawan sampai mereka berhenti merujuk keluarga. Kecil, terperiksa, dan terkoordinasi mengalahkan besar dan asal jalan di sini, selalu.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "free-store",
      "childcare-collective"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Jalin hubungan dengan keluarga pengasuh",
        "description": "Jangkau keluarga pengasuh lewat lembaga, sekolah, dan kelompok keagamaan — terutama kerabat pengasuh, yang sering menerima cucu atau keponakan malam itu juga tanpa persiapan dan nyaris tanpa dukungan resmi. Jadikan kontak pertama sebuah tawaran, jangan pernah penyaringan.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Kumpulkan stok pakaian dan barang",
        "description": "Kumpulkan pakaian, ranjang, kursi mobil anak, dan kebutuhan harian untuk seluruh rentang usia dan ukuran, karena pengasuh jarang tahu siapa yang datang sampai anaknya tiba. Periksa barang keselamatan dengan teliti — kursi mobil anak dan ranjang bayi punya tanggal kedaluwarsa dan daftar penarikan produk.",
        "hours": 4,
        "skills": [
          "koordinasi"
        ]
      },
      {
        "name": "Buat sistem pasokan cepat tanggap",
        "description": "Siapkan tas siap bawa — pakaian beberapa hari, perlengkapan mandi, dan satu benda penenang seperti boneka — dipilah per usia dan ukuran, bisa diantar dalam hitungan jam setelah penempatan baru. Anak yang datang tanpa apa-apa tak seharusnya menunggu seminggu untuk punya sesuatu miliknya sendiri.",
        "hours": 3,
        "follows": [
          1
        ],
        "skills": []
      },
      {
        "name": "Atur bantuan jeda pengasuh",
        "description": "Siapkan pengasuhan yang aman dan sudah diperiksa semestinya supaya para pengasuh bisa istirahat, menepati janji, atau sekadar menarik napas — kelelahan pengasuh adalah salah satu alasan utama penempatan kandas. Koordinasikan dengan lembaga siapa yang boleh memberi pengasuhan jeda dan dengan aturan apa.",
        "hours": 4,
        "skills": [
          "mengasuh anak"
        ]
      },
      {
        "name": "Adakan kelompok dukungan sebaya",
        "description": "Gelar pertemuan rutin tempat orang tua asuh dan kerabat pengasuh bisa bertukar pengalaman dan saran jujur dengan orang-orang yang paham — kerja ini menyendirikan, dan pengasuh tiga gang dari rumahmu mungkin memikul beban yang sama sendirian.",
        "hours": 3,
        "skills": [
          "memandu diskusi"
        ]
      },
      {
        "name": "Susun direktori bantuan",
        "description": "Kumpulkan program, tunjangan, dan dukungan peka trauma yang bisa dimanfaatkan keluarga pengasuh, dan bantu mereka menyusuri sistem yang membingungkan bahkan bagi orang yang bekerja di dalamnya. Kerabat pengasuh khususnya sering berhak atas bantuan yang tak pernah diberitahukan siapa pun.",
        "hours": 3,
        "skills": [
          "input data"
        ]
      },
      {
        "name": "Tetapkan praktik keselamatan anak dan privasi",
        "description": "Tuliskan dan patuhi yang tak bisa ditawar: pemeriksaan untuk siapa pun yang bekerja dengan anak, apa yang dituntut aturan wajib lapor dari para penolongmu, dan privasi ketat untuk keluarga dan anak-anak — tanpa foto, tanpa cerita, tanpa detail yang dibagikan tanpa izin.",
        "hours": 4,
        "skills": [
          "menulis"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Bantuan bertahan saat dingin dan panas ekstrem",
    "purpose": "Antarkan perbekalan bertahan hidup ke tetangga yang hidup di jalanan saat cuaca berubah mematikan — selimut dan penghangat tangan saat dingin menggigit, air dan oralit saat gelombang panas — dibawa langsung ke tempat orang-orang benar-benar berada.",
    "whoItServes": "Tetangga tanpa tempat tinggal dan yang hidupnya lekat dengan jalanan, terpapar cuaca ekstrem — orang-orang yang baginya gelombang panas atau dingin menusuk adalah ancaman nyawa, bukan sekadar gangguan.",
    "whatYoullNeed": "Perbekalan sesuai musim, penolong turun jalan, rute terencana, dan hubungan yang terjaga dengan penampungan dan lembaga bantuan. Panas dan dingin ekstrem itu membunuh: setiap penolong harus terlatih mengenali hipotermia dan sengatan panas serta memanggil bantuan medis profesional tanpa menunda — jangan pernah menunggu dan melihat dulu.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Sebelum membeli selembar selimut pun, bicaralah dengan para penjangkau dan organisasi yang sudah menyusuri rute-rute ini — merekalah yang memegang kepercayaan dan tahu di mana orang-orang sebenarnya berada, dan mereka akan memberitahumu apa yang sudah tertangani dan apa yang belum. Sepakati dengan mereka bagaimana kamu akan mengisi tempat, tetapkan ambang prakiraan cuaca yang memicu rondamu, dan penuhi perbekalan musim itu selagi cuaca masih bersahabat.",
    "commonPitfalls": "Kegagalan yang mudah ditebak adalah memulai bersamaan dengan cuacanya: perbekalan yang dicari di tengah gelombang panas tiba setelah bahayanya lewat, dan orang asing yang baru muncul pertama kali justru di masa krisis akan menerima penolakan waswas dari orang-orang yang belajar berhati-hati dengan cara yang pahit. Kegagalan yang berbahaya adalah penolong yang mencoba menangani kedaruratan medis sendiri alih-alih segera memanggil bantuan, dan mendesak orang untuk pindah atau menerima penampungan — tawarkan, beri tahu, dan hormati jawabannya.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Rakit paket sesuai musim",
        "description": "Kemasi paket sesuai musimnya: selimut, kaus kaki hangat, topi, sarung tangan, dan penghangat tangan untuk dingin; air, oralit, tabir surya, topi, dan kain pendingin untuk panas. Selipkan di tiap paket kartu berisi lokasi penampungan dan nomor krisis.",
        "hours": 4,
        "skills": []
      },
      {
        "name": "Kumpulkan perbekalan",
        "description": "Adakan penggalangan barang, belanja borongan, dan minta sumbangan ke toko dan jemaat — dan lakukan sebelum musimnya, karena mencari selimut saat dingin pertama menusuk berarti datang terlambat. Timbun cukup untuk mengisi ulang di tengah musim.",
        "hours": 4,
        "skills": [
          "menjangkau warga",
          "menyetir"
        ]
      },
      {
        "name": "Petakan tempat menjangkau orang",
        "description": "Bekerjalah dengan para penjangkau yang sudah ada untuk tahu di mana tetangga yang hidup di jalanan benar-benar bermalam — mereka memegang kepercayaan dan pengetahuan yang dibangun bertahun-tahun, dan datang di samping mereka mengalahkan datang sebagai orang asing. Jaga petanya longgar dan mutakhir; orang berpindah, apalagi saat cuaca buruk.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Ajak dan latih penolong turun jalan",
        "description": "Latih setiap penolong sebelum ronda pertamanya: cara menyapa yang hormat dan menerima jawaban tidak, keselamatan diri dan selalu berjalan berdua, serta mengenali kedaruratan medis akibat cuaca. Tak seorang pun membagikan apa pun sebelum dilatih.",
        "hours": 4,
        "skills": [
          "mengajar"
        ]
      },
      {
        "name": "Susun rencana distribusi dan rute",
        "description": "Rencanakan rute dan waktunya untuk hari-hari menjelang dan selama cuaca berbahaya, menjangkau yang paling terpapar lebih dulu — yang paling jauh dari bantuan, yang tidur di ruang terbuka dan bukan di kendaraan atau penampungan. Putuskan dari awal prakiraan seperti apa yang memicu satu ronda.",
        "hours": 3,
        "skills": [
          "koordinasi"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Hubungkan orang ke penampungan dan bantuan",
        "description": "Bawa informasi mutakhir dan terverifikasi soal tempat penghangat dan pendingin, kasur penampungan, dan pusat sumber daya — jam dan aturannya berubah terus, dan rujukan ke pintu yang tertutup membakar kepercayaan. Tawarkan sambungan tanpa desakan; hubungannya berumur lebih panjang daripada satu malam mana pun.",
        "hours": 3,
        "skills": [
          "menjangkau warga"
        ]
      },
      {
        "name": "Bersiap untuk kedaruratan",
        "description": "Latih setiap penolong mengenali hipotermia dan sengatan panas — kebingungan, bicara pelo, kulit panas dan kering atau dingin dan lembap — dan segera menelepon nomor darurat, bukan menunggu dan melihat dulu. Latih juga apa yang dilakukan sambil menanti bantuan: keteduhan dan air, atau selimut dan pelindung angin.",
        "hours": 3,
        "skills": [
          "pertolongan pertama"
        ]
      }
    ]
  }
];
