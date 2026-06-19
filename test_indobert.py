from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-xlm-roberta-base-sentiment"
)

texts = [
    "Messi cetak rekor dan tim menang besar",
    "IHSG melemah akibat konflik perang",
    "Prabowo hadir di acara nasional"
]

results = classifier(texts)

for text, result in zip(texts, results):
    print("=" * 50)
    print(text)
    print("Label:", result["label"])
    print("Score:", round(result["score"], 4))