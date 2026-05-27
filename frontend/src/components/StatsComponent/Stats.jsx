import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "./Stats.css";

function Stats() {
  const [topAnimes, setTopAnimes] = useState([]);
  const [topRegions, setTopRegions] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3006/api/stats/top-animes",
        );
        const data = await response.json();
        setTopAnimes(data.topAnimes);

        const regionResponse = await fetch(
          "http://localhost:3006/api/stats/top-regions",
        );
        const regionData = await regionResponse.json();
        setTopRegions(regionData.animeCountByRegion);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="mainContent">
      <section className="titleSection">
        <div className="titleBar"></div>
        <h1 className="pageTitle">STATISTICS</h1>
      </section>

      <div className="chartWrapper">
        <h2 className="chartTitle">Top Anime</h2>
        <BarChart
          layout="horizontal"
          width={800}
          height={600}
          series={[
            {
              data: topAnimes.map((anime) => anime.count),
              label: "Pins count",
              color: "#B0C9C5",
            },
          ]}
          yAxis={[
            {
              scaleType: "band",
              data: topAnimes.map((anime) => anime.animeName),
              width: 90,
            },
          ]}
          xAxis={[
            {
              tickMinStep: 1,
            },
          ]}
        />
      </div>

      <div className="chartWrapper">
        <h2 className="chartTitle">Top Regions</h2>
        <BarChart
          layout="horizontal"
          width={800}
          height={600}
          series={[
            {
              data: topRegions.map((region) => region.count),
              label: "Pins count",
              color: "#AAB5C4",
            },
          ]}
          yAxis={[
            {
              scaleType: "band",
              data: topRegions.map((region) => region.Region.name),
              width: 90,
            },
          ]}
          xAxis={[
            {
              tickMinStep: 1,
            },
          ]}
        />
      </div>
    </main>
  );
}

export default Stats;