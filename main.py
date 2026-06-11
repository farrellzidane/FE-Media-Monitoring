from crawler.cnn import (
    get_article as get_cnn_article,
    get_latest_article_urls as get_cnn_urls
)

from crawler.detik import (
    get_article as get_detik_article,
    get_latest_article_urls as get_detik_urls
)

from crawler.kompas import (
    get_article as get_kompas_article,
    get_latest_article_urls as get_kompas_urls
)

from crawler.tempo import (
    get_article as get_tempo_article,
    get_latest_article_urls as get_tempo_urls
)

from services.crawler_service import (
    crawl_articles
)

from services.article_service import (
    save_articles,
    save_articles_csv,
    print_statistics,
    remove_duplicates
)

from config.settings import (
    OUTPUT_FILE
)


def main():
    sources = [
        (
            "CNN",
            get_cnn_urls,
            get_cnn_article
        ),
        (
            "Detik",
            get_detik_urls,
            get_detik_article
        ),
        (
            "Kompas",
            get_kompas_urls,
            get_kompas_article
        ),
        (
            "Tempo",
            get_tempo_urls,
            get_tempo_article
        )
    ]

    articles = []

    for source_name, get_urls, get_article in sources:
        source_articles = crawl_articles(
            get_urls,
            get_article,
            source_name
        )

        articles.extend(
            source_articles
        )

    articles = remove_duplicates(
        articles
    )

    articles.sort(
        key=lambda article:
        article.published_date,
        reverse=True
    )

    print()
    print(
        f"Successfully crawled "
        f"{len(articles)} articles."
    )

    print_statistics(
        articles
    )

    save_articles(
        articles,
        OUTPUT_FILE
    )

    save_articles_csv(
        articles,
        "data/articles.csv"
    )


if __name__ == "__main__":
    main()