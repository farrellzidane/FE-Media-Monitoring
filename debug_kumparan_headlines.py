import requests

url = (
    "https://cdn-graphql-v4.kumparan.com/query"
    "?operationName=FindAllActiveHeadlines"
    "&variables=%7B%22size%22%3A9%2C%22placement%22%3A%22HOMEPAGE%22%2C%22cursor%22%3A%221%22%7D"
    "&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22eb503c3f2ef2f7f7ffb36ce34b1c928bdefdc87e6f178527f388ce4b5e3ceb16%22%7D%7D"
)

response = requests.get(url)

print(response.status_code)

data = response.json()

print(data.keys())

print(data)