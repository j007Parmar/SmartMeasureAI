import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

  .ar-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .ar-root {
    position: fixed; inset: 0;
    background: #000;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
    touch-action: none;
    user-select: none;
  }

  .ar-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
  }

  .ar-canvas {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    transform: scaleX(-1);
  }

  .ar-overlay {
    position: absolute; inset: 0;
    pointer-events: none;
  }

  /* Scan grid */
  .ar-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,245,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,245,255,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: gridPulse 3s ease-in-out infinite;
  }
  @keyframes gridPulse {
    0%,100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  /* Scan line */
  .ar-scanline {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.8) 20%, #00f5ff 50%, rgba(0,245,255,0.8) 80%, transparent 100%);
    box-shadow: 0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.4);
    animation: scanMove 2.5s ease-in-out infinite;
  }
  @keyframes scanMove {
    0% { top: 0%; opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  /* Corner brackets */
  .ar-corner {
    position: absolute;
    width: 24px; height: 24px;
  }
  .ar-corner-tl { top: 60px; left: 16px; border-top: 2px solid #00f5ff; border-left: 2px solid #00f5ff; }
  .ar-corner-tr { top: 60px; right: 16px; border-top: 2px solid #00f5ff; border-right: 2px solid #00f5ff; }
  .ar-corner-bl { bottom: 100px; left: 16px; border-bottom: 2px solid #00f5ff; border-left: 2px solid #00f5ff; }
  .ar-corner-br { bottom: 100px; right: 16px; border-bottom: 2px solid #00f5ff; border-right: 2px solid #00f5ff; }

  /* Crosshair */
  .ar-crosshair {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60px; height: 60px;
    animation: crossPulse 2s ease-in-out infinite;
  }
  @keyframes crossPulse {
    0%,100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
    50% { opacity: 0.6; transform: translate(-50%,-50%) scale(0.9); }
  }
  .ar-crosshair::before, .ar-crosshair::after {
    content: '';
    position: absolute;
    background: rgba(0,245,255,0.8);
  }
  .ar-crosshair::before { top: 50%; left: 0; right: 0; height: 1px; transform: translateY(-50%); }
  .ar-crosshair::after { left: 50%; top: 0; bottom: 0; width: 1px; transform: translateX(-50%); }
  .ar-crosshair-ring {
    position: absolute; inset: 0;
    border: 1px solid rgba(0,245,255,0.4);
    border-radius: 50%;
  }
  .ar-crosshair-dot {
    position: absolute; top: 50%; left: 50%;
    width: 6px; height: 6px;
    background: #00f5ff;
    border-radius: 50%;
    transform: translate(-50%,-50%);
    box-shadow: 0 0 8px #00f5ff;
  }

  /* HUD top bar */
  .ar-hud-top {
    position: absolute; top: 0; left: 0; right: 0;
    padding: 12px 16px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
    display: flex; align-items: center; justify-content: space-between;
    pointer-events: all;
  }

  /* HUD bottom */
  .ar-hud-bottom {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 16px;
    background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
    pointer-events: all;
  }

  /* Measurement badge */
  .ar-badge {
    background: rgba(0,4,12,0.85);
    border: 1px solid rgba(0,245,255,0.4);
    border-radius: 8px;
    padding: 6px 12px;
    backdrop-filter: blur(10px);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: #00f5ff;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  /* Point marker */
  .ar-point {
    position: absolute;
    width: 16px; height: 16px;
    border: 2px solid #00f5ff;
    border-radius: 50%;
    background: rgba(0,245,255,0.2);
    transform: translate(-50%,-50%);
    box-shadow: 0 0 12px #00f5ff;
    animation: pointPulse 1.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes pointPulse {
    0%,100% { box-shadow: 0 0 8px #00f5ff; }
    50% { box-shadow: 0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.4); }
  }

  /* Measurement line label */
  .ar-label {
    position: absolute;
    background: rgba(0,4,12,0.9);
    border: 1px solid rgba(0,245,255,0.5);
    border-radius: 6px;
    padding: 4px 10px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #00f5ff;
    pointer-events: none;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    text-shadow: 0 0 8px rgba(0,245,255,0.6);
    backdrop-filter: blur(8px);
  }

  /* Mode buttons */
  .ar-mode-btn {
    padding: 8px 14px;
    border-radius: 20px;
    border: 1px solid rgba(0,245,255,0.3);
    background: rgba(0,4,12,0.7);
    color: rgba(0,245,255,0.7);
    font-family: 'Orbitron', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(8px);
  }
  .ar-mode-btn.active {
    background: rgba(0,245,255,0.15);
    border-color: #00f5ff;
    color: #00f5ff;
    box-shadow: 0 0 12px rgba(0,245,255,0.3);
  }

  /* Action button */
  .ar-action-btn {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 3px solid #00f5ff;
    background: rgba(0,245,255,0.1);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
    transition: all 0.2s;
    box-shadow: 0 0 20px rgba(0,245,255,0.3);
    backdrop-filter: blur(8px);
  }
  .ar-action-btn:active {
    transform: scale(0.92);
    background: rgba(0,245,255,0.25);
  }

  /* Results panel */
  .ar-results {
    background: rgba(0,4,16,0.92);
    border: 1px solid rgba(0,245,255,0.3);
    border-radius: 12px;
    padding: 14px;
    backdrop-filter: blur(16px);
    max-height: 50vh;
    overflow-y: auto;
  }

  /* Permission screen */
  .ar-permission {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(160deg, #020810, #040d20);
    padding: 32px;
    text-align: center;
  }

  .ar-permission-icon {
    width: 100px; height: 100px;
    border-radius: 50%;
    border: 2px solid rgba(0,245,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px;
    margin-bottom: 24px;
    background: rgba(0,245,255,0.05);
    animation: iconGlow 2s ease-in-out infinite;
  }
  @keyframes iconGlow {
    0%,100% { box-shadow: 0 0 20px rgba(0,245,255,0.2); }
    50% { box-shadow: 0 0 40px rgba(0,245,255,0.4); }
  }

  .ar-perm-title {
    font-family: 'Orbitron', monospace;
    font-size: 20px;
    font-weight: 800;
    color: #00f5ff;
    letter-spacing: 2px;
    margin-bottom: 12px;
  }
  .ar-perm-desc {
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    color: rgba(126,184,212,0.8);
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 300px;
  }
  .ar-perm-btn {
    padding: 16px 40px;
    background: linear-gradient(135deg, #00f5ff, #0080ff);
    color: #000;
    border: none;
    border-radius: 10px;
    font-family: 'Orbitron', monospace;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ar-perm-btn:hover { transform: scale(1.03); box-shadow: 0 0 30px rgba(0,245,255,0.4); }

  .ar-error {
    background: rgba(255,45,85,0.1);
    border: 1px solid rgba(255,45,85,0.4);
    border-radius: 8px;
    padding: 12px 20px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: #ff2d55;
    margin-top: 16px;
    max-width: 320px;
  }

  /* Object detection box */
  .ar-detect-box {
    position: absolute;
    border: 1.5px solid;
    border-radius: 4px;
    pointer-events: none;
    transition: all 0.1s;
  }
  .ar-detect-label {
    position: absolute;
    top: -20px; left: 0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }

  /* Pose keypoint */
  .ar-keypoint {
    position: absolute;
    width: 8px; height: 8px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* Depth indicator */
  .ar-depth-bar {
    height: 4px;
    border-radius: 2px;
    background: rgba(0,245,255,0.15);
    margin-top: 6px;
    overflow: hidden;
  }
  .ar-depth-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #0080ff, #00f5ff);
    transition: width 0.3s;
  }

  /* Back button */
  .ar-back-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(0,4,12,0.7);
    border: 1px solid rgba(0,245,255,0.3);
    border-radius: 20px;
    padding: 8px 14px;
    color: #00f5ff;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
  }
  .ar-back-btn:active { transform: scale(0.95); }

  /* Toast notification */
  .ar-toast {
    position: absolute;
    top: 80px; left: 50%;
    transform: translateX(-50%);
    background: rgba(0,255,136,0.15);
    border: 1px solid rgba(0,255,136,0.4);
    border-radius: 20px;
    padding: 8px 20px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: #00ff88;
    white-space: nowrap;
    pointer-events: none;
    z-index: 100;
  }

  /* Ruler overlay */
  .ar-ruler-container {
    position: absolute;
    pointer-events: none;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ar-measurement-item {
    animation: fadeInUp 0.3s ease forwards;
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MODES = [
  { id: 'measure', label: 'MEASURE', icon: '↔' },
  { id: 'area', label: 'AREA', icon: '▭' },
  { id: 'detect', label: 'DETECT', icon: '◈' },
  { id: 'height', label: 'HEIGHT', icon: '↕' },
];

// Real-world pixel-to-meter calibration
// Assumes avg phone camera focal length ~26mm equivalent, object ~1m away
const PIXELS_PER_METER_BASE = 800;

function estimateDistance(faceSize) {
  // Rough estimate: average face width ~15cm
  if (faceSize > 0) return (0.15 * PIXELS_PER_METER_BASE) / faceSize;
  return null;
}

function pxToMeters(pixels, distanceM = 1.0) {
  // As distance increases, apparent size decreases proportionally
  return (pixels / PIXELS_PER_METER_BASE) * distanceM;
}

export default function ARCamera({ onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const detectorRef = useRef(null);
  const handDetectorRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const tfLoadedRef = useRef(false);

  const [phase, setPhase] = useState('permission'); // permission | loading | ready | error
  const [mode, setMode] = useState('measure');
  const [points, setPoints] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [detections, setDetections] = useState([]);
  const [toast, setToast] = useState('');
  const [aiStatus, setAiStatus] = useState('LOADING AI...');
  const [faceDetected, setFaceDetected] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [videoSize, setVideoSize] = useState({ w: 1, h: 1 });
  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  // ── Load TensorFlow + Models ───────────────────────────────────────────────
  const loadAI = useCallback(async () => {
    if (tfLoadedRef.current) return;
    try {
      setAiStatus('LOADING TENSORFLOW...');

      // Dynamically load TF.js from CDN
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.1.0/dist/blazeface.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');

      setAiStatus('WARMING UP GPU...');
      await window.tf.ready();

      setAiStatus('LOADING FACE MODEL...');
      detectorRef.current = await window.blazeface.load();

      setAiStatus('LOADING OBJECT MODEL...');
      handDetectorRef.current = await window.cocoSsd.load();

      tfLoadedRef.current = true;
      setAiStatus('AI READY ✓');
      setTimeout(() => setAiStatus(''), 1500);
    } catch (err) {
      console.warn('AI model load error:', err);
      setAiStatus('BASIC MODE');
      tfLoadedRef.current = true; // continue without models
    }
  }, []);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ── Start Camera ───────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setPhase('loading');
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        setVideoSize({ w: settings.width || 1280, h: settings.height || 720 });
      }

      await loadAI();
      setPhase('ready');
      showToast('📷 CAMERA ACTIVE — TAP TO PLACE POINTS');
      startDetectionLoop();
    } catch (err) {
      console.error(err);
      setPhase('error');
    }
  }, [facingMode, loadAI, showToast]);

  // ── Detection Loop ─────────────────────────────────────────────────────────
  const startDetectionLoop = useCallback(() => {
    let lastRun = 0;
    const INTERVAL = 300; // ms between AI runs

    const loop = async (ts) => {
      animFrameRef.current = requestAnimationFrame(loop);

      if (!videoRef.current || videoRef.current.readyState < 2) return;
      if (ts - lastRun < INTERVAL) return;
      lastRun = ts;

      const video = videoRef.current;

      // Face detection for distance estimation
      if (detectorRef.current) {
        try {
          const faces = await detectorRef.current.estimateFaces(video, false);
          if (faces.length > 0) {
            const f = faces[0];
            const size = f.bottomRight[0] - f.topLeft[0];
            const dist = estimateDistance(size);
            setFaceDetected({ size, dist, box: f });
          } else {
            setFaceDetected(null);
          }
        } catch (_) {}
      }

      // Object detection
      if (handDetectorRef.current && mode === 'detect') {
        try {
          const predictions = await handDetectorRef.current.detect(video);
          const vw = video.getBoundingClientRect().width || video.videoWidth;
          const vh = video.getBoundingClientRect().height || video.videoHeight;
          const scaleX = vw / video.videoWidth;
          const scaleY = vh / video.videoHeight;

          setDetections(predictions.map(p => ({
            label: p.class,
            score: p.score,
            // Mirror X because video is mirrored
            x: vw - (p.bbox[0] + p.bbox[2]) * scaleX,
            y: p.bbox[1] * scaleY,
            w: p.bbox[2] * scaleX,
            h: p.bbox[3] * scaleY,
          })));
        } catch (_) {}
      } else {
        setDetections([]);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [mode]);

  // ── Handle tap/click on video to place measurement points ─────────────────
  const handleVideoTap = useCallback((e) => {
    if (phase !== 'ready') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    if (mode === 'measure') {
      setPoints(prev => {
        const newPts = [...prev, { x: xPct, y: yPct, px: x, py: y }];
        if (newPts.length === 2) {
          // Calculate distance
          const dx = newPts[1].px - newPts[0].px;
          const dy = newPts[1].py - newPts[0].py;
          const pixelDist = Math.sqrt(dx * dx + dy * dy);
          const refDist = faceDetected?.dist || 1.5;
          const meters = pxToMeters(pixelDist, refDist);
          const cm = (meters * 100).toFixed(1);
          const ft = (meters * 3.28084).toFixed(2);
          const inches = (meters * 39.3701).toFixed(1);

          const midX = (newPts[0].x + newPts[1].x) / 2;
          const midY = (newPts[0].y + newPts[1].y) / 2;

          setMeasurements(m => [...m, {
            id: Date.now(),
            points: newPts,
            midX, midY,
            meters: meters.toFixed(2),
            cm, ft, inches,
            label: `${meters.toFixed(2)}m / ${ft}ft`,
          }]);
          showToast(`📐 ${meters.toFixed(2)}m · ${ft}ft · ${inches}"`);
          return [];
        }
        return newPts;
      });
    } else if (mode === 'height') {
      setPoints(prev => {
        const newPts = [...prev, { x: xPct, y: yPct, px: x, py: y }];
        if (newPts.length === 2) {
          const dy = Math.abs(newPts[1].py - newPts[0].py);
          const refDist = faceDetected?.dist || 1.5;
          const meters = pxToMeters(dy, refDist);
          const ft = (meters * 3.28084).toFixed(2);
          const midX = (newPts[0].x + newPts[1].x) / 2;
          const midY = (newPts[0].y + newPts[1].y) / 2;
          setMeasurements(m => [...m, {
            id: Date.now(),
            points: newPts,
            midX, midY,
            meters: meters.toFixed(2),
            cm: (meters * 100).toFixed(1),
            ft,
            inches: (meters * 39.3701).toFixed(1),
            label: `↕ ${meters.toFixed(2)}m`,
            vertical: true,
          }]);
          showToast(`↕ HEIGHT: ${meters.toFixed(2)}m · ${ft}ft`);
          return [];
        }
        return newPts;
      });
    } else if (mode === 'area') {
      setPoints(prev => {
        const newPts = [...prev, { x: xPct, y: yPct, px: x, py: y }];
        if (newPts.length === 4) {
          const rect_w = Math.abs(newPts[1].px - newPts[0].px);
          const rect_h = Math.abs(newPts[2].py - newPts[0].py);
          const refDist = faceDetected?.dist || 1.5;
          const mW = pxToMeters(rect_w, refDist);
          const mH = pxToMeters(rect_h, refDist);
          const area = mW * mH;
          const midX = newPts.reduce((s,p)=>s+p.x,0)/4;
          const midY = newPts.reduce((s,p)=>s+p.y,0)/4;
          setMeasurements(m => [...m, {
            id: Date.now(),
            points: newPts,
            midX, midY,
            meters: `${mW.toFixed(2)}×${mH.toFixed(2)}`,
            area: area.toFixed(2),
            ft: (area * 10.7639).toFixed(1),
            label: `${area.toFixed(2)} m²`,
            isArea: true,
          }]);
          showToast(`▭ AREA: ${area.toFixed(2)} m² · ${(area*10.7639).toFixed(1)} sqft`);
          return [];
        }
        if (newPts.length === 1) showToast('TAP 3 MORE CORNERS');
        if (newPts.length === 2) showToast('TAP 2 MORE CORNERS');
        if (newPts.length === 3) showToast('TAP LAST CORNER');
        return newPts;
      });
    }
  }, [phase, mode, faceDetected, showToast]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const clearAll = () => {
    setPoints([]);
    setMeasurements([]);
    showToast('CLEARED');
  };

  const flipCamera = async () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setFacingMode(f => f === 'environment' ? 'user' : 'environment');
    setPhase('loading');
    setPoints([]);
    setTimeout(() => startCamera(), 100);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="ar-root">

        {/* ── Permission Screen ── */}
        {phase === 'permission' && (
          <div className="ar-permission">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="ar-permission-icon">📷</div>
              <div className="ar-perm-title">CAMERA ACCESS</div>
              <div className="ar-perm-desc">
                SmartMeasure AI needs camera access to perform real-time AR measurements using your device camera and AI models.
              </div>
              <button className="ar-perm-btn" onClick={startCamera}>
                ENABLE CAMERA
              </button>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'rgba(0,245,255,0.5)', letterSpacing: 1 }}>
                  ✓ Works on Chrome, Safari, Firefox
                </div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'rgba(0,245,255,0.5)', letterSpacing: 1 }}>
                  ✓ No data leaves your device
                </div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'rgba(0,245,255,0.5)', letterSpacing: 1 }}>
                  ✓ Requires HTTPS (Vercel ✓)
                </div>
              </div>
              <motion.button
                style={{
                  marginTop: 20, padding: '10px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(0,245,255,0.2)',
                  borderRadius: 8, color: 'rgba(0,245,255,0.5)',
                  fontFamily: "'Orbitron'", fontSize: 10, letterSpacing: 2,
                  cursor: 'pointer',
                }}
                onClick={onBack}
              >
                ← BACK
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* ── Error Screen ── */}
        {phase === 'error' && (
          <div className="ar-permission">
            <div className="ar-permission-icon">⚠️</div>
            <div className="ar-perm-title" style={{ color: '#ff2d55' }}>CAMERA ERROR</div>
            <div className="ar-error">
              Camera access was denied or not available.<br /><br />
              Please allow camera access in your browser settings and try again. Make sure you're on HTTPS.
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="ar-perm-btn" onClick={startCamera}>RETRY</button>
              <button
                onClick={onBack}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  border: '1px solid rgba(255,45,85,0.4)',
                  borderRadius: 10, color: '#ff2d55',
                  fontFamily: "'Orbitron'", fontSize: 11,
                  fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                BACK
              </button>
            </div>
          </div>
        )}

        {/* ── Loading Screen ── */}
        {phase === 'loading' && (
          <div className="ar-permission">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid rgba(0,245,255,0.2)',
                borderTop: '3px solid #00f5ff',
                marginBottom: 24,
              }}
            />
            <div style={{ fontFamily: "'Orbitron'", fontSize: 14, color: '#00f5ff', letterSpacing: 2, marginBottom: 8 }}>
              {aiStatus || 'INITIALIZING...'}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'rgba(0,245,255,0.4)', letterSpacing: 1 }}>
              Loading AI models from CDN...
            </div>
          </div>
        )}

        {/* ── AR Camera View ── */}
        {phase === 'ready' && (
          <>
            {/* Live video */}
            <video
              ref={videoRef}
              className="ar-video"
              playsInline
              muted
              autoPlay
            />

            {/* Canvas for drawing (hidden, used for processing) */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Tap overlay */}
            <div
              className="ar-overlay"
              style={{ pointerEvents: 'all', cursor: 'crosshair' }}
              onClick={handleVideoTap}
              onTouchStart={handleVideoTap}
            >
              {/* Grid */}
              <div className="ar-grid" style={{ pointerEvents: 'none' }} />

              {/* Scan line */}
              <div className="ar-scanline" style={{ pointerEvents: 'none' }} />

              {/* Corner brackets */}
              <div className="ar-corner ar-corner-tl" />
              <div className="ar-corner ar-corner-tr" />
              <div className="ar-corner ar-corner-bl" />
              <div className="ar-corner ar-corner-br" />

              {/* Crosshair */}
              {points.length === 0 && (
                <div className="ar-crosshair">
                  <div className="ar-crosshair-ring" />
                  <div className="ar-crosshair-dot" />
                </div>
              )}

              {/* Placed points */}
              {points.map((pt, i) => (
                <div
                  key={i}
                  className="ar-point"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                />
              ))}

              {/* Measurement lines & labels */}
              {measurements.map((m) => (
                <div key={m.id} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    {m.points.length >= 2 && (
                      <line
                        x1={`${m.points[0].x}%`} y1={`${m.points[0].y}%`}
                        x2={`${m.points[1].x}%`} y2={`${m.points[1].y}%`}
                        stroke="#00f5ff" strokeWidth="2" strokeDasharray="6,4"
                        opacity="0.9"
                      />
                    )}
                    {m.isArea && m.points.length === 4 && (
                      <polygon
                        points={m.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                        fill="rgba(0,245,255,0.08)"
                        stroke="#00f5ff" strokeWidth="1.5" strokeDasharray="6,4"
                      />
                    )}
                    {/* End markers */}
                    {m.points.slice(0,2).map((pt, i) => (
                      <circle key={i} cx={`${pt.x}%`} cy={`${pt.y}%`} r="5" fill="#00f5ff" opacity="0.9" />
                    ))}
                  </svg>
                  {/* Label */}
                  <div
                    className="ar-label"
                    style={{ left: `${m.midX}%`, top: `${m.midY}%` }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}

              {/* Object detections */}
              {detections.map((d, i) => (
                <div
                  key={i}
                  className="ar-detect-box"
                  style={{
                    left: d.x, top: d.y,
                    width: d.w, height: d.h,
                    borderColor: '#00ff88',
                  }}
                >
                  <div
                    className="ar-detect-label"
                    style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.4)' }}
                  >
                    {d.label} {Math.round(d.score * 100)}%
                  </div>
                </div>
              ))}

              {/* Face detection indicator */}
              {faceDetected && (
                <div style={{
                  position: 'absolute',
                  left: `${((videoRef.current?.getBoundingClientRect().width || 1) - (faceDetected.box.bottomRight[0] + faceDetected.box.topLeft[0]) / 2) /
                    (videoRef.current?.getBoundingClientRect().width || 1) * 100}%`,
                  top: `${(faceDetected.box.topLeft[1] / (videoRef.current?.videoHeight || 1)) * 100}%`,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    fontFamily: "'Share Tech Mono'", fontSize: 9,
                    color: 'rgba(255,189,0,0.8)',
                    background: 'rgba(255,189,0,0.1)',
                    border: '1px solid rgba(255,189,0,0.3)',
                    padding: '2px 6px', borderRadius: 3,
                    whiteSpace: 'nowrap',
                  }}>
                    REF DIST ≈ {faceDetected.dist?.toFixed(1)}m
                  </div>
                </div>
              )}
            </div>

            {/* ── HUD Top ── */}
            <div className="ar-hud-top">
              <button className="ar-back-btn" onClick={onBack}>
                ← BACK
              </button>

              <div style={{ display: 'flex', gap: 6 }}>
                {aiStatus && (
                  <div className="ar-badge" style={{ color: '#00ff88', borderColor: 'rgba(0,255,136,0.4)' }}>
                    ● {aiStatus}
                  </div>
                )}
                {faceDetected && (
                  <div className="ar-badge" style={{ color: '#ffbd2e', borderColor: 'rgba(255,189,0,0.3)' }}>
                    DIST ~{faceDetected.dist?.toFixed(1)}m
                  </div>
                )}
                <div className="ar-badge" style={{ color: '#00ff88' }}>● LIVE</div>
              </div>

              <button
                onClick={flipCamera}
                style={{
                  background: 'rgba(0,4,12,0.7)',
                  border: '1px solid rgba(0,245,255,0.3)',
                  borderRadius: 20, padding: '8px 12px',
                  color: '#00f5ff', fontSize: 16, cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
              >
                🔄
              </button>
            </div>

            {/* ── HUD Bottom ── */}
            <div className="ar-hud-bottom">
              {/* Mode selector */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                {MODES.map(m => (
                  <button
                    key={m.id}
                    className={`ar-mode-btn ${mode === m.id ? 'active' : ''}`}
                    onClick={() => { setMode(m.id); setPoints([]); }}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              {/* Instructions */}
              <div style={{
                textAlign: 'center', marginBottom: 12,
                fontFamily: "'Share Tech Mono'", fontSize: 11,
                color: 'rgba(0,245,255,0.6)', letterSpacing: 1,
              }}>
                {mode === 'measure' && (points.length === 0 ? 'TAP FIRST POINT' : 'TAP SECOND POINT')}
                {mode === 'height' && (points.length === 0 ? 'TAP TOP POINT' : 'TAP BOTTOM POINT')}
                {mode === 'area' && `TAP ${4 - points.length} MORE CORNER${4 - points.length !== 1 ? 'S' : ''}`}
                {mode === 'detect' && 'AI DETECTING OBJECTS IN REAL-TIME'}
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {/* Clear */}
                <button
                  onClick={clearAll}
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(255,45,85,0.1)',
                    border: '1px solid rgba(255,45,85,0.3)',
                    borderRadius: 20, color: '#ff2d55',
                    fontFamily: "'Orbitron'", fontSize: 9,
                    fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  ✕ CLEAR
                </button>

                {/* Shutter / Action */}
                <div className="ar-action-btn" onClick={() => showToast('TAP ON CAMERA TO PLACE POINTS')}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f5ff, #0080ff)',
                  }} />
                </div>

                {/* Results */}
                <button
                  onClick={() => setShowResults(r => !r)}
                  style={{
                    padding: '10px 18px',
                    background: measurements.length > 0 ? 'rgba(0,245,255,0.1)' : 'rgba(0,4,12,0.7)',
                    border: `1px solid ${measurements.length > 0 ? 'rgba(0,245,255,0.5)' : 'rgba(0,245,255,0.2)'}`,
                    borderRadius: 20,
                    color: measurements.length > 0 ? '#00f5ff' : 'rgba(0,245,255,0.4)',
                    fontFamily: "'Orbitron'", fontSize: 9,
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="ar-results"
                    style={{ marginTop: 12 }}
                  >
                    <div style={{
                      fontFamily: "'Share Tech Mono'", fontSize: 10,
                      color: 'rgba(0,245,255,0.5)', letterSpacing: 2, marginBottom: 10,
                    }}>
                      MEASUREMENTS ({measurements.length})
                    </div>
                    {measurements.map((m, i) => (
                      <div
                        key={m.id}
                        className="ar-measurement-item"
                        style={{
                          padding: '8px 0',
                          borderBottom: i < measurements.length - 1 ? '1px solid rgba(0,245,255,0.08)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 11, color: 'rgba(0,245,255,0.5)' }}>
                            #{i + 1} {m.isArea ? 'AREA' : m.vertical ? 'HEIGHT' : 'LENGTH'}
                          </div>
                          <div style={{ fontFamily: "'Orbitron'", fontSize: 14, fontWeight: 800, color: '#00f5ff' }}>
                            {m.isArea ? `${m.area} m²` : `${m.meters} m`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          {!m.isArea && (
                            <>
                              <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(0,245,255,0.4)' }}>
                                {m.cm} cm
                              </span>
                              <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(0,245,255,0.4)' }}>
                                {m.ft} ft
                              </span>
                              <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(0,245,255,0.4)' }}>
                                {m.inches}"
                              </span>
                            </>
                          )}
                          {m.isArea && (
                            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: 'rgba(0,245,255,0.4)' }}>
                              {m.ft} sqft · {m.meters} m
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Export text */}
                    <button
                      onClick={() => {
                        const text = measurements.map((m, i) =>
                          `#${i+1}: ${m.isArea ? m.area+'m²' : m.meters+'m / '+m.ft+'ft'}`
                        ).join('\n');
                        navigator.clipboard?.writeText(text).then(() => showToast('COPIED TO CLIPBOARD'));
                      }}
                      style={{
                        width: '100%', marginTop: 12, padding: '10px',
                        background: 'rgba(0,255,136,0.08)',
                        border: '1px solid rgba(0,255,136,0.3)',
                        borderRadius: 8, color: '#00ff88',
                        fontFamily: "'Orbitron'", fontSize: 10,
                        fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                      }}
                    >
                      COPY ALL MEASUREMENTS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Toast ── */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  className="ar-toast"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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
