export interface Province {
  id: string;
  name: string;
  capital: string;
  island: "Sumatra" | "Jawa" | "Kalimantan" | "Sulawesi" | "NusaTenggaraBali" | "Maluku" | "Papua";
  coords: { x: number; y: number }; // Percentage coords on our unified digital map canvas (0-100)
  description: string;
  facts: string[];
  tourism: string[];
  culture: string[];
  culinary: string[];
  color: string; // Tailored ambient color theme for each province
}

export const ISLAND_GROUPS = [
  { id: "Sumatra", name: "Sumatra", color: "from-emerald-600 to-teal-500", label: "Pulau Sumatra" },
  { id: "Jawa", name: "Jawa", color: "from-sky-600 to-blue-500", label: "Pulau Jawa" },
  { id: "Kalimantan", name: "Kalimantan", color: "from-amber-600 to-orange-500", label: "Pulau Kalimantan" },
  { id: "Sulawesi", name: "Sulawesi", color: "from-purple-600 to-indigo-500", label: "Pulau Sulawesi" },
  { id: "NusaTenggaraBali", name: "Bali & Nusa Tenggara", color: "from-rose-600 to-pink-500", label: "Kepulauan Nusa Tenggara & Bali" },
  { id: "Maluku", name: "Maluku", color: "from-cyan-600 to-sky-500", label: "Kepulauan Maluku" },
  { id: "Papua", name: "Papua", color: "from-violet-600 to-fuchsia-500", label: "Tanah Papua" },
];

export const PROVINCES: Province[] = [
  // --- SUMATRA ---
  {
    id: "aceh",
    name: "Aceh",
    capital: "Banda Aceh",
    island: "Sumatra",
    coords: { x: 8, y: 15 },
    description: "Serambi Mekkah yang kaya sejarah kerajaan Islam, hukum adat mandiri, kopi Gayo legendaris, dan pesona alam Pulau Weh yang eksotis.",
    facts: [
      "Satu-satunya provinsi yang menerapkan syariat Islam di Indonesia.",
      "Tari Saman telah diakui oleh UNESCO sebagai Warisan Budaya Takbenda.",
      "Memiliki pelabuhan kuno Barus yang sudah terkenal sejak abad ke-1 Masehi."
    ],
    tourism: ["Masjid Raya Baiturrahman","Pulau Weh (Sabang)","Taman Nasional Gunung Leuser","Museum Tsunami Aceh","Pantai Lampuuk","Danau Laut Tawar","Puncak Gurutee"],
    culture: ["Tari Saman", "Tari Seudati", "Rumah Adat Krong Bade", "Rencong"],
    culinary: ["Mie Aceh", "Kopi Gayo", "Ayam Tangkap", "Roti Canai"],
    color: "#059669"
  },
  {
    id: "sumut",
    name: "Sumatera Utara",
    capital: "Medan",
    island: "Sumatra",
    coords: { x: 14, y: 25 },
    description: "Tanah adat Batak dan Melayu yang megah, menaungi Danau Toba yang mistis—danau vulkanik terbesar di dunia dengan Pulau Samosir di tengahnya.",
    facts: [
      "Danau Toba terbentuk dari letusan supervolcano mahadahsyat sekitar 74.000 tahun lalu.",
      "Ibu kota Medan adalah salah satu pusat multikulturalisme terbesar dengan komunitas Tionghoa, India, Melayu, dan Batak.",
      "Istana Maimun mencerminkan arsitektur perpaduan Melayu, Islam, Spanyol, India, dan Italia."
    ],
    tourism: ["Danau Toba & Pulau Samosir","Istana Maimun","Bukit Lawang","Air Terjun Sipiso-piso","Taman Alam Lumbini","Kawah Putih Tinggi Raja","Rahmat International Wildlife Museum"],
    culture: ["Tari Tor-Tor", "Kain Ulos", "Rumah Bolon Batak", "Alat Musik Garantung"],
    culinary: ["Bika Ambon", "Soto Medan", "Arsik Ikan Mas", "Durian Ucok"],
    color: "#047857"
  },
  {
    id: "sumbar",
    name: "Sumatera Barat",
    capital: "Padang",
    island: "Sumatra",
    coords: { x: 18, y: 38 },
    description: "Pusat kebudayaan Minangkabau yang menganut sistem matrilineal, terkenal dengan kuliner Rendang terbaik dunia, tari piring, dan arsitektur Rumah Gadang.",
    facts: [
      "Masyarakat Minangkabau adalah kelompok matrilineal terbesar di dunia.",
      "Rendang dinobatkan sebagai salah satu makanan terlezat di dunia versi CNN berkali-kali.",
      "Lembah Harau sering dijuluki sebagai Yosemite-nya Indonesia."
    ],
    tourism: ["Jam Gadang","Lembah Harau","Danau Maninjau","Pantai Air Manis","Istano Basa Pagaruyung","Kepulauan Mentawai","Ngarai Sianok"],
    culture: ["Tari Piring", "Kain Songket Pandai Sikek", "Rumah Gadang", "Upacara Tabuik"],
    culinary: ["Rendang Minang", "Sate Padang", "Nasi Kapau", "Teh Talua"],
    color: "#0f766e"
  },
  {
    id: "riau",
    name: "Riau",
    capital: "Pekanbaru",
    island: "Sumatra",
    coords: { x: 23, y: 30 },
    description: "Gerbang perdagangan Sumatra, pusat peradaban Kesultanan Siak Sri Indrapura, serta produsen kelapa sawit dan minyak bumi terkemuka.",
    facts: [
      "Bahasa Melayu Riau menjadi cikal bakal bahasa persatuan, Bahasa Indonesia.",
      "Istana Siak menyimpan alat musik Komet, piringan musik langka yang hanya ada dua di dunia."
    ],
    tourism: ["Istana Siak Sri Indrapura","Candi Muara Takus","Sungai Kampar (Ombak Bono)","Pulau Jemur","Air Terjun Aek Martua","Taman Nasional Tesso Nilo"],
    culture: ["Tari Zapin Melayu", "Kain Tenun Siak", "Seni Teater Mak Yong"],
    culinary: ["Gulai Patin", "Ikan Baung Asam Pedas", "Lopek Bugi"],
    color: "#14b8a6"
  },
  {
    id: "kepri",
    name: "Kepulauan Riau",
    capital: "Tanjungpinang",
    island: "Sumatra",
    coords: { x: 28, y: 28 },
    description: "Kepulauan maritim strategis berbatasan dengan Singapura, menawarkan keindahan Pulau Bintan dan sejarah megah Pulau Penyengat.",
    facts: [
      "Pulau Penyengat adalah pusat penulisan Gurindam 12 oleh Raja Ali Haji, pahlawan bahasa Indonesia.",
      "Kota Batam adalah kawasan perdagangan bebas dan manufaktur tersibuk di jalur internasional."
    ],
    tourism: ["Pulau Penyengat","Pantai Trikora Bintan","Jembatan Barelang","Bawah Reserve","Gurun Pasir Busung","Pantai Lagoi","Pulau Ranoh"],
    culture: ["Gurindam 12", "Tari Joget Lambak", "Kain Serat Mahkota"],
    culinary: ["Otak-Otak Kepri", "Luten Bertelur", "Mie Lendir"],
    color: "#20b2aa"
  },
  {
    id: "jambi",
    name: "Jambi",
    capital: "Jambi",
    island: "Sumatra",
    coords: { x: 24, y: 43 },
    description: "Provinsi yang dialiri Sungai Batanghari, menyimpan kompleks percandian bata merah terluas di Asia Tenggara, Candi Muaro Jambi.",
    facts: [
      "Kawasan Candi Muaro Jambi memiliki luas 12 kilometer persegi, diduga pusat universitas Buddha kuno.",
      "Gunung Kerinci adalah gunung berapi aktif tertinggi di Asia Tenggara (3.805 mdpl)."
    ],
    tourism: ["Situs Candi Muaro Jambi","Gunung Kerinci","Danau Kaco","Taman Nasional Bukit Duabelas","Jembatan Gentala Arasy","Geopark Merangin"],
    culture: ["Tari Sekapur Sirih", "Batik Jambi", "Rumah Lari Kambing"],
    culinary: ["Tempoyak Patin", "Nasi Gemuk", "Kue Padamaran"],
    color: "#115e59"
  },
  {
    id: "sumsel",
    name: "Sumatera Selatan",
    capital: "Palembang",
    island: "Sumatra",
    coords: { x: 26, y: 50 },
    description: "Pusat Kerajaan Sriwijaya kuno yang legendaris, kemegahan Jembatan Ampera di atas Sungai Musi, serta surga kuliner Pempek.",
    facts: [
      "Sriwijaya adalah kerajaan maritim terbesar di Asia Tenggara yang menguasai Selat Malaka.",
      "Palembang merupakan salah satu kota tertua di Indonesia, berdiri sejak Juni 682 Masehi."
    ],
    tourism: ["Jembatan Ampera","Pulau Kemaro","Taman Purbakala Kerajaan Sriwijaya","Danau Ranau","Gunung Dempo","Benteng Kuto Besak"],
    culture: ["Tari Gending Sriwijaya", "Kain Songket Palembang", "Rumah Limas"],
    culinary: ["Pempek Palembang", "Tekwan", "Laksan", "Pindang Patin"],
    color: "#065f46"
  },
  {
    id: "babel",
    name: "Bangka Belitung",
    capital: "Pangkalpinang",
    island: "Sumatra",
    coords: { x: 33, y: 47 },
    description: "Kepulauan penghasil timah terbesar, terkenal dengan pantai-pantai eksotis berbatu granit raksasa yang diabadikan dalam novel Laskar Pelangi.",
    facts: [
      "Pantai Belitung terkenal dengan formasi batu granit artistik berusia 200 juta tahun.",
      "Museum Kata Andrea Hirata di Belitung adalah museum sastra pertama di Indonesia."
    ],
    tourism: ["Pantai Tanjung Tinggi","Pulau Lengkuas","Museum Kata Andrea Hirata","Danau Kaolin","Pantai Parai Tenggiri","Bangka Botanical Garden"],
    culture: ["Tari Sepintu Sedulang", "Tradisi Nganggung", "Kain Cual Bangka"],
    culinary: ["Mie Bangka", "Lempah Kuning", "Martabak Manis Bangka"],
    color: "#0d9488"
  },
  {
    id: "bengkulu",
    name: "Bengkulu",
    capital: "Bengkulu",
    island: "Sumatra",
    coords: { x: 21, y: 48 },
    description: "Tanah pesisir barat yang tenang, tempat ditemukannya bunga raksasa Rafflesia arnoldii dan sejarah pengasingan Presiden Soekarno.",
    facts: [
      "Bunga Rafflesia arnoldii adalah bunga terbesar di dunia, ditemukan pertama kali di Bengkulu tahun 1818.",
      "Benteng Marlborough (Fort Marlborough) adalah benteng peninggalan Inggris terbesar di Asia."
    ],
    tourism: ["Fort Marlborough","Rumah Pengasingan Bung Karno","Pusat Pelatihan Gajah Seblat","Pantai Panjang","Danau Dendam Tak Sudah","Pulau Enggano"],
    culture: ["Tari Kejei", "Upacara Tabot", "Kain Besurek"],
    culinary: ["Pendap", "Bagendit", "Gulai Kemba'ang"],
    color: "#134e4a"
  },
  {
    id: "lampung",
    name: "Lampung",
    capital: "Bandar Lampung",
    island: "Sumatra",
    coords: { x: 29, y: 56 },
    description: "Gerbang utama pulau Sumatra dari Jawa, pusat konservasi Gajah Sumatra Way Kambas, dan keindahan Anak Gunung Krakatau.",
    facts: [
      "Taman Nasional Way Kambas adalah sekolah pelatihan gajah pertama dan tertua di Indonesia.",
      "Menara Siger merupakan simbol titik nol selatan Sumatra yang ikonik di pelabuhan Bakauheni."
    ],
    tourism: ["Taman Nasional Way Kambas","Gunung Anak Krakatau","Pantai Gigi Hiu","Teluk Kiluan","Pulau Pahawang","Menara Siger","Taman Nasional Bukit Barisan Selatan"],
    culture: ["Tari Sembah", "Kain Tapis Lampung", "Sigeh Pengunten"],
    culinary: ["Seruit", "Kripik Pisang Cokelat", "Sambal Tempoyak"],
    color: "#12b886"
  },

  // --- JAWA ---
  {
    id: "banten",
    name: "Banten",
    capital: "Serang",
    island: "Jawa",
    coords: { x: 31, y: 64 },
    description: "Wilayah barat Jawa pelindung Baduy kuno yang asri, keagungan peninggalan Kesultanan Banten, serta eksotisme Taman Nasional Ujung Kulon.",
    facts: [
      "Suku Baduy Dalam di Banten menolak modernisasi dan hidup harmonis dengan alam murni tanpa listrik.",
      "Taman Nasional Ujung Kulon adalah habitat terakhir Badak Jawa bercula satu yang terancam punah."
    ],
    tourism: ["Taman Nasional Ujung Kulon","Kampung Adat Baduy","Masjid Agung Banten","Pantai Anyer","Pantai Tanjung Lesung","Pulau Umang","Gunung Krakatau"],
    culture: ["Seni Debus", "Angklung Buhun Baduy", "Pakaian Adat Pangsi"],
    culinary: ["Sate Bandeng", "Rabeg Banten", "Nasi Sumsum"],
    color: "#0284c7"
  },
  {
    id: "jakarta",
    name: "DKI Jakarta",
    capital: "Jakarta",
    island: "Jawa",
    coords: { x: 34, y: 63 },
    description: "Metropolitan megapolitan yang dinamis, pusat pemerintahan historis Indonesia, kaya akan cagar budaya Betawi dan ikon Monumen Nasional.",
    facts: [
      "Jakarta adalah kota terbesar di Asia Tenggara dan pernah bernama Batavia serta Jayakarta.",
      "Memiliki sistem transportasi BRT (Transjakarta) terpanjang di dunia."
    ],
    tourism: ["Monas (Monumen Nasional)","Kota Tua","Taman Mini Indonesia Indah (TMII)","Taman Impian Jaya Ancol","Kepulauan Seribu","Museum Nasional","Galeri Nasional"],
    culture: ["Ondel-Ondel", "Tari Yapong", "Rumah Kebaya Betawi", "Gambang Kromong"],
    culinary: ["Kerak Telor", "Soto Betawi", "Gado-Gado", "Roti Buaya"],
    color: "#0369a1"
  },
  {
    id: "jabar",
    name: "Jawa Barat",
    capital: "Bandung",
    island: "Jawa",
    coords: { x: 36, y: 66 },
    description: "Bumi Pasundan berbukit hijau yang romantis, pusat kreativitas Bandung 'Paris van Java', alunan musik Angklung bambu, dan budaya Sunda.",
    facts: [
      "Angklung terdaftar sebagai Warisan Budaya Takbenda UNESCO sejak tahun 2010.",
      "Gedung Sate di Bandung memiliki tusuk sate ikonik di puncaknya dengan 6 ornamen air yang melambangkan biaya pembangunan."
    ],
    tourism: ["Kawah Putih Ciwidey","Tangkuban Perahu","Saung Angklung Udjo","Pangandaran","Kebun Raya Bogor","Taman Safari Indonesia","Gunung Gede Pangrango","Green Canyon"],
    culture: ["Tari Jaipong", "Alat Musik Angklung", "Wayang Golek", "Rumah Julang Ngapak"],
    culinary: ["Nasi Timbel", "Karedok", "Seblak", "Batagor & Somay"],
    color: "#0284c7"
  },
  {
    id: "jateng",
    name: "Jawa Tengah",
    capital: "Semarang",
    island: "Jawa",
    coords: { x: 42, y: 66 },
    description: "Jantung kebudayaan Jawa yang dikelilingi candi-candi megah peninggalan dinasti Syailendra, dataran tinggi Dieng, dan sentra ukir Jepara.",
    facts: [
      "Candi Borobudur di Magelang adalah candi Buddha terbesar di dunia yang dibangun abad ke-9.",
      "Batik tulis Lasem terkenal dengan perpaduan warna merah darah ayam khas Tionghoa dan motif Jawa."
    ],
    tourism: ["Candi Borobudur","Dataran Tinggi Dieng","Kepulauan Karimunjawa","Candi Prambanan (Bagian Klaten)","Lawang Sewu","Gunung Merbabu","Kawasan Wisata Bandungan"],
    culture: ["Wayang Kulit", "Keris", "Gamelan Jawa", "Rumah Joglo"],
    culinary: ["Lumpia Semarang", "Nasi Liwet Solo", "Soto Kudus", "Gethuk"],
    color: "#0f52ba"
  },
  {
    id: "yogyakarta",
    name: "DI Yogyakarta",
    capital: "Yogyakarta",
    island: "Jawa",
    coords: { x: 43, y: 69 },
    description: "Daerah Istimewa berbentuk kesultanan kerajaan yang hidup, pusat pendidikan, seni rupa, pertunjukan jalanan Malioboro, dan Candi Prambanan.",
    facts: [
      "Satu-satunya provinsi yang dipimpin oleh seorang Sultan sebagai Gubernur turun-temurun secara sah.",
      "Candi Prambanan adalah kompleks candi Hindu terindah di Asia Tenggara."
    ],
    tourism: ["Keraton Yogyakarta", "Candi Prambanan", "Jalan Malioboro", "Pantai Parangtritis"],
    culture: ["Tari Bedhaya", "Batik Motif Parang", "Karawitan", "Upacara Sekaten"],
    culinary: ["Gudeg Jogja", "Bakpia Pathok", "Sate Klatak", "Kopi Joss"],
    color: "#1e3a8a"
  },
  {
    id: "jatim",
    name: "Jawa Timur",
    capital: "Surabaya",
    island: "Jawa",
    coords: { x: 49, y: 67 },
    description: "Tanah pahlawan legendaris, keindahan alam vulkanik Gunung Bromo yang magis, kawah biru Ijen, dan tarian topeng Reog Ponorogo.",
    facts: [
      "Gunung Bromo terkenal dengan lautan pasir berbisik dan upacara Kasada suku Tengger.",
      "Kawah Ijen memiliki fenomena 'Blue Fire' api biru belerang alami yang hanya ada dua di dunia."
    ],
    tourism: ["Gunung Bromo","Kawah Ijen","Taman Nasional Baluran","Batu Secret Zoo","Museum Angkut","Jatim Park","Taman Nasional Alas Purwo","Gili Ketapang"],
    culture: ["Reog Ponorogo", "Tari Gandrung", "Karapan Sapi Madura"],
    culinary: ["Rawon (Sup Hitam)", "Rujak Cingur", "Lontong Kupang", "Sate Madura"],
    color: "#1d4ed8"
  },

  // --- BALI & NUSA TENGGARA ---
  {
    id: "bali",
    name: "Bali",
    capital: "Denpasar",
    island: "NusaTenggaraBali",
    coords: { x: 53, y: 69 },
    description: "Pulau Dewata destinasi wisata nomor satu dunia, perpaduan kental tradisi Hindu Dharma, pantai eksotis, sawah terasering Ubud, dan tari kecak.",
    facts: [
      "Nyepi adalah hari keheningan total di seluruh pulau, tanpa penerangan, aktivitas, maupun penerbangan.",
      "Sistem irigasi sawah Subak di Bali ditetapkan sebagai Warisan Dunia UNESCO."
    ],
    tourism: ["Tanah Lot","Ubud Sawah Terasering","Pura Uluwatu","Nusa Penida","Pantai Kuta","Gunung Batur","Taman Nasional Bali Barat","Pura Besakih","Monkey Forest Ubud"],
    culture: ["Tari Kecak", "Tari Barong", "Sistem Irigasi Subak", "Upacara Ngaben (Kremasi)"],
    culinary: ["Ayam Betutu", "Sate Lilit", "Babi Guling (Khas)", "Lawar"],
    color: "#be123c"
  },
  {
    id: "ntb",
    name: "Nusa Tenggara Barat",
    capital: "Mataram",
    island: "NusaTenggaraBali",
    coords: { x: 58, y: 69 },
    description: "Kepulauan surga wisata Mandalika, keagungan Gunung Rinjani, pantai pasir pink yang langka, serta tiga pulau eksotis Gili Trawangan.",
    facts: [
      "Sirkuit Mandalika di Lombok adalah sirkuit MotoGP jalan raya berkelas internasional paling indah.",
      "Gunung Tambora pernah meletus dahsyat tahun 1815, mengubah iklim dunia hingga memicu 'tahun tanpa musim panas' di Eropa."
    ],
    tourism: ["Gili Trawangan, Meno & Air","Sirkuit Mandalika","Gunung Rinjani","Pantai Pink","Bukit Merese","Air Terjun Sendang Gile","Desa Sade"],
    culture: ["Tari Gendang Beleq", "Rumah Adat Bale Tani Suku Sasak", "Tenun Ikat Sasak"],
    culinary: ["Ayam Taliwang", "Plecing Kangkung", "Sate Rembiga"],
    color: "#e11d48"
  },
  {
    id: "ntt",
    name: "Nusa Tenggara Timur",
    capital: "Kupang",
    island: "NusaTenggaraBali",
    coords: { x: 67, y: 72 },
    description: "Rumah naga purba raksasa Komodo Dragon, keajaiban danau tiga warna Kelimutu, pulau Sumba yang magis, dan kerajinan tenun ikat bernilai tinggi.",
    facts: [
      "Taman Nasional Komodo adalah satu-satunya habitat alami Komodo Dragon di dunia.",
      "Danau Kelimutu memiliki tiga kawah dengan warna air berbeda yang terus berubah sewaktu-waktu secara misterius."
    ],
    tourism: ["Pulau Komodo","Danau Kelimutu","Pulau Sumba (Bukit Wairinding)","Desa Wae Rebo","Pantai Nihiwatu","Pulau Padar","Labuan Bajo"],
    culture: ["Alat Musik Sasando", "Tari Caci", "Tenun Ikat Alor & Sumba", "Kampung Adat Waerebo"],
    culinary: ["Daging Se'i Kupang", "Jagung Bose", "Kolo (Nasi Bakar Bambu)"],
    color: "#9f1239"
  },

  // --- KALIMANTAN ---
  {
    id: "kalbar",
    name: "Kalimantan Barat",
    capital: "Pontianak",
    island: "Kalimantan",
    coords: { x: 38, y: 39 },
    description: "Kota Khatulistiwa di mana matahari bersinar tepat di atas kepala, pesona kebudayaan Tionghoa-Dayak-Melayu, dan Sungai Kapuas terpanjang.",
    facts: [
      "Pontianak dilalui garis imajiner Khatulistiwa (0 derajat lintang bumi) yang ditandai dengan Tugu Khatulistiwa.",
      "Sungai Kapuas adalah sungai terpanjang di Indonesia, membentang sejauh 1.143 km."
    ],
    tourism: ["Tugu Khatulistiwa","Keraton Kadriyah","Taman Nasional Sentarum","Pulau Randayan","Pantai Pasir Panjang","Bukit Kelam","Rumah Betang Radakng"],
    culture: ["Tari Monong Dayak", "Rumah Betang", "Perayaan Cap Go Meh Singkawang"],
    culinary: ["Bubur Pedas", "Choipan Pontianak", "Asam Pedas Tempoyak"],
    color: "#ea580c"
  },
  {
    id: "kalteng",
    name: "Kalimantan Tengah",
    capital: "Palangkaraya",
    island: "Kalimantan",
    coords: { x: 44, y: 44 },
    description: "Hutan hujan tropis yang lebat, pusat perlindungan Orangutan dunia di Tanjung Puting, dan kediaman asli suku Dayak pedalaman.",
    facts: [
      "Taman Nasional Tanjung Puting diakui dunia sebagai cagar biosfer habitat asli Orangutan terbesar.",
      "Palangkaraya pernah direncanakan oleh Presiden Soekarno sebagai calon ibu kota masa depan Indonesia."
    ],
    tourism: ["Taman Nasional Tanjung Puting","Sungai Kahayan","Bukit Tangkiling","Taman Nasional Sebangau","Danau Tahai","Museum Balanga"],
    culture: ["Tari Kinyah Mandau", "Rumah Betang Dayak", "Seni Ukir Kayu Ulin"],
    culinary: ["Juhu Singkah (Pondoh Rotan)", "Wadi (Ikan Fermentasi)", "Karupuak Basah"],
    color: "#d97706"
  },
  {
    id: "kalsel",
    name: "Kalimantan Selatan",
    capital: "Banjarmasin",
    island: "Kalimantan",
    coords: { x: 48, y: 49 },
    description: "Bumi Lambung Mangkurat yang dialiri seribu sungai, terkenal dengan pasar terapung tradisional Lok Baintan dan batu permata Martapura.",
    facts: [
      "Banjarmasin dijuluki 'Kota Seribu Sungai' dengan aktivitas ekonomi yang unik di atas air sejak ratusan tahun lalu.",
      "Kota Martapura merupakan penghasil batu mulia dan intan terbesar dan tercantik di Indonesia."
    ],
    tourism: ["Pasar Terapung Lok Baintan","Pusat Permata Martapura","Pulau Kembang","Pantai Joras","Loksado","Bukit Matang Kaladan","Danau Seran"],
    culture: ["Tari Baksa Kembang", "Rumah Banjar Bubungan Tinggi", "Musik Panting"],
    culinary: ["Soto Banjar", "Ketupat Kandangan", "Bingka Kentang"],
    color: "#c2410c"
  },
  {
    id: "kaltim",
    name: "Kalimantan Timur",
    capital: "Samarinda",
    island: "Kalimantan",
    coords: { x: 50, y: 39 },
    description: "Provinsi kaya energi fosil, kepulauan wisata bahari Derawan, kediaman ibu kota baru Nusantara (IKN), dan budaya Dayak Kenyah.",
    facts: [
      "IKN (Ibu Kota Nusantara) secara resmi dibangun di wilayah Penajam Paser Utara untuk menggantikan Jakarta.",
      "Kepulauan Derawan adalah salah satu tempat menyelam terbaik di dunia dengan habitat ubur-ubur tanpa sengat di Kakaban."
    ],
    tourism: ["IKN (Ibu Kota Nusantara)","Kepulauan Derawan","Desa Budaya Pampang","Danau Labuan Cermin","Bukit Bangkirai","Pulau Kakaban","Taman Nasional Kutai"],
    culture: ["Tari Gong", "Pakaian Adat Sapei Sapaq", "Sumpit & Mandau"],
    culinary: ["Nasi Kuning Samarinda", "Gence Ruan", "Mantau Sapi"],
    color: "#ca8a04"
  },
  {
    id: "kalara",
    name: "Kalimantan Utara",
    capital: "Tanjung Selor",
    island: "Kalimantan",
    coords: { x: 49, y: 28 },
    description: "Provinsi termuda di Kalimantan, berbatasan langsung dengan Malaysia, menyimpan keanekaragaman hayati Taman Nasional Kayan Mentarang.",
    facts: [
      "Merupakan salah satu kawasan konservasi rimba terluas di dunia dengan adat Dayak Lundayeh yang terjaga.",
      "Pulau Tarakan terkenal sebagai situs pertempuran sengit PD II perebutan kilang minyak bumi."
    ],
    tourism: ["Taman Nasional Kayan Mentarang", "Kawasan Konservasi Mangrove Tarakan", "Air Terjun Gunung Meja"],
    culture: ["Tari kancet ledo", "Alat Musik Sampe", "Kain Batik Kaltara"],
    culinary: ["Kepiting Soka Tarakan", "Tudai (Kerang Darah)", "Nasi Subut"],
    color: "#b45309"
  },

  // --- SULAWESI ---
  {
    id: "sulut",
    name: "Sulawesi Utara",
    capital: "Manado",
    island: "Sulawesi",
    coords: { x: 59, y: 30 },
    description: "Tanah Minahasa yang toleran, keajaiban surga bawah laut dunia Bunaken, budaya ekstrem kuliner pasar Tomohon, dan pesona alam Danau Linow.",
    facts: [
      "Taman Nasional Bunaken memiliki keanekaragaman hayati laut terkaya, menampung 390 spesies terumbu karang.",
      "Kota Tomohon terkenal dengan festival bunga internasional tahunan yang megah."
    ],
    tourism: ["Taman Nasional Bunaken","Danau Linow","Bukit Kasih","Pulau Siladen","Taman Nasional Bogani Nani Wartabone","Pulau Lembeh","Gunung Mahawu"],
    culture: ["Tari Kabasaran (Perang)", "Musik Kolintang", "Rumah Pewaris Minahasa"],
    culinary: ["Bubur Tinutuan (Manado)", "Ayam Woku", "Klappertaart", "Sambal Roa"],
    color: "#7c3aed"
  },
  {
    id: "sulbar",
    name: "Sulawesi Barat",
    capital: "Mamuju",
    island: "Sulawesi",
    coords: { x: 54, y: 44 },
    description: "Negeri bahari peninggalan pelaut tangguh suku Mandar yang menciptakan perahu cadik Sandeq tercepat di dunia.",
    facts: [
      "Perahu Sandeq adalah perahu layar bercadik tradisional Mandar yang dinilai tercepat di kelas perahu tradisional dunia.",
      "Kabupaten Polewali Mandar terkenal dengan tradisi menenun Sutera Mandar (Sa'be Mandar)."
    ],
    tourism: ["Pulau Karampuang","Air Terjun Tamasapi","Pantai Lombang-Lombang","Pantai Manakarra","Gong Nekara","Tari Sayyang Pattu'du"],
    culture: ["Perahu Layar Sandeq", "Tari Sayyang Pattu'du", "Tenun Sa'be Mandar"],
    culinary: ["Bau Peapi (Sup Ikan Mandar)", "Golli-Golli", "Kue Jepa"],
    color: "#6d28d9"
  },
  {
    id: "sulteng",
    name: "Sulawesi Tengah",
    capital: "Palu",
    island: "Sulawesi",
    coords: { x: 56, y: 38 },
    description: "Provinsi kaya peninggalan megalitikum misterius di Lembah Bada, kepulauan Togian yang menenangkan, dan teluk Palu yang indah.",
    facts: [
      "Lembah Bada menyimpan puluhan patung batu megalitik misterius yang mirip dengan patung di Easter Island.",
      "Kepulauan Togian adalah surga penyelaman yang sangat tenang dihuni suku Bajau (Pelaut Gipsi Laut)."
    ],
    tourism: ["Kepulauan Togian","Lembah Bada","Pusentasi (Pusat Laut)","Taman Nasional Lore Lindu","Pantai Tanjung Karang","Danau Poso","Tugu Perdamaian Nosarara Nosabatutu"],
    culture: ["Tari Dero", "Pakaian Serat Kulit Kayu Halili", "Gasing Kayu Palu"],
    culinary: ["Kaledo (Sup Kaki Sapi)", "Uta Dada", "Nasi Jagung Palu"],
    color: "#4f46e5"
  },
  {
    id: "sultra",
    name: "Sulawesi Tenggara",
    capital: "Kendari",
    island: "Sulawesi",
    coords: { x: 60, y: 49 },
    description: "Pesona kepulauan bawah laut Wakatobi kelas dunia, eksotisme Pulau Labengki (Mini Raja Ampat), dan sejarah Kerajaan Buton.",
    facts: [
      "Wakatobi diakui oleh Jacques Cousteau sebagai salah satu lokasi selam terindah di dunia.",
      "Benteng Keraton Buton adalah benteng terluas di dunia menurut Guinness Book of Records."
    ],
    tourism: ["Taman Nasional Wakatobi","Pulau Labengki","Benteng Keraton Buton","Pantai Nirwana","Air Terjun Moramo","Danau Biru","Pulau Bokori"],
    culture: ["Tari Lulo", "Kain Tenun Buton", "Seni Ukir Perak Kendari"],
    culinary: ["Sinonggi (Sagu)", "Kabuto", "Lapa-Lapa"],
    color: "#4338ca"
  },
  {
    id: "sulsel",
    name: "Sulawesi Selatan",
    capital: "Makassar",
    island: "Sulawesi",
    coords: { x: 54, y: 50 },
    description: "Jantung maritim dan niaga timur Indonesia, adat sakral suku Toraja pemakaman tebing, perahu legendaris Phinisi Bugis, dan kuliner Coto.",
    facts: [
      "Perahu Phinisi buatan suku Bugis-Makassar telah menjelajahi samudra dunia sejak abad ke-14 tanpa paku logam.",
      "Tana Toraja terkenal dengan upacara kematian Rambu Solo' yang megah dan pemakaman gua tebing Londa."
    ],
    tourism: ["Tana Toraja (Rambu Solo')","Pantai Losari","Tebing Apparalang","Karst Rammang-Rammang","Taman Nasional Bantimurung","Pulau Samalona","Pantai Bira"],
    culture: ["Upacara Rambu Solo'", "Perahu Layar Phinisi Bugis", "Tari Pakarena", "Rumah Tongkonan"],
    culinary: ["Coto Makassar", "Konro Bakar", "Pisang Epe", "Es Pisang Ijo"],
    color: "#5b21b6"
  },
  {
    id: "gorontalo",
    name: "Gorontalo",
    capital: "Gorontalo",
    island: "Sulawesi",
    coords: { x: 58, y: 34 },
    description: "Serambi Madinah Sulawesi dengan adat kental suku Gorontalo, wisata berenang bersama Hiu Paus (Whale Shark), dan kerajinan sulaman Karawo.",
    facts: [
      "Gorontalo memiliki pelestarian adat falsafah 'Adat bersendikan Syara, Syara bersendikan Kitabullah'.",
      "Pantai Botubarani terkenal karena gerombolan Hiu Paus jinak sering muncul hanya beberapa meter dari bibir pantai."
    ],
    tourism: ["Hiu Paus Botubarani","Benteng Otanaha","Pulo Cinta","Taman Laut Olele","Danau Limboto","Pulau Saronde"],
    culture: ["Sulaman Tradisional Karawo", "Tari Saronde", "Rumah Dulohupa"],
    culinary: ["Binthe Biluhuta (Sup Jagung)", "Ikan Bakar Rica Gorontalo", "Kue Pia Gorontalo"],
    color: "#6366f1"
  },

  // --- KEPULAUAN MALUKU ---
  {
    id: "maluku",
    name: "Maluku",
    capital: "Ambon",
    island: "Maluku",
    coords: { x: 69, y: 44 },
    description: "Kepulauan Rempah (Spice Islands) legendaris pemicu penjelajahan samudra dunia, keindahan pantai Ora, serta alunan syahdu musik Ambon Manise.",
    facts: [
      "Kepulauan Banda di Maluku dahulunya adalah satu-satunya penghasil pala di dunia, memicu barter Pulau Run dengan Manhattan antara Inggris dan Belanda.",
      "Ambon dinobatkan sebagai 'City of Music' oleh UNESCO karena musikalitas penduduknya yang luar biasa tinggi."
    ],
    tourism: ["Pantai Ora","Kepulauan Banda Neira","Benteng Belgica","Pantai Natsepa","Pulau Bair","Danau Rana","Pantai Ngurbloat"],
    culture: ["Tari Lenso", "Alat Musik Tifa", "Kain Tenun ikat Tanimbar", "Baju Cele"],
    culinary: ["Papeda Ikan Kuah Kuning", "Nasi Lapola", "Sagu Tumbu"],
    color: "#0891b2"
  },
  {
    id: "malut",
    name: "Maluku Utara",
    capital: "Sofifi",
    island: "Maluku",
    coords: { x: 67, y: 32 },
    description: "Pusat Kesultanan Ternate dan Tidore pelindung cengkeh dunia, dihiasi gunung berapi vulkanis indah yang melingkari selat laut.",
    facts: [
      "Ternate dan Tidore adalah kerajaan Islam terkaya di timur berkat monopoli rempah-rempah cengkeh di era kolonial.",
      "Keindahan kawah Gunung Gamalama diabadikan dalam uang kertas pecahan seribu rupiah lama."
    ],
    tourism: ["Benteng Tolukko","Pulau Maitara & Tidore","Pantai Sulamadaha","Danau Tolire","Gunung Gamalama","Pulau Morotai","Keraton Kesultanan Ternate"],
    culture: ["Tari Soya-Soya", "Upacara Adat Kololi Kie", "Baju Koja"],
    culinary: ["Popeda", "Ikan Fufu", "Air Guraka (Jahe Kenari)"],
    color: "#0284c7"
  },

  // --- TANAH PAPUA ---
  {
    id: "papua",
    name: "Papua",
    capital: "Jayapura",
    island: "Papua",
    coords: { x: 86, y: 52 },
    description: "Gerbang fajar timur Indonesia, rumah bagi burung surga Cendrawasih, keindahan Danau Sentani yang sakral, dan adat suku Dani Jayawijaya.",
    facts: [
      "Burung Cendrawasih (Bird of Paradise) merupakan burung endemik suci lambang kemegahan Papua.",
      "Puncak Jaya di Pegunungan Jayawijaya adalah satu-satunya puncak berselimut salju abadi di garis khatulistiwa Indonesia."
    ],
    tourism: ["Danau Sentani","Lembah Baliem","Taman Nasional Lorentz","Pantai Base G","Bukit Teletubbies Sentani","Desa Wisata Tablanusu"],
    culture: ["Alat Musik Tifa", "Noken (Tas Serat Kayu UNESCO)", "Koteka & Sali", "Tari Perang Papua"],
    culinary: ["Papeda Sagu", "Ikan Kuah Kuning", "Kue Sagu Lempeng"],
    color: "#7c3aed"
  },
  {
    id: "papuabar",
    name: "Papua Barat",
    capital: "Manokwari",
    island: "Papua",
    coords: { x: 74, y: 44 },
    description: "Tanah adat burung Kasuari yang tenang, melingkari surga menyelam kepulauan Raja Ampat terkaya di dunia.",
    facts: [
      "Raja Ampat menampung 75% dari seluruh spesies karang dunia yang dikenal manusia.",
      "Manokwari dikenal sebagai 'Kota Injil' tempat dimulainya peradaban modern di Papua."
    ],
    tourism: ["Kepulauan Raja Ampat", "Teluk Triton", "Pegunungan Arfak"],
    culture: ["Kain Timur Tradisional", "Tari Tumbuh Tanah", "Ukiran Kayu Suku Asmat"],
    culinary: ["Sate Ulat Sagu", "Ikan Bakar Manokwari", "Sagu Lempeng"],
    color: "#8b5cf6"
  },
  {
    id: "papuapus",
    name: "Papua Tengah",
    capital: "Nabire",
    island: "Papua",
    coords: { x: 80, y: 50 },
    description: "Provinsi yang menaungi puncak bersalju khatulistiwa Puncak Jaya, eksplorasi pertambangan Grasberg, dan keindahan pesisir hiu paus Nabire.",
    facts: [
      "Grasberg adalah salah satu tambang emas dan tembaga terbesar di dunia.",
      "Taman Nasional Lorentz membentang dari puncak gunung bersalju hingga pesisir pantai tropis, situs warisan dunia UNESCO terbesar di Asia Tenggara."
    ],
    tourism: ["Taman Nasional Lorentz", "Pesisir Hiu Paus Nabire", "Lembah Kamuu"],
    culture: ["Rumah Karapao Suku Kamoro", "Seni Anyaman Noken Suku Mee"],
    culinary: ["Keladi Tumbuk", "Ikan Kuah Sagu"],
    color: "#6d28d9"
  },
  {
    id: "papuasel",
    name: "Papua Selatan",
    capital: "Merauke",
    island: "Papua",
    coords: { x: 87, y: 64 },
    description: "Titik paling timur Indonesia berbatasan dengan Papua Nugini, padang sabana luas Merauke, sarang semut raksasa Musamus, dan budaya suku Asmat.",
    facts: [
      "Merauke dijuluki 'Kota Rusa' karena populasi rusa liar di sabananya yang melimpah.",
      "Rumah Semut Musamus adalah maha karya alam tanah Merauke berupa sarang rayap kokoh setinggi hingga 4 meter."
    ],
    tourism: ["Monumen Kapsul Waktu Merauke", "Taman Nasional Wasur", "Rumah Rayap Raksasa Musamus"],
    culture: ["Pesta Adat Suku Asmat", "Seni Ukir Kayu Asmat mendunia", "Tari Tifa"],
    culinary: ["Sate Rusa Merauke", "Sagu Sep (Sagu Panggang Batu)"],
    color: "#a21caf"
  },
  {
    id: "papuapeg",
    name: "Papua Pegunungan",
    capital: "Wamena",
    island: "Papua",
    coords: { x: 84, y: 56 },
    description: "Satu-satunya provinsi yang terkunci daratan (landlocked) di Indonesia, menaungi lembah dingin Baliem dengan festival budaya perang mumi adat kuno.",
    facts: [
      "Merupakan provinsi landlocked pertama di Indonesia yang tidak memiliki batas laut.",
      "Menyimpan jasad mumi kepala suku adat yang diawetkan secara tradisional menggunakan asap kayu selama ratusan tahun."
    ],
    tourism: ["Lembah Baliem Wamena", "Situs Mumi Jiwika", "Pasar Tradisional Wamena"],
    culture: ["Festival Budaya Lembah Baliem", "Rumah Honai", "Upacara Bakar Batu"],
    culinary: ["Ipere (Ubi Jalar bakar)", "Sagu Bakar Kelapa"],
    color: "#d946ef"
  },
  {
    id: "papuabaray",
    name: "Papua Barat Daya",
    capital: "Sorong",
    island: "Papua",
    coords: { x: 73, y: 40 },
    description: "Provinsi termuda Indonesia, berfungsi sebagai hub pelabuhan utama, pintu gerbang udara menuju keindahan magis pulau Raja Ampat.",
    facts: [
      "Sorong merupakan salah satu kota industri minyak bumi tertua di tanah Papua, beroperasi sejak zaman Hindia Belanda.",
      "Raja Ampat utara (seperti Pulau Wayag) yang terkenal dengan gugusan pulau karang ikonik dapat diakses paling dekat dari Sorong."
    ],
    tourism: ["Pulau Wayag Raja Ampat", "Pantai Saoka Sorong", "Taman Wisata Alam Sorong"],
    culture: ["Tari Aluyen", "Kain Adat Sorong Timur", "Alat Musik Guoto"],
    culinary: ["Ikan bakar rica-rica Sorong", "Keripik Keladi"],
    color: "#c084fc"
  }
];
