from database.database import (
    get_articles_by_source
)


source = input(
    "Enter source: "
)

results = get_articles_by_source(
    source
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
    date = article[3]
    url = article[4]

    print(
        f"[{source}] {title}"
    )

    print(
        f"Category : {category}"
    )

    print(
        f"Date     : {date}"
    )

    print(
        f"URL      : {url}"
    )

    print("-" * 80)