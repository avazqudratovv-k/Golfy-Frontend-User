import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import HeroPhoto from "./components/HeroPhoto";
import Statistics from "./components/Statistics";
import TopVenues from "./components/TopVenues";
import RecentReviews from "./components/RecentReviews";
import { setTopVenues, setStats, setRecentReviews } from "./slice";
import VenueService from "../../services/VenueService";
import ReviewService from "../../services/ReviewService";
import "../../../css/homePage.css";

export default function HomePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const venueService = new VenueService();
        const reviewService = new ReviewService();
        const [topVenues, stats, recentReviews] = await Promise.all([
          venueService.getTopVenues(),
          venueService.getStats(),
          reviewService.getRecentReviews(4),
        ]);
        dispatch(setTopVenues(topVenues));
        dispatch(setStats(stats));
        dispatch(setRecentReviews(recentReviews));
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
      <RecentReviews />
    </div>
  );
}
