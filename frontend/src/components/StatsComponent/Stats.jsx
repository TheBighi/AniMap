import React, { useEffect, useRef, useContext, useState } from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

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
                <BarChart
                    layout="horizontal"
                    width={600}
                    height={400}
                    series={[
                        {
                            data: topAnimes.map(anime => anime.count),
                            label: 'Pins count',
                            color: '#B0C9C5',
                        },
                    ]}
                    yAxis={[{
                        scaleType: 'band',
                        data: topAnimes.map(anime => anime.animeName),
                        width: 90,
                    }]}
                    xAxis={[{
                        tickMinStep: 1,
                    }]}
                />
                <BarChart
                    layout="horizontal"
                    width={600}
                    height={400}
                    series={[
                        {
                            data: topRegions.map(region => region.count),
                            label: 'Pins count',
                            color: '#AAB5C4',
                        },
                    ]}
                    yAxis={[{
                        scaleType: 'band',
                        data: topRegions.map(region => region.Region.name),
                        width: 90,
                    }]}
                    xAxis={[{
                        tickMinStep: 1,
                    }]}
                />
        </>
    )
}

export default Stats