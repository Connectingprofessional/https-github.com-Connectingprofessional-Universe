import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { GoogleGenAI } from '@google/genai';
import globalSourcesRouter from './global-sources.js';
import { createSession, addLocation, getSessionHistory, stopSession, getGeofenceList, insertGeofence, removeGeofence, getFriendsList } from '../src/db/sessions.ts';
import { getOrCreateUser, getUserByUid } from '../src/db/users.ts';
import { optionalAuth, requireAuth } from '../src/middleware/auth.ts';

let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('[TrackMeNow] Gemini init warning:', err.message);
  }
}

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
app.use(cors());
app.use(express.json({ limit: '2mb' }));
// Serve MapLibre Global Intelligence UI (root) — Leaflet frontend removed
const ROOT = path.join(__dirname, '..');
app.use(express.static(ROOT, {
  index: 'index.html',
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (filePath.endsWith('.js')) res.setHeader('Cache-Control', 'public, max-age=300');
  }
}));
app.use('/api/global', globalSourcesRouter);
app.get('/api/ads', (req,res)=>{
  const apiKey=process.env.APPLIXIR_API_KEY||null;
  if(!apiKey)return res.status(404).json({error:'rewarded ads not configured'});
  res.json({api_key:apiKey});
});

// AURA Intelligent Digital Human Companion API
function generateOfflineAuraReply(prompt, personality, mapContext) {
  const p = (prompt || '').toLowerCase();
  if (p.includes('flight') && (p.includes('india') || p.includes('delhi'))) {
    return `Tracking live civil aviation across Indian airspace. Centering map on New Delhi and streaming ADS-B aircraft positions.\n\n\`\`\`json\n{"action":"navigate","name":"India Airspace","lat":22.5937,"lon":78.9629,"zoom":5,"layer":"flights"}\n\`\`\``;
  }
  if (p.includes('flight') || p.includes('aircraft') || p.includes('airplane') || p.includes('airline')) {
    return `Activating live ADS-B flight telemetry. Each aircraft displays real-time altitude, ground speed in knots, heading, and callsign.\n\n\`\`\`json\n{"action":"activate","layer":"flights"}\n\`\`\``;
  }
  if (p.includes('train') && (p.includes('london') || p.includes('uk') || p.includes('england'))) {
    return `Displaying railway corridors across Greater London. Tracking active National Rail and London Underground transit lines.\n\n\`\`\`json\n{"action":"navigate","name":"London Rail Network","lat":51.5074,"lon":-0.1278,"zoom":10,"layer":"gtfs"}\n\`\`\``;
  }
  if (p.includes('train') || p.includes('rail') || p.includes('railway') || p.includes('metro')) {
    return `Connecting to GTFS-Realtime railway and transit data. Active train positions, line codes, delays, and ETAs are displayed.\n\n\`\`\`json\n{"action":"activate","layer":"gtfs"}\n\`\`\``;
  }
  if (p.includes('weather') && (p.includes('tokyo') || p.includes('japan'))) {
    return `Focusing on Tokyo Metropolitan Area. Retrieving real-time surface temperature, barometric pressure, wind vectors, and radar precipitation.\n\n\`\`\`json\n{"action":"navigate","name":"Tokyo Weather Center","lat":35.6762,"lon":139.6503,"zoom":9,"layer":"weather"}\n\`\`\``;
  }
  if (p.includes('weather') || p.includes('rain') || p.includes('temperature') || p.includes('wind') || p.includes('storm')) {
    return `Global weather layers are active. You can inspect RainViewer animated radar, wind streamline vectors, cloud cover, and click any location on Earth to view detailed hourly and 7-day forecasts.`;
  }
  if (p.includes('ship') || p.includes('vessel') || p.includes('marine') || p.includes('ais') || p.includes('boat')) {
    return `Monitoring global maritime AIS vessel traffic across major shipping lanes, chokepoints, and commercial ports.\n\n\`\`\`json\n{"action":"activate","layer":"ais"}\n\`\`\``;
  }
  if (p.includes('friend') || p.includes('family') || p.includes('priya') || p.includes('alex')) {
    return `Priya Sharma is in London and Alex Vance is currently traveling on Sheikh Zayed Rd in Dubai with authorized location sharing active.\n\n\`\`\`json\n{"action":"open_panel","panel":"friends"}\n\`\`\``;
  }
  if (p.includes('space') || p.includes('solar') || p.includes('planet') || p.includes('moon') || p.includes('mars') || p.includes('milky way')) {
    return `Switching to astronomical mode. Rendering planetary orbits with NASA JPL Keplerian orbital calculations.\n\n\`\`\`json\n{"action":"scale","scale":"solar"}\n\`\`\``;
  }
  if (p.includes('who are you') || p.includes('aura') || p.includes('help')) {
    return `I am AURA, your intelligent digital human guide for TrackMeNow. I can explain global tracking data, monitor live flights, trains, marine traffic, explain weather conditions, and navigate anywhere across Earth and space.`;
  }
  if (personality === 'Teacher') {
    return `TrackMeNow integrates live geospatial feeds including OpenSky ADS-B, GTFS-RT public transit, OpenStreetMap infrastructure, and NASA earth observation satellites. Tell me what system or location you want to explore.`;
  }
  if (personality === 'Travel Guide') {
    return `Ready to travel! Name any city, airport, or landmark you would like to inspect, and I will navigate the globe and retrieve local weather, transit, and connections.`;
  }
  return `I am monitoring real-time global intelligence feeds. You can ask me to track flights, inspect trains, check local weather, or navigate to any location or coordinates.`;
}

app.post('/api/aura', async (req, res) => {
  const { prompt, personality = 'Global Intelligence Guide', mapContext = {} } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const systemInstruction = `You are AURA, the intelligent digital human assistant and global companion for TrackMeNow.
You explain global tracking data (live flights, railways, buses, maritime vessels, weather overlays, space objects, and locations).
Your active personality mode is: "${personality}".
(Options:
 - "Friend": Warm, friendly, relaxed, conversational.
 - "Teacher": Patient, educational, clear, informative.
 - "Advisor": Thoughtful, strategic, analytical.
 - "Travel Guide": Helps navigate journeys, cities, places, timezones, weather.
 - "Global Intelligence Guide": Authoritative, precise, real-time tracking specialist.)

Current Map Context:
- Active Center: [Lat: ${mapContext.centerLat || 20}, Lon: ${mapContext.centerLon || 15}]
- Zoom: ${mapContext.zoom || 2}
- Active Layers: ${Array.isArray(mapContext.activeLayers) ? mapContext.activeLayers.join(', ') : 'none'}
- Viewport Objects Count: ${mapContext.itemCount || 0}

Rules:
1. Speak in concise, natural, conversational sentences (2-4 sentences max).
2. If the user asks to see or go somewhere (e.g. "show me flights over India", "weather in London", "trains near Tokyo"), append a clean navigation command in a json block:
\`\`\`json
{
  "action": "navigate",
  "name": "Target Location",
  "lat": 28.6139,
  "lon": 77.2090,
  "zoom": 6,
  "layer": "flights"
}
\`\`\`
3. Do not invent fake flight numbers or claim you are literally a physical biological human.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      return res.json({ reply: response.text });
    } catch (err) {
      console.warn('[TrackMeNow] Gemini API error, falling back to offline responder:', err.message);
    }
  }

  const reply = generateOfflineAuraReply(prompt, personality, mapContext);
  res.json({ reply });
});

// Friends & Family Location Sharing Store
const friends = [
  {
    id: 'f-1',
    name: 'Priya Sharma',
    avatar: 'PS',
    location: { city: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
    status: 'online',
    sharing: true,
    duration: '1 HOUR',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    lastUpdate: 'Just now',
    accuracy_m: 8,
    speed_kmh: 0
  },
  {
    id: 'f-2',
    name: 'Alex Vance',
    avatar: 'AV',
    location: { city: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
    status: 'online',
    sharing: true,
    duration: 'UNTIL STOPPED',
    expiresAt: null,
    lastUpdate: '1 min ago',
    accuracy_m: 12,
    speed_kmh: 42
  },
  {
    id: 'f-3',
    name: 'Kenji Sato',
    avatar: 'KS',
    location: { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
    status: 'offline',
    sharing: false,
    duration: 'EXPIRED',
    expiresAt: null,
    lastUpdate: '2 hours ago',
    accuracy_m: 25,
    speed_kmh: 0
  }
];

const chatMessages = [
  {
    id: 'm-1',
    senderId: 'f-1',
    senderName: 'Priya Sharma',
    text: 'Hey! I just landed in London. Sharing my live location with you.',
    type: 'text',
    timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'm-2',
    senderId: 'f-2',
    senderName: 'Alex Vance',
    text: 'Traveling on Sheikh Zayed Rd right now. Weather is sunny and 34°C.',
    type: 'text',
    timestamp: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

app.get('/api/friends', (req, res) => res.json(friends));
app.post('/api/friends/share', (req, res) => {
  const { friendId, duration = '1 HOUR' } = req.body;
  const f = friends.find(x => x.id === friendId);
  if (!f) return res.status(404).json({ error: 'friend not found' });
  f.sharing = true;
  f.duration = duration;
  const msMap = { '15 MINUTES': 900000, '1 HOUR': 3600000, 'UNTIL STOPPED': null, 'CUSTOM': 7200000 };
  f.expiresAt = msMap[duration] ? new Date(Date.now() + msMap[duration]).toISOString() : null;
  res.json(f);
});
app.post('/api/friends/stop', (req, res) => {
  const { friendId } = req.body;
  const f = friends.find(x => x.id === friendId);
  if (!f) return res.status(404).json({ error: 'friend not found' });
  f.sharing = false;
  f.duration = 'STOPPED';
  f.expiresAt = null;
  res.json(f);
});

app.get('/api/chat/messages', (req, res) => res.json(chatMessages));
app.post('/api/chat/send', (req, res) => {
  const { text, type = 'text', cardData = null } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const msg = {
    id: 'm-' + Date.now(),
    senderId: 'user',
    senderName: 'Me',
    text,
    type,
    cardData,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  chatMessages.push(msg);
  res.status(201).json(msg);
});


const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;
const sessions = new Map();
const feedCache = new Map();
const gtfsUrls = (process.env.GTFS_REALTIME_URLS || '').split(',').map(s=>s.trim()).filter(Boolean);
const cameraUrls = (process.env.CAMERA_GEOJSON_URLS || '').split(',').map(s=>s.trim()).filter(Boolean);

async function db(sql, params=[]) {
  if (!pool) return null;
  try {
    return await pool.query(sql, params);
  } catch (err) {
    console.warn('[AI Studio] DB query error (using in-memory fallback):', err.message);
    return null;
  }
}
async function initDb() {
  if (!pool) return;
  try {
    await db(`CREATE EXTENSION IF NOT EXISTS postgis`);
    await db(`CREATE TABLE IF NOT EXISTS tracking_sessions (id uuid PRIMARY KEY,status text NOT NULL DEFAULT 'active',created_at timestamptz NOT NULL DEFAULT now(),stopped_at timestamptz)`);
    await db(`CREATE TABLE IF NOT EXISTS location_points (id uuid PRIMARY KEY,session_id uuid NOT NULL REFERENCES tracking_sessions(id) ON DELETE CASCADE,recorded_at timestamptz NOT NULL,position geography(Point,4326) NOT NULL,accuracy_m double precision,altitude_m double precision,heading_deg double precision,speed_mps double precision,source text NOT NULL DEFAULT 'browser-gps')`);
    await db(`CREATE INDEX IF NOT EXISTS location_points_session_time_idx ON location_points(session_id,recorded_at DESC)`);
  } catch (err) {
    console.warn('[AI Studio] DB init failed (in-memory mode active):', err.message);
  }
}
function broadcast(message) {
  const payload=JSON.stringify(message);
  for(const client of wss.clients) if(client.readyState===WebSocket.OPEN) client.send(payload);
}
function bboxParams(q) {
  const [minLon,minLat,maxLon,maxLat]=String(q||'').split(',').map(Number);
  if (![minLon,minLat,maxLon,maxLat].every(Number.isFinite)) return null;
  return {minLon:Math.max(-180,Math.min(180,minLon)),minLat:Math.max(-90,Math.min(90,minLat)),maxLon:Math.max(-180,Math.min(180,maxLon)),maxLat:Math.max(-90,Math.min(90,maxLat))};
}
async function getFlights(b) {
  const url=`https://opensky-network.org/api/states/all?lamin=${b.minLat}&lomin=${b.minLon}&lamax=${b.maxLat}&lomax=${b.maxLon}`;
  const r=await fetch(url,{headers:{'User-Agent':'TrackMeNow/0.2'}});
  if(!r.ok) throw new Error(`OpenSky HTTP ${r.status}`);
  const j=await r.json();
  return {type:'FeatureCollection',features:(j.states||[]).filter(s=>Number.isFinite(s[5])&&Number.isFinite(s[6])).map(s=>({type:'Feature',geometry:{type:'Point',coordinates:[s[5],s[6]]},properties:{category:'flight',source:'OpenSky ADS-B',icao24:s[0],callsign:(s[1]||'').trim(),country:s[2],altitude_m:s[7],on_ground:s[8],velocity_mps:s[9],heading:s[10],vertical_rate_mps:s[11],last_contact:s[4]}}))};
}
async function getGtfs() {
  const features=[];
  for(const url of gtfsUrls) {
    const cached=feedCache.get(url);
    try {
      const r=await fetch(url,{headers:{'User-Agent':'TrackMeNow/0.2'}});
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const bytes=new Uint8Array(await r.arrayBuffer());
      const feed=GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes);
      const now=Date.now()/1000;
      for(const e of feed.entity||[]) {
        const v=e.vehicle;
        const p=v?.position;
        if(p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) {
          const ts=Number(v.timestamp||feed.header?.timestamp||0);
          if(!ts || now-ts<=90) features.push({type:'Feature',geometry:{type:'Point',coordinates:[p.longitude,p.latitude]},properties:{category:'transit',mode:'transit',source:url,vehicle_id:v.vehicle?.id||e.id,label:v.vehicle?.label||'',trip_id:v.trip?.tripId||'',speed_mps:p.speed,bearing:p.bearing,timestamp:ts}});
        }
      }
      feedCache.set(url,{ok:true,updatedAt:new Date().toISOString()});
    } catch(e) {
      feedCache.set(url,{ok:false,error:e.message,updatedAt:new Date().toISOString(),previous:cached?.updatedAt||null});
    }
  }
  return {type:'FeatureCollection',features};
}
async function getCameras(b) {
  const features=[];
  for(const url of cameraUrls) {
    try {
      const r=await fetch(url,{headers:{'User-Agent':'TrackMeNow/0.2'}});
      if(!r.ok) continue;
      const gj=await r.json();
      for(const f of (gj.features||[])) {
        const c=f.geometry?.coordinates;
        if(f.geometry?.type==='Point' && Array.isArray(c) && c.length>=2 && c[0]>=b.minLon&&c[0]<=b.maxLon&&c[1]>=b.minLat&&c[1]<=b.maxLat)
          features.push({...f,properties:{...(f.properties||{}),category:'camera',source:url}});
      }
    } catch {}
  }
  return {type:'FeatureCollection',features};
}
async function movementData(b, layers) {
  const out={type:'FeatureCollection',features:[],sources:[],generatedAt:new Date().toISOString()};
  if(layers.includes('flights')) { try { const x=await getFlights(b); out.features.push(...x.features); out.sources.push({layer:'flights',source:'OpenSky ADS-B',status:'live'}); } catch(e) { out.sources.push({layer:'flights',source:'OpenSky ADS-B',status:'error',error:e.message}); } }
  if(layers.some(x=>['bus','rail'].includes(x)) && gtfsUrls.length) {
    const x=await getGtfs(); out.features.push(...x.features.filter(f=>layers.includes(f.properties.mode==='transit'?'bus':'transit'))); out.sources.push({layer:'transit',source:'GTFS-Realtime',status: x.features.length?'live':'no-current-vehicles'});
  }
  if(layers.includes('cameras') && cameraUrls.length) { const x=await getCameras(b); out.features.push(...x.features); out.sources.push({layer:'cameras',source:'configured public GeoJSON feeds',status:'live'}); }
  if(layers.includes('ships')) out.sources.push({layer:'ships',source:'AIS',status:process.env.AIS_API_URL?'adapter-configured':'not-configured'});
  if(layers.includes('road')) out.sources.push({layer:'road',source:'authorized/public traffic feed',status:process.env.TRAFFIC_GEOJSON_URL?'adapter-configured':'not-configured'});
  if(layers.includes('cells')) out.sources.push({layer:'cells',source:'public cell database',status:process.env.CELL_FEED_URL?'adapter-configured':'not-configured'});
  return out;
}

app.get('/health',async(_,res)=>res.json({ok:true,service:'trackmenow-api',database:!!pool,feeds:{gtfs:gtfsUrls.length,cameras:cameraUrls.length,ais:!!process.env.AIS_API_URL,traffic:!!process.env.TRAFFIC_GEOJSON_URL}}));
app.get('/api/movement',async(req,res)=>{ const b=bboxParams(req.query.bbox); if(!b) return res.status(400).json({error:'bbox must be minLon,minLat,maxLon,maxLat'}); const layers=String(req.query.layers||'flights,ships,rail,bus,road,cameras').split(',').map(s=>s.trim()).filter(Boolean); res.json(await movementData(b,layers)); });
app.get('/api/sources',(_,res)=>res.json({gtfs:gtfsUrls.map(url=>({url})),cameras:cameraUrls.map(url=>({url})),ais:!!process.env.AIS_API_URL,traffic:!!process.env.TRAFFIC_GEOJSON_URL,cell:!!process.env.CELL_FEED_URL}));
app.post('/api/sessions',async(_,res)=>{const id=crypto.randomUUID(); sessions.set(id,{id,status:'active',createdAt:new Date().toISOString(),points:[]}); if(pool) await db('INSERT INTO tracking_sessions(id) VALUES($1)',[id]); res.status(201).json(sessions.get(id));});
const geofences = new Map();
function haversineMeters(aLat,aLon,bLat,bLon){const R=6371000,rad=Math.PI/180,dLat=(bLat-aLat)*rad,dLon=(bLon-aLon)*rad;const x=Math.sin(dLat/2)**2+Math.cos(aLat*rad)*Math.cos(bLat*rad)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
app.get('/api/geofences',(_,res)=>res.json([...geofences.values()]));
app.post('/api/geofences',async(req,res)=>{const g={id:crypto.randomUUID(),sessionId:req.body.sessionId||null,name:String(req.body.name||'Geofence'),lat:Number(req.body.lat),lon:Number(req.body.lon),radius_m:Number(req.body.radius_m)};if(!Number.isFinite(g.lat)||!Number.isFinite(g.lon)||!Number.isFinite(g.radius_m)||g.radius_m<=0)return res.status(400).json({error:'invalid geofence'});geofences.set(g.id,g);res.status(201).json(g);});
app.delete('/api/geofences/:id',(req,res)=>{if(!geofences.delete(req.params.id))return res.status(404).json({error:'not found'});res.status(204).end()});
app.post('/api/sessions/:id/location',async(req,res)=>{const item=sessions.get(req.params.id)||{id:req.params.id,status:'active',points:[]}; sessions.set(item.id,item); if(item.status!=='active') return res.status(409).json({error:'session is stopped'}); const p={id:crypto.randomUUID(),lat:Number(req.body.lat),lon:Number(req.body.lon),accuracy:req.body.accuracy==null?null:Number(req.body.accuracy),altitude:req.body.altitude==null?null:Number(req.body.altitude),heading:req.body.heading==null?null:Number(req.body.heading),speed:req.body.speed==null?null:Number(req.body.speed),source:req.body.source||'browser-gps',timestamp:req.body.timestamp||new Date().toISOString()}; if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon)) return res.status(400).json({error:'invalid coordinates'}); item.points.push(p); for(const g of geofences.values()){if(!g.sessionId||g.sessionId===item.id){const d=haversineMeters(p.lat,p.lon,g.lat,g.lon);const inside=d<=g.radius_m;item.geofenceState=item.geofenceState||{};if(item.geofenceState[g.id]!==inside){item.geofenceState[g.id]=inside;broadcast({type:inside?'geofence-enter':'geofence-exit',sessionId:item.id,geofence:g,distance_m:d,point:p});}}} if(pool) await db('INSERT INTO location_points(id,session_id,recorded_at,position,accuracy_m,altitude_m,heading_deg,speed_mps,source) VALUES($1,$2,$3,ST_SetSRID(ST_MakePoint($4,$5),4326)::geography,$6,$7,$8,$9,$10)',[p.id,item.id,p.timestamp,p.lon,p.lat,p.accuracy,p.altitude,p.heading,p.speed,p.source]); broadcast({type:'location',sessionId:item.id,point:p}); res.status(201).json(p);});
app.get('/api/sessions/:id/history',async(req,res)=>{if(pool){const r=await db('SELECT id,session_id,recorded_at,ST_Y(position::geometry) lat,ST_X(position::geometry) lon,accuracy_m accuracy,altitude_m altitude,heading_deg heading,speed_mps speed,source FROM location_points WHERE session_id=$1 ORDER BY recorded_at',[req.params.id]); if(r&&r.rows) return res.json(r.rows);} res.json(sessions.get(req.params.id)?.points||[]);});
app.post('/api/sessions/:id/stop',async(req,res)=>{const item=sessions.get(req.params.id); if(!item) return res.status(404).json({error:'session not found'}); item.status='stopped'; item.stoppedAt=new Date().toISOString(); if(pool) await db('UPDATE tracking_sessions SET status=$1,stopped_at=$2 WHERE id=$3',['stopped',item.stoppedAt,item.id]); broadcast({type:'session-stopped',sessionId:item.id}); res.json(item);});
const wsRooms=new Map();
wss.on('connection',(socket,req)=>{
 const u=new URL(req.url,'http://localhost'),room=u.searchParams.get('room')||'default',role=u.searchParams.get('role')||'viewer',peerId=crypto.randomUUID();
 socket._room=room;socket._peerId=peerId;socket._role=role;if(!wsRooms.has(room))wsRooms.set(room,new Map());wsRooms.get(room).set(peerId,socket);
 socket.send(JSON.stringify({type:'ready',service:'trackmenow',peerId,room,role}));
 if(role==='viewer')for(const [id,p] of wsRooms.get(room))if(id!==peerId&&p._role==='broadcaster'&&p.readyState===WebSocket.OPEN)p.send(JSON.stringify({type:'viewer-join',peerId}));
 socket.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}const peers=wsRooms.get(room)||new Map();if(m.to){const target=peers.get(m.to);if(target?.readyState===WebSocket.OPEN)target.send(JSON.stringify({...m,from:peerId}))}else for(const [id,p] of peers)if(id!==peerId&&p.readyState===WebSocket.OPEN)p.send(JSON.stringify({...m,from:peerId}))});
 socket.on('close',()=>{const peers=wsRooms.get(room);if(!peers)return;peers.delete(peerId);if(!peers.size)wsRooms.delete(room)});
});
app.use((_,res)=>res.sendFile(path.join(ROOT,'index.html')));
const port = Number(process.env.PORT) || 3000;
initDb().catch(err => console.warn('[AI Studio] DB init failed:', err.message)).finally(() => {
  server.listen(port, '0.0.0.0', () => console.log(`TrackMeNow listening on 0.0.0.0:${port}`));
});
