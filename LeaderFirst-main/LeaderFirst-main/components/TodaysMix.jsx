// src/components/TodaysMix.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const getExcerpt = (htmlContent, maxLength = 120) => {
  const temp = document.createElement("div");
  temp.innerHTML = htmlContent || "";
  const text = temp.textContent || temp.innerText || "";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
};

const TodaysMix = ({ articles = [] }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollInterval = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        // If at the end, scroll back to start
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll right by one card width (approximately 300px for a card)
        container.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);

  // Update scroll button states
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft + container.clientWidth < container.scrollWidth - 10
      );
    }
  };

  // Manual scroll functions
  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-6" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-3xl md:text-4xl font-semibold font-serif mb-2"
            style={{ color: "#00002F" }}
          >
            Today's Mix
          </h2>
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition"
              aria-label="Scroll left"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition"
              aria-label="Scroll right"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
          >
            {/* Hide scrollbar */}
            <style>{`
              [class*="overflow-x-auto"]::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {articles.slice(0, 8).map((article) => (
              <Link
                key={article._id}
                to={`/blog/${article._id}`}
                className="group shrink-0 w-80 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                }}
              >
                {/* Image */}
                <div className="w-full h-48 overflow-hidden bg-gray-200">
                  {article.thumbnail?.url ? (
                    <img
                      src={article.thumbnail.url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                      }}
                    >
                      <span className="text-gray-600 text-sm font-medium px-4 text-center">
                        No Image
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category Badge */}
                  {article.category && (
                    <p
                      className="text-xs font-semibold uppercase mb-2 tracking-wider"
                      style={{ color: "#0F766E" }}
                    >
                      {article.category}
                    </p>
                  )}

                  {/* Title */}
                  <h3
                    className="font-semibold font-serif text-base mb-2 line-clamp-2 group-hover:opacity-80 transition"
                    style={{ color: "#00002F" }}
                  >
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {getExcerpt(article.content, 100)}
                  </p>

                  {/* Author */}
                  <p className="text-xs text-gray-500 font-medium">
                    By{" "}
                    {article.author?.name ||
                      article.author?.email ||
                      "Anonymous"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodaysMix;
