import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Shared Gemini client setup
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini API Client initialized successfully.");
    } catch (e) {
      console.error("Failed to initialize Gemini Client:", e);
    }
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI feature will use high-quality simulated database offline.");
  }

  // API Route: Get AI details for a province
  app.post("/api/gemini/province-info", async (req, res) => {
    const { province, category, question, lang } = req.body;
    if (!province) {
      return res.status(400).json({ error: "Province name is required" });
    }

    const isEn = lang === "en";
    let prompt = "";
    if (question) {
      if (isEn) {
        prompt = `You are an expert AI tour guide on Indonesian geography and culture. Provide deep information about the Province of ${province}. Answer the following question in a friendly, engaging, and informative style in English: "${question}". Answer using beautiful Markdown format, complete with bullet points if relevant.`;
      } else {
        prompt = `Kamu adalah pemandu wisata AI ahli geografi dan budaya Indonesia. Berikan informasi mendalam tentang Provinsi ${province}. Jawab pertanyaan berikut dengan gaya ramah, menarik, dan informatif berbahasa Indonesia: "${question}". Jawab dengan format Markdown yang indah, lengkap dengan bullet points jika relevan.`;
      }
    } else {
      const selectedCategory = category || "general";
      if (selectedCategory === "culture") {
        if (isEn) {
          prompt = `Provide a deep explanation of cultural arts, customs, local languages, traditional clothing, traditional dances, local songs, and typical traditional houses of ${province} Province, Indonesia. Provide in a neat, engaging, and informative Markdown format in English.`;
        } else {
          prompt = `Berikan penjelasan mendalam tentang seni budaya, adat istiadat, bahasa daerah, pakaian adat, tari tradisional, lagu daerah, dan rumah adat yang khas dari Provinsi ${province}, Indonesia. Berikan dalam format Markdown yang rapi, menarik, dan informatif berbahasa Indonesia.`;
        }
      } else if (selectedCategory === "tourism") {
        if (isEn) {
          prompt = `Provide recommendations for the best travel destinations, natural scenery, historic sites, and unique experiences that are a must-visit in ${province} Province, Indonesia. Provide in a neat, engaging, and informative Markdown format in English.`;
        } else {
          prompt = `Berikan rekomendasi destinasi wisata terbaik, pemandangan alam, tempat bersejarah, dan pengalaman unik yang wajib dikunjungi di Provinsi ${province}, Indonesia. Berikan dalam format Markdown yang rapi, menarik, dan informatif berbahasa Indonesia.`;
        }
      } else if (selectedCategory === "culinary") {
        if (isEn) {
          prompt = `Provide a list of typical culinary options, traditional foods, typical drinks, market snacks, unique food ingredients, and culinary history stories behind the typical food of ${province} Province, Indonesia. Provide in a neat, engaging, and informative Markdown format in English.`;
        } else {
          prompt = `Berikan daftar kuliner khas, makanan tradisional, minuman khas, jajanan pasar, bahan makanan unik, dan cerita sejarah kuliner di balik makanan khas dari Provinsi ${province}, Indonesia. Berikan dalam format Markdown yang rapi, menarik, dan informatif berbahasa Indonesia.`;
        }
      } else {
        if (isEn) {
          prompt = `Provide comprehensive general information about ${province} Province, Indonesia. Including the capital city, geographical location, a brief historical overview, regional icon or mascot, and what makes this province famous and unique in Indonesia. Provide in a neat, engaging, and informative Markdown format in English.`;
        } else {
          prompt = `Berikan informasi umum yang lengkap tentang Provinsi ${province}, Indonesia. Meliputi ibu kota, letak geografis, sekilas sejarah singkat, ikon atau maskot daerah, dan apa yang membuat provinsi ini terkenal dan unik di Indonesia. Berikan dalam format Markdown yang rapi, menarik, dan informatif berbahasa Indonesia.`;
        }
      }
    }

    if (!ai) {
      // High-quality fallback if API key is not set
      const offlineFallback = getOfflineProvinceFallback(province, category || "general", question, lang);
      return res.json({ text: offlineFallback, isOffline: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text || (isEn ? "No response received from AI." : "Tidak ada respon yang diterima dari AI.");
      return res.json({ text, isOffline: false });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const offlineFallback = getOfflineProvinceFallback(province, category || "general", question, lang);
      return res.json({
        text: isEn 
          ? `*(Using offline information due to connection issues)*\n\n${offlineFallback}`
          : `*(Menggunakan informasi offline karena kendala koneksi)*\n\n${offlineFallback}`,
        isOffline: true,
        error: error.message,
      });
    }
  });

  // API Route: Generate itinerary for a province
  app.post("/api/gemini/itinerary", async (req, res) => {
    const { province, duration, preference, lang } = req.body;
    if (!province) {
      return res.status(400).json({ error: "Province name is required" });
    }

    const days = parseInt(duration) || 3;
    const pref = preference || "campuran";
    const isEn = lang === "en";

    let prompt = "";
    if (isEn) {
      prompt = `You are an expert AI travel itinerary planner for Indonesian tourism.
Create an outstanding, detailed, and realistic travel itinerary for holidaying in ${province} Province, Indonesia for ${days} days with a style preference focus of "${pref}".

The itinerary must be well-structured and include the following for each day (Day 1, Day 2, etc.):
1. Morning: Activity/sightseeing spot name, brief description of its beauty/uniqueness, practical tips.
2. Afternoon: Recommended legendary or highly recommended local food for lunch.
3. Evening/Night: Sunset viewpoint, night market, cultural performance, or special dinner setting.

Also include at the very end:
- **Transportation Tips**: Best mode of transport to explore this route.
- **Overall Budget Estimation** (Backpacker, Mid-range, Premium).
- **Recommended Souvenirs** that are iconic to buy from ${province} Province.

Deliver the answer in beautiful Markdown format, using relevant icons/emojis, structured clearly in professional, engaging, and inspiring English.`;
    } else {
      prompt = `Kamu adalah perencana perjalanan (itinerary planner) AI ahli untuk pariwisata Indonesia.
Buatlah rencana perjalanan (itinerary) yang luar biasa, detail, dan realistis untuk berlibur di Provinsi ${province}, Indonesia selama ${days} hari dengan fokus gaya wisata "${pref}".

Rencana perjalanan harus terstruktur dengan baik dan mencakup hal-hal berikut untuk setiap hari (Hari 1, Hari 2, dst.):
1. Pagi: Nama tempat/aktivitas, deskripsi singkat keindahan/keunikan, tips praktis.
2. Siang: Rekomendasi kuliner khas makan siang di daerah setempat yang legendaris atau patut dicoba.
3. Sore/Malam: Tempat melihat sunset, pasar malam, pertunjukan budaya, atau makan malam bersuasana istimewa.

Sertakan juga di bagian akhir:
- **Tips Transportasi**: Rekomendasi moda transportasi terbaik untuk rute ini.
- **Estimasi Anggaran keseluruhan** (Backpacker, Menengah, Premium).
- **Rekomendasi Oleh-Oleh khas** yang wajib dibeli dari Provinsi ${province}.

Berikan jawaban dalam format Markdown yang indah, menarik, menggunakan ikon/emoji yang relevan, serta terstruktur dengan rapi berbahasa Indonesia yang ramah dan menginspirasi.`;
    }

    if (!ai) {
      const offlineItinerary = getOfflineItineraryFallback(province, days, pref, lang);
      return res.json({ text: offlineItinerary, isOffline: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text || (isEn ? "No itinerary could be generated." : "Tidak ada rencana perjalanan yang berhasil dibuat.");
      return res.json({ text, isOffline: false });
    } catch (error: any) {
      console.error("Gemini Itinerary API Error:", error);
      const offlineItinerary = getOfflineItineraryFallback(province, days, pref, lang);
      return res.json({
        text: isEn 
          ? `*(Using offline itinerary due to connection issues)*\n\n${offlineItinerary}`
          : `*(Menggunakan rencana perjalanan offline karena kendala koneksi)*\n\n${offlineItinerary}`,
        isOffline: true,
        error: error.message,
      });
    }
  });

  // API Route: Generate dynamic packing and preparation checklist
  app.post("/api/gemini/checklist", async (req, res) => {
    const { province, activities, customActivity, lang } = req.body;
    if (!province) {
      return res.status(400).json({ error: "Province name is required" });
    }

    const isEn = lang === "en";
    const acts = Array.isArray(activities) ? activities : [];
    const custom = typeof customActivity === "string" ? customActivity.trim() : "";

    // Build activities text for prompt
    let activitiesText = acts.map(a => {
      if (a === "nature") return isEn ? "Nature/Outdoor Exploration" : "Eksplorasi Alam/Luar Ruangan";
      if (a === "culture") return isEn ? "Cultural Heritage Tour" : "Tur Warisan Budaya";
      if (a === "beach") return isEn ? "Beach, Snorkeling & Diving" : "Pantai, Snorkeling & Selam";
      if (a === "hiking") return isEn ? "Hiking & Camping" : "Mendaki & Berkemah";
      if (a === "culinary") return isEn ? "Culinary Trip" : "Wisata Kuliner";
      return a;
    }).join(", ");

    if (custom) {
      activitiesText += (activitiesText ? ", " : "") + custom;
    }

    if (!activitiesText) {
      activitiesText = isEn ? "General Leisure Travel" : "Wisata Santai Umum";
    }

    let prompt = "";
    if (isEn) {
      prompt = `You are an expert AI travel advisor specialized in Indonesian adventures.
Generate a comprehensive, tailored packing and preparation checklist for a trip to ${province} Province, Indonesia.
Take into account:
1. The typical climate, weather patterns, and geography of ${province}.
2. Local culture, religious customs, traditional norms, and respect/etiquette guidelines in this specific region.
3. The planned activities: "${activitiesText}".

Please structure your response in beautiful Markdown format with relevant emojis:

### 🌡️ Weather & Climate Context
Provide a brief, professional summary of ${province}'s climate and why these items are recommended.

### 💼 Dynamic Packing Checklist
Generate list items with checkboxes. Use format "- [ ] **Item Name**: description" for checklist items. Organize them into:
- 👕 **Clothing & Wearables** (aligned with climate and local cultural modesty)
- 🎒 **Gear & Electronics** (essential gadgets or equipment for the activities)
- 🏥 **Health, Safety & Protection** (insects, sun, rain, medications, etc.)
- 💳 **Essentials & Cash** (remind the user if ATMs are scarce or cash is king in remote spots)

### 🕌 Cultural Etiquette & Local Wisdom
Provide 2-3 specific behavioral rules or respectful etiquettes unique to ${province}'s local community to ensure a respectful visit.

Make the response engaging, professional, and practical for travelers. Do not refer to database limits or settings.`;
    } else {
      prompt = `Kamu adalah penasihat perjalanan AI berpengalaman yang ahli dalam petualangan di Indonesia.
Buatlah checklist persiapan dan barang bawaan (packing list) yang lengkap dan disesuaikan untuk perjalanan ke Provinsi ${province}, Indonesia.
Pertimbangkan:
1. Iklim khas, cuaca, dan kondisi geografis Provinsi ${province}.
2. Budaya lokal, tradisi keagamaan, adat istiadat, serta pedoman kesopanan di wilayah spesifik ini.
3. Aktivitas yang direncanakan: "${activitiesText}".

Harap susun jawaban Anda dalam format Markdown yang indah dengan emoji yang relevan:

### 🌡️ Konteks Cuaca & Iklim
Berikan ringkasan singkat tentang iklim di Provinsi ${province} dan alasan mengapa barang-barang ini direkomendasikan.

### 💼 Checklist Barang Bawaan Dinamis
Hasilkan item daftar dengan kotak centang. Gunakan format "- [ ] **Nama Barang**: deskripsi" untuk item checklist. Atur ke dalam kategori:
- 👕 **Pakaian & Sandang** (disesuaikan dengan iklim dan kesopanan budaya lokal)
- 🎒 **Peralatan & Elektronik** (gadget atau peralatan penting untuk aktivitas tersebut)
- 🏥 **Kesehatan, Keamanan & Perlindungan** (serangga, matahari, hujan, obat pribadi, dll.)
- 💳 **Esensial & Uang Tunai** (ingatkan pengguna jika ATM jarang atau uang tunai sangat penting di daerah terpencil)

### 🕌 Etika Budaya & Kearifan Lokal
Berikan 2-3 aturan perilaku spesifik atau etika sopan santun yang unik di masyarakat Provinsi ${province} untuk memastikan kunjungan yang saling menghormati.

Buatlah tanggapan yang menarik, profesional, dan praktis bagi wisatawan. Jangan merujuk pada batasan database atau pengaturan teknis.`;
    }

    if (!ai) {
      const offlineChecklist = getOfflineChecklistFallback(province, acts, custom, lang);
      return res.json({ text: offlineChecklist, isOffline: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text || (isEn ? "No checklist could be generated." : "Tidak ada checklist yang berhasil dibuat.");
      return res.json({ text, isOffline: false });
    } catch (error: any) {
      console.error("Gemini Checklist API Error:", error);
      const offlineChecklist = getOfflineChecklistFallback(province, acts, custom, lang);
      return res.json({
        text: isEn 
          ? `*(Using offline checklist due to connection issues)*\n\n${offlineChecklist}`
          : `*(Menggunakan checklist offline karena kendala koneksi)*\n\n${offlineChecklist}`,
        isOffline: true,
        error: error.message,
      });
    }
  });

  // API Route: Get local news for a province using Search Grounding
  app.post("/api/gemini/news", async (req, res) => {
    const { province, lang } = req.body;
    if (!province) {
      return res.status(400).json({ error: "Province name is required" });
    }

    const isEn = lang === "en";
    let prompt = "";
    if (isEn) {
      prompt = `Find the latest top 3 local news headlines or current events in ${province} Province, Indonesia. 
Provide the response in a neat Markdown format, including the headline, a brief 1-2 sentence summary, and the source.`;
    } else {
      prompt = `Carikan 3 berita lokal terbaru atau peristiwa terkini di Provinsi ${province}, Indonesia.
Berikan tanggapan dalam format Markdown yang rapi, termasuk judul berita, ringkasan singkat 1-2 kalimat, dan sumbernya.`;
    }

    if (!ai) {
      return res.json({ 
        text: isEn 
          ? `*(AI integration is required to fetch real-time news for ${province}.)*`
          : `*(Integrasi AI diperlukan untuk mengambil berita real-time untuk Provinsi ${province}.)*`, 
        isOffline: true 
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || (isEn ? "No news found." : "Tidak ada berita ditemukan.");
      return res.json({ text, isOffline: false });
    } catch (error: any) {
      console.error("Gemini News API Error:", error);
      return res.json({
        text: isEn 
          ? `*(Failed to fetch news due to connection issues)*`
          : `*(Gagal mengambil berita karena kendala koneksi)*`,
        isOffline: true,
        error: error.message,
      });
    }
  });

  // Vite middleware setup
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Simple local fallback engine for offline usage
function getOfflineProvinceFallback(province: string, category: string, question?: string, lang?: string): string {
  const isEn = lang === "en";
  if (question) {
    if (isEn) {
      return `### Ask AI: ${province}\n\nThank you for your question about "${question}" in ${province}.\n\nAs your tour guide assistant, ${province} is an incredibly rich region with breathtaking natural beauty, warm hospitality, and priceless ancestral heritage.\n\nPlease enable or insert your **GEMINI_API_KEY** in the *Settings > Secrets* panel to ask custom dynamic questions directly answered by Gemini AI!`;
    }
    return `### Tanya AI: ${province}\n\nTerima kasih atas pertanyaan Anda tentang "${question}" di ${province}.\n\nSebagai asisten pemandu wisata Anda, ${province} adalah wilayah yang luar biasa kaya dengan keindahan alam, keramahan masyarakat lokal, dan warisan leluhur yang tak ternilai harganya. \n\nSilakan aktifkan atau masukkan **GEMINI_API_KEY** Anda di panel *Settings > Secrets* untuk mengajukan pertanyaan kustom yang dinamis langsung dijawab oleh kecerdasan buatan Gemini!`;
  }

  if (isEn) {
    switch (category) {
      case "culture":
        return `### Distinctive Culture of ${province}
- **Traditional House**: Features unique architectural designs adapted to local wisdom, life philosophy, and resilience to local weather.
- **Traditional Attire & Fabrics**: Decorated with high-aesthetic traditional weavings such as Batik, Ikat, or Songket with philosophical motifs.
- **Traditional Dance**: Dynamic and expressive movements expressing gratitude, welcoming honored guests, or heroic values.
- **Arts & Musical Instruments**: Traditional bamboo, wooden, or metal instruments played in sacred customs and public celebrations.`;
      case "tourism":
        return `### Best Tourist Destinations in ${province}
1. **Natural Beauty**: Majestic mountains, green hills, hidden waterfalls, and exotic white-sand beaches with breathtaking coral reefs.
2. **Cultural & Historical Tourism**: Archaeological relics of ancient kingdoms, colonial heritage buildings, and traditional villages preserving pure customs.
3. **Ecotourism**: National parks conserving rare endemic flora and fauna, tropical rainforests, and wildlife sanctuaries.`;
      case "culinary":
        return `### Culinary Adventure in ${province}
- **Local Dishes**: Rich archipelago flavors, blending spicy, sweet, savory, and sour tastes crafted with heritage recipes.
- **Traditional Drinks**: Warm drinks rich in natural spices (ginger, lemongrass, cinnamon) or fresh local tropical juices.
- **Traditional Snacks**: Sweet and savory cakes/pastries made from coconut, sticky rice, palm sugar, or sago.`;
      default:
        return `### Welcome to ${province}
Welcome to one of the beautiful provinces in the Indonesian archipelago!
- **Uniqueness**: This province offers a captivating harmony of Indonesian cultures, abundant natural potential, and stunning geographical landscapes.
- **Further Exploration**: Use the floating menu above or below the map to explore its beauty, diverse travel destinations, cultural traditions, and culinary delights.`;
    }
  }

  switch (category) {
    case "culture":
      return `### Kebudayaan Khas ${province}
- **Rumah Adat**: Memiliki desain arsitektur tradisional yang disesuaikan dengan kearifan lokal, filosofi hidup, serta ketahanan terhadap iklim setempat.
- **Pakaian Adat & Kain**: Dihiasi dengan tenunan tradisional bernilai estetika tinggi, seperti Batik, Tenun Ikat, atau Songket dengan motif filosofis.
- **Tarian Tradisional**: Gerakan dinamis dan ekspresif yang mengekspresikan ucapan syukur, penyambutan tamu terhormat, maupun nilai kepahlawanan.
- **Kesenian & Alat Musik**: Alat musik tradisional bambu, kayu, atau logam yang dimainkan dalam upacara adat sakral dan perayaan rakyat.`;
    case "tourism":
      return `### Destinasi Wisata Terbaik di ${province}
1. **Keindahan Alam**: Wisata pegunungan yang megah, perbukitan hijau, air terjun tersembunyi, hingga pantai-pantai eksotis pasir putih dengan terumbu karang yang menakjubkan.
2. **Wisata Budaya & Sejarah**: Situs-situs peninggalan kerajaan kuno, bangunan peninggalan kolonial, desa adat yang masih mempertahankan tradisi hidup luhur secara murni.
3. **Ekowisata**: Taman nasional pelestarian flora dan fauna endemik langka, hutan hujan tropis, dan pusat penangkaran satwa liar.`;
    case "culinary":
      return `### Petualangan Kuliner ${province}
- **Makanan Khas**: Cita rasa kaya rempah khas nusantara, memadukan rasa pedas, manis, gurih, dan asam yang diolah dengan resep warisan turun-temurun.
- **Minuman Khas**: Minuman hangat kaya rempah alami (seperti jahe, serai, kayu manis) atau minuman segar berbahan buah tropis lokal.
- **Jajanan Tradisional**: Kue basah atau camilan kering dengan cita rasa manis gurih berbahan dasar kelapa, ketan, gula merah, atau sagu.`;
    default:
      return `### Selamat Datang di ${province}
Selamat datang di salah satu provinsi indah di kepulauan Indonesia! 
- **Keunikan**: Provinsi ini menawarkan harmoni kebudayaan Nusantara yang memikat, potensi alam yang melimpah, serta lanskap geografi yang menakjubkan.
- **Eksplorasi Lebih Lanjut**: Gunakan menu melayang di atas atau bawah peta untuk menjelajahi keindahan, ragam destinasi wisata, tradisi budaya, dan kelezatan kulinernya.`;
  }
}

// Simple local fallback engine for offline itinerary planning
function getOfflineItineraryFallback(province: string, days: number, preference: string, lang?: string): string {
  const isEn = lang === "en";
  if (isEn) {
    return `### 🗺️ Travel Itinerary: ${days} Days in ${province} (${preference})

Welcome to an exciting adventure exploring **${province}**! Here is your ideal **${days}-Day** travel itinerary with a focus on **${preference}** experiences:

---

#### 📍 Day 1: Iconic Explorations & Area Orientation
* **Morning**: Visit the primary city icons in ${province}. Enjoy the beautiful urban setting and take photos at historic local landmarks.
* **Lunch**: Taste legendary local culinary dishes in ${province} that are rich in authentic local seasonings.
* **Evening & Night**: Relax at the town square or the nearest beach while enjoying a peaceful sunset view, followed by a casual dinner at a local food market.

#### 📍 Day 2: Deep Dive Exploration (${preference})
* **Morning**: Journey to premier destinations in ${province} according to your style. If *Nature*, head to hidden mountains/beaches. If *Culture*, visit heritage villages. If *Culinary*, sample traditional market delicacies at sunrise.
* **Lunch**: Enjoy fresh seafood caught today or traditional village lunch dishes.
* **Evening & Night**: Visit local craft centers to watch the making of souvenirs, followed by a fine traditional dinner.

${days >= 3 ? `
#### 📍 Day 3: Hidden Gems & Souvenir Shopping
* **Morning**: Tour a quiet, untamed hidden gem destination to enjoy pristine tranquility.
* **Lunch**: Savor hot grilled dishes or warm soup specialties of ${province}.
* **Evening & Night**: Hunt for special local souvenirs (handwoven textiles, traditional snacks, local coffee) at the main gift shops, topped off with an unforgettable farewell dinner.
` : ''}

${days >= 5 ? `
#### 📍 Day 4 - ${days}: Extended Adventures & Relaxation
* Explore outlying islets, hike a panoramic hill offering 360-degree vistas, or attend a traditional cooking class with local residents.
` : ''}

---

### 💡 Travel Tips & Additional Information
* 🚗 **Transportation**: Renting a four-wheel or two-wheel vehicle is highly recommended for flexibility in reaching hidden natural gems.
* 💰 **Estimated Budget**:
  * *Backpacker*: IDR 300k - IDR 500k / day
  * *Mid-range*: IDR 600k - IDR 1.2M / day
  * *Premium*: Above IDR 1.5M / day
* 🛍️ **Must-Buy Souvenirs**: Woven bamboo/rattan crafts, traditional handwoven textiles of ${province}, and specialty mountain-grown local coffee.

> 💡 *Note: Enable or insert your **GEMINI_API_KEY** in Settings > Secrets to generate a much more precise, dynamic, comprehensive, and tailored travel itinerary calculated in real-time by Gemini AI!*`;
  }

  return `### 🗺️ Rencana Perjalanan Wisata: ${days} Hari di ${province} (${preference})

Selamat datang di petualangan seru menjelajahi **${province}**! Berikut adalah rancangan perjalanan ideal Anda selama **${days} Hari** dengan fokus wisata **${preference}**:

---

#### 📍 Hari 1: Penjelajahan Ikonis & Pengenalan Wilayah
* **Pagi**: Mengunjungi ikon kota utama di ${province}. Menikmati keindahan tata kota dan berfoto di landmark sejarah setempat.
* **Siang**: Makan siang kuliner legendaris ${province} yang kaya bumbu lokal autentik.
* **Sore & Malam**: Bersantai di alun-alun kota atau pantai terdekat sambil menikmati pemandangan matahari terbenam yang syahdu, dilanjutkan makan malam santai di pusat jajanan lokal.

#### 📍 Hari 2: Eksplorasi Mendalam (${preference})
* **Pagi**: Perjalanan ke destinasi unggulan ${province} sesuai preferensi Anda. Jika memilih *Alam*, kita menuju pegunungan/pantai tersembunyi. Jika *Budaya*, kita mengunjungi desa adat leluhur. Jika *Kuliner*, kita mencicipi jajanan pasar tradisional dari pasar subuh.
* **Siang**: Makan siang dengan hidangan laut (seafood) segar tangkapan hari ini atau lauk pauk tradisional khas pedesaan.
* **Sore & Malam**: Mengunjungi pusat kerajinan tangan lokal untuk melihat pembuatan cinderamata, diikuti dengan bersantap malam tradisional.

${days >= 3 ? `
#### 📍 Hari 3: Permata Tersembunyi & Belanja Oleh-oleh
* **Pagi**: Berwisata ke lokasi wisata tersembunyi yang tenang dan belum banyak terjamah wisatawan untuk menikmati ketenangan hakiki.
* **Siang**: Makan siang menu bakar atau sup hangat khas ${province}.
* **Sore & Malam**: Berburu oleh-oleh khas (kain tenun, camilan tradisional, kopi lokal) di toko cinderamata utama, ditutup dengan makan malam perpisahan yang istimewa.
` : ''}

${days >= 5 ? `
#### 📍 Hari 4 - ${days}: Petualangan Lanjutan & Relaksasi
* Menjelajahi pulau luar, mendaki bukit dengan pemandangan panorama 360 derajat, atau mengikuti kelas memasak kuliner tradisional langsung bersama warga lokal.
` : ''}

---

### 💡 Tips Perjalanan & Informasi Tambahan
* 🚗 **Transportasi**: Disarankan menyewa kendaraan roda empat atau roda dua demi fleksibilitas menjelajah destinasi alam yang kadang tersembunyi.
* 💰 **Estimasi Anggaran**:
  * *Backpacker*: Rp 300.000 - Rp 500.000 / hari
  * *Menengah*: Rp 600.000 - Rp 1.200.000 / hari
  * *Premium*: Di atas Rp 1.500.000 / hari
* 🛍️ **Oleh-oleh Wajib**: Kerajinan anyaman bambu/rotan, kain adat tenun tangan khas ${province}, serta kopi specialty khas daerah pegunungan setempat.

> 💡 *Catatan: Aktifkan atau tambahkan **GEMINI_API_KEY** di panel Settings > Secrets untuk menghasilkan rencana perjalanan yang jauh lebih presisi, dinamis, lengkap, serta dihitung langsung oleh kecerdasan buatan Gemini berdasarkan lokasi riil terkini!*`;
}

// Simple local fallback engine for offline checklist generation
function getOfflineChecklistFallback(province: string, activities: string[], custom: string, lang?: string): string {
  const isEn = lang === "en";
  
  // Custom or mapped activities to read beautifully
  let actList = activities.map(a => {
    if (a === "nature") return isEn ? "Nature Tour" : "Wisata Alam";
    if (a === "culture") return isEn ? "Cultural Heritage" : "Warisan Budaya";
    if (a === "beach") return isEn ? "Beach & Diving" : "Pantai & Selam";
    if (a === "hiking") return isEn ? "Hiking & Camping" : "Mendaki & Berkemah";
    if (a === "culinary") return isEn ? "Culinary" : "Kuliner";
    return a;
  });
  if (custom) actList.push(custom);
  const activitiesStr = actList.join(", ") || (isEn ? "General Travel" : "Perjalanan Umum");

  if (isEn) {
    return `### 🌡️ Weather & Climate Context
**${province}** generally experiences a warm tropical climate, with some regions being highly humid near coasts or significantly cooler in highland areas. Proper preparation will ensure a smooth journey.

### 💼 Dynamic Packing Checklist (Planned: ${activitiesStr})

#### 👕 Clothing & Wearables
- [ ] **Modest Attire**: Loose, lightweight clothing covering shoulders and knees for visiting cultural or sacred sites.
- [ ] **Comfortable Walking Shoes**: High-traction footwear for exploring terrain or town walking.
- [ ] **Light Rain Jacket / Windbreaker**: Essential in case of sudden tropical downpours.
- [ ] **Hat & Sunglasses**: Protection against strong equatorial sun rays.

#### 🎒 Gear & Electronics
- [ ] **Universal Power Bank**: Ensure your phone and camera stay charged during long day trips.
- [ ] **Waterproof Dry Bag**: Extremely useful for boat rides, beach activities, or wet weather to protect gadgets.
- [ ] **Eco-Friendly Water Bottle**: Stay hydrated while minimizing plastic waste.
- [ ] **Universal Travel Adapter**: Mismatched socket formats can occur in local guesthouses.

#### 🏥 Health, Safety & Protection
- [ ] **Mosquito Repellent (DEET)**: Absolutely critical for tropical evenings to prevent mosquito-borne illnesses.
- [ ] **Sunscreen (SPF 50+)**: Coral-safe sunscreen to protect your skin from high UV indexes.
- [ ] **Personal First-Aid Kit**: Include motion sickness pills, anti-diarrhea medication, and band-aids.
- [ ] **Sanitizer & Wet Wipes**: For hygiene on the road before enjoying local street food.

#### 💳 Essentials & Cash
- [ ] **Physical ID & Travel Documents**: Keep physical photocopies of IDs, permits, or tickets.
- [ ] **Local Currency Cash (Rupiah)**: Remote areas, small local eateries, and traditional markets do not accept digital card payments.

### 🕌 Cultural Etiquette & Local Wisdom
1. **Respect Sacred Sites**: Dress respectfully and follow all signs. In temple complexes, tie a traditional sash if required.
2. **Right-Hand Rule**: Always use your right hand when giving or receiving items, shaking hands, or eating, as the left hand is culturally considered impolite.
3. **Ask Before Photographing**: Always politely ask local residents before taking close-up portraits of them or their children.

> 💡 *Note: Enable or insert your **GEMINI_API_KEY** in Settings > Secrets to generate a highly precise checklist dynamically generated in real-time by Gemini AI based on actual real-time climate, culture and activity conditions!*`;
  }

  return `### 🌡️ Konteks Cuaca & Iklim
**${province}** umumnya beriklim tropis hangat, dengan kelembapan tinggi di dekat wilayah pesisir atau suhu yang jauh lebih dingin di wilayah dataran tinggi. Persiapan yang tepat akan memastikan kelancaran petualangan Anda.

### 💼 Checklist Barang Bawaan Dinamis (Rencana: ${activitiesStr})

#### 👕 Pakaian & Sandang
- [ ] **Pakaian Sopan**: Pakaian longgar, ringan yang menutupi bahu dan lutut untuk mengunjungi situs budaya atau tempat ibadah sakral.
- [ ] **Sepatu Berjalan Nyaman**: Alas kaki yang nyaman dengan cengkeraman baik untuk menjelajah alam atau jalan-jalan santai di kota.
- [ ] **Jas Hujan Ringan / Jaket Angin**: Sangat penting untuk mengantisipasi hujan tropis yang tiba-tiba.
- [ ] **Topi & Kacamata Hitam**: Perlindungan terhadap sinar matahari khatulistiwa yang cukup terik.

#### 🎒 Peralatan & Elektronik
- [ ] **Power Bank**: Memastikan ponsel dan kamera Anda tetap terisi daya selama perjalanan seharian penuh.
- [ ] **Dry Bag (Tas Tahan Air)**: Sangat berguna saat naik perahu, aktivitas pantai, atau saat hujan untuk melindungi gadget Anda.
- [ ] **Botol Minum Ramah Lingkungan**: Tetap terhidrasi sekaligus meminimalkan sampah plastik sekali pakai.
- [ ] **Adaptor Colokan Listrik**: Jenis colokan di penginapan lokal terkadang bervariasi.

#### 🏥 Kesehatan, Keamanan & Perlindungan
- [ ] **Cairan Anti Nyamuk**: Sangat penting untuk sore/malam hari guna menghindari gigitan nyamuk tropis.
- [ ] **Tabir Surya (Sunscreen SPF 50+)**: Gunakan tabir surya ramah lingkungan untuk melindungi kulit dari indeks UV yang tinggi.
- [ ] **Kotak P3K Pribadi**: Siapkan obat mabuk perjalanan, obat diare, plester luka, dan minyak kayu putih.
- [ ] **Hand Sanitizer & Tisu Basah**: Untuk menjaga kebersihan di perjalanan sebelum menyantap kuliner lokal.

#### 💳 Esensial & Uang Tunai
- [ ] **Identitas Diri & Dokumen**: Simpan salinan fisik KTP, tiket, atau dokumen perjalanan penting lainnya.
- [ ] **Uang Tunai Rupiah**: Daerah terpencil, warung makan kecil, dan pasar tradisional sebagian besar tidak menerima pembayaran digital atau kartu.

### 🕌 Etika Budaya & Kearifan Lokal
1. **Hormati Tempat Suci**: Berpakaianlah dengan sopan dan patuhi petunjuk setempat. Di kawasan pura atau masjid, gunakan kain penutup jika diharuskan.
2. **Gunakan Tangan Kanan**: Selalu gunakan tangan kanan saat memberikan/menerima barang atau bersalaman, karena menggunakan tangan kiri dianggap kurang sopan.
3. **Minta Izin Sebelum Memotret**: Selalu minta izin dengan ramah kepada warga lokal sebelum mengambil foto potret mereka secara dekat.

> 💡 *Catatan: Aktifkan atau tambahkan **GEMINI_API_KEY** di panel Settings > Secrets untuk menghasilkan checklist yang sangat presisi dan dinamis, dihitung langsung secara real-time oleh asisten Gemini AI berdasarkan iklim, budaya, dan aktivitas nyata!*`;
}

startServer();
