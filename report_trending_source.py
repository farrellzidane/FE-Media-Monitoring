from collections import Counter

from database.database import (
    get_all_articles
)

TOPICS = {
    "Piala Dunia 2026": [
        "piala dunia",
        "piala dunia 2026",
        "meksiko",
        "korea",
        "ceko"
    ],
    "Rupiah": [
        "rupiah",
        "dolar",
        "bi rate"
    ],
    "Iran": [
        "iran",
        "hormuz",
        "trump"
    ],
    "Demo Mahasiswa": [
        "demo",
        "mahasiswa",
        "bem"
    ],
    "BBM": [
        "bbm",
        "pertalite",
        "pertamax"
    ],
    "Listrik": [
        "listrik",
        "pln",
        "pemadaman"
    ],
    "KPK": [
        "kpk",
        "korupsi",
        "ott"
    ]
}


articles = get_all_articles()

source_topics = {}

for article in articles:
    title = article[0]
    source = article[1]

    title_lower = title.lower()

    if source not in source_topics:
        source_topics[source] = Counter()

    for topic, keywords in TOPICS.items():
        for keyword in keywords:

            if keyword in title_lower:
                source_topics[source][topic] += 1
                break


print()
print("=" * 50)
print("TRENDING TOPICS BY SOURCE")
print("=" * 50)

for source in sorted(source_topics.keys()):

    print()
    print(source)
    print("-" * 50)

    if not source_topics[source]:
        print("No topic detected")
        continue

    for topic, count in (
        source_topics[source]
        .most_common(5)
    ):
        print(
            f"{topic:<25} : {count}"
        )

print()
print("=" * 50)