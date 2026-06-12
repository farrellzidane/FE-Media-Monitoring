import requests

from config.settings import (
    DEFAULT_HEADERS
)

response = requests.get(
    "https://kumparan.com",
    headers=DEFAULT_HEADERS
)

html = response.text

start = html.find(
    "__INITIAL_STATE__="
)

print(start)

print()

print(
    html[start:start + 5000]
)