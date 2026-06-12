from collections import Counter

from database.database import (
    get_all_articles
)

articles = get_all_articles()

source_counter = Counter()
category_counter = Counter()
keyword_counter = Counter()

STOPWORDS = {
    "dan",
    "yang",
    "di",
    "ke",
    "dari",
    "untuk",
    "dengan",
    "pada",
    "ini",
    "itu",
    "jadi",
    "atau",
    "karena",
    "dalam",
    "lebih",
    "soal",
    "usai",
    "atas",
    "hari",
    "baru",
    "tak",
    "ada",
    "akan",
    "oleh",
    "para",
    "saat",
    "agar",
    "bisa"
}

for article in articles:
    title = article[0]
    source = article[1]
    category = article[2]

    source_counter[source] += 1
    category_counter[category] += 1

    words = title.lower().split()

    for word in words:
        word = word.strip(
            ".,!?():;\"'[]{}"
        )

        if len(word) < 4:
            continue

        if word in STOPWORDS:
            continue

        keyword_counter[word] += 1

print()
print("=" * 50)
print("DAILY SUMMARY")
print("=" * 50)

print()
print(
    f"Total Articles : {len(articles)}"
)

print(
    f"Total Sources  : {len(source_counter)}"
)

print(
    f"Total Categories : {len(category_counter)}"
)

print()

print("-" * 50)
print("TOP SOURCES")
print("-" * 50)

for source, count in source_counter.most_common(10):
    print(
        f"{source:<20} {count}"
    )

print()

print("-" * 50)
print("TOP CATEGORIES")
print("-" * 50)

for category, count in category_counter.most_common(10):
    print(
        f"{category:<20} {count}"
    )

print()

print("-" * 50)
print("TOP KEYWORDS")
print("-" * 50)

for keyword, count in keyword_counter.most_common(15):
    print(
        f"{keyword:<20} {count}"
    )

print("=" * 50)