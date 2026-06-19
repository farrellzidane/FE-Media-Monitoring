from services.topic_sentiment_service import (
    get_topic_sentiments
)

topics = get_topic_sentiments()

for topic in topics:

    print("=" * 50)
    print(f"TOPIC {topic['topic_id']}")
    print("Keywords:", ", ".join(topic["keywords"]))
    print("Articles:", topic["article_count"])
    print()

    print("ARTICLE DETAILS")
    print("-" * 30)

    for item in topic["details"]:
        print(item["title"])
        print("Source:", item["source"])
        print("Sentiment:", item["sentiment"])
        print()

    print("-" * 30)
    print("TOTAL SENTIMENT")
    print("-" * 30)

    print("Positive:", topic["positive"])
    print("Negative:", topic["negative"])
    print("Neutral :", topic["neutral"])
    print()

    print("SOURCE COMPARISON")
    print("-" * 30)

    for source, stats in topic["source_summary"].items():
        print(source)
        print("  Positive:", stats["Positive"])
        print("  Negative:", stats["Negative"])
        print("  Neutral :", stats["Neutral"])
        print()

    print()