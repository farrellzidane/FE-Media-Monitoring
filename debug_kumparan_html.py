import requests

from config.settings import (
    KUMPARAN_URL,
    DEFAULT_HEADERS
)

response = requests.get(
    KUMPARAN_URL,
    headers=DEFAULT_HEADERS
)

print(
    response.status_code
)

print()

print(
    response.text[:5000]
)