from dataclasses import dataclass

@dataclass
class Article:
    title: str
    url: str
    source: str
    category: str
    published_date: str
    content: str