import React, { useEffect, useRef, useContext, useState } from "react";

function Stats() {
    const [topAnimes, setTopAnimes] = useState([]);
    const [topRegions, setTopRegions] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3006/api/stats/top-animes');
                const data = await response.json();
                setTopAnimes(data.topAnimes);
                console.log("Top Animes:", data.topAnimes);
                const regionResponse = await fetch('http://localhost:3006/api/stats/top-regions');
                const regionData = await regionResponse.json();
                setTopRegions(regionData.animeCountByRegion);
                console.log("Top Regions:", regionData.animeCountByRegion);
            } catch (error) {
                console.error("Error fetching top animes:", error);
            }
        };

        fetchStats();
    }, []);




    return (
        <>
            <h1>STATS PAGE</h1>
        </>
    )
}

export default Stats