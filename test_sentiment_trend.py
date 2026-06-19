from services.analytics_service import (
    get_sentiment_trend
)

trend = get_sentiment_trend()

for date, stats in trend.items():
    print("=" * 30)
    print(date)
    print("Positive:", stats["positive"])
    print("Negative:", stats["negative"])
    print("Neutral :", stats["neutral"])