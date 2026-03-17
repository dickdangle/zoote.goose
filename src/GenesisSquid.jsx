import { useState, useEffect, useRef } from "react";

const W = 800, H = 800, CX = W / 2, CY = H / 2;
const SHELLS = 8;
const RINGS = 8, TPR = 18;
const TRAIL_LEN = 22;

const SHELL_HUES = [0, 30, 60, 120, 180, 220, 270, 310];
const SHELL_NAMES = ["RED", "AMBER", "GOLD", "GREEN", "CYAN", "BLUE", "VIOLET", "ROSE"];
const SHELL_R = s => 38 + s * 52;
const TILT = s => 0.28 + s * 0.025;

const SQUID_REGISTRY = [
  { id: "S1", label: "hyperlattice",  hue: 220, desc: "kangxi radical primitive keys" },
  { id: "S2", label: "supersphere",   hue: 270, desc: "ising tiles · concentric spherai" },
  { id: "S3", label: "manifold",      hue: 180, desc: "sinusoidal wave fabric · X/Y/Z" },
  { id: "S4", label: "vamptracker",   hue: 0,   desc: "blood · smut · narrative state" },
  { id: "S5", label: "genesis.squid", hue: 60,  desc: "world origin · this · ○" },
];

function makeTiles() {
  const t = [];
  for (let s = 0; s < SHELLS; s++)
    for (let r = 0; r < RINGS; r++)
      for (let i = 0; i < TPR; i++)
        t.push({
          s, r, i,
          spin: Math.random() > 0.5 ? 1 : -1,
          vLon: (Math.random() - 0.5) * 0.018,
          vLat: (Math.random() - 0.5) * 0.009,
          dLon: 0, dLat: 0,
          energy: 0, pressure: 0,
          toroDir: Math.random() > 0.5 ? 1 : -1,
          trail: []
        });
  return t;
}

function iIdx(tiles, s, r, i) {
  return tiles.find(t => t.s === s && t.r === r && t.i === ((i + TPR) % TPR));
}

export default function GenesisSquid() {
  const canvasRef = useRef(null);
  const tilesRef = useRef(makeTiles());
  const frameRef = useRef(0);
  const coneRef = useRef(0);
  const runRef = useRef(true);
  const pRef = useRef({
    temp: 2.27,
    speed: 1.0,
    toroidalB: 0.018,
    chaos: 0.2,
    amplitude: 18,
    tilt: 0.50,
    gravity: true,
    sinews: true,
    ghosts: true,
    interpenetrate: true,
    sinewDepth: 2,
  });
  const [params, setParams] = useState(pRef.current);
  const [running, setRunning] = useState(true);
  const [activeSquid, setActiveSquid] = useState("S5");
  const [stats, setStats] = useState({ M: "0.000", frame: 0 });
  const [selectedShell, setSelectedShell] = useState(null);
  const selectedShellRef = useRef(null);

  const up = (k, v) => { pRef.current = { ...pRef.current, [k]: v }; setParams({ ...pRef.current }); };

  function waveZ(nx, ny, t) {
    const p = pRef.current;
    const x = (nx / 40 - 0.5) * 2, y = (ny / 40 - 0.5) * 2;
    const r = Math.sqrt(x * x + y * y);
    const w1 = Math.sin(r * p.chaos * 60 - t * p.speed * 2.0) * p.amplitude;
    const w2 = Math.sin((x + y) * 40 * 0.1 - t * p.speed * 1.6) * p.amplitude * 0.5;
    return (w1 + w2) * Math.exp(-r * r * 0.9);
  }

  function getTilePos(tile) {
    const p = pRef.current;
    const sR = SHELL_R(tile.s), tilt = TILT(tile.s);
    const ringAngle = (tile.r / RINGS) * Math.PI + tile.dLat;
    const lonAngle = (tile.i / TPR) * Math.PI * 2 + tile.dLon + coneRef.current * (1 + tile.s * 0.10);
    const rY = Math.cos(Math.max(0.05, Math.min(Math.PI - 0.05, ringAngle)));
    const rS = Math.sin(Math.max(0.05, Math.min(Math.PI - 0.05, ringAngle)));
    const projR = sR * rS;
    let waveOff = 0;
    if (p.interpenetrate) {
      const nx = (Math.cos(lonAngle) * projR / (40 * 6.8) + 0.5) * 40;
      const ny = (Math.sin(lonAngle) * projR * tilt / (40 * 5.5) + 0.5) * 40;
      waveOff = waveZ(nx, ny, frameRef.current) * 0.20;
    }
    const px = CX + Math.cos(lonAngle) * projR;
    const py = CY + rY * sR * tilt * (-2.3) + Math.sin(lonAngle) * projR * tilt + waveOff * 12;
    return { px, py, scale: rS, depth: rY + tile.s * 0.01 };
  }

  function stepIsing() {
    const tiles = tilesRef.current;
    const T = Math.max(pRef.current.temp, 0.01);
    const p = pRef.current;

    for (let k = 0; k < 14; k++) {
      const i2 = Math.floor(Math.random() * tiles.length);
      const t = tiles[i2];
      const nb = [
        iIdx(tiles, t.s, t.r, t.i - 1), iIdx(tiles, t.s, t.r, t.i + 1),
        iIdx(tiles, t.s, (t.r - 1 + RINGS) % RINGS, t.i), iIdx(tiles, t.s, (t.r + 1) % RINGS, t.i),
      ].filter(Boolean);
      const sumN = nb.reduce((a, n) => a + n.spin, 0);
      const dE = 2 * t.spin * sumN;
      t.energy = dE;
      if (dE < 0 || Math.random() < Math.exp(-dE / T)) {
        t.spin *= -1;
      }
    }

    // Update toroidal drift and lattice motion
    for (const t of tiles) {
      const p2 = pRef.current;
      // Toroidal drift
      t.dLon += t.toroDir * p2.toroidalB * p2.speed;
      // Latitude drift
      t.dLat += t.vLat * p2.speed;
      // Gravity-like restoring force on latitude
      if (p2.gravity) {
        const equator = Math.PI / 2;
        const ringAngle = (t.r / RINGS) * Math.PI + t.dLat;
        t.vLat -= (ringAngle - equator) * 0.0003 * p2.speed;
        t.vLat *= 0.995;
      }
      // Longitude velocity
      t.dLon += t.vLon * p2.speed;
      t.vLon *= 0.997;

      // Wrap longitude
      t.dLon = t.dLon % (Math.PI * 2);
      // Clamp latitude drift
      t.dLat = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, t.dLat));

      // Pressure from energy
      t.pressure = Math.abs(t.energy) / 8;
    }

    // Advance cone rotation
    coneRef.current += 0.0012 * p.speed;
  }

  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const p = pRef.current;
    const tiles = tilesRef.current;
    const frame = frameRef.current;

    // Background
    ctx.fillStyle = "#060812";
    ctx.fillRect(0, 0, W, H);

    // Draw sinew connections first (behind tiles)
    if (p.sinews) {
      for (let s = 0; s < SHELLS; s++) {
        const shellTiles = tiles.filter(t => t.s === s);
        const hue = SHELL_HUES[s];
        for (const t of shellTiles) {
          const pos = getTilePos(t);
          // Connect to adjacent tiles in ring
          const right = iIdx(tiles, s, t.r, t.i + 1);
          if (right) {
            const rpos = getTilePos(right);
            const depth = Math.min(p.sinewDepth, SHELLS);
            if (t.s < depth) {
              ctx.beginPath();
              ctx.moveTo(pos.px, pos.py);
              ctx.lineTo(rpos.px, rpos.py);
              ctx.strokeStyle = `hsla(${hue},70%,55%,0.12)`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
          // Connect to next ring
          const down = iIdx(tiles, s, (t.r + 1) % RINGS, t.i);
          if (down && t.s < p.sinewDepth) {
            const dpos = getTilePos(down);
            ctx.beginPath();
            ctx.moveTo(pos.px, pos.py);
            ctx.lineTo(dpos.px, dpos.py);
            ctx.strokeStyle = `hsla(${hue},60%,45%,0.08)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Draw trails (ghosts)
    if (p.ghosts) {
      for (const t of tiles) {
        if (t.trail.length < 2) continue;
        const hue = SHELL_HUES[t.s];
        for (let i = 1; i < t.trail.length; i++) {
          const alpha = (i / t.trail.length) * 0.18;
          ctx.beginPath();
          ctx.arc(t.trail[i].px, t.trail[i].py, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},80%,65%,${alpha})`;
          ctx.fill();
        }
      }
    }

    // Collect and sort tiles by depth (painter's algorithm)
    const sorted = tiles
      .map(t => ({ tile: t, pos: getTilePos(t) }))
      .sort((a, b) => a.pos.depth - b.pos.depth);

    for (const { tile: t, pos } of sorted) {
      const hue = SHELL_HUES[t.s];
      const spinColor = t.spin > 0 ? `hsl(${hue},85%,62%)` : `hsl(${(hue + 180) % 360},70%,45%)`;
      const r = Math.max(1.5, 4.5 * pos.scale * (0.7 + t.pressure * 0.5));

      // Highlight selected shell
      const isSelected = selectedShellRef.current === t.s;
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pos.px, pos.py, r + 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},100%,80%,0.18)`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(pos.px, pos.py, r, 0, Math.PI * 2);
      ctx.fillStyle = spinColor;
      ctx.fill();

      // Update trail
      t.trail.push({ px: pos.px, py: pos.py });
      if (t.trail.length > TRAIL_LEN) t.trail.shift();
    }

    // HUD: shell labels
    for (let s = 0; s < SHELLS; s++) {
      const labelTile = tiles.find(t => t.s === s && t.r === 0 && t.i === 0);
      if (labelTile) {
        const pos = getTilePos(labelTile);
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = `hsla(${SHELL_HUES[s]},90%,75%,0.7)`;
        ctx.fillText(SHELL_NAMES[s], pos.px + 6, pos.py - 6);
      }
    }

    // Stats overlay
    const M = tiles.reduce((a, t) => a + t.spin, 0) / tiles.length;
    frameRef.current++;
    if (frame % 12 === 0) {
      setStats({ M: M.toFixed(3), frame: frameRef.current });
    }
  };

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  useEffect(() => {
    let animId;
    function loop() {
      if (runRef.current) {
        stepIsing();
        drawFrameRef.current();
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleRun = () => {
    runRef.current = !runRef.current;
    setRunning(r => !r);
  };

  const reset = () => {
    tilesRef.current = makeTiles();
    frameRef.current = 0;
    coneRef.current = 0;
  };

  const sliders = [
    { key: "temp",       label: "Temperature",      min: 0.1,  max: 6,    step: 0.01 },
    { key: "speed",      label: "Speed",             min: 0.01, max: 3,    step: 0.01 },
    { key: "toroidalB",  label: "Toroidal B",        min: 0,    max: 0.06, step: 0.001 },
    { key: "chaos",      label: "Chaos",             min: 0,    max: 1,    step: 0.01 },
    { key: "amplitude",  label: "Amplitude",         min: 0,    max: 60,   step: 0.5 },
    { key: "tilt",       label: "Tilt/Zoom",         min: 0.1,  max: 1.2,  step: 0.01 },
    { key: "sinewDepth", label: "Sinew Depth",       min: 0,    max: SHELLS, step: 1 },
  ];

  const toggles = [
    { key: "gravity",       label: "Gravity" },
    { key: "sinews",        label: "Sinews" },
    { key: "ghosts",        label: "Ghosts" },
    { key: "interpenetrate", label: "Interpenetrate" },
  ];

  return (
    <div style={{ display: "flex", gap: 20, padding: 16, background: "#040610", minHeight: "100vh", color: "#cce" }}>
      {/* Canvas */}
      <div style={{ flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ border: "1px solid #223", borderRadius: 6, display: "block" }}
        />
        <div style={{ marginTop: 8, fontSize: 11, color: "#88a", fontFamily: "monospace" }}>
          ⟨M⟩ = {stats.M} &nbsp;|&nbsp; frame {stats.frame} &nbsp;|&nbsp; tiles {SHELLS * RINGS * TPR}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 260 }}>
        {/* Run/Reset */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={toggleRun} style={btnStyle(running ? "#36a" : "#a33")}>
            {running ? "⏸ Pause" : "▶ Run"}
          </button>
          <button onClick={reset} style={btnStyle("#353")}>
            ↺ Reset
          </button>
        </div>

        {/* SQUID Registry */}
        <div style={{ background: "#0b0f1e", borderRadius: 6, padding: 10, border: "1px solid #224" }}>
          <div style={{ fontSize: 11, color: "#78a", marginBottom: 6, fontFamily: "monospace", letterSpacing: 1 }}>
            ◈ SQUID REGISTRY
          </div>
          {SQUID_REGISTRY.map(sq => (
            <div
              key={sq.id}
              onClick={() => setActiveSquid(sq.id)}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                marginBottom: 3,
                cursor: "pointer",
                background: activeSquid === sq.id ? `hsla(${sq.hue},60%,20%,0.7)` : "transparent",
                border: `1px solid ${activeSquid === sq.id ? `hsl(${sq.hue},60%,40%)` : "transparent"}`,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 10, color: `hsl(${sq.hue},70%,60%)`, fontFamily: "monospace", fontWeight: "bold" }}>
                {sq.id}
              </span>
              <span style={{ fontSize: 11, color: "#aac", marginLeft: 6 }}>{sq.label}</span>
              <div style={{ fontSize: 9, color: "#557", marginTop: 1 }}>{sq.desc}</div>
            </div>
          ))}
        </div>

        {/* Shell Selector */}
        <div style={{ background: "#0b0f1e", borderRadius: 6, padding: 10, border: "1px solid #224" }}>
          <div style={{ fontSize: 11, color: "#78a", marginBottom: 6, fontFamily: "monospace", letterSpacing: 1 }}>
            ◎ SHELLS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {SHELL_NAMES.map((name, s) => (
              <div
                key={s}
                onClick={() => {
                    const next = selectedShell === s ? null : s;
                    selectedShellRef.current = next;
                    setSelectedShell(next);
                  }}
                style={{
                  padding: "2px 8px",
                  borderRadius: 3,
                  fontSize: 10,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  background: selectedShell === s ? `hsl(${SHELL_HUES[s]},60%,22%)` : "#111",
                  border: `1px solid hsl(${SHELL_HUES[s]},50%,${selectedShell === s ? 55 : 30}%)`,
                  color: `hsl(${SHELL_HUES[s]},80%,65%)`,
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ background: "#0b0f1e", borderRadius: 6, padding: 10, border: "1px solid #224" }}>
          <div style={{ fontSize: 11, color: "#78a", marginBottom: 6, fontFamily: "monospace", letterSpacing: 1 }}>
            ⊛ PARAMETERS
          </div>
          {sliders.map(({ key, label, min, max, step }) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#889", fontFamily: "monospace" }}>
                <span>{label}</span>
                <span>{params[key]}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={params[key]}
                onChange={e => up(key, parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#55a" }}
              />
            </div>
          ))}

          {/* Toggles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {toggles.map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#99b", cursor: "pointer", fontFamily: "monospace" }}>
                <input
                  type="checkbox"
                  checked={params[key]}
                  onChange={e => up(key, e.target.checked)}
                  style={{ accentColor: "#55a" }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Active SQUID info */}
        {activeSquid && (() => {
          const sq = SQUID_REGISTRY.find(s => s.id === activeSquid);
          return sq ? (
            <div style={{
              background: `hsla(${sq.hue},40%,8%,0.8)`,
              border: `1px solid hsl(${sq.hue},50%,30%)`,
              borderRadius: 6,
              padding: 10,
              fontFamily: "monospace",
            }}>
              <div style={{ fontSize: 12, color: `hsl(${sq.hue},70%,65%)`, fontWeight: "bold" }}>
                {sq.id} · {sq.label}
              </div>
              <div style={{ fontSize: 10, color: "#889", marginTop: 4 }}>{sq.desc}</div>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    background: bg,
    color: "#dde",
    border: "none",
    borderRadius: 4,
    padding: "6px 14px",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: 12,
  };
}
