const query = `
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
`;

const variables = {
    search: 'lain',
    isAdult: false
};

const url = 'https://graphql.anilist.co';

async function fetchAnimeData() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(error);
    }
}

// Execute the function
fetchAnimeData();