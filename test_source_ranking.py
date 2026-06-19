from services.analytics_service import (
    get_sentiment_by_source
)

results = get_sentiment_by_source()

print()

ranking = []

for source, stats in results.items():

    score = (
        stats["positive"]
        - stats["negative"]
    )

    ranking.append(
        (
            source,
            score,
            stats
        )
    )

ranking.sort(
    key=lambda x: x[1],
    reverse=True
)

for source, score, stats in ranking:

    print("=" * 50)
    print(source)
    print(f"Sentiment Score: {score}")
    print()

    print("Positive:", stats["positive"])
    print("Negative:", stats["negative"])
    print("Neutral :", stats["neutral"])
    print()