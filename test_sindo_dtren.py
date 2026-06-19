import requests

url = (
    "https://www.sindonews.com/dtren"
    "?id=1932"
    "&topik=harga-bbm"
)

r = requests.get(
    url,
    timeout=20
)

print(r.status_code)
print(r.text[:1000])