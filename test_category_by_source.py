from services.analytics_service import (
    get_category_by_source
)

results = get_category_by_source()

print()

for source, categories in results.items():

    print("=" * 50)
    print(source)
    print()

    for category, count in categories.items():
        print(f"{category}: {count}")

    print()