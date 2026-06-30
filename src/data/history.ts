export interface TimelineEvent {
  year: string;
  title: {
    en: string;
    id: string;
  };
  description: {
    en: string;
    id: string;
  };
  tag?: {
    en: string;
    id: string;
  };
}

export const PROVINCE_HISTORIES: Record<string, TimelineEvent[]> = {
  jakarta: [
    {
      year: "397",
      title: { en: "Sunda Pura Era", id: "Era Sunda Pura" },
      description: {
        en: "Established as Sunda Pura, the capital of the ancient Tarumanegara Kingdom, serving as an important trading port.",
        id: "Didirikan sebagai Sunda Pura, ibu kota Kerajaan Tarumanegara kuno, yang berfungsi sebagai pelabuhan perdagangan penting."
      },
      tag: { en: "Ancient", id: "Kuno" }
    },
    {
      year: "1527",
      title: { en: "Jayakarta Foundation", id: "Berdirinya Jayakarta" },
      description: {
        en: "Fatahillah of the Demak Sultanate defeats the Portuguese and renames the port city 'Jayakarta', meaning 'Victorious Deed'.",
        id: "Fatahillah dari Kesultanan Demak mengalahkan Portugis dan mengganti nama kota pelabuhan ini menjadi 'Jayakarta', yang berarti 'Kota Kemenangan'."
      },
      tag: { en: "Sultanate", id: "Kesultanan" }
    },
    {
      year: "1619",
      title: { en: "Batavia under Dutch VOC", id: "Batavia di bawah VOC" },
      description: {
        en: "The Dutch VOC forces led by Jan Pieterszoon Coen conquer Jayakarta, rebuilding it as 'Batavia', the capital of the Dutch East Indies.",
        id: "Pasukan VOC Belanda yang dipimpin oleh Jan Pieterszoon Coen menaklukkan Jayakarta, membangunnya kembali sebagai 'Batavia', ibu kota Hindia Belanda."
      },
      tag: { en: "Colonial", id: "Kolonial" }
    },
    {
      year: "1945",
      title: { en: "Proclamation of Independence", id: "Proklamasi Kemerdekaan" },
      description: {
        en: "The Proclamation of Indonesian Independence is declared in Jakarta on August 17, designating Jakarta as the national capital.",
        id: "Proklamasi Kemerdekaan Indonesia dideklarasikan di Jakarta pada tanggal 17 Agustus, menetapkan Jakarta sebagai ibu kota negara."
      },
      tag: { en: "Independence", id: "Kemerdekaan" }
    },
    {
      year: "2024+",
      title: { en: "Transition to DKJ", id: "Transisi Menjadi DKJ" },
      description: {
        en: "Jakarta begins transitioning from the National Capital (DKI) to a global economic and financial center (DKJ) as Nusantara (IKN) takes over political capital duties.",
        id: "Jakarta mulai bertransisi dari Ibu Kota Negara (DKI) menjadi pusat ekonomi dan keuangan global (DKJ) seiring Nusantara (IKN) mengambil alih tugas ibu kota politik."
      },
      tag: { en: "Future", id: "Masa Depan" }
    }
  ],
  yogyakarta: [
    {
      year: "1755",
      title: { en: "Giyanti Treaty", id: "Perjanjian Giyanti" },
      description: {
        en: "The Giyanti Treaty splits the Mataram Sultanate, establishing the Yogyakarta Sultanate under Sri Sultan Hamengkubuwono I.",
        id: "Perjanjian Giyanti membagi Kesultanan Mataram, mendirikan Kesultanan Yogyakarta di bawah Sri Sultan Hamengkubuwono I."
      },
      tag: { en: "Foundation", id: "Pendirian" }
    },
    {
      year: "1812",
      title: { en: "Geger Sepehi", id: "Geger Sepehi" },
      description: {
        en: "British forces assault the Yogyakarta Kraton, resulting in the establishment of the Pakualaman principality.",
        id: "Pasukan Inggris menyerbu Kraton Yogyakarta, menghasilkan pembentukan Kadipaten Pakualaman."
      },
      tag: { en: "Conflict", id: "Konflik" }
    },
    {
      year: "1946",
      title: { en: "Revolutionary Capital", id: "Ibu Kota Revolusi" },
      description: {
        en: "Yogyakarta temporarily serves as the capital of the Republic of Indonesia during the War of Independence when Jakarta is occupied.",
        id: "Yogyakarta sementara berfungsi sebagai ibu kota Republik Indonesia selama Perang Kemerdekaan ketika Jakarta diduduki."
      },
      tag: { en: "Republic", id: "Republik" }
    },
    {
      year: "1950",
      title: { en: "Special Region Status", id: "Status Daerah Istimewa" },
      description: {
        en: "In recognition of Yogyakarta's vital support for the Republic, it is legally designated as a Special Region (Daerah Istimewa).",
        id: "Sebagai pengakuan atas dukungan vital Yogyakarta terhadap Republik, ia secara hukum ditetapkan sebagai Daerah Istimewa."
      },
      tag: { en: "Special Status", id: "Status Khusus" }
    },
    {
      year: "2012",
      title: { en: "Yogyakarta Privileges Act", id: "UU Keistimewaan DIY" },
      description: {
        en: "The Law on Yogyakarta's Privileges is enacted, reaffirming the Sultan's non-elective role as hereditary Governor.",
        id: "Undang-Undang Keistimewaan DIY disahkan, menegaskan kembali peran Sultan yang menjabat langsung sebagai Gubernur tanpa pemilihan umum."
      },
      tag: { en: "Modern", id: "Modern" }
    }
  ],
  bali: [
    {
      year: "914",
      title: { en: "Belanjong Pillar", id: "Prasasti Belanjong" },
      description: {
        en: "The earliest written record in Bali, establishing the Warmadewa Dynasty and cultural connections with Indian kingdoms.",
        id: "Catatan tertulis tertua di Bali, menetapkan Dinasti Warmadewa dan hubungan budaya dengan kerajaan-kerajaan India."
      },
      tag: { en: "Ancient", id: "Kuno" }
    },
    {
      year: "1343",
      title: { en: "Majapahit Integration", id: "Integrasi Majapahit" },
      description: {
        en: "Gajah Mada conquers Bali, integrating it into the Majapahit Empire and introducing Javanese Hindu-Buddhist court traditions.",
        id: "Gajah Mada menaklukkan Bali, mengintegrasikannya ke dalam Kekaisaran Majapahit dan memperkenalkan tradisi keraton Hindu-Buddha Jawa."
      },
      tag: { en: "Empire", id: "Kekaisaran" }
    },
    {
      year: "1906",
      title: { en: "Badung Puputan", id: "Puputan Badung" },
      description: {
        en: "Faced with Dutch colonization, Balinese royalty choose heroic ritual suicide (Puputan) over submission to colonial forces.",
        id: "Menghadapi penjajahan Belanda, keluarga kerajaan Bali memilih bunuh diri ritual heroik (Puputan) daripada tunduk pada pasukan kolonial."
      },
      tag: { en: "Resistance", id: "Perlawanan" }
    },
    {
      year: "1958",
      title: { en: "Official Province", id: "Provinsi Resmi" },
      description: {
        en: "Bali officially separates from West Nusa Tenggara to become an independent province within the Republic of Indonesia.",
        id: "Bali secara resmi berpisah dari Nusa Tenggara Barat untuk menjadi provinsi mandiri di dalam Negara Kesatuan Republik Indonesia."
      },
      tag: { en: "Province", id: "Provinsi" }
    },
    {
      year: "2022",
      title: { en: "G20 Leader Summit", id: "KTT G20 Bali" },
      description: {
        en: "Bali successfully hosts the 17th G20 Heads of State Summit, cementing its status as Indonesia's prime international hub.",
        id: "Bali sukses menyelenggarakan KTT Kepala Negara G20 ke-17, memperkokoh statusnya sebagai hub internasional utama di Indonesia."
      },
      tag: { en: "Global Hub", id: "Hub Global" }
    }
  ],
  kaltim: [
    {
      year: "400",
      title: { en: "Kutai Martadipura", id: "Kutai Martadipura" },
      description: {
        en: "The oldest Hindu kingdom in Indonesia is established in East Kalimantan, evidenced by the famous Yupa stone inscriptions.",
        id: "Kerajaan Hindu tertua di Indonesia berdiri di Kalimantan Timur, dibuktikan dengan prasasti batu Yupa yang terkenal."
      },
      tag: { en: "Ancient", id: "Kuno" }
    },
    {
      year: "1600s",
      title: { en: "Sultanate Expansion", id: "Ekspansi Kesultanan" },
      description: {
        en: "Kutai Kartanegara transitions into an Islamic Sultanate, growing into a major economic power along the Mahakam River.",
        id: "Kutai Kartanegara bertransisi menjadi Kesultanan Islam, berkembang menjadi kekuatan ekonomi utama di sepanjang Sungai Mahakam."
      },
      tag: { en: "Sultanate", id: "Kesultanan" }
    },
    {
      year: "1898",
      title: { en: "Balikpapan Oil Boom", id: "Sumur Minyak Balikpapan" },
      description: {
        en: "First drilling at Mathilda oil well begins, sparking a massive industrial and petroleum boom in East Kalimantan.",
        id: "Pengeboran pertama di sumur minyak Mathilda dimulai, memicu ledakan industri dan minyak bumi yang masif di Kalimantan Timur."
      },
      tag: { en: "Industrial", id: "Industri" }
    },
    {
      year: "1957",
      title: { en: "East Kalimantan Province", id: "Provinsi Kaltim" },
      description: {
        en: "East Kalimantan is legally recognized as a standalone province, separating from the wider Kalimantan province.",
        id: "Kalimantan Timur secara hukum diakui sebagai provinsi mandiri, terpisah dari provinsi Kalimantan yang lebih luas."
      },
      tag: { en: "Governance", id: "Pemerintahan" }
    },
    {
      year: "2022+",
      title: { en: "IKN Nusantara Launch", id: "Peluncuran IKN Nusantara" },
      description: {
        en: "Construction begins on Nusantara (IKN) in East Kalimantan, setting the stage for it to become Indonesia's new capital.",
        id: "Pembangunan Nusantara (IKN) dimulai di Kalimantan Timur, mempersiapkan wilayah ini menjadi ibu kota baru Indonesia."
      },
      tag: { en: "Mega Project", id: "Proyek Besar" }
    }
  ],
  aceh: [
    {
      year: "1267",
      title: { en: "Samudera Pasai", id: "Samudera Pasai" },
      description: {
        en: "Establishment of Samudera Pasai, the first major Islamic sultanate in the archipelago, functioning as a global trading port.",
        id: "Berdirinya Samudera Pasai, kesultanan Islam besar pertama di nusantara, yang berfungsi sebagai pelabuhan perdagangan global."
      },
      tag: { en: "Sultanate", id: "Kesultanan" }
    },
    {
      year: "1873",
      title: { en: "The Aceh War", id: "Perang Aceh" },
      description: {
        en: "The Dutch declare war on the Sultanate of Aceh, triggering a decades-long fierce resistance led by national heroes.",
        id: "Belanda mengumumkan perang terhadap Kesultanan Aceh, memicu perlawanan sengit selama puluhan tahun yang dipimpin oleh pahlawan nasional."
      },
      tag: { en: "War", id: "Perang" }
    },
    {
      year: "2004",
      title: { en: "Indian Ocean Tsunami", id: "Tsunami Samudra Hindia" },
      description: {
        en: "A catastrophic 9.1 magnitude earthquake and subsequent tsunami devastate Aceh, causing massive global humanitarian responses.",
        id: "Gempa bumi dahsyat bermagnitudo 9,1 dan tsunami yang mengikutinya meluluhlantakkan Aceh, memicu respons kemanusiaan global yang masif."
      },
      tag: { en: "Disaster", id: "Bencana" }
    },
    {
      year: "2005",
      title: { en: "Helsinki Peace Accord", id: "Perjanjian Damai Helsinki" },
      description: {
        en: "The Free Aceh Movement (GAM) and the Indonesian government sign a historic peace treaty, granting special autonomy to Aceh.",
        id: "Gerakan Aceh Merdeka (GAM) dan pemerintah Indonesia menandatangani perjanjian damai bersejarah, memberikan otonomi khusus bagi Aceh."
      },
      tag: { en: "Peace", id: "Perdamaian" }
    }
  ],
  sumbar: [
    {
      year: "1347",
      title: { en: "Adityawarman Reign", id: "Pemerintahan Adityawarman" },
      description: {
        en: "Adityawarman establishes the Malayapura kingdom, fusing Buddhist culture with local Minangkabau ancestral traditions.",
        id: "Adityawarman mendirikan kerajaan Malayapura, memadukan budaya Buddha dengan tradisi leluhur Minangkabau setempat."
      },
      tag: { en: "Kingdom", id: "Kerajaan" }
    },
    {
      year: "1803",
      title: { en: "Padri War", id: "Perang Padri" },
      description: {
        en: "Conflict erupts between Islamic Padri and traditional Adat leaders, eventually leading to a joint resistance against the Dutch.",
        id: "Konflik meletus antara kaum Padri (Islam) dan kaum Adat (tradisional), yang akhirnya mengarah pada perlawanan bersama melawan Belanda."
      },
      tag: { en: "War", id: "Perang" }
    },
    {
      year: "1958",
      title: { en: "West Sumatra Province", id: "Provinsi Sumatra Barat" },
      description: {
        en: "West Sumatra is officially inaugurated as a standalone province, celebrating its unique Minangkabau matrilineal heritage.",
        id: "Sumatra Barat secara resmi diresmikan sebagai provinsi mandiri, merayakan warisan matrilineal Minangkabau yang unik."
      },
      tag: { en: "Province", id: "Provinsi" }
    }
  ],
  papua: [
    {
      year: "1660",
      title: { en: "Tidore Sultanate Sphere", id: "Pengaruh Kesultanan Tidore" },
      description: {
        en: "The Sultanate of Tidore claims suzerainty over parts of western Papua, establishing initial trade ties and ocean routes.",
        id: "Kesultanan Tidore mengklaim kekuasaan atas bagian barat Papua, membangun hubungan perdagangan awal dan rute laut."
      },
      tag: { en: "Sultanate", id: "Kesultanan" }
    },
    {
      year: "1962",
      title: { en: "New York Agreement", id: "Perjanjian New York" },
      description: {
        en: "An agreement between the Netherlands and Indonesia transfers administration of Western New Guinea to the United Nations.",
        id: "Perjanjian antara Belanda dan Indonesia mentransfer administrasi Nugini Barat kepada Perserikatan Bangsa-Bangsa."
      },
      tag: { en: "Diplomacy", id: "Diplomasi" }
    },
    {
      year: "1969",
      title: { en: "Act of Free Choice", id: "Penentuan Pendapat Rakyat (PEPERA)" },
      description: {
        en: "The Act of Free Choice (PEPERA) is completed, resulting in West Papua officially joining the Republic of Indonesia.",
        id: "Penentuan Pendapat Rakyat (PEPERA) selesai diselenggarakan, menghasilkan Papua Barat secara resmi bergabung dengan Republik Indonesia."
      },
      tag: { en: "Integration", id: "Integrasi" }
    },
    {
      year: "2001",
      title: { en: "Special Autonomy Law", id: "UU Otonomi Khusus" },
      description: {
        en: "The government grants Special Autonomy (Otsus) status to Papua, dedicating higher resource revenues to local developments.",
        id: "Pemerintah memberikan status Otonomi Khusus (Otsus) kepada Papua, mendedikasikan pendapatan sumber daya yang lebih tinggi untuk pembangunan lokal."
      },
      tag: { en: "Autonomy", id: "Otonomi" }
    }
  ]
};

// Generates fallback timelines so EVERY province has an interactive stepper experience
export function getProvinceTimeline(provinceId: string, island: string, provinceName: string): TimelineEvent[] {
  // Return specific handcrafted history if available
  if (PROVINCE_HISTORIES[provinceId]) {
    return PROVINCE_HISTORIES[provinceId];
  }

  // Create customized generic timeline based on island groups
  const isSumatra = island === "Sumatra";
  const isJawa = island === "Jawa";
  const isKalimantan = island === "Kalimantan";
  const isSulawesi = island === "Sulawesi";
  const isNusaTenggara = island === "NusaTenggaraBali";
  const isMaluku = island === "Maluku";
  const isPapua = island === "Papua";

  const preColonialKingdom = isSumatra 
    ? { en: "Sriwijaya Influence", id: "Pengaruh Sriwijaya" }
    : isJawa
    ? { en: "Majapahit Era", id: "Era Majapahit" }
    : isKalimantan
    ? { en: "Hindu-Buddhist Kingdoms", id: "Kerajaan Hindu-Buddha" }
    : isSulawesi
    ? { en: "Gowa-Tallo Kingdom", id: "Kerajaan Gowa-Tallo" }
    : isMaluku
    ? { en: "Spice Sultanates", id: "Kesultanan Rempah-Rempah" }
    : { en: "Ancient Tribes Era", id: "Era Suku Kuno" };

  const preColonialDesc = isSumatra
    ? { en: `The region of ${provinceName} developed under the maritime sphere of the Sriwijaya Empire and early coastal trading kingdoms.`, id: `Wilayah ${provinceName} berkembang di bawah pengaruh maritim Kerajaan Sriwijaya dan kerajaan perdagangan pesisir awal.` }
    : isJawa
    ? { en: `Ancient regional rulers in ${provinceName} maintained close ties with the great Javanese empires of Majapahit and Mataram.`, id: `Penguasa regional kuno di ${provinceName} memelihara hubungan erat dengan kekaisaran besar Jawa seperti Majapahit dan Mataram.` }
    : { en: `Tribal chiefdoms and local principalities ruled ${provinceName}, trading gold, resins, and unique regional forest crops.`, id: `Kepala suku dan kadipaten setempat memerintah ${provinceName}, memperdagangkan emas, damar, dan hasil hutan daerah yang unik.` };

  return [
    {
      year: "Era 1300-1500",
      title: preColonialKingdom,
      description: preColonialDesc,
      tag: { en: "Pre-Colonial", id: "Pra-Kolonial" }
    },
    {
      year: "Era 1600-1800",
      title: { en: "Colonial Expansion & Trade", id: "Ekspansi Kolonial & Dagang" },
      description: {
        en: `The Dutch East India Company (VOC) and later colonial administrators established trade outposts near ${provinceName} to monopolize resources.`,
        id: `Kongsi Dagang Hindia Timur Belanda (VOC) dan kemudian administrator kolonial mendirikan pos perdagangan di dekat ${provinceName} untuk memonopoli sumber daya.`
      },
      tag: { en: "Colonial Era", id: "Era Kolonial" }
    },
    {
      year: "1945",
      title: { en: "Proclamation Support", id: "Dukungan Proklamasi" },
      description: {
        en: `Following Indonesia's Independence Proclamation, citizens in ${provinceName} established local committees to support the newly born Republic.`,
        id: `Menyusul Proklamasi Kemerdekaan Indonesia, warga di ${provinceName} mendirikan komite lokal untuk mendukung Republik yang baru lahir.`
      },
      tag: { en: "Independence", id: "Kemerdekaan" }
    },
    {
      year: "1950-1965",
      title: { en: "Administrative Integration", id: "Integrasi Administratif" },
      description: {
        en: `${provinceName} was formally incorporated as a key administrative division in post-independence Indonesia under decentralization laws.`,
        id: `${provinceName} secara resmi digabungkan sebagai divisi administratif utama di Indonesia pasca-kemerdekaan di bawah undang-undang desentralisasi.`
      },
      tag: { en: "Governance", id: "Pemerintahan" }
    },
    {
      year: "Modern Era",
      title: { en: "Cultural Heritage & Development", id: "Warisan Budaya & Pembangunan" },
      description: {
        en: `Today, ${provinceName} thrives as an essential hub of natural resources, diverse ethnic heritage, and regional economic development.`,
        id: `Hari ini, ${provinceName} berkembang sebagai hub penting sumber daya alam, keragaman warisan etnis, dan pembangunan ekonomi daerah.`
      },
      tag: { en: "Modern", id: "Modern" }
    }
  ];
}
