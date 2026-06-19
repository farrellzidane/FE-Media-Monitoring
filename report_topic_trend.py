from collections import Counter

from database.database import (
    get_all_articles
)

TOPICS = {
    "Iran": [
        "iran"
    ],

    "Demo": [
        "demo",
        "mahasiswa"
    ],

    "Piala Dunia": [
        "piala",
        "dunia"
    ],

    "Prabowo": [
        "prabowo"
    ],

    "BBM": [
        "bbm",
        "pertamax",
        "pertalite"
    ]
}

articles = get_all_articles()

topic_trends = {}

for topic in TOPICS:

    topic_trends[topic] = Counter()

for article in articles:

    title = article[0].lower()
    date = article[3]

    if not date:
        continue

    for topic, keywords in TOPICS.items():

        for keyword in keywords:

            if keyword in title:

                topic_trends[
                    topic
                ][date] += 1

                break

print()
print("=" * 60)
print("TOPIC TREND")
print("=" * 60)

for topic, counter in (
    topic_trends.items()
):

    print()
    print(topic)
    print("-" * 30)

    for date, count in sorted(
        counter.items()
    ):

        print(
            f"{date} : {count}"
        )

print()
print("=" * 60)