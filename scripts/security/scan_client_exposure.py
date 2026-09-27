#!/usr/bin/env python3
"""
AIMETRA Client Exposure & Bundle Secret Scanner
Scans production frontend build artifacts (.next/static, public) for:
- Database connection strings
- Redis credentials
- Cloudflare R2 / S3 secrets
- JWT signing secrets
- AI provider API keys
- Private IPs and internal infrastructure URLs
"""

import os
import re
import sys
from pathlib import Path

# Paths to scan
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
STATIC_DIR = WORKSPACE_ROOT / "frontend" / ".next" / "static"
PUBLIC_DIR = WORKSPACE_ROOT / "frontend" / "public"

# Regex patterns for confirmed critical secrets
CRITICAL_SECRET_PATTERNS = [
    (r"(?i)postgres(ql)?:\/\/[a-zA-Z0-9_\-\.]+:[^@\s\"'\<\>]+@[a-zA-Z0-9_\-\.]+", "Database Connection String with Credentials"),
    (r"(?i)redis(s)?:\/\/:[^@\s\"'\<\>]+@[a-zA-Z0-9_\-\.]+", "Redis Connection String with Password"),
    (r"ey[A-Za-z0-9-_=]{20,}\.[A-Za-z0-9-_=]{20,}\.[A-Za-z0-9-_.+/=]{20,}", "Raw Hardcoded JWT Token"),
    (r"AIza[0-9A-Za-z-_]{35}", "Google API Key"),
    (r"sk-[a-zA-Z0-9]{20,}", "OpenAI / OpenRouter API Key"),
    (r"gsk_[a-zA-Z0-9]{20,}", "Groq API Key"),
    (r"(?i)-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----", "Private Cryptographic Key"),
    (r"(?i)JWT_SECRET\s*[:=]\s*['\"][^'\"]{8,}['\"]", "Exposed JWT Secret"),
    (r"(?i)R2_SECRET_ACCESS_KEY\s*[:=]\s*['\"][^'\"]{10,}['\"]", "Exposed Cloudflare R2 Secret"),
]

# Sensitive backend-only environment variable names that should NEVER be baked into JS bundles
BACKEND_ONLY_ENV_KEYS = [
    "DATABASE_URL",
    "REDIS_URL",
    "JWT_SECRET",
    "R2_SECRET_ACCESS_KEY",
    "SUPERADMIN_PASSWORD",
    "MENTOR_MAZE_API_KEY",
    "GEMINI_API_KEY",
    "GROQ_API_KEY",
    "OPENROUTER_API_KEY",
    "CEREBRAS_API_KEY",
    "MISTRAL_API_KEY",
    "SAMBANOVA_API_KEY",
]

def scan_file(file_path: Path):
    findings = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return findings

    # Check critical patterns
    for pattern, desc in CRITICAL_SECRET_PATTERNS:
        matches = re.findall(pattern, content)
        if matches:
            findings.append(("CRITICAL", desc, len(matches)))

    # Check backend-only env variable definitions
    for env_key in BACKEND_ONLY_ENV_KEYS:
        # Match assignments like DATABASE_URL="xyz" or env.DATABASE_URL
        if re.search(rf'[\'"]?{env_key}[\'"]?\s*[:=]\s*[\'"][^\'"]+[\'"]', content):
            findings.append(("HIGH", f"Backend-only config key '{env_key}' assigned in client bundle", 1))

    return findings

def main():
    print("=" * 60)
    print("AIMETRA — Automated Client-Side Exposure Scanner")
    print("=" * 60)

    target_dirs = [STATIC_DIR, PUBLIC_DIR]
    total_files = 0
    total_findings = []

    for target_dir in target_dirs:
        if not target_dir.exists():
            print(f"Directory not found (skipped): {target_dir}")
            continue

        print(f"Scanning directory: {target_dir}")
        for root, _, files in os.walk(target_dir):
            for file in files:
                # Scan js, css, html, json, txt, map files
                if file.endswith((".js", ".css", ".html", ".json", ".txt", ".map")):
                    total_files += 1
                    fp = Path(root) / file
                    file_findings = scan_file(fp)
                    if file_findings:
                        for severity, desc, count in file_findings:
                            total_findings.append((fp.relative_to(WORKSPACE_ROOT), severity, desc, count))

    print(f"\nFiles scanned: {total_files}")
    print(f"Total findings: {len(total_findings)}")

    if not total_findings:
        print("\n✅ ZERO CLIENT SECRETS OR SENSITIVE BACKEND KEYS EXPOSED.")
        print("Build artifacts are SAFE to serve to untrusted web browsers.")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n❌ SENSITIVE PATTERNS DETECTED:")
        for rel_path, severity, desc, count in total_findings:
            print(f"  [{severity}] {rel_path}: {desc} ({count} match(es))")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
