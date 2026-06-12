import requests

from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    TRIBUN_URL,
    MAX_ARTICLES,
    DEFAULT_HEADERS,
    REQUEST_TIMEOUT
)


def get_latest_article_urls(
    limit=MAX_ARTICLES
):
    response = requests.get(
        TRIBUN_URL,
        headers=DEFAULT_HEADERS,
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

        if not href.startswith(
            "https://www.tribunnews.com/"
        ):
            continue

        if "/topic/" in href:
            continue

        if "/tag/" in href:
            continue

        if "/images/" in href:
            continue

        parts = href.split("/")

        if len(parts) < 6:
            continue

        article_id = parts[4]

        if not article_id.isdigit():
            continue

        href = href.split("?")[0]

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
        headers=DEFAULT_HEADERS,
        timeout=REQUEST_TIMEOUT
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    title = ""

    h1 = soup.find("h1")

    if h1:
        title = h1.get_text(
            " ",
            strip=True
        )

    paragraphs = soup.find_all("p")

    content_list = []

    for p in paragraphs:
        text = p.get_text(
            " ",
            strip=True
        )

        if not text:
            continue

        if text == title:
            continue

        content_list.append(text)

    content = "\n".join(
        content_list
    )

    category = "unknown"

    parts = url.split("/")

    if len(parts) > 3:
        category = parts[3]

    return Article(
        title=title,
        url=url,
        source="Tribun",
        category=category,
        published_date="",
        content=content
    )