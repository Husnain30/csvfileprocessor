import os
import json
import csv
import re
from datetime import datetime
from slugify import slugify
import pandas as pd
from db import get_conn, get_cursor
from ai_insights import generate_insights

UPLOADS_DIR = os.environ.get("UPLOADS_DIR", "/app/uploads")

def normalize_price(value) -> float | None:
    if value is None or str(value).strip() == "":
        return None
    cleaned = re.sub(r"[^\d.]", "", str(value))
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return None

def clean_name(value) -> str | None:
    if not value or str(value).strip() == "":
        return None
    name = str(value).strip()
    name = re.sub(r"\s+", " ", name)
    return name.title()

def find_column(headers: list[str], candidates: list[str]) -> str | None:
    lower = [h.lower().strip() for h in headers]
    for c in candidates:
        if c in lower:
            return headers[lower.index(c)]
    return None

def process_file(file_id: str):
    conn = get_conn()
    cur = get_cursor(conn)

    try:
        # Mark as processing
        cur.execute(
            "UPDATE csv_files SET status = 'processing', updated_at = NOW() WHERE id = %s",
            (file_id,)
        )
        conn.commit()

        csv_path = os.path.join(UPLOADS_DIR, f"{file_id}.csv")
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"CSV not found: {csv_path}")

        # Read with pandas — handles large files efficiently
        df = pd.read_csv(csv_path, dtype=str, keep_default_na=False)
        df.columns = [c.strip() for c in df.columns]
        headers = list(df.columns)
        total_rows = len(df)

        # Auto-detect key columns
        name_col     = find_column(headers, ["name", "product_name", "title", "product", "item_name", "item"])
        price_col    = find_column(headers, ["price", "cost", "amount", "unit_price", "sale_price", "retail_price"])
        category_col = find_column(headers, ["category", "cat", "type", "department", "product_type"])
        sku_col      = find_column(headers, ["sku", "code", "product_id", "id", "item_id", "barcode", "upc"])

        # Deduplication (by name + price if available, else full row)
        dup_subset = [c for c in [name_col, price_col, sku_col] if c]
        if dup_subset:
            before = len(df)
            df = df.drop_duplicates(subset=dup_subset, keep="first")
            duplicate_count = before - len(df)
        else:
            df_dedup = df.drop_duplicates()
            duplicate_count = len(df) - len(df_dedup)
            df = df_dedup

        # Compute missing field stats
        missing_fields = {}
        for col in headers:
            empty = df[col].apply(lambda x: str(x).strip() == "").sum()
            if empty > 0:
                missing_fields[col] = int(empty)

        # Category distribution
        category_counts = {}
        if category_col:
            vc = df[category_col].value_counts().head(10)
            category_counts = {str(k): int(v) for k, v in vc.items()}

        # Sample rows for AI
        sample_rows = df.head(10).to_dict(orient="records")

        # Generate AI insights
        stats = {
            "headers": headers,
            "total_rows": total_rows,
            "duplicate_count": duplicate_count,
            "error_count": 0,
            "missing_fields": missing_fields,
            "sample_rows": sample_rows,
            "category_counts": category_counts,
        }
        insights = generate_insights(stats)

        # Insert products in batches
        processed_count = 0
        error_count = 0
        batch_size = 100
        rows = df.to_dict(orient="records")

        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            for row in batch:
                try:
                    raw_name  = row.get(name_col, "") if name_col else ""
                    raw_price = row.get(price_col, "") if price_col else ""
                    raw_cat   = row.get(category_col, "") if category_col else ""
                    raw_sku   = row.get(sku_col, "") if sku_col else ""

                    cleaned_name  = clean_name(raw_name)
                    cleaned_price = normalize_price(raw_price)
                    product_slug  = slugify(cleaned_name) if cleaned_name else None

                    cur.execute("""
                        INSERT INTO products
                          (id, file_id, name, slug, price, category, sku, raw_data, status, created_at, updated_at)
                        VALUES
                          (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, 'processed', NOW(), NOW())
                    """, (
                        file_id,
                        cleaned_name,
                        product_slug,
                        cleaned_price,
                        raw_cat or None,
                        raw_sku or None,
                        json.dumps(row),
                    ))
                    processed_count += 1
                except Exception as row_err:
                    error_count += 1
                    stats["error_count"] += 1
                    cur.execute("""
                        INSERT INTO products
                          (id, file_id, raw_data, status, error_message, created_at, updated_at)
                        VALUES
                          (gen_random_uuid(), %s, %s, 'error', %s, NOW(), NOW())
                    """, (file_id, json.dumps(row), str(row_err)))

            conn.commit()

        # Final update
        cur.execute("""
            UPDATE csv_files
            SET status = 'completed',
                processed_count = %s,
                error_count = %s,
                insights = %s,
                updated_at = NOW()
            WHERE id = %s
        """, (processed_count, error_count, json.dumps(insights), file_id))
        conn.commit()
        print(f"[processor] ✓ {file_id} — {processed_count} processed, {error_count} errors")

    except Exception as e:
        print(f"[processor] ✗ {file_id} — {e}")
        conn.rollback()
        cur.execute(
            "UPDATE csv_files SET status = 'failed', error_message = %s, updated_at = NOW() WHERE id = %s",
            (str(e), file_id)
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()