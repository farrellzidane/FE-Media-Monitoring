from services.analytics_service import (
    get_sentiment_by_source
)

results = get_sentiment_by_source()

print()

for source, stats in results.items():

    print("=" * 50)
    print(source)
    print()

    print("Positive:", stats["positive"])
    print("Negative:", stats["negative"])
    print("Neutral :", stats["neutral"])
    print()