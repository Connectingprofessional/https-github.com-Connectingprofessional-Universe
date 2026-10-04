/* TrackMeNow — AURA Intelligent Digital Human Companion & Voice Engine */
(function () {
  'use strict';

  const PERSONALITIES = [
    { id: 'Global Intelligence Guide', label: 'Global Guide', desc: 'Real-time telemetry, transport & satellite tracking' },
    { id: 'Friend', label: 'Friend', desc: 'Warm, relaxed, friendly companion' },
    { id: 'Teacher', label: 'Teacher', desc: 'Educational, patient, geospatial insights' },
    { id: 'Advisor', label: 'Advisor', desc: 'Strategic, analytical, intelligence briefings' },
    { id: 'Travel Guide', label: 'Travel Guide', desc: 'Routes, cities, landmarks & local weather' }
  ];

  const state = {
    open: false,
    personality: 'Global Intelligence Guide',
    speaking: false,
    listening: false,
    muted: false,
    currentMessage: 'Welcome to TrackMeNow. I am AURA, your global intelligence companion. Ask me to track flights, inspect railways, check weather, or navigate anywhere across Earth and space.',
    expression: 'neutral', // 'neutral', 'smiling', 'thinking', 'speaking', 'listening'
    cursorX: 0.5,
    cursorY: 0.5,
    lastBlink: Date.now(),
    blinkDuration: 180,
    isBlinking: false
  };

  // Web Speech API
  const synth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  let recognition = null;
  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => {
        state.listening = true;
        state.expression = 'listening';
        updateUI();
      };
      recognition.onend = () => {
        state.listening = false;
        if (state.expression === 'listening') state.expression = 'neutral';
        updateUI();
      };
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (text) {
          askAura(text);
        }
      };
    } catch (e) {
      console.warn('[AURA] SpeechRecognition init failed:', e);
    }
  }

  // Styles for AURA
  const style = document.createElement('style');
  style.textContent = `
    .tm-aura-container {
      position: fixed;
      bottom: 62px;
      right: 18px;
      z-index: 2400;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      pointer-events: none;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .tm-aura-container > * {
      pointer-events: auto;
    }
    /* Floating Avatar Circle */
    .tm-aura-avatar-btn {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(6, 12, 19, 0.94);
      border: 2px solid #00e5ff;
      box-shadow: 0 0 20px rgba(0, 229, 255, 0.4), 0 8px 30px rgba(0, 0, 0, 0.6);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    .tm-aura-avatar-btn:hover {
      transform: scale(1.06);
      box-shadow: 0 0 26px rgba(0, 229, 255, 0.6), 0 10px 35px rgba(0, 0, 0, 0.8);
      border-color: #45a8ff;
    }
    .tm-aura-avatar-btn.speaking {
      border-color: #38bdf8;
      box-shadow: 0 0 28px rgba(56, 189, 248, 0.8), 0 0 12px #38bdf8;
      animation: aura-speak-glow 1.2s infinite alternate;
    }
    @keyframes aura-speak-glow {
      from { box-shadow: 0 0 16px rgba(0, 229, 255, 0.4); }
      to { box-shadow: 0 0 32px rgba(0, 229, 255, 0.9), 0 0 16px #00e5ff; }
    }
    .tm-aura-canvas {
      width: 54px;
      height: 54px;
      border-radius: 50%;
    }
    .tm-aura-badge {
      position: absolute;
      bottom: -1px;
      right: -1px;
      background: #00e5ff;
      color: #05090d;
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 0.5px;
      padding: 1px 4px;
      border-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.5);
    }
    /* Expanded Dialogue Card */
    .tm-aura-card {
      width: 330px;
      max-width: calc(100vw - 36px);
      background: rgba(7, 12, 19, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 14px;
      box-shadow: 0 16px 45px rgba(0, 0, 0, 0.7);
      color: #edf4f8;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: tm-aura-appear 0.22s ease-out;
    }
    @keyframes tm-aura-appear {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .tm-aura-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .tm-aura-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tm-aura-h-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00e5ff;
      box-shadow: 0 0 10px #00e5ff;
    }
    .tm-aura-h-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #ffffff;
    }
    .tm-aura-h-persona {
      font-size: 9.5px;
      color: #7dd3fc;
      font-family: ui-monospace, monospace;
    }
    .tm-aura-h-close {
      background: transparent;
      border: 0;
      color: #8da4b5;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
    }
    .tm-aura-h-close:hover {
      color: #fff;
    }
    .tm-aura-speech-box {
      padding: 12px 14px;
      font-size: 12px;
      line-height: 1.5;
      color: #e2eaf0;
      max-height: 160px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    /* Persona Selector */
    .tm-aura-persona-bar {
      display: flex;
      gap: 4px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tm-aura-persona-btn {
      font-size: 9px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: #9cb1c0;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .tm-aura-persona-btn.active {
      background: rgba(0, 229, 255, 0.18);
      border-color: #00e5ff;
      color: #00e5ff;
    }
    /* Controls and Input */
    .tm-aura-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
    }
    .tm-aura-input {
      flex: 1;
      height: 32px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 7px;
      color: #fff;
      padding: 0 10px;
      font-size: 11px;
      outline: none;
    }
    .tm-aura-input:focus {
      border-color: #00e5ff;
    }
    .tm-aura-action-btn {
      height: 32px;
      padding: 0 10px;
      border-radius: 7px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.07);
      color: #edf4f8;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s ease;
    }
    .tm-aura-action-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }
    .tm-aura-action-btn.active {
      background: #00e5ff;
      color: #05090d;
      border-color: #00e5ff;
    }
    /* Prompt suggestion chips */
    .tm-aura-suggestions {
      display: flex;
      gap: 4px;
      padding: 4px 12px 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tm-aura-chip {
      font-size: 9px;
      color: #7dd3fc;
      background: rgba(69, 168, 255, 0.1);
      border: 1px solid rgba(69, 168, 255, 0.2);
      border-radius: 12px;
      padding: 3px 8px;
      white-space: nowrap;
      cursor: pointer;
    }
    .tm-aura-chip:hover {
      background: rgba(69, 168, 255, 0.22);
      border-color: #00e5ff;
    }
  `;
  document.head.appendChild(style);

  // Create UI Container
  const container = document.createElement('div');
  container.className = 'tm-aura-container';
  container.id = 'tm-aura-root';
  document.body.appendChild(container);

  // Avatar Canvas Drawer
  let canvas, ctx;
  function initAvatarCanvas() {
    canvas = document.createElement('canvas');
    canvas.width = 108;
    canvas.height = 108;
    canvas.className = 'tm-aura-canvas';
    ctx = canvas.getContext('2d');
    startAvatarLoop();
  }

  function startAvatarLoop() {
    let t = 0;
    function draw() {
      t += 0.035;
      if (!ctx) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const bgGrad = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, w/2);
      bgGrad.addColorStop(0, '#0f273d');
      bgGrad.addColorStop(1, '#060d14');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2);
      ctx.fill();

      // Subtle breathing motion
      const breath = Math.sin(t * 1.5) * 1.5;
      const headY = 56 + breath;
      const headX = 54;

      // Shoulders / Cyber Suit
      ctx.fillStyle = '#0f1c29';
      ctx.beginPath();
      ctx.ellipse(headX, 98 + breath, 36, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Collar line glow
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(headX, 86 + breath, 16, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Face silhouette
      ctx.fillStyle = '#d4e6f1';
      ctx.beginPath();
      ctx.ellipse(headX, headY - 4, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e3a53';
      ctx.beginPath();
      ctx.arc(headX, headY - 10, 20, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // Blinking logic
      const now = Date.now();
      if (!state.isBlinking && now - state.lastBlink > 3500 + Math.random() * 2000) {
        state.isBlinking = true;
        state.lastBlink = now;
      }
      if (state.isBlinking && now - state.lastBlink > state.blinkDuration) {
        state.isBlinking = false;
        state.lastBlink = now;
      }

      // Eye positions and gaze
      const gazeX = (state.cursorX - 0.5) * 3;
      const gazeY = (state.cursorY - 0.5) * 2;
      const leftEyeX = headX - 6;
      const rightEyeX = headX + 6;
      const eyeY = headY - 4;

      if (state.isBlinking) {
        // Eyelid slit
        ctx.strokeStyle = '#2c4f6d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(leftEyeX - 3, eyeY);
        ctx.lineTo(leftEyeX + 3, eyeY);
        ctx.moveTo(rightEyeX - 3, eyeY);
        ctx.lineTo(rightEyeX + 3, eyeY);
        ctx.stroke();
      } else {
        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 3.5, 2.8, 0, 0, Math.PI * 2);
        ctx.ellipse(rightEyeX, eyeY, 3.5, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Irises (Cyan glowing)
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.arc(leftEyeX + gazeX * 0.5, eyeY + gazeY * 0.5, 1.8, 0, Math.PI * 2);
        ctx.arc(rightEyeX + gazeX * 0.5, eyeY + gazeY * 0.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#05090d';
        ctx.beginPath();
        ctx.arc(leftEyeX + gazeX * 0.5, eyeY + gazeY * 0.5, 0.9, 0, Math.PI * 2);
        ctx.arc(rightEyeX + gazeX * 0.5, eyeY + gazeY * 0.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      const mouthY = headY + 8;
      ctx.strokeStyle = '#2c4f6d';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';

      if (state.speaking) {
        // Lip sync mouth opening
        const openH = 2 + Math.abs(Math.sin(t * 8)) * 4;
        ctx.fillStyle = '#1a334a';
        ctx.beginPath();
        ctx.ellipse(headX, mouthY, 4, openH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (state.expression === 'smiling' || state.personality === 'Friend') {
        ctx.beginPath();
        ctx.arc(headX, mouthY - 3, 5, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(headX - 4, mouthY);
        ctx.lineTo(headX + 4, mouthY);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // Track cursor position for gaze
  window.addEventListener('mousemove', (e) => {
    state.cursorX = e.clientX / window.innerWidth;
    state.cursorY = e.clientY / window.innerHeight;
  });

  function updateUI() {
    container.innerHTML = '';

    if (state.open) {
      const card = document.createElement('div');
      card.className = 'tm-aura-card';
      card.innerHTML = `
        <div class="tm-aura-header">
          <div class="tm-aura-title-group">
            <span class="tm-aura-h-dot"></span>
            <span class="tm-aura-h-title">AURA AI</span>
            <span class="tm-aura-h-persona">${state.personality}</span>
          </div>
          <button class="tm-aura-h-close" id="tm-aura-close-btn" title="Minimize">✕</button>
        </div>
        <div class="tm-aura-speech-box" id="tm-aura-speech-box">
          ${state.currentMessage}
        </div>
        <div class="tm-aura-persona-bar">
          ${PERSONALITIES.map(p => `
            <button class="tm-aura-persona-btn ${state.personality === p.id ? 'active' : ''}" data-persona="${p.id}">
              ${p.label}
            </button>
          `).join('')}
        </div>
        <div class="tm-aura-suggestions">
          <span class="tm-aura-chip" data-prompt="Show me flights over India">✈️ Flights India</span>
          <span class="tm-aura-chip" data-prompt="Show me trains near London">🚆 London Trains</span>
          <span class="tm-aura-chip" data-prompt="What is the weather in Tokyo?">🌤️ Tokyo Weather</span>
          <span class="tm-aura-chip" data-prompt="Where are my friends?">📍 Friends</span>
          <span class="tm-aura-chip" data-prompt="Switch to Solar System mode">🪐 Space View</span>
        </div>
        <div class="tm-aura-controls">
          <input class="tm-aura-input" id="tm-aura-user-input" placeholder="Ask AURA about flights, trains, weather…" />
          <button class="tm-aura-action-btn ${state.listening ? 'active' : ''}" id="tm-aura-mic-btn" title="Talk to AURA">
            ${state.listening ? '🎙️ Listening' : '🎙️ Mic'}
          </button>
          <button class="tm-aura-action-btn" id="tm-aura-send-btn" title="Send message">
            ➤
          </button>
        </div>
      `;

      // Bind card events
      card.querySelector('#tm-aura-close-btn').onclick = () => {
        state.open = false;
        stopSpeaking();
        updateUI();
      };

      card.querySelectorAll('[data-persona]').forEach(btn => {
        btn.onclick = () => {
          state.personality = btn.getAttribute('data-persona');
          speakText(`Personality switched to ${state.personality}. How can I assist you?`);
          updateUI();
        };
      });

      card.querySelectorAll('[data-prompt]').forEach(chip => {
        chip.onclick = () => {
          const q = chip.getAttribute('data-prompt');
          askAura(q);
        };
      });

      const input = card.querySelector('#tm-aura-user-input');
      const sendBtn = card.querySelector('#tm-aura-send-btn');
      const micBtn = card.querySelector('#tm-aura-mic-btn');

      const handleSend = () => {
        const text = (input.value || '').trim();
        if (text) {
          askAura(text);
          input.value = '';
        }
      };

      sendBtn.onclick = handleSend;
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });

      if (micBtn) {
        micBtn.onclick = () => {
          if (!recognition) {
            speakText('Speech recognition is not supported in this browser. You can type to me!');
            return;
          }
          if (state.listening) {
            recognition.stop();
          } else {
            try {
              recognition.start();
            } catch (err) {
              console.warn(err);
            }
          }
        };
      }

      container.appendChild(card);
    }

    // Avatar Button
    const avatarBtn = document.createElement('div');
    avatarBtn.className = `tm-aura-avatar-btn ${state.speaking ? 'speaking' : ''}`;
    avatarBtn.id = 'tm-aura-avatar-trigger';
    avatarBtn.title = 'Talk with AURA (Digital Human Assistant)';

    if (!canvas) initAvatarCanvas();
    avatarBtn.appendChild(canvas);

    const badge = document.createElement('div');
    badge.className = 'tm-aura-badge';
    badge.textContent = 'AURA';
    avatarBtn.appendChild(badge);

    avatarBtn.onclick = () => {
      state.open = !state.open;
      updateUI();
      if (state.open && !state.speaking) {
        speakText(state.currentMessage);
      }
    };

    container.appendChild(avatarBtn);
  }

  // Ask AURA API
  async function askAura(prompt) {
    state.currentMessage = `Thinking…`;
    state.expression = 'thinking';
    updateUI();

    let mapContext = {};
    if (window.map) {
      const c = window.map.getCenter();
      mapContext = {
        centerLat: Number(c.lat.toFixed(3)),
        centerLon: Number(c.lng.toFixed(3)),
        zoom: Number(window.map.getZoom().toFixed(1)),
        activeLayers: window.TrackMeNowLayers ? Object.keys(window.TrackMeNowLayers.state.layers).filter(k => window.TrackMeNowLayers.state.layers[k].active) : []
      };
    }

    try {
      const res = await fetch('/api/aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          personality: state.personality,
          mapContext
        })
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const rawReply = data.reply || 'I am ready to help you navigate and inspect global intelligence data.';

      // Parse possible embedded JSON navigation commands
      const jsonMatch = rawReply.match(/```json\s*([\s\S]*?)\s*```/);
      let spokenText = rawReply;
      if (jsonMatch) {
        spokenText = rawReply.replace(/```json[\s\S]*?```/, '').trim();
        try {
          const actionCmd = JSON.parse(jsonMatch[1]);
          executeAuraCommand(actionCmd);
        } catch (e) {
          console.warn('[AURA] Command parse error:', e);
        }
      }

      state.currentMessage = spokenText;
      state.expression = 'speaking';
      updateUI();
      speakText(spokenText);
    } catch (err) {
      console.warn('[AURA] Query error:', err);
      const fallback = `I encountered an issue connecting to the reasoning service, but I can still help you navigate! You can ask me to track flights, inspect trains, or check weather.`;
      state.currentMessage = fallback;
      updateUI();
      speakText(fallback);
    }
  }

  // Execute Map Navigation & Layer Commands from AURA
  function executeAuraCommand(cmd) {
    if (!cmd || !cmd.action) return;

    if (cmd.action === 'navigate' && window.map) {
      const lat = Number(cmd.lat);
      const lon = Number(cmd.lon);
      const zoom = Number(cmd.zoom || 10);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        window.map.flyTo({ center: [lon, lat], zoom, duration: 1500 });
      }
      if (cmd.layer && window.TrackMeNowLayers) {
        window.TrackMeNowLayers.setActive(cmd.layer, true);
      }
    } else if (cmd.action === 'activate' && cmd.layer && window.TrackMeNowLayers) {
      window.TrackMeNowLayers.setActive(cmd.layer, true);
    } else if (cmd.action === 'scale' && cmd.scale && window.TrackMeNowEngine) {
      window.TrackMeNowEngine.setScale(cmd.scale);
    } else if (cmd.action === 'open_panel' && cmd.panel === 'friends' && window.TrackMeNowSocial) {
      window.TrackMeNowSocial.open();
    }
  }

  // Text-To-Speech Synthesis
  function speakText(text) {
    if (state.muted || !synth) return;
    try {
      synth.cancel();
      // Remove markdown quotes and code blocks
      const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[*_#]/g, '').trim();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.05;
      utter.pitch = 1.02;

      // Select female or natural voice if available
      const voices = synth.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Female')));
      if (preferred) utter.voice = preferred;

      utter.onstart = () => {
        state.speaking = true;
        state.expression = 'speaking';
        updateAvatarButtonGlow();
      };
      utter.onend = () => {
        state.speaking = false;
        state.expression = 'neutral';
        updateAvatarButtonGlow();
      };
      utter.onerror = () => {
        state.speaking = false;
        state.expression = 'neutral';
        updateAvatarButtonGlow();
      };

      synth.speak(utter);
    } catch (e) {
      console.warn('[AURA] Speech error:', e);
    }
  }

  function stopSpeaking() {
    if (synth) synth.cancel();
    state.speaking = false;
    state.expression = 'neutral';
    updateAvatarButtonGlow();
  }

  function updateAvatarButtonGlow() {
    const btn = document.getElementById('tm-aura-avatar-trigger');
    if (btn) {
      if (state.speaking) btn.classList.add('speaking');
      else btn.classList.remove('speaking');
    }
  }

  function narrateWeather(placeName, wx) {
    if (!wx) return;
    const temp = Math.round(wx.temp != null ? wx.temp : 20);
    const humidity = Math.round(wx.humidity || 0);
    const rainProb = Math.round(wx.rainProb != null ? wx.rainProb : 0);
    const wind = Math.round(wx.wind || 0);
    const condition = wx.condition || 'Clear skies';
    const speech = `It's currently ${temp}°C in ${placeName || 'this location'} with ${humidity}% humidity and a ${rainProb}% chance of rain. Current conditions are ${condition.toLowerCase()} with winds at ${wind} km/h.`;
    state.currentMessage = speech;
    state.expression = 'speaking';
    updateUI();
    speakText(speech);
  }

  // Global AURA API
  window.AURA = {
    ask: askAura,
    speak: speakText,
    narrateWeather: narrateWeather,
    stop: stopSpeaking,
    open: () => { state.open = true; updateUI(); },
    close: () => { state.open = false; stopSpeaking(); updateUI(); },
    get state() { return state; }
  };

  // Mount AURA
  updateUI();
})();
