import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../services/AuthService";
import { useGlobals } from "../../../hooks/useGlobals";

interface Props {
  switchToSignup: () => void;
}

export default function LoginForm({ switchToSignup }: Props) {
  const navigate = useNavigate();
  const { setAuthMember } = useGlobals();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const authService = new AuthService();
      const user = await authService.login({ email, password });
      setAuthMember(user);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Login</h2>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="auth-error">{error}</p>}
      <button type="submit">Login</button>
      <p className="auth-switch">
        Don't have an account? <span onClick={switchToSignup}>Sign up</span>
      </p>
    </form>
  );
}
