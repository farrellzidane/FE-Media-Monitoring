import requests
import json

from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    TRIBUN_URLS,
    MAX_ARTICLES,
    DEFAULT_HEADERS,
    REQUEST_TIMEOUT
)


def get_latest_article_urls(limit=MAX_ARTICLES):
    urls = []
    processed_urls = set()

    for tribun_url in TRIBUN_URLS:
        try:
            response = requests.get(
                tribun_url,
                headers=DEFAULT_HEADERS,
                timeout=REQUEST_TIMEOUT
            )

            response.raise_for_status()

            soup = BeautifulSoup(
                response.text,
                "html.parser"
            )

            for link in soup.find_all("a"):
                href = link.get("href")

                if not href:
                    continue

                if "tribunnews.com" not in href:
                    continue

                if "/topic/" in href:
                    continue

                if "/tag/" in href:
                    continue

                href = href.split("?")[0]

                if href in processed_urls:
                    continue

                processed_urls.add(href)
                urls.append(href)

                if len(urls) >= limit:
                    return urls

        except Exception as e:
            print(f"TRIBUN ERROR ({tribun_url}): {e}")

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

    content_list = []

    for p in soup.find_all("p"):

        text = p.get_text(
            " ",
            strip=True
        )

        if not text:
            continue

        if text == title:
            continue

        if text.startswith("Baca juga:"):
            continue

        if text.startswith("Lihat Foto"):
            continue

        if text.startswith("TRIBUNNEWS.COM"):
            continue

        content_list.append(
            text
        )

    content = "\n".join(
        content_list
    )

    # ==================================
    # DATE
    # ==================================

    published_date = ""

    for script in soup.find_all(
        "script",
        type="application/ld+json"
    ):
        try:

            raw_json = script.get_text(
                strip=True
            )

            if not raw_json:
                continue

            data = json.loads(
                raw_json
            )

            # FORMAT 1
            if (
                isinstance(data, dict)
                and "datePublished" in data
            ):
                published_date = (
                    data["datePublished"][:10]
                )
                break

            # FORMAT 2 (Tribun sekarang)
            if (
                isinstance(data, dict)
                and "@graph" in data
            ):

                for item in data["@graph"]:

                    if (
                        isinstance(item, dict)
                        and "datePublished" in item
                    ):
                        published_date = (
                            item["datePublished"][:10]
                        )
                        break

                if published_date:
                    break

            # FORMAT 3
            if isinstance(
                data,
                list
            ):

                for item in data:

                    if (
                        isinstance(item, dict)
                        and "datePublished" in item
                    ):
                        published_date = (
                            item["datePublished"][:10]
                        )
                        break

                if published_date:
                    break

        except:
            continue

    category = "unknown"

    parts = url.split("/")

    if len(parts) > 3:
        category = (
            parts[3]
            .lower()
            .strip()
        )

    return Article(
        title=title,
        url=url,
        source="Tribun",
        category=category,
        published_date=published_date,
        content=content
    )