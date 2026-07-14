from transformers import pipeline

classifier = None


def initialize_model():
    global classifier

    if classifier is None:
        classifier = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
            tokenizer="cardiffnlp/twitter-xlm-roberta-base-sentiment"
        )


def analyze_sentiment(text):

    if not text:
        return {
            "label": "Neutral",
            "confidence": 0.0
        }

    initialize_model()

    result = classifier(
        text[:512]
    )[0]

    label_map = {
        "LABEL_0": "Negative",
        "LABEL_1": "Neutral",
        "LABEL_2": "Positive"
    }

    return {
        "label": label_map.get(
            result["label"],
            result["label"]
        ),
        "confidence": round(
            result["score"],
            4
        )
    }