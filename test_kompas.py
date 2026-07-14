# test_kompas.py

from crawler.kompas import get_latest_article_urls

urls = get_latest_article_urls(20)

print("TOTAL:", len(urls))
print()

for url in urls:
    print(url)