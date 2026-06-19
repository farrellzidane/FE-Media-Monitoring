import json
from collections import Counter

import matplotlib.pyplot as plt


with open(
    "data/articles.json",
    encoding="utf-8"
) as f:
    articles = json.load(f)

counter = Counter()

for article in articles:

    category = article["category"]

    if not category:
        category = "unknown"

    counter[category] += 1


sorted_data = counter.most_common()

categories = [
    item[0]
    for item in sorted_data
]

counts = [
    item[1]
    for item in sorted_data
]


plt.figure(
    figsize=(12, 6)
)

plt.bar(
    categories,
    counts
)

plt.title(
    "Article Distribution by Category"
)

plt.xlabel(
    "Category"
)

plt.ylabel(
    "Number of Articles"
)

plt.xticks(
    rotation=45,
    ha="right"
)

for i, count in enumerate(counts):
    plt.text(
        i,
        count + 0.1,
        str(count),
        ha="center"
    )

plt.tight_layout()

plt.savefig(
    "category_distribution.png",
    dpi=300
)

print()
print("=" * 40)
print("CATEGORY DISTRIBUTION")
print("=" * 40)

for category, count in sorted_data:
    print(
        f"{category:<20} : {count}"
    )

print("=" * 40)

print()
print(
    "Saved: category_distribution.png"
)