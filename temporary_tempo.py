import json
import requests

from bs4 import BeautifulSoup

headers = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/137.0.0.0 Safari/537.36"
    )
}

url = (
    "https://www.tempo.co"
    "/hukum/penipuan-investasi-dapur-mbg-2268388"
)

response = requests.get(
    url,
    headers=headers
)

soup = BeautifulSoup(
    response.text,
    "html.parser"
)

script = soup.find(
    "script",
    attrs={"type": "application/ld+json"}
)

data = json.loads(script.string)

print("TITLE:")
print(data["headline"])

print()
print("DATE:")
print(data["datePublished"])

print()
print("CONTENT:")
print(data["articleBody"][:1000])