from collections import Counter

from database.database import (
    get_all_articles
)

articles = get_all_articles()

counter = Counter()

for article in articles:

    date = article[3]

    if not date:
        continue

    counter[date] += 1

print()
print("=" * 50)
print("DAILY ARTICLE VOLUME")
print("=" * 50)

for date, count in sorted(
    counter.items()
):

    print(
        f"{date} : {count}"
    )

print("=" * 50)