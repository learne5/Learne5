import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./reset.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // To toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // To toggle confirm password visibility
  const navigate = useNavigate();

  // Get email from localStorage
  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) {
      navigate("/forget");
    }
  }, [email, navigate]);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      // Make API call to reset password
      const response = await axios.post(
        "https://learne5.onrender.com/auth/reset-password",
        {
          email: email,
          password: password,
        }
      );

      if (response.status === 200) {
        alert("Password has been reset successfully!");
        localStorage.removeItem("email");
        navigate("/login"); // Redirect to login after success
      } else {
        throw new Error("Failed to reset password.");
      }
    } catch (error) {
      alert("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h1>Reset Password</h1>
        <p>Enter a new password for your account.</p>
        <form onSubmit={handleResetPassword}>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="toggle-password-btn"
            >
              {showPassword ? "Hide" : "Show"} {/* Toggle text */}
            </button>
          </div>
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"} // Toggle between text and password
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
              className="toggle-password-btn"
            >
              {showConfirmPassword ? "Hide" : "Show"} {/* Toggle text */}
            </button>
          </div>
          <button type="submit" className="btn-submit">
            Reset Password
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;