from services.analytics_service import (
    get_sentiment_by_category
)

results = get_sentiment_by_category()

for category, stats in results.items():

    print("=" * 30)
    print(category)

    print("Positive:", stats["positive"])
    print("Negative:", stats["negative"])
    print("Neutral :", stats["neutral"])