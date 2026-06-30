export interface LatLng {
  lat: number;
  lng: number;
}

export const PROVINCE_COORDINATES: Record<string, LatLng> = {
  aceh: { lat: 4.6951, lng: 96.7494 },
  sumut: { lat: 2.1121, lng: 99.1349 },
  sumbar: { lat: -0.7399, lng: 100.8000 },
  riau: { lat: 0.5071, lng: 101.5408 },
  kepri: { lat: 1.0829, lng: 104.0305 },
  jambi: { lat: -1.6101, lng: 103.6131 },
  sumsel: { lat: -3.3194, lng: 104.9142 },
  babel: { lat: -2.7410, lng: 106.4406 },
  bengkulu: { lat: -3.7928, lng: 102.2608 },
  lampung: { lat: -4.5586, lng: 105.4000 },
  banten: { lat: -6.4058, lng: 106.0600 },
  jakarta: { lat: -6.2088, lng: 106.8456 },
  jabar: { lat: -7.0909, lng: 107.6689 },
  jateng: { lat: -7.1510, lng: 110.1403 },
  yogyakarta: { lat: -7.8754, lng: 110.4263 },
  jatim: { lat: -7.5361, lng: 112.2384 },
  bali: { lat: -8.4095, lng: 115.1889 },
  ntb: { lat: -8.6529, lng: 117.3616 },
  ntt: { lat: -8.6574, lng: 121.0794 },
  kalbar: { lat: -0.2788, lng: 111.4753 },
  kalteng: { lat: -1.6815, lng: 113.3824 },
  kalsel: { lat: -3.0926, lng: 115.2838 },
  kaltim: { lat: 0.5387, lng: 116.4194 },
  kalara: { lat: 3.0731, lng: 116.0414 },
  sulut: { lat: 1.4931, lng: 124.8413 },
  sulbar: { lat: -2.4974, lng: 119.3272 },
  sulteng: { lat: -1.4300, lng: 121.4457 },
  sultra: { lat: -4.1449, lng: 122.1746 },
  sulsel: { lat: -3.6687, lng: 119.9740 },
  gorontalo: { lat: 0.6999, lng: 122.4500 },
  maluku: { lat: -3.2385, lng: 130.1453 },
  malut: { lat: 0.6301, lng: 127.9731 },
  papua: { lat: -2.5337, lng: 140.7181 },
  papuabar: { lat: -1.3361, lng: 132.7500 },
  papuapus: { lat: -4.0000, lng: 136.0000 },
  papuasel: { lat: -7.5000, lng: 139.5000 },
  papuapeg: { lat: -4.2000, lng: 138.8000 },
  papuabaray: { lat: -1.1500, lng: 131.3000 }
};

export function getProvinceLatLng(id: string): LatLng {
  return PROVINCE_COORDINATES[id] || { lat: -2.5489, lng: 118.0149 }; // Default to Indonesia's centroid
}
