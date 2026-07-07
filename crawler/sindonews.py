from playwright.sync_api import (
    sync_playwright
)

from config.settings import (
    REQUEST_TIMEOUT,
    USER_AGENT,
    MAX_ARTICLES,
    SINDONEWS_URLS
)

import json
import requests

from bs4 import BeautifulSoup

from models.article import Article

from config.settings import (
    REQUEST_TIMEOUT,
    USER_AGENT,
    MAX_ARTICLES
)


def get_latest_article_urls(limit=MAX_ARTICLES):
    urls = []
    seen = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for source_url in SINDONEWS_URLS:
            try:
                page = browser.new_page()

                page.goto(
                    source_url,
                    wait_until="domcontentloaded",
                    timeout=30000
                )

                links = page.locator("a").evaluate_all("""
                    elements => elements
                        .map(e => e.href)
                        .filter(h => h && h.includes('/read/'))
                """)

                page.close()

                for link in links:
                    if link in seen:
                        continue

                    seen.add(link)
                    urls.append(link)

                    if len(urls) >= limit:
                        browser.close()
                        return urls

            except Exception as e:
                print(f"Sindonews error: {e}")

        browser.close()

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

    # ==========================
    # TITLE
    # ==========================

    title = ""

    h1 = soup.find("h1")

    if h1:
        title = h1.get_text(
            " ",
            strip=True
        )

    # ==========================
    # CONTENT
    # ==========================

    content = ""

    article_body = soup.find(
        "div",
        class_="detail-desc"
    )

    if article_body:

        raw_content = article_body.get_text(
            "\n",
            strip=True
        )

        junk_words = [
            "Baca Juga",
            "Lihat Juga",
            "Follow WhatsApp Channel",
            "loading...",
            "A A A"
        ]

        lines = []

        for line in raw_content.split(
            "\n"
        ):

            line = line.strip()

            if not line:
                continue

            if line == title:
                continue

            skip = False

            for word in junk_words:

                if word in line:
                    skip = True
                    break

            if skip:
                continue

            lines.append(line)

        content = "\n".join(
            lines
        )

    # ==========================
    # CATEGORY
    # ==========================

    category = "unknown"

    try:

        category = (
            url.split(
                ".sindonews.com"
            )[0]
            .split("//")[1]
        )

    except:
        pass

    # ==========================
    # DATE
    # ==========================

    published_date = ""

    for script in soup.find_all(
        "script",
        type="application/ld+json"
    ):
        try:

            data = json.loads(
                script.get_text().strip()
            )

            if (
                isinstance(
                    data,
                    dict
                )
                and "datePublished" in data
            ):
                published_date = (
                    data[
                        "datePublished"
                    ][:10]
                )
                break

        except:
            continue

    # ==========================
    # DEBUG
    # ==========================

    if not published_date:

        print()
        print(
            f"NO DATE SINDONEWS: {url}"
        )
        print()

    return Article(
        title=title,
        url=url,
        source="Sindonews",
        category=category,
        published_date=published_date,
        content=content
    )