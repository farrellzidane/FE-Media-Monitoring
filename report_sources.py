from collections import Counter

from database.database import(
  get_all_articles
)

articles = get_all_articles()

counter = Counter()

for article in articles:
  source = article[1]
  counter[source] += 1

print()
print("=" * 40)
print("TOP SOURCES")
print("=" * 48)

for source, count in counter.most_common():
  print(
    f"{source:<15} : {count}"
  )

print("=" * 40)