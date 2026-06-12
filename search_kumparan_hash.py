import requests
import re

html = requests.get(
    "https://kumparan.com"
).text

matches = re.findall(
    r'Find[A-Za-z]+',
    html
)

print(
    sorted(
        set(matches)
    )
)