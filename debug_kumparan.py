import requests

from bs4 import BeautifulSoup

from config.settings import (
    KUMPARAN_URL,
    DEFAULT_HEADERS
)

response = requests.get(
    KUMPARAN_URL,
    headers=DEFAULT_HEADERS
)

print(response.status_code)

soup = BeautifulSoup(
    response.text,
    "html.parser"
)

links = soup.find_all("a")

print(
    f"TOTAL LINKS: {len(links)}"
)

print()

for link in links:
    href = link.get("href")

    if href:
        print(href)