import React from "react";
import { Link } from "react-router-dom";
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
            <Link to="/">Home</Link>
            <Link to="/venues">Venues</Link>
            {authMember && <Link to="/bookings">Bookings</Link>}
            <Link to="/help">Help</Link>
          </div>
        </div>

        <div className="sidebar-account">
          {authMember ? (
            <Link to="/my-page">My page</Link>
          ) : (
            <Link to="/auth">Sign up / Login</Link>
          )}
        </div>
      </div>
    </>
  );
}
