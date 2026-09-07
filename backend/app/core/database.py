import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    missing = [name for name, value in (("SUPABASE_URL", url), ("SUPABASE_KEY", key)) if not value]
    raise RuntimeError(
        "Missing Supabase environment variable(s): "
        + ", ".join(missing)
        + ". Add them to backend/.env."
    )

supabase: Client = create_client(url, key)