CNN_URL = "https://www.cnnindonesia.com"
DETIK_URL = "https://news.detik.com"
KOMPAS_URL = "https://www.kompas.com"
TEMPO_URL = "https://www.tempo.co"
TRIBUN_URL = "https://www.tribunnews.com"
CNBC_URL = "https://www.cnbcindonesia.com"
LIPUTAN6_URL = "https://www.liputan6.com"
KUMPARAN_URL = "https://kumparan.com"
OKEZONE_URL = "https://www.okezone.com"
SINDONEWS_URL = "https://www.sindonews.com"
KUMPARAN_GRAPHQL_URL = (
    "https://cdn-graphql-v4.kumparan.com/query"
)

MAX_ARTICLES = 30

REQUEST_TIMEOUT = 20

USER_AGENT = (
    "Mozilla/5.0 "
    "(Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 "
    "(KHTML, like Gecko) "
    "Chrome/137.0.0.0 Safari/537.36"
)

OUTPUT_FILE = "data/articles.json"

DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": (
        "text/html,"
        "application/xhtml+xml,"
        "application/xml;q=0.9,"
        "image/avif,"
        "image/webp,"
        "*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.5",
    "Connection": "keep-alive"
}