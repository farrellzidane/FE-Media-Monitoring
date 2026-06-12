from collections import Counter

from database.database import (
    get_all_articles
)

articles = get_all_articles()

source_categories = {}

for article in articles:
    source = article[1]
    category = article[2]

    if not category:
        category = "unknown"

    if source not in source_categories:
        source_categories[source] = Counter()

    source_categories[source][category] += 1


print()
print("=" * 50)
print("MEDIA FOCUS ANALYSIS")
print("=" * 50)

for source in sorted(source_categories.keys()):

    print()
    print(source)
    print("-" * 50)

    for category, count in (
        source_categories[source]
        .most_common(5)
    ):
        print(
            f"{category:<20} : {count}"
        )

print()
print("=" * 50)