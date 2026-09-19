/* ═══════════════════════════════════════════════════════════════
   TTS Engine — Text-to-Speech with Web Speech API & Kokoro
   ═══════════════════════════════════════════════════════════════ */

window.TTS = (() => {
  // State
  let synth = window.speechSynthesis;
  let utterance = null;
  let isPlaying = false;
  let isPaused = false;
  let currentText = '';
  let currentSpeed = 1;
  let currentVoice = null;
  let onProgressCallback = null;
  let onEndCallback = null;
  let onErrorCallback = null;
  let progressInterval = null;
  let startTime = 0;
  let pausedAt = 0;

  // Available voices
  let voices = [];
  let preferredVoices = [
    'Google UK English Female',
    'Google UK English Male',
    'Google US English',
    'Samantha',
    'Alex',
    'Karen',
    'Daniel',
    'Moira',
    'Tessa'
  ];

  // Speed options
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  /**
   * Initialize TTS engine
   */
  function init() {
    // Load voices
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Set default voice
    currentVoice = getBestVoice();
  }

  /**
   * Load available voices
   */
  function loadVoices() {
    voices = synth.getVoices();
    if (voices.length > 0 && !currentVoice) {
      currentVoice = getBestVoice();
    }
  }

  /**
   * Get best available voice
   */
  function getBestVoice() {
    if (voices.length === 0) return null;

    // Try to find a preferred voice
    for (const preferred of preferredVoices) {
      const found = voices.find(v => v.name === preferred);
      if (found) return found;
    }

    // Fallback to first English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) return englishVoice;

    // Fallback to first voice
    return voices[0];
  }

  /**
   * Get all available voices
   */
  function getVoices() {
    return voices.filter(v => v.lang.startsWith('en'));
  }

  /**
   * Set voice by name
   */
  function setVoice(voiceName) {
    const found = voices.find(v => v.name === voiceName);
    if (found) {
      currentVoice = found;
    }
  }

  /**
   * Set playback speed
   */
  function setSpeed(speed) {
    currentSpeed = Math.max(0.5, Math.min(2, speed));
    if (utterance && isPlaying) {
      // Cannot change speed while playing, need to restart
      const currentPos = utterance.charIndex;
      stop();
      speakAtPosition(currentText, currentPos);
    }
  }

  /**
   * Speak text
   */
  function speak(text, options = {}) {
    if (!synth) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    stop();

    currentText = text;
    currentSpeed = options.speed || currentSpeed;
    
    if (options.onProgress) onProgressCallback = options.onProgress;
    if (options.onEnd) onEndCallback = options.onEnd;
    if (options.onError) onErrorCallback = options.onError;

    speakAtPosition(text, 0);
  }

  /**
   * Speak from a specific position
   */
  function speakAtPosition(text, startPos) {
    utterance = new SpeechSynthesisUtterance(text.slice(startPos));
    
    if (currentVoice) {
      utterance.voice = currentVoice;
    }
    
    utterance.rate = currentSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      isPlaying = true;
      isPaused = false;
      startTime = Date.now() - (startPos / text.length * getEstimatedDuration(text));
      startProgressTracking(text);
    };

    utterance.onend = () => {
      isPlaying = false;
      isPaused = false;
      stopProgressTracking();
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (event) => {
      isPlaying = false;
      isPaused = false;
      stopProgressTracking();
      if (event.error !== 'canceled' && onErrorCallback) {
        onErrorCallback(event.error);
      }
    };

    utterance.onpause = () => {
      isPaused = true;
    };

    utterance.onresume = () => {
      isPaused = false;
    };

    synth.speak(utterance);
  }

  /**
   * Pause playback
   */
  function pause() {
    if (synth && isPlaying && !isPaused) {
      synth.pause();
    }
  }

  /**
   * Resume playback
   */
  function resume() {
    if (synth && isPaused) {
      synth.resume();
    }
  }

  /**
   * Stop playback
   */
  function stop() {
    if (synth) {
      synth.cancel();
    }
    isPlaying = false;
    isPaused = false;
    stopProgressTracking();
  }

  /**
   * Toggle play/pause
   */
  function toggle() {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(currentText);
    }
  }

  /**
   * Seek to position (0-1)
   */
  function seek(position) {
    if (!currentText) return;
    
    const charPos = Math.floor(position * currentText.length);
    const wasPlaying = isPlaying;
    
    stop();
    
    if (wasPlaying) {
      speakAtPosition(currentText, charPos);
    }
  }

  /**
   * Start progress tracking
   */
  function startProgressTracking(text) {
    stopProgressTracking();
    
    const estimatedDuration = getEstimatedDuration(text);
    
    progressInterval = setInterval(() => {
      if (!isPlaying || isPaused) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / estimatedDuration, 1);
      
      if (onProgressCallback) {
        onProgressCallback({
          progress,
          currentTime: formatTime(elapsed / 1000),
          totalTime: formatTime(estimatedDuration / 1000),
          charIndex: Math.floor(progress * text.length)
        });
      }
    }, 100);
  }

  /**
   * Stop progress tracking
   */
  function stopProgressTracking() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  /**
   * Estimate text duration in ms
   */
  function getEstimatedDuration(text) {
    // Average speaking rate: ~150 words per minute
    // Average word length: ~5 characters
    const words = text.split(/\s+/).length;
    const minutes = words / (150 * currentSpeed);
    return minutes * 60 * 1000;
  }

  /**
   * Format time in MM:SS
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Check if TTS is supported
   */
  function isSupported() {
    return 'speechSynthesis' in window;
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      isPlaying,
      isPaused,
      isSupported: isSupported(),
      hasVoices: voices.length > 0,
      currentVoice: currentVoice?.name || null,
      currentSpeed
    };
  }

  /**
   * Render TTS player HTML
   */
  function renderPlayer(text, title) {
    if (!isSupported()) {
      return '';
    }

    const state = getState();
    const voiceOptions = getVoices().map(v => 
      `<option value="${v.name}" ${v.name === state.currentVoice ? 'selected' : ''}>${v.name}</option>`
    ).join('');

    const speedOptionsHTML = speedOptions.map(s => 
      `<option value="${s}" ${s === state.currentSpeed ? 'selected' : ''}>${s}x</option>`
    ).join('');

    return `
      <div class="tts-player" id="tts-player">
        <div class="tts-player__header">
          <div class="tts-player__title">
            <span>Listen to this lesson</span>
            <span class="tts-player__badge">Neural TTS</span>
          </div>
          <div class="tts-player__status">
            <span class="tts-player__status-dot tts-player__status-dot--ready"></span>
            <span>Ready</span>
          </div>
        </div>
        
        <div class="tts-player__controls">
          <button class="tts-player__btn tts-player__btn--secondary" id="tts-prev" title="Restart">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
            </svg>
          </button>
          
          <button class="tts-player__btn" id="tts-play" title="Play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
          
          <button class="tts-player__btn tts-player__btn--secondary" id="tts-stop" title="Stop">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
          </button>
          
          <div class="tts-player__progress">
            <span class="tts-player__time" id="tts-current-time">0:00</span>
            <div class="tts-player__progress-bar" id="tts-progress-bar">
              <div class="tts-player__progress-fill" id="tts-progress-fill" style="width:0%"></div>
            </div>
            <span class="tts-player__time" id="tts-total-time">0:00</span>
          </div>
          
          <div class="tts-player__speed">
            <span class="tts-player__speed-label">Speed</span>
            <select class="tts-player__speed-select" id="tts-speed">
              ${speedOptionsHTML}
            </select>
          </div>
          
          <div class="tts-player__voice">
            <select class="tts-player__voice-select" id="tts-voice">
              ${voiceOptions}
            </select>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize player event listeners
   */
  function initPlayer() {
    const playBtn = document.getElementById('tts-play');
    const stopBtn = document.getElementById('tts-stop');
    const prevBtn = document.getElementById('tts-prev');
    const speedSelect = document.getElementById('tts-speed');
    const voiceSelect = document.getElementById('tts-voice');
    const progressBar = document.getElementById('tts-progress-bar');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (isPlaying && !isPaused) {
          pause();
          playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        } else if (isPaused) {
          resume();
          playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        } else {
          // Get text from article
          const article = document.querySelector('.prose');
          if (article) {
            const text = article.textContent;
            speak(text, {
              onProgress: (data) => {
                const fill = document.getElementById('tts-progress-fill');
                const currentTime = document.getElementById('tts-current-time');
                const totalTime = document.getElementById('tts-total-time');
                
                if (fill) fill.style.width = (data.progress * 100) + '%';
                if (currentTime) currentTime.textContent = data.currentTime;
                if (totalTime) totalTime.textContent = data.totalTime;
              },
              onEnd: () => {
                playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                const fill = document.getElementById('tts-progress-fill');
                if (fill) fill.style.width = '0%';
              }
            });
            playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
          }
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        stop();
        const playBtn = document.getElementById('tts-play');
        if (playBtn) {
          playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }
        const fill = document.getElementById('tts-progress-fill');
        if (fill) fill.style.width = '0%';
        const currentTime = document.getElementById('tts-current-time');
        if (currentTime) currentTime.textContent = '0:00';
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stop();
        const playBtn = document.getElementById('tts-play');
        if (playBtn) {
          playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }
        const fill = document.getElementById('tts-progress-fill');
        if (fill) fill.style.width = '0%';
        const currentTime = document.getElementById('tts-current-time');
        if (currentTime) currentTime.textContent = '0:00';
      });
    }

    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        setSpeed(parseFloat(e.target.value));
      });
    }

    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        setVoice(e.target.value);
      });
    }

    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        seek(position);
      });
    }
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    seek,
    setSpeed,
    setVoice,
    getVoices,
    getState,
    renderPlayer,
    initPlayer,
    isSupported
  };
})();
