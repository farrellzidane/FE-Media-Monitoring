from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

positive_samples = [
    "pasar saham naik tajam",
    "harga saham melonjak",
    "ihsg menguat signifikan",
    "tim menang besar",
    "laba perusahaan meningkat",
    "ekonomi tumbuh pesat",
    "perusahaan cetak profit tinggi"
]

negative_samples = [
    "pasar saham anjlok tajam",
    "harga saham jatuh drastis",
    "ihsg melemah signifikan",
    "korupsi besar",
    "perang dunia",
    "banjir besar",
    "krisis ekonomi"
]

neutral_samples = [
    "rapat pemerintah",
    "kebijakan baru",
    "konferensi pers",
    "diskusi nasional",
    "pertemuan resmi",
    "menteri hadir dalam acara"
]

test_headlines = [
    "Timnas Indonesia menang telak",
    "Korupsi besar terungkap di kementerian",
    "Pemerintah bahas kebijakan baru",
    "Harga saham anjlok hari ini"
]

positive_embedding = model.encode(
    positive_samples,
    convert_to_tensor=True
)

negative_embedding = model.encode(
    negative_samples,
    convert_to_tensor=True
)

neutral_embedding = model.encode(
    neutral_samples,
    convert_to_tensor=True
)

for headline in test_headlines:

    headline_embedding = model.encode(
        headline,
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

    print("=" * 60)
    print("Headline:", headline)
    print("Positive:", round(positive_score, 4))
    print("Negative:", round(negative_score, 4))
    print("Neutral :", round(neutral_score, 4))