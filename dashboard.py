import sqlite3
import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px

from services.analytics_service import (
    get_source_authority_map
)

from services.analytics_service import (
    get_sentiment_by_source
)

from services.analytics_service import (
    get_source_ranking
)

from services.topic_sentiment_service import (
    get_topic_sentiments
)

from services.analytics_service import (
    get_daily_volume,
    get_top_keywords,
    get_topic_discovery,
    get_sentiment_trend,
    get_sentiment_by_category,
    get_media_framing_analysis,
    get_latest_articles
)


from services.data_quality_service import (
    get_data_quality_report
)

DATABASE_FILE = "data/articles.db"

st.set_page_config(
    page_title="Media Monitoring Dashboard",
    layout="wide"
)

@st.cache_data
def load_main_df():
    connection = sqlite3.connect(DATABASE_FILE)

    query = """
    SELECT
        title,
        source,
        category,
        published_date,
        crawl_date,
        url
    FROM articles
    ORDER BY published_date DESC
    """

    df = pd.read_sql_query(query, connection)

    connection.close()

    print("=" * 50)
    print("ROWS:", len(df))
    print(df["published_date"].min())
    print(df["published_date"].max())
    print(df.head())
    print("=" * 50)

    return df

@st.cache_data(ttl=600)
def load_cached_analytics():
    return {
        "quality": get_data_quality_report(),
        "daily_volume": get_daily_volume(),
        "trend": get_sentiment_trend(),
        "category_sentiment": get_sentiment_by_category(),
        "framing": get_media_framing_analysis(),
        "authority": get_source_authority_map(),
        "ranking": get_source_ranking(),
        "source_sentiment": get_sentiment_by_source(),
        "keywords": get_top_keywords(15),
        "latest_articles": get_latest_articles(15)
    }


# ======================================
# LOAD DATA
# ======================================
df = load_main_df()
analytics = load_cached_analytics()

# ======================================
# HEADER
# ======================================

st.title(
    "📰 Media Monitoring Dashboard"
)

st.markdown(
    "News Aggregation & Analytics"
)

# ======================================
# METRICS
# ======================================

col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        "Total Articles",
        len(df)
    )

with col2:
    st.metric(
        "Sources",
        df["source"].nunique()
    )

with col3:
    st.metric(
        "Categories",
        df["category"].nunique()
    )

st.divider()

# ======================================
# DATA QUALITY
# ======================================

st.subheader(
    "🛡 Data Quality"
)

quality = (
    get_data_quality_report()
)

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        "Quality Score",
        quality["quality_score"]
    )

with col2:
    st.metric(
        "Missing Dates",
        quality["missing_dates"]
    )

with col3:
    st.metric(
        "Duplicates",
        quality["duplicate_titles"]
    )

with col4:
    st.metric(
        "Old Articles",
        quality["old_articles"]
    )

st.divider()

# ======================================
# DAILY VOLUME
# ======================================

st.subheader(
    "📈 Daily Article Volume"
)

daily_volume = get_daily_volume()

daily_df = pd.DataFrame(
    {
        "Date": list(
            daily_volume.keys()
        ),
        "Articles": list(
            daily_volume.values()
        )
    }
)

st.line_chart(
    daily_df.set_index(
        "Date"
    )
)

st.divider()

# ======================================
# SENTIMENT TREND
# ======================================

st.subheader("📈 News Sentiment Trend")

trend = get_sentiment_trend()

trend_rows = []

for date, stats in trend.items():
    trend_rows.append({
        "Date": date,
        "Positive": stats["positive"],
        "Neutral": stats["neutral"],
        "Negative": stats["negative"]
    })

trend_df = pd.DataFrame(trend_rows)

if not trend_df.empty:

    fig = go.Figure()

    fig.add_trace(go.Scatter(
    x=trend_df["Date"],
    y=trend_df["Positive"],
    mode="lines+markers",
    name="Positive",
    line=dict(color="#00C853", width=4, shape="spline"),
    fill="tozeroy"
))

    fig.add_trace(go.Scatter(
    x=trend_df["Date"],
    y=trend_df["Neutral"],
    mode="lines+markers",
    name="Neutral",
    line=dict(color="#FFB300", width=4, shape="spline")
))

    fig.add_trace(go.Scatter(
    x=trend_df["Date"],
    y=trend_df["Negative"],
    mode="lines+markers",
    name="Negative",
    line=dict(color="#FF5252", width=4, shape="spline")
))

    fig.update_layout(
    template="plotly_dark",
    height=500,
    hovermode="x unified",
    xaxis_title="Date",
    yaxis_title="Articles",
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="right",
        x=1
    )
)

    st.plotly_chart(
        fig,
        use_container_width=True
    )

# ======================================
# CATEGORY DISTRIBUTION
# ======================================

st.subheader(
    "📊 Category Distribution"
)

important_categories = [
    "General",
    "Business",
    "Sports",
    "International",
    "Regional",
    "Entertainment",
    "Science",
    "Law"
]

category_counts = (
    df["category"]
    .value_counts()
)

category_counts = category_counts[
    category_counts.index.isin(
        important_categories
    )
]

st.bar_chart(category_counts)

# ======================================
# CATEGORY SENTIMENT BREAKDOWN
# ======================================

st.subheader("📊 Category Sentiment Breakdown")

category_sentiment = get_sentiment_by_category()

category_rows = []

for category, stats in category_sentiment.items():
    category_rows.append({
        "Category": category,
        "Positive": stats["positive"],
        "Negative": stats["negative"],
        "Neutral": stats["neutral"]
    })

category_df = pd.DataFrame(category_rows)

category_df["Total"] = (
    category_df["Positive"]
    + category_df["Negative"]
    + category_df["Neutral"]
)

category_df = category_df[
    category_df["Total"] >= 5
]

category_df = category_df.drop(
    columns="Total"
)

st.dataframe(
    category_df,
    use_container_width=True
)

chart_df = category_df.set_index("Category")

st.bar_chart(chart_df)

# ======================================
# CATEGORY SENTIMENT INSIGHTS
# ======================================

st.subheader("🧠 Category Sentiment Insights")

categories = sorted(
    category_sentiment.items(),
    key=lambda x: sum(x[1].values()),
    reverse=True
)

filtered_categories = []

for category, stats in categories:

    total = (
        stats["positive"]
        + stats["negative"]
        + stats["neutral"]
    )

    if total < 5:
        continue

    negative_pct = (
        stats["negative"] / total * 100
    )

    if total >= 10:
        filtered_categories.append((category, stats))

    elif total >= 5 and negative_pct >= 70:
        filtered_categories.append((category, stats))

for i in range(0, len(filtered_categories), 3):

    cols = st.columns(3)

    for j in range(3):

        if i + j >= len(filtered_categories):
            break

        category, stats = filtered_categories[i + j]

        total = (
            stats["positive"]
            + stats["negative"]
            + stats["neutral"]
        )

        positive_pct = round(
            stats["positive"] / total * 100,
            1
        )

        negative_pct = round(
            stats["negative"] / total * 100,
            1
        )

        neutral_pct = round(
            stats["neutral"] / total * 100,
            1
        )

        with cols[j]:

            with st.container(border=True):

                st.markdown(
                    f"### {category} ({total})"
                )

                st.write(
                    f"🟢 Positive: {positive_pct}%"
                )

                st.write(
                    f"🔴 Negative: {negative_pct}%"
                )

                st.write(
                    f"⚪ Neutral: {neutral_pct}%"
                )

                if negative_pct >= 50:
                    st.error("High Negative")

                elif positive_pct >= 60:
                    st.success("High Positive")

                else:
                    st.info("Mostly Neutral")
#==============
# Source Authority Map
#==============

st.subheader("🫧 Source Authority Map")

authority_data = get_source_authority_map()

authority_df = pd.DataFrame(authority_data)

if not authority_df.empty:


    authority_df["tier_jitter"] = authority_df["tier"].astype(float)

    tier_counts = {}

    for i in authority_df.index:
        tier = authority_df.loc[i, "tier"]

        if tier not in tier_counts:
            tier_counts[tier] = 0

        offset = (tier_counts[tier] - 2) * 0.12
        authority_df.loc[i, "tier_jitter"] += offset

        tier_counts[tier] += 1

    fig = px.scatter(
        authority_df,
        x="tier_jitter",
        y="score",
        size="volume",
        color="sentiment",
        hover_name="source",
        size_max=60,
        color_discrete_map={
            "Positive": "#00cc96",
            "Neutral": "#FFB300",
            "Negative": "#ff4b4b"
        }
    )
    fig.update_layout(
        template="plotly_dark",
        height=700,
        xaxis_title="Authority Tier",
        yaxis_title="Sentiment Score",
        xaxis=dict(
            tickmode="array",
            tickvals=[1, 2, 3],
            ticktext=["Tier 1", "Tier 2", "Tier 3"]
        )
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )

# ======================================
# SOURCE DISTRIBUTION
# ======================================

st.subheader(
    "📰 Source Distribution"
)

source_counts = (
    df["source"]
    .value_counts()
)

st.bar_chart(
    source_counts
)

# ======================================
# SOURCE RANKING
# ======================================

st.subheader("🏆 Source Sentiment Ranking")

ranking = get_source_ranking()

ranking_df = pd.DataFrame(ranking)

st.dataframe(
    ranking_df,
    use_container_width=True
)

# ======================================
# SENTIMENT BY SOURCE
# ======================================

st.subheader("😊 Sentiment Comparison by Source")

sentiment_data = get_sentiment_by_source()

sentiment_rows = []

for source, stats in sentiment_data.items():
    sentiment_rows.append({
        "Source": source,
        "Positive": stats["positive"],
        "Negative": stats["negative"],
        "Neutral": stats["neutral"]
    })

sentiment_df = pd.DataFrame(sentiment_rows)

# table
st.dataframe(
    sentiment_df,
    use_container_width=True
)

# comparison chart
chart_df = sentiment_df.set_index("Source")

st.bar_chart(chart_df)

# ======================================
# TOPIC SENTIMENT
# ======================================

st.subheader("🧠 Topic Sentiment Analysis")

topics = get_topic_sentiments()

for topic in topics:

    with st.expander(
        f"Topic {topic['topic_id']} ({topic['article_count']} articles)"
    ):

        st.write(
            "Keywords: " +
            ", ".join(topic["keywords"])
        )

        col1, col2, col3 = st.columns(3)

        col1.metric(
            "Positive",
            topic["positive"]
        )

        col2.metric(
            "Negative",
            topic["negative"]
        )

        col3.metric(
            "Neutral",
            topic["neutral"]
        )

# ======================================
# TOP KEYWORDS
# ======================================

st.subheader(
    "🔥 Top Keywords"
)

keyword_df = pd.DataFrame(
    get_top_keywords(15),
    columns=[
        "Keyword",
        "Count"
    ]
)

st.dataframe(
    keyword_df,
    use_container_width=True
)

# ======================================
# TOPIC DISCOVERY
# ======================================

st.subheader(
    "🧠 Topic Discovery"
)

topics = get_topic_discovery()

for topic in topics:

    with st.expander(
        f"Topic {topic['topic_id']} "
        f"({topic['article_count']} articles)"
    ):

        st.write(
            "**Keywords:** "
            + ", ".join(
                topic["keywords"]
            )
        )

        for title in topic[
            "titles"
        ]:

            st.write(
                f"• {title}"
            )

# ======================================
# LIVE NEWS FEED
# ======================================

st.divider()

st.subheader("📰 Live News Feed")

latest_articles = get_latest_articles(15)

for article in latest_articles:

    sentiment = article["sentiment"]

    if sentiment == "Positive":
        badge = "🟢"
    elif sentiment == "Negative":
        badge = "🔴"
    else:
        badge = "⚪"

    st.markdown(
        f"""
**{badge} {sentiment} | {article['source']} | {article['published_date']}**  
{article['title']}
"""
    )

# ======================================
# FILTERS
# ======================================

st.subheader(
    "🔎 Filter Articles"
)

col1, col2, col3 = st.columns(3)

with col1:

    available_dates = sorted(
        [
            date
            for date in df[
                "published_date"
            ]
            .dropna()
            .unique()
            if date
        ],
        reverse=True
    )

    date_filter = st.selectbox(
        "Published Date",
        ["All"] + available_dates
    )

with col2:

    source_filter = st.selectbox(
        "Source",
        ["All"]
        + sorted(
            df["source"]
            .unique()
            .tolist()
        )
    )

with col3:

    valid_categories = (
    df["category"]
    .value_counts()
)

valid_categories = (
    valid_categories[
        valid_categories >= 5
    ]
    .index
    .tolist()
)

category_filter = st.selectbox(
    "Category",
    ["All"] + sorted(valid_categories)
)

keyword = st.text_input(
    "Search Keyword"
)

# ======================================
# APPLY FILTERS
# ======================================

filtered_df = df.copy()

if date_filter != "All":

    filtered_df = filtered_df[
        filtered_df[
            "published_date"
        ] == date_filter
    ]

if source_filter != "All":

    filtered_df = filtered_df[
        filtered_df[
            "source"
        ] == source_filter
    ]

if category_filter != "All":

    filtered_df = filtered_df[
        filtered_df[
            "category"
        ] == category_filter
    ]

if keyword:

    filtered_df = filtered_df[
        filtered_df[
            "title"
        ].str.contains(
            keyword,
            case=False,
            na=False
        )
    ]

# ======================================
# DOWNLOAD CSV
# ======================================

st.download_button(
    label="⬇ Download Filtered CSV",
    data=filtered_df.to_csv(
        index=False
    ),
    file_name="filtered_articles.csv",
    mime="text/csv"
)

# ======================================
# ARTICLE TABLE
# ======================================

st.subheader(
    f"📄 Articles ({len(filtered_df)})"
)

st.dataframe(
    filtered_df,
    use_container_width=True
)

