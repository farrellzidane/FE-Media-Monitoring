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

from services.sentiment_service import analyze_sentiment

print("=" * 50)
print(analyze_sentiment("IHSG menguat tajam setelah Bank Indonesia menurunkan suku bunga"))
print("=" * 50)

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

st.sidebar.header("📰 Monitored News Sources")

sources = sorted(
    df["source"].unique()
)

for source in sources:
    st.sidebar.success(source)

st.sidebar.divider()

st.sidebar.subheader("📊 Summary")

st.sidebar.metric(
    "Articles",
    len(df)
)

st.sidebar.metric(
    "Sources",
    df["source"].nunique()
)

st.sidebar.metric(
    "Categories",
    df["category"].nunique()
)

st.sidebar.metric(
    "Latest",
    df["published_date"].max()
)

st.markdown(
    "News Aggregation & Analytics"
)

st.caption(
    "Powered by IndoBERT • Updated Automatically • Last 30 Days"
)

# ======================================
# METRICS
# ======================================

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        "📰 Total Articles",
        len(df)
    )

with col2:
    st.metric(
        "📰 News Sources",
        df["source"].nunique()
    )

with col3:
    st.metric(
        "📂 Categories",
        df["category"].nunique()
    )

with col4:

    latest = df["published_date"].max()

    st.metric(
        "🕒 Latest News",
        latest
    )

st.divider()

st.subheader("📰 Latest Headlines")

latest_news = (
    df.sort_values(
        "published_date",
        ascending=False
    )
    .head(10)
)

latest_news = latest_news.rename(
    columns={
        "published_date": "Date",
        "source": "Source",
        "category": "Category",
        "title": "Headline"
    }
)

st.dataframe(
    latest_news[
        [
            "Date",
            "Source",
            "Category",
            "Headline"
        ]
    ],
    use_container_width=True,
    hide_index=True
)

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

fig = px.line(
    daily_df,
    x="Date",
    y="Articles",
    markers=True
)

fig.update_layout(
    template="plotly_dark",
    height=450,
    xaxis_title="Date",
    yaxis_title="Articles"
)

st.plotly_chart(
    fig,
    use_container_width=True
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

st.subheader("📊 Category Distribution")

important_categories = [
    "General",
    "Business",
    "Sports",
    "Science",
    "Regional",
    "International",
    "Entertainment",
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

category_counts = category_counts.sort_values(
    ascending=False
)

category_chart = category_counts.reset_index()
category_chart.columns = [
    "Category",
    "Articles"
]

fig = px.bar(
    category_chart,
    x="Category",
    y="Articles",
    color="Articles",
    color_continuous_scale="Blues"
)

fig.update_layout(
    template="plotly_dark",
    height=450,
    coloraxis_showscale=False
)

st.plotly_chart(
    fig,
    use_container_width=True
)

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

category_df = category_df.sort_values(
    "Negative",
    ascending=False
)

st.dataframe(
    category_df,
    use_container_width=True
)



# ======================================
# SOURCE DISTRIBUTION
# ======================================

st.subheader("📰 Source Distribution")

source_counts = (
    df["source"]
    .value_counts()
)

fig = px.bar(
    x=source_counts.index,
    y=source_counts.values,
    labels={
        "x": "Source",
        "y": "Articles"
    },
    color=source_counts.values,
    color_continuous_scale="Blues"
)

fig.update_layout(
    template="plotly_dark",
    height=450,
    coloraxis_showscale=False
)

st.plotly_chart(
    fig,
    use_container_width=True
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

fig = px.bar(
    ranking_df,
    x="source",
    y="score",
    color="score",
    color_continuous_scale="RdYlGn"
)

fig.update_layout(
    template="plotly_dark",
    height=450,
    coloraxis_showscale=False,
    xaxis_title="Source",
    yaxis_title="Score"
)

st.plotly_chart(
    fig,
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
st.write(sentiment_df)

# table
st.dataframe(
    sentiment_df,
    use_container_width=True
)

# comparison chart
fig = px.bar(
    sentiment_df,
    x="Source",
    y=[
        "Positive",
        "Neutral",
        "Negative"
    ],
    barmode="group",
    template="plotly_dark"
)

st.plotly_chart(
    fig,
    use_container_width=True
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

fig = px.bar(
    keyword_df,
    x="Keyword",
    y="Count",
    color="Count",
    color_continuous_scale="Viridis"
)

fig.update_layout(
    template="plotly_dark",
    height=450,
    coloraxis_showscale=False
)

st.plotly_chart(
    fig,
    use_container_width=True
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