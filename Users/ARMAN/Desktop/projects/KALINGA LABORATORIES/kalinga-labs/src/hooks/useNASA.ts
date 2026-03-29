// src/hooks/useNASA.ts
import { useQuery } from '@tanstack/react-query';

const BASE = 'https://api.nasa.gov';
const KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

/* ── Type definitions ── */
export interface APOD {
  date: string;
  explanation: string;
  hdurl?: string;
  url: string;
  title: string;
  media_type: 'image' | 'video';
  copyright?: string;
}

export interface MarsPhoto {
  id: number;
  sol: number;
  img_src: string;
  earth_date: string;
  camera: { name: string; full_name: string };
  rover: { name: string };
}

export interface NeoEntry {
  id: string;
  name: string;
  estimated_diameter: {
    kilometers: { estimated_diameter_max: number };
  };
  close_approach_data: {
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string };
    close_approach_date: string;
  }[];
  is_potentially_hazardous_asteroid: boolean;
}

export interface NeoFeed {
  near_earth_objects: Record<string, NeoEntry[]>;
  element_count: number;
}

export interface Exoplanet {
  pl_name: string;
  hostname: string;
  pl_rade?: number;
  pl_masse?: number;
  pl_orbper?: number;
  st_dist?: number;
}

export interface NASAImage {
  nasa_id: string;
  title: string;
  description: string;
  date_created: string;
  thumb: string;
}

/* ── APOD ── */
export function useAPOD() {
  return useQuery<APOD>({
    queryKey: ['apod'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/planetary/apod?api_key=${KEY}`);
      if (!res.ok) throw new Error(`APOD fetch failed: ${res.status}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
}

/* ── Mars Photos — multiple camera fallbacks for reliability ── */
export function useMarsPhotos() {
  return useQuery<MarsPhoto[]>({
    queryKey: ['mars-photos'],
    queryFn: async () => {
      // Try multiple sols/cameras for robustness
      const attempts = [
        `${BASE}/mars-photos/api/v1/rovers/curiosity/photos?sol=3900&camera=navcam&api_key=${KEY}`,
        `${BASE}/mars-photos/api/v1/rovers/curiosity/photos?sol=3500&camera=navcam&api_key=${KEY}`,
        `${BASE}/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2023-06-01&api_key=${KEY}`,
        `${BASE}/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${KEY}`,
      ];
      for (const url of attempts) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          const photos = json.photos as MarsPhoto[];
          if (photos && photos.length > 0) return photos;
        } catch {
          continue;
        }
      }
      return [];
    },
    staleTime: 1000 * 60 * 60 * 6,
    retry: 1,
  });
}

/* ── NEO Feed ── */
export function useNeoFeed() {
  return useQuery<NeoFeed>({
    queryKey: ['neo-feed'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `${BASE}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${KEY}`
      );
      if (!res.ok) throw new Error(`NEO fetch failed: ${res.status}`);
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });
}

/* ── Exoplanets — use CORS-friendly endpoint ── */
export function useExoplanets() {
  return useQuery<Exoplanet[]>({
    queryKey: ['exoplanets'],
    queryFn: async () => {
      // Use the confirmed CORS-enabled JSON endpoint
      const url =
        'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_rade,pl_masse,pl_orbper,st_dist+from+pscomppars+where+pl_rade+is+not+null+and+pl_rade+%3E+0.5+order+by+pl_rade+desc&format=json';
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`Exoplanet fetch failed: ${res.status}`);
      const data = await res.json();
      return (data as Exoplanet[]).slice(0, 10);
    },
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}

/* ── NASA Image Library — Hubble/space gallery ── */
export function useNASAImages(query: string) {
  return useQuery<NASAImage[]>({
    queryKey: ['nasa-images', query],
    queryFn: async () => {
      const res = await fetch(
        `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=12`
      );
      if (!res.ok) throw new Error(`NASA Images fetch failed: ${res.status}`);
      const json = await res.json();
      const items = json.collection?.items ?? [];
      return items.map((item: { data: { nasa_id: string; title: string; description: string; date_created: string }[]; links?: { href: string }[] }) => ({
        nasa_id: item.data[0]?.nasa_id,
        title: item.data[0]?.title,
        description: item.data[0]?.description,
        date_created: item.data[0]?.date_created,
        thumb: item.links?.[0]?.href ?? '',
      })) as NASAImage[];
    },
    staleTime: 1000 * 60 * 60 * 12,
    retry: 1,
  });
}

/* ── Helpers ── */
export function flattenNeo(feed: NeoFeed | undefined): NeoEntry[] {
  if (!feed) return [];
  return Object.values(feed.near_earth_objects).flat().slice(0, 20);
}
