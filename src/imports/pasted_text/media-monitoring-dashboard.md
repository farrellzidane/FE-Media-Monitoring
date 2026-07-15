Redesign and prototype a polished, responsive web application for an Indonesian Media Monitoring and News Analytics platform.

PRODUCT CONTEXT
The platform aggregates Indonesian news from sources such as Kompas, Detik, CNN Indonesia, CNBC Indonesia, Tempo, Tribun, Liputan6, Kumparan, Viva, Okezone, and Sindonews. It analyzes article volume, categories, keywords, data quality, and sentiment using IndoBERT.

Primary users:
- Communication and public-relations teams
- Media analysts
- Government or corporate monitoring teams
- Researchers

The current dashboard contains useful data but feels like a long, unstructured analytics page. Redesign it to improve information hierarchy, scanning, filtering, comparison, and decision-making.

VISUAL DIRECTION
Create a professional editorial intelligence dashboard—not a generic admin template.

Style:
- Modern, trustworthy, analytical, and information-dense
- Clean light theme with an optional dark-mode variant
- Deep navy primary color
- Muted blue-gray surfaces
- Blue accent for neutral analytics
- Emerald for positive sentiment
- Amber for neutral sentiment
- Red/coral for negative sentiment
- Use color accessibly; never communicate sentiment through color alone
- Subtle borders and shadows
- 12–16 px corner radius
- Strong spacing and alignment
- Avoid excessive gradients, glassmorphism, oversized headings, and decorative illustrations

Typography:
- Use Inter or a similar modern sans-serif
- Clear hierarchy with compact dashboard typography
- Use tabular numbers for metrics
- Ensure long Indonesian headlines remain readable

LAYOUT
Design a responsive desktop dashboard at 1440 px wide, plus tablet and mobile adaptations.

Use:
- Persistent left navigation on desktop
- Collapsible navigation on tablet
- Bottom navigation or drawer on mobile
- Sticky top bar
- Maximum-content-width layout with a 12-column grid
- Cards that align consistently
- Progressive disclosure instead of putting every chart on one long page

LEFT NAVIGATION
Include:
- Overview
- Articles
- Sentiment
- Topics & Keywords
- Sources
- Data Quality
- Export
- Settings

Show the product name “Media Monitoring” and a simple newspaper or radar-style logo.

TOP BAR
Include:
- Global search field: “Search headlines, topics, or sources…”
- Date range selector, default “Last 30 days”
- Source filter
- Category filter
- Refresh button
- Last updated timestamp
- Notification icon
- User/profile menu

OVERVIEW SCREEN
Create the main overview with these sections:

1. Page header
- Title: “Media Intelligence Overview”
- Supporting text: “Monitor coverage, sentiment, and emerging topics across Indonesian news media.”
- Small live-status indicator: “Monitoring active”
- Primary action: “Export report”

2. KPI cards
Display:
- Total Articles: 12,486
- News Sources: 11
- Categories: 8
- Positive Sentiment: 42%
- Negative Sentiment: 21%
- Data Quality Score: 96%

Each card should include:
- Clear label and large value
- Change compared with the previous period
- Small sparkline where appropriate
- Tooltip explaining the metric

3. Main analytics row
- Large “Article Volume” time-series chart
- Toggle between daily and weekly views
- Comparison with previous period
- Smaller “Sentiment Overview” donut or segmented chart
- Positive, Neutral, and Negative totals with both counts and percentages

4. Sentiment trend
Create a multi-series line chart for:
- Positive
- Neutral
- Negative

Include:
- Accessible legend
- Hover tooltip
- Period comparison
- Ability to hide or show individual series
- Annotation for unusual spikes

5. Trending topics
Create a ranked topics panel containing:
- Topic or keyword
- Number of mentions
- Percentage change
- Dominant sentiment
- Small trend visualization

Example topics:
- ekonomi
- pemilu
- rupiah
- teknologi
- kebijakan publik
- energi

Avoid using a decorative word cloud as the primary visualization.

6. Coverage breakdown
Place two coordinated charts side by side:
- Article distribution by category
- Article distribution by news source

Categories:
- General
- Business
- Sports
- Science
- Regional
- International
- Entertainment
- Law

Support clicking chart elements to filter the dashboard.

7. Latest coverage
Create a compact, readable news-feed table with:
- Sentiment badge
- Headline
- Source
- Category
- Published date and time
- Confidence score
- Open-article action
- Save/bookmark action

Use realistic Indonesian news headlines. Clamp long titles to two lines and provide the full title on hover.

8. Alerts and insights
Add a right-side insight panel showing automatically detected findings, for example:
- “Negative coverage increased 18% today”
- “Business coverage is trending above its 30-day average”
- “Three sources are reporting the same developing story”

Use different severity levels and include “View details” actions.

ARTICLES SCREEN
Create a dedicated article-explorer page with:
- Search
- Date range
- Source multi-select
- Category multi-select
- Sentiment filter
- Confidence range
- Sort controls
- Active-filter chips
- Clear-all action
- Results count
- Table/list view toggle
- Selectable rows
- Bulk CSV export
- Pagination

Columns:
- Headline
- Source
- Category
- Sentiment
- Confidence
- Published
- Actions

Include loading, empty, error, and no-search-results states.

SENTIMENT SCREEN
Include:
- Overall sentiment distribution
- Sentiment trend over time
- Sentiment comparison by source
- Sentiment breakdown by category
- Source sentiment ranking
- Explanation of the IndoBERT confidence score
- Drill-down from charts into relevant articles

Use stacked bars for comparison where appropriate. Always show values and labels, not color alone.

DATA QUALITY SCREEN
Show:
- Quality score
- Missing publication dates
- Duplicate headlines
- Old or stale articles
- Sources with crawl issues
- Last successful crawl
- Affected records table
- Recommended corrective actions

Use status levels: Healthy, Needs Attention, and Critical.

INTERACTIONS
Prototype:
- Sidebar navigation
- Global filters updating all dashboard modules
- Chart hover tooltips
- Chart-to-table filtering
- Opening an article-detail drawer
- Saving an article
- Exporting filtered CSV
- Resetting filters
- Switching light and dark modes
- Responsive navigation behavior

ARTICLE DETAIL DRAWER
When an article is selected, open a right-side drawer with:
- Full headline
- Source and publication time
- Category
- Sentiment label
- Confidence score
- Article excerpt
- Original article link
- Related coverage
- “Save” and “Copy link” actions

COMPONENT SYSTEM
Create reusable components and variants for:
- Navigation items
- Buttons
- Icon buttons
- KPI cards
- Filter controls
- Select menus
- Date picker
- Search input
- Status and sentiment badges
- Chart cards
- Data tables
- News-feed items
- Insight alerts
- Tooltips
- Pagination
- Empty states
- Skeleton loaders
- Error banners
- Article-detail drawer

Define variables for:
- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Light and dark themes

ACCESSIBILITY
- Meet WCAG AA contrast
- Use at least 14 px for primary interface text
- Provide visible keyboard focus states
- Use 44 px minimum interactive targets on mobile
- Do not rely exclusively on red and green
- Include icons or text labels with sentiment colors
- Make charts readable for color-vision deficiencies

DELIVERABLE
Produce a cohesive, production-ready high-fidelity design rather than a loose concept. Show:
- Desktop overview
- Desktop article explorer
- Desktop sentiment analytics
- Desktop data quality page
- Article-detail drawer
- Mobile overview
- Component library and design tokens

Keep the dashboard practical for implementation with Streamlit or a future React frontend. Prioritize clarity, fast scanning, filtering, and actionable media insights.