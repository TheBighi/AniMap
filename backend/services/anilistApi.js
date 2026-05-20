const BackError = require('../utils/error');

const url = 'https://graphql.anilist.co';

const cache = new Map();

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

const fetchAnimeData = async (queryVar) => {
    try {
        const key = queryVar?.toLowerCase().trim();

        if (cache.has(key)) {
            return cache.get(key);
        }

        const variables = {
            search: queryVar,
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
        const animes = data.data.Page.media;
        const names = animes.map(a => a.title.english || a.title.romaji);

        cache.set(key, names);

        return names;

    } catch (err) {
        throw new BackError(500, err.message, "INTERNAL_SERVER_ERROR"); // ✅ err.message
    }
};

const animeService = async (req, res, next) => {
    try {
        const search = req.query.search;
        const animes = await fetchAnimeData(search);

        res.status(200).json({ animes });

    } catch (err) {
        next(new BackError(500, err.message, "INTERNAL_SERVER_ERROR"));
    }
};

module.exports = { fetchAnimeData, animeService };