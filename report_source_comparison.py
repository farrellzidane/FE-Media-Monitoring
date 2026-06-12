from collections import Counter

from database.database import (
    get_all_articles
)

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
    ]
}

print()
print("Available topics:")
print()

for topic in TOPICS:
    print(
        f"- {topic}"
    )

print()

selected_topic = input(
    "Choose topic: "
)

if selected_topic not in TOPICS:
    print(
        "Topic not found."
    )
    exit()

articles = get_all_articles()

source_counter = Counter()

keywords = TOPICS[
    selected_topic
]

for article in articles:

    title = article[0].lower()
    source = article[1]

    for keyword in keywords:

        if keyword in title:
            source_counter[source] += 1
            break

print()
print("=" * 50)
print(
    f"TOPIC: {selected_topic}"
)
print("=" * 50)
print()

for source, count in source_counter.most_common():

    print(
        f"{source:<20} : {count}"
    )

print()
print("=" * 50)