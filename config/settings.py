CNN_URLS = [
    "https://www.cnnindonesia.com/nasional",
    "https://www.cnnindonesia.com/internasional",
    "https://www.cnnindonesia.com/ekonomi",
    "https://www.cnnindonesia.com/olahraga",
    "https://www.cnnindonesia.com/teknologi"
]

DETIK_URLS = [
    "https://news.detik.com",
    "https://finance.detik.com",
    "https://sport.detik.com",
    "https://inet.detik.com"
]

KOMPAS_URL = "https://www.kompas.com"
TEMPO_URL = "https://www.tempo.co"

TRIBUN_URLS = [
    "https://www.tribunnews.com",
    "https://jabar.tribunnews.com",
    "https://jatim.tribunnews.com",
    "https://medan.tribunnews.com"
]

CNBC_URLS = [
    "https://www.cnbcindonesia.com/market",
    "https://www.cnbcindonesia.com/news",
    "https://www.cnbcindonesia.com/tech",
    "https://www.cnbcindonesia.com/entrepreneur"
]
LIPUTAN6_URL = "https://www.liputan6.com"
KUMPARAN_URL = "https://kumparan.com"
OKEZONE_URLS = [
    "https://news.okezone.com",
    "https://economy.okezone.com",
    "https://sports.okezone.com",
    "https://techno.okezone.com"
]
SINDONEWS_URLS = [
    "https://nasional.sindonews.com",
    "https://ekbis.sindonews.com",
    "https://sports.sindonews.com",
    "https://international.sindonews.com"
]
KUMPARAN_GRAPHQL_URL = (
    "https://cdn-graphql-v4.kumparan.com/query"
)

MAX_ARTICLES = 200

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