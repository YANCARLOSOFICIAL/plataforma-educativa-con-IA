"""Normalize `activities.content` values that are stored as JSON strings.

Usage (PowerShell):
    # Stop the server first
    python scripts\normalize_content.py

This script will:
 - open a DB session via the project's SQLAlchemy SessionLocal
 - find Activity rows where `content` is a Python str
 - attempt to json.loads the string and write it back as a dict (so the JSON column stores an object)
 - print a short summary

IMPORTANT: Make a backup of your DB before running (dump or copy).
"""
import sys
import os
import json

# Ensure project root on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models.activity import Activity


def main():
    db = SessionLocal()
    try:
        rows = db.query(Activity).all()
        to_fix = [r for r in rows if isinstance(r.content, str)]
        print(f"Found {len(to_fix)} activities with content as str out of {len(rows)} total.")
        if not to_fix:
            return

        for r in to_fix:
            try:
                parsed = json.loads(r.content)
            except Exception as e:
                print(f"Skipping id={r.id}: json.loads failed: {e}")
                continue
            r.content = parsed
            db.add(r)
            print(f"Normalized id={r.id}")

        db.commit()
        print("Done. Committed changes.")
    finally:
        db.close()


if __name__ == '__main__':
    main()
