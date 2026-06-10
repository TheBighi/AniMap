import React, { useEffect, useMemo, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "./Stats.css";
import useMediaQuery from "../../hooks/useMediaQuery";
import useWindowSize from "../../hooks/useWindowSize";

function Stats() {
  const [topAnimes, setTopAnimes] = useState([]);
  const [topRegions, setTopRegions] = useState([]);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { width: windowWidth } = useWindowSize();

  const chartDims = useMemo(() => {
    if (!isMobile) {
      return { width: 800, height: 600, yAxisWidth: 90 };
    }

    // Fit inside MobileLayout padding; keep readable touch-friendly sizing
    const safeWidth = Math.max(280, Math.min(420, windowWidth - 24));
    return { width: safeWidth, height: 360, yAxisWidth: 70 };
  }, [isMobile, windowWidth]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "https://d22irt5kiloi89.cloudfront.net/api/stats/top-animes",
        );
        const data = await response.json();
        setTopAnimes(data.topAnimes);

        const regionResponse = await fetch(
          "https://d22irt5kiloi89.cloudfront.net/api/stats/top-regions",
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
          width={chartDims.width}
          height={chartDims.height}
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
              width: chartDims.yAxisWidth,
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
          width={chartDims.width}
          height={chartDims.height}
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
              width: chartDims.yAxisWidth,
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