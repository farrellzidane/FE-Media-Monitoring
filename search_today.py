from datetime import date

from database.database import(
  get_articles_by_date
)

today = str(
  date.today()
)

results = get_articles_by_date(
  today
)

print()
print(
  f"Found {len(results)} articles"
)

print()

for article in results:
  title = article[0]
  source = article[1]
  category = article[2]

  print(
    f"[{source}] {title}"
  )

  print(
    f"Category : {category}"
  )

  print("-" * 80)