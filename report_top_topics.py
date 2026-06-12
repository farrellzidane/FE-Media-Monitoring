from collections import Counter

from database.database import (
    get_all_articles
)

articles = get_all_articles()

TOPICS = {
    "Piala Dunia 2026": [
        "piala",
        "dunia",
        "2026"
    ],

    "Rupiah": [
        "rupiah"
    ],

    "Iran": [
        "iran"
    ],

    "Demo Mahasiswa": [
        "demo",
        "mahasiswa"
    ],

    "BBM": [
        "bbm",
        "pertalite"
    ],

    "Listrik": [
        "listrik",
        "padam",
        "pemadaman"
    ],

    "Hoaks": [
        "hoaks"
    ],

    "Prabowo": [
        "prabowo"
    ],

    "KPK": [
        "kpk"
    ]
}

topic_counter = Counter()

for article in articles:
    title = article[0].lower()

    for topic, keywords in TOPICS.items():

        for keyword in keywords:

            if keyword in title:
                topic_counter[topic] += 1
                break

print()
print("=" * 50)
print("TOP TOPICS")
print("=" * 50)
print()

for topic, count in topic_counter.most_common():

    print(
        f"{topic:<25} : {count}"
    )

print()
print("=" * 50)