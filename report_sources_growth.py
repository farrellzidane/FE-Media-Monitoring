from collections import Counter

from database.database import (
    get_all_articles
)

articles = get_all_articles()

counter = Counter()

for article in articles:

    source = article[1]

    counter[source] += 1

print()
print("=" * 50)
print("SOURCE ARTICLE COUNT")
print("=" * 50)

for source, count in counter.most_common():

    print(
        f"{source:<20} : {count}"
    )

print("=" * 50)