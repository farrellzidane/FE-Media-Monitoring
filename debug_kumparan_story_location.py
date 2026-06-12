import re
import requests

from config.settings import (
    DEFAULT_HEADERS
)

response = requests.get(
    "https://kumparan.com",
    headers=DEFAULT_HEADERS
)

html = response.text

keywords = [
    "Story",
    "headline",
    "slug",
    "title"
]

for keyword in keywords:

    print()
    print("=" * 50)
    print(keyword)
    print("=" * 50)

    matches = list(
        re.finditer(
            keyword,
            html
        )
    )

    print(
        "TOTAL:",
        len(matches)
    )

    for match in matches[:5]:

        start = max(
            0,
            match.start() - 200
        )

        end = min(
            len(html),
            match.end() + 200
        )

        print()
        print(
            html[start:end]
        )

        print()
        print("-" * 100)