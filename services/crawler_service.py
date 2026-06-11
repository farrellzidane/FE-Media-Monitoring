def crawl_articles(
    get_urls_function,
    get_article_function,
    source_name
):
    articles = []

    print(f"Crawling {source_name}...")
    print()

    for url in get_urls_function():
        try:
            article = get_article_function(url)

            articles.append(article)

            print(
                f"[{source_name}] {article.title}"
            )

        except Exception as e:
            print(
                f"ERROR {source_name}: {url}"
            )
            print(e)

    print()

    return articles