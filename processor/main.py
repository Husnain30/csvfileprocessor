import time
import os
from db import get_conn, get_cursor
from processor import process_file
from dotenv import load_dotenv

load_dotenv()
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL_SECONDS", "5"))

def pick_pending_file():
    conn = get_conn()
    cur = get_cursor(conn)
    try:
        # Atomic claim: mark as processing immediately to avoid double-processing
        cur.execute("""
            UPDATE csv_files
            SET status = 'processing', updated_at = NOW()
            WHERE id = (
                SELECT id FROM csv_files
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            )
            RETURNING id
        """)
        row = cur.fetchone()
        conn.commit()
        return row["id"] if row else None
    except Exception as e:
        conn.rollback()
        print(f"[worker] Poll error: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def main():
    print("[worker] CSV Processor started. Polling for pending files...")
    while True:
        file_id = pick_pending_file()
        if file_id:
            print(f"[worker] Processing: {file_id}")
            process_file(file_id)
        else:
            time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()