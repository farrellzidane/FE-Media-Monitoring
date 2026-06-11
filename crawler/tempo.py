import json
import requests

from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    TEMPO_URL,
    MAX_ARTICLES,
    REQUEST_TIMEOUT,
    DEFAULT_HEADERS
)


def get_latest_article_urls(limit=MAX_ARTICLES):
    response = requests.get(
        TEMPO_URL,
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

        if not href.startswith("/"):
            continue

        if href.count("/") < 2:
            continue

        if "-" not in href:
            continue

        if "/foto/" in href:
            continue

        if "/tag/" in href:
            continue

        if "/newsletter" in href:
            continue

        if "/info-tempo" in href:
            continue

        if "/plus" in href:
            continue

        full_url = TEMPO_URL + href

        if full_url in processed_urls:
            continue

        processed_urls.add(full_url)
        urls.append(full_url)

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

    script = soup.find(
        "script",
        attrs={"type": "application/ld+json"}
    )

    if not script:
        raise Exception(
            f"Schema JSON not found: {url}"
        )

    data = json.loads(
        script.string
    )

    title = data.get(
        "headline",
        ""
    )

    content = data.get(
        "articleBody",
        ""
    )

    published_date = data.get(
        "datePublished",
        ""
    )

    if published_date:
        published_date = (
            published_date.split("T")[0]
        )

    category = ""

    parts = (
        url.replace(
            "https://www.tempo.co/",
            ""
        )
        .split("/")
    )

    if len(parts) > 0:
        category = parts[0]

    return Article(
        title=title,
        url=url,
        source="Tempo",
        category=category,
        published_date=published_date,
        content=content
    )