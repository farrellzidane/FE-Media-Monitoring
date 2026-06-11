import csv
import json

from dataclasses import asdict


def remove_duplicates(articles):
    unique_articles = []
    seen_urls = set()

    for article in articles:
        if article.url in seen_urls:
            continue

        seen_urls.add(article.url)
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

        category = article.category

        if not category:
            category = "unknown"

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
    article_data = [
        asdict(article)
        for article in articles
    ]

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
                article.category,
                article.published_date,
                article.content
            ])

    print()
    print(
        f"Saved to {file_path}"
    )