// src/components/Labs/Physics/DataDashboard.tsx
import React from 'react';
import { GlassPanel } from '@/components/Shared/GlassPanel';
import { NeonText } from '@/components/Shared/NeonText';
import { useNeoFeed, useMarsPhotos, useExoplanets, flattenNeo } from '@/hooks/useNASA';
import { motion } from 'framer-motion';
import { useLabStore } from '@/store/labStore';

/* ─── NEO Feed table ─── */
function NeoTable() {
  const { data, isLoading, error } = useNeoFeed();
  const { unlockAchievement } = useLabStore();

  React.useEffect(() => {
    if (data) unlockAchievement('neo-watcher');
  }, [data, unlockAchievement]);

  const neos = flattenNeo(data);

  return (
    <GlassPanel glowColor="purple" padding="0.8rem">
      <NeonText as="h3" glow="purple" size="0.65rem" tracking="0.15em" style={{ marginBottom: 10 }}>
        NEAR EARTH OBJECTS
      </NeonText>
      {isLoading && (
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#4a7a8a', fontSize: '0.7rem' }}>
          LOADING NEO DATA…
        </p>
      )}
      {error && (
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#b44fff', fontSize: '0.7rem' }}>
          NEO DATA UNAVAILABLE
        </p>
      )}
      {neos.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>MAX Ø (km)</th>
                <th>VELOCITY (km/h)</th>
                <th>MISS DIST (km)</th>
                <th>HAZARD</th>
              </tr>
            </thead>
            <tbody>
              {neos.slice(0, 8).map((neo) => {
                const approach = neo.close_approach_data[0];
                const diam = neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3);
                const vel = parseFloat(approach?.relative_velocity.kilometers_per_hour ?? '0').toLocaleString(undefined, { maximumFractionDigits: 0 });
                const miss = parseFloat(approach?.miss_distance.kilometers ?? '0').toLocaleString(undefined, { maximumFractionDigits: 0 });
                return (
                  <tr key={neo.id}>
                    <td style={{ color: '#00f5c4', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {neo.name.replace(/[()]/g, '')}
                    </td>
                    <td>{diam}</td>
                    <td>{vel}</td>
                    <td>{miss}</td>
                    <td style={{ color: neo.is_potentially_hazardous_asteroid ? '#b44fff' : '#00f5c4' }}>
                      {neo.is_potentially_hazardous_asteroid ? '⚠ YES' : 'NO'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassPanel>
  );
}

/* ─── Mars Photo Gallery ─── */
function MarsGallery() {
  const { data: photos, isLoading, error } = useMarsPhotos();
  const { unlockAchievement } = useLabStore();

  React.useEffect(() => {
    if (photos && photos.length > 0) unlockAchievement('mars-rover');
  }, [photos, unlockAchievement]);

  return (
    <GlassPanel glowColor="teal" padding="0.8rem">
      <NeonText as="h3" glow="teal" size="0.65rem" tracking="0.15em" style={{ marginBottom: 10 }}>
        MARS ROVER CURIOSITY — SOL 1000
      </NeonText>
      {isLoading && (
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#4a7a8a', fontSize: '0.7rem' }}>
          DOWNLOADING MARS SURFACE IMAGERY…
        </p>
      )}
      {error && (
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#b44fff', fontSize: '0.7rem' }}>
          MARS PHOTO FEED UNAVAILABLE
        </p>
      )}
      {photos && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
          {photos.slice(0, 12).map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(0,245,196,0.1)', cursor: 'pointer' }}
            >
              <img
                src={photo.img_src}
                alt={`Mars surface ${photo.earth_date}`}
                style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block', filter: 'sepia(30%)' }}
                loading="lazy"
              />
              <div style={{ padding: '3px 5px', background: 'rgba(2,13,24,0.8)' }}>
                <p style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.55rem', color: '#4a7a8a' }}>
                  {photo.camera.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

/* ─── Exoplanet card ─── */
function ExoplanetCard() {
  const { data: planets, isLoading } = useExoplanets();
  const planet = planets?.[0];

  return (
    <GlassPanel glowColor="blue" padding="0.8rem">
      <NeonText as="h3" glow="blue" size="0.65rem" tracking="0.15em" style={{ marginBottom: 10 }}>
        EXOPLANET SPOTLIGHT
      </NeonText>
      {isLoading && (
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#4a7a8a', fontSize: '0.7rem' }}>
          QUERYING EXOPLANET ARCHIVE…
        </p>
      )}
      {planet && (
        <div>
          <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1rem', color: '#1af0ff', marginBottom: 4 }}>
            {planet.pl_name}
          </p>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', color: '#4a7a8a', fontSize: '0.85rem', marginBottom: 8 }}>
            Host Star: {planet.hostname}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {planet.pl_rade && (
              <div>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a' }}>RADIUS (R⊕)</p>
                <p className="data-value">{planet.pl_rade.toFixed(2)}</p>
              </div>
            )}
            {planet.pl_masse && (
              <div>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a' }}>MASS (M⊕)</p>
                <p className="data-value">{planet.pl_masse.toFixed(2)}</p>
              </div>
            )}
            {planet.pl_orbper && (
              <div>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a' }}>PERIOD (days)</p>
                <p className="data-value">{planet.pl_orbper.toFixed(2)}</p>
              </div>
            )}
            {planet.st_dist && (
              <div>
                <p style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.5rem', color: '#4a7a8a' }}>DISTANCE (pc)</p>
                <p className="data-value">{planet.st_dist.toFixed(1)}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {!isLoading && !planet && (
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#b44fff', fontSize: '0.7rem' }}>
          EXOPLANET DATABASE UNAVAILABLE
        </p>
      )}
    </GlassPanel>
  );
}

/* ─── Main dashboard ─── */
export const DataDashboard: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', padding: '1rem' }}>
      <NeoTable />
      <MarsGallery />
      <ExoplanetCard />
    </div>
  );
};
