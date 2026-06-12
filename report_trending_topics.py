from collections import Counter
import re

from database.database import (
    get_all_articles
)


STOP_WORDS = {
    "dan",
    "di",
    "ke",
    "dari",
    "yang",
    "untuk",
    "dengan",
    "pada",
    "ini",
    "itu",
    "jadi",
    "usai",
    "bakal",
    "soal",
    "tak",
    "ada",
    "baru",
    "lebih",
    "oleh",
    "hingga",
    "karena",
    "dalam",
    "para",
    "saat",
    "atau"
}


articles = get_all_articles()

topic_counter = Counter()

for article in articles:
    title = article[0].lower()

    words = re.findall(
        r"\b[a-zA-Z]+\b",
        title
    )

    unique_words = set()

    for word in words:
        if len(word) < 3:
            continue

        if word in STOP_WORDS:
            continue

        unique_words.add(word)

    for word in unique_words:
        topic_counter[word] += 1


print()
print("=" * 50)
print("TRENDING TOPICS")
print("=" * 50)

for topic, count in topic_counter.most_common(15):
    print(
        f"{topic:<20} : {count} articles"
    )

print("=" * 50)