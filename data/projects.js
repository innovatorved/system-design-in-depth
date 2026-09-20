/* ═══════════════════════════════════════════════════════════════
   Projects Data — Top & Pinned Open Source Projects by @innovatorved
   ═══════════════════════════════════════════════════════════════ */

window.PROJECTS_DATA = [
  {
    id: 'whisper-api',
    name: 'whisper.api',
    title: 'Whisper API Server',
    description: 'Production-ready API with user-level access support to transcribe speech to text using a finetuned and processed Whisper ASR model.',
    stars: '914+',
    starsCount: 914,
    forks: 38,
    language: 'Python',
    languageColor: '#3572A5',
    pinned: true,
    category: 'AI & Speech',
    githubUrl: 'https://github.com/innovatorved/whisper.api',
    liveUrl: 'https://whisper.vedgupta.in/',
    tags: ['Whisper ASR', 'FastAPI', 'Speech-to-Text', 'Python', 'Production API'],
    highlights: [
      'Multi-tenant authentication & user rate-limiting',
      'High-throughput asynchronous audio batching',
      'Finetuned Whisper model inference pipeline'
    ]
  },
  {
    id: 'subtitle',
    name: 'subtitle',
    title: 'Subtitle AI Generator & Translator',
    description: 'Open-source subtitle generation engine for seamless content translation, timing alignment, and video accessibility.',
    stars: '437+',
    starsCount: 437,
    forks: 17,
    language: 'Python',
    languageColor: '#3572A5',
    pinned: true,
    category: 'AI & Media',
    githubUrl: 'https://github.com/innovatorved/subtitle',
    liveUrl: null,
    tags: ['Subtitles', 'Audio Processing', 'Translation', 'Python', 'SRT/VTT'],
    highlights: [
      'Automated speech timestamp synchronization',
      'Multi-language translation pipelines',
      'CLI & programmatic automation support'
    ]
  },
  {
    id: 'realtime-interview-copilot',
    name: 'realtime-interview-copilot',
    title: 'Realtime Interview Copilot',
    description: 'Desktop application that assists engineers in technical interviews with real-time audio transcription and low-latency AI-powered response generation.',
    stars: '124+',
    starsCount: 124,
    forks: 25,
    language: 'TypeScript',
    languageColor: '#3178c6',
    pinned: true,
    category: 'AI & Desktop',
    githubUrl: 'https://github.com/innovatorved/realtime-interview-copilot',
    liveUrl: null,
    tags: ['Electron', 'Real-Time Audio', 'TypeScript', 'LLM', 'Desktop App'],
    highlights: [
      'Sub-second audio capture & transcription stream',
      'Context-aware answer generation with prompt tailoring',
      'Cross-platform desktop client with discrete UI'
    ]
  },
  {
    id: 'system-design-in-depth',
    name: 'system-design-in-depth',
    title: 'System Design In Depth',
    description: 'Production-grade interactive System Design platform — 18 modules, 200 units, 118 architecture diagrams, from-scratch algorithm builds, and curated video walkthroughs.',
    stars: 'Popular',
    starsCount: 100,
    forks: 12,
    language: 'JavaScript',
    languageColor: '#f1e05a',
    pinned: true,
    category: 'System Design',
    githubUrl: 'https://github.com/innovatorved/system-design-in-depth',
    liveUrl: 'https://system-design-in-depth.pages.dev/',
    tags: ['System Design', 'Distributed Systems', 'Architecture', 'Engineering Practice'],
    highlights: [
      '200 in-depth topics & 118 interactive zoomable diagrams',
      '12 runnable from-scratch distributed system algorithms',
      'Curated video walkthroughs and real-world post-mortems'
    ]
  },
  {
    id: 'resume-builder',
    name: 'resume-builder',
    title: 'LaTeX AI Resume Builder',
    description: 'Modern LaTeX resume builder with real-time vector PDF preview, AI copilot ATS tailoring, and multi-source evidence library built on Astro, Cloudflare, and Turso.',
    stars: 'Latest',
    starsCount: 50,
    forks: 0,
    language: 'TypeScript',
    languageColor: '#3178c6',
    pinned: true,
    category: 'Web & Tools',
    githubUrl: 'https://github.com/innovatorved/resume-builder',
    liveUrl: 'https://resume.vedgupta.in/',
    tags: ['Astro', 'Cloudflare', 'Turso', 'LaTeX', 'ATS Tailoring'],
    highlights: [
      'Vector PDF preview rendered in browser via WASM/LaTeX engine',
      'Targeted ATS keyword optimization assistant',
      'Edge-native serverless architecture on Cloudflare'
    ]
  },
  {
    id: 'sayitflow',
    name: 'sayItflow',
    title: 'SayItFlow — Voice Dictation',
    description: '100% on-device push-to-talk voice dictation for macOS. Near-zero idle footprint. Powered by Voz + S1-mini for whisper-quiet privacy.',
    stars: 'Latest',
    starsCount: 40,
    forks: 0,
    language: 'Swift',
    languageColor: '#F05138',
    pinned: true,
    category: 'macOS & Native',
    githubUrl: 'https://github.com/innovatorved/sayItflow',
    liveUrl: null,
    tags: ['Swift', 'macOS Native', 'On-Device AI', 'Push-to-Talk', 'Privacy'],
    highlights: [
      'Completely offline — zero audio leaves the machine',
      'Near-zero idle CPU & memory footprint',
      'Global hotkey push-to-talk integration'
    ]
  },
  {
    id: 'sayitdev',
    name: 'sayitdev',
    title: 'SayItDev — Local AI Voice CLI',
    description: 'On-device AI and voice for Mac. UNIX tool, OpenAI-compatible server, speak/listen/transcribe — no cloud, no API keys, zero latency overhead.',
    stars: 'Latest',
    starsCount: 35,
    forks: 0,
    language: 'Swift',
    languageColor: '#F05138',
    pinned: true,
    category: 'Developer Tools',
    githubUrl: 'https://github.com/innovatorved/sayitdev',
    liveUrl: null,
    tags: ['macOS CLI', 'Local LLM', 'Speech-to-Text', 'OpenAI API Compatible', 'UNIX'],
    highlights: [
      'Local OpenAI-compatible API server on localhost',
      'UNIX-pipe friendly speech transcription and synthesis',
      'Native Apple Silicon Metal acceleration'
    ]
  },
  {
    id: 'whisper-gradio',
    name: 'whisper-openai-gradio-implementation',
    title: 'Whisper Gradio WebUI',
    description: 'Interactive Gradio web interface implementation for OpenAI Whisper models with multi-lingual audio transcription and translation support.',
    stars: '75+',
    starsCount: 75,
    forks: 14,
    language: 'Python',
    languageColor: '#3572A5',
    pinned: false,
    category: 'AI & Speech',
    githubUrl: 'https://github.com/innovatorved/whisper-openai-gradio-implementation',
    liveUrl: null,
    tags: ['Whisper', 'Gradio', 'Python', 'Audio UI'],
    highlights: [
      'One-click local audio recording and upload',
      'Model parameter tweaking (temperature, beam size)',
      'Export to SRT, TXT, and JSON formats'
    ]
  }
];
