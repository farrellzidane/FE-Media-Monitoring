from playwright.sync_api import sync_playwright

with sync_playwright() as p:

    browser = p.chromium.launch(
        headless=False
    )

    page = browser.new_page()

    page.goto(
        "https://www.sindonews.com",
        wait_until="networkidle",
        timeout=60000
    )

    print(page.title())

    links = page.locator("a").evaluate_all(
        """
        elements => elements
            .map(e => e.href)
            .filter(h => h.includes('/read/'))
            .slice(0, 20)
        """
    )

    print()
    print("FOUND:", len(links))
    print()

    for link in links[:10]:
        print(link)

    input("\nPress Enter...")
    browser.close()