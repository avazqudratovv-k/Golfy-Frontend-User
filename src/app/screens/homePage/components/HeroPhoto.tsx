import React from "react";
import { Box, Typography } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

export default function HeroPhoto() {
  return (
    <div className="hero-photo-frame">
      <Box className="hero-photo-text">
        <FormatQuoteIcon className="quote-icon" />
        <Typography className="hero-quote">
          I don't want to be the best black golfer, I want to be the best
          golfer, period.
        </Typography>
        <Typography className="hero-attribution">— Tiger Woods</Typography>
      </Box>
      <Box className="hero-photo-image">
        <img src="/img/tiger-woods.jpeg" alt="Tiger Woods" />
      </Box>
    </div>
  );
}
