import React from "react";
import { NavLink, Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@mui/icons-material/Event";
import HelpIcon from "@mui/icons-material/Help";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import { useGlobals } from "../../hooks/useGlobals";
import LogoutButton from "../logout/LogoutButton";
import "../../../css/sidebar.css";

export default function Sidebar() {
  const { authMember } = useGlobals();

  return (
    <>
      <LogoutButton />
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <img src="/icons/golfy-logo.svg" alt="Golfy" />
            Golfy
          </div>

          <div className="sidebar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <HomeIcon fontSize="small" />
              Home
            </NavLink>
            <NavLink
              to="/venues"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <PlaceIcon fontSize="small" />
              Venues
            </NavLink>
            {authMember && (
              <NavLink
                to="/bookings"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <EventIcon fontSize="small" />
                Bookings
              </NavLink>
            )}
            <NavLink
              to="/help"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <HelpIcon fontSize="small" />
              Help
            </NavLink>
          </div>
        </div>

        <div className="sidebar-account">
          {authMember ? (
            <Link to="/my-page">
              <PersonIcon fontSize="small" />
              My page
            </Link>
          ) : (
            <Link to="/auth">
              <LoginIcon fontSize="small" />
              Sign up / Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
