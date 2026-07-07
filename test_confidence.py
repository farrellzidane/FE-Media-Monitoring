from services.sentiment_service import analyze_sentiment_detailed

headlines = [
    "Timnas Indonesia menang telak",
    "Korupsi besar terungkap di kementerian",
    "Pemerintah bahas kebijakan baru"
]

for headline in headlines:
    result = analyze_sentiment_detailed(headline)
    print("=" * 50)
    print(headline)
    print(result)