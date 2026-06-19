from services.analytics_service import (
    get_top_keywords
)

print()

for word, count in get_top_keywords():

    print(
        f"{word:<20} {count}"
    )