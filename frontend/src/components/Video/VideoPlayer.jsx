import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

function VideoPlayer() {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [quality, setQuality] = useState('auto'); // 'auto' or numeric level index
  const [levels, setLevels] = useState([]); // { index, height, bitrate, name }
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = 'http://localhost:3002/video/hls';

    const configureHls = (hlsInstance) => {
      hlsRef.current = hlsInstance;
      video._hls = hlsInstance;
      video.crossOrigin = 'anonymous';

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error', event, data);
      });

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        const lvls = hlsInstance.levels || [];
        console.log('HLS manifest parsed', lvls);
        setIsReady(true);
        setLevels(
          lvls.map((L, i) => ({
            index: i,
            height: L.height || 0,
            bitrate: L.bitrate || 0,
            name: L.name || `${L.height || 0}p`,
          })),
        );
      });

      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        console.log('HLS level switched', data);
      });
    };

    const setupHls = () => {
      if (Hls.isSupported()) {
        const hlsInstance = new Hls({ enableWorker: false });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        configureHls(hlsInstance);
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return;
      }
    };

    setupHls();

    return () => {
      const hlsInstance = hlsRef.current;
      if (hlsInstance) {
        try {
          hlsInstance.destroy();
        } catch (e) {
          console.error('HLS destroy error', e);
        }
      }
      try {
        if (video) delete video._hls;
      } catch (e) {
        console.error('Cleanup error', e);
      }
    };
  }, []);

  const onQualityChange = (val) => {
    setQuality(val);
    const video = videoRef.current;
    const h = hlsRef.current;

    console.log('Quality change requested', val, 'hlsInstance', h);

    if (h) {
      if (val === 'auto') {
        h.currentLevel = -1;
        h.nextLevel = -1;
      } else {
        const idx = Number(val);
        if (!Number.isNaN(idx) && h.levels && h.levels[idx]) {
          h.nextLevel = idx;
          h.currentLevel = idx;
          console.log('Switching HLS level to', idx, h.levels[idx]);
        } else {
          console.warn('Invalid HLS level index', idx, 'levels', h.levels);
        }
      }

      if (video && video.paused) {
        video.play().catch((err) => console.error('Video play failed after quality change', err));
      }
      return;
    }

    if (video) {
      if (val === 'auto') {
        video.src = 'http://localhost:3002/video/hls';
      } else {
        const lvl = levels.find((l) => String(l.index) === String(val));
        const name = lvl && lvl.name ? lvl.name : `${val}p`;
        video.src = `http://localhost:3002/video/hls/${name}.m3u8`;
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ color: '#111', fontWeight: 600 }}>Quality</label>
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value)}
          style={{
            padding: '6px 8px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#000',
          }}
        >
          <option value="auto">Auto</option>
          {levels.length > 0
            ? levels.map((l) => (
                <option key={l.index} value={String(l.index)}>
                  {l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)}kbps`}
                </option>
              ))
            : (
                // fallback static options while manifest loads
                <>
                  <option value="0">360p</option>
                  <option value="1">720p</option>
                  <option value="2">1080p</option>
                </>
              )}
        </select>
      </div>

      <video
        ref={videoRef}
        width="800"
        controls
        playsInline
        style={{ borderRadius: 8, background: '#000' }}
      />
    </div>
  );
}

export default VideoPlayer;