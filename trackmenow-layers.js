/* TrackMeNow — Persistent Bottom Navigation Bar & Subcategory Pop-Up Drawer Engine */
(function () {
  'use strict';

  // SVG Icons
  const ICONS = {
    aircraft: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',
    railway: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16M12 3v8M8 19l-3 3M16 19l3 3M9 15h.01M15 15h.01"/></svg>',
    bus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M4 11h16M7 15h.01M17 15h.01M6 18v2M18 18v2"/></svg>',
    taxi: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/><path d="M10 5h4"/></svg>',
    ship: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.5l1.7 3.1a1 1 0 0 0 .9.5h11a1 1 0 0 0 .9-.5L21 17.5"/><path d="M5 17.5V9h8l4 4.5v4"/><path d="M9 9V4.5h3.5"/></svg>',
    location: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    friends: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    rain: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M16 14v6M8 14v6M12 16v6"/></svg>',
    temp: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
    wind: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2M12.59 19.41A2 2 0 1 0 14 16H2M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2"/></svg>',
    clouds: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    storm: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    earth: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/></svg>',
    space: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="10" stroke-dasharray="2 2"/></svg>',
    rotate: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronUp: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  // State
  const state = {
    openDrawer: null, // null, 'live', 'weather', 'earth', 'space', 'friends'
    rotating: false,
    rotateSpeed: 0.18,
    liveTracking: {
      aircraft: { active: true, name: 'Aircraft (ADS-B)', count: 0, color: '#38bdf8', icon: ICONS.aircraft },
      railway: { active: true, name: 'Railway (GTFS-RT)', count: 0, color: '#f59e0b', icon: ICONS.railway },
      bus: { active: true, name: 'Bus & Metro Transit', count: 0, color: '#10b981', icon: ICONS.bus },
      mobility: { active: true, name: 'Public Mobility & Taxis', count: 0, color: '#fbbf24', icon: ICONS.taxi },
      ais: { active: true, name: 'AIS Maritime Vessels', count: 0, color: '#00e5ff', icon: ICONS.ship },
      myLocation: { active: false, name: 'My Live Location', count: 0, color: '#ec4899', icon: ICONS.location },
      friends: { active: false, name: 'Friends & Family', count: 3, color: '#8b5cf6', icon: ICONS.friends }
    },
    weather: {
      radar: { active: true, name: 'Rain & Precipitation Radar', color: '#06b6d4', icon: ICONS.rain },
      wind: { active: false, name: 'Animated Wind Streamlines', color: '#10b981', icon: ICONS.wind },
      temp: { active: false, name: 'Temperature Heatmap', color: '#ef4444', icon: ICONS.temp },
      clouds: { active: true, name: 'Satellite Clouds (VIIRS)', color: '#94a3b8', icon: ICONS.clouds },
      storms: { active: true, name: 'Cyclones & Severe Storms', color: '#f97316', icon: ICONS.storm },
      inspectMode: { active: true, name: 'Click-to-Inspect Weather', color: '#38bdf8', icon: ICONS.location }
    },
    earth: {
      projection: { active: true, name: '3D Globe / 2D Flat Mode', color: '#00e5ff', isMode: true },
      satellite: { active: true, name: 'Satellite Imagery (ArcGIS)', color: '#38bdf8' },
      dark: { active: false, name: 'Dark Intelligence Map', color: '#94a3b8' },
      terrain: { active: false, name: 'Terrain Relief', color: '#10b981' },
      night: { active: true, name: 'Night / Earth Terminator', color: '#6366f1' },
      traffic: { active: true, name: 'Traffic Overlay & Roads', color: '#f59e0b' }
    },
    space: {
      moon: { active: false, name: 'Moon Surface 3D', color: '#c9c9cf' },
      mars: { active: false, name: 'Mars Surface 3D', color: '#c1440e' },
      solar: { active: false, name: 'Solar System Orbits', color: '#e8c84a' },
      milkyway: { active: false, name: 'Milky Way & Deep Cosmos', color: '#a78bfa' }
    },
    // User GPS state
    myLoc: {
      tracking: false,
      watchId: null,
      lat: null,
      lon: null,
      accuracy: null,
      speed: null,
      heading: null,
      altitude: null,
      address: 'Acquiring GPS location…',
      city: '',
      country: '',
      distanceKm: 0,
      startTime: null,
      history: []
    },
    // Friends state
    friendsList: [
      { id: 'f-1', name: 'Alex Johnson', initials: 'AJ', lat: 51.5074, lon: -0.1278, status: 'Online · Cruising 48 km/h', speedKmh: 48, battery: 92, lastSeen: '12s ago', online: true },
      { id: 'f-2', name: 'Sarah Chen', initials: 'SC', lat: 35.6762, lon: 139.6503, status: 'Online · Stationary (Home)', speedKmh: 0, battery: 78, lastSeen: '1m ago', online: true },
      { id: 'f-3', name: 'Elena Rostova', initials: 'ER', lat: 48.8566, lon: 2.3522, status: 'Offline · Last known Paris', speedKmh: 0, battery: 45, lastSeen: '2h ago', online: false }
    ],
    privacy: {
      sharingEnabled: true,
      precision: 'precise' // 'precise' or 'approximate'
    }
  };

  let activeMap = null;
  let activePopup = null;
  let rotateRaf = null;
  let pollTimer = null;
  let windCanvas = null, windCtx = null, windAnimId = null;

  // CSS Styles: Overrides top-map clutter and establishes the persistent bottom navigation bar
  const style = document.createElement('style');
  style.textContent = `
    /* Hide legacy overlapping bottom bars and floating panels */
    #tm-bottom-bar, #tm-universe-chrome {
      display: none !important;
    }
    .tm-layers-panel {
      display: none !important;
    }

    /* ── Persistent Bottom-Aligned Navigation Bar ── */
    .tm-bottom-dock {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 52px;
      z-index: 2100;
      background: rgba(6, 11, 18, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.13);
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 10px;
      user-select: none;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .tm-dock-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 36px;
      padding: 0 12px;
      border-radius: 9px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: #c9d8e5;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
      cursor: pointer;
      transition: all 0.18s ease;
      white-space: nowrap;
    }
    .tm-dock-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.22);
      color: #ffffff;
      transform: translateY(-1px);
    }
    .tm-dock-btn.active {
      background: rgba(0, 229, 255, 0.14);
      border-color: #00e5ff;
      color: #00e5ff;
      box-shadow: 0 0 14px rgba(0, 229, 255, 0.35);
    }
    .tm-dock-btn.spinning {
      background: rgba(16, 185, 129, 0.14);
      border-color: #10b981;
      color: #34d399;
    }

    .tm-dock-badge {
      font-size: 9.5px;
      font-family: ui-monospace, monospace;
      padding: 1px 5px;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.1);
      color: #edf4f8;
    }
    .tm-dock-btn.active .tm-dock-badge {
      background: #00e5ff;
      color: #05090d;
      font-weight: 800;
    }

    /* ── Pop-Up Subcategory Drawer (Anchored above dock) ── */
    .tm-popup-drawer {
      position: fixed;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      width: 350px;
      max-width: calc(100vw - 20px);
      max-height: min(440px, calc(100vh - 130px));
      z-index: 2200;
      background: rgba(7, 12, 20, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 14px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 229, 255, 0.15);
      color: #edf4f8;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: tm-drawer-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tm-popup-drawer.open {
      display: flex;
    }

    @keyframes tm-drawer-up {
      from { opacity: 0; transform: translateX(-50%) translateY(14px) scale(0.97); }
      to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
    }

    .tm-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 14px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .tm-drawer-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tm-drawer-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00e5ff;
      box-shadow: 0 0 8px #00e5ff;
    }
    .tm-drawer-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #ffffff;
    }
    .tm-drawer-count {
      font-size: 10px;
      color: #7dd3fc;
      font-family: ui-monospace, monospace;
    }
    .tm-drawer-close {
      background: transparent;
      border: 0;
      color: #8da4b5;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 4px;
    }
    .tm-drawer-close:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.08);
    }

    .tm-drawer-body {
      padding: 9px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow-y: auto;
      max-height: 340px;
    }

    .tm-sub-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tm-sub-item:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.14);
    }
    .tm-sub-item.active {
      background: rgba(0, 229, 255, 0.08);
      border-color: rgba(0, 229, 255, 0.35);
    }
    .tm-sub-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tm-sub-icon {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.06);
    }
    .tm-sub-name {
      font-size: 11px;
      font-weight: 700;
      color: #edf4f8;
    }
    .tm-sub-count {
      font-size: 9.5px;
      color: #7dd3fc;
      font-family: ui-monospace, monospace;
      margin-left: 4px;
    }

    /* Switch */
    .tm-switch {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
      flex-shrink: 0;
    }
    .tm-switch input { opacity: 0; width: 0; height: 0; }
    .tm-slider {
      position: absolute; cursor: pointer; inset: 0;
      background-color: rgba(255, 255, 255, 0.16);
      border-radius: 16px;
      transition: 0.2s;
    }
    .tm-slider:before {
      position: absolute; content: ""; height: 12px; width: 12px; left: 2px; bottom: 2px;
      background-color: #ffffff;
      border-radius: 50%;
      transition: 0.2s;
    }
    .tm-switch input:checked + .tm-slider {
      background-color: #00e5ff;
    }
    .tm-switch input:checked + .tm-slider:before {
      transform: translateX(12px);
    }

    .tm-drawer-footer {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.35);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .tm-action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: #cde0ec;
      font-size: 10px;
      font-weight: 700;
      padding: 5px 9px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tm-action-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
    }

    /* Modals & floating HUD cards (GPS and Friends) */
    .tm-hud-card {
      position: fixed;
      bottom: 60px;
      left: 14px;
      width: 310px;
      max-width: calc(100vw - 28px);
      z-index: 2300;
      background: rgba(7, 12, 19, 0.95);
      backdrop-filter: blur(22px);
      -webkit-backdrop-filter: blur(22px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.7);
      color: #edf4f8;
      overflow: hidden;
      animation: tm-drawer-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tm-hud-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .tm-hud-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tm-hud-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .tm-hud-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 10px;
      font-size: 10.5px;
    }
    .tm-hud-k { color: #8da4b5; font-weight: 600; }
    .tm-hud-v { color: #edf4f8; font-weight: 700; font-family: ui-monospace, monospace; text-align: right; }
    .tm-hud-btn {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .tm-hud-btn:hover { background: rgba(255, 255, 255, 0.16); }
    .tm-hud-btn.primary { background: #00e5ff; color: #05090d; border-color: #00e5ff; }
    .tm-hud-btn.danger { background: rgba(239, 68, 68, 0.2); color: #f87171; border-color: rgba(239, 68, 68, 0.4); }

    /* Weather Location Inspector Popup */
    .tm-wx-card {
      font-family: system-ui, -apple-system, sans-serif;
      color: #edf4f8;
      width: 290px;
      padding: 4px;
    }
    .tm-wx-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(6, 182, 212, 0.2);
      color: #38bdf8;
      border: 1px solid rgba(6, 182, 212, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .tm-wx-location { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 6px; }
    .tm-wx-hero {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 8px;
    }
    .tm-wx-temp { font-size: 28px; font-weight: 900; color: #38bdf8; font-variant-numeric: tabular-nums; }
    .tm-wx-condition { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .tm-wx-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      font-size: 10px;
      margin-bottom: 8px;
    }
    .tm-wx-metrics span.v { font-weight: 700; color: #edf4f8; font-family: ui-monospace, monospace; }
    .tm-wx-aura-box {
      padding: 8px 10px;
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-radius: 8px;
      font-size: 10.5px;
      line-height: 1.4;
      color: #e0f2fe;
      margin-bottom: 8px;
    }

    /* Railway live unavailable banner */
    .tm-rail-alert {
      position: fixed;
      top: 66px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1260;
      padding: 7px 14px;
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      backdrop-filter: blur(14px);
      border-radius: 8px;
      color: #fde68a;
      font-size: 10.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      animation: tm-drawer-up 0.2s ease-out;
    }

    /* Wind Canvas */
    #tm-wind-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2;
      display: none;
    }

    /* Telemetry Popup Styles */
    .maplibregl-popup-content {
      background: rgba(7, 12, 19, 0.94) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-radius: 12px !important;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7) !important;
      padding: 14px !important;
      color: #edf4f8 !important;
    }
    .maplibregl-popup-close-button {
      color: #8da4b5 !important;
      font-size: 16px !important;
      padding: 6px 10px !important;
    }
    .maplibregl-popup-close-button:hover { color: #fff !important; }
    .tm-pop-category {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .tm-pop-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tm-pop-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 3px 10px;
      font-size: 10px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .tm-pop-k { color: #8da4b5; font-weight: 600; }
    .tm-pop-v { color: #edf4f8; font-weight: 700; font-family: ui-monospace, monospace; text-align: right; }
    .tm-pop-source {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 9px;
      color: #8da4b5;
    }
    .tm-status-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.6px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .tm-status-live { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .tm-status-recent { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
  `;
  document.head.appendChild(style);

  // Create Wind Canvas
  windCanvas = document.createElement('canvas');
  windCanvas.id = 'tm-wind-canvas';
  document.body.appendChild(windCanvas);
  windCtx = windCanvas.getContext('2d');

  function resizeWind() {
    if (!windCanvas) return;
    windCanvas.width = window.innerWidth;
    windCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeWind);
  resizeWind();

  // Create DOM Elements: Persistent Bottom Dock & Pop-Up Drawer
  const dock = document.createElement('div');
  dock.className = 'tm-bottom-dock';
  dock.id = 'tm-bottom-dock-bar';

  const drawer = document.createElement('div');
  drawer.className = 'tm-popup-drawer';
  drawer.id = 'tm-popup-drawer-panel';

  document.body.appendChild(drawer);
  document.body.appendChild(dock);

  function renderDock() {
    const liveCount = Object.values(state.liveTracking).filter(x => x.active).length;
    const wxCount = Object.values(state.weather).filter(x => x.active).length;

    dock.innerHTML = `
      <button class="tm-dock-btn ${state.openDrawer === 'live' ? 'active' : ''}" data-dock="live" title="Live Aviation, Rail, Bus, Maritime Telemetry">
        ${ICONS.aircraft} Live Tracking <span class="tm-dock-badge">${liveCount}</span>
      </button>
      <button class="tm-dock-btn ${state.openDrawer === 'weather' ? 'active' : ''}" data-dock="weather" title="Radar, Wind, Temp & Storm Overlays">
        ${ICONS.rain} Weather <span class="tm-dock-badge">${wxCount}</span>
      </button>
      <button class="tm-dock-btn ${state.openDrawer === 'earth' ? 'active' : ''}" data-dock="earth" title="Earth Basemaps, Satellite, Dark & Terrain">
        ${ICONS.earth} Earth
      </button>
      <button class="tm-dock-btn ${state.openDrawer === 'space' ? 'active' : ''}" data-dock="space" title="Moon, Mars & Solar System Exploration">
        ${ICONS.space} Space
      </button>
      <button class="tm-dock-btn ${state.myLoc.tracking ? 'active' : ''}" data-dock="gps" title="Continuous GPS Tracking & Telemetry HUD">
        ${ICONS.location} My GPS
      </button>
      <button class="tm-dock-btn ${state.openDrawer === 'friends' ? 'active' : ''}" data-dock="friends" title="Authorized Friends & Family Sharing">
        ${ICONS.friends} Friends <span class="tm-dock-badge">3</span>
      </button>
      <button class="tm-dock-btn ${state.rotating ? 'spinning active' : ''}" data-dock="spin" title="Horizontal Earth Rotation (Right to Left)">
        ${ICONS.rotate} ${state.rotating ? 'Stop Spin' : 'Spin (R→L)'}
      </button>
    `;

    // Bind Dock Buttons
    dock.querySelectorAll('[data-dock]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-dock');
        if (action === 'gps') {
          state.liveTracking.myLocation.active = !state.liveTracking.myLocation.active;
          if (state.liveTracking.myLocation.active) startMyLocation();
          else stopMyLocation();
          applyLayerStates();
          renderDock();
        } else if (action === 'spin') {
          toggleGlobeRotation();
        } else {
          toggleDrawer(action);
        }
      };
    });
  }

  function toggleDrawer(category) {
    if (state.openDrawer === category) {
      state.openDrawer = null;
    } else {
      state.openDrawer = category;
    }
    renderDock();
    renderDrawer();
  }

  function renderDrawer() {
    if (!state.openDrawer) {
      drawer.classList.remove('open');
      return;
    }

    drawer.classList.add('open');
    const cat = state.openDrawer;

    let title = '';
    let countBadge = '';
    let itemsHtml = '';
    let footerHtml = '';

    if (cat === 'live') {
      title = 'Live Tracking Telemetry';
      const activeCount = Object.values(state.liveTracking).filter(x => x.active).length;
      countBadge = `${activeCount} feeds streaming`;

      itemsHtml = Object.keys(state.liveTracking).map(k => {
        const item = state.liveTracking[k];
        return `
          <div class="tm-sub-item ${item.active ? 'active' : ''}" data-sub-cat="liveTracking" data-sub-key="${k}">
            <div class="tm-sub-left">
              <div class="tm-sub-icon" style="color:${item.color}; background:${item.color}15">
                ${item.icon || ICONS.aircraft}
              </div>
              <span class="tm-sub-name">${item.name}</span>
              ${item.count > 0 ? `<span class="tm-sub-count">(${item.count})</span>` : ''}
            </div>
            <label class="tm-switch" onclick="event.stopPropagation()">
              <input type="checkbox" ${item.active ? 'checked' : ''} onchange="window.TrackMeNowMasterLayers.toggle('liveTracking', '${k}')">
              <span class="tm-slider" style="${item.active ? 'background:' + item.color : ''}"></span>
            </label>
          </div>
        `;
      }).join('');

      footerHtml = `
        <span style="font-size:9.5px;color:#8da4b5">Live ADS-B, GTFS-RT, AIS & OSM</span>
        <button class="tm-action-btn" id="tm-drawer-refresh-btn">${ICONS.refresh} Refresh Telemetry</button>
      `;
    } else if (cat === 'weather') {
      title = 'Global Weather Intelligence';
      const activeCount = Object.values(state.weather).filter(x => x.active).length;
      countBadge = `${activeCount} layers active`;

      itemsHtml = Object.keys(state.weather).map(k => {
        const item = state.weather[k];
        return `
          <div class="tm-sub-item ${item.active ? 'active' : ''}" data-sub-cat="weather" data-sub-key="${k}">
            <div class="tm-sub-left">
              <div class="tm-sub-icon" style="color:${item.color}; background:${item.color}15">
                ${item.icon || ICONS.rain}
              </div>
              <span class="tm-sub-name">${item.name}</span>
            </div>
            <label class="tm-switch" onclick="event.stopPropagation()">
              <input type="checkbox" ${item.active ? 'checked' : ''} onchange="window.TrackMeNowMasterLayers.toggle('weather', '${k}')">
              <span class="tm-slider" style="${item.active ? 'background:' + item.color : ''}"></span>
            </label>
          </div>
        `;
      }).join('');

      footerHtml = `
        <span style="font-size:9.5px;color:#8da4b5">RainViewer, Open-Meteo & NASA VIIRS</span>
        <button class="tm-action-btn" id="tm-drawer-aura-wx-btn">Narrate Center Weather</button>
      `;
    } else if (cat === 'earth') {
      title = 'Earth Imagery & Cartography';
      countBadge = 'Map Styles';

      itemsHtml = Object.keys(state.earth).map(k => {
        const item = state.earth[k];
        if (item.isMode) {
          return `
            <div class="tm-sub-item" style="cursor:default">
              <div class="tm-sub-left">
                <span class="tm-sub-name">${item.name}</span>
              </div>
              <div style="display:flex;gap:4px">
                <button class="tm-action-btn" onclick="window.TrackMeNowMasterLayers.setEarthMode('globe')">3D Globe</button>
                <button class="tm-action-btn" onclick="window.TrackMeNowMasterLayers.setEarthMode('flat')">2D Flat</button>
              </div>
            </div>
          `;
        }
        return `
          <div class="tm-sub-item ${item.active ? 'active' : ''}" data-sub-cat="earth" data-sub-key="${k}">
            <div class="tm-sub-left">
              <span class="tm-sub-name">${item.name}</span>
            </div>
            <label class="tm-switch" onclick="event.stopPropagation()">
              <input type="checkbox" ${item.active ? 'checked' : ''} onchange="window.TrackMeNowMasterLayers.toggle('earth', '${k}')">
              <span class="tm-slider" style="${item.active ? 'background:' + (item.color || '#00e5ff') : ''}"></span>
            </label>
          </div>
        `;
      }).join('');

      footerHtml = `
        <span style="font-size:9.5px;color:#8da4b5">ArcGIS World Imagery & Dark Base</span>
        <button class="tm-action-btn" onclick="window.map && window.map.flyTo({center:[20,15],zoom:2,duration:1000})">Home Position</button>
      `;
    } else if (cat === 'space') {
      title = 'Astronomical Exploration';
      countBadge = 'Earth & Beyond';

      itemsHtml = Object.keys(state.space).map(k => {
        const item = state.space[k];
        return `
          <div class="tm-sub-item" style="cursor:default">
            <div class="tm-sub-left">
              <div class="tm-sub-icon" style="color:${item.color || '#a78bfa'}">
                ${ICONS.space}
              </div>
              <span class="tm-sub-name">${item.name}</span>
            </div>
            <button class="tm-action-btn" style="color:#00e5ff;border-color:rgba(0,229,255,0.4)" onclick="window.TrackMeNowMasterLayers.enterSpace('${k}')">
              Enter ${k.toUpperCase()}
            </button>
          </div>
        `;
      }).join('');

      footerHtml = `
        <span style="font-size:9.5px;color:#8da4b5">JPL Horizons & OpenGlobus 3D</span>
        <button class="tm-action-btn" onclick="window.TrackMeNowMasterLayers.enterSpace('earth')">Return to Earth</button>
      `;
    } else if (cat === 'friends') {
      title = 'Authorized Friends & Family';
      countBadge = `${state.friendsList.length} Connected`;

      itemsHtml = `
        <div style="font-size:10.5px;color:#c4b5fd;margin-bottom:6px;line-height:1.4">
          Real-time location sharing. Only authorized contacts with invite keys can view live telemetry.
        </div>
        <button class="tm-hud-btn primary" id="tm-drawer-invite-btn" style="margin-bottom:8px">🔗 Generate Invite Key / Link</button>
        ${state.friendsList.map(f => `
          <div class="tm-sub-item" onclick="window.TrackMeNowMasterLayers.flyToFriend('${f.id}')">
            <div class="tm-sub-left">
              <div style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;color:#fff">${f.initials}</div>
              <div>
                <div class="tm-sub-name">${f.name}</div>
                <div style="font-size:9px;color:${f.online ? '#34d399' : '#94a3b8'}">${f.status} · 🔋${f.battery}%</div>
              </div>
            </div>
            <span style="font-size:9px;color:#7dd3fc;font-family:ui-monospace">${f.lastSeen}</span>
          </div>
        `).join('')}
      `;

      footerHtml = `
        <span style="font-size:9.5px;color:#8da4b5">Precision: ${state.privacy.precision.toUpperCase()}</span>
        <button class="tm-action-btn" id="tm-drawer-toggle-priv">${state.privacy.sharingEnabled ? 'Pause Sharing' : 'Resume Sharing'}</button>
      `;
    }

    drawer.innerHTML = `
      <div class="tm-drawer-header">
        <div class="tm-drawer-title-wrap">
          <span class="tm-drawer-dot"></span>
          <span class="tm-drawer-title">${title}</span>
          <span class="tm-drawer-count">${countBadge}</span>
        </div>
        <button class="tm-drawer-close" id="tm-drawer-close-btn" title="Close Drawer">
          ${ICONS.close}
        </button>
      </div>
      <div class="tm-drawer-body">
        ${itemsHtml}
      </div>
      <div class="tm-drawer-footer">
        ${footerHtml}
      </div>
    `;

    // Bind Drawer Close
    drawer.querySelector('#tm-drawer-close-btn').onclick = (e) => {
      e.stopPropagation();
      state.openDrawer = null;
      renderDock();
      renderDrawer();
    };

    // Item row toggles
    drawer.querySelectorAll('[data-sub-key]').forEach(row => {
      row.onclick = () => {
        const subCat = row.getAttribute('data-sub-cat');
        const subKey = row.getAttribute('data-sub-key');
        toggleItem(subCat, subKey);
      };
    });

    // Refresh btn in drawer
    const refBtn = drawer.querySelector('#tm-drawer-refresh-btn');
    if (refBtn) refBtn.onclick = () => fetchMovement();

    // AURA narrate weather btn
    const auraWxBtn = drawer.querySelector('#tm-drawer-aura-wx-btn');
    if (auraWxBtn) {
      auraWxBtn.onclick = () => {
        if (activeMap) {
          const c = activeMap.getCenter();
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat.toFixed(4)}&longitude=${c.lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m`)
            .then(r => r.json())
            .then(j => {
              const cur = j.current || {};
              if (window.AURA && window.AURA.narrateWeather) {
                window.AURA.narrateWeather('this viewport area', {
                  temp: cur.temperature_2m,
                  humidity: cur.relative_humidity_2m,
                  rainProb: cur.rain ? 80 : 10,
                  wind: cur.wind_speed_10m,
                  condition: 'Current conditions'
                });
              }
            });
        }
      };
    }

    // Invite btn in drawer
    const invBtn = drawer.querySelector('#tm-drawer-invite-btn');
    if (invBtn) {
      invBtn.onclick = () => {
        const code = 'track-' + Math.random().toString(36).substring(2, 8);
        const url = `${window.location.origin}/#invite=${code}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          alert(`Invite Link Copied to Clipboard!\n\n${url}\n\nSend this to a friend to allow mutual location sharing.`);
        } else {
          prompt('Share this link with your friend:', url);
        }
      };
    }

    // Toggle sharing in drawer
    const privBtn = drawer.querySelector('#tm-drawer-toggle-priv');
    if (privBtn) {
      privBtn.onclick = () => {
        state.privacy.sharingEnabled = !state.privacy.sharingEnabled;
        alert(`Location sharing has been ${state.privacy.sharingEnabled ? 'RESUMED' : 'PAUSED'}.`);
        renderDrawer();
      };
    }
  }

  // Dismiss Drawer on Map Click
  document.addEventListener('click', (e) => {
    if (state.openDrawer &&
        !drawer.contains(e.target) &&
        !dock.contains(e.target)) {
      state.openDrawer = null;
      renderDock();
      renderDrawer();
    }
  });

  function toggleItem(cat, key) {
    if (!state[cat] || !state[cat][key]) return;
    state[cat][key].active = !state[cat][key].active;

    if (key === 'myLocation') {
      if (state.liveTracking.myLocation.active) startMyLocation();
      else stopMyLocation();
    } else if (key === 'wind') {
      toggleWindStreamlines(state.weather.wind.active);
    }

    applyLayerStates();
    renderDock();
    renderDrawer();
    if (cat === 'liveTracking') fetchMovement();
  }

  function enterSpace(spaceMode) {
    if (spaceMode === 'solar' || spaceMode === 'milkyway') {
      if (window.TrackMeNowEngine) window.TrackMeNowEngine.setScale(spaceMode === 'milkyway' ? 'universe' : 'solar');
    } else if (spaceMode === 'moon' || spaceMode === 'mars' || spaceMode === 'earth') {
      if (window.TrackMeNowEngine) window.TrackMeNowEngine.setScale(spaceMode);
    }
    state.openDrawer = null;
    renderDock();
    renderDrawer();
  }

  // Smooth Horizontal Earth Rotation (Right to Left)
  function toggleGlobeRotation() {
    state.rotating = !state.rotating;
    if (state.rotating) {
      startRotationLoop();
    } else {
      stopRotationLoop();
    }
    renderDock();
  }

  function startRotationLoop() {
    if (!activeMap) return;
    function rotateFrame() {
      if (!state.rotating || !activeMap) return;
      const center = activeMap.getCenter();
      // Natural horizontal spin right to left: longitude decreases
      activeMap.setCenter([center.lng - state.rotateSpeed, center.lat]);
      rotateRaf = requestAnimationFrame(rotateFrame);
    }
    rotateRaf = requestAnimationFrame(rotateFrame);
  }

  function stopRotationLoop() {
    if (rotateRaf) cancelAnimationFrame(rotateRaf);
    rotateRaf = null;
  }

  // MapLibre Layer Sync & Setup
  const SOURCES = {
    aircraft: 'tm-src-aircraft',
    railway: 'tm-src-railway',
    bus: 'tm-src-bus',
    mobility: 'tm-src-mobility',
    ais: 'tm-src-ais',
    myLocPoint: 'tm-src-myloc-point',
    myLocRoute: 'tm-src-myloc-route',
    friends: 'tm-src-friends',
    weatherPin: 'tm-src-wx-pin'
  };

  function initMapLayers(map) {
    if (!map || !map.isStyleLoaded()) return;

    // Aircraft layer
    if (!map.getSource(SOURCES.aircraft)) {
      map.addSource(SOURCES.aircraft, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-aircraft-halo',
        type: 'circle',
        source: SOURCES.aircraft,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 10, 8, 16, 12],
          'circle-color': '#38bdf8',
          'circle-opacity': 0.25,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#38bdf8'
        }
      });
      map.addLayer({
        id: 'tm-lyr-aircraft-icon',
        type: 'circle',
        source: SOURCES.aircraft,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 4.5, 16, 6],
          'circle-color': '#f0f9ff',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-lyr-aircraft-label',
        type: 'symbol',
        source: SOURCES.aircraft,
        minzoom: 6,
        layout: {
          'text-field': ['get', 'flight_number'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0, 1.4],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#7dd3fc',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // Railway layer
    if (!map.getSource(SOURCES.railway)) {
      map.addSource(SOURCES.railway, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-railway-halo',
        type: 'circle',
        source: SOURCES.railway,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 10, 8, 16, 12],
          'circle-color': '#f59e0b',
          'circle-opacity': 0.3,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#f59e0b'
        }
      });
      map.addLayer({
        id: 'tm-lyr-railway-core',
        type: 'circle',
        source: SOURCES.railway,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 4.5, 16, 6],
          'circle-color': '#fffbeb',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-lyr-railway-label',
        type: 'symbol',
        source: SOURCES.railway,
        minzoom: 8,
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0, 1.4],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#fcd34d',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // Bus Transit layer
    if (!map.getSource(SOURCES.bus)) {
      map.addSource(SOURCES.bus, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-bus-halo',
        type: 'circle',
        source: SOURCES.bus,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3.5, 10, 6.5, 16, 10],
          'circle-color': '#10b981',
          'circle-opacity': 0.25,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#10b981'
        }
      });
      map.addLayer({
        id: 'tm-lyr-bus-core',
        type: 'circle',
        source: SOURCES.bus,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2, 10, 4, 16, 5.5],
          'circle-color': '#ecfdf5',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-lyr-bus-label',
        type: 'symbol',
        source: SOURCES.bus,
        minzoom: 11,
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0, 1.4],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#34d399',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // Public Mobility (Taxi)
    if (!map.getSource(SOURCES.mobility)) {
      map.addSource(SOURCES.mobility, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-mobility-core',
        type: 'circle',
        source: SOURCES.mobility,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 4.5, 16, 6.5],
          'circle-color': '#facc15',
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });
    }

    // AIS Maritime
    if (!map.getSource(SOURCES.ais)) {
      map.addSource(SOURCES.ais, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-ais-halo',
        type: 'circle',
        source: SOURCES.ais,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 10, 8, 16, 12],
          'circle-color': '#00e5ff',
          'circle-opacity': 0.25,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#00e5ff'
        }
      });
      map.addLayer({
        id: 'tm-lyr-ais-core',
        type: 'circle',
        source: SOURCES.ais,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 4.5, 16, 6],
          'circle-color': '#ffffff',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-lyr-ais-label',
        type: 'symbol',
        source: SOURCES.ais,
        minzoom: 8,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0, 1.4],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#00e5ff',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // My Location layers (point & breadcrumb trail)
    if (!map.getSource(SOURCES.myLocRoute)) {
      map.addSource(SOURCES.myLocRoute, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-myloc-line',
        type: 'line',
        source: SOURCES.myLocRoute,
        paint: {
          'line-color': '#ec4899',
          'line-width': 3,
          'line-opacity': 0.85
        }
      });
    }
    if (!map.getSource(SOURCES.myLocPoint)) {
      map.addSource(SOURCES.myLocPoint, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-myloc-pulse',
        type: 'circle',
        source: SOURCES.myLocPoint,
        paint: {
          'circle-radius': 16,
          'circle-color': '#ec4899',
          'circle-opacity': 0.25,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ec4899'
        }
      });
      map.addLayer({
        id: 'tm-lyr-myloc-dot',
        type: 'circle',
        source: SOURCES.myLocPoint,
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ec4899'
        }
      });
    }

    // Friends & Family Layer
    if (!map.getSource(SOURCES.friends)) {
      map.addSource(SOURCES.friends, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-friends-halo',
        type: 'circle',
        source: SOURCES.friends,
        paint: {
          'circle-radius': 14,
          'circle-color': '#8b5cf6',
          'circle-opacity': 0.3,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#a78bfa'
        }
      });
      map.addLayer({
        id: 'tm-lyr-friends-core',
        type: 'circle',
        source: SOURCES.friends,
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#8b5cf6'
        }
      });
      map.addLayer({
        id: 'tm-lyr-friends-label',
        type: 'symbol',
        source: SOURCES.friends,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#c4b5fd',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // Weather Inspection Pin Layer
    if (!map.getSource(SOURCES.weatherPin)) {
      map.addSource(SOURCES.weatherPin, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-lyr-wxpin-core',
        type: 'circle',
        source: SOURCES.weatherPin,
        paint: {
          'circle-radius': 8,
          'circle-color': '#06b6d4',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    setupInteractivePopups(map);
    setupMapClickWeather(map);
    applyLayerStates();
    updateFriendsLayer();
  }

  function applyLayerStates() {
    if (!activeMap) return;

    // Live tracking
    const mapLyrs = {
      aircraft: ['tm-lyr-aircraft-halo', 'tm-lyr-aircraft-icon', 'tm-lyr-aircraft-label'],
      railway: ['tm-lyr-railway-halo', 'tm-lyr-railway-core', 'tm-lyr-railway-label'],
      bus: ['tm-lyr-bus-halo', 'tm-lyr-bus-core', 'tm-lyr-bus-label'],
      mobility: ['tm-lyr-mobility-core'],
      ais: ['tm-lyr-ais-halo', 'tm-lyr-ais-core', 'tm-lyr-ais-label'],
      myLocation: ['tm-lyr-myloc-line', 'tm-lyr-myloc-pulse', 'tm-lyr-myloc-dot'],
      friends: ['tm-lyr-friends-halo', 'tm-lyr-friends-core', 'tm-lyr-friends-label']
    };

    Object.keys(mapLyrs).forEach(k => {
      const active = state.liveTracking[k]?.active;
      mapLyrs[k].forEach(id => {
        try {
          if (activeMap.getLayer(id)) {
            activeMap.setLayoutProperty(id, 'visibility', active ? 'visible' : 'none');
          }
        } catch (e) {}
      });
    });

    // Basemaps (Earth tab)
    if (state.earth.satellite.active) {
      if (activeMap.getLayer('sat')) activeMap.setLayoutProperty('sat', 'visibility', 'visible');
      if (activeMap.getLayer('dark')) activeMap.setLayoutProperty('dark', 'visibility', 'none');
    } else if (state.earth.dark.active) {
      if (activeMap.getLayer('sat')) activeMap.setLayoutProperty('sat', 'visibility', 'none');
      if (activeMap.getLayer('dark')) activeMap.setLayoutProperty('dark', 'visibility', 'visible');
    }

    // Weather radar
    if (activeMap.getLayer('radar')) {
      activeMap.setLayoutProperty('radar', 'visibility', state.weather.radar.active ? 'visible' : 'none');
    }
  }

  function setupInteractivePopups(map) {
    const clickable = [
      'tm-lyr-aircraft-halo',
      'tm-lyr-railway-halo',
      'tm-lyr-bus-halo',
      'tm-lyr-ais-halo',
      'tm-lyr-friends-halo'
    ];

    clickable.forEach(lyrId => {
      map.on('mouseenter', lyrId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', lyrId, () => { map.getCanvas().style.cursor = ''; });

      map.on('click', lyrId, (e) => {
        if (!e.features || !e.features[0]) return;
        const p = e.features[0].properties || {};
        const cat = p.category;
        const coords = e.features[0].geometry.coordinates.slice();

        let html = '';
        if (cat === 'flight') {
          html = `
            <div class="tm-pop-category" style="color:#38bdf8">AIRLINE TELEMETRY · ADS-B</div>
            <div class="tm-pop-title">${p.flight_number || p.callsign} · ${p.airline || 'Commercial'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Aircraft:</span><span class="tm-pop-v">${p.aircraft_type || 'Civil Aircraft'}</span>
              <span class="tm-pop-k">Reg:</span><span class="tm-pop-v">${p.registration || '—'}</span>
              <span class="tm-pop-k">Route:</span><span class="tm-pop-v">${p.route || (p.origin + ' → ' + p.destination)}</span>
              <span class="tm-pop-k">Altitude:</span><span class="tm-pop-v">${p.altitude_m ? p.altitude_m + ' m (' + p.altitude_ft + ' ft)' : '—'}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_kts ? p.speed_kts + ' kn' : '—'}</span>
              <span class="tm-pop-k">Heading:</span><span class="tm-pop-v">${p.heading != null ? p.heading + '°' : '—'}</span>
              <span class="tm-pop-k">Status:</span><span class="tm-pop-v" style="color:#38bdf8">${p.flight_status || 'EN ROUTE'}</span>
              <span class="tm-pop-k">ETA:</span><span class="tm-pop-v">${p.estimated_arrival || 'On Schedule'}</span>
            </div>
            <div class="tm-pop-source">
              <span class="tm-status-tag tm-status-live">● LIVE ADS-B</span>
              <span>Updated: ${p.last_update || 'Just now'}</span>
            </div>
          `;
        } else if (p.mode === 'train') {
          html = `
            <div class="tm-pop-category" style="color:#f59e0b">GLOBAL RAILWAY TRACKING</div>
            <div class="tm-pop-title">${p.train_number || p.label || 'Intercity Express'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Operator:</span><span class="tm-pop-v">${p.operator || 'National Rail'}</span>
              <span class="tm-pop-k">Route:</span><span class="tm-pop-v">${p.origin} → ${p.destination}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_kmh} km/h</span>
              <span class="tm-pop-k">Next Station:</span><span class="tm-pop-v">${p.next_station || 'Mainline'}</span>
              <span class="tm-pop-k">Schedule Delay:</span><span class="tm-pop-v" style="color:#fbbf24">${p.delay || 'On Time'}</span>
              <span class="tm-pop-k">ETA:</span><span class="tm-pop-v">${p.eta || '14:35'}</span>
            </div>
            <div class="tm-pop-source">
              <span class="tm-status-tag tm-status-live">● LIVE GTFS-RT</span>
              <span>Updated: ${p.last_update || 'Just now'}</span>
            </div>
          `;
        } else if (p.mode === 'bus') {
          html = `
            <div class="tm-pop-category" style="color:#10b981">GLOBAL BUS TRANSIT</div>
            <div class="tm-pop-title">${p.label || p.route_id || 'City Bus'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Route / Operator:</span><span class="tm-pop-v">${p.operator || 'City Transit'}</span>
              <span class="tm-pop-k">Vehicle ID:</span><span class="tm-pop-v">${p.vehicle_id || '—'}</span>
              <span class="tm-pop-k">Direction:</span><span class="tm-pop-v">${p.direction || 'Inbound'}</span>
              <span class="tm-pop-k">Current Stop:</span><span class="tm-pop-v">${p.current_stop || 'Main St'}</span>
              <span class="tm-pop-k">Next Stop:</span><span class="tm-pop-v">${p.next_stop || 'Terminal'}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_kmh} km/h</span>
              <span class="tm-pop-k">ETA:</span><span class="tm-pop-v">${p.eta || 'On Schedule'}</span>
            </div>
            <div class="tm-pop-source">
              <span class="tm-status-tag tm-status-live">● LIVE GTFS-RT</span>
              <span>Updated: ${p.last_update || 'Just now'}</span>
            </div>
          `;
        } else if (cat === 'ship') {
          html = `
            <div class="tm-pop-category" style="color:#00e5ff">AIS MARITIME VESSEL</div>
            <div class="tm-pop-title">${p.name || 'Commercial Vessel'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Type:</span><span class="tm-pop-v">${p.ship_type || 'Cargo Ship'}</span>
              <span class="tm-pop-k">MMSI:</span><span class="tm-pop-v">${p.mmsi}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_knots} kn</span>
              <span class="tm-pop-k">Heading:</span><span class="tm-pop-v">${p.heading}°</span>
              <span class="tm-pop-k">Flag:</span><span class="tm-pop-v">${p.flag || 'International'}</span>
            </div>
            <div class="tm-pop-source">
              <span class="tm-status-tag tm-status-live">● LIVE AIS</span>
              <span>Updated: Just now</span>
            </div>
          `;
        } else if (p.category === 'friend') {
          html = `
            <div class="tm-pop-category" style="color:#8b5cf6">FRIENDS & FAMILY (AUTHORIZED)</div>
            <div class="tm-pop-title">${p.name}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Status:</span><span class="tm-pop-v">${p.status}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speedKmh} km/h</span>
              <span class="tm-pop-k">Battery:</span><span class="tm-pop-v">${p.battery}%</span>
              <span class="tm-pop-k">Last Seen:</span><span class="tm-pop-v">${p.lastSeen}</span>
            </div>
          `;
        }

        if (activePopup) activePopup.remove();
        activePopup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '340px' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });
    });
  }

  // Weather Location Mode (Clicking any point on the globe)
  function setupMapClickWeather(map) {
    map.on('click', async (e) => {
      // Don't override transport popups
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['tm-lyr-aircraft-halo', 'tm-lyr-railway-halo', 'tm-lyr-bus-halo', 'tm-lyr-ais-halo', 'tm-lyr-friends-halo']
      });
      if (features && features.length) return;

      const lngLat = e.lngLat;
      const lat = lngLat.lat;
      const lon = lngLat.lng;

      // Update weather pin
      const pinSrc = map.getSource(SOURCES.weatherPin);
      if (pinSrc) {
        pinSrc.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lon, lat] },
            properties: {}
          }]
        });
      }

      // Fetch Weather & Reverse Geocoding
      try {
        const [wxRes, geoRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&zoom=10`).catch(() => null)
        ]);

        const wxData = await wxRes.json();
        let placeName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        if (geoRes && geoRes.ok) {
          const geoJson = await geoRes.json();
          placeName = geoJson.address?.city || geoJson.address?.town || geoJson.address?.state || geoJson.name || geoJson.display_name?.split(',')[0] || placeName;
        }

        const cur = wxData.current || {};
        const temp = cur.temperature_2m != null ? Math.round(cur.temperature_2m) : 22;
        const feelsLike = cur.apparent_temperature != null ? Math.round(cur.apparent_temperature) : temp;
        const humidity = cur.relative_humidity_2m || 50;
        const wind = cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m) : 10;
        const rainProb = (wxData.hourly?.precipitation_probability && wxData.hourly.precipitation_probability[0]) || 0;
        const pressure = Math.round(cur.surface_pressure || 1013);
        const uv = cur.uv_index || 3;
        const vis = cur.visibility != null ? (cur.visibility / 1000).toFixed(1) : '10.0';

        const condMap = {
          0: 'Clear skies', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
          45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 61: 'Slight rain',
          63: 'Moderate rain', 65: 'Heavy rain', 71: 'Slight snow', 80: 'Rain showers',
          95: 'Thunderstorm'
        };
        const condition = condMap[cur.weather_code] || 'Clear conditions';

        // Trigger AURA conversational narration
        if (window.AURA && window.AURA.narrateWeather) {
          window.AURA.narrateWeather(placeName, {
            temp,
            humidity,
            rainProb,
            wind,
            condition
          });
        }

        const html = `
          <div class="tm-wx-card">
            <div class="tm-wx-badge">WEATHER LOCATION INTELLIGENCE</div>
            <div class="tm-wx-location">${placeName}</div>
            <div class="tm-wx-hero">
              <span class="tm-wx-temp">${temp}°C</span>
              <span class="tm-wx-condition">${condition} · Feels like ${feelsLike}°C</span>
            </div>
            <div class="tm-wx-metrics">
              <div><span class="k">Humidity:</span> <span class="v">${humidity}%</span></div>
              <div><span class="k">Rain Prob:</span> <span class="v">${rainProb}%</span></div>
              <div><span class="k">Wind:</span> <span class="v">${wind} km/h</span></div>
              <div><span class="k">Pressure:</span> <span class="v">${pressure} hPa</span></div>
              <div><span class="k">UV Index:</span> <span class="v">${uv}</span></div>
              <div><span class="k">Visibility:</span> <span class="v">${vis} km</span></div>
            </div>
            <div class="tm-wx-aura-box">
              <b>AURA Narration:</b> "It's currently ${temp}°C in ${placeName} with ${humidity}% humidity and a ${rainProb}% chance of rain."
            </div>
            <div style="font-size:9px;color:#8da4b5;display:flex;justify-content:space-between">
              <span>Data: Open-Meteo & DWD</span>
              <span>Updated: Just now</span>
            </div>
          </div>
        `;

        if (activePopup) activePopup.remove();
        activePopup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '340px' })
          .setLngLat([lon, lat])
          .setHTML(html)
          .addTo(map);
      } catch (err) {
        console.warn('[TrackMeNow] Weather click err:', err);
      }
    });
  }

  // Fetch Movement Data
  async function fetchMovement() {
    if (!activeMap || !activeMap.isStyleLoaded()) return;

    const b = activeMap.getBounds();
    if (!b) return;

    const minLon = b.getWest(), minLat = b.getSouth();
    const maxLon = b.getEast(), maxLat = b.getNorth();
    const zoom = Math.round(activeMap.getZoom());

    const url = `/api/global/movement?bbox=${minLon.toFixed(4)},${minLat.toFixed(4)},${maxLon.toFixed(4)},${maxLat.toFixed(4)}&layers=flights,ships,public-transport,traffic&zoom=${zoom}`;

    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const features = data.features || [];

      const parts = {
        aircraft: [],
        railway: [],
        bus: [],
        mobility: [],
        ais: []
      };

      features.forEach(f => {
        const cat = f.properties?.category;
        const mode = f.properties?.mode;
        if (cat === 'flight') parts.aircraft.push(f);
        else if (cat === 'ship') parts.ais.push(f);
        else if (mode === 'train') parts.railway.push(f);
        else if (mode === 'taxi') parts.mobility.push(f);
        else if (cat === 'public-transport' || mode === 'bus' || mode === 'tram' || mode === 'metro') parts.bus.push(f);
      });

      // Railway availability check
      if (state.liveTracking.railway.active) {
        if (parts.railway.length === 0 && zoom > 6) {
          showRailwayUnavailableNotice(true);
        } else {
          showRailwayUnavailableNotice(false);
        }
      } else {
        showRailwayUnavailableNotice(false);
      }

      // Update MapLibre GeoJSON sources
      Object.keys(parts).forEach(k => {
        const feats = state.liveTracking[k]?.active ? parts[k] : [];
        const src = activeMap.getSource(SOURCES[k]);
        if (src) src.setData({ type: 'FeatureCollection', features: feats });
        if (state.liveTracking[k]) state.liveTracking[k].count = feats.length;
      });

      renderDock();
      if (state.openDrawer === 'live') renderDrawer();
    } catch (e) {
      console.warn('[TrackMeNow] Movement fetch warning:', e);
    }
  }

  // Railway Unavailable Notice Banner
  let railBanner = null;
  function showRailwayUnavailableNotice(show) {
    if (show) {
      if (!railBanner) {
        railBanner = document.createElement('div');
        railBanner.className = 'tm-rail-alert';
        railBanner.innerHTML = `⚠️ <b>LIVE RAILWAY DATA UNAVAILABLE FOR THIS REGION</b> · No active GTFS-RT transponders reported in this view`;
        document.body.appendChild(railBanner);
      }
    } else {
      if (railBanner) {
        railBanner.remove();
        railBanner = null;
      }
    }
  }

  // My Live Location Implementation
  let myLocCard = null;
  function startMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    state.myLoc.tracking = true;
    state.myLoc.startTime = Date.now();
    state.myLoc.history = [];
    state.myLoc.distanceKm = 0;

    // Create HUD Card
    showMyLocationHud();

    // Start watchPosition
    state.myLoc.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading, altitude } = pos.coords;
        const prevLat = state.myLoc.lat;
        const prevLon = state.myLoc.lon;

        state.myLoc.lat = latitude;
        state.myLoc.lon = longitude;
        state.myLoc.accuracy = accuracy;
        state.myLoc.speed = speed;
        state.myLoc.heading = heading;
        state.myLoc.altitude = altitude;

        // Cumulative distance
        if (prevLat != null && prevLon != null) {
          const d = haversineDistance(prevLat, prevLon, latitude, longitude);
          state.myLoc.distanceKm += d;
        }

        const point = [longitude, latitude];
        state.myLoc.history.push(point);

        // Update map point & route
        if (activeMap) {
          const ptSrc = activeMap.getSource(SOURCES.myLocPoint);
          if (ptSrc) {
            ptSrc.setData({
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: point },
                properties: {}
              }]
            });
          }

          const routeSrc = activeMap.getSource(SOURCES.myLocRoute);
          if (routeSrc && state.myLoc.history.length > 1) {
            routeSrc.setData({
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: state.myLoc.history },
                properties: {}
              }]
            });
          }
        }

        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude.toFixed(5)}&lon=${longitude.toFixed(5)}&zoom=14`)
          .then(r => r.json())
          .then(j => {
            const road = j.address?.road || j.address?.pedestrian || '';
            const city = j.address?.city || j.address?.town || j.address?.village || '';
            const country = j.address?.country || '';
            state.myLoc.address = `${road ? road + ', ' : ''}${city}${city && country ? ', ' : ''}${country}` || 'Location confirmed';
            updateMyLocationHud();
          })
          .catch(() => {});

        updateMyLocationHud();
      },
      (err) => {
        console.warn('[GPS] Error watching position:', err);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }

  function stopMyLocation() {
    state.myLoc.tracking = false;
    if (state.myLoc.watchId) {
      navigator.geolocation.clearWatch(state.myLoc.watchId);
      state.myLoc.watchId = null;
    }
    if (myLocCard) {
      myLocCard.remove();
      myLocCard = null;
    }
    // Clear map point
    if (activeMap) {
      const ptSrc = activeMap.getSource(SOURCES.myLocPoint);
      if (ptSrc) ptSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  }

  function showMyLocationHud() {
    if (myLocCard) myLocCard.remove();
    myLocCard = document.createElement('div');
    myLocCard.className = 'tm-hud-card';
    myLocCard.id = 'tm-my-loc-hud';
    document.body.appendChild(myLocCard);
    updateMyLocationHud();
  }

  function updateMyLocationHud() {
    if (!myLocCard) return;
    const speedKmh = state.myLoc.speed != null ? (state.myLoc.speed * 3.6).toFixed(1) : '0.0';
    const acc = state.myLoc.accuracy != null ? `±${Math.round(state.myLoc.accuracy)} m` : '—';
    const alt = state.myLoc.altitude != null ? `${Math.round(state.myLoc.altitude)} m` : '—';
    const heading = state.myLoc.heading != null ? `${Math.round(state.myLoc.heading)}°` : '—';

    myLocCard.innerHTML = `
      <div class="tm-hud-header">
        <span class="tm-hud-title"><span class="tm-drawer-dot" style="background:#ec4899;box-shadow:0 0 8px #ec4899"></span> MY LIVE LOCATION</span>
        <button id="tm-hud-close-btn" style="background:transparent;border:0;color:#94a3b8;cursor:pointer;font-size:14px">✕</button>
      </div>
      <div class="tm-hud-body">
        <div style="font-size:11px;font-weight:700;color:#fbcfe8;">
          📍 ${state.myLoc.address}
        </div>
        <div class="tm-hud-grid">
          <span class="tm-hud-k">GPS Coordinates:</span>
          <span class="tm-hud-v">${state.myLoc.lat ? state.myLoc.lat.toFixed(5) + '°, ' + state.myLoc.lon.toFixed(5) + '°' : 'Acquiring…'}</span>
          <span class="tm-hud-k">Speed:</span>
          <span class="tm-hud-v" style="color:#38bdf8">${speedKmh} km/h</span>
          <span class="tm-hud-k">Accuracy:</span>
          <span class="tm-hud-v">${acc}</span>
          <span class="tm-hud-k">Heading / Altitude:</span>
          <span class="tm-hud-v">${heading} · ${alt}</span>
          <span class="tm-hud-k">Distance Tracked:</span>
          <span class="tm-hud-v" style="color:#ec4899">${state.myLoc.distanceKm.toFixed(2)} km</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="tm-hud-btn primary" id="tm-hud-recenter-btn" style="flex:1">Center on Me</button>
          <button class="tm-hud-btn danger" id="tm-hud-stop-btn">Stop Tracking</button>
        </div>
      </div>
    `;

    myLocCard.querySelector('#tm-hud-close-btn').onclick = () => {
      myLocCard.remove();
      myLocCard = null;
    };
    myLocCard.querySelector('#tm-hud-stop-btn').onclick = () => {
      state.liveTracking.myLocation.active = false;
      stopMyLocation();
      renderDock();
    };
    myLocCard.querySelector('#tm-hud-recenter-btn').onclick = () => {
      if (activeMap && state.myLoc.lat != null && state.myLoc.lon != null) {
        activeMap.flyTo({ center: [state.myLoc.lon, state.myLoc.lat], zoom: 15, duration: 1000 });
      }
    };
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function updateFriendsLayer() {
    if (!activeMap) return;
    const src = activeMap.getSource(SOURCES.friends);
    if (!src) return;

    const feats = state.friendsList.map(f => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [f.lon, f.lat] },
      properties: {
        category: 'friend',
        name: f.name,
        initials: f.initials,
        status: f.status,
        speedKmh: f.speedKmh,
        battery: f.battery,
        lastSeen: f.lastSeen
      }
    }));

    src.setData({ type: 'FeatureCollection', features: feats });
  }

  // Animated Wind Streamlines Overlay
  let particles = [];
  function initWindParticles() {
    particles = [];
    for (let i = 0; i < 280; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: 1 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 0.8,
        life: Math.random() * 120,
        maxLife: 80 + Math.random() * 80
      });
    }
  }

  function toggleWindStreamlines(on) {
    if (!windCanvas) return;
    if (on) {
      windCanvas.style.display = 'block';
      initWindParticles();
      startWindLoop();
    } else {
      windCanvas.style.display = 'none';
      if (windAnimId) cancelAnimationFrame(windAnimId);
      windAnimId = null;
    }
  }

  function startWindLoop() {
    if (!windCtx) return;
    function loop() {
      if (!state.weather.wind.active) return;
      windCtx.clearRect(0, 0, windCanvas.width, windCanvas.height);
      windCtx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
      windCtx.lineWidth = 1.6;

      particles.forEach(p => {
        windCtx.beginPath();
        windCtx.moveTo(p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        windCtx.lineTo(p.x, p.y);
        windCtx.stroke();

        p.life++;
        if (p.life > p.maxLife || p.x > windCanvas.width || p.y > windCanvas.height || p.y < 0) {
          p.x = Math.random() * (windCanvas.width * 0.3);
          p.y = Math.random() * windCanvas.height;
          p.life = 0;
        }
      });

      windAnimId = requestAnimationFrame(loop);
    }
    windAnimId = requestAnimationFrame(loop);
  }

  // Map hook
  function attachMap(map) {
    if (!map || map === activeMap) return;
    activeMap = map;
    const ready = () => {
      initMapLayers(map);
      fetchMovement();
      map.on('moveend', () => {
        clearTimeout(pollTimer);
        pollTimer = setTimeout(fetchMovement, 350);
      });
    };
    if (map.isStyleLoaded()) ready();
    else map.once('load', ready);
  }

  function findMap() {
    if (window.map && window.map.getBounds) attachMap(window.map);
    else setTimeout(findMap, 200);
  }

  renderDock();
  renderDrawer();
  findMap();

  setInterval(fetchMovement, 16000);

  // Global Master Layers API
  window.TrackMeNowMasterLayers = {
    toggle: toggleItem,
    refresh: fetchMovement,
    enterSpace: enterSpace,
    setEarthMode: (mode) => {
      if (window.map) {
        // Toggle MapLibre globe vs flat projection
        try {
          if (mode === 'globe') {
            window.map.setProjection({ type: 'globe' });
          } else {
            window.map.setProjection({ type: 'mercator' });
          }
        } catch (e) {
          console.warn('[MapLibre] setProjection warning:', e);
        }
      }
      state.openDrawer = null;
      renderDock();
      renderDrawer();
    },
    flyToFriend: (id) => {
      const f = state.friendsList.find(x => x.id === id);
      if (f && activeMap) {
        activeMap.flyTo({ center: [f.lon, f.lat], zoom: 11, duration: 1200 });
      }
      state.openDrawer = null;
      renderDock();
      renderDrawer();
    },
    setActive: (cat, k, v) => {
      if (state[cat] && state[cat][k]) {
        state[cat][k].active = !!v;
        applyLayerStates();
        renderDock();
        if (state.openDrawer === cat) renderDrawer();
        fetchMovement();
      }
    },
    get state() { return state; }
  };
})();
