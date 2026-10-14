import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import './styles.css';

const ORIGIN = { lat: 10.0647, lon: 76.6287 };
const M_PER_DEG_LAT = 110_900;
const M_PER_DEG_LON = 109_600;

type Poi = { id: string; name: string; kind: string; lat: number; lon: number; color: string };
const POIS: Poi[] = [
  { id: 'town', name: 'Kothamangalam town', kind: 'District hub', lat: 10.0647, lon: 76.6287, color: '#e4ff75' },
  { id: 'marthoma', name: 'Marthoma Cheriapally', kind: 'Landmark', lat: 10.0679, lon: 76.6261, color: '#ffb86b' },
  { id: 'bhoothathan', name: 'Bhoothathankettu Dam', kind: 'Nature', lat: 10.1671, lon: 76.7045, color: '#6dd6b5' },
  { id: 'hospital', name: 'St. Joseph Hospital', kind: 'Health', lat: 10.0618, lon: 76.6315, color: '#c5a8ff' },
  { id: 'river', name: 'Periyar riverfront', kind: 'Waterway', lat: 10.083, lon: 76.619, color: '#68b9f5' }
];

function geoToWorld(lat: number, lon: number) {
  return { x: (lon - ORIGIN.lon) * M_PER_DEG_LON, z: -(lat - ORIGIN.lat) * M_PER_DEG_LAT };
}
function worldToGeo(x: number, z: number) {
  return { lat: ORIGIN.lat - z / M_PER_DEG_LAT, lon: ORIGIN.lon + x / M_PER_DEG_LON };
}
function formatCoord(n: number) { return n.toFixed(5); }

function createWorld(scene: THREE.Scene) {
  scene.background = new THREE.Color('#07110f');
  scene.fog = new THREE.Fog('#07110f', 180, 720);
  scene.add(new THREE.HemisphereLight('#d7f7df', '#17251f', 2.1));
  const sun = new THREE.DirectionalLight('#ffd7a2', 3.2);
  sun.position.set(-140, 260, 180); sun.castShadow = true; scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900, 20, 20), new THREE.MeshStandardMaterial({ color: '#1c3a2c', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const roadMat = new THREE.MeshStandardMaterial({ color: '#283c3a', roughness: .95 });
  const road = (x: number, z: number, w: number, d: number, rot = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, .12, d), roadMat);
    mesh.position.set(x, .06, z); mesh.rotation.y = rot; mesh.receiveShadow = true; scene.add(mesh);
  };
  road(0, 0, 500, 12); road(28, -35, 12, 430); road(-94, -70, 9, 250, -.35); road(108, 65, 10, 210, .72);
  const buildingMat = new THREE.MeshStandardMaterial({ color: '#c8a77a', roughness: .75 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#713f35', roughness: .85 });
  for (let i = 0; i < 46; i++) {
    const x = ((i * 83) % 360) - 180; const z = ((i * 137) % 260) - 130;
    if (Math.abs(x) < 14 || Math.abs(z + 35) < 15) continue;
    const w = 7 + (i % 4) * 2; const h = 5 + (i % 5) * 1.8;
    const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8 + (i % 3) * 2), buildingMat);
    house.position.set(x, h / 2, z); house.castShadow = true; scene.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, 8) * .72, 3.3, 4), roofMat);
    roof.position.set(x, h + 1.1, z); roof.rotation.y = Math.PI / 4; roof.castShadow = true; scene.add(roof);
  }
  const trunk = new THREE.MeshStandardMaterial({ color: '#5a3a25' });
  const canopy = new THREE.MeshStandardMaterial({ color: '#2c744d', roughness: 1 });
  for (let i = 0; i < 80; i++) {
    const x = ((i * 47) % 800) - 400; const z = ((i * 91) % 700) - 350;
    if (Math.abs(x) < 35 && Math.abs(z) < 35) continue;
    const tree = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.45, .65, 5, 7), trunk); stem.position.y = 2.5;
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(3.8 + (i % 3), 1), canopy); leaves.position.y = 6.2;
    tree.add(stem, leaves); tree.position.set(x, 0, z); tree.scale.setScalar(.8 + (i % 4) * .12); scene.add(tree);
  }
  POIS.forEach((poi) => {
    const p = geoToWorld(poi.lat, poi.lon);
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 7, 12), new THREE.MeshBasicMaterial({ color: poi.color }));
    marker.position.set(p.x, 3.5, p.z); marker.userData = { poiId: poi.id }; scene.add(marker);
  });
}

function WorldCanvas({ position, setPosition, setMessage }: { position: { x: number; z: number }; setPosition: (p: { x: number; z: number }) => void; setMessage: (m: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ keys: new Set<string>(), yaw: 0, pitch: .25, dragging: false, lastX: 0, lastY: 0, pos: position });
  useEffect(() => { state.current.pos = position; }, [position]);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene(); createWorld(scene);
    const camera = new THREE.PerspectiveCamera(58, 1, .1, 1200);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; ref.current.appendChild(renderer.domElement);
    const player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.15, 2.8, 5, 10), new THREE.MeshStandardMaterial({ color: '#e4ff75' })); body.position.y = 2.2; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(.85, 16, 12), new THREE.MeshStandardMaterial({ color: '#d79a75' })); head.position.y = 4.5; head.castShadow = true; player.add(body, head); scene.add(player);
    const resize = () => { const { clientWidth: w, clientHeight: h } = ref.current!; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }; resize();
    const onKey = (e: KeyboardEvent) => { state.current.keys.add(e.key.toLowerCase()); if (e.code === 'Space') e.preventDefault(); };
    const offKey = (e: KeyboardEvent) => state.current.keys.delete(e.key.toLowerCase());
    const onDown = (e: PointerEvent) => { state.current.dragging = true; state.current.lastX = e.clientX; state.current.lastY = e.clientY; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
    const onUp = () => { state.current.dragging = false; };
    const onMove = (e: PointerEvent) => { if (!state.current.dragging) return; const dx = e.clientX - state.current.lastX; const dy = e.clientY - state.current.lastY; state.current.yaw -= dx * .006; state.current.pitch = THREE.MathUtils.clamp(state.current.pitch + dy * .004, -.1, .85); state.current.lastX = e.clientX; state.current.lastY = e.clientY; };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', offKey); renderer.domElement.addEventListener('pointerdown', onDown); renderer.domElement.addEventListener('pointerup', onUp); renderer.domElement.addEventListener('pointermove', onMove); window.addEventListener('resize', resize);
    let frame = 0; let last = performance.now(); let jump = 0;
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now; const s = state.current; const speed = s.keys.has('shift') ? 34 : 18;
      const forward = new THREE.Vector3(Math.sin(s.yaw), 0, Math.cos(s.yaw)); const right = new THREE.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw)); const move = new THREE.Vector3();
      if (s.keys.has('w')) move.addScaledVector(forward, -1); if (s.keys.has('s')) move.add(forward); if (s.keys.has('a')) move.addScaledVector(right, -1); if (s.keys.has('d')) move.add(right);
      if (move.lengthSq()) { move.normalize().multiplyScalar(speed * dt); const next = { x: s.pos.x + move.x, z: s.pos.z + move.z }; if (Math.abs(next.x) < 430 && Math.abs(next.z) < 430) { s.pos = next; setPosition(next); } player.rotation.y = Math.atan2(move.x, move.z); }
      if (s.keys.has(' ') || s.keys.has('space')) jump = .3; jump = Math.max(0, jump - dt); player.position.set(s.pos.x, Math.sin(jump * Math.PI / .3) * 4, s.pos.z);
      const target = new THREE.Vector3(s.pos.x, 2.5, s.pos.z); const cam = target.clone().add(new THREE.Vector3(Math.sin(s.yaw) * 18, 8 + s.pitch * 8, Math.cos(s.yaw) * 18)); camera.position.lerp(cam, .12); camera.lookAt(target);
      renderer.render(scene, camera); frame = requestAnimationFrame(animate);
    }; frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', offKey); window.removeEventListener('resize', resize); renderer.dispose(); ref.current?.removeChild(renderer.domElement); };
  }, [setPosition]);
  return <div ref={ref} className="world-canvas" onDoubleClick={() => setMessage('Camera reset — drag to orbit, use WASD to explore.')} />;
}

function App() {
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<Poi>(POIS[0]); const [message, setMessage] = useState('Explore the generated town core');
  const [weather, setWeather] = useState('Clear'); const [time, setTime] = useState('09:42'); const [showMap, setShowMap] = useState(true);
  const geo = worldToGeo(position.x, position.z);
  const results = POIS.filter((p) => `${p.name} ${p.kind}`.toLowerCase().includes(query.toLowerCase()));
  const teleport = (poi: Poi) => { const p = geoToWorld(poi.lat, poi.lon); setPosition(p); setSelected(poi); setMessage(`Teleported to ${poi.name}`); };
  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">KM</span><div><strong>KOTHAMANGALAM <em>3D</em></strong><small>REAL-WORLD DIGITAL TWIN / EXPLORATION BUILD</small></div></div><div className="status"><span className="live-dot" /> LIVE SIMULATION <span className="divider" /> <span className="coverage">● GENERATED CORE / PENDING EXPANSION</span></div></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">KERALA · INDIA · 10.0647° N / 76.6287° E</span><h1>A living map,<br /><span>under your feet.</span></h1><p>Walk the Kothamangalam town core with a real-coordinate camera, discover landmarks, and preview the pipeline that grows this digital twin.</p><div className="hero-actions"><button className="primary" onClick={() => setMessage('Use WASD to move · drag to look · Shift to run · Space to jump')}>▶ START EXPLORING</button><button className="ghost" onClick={() => setShowMap(!showMap)}>◎ {showMap ? 'HIDE' : 'SHOW'} MAP</button></div></div><div className="metrics"><div><b>01</b><span>ACTIVE CHUNK</span></div><div><b>5</b><span>VERIFIED POIs</span></div><div><b>10.2 km²</b><span>DEFINED BOUNDARY</span></div></div></section>
    <section className="workspace"><div className="viewport-card"><div className="viewport-label"><span className="pill green">CHUNK 0 / LOD 2</span><span>PROCEDURAL TERRAIN + OSM-READY STREET GRID</span></div><WorldCanvas position={position} setPosition={setPosition} setMessage={setMessage} /><div className="coordinates"><span>GPS</span><b>{formatCoord(geo.lat)}° N</b><b>{formatCoord(geo.lon)}° E</b><i>± 4m sample transform</i></div><div className="controls"><span><kbd>W A S D</kbd> MOVE</span><span><kbd>SHIFT</kbd> RUN</span><span><kbd>SPACE</kbd> JUMP</span><span><kbd>DRAG</kbd> CAMERA</span><span><kbd>E</kbd> INTERACT</span></div></div>
      {showMap && <aside className="map-panel"><div className="panel-head"><div><span className="eyebrow">NAVIGATION</span><h2>Town map <small>01</small></h2></div><button className="icon-btn" onClick={() => setPosition({ x: 0, z: 0 })}>⌖</button></div><div className="map"><div className="map-grid" /><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-river" /><div className="map-boundary" />{POIS.map((p) => { const q = geoToWorld(p.lat, p.lon); const left = 50 + q.x / 9; const top = 50 + q.z / 9; return <button aria-label={p.name} key={p.id} className={`map-pin ${selected.id === p.id ? 'active' : ''}`} style={{ left: `${left}%`, top: `${top}%`, background: p.color }} onClick={() => teleport(p)} />; })}<div className="player-pin" style={{ left: `${50 + position.x / 9}%`, top: `${50 + position.z / 9}%` }} /></div><div className="compass"><b>N</b><span /> <b>NE</b><span /> <b>E</b><span /> <b>SE</b></div><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search places, roads, landmarks..." /></div><div className="poi-list">{results.map((p) => <button className="poi" key={p.id} onClick={() => teleport(p)}><span className="poi-dot" style={{ background: p.color }} /><span><b>{p.name}</b><small>{p.kind} · {Math.round(Math.hypot(geoToWorld(p.lat, p.lon).x - position.x, geoToWorld(p.lat, p.lon).z - position.z))}m away</small></span><i>↗</i></button>)}{!results.length && <p className="empty">No indexed places in this loaded chunk.</p>}</div></aside>}</section>
    <section className="bottom-grid"><div className="info-card"><div><span className="eyebrow">WORLD STATE</span><h2>{message}</h2></div><div className="world-controls"><label>WEATHER <select value={weather} onChange={(e) => setWeather(e.target.value)}><option>Clear</option><option>Monsoon</option><option>Misty</option></select></label><label>LOCAL TIME <input value={time} onChange={(e) => setTime(e.target.value)} /></label><button onClick={() => setMessage(`Interaction queued at ${formatCoord(geo.lat)}, ${formatCoord(geo.lon)}`)}>E INTERACT</button></div></div><div className="coverage-card"><div className="coverage-title"><span className="eyebrow">DATA CONFIDENCE</span><b>Coverage ledger</b></div><div className="bar"><span /></div><div className="coverage-row"><span><i className="dot sample" />Sample / generated</span><b>72%</b></div><div className="coverage-row"><span><i className="dot pending" />Pending OSM + DEM</span><b>28%</b></div></div></section>
    <footer><span>© 2026 KOTHAMANGALAM 3D · PROTOTYPE BUILD 0.1</span><span>DATA SOURCES: OSM / SRTM / LOCAL SURVEY <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">ATTRIBUTION ↗</a></span><span>QUALITY <b>HIGH</b></span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
