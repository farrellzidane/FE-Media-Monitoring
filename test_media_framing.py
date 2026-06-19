from services.analytics_service import (
    get_media_framing_analysis
)

data = get_media_framing_analysis()

for category, stats in data.items():
    print("=" * 30)
    print(category)
    print("Negative :", stats["negative"])
    print("Objective:", stats["objective"])