from services.sentiment_service import analyze_sentiment

test_cases = [
    "Pemerintah bahas kebijakan ekonomi baru",
    "Jokowi bertemu investor asing di Jakarta",
    "Bank Indonesia tahan suku bunga",
    "Harga saham teknologi melemah tipis",
    "Timnas unggul 1-0 di babak pertama",
    "Demo mahasiswa berlangsung damai"
]


for text in test_cases:
    print("=" * 50)
    print(text)
    print("Sentiment:", analyze_sentiment(text))