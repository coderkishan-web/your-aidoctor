#!/usr/bin/env python3
"""Run the benchmark.

Usage:
    python run.py                       # dataset/cases.jsonl → out/results.csv
    python run.py --cases custom.jsonl --output out/foo.csv
    python run.py --skip-chatgpt        # Medora only (faster smoke test)

Env (loaded from .env if present):
    MEDORA_BASE_URL       Medora deployment under test
    MEDORA_AUTH_TOKEN     optional — leave blank for guest path
    OPENAI_API_KEY       required unless --skip-chatgpt
    OPENAI_MODEL         default gpt-4o-mini
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Allow `python run.py` from the benchmarks/ directory without installing.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from medora_bench.clients import ChatClient, MedoraClient, OpenAIClient
from medora_bench.runner import load_cases, run


HERE = Path(__file__).resolve().parent


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Medora vs ChatGPT benchmark")
    p.add_argument("--cases", type=Path, default=HERE / "dataset" / "cases.jsonl")
    p.add_argument("--output", type=Path, default=HERE / "out" / "results.csv")
    p.add_argument("--skip-chatgpt", action="store_true", help="Medora only")
    p.add_argument("--skip-medora", action="store_true", help="ChatGPT only")
    return p.parse_args()


async def main() -> None:
    load_dotenv(HERE / ".env")
    args = parse_args()

    cases = load_cases(args.cases)
    print(f"loaded {len(cases)} case(s) from {args.cases}")

    clients: list[ChatClient] = []
    if not args.skip_medora:
        base = os.environ.get("MEDORA_BASE_URL", "http://localhost:3000")
        token = os.environ.get("MEDORA_AUTH_TOKEN") or None
        clients.append(MedoraClient(base_url=base, auth_token=token))
        print(f"  + Medora @ {base}")
    if not args.skip_chatgpt:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("ERROR: OPENAI_API_KEY not set (use --skip-chatgpt to bypass)", file=sys.stderr)
            sys.exit(1)
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        clients.append(OpenAIClient(api_key=api_key, model=model))
        print(f"  + ChatGPT ({model})")

    if not clients:
        print("ERROR: at least one system required (both --skip- flags set)", file=sys.stderr)
        sys.exit(1)

    print("running…")
    try:
        rows = await run(cases, clients, args.output)
    finally:
        for c in clients:
            await c.aclose()
    print(f"\nwrote {len(rows)} row(s) → {args.output}")
    print(f"next: python build_dashboard.py --csv {args.output}")


if __name__ == "__main__":
    asyncio.run(main())
