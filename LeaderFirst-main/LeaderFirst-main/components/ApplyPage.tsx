import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ApplyPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Call request OTP endpoint first
      const res = await fetch(`${baseUrl}/api/auth/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowOtpModal(true); // Show OTP popup
      } else {
        setError(data.message || "Failed to send OTP. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      // Call verify OTP and register
      const res = await fetch(`${baseUrl}/api/auth/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });

      const data = await res.json();
      if (res.ok && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setShowOtpModal(false);
        navigate("/"); // redirect on success
      } else {
        setError(data.message || "OTP verification failed. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setOtpLoading(false);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <>
      <div className="animate-fade-in py-16 md:py-20 bg-brand-light-gray flex items-center justify-center min-h-full">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="font-serif text-4xl font-semibold text-brand-dark">
                Create an Account
              </h1>
              <p className="text-gray-600 mt-2">
                Join our community to read and engage.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal sm:text-sm bg-white text-black"
                    placeholder="you@example.com"
                    aria-label="Email Address"
                    disabled={loading || showOtpModal}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal sm:text-sm bg-white text-black"
                    placeholder="••••••••"
                    aria-label="Password"
                    disabled={loading || showOtpModal}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal sm:text-sm bg-white text-black"
                    placeholder="••••••••"
                    aria-label="Confirm Password"
                    disabled={loading || showOtpModal}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </form>
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="#"
                onClick={handleLoginClick}
                className="font-medium text-brand-teal hover:text-brand-teal-dark"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* OTP modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold mb-4 text-center text-brand-dark">
              Enter OTP
            </h2>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-teal focus:border-brand-teal text-black"
                maxLength={6}
                aria-label="OTP input"
                disabled={otpLoading}
              />
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors"
              >
                {otpLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyPage;
