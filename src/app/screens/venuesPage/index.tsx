import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import VenueCard from "./components/VenueCard";
import VenueMap from "./components/VenueMap";
import { setVenues, setPage, setLoading } from "./slice";
import {
  retrieveVenues,
  retrieveSearch,
  retrieveSort,
  retrievePage,
  retrieveLoading,
} from "./selector";
import VenueService from "../../services/VenueService";
import { Venue } from "../../lib/types/venue";
import "../../../css/venuesPage.css";

const LIMIT = 4;

export default function VenuesPage() {
  const dispatch = useDispatch();
  const venues = useSelector(retrieveVenues);
  const search = useSelector(retrieveSearch);
  const sort = useSelector(retrieveSort);
  const page = useSelector(retrievePage);
  const loading = useSelector(retrieveLoading);

  useEffect(() => {
    const fetchVenues = async () => {
      dispatch(setLoading(true));
      try {
        const venueService = new VenueService();
        const result = await venueService.getAllVenues({
          page,
          limit: LIMIT,
          sort,
          search,
        });
        dispatch(setVenues(result));
      } catch (err) {
        console.log("Error fetching venues:", err);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchVenues();
  }, [dispatch, page, sort, search]);

  const hasNextPage = venues.length === LIMIT;

  return (
    <div className="venues-page">
      <div className="venues-toolbar">
        <SearchBar />
        <FilterBar />
      </div>

      {loading ? (
        <Box className="loading-text">Loading...</Box>
      ) : venues.length !== 0 ? (
        <div className="venues-grid">
          {venues.map((venue: Venue) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      ) : (
        <Box className="no-data">No venues found.</Box>
      )}

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => dispatch(setPage(page - 1))}
        >
          Prev
        </button>
        <span>{page}</span>
        <button
          disabled={!hasNextPage}
          onClick={() => dispatch(setPage(page + 1))}
        >
          Next
        </button>
      </div>

      <VenueMap />
    </div>
  );
}
