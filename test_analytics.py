from services.analytics_service import (
    get_daily_volume,
    get_source_statistics,
    get_category_statistics
)

print()
print("DAILY VOLUME")
print(
    get_daily_volume()
)

print()
print("SOURCE STATS")
print(
    get_source_statistics()
)

print()
print("CATEGORY STATS")
print(
    get_category_statistics()
)