import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { retrieveRecentReviews } from "../selector";
import { Review } from "../../../lib/types/review";

const recentReviewsRetriever = createSelector(
  retrieveRecentReviews,
  (recentReviews) => ({
    recentReviews,
  }),
);

export default function RecentReviews() {
  const { recentReviews } = useSelector(recentReviewsRetriever);

  return (
    <div className="recent-reviews-frame">
      <Container>
        <Stack className="section">
          <Box className="category-title">What Golfers Say</Box>
          <Stack
            className="cards-frame"
            direction="row"
            spacing={2}
            sx={{ flexWrap: "wrap" }}
          >
            {recentReviews.length !== 0 ? (
              recentReviews.map((review: Review) => {
                const reviewer = review.userData?.[0]?.name ?? "Anonymous";
                const venueName = review.venueData?.[0]?.venueName ?? "";
                return (
                  <Card key={review._id} className="review-card">
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={1}
                        className="review-header"
                        sx={{ alignItems: "center" }}
                      >
                        <Avatar className="review-avatar">
                          {reviewer.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography className="reviewer-name">
                            {reviewer}
                          </Typography>
                          <Typography className="venue-name">
                            {venueName}
                          </Typography>
                        </Box>
                      </Stack>
                      <Rating
                        value={review.rating}
                        readOnly
                        size="small"
                        className="review-rating"
                      />
                      <Typography className="review-comment">
                        {review.comment}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Box className="no-data">No reviews yet!</Box>
            )}
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
