/* TrackMeNow — Floating Control Panel for Live Intelligence Overlays (AIS, GTFS, Traffic, Flights) */
(function () {
  'use strict';
  if (window.TrackMeNowMasterLayers || document.getElementById('tm-layers-master-panel')) return;

  // SVG Icons
  const ICONS = {
    layers: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    ship: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.5l1.7 3.1a1 1 0 0 0 .9.5h11a1 1 0 0 0 .9-.5L21 17.5"/><path d="M5 17.5V9h8l4 4.5v4"/><path d="M9 9V4.5h3.5"/></svg>',
    transit: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M4 11h16M7 15h.01M17 15h.01M6 18v2M18 18v2"/></svg>',
    traffic: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
    flight: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronUp: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'
  };

  // State
  const state = {
    collapsed: false,
    loading: false,
    lastUpdate: null,
    autoRefreshSec: 14,
    countdown: 14,
    layers: {
      ais: { active: true, name: 'AIS Maritime', desc: 'Vessels, cargo & tankers', color: '#00e5ff', icon: ICONS.ship, count: 0, apiKey: 'ships' },
      gtfs: { active: true, name: 'GTFS Transit', desc: 'Buses, metro & rail feeds', color: '#10b981', icon: ICONS.transit, count: 0, apiKey: 'public-transport' },
      traffic: { active: true, name: 'Road & Traffic', desc: 'Congestion, sensors & incidents', color: '#f59e0b', icon: ICONS.traffic, count: 0, apiKey: 'traffic' },
      flights: { active: true, name: 'Air Traffic (ADS-B)', desc: 'Live aircraft positions', color: '#38bdf8', icon: ICONS.flight, count: 0, apiKey: 'flights' },
      cameras: { active: false, name: 'CCTV & Infra', desc: 'Traffic cams & power masts', color: '#a855f7', icon: ICONS.camera, count: 0, apiKey: 'cameras' }
    }
  };

  let activeMap = null;
  let activePopup = null;
  let pollInterval = null;
  let countdownInterval = null;
  let debounceTimer = null;

  // CSS Styles
  const style = document.createElement('style');
  style.textContent = `
    .tm-overlay-panel {
      position: fixed;
      top: 66px;
      right: 14px;
      width: 290px;
      max-width: calc(100vw - 28px);
      z-index: 1250;
      background: rgba(7, 12, 19, 0.90);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      box-shadow: 0 14px 38px rgba(0, 0, 0, 0.6);
      color: #edf4f8;
      font-family: system-ui, -apple-system, sans-serif;
      user-select: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    .tm-overlay-panel.collapsed {
      width: auto;
      min-width: 170px;
      border-radius: 10px;
      background: rgba(7, 12, 19, 0.92);
    }
    .tm-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
    }
    .tm-panel-header:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    .tm-panel-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tm-live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #00e5ff;
      box-shadow: 0 0 8px #00e5ff;
      animation: tm-pulse 2s infinite;
    }
    @keyframes tm-pulse {
      0% { opacity: 0.6; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.15); }
      100% { opacity: 0.6; transform: scale(0.9); }
    }
    .tm-panel-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #f0f6fa;
      text-transform: uppercase;
    }
    .tm-panel-active-badge {
      font-size: 10px;
      color: #45a8ff;
      font-family: ui-monospace, monospace;
      font-variant-numeric: tabular-nums;
    }
    .tm-panel-btn-toggle {
      background: transparent;
      border: 0;
      color: #9cb1c0;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
    }
    .tm-panel-btn-toggle:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
    .tm-panel-body {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tm-overlay-panel.collapsed .tm-panel-body,
    .tm-overlay-panel.collapsed .tm-panel-footer {
      display: none;
    }
    .tm-layer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      transition: all 0.18s ease;
      cursor: pointer;
    }
    .tm-layer-row:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.12);
    }
    .tm-layer-row.active {
      background: rgba(69, 168, 255, 0.07);
      border-color: rgba(69, 168, 255, 0.28);
    }
    .tm-layer-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .tm-layer-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .tm-layer-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .tm-layer-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tm-layer-name {
      font-size: 11px;
      font-weight: 700;
      color: #edf4f8;
      white-space: nowrap;
    }
    .tm-layer-count {
      font-size: 9px;
      font-family: ui-monospace, monospace;
      font-variant-numeric: tabular-nums;
      color: #8da4b5;
    }
    .tm-layer-desc {
      font-size: 9.5px;
      color: #7d93a4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Switch toggle */
    .tm-switch {
      position: relative;
      display: inline-block;
      width: 32px;
      height: 18px;
      flex-shrink: 0;
    }
    .tm-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .tm-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: rgba(255, 255, 255, 0.14);
      transition: 0.2s;
      border-radius: 18px;
    }
    .tm-slider:before {
      position: absolute;
      content: "";
      height: 12px;
      width: 12px;
      left: 3px;
      bottom: 3px;
      background: #c5d7e5;
      transition: 0.2s;
      border-radius: 50%;
    }
    .tm-switch input:checked + .tm-slider {
      background: #00e5ff;
    }
    .tm-switch input:checked + .tm-slider:before {
      transform: translateX(14px);
      background: #05090d;
    }
    .tm-panel-footer {
      padding: 8px 12px 10px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .tm-footer-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tm-fbtn {
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      color: #c9dbe7;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s ease;
    }
    .tm-fbtn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .tm-countdown {
      font-size: 9.5px;
      font-family: ui-monospace, monospace;
      color: #7d93a4;
      font-variant-numeric: tabular-nums;
    }
    /* MapLibre Popups */
    .maplibregl-popup-content {
      background: rgba(6, 12, 18, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      border-radius: 10px !important;
      padding: 12px 14px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7) !important;
      color: #edf4f8 !important;
      font-family: system-ui, sans-serif !important;
    }
    .maplibregl-popup-close-button {
      color: #8fa5b5 !important;
      font-size: 16px !important;
      padding: 4px 8px !important;
    }
    .maplibregl-popup-close-button:hover {
      color: #fff !important;
      background: transparent !important;
    }
    .maplibregl-popup-tip {
      border-top-color: rgba(6, 12, 18, 0.95) !important;
      border-bottom-color: rgba(6, 12, 18, 0.95) !important;
    }
    .tm-pop-category {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .tm-pop-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
      line-height: 1.25;
    }
    .tm-pop-grid {
      display: grid;
      grid-template-columns: auto auto;
      gap: 4px 12px;
      font-size: 10.5px;
      margin-bottom: 8px;
    }
    .tm-pop-k {
      color: #8da4b5;
    }
    .tm-pop-v {
      font-weight: 600;
      color: #f0f6fa;
      font-family: ui-monospace, monospace;
      text-align: right;
    }
    .tm-pop-source {
      font-size: 9px;
      color: #6c8496;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
    }
  `;
  document.head.appendChild(style);

  // Create UI Panel
  const panel = document.createElement('div');
  panel.className = 'tm-overlay-panel';
  panel.id = 'tm-overlay-control-panel';

  function renderPanel() {
    const activeCount = Object.values(state.layers).filter(l => l.active).length;
    panel.innerHTML = `
      <div class="tm-panel-header" id="tm-panel-header" title="Toggle panel">
        <div class="tm-panel-title-wrap">
          <span class="tm-live-dot"></span>
          <span class="tm-panel-title">${state.collapsed ? 'Overlays' : 'Data Layers'}</span>
          <span class="tm-panel-active-badge">${activeCount} Active</span>
        </div>
        <button class="tm-panel-btn-toggle" id="tm-panel-toggle-btn" aria-label="Collapse panel">
          ${state.collapsed ? ICONS.chevronDown : ICONS.chevronUp}
        </button>
      </div>
      <div class="tm-panel-body" id="tm-panel-body">
        ${Object.keys(state.layers).map(k => {
          const l = state.layers[k];
          return `
            <div class="tm-layer-row ${l.active ? 'active' : ''}" data-layer-key="${k}">
              <div class="tm-layer-info">
                <div class="tm-layer-icon" style="color:${l.color}; background:${l.color}15">
                  ${l.icon}
                </div>
                <div class="tm-layer-text">
                  <div class="tm-layer-name-row">
                    <span class="tm-layer-name">${l.name}</span>
                    <span class="tm-layer-count" id="count-${k}">${l.count > 0 ? '(' + l.count + ')' : ''}</span>
                  </div>
                  <span class="tm-layer-desc">${l.desc}</span>
                </div>
              </div>
              <label class="tm-switch" onclick="event.stopPropagation()">
                <input type="checkbox" data-switch-key="${k}" ${l.active ? 'checked' : ''}>
                <span class="tm-slider" style="${l.active ? 'background:' + l.color : ''}"></span>
              </label>
            </div>
          `;
        }).join('')}
      </div>
      <div class="tm-panel-footer">
        <div class="tm-footer-actions">
          <button class="tm-fbtn" id="tm-btn-all-toggle">
            ${activeCount === 0 ? 'Enable All' : 'Clear All'}
          </button>
          <button class="tm-fbtn" id="tm-btn-refresh" title="Query latest movement data">
            ${ICONS.refresh} Refresh
          </button>
        </div>
        <div class="tm-countdown" id="tm-countdown-readout">${state.countdown}s</div>
      </div>
    `;

    // Bind event handlers
    const header = panel.querySelector('#tm-panel-header');
    if (header) {
      header.onclick = function (e) {
        state.collapsed = !state.collapsed;
        if (state.collapsed) panel.classList.add('collapsed');
        else panel.classList.remove('collapsed');
        renderPanel();
      };
    }

    panel.querySelectorAll('[data-layer-row]').forEach(row => {
      row.onclick = function () {
        const k = row.getAttribute('data-layer-key');
        toggleLayer(k);
      };
    });

    panel.querySelectorAll('[data-switch-key]').forEach(input => {
      input.onchange = function (e) {
        const k = input.getAttribute('data-switch-key');
        setLayerActive(k, input.checked);
      };
    });

    const btnAll = panel.querySelector('#tm-btn-all-toggle');
    if (btnAll) {
      btnAll.onclick = function () {
        const allActive = Object.values(state.layers).every(l => l.active);
        Object.keys(state.layers).forEach(k => {
          state.layers[k].active = !allActive;
        });
        syncLayersToMap();
        renderPanel();
        fetchMovement();
      };
    }

    const btnRefresh = panel.querySelector('#tm-btn-refresh');
    if (btnRefresh) {
      btnRefresh.onclick = function () {
        state.countdown = state.autoRefreshSec;
        fetchMovement(true);
      };
    }
  }

  function toggleLayer(k) {
    if (!state.layers[k]) return;
    setLayerActive(k, !state.layers[k].active);
  }

  function setLayerActive(k, active) {
    if (!state.layers[k]) return;
    state.layers[k].active = !!active;
    syncLayersToMap();
    renderPanel();
    fetchMovement();
  }

  // MapLibre Layer Management
  const SOURCES = {
    ais: 'tm-ais-source',
    gtfs: 'tm-gtfs-source',
    traffic: 'tm-traffic-source',
    flights: 'tm-flights-source',
    cameras: 'tm-cameras-source'
  };

  const LAYERS = {
    ais: ['tm-ais-layer-outer', 'tm-ais-layer-inner', 'tm-ais-layer-label'],
    gtfs: ['tm-gtfs-layer-outer', 'tm-gtfs-layer-inner', 'tm-gtfs-layer-label'],
    traffic: ['tm-traffic-layer-pulse', 'tm-traffic-layer-circle', 'tm-traffic-layer-label'],
    flights: ['tm-flights-layer-halo', 'tm-flights-layer-icon', 'tm-flights-layer-label'],
    cameras: ['tm-cameras-layer-circle', 'tm-cameras-layer-label']
  };

  function initMapLayers(map) {
    if (!map || !map.isStyleLoaded()) return;

    // 1. AIS Maritime
    if (!map.getSource(SOURCES.ais)) {
      map.addSource(SOURCES.ais, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-ais-layer-outer',
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
        id: 'tm-ais-layer-inner',
        type: 'circle',
        source: SOURCES.ais,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 4.5, 16, 6],
          'circle-color': '#ffffff',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-ais-layer-label',
        type: 'symbol',
        source: SOURCES.ais,
        minzoom: 8,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
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

    // 2. GTFS Transit
    if (!map.getSource(SOURCES.gtfs)) {
      map.addSource(SOURCES.gtfs, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-gtfs-layer-outer',
        type: 'circle',
        source: SOURCES.gtfs,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3.5, 10, 7.5, 16, 11],
          'circle-color': '#10b981',
          'circle-opacity': 0.35,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#10b981'
        }
      });
      map.addLayer({
        id: 'tm-gtfs-layer-inner',
        type: 'circle',
        source: SOURCES.gtfs,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2, 10, 4, 16, 5.5],
          'circle-color': '#e6fff5',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-gtfs-layer-label',
        type: 'symbol',
        source: SOURCES.gtfs,
        minzoom: 9,
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9.5,
          'text-offset': [0, 1.3],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#34d399',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // 3. Traffic & Incidents
    if (!map.getSource(SOURCES.traffic)) {
      map.addSource(SOURCES.traffic, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-traffic-layer-pulse',
        type: 'circle',
        source: SOURCES.traffic,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 10, 9, 16, 14],
          'circle-color': [
            'match', ['get', 'severity'],
            'heavy', '#ef4444',
            'moderate', '#f59e0b',
            'roadwork', '#06b6d4',
            '#eab308'
          ],
          'circle-opacity': 0.25,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'match', ['get', 'severity'],
            'heavy', '#ef4444',
            'moderate', '#f59e0b',
            'roadwork', '#06b6d4',
            '#eab308'
          ]
        }
      });
      map.addLayer({
        id: 'tm-traffic-layer-circle',
        type: 'circle',
        source: SOURCES.traffic,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 5, 16, 7],
          'circle-color': [
            'match', ['get', 'severity'],
            'heavy', '#f87171',
            'moderate', '#fbbf24',
            'roadwork', '#38bdf8',
            '#fde047'
          ],
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-traffic-layer-label',
        type: 'symbol',
        source: SOURCES.traffic,
        minzoom: 9,
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 9,
          'text-offset': [0, 1.4],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#fbbf24',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // 4. Flights (ADS-B)
    if (!map.getSource(SOURCES.flights)) {
      map.addSource(SOURCES.flights, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-flights-layer-halo',
        type: 'circle',
        source: SOURCES.flights,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 10, 8, 16, 12],
          'circle-color': '#38bdf8',
          'circle-opacity': 0.25,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#38bdf8'
        }
      });
      map.addLayer({
        id: 'tm-flights-layer-icon',
        type: 'circle',
        source: SOURCES.flights,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 10, 4.5, 16, 6],
          'circle-color': '#f0f9ff',
          'circle-opacity': 0.95
        }
      });
      map.addLayer({
        id: 'tm-flights-layer-label',
        type: 'symbol',
        source: SOURCES.flights,
        minzoom: 6,
        layout: {
          'text-field': ['get', 'callsign'],
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

    // 5. Cameras & Infrastructure
    if (!map.getSource(SOURCES.cameras)) {
      map.addSource(SOURCES.cameras, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'tm-cameras-layer-circle',
        type: 'circle',
        source: SOURCES.cameras,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 3, 10, 6, 16, 9],
          'circle-color': '#c084fc',
          'circle-opacity': 0.85,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });
      map.addLayer({
        id: 'tm-cameras-layer-label',
        type: 'symbol',
        source: SOURCES.cameras,
        minzoom: 11,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 8.5,
          'text-offset': [0, 1.3],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#e9d5ff',
          'text-halo-color': '#05090d',
          'text-halo-width': 1.5
        }
      });
    }

    // Setup interactive popups and pointer cursors
    setupInteractivePopups(map);
    syncLayersToMap();
  }

  function syncLayersToMap() {
    if (!activeMap) return;
    Object.keys(state.layers).forEach(k => {
      const active = state.layers[k].active;
      const layerIds = LAYERS[k] || [];
      layerIds.forEach(id => {
        try {
          if (activeMap.getLayer(id)) {
            activeMap.setLayoutProperty(id, 'visibility', active ? 'visible' : 'none');
          }
        } catch (e) {}
      });
    });
  }

  function setupInteractivePopups(map) {
    const clickableLayers = [
      'tm-ais-layer-outer',
      'tm-gtfs-layer-outer',
      'tm-traffic-layer-circle',
      'tm-flights-layer-icon',
      'tm-cameras-layer-circle'
    ];

    clickableLayers.forEach(layerId => {
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', layerId, (e) => {
        if (!e.features || !e.features[0]) return;
        const f = e.features[0];
        const p = f.properties || {};
        const cat = p.category || '';
        const coords = f.geometry.coordinates.slice();

        let html = '';
        if (cat === 'ship') {
          html = `
            <div class="tm-pop-category" style="color:#00e5ff">AIS MARITIME VESSEL</div>
            <div class="tm-pop-title">${p.name || 'Commercial Vessel'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Type:</span><span class="tm-pop-v">${p.ship_type || 'Cargo/Vessel'}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_knots != null ? p.speed_knots + ' kn' : (p.speed_mps ? (p.speed_mps * 1.94).toFixed(1) + ' kn' : '—')}</span>
              <span class="tm-pop-k">Heading:</span><span class="tm-pop-v">${p.heading != null ? p.heading + '°' : '—'}</span>
              <span class="tm-pop-k">MMSI:</span><span class="tm-pop-v">${p.mmsi || '—'}</span>
              <span class="tm-pop-k">Flag / Length:</span><span class="tm-pop-v">${p.flag || '—'} · ${p.length_m ? p.length_m + 'm' : '—'}</span>
            </div>
            <div class="tm-pop-source">
              <span>${p.source || 'AIS Maritime Network'}</span>
              <span>${p.status || 'LIVE'}</span>
            </div>
          `;
        } else if (cat === 'public-transport' || cat === 'transit') {
          html = `
            <div class="tm-pop-category" style="color:#10b981">GTFS PUBLIC TRANSIT</div>
            <div class="tm-pop-title">${p.label || p.route_id || 'Transit Vehicle'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Mode:</span><span class="tm-pop-v">${(p.mode || 'Bus').toUpperCase()}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_kmh != null ? p.speed_kmh + ' km/h' : (p.speed_mps ? (p.speed_mps * 3.6).toFixed(0) + ' km/h' : '—')}</span>
              <span class="tm-pop-k">Route ID:</span><span class="tm-pop-v">${p.route_id || p.trip_id || 'Active'}</span>
              <span class="tm-pop-k">Vehicle ID:</span><span class="tm-pop-v">${p.vehicle_id || '—'}</span>
            </div>
            <div class="tm-pop-source">
              <span>${p.source || 'GTFS-Realtime'}</span>
              <span>${p.status || 'LIVE'}</span>
            </div>
          `;
        } else if (cat === 'traffic') {
          html = `
            <div class="tm-pop-category" style="color:#f59e0b">ROAD TRAFFIC ADVISORY</div>
            <div class="tm-pop-title">${p.title || p.road_name || 'Traffic Condition'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Severity:</span><span class="tm-pop-v" style="color:#fbbf24">${(p.severity || 'Moderate').toUpperCase()}</span>
              <span class="tm-pop-k">Avg Speed:</span><span class="tm-pop-v">${p.speed_kmh != null ? p.speed_kmh + ' km/h' : '—'}</span>
              <span class="tm-pop-k">Delay:</span><span class="tm-pop-v">${p.delay_min ? '+' + p.delay_min + ' min' : 'Normal'}</span>
              <span class="tm-pop-k">Corridor:</span><span class="tm-pop-v">${p.road_name || 'Highway'}</span>
            </div>
            <div class="tm-pop-source">
              <span>${p.description || p.source || 'DOT Traffic Monitoring'}</span>
              <span>${p.status || 'LIVE'}</span>
            </div>
          `;
        } else if (cat === 'flight') {
          html = `
            <div class="tm-pop-category" style="color:#38bdf8">ADS-B LIVE AIRCRAFT</div>
            <div class="tm-pop-title">${p.callsign || p.icao24 || 'Civil Aircraft'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Altitude:</span><span class="tm-pop-v">${p.altitude_m != null ? Number(p.altitude_m).toLocaleString() + ' m' : '—'}</span>
              <span class="tm-pop-k">Speed:</span><span class="tm-pop-v">${p.speed_kts != null ? p.speed_kts + ' kn' : (p.speed_mps ? (p.speed_mps * 1.94).toFixed(0) + ' kn' : '—')}</span>
              <span class="tm-pop-k">Heading:</span><span class="tm-pop-v">${p.heading != null ? p.heading + '°' : '—'}</span>
              <span class="tm-pop-k">ICAO24:</span><span class="tm-pop-v">${(p.icao24 || '').toUpperCase()}</span>
              <span class="tm-pop-k">Registry:</span><span class="tm-pop-v">${p.country || 'Commercial'}</span>
            </div>
            <div class="tm-pop-source">
              <span>${p.source || 'ADS-B Network'}</span>
              <span>${p.status || 'LIVE'}</span>
            </div>
          `;
        } else {
          html = `
            <div class="tm-pop-category" style="color:#c084fc">INFRASTRUCTURE</div>
            <div class="tm-pop-title">${p.name || 'Sensor node'}</div>
            <div class="tm-pop-grid">
              <span class="tm-pop-k">Type:</span><span class="tm-pop-v">${p.category || 'Asset'}</span>
              <span class="tm-pop-k">Source:</span><span class="tm-pop-v">${p.source || 'OpenStreetMap'}</span>
            </div>
          `;
        }

        if (activePopup) activePopup.remove();
        activePopup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '320px' })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });
    });
  }

  // Fetch Movement Data from Backend
  async function fetchMovement(force = false) {
    if (!activeMap || !activeMap.isStyleLoaded()) return;

    // Check which layers are active
    const activeKeys = Object.keys(state.layers).filter(k => state.layers[k].active);
    if (activeKeys.length === 0) {
      // Clear all sources
      Object.keys(SOURCES).forEach(k => {
        const s = activeMap.getSource(SOURCES[k]);
        if (s) s.setData({ type: 'FeatureCollection', features: [] });
        state.layers[k].count = 0;
      });
      renderPanel();
      return;
    }

    const bounds = activeMap.getBounds();
    if (!bounds) return;

    const minLon = bounds.getWest();
    const minLat = bounds.getSouth();
    const maxLon = bounds.getEast();
    const maxLat = bounds.getNorth();
    const zoom = Math.round(activeMap.getZoom());

    const layerParams = activeKeys.map(k => state.layers[k].apiKey).join(',');
    const url = `/api/global/movement?bbox=${minLon.toFixed(4)},${minLat.toFixed(4)},${maxLon.toFixed(4)},${maxLat.toFixed(4)}&layers=${layerParams}&zoom=${zoom}`;

    state.loading = true;
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const features = data.features || [];

      // Partition features by layer
      const partitioned = {
        ais: [],
        gtfs: [],
        traffic: [],
        flights: [],
        cameras: []
      };

      features.forEach(f => {
        const cat = f.properties && f.properties.category;
        if (cat === 'ship') partitioned.ais.push(f);
        else if (cat === 'public-transport' || cat === 'transit') partitioned.gtfs.push(f);
        else if (cat === 'traffic') partitioned.traffic.push(f);
        else if (cat === 'flight') partitioned.flights.push(f);
        else if (cat === 'camera' || cat === 'infrastructure') partitioned.cameras.push(f);
      });

      // Update MapLibre Sources
      Object.keys(partitioned).forEach(k => {
        const feats = state.layers[k].active ? partitioned[k] : [];
        const src = activeMap.getSource(SOURCES[k]);
        if (src) {
          src.setData({ type: 'FeatureCollection', features: feats });
        }
        state.layers[k].count = feats.length;
      });

      state.lastUpdate = new Date();
      updateCountsUI();
    } catch (err) {
      console.warn('[TrackMeNow] Movement poll warning:', err.message);
    } finally {
      state.loading = false;
    }
  }

  function updateCountsUI() {
    Object.keys(state.layers).forEach(k => {
      const countEl = document.getElementById(`count-${k}`);
      if (countEl) {
        countEl.textContent = state.layers[k].count > 0 ? `(${state.layers[k].count})` : '';
      }
    });
    const badge = panel.querySelector('.tm-panel-active-badge');
    if (badge) {
      const activeCount = Object.values(state.layers).filter(l => l.active).length;
      badge.textContent = `${activeCount} Active`;
    }
  }

  // Hook into MapLibre
  function attachToMap(map) {
    if (!map || map === activeMap) return;
    activeMap = map;

    const onReady = () => {
      initMapLayers(map);
      fetchMovement(true);

      map.on('moveend', () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchMovement();
        }, 350);
      });
    };

    if (map.isStyleLoaded()) {
      onReady();
    } else {
      map.once('load', onReady);
    }
  }

  function pollForMap() {
    if (window.map && window.map.getBounds) {
      attachToMap(window.map);
    } else {
      setTimeout(pollForMap, 200);
    }
  }

  // Mount Panel and Start Polling Loop
  document.body.appendChild(panel);
  renderPanel();
  pollForMap();

  // Auto-refresh countdown loop
  countdownInterval = setInterval(() => {
    state.countdown--;
    if (state.countdown <= 0) {
      state.countdown = state.autoRefreshSec;
      fetchMovement();
    }
    const cd = document.getElementById('tm-countdown-readout');
    if (cd) cd.textContent = state.countdown + 's';
  }, 1000);

  // Periodically check if window.map changed (e.g. user toggled flat/globe mode in trackmenow.js)
  setInterval(() => {
    if (window.map && window.map !== activeMap) {
      attachToMap(window.map);
    }
  }, 1200);

  // Expose global controller
  window.TrackMeNowLayers = {
    toggle: toggleLayer,
    setActive: setLayerActive,
    refresh: () => fetchMovement(true),
    get state() { return state; }
  };
})();
