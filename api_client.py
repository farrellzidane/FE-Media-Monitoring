import os

import requests


API_BASE_URL = os.getenv(
    "BACKEND_API_URL",
    "http://127.0.0.1:8000"
).rstrip("/")


def _get(path, params=None):
    response = requests.get(
        f"{API_BASE_URL}{path}",
        params=params,
        timeout=300
    )
    response.raise_for_status()
    return response.json()


def get_articles():
    return _get("/articles")


def get_analytics(keyword_limit=15, article_limit=15):
    return _get(
        "/analytics",
        params={
            "keyword_limit": keyword_limit,
            "article_limit": article_limit
        }
    )
