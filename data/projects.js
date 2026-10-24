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
    id: 'code-lab',
    name: 'code-lab',
    title: 'code-lab — Browser IDE, POSIX Shell & Node/Bun/C++20 WASI Runtime',
    description: 'Zero-server, browser-native JS/TS/C++20 IDE with public GitHub repository cloning (git clone), a full POSIX shell (pipes, redirects, 67 UNIX coreutils including g++, clang++, hey, chaos, sqlite3, redis-cli), Node.js v22 + Bun v1.1 + Clang/LLVM WebAssembly C++20 runtime, Chaos & Load Engine, and modular Guided Lab extensions.',
    stars: 'v0.2.0',
    starsCount: 60,
    forks: 0,
    language: 'TypeScript',
    languageColor: '#3178c6',
    pinned: true,
    category: 'Developer Tools',
    githubRepo: 'innovatorved/code-lab',
    githubUrl: 'https://github.com/innovatorved/code-lab',
    liveUrl: 'https://code-lab-3dr.pages.dev',
    tags: ['Monaco Editor', 'POSIX Shell & Git Clone', 'Virtual Node.js, Bun & C++20 WASI', 'Web Worker Sandbox', 'Web Component'],
    highlights: [
      'Real C++20 in WebAssembly (Clang/LLVM + LLD + WASI libc++ with <bits/stdc++.h>, <codelab/dsa.hpp>, and <codelab/test.hpp>) alongside Node.js v22 & Bun v1.1',
      'Clone & run any public GitHub repository (git clone owner/repo) directly in the browser with zero auth',
      'Interactive PTY terminal & POSIX shell with 67 commands (g++, clang++, curl, git, jq, sqlite3, redis-cli, hey, chaos, npm & bun)'
    ]
  }
];

