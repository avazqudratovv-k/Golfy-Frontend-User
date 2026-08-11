import React from "react";
import { useNavigate } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";
import AuthService from "../../services/AuthService";

export default function LogoutButton() {
  const { authMember, setAuthMember } = useGlobals();
  const navigate = useNavigate();

  if (!authMember) return null;

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    try {
      const authService = new AuthService();
      await authService.logout();
      setAuthMember(null);
      navigate("/");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}
