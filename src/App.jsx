import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import ARCamera from "./ARCamera.jsx";

// ─── FONT INJECTION ───────────────────────────────────────────────────────────
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --cyan: #00f5ff;
    --blue: #0080ff;
    --neon: #00ff88;
    --orange: #ff6b00;
    --red: #ff2d55;
    --bg: #020408;
    --bg2: #040d18;
    --bg3: #061226;
    --glass: rgba(0,245,255,0.04);
    --glass2: rgba(0,245,255,0.08);
    --border: rgba(0,245,255,0.15);
    --border2: rgba(0,245,255,0.3);
    --text: #e8f4ff;
    --text2: #7eb8d4;
    --font-display: 'Orbitron', monospace;
    --font-body: 'Rajdhani', sans-serif;
    --font-mono: 'Share Tech Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--cyan); border-radius: 2px; }

  @keyframes scanLine {
    0% { transform: translateY(-100%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:0.6; transform:scale(0.97); }
  }
  @keyframes rotate360 {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%,100% { opacity:1; }
    50% { opacity:0; }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes gridMove {
    from { background-position: 0 0; }
    to { background-position: 40px 40px; }
  }
  @keyframes dataScroll {
    from { transform: translateY(0); }
    to { transform: translateY(-50%); }
  }
  @keyframes measurePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,245,255,0.4); }
    50% { box-shadow: 0 0 0 12px rgba(0,245,255,0); }
  }
  @keyframes cornerSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(90deg); }
  }
  @keyframes neonFlicker {
    0%,100% { text-shadow: 0 0 10px var(--cyan), 0 0 30px var(--cyan), 0 0 60px var(--cyan); }
    50% { text-shadow: 0 0 5px var(--cyan), 0 0 15px var(--cyan); }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity:1; }
    100% { transform: scale(4); opacity:0; }
  }
`;

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({length: 60}, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 8 + 4,
    delay: Math.random() * 4,
  }));

  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? 'var(--cyan)' : p.id % 3 === 1 ? 'var(--neon)' : 'var(--blue)',
            opacity: 0.4,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Grid overlay */}
      <div style={{
        position:'absolute',inset:0,
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'gridMove 8s linear infinite',
      }}/>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ activeSection, setActiveSection }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const links = ['Home','Features','Scanner','Calculator','Reports','Pricing'];

  return (
    <motion.nav
      initial={{y:-80,opacity:0}}
      animate={{y:0,opacity:1}}
      transition={{duration:0.8,ease:'easeOut'}}
      style={{
        position:'fixed',top:0,left:0,right:0,zIndex:1000,
        padding: scrolled ? '12px 24px' : '20px 24px',
        background: scrolled ? 'rgba(2,4,8,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.4s ease',
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}
    >
      {/* Logo */}
      <div style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>setActiveSection('home')}>
        <div style={{
          width:36,height:36,borderRadius:8,
          background:'linear-gradient(135deg, var(--cyan), var(--blue))',
          display:'flex',alignItems:'center',justifyContent:'center',
          position:'relative',overflow:'hidden',
        }}>
          <div style={{
            width:16,height:16,border:'2px solid white',borderRadius:2,
            position:'relative',
          }}>
            <div style={{position:'absolute',top:-4,left:-4,width:6,height:6,background:'white',borderRadius:1}}/>
            <div style={{position:'absolute',bottom:-4,right:-4,width:6,height:6,background:'white',borderRadius:1}}/>
          </div>
        </div>
        <div>
          <div style={{fontFamily:'var(--font-display)',fontSize:14,fontWeight:700,color:'var(--cyan)',letterSpacing:2,lineHeight:1}}>SMARTMEASURE</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text2)',letterSpacing:3}}>AI PLATFORM v2.0</div>
        </div>
      </div>

      {/* Links */}
      <div style={{display:'flex',gap:4,background:'var(--glass)',border:'1px solid var(--border)',borderRadius:40,padding:'6px 8px'}}>
        {links.map(l => (
          <button
            key={l}
            onClick={() => setActiveSection(l.toLowerCase())}
            style={{
              padding:'6px 14px',
              borderRadius:30,
              border:'none',
              fontFamily:'var(--font-body)',
              fontSize:13,
              fontWeight:600,
              letterSpacing:1,
              cursor:'pointer',
              background: activeSection === l.toLowerCase() ? 'linear-gradient(135deg, var(--cyan), var(--blue))' : 'transparent',
              color: activeSection === l.toLowerCase() ? '#000' : 'var(--text2)',
              transition:'all 0.3s ease',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--neon)',letterSpacing:1,
          padding:'4px 10px',border:'1px solid var(--neon)',borderRadius:4}}>
          ● LIVE
        </div>
        <motion.button
          whileHover={{scale:1.05}}
          whileTap={{scale:0.95}}
          onClick={()=>setActiveSection('scanner')}
          style={{
            padding:'8px 20px',
            background:'linear-gradient(135deg, var(--cyan), var(--blue))',
            color:'#000',
            border:'none',
            borderRadius:6,
            fontFamily:'var(--font-display)',
            fontSize:11,
            fontWeight:700,
            letterSpacing:1,
            cursor:'pointer',
          }}
        >
          LAUNCH AR
        </motion.button>
      </div>
    </motion.nav>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
function HeroSection({ setActiveSection }) {
  const [scanProgress, setScanProgress] = useState(0);
  const [dataLines, setDataLines] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(p => (p + 1) % 101);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const lines = [
      'DEPTH_SENSOR: ACTIVE', 'LiDAR_ARRAY: CALIBRATING...', 'AI_ENGINE: LOADED',
      'AR_OVERLAY: READY', 'PLANE_DETECT: ON', 'EDGE_AI: RUNNING',
      'MEASUREMENT_CORE: v4.2.1', 'GPU_ACCEL: ENABLED',
    ];
    setDataLines(lines);
  }, []);

  return (
    <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      position:'relative',overflow:'hidden',paddingTop:100}}>

      {/* Radial glow */}
      <div style={{
        position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
        width:800,height:800,borderRadius:'50%',
        background:'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
        pointerEvents:'none',
      }}/>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',width:'100%',
        display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>

        {/* Left */}
        <div>
          <motion.div
            initial={{opacity:0,y:30}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.8}}
          >
            <div style={{
              display:'inline-flex',alignItems:'center',gap:8,
              padding:'6px 16px',borderRadius:30,
              background:'rgba(0,245,255,0.08)',border:'1px solid rgba(0,245,255,0.2)',
              marginBottom:24,
            }}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--neon)',
                animation:'pulse 2s ease-in-out infinite'}}/>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--cyan)',letterSpacing:2}}>
                AI-POWERED CONSTRUCTION PLATFORM
              </span>
            </div>

            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:'clamp(36px,5vw,64px)',
              fontWeight:900,
              lineHeight:1.1,
              marginBottom:8,
            }}>
              <span style={{color:'var(--text)'}}>MEASURE</span><br/>
              <span style={{
                background:'linear-gradient(135deg, var(--cyan), var(--blue) 50%, var(--neon))',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
                backgroundClip:'text',
                animation:'neonFlicker 4s ease-in-out infinite',
              }}>REALITY</span><br/>
              <span style={{color:'var(--text)'}}>WITH AI</span>
            </h1>

            <p style={{
              fontFamily:'var(--font-body)',
              fontSize:17,
              color:'var(--text2)',
              lineHeight:1.7,
              marginBottom:36,
              maxWidth:480,
            }}>
              Point your camera. Let AI measure everything — walls, rooms, floors, objects —
              in real-time with AR overlays, construction calculations, and professional reports.
            </p>

            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <motion.button
                whileHover={{scale:1.04,boxShadow:'0 0 30px rgba(0,245,255,0.4)'}}
                whileTap={{scale:0.96}}
                onClick={()=>setActiveSection('scanner')}
                style={{
                  padding:'14px 32px',
                  background:'linear-gradient(135deg, var(--cyan), var(--blue))',
                  color:'#000',border:'none',borderRadius:8,
                  fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,letterSpacing:2,
                  cursor:'pointer',display:'flex',alignItems:'center',gap:10,
                }}
              >
                <span>▶</span> START AR SCAN
              </motion.button>
              <motion.button
                whileHover={{scale:1.04}}
                whileTap={{scale:0.96}}
                onClick={()=>setActiveSection('features')}
                style={{
                  padding:'14px 32px',
                  background:'transparent',
                  color:'var(--cyan)',
                  border:'1px solid var(--border2)',borderRadius:8,
                  fontFamily:'var(--font-display)',fontSize:13,fontWeight:600,letterSpacing:2,
                  cursor:'pointer',
                }}
              >
                EXPLORE
              </motion.button>
            </div>

            {/* Stats */}
            <div style={{display:'flex',gap:32,marginTop:48}}>
              {[
                ['50+','Measurement Types'],
                ['0.3mm','AI Accuracy'],
                ['100K+','Pro Users'],
              ].map(([val,label]) => (
                <div key={label}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:800,
                    color:'var(--cyan)'}}>
                    {val}
                  </div>
                  <div style={{fontFamily:'var(--font-body)',fontSize:12,color:'var(--text2)',
                    letterSpacing:1,marginTop:2}}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right - AR Phone Mockup */}
        <motion.div
          initial={{opacity:0,scale:0.9,x:40}}
          animate={{opacity:1,scale:1,x:0}}
          transition={{duration:1,ease:'easeOut'}}
          style={{display:'flex',justifyContent:'center',position:'relative'}}
        >
          {/* Orbiting rings */}
          <div style={{
            position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:380,height:380,borderRadius:'50%',
            border:'1px solid rgba(0,245,255,0.1)',
            animation:'rotate360 20s linear infinite',
          }}>
            <div style={{
              position:'absolute',top:-4,left:'50%',
              width:8,height:8,borderRadius:'50%',
              background:'var(--cyan)',
              boxShadow:'0 0 12px var(--cyan)',
              transform:'translateX(-50%)',
            }}/>
          </div>
          <div style={{
            position:'absolute',top:'50%',left:'50%',
            transform:'translate(-50%,-50%)',
            width:440,height:440,borderRadius:'50%',
            border:'1px solid rgba(0,128,255,0.08)',
            animation:'rotate360 30s linear infinite reverse',
          }}/>

          {/* Phone */}
          <div style={{
            width:220,height:440,
            background:'linear-gradient(160deg, #0d1f3c, #061226)',
            borderRadius:36,
            border:'2px solid rgba(0,245,255,0.3)',
            boxShadow:'0 0 60px rgba(0,245,255,0.2), 0 40px 80px rgba(0,0,0,0.6)',
            position:'relative',
            overflow:'hidden',
            animation:'float 6s ease-in-out infinite',
          }}>
            {/* Phone notch */}
            <div style={{
              position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',
              width:60,height:20,
              background:'#000',borderRadius:10,zIndex:10,
            }}/>

            {/* AR Camera View */}
            <div style={{
              position:'absolute',inset:0,
              background:'linear-gradient(180deg, #0a1628 0%, #071020 100%)',
              overflow:'hidden',
            }}>
              {/* Grid lines */}
              <div style={{
                position:'absolute',inset:0,
                backgroundImage:'linear-gradient(rgba(0,245,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.08) 1px, transparent 1px)',
                backgroundSize:'30px 30px',
              }}/>

              {/* Scan line */}
              <div style={{
                position:'absolute',left:0,right:0,height:2,
                background:'linear-gradient(90deg, transparent, var(--cyan), transparent)',
                boxShadow:'0 0 10px var(--cyan)',
                animation:'scanLine 2.5s ease-in-out infinite',
                top:0,
              }}/>

              {/* AR measurement overlay */}
              <div style={{position:'absolute',inset:30,top:60}}>
                {/* Room outline */}
                <div style={{
                  position:'absolute',inset:20,
                  border:'1px solid rgba(0,245,255,0.5)',
                  borderRadius:4,
                }}/>

                {/* Corner markers */}
                {[[0,0],[0,100],[100,0],[100,100]].map(([x,y],i) => (
                  <div key={i} style={{
                    position:'absolute',
                    left:`${x}%`,top:`${y}%`,
                    width:10,height:10,
                    borderTop: y===0 ? '2px solid var(--cyan)' : 'none',
                    borderBottom: y===100 ? '2px solid var(--cyan)' : 'none',
                    borderLeft: x===0 ? '2px solid var(--cyan)' : 'none',
                    borderRight: x===100 ? '2px solid var(--cyan)' : 'none',
                    transform:'translate(-50%,-50%)',
                    boxShadow:'0 0 8px var(--cyan)',
                  }}/>
                ))}

                {/* Dimension labels */}
                <div style={{
                  position:'absolute',bottom:-18,left:'50%',transform:'translateX(-50%)',
                  fontFamily:'var(--font-mono)',fontSize:9,color:'var(--cyan)',
                  background:'rgba(0,245,255,0.1)',padding:'2px 6px',borderRadius:3,
                  whiteSpace:'nowrap',
                }}>
                  ← 4.85 m →
                </div>
                <div style={{
                  position:'absolute',right:-30,top:'50%',transform:'translateY(-50%) rotate(90deg)',
                  fontFamily:'var(--font-mono)',fontSize:9,color:'var(--neon)',
                  background:'rgba(0,255,136,0.1)',padding:'2px 6px',borderRadius:3,
                  whiteSpace:'nowrap',
                }}>
                  ↕ 2.90 m
                </div>

                {/* Measurement dots */}
                <div style={{
                  position:'absolute',top:'30%',left:'20%',
                  width:6,height:6,borderRadius:'50%',background:'var(--cyan)',
                  boxShadow:'0 0 10px var(--cyan)',
                  animation:'measurePulse 2s ease-in-out infinite',
                }}/>
                <div style={{
                  position:'absolute',top:'70%',left:'75%',
                  width:6,height:6,borderRadius:'50%',background:'var(--neon)',
                  boxShadow:'0 0 10px var(--neon)',
                  animation:'measurePulse 2s ease-in-out infinite 0.5s',
                }}/>

                {/* Line between points */}
                <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
                  <line x1="20%" y1="30%" x2="75%" y2="70%" stroke="rgba(0,245,255,0.4)" strokeWidth="1" strokeDasharray="4,4"/>
                </svg>
              </div>

              {/* AI detection box */}
              <div style={{
                position:'absolute',left:40,top:120,
                width:80,height:60,
                border:'1px solid rgba(0,255,136,0.6)',
                borderRadius:4,
              }}>
                <div style={{
                  position:'absolute',top:-8,left:4,
                  fontFamily:'var(--font-mono)',fontSize:7,color:'var(--neon)',
                  background:'var(--bg)',padding:'1px 4px',
                }}>WALL</div>
              </div>

              {/* HUD elements */}
              <div style={{
                position:'absolute',bottom:20,left:0,right:0,
                padding:'0 16px',
              }}>
                {/* Progress bar */}
                <div style={{
                  height:2,background:'rgba(0,245,255,0.2)',borderRadius:1,marginBottom:8,
                }}>
                  <div style={{
                    height:'100%',width:`${scanProgress}%`,
                    background:'linear-gradient(90deg, var(--blue), var(--cyan))',
                    borderRadius:1,transition:'width 0.05s',
                  }}/>
                </div>
                <div style={{
                  display:'flex',justifyContent:'space-between',
                  fontFamily:'var(--font-mono)',fontSize:8,color:'var(--text2)',
                }}>
                  <span>AI SCAN {scanProgress}%</span>
                  <span style={{color:'var(--neon)'}}>● LIVE</span>
                </div>
              </div>

              {/* Status top */}
              <div style={{
                position:'absolute',top:30,left:0,right:0,padding:'0 12px',
                display:'flex',justifyContent:'space-between',alignItems:'center',
              }}>
                <div style={{
                  fontFamily:'var(--font-mono)',fontSize:7,color:'var(--cyan)',
                  background:'rgba(0,245,255,0.1)',padding:'2px 6px',borderRadius:3,
                }}>DEPTH: 2.4m</div>
                <div style={{
                  fontFamily:'var(--font-mono)',fontSize:7,color:'var(--orange)',
                  background:'rgba(255,107,0,0.1)',padding:'2px 6px',borderRadius:3,
                }}>REC ●</div>
              </div>
            </div>
          </div>

          {/* Data readout panel */}
          <div style={{
            position:'absolute',right:-120,top:'50%',transform:'translateY(-50%)',
            width:110,
            background:'rgba(4,13,24,0.9)',
            border:'1px solid var(--border)',
            borderRadius:8,padding:12,
          }}>
            {[
              ['HEIGHT','2.90 m'],['WIDTH','4.85 m'],['AREA','14.1 m²'],['TILES','141'],
            ].map(([k,v]) => (
              <div key={k} style={{marginBottom:10}}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:'var(--text2)',
                  letterSpacing:1}}>{k}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,
                  color:'var(--cyan)'}}>{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{y:[0,10,0]}}
        transition={{repeat:Infinity,duration:2}}
        style={{
          position:'absolute',bottom:30,left:'50%',transform:'translateX(-50%)',
          display:'flex',flexDirection:'column',alignItems:'center',gap:6,
          cursor:'pointer',
        }}
        onClick={()=>setActiveSection('features')}
      >
        <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',letterSpacing:2}}>SCROLL</div>
        <div style={{width:1,height:30,background:'linear-gradient(to bottom, var(--text2), transparent)'}}/>
      </motion.div>
    </section>
  );
}

// ─── FEATURES SECTION ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon:'◈',color:'var(--cyan)',
      title:'AI Measurement Engine',
      desc:'Neural network detects edges, corners, and surfaces with sub-millimeter precision. Measures height, width, depth, area, and volume in real-time.',
      tags:['Edge Detection','Depth AI','LiDAR'],
    },
    {
      icon:'⬡',color:'var(--neon)',
      title:'AR Room Scanner',
      desc:'Point and sweep your phone to generate a complete 3D room model with all dimensions, spatial mapping, and interactive mesh visualization.',
      tags:['3D Mesh','Plane Detect','Spatial Map'],
    },
    {
      icon:'⬟',color:'var(--blue)',
      title:'Smart Object Recognition',
      desc:'AI identifies doors, windows, furniture, pipes, and 200+ construction objects and instantly provides accurate dimension overlays.',
      tags:['TensorFlow.js','MediaPipe','YOLO'],
    },
    {
      icon:'◫',color:'#a855f7',
      title:'Construction Calculator',
      desc:'Instantly calculate tiles, paint liters, cement bags, bricks, flooring, pipe lengths, and material costs from any scan.',
      tags:['Auto-Calc','Material AI','Cost Est.'],
    },
    {
      icon:'◪',color:'var(--orange)',
      title:'Professional Reports',
      desc:'Export beautiful PDF reports, Excel spreadsheets, and JSON data with all measurements, calculations, and project photos.',
      tags:['PDF Export','Excel','Share'],
    },
    {
      icon:'◧',color:'#f59e0b',
      title:'Multi-Unit Conversion',
      desc:'Real-time conversion between feet, meters, inches, centimeters. Works with any international construction standard.',
      tags:['Imperial','Metric','Auto-Convert'],
    },
  ];

  return (
    <section style={{padding:'100px 24px',maxWidth:1200,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:64}}
      >
        <div style={{
          display:'inline-flex',alignItems:'center',gap:8,
          padding:'6px 20px',borderRadius:30,
          background:'rgba(0,245,255,0.06)',border:'1px solid var(--border)',
          marginBottom:20,
        }}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--cyan)',letterSpacing:2}}>
            PLATFORM CAPABILITIES
          </span>
        </div>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,48px)',
          fontWeight:800,color:'var(--text)',marginBottom:16}}>
          EVERYTHING YOU NEED<br/>
          <span style={{color:'var(--cyan)'}}>TO MEASURE REALITY</span>
        </h2>
        <p style={{fontFamily:'var(--font-body)',fontSize:16,color:'var(--text2)',maxWidth:560,
          margin:'0 auto'}}>
          A complete AI-powered measurement ecosystem built for construction professionals.
        </p>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20}}>
        {features.map((f,i) => (
          <motion.div
            key={f.title}
            initial={{opacity:0,y:40}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.6,delay:i*0.1}}
            viewport={{once:true}}
            whileHover={{scale:1.02,y:-4}}
            style={{
              background:'var(--glass)',
              border:'1px solid var(--border)',
              borderRadius:16,
              padding:28,
              cursor:'default',
              position:'relative',
              overflow:'hidden',
              transition:'border-color 0.3s',
            }}
            onHoverStart={e => e.target.style && (e.target.style.borderColor = f.color)}
            onHoverEnd={e => e.target.style && (e.target.style.borderColor = 'var(--border)')}
          >
            {/* Corner accent */}
            <div style={{
              position:'absolute',top:0,right:0,
              width:60,height:60,
              background:`linear-gradient(225deg, ${f.color}22, transparent)`,
            }}/>

            <div style={{
              fontSize:32,marginBottom:16,
              color:f.color,
              filter:`drop-shadow(0 0 8px ${f.color})`,
            }}>{f.icon}</div>

            <h3 style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,
              color:'var(--text)',marginBottom:10,letterSpacing:1}}>
              {f.title}
            </h3>

            <p style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--text2)',
              lineHeight:1.6,marginBottom:16}}>
              {f.desc}
            </p>

            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {f.tags.map(t => (
                <span key={t} style={{
                  fontFamily:'var(--font-mono)',fontSize:10,
                  color:f.color,
                  background:`${f.color}15`,
                  border:`1px solid ${f.color}40`,
                  padding:'2px 8px',borderRadius:4,
                  letterSpacing:1,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── AR SCANNER SECTION ───────────────────────────────────────────────────────
function ScannerSection() {
  const [mode, setMode] = useState('room');
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [measurements, setMeasurements] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const scanRef = useRef(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [crosshairPos, setCrosshairPos] = useState({x:50,y:50});

  const modes = [
    {id:'room',label:'ROOM SCAN',icon:'⬡'},
    {id:'wall',label:'WALL',icon:'▭'},
    {id:'floor',label:'FLOOR',icon:'▱'},
    {id:'object',label:'OBJECT',icon:'◈'},
    {id:'pipe',label:'PIPE/BEAM',icon:'▬'},
    {id:'distance',label:'DISTANCE',icon:'↔'},
  ];

  const roomConfigs = {
    room: {
      objects:[
        {label:'DOOR',x:15,y:60,w:60,h:90,color:'var(--cyan)'},
        {label:'WINDOW',x:55,y:35,w:80,h:60,color:'var(--neon)'},
        {label:'FLOOR',x:20,y:75,w:120,h:80,color:'var(--blue)'},
      ],
      measurements:{
        'Floor Area':'28.5 m²','Wall Height':'2.90 m','Room Width':'5.70 m',
        'Room Length':'5.00 m','Ceiling Area':'28.5 m²','Perimeter':'21.4 m',
        'Volume':'82.7 m³','Tile Count':'285','Paint (Wall)':'12.4 L','Paint (Ceiling)':'6.2 L',
      }
    },
    wall: {
      objects:[{label:'WALL SURFACE',x:10,y:20,w:260,h:160,color:'var(--cyan)'}],
      measurements:{
        'Wall Width':'4.20 m','Wall Height':'2.80 m','Wall Area':'11.76 m²',
        'Paint Needed':'3.5 L','Tiles Required':'118','Cement (plaster)':'24 kg',
      }
    },
    floor: {
      objects:[{label:'FLOOR AREA',x:10,y:30,w:260,h:140,color:'var(--neon)'}],
      measurements:{
        'Floor Length':'4.80 m','Floor Width':'3.60 m','Floor Area':'17.28 m²',
        'Tiles Needed':'173','Flooring (sqft)':'186','Cement':'35 kg','Sand':'0.09 m³',
      }
    },
    object: {
      objects:[{label:'SOFA',x:60,y:60,w:140,h:80,color:'#a855f7'}],
      measurements:{
        'Object Width':'2.10 m','Object Height':'0.85 m','Object Depth':'0.90 m',
        'Volume':'1.61 m³','Weight Est.':'~45 kg','Clearance':'0.75 m',
      }
    },
    pipe: {
      objects:[{label:'PIPE',x:30,y:80,w:220,h:30,color:'var(--orange)'}],
      measurements:{
        'Pipe Length':'3.60 m','Diameter':'50 mm','Circumference':'15.7 cm',
        'Volume':'7.07 L','Material':'PVC','Insulation':'3.70 m',
      }
    },
    distance: {
      objects:[],
      measurements:{
        'Distance A→B':'6.35 m','Horizontal':'5.80 m','Vertical':'2.40 m',
        'Angle':'22.5°','Clearance':'1.20 m',
      }
    }
  };

  const startScan = () => {
    setScanning(true);
    setScanPhase(0);
    setScanProgress(0);
    setShowResult(false);
    setMeasurements(null);
    setDetectedObjects([]);

    const phases = ['INITIALIZING AI...','DETECTING PLANES...','MAPPING SURFACES...','ANALYZING EDGES...','COMPUTING DIMENSIONS...','GENERATING REPORT...'];
    let phase = 0;
    let prog = 0;
    const timer = setInterval(() => {
      prog += 1.5;
      setScanProgress(Math.min(prog,100));

      if (prog > phase * 17 && phase < phases.length - 1) {
        phase++;
        setScanPhase(phase);
      }

      if (prog >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setScanning(false);
          setMeasurements(roomConfigs[mode].measurements);
          setDetectedObjects(roomConfigs[mode].objects);
          setShowResult(true);
        }, 500);
      }
    }, 60);
  };

  const handleMouseMove = (e) => {
    if (!scanning && !showResult) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCrosshairPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  const scanPhases = ['INITIALIZING AI...','DETECTING PLANES...','MAPPING SURFACES...','ANALYZING EDGES...','COMPUTING DIMENSIONS...','GENERATING REPORT...'];

  return (
    <section style={{padding:'80px 24px',maxWidth:1200,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:48}}
      >
        <div style={{
          display:'inline-flex',alignItems:'center',gap:8,padding:'6px 20px',
          borderRadius:30,background:'rgba(0,255,136,0.06)',border:'1px solid rgba(0,255,136,0.2)',
          marginBottom:20,
        }}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--neon)',letterSpacing:2}}>
            INTERACTIVE DEMO
          </span>
        </div>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,48px)',
          fontWeight:800,color:'var(--text)',marginBottom:16}}>
          AR SCANNER <span style={{color:'var(--neon)'}}>SIMULATOR</span>
        </h2>
      </motion.div>

      {/* Mode selector */}
      <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:32}}>
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setShowResult(false); setDetectedObjects([]); setScanning(false); }}
            style={{
              padding:'8px 18px',
              background: mode === m.id ? 'linear-gradient(135deg, var(--cyan), var(--blue))' : 'var(--glass)',
              border: mode === m.id ? 'none' : '1px solid var(--border)',
              borderRadius:8,
              color: mode === m.id ? '#000' : 'var(--text2)',
              fontFamily:'var(--font-display)',fontSize:11,fontWeight:700,letterSpacing:1,
              cursor:'pointer',display:'flex',alignItems:'center',gap:6,
              transition:'all 0.2s',
            }}
          >
            <span>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20,maxWidth:1000,margin:'0 auto'}}>
        {/* Camera viewport */}
        <div
          onMouseMove={handleMouseMove}
          style={{
            aspectRatio:'16/10',
            background:'linear-gradient(145deg, #080f1e, #040c18)',
            borderRadius:16,
            border:'1px solid var(--border)',
            position:'relative',
            overflow:'hidden',
            cursor: scanning ? 'wait' : 'crosshair',
          }}
        >
          {/* Grid background */}
          <div style={{
            position:'absolute',inset:0,
            backgroundImage:'linear-gradient(rgba(0,245,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.05) 1px, transparent 1px)',
            backgroundSize:'30px 30px',
          }}/>

          {/* Crosshair (idle) */}
          {!scanning && !showResult && (
            <div style={{
              position:'absolute',
              left:`${crosshairPos.x}%`,top:`${crosshairPos.y}%`,
              transform:'translate(-50%,-50%)',
              pointerEvents:'none',
              transition:'all 0.05s',
            }}>
              <div style={{width:20,height:20,position:'relative'}}>
                <div style={{position:'absolute',top:'50%',left:0,right:0,height:1,background:'var(--cyan)',opacity:0.7}}/>
                <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'var(--cyan)',opacity:0.7}}/>
              </div>
              <div style={{
                position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                width:30,height:30,borderRadius:'50%',
                border:'1px solid rgba(0,245,255,0.3)',
              }}/>
            </div>
          )}

          {/* Detected objects */}
          {showResult && detectedObjects.map((obj,i) => (
            <motion.div
              key={i}
              initial={{opacity:0,scale:0.9}}
              animate={{opacity:1,scale:1}}
              transition={{delay:i*0.2}}
              style={{
                position:'absolute',
                left:`${obj.x}px`,top:`${obj.y}px`,
                width:`${obj.w}px`,height:`${obj.h}px`,
                border:`1px solid ${obj.color}`,
                borderRadius:4,
              }}
            >
              <div style={{
                position:'absolute',top:-18,left:0,
                fontFamily:'var(--font-mono)',fontSize:9,color:obj.color,
                background:'rgba(2,4,8,0.8)',padding:'1px 6px',borderRadius:3,
                whiteSpace:'nowrap',
              }}>{obj.label}</div>
              {/* Corners */}
              {[[0,0],[0,'calc(100% - 8px)'],['calc(100% - 8px)',0],['calc(100% - 8px)','calc(100% - 8px)']].map((pos,j) => (
                <div key={j} style={{
                  position:'absolute',left:pos[0],top:pos[1],
                  width:8,height:8,
                  borderTop: pos[1]===0 ? `2px solid ${obj.color}` : 'none',
                  borderBottom: pos[1]!==0 ? `2px solid ${obj.color}` : 'none',
                  borderLeft: pos[0]===0 ? `2px solid ${obj.color}` : 'none',
                  borderRight: pos[0]!==0 ? `2px solid ${obj.color}` : 'none',
                  boxShadow:`0 0 6px ${obj.color}`,
                }}/>
              ))}
            </motion.div>
          ))}

          {/* Scan animation */}
          {scanning && (
            <>
              <div style={{
                position:'absolute',left:0,right:0,height:2,
                background:'linear-gradient(90deg, transparent, var(--cyan), transparent)',
                boxShadow:'0 0 20px var(--cyan), 0 0 40px var(--cyan)',
                animation:'scanLine 1.5s ease-in-out infinite',
                top:0,
              }}/>
              {/* Horizontal scan bands */}
              {[20,40,60,80].map(p => (
                <div key={p} style={{
                  position:'absolute',left:0,right:0,
                  top:`${p}%`,height:1,
                  background:`rgba(0,245,255,${0.1 + (scanProgress/100)*0.3})`,
                  transition:'opacity 0.3s',
                }}/>
              ))}
            </>
          )}

          {/* Dimension lines (after scan) */}
          {showResult && mode === 'room' && (
            <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
              <line x1="10%" y1="85%" x2="90%" y2="85%" stroke="rgba(0,245,255,0.4)" strokeWidth="1" markerEnd="url(#arrow)" markerStart="url(#arrow)"/>
              <line x1="90%" y1="15%" x2="90%" y2="85%" stroke="rgba(0,255,136,0.4)" strokeWidth="1"/>
              <text x="50%" y="92%" fill="var(--cyan)" fontFamily="'Share Tech Mono'" fontSize="11" textAnchor="middle">5.70 m</text>
              <text x="94%" y="50%" fill="var(--neon)" fontFamily="'Share Tech Mono'" fontSize="11" textAnchor="middle" transform="rotate(90, 94% 50%)">2.90 m</text>
            </svg>
          )}

          {/* HUD overlay */}
          <div style={{
            position:'absolute',top:16,left:16,right:16,
            display:'flex',justifyContent:'space-between',alignItems:'flex-start',
          }}>
            <div style={{
              background:'rgba(2,4,8,0.8)',border:'1px solid var(--border)',
              borderRadius:8,padding:'8px 12px',
            }}>
              <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--cyan)',letterSpacing:1}}>
                MODE: {mode.toUpperCase()}
              </div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text2)',marginTop:2}}>
                AI ENGINE v4.2
              </div>
            </div>
            <div style={{
              display:'flex',gap:6,flexDirection:'column',alignItems:'flex-end',
            }}>
              <div style={{
                background:'rgba(2,4,8,0.8)',border:'1px solid rgba(0,255,136,0.2)',
                borderRadius:6,padding:'4px 10px',
                fontFamily:'var(--font-mono)',fontSize:9,color:'var(--neon)',
              }}>
                {showResult ? '● SCAN COMPLETE' : scanning ? '● SCANNING' : '● READY'}
              </div>
            </div>
          </div>

          {/* Scan progress overlay */}
          {scanning && (
            <div style={{
              position:'absolute',inset:0,
              display:'flex',flexDirection:'column',
              alignItems:'center',justifyContent:'center',
              background:'rgba(2,4,8,0.6)',
            }}>
              <div style={{
                width:80,height:80,borderRadius:'50%',
                border:'3px solid rgba(0,245,255,0.2)',
                borderTop:'3px solid var(--cyan)',
                animation:'rotate360 1s linear infinite',
                marginBottom:20,
                position:'relative',
              }}>
                <div style={{
                  position:'absolute',inset:8,borderRadius:'50%',
                  border:'2px solid rgba(0,255,136,0.2)',
                  borderBottom:'2px solid var(--neon)',
                  animation:'rotate360 0.7s linear infinite reverse',
                }}/>
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--cyan)',
                letterSpacing:2,marginBottom:8}}>
                {scanPhases[scanPhase]}
              </div>
              <div style={{
                width:200,height:3,background:'rgba(0,245,255,0.2)',borderRadius:2,
              }}>
                <div style={{
                  height:'100%',width:`${scanProgress}%`,
                  background:'linear-gradient(90deg, var(--blue), var(--cyan))',
                  borderRadius:2,transition:'width 0.1s',
                }}/>
              </div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',marginTop:8}}>
                {Math.round(scanProgress)}% COMPLETE
              </div>
            </div>
          )}

          {/* Click to scan prompt */}
          {!scanning && !showResult && (
            <div style={{
              position:'absolute',bottom:20,left:'50%',transform:'translateX(-50%)',
              fontFamily:'var(--font-mono)',fontSize:11,color:'rgba(0,245,255,0.5)',
              letterSpacing:2,textAlign:'center',
            }}>
              MOVE CURSOR TO AIM · CLICK SCAN TO START
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Scan button */}
          <motion.button
            whileHover={{scale:1.02,boxShadow:'0 0 30px rgba(0,245,255,0.4)'}}
            whileTap={{scale:0.97}}
            onClick={startScan}
            disabled={scanning}
            style={{
              padding:'16px',
              background: scanning
                ? 'rgba(0,245,255,0.05)'
                : 'linear-gradient(135deg, var(--cyan), var(--blue))',
              border: scanning ? '1px solid var(--border)' : 'none',
              borderRadius:10,
              color: scanning ? 'var(--text2)' : '#000',
              fontFamily:'var(--font-display)',fontSize:14,fontWeight:800,letterSpacing:3,
              cursor: scanning ? 'wait' : 'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:10,
            }}
          >
            <span style={{fontSize:20}}>{scanning ? '◌' : '◈'}</span>
            {scanning ? 'SCANNING...' : 'START AI SCAN'}
          </motion.button>

          {/* Measurements panel */}
          <div style={{
            flex:1,
            background:'var(--glass)',
            border:'1px solid var(--border)',
            borderRadius:12,padding:16,
            overflow:'auto',
          }}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',
              letterSpacing:2,marginBottom:12}}>
              MEASUREMENTS
            </div>

            {showResult && measurements ? (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}>
                {Object.entries(measurements).map(([k,v],i) => (
                  <motion.div
                    key={k}
                    initial={{x:-20,opacity:0}}
                    animate={{x:0,opacity:1}}
                    transition={{delay:i*0.07}}
                    style={{
                      display:'flex',justifyContent:'space-between',alignItems:'center',
                      padding:'8px 0',
                      borderBottom:'1px solid rgba(0,245,255,0.06)',
                    }}
                  >
                    <span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--text2)',fontWeight:500}}>
                      {k}
                    </span>
                    <span style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,
                      color:'var(--cyan)'}}>
                      {v}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div style={{
                display:'flex',flexDirection:'column',gap:8,
              }}>
                {Array.from({length:6}).map((_,i) => (
                  <div key={i} style={{
                    height:16,borderRadius:4,
                    background:`rgba(0,245,255,${0.03 + i*0.01})`,
                    width:`${80 - i*8}%`,
                  }}/>
                ))}
                <div style={{
                  marginTop:16,textAlign:'center',
                  fontFamily:'var(--font-mono)',fontSize:11,color:'rgba(0,245,255,0.3)',
                  letterSpacing:1,
                }}>
                  RUN SCAN TO DETECT
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          {showResult && (
            <motion.div
              initial={{opacity:0,y:10}}
              animate={{opacity:1,y:0}}
              style={{display:'flex',gap:8}}
            >
              <button style={{
                flex:1,padding:'10px',
                background:'rgba(0,255,136,0.1)',border:'1px solid rgba(0,255,136,0.3)',
                borderRadius:8,color:'var(--neon)',
                fontFamily:'var(--font-display)',fontSize:10,fontWeight:700,letterSpacing:1,
                cursor:'pointer',
              }}>
                ↓ EXPORT PDF
              </button>
              <button style={{
                flex:1,padding:'10px',
                background:'rgba(0,128,255,0.1)',border:'1px solid rgba(0,128,255,0.3)',
                borderRadius:8,color:'var(--blue)',
                fontFamily:'var(--font-display)',fontSize:10,fontWeight:700,letterSpacing:1,
                cursor:'pointer',
              }}>
                ↓ EXCEL
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── CONSTRUCTION CALCULATOR ──────────────────────────────────────────────────
function CalculatorSection() {
  const [length, setLength] = useState('5.0');
  const [width, setWidth] = useState('4.0');
  const [height, setHeight] = useState('2.8');
  const [tileSize, setTileSize] = useState('0.60');
  const [paintCoats, setPaintCoats] = useState('2');
  const [unit, setUnit] = useState('m');

  const conv = unit === 'ft' ? 0.3048 : unit === 'in' ? 0.0254 : 1;
  const L = parseFloat(length||0) * conv;
  const W = parseFloat(width||0) * conv;
  const H = parseFloat(height||0) * conv;
  const T = parseFloat(tileSize||0.6);
  const coats = parseInt(paintCoats||2);

  const floorArea = (L*W).toFixed(2);
  const wallArea = (2*(L+W)*H).toFixed(2);
  const ceilArea = (L*W).toFixed(2);
  const totalArea = (parseFloat(floorArea)+parseFloat(wallArea)+parseFloat(ceilArea)).toFixed(2);
  const tiles = Math.ceil(L*W/(T*T)*1.1);
  const paintL = (parseFloat(wallArea)*coats/12).toFixed(1);
  const cementBags = Math.ceil(parseFloat(floorArea)*0.44);
  const bricks = Math.ceil(parseFloat(wallArea)*55);
  const volume = (L*W*H).toFixed(2);

  const InputField = ({label, value, onChange, unit: u}) => (
    <div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',
        letterSpacing:1,marginBottom:4}}>{label}</div>
      <div style={{display:'flex',gap:0}}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          type="number"
          style={{
            flex:1,padding:'8px 10px',
            background:'rgba(0,245,255,0.04)',
            border:'1px solid var(--border)',
            borderRight:'none',
            borderRadius:'6px 0 0 6px',
            color:'var(--text)',
            fontFamily:'var(--font-display)',fontSize:14,fontWeight:700,
            outline:'none',
          }}
        />
        <div style={{
          padding:'8px 10px',
          background:'rgba(0,245,255,0.08)',
          border:'1px solid var(--border)',
          borderRadius:'0 6px 6px 0',
          fontFamily:'var(--font-mono)',fontSize:11,color:'var(--cyan)',
          display:'flex',alignItems:'center',
        }}>
          {u || unit}
        </div>
      </div>
    </div>
  );

  const ResultCard = ({label, value, color='var(--cyan)', sub}) => (
    <div style={{
      background:'var(--glass)',border:'1px solid var(--border)',
      borderRadius:10,padding:14,
    }}>
      <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text2)',
        letterSpacing:1,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,color}}>
        {value}
      </div>
      {sub && <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',marginTop:2}}>{sub}</div>}
    </div>
  );

  return (
    <section style={{padding:'80px 24px',maxWidth:1200,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:48}}
      >
        <div style={{
          display:'inline-flex',alignItems:'center',gap:8,padding:'6px 20px',
          borderRadius:30,background:'rgba(255,107,0,0.08)',border:'1px solid rgba(255,107,0,0.2)',
          marginBottom:20,
        }}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--orange)',letterSpacing:2}}>
            CONSTRUCTION INTELLIGENCE
          </span>
        </div>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,48px)',
          fontWeight:800,color:'var(--text)',marginBottom:16}}>
          SMART <span style={{color:'var(--orange)'}}>CALCULATOR</span>
        </h2>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:24,maxWidth:1000,margin:'0 auto'}}>
        {/* Input panel */}
        <div style={{
          background:'var(--glass)',border:'1px solid var(--border)',
          borderRadius:16,padding:24,
        }}>
          <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',
            letterSpacing:2,marginBottom:20}}>ROOM DIMENSIONS</div>

          {/* Unit selector */}
          <div style={{display:'flex',gap:0,marginBottom:20,borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>
            {['m','ft','in'].map(u => (
              <button key={u} onClick={() => setUnit(u)} style={{
                flex:1,padding:'8px',
                background: unit===u ? 'linear-gradient(135deg, var(--cyan), var(--blue))' : 'transparent',
                border:'none',
                color: unit===u ? '#000' : 'var(--text2)',
                fontFamily:'var(--font-display)',fontSize:11,fontWeight:700,
                cursor:'pointer',letterSpacing:1,
                transition:'all 0.2s',
              }}>{u.toUpperCase()}</button>
            ))}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <InputField label="LENGTH" value={length} onChange={setLength}/>
            <InputField label="WIDTH" value={width} onChange={setWidth}/>
            <InputField label="HEIGHT" value={height} onChange={setHeight}/>
            <InputField label="TILE SIZE" value={tileSize} onChange={setTileSize} u="m"/>
            <InputField label="PAINT COATS" value={paintCoats} onChange={setPaintCoats} u="×"/>
          </div>

          <div style={{marginTop:20,padding:12,
            background:'rgba(0,245,255,0.04)',border:'1px solid var(--border)',borderRadius:8}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text2)',letterSpacing:1,marginBottom:8}}>
              ROOM VOLUME
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:800,color:'var(--cyan)'}}>
              {volume} m³
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <ResultCard label="FLOOR AREA" value={`${floorArea} m²`} color='var(--cyan)'/>
            <ResultCard label="WALL AREA" value={`${wallArea} m²`} color='var(--neon)'/>
            <ResultCard label="CEILING AREA" value={`${ceilArea} m²`} color='var(--blue)'/>
            <ResultCard label="TOTAL AREA" value={`${totalArea} m²`} color='var(--orange)'/>
          </div>

          <div style={{
            fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',
            letterSpacing:2,marginBottom:12,marginTop:20,
          }}>MATERIAL ESTIMATION</div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <ResultCard label="TILES NEEDED" value={tiles} sub={`${tileSize}×${tileSize}m tiles`} color='var(--cyan)'/>
            <ResultCard label="PAINT" value={`${paintL} L`} sub={`${coats} coat${coats>1?'s':''}`} color='var(--neon)'/>
            <ResultCard label="CEMENT BAGS" value={cementBags} sub="50 kg bags" color='var(--orange)'/>
            <ResultCard label="BRICKS" value={bricks.toLocaleString()} sub="standard size" color='#a855f7'/>
            <ResultCard label="SAND" value={`${(parseFloat(floorArea)*0.048).toFixed(2)} m³`} sub="for flooring" color='#f59e0b'/>
            <ResultCard label="COST EST." value={`$${(tiles*2.5+parseFloat(paintL)*8+cementBags*12).toFixed(0)}`} sub="materials only" color='var(--neon)'/>
          </div>

          <motion.button
            whileHover={{scale:1.02,boxShadow:'0 0 20px rgba(255,107,0,0.3)'}}
            whileTap={{scale:0.98}}
            style={{
              width:'100%',marginTop:16,padding:'14px',
              background:'linear-gradient(135deg, var(--orange), #ff4500)',
              border:'none',borderRadius:10,
              color:'#fff',fontFamily:'var(--font-display)',fontSize:12,
              fontWeight:800,letterSpacing:2,cursor:'pointer',
            }}
          >
            ↓ EXPORT FULL MATERIAL REPORT
          </motion.button>
        </div>
      </div>
    </section>
  );
}

// ─── REPORTS SECTION ──────────────────────────────────────────────────────────
function ReportsSection() {
  const [activeReport, setActiveReport] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const reportTypes = [
    {id:'pdf',icon:'📄',label:'PDF REPORT',color:'var(--red)',desc:'Professional PDF with all measurements, photos, calculations, and company branding'},
    {id:'excel',icon:'📊',label:'EXCEL SHEET',color:'var(--neon)',desc:'Multi-sheet Excel with formulas, material tables, cost breakdown, and charts'},
    {id:'csv',icon:'⌗',label:'CSV DATA',color:'var(--cyan)',desc:'Raw measurement data for import into any CAD or BIM software'},
    {id:'json',icon:'{ }',label:'JSON API',color:'#a855f7',desc:'Structured JSON for integration with construction management systems'},
  ];

  const sampleData = {
    pdf: [
      'Project Name: Living Room Renovation',
      'Client: John Smith',
      'Date: ' + new Date().toLocaleDateString(),
      '─────────────────────────',
      'MEASUREMENTS',
      'Room Length: 5.70 m (18.7 ft)',
      'Room Width: 4.20 m (13.8 ft)',
      'Wall Height: 2.90 m (9.5 ft)',
      'Floor Area: 23.94 m² (257.7 sqft)',
      'Wall Area: 57.96 m²',
      '─────────────────────────',
      'MATERIALS',
      'Tiles Required: 240 pcs',
      'Paint Needed: 8.4 L',
      'Cement Bags: 11',
      'Total Cost Est: $1,240',
      '─────────────────────────',
      'Generated by SmartMeasure AI',
    ],
    excel: [
      '=== SHEET: Room Measurements ===',
      'A1: Dimension  B1: Meters  C1: Feet',
      'A2: Length     B2: 5.70    C2: 18.7',
      'A3: Width      B3: 4.20    C3: 13.8',
      'A4: Height     B4: 2.90    C4: 9.5',
      '',
      '=== SHEET: Material Estimation ===',
      'A1: Material   B1: Qty     C1: Unit',
      'A2: Tiles      B2: 240     C2: pcs',
      'A3: Paint      B3: 8.4     C3: Liters',
      'A4: Cement     B4: 11      C4: Bags',
      '',
      '=== SHEET: Cost Breakdown ===',
      'A1: Item       B1: Qty     C1: Rate  D1: Total',
      'A2: Tiles      B2: 240     C2: $2.50 D2: =B2*C2',
    ],
    csv: [
      'dimension,value_m,value_ft,value_in',
      'length,5.70,18.70,224.40',
      'width,4.20,13.78,165.35',
      'height,2.90,9.51,114.17',
      'floor_area,23.94,257.66,-',
      'wall_area,57.96,623.87,-',
      'volume,69.43,2452.0,-',
      'tiles_count,240,-,-',
      'paint_liters,8.4,-,-',
      'cement_bags,11,-,-',
    ],
    json: [
      '{',
      '  "project": "Living Room Scan",',
      '  "timestamp": "' + new Date().toISOString() + '",',
      '  "dimensions": {',
      '    "length": { "m": 5.70, "ft": 18.70 },',
      '    "width": { "m": 4.20, "ft": 13.78 },',
      '    "height": { "m": 2.90, "ft": 9.51 }',
      '  },',
      '  "materials": {',
      '    "tiles": 240,',
      '    "paint_liters": 8.4,',
      '    "cement_bags": 11',
      '  },',
      '  "cost_estimate": 1240',
      '}',
    ],
  };

  return (
    <section style={{padding:'80px 24px',maxWidth:1200,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:48}}
      >
        <div style={{
          display:'inline-flex',alignItems:'center',gap:8,padding:'6px 20px',
          borderRadius:30,background:'rgba(168,85,247,0.08)',border:'1px solid rgba(168,85,247,0.2)',
          marginBottom:20,
        }}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#a855f7',letterSpacing:2}}>
            SMART EXPORT ENGINE
          </span>
        </div>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,48px)',
          fontWeight:800,color:'var(--text)',marginBottom:16}}>
          PROFESSIONAL <span style={{color:'#a855f7'}}>REPORTS</span>
        </h2>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,maxWidth:1000,margin:'0 auto'}}>
        {/* Format selector */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {reportTypes.map(r => (
            <motion.button
              key={r.id}
              whileHover={{scale:1.02}}
              whileTap={{scale:0.98}}
              onClick={() => { setActiveReport(r.id); setGenerated(false); }}
              style={{
                padding:16,textAlign:'left',
                background: activeReport===r.id ? `${r.color}15` : 'var(--glass)',
                border: activeReport===r.id ? `1px solid ${r.color}60` : '1px solid var(--border)',
                borderRadius:10,cursor:'pointer',
              }}
            >
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                <span style={{fontSize:18}}>{r.icon}</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:12,fontWeight:700,
                  color: activeReport===r.id ? r.color : 'var(--text)',letterSpacing:1}}>
                  {r.label}
                </span>
              </div>
              <div style={{fontFamily:'var(--font-body)',fontSize:12,color:'var(--text2)',lineHeight:1.4}}>
                {r.desc}
              </div>
            </motion.button>
          ))}

          <motion.button
            whileHover={{scale:1.02,boxShadow:'0 0 20px rgba(168,85,247,0.3)'}}
            whileTap={{scale:0.98}}
            onClick={handleGenerate}
            style={{
              marginTop:8,padding:'14px',
              background: generating
                ? 'rgba(168,85,247,0.1)'
                : 'linear-gradient(135deg, #a855f7, #7c3aed)',
              border: generating ? '1px solid rgba(168,85,247,0.3)' : 'none',
              borderRadius:10,
              color:'#fff',fontFamily:'var(--font-display)',fontSize:12,
              fontWeight:800,letterSpacing:2,cursor:'pointer',
            }}
          >
            {generating ? '⟳ GENERATING...' : generated ? '✓ DOWNLOAD' : `↓ GENERATE ${activeReport.toUpperCase()}`}
          </motion.button>
        </div>

        {/* Preview */}
        <div style={{
          background:'#010812',border:'1px solid var(--border)',
          borderRadius:12,overflow:'hidden',
        }}>
          <div style={{
            padding:'10px 16px',
            background:'rgba(0,245,255,0.04)',
            borderBottom:'1px solid var(--border)',
            display:'flex',alignItems:'center',gap:8,
          }}>
            <div style={{display:'flex',gap:6}}>
              {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                <div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>
              ))}
            </div>
            <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',letterSpacing:1}}>
              {activeReport === 'pdf' ? 'report.pdf' : activeReport === 'excel' ? 'measurements.xlsx' : activeReport === 'csv' ? 'data.csv' : 'measurements.json'}
            </span>
            {generated && (
              <span style={{
                marginLeft:'auto',fontFamily:'var(--font-mono)',fontSize:9,
                color:'var(--neon)',background:'rgba(0,255,136,0.1)',
                padding:'2px 8px',borderRadius:4,
              }}>READY TO DOWNLOAD</span>
            )}
          </div>
          <div style={{padding:20,fontFamily:'var(--font-mono)',fontSize:12,
            color:'var(--text2)',lineHeight:1.8,minHeight:340}}>
            {sampleData[activeReport].map((line, i) => (
              <motion.div
                key={i}
                initial={{opacity:0,x:-10}}
                animate={{opacity:1,x:0}}
                transition={{delay:i*0.03}}
                style={{
                  color: line.startsWith('===') ? '#a855f7'
                    : line.startsWith('─') ? 'rgba(0,245,255,0.2)'
                    : line.includes(':') ? 'var(--text)'
                    : 'var(--text2)',
                }}
              >
                {line || '\u00A0'}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING SECTION ──────────────────────────────────────────────────────────
function PricingSection({ setActiveSection }) {
  const plans = [
    {
      name:'FREE',price:0,period:'forever',
      color:'var(--text2)',
      features:[
        '5 scans per month','Basic measurements','PDF export (watermarked)','Area calculator',
        'Email support',
      ],
      cta:'GET STARTED',
    },
    {
      name:'PRO',price:29,period:'month',
      color:'var(--cyan)',
      popular:true,
      features:[
        'Unlimited scans','All AI features','Clean PDF/Excel export','3D room scanner',
        'Material calculator','Cloud storage 10GB','API access','Priority support',
      ],
      cta:'START PRO',
    },
    {
      name:'ENTERPRISE',price:99,period:'month',
      color:'#a855f7',
      features:[
        'Everything in Pro','Team collaboration','White-label reports','Custom AI training',
        'BIM integration','Unlimited cloud','Dedicated support','SLA guarantee',
      ],
      cta:'CONTACT SALES',
    },
  ];

  return (
    <section style={{padding:'80px 24px',maxWidth:1000,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:56}}
      >
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(28px,4vw,48px)',
          fontWeight:800,color:'var(--text)',marginBottom:16}}>
          SIMPLE <span style={{color:'var(--cyan)'}}>PRICING</span>
        </h2>
        <p style={{fontFamily:'var(--font-body)',fontSize:16,color:'var(--text2)'}}>
          Start free. Scale as you build.
        </p>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {plans.map((p,i) => (
          <motion.div
            key={p.name}
            initial={{opacity:0,y:40}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.6,delay:i*0.1}}
            viewport={{once:true}}
            style={{
              background: p.popular ? `linear-gradient(160deg, ${p.color}08, var(--bg3))` : 'var(--glass)',
              border:`1px solid ${p.popular ? p.color+'60' : 'var(--border)'}`,
              borderRadius:16,padding:28,
              position:'relative',
            }}
          >
            {p.popular && (
              <div style={{
                position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',
                background:'linear-gradient(135deg, var(--cyan), var(--blue))',
                color:'#000',fontFamily:'var(--font-display)',fontSize:9,
                fontWeight:800,letterSpacing:2,
                padding:'4px 14px',borderRadius:20,whiteSpace:'nowrap',
              }}>
                MOST POPULAR
              </div>
            )}

            <div style={{fontFamily:'var(--font-display)',fontSize:12,fontWeight:700,
              color:p.color,letterSpacing:3,marginBottom:16}}>
              {p.name}
            </div>

            <div style={{marginBottom:24}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:42,fontWeight:900,color:'var(--text)'}}>
                ${p.price}
              </span>
              <span style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--text2)',marginLeft:4}}>
                /{p.period}
              </span>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:28}}>
              {p.features.map(f => (
                <div key={f} style={{display:'flex',alignItems:'flex-start',gap:8}}>
                  <span style={{color:p.color,marginTop:1,flexShrink:0}}>✓</span>
                  <span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--text2)'}}>
                    {f}
                  </span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{scale:1.03}}
              whileTap={{scale:0.97}}
              onClick={() => setActiveSection('scanner')}
              style={{
                width:'100%',padding:'12px',
                background: p.popular ? `linear-gradient(135deg, ${p.color}, var(--blue))` : 'transparent',
                border: p.popular ? 'none' : `1px solid ${p.color}60`,
                borderRadius:8,
                color: p.popular ? '#000' : p.color,
                fontFamily:'var(--font-display)',fontSize:11,fontWeight:800,letterSpacing:2,
                cursor:'pointer',
              }}
            >
              {p.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      name:'Marcus Reed',role:'Senior Architect',company:'BuildTech Studios',
      text:'SmartMeasure AI replaced our $3,000 laser measurement system. The AR overlays are incredibly precise and the PDF reports look more professional than anything we generated before.',
      rating:5,avatar:'MR',color:'var(--cyan)',
    },
    {
      name:'Sarah Chen',role:'Interior Designer',company:'Luxe Interiors',
      text:'I scan entire apartments in under 2 minutes and get instant tile/paint calculations. My clients are amazed when I show them the 3D room model during consultations.',
      rating:5,avatar:'SC',color:'var(--neon)',
    },
    {
      name:'Diego Torres',role:'General Contractor',company:'Torres Construction',
      text:'The material estimation feature alone has saved us thousands. No more manual calculations or ordering too much or too little cement and tiles.',
      rating:5,avatar:'DT',color:'#a855f7',
    },
  ];

  return (
    <section style={{padding:'80px 24px',maxWidth:1200,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:48}}
      >
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,3vw,40px)',
          fontWeight:800,color:'var(--text)',marginBottom:8}}>
          TRUSTED BY <span style={{color:'var(--cyan)'}}>PROFESSIONALS</span>
        </h2>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
        {testimonials.map((t,i) => (
          <motion.div
            key={t.name}
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.6,delay:i*0.1}}
            viewport={{once:true}}
            style={{
              background:'var(--glass)',border:'1px solid var(--border)',
              borderRadius:16,padding:24,
            }}
          >
            <div style={{display:'flex',gap:4,marginBottom:16}}>
              {Array.from({length:t.rating}).map((_,j) => (
                <span key={j} style={{color:'#f59e0b',fontSize:14}}>★</span>
              ))}
            </div>

            <p style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--text)',
              lineHeight:1.7,marginBottom:20,fontStyle:'italic'}}>
              "{t.text}"
            </p>

            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{
                width:40,height:40,borderRadius:'50%',
                background:`linear-gradient(135deg, ${t.color}, var(--bg3))`,
                border:`2px solid ${t.color}60`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'var(--font-display)',fontSize:12,fontWeight:700,color:t.color,
              }}>
                {t.avatar}
              </div>
              <div>
                <div style={{fontFamily:'var(--font-body)',fontSize:14,fontWeight:600,color:'var(--text)'}}>
                  {t.name}
                </div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text2)',letterSpacing:1}}>
                  {t.role} · {t.company}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorksSection({ setActiveSection }) {
  const steps = [
    {
      num:'01',title:'POINT & SCAN',
      desc:'Open SmartMeasure AI and point your camera at any space. The AI instantly activates plane detection, edge tracking, and depth sensors.',
      icon:'📱',color:'var(--cyan)',
    },
    {
      num:'02',title:'AI MEASURES',
      desc:'Machine learning algorithms detect all surfaces, corners, and objects. Real-time AR overlays show precise dimensions as you scan.',
      icon:'🧠',color:'var(--neon)',
    },
    {
      num:'03',title:'CALCULATE & EXPORT',
      desc:'Get instant material calculations, cost estimates, and export professional PDF/Excel reports in one tap.',
      icon:'📊',color:'#a855f7',
    },
  ];

  return (
    <section style={{padding:'80px 24px',maxWidth:1000,margin:'0 auto'}}>
      <motion.div
        initial={{opacity:0,y:40}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.8}}
        viewport={{once:true}}
        style={{textAlign:'center',marginBottom:56}}
      >
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'clamp(24px,3vw,40px)',
          fontWeight:800,color:'var(--text)',marginBottom:8}}>
          HOW IT <span style={{color:'var(--cyan)'}}>WORKS</span>
        </h2>
        <p style={{fontFamily:'var(--font-body)',fontSize:16,color:'var(--text2)'}}>
          Three steps to professional measurements
        </p>
      </motion.div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0,position:'relative'}}>
        {/* Connecting line */}
        <div style={{
          position:'absolute',top:40,left:'16.5%',right:'16.5%',height:1,
          background:'linear-gradient(90deg, var(--cyan), var(--neon), #a855f7)',
          opacity:0.3,
        }}/>

        {steps.map((s,i) => (
          <motion.div
            key={s.num}
            initial={{opacity:0,y:40}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.6,delay:i*0.15}}
            viewport={{once:true}}
            style={{textAlign:'center',padding:'0 24px'}}
          >
            <div style={{
              width:80,height:80,borderRadius:'50%',
              background:`linear-gradient(135deg, ${s.color}20, var(--bg3))`,
              border:`2px solid ${s.color}60`,
              display:'flex',alignItems:'center',justifyContent:'center',
              margin:'0 auto 24px',fontSize:32,
              boxShadow:`0 0 30px ${s.color}20`,
            }}>
              {s.icon}
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:10,fontWeight:700,
              color:s.color,letterSpacing:3,marginBottom:8}}>
              STEP {s.num}
            </div>
            <h3 style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:800,
              color:'var(--text)',marginBottom:10,letterSpacing:1}}>
              {s.title}
            </h3>
            <p style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--text2)',lineHeight:1.7}}>
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{opacity:0,y:20}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:0.6,delay:0.4}}
        viewport={{once:true}}
        style={{textAlign:'center',marginTop:56}}
      >
        <motion.button
          whileHover={{scale:1.05,boxShadow:'0 0 40px rgba(0,245,255,0.5)'}}
          whileTap={{scale:0.95}}
          onClick={() => setActiveSection('scanner')}
          style={{
            padding:'16px 48px',
            background:'linear-gradient(135deg, var(--cyan), var(--blue))',
            color:'#000',border:'none',borderRadius:10,
            fontFamily:'var(--font-display)',fontSize:14,fontWeight:900,letterSpacing:3,
            cursor:'pointer',
          }}
        >
          ▶ TRY THE DEMO NOW
        </motion.button>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop:'1px solid var(--border)',
      padding:'40px 24px',
      textAlign:'center',
    }}>
      <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:800,
        color:'var(--cyan)',letterSpacing:4,marginBottom:8}}>
        SMARTMEASURE AI
      </div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',letterSpacing:2,marginBottom:24}}>
        THE FUTURE OF CONSTRUCTION MEASUREMENT
      </div>
      <div style={{display:'flex',justifyContent:'center',gap:32,flexWrap:'wrap'}}>
        {['Privacy','Terms','Docs','API','Blog','Support'].map(l => (
          <span key={l} style={{
            fontFamily:'var(--font-body)',fontSize:13,color:'var(--text2)',
            cursor:'pointer',letterSpacing:1,
            transition:'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color='var(--cyan)'}
          onMouseLeave={e => e.target.style.color='var(--text2)'}
          >
            {l}
          </span>
        ))}
      </div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'rgba(126,184,212,0.4)',
        marginTop:24,letterSpacing:1}}>
        © 2026 SmartMeasure AI · All Rights Reserved
      </div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [arOpen, setArOpen] = useState(false);

  const openAR = () => setArOpen(true);
  const closeAR = () => setArOpen(false);

  // Intercept scanner nav to open real AR camera
  const handleSetSection = (section) => {
    if (section === 'scanner') {
      openAR();
    } else {
      setActiveSection(section);
    }
  };

  const renderContent = () => {
    if (activeSection === 'home') {
      return (
        <>
          <HeroSection setActiveSection={handleSetSection}/>
          <FeaturesSection/>
          <HowItWorksSection setActiveSection={handleSetSection}/>
          <TestimonialsSection/>
          <PricingSection setActiveSection={handleSetSection}/>
          <Footer/>
        </>
      );
    }
    if (activeSection === 'features') return <><FeaturesSection/><Footer/></>;
    if (activeSection === 'calculator') return <><CalculatorSection/><Footer/></>;
    if (activeSection === 'reports') return <><ReportsSection/><Footer/></>;
    if (activeSection === 'pricing') return <><PricingSection setActiveSection={handleSetSection}/><Footer/></>;
    return <><HeroSection setActiveSection={handleSetSection}/><Footer/></>;
  };

  return (
    <>
      <style>{fontStyle}</style>

      {/* Full-screen AR Camera overlay */}
      <AnimatePresence>
        {arOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <ARCamera onBack={closeAR} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{minHeight:'100vh',background:'var(--bg)',position:'relative'}}>
        <Particles/>
        <div style={{position:'relative',zIndex:1}}>
          <Nav activeSection={activeSection} setActiveSection={handleSetSection}/>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-20}}
              transition={{duration:0.4}}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
