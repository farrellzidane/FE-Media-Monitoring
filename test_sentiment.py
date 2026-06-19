from services.sentiment_service import (
    analyze_sentiment
)

samples = [
    "Messi cetak rekor dan tim menang besar",
    "IHSG melemah akibat konflik perang",
    "Prabowo hadir di acara nasional"
]

for text in samples:

    result = analyze_sentiment(
        text
    )

    print(text)
    print("Sentiment:", result)
    print()