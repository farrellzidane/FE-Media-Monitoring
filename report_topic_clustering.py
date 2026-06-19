from collections import Counter

from database.database import (
    get_all_articles
)

from sklearn.feature_extraction.text import (
    TfidfVectorizer
)

from sklearn.cluster import KMeans


STOPWORDS = {
    "dan",
    "yang",
    "untuk",
    "dengan",
    "dari",
    "pada",
    "akan",
    "atau",
    "karena",
    "dalam",
    "lebih",
    "soal",
    "usai",
    "atas",
    "hari",
    "baru",
    "indonesia",
    "hasil",
    "setelah",
    "hingga",
    "masih",
    "sudah",
    "sebut",
    "ungkap",
    "jadi",
    "tahun",
    "tim"
}


articles = get_all_articles()

titles = [
    article[0]
    for article in articles
]

if len(titles) < 5:

    print(
        "Need at least 5 articles."
    )

    exit()

vectorizer = TfidfVectorizer(
    max_features=200
)

X = vectorizer.fit_transform(
    titles
)

n_clusters = min(
    5,
    len(titles)
)

model = KMeans(
    n_clusters=n_clusters,
    random_state=42,
    n_init=10
)

model.fit(X)

clusters = {}

for i, label in enumerate(
    model.labels_
):

    if label not in clusters:
        clusters[label] = []

    clusters[label].append(
        titles[i]
    )

feature_names = (
    vectorizer
    .get_feature_names_out()
)

print()
print("=" * 70)
print("TOPIC CLUSTERS")
print("=" * 70)

for cluster_id in sorted(
    clusters.keys()
):

    indices = []

    for idx, lbl in enumerate(
        model.labels_
    ):

        if lbl == cluster_id:
            indices.append(idx)

    cluster_matrix = X[
        indices
    ]

    scores = (
        cluster_matrix
        .sum(axis=0)
        .A1
    )

    top_words = []

    for idx in scores.argsort()[::-1]:

        word = feature_names[idx]

        if word in STOPWORDS:
            continue

        if len(word) < 4:
            continue

        top_words.append(
            word
        )

        if len(top_words) >= 3:
            break

    cluster_name = (
        " / ".join(
            top_words
        )
    )

    print()
    print(
        f"CLUSTER {cluster_id + 1}"
    )

    print(
        f"TOPIC : {cluster_name}"
    )

    print("-" * 70)

    for title in clusters[
        cluster_id
    ][:10]:

        print(
            f"- {title}"
        )

print()
print("=" * 70)