#!/usr/bin/env python3
"""
Merge Sentinel Searcher results with existing YAML data files.

This script reads the output from SentinelSearcher and merges new entries
into the existing YAML files, avoiding duplicates based on ID matching.

Usage:
    python _scripts/merge-sentinel-results.py

The script will:
1. Read each sentinel output file from data/sentinel-output/
2. Compare with existing entries in data/yaml/
3. Add only new entries (based on ID)
4. Write merged results back to data/yaml/
"""

import os
import yaml
from pathlib import Path
from typing import Any

# Mapping of sentinel output files to their target YAML files
FILE_MAPPING = {
    "news-updates.yaml": "news-data.yaml",
    "awards.yaml": "awards.yaml",
    "publications.yaml": "publications.yaml",
    "projects.yaml": "projects.yaml",
}

# Field used as unique identifier for each file type
ID_FIELDS = {
    "news-data.yaml": "id",
    "awards.yaml": "name",  # awards use 'name' as identifier
    "publications.yaml": "id",
    "projects.yaml": "id",
}


def load_yaml(file_path: Path) -> list[dict[str, Any]]:
    """Load YAML file and return list of entries."""
    if not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as f:
        content = yaml.safe_load(f)

    return content if isinstance(content, list) else []


def save_yaml(file_path: Path, data: list[dict[str, Any]]) -> None:
    """Save list of entries to YAML file."""
    with open(file_path, "w", encoding="utf-8") as f:
        yaml.dump(
            data,
            f,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            width=120,
        )


def get_existing_ids(entries: list[dict], id_field: str) -> set[str]:
    """Extract all IDs from existing entries."""
    ids = set()
    for entry in entries:
        if id_field in entry:
            ids.add(str(entry[id_field]).lower().strip())
    return ids


def clean_sentinel_entry(entry: dict, target_file: str) -> dict:
    """Clean and transform sentinel entry for target file format."""
    cleaned = dict(entry)

    # Remove sentinel-specific fields not needed in final output
    cleaned.pop("source_url", None)

    # Transform fields based on target file
    if target_file == "news-data.yaml":
        # Ensure required fields have defaults
        cleaned.setdefault("featured", False)
        cleaned.setdefault("hidden", False)
        # Add placeholder image path (user will need to add real image)
        if "image" not in cleaned and "id" in cleaned:
            cleaned["image"] = f"/images/news/{cleaned['id']}/cover.png"

    elif target_file == "projects.yaml":
        # Transform github_url/devpost_url to links structure
        links = {}
        if "github_url" in cleaned:
            links["github"] = cleaned.pop("github_url")
        if "devpost_url" in cleaned:
            links["devpost"] = cleaned.pop("devpost_url")
        if links:
            cleaned["links"] = links

    elif target_file == "publications.yaml":
        # Ensure proper structure
        cleaned.setdefault("featured", False)
        cleaned.setdefault("institution", "university-of-florida")
        # Add placeholder image
        if "image" not in cleaned and "id" in cleaned:
            cleaned["image"] = f"/images/papers/paper_{cleaned['id']}.png"

    return cleaned


def merge_entries(
    existing: list[dict],
    new_entries: list[dict],
    id_field: str,
    target_file: str,
) -> tuple[list[dict], int]:
    """
    Merge new entries into existing list, avoiding duplicates.

    Returns:
        Tuple of (merged list, count of new entries added)
    """
    existing_ids = get_existing_ids(existing, id_field)
    added_count = 0

    for entry in new_entries:
        entry_id = str(entry.get(id_field, "")).lower().strip()

        if not entry_id:
            print(f"  Warning: Skipping entry without {id_field}")
            continue

        if entry_id in existing_ids:
            print(f"  Skipping duplicate: {entry_id}")
            continue

        # Clean and add new entry
        cleaned = clean_sentinel_entry(entry, target_file)
        existing.insert(0, cleaned)  # Add to beginning (newest first)
        existing_ids.add(entry_id)
        added_count += 1
        print(f"  Added: {entry_id}")

    return existing, added_count


def main():
    """Main merge process."""
    base_dir = Path(__file__).parent.parent
    sentinel_dir = base_dir / "data" / "sentinel-output"
    yaml_dir = base_dir / "data" / "yaml"

    if not sentinel_dir.exists():
        print("No sentinel output directory found. Run sentinel-search first.")
        return

    total_added = 0

    for sentinel_file, target_file in FILE_MAPPING.items():
        sentinel_path = sentinel_dir / sentinel_file
        target_path = yaml_dir / target_file

        if not sentinel_path.exists():
            print(f"\nNo output for {sentinel_file}, skipping...")
            continue

        print(f"\nProcessing {sentinel_file} -> {target_file}")

        # Load data
        new_entries = load_yaml(sentinel_path)
        existing_entries = load_yaml(target_path)
        id_field = ID_FIELDS.get(target_file, "id")

        print(f"  Found {len(new_entries)} new entries, {len(existing_entries)} existing")

        if not new_entries:
            print("  No new entries to merge")
            continue

        # Merge
        merged, added = merge_entries(
            existing_entries, new_entries, id_field, target_file
        )

        if added > 0:
            save_yaml(target_path, merged)
            print(f"  Saved {added} new entries to {target_file}")
            total_added += added
        else:
            print("  No new unique entries to add")

    print(f"\n{'='*50}")
    print(f"Total new entries added: {total_added}")

    if total_added > 0:
        print("\nNext steps:")
        print("1. Review the new entries in data/yaml/")
        print("2. Add images for new news items")
        print("3. Run the YAML-to-JSON converter")
        print("4. Commit and push changes")


if __name__ == "__main__":
    main()
