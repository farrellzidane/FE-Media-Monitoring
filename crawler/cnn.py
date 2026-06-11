import requests
from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    CNN_URL,
    MAX_ARTICLES,
    USER_AGENT,
    REQUEST_TIMEOUT
)


def get_latest_article_urls(limit=MAX_ARTICLES):
    response = requests.get(
        CNN_URL,
        headers={"User-Agent": USER_AGENT},
        timeout=REQUEST_TIMEOUT
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    links = soup.find_all("a")

    urls = []
    processed_urls = set()

    for link in links:
        href = link.get("href")

        if not href:
            continue

        if not href.startswith(CNN_URL):
            continue

        if "/202" not in href:
            continue

        if href in processed_urls:
            continue

        processed_urls.add(href)
        urls.append(href)

        if len(urls) >= limit:
            break

    return urls


def get_article(url):
    response = requests.get(
        url,
        headers={"User-Agent": USER_AGENT},
        timeout=REQUEST_TIMEOUT
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    h1 = soup.find("h1")

    if h1:
        title = h1.get_text(" ", strip=True)
    else:
        title = soup.title.text

    paragraphs = soup.find_all("p")

    content_list = []

    for p in paragraphs:
        text = p.get_text(" ", strip=True)

        if not text:
            continue

        if text in [
            "ADVERTISEMENT",
            "SCROLL TO CONTINUE WITH CONTENT"
        ]:
            continue

        if text.startswith("[Gambas:"):
            continue

        content_list.append(text)

    content = "\n".join(content_list)

    published_date = ""

    parts = url.split("/")

    if len(parts) >= 5:
        article_id = parts[4]

        if len(article_id) >= 8:
            published_date = (
                f"{article_id[0:4]}-"
                f"{article_id[4:6]}-"
                f"{article_id[6:8]}"
            )

    category = ""

    if len(parts) > 3:
        category = parts[3]

    return Article(
        title=title,
        url=url,
        source="CNN Indonesia",
        category=category,
        published_date=published_date,
        content=content
    )