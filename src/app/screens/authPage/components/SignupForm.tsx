import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../services/AuthService";
import { useGlobals } from "../../../hooks/useGlobals";

interface Props {
  switchToLogin: () => void;
}

export default function SignupForm({ switchToLogin }: Props) {
  const navigate = useNavigate();
  const { setAuthMember } = useGlobals();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const authService = new AuthService();
      const user = await authService.signup({ name, email, phone, password });
      setAuthMember(user);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign up</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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
      <button type="submit">Sign up</button>
      <p className="auth-switch">
        Already have an account? <span onClick={switchToLogin}>Login</span>
      </p>
    </form>
  );
}
