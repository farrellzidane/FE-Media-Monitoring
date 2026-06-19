from services.data_quality_service import (
    get_data_quality_report
)

report = (
    get_data_quality_report()
)

print()

print("=" * 50)
print("DATA QUALITY REPORT")
print("=" * 50)

for key, value in report.items():

    print(
        f"{key:<20} : {value}"
    )

print("=" * 50)