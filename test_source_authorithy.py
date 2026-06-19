from services.analytics_service import (
    get_source_authority_map
)

data = get_source_authority_map()

for row in data:
    print("====================")
    print("Source   :", row["source"])
    print("Volume   :", row["volume"])
    print("Score    :", row["score"])
    print("Tier     :", row["tier"])
    print("Sentiment:", row["sentiment"])