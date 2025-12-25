#!/usr/bin/env python3
"""
Run Sentinel Searcher to find new content about Matheus Kunzler Maldaner.

This script:
1. Loads the sentinel.config.yaml configuration
2. Runs web searches using an LLM to find new content
3. Outputs structured YAML to data/sentinel-output/

Usage:
    # Run all jobs
    python _scripts/run-sentinel-search.py

    # Run specific job
    python _scripts/run-sentinel-search.py --job news-updates

Environment:
    ANTHROPIC_API_KEY: Required for Anthropic provider
    OPENAI_API_KEY: Required for OpenAI provider
"""

import argparse
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    parser = argparse.ArgumentParser(
        description="Run Sentinel Searcher to find new portfolio content"
    )
    parser.add_argument(
        "--job",
        type=str,
        help="Run only a specific job by name",
    )
    parser.add_argument(
        "--config",
        type=str,
        default="sentinel.config.yaml",
        help="Path to config file (default: sentinel.config.yaml)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print config without running searches",
    )
    args = parser.parse_args()

    # Import sentinelsearcher
    try:
        from sentinelsearcher import run_sentinel_searcher, load_config
    except ImportError:
        print("Error: sentinelsearcher not installed")
        print("Install with: pip install sentinelsearcher")
        sys.exit(1)

    # Find config file
    base_dir = Path(__file__).parent.parent
    config_path = base_dir / args.config

    if not config_path.exists():
        print(f"Error: Config file not found: {config_path}")
        sys.exit(1)

    print(f"Loading config from: {config_path}")

    # Load config to determine provider
    config = load_config(str(config_path))
    provider = config.api.provider.lower()

    if args.dry_run:
        print(f"\nAPI Provider: {config.api.provider}")
        print(f"Model: {config.api.model}")
        print(f"\nJobs ({len(config.jobs)}):")
        for job in config.jobs:
            print(f"  - {job.name}: -> {job.file_path}")
        return

    # Check for appropriate API key based on provider
    api_key_env_vars = {
        "anthropic": "ANTHROPIC_API_KEY",
        "openai": "OPENAI_API_KEY",
    }

    env_var = api_key_env_vars.get(provider)
    if not env_var:
        print(f"Error: Unsupported provider '{provider}'")
        print(f"Supported providers: {', '.join(api_key_env_vars.keys())}")
        sys.exit(1)

    api_key = os.environ.get(env_var)
    if not api_key:
        print(f"Error: {env_var} environment variable not set")
        print(f"Set it with: export {env_var}='your-key-here'")
        sys.exit(1)

    print(f"Using provider: {provider} (model: {config.api.model})")

    # Filter jobs if --job is specified
    if args.job:
        matching_jobs = [j for j in config.jobs if j.name == args.job]
        if not matching_jobs:
            available = [j.name for j in config.jobs]
            print(f"Error: Job '{args.job}' not found")
            print(f"Available jobs: {', '.join(available)}")
            sys.exit(1)
        jobs_to_run = matching_jobs
        print(f"Running single job: {args.job}")
    else:
        jobs_to_run = config.jobs
        print(f"Running all {len(jobs_to_run)} jobs")

    # Run sentinel searcher
    print("\nStarting Sentinel Searcher...")
    print("=" * 50)

    try:
        from sentinelsearcher import run_job, create_provider
        import time
        import yaml

        search_provider = create_provider(provider, api_key=api_key)
        delay_between_jobs = getattr(config.api, 'delay_between_jobs', 60)
        results = {}

        # Pre-load all YAML files for aggregator job
        yaml_dir = base_dir / "data" / "yaml"
        all_yaml_content = {}
        if yaml_dir.exists():
            for yaml_file in yaml_dir.glob("*.yaml"):
                try:
                    content = yaml.safe_load(yaml_file.read_text())
                    if content:
                        all_yaml_content[yaml_file.stem] = content
                except Exception:
                    pass

        for idx, job in enumerate(jobs_to_run):
            print(f"\nRunning job: {job.name}")

            # For aggregator job, pass all YAML content as extra context
            extra_context = ""
            if job.name == "aggregator":
                print("  Loading all YAML files as context...")
                extra_context = yaml.dump(all_yaml_content, allow_unicode=True, default_flow_style=False)
                print(f"  Loaded {len(all_yaml_content)} files")

            try:
                job_results = run_job(
                    provider=search_provider,
                    model=config.api.model,
                    instruction=job.instruction,
                    schema=job.schema,
                    file_path=job.file_path,
                    output_format=job.output_format,
                    extra_context=extra_context,
                )
                results[job.name] = job_results
                print(f"[{job.name}] completed. New items: {len(job_results)}")
            except Exception as job_error:
                print(f"[{job.name}] failed: {job_error}")
                results[job.name] = []

            # Add delay between jobs (except after last job)
            if idx < len(jobs_to_run) - 1 and delay_between_jobs > 0:
                print(f"Waiting {delay_between_jobs}s before next job...")
                time.sleep(delay_between_jobs)

        print("\n" + "=" * 50)
        print("Results Summary:")
        print("=" * 50)

        total_items = 0
        for job_name, items in results.items():
            count = len(items) if items else 0
            total_items += count
            status = "✓" if count > 0 else "○"
            print(f"  {status} {job_name}: {count} items found")

        print(f"\nTotal: {total_items} items")
        print("\nOutput written to: data/sentinel-output/")
        print("\nNext step: Run merge script to add to existing data")
        print("  python _scripts/merge-sentinel-results.py")

    except Exception as e:
        print(f"\nError running sentinel searcher: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
