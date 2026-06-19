from transformers import pipeline


# ======================================
# LOAD MODEL ONCE
# ======================================

classifier = None

def get_classifier():
    global classifier

    if classifier is None:
        classifier = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-xlm-roberta-base-sentiment"
        )

    return classifier

# ======================================
# RULE-BASED FALLBACK
# ======================================

POSITIVE_WORDS = {
    "naik": 1,
    "menang": 2,
    "sukses": 2,
    "rekor": 2,
    "cetak": 1,
    "lolos": 2,
    "unggul": 1,
    "tumbuh": 2,
    "optimis": 2,
    "juara": 3,
    "menguat": 2
}

NEGATIVE_WORDS = {
    "turun": -1,
    "gagal": -2,
    "krisis": -3,
    "korupsi": -3,
    "demo": -1,
    "konflik": -2,
    "perang": -3,
    "buruk": -2,
    "melemah": -2,
    "tewas": -3,
    "hoaks": -2,
    "jatuh": -2,
    "anjlok": -3,
    "ditangkap": -2,
    "pencurian": -3
}


def rule_based_sentiment(text):

    if not text:
        return "Neutral"

    text = str(text).lower()
    words = text.split()

    score = 0

    for word in words:

        word = word.strip(
            ".,!?():;\"'[]{}"
        )

        if word in POSITIVE_WORDS:
            score += POSITIVE_WORDS[word]

        elif word in NEGATIVE_WORDS:
            score += NEGATIVE_WORDS[word]

    if score >= 2:
        return "Positive"

    elif score <= -2:
        return "Negative"

    return "Neutral"


# ======================================
# MAIN SENTIMENT FUNCTION
# ======================================
def analyze_sentiment(text):

    if not text:
        return "Neutral"

    try:
        model = get_classifier()
        result = model(text)[0]

        label = result["label"].lower()
        confidence = result["score"]

        if confidence >= 0.75:

            if label == "positive":
                return "Positive"

            elif label == "negative":
                return "Negative"

            else:
                return "Neutral"

        return rule_based_sentiment(text)

    except Exception as e:
        print("Sentiment error:", e)
        return rule_based_sentiment(text)