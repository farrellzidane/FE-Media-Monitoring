import requests

url = r"""https://cdn-graphql-v4.kumparan.com/query?operationName=FindStoryBySlug&variables=%7B%22slug%22%3A%22polda-metro-siapkan-4-151-personel-kawal-demo-mahasiswa-di-bundaran-hi-27a313A0gGV%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22ddc650b3799caa2c56a7abb5103bae13c3875955741b4ac257513c1fb4232a0e%22%7D%7D&cache-ttl=10"""

response = requests.get(url)

print(response.status_code)

data = response.json()

print(data.keys())

print()

print(str(data)[:5000])