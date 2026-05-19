const BackError = require('../utils/error');

const url = 'https://graphql.anilist.co';

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
                romaji
            }
            genres
            isAdult
        }
    }
}
`;


const fetchAnimeData= async (req, res, next) => {
    try {
        const search = req.body.search

        const variables = {
            search: search,
            isAdult: false
        };

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
        const animes = data.data.Page.media
        const names = animes.map(a => a.title.english || a.title.romaji);

        res.status(201).json({animes: names})

    } catch (err) {
        next(new BackError(500, err, "INTERNAL_SERVER_ERROR"))
    }
};

module.exports = {fetchAnimeData}