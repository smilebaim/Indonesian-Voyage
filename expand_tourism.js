const fs = require('fs');

const extendedDestinations = {
  "aceh": ["Masjid Raya Baiturrahman", "Pulau Weh (Sabang)", "Taman Nasional Gunung Leuser", "Museum Tsunami Aceh", "Pantai Lampuuk", "Danau Laut Tawar", "Puncak Gurutee"],
  "sumut": ["Danau Toba & Pulau Samosir", "Istana Maimun", "Bukit Lawang", "Air Terjun Sipiso-piso", "Taman Alam Lumbini", "Kawah Putih Tinggi Raja", "Rahmat International Wildlife Museum"],
  "sumbar": ["Jam Gadang", "Lembah Harau", "Danau Maninjau", "Pantai Air Manis", "Istano Basa Pagaruyung", "Kepulauan Mentawai", "Ngarai Sianok"],
  "riau": ["Istana Siak Sri Indrapura", "Candi Muara Takus", "Sungai Kampar (Ombak Bono)", "Pulau Jemur", "Air Terjun Aek Martua", "Taman Nasional Tesso Nilo"],
  "kepri": ["Pulau Penyengat", "Pantai Trikora Bintan", "Jembatan Barelang", "Bawah Reserve", "Gurun Pasir Busung", "Pantai Lagoi", "Pulau Ranoh"],
  "jambi": ["Situs Candi Muaro Jambi", "Gunung Kerinci", "Danau Kaco", "Taman Nasional Bukit Duabelas", "Jembatan Gentala Arasy", "Geopark Merangin"],
  "sumsel": ["Jembatan Ampera", "Pulau Kemaro", "Taman Purbakala Kerajaan Sriwijaya", "Danau Ranau", "Gunung Dempo", "Benteng Kuto Besak"],
  "babel": ["Pantai Tanjung Tinggi", "Pulau Lengkuas", "Museum Kata Andrea Hirata", "Danau Kaolin", "Pantai Parai Tenggiri", "Bangka Botanical Garden"],
  "bengkulu": ["Fort Marlborough", "Rumah Pengasingan Bung Karno", "Pusat Pelatihan Gajah Seblat", "Pantai Panjang", "Danau Dendam Tak Sudah", "Pulau Enggano"],
  "lampung": ["Taman Nasional Way Kambas", "Gunung Anak Krakatau", "Pantai Gigi Hiu", "Teluk Kiluan", "Pulau Pahawang", "Menara Siger", "Taman Nasional Bukit Barisan Selatan"],
  "banten": ["Taman Nasional Ujung Kulon", "Kampung Adat Baduy", "Masjid Agung Banten", "Pantai Anyer", "Pantai Tanjung Lesung", "Pulau Umang", "Gunung Krakatau"],
  "jakarta": ["Monas (Monumen Nasional)", "Kota Tua", "Taman Mini Indonesia Indah (TMII)", "Taman Impian Jaya Ancol", "Kepulauan Seribu", "Museum Nasional", "Galeri Nasional"],
  "jabar": ["Kawah Putih Ciwidey", "Tangkuban Perahu", "Saung Angklung Udjo", "Pangandaran", "Kebun Raya Bogor", "Taman Safari Indonesia", "Gunung Gede Pangrango", "Green Canyon"],
  "jateng": ["Candi Borobudur", "Dataran Tinggi Dieng", "Kepulauan Karimunjawa", "Candi Prambanan (Bagian Klaten)", "Lawang Sewu", "Gunung Merbabu", "Kawasan Wisata Bandungan"],
  "yogya": ["Keraton Yogyakarta", "Candi Prambanan", "Jalan Malioboro", "Pantai Parangtritis", "Candi Ratu Boko", "Goa Jomblang", "Tebing Breksi", "Pantai Indrayanti"],
  "jatim": ["Gunung Bromo", "Kawah Ijen", "Taman Nasional Baluran", "Batu Secret Zoo", "Museum Angkut", "Jatim Park", "Taman Nasional Alas Purwo", "Gili Ketapang"],
  "bali": ["Tanah Lot", "Ubud Sawah Terasering", "Pura Uluwatu", "Nusa Penida", "Pantai Kuta", "Gunung Batur", "Taman Nasional Bali Barat", "Pura Besakih", "Monkey Forest Ubud"],
  "ntb": ["Gili Trawangan, Meno & Air", "Sirkuit Mandalika", "Gunung Rinjani", "Pantai Pink", "Bukit Merese", "Air Terjun Sendang Gile", "Desa Sade"],
  "ntt": ["Pulau Komodo", "Danau Kelimutu", "Pulau Sumba (Bukit Wairinding)", "Desa Wae Rebo", "Pantai Nihiwatu", "Pulau Padar", "Labuan Bajo"],
  "kalbar": ["Tugu Khatulistiwa", "Keraton Kadriyah", "Taman Nasional Sentarum", "Pulau Randayan", "Pantai Pasir Panjang", "Bukit Kelam", "Rumah Betang Radakng"],
  "kalteng": ["Taman Nasional Tanjung Puting", "Sungai Kahayan", "Bukit Tangkiling", "Taman Nasional Sebangau", "Danau Tahai", "Museum Balanga"],
  "kalsel": ["Pasar Terapung Lok Baintan", "Pusat Permata Martapura", "Pulau Kembang", "Pantai Joras", "Loksado", "Bukit Matang Kaladan", "Danau Seran"],
  "kaltim": ["IKN (Ibu Kota Nusantara)", "Kepulauan Derawan", "Desa Budaya Pampang", "Danau Labuan Cermin", "Bukit Bangkirai", "Pulau Kakaban", "Taman Nasional Kutai"],
  "kaltara": ["Taman Nasional Kayan Mentarang", "Kawasan Konservasi Mangrove Tarakan", "Air Terjun Gunung Meja", "Pantai Amal", "Pulau Sebatik"],
  "sulut": ["Taman Nasional Bunaken", "Danau Linow", "Bukit Kasih", "Pulau Siladen", "Taman Nasional Bogani Nani Wartabone", "Pulau Lembeh", "Gunung Mahawu"],
  "sulbar": ["Pulau Karampuang", "Air Terjun Tamasapi", "Pantai Lombang-Lombang", "Pantai Manakarra", "Gong Nekara", "Tari Sayyang Pattu'du"],
  "sulteng": ["Kepulauan Togian", "Lembah Bada", "Pusentasi (Pusat Laut)", "Taman Nasional Lore Lindu", "Pantai Tanjung Karang", "Danau Poso", "Tugu Perdamaian Nosarara Nosabatutu"],
  "sultra": ["Taman Nasional Wakatobi", "Pulau Labengki", "Benteng Keraton Buton", "Pantai Nirwana", "Air Terjun Moramo", "Danau Biru", "Pulau Bokori"],
  "sulsel": ["Tana Toraja (Rambu Solo')", "Pantai Losari", "Tebing Apparalang", "Karst Rammang-Rammang", "Taman Nasional Bantimurung", "Pulau Samalona", "Pantai Bira"],
  "gorontalo": ["Hiu Paus Botubarani", "Benteng Otanaha", "Pulo Cinta", "Taman Laut Olele", "Danau Limboto", "Pulau Saronde"],
  "maluku": ["Pantai Ora", "Kepulauan Banda Neira", "Benteng Belgica", "Pantai Natsepa", "Pulau Bair", "Danau Rana", "Pantai Ngurbloat"],
  "malut": ["Benteng Tolukko", "Pulau Maitara & Tidore", "Pantai Sulamadaha", "Danau Tolire", "Gunung Gamalama", "Pulau Morotai", "Keraton Kesultanan Ternate"],
  "papua": ["Danau Sentani", "Lembah Baliem", "Taman Nasional Lorentz", "Pantai Base G", "Bukit Teletubbies Sentani", "Desa Wisata Tablanusu"],
  "pabar": ["Kepulauan Raja Ampat", "Teluk Triton", "Pegunungan Arfak", "Taman Nasional Teluk Cenderawasih", "Pulau Mansinam", "Danau Framu"],
  "papteng": ["Taman Nasional Lorentz", "Pesisir Hiu Paus Nabire", "Lembah Kamuu", "Danau Paniai", "Pulau Ahe", "Pantai Nusi"],
  "papsel": ["Monumen Kapsul Waktu", "Taman Nasional Wasur", "Rumah Rayap Raksasa Musamus", "Pantai Lampu Satu", "Danau Rawa Biru", "Sota (Perbatasan RI-PNG)"],
  "pappeg": ["Lembah Baliem", "Situs Mumi Jiwika", "Pasar Tradisional Wamena", "Danau Habbema", "Gua Kontilola", "Gunung Trikora"],
  "pabarda": ["Pulau Wayag", "Pantai Saoka", "Taman Wisata Alam Sorong", "Danau Ayamaru", "Kepulauan Misool", "Puncak Karst Piaynemo"]
};

let content = fs.readFileSync('src/data/provinces.ts', 'utf8');

for (const [id, dests] of Object.entries(extendedDestinations)) {
  const regex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?tourism:\\s*)\\[.*?\\]`, 'g');
  const replacement = `$1${JSON.stringify(dests)}`;
  content = content.replace(regex, replacement);
}

fs.writeFileSync('src/data/provinces.ts', content);
console.log('Updated tourism data successfully');
