import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

def generate_insights(stats: dict) -> dict:
    """
    stats contains:
      - headers: list[str]
      - total_rows: int
      - duplicate_count: int
      - error_count: int
      - missing_fields: dict[col -> count_missing]
      - sample_rows: list[dict]  (up to 10 rows)
      - category_counts: dict[category -> count]  (if category column exists)
    """
    prompt = f"""You are a data analyst. Analyze this CSV product dataset summary and return a JSON object only.

Dataset stats:
- Columns: {stats.get('headers', [])}
- Total rows: {stats.get('total_rows', 0)}
- Duplicates removed: {stats.get('duplicate_count', 0)}
- Rows with errors: {stats.get('error_count', 0)}
- Missing values per column: {json.dumps(stats.get('missing_fields', {}))}
- Category distribution: {json.dumps(stats.get('category_counts', {}))}
- Sample rows (first 5): {json.dumps(stats.get('sample_rows', [])[:5], default=str)}

Return ONLY a JSON object with these exact keys:
{{
  "summary": "2-3 sentence plain English summary of the dataset quality and content",
  "issues": ["list of specific data quality issues found"],
  "missing_fields": ["list of column names with significant missing data"],
  "top_categories": {{"category_name": count}},
  "recommendations": ["list of 2-3 actionable recommendations"]
}}

Return ONLY the JSON. No markdown, no explanation."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        text = message.content[0].text.strip()
        # Strip markdown fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"AI insights error: {e}")
        return {
            "summary": "AI analysis unavailable.",
            "issues": [],
            "missing_fields": [],
            "top_categories": {},
            "recommendations": []
        }