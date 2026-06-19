import json
import re
from collections import Counter

STOPWORDS = {
    "dan", "di", "ke", "dari", "yang", "untuk",
    "dengan", "pada", "ini", "itu", "dalam",
    "akan", "ada", "jadi", "karena", "atau",
    "juga", "lebih", "oleh", "saat", "agar",
    "para", "sebagai", "hingga", "setelah",
    "sebelum", "masih", "sudah", "bisa",
    "tak", "tidak", "buat", "saja", "kata",
    "tahun", "hari", "jadi", "atas", "usai",
    "hingga", "antara", "tentang", "menjadi",
    "dalam", "satu", "dua", "tiga", "empat",
    "lima", "enam", "tujuh", "delapan",
    "sembilan", "sepuluh"
}

with open(
    "data/articles.json",
    encoding="utf-8"
) as f:
    articles = json.load(f)

counter = Counter()

for article in articles:

    text = article["title"].lower()

    words = re.findall(
        r"\b[a-zA-Zà-ÿ]+\b",
        text
    )

    for word in words:

        if len(word) < 4:
            continue

        if word in STOPWORDS:
            continue

        counter[word] += 1

print()
print("=" * 40)
print("TOP 20 KEYWORDS")
print("=" * 40)

for word, count in counter.most_common(20):
    print(
        f"{word:<20} {count}"
    )

print("=" * 40)