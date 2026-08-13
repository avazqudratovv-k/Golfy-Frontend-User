import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Statistics from "./components/Statistics";
import TopVenues from "./components/TopVenues";
import { setTopVenues, setStats } from "./slice";
import VenueService from "../../services/VenueService";
import "../../../css/homePage.css";
import HeroPhoto from "./components/HeroPhoto";

export default function HomePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const venueService = new VenueService();
        const [topVenues, stats] = await Promise.all([
          venueService.getTopVenues(),
          venueService.getStats(),
        ]);
        dispatch(setTopVenues(topVenues));
        dispatch(setStats(stats));
      } catch (err) {
        console.log("Error fetching homepage data:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="home-page">
      <HeroPhoto />
      <Statistics />
      <TopVenues />
    </div>
  );
}
