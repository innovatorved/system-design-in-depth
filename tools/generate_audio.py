#!/usr/bin/env python3
"""
System Design in Depth - Neural Audio Narration Generator
Uses Microsoft Edge TTS to generate studio-quality spoken audio for lessons.

Usage:
  python3 tools/generate_audio.py --dry-run
  python3 tools/generate_audio.py --slug requirements-clarification
  python3 tools/generate_audio.py --module m01
  python3 tools/generate_audio.py --changed
  python3 tools/generate_audio.py --all
"""

import os
import sys
import json
import re
import hashlib
import asyncio
import argparse
import subprocess
from pathlib import Path
import edge_tts

ROOT_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT_DIR / "audio"
MANIFEST_FILE = AUDIO_DIR / "manifest.json"

DEFAULT_VOICE = "en-US-GuyNeural"

def clean_text_for_tts(raw_text, title=None, takeaways=None):
    """
    Cleans raw markdown and HTML into natural, fluent text suitable for spoken narration.
    """
    if not raw_text:
        raw_text = ""

    # Remove script and style tags
    text = re.sub(r'<(script|style)[^>]*>[\s\S]*?</\1>', '', raw_text, flags=re.I)

    # Remove mermaid blocks
    text = re.sub(r'```mermaid[\s\S]*?```', '', text)

    # Remove raw code blocks (not pleasant to listen to variable declarations)
    text = re.sub(r'```[\s\S]*?```', '', text)

    # Remove markdown images
    text = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', '', text)

    # Convert markdown links [Text](url) -> Text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)

    # Convert obsidian / wiki links [[slug|Text]] -> Text or [[Text]] -> Text
    text = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', text)

    # Remove HTML tags but retain spacing
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'</?(h[1-6]|p|div|li|blockquote)[^>]*>', '\n', text)
    text = re.sub(r'<[^>]+>', ' ', text)

    # Remove markdown table formatting (| col | col |)
    text = re.sub(r'\|[^\n]+\|', ' ', text)
    text = re.sub(r'^[ \t]*[-:]+[-| :]+$', '', text, flags=re.M)

    # Remove markdown headers (# Title)
    text = re.sub(r'^[ \t]*#+[ \t]*(.+)$', r'\1.', text, flags=re.M)

    # Remove bullet markers (- item, * item)
    text = re.sub(r'^[ \t]*[-*+][ \t]+', '', text, flags=re.M)
    text = re.sub(r'^[ \t]*\d+\.[ \t]+', '', text, flags=re.M)

    # Remove markdown formatting characters (bold, italics, inline code)
    text = re.sub(r'[*_`~]', '', text)

    # Clean HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', 'and').replace('&lt;', 'less than').replace('&gt;', 'greater than').replace('&quot;', '"')

    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    cleaned_body = ' '.join(lines)

    # Construct complete narration
    parts = []
    if title:
        parts.append(f"System Design in Depth. Lesson: {title}.")
    
    # If cleaned body starts with title or "Lesson:", strip leading repetition
    if title:
        clean_title = re.sub(r'[^a-zA-Z0-9 ]', '', title).strip().lower()
        # Remove repeated leading title phrases
        while True:
            body_start = re.sub(r'[^a-zA-Z0-9 ]', '', cleaned_body[:len(title) + 15]).strip().lower()
            if body_start.startswith(clean_title):
                # Remove up to the first period or punctuation in cleaned_body
                dot_pos = cleaned_body.find('.')
                if 0 <= dot_pos < len(title) + 20:
                    cleaned_body = cleaned_body[dot_pos + 1:].strip()
                else:
                    break
            else:
                break

    parts.append(cleaned_body)

    if takeaways and len(takeaways) > 0:
        cleaned_takeaways = []
        for idx, t in enumerate(takeaways, 1):
            ct = re.sub(r'<[^>]+>', '', t).strip()
            if ct:
                cleaned_takeaways.append(f"Point {idx}: {ct}")
        if cleaned_takeaways:
            parts.append("Key Takeaways: " + " ".join(cleaned_takeaways))

    full_narration = " ".join(parts)
    
    # Collapse multiple spaces and clean punctuation
    full_narration = re.sub(r'\s+', ' ', full_narration)
    full_narration = re.sub(r'\.{2,}', '.', full_narration)
    full_narration = re.sub(r'\s+([.,!?;:])', r'\1', full_narration)

    # Optimal limit ~3500 chars for concise microlearning podcast-style audio
    if len(full_narration) > 3500:
        # Find sentence boundary near 3500
        cutoff = full_narration.rfind('.', 2800, 3500)
        if cutoff != -1:
            full_narration = full_narration[:cutoff + 1]
        else:
            full_narration = full_narration[:3500].rsplit(' ', 1)[0] + '.'

    return full_narration.strip()


def load_curriculum_and_content():
    """
    Loads curriculum.js, all data/content/m*.js files, and data/archive/*.js files.
    """
    # Use node to reliably parse all JS files and dump standard JSON
    cmd = [
        "node", "-e",
        """
        global.window = {};
        const fs = require('fs');
        const path = require('path');
        
        // Curriculum
        require('./data/curriculum.js');
        
        // Content modules
        fs.readdirSync('data/content').forEach(f => {
          if (f.endsWith('.js')) require('./data/content/' + f);
        });

        // Archive units
        if (fs.existsSync('data/archive')) {
          fs.readdirSync('data/archive').forEach(f => {
            if (f.endsWith('.js')) require('./data/archive/' + f);
          });
        }

        const data = {
          curriculum: global.window.CURRICULUM_DATA,
          modules: global.window.MODULE_CONTENT || {},
          archive: global.window.ARCHIVE_CONTENT || {}
        };
        console.log(JSON.stringify(data));
        """
    ]
    res = subprocess.run(cmd, cwd=str(ROOT_DIR), capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def get_manifest():
    if MANIFEST_FILE.exists():
        try:
            with open(MANIFEST_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_manifest(manifest):
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)


async def generate_single_audio(slug, text, voice, output_path):
    """
    Calls edge_tts to generate MP3 for the given text.
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(output_path))


async def process_queue(tasks, concurrency=3):
    sem = asyncio.Semaphore(concurrency)

    async def worker(task):
        async with sem:
            slug, title, text, voice, out_path, manifest, h = task
            print(f"🎙️  [Generating] {slug} ({title[:35]}...)")
            try:
                await generate_single_audio(slug, text, voice, out_path)
                manifest[slug] = {
                    "hash": h,
                    "voice": voice,
                    "size": out_path.stat().st_size if out_path.exists() else 0,
                    "chars": len(text)
                }
                print(f"✅ [Done] {slug} ({manifest[slug]['size']} bytes)")
            except Exception as err:
                print(f"❌ [Error] {slug}: {err}")

    await asyncio.gather(*(worker(t) for t in tasks))


def main():
    parser = argparse.ArgumentParser(description="Generate neural TTS audio narration for lessons")
    parser.add_argument("--slug", help="Generate audio for a specific unit slug")
    parser.add_argument("--module", help="Generate audio for a specific module (e.g. m01, m14)")
    parser.add_argument("--part", help="Generate audio for specific curriculum part(s) (e.g. 2, 3, '2,3')")
    parser.add_argument("--all", action="store_true", help="Generate audio for all units")
    parser.add_argument("--changed", action="store_true", help="Generate audio for units with changed or missing content")
    parser.add_argument("--force", action="store_true", help="Force regeneration even if content hash matches")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated without making API calls")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help=f"Edge TTS voice (default: {DEFAULT_VOICE})")
    parser.add_argument("--concurrency", type=int, default=3, help="Max concurrent TTS requests (default: 3)")
    args = parser.parse_args()

    # Default to --changed if no specific selector is provided
    if not (args.slug or args.module or args.part or args.all):
        args.changed = True

    print("📚 Loading curriculum, content modules, and archive...")
    data = load_curriculum_and_content()
    curriculum = data["curriculum"]
    module_contents = data["modules"]
    archive_contents = data["archive"]

    manifest = get_manifest()
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Collect all units
    all_units = []
    for part_idx, part in enumerate(curriculum.get("parts", []), 1):
        for mod in part.get("modules", []):
            mod_id = mod.get("id")
            mod_number = mod.get("number")
            for unit in mod.get("units", []):
                slug = unit.get("slug")
                title = unit.get("title")
                
                # Determine raw source text:
                # 1. Archive content (from file or inline)
                # 2. Module content
                # 3. Fallback
                raw = ""
                if slug in archive_contents and len(archive_contents[slug].strip()) > 100:
                    raw = archive_contents[slug]
                elif unit.get("archive", {}).get("content"):
                    raw = unit["archive"]["content"]
                
                mod_unit_data = module_contents.get(mod_id, {}).get(slug, {})
                mod_content = mod_unit_data.get("content", "")
                takeaways = mod_unit_data.get("keyTakeaways", [])

                if not raw or len(raw.strip()) < 100:
                    raw = mod_content
                elif mod_content and not "This topic is covered in depth" in mod_content:
                    raw = raw + "\n\n" + mod_content

                narration_text = clean_text_for_tts(raw, title=title, takeaways=takeaways)
                
                all_units.append({
                    "partNumber": part_idx,
                    "moduleId": mod_id,
                    "moduleNumber": mod_number,
                    "slug": slug,
                    "title": title,
                    "text": narration_text,
                    "takeaways": takeaways
                })

    print(f"🔍 Found {len(all_units)} total units across curriculum.")

    # Filter units according to CLI arguments
    targets = []
    for u in all_units:
        slug = u["slug"]
        mod_id = u["moduleId"]
        mod_num = u.get("moduleNumber")
        part_num = u.get("partNumber")

        if args.slug and args.slug != slug:
            continue
        if args.part:
            requested_parts = [int(x.strip()) for x in str(args.part).split(',') if x.strip().isdigit()]
            if part_num not in requested_parts:
                continue
        if args.module:
            m_target = str(args.module).lower().strip()
            # Normalize target: 'm01' -> 1, '1' -> 1, 'm1' -> 1
            matched = False
            if m_target == mod_id.lower():
                matched = True
            else:
                num_part = re.sub(r'[^0-9]', '', m_target)
                if num_part and mod_num and int(num_part) == int(mod_num):
                    matched = True
            if not matched:
                continue

        # Check hash and file existence
        text_hash = hashlib.sha256(u["text"].encode("utf-8")).hexdigest()
        out_file = AUDIO_DIR / f"{slug}.mp3"
        
        has_file = out_file.exists() and out_file.stat().st_size > 5000
        recorded_hash = manifest.get(slug, {}).get("hash")
        
        is_changed = (not has_file) or (recorded_hash != text_hash)

        if args.all or args.force or (args.slug and slug == args.slug):
            targets.append((u, text_hash, is_changed))
        elif args.changed and is_changed:
            targets.append((u, text_hash, is_changed))
        elif args.module:
            if args.force or is_changed:
                targets.append((u, text_hash, is_changed))
        elif args.part:
            if args.force or is_changed:
                targets.append((u, text_hash, is_changed))

    print(f"🎯 Selected {len(targets)} unit(s) for audio generation.")

    if args.dry_run:
        print("\n[Dry Run Summary]:")
        for u, h, ch in targets[:20]:
            status = "NEEDS_GENERATION" if ch else "UP_TO_DATE"
            print(f"  • {u['slug']} [{status}] ({len(u['text'])} chars)")
        if len(targets) > 20:
            print(f"  ... and {len(targets) - 20} more.")
        return

    if not targets:
        print("✨ All audio files are already up-to-date with current lesson content!")
        return

    # Build queue
    tasks = []
    for u, h, _ in targets:
        out_path = AUDIO_DIR / f"{u['slug']}.mp3"
        tasks.append((u["slug"], u["title"], u["text"], args.voice, out_path, manifest, h))

    # Run batch generation
    print(f"\n🚀 Launching generation for {len(tasks)} audio track(s) with voice '{args.voice}' (concurrency={args.concurrency})...")
    asyncio.run(process_queue(tasks, concurrency=args.concurrency))

    # Save manifest
    save_manifest(manifest)
    print("\n✨ Audio generation complete! Updated manifest saved to audio/manifest.json.")

if __name__ == "__main__":
    main()
