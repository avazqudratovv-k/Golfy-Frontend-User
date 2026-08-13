import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { Link } from "react-router-dom";
import { retrieveTopVenues } from "../selector";
import { Venue } from "../../../lib/types/venue";
import { serverApi } from "../../../lib/config";

const topVenuesRetriever = createSelector(retrieveTopVenues, (topVenues) => ({
  topVenues,
}));

export default function TopVenues() {
  const { topVenues } = useSelector(topVenuesRetriever);

  return (
    <div className="top-venues-frame">
      <Container>
        <Stack className="section">
          <Box className="category-title">Top Venues</Box>
          <Stack className="cards-frame" direction="row" spacing={2}>
            {topVenues.length !== 0 ? (
              topVenues.map((venue: Venue) => {
                const imagePath = venue.venueImages?.[0]
                  ? `${serverApi}/${venue.venueImages[0]}`
                  : "/img/venue-placeholder.jpg";
                return (
                  <Card key={venue._id} className="card">
                    <Link to="/venues">
                      <CardMedia
                        component="img"
                        height="220"
                        image={imagePath}
                        alt={venue.venueName}
                      />
                    </Link>
                    <CardContent>
                      <Typography className="title">
                        {venue.venueName}
                      </Typography>
                      <Typography className="location">
                        {venue.venueLocation}
                      </Typography>
                      <Typography className="price">
                        ${venue.pricePerHour}/hr
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Box className="no-data">No venues available yet!</Box>
            )}
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
