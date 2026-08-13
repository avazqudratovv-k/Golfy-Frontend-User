import React, { useState } from "react";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import "../../../css/authPage.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="auth-page">
      {isLogin ? (
        <LoginForm switchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupForm switchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}
