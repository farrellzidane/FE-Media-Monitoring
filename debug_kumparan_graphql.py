import requests

url = (
    "https://cdn-graphql-v4.kumparan.com/query"
)

params = {
    "operationName":
    "FindAllActiveHeadlines"
}

response = requests.get(
    url,
    params=params
)

print(
    response.status_code
)

print(
    response.text[:1000]
)