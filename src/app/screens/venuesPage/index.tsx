import React, { useEffect, useRef } from "react";
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

  // Use a ref to cache the service instance so it isn't recreated on every single render
  const venueServiceRef = useRef(new VenueService());

  useEffect(() => {
    // 1. Create an AbortController to cancel older, lagging requests
    const controller = new AbortController();
    let isMounted = true;

    const fetchVenues = async () => {
      dispatch(setLoading(true));
      try {
        // 2. Targets your actual service method name matching your API file
        const result = await venueServiceRef.current.getAllVenues({
          page,
          limit: LIMIT,
          sort,
          search,
        });

        // 3. Only update state if the component hasn't unmounted or switched configurations
        if (isMounted) {
          dispatch(setVenues(result));
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.log("Error fetching venues:", err);
        }
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    fetchVenues();

    // 4. Cleanup function cancels the request if page/sort/search change again instantly
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [dispatch, page, sort, search]); // Keeps tabs on updates safely

  const hasNextPage = venues.length === LIMIT;

  return (
    <div className="venues-page">
      <div className="venues-toolbar">
        <SearchBar />
        <FilterBar />
      </div>

      {loading ? (
        <Box
          className="loading-text"
          style={{ padding: "20px", textAlign: "center" }}
        >
          Loading Venues...
        </Box>
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
          disabled={page === 1 || loading}
          onClick={() => dispatch(setPage(page - 1))}
        >
          Prev
        </button>
        <span>{page}</span>
        <button
          disabled={!hasNextPage || loading}
          onClick={() => dispatch(setPage(page + 1))}
        >
          Next
        </button>
      </div>

      <VenueMap />
    </div>
  );
}
