import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

  .ar-root {
    position: fixed; inset: 0;
    background: #000;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
    touch-action: none;
    user-select: none;
    z-index: 9999;
  }

  /* ── CRITICAL: video must be raw, no transform, fill container ── */
  .ar-video {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    background: #000;
    /* NO transform here — it breaks rendering on many browsers */
  }

  .ar-tap-layer {
    position: absolute; inset: 0;
    z-index: 10;
    cursor: crosshair;
  }

  .ar-ui-layer {
    position: absolute; inset: 0;
    z-index: 20;
    pointer-events: none;
  }

  /* Grid */
  .ar-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* Scan line */
  .ar-scanline {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(0,245,255,0.6) 15%,
      #00f5ff 50%,
      rgba(0,245,255,0.6) 85%,
      transparent 100%);
    box-shadow: 0 0 16px #00f5ff, 0 0 32px rgba(0,245,255,0.3);
    animation: scanMove 3s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes scanMove {
    0%   { top: 0%;   opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  /* Corner brackets */
  .ar-corners { position: absolute; inset: 0; pointer-events: none; }
  .ar-corner {
    position: absolute; width: 28px; height: 28px;
    border-color: rgba(0,245,255,0.8);
    border-style: solid;
  }
  .ar-corner-tl { top: 64px;  left: 12px;  border-width: 2px 0 0 2px; }
  .ar-corner-tr { top: 64px;  right: 12px; border-width: 2px 2px 0 0; }
  .ar-corner-bl { bottom: 96px; left: 12px;  border-width: 0 0 2px 2px; }
  .ar-corner-br { bottom: 96px; right: 12px; border-width: 0 2px 2px 0; }

  /* Crosshair */
  .ar-crosshair {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 56px; height: 56px;
    pointer-events: none;
    animation: chPulse 2.5s ease-in-out infinite;
  }
  @keyframes chPulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.5; }
  }
  .ar-ch-h {
    position: absolute; top: 50%; left: 0; right: 0; height: 1px;
    background: rgba(0,245,255,0.9); transform: translateY(-50%);
  }
  .ar-ch-v {
    position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
    background: rgba(0,245,255,0.9); transform: translateX(-50%);
  }
  .ar-ch-ring {
    position: absolute; inset: 0;
    border: 1px solid rgba(0,245,255,0.35);
    border-radius: 50%;
  }
  .ar-ch-dot {
    position: absolute; top: 50%; left: 50%;
    width: 5px; height: 5px; border-radius: 50%;
    background: #00f5ff;
    transform: translate(-50%,-50%);
    box-shadow: 0 0 8px #00f5ff;
  }

  /* HUD bars */
  .ar-hud-top {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 10px 14px;
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%);
    pointer-events: all;
    z-index: 30;
  }
  .ar-hud-bottom {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 12px 14px 18px;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
    pointer-events: all;
    z-index: 30;
  }

  /* Badges */
  .ar-badge {
    background: rgba(0,2,10,0.8);
    border: 1px solid rgba(0,245,255,0.35);
    border-radius: 20px;
    padding: 5px 11px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: #00f5ff;
    letter-spacing: 1px;
    white-space: nowrap;
    backdrop-filter: blur(8px);
  }

  /* Buttons */
  .ar-icon-btn {
    background: rgba(0,2,10,0.75);
    border: 1px solid rgba(0,245,255,0.3);
    border-radius: 20px;
    padding: 7px 14px;
    color: #00f5ff;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .ar-icon-btn:active { transform: scale(0.93); }

  .ar-mode-btn {
    padding: 7px 13px;
    border-radius: 20px;
    border: 1px solid rgba(0,245,255,0.25);
    background: rgba(0,2,10,0.7);
    color: rgba(0,245,255,0.6);
    font-family: 'Orbitron', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(6px);
  }
  .ar-mode-btn.active {
    background: rgba(0,245,255,0.14);
    border-color: #00f5ff;
    color: #00f5ff;
    box-shadow: 0 0 10px rgba(0,245,255,0.25);
  }

  /* Shutter */
  .ar-shutter {
    width: 60px; height: 60px; border-radius: 50%;
    border: 3px solid rgba(0,245,255,0.8);
    background: rgba(0,245,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 0 16px rgba(0,245,255,0.25);
  }
  .ar-shutter-inner {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #00f5ff, #0070ff);
  }
  .ar-shutter:active { transform: scale(0.9); }

  /* Point marker */
  .ar-point {
    position: absolute;
    width: 14px; height: 14px;
    border: 2px solid #00f5ff;
    border-radius: 50%;
    background: rgba(0,245,255,0.25);
    transform: translate(-50%,-50%);
    box-shadow: 0 0 10px #00f5ff;
    pointer-events: none;
    z-index: 25;
    animation: ptPulse 1.8s ease-in-out infinite;
  }
  @keyframes ptPulse {
    0%,100% { box-shadow: 0 0 8px #00f5ff; }
    50%      { box-shadow: 0 0 18px #00f5ff, 0 0 36px rgba(0,245,255,0.3); }
  }

  /* Measurement label */
  .ar-meas-label {
    position: absolute;
    background: rgba(0,2,12,0.88);
    border: 1px solid rgba(0,245,255,0.55);
    border-radius: 6px;
    padding: 4px 10px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #00f5ff;
    pointer-events: none;
    transform: translate(-50%,-50%);
    white-space: nowrap;
    backdrop-filter: blur(6px);
    z-index: 25;
    text-shadow: 0 0 6px rgba(0,245,255,0.5);
  }

  /* Object detection box */
  .ar-det-box {
    position: absolute;
    border: 1.5px solid #00ff88;
    border-radius: 4px;
    pointer-events: none;
    z-index: 25;
  }
  .ar-det-tag {
    position: absolute;
    top: -20px; left: 0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: #00ff88;
    background: rgba(0,255,136,0.12);
    border: 1px solid rgba(0,255,136,0.4);
    padding: 1px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }

  /* Results panel */
  .ar-results-panel {
    background: rgba(0,2,16,0.92);
    border: 1px solid rgba(0,245,255,0.3);
    border-radius: 12px;
    padding: 14px;
    backdrop-filter: blur(16px);
    max-height: 200px;
    overflow-y: auto;
    margin-top: 10px;
  }

  /* Toast */
  .ar-toast {
    position: absolute;
    top: 72px; left: 50%;
    transform: translateX(-50%);
    background: rgba(0,255,136,0.14);
    border: 1px solid rgba(0,255,136,0.45);
    border-radius: 20px;
    padding: 7px 20px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: #00ff88;
    white-space: nowrap;
    pointer-events: none;
    z-index: 50;
  }

  /* Permission screen */
  .ar-perm {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(160deg, #020810, #040d20);
    padding: 32px; text-align: center;
    z-index: 40;
  }
  .ar-perm-icon {
    width: 96px; height: 96px; border-radius: 50%;
    border: 2px solid rgba(0,245,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 46px; margin-bottom: 24px;
    background: rgba(0,245,255,0.05);
    animation: iconGlow 2s ease-in-out infinite;
  }
  @keyframes iconGlow {
    0%,100% { box-shadow: 0 0 20px rgba(0,245,255,0.15); }
    50%      { box-shadow: 0 0 40px rgba(0,245,255,0.35); }
  }
  .ar-perm-title {
    font-family: 'Orbitron', monospace;
    font-size: 20px; font-weight: 800;
    color: #00f5ff; letter-spacing: 2px; margin-bottom: 12px;
  }
  .ar-perm-desc {
    font-size: 15px; color: rgba(126,184,212,0.8);
    line-height: 1.6; margin-bottom: 28px; max-width: 300px;
  }
  .ar-perm-btn {
    padding: 15px 40px;
    background: linear-gradient(135deg, #00f5ff, #0070ff);
    color: #000; border: none; border-radius: 10px;
    font-family: 'Orbitron', monospace;
    font-size: 13px; font-weight: 800; letter-spacing: 2px;
    cursor: pointer; transition: all 0.2s;
  }
  .ar-perm-btn:active { transform: scale(0.96); }
  .ar-hint {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; color: rgba(0,245,255,0.4);
    letter-spacing: 1px; margin-top: 8px;
  }
  .ar-err-box {
    background: rgba(255,45,85,0.1);
    border: 1px solid rgba(255,45,85,0.4);
    border-radius: 8px; padding: 12px 20px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px; color: #ff2d55;
    margin-top: 16px; max-width: 320px; line-height: 1.6;
  }

  /* Loading spinner */
  .ar-spinner {
    width: 72px; height: 72px; border-radius: 50%;
    border: 3px solid rgba(0,245,255,0.15);
    border-top-color: #00f5ff;
    animation: spin 0.9s linear infinite;
    margin-bottom: 24px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Copy button */
  .ar-copy-btn {
    width: 100%; margin-top: 10px; padding: 9px;
    background: rgba(0,255,136,0.08);
    border: 1px solid rgba(0,255,136,0.3);
    border-radius: 8px; color: #00ff88;
    font-family: 'Orbitron', monospace;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    cursor: pointer;
  }
`;

const MODES = [
  { id: 'measure', label: 'MEASURE', icon: '↔' },
  { id: 'area',    label: 'AREA',    icon: '▭' },
  { id: 'detect',  label: 'DETECT',  icon: '◈' },
  { id: 'height',  label: 'HEIGHT',  icon: '↕' },
];

// px → meters using perspective projection
// refDist = estimated real-world distance to subject (meters)
function pxToM(px, refDist = 1.5, fovPx = 800) {
  return (px / fovPx) * refDist;
}

function estimateFaceDist(faceWidthPx) {
  // avg face width 15 cm, calibrated at ~800px reference width at 1m
  return faceWidthPx > 0 ? (0.15 * 800) / faceWidthPx : null;
}

export default function ARCamera({ onBack }) {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const blazeRef   = useRef(null);
  const cocoRef    = useRef(null);
  const aiReady    = useRef(false);

  const [phase,       setPhase]       = useState('permission');
  const [aiStatus,    setAiStatus]    = useState('');
  const [mode,        setMode]        = useState('measure');
  const [points,      setPoints]      = useState([]);
  const [measurements,setMeasurements]= useState([]);
  const [detections,  setDetections]  = useState([]);
  const [faceDist,    setFaceDist]    = useState(null);
  const [toast,       setToast]       = useState('');
  const [showResults, setShowResults] = useState(false);
  const [facing,      setFacing]      = useState('environment');
  const [vidSize,     setVidSize]     = useState({ w: 0, h: 0 });

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }, []);

  // ── load scripts ───────────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function loadAI() {
    try {
      setAiStatus('LOADING TF.JS...');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js');
      setAiStatus('LOADING MODELS...');
      await Promise.all([
        loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js'),
      ]);
      setAiStatus('WARMING UP...');
      await window.tf?.ready?.();
      setAiStatus('LOADING BLAZEFACE...');
      blazeRef.current = await window.blazeface?.load?.();
      setAiStatus('LOADING COCO-SSD...');
      cocoRef.current  = await window.cocoSsd?.load?.();
      aiReady.current  = true;
      setAiStatus('AI READY ✓');
      setTimeout(() => setAiStatus(''), 1800);
    } catch (e) {
      console.warn('AI load failed:', e);
      aiReady.current = true;
      setAiStatus('BASIC MODE');
      setTimeout(() => setAiStatus(''), 2000);
    }
  }

  // ── start camera ───────────────────────────────────────────────────────────
  const startCamera = useCallback(async (facingModeOverride) => {
    setPhase('loading');
    setAiStatus('REQUESTING CAMERA...');
    try {
      // stop existing stream
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const fm = facingModeOverride ?? facing;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: fm },
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      // Directly assign srcObject — most reliable method
      video.srcObject = stream;

      // Wait for metadata then play
      await new Promise((res, rej) => {
        video.onloadedmetadata = () => res();
        video.onerror = rej;
        setTimeout(rej, 8000); // 8s timeout
      });

      video.play().catch(console.warn);

      // Record natural video dimensions
      setVidSize({ w: video.videoWidth, h: video.videoHeight });

      setPhase('ready');
      flash('📷 CAMERA ACTIVE — TAP TO PLACE POINTS');

      // Load AI in background
      loadAI();
      startLoop();
    } catch (err) {
      console.error('Camera error:', err);
      setPhase('error');
    }
  }, [facing]);

  // ── detection loop ─────────────────────────────────────────────────────────
  function startLoop() {
    let lastAI = 0;
    const AI_INTERVAL = 400;

    async function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (!aiReady.current) return;
      if (ts - lastAI < AI_INTERVAL) return;
      lastAI = ts;

      // Face → distance estimation
      try {
        if (blazeRef.current) {
          const faces = await blazeRef.current.estimateFaces(video, false);
          if (faces.length > 0) {
            const f = faces[0];
            const fw = (f.bottomRight[0] - f.topLeft[0]);
            const dist = estimateFaceDist(fw);
            setFaceDist(dist);
          } else {
            setFaceDist(null);
          }
        }
      } catch (_) {}

      // Object detection
      try {
        if (cocoRef.current) {
          const preds = await cocoRef.current.detect(video);
          const vRect = video.getBoundingClientRect();
          const sx = vRect.width  / (video.videoWidth  || 1);
          const sy = vRect.height / (video.videoHeight || 1);
          setDetections(preds.map(p => ({
            label: p.class,
            score: p.score,
            x: p.bbox[0] * sx,
            y: p.bbox[1] * sy,
            w: p.bbox[2] * sx,
            h: p.bbox[3] * sy,
          })));
        }
      } catch (_) {}
    }
    rafRef.current = requestAnimationFrame(loop);
  }

  // ── cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── tap handler ────────────────────────────────────────────────────────────
  const handleTap = useCallback((e) => {
    if (phase !== 'ready') return;
    e.preventDefault();

    const video = videoRef.current;
    if (!video) return;
    const rect = video.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x  = cx - rect.left;
    const y  = cy - rect.top;
    const xp = (x / rect.width)  * 100;
    const yp = (y / rect.height) * 100;

    const refDist = faceDist ?? 1.5;
    const fovPx   = rect.width * 0.65; // approx horizontal FOV in px

    if (mode === 'measure' || mode === 'height') {
      setPoints(prev => {
        const pts = [...prev, { x: xp, y: yp, px: x, py: y }];
        if (pts.length === 2) {
          const dx = pts[1].px - pts[0].px;
          const dy = pts[1].py - pts[0].py;
          const pxDist = mode === 'height' ? Math.abs(dy) : Math.sqrt(dx*dx + dy*dy);
          const m   = pxToM(pxDist, refDist, fovPx);
          const ft  = (m * 3.28084).toFixed(2);
          const cm  = (m * 100).toFixed(1);
          const ins = (m * 39.3701).toFixed(1);
          const mid = { x: (pts[0].x+pts[1].x)/2, y: (pts[0].y+pts[1].y)/2 };
          setMeasurements(ms => [...ms, {
            id: Date.now(), pts,
            mid, m: m.toFixed(2), ft, cm, ins,
            label: `${m.toFixed(2)}m / ${ft}ft`,
            vertical: mode === 'height',
          }]);
          flash(`📐 ${m.toFixed(2)} m  ·  ${ft} ft  ·  ${ins}"`);
          return [];
        }
        return pts;
      });
    } else if (mode === 'area') {
      setPoints(prev => {
        const pts = [...prev, { x: xp, y: yp, px: x, py: y }];
        if (pts.length < 4) {
          flash(`TAP ${4 - pts.length} MORE CORNER${4-pts.length!==1?'S':''}`);
          return pts;
        }
        // bounding box of 4 points
        const xs = pts.map(p=>p.px), ys = pts.map(p=>p.py);
        const W = Math.max(...xs) - Math.min(...xs);
        const H = Math.max(...ys) - Math.min(...ys);
        const mW = pxToM(W, refDist, fovPx);
        const mH = pxToM(H, refDist, fovPx);
        const area = mW * mH;
        const sqft = (area * 10.7639).toFixed(1);
        const mid  = {
          x: pts.reduce((s,p)=>s+p.x,0)/4,
          y: pts.reduce((s,p)=>s+p.y,0)/4,
        };
        setMeasurements(ms => [...ms, {
          id: Date.now(), pts,
          mid, area: area.toFixed(2), sqft,
          mW: mW.toFixed(2), mH: mH.toFixed(2),
          label: `${area.toFixed(2)} m²`,
          isArea: true,
        }]);
        flash(`▭ AREA: ${area.toFixed(2)} m²  ·  ${sqft} sqft`);
        return [];
      });
    }
  }, [phase, mode, faceDist, flash]);

  const clearAll = () => { setPoints([]); setMeasurements([]); flash('CLEARED'); };

  const flipCamera = async () => {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    setPoints([]);
    setDetections([]);
    await startCamera(next);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="ar-root">

        {/* ── Always-present video element ── */}
        <video
          ref={videoRef}
          className="ar-video"
          playsInline
          muted
          autoPlay
        />

        {/* ── Permission screen ── */}
        {phase === 'permission' && (
          <div className="ar-perm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div className="ar-perm-icon">📷</div>
              <div className="ar-perm-title">ENABLE CAMERA</div>
              <div className="ar-perm-desc">
                SmartMeasure AI needs camera access to perform live AR measurements.
                Works best in Chrome or Safari on your phone.
              </div>
              <button className="ar-perm-btn" onClick={() => startCamera()}>
                START AR SCANNER
              </button>
              <div className="ar-hint" style={{ marginTop: 16 }}>✓ HTTPS · ✓ No data stored · ✓ On-device AI</div>
              <button
                onClick={onBack}
                style={{
                  marginTop: 20, padding: '9px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(0,245,255,0.2)',
                  borderRadius: 8, color: 'rgba(0,245,255,0.5)',
                  fontFamily: 'Orbitron', fontSize: 10, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                ← BACK
              </button>
            </motion.div>
          </div>
        )}

        {/* ── Error screen ── */}
        {phase === 'error' && (
          <div className="ar-perm">
            <div className="ar-perm-icon" style={{ fontSize: 40 }}>⚠️</div>
            <div className="ar-perm-title" style={{ color: '#ff2d55' }}>CAMERA ERROR</div>
            <div className="ar-err-box">
              Camera access was denied or unavailable.<br /><br />
              • Allow camera in browser settings<br />
              • Use HTTPS (Vercel ✓)<br />
              • Try Chrome or Safari<br />
              • Check no other app is using camera
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="ar-perm-btn" onClick={() => startCamera()}>RETRY</button>
              <button
                onClick={onBack}
                style={{
                  padding: '15px 28px',
                  background: 'transparent',
                  border: '1px solid rgba(255,45,85,0.4)',
                  borderRadius: 10, color: '#ff2d55',
                  fontFamily: 'Orbitron', fontSize: 11,
                  fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {/* ── Loading screen ── */}
        {phase === 'loading' && (
          <div className="ar-perm">
            <div className="ar-spinner" />
            <div style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#00f5ff', letterSpacing: 2, marginBottom: 8 }}>
              {aiStatus || 'INITIALIZING...'}
            </div>
            <div className="ar-hint">Please allow camera when prompted</div>
          </div>
        )}

        {/* ── AR active UI ── */}
        {phase === 'ready' && (
          <>
            {/* Tap layer — sits above video, below HUD */}
            <div
              className="ar-tap-layer"
              onClick={handleTap}
              onTouchStart={handleTap}
            />

            {/* Grid + scan line + corners */}
            <div className="ar-ui-layer">
              <div className="ar-grid" />
              <div className="ar-scanline" />
              <div className="ar-corners">
                <div className="ar-corner ar-corner-tl" />
                <div className="ar-corner ar-corner-tr" />
                <div className="ar-corner ar-corner-bl" />
                <div className="ar-corner ar-corner-br" />
              </div>

              {/* Crosshair — only when no points placed */}
              {points.length === 0 && mode !== 'detect' && (
                <div className="ar-crosshair">
                  <div className="ar-ch-h" />
                  <div className="ar-ch-v" />
                  <div className="ar-ch-ring" />
                  <div className="ar-ch-dot" />
                </div>
              )}
            </div>

            {/* Placed points */}
            {points.map((pt, i) => (
              <div key={i} className="ar-point"
                style={{ left: `${pt.x}%`, top: `${pt.y}%`, zIndex: 25, position: 'absolute' }} />
            ))}

            {/* Measurement lines */}
            {measurements.map(m => (
              <div key={m.id} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 24 }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  {!m.isArea && m.pts.length >= 2 && (
                    <line
                      x1={`${m.pts[0].x}%`} y1={`${m.pts[0].y}%`}
                      x2={`${m.pts[1].x}%`} y2={`${m.pts[1].y}%`}
                      stroke="#00f5ff" strokeWidth="2"
                      strokeDasharray="6,4" opacity="0.9"
                    />
                  )}
                  {m.isArea && (
                    <polygon
                      points={m.pts.map(p=>`${p.x}%,${p.y}%`).join(' ')}
                      fill="rgba(0,245,255,0.07)"
                      stroke="#00f5ff" strokeWidth="1.5" strokeDasharray="6,4"
                    />
                  )}
                  {m.pts.slice(0,2).map((p,i)=>(
                    <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="5"
                      fill="#00f5ff" opacity="0.85" />
                  ))}
                </svg>
                <div className="ar-meas-label"
                  style={{ left: `${m.mid.x}%`, top: `${m.mid.y}%` }}>
                  {m.label}
                </div>
              </div>
            ))}

            {/* Object detections */}
            {mode === 'detect' && detections.map((d, i) => (
              <div key={i} className="ar-det-box"
                style={{ left: d.x, top: d.y, width: d.w, height: d.h }}>
                <div className="ar-det-tag">
                  {d.label} {Math.round(d.score * 100)}%
                </div>
              </div>
            ))}

            {/* ── HUD TOP ── */}
            <div className="ar-hud-top">
              <button className="ar-icon-btn" onClick={onBack}>← BACK</button>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {aiStatus && (
                  <div className="ar-badge" style={{ color: '#00ff88', borderColor: 'rgba(0,255,136,0.35)' }}>
                    ● {aiStatus}
                  </div>
                )}
                {faceDist && (
                  <div className="ar-badge" style={{ color: '#ffbd2e', borderColor: 'rgba(255,189,0,0.3)' }}>
                    ~{faceDist.toFixed(1)}m
                  </div>
                )}
                <div className="ar-badge" style={{ color: '#00ff88' }}>● LIVE</div>
              </div>

              <button
                onClick={flipCamera}
                style={{
                  background: 'rgba(0,2,10,0.75)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  borderRadius: 20, padding: '7px 12px',
                  fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(8px)',
                }}
              >🔄</button>
            </div>

            {/* ── HUD BOTTOM ── */}
            <div className="ar-hud-bottom">
              {/* Mode buttons */}
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                {MODES.map(m => (
                  <button key={m.id}
                    className={`ar-mode-btn ${mode === m.id ? 'active' : ''}`}
                    onClick={() => { setMode(m.id); setPoints([]); }}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              {/* Instruction */}
              <div style={{
                textAlign: 'center', marginBottom: 10,
                fontFamily: "'Share Tech Mono'", fontSize: 11,
                color: 'rgba(0,245,255,0.55)', letterSpacing: 1,
              }}>
                {mode === 'measure' && (points.length === 0 ? 'TAP FIRST POINT ON SCREEN' : 'TAP SECOND POINT')}
                {mode === 'height'  && (points.length === 0 ? 'TAP TOP POINT' : 'TAP BOTTOM POINT')}
                {mode === 'area'    && `TAP ${Math.max(0, 4 - points.length)} MORE CORNER${4-points.length!==1?'S':''}`}
                {mode === 'detect'  && 'AI DETECTING OBJECTS IN REAL-TIME'}
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={clearAll}
                  style={{
                    padding: '9px 16px',
                    background: 'rgba(255,45,85,0.1)',
                    border: '1px solid rgba(255,45,85,0.3)',
                    borderRadius: 20, color: '#ff2d55',
                    fontFamily: 'Orbitron', fontSize: 9,
                    fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >✕ CLEAR</button>

                <div className="ar-shutter"
                  onClick={() => flash('TAP DIRECTLY ON THE CAMERA VIEW TO PLACE POINTS')}>
                  <div className="ar-shutter-inner" />
                </div>

                <button
                  onClick={() => setShowResults(r => !r)}
                  style={{
                    padding: '9px 16px',
                    background: measurements.length > 0 ? 'rgba(0,245,255,0.1)' : 'rgba(0,2,10,0.7)',
                    border: `1px solid ${measurements.length > 0 ? 'rgba(0,245,255,0.5)' : 'rgba(0,245,255,0.2)'}`,
                    borderRadius: 20,
                    color: measurements.length > 0 ? '#00f5ff' : 'rgba(0,245,255,0.35)',
                    fontFamily: 'Orbitron', fontSize: 9,
                    fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  📊 {measurements.length}
                </button>
              </div>

              {/* Results panel */}
              <AnimatePresence>
                {showResults && measurements.length > 0 && (
                  <motion.div
                    className="ar-results-panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                  >
                    <div style={{
                      fontFamily: "'Share Tech Mono'", fontSize: 10,
                      color: 'rgba(0,245,255,0.45)', letterSpacing: 2, marginBottom: 10,
                    }}>
                      MEASUREMENTS ({measurements.length})
                    </div>
                    {measurements.map((m, i) => (
                      <div key={m.id} style={{
                        padding: '7px 0',
                        borderBottom: i < measurements.length-1 ? '1px solid rgba(0,245,255,0.07)' : 'none',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(0,245,255,0.45)' }}>
                            #{i+1} {m.isArea ? 'AREA' : m.vertical ? 'HEIGHT' : 'DIST'}
                          </span>
                          <span style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 800, color: '#00f5ff' }}>
                            {m.isArea ? `${m.area} m²` : `${m.m} m`}
                          </span>
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(0,245,255,0.38)', marginTop: 2 }}>
                          {m.isArea ? `${m.sqft} sqft · ${m.mW}×${m.mH} m` : `${m.cm} cm · ${m.ft} ft · ${m.ins}"`}
                        </div>
                      </div>
                    ))}
                    <button className="ar-copy-btn" onClick={() => {
                      const txt = measurements.map((m,i)=>
                        `#${i+1}: ${m.isArea ? m.area+'m² ('+m.sqft+'sqft)' : m.m+'m / '+m.ft+'ft / '+m.ins+'"'}`
                      ).join('\n');
                      navigator.clipboard?.writeText(txt).then(() => flash('✓ COPIED'));
                    }}>
                      COPY ALL
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div className="ar-toast"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  );
}
