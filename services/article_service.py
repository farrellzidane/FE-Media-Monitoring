import csv
import json

from dataclasses import asdict


def normalize_category(category):
    if not category:
        return "unknown"

    category = category.lower().strip()

    mapping = {

        # ========= BERITA =========
        "news": "berita",
        "berita": "berita",
        "nasional": "berita",
        "peristiwa": "berita",
        "metropolitan": "berita",
        "megapolitan": "berita",

        # ========= EKONOMI =========
        "economy": "ekonomi",
        "market": "ekonomi",
        "ekonomi": "ekonomi",
        "ekbis": "ekonomi",
        "money": "ekonomi",
        "bisnis": "ekonomi",

        # ========= OLAHRAGA =========
        "sport": "olahraga",
        "sports": "olahraga",
        "sportstars": "olahraga",
        "olahraga": "olahraga",
        "bola": "olahraga",
        "sepakbola": "olahraga",
        "superskor": "olahraga",

        # ========= INTERNASIONAL =========
        "international": "internasional",
        "internasional": "internasional",
        "global": "internasional",

        # ========= HIBURAN =========
        "celebrity": "hiburan",
        "showbiz": "hiburan",
        "entertainment": "hiburan",
        "hiburan": "hiburan",
        "lifestyle": "hiburan",

        # ========= TEKNOLOGI =========
        "tech": "sains",
        "tekno": "sains",
        "teknologi": "sains",

        # ========= HUKUM =========
        "crime": "hukum",
        "hukum": "hukum",

        # ========= REGIONAL =========
        "regional": "regional",
        "daerah": "regional",
        "bandung": "regional",
        "surabaya": "regional",
        "denpasar": "regional",

        # ========= CEK FAKTA =========
        "cek-fakta": "cek-fakta",
        "cekfakta": "cek-fakta",

        # ========= SAINS =========
        "sains": "sains",
        "research": "sains",
    }

    return mapping.get(
        category,
        category
    )


def remove_duplicates(articles):
    unique_articles = []
    seen_urls = set()

    for article in articles:

        if article.url in seen_urls:
            continue

        seen_urls.add(article.url)

        article.category = normalize_category(
            article.category
        )

        unique_articles.append(article)

    return unique_articles


def print_statistics(articles):
    source_counts = {}
    category_counts = {}

    for article in articles:

        source_counts[article.source] = (
            source_counts.get(
                article.source,
                0
            ) + 1
        )

        category = normalize_category(
            article.category
        )

        category_counts[category] = (
            category_counts.get(
                category,
                0
            ) + 1
        )

    print()
    print("=" * 40)
    print("SOURCE STATISTICS")
    print("=" * 40)

    for source, count in sorted(
        source_counts.items()
    ):
        print(
            f"{source:<15} : {count}"
        )

    print(
        f"Total Articles  : {len(articles)}"
    )

    print("=" * 40)

    print()
    print("=" * 40)
    print("CATEGORY STATISTICS")
    print("=" * 40)

    for category, count in sorted(
        category_counts.items()
    ):
        print(
            f"{category:<15} : {count}"
        )

    print("=" * 40)


def save_articles(
    articles,
    file_path
):
    article_data = []

    for article in articles:

        data = asdict(article)

        data["category"] = (
            normalize_category(
                article.category
            )
        )

        article_data.append(data)

    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            article_data,
            file,
            ensure_ascii=False,
            indent=4
        )

    print()
    print(
        f"Saved to {file_path}"
    )


def save_articles_csv(
    articles,
    file_path
):
    with open(
        file_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "title",
            "url",
            "source",
            "category",
            "published_date",
            "content"
        ])

        for article in articles:

            writer.writerow([
                article.title,
                article.url,
                article.source,
                normalize_category(
                    article.category
                ),
                article.published_date,
                article.content
            ])

    print()
    print(
        f"Saved to {file_path}"
    )


from services.sentiment_service import (
    analyze_sentiment
)


def get_sentiment_by_source():

    articles = get_all_articles()

    source_stats = {}

    for article in articles:

        title = article[0]
        source = article[1]

        sentiment = analyze_sentiment(
            title
        )

        if source not in source_stats:
            source_stats[source] = {
                "positive": 0,
                "negative": 0,
                "neutral": 0
            }

        if sentiment == "Positive":
            source_stats[source]["positive"] += 1

        elif sentiment == "Negative":
            source_stats[source]["negative"] += 1

        else:
            source_stats[source]["neutral"] += 1

    return source_stats