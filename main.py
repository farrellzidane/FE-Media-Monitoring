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

from crawler.tribun import (
    get_article as get_tribun_article,
    get_latest_article_urls as get_tribun_urls
)

from crawler.cnbc import (
    get_article as get_cnbc_article,
    get_latest_article_urls as get_cnbc_urls
)

from crawler.liputan6 import (
    get_article as get_liputan6_article,
    get_latest_article_urls as get_liputan6_urls
)

from crawler.okezone import (
    get_article as get_okezone_article,
    get_latest_article_urls as get_okezone_urls
)

from crawler.kumparan import (
    get_article as get_kumparan_article,
    get_latest_article_urls as get_kumparan_urls
)

from crawler.sindonews import (
    get_article as get_sindonews_article,
    get_latest_article_urls as get_sindonews_urls
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

from database.database import (
    create_database,
    save_articles_to_database,
    clear_articles
)

from config.settings import (
    OUTPUT_FILE
)

from datetime import datetime, timedelta

#import os
#print("DB PATH:", os.path.abspath("data/articles.db"))


def main():

    create_database()

    clear_articles()

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
        ),
        (
            "Tribun",
            get_tribun_urls,
            get_tribun_article
        ),
        (
            "CNBC",
            get_cnbc_urls,
            get_cnbc_article
        ),
        (
            "Liputan6",
            get_liputan6_urls,
            get_liputan6_article
        ),
        (
            "Okezone",
            get_okezone_urls,
            get_okezone_article
        ),
        (
            "Kumparan",
            get_kumparan_urls,
            get_kumparan_article
        ),
        (
            "Sindonews",
            get_sindonews_urls,
            get_sindonews_article
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
    # =====================================================
    # Keep only recent news
    # =====================================================

    today = datetime.today().date()
    max_age = timedelta(days=30)

    filtered_articles = []

    for article in articles:

        if not article.published_date:
            continue

        try:
            published = datetime.strptime(
                article.published_date,
                "%Y-%m-%d"
            ).date()

            if today - published <= max_age:
                filtered_articles.append(article)

        except:
            continue

    articles = filtered_articles

    articles.sort(
        key=lambda article: article.published_date,
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

    save_articles_to_database(
        articles
    )


if __name__ == "__main__":
    main()