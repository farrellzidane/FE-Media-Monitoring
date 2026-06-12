import requests

from config.settings import (
    KUMPARAN_URL,
    DEFAULT_HEADERS
)

response = requests.get(
    KUMPARAN_URL,
    headers=DEFAULT_HEADERS
)

html = response.text

keywords = [
    "__NEXT_DATA__",
    "__INITIAL_STATE__",
    "application/ld+json",
    "window.__",
    "apollo"
]

for keyword in keywords:
    print(
        keyword,
        keyword in html
    )