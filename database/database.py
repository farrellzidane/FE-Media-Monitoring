import sqlite3

DATABASE_FILE = "data/articles.db"

def create_database():
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            url TEXT UNIQUE,
            source TEXT,
            category TEXT,
            published_date TEXT,
            crawl_date TEXT,
            content TEXT
        )
    """)

    connection.commit()
    connection.close()


def clear_articles():
    connection = sqlite3.connect(DATABASE_FILE)
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM articles")
    before = cursor.fetchone()[0]
    print(f"Before delete: {before}")

    cursor.execute("DELETE FROM articles")
    connection.commit()

    cursor.execute("SELECT COUNT(*) FROM articles")
    after = cursor.fetchone()[0]
    print(f"After delete: {after}")

    connection.close()

def save_articles_to_database(
    articles
):
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    for article in articles:
        cursor.execute(
            """
            INSERT OR REPLACE INTO articles (
                title,
                url,
                source,
                category,
                published_date,
                crawl_date,
                content
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                article.title,
                article.url,
                article.source,
                article.category,
                article.published_date,
                article.crawl_date,
                article.content
            )
        )

    connection.commit()
    connection.close()

    print()
    print(
        f"Saved to {DATABASE_FILE}"
    )


def search_articles(
    keyword
):
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            title,
            source,
            category,
            published_date,
            crawl_date,
            url
        FROM articles
        WHERE
            LOWER(title) LIKE LOWER(?)
            OR LOWER(content) LIKE LOWER(?)
        ORDER BY published_date DESC
        """,
        (
            f"%{keyword}%",
            f"%{keyword}%"
        )
    )

    results = cursor.fetchall()

    connection.close()

    return results


def get_all_articles():
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
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
    )

    results = cursor.fetchall()

    connection.close()

    return results


def get_articles_by_source(
    source
):
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            title,
            source,
            category,
            published_date,
            crawl_date,
            url
        FROM articles
        WHERE LOWER(source) = LOWER(?)
        ORDER BY published_date DESC
        """,
        (source,)
    )

    results = cursor.fetchall()

    connection.close()

    return results


def get_articles_by_category(
    category
):
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            title,
            source,
            category,
            published_date,
            crawl_date,
            url
        FROM articles
        WHERE LOWER(category) = LOWER(?)
        ORDER BY published_date DESC
        """,
        (category,)
    )

    results = cursor.fetchall()

    connection.close()

    return results


def get_articles_by_date(
    date
):
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            title,
            source,
            category,
            published_date,
            crawl_date,
            url
        FROM articles
        WHERE published_date = ?
        ORDER BY published_date DESC
        """,
        (date,)
    )

    results = cursor.fetchall()

    connection.close()

    return results