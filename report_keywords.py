from collections import Counter
import re

from database.database import(
  get_all_articles
)

STOP_WORDS = {
    "dan",
    "di",
    "ke",
    "dari",
    "yang",
    "untuk",
    "dengan",
    "pada",
    "ini",
    "itu",
    "jadi",
    "usai",
    "bakal",
    "soal",
    "tak",
    "ada",
    "baru",
    "lebih",
    "oleh",
    "hingga",
    "karena",
    "dalam",
    "para",
    "saat",
    "jadi",
    "atau",
    "the",
    "of",
    "in",
    "to",
    "a"
}

articles = get_all_articles()

counter = Counter()

for article in articles:
  title = article[0].lower()

  words = re.findall(
    r"\b[a-zA-Z]+\b",
    title
  )

  for word in words:
    if len(word) < 3:
      continue
    
    if word in STOP_WORDS:
      continue

    counter[word] += 1

print()
print("="*40)
print("TOP KEYWORDS")
print("=" * 40)

for word, count in counter.most_common(20):
  print(
    f"{word:<15} : {count}"
  )

print("=" * 40)