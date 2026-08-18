import React from "react";
import { Link } from "react-router-dom";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import PlaceIcon from "@mui/icons-material/Place";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <GolfCourseIcon className="footer-logo-icon" />
          <span>Golfy</span>
        </div>
        <p className="footer-tagline">
          Book tee times at the best golf zones in town.
        </p>
      </div>

      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/venues">Venues</Link>
        <Link to="/help">Help</Link>
      </div>

      <div className="footer-contact">
        <span>
          <MailIcon fontSize="small" /> support@golfy.com
        </span>
        <span>
          <PhoneIcon fontSize="small" /> +1 555 010 2938
        </span>
        <span>
          <PlaceIcon fontSize="small" /> Gwangju, South Korea
        </span>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Golfy. All rights reserved.
      </div>
    </footer>
  );
}
