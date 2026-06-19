from services.analytics_service import (
    get_topic_discovery
)

topics = get_topic_discovery()

print()
print("=" * 70)
print("TOPIC DISCOVERY")
print("=" * 70)

for topic in topics:

    print()
    print(
        f"TOPIC {topic['topic_id']}"
    )

    print(
        "Keywords:",
        ", ".join(
            topic["keywords"]
        )
    )

    print(
        f"Articles: {topic['article_count']}"
    )

    print("-" * 70)

    for title in topic[
        "titles"
    ]:

        print(
            f"- {title}"
        )

print()
print("=" * 70)