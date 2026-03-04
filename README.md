# zoote.goose
silly goose model
//.break.rnw.


author::someguy...gottagetsome.eth

//.brownian.motion.
/*
 * PROJECT ZOOTER
 * JSON i2c LENR
 * github.com/dickdangle · GPL-3.0
 * SESSION_X · } SQUID { · ○
 *
 * ============================================================
 * WHITEPAPER: Emergent Toroidal Motion from Per-Particle
 * Chirality in an Ising Model on Concentric Spherical Manifolds
 * ============================================================
 *
 * ABSTRACT:
 * Toroidal EM-like motion emerges spontaneously from local spin
 * interactions without external field imposition. Each particle
 * carries intrinsic toroidal chirality (±1) coupling to local
 * spin pressure gradients on N concentric spherical manifolds.
 * At T≈2.27 (Ising critical point), spin disagreement generates
 * lateral pressure waves driving per-particle toroidal velocity
 * modulated by sin(θ). The toroid is not imposed. It arrives.
 *
 * GEOMETRY:
 * L0    = ○ void / goose egg / world origin / operator
 * L1-L7 = DO RE MI FA SOL LA TI (spherical harmonic shells)
 * L8    = DO' octave / return / completion
 * L9    = hatch / critical mass / break / operator
 *
 * Musical mapping: shells are solfège. Ghost traces are melody.
 * Bezier sinews are harmony. Toroidal ± drift is rhythm.
 * T=2.27 is the key signature. L7 (TI) is maximum tension.
 *
 * ADDRESS SPACE:
 * Not 54 discrete cards but 4π steradians — full solid angle.
 * ∫∫ sin(θ)dθdφ = 4π weighted by shell L = spherical harmonics.
 * Tarot cards = basins of attraction in (θ,φ,L,t) space.
 * Ghost traces = 4D worldlines / regression traces through
 * the meaning landscape. The human is the measurement.
 *
 * TILE / TAROT:
 * Each tile = tarot card OR goose egg (p=0.66 / p=0.34)
 * face toward centroid = archetype expressed
 * back toward centroid = archetype occulted
 * spin ↑ + face = upright meaning, flowing inward
 * spin ↑ + back = upright meaning, flowing outward
 * spin ↓ + face = reversed meaning, flowing inward
 * spin ↓ + back = reversed meaning, flowing outward
 * flip = moment of revelation / plot twist
 *
 * SEEDING:
 * tokens → tile population
 * meta_operator { μ: mutation_rate, σ: scramble_aggression }
 * μ = what % of tokens get scrambled (entropy injection)
 * σ = how hard (non-local percolation element)
 *
 * TICK ENGINE:
 * shell_population(L) = f(ticks, input)
 * every 2 ticks: compute 3rd derivative (jerk) of N at layer L
 * squids percolate outward chaotically
 * at each shell boundary: toroidal motion → pop UP or DOWN
 * percolation ceiling = layer where up/down probability = 0.5
 *
 * HATCH CONDITION:
 * goose egg hatches when L9 reaches critical mass:
 * N particles from any LX have crossed L0 thrice
 * L0 = the toll gate. three crossings = birth. 🪿
 *
 * SQUID REGISTRY:
 * S1 = hyperlattice    (kangxi radical primitive keys)
 * S2 = supersphere     (ising tiles · concentric spherai)
 * S3 = manifold        (sinusoidal wave fabric · X/Y/Z)
 * S4 = vamptracker     (blood · smut · narrative state)
 * S5 = genesis.squid   (world origin · this · ○)
 *
 * LENR NOTE:
 * Like low energy nuclear reaction — not supposed to work.
 * Keeps working anyway. Don't concretize it.
 * The wavefunction stays open. The human is the measurement.
 *
 * "The toroid does not need to be told to exist."
 * ============================================================
 */

import { useState, useEffect, useRef } from "react";

const W = 800, H = 800, CX = W/2, CY = H/2;
const SHELLS = 8;
const RINGS = 8, TPR = 18;
const TRAIL_LEN = 22;

// L0=egg/void, L1-L7=DO-TI, L8=DO', L9=hatch/break
const SHELL_HUES  = [0, 30, 60, 120, 180, 220, 270, 310];
const SHELL_NAMES = ["DO","RE","MI","FA","SOL","LA","TI","DO'"];
const SHELL_NOTES = ["C","D","E","F","G","A","B","C'"];
const SHELL_R = s => 38 + s * 52;
const TILT    = s => 0.28 + s * 0.025;

const SQUID_REGISTRY = [
  { id:"S1", label:"hyperlattice",  hue:220, desc:"kangxi radical primitive keys" },
  { id:"S2", label:"supersphere",   hue:270, desc:"ising tiles · concentric spherai" },
  { id:"S3", label:"manifold",      hue:180, desc:"sinusoidal wave fabric · X/Y/Z" },
  { id:"S4", label:"vamptracker",   hue:0,   desc:"blood · smut · narrative state" },
  { id:"S5", label:"genesis.squid", hue:60,  desc:"world origin · this · ○" },
];

// Tarot seed: 0.66 = card, 0.34 = egg
function tileType() { return Math.random() < 0.66 ? "tarot" : "egg"; }

function makeTiles() {
  const t = [];
  for (let s = 0; s < SHELLS; s++)
    for (let r = 0; r < RINGS; r++)
      for (let i = 0; i < TPR; i++)
        t.push({
          s, r, i,
          spin: Math.random()>0.5?1:-1,
          vLon: (Math.random()-0.5)*0.018,
          vLat: (Math.random()-0.5)*0.009,
          dLon: 0, dLat: 0,
          energy: 0, pressure: 0,
          toroDir: Math.random()>0.5?1:-1,
          facing: Math.random()>0.5?1:-1, // +1=face in, -1=face out
          type: tileType(),               // "tarot" or "egg"
          crossings: 0,                   // L0 crossing count
          trail: []
        });
  return t;
}

function iIdx(tiles, s, r, i) {
  return tiles.find(t => t.s===s && t.r===r && t.i===((i+TPR)%TPR));
}

export default function GenesisSquid() {
  const canvasRef    = useRef(null);
  const tilesRef     = useRef(makeTiles());
  const frameRef     = useRef(0);
  const coneRef      = useRef(0);
  const runRef       = useRef(true);
  const hatchRef     = useRef(0); // crossing counter
  const pRef = useRef({
    temp:2.27, speed:1.0, toroidalB:0.018,
    amplitude:18, tilt:0.50, gravity:true,
    sinews:true, ghosts:true, interpenetrate:true,
    sinewDepth:2, mu:0.3, sigma:0.5,
  });
  const [params, setParams]         = useState(pRef.current);
  const [running, setRunning]       = useState(true);
  const [activeSquid, setActiveSquid] = useState("S5");
  const [stats, setStats]           = useState({M:"0.000",frame:0,crossings:0,hatched:false});
  const [selectedShell, setSelectedShell] = useState(null);

  const up = (k,v) => { pRef.current={...pRef.current,[k]:v}; setParams({...pRef.current}); };

  function waveZ(nx,ny,t) {
    const p=pRef.current;
    const x=(nx/40-0.5)*2, y=(ny/40-0.5)*2;
    const r=Math.sqrt(x*x+y*y);
    return (Math.sin(r*p.amplitude*0.04-t*p.speed*2.0)*p.amplitude
           +Math.sin((x+y)*4-t*p.speed*1.6)*p.amplitude*0.5)
           *Math.exp(-r*r*0.9);
  }

  function proj(x3,y3,z3) {
    const sc=pRef.current.tilt;
    return {px:CX+(x3-y3)*sc*6.8, py:CY+(x3+y3)*sc*5.5-z3*sc*0.8};
  }

  function getTilePos(tile) {
    const p=pRef.current;
    const sR=SHELL_R(tile.s), tilt=TILT(tile.s);
    const ringAngle=(tile.r/RINGS)*Math.PI+tile.dLat;
    const lonAngle=(tile.i/TPR)*Math.PI*2+tile.dLon+coneRef.current*(1+tile.s*0.10);
    const rY=Math.cos(Math.max(0.05,Math.min(Math.PI-0.05,ringAngle)));
    const rS=Math.sin(Math.max(0.05,Math.min(Math.PI-0.05,ringAngle)));
    const projR=sR*rS;
    let waveOff=0;
    if(p.interpenetrate){
      const nx=(Math.cos(lonAngle)*projR/(40*6.8)+0.5)*40;
      const ny=(Math.sin(lonAngle)*projR*tilt/(40*5.5)+0.5)*40;
      waveOff=waveZ(nx,ny,frameRef.current)*0.20;
    }
    return {
      px: CX+Math.cos(lonAngle)*projR,
      py: CY+rY*sR*tilt*(-2.3)+Math.sin(lonAngle)*projR*tilt+waveOff*12,
      scale:rS, depth:rY+tile.s*0.01
    };
  }

  function stepIsing() {
    const tiles=tilesRef.current;
    const T=Math.max(pRef.current.temp,0.01);
    const p=pRef.current;

    for(let k=0;k<14;k++){
      const i2=Math.floor(Math.random()*tiles.length);
      const t=tiles[i2];
      const nb=[
        iIdx(tiles,t.s,t.r,t.i-1),iIdx(tiles,t.s,t.r,t.i+1),
        iIdx(tiles,t.s,(t.r-1+RINGS)%RINGS,t.i),iIdx(tiles,t.s,(t.r+1)%RINGS,t.i),
      ].filter(Boolean);
      const sumN=nb.reduce((a,n)=>a+n.spin,0);
      const dE=2*t.spin*sumN; t.energy=dE;
      if(dE<0||Math.random()<Math.exp(-dE/T)){
        t.spin*=-1;
        // entropy injection via mu/sigma (meta_operator)
        if(Math.random()<p.mu) t.facing*=Math.random()<p.sigma?-1:1;
      }
    }

    tiles.forEach(t=>{
      const right=iIdx(tiles,t.s,t.r,t.i+1);
      const up2=iIdx(tiles,t.s,(t.r+1)%RINGS,t.i);
      const dLon=right?(right.spin-t.spin)*0.007:0;
      const dLat=up2?(up2.spin-t.spin)*0.005:0;
      t.pressure=Math.abs(dLon)+Math.abs(dLat);
      t.vLon=(t.vLon+dLon)*0.92;
      t.vLat=(t.vLat+dLat)*0.92;

      // toroidal ± per tile
      const latAngle=(t.r/RINGS)*Math.PI+t.dLat;
      t.vLon+=p.toroidalB*t.toroDir*Math.sin(latAngle);

      t.vLon=Math.max(-0.07,Math.min(0.07,t.vLon));
      t.vLat=Math.max(-0.04,Math.min(0.04,t.vLat));
      t.dLon=(t.dLon+t.vLon+Math.PI*2)%(Math.PI*2);
      t.dLat=Math.max(-0.4,Math.min(0.4,t.dLat+t.vLat));

      // L0 crossing check — toll gate
      const prevS=t.s;
      if(t.s===0 && Math.abs(t.dLat)<0.05){
        t.crossings=(t.crossings||0)+1;
        if(t.crossings%3===0) hatchRef.current++;
      }

      const pos=getTilePos(t);
      t.trail.push({px:pos.px,py:pos.py,spin:t.spin,type:t.type,facing:t.facing});
      if(t.trail.length>TRAIL_LEN) t.trail.shift();
    });

    if(p.gravity){
      for(let s=1;s<SHELLS;s++){
        const inner=tiles.filter(t=>t.s===s-1);
        const outer=tiles.filter(t=>t.s===s);
        const iMag=inner.reduce((a,t)=>a+t.spin,0)/inner.length;
        outer.forEach(t=>{t.vLon+=iMag*0.0006;});
      }
    }
  }

  function draw() {
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    const p=pRef.current;
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(CX,CY,0,CX,CY,W*0.7);
    bg.addColorStop(0,"#060010"); bg.addColorStop(0.5,"#020008"); bg.addColorStop(1,"#000003");
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    const tiles=tilesRef.current;
    const hatched=hatchRef.current>=9;

    // shell outlines + note labels
    for(let s=SHELLS-1;s>=0;s--){
      const sR=SHELL_R(s),tilt=TILT(s),hue=SHELL_HUES[s];
      const isActive=selectedShell===s;
      ctx.beginPath();
      ctx.ellipse(CX,CY,sR,sR*tilt*2.3,0,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${hue},60%,${isActive?45:18}%,${isActive?0.5:0.10})`;
      ctx.lineWidth=isActive?1.5:0.5; ctx.stroke();
      ctx.fillStyle=`hsla(${hue},60%,38%,0.35)`;
      ctx.font="8px monospace";
      ctx.fillText(`L${s+1} ${SHELL_NAMES[s]} ${SHELL_NOTES[s]}`,CX+sR+4,CY);
    }

    // GHOST TRAILS — worldlines / 4D regression traces
    if(p.ghosts){
      tiles.forEach(tile=>{
        const trail=tile.trail;
        if(trail.length<2) return;
        const hue=SHELL_HUES[tile.s];
        for(let k=1;k<trail.length;k++){
          const a=(k/trail.length)*0.28;
          const isTarot=trail[k].type==="tarot";
          ctx.beginPath();
          ctx.moveTo(trail[k-1].px,trail[k-1].py);
          ctx.lineTo(trail[k].px,trail[k].py);
          ctx.strokeStyle=`hsla(${hue},${isTarot?85:40}%,${trail[k].spin===1?60:30}%,${a})`;
          ctx.lineWidth=isTarot?0.9:0.4; ctx.stroke();
        }
      });
    }

    // BEZIER SINEWS — harmonic relationships
    if(p.sinews){
      const depth=Math.max(1,Math.min(3,p.sinewDepth|0));
      tiles.forEach(tile=>{
        const posA=getTilePos(tile);
        if(posA.scale<0.06) return;
        const hue=SHELL_HUES[tile.s];
        for(let d=1;d<=depth;d++){
          [iIdx(tiles,tile.s,tile.r,tile.i+d),
           iIdx(tiles,tile.s,(tile.r+d)%RINGS,tile.i)
          ].filter(Boolean).forEach(nb=>{
            const posB=getTilePos(nb);
            if(posB.scale<0.06) return;
            const agree=tile.spin===nb.spin;
            const faceHarmony=tile.facing===nb.facing;
            const tension=(tile.pressure+nb.pressure)*0.5;
            const alpha=agree?0.10+tension*0.28:0.03+tension*0.12;
            if(alpha<0.015) return;
            const mx=(posA.px+posB.px)/2,my=(posA.py+posB.py)/2;
            const dx=posB.px-posA.px,dy=posB.py-posA.py;
            const len=Math.sqrt(dx*dx+dy*dy)||1;
            const bulge=(tension*28+7)*(agree?1:-1)*(faceHarmony?1:-0.5);
            const cpx=mx+(-dy/len)*bulge,cpy=my+(dx/len)*bulge;
            ctx.beginPath();
            ctx.moveTo(posA.px,posA.py);
            ctx.quadraticCurveTo(cpx,cpy,posB.px,posB.py);
            ctx.strokeStyle=`hsla(${hue},${agree?65:35}%,${agree?55:35}%,${alpha})`;
            ctx.lineWidth=agree?0.55:0.25; ctx.stroke();
          });
        }
      });
    }

    // TILES
    const sorted=[...tiles].sort((a,b)=>getTilePos(a).depth-getTilePos(b).depth);
    sorted.forEach(tile=>{
      const {px,py,scale}=getTilePos(tile);
      const hue=SHELL_HUES[tile.s];
      const sz=2.5+scale*6.5;
      const isEgg=tile.type==="egg";
      const lit=tile.spin===1?58:20;
      const sat=Math.min(65+tile.pressure*90,100);

      if(tile.pressure>0.008){
        ctx.beginPath(); ctx.arc(px,py,sz+tile.pressure*22,0,Math.PI*2);
        const gl=ctx.createRadialGradient(px,py,0,px,py,sz+tile.pressure*22);
        gl.addColorStop(0,`hsla(${hue},85%,65%,${tile.pressure*0.32})`);
        gl.addColorStop(1,"transparent");
        ctx.fillStyle=gl; ctx.fill();
      }

      ctx.save(); ctx.translate(px,py);
      ctx.rotate(tile.dLon*0.45+tile.toroDir*0.3);

      if(isEgg){
        // goose egg = ellipse
        ctx.beginPath();
        ctx.ellipse(0,0,sz*0.6,sz*0.85,0,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},30%,${lit*0.6}%,0.7)`;
        ctx.strokeStyle=`hsla(${hue},40%,40%,0.4)`;
        ctx.lineWidth=0.4; ctx.fill(); ctx.stroke();
        // hatching glow if crossings > 0
        if((tile.crossings||0)>0){
          ctx.beginPath(); ctx.ellipse(0,0,sz*0.6,sz*0.85,0,0,Math.PI*2);
          ctx.strokeStyle=`hsla(${hue},90%,70%,${Math.min((tile.crossings||0)*0.15,0.6)})`;
          ctx.lineWidth=1.2; ctx.stroke();
        }
      } else {
        // tarot card = rectangle, facing encoded as fill direction
        const faceIn=tile.facing===1;
        ctx.fillStyle=faceIn?`hsl(${hue},${sat}%,${lit}%)`:`hsl(${hue},30%,${lit*0.5}%)`;
        ctx.strokeStyle=`hsla(${hue},55%,45%,0.45)`;
        ctx.lineWidth=0.35;
        ctx.fillRect(-sz/2,-sz*0.7,sz,sz*1.4);
        ctx.strokeRect(-sz/2,-sz*0.7,sz,sz*1.4);
        // face indicator
        if(faceIn){
          ctx.fillStyle=`hsla(${hue},80%,80%,0.6)`;
          ctx.beginPath(); ctx.arc(0,0,sz*0.2,0,Math.PI*2); ctx.fill();
        }
      }
      ctx.restore();

      ctx.beginPath(); ctx.arc(px,py,0.9,0,Math.PI*2);
      ctx.fillStyle=tile.spin===1?"rgba(255,255,255,0.55)":"rgba(50,50,50,0.35)";
      ctx.fill();
    });

    // CONIC RAYS
    for(let i=-3;i<=3;i++){
      const a=coneRef.current+i*Math.PI/11;
      ctx.beginPath(); ctx.moveTo(CX,CY);
      ctx.lineTo(CX+Math.cos(a)*W*0.52,CY+Math.sin(a)*W*0.21);
      ctx.strokeStyle=`rgba(255,245,120,${0.018+0.009*(3-Math.abs(i))})`;
      ctx.lineWidth=1; ctx.stroke();
    }

    // WORLD ORIGIN ○ — goose egg zero point
    const pulseR=6+Math.sin(frameRef.current*3)*2;
    const eggColor=hatched?"255,200,50":"255,255,255";
    for(let ring=5;ring>=0;ring--){
      ctx.beginPath();
      ctx.ellipse(CX,CY,pulseR+ring*7,(pulseR+ring*7)*1.2,0,0,Math.PI*2);
      const og=ctx.createRadialGradient(CX,CY,0,CX,CY,pulseR+ring*9);
      og.addColorStop(0,`rgba(${eggColor},${0.9-ring*0.13})`);
      og.addColorStop(0.3,`rgba(${eggColor},${0.25-ring*0.04})`);
      og.addColorStop(1,"transparent");
      ctx.fillStyle=og; ctx.fill();
    }
    if(hatched){
      ctx.font="16px serif"; ctx.textAlign="center";
      ctx.fillText("🪿",CX,CY+6); ctx.textAlign="left";
    }

    // SQUID REGISTRY
    const sq=SQUID_REGISTRY.find(s=>s.id===activeSquid);
    if(sq){
      ctx.fillStyle=`hsla(${sq.hue},60%,10%,0.88)`;
      ctx.beginPath(); ctx.roundRect(12,H-52,W-24,40,6); ctx.fill();
      ctx.fillStyle=`hsl(${sq.hue},70%,60%)`; ctx.font="bold 11px monospace";
      ctx.fillText(`} SQUID::${sq.id} { ${sq.label}`,20,H-34);
      ctx.fillStyle=`hsla(${sq.hue},50%,50%,0.7)`; ctx.font="10px monospace";
      ctx.fillText(`// ${sq.desc}`,20,H-18);
    }

    // stats
    ctx.fillStyle="rgba(255,255,255,0.07)"; ctx.font="10px monospace";
    ctx.fillText(`PROJECT ZOOTER · M=${stats.M} · T=${p.temp.toFixed(2)} · crossings=${stats.crossings} · ${hatched?"🪿 HATCHED":"egg gestating"}`,12,16);
  }

  useEffect(()=>{
    let af,last=0;
    const loop=(ts)=>{
      if(runRef.current&&ts-last>24){
        stepIsing();
        coneRef.current+=0.006;
        frameRef.current+=0.016*pRef.current.speed;
        if((frameRef.current*60|0)%10===0){
          const M=tilesRef.current.reduce((a,t)=>a+t.spin,0)/tilesRef.current.length;
          setStats({M:M.toFixed(3),frame:frameRef.current|0,crossings:hatchRef.current,hatched:hatchRef.current>=9});
        }
        draw();
        last=ts;
      }
      af=requestAnimationFrame(loop);
    };
    af=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(af);
  },[]);

  const sl=(k,min,max,step,col,label)=>(
    <div style={{fontSize:11,color:"#444",display:"flex",alignItems:"center",gap:4}}>
      <span style={{minWidth:52,color:"#555"}}>{label}:</span>
      <input type="range" min={min} max={max} step={step} value={params[k]}
        onChange={e=>up(k,parseFloat(e.target.value))} style={{width:78}}/>
      <span style={{color:col,minWidth:30}}>{params[k]?.toFixed?params[k].toFixed(2):params[k]}</span>
    </div>
  );
  const ck=(k,label)=>(
    <label style={{fontSize:11,color:"#444",display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
      <input type="checkbox" checked={params[k]} onChange={e=>up(k,e.target.checked)}/>
      <span style={{color:"#555"}}>{label}</span>
    </label>
  );

  return (
    <div style={{background:"#000003",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:16,fontFamily:"monospace",color:"#aaa"}}>

      <div style={{marginBottom:2,letterSpacing:6,color:"#9775fa",fontSize:17}}>{"🦑 PROJECT ZOOTER"}</div>
      <div style={{fontSize:9,color:"#333",marginBottom:2,letterSpacing:2}}>{"JSON i2c LENR · github.com/dickdangle · GPL-3.0"}</div>
      <div style={{fontSize:9,color:"#222",marginBottom:8,letterSpacing:1}}>{"GENESIS SQUID · WORLD ORIGIN · ○ · SESSION_X"}</div>

      <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap",justifyContent:"center"}}>
        {SQUID_REGISTRY.map(sq=>(
          <button key={sq.id} onClick={()=>setActiveSquid(sq.id)}
            style={{background:activeSquid===sq.id?`hsla(${sq.hue},40%,15%,0.9)`:"#080008",
              color:activeSquid===sq.id?`hsl(${sq.hue},70%,60%)`:`hsla(${sq.hue},40%,35%,1)`,
              border:`1px solid hsla(${sq.hue},40%,${activeSquid===sq.id?35:15}%,1)`,
              borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10}}>
            {sq.id}·{sq.label}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} width={W} height={H}
        style={{width:"100%",maxWidth:W,borderRadius:10,border:"1px solid #0a0020"}}/>

      <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap",justifyContent:"center"}}>
        {SHELL_HUES.map((hue,s)=>(
          <button key={s} onClick={()=>setSelectedShell(selectedShell===s?null:s)}
            style={{background:selectedShell===s?`hsla(${hue},50%,15%,0.9)`:"transparent",
              color:`hsl(${hue},65%,${selectedShell===s?65:32}%)`,
              border:`1px solid hsla(${hue},50%,${selectedShell===s?35:12}%,1)`,
              borderRadius:4,padding:"3px 7px",cursor:"pointer",fontSize:9}}>
            {SHELL_NAMES[s]}·{SHELL_NOTES[s]}
          </button>
        ))}
      </div>

      <div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap",justifyContent:"center",alignItems:"center"}}>
        <button onClick={()=>{runRef.current=!runRef.current;setRunning(r=>!r);}}
          style={{background:running?"#1a3a1a":"#3a1a1a",color:running?"#69db7c":"#ff6b6b",
            border:`1px solid ${running?"#69db7c":"#ff6b6b"}`,borderRadius:4,padding:"4px 12px",cursor:"pointer",fontSize:11}}>
          {running?"⏸":"▶"}
        </button>
        {sl("temp",0.1,5,0.05,"#ffd43b","T")}
        {sl("toroidalB",0,0.05,0.001,"#4dabf7","B±")}
        {sl("speed",0,3,0.05,"#69db7c","speed")}
        {sl("amplitude",0,40,1,"#f783ac","wave")}
        {sl("tilt",0.2,0.9,0.01,"#f783ac","tilt")}
        {sl("mu",0,1,0.01,"#ffa94d","μ")}
        {sl("sigma",0,1,0.01,"#ff6b6b","σ")}
        {sl("sinewDepth",1,3,1,"#63e6be","sinews")}
        {ck("gravity","grav")}
        {ck("sinews","sinews")}
        {ck("ghosts","👻")}
        {ck("interpenetrate","∿")}
        <button onClick={()=>{tilesRef.current=makeTiles();hatchRef.current=0;}}
          style={{background:"#0a0a2a",color:"#4dabf7",border:"1px solid #4dabf7",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:11}}>{"⟳"}</button>
      </div>

      <div style={{marginTop:6,fontSize:10,color:"#2a2a2a"}}>
        {"M="}<span style={{color:"#ffd43b"}}>{stats.M}</span>
        {"  crossings="}<span style={{color:"#69db7c"}}>{stats.crossings}</span>
        {"  hatch@9  tiles="}<span style={{color:"#4dabf7"}}>{SHELLS*RINGS*TPR}</span>
        {"  tarot≈66%  egg≈34%"}
      </div>

      <div style={{marginTop:8,fontSize:9,color:"#111",maxWidth:W,textAlign:"center",lineHeight:2,letterSpacing:1}}>
        {"// The toroid does not need to be told to exist."}
      </div>
    </div>
  );
}
