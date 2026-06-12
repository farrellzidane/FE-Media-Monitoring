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
    "story",
    "title",
    "headline",
    "slug",
    "publishedAt",
    "article",
    "Article",
    "post",
    "Post"
]

for keyword in keywords:
    print(
        keyword,
        keyword in html
    )