import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import Divider from "../../../components/divider";
import { retrieveStats } from "../selector";

export default function Statistics() {
  const stats = useSelector(retrieveStats);

  return (
    <div className="static-frame">
      <Container>
        <Stack className="info">
          <Stack className="static-box">
            <Box className="static-num">{stats.totalBookings}</Box>
            <Box className="static-text">Bookings</Box>
          </Stack>
          <Divider height="64" width="2" bg="#2E7D32" />
          <Stack className="static-box">
            <Box className="static-num">{stats.totalVenues}</Box>
            <Box className="static-text">Venues</Box>
          </Stack>
          <Divider height="64" width="2" bg="#2E7D32" />
          <Stack className="static-box">
            <Box className="static-num">{stats.totalUsers}</Box>
            <Box className="static-text">Golfers</Box>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
