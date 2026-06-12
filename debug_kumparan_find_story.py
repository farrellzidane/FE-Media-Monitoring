import requests
import re

from config.settings import (
    DEFAULT_HEADERS
)

response = requests.get(
    "https://kumparan.com",
    headers=DEFAULT_HEADERS
)

html = response.text

matches = re.findall(
    r'"title":"[^"]+"',
    html
)

print(
    f"FOUND: {len(matches)}"
)

print()

for item in matches[:20]:
    print(item)