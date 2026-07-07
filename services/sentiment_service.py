from sentence_transformers import SentenceTransformer, util


# ======================================
# GLOBAL MODEL + EMBEDDINGS
# ======================================

model = None
positive_embedding = None
negative_embedding = None
neutral_embedding = None


# ======================================
# IMPACT PROTOTYPES
# ======================================

POSITIVE_SAMPLES = [
    "pasar saham naik tajam",
    "harga saham melonjak",
    "ihsg menguat signifikan",
    "ekonomi tumbuh pesat",
    "inflasi menurun",
    "rupiah menguat",
    "laba perusahaan meningkat",
    "perusahaan cetak profit tinggi",
    "investasi asing meningkat",
    "pendapatan naik signifikan",

    "tim menang besar",
    "timnas menang telak",
    "berhasil lolos final",
    "juara turnamen",
    "cetak gol kemenangan",
    "pecah rekor dunia",
    "raih medali emas",
    "unggul di babak pertama",

    "program sukses besar",
    "prestasi membanggakan",
    "hasil sangat positif",
    "pemulihan ekonomi berhasil",
    "situasi kondusif",
    "kinerja membaik",
    "perkembangan sangat baik"
]

NEGATIVE_SAMPLES = [
    "pasar saham anjlok tajam",
    "harga saham jatuh drastis",
    "ihsg melemah signifikan",
    "rupiah melemah",
    "krisis ekonomi",
    "inflasi meningkat tajam",
    "resesi global",
    "phk massal",
    "perusahaan rugi besar",

    "korupsi besar",
    "kasus pencurian",
    "pejabat ditangkap",
    "skandal besar",
    "hoaks tersebar luas",

    "perang dunia",
    "konflik memanas",
    "serangan militer",
    "ancaman serius",
    "demo ricuh",

    "banjir besar",
    "gempa bumi",
    "longsor parah",
    "kebakaran besar",
    "bencana alam",

    "banyak korban tewas",
    "cedera parah"
]

NEUTRAL_SAMPLES = [
    "rapat pemerintah",
    "kebijakan baru",
    "konferensi pers",
    "diskusi nasional",
    "pertemuan resmi",
    "menteri hadir dalam acara",
    "agenda hari ini",
    "kunjungan kerja",
    "sidang berlangsung",
    "pengumuman resmi",

    "pemerintah bahas aturan baru",
    "bank indonesia tahan suku bunga",
    "jokowi bertemu investor",
    "prabowo hadir dalam acara",
    "pembahasan regulasi",

    "pertandingan berlangsung malam ini",
    "jadwal pertandingan",
    "acara dimulai hari ini",

    "wawancara eksklusif",
    "berita terbaru hari ini",
    "laporan terkini",
    "update terbaru",
    "informasi terbaru",
    "situasi saat ini",
    "kondisi terkini"
]


# ======================================
# RULE BOOSTER
# ======================================

POSITIVE_WORDS = {
    "naik": 1,
    "menguat": 2,
    "melonjak": 2,
    "menang": 2,
    "juara": 3,
    "unggul": 2,
    "laba": 2,
    "profit": 2
}

NEGATIVE_WORDS = {
    "anjlok": -4,
    "jatuh": -3,
    "melemah": -3,
    "korupsi": -4,
    "perang": -4,
    "banjir": -4, 
    "krisis": -4,
    "tewas": -4
}


# ======================================
# MODEL LOADER
# ======================================

def initialize_model():
    global model
    global positive_embedding
    global negative_embedding
    global neutral_embedding

    if model is None:
        model = SentenceTransformer(
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        positive_embedding = model.encode(
            POSITIVE_SAMPLES,
            convert_to_tensor=True
        )

        negative_embedding = model.encode(
            NEGATIVE_SAMPLES,
            convert_to_tensor=True
        )

        neutral_embedding = model.encode(
            NEUTRAL_SAMPLES,
            convert_to_tensor=True
        )


# ======================================
# RULE SCORE
# ======================================

def get_rule_score(text):

    if not text:
        return 0

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

    return score


# ======================================
# DETAILED CLASSIFIER
# ======================================

def analyze_sentiment_detailed(text):

    if not text:
        return {
            "label": "Neutral",
            "confidence": 0.0,
            "scores": {
                "Positive": 0,
                "Negative": 0,
                "Neutral": 0
            }
        }

    try:
        initialize_model()

        headline_embedding = model.encode(
            text,
            convert_to_tensor=True
        )

        positive_score = util.cos_sim(
            headline_embedding,
            positive_embedding
        ).mean().item()

        negative_score = util.cos_sim(
            headline_embedding,
            negative_embedding
        ).mean().item()

        neutral_score = util.cos_sim(
            headline_embedding,
            neutral_embedding
        ).mean().item()

        rule_score = get_rule_score(text)

        positive_score += max(rule_score, 0) * 0.05
        negative_score += abs(min(rule_score, 0)) * 0.05

        scores = {
            "Positive": positive_score,
            "Negative": negative_score,
            "Neutral": neutral_score
        }

        sorted_scores = sorted(
            scores.values(),
            reverse=True
        )

        confidence = sorted_scores[0] - sorted_scores[1]

        final_label = max(
            scores,
            key=scores.get
        )

        return {
            "label": final_label,
            "confidence": round(confidence, 4),
            "scores": scores
        }

    except Exception as e:
        print("Sentiment error:", e)

        return {
            "label": "Neutral",
            "confidence": 0.0,
            "scores": {
                "Positive": 0,
                "Negative": 0,
                "Neutral": 0
            }
        }


# ======================================
# SIMPLE CLASSIFIER (BACKWARD COMPATIBLE)
# ======================================

def analyze_sentiment(text):
    result = analyze_sentiment_detailed(text)
    return result["label"]