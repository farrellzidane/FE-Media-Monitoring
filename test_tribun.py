# test_tribun.py

from crawler.tribun import get_latest_article_urls

urls = get_latest_article_urls(30)

print(len(urls))

for u in urls:
    print(u)