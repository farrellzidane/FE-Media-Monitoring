from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis",
    model="w11wo/indonesian-roberta-base-sentiment-classifier"
)

test_cases = [
    "Messi cetak gol dan pecah rekor",
    "IHSG melemah akibat konflik perang",
    "Prabowo hadir di acara nasional",
    "Korupsi besar terungkap di kementerian",
    "Pemerintah bahas kebijakan ekonomi baru"
]

for text in test_cases:
    result = classifier(text)[0]

    print("=" * 50)
    print(text)
    print("Label:", result["label"])
    print("Score:", round(result["score"], 4))