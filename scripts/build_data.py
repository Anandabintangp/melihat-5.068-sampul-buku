from __future__ import annotations

import argparse
import json
import math
import random
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable

import pandas as pd

DISPLAY_ALIAS = {
    "Roman": "Romansa",
    "Fiksi Ilmiah": "Fiksi Sains",
}

ILLUSTRATION_LABELS = {
    "kartunal": "Kartunal",
    "minimalis": "Minimalis",
    "ekspresionisme": "Ekspresionisme",
    "fotografi_kolase": "Fotografi/Kolase Digital",
    "abstrak": "Abstrak",
    "surealis_absurd": "Surealis/Absurd",
    "dekoratif": "Dekoratif",
    "pop_art": "Pop Art",
    "realisme": "Realisme",
    "kubisme": "Kubisme",
}

COLOR_ORDER = [
    "putih", "oranye", "cokelat", "biru", "merah", "pink",
    "hitam", "kuning", "ungu", "hijau", "abu",
]

TYPEFACE_ORDER = ["Serif", "Script", "Sans-serif", "Fancy"]

ILLUSTRATION_ORDER = [
    "kartunal", "minimalis", "ekspresionisme", "fotografi_kolase",
    "abstrak", "surealis_absurd", "dekoratif", "pop_art", "realisme", "kubisme",
]

SELECTED_GENRES = [
    "Novel", "Cerita Pendek", "Antologi", "Puisi",
    "Romansa", "Chick Lit", "Persahabatan", "Remaja", "Dewasa", "Keluarga", "Drama", "Slice of Life",
    "Fantasi", "Fiksi Sejarah", "Petualangan", "Aksi", "Fiksi Sains", "Thriller/Misteri", "Horor", "Anak-anak", "Komedi",
]

GROUPS = {
    "bentuk": ["Novel", "Cerita Pendek", "Antologi", "Puisi"],
    "populer": ["Romansa", "Chick Lit", "Persahabatan", "Remaja", "Dewasa", "Keluarga", "Drama", "Slice of Life"],
    "mode": ["Fantasi", "Fiksi Sejarah", "Petualangan", "Aksi", "Fiksi Sains", "Thriller/Misteri", "Horor", "Anak-anak", "Komedi"],
}

COOCCURRENCE_PAIRS = [
    ("Drama", "Novel", "novel"),
    ("Novel", "Remaja", "novel"),
    ("Antologi", "Cerita Pendek", "novel"),
    ("Novel", "Romansa", "novel"),
    ("Puisi", "Romansa", "novel"),
    ("Chick Lit", "Romansa", "romansa"),
    ("Persahabatan", "Romansa", "romansa"),
    ("Remaja", "Romansa", "romansa"),
    ("Keluarga", "Romansa", "romansa"),
    ("Dewasa", "Romansa", "romansa"),
    ("Drama", "Romansa", "romansa"),
    ("Fiksi Sains", "Fantasi", "mode"),
    ("Persahabatan", "Remaja", "mode"),
    ("Fantasi", "Petualangan", "mode"),
    ("Horor", "Thriller/Misteri", "mode"),
]


def clean_value(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if hasattr(value, "item"):
        value = value.item()
    return value


def parse_raw_genres(value: Any) -> set[str]:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return set()
    return {part.strip() for part in str(value).split(",") if part.strip()}


def display_genres(raw: set[str]) -> list[str]:
    values = {DISPLAY_ALIAS.get(g, g) for g in raw}
    if raw.intersection({"Thriller", "Misteri"}):
        values.add("Thriller/Misteri")
    return sorted(values)


def has_genre(raw: set[str], display_name: str) -> bool:
    if display_name == "Romansa":
        return "Roman" in raw
    if display_name == "Fiksi Sains":
        return "Fiksi Ilmiah" in raw
    if display_name == "Thriller/Misteri":
        return bool(raw.intersection({"Thriller", "Misteri"}))
    return display_name in raw


def rounded_distribution(counter: Counter[str], order: Iterable[str], total: int) -> dict[str, float]:
    if total <= 0:
        return {key: 0.0 for key in order}
    return {key: round(counter.get(key, 0) * 100 / total, 1) for key in order}


def weighted_color_distribution(frame: pd.DataFrame) -> dict[str, float]:
    accum: defaultdict[str, float] = defaultdict(float)
    if frame.empty:
        return {key: 0.0 for key in COLOR_ORDER}
    for idx in range(1, 6):
        cats = frame[f"warna_{idx}"]
        pcts = frame[f"warna_pct_{idx}"]
        for cat, pct in zip(cats, pcts):
            if pd.notna(cat) and pd.notna(pct):
                accum[str(cat).strip()] += float(pct)
    return {key: round(accum.get(key, 0.0) / len(frame), 1) for key in COLOR_ORDER}


def top_fonts(frame: pd.DataFrame, limit: int = 8) -> list[dict[str, Any]]:
    counts = frame["tipe_font"].dropna().astype(str).value_counts()
    total = len(frame)
    out = []
    for font, count in counts.head(limit).items():
        out.append({"font": font, "count": int(count), "pct": round(count * 100 / total, 1)})
    return out


def build(input_csv: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(input_csv)
    genre_source = df["hasil_GENRES"].where(df["hasil_GENRES"].notna(), df["GENRES"])
    raw_sets = [parse_raw_genres(v) for v in genre_source]

    raw_genre_counter = Counter(g for row in raw_sets for g in row)

    global_colors = weighted_color_distribution(df)
    tf_counts = Counter(df["typeface_paper"].dropna().astype(str))
    il_counts = Counter(df["corak_ilustrasi"].dropna().astype(str))

    genre_summaries: dict[str, Any] = {}
    genre_masks: dict[str, list[bool]] = {}
    for genre in SELECTED_GENRES:
        mask = [has_genre(raw, genre) for raw in raw_sets]
        genre_masks[genre] = mask
        sub = df.loc[mask]
        genre_summaries[genre] = {
            "count": int(len(sub)),
            "colors": weighted_color_distribution(sub),
            "typefaces": rounded_distribution(Counter(sub["typeface_paper"].dropna().astype(str)), TYPEFACE_ORDER, len(sub)),
            "illustrations": rounded_distribution(Counter(sub["corak_ilustrasi"].dropna().astype(str)), ILLUSTRATION_ORDER, len(sub)),
            "top_fonts": top_fonts(sub),
            "mean_brightness": round(float(sub["brightness_mean"].mean()), 3) if len(sub) else None,
            "mean_saturation": round(float(sub["saturation_mean"].mean()), 3) if len(sub) else None,
        }

    cooccurrence = []
    for left, right, cluster in COOCCURRENCE_PAIRS:
        left_mask = genre_masks[left]
        right_mask = genre_masks[right]
        left_n = sum(left_mask)
        right_n = sum(right_mask)
        overlap = sum(a and b for a, b in zip(left_mask, right_mask))
        denominator = min(left_n, right_n)
        coefficient = overlap / denominator * 100 if denominator else 0
        union = left_n + right_n - overlap
        jaccard = overlap / union * 100 if union else 0
        cooccurrence.append({
            "left": left,
            "right": right,
            "left_n": left_n,
            "right_n": right_n,
            "overlap": overlap,
            "overlap_coefficient": round(coefficient, 1),
            "jaccard": round(jaccard, 1),
            "cluster": cluster,
        })
    cooccurrence.sort(key=lambda row: row["overlap_coefficient"], reverse=True)

    yearly_illustration = []
    for year in range(int(df["YEAR"].min()), int(df["YEAR"].max()) + 1):
        sub = df[df["YEAR"] == year]
        counts = Counter(sub["corak_ilustrasi"].dropna().astype(str))
        row = {"year": year, "n": int(len(sub))}
        for key in ILLUSTRATION_ORDER:
            row[key] = round(counts.get(key, 0) * 100 / len(sub), 1) if len(sub) else 0.0
        yearly_illustration.append(row)

    books = []
    for idx, row in df.iterrows():
        raw = raw_sets[idx]
        palette = []
        for n in range(1, 6):
            hex_value = clean_value(row.get(f"warna_hex_{n}"))
            pct_value = clean_value(row.get(f"warna_pct_{n}"))
            cat_value = clean_value(row.get(f"warna_{n}"))
            if hex_value and pct_value is not None:
                palette.append({
                    "hex": str(hex_value),
                    "pct": round(float(pct_value), 2),
                    "label": str(cat_value) if cat_value else None,
                })
        books.append({
            "id": int(idx),
            "title": clean_value(row.get("TITLE")),
            "author": clean_value(row.get("AUTHOR")),
            "year": int(row["YEAR"]),
            "image": str(row["IMAGE_FILE"]),
            "genres": display_genres(raw),
            "dominant_color": clean_value(row.get("warna_kategori")),
            "palette": palette,
            "typeface": clean_value(row.get("typeface_paper")),
            "font": clean_value(row.get("tipe_font")),
            "illustration": clean_value(row.get("corak_ilustrasi")),
            "rating": clean_value(row.get("RATING")),
            "url": clean_value(row.get("URL")),
        })

    rng = random.Random(2026)
    hero_ids = []
    for year in range(2000, 2026):
        candidates = [book["id"] for book in books if book["year"] == year]
        rng.shuffle(candidates)
        hero_ids.extend(candidates[:6])
    if len(hero_ids) < 156:
        remainder = [book["id"] for book in books if book["id"] not in set(hero_ids)]
        rng.shuffle(remainder)
        hero_ids.extend(remainder[: 156 - len(hero_ids)])
    rng.shuffle(hero_ids)

    summary = {
        "generated_from": input_csv.name,
        "metadata": {
            "n_books": int(len(df)),
            "raw_genre_labels": int(len(raw_genre_counter)),
            "year_min": int(df["YEAR"].min()),
            "year_max": int(df["YEAR"].max()),
            "image_ok": int(df["image_ok"].fillna(False).astype(bool).sum()),
            "typeface_low_conf_n": int(df["typeface_paper_low_conf"].fillna(False).astype(bool).sum()),
            "typeface_low_conf_pct": round(float(df["typeface_paper_low_conf"].fillna(False).astype(bool).mean() * 100), 1),
            "mean_illustration_confidence": round(float(df["corak_konfiden"].mean()), 3),
            "font_database_claim": 920,
        },
        "orders": {
            "colors": COLOR_ORDER,
            "typefaces": TYPEFACE_ORDER,
            "illustrations": ILLUSTRATION_ORDER,
            "genres": SELECTED_GENRES,
        },
        "labels": {
            "illustrations": ILLUSTRATION_LABELS,
        },
        "groups": GROUPS,
        "global": {
            "colors": global_colors,
            "typeface_counts": {key: int(tf_counts.get(key, 0)) for key in TYPEFACE_ORDER},
            "typeface_pct": rounded_distribution(tf_counts, TYPEFACE_ORDER, len(df)),
            "illustration_counts": {key: int(il_counts.get(key, 0)) for key in ILLUSTRATION_ORDER},
            "illustration_pct": rounded_distribution(il_counts, ILLUSTRATION_ORDER, len(df)),
        },
        "genres": genre_summaries,
        "cooccurrence": cooccurrence,
        "yearly_illustration": yearly_illustration,
        "hero_sample": hero_ids,
        "hero_books": [
            {
                "id": books[book_id]["id"],
                "title": books[book_id]["title"],
                "author": books[book_id]["author"],
                "image": books[book_id]["image"],
                "dominant_color": books[book_id]["dominant_color"],
            }
            for book_id in hero_ids
        ],
        "raw_genre_top": [{"genre": key, "count": int(value)} for key, value in raw_genre_counter.most_common(30)],
    }

    with (output_dir / "summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, ensure_ascii=False, separators=(",", ":"))
    with (output_dir / "books.min.json").open("w", encoding="utf-8") as handle:
        json.dump(books, handle, ensure_ascii=False, separators=(",", ":"))

    print(f"Wrote {output_dir / 'summary.json'}")
    print(f"Wrote {output_dir / 'books.min.json'}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build compact scrollytelling data from data.csv")
    parser.add_argument("--input", default="data/data.csv", type=Path)
    parser.add_argument("--output", default="data", type=Path)
    args = parser.parse_args()
    build(args.input, args.output)
