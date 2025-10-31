import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import Footer from "./components/Footer";
import BlogPage from "./components/BlogPage";
import BlogPostLayout from "./components/BlogPostLayout";
import CommunityPage from "./components/CommunityPage";
import ApplyPage from "./components/ApplyPage";
import PerksPage from "./components/PerksPage";
import FaqPage from "./components/FaqPage";
import LoginPage from "./components/LoginPage";
import UploadArticlePage from "./components/UploadArticlePage";
import BlogPostWrapper from "./components/BlogPostWrapper";
import Dashboard from "./components/Dashboard";

const App = () => {
  const handleDeletePost = () => {}; // empty

  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null); // If you're using React state
    navigate("/login"); // Or wherever you want to redirect after logout
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = token
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/articles")
      .then((res) => res.json())
      .then((data) => setPosts(data.data || []))
      .catch(() => setPosts([]));
  }, []);

  return (
    <Router>
      <div className="bg-white text-brand-text font-sans flex flex-col min-h-screen">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-grow pt-20">
          <Routes>
            <Route
              path="/"
              element={<HomePage posts={posts} currentUser={currentUser} />}
            />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/perks" element={<PerksPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/upload-article" element={<UploadArticlePage />} />
            <Route
              path="/blog/:id"
              element={
                <BlogPostWrapper
                  posts={posts}
                  currentUser={currentUser}
                  handleDeletePost={handleDeletePost}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
