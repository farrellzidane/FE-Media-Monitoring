from database.database import(
  get_articles_by_date 
)

date = input(
  "Enter date (YYYY-MM-DD)"
)

results = get_articles_by_date(
  date
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
  published_date = article[3]
  crawl_date = article[4]
  url = article[5]

  print(
    f"[{source}] {title}"
  )

  print(
    f"Category : {category}"
  )

  print(
    f"Published : {published_date}"
  )

  print(
    f"Crawled at : {crawl_date}"
  )

  print(
    f"URL        : {url}"
  )


  print("-" * 80)