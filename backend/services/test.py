import requests

# GraphQL Query definition
query = '''
query ($id: Int, $page: Int, $perPage: Int, $search: String, $isAdult: Boolean, $genre: String) {
    Page (page: $page, perPage: $perPage) {
        pageInfo {
            currentPage
            hasNextPage
            perPage
        }
        media (id: $id, search: $search, isAdult: $isAdult, genre: $genre) {
            id
            title {
                english
            }
            genres
            isAdult
        }
    }
}
'''

# Variables passed into the GraphQL query
variables = {
    'search': 'AOT',
    'isAdult': False
}

# AniList GraphQL Endpoint
url = 'https://graphql.anilist.co'

# Make the HTTP POST request
response = requests.post(url, json={'query': query, 'variables': variables})

# Parse and print the JSON response
data = response.json()
print(data)