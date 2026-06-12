from collections import Counter

from database.database import (
    get_all_articles
)


articles = get_all_articles()

counter = Counter()

for article in articles:
    category = article[2]

    if not category:
        category = "unknown"

    counter[category] += 1

print()
print("=" * 40)
print("TOP CATEGORIES")
print("=" * 40)

for category, count in counter.most_common():
    print(
        f"{category:<15} : {count}"
    )

print("=" * 40)