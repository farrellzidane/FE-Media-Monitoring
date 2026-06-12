import requests

from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    OKEZONE_URL,
    MAX_ARTICLES,
    DEFAULT_HEADERS,
    REQUEST_TIMEOUT
)


def get_latest_article_urls(
    limit=MAX_ARTICLES
):
    response = requests.get(
        OKEZONE_URL,
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

        if ".okezone.com/read/" not in href:
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

    h1 = soup.find("h1")

    if h1:
        title = h1.get_text(
            " ",
            strip=True
        )
    else:
        title = soup.title.text

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

    published_date = ""

    parts = url.split("/")

    if "read" in parts:
        idx = parts.index("read")

        if len(parts) > idx + 3:
            published_date = (
                f"{parts[idx + 1]}-"
                f"{parts[idx + 2]}-"
                f"{parts[idx + 3]}"
            )

    category = "unknown"

    try:
        domain = (
            url.split("//")[1]
            .split(".")[0]
        )

        category = domain

    except:
        pass

    return Article(
        title=title,
        url=url,
        source="Okezone",
        category=category,
        published_date=published_date,
        content=content
    )