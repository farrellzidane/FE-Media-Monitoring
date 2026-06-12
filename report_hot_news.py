from database.database import (
    get_all_articles
)

TOPICS = {
    "Piala Dunia 2026": [
        "piala dunia",
        "meksiko",
        "korea",
        "ceko"
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
    "Rupiah": [
        "rupiah",
        "dolar",
        "bi rate"
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

topic_sources = {}

for topic in TOPICS:
    topic_sources[topic] = set()

for article in articles:
    title = article[0].lower()
    source = article[1]

    for topic, keywords in TOPICS.items():

        for keyword in keywords:

            if keyword in title:
                topic_sources[topic].add(
                    source
                )
                break

print()
print("=" * 50)
print("HOT NEWS ANALYSIS")
print("=" * 50)

for topic, sources in sorted(
    topic_sources.items(),
    key=lambda item: len(item[1]),
    reverse=True
):

    if len(sources) < 2:
        continue

    print()
    print(f"{topic}")
    print(
        f"Covered by {len(sources)} sources"
    )

    for source in sorted(sources):
        print(
            f"- {source}"
        )

print()
print("=" * 50)