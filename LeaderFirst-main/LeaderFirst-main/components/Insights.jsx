// src/components/Insights.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ACCENT = "#0F766E"; // hover color for titles

// Shuffle helper for array
const shuffleArray = (array = []) => {
  if (!Array.isArray(array)) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper to format relative time
const getRelativeTime = (date) => {
  const now = new Date();
  const published = new Date(date);
  const diffMs = now - published;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "JUST NOW";
  if (diffHours < 24)
    return `ABOUT ${diffHours} HOUR${diffHours > 1 ? "S" : ""} AGO`;
  if (diffDays === 1) return "ABOUT 1 DAY AGO";
  return `ABOUT ${diffDays} DAYS AGO`;
};

// Helper to extract text excerpt from HTML
const getExcerpt = (htmlContent, maxLength = 150) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const Insights = ({ posts: propPosts = null }) => {
  const [articles, setArticles] = useState([]);
  const [shuffledArticles, setShuffledArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [followedArticles, setFollowedArticles] = useState(new Set());
  const [followedLeaders, setFollowedLeaders] = useState(new Set());

  // Dummy leaders data
  const dummyLeaders = [
    { name: "Warren Buffet", position: "CTO - BlackRock", image: "wb1.jpeg" },
    { name: "Satya Nadela", position: "CEO - Microsoft", image: "SN1.jpeg" },
    { name: "Kane Williamson", position: "NZ Cricketer", image: "KW1.jpeg" },
    { name: "Narayana Murthy", position: "CPO - Infosys", image: "NM.jpeg" },
  ];

  // Use posts provided by parent when available, otherwise fetch from API
  useEffect(() => {
    let cancelled = false;

    const applyArticles = (src) => {
      if (cancelled) return;
      setArticles(src);
      if (src.length >= 7) setShuffledArticles(shuffleArray(src));
      else setShuffledArticles(src);
      setLoading(false);
    };

    if (propPosts && Array.isArray(propPosts)) {
      // parent provided posts — use them and skip fetching
      applyArticles(propPosts);
      return () => {
        cancelled = true;
      };
    }

    const fetchArticles = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE;

        const res = await fetch(`${baseUrl}/api/articles`);
        const data = await res.json();
        console.log("Fetched articles:", data);

        // Accept either array or { data: [...] }
        const src = Array.isArray(data) ? data : data?.data || [];
        applyArticles(src);
      } catch (error) {
        console.error("Error fetching articles:", error);
        if (!cancelled) setError("Failed to load articles");
      } finally {
        // loading flag handled in applyArticles for success; ensure false on error
        if (!cancelled && error) setLoading(false);
      }
    };

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [propPosts]);

  // Handle image error
  const handleImageError = (articleId) => {
    setImageErrors((prev) => ({ ...prev, [articleId]: true }));
  };

  // Handle follow button click
  const handleFollowClick = (e, articleId) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowedArticles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Handle follow leader button click
  const handleFollowLeaderClick = (e, leaderIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowedLeaders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leaderIndex)) {
        newSet.delete(leaderIndex);
      } else {
        newSet.add(leaderIndex);
      }
      return newSet;
    });
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 bg-[#FBF9F6]">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <div className="text-2xl font-semibold text-gray-600">
            Loading insights...
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 bg-[#FBF9F6]">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  // Not enough articles
  if (!shuffledArticles || shuffledArticles.length < 7) {
    return (
      <section className="py-20 bg-[#FBF9F6]">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <div className="text-xl text-gray-600">
            {shuffledArticles.length === 0
              ? "No articles published yet."
              : `Only ${shuffledArticles.length} article${
                  shuffledArticles.length > 1 ? "s" : ""
                } available. Need at least 7 for the full layout.`}
          </div>
        </div>
      </section>
    );
  }

  // Destructure shuffled articles
  const mainArticle = shuffledArticles[0];
  const leftTopArticle = shuffledArticles[1];
  const leftBottomArticle = shuffledArticles[2];

  const latestArticles = [
    {
      time: getRelativeTime(shuffledArticles[3].publishedAt),
      title: shuffledArticles[3].title,
      _id: shuffledArticles[3]._id,
    },
    {
      time: getRelativeTime(shuffledArticles[4].publishedAt),
      title: shuffledArticles[4].title,
      _id: shuffledArticles[4]._id,
    },
    {
      time: getRelativeTime(shuffledArticles[5].publishedAt),
      title: shuffledArticles[5].title,
      _id: shuffledArticles[5]._id,
    },
    {
      time: getRelativeTime(shuffledArticles[6].publishedAt),
      title: shuffledArticles[6].title,
      _id: shuffledArticles[6]._id,
    },
  ];

  const bottomGridArticles = [
    shuffledArticles[3],
    shuffledArticles[4],
    shuffledArticles[5],
    shuffledArticles[6],
  ];

  return (
    <section className="py-8" style={{ backgroundColor: "#FBF9F6" }}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Featured Leaders (thinner) */}
          <div
            className="lg:col-span-2 rounded-lg p-6"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <h3
              className="text-xl font-semibold font-serif mb-6"
              style={{ color: "#00002F" }}
            >
              Featured leaders
            </h3>
            <div className="space-y-6">
              {/* Dummy Featured Leaders */}
              {dummyLeaders.map((leader, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <img
                      src={`/${leader.image}`}
                      alt={leader.name}
                      className="w-16 h-16 rounded-full object-cover bg-gray-200"
                    />
                    <div className="w-full">
                      <h4
                        className="font-semibold text-xs"
                        style={{ color: "#00002F" }}
                      >
                        {leader.name}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {leader.position}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleFollowLeaderClick(e, index)}
                    className="mt-3 w-full text-xs font-medium border py-1.5 rounded transition"
                    style={{
                      backgroundColor: followedLeaders.has(index)
                        ? "#0F766E"
                        : "#FEFFED",
                      color: followedLeaders.has(index) ? "#FEFFED" : "#00002F",
                      border: `1px solid ${
                        followedLeaders.has(index) ? "#0F766E" : "#E5E7EB"
                      }`,
                    }}
                  >
                    {followedLeaders.has(index) ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Company News / Articles */}
          <div
            className="lg:col-span-7 rounded-lg p-6"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3
                className="text-2xl font-semibold font-serif"
                style={{ color: "#00002F" }}
              >
                Company news
              </h3>
              <Link
                to="/blog"
                className="text-sm font-semibold hover:underline"
                style={{ color: "#0F766E" }}
              >
                See All
              </Link>
            </div>

            <div className="space-y-4">
              {bottomGridArticles.map((article) => (
                <div
                  key={article._id}
                  className="rounded-lg transition"
                  style={{ border: "1px solid #E5E7EB" }}
                >
                  <Link
                    to={`/blog/${article._id}`}
                    className="flex gap-6 items-start cursor-pointer group focus:outline-none p-4"
                  >
                    {/* Left - Article Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold uppercase mb-2"
                        style={{ color: "#0F766E" }}
                      >
                        {article.category}
                      </p>
                      <h4
                        className="font-semibold font-serif text-lg mb-2 transition-colors duration-200 line-clamp-2 group-hover:opacity-80"
                        style={{ color: "#00002F" }}
                      >
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-900 mb-3 line-clamp-4">
                        {getExcerpt(article.content, 520)}
                      </p>
                    </div>

                    {/* Right - Article Image */}
                    <div className="relative shrink-0 w-50 h-38 rounded-md overflow-hidden">
                      {article.thumbnail?.url && !imageErrors[article._id] ? (
                        <div
                          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${article.thumbnail.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-medium px-2 text-center">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Follow Company Button */}
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <button
                      onClick={(e) => handleFollowClick(e, article._id)}
                      className="text-sm font-medium px-4 py-2 rounded transition"
                      style={{
                        backgroundColor: followedArticles.has(article._id)
                          ? "#0F766E"
                          : "#FEFFED",
                        color: followedArticles.has(article._id)
                          ? "#FEFFED"
                          : "#00002F",
                        border: `1px solid ${
                          followedArticles.has(article._id)
                            ? "#0F766E"
                            : "#E5E7EB"
                        }`,
                      }}
                    >
                      {followedArticles.has(article._id)
                        ? "Following"
                        : "Follow company"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Quick Reads */}
          <div
            className="lg:col-span-3 rounded-lg p-6"
            style={{ border: "1px solid #E5E7EB" }}
          >
            <h3
              className="text-2xl font-semibold font-serif mb-6"
              style={{ color: "#00002F" }}
            >
              Quick reads
            </h3>

            <div className="space-y-6">
              {bottomGridArticles.map((article, index) => (
                <Link
                  key={article._id}
                  to={`/blog/${article._id}`}
                  className="block border-b border-gray-200 pb-6 last:border-b-0 group cursor-pointer"
                >
                  {/* Read Time Badge */}
                  {article.readTime && (
                    <p
                      className="text-xs font-semibold uppercase mb-2"
                      style={{ color: "#0F766E" }}
                    >
                      {article.readTime} MIN READ
                    </p>
                  )}

                  {/* Title */}
                  <h4
                    className="font-semibold font-serif text-base mb-3 transition-colors duration-200 line-clamp-3 group-hover:opacity-80"
                    style={{ color: "#00002F" }}
                  >
                    {article.title}
                  </h4>

                  {/* Source/Category */}
                  {article.category && (
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      FROM {article.category.toUpperCase()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insights;
