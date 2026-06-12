import requests
import re

from config.settings import (
    KUMPARAN_URL,
    DEFAULT_HEADERS
)

response = requests.get(
    KUMPARAN_URL,
    headers=DEFAULT_HEADERS
)

html = response.text

matches = re.findall(
    r'https://kumparan\.com[^"]+',
    html
)

print(
    f"FOUND: {len(matches)}"
)

print()

for url in matches[:100]:
    print(url)