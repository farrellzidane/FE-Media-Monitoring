import requests
import json

from urllib.parse import urlparse

from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    KOMPAS_URL,
    MAX_ARTICLES,
    USER_AGENT,
    REQUEST_TIMEOUT
)


def get_latest_article_urls(limit=MAX_ARTICLES):

    response = requests.get(
        KOMPAS_URL,
        headers={
            "User-Agent": USER_AGENT
        },
        timeout=REQUEST_TIMEOUT
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    urls = []
    processed_urls = set()

    for link in soup.find_all("a"):

        href = link.get("href")

        if not href:
            continue

        if "/read/" not in href:
            continue

        if "/opini/" in href:
            continue

        if "/kolom/" in href:
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
        headers={
            "User-Agent": USER_AGENT
        },
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

        title = soup.title.get_text(
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

        if text == "Tim Redaksi":
            continue

        if text.startswith(
            "Baca juga:"
        ):
            continue

        if text.startswith(
            "Lihat Foto"
        ):
            continue

        if text.startswith(
            "Kompas.com+"
        ):
            continue

        if "Copyright 2008" in text:
            continue

        if (
            "Dapatkan lebih banyak kuota"
            in text
        ):
            continue

        if (
            "artikel KOMPAS.com"
            in text
        ):
            continue

        content_list.append(
            text
        )

    content = "\n".join(
        content_list
    )

    published_date = ""

    meta_time = soup.find(
        "meta",
        attrs={
            "property":
            "article:published_time"
        }
    )

    if meta_time:

        raw_date = meta_time.get(
            "content",
            ""
        )

        if raw_date:
            published_date = raw_date[:10]

    if not published_date:

        for script in soup.find_all(
            "script",
            type="application/ld+json"
        ):

            try:

                data = json.loads(
                    script.string
                )

                if (
                    isinstance(
                        data,
                        dict
                    )
                    and
                    "datePublished" in data
                ):

                    published_date = (
                        data[
                            "datePublished"
                        ][:10]
                    )

                    break

            except:
                pass

    if not published_date:

        parts = url.split("/")

        if "read" in parts:

            read_index = (
                parts.index("read")
            )

            if (
                len(parts)
                > read_index + 3
            ):

                published_date = (
                    f"{parts[read_index + 1]}-"
                    f"{parts[read_index + 2]}-"
                    f"{parts[read_index + 3]}"
                )

    category = ""

    parsed_url = urlparse(
        url
    )

    host = parsed_url.netloc

    if host.startswith(
        "www.kompas.com"
    ):

        path_parts = (
            parsed_url.path
            .split("/")
        )

        if len(path_parts) > 1:

            category = (
                path_parts[1]
                .lower()
            )

    else:

        category = (
            host
            .split(".")[0]
            .lower()
        )

    # =====================
    # NORMALIZATION
    # =====================

    if category == "edu":
        category = "edukasi"

    if category == "bola":
        category = "olahraga"

    if category == "bola-sports":
        category = "olahraga"

    return Article(
        title=title,
        url=url,
        source="Kompas",
        category=category,
        published_date=published_date,
        content=content
    )