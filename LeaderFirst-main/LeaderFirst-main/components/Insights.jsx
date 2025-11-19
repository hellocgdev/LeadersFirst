import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

const Insights = () => {
  const [articles, setArticles] = useState([]);
  const [shuffledArticles, setShuffledArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE;

        const res = await fetch(`${baseUrl}/api/articles`);
        const data = await res.json();
        console.log("Fetched articles:", data);

        if (data.data && Array.isArray(data.data)) {
          setArticles(data.data);

          // Shuffle if we have at least 7 articles
          if (data.data.length >= 7) {
            setShuffledArticles(shuffleArray(data.data));
          } else {
            setShuffledArticles(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Handle image error
  const handleImageError = (articleId) => {
    setImageErrors((prev) => ({ ...prev, [articleId]: true }));
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
    <section className="py-20 bg-[#FBF9F6]">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - FIXED */}
          <div className="lg:col-span-1 space-y-8">
            <Link
              to={`/blog/${leftTopArticle._id}`}
              className="cursor-pointer group block focus:outline-none"
            >
              <div
                className="relative w-full overflow-hidden rounded-lg shadow-md mb-4"
                style={{ paddingBottom: "75%" }}
              >
                {leftTopArticle.thumbnail?.url &&
                !imageErrors[leftTopArticle._id] ? (
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${leftTopArticle.thumbnail.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium px-4 text-center">
                      {leftTopArticle.title}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 text-xs font-bold uppercase z-10">
                  The Leaders First
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-teal transition-colors">
                {leftTopArticle.title}
              </h3>
            </Link>

            <div className="border-t border-gray-200 pt-8">
              <Link
                to={`/blog/${leftBottomArticle._id}`}
                className="flex gap-4 items-start cursor-pointer group focus:outline-none"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-700 uppercase">
                    {leftBottomArticle.category}
                  </p>
                  <h4 className="font-semibold text-gray-800 group-hover:text-brand-teal transition-colors">
                    {leftBottomArticle.title}
                  </h4>
                </div>
                <div className="relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                  {leftBottomArticle.thumbnail?.url &&
                  !imageErrors[leftBottomArticle._id] ? (
                    <div
                      className="absolute inset-0 w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${leftBottomArticle.thumbnail.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium px-2 text-center">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Center Column - Main Article - FIXED */}
          <Link
            to={`/blog/${mainArticle._id}`}
            className="lg:col-span-2 cursor-pointer group block focus:outline-none"
          >
            <div
              className="relative w-full overflow-hidden rounded-lg shadow-lg mb-4"
              style={{ paddingBottom: "56.25%" }}
            >
              {mainArticle.thumbnail?.url && !imageErrors[mainArticle._id] ? (
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${mainArticle.thumbnail.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium px-4 text-center">
                    {mainArticle.title}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">
              {mainArticle.category}
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-brand-teal transition-colors">
              {mainArticle.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {getExcerpt(mainArticle.content)}
            </p>
            <p className="text-xs font-semibold uppercase text-gray-500">
              By{" "}
              {mainArticle.author?.name ||
                mainArticle.author?.email ||
                "Anonymous"}{" "}
              • {getRelativeTime(mainArticle.publishedAt)}
            </p>
          </Link>

          {/* Right Column - Latest Articles */}
          <div className="lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Latest</h3>
              <Link
                to="/blog"
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                See All
              </Link>
            </div>
            <div className="space-y-4">
              {latestArticles.map((article) => (
                <Link
                  key={article._id}
                  to={`/blog/${article._id}`}
                  className="border-b border-gray-200 pb-4 last:border-b-0 cursor-pointer group block focus:outline-none"
                >
                  <p className="text-xs font-semibold uppercase text-gray-500 mb-1">
                    {article.time}
                  </p>
                  <h4 className="font-bold text-gray-800 group-hover:text-brand-teal transition-colors">
                    {article.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid - FIXED */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bottomGridArticles.map((article) => (
              <Link
                key={article._id}
                to={`/blog/${article._id}`}
                className="cursor-pointer group block focus:outline-none"
              >
                <div
                  className="relative w-full overflow-hidden rounded-lg shadow-md mb-4"
                  style={{ paddingBottom: "75%" }}
                >
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
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium px-4 text-center">
                        {article.title}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                  {article.category}
                </p>
                <h4 className="font-semibold text-gray-800 group-hover:text-brand-teal transition-colors line-clamp-3">
                  {article.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insights;
