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

const Insights = ({ posts = [] }) => {
  const [shuffledArticles, setShuffledArticles] = useState([]);

  // Shuffle posts when they change
  useEffect(() => {
    if (posts && posts.length >= 7) {
      setShuffledArticles(shuffleArray(posts));
    } else {
      setShuffledArticles([]);
    }
  }, [posts]);

  // Loading if not enough articles
  if (!shuffledArticles || shuffledArticles.length < 7) {
    return (
      <section className="py-20 bg-[#FBF9F6]">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          Loading insights...
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
      time: "ABOUT 5 HOURS AGO",
      title: shuffledArticles[3].title,
      _id: shuffledArticles[3]._id,
    },
    {
      time: "ABOUT 1 DAY AGO",
      title: shuffledArticles[4].title,
      _id: shuffledArticles[4]._id,
    },
    {
      time: "ABOUT 2 DAYS AGO",
      title: shuffledArticles[5].title,
      _id: shuffledArticles[5]._id,
    },
    {
      time: "ABOUT 3 DAYS AGO",
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
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <Link
              to={`/blog/${leftTopArticle._id}`}
              className="cursor-pointer group block focus:outline-none"
            >
              <div className="relative overflow-hidden rounded-lg shadow-md mb-4">
                <img
                  src={leftTopArticle.imageUrl}
                  alt={leftTopArticle.title}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 text-xs font-bold uppercase">
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 uppercase">
                    {leftBottomArticle.category}
                  </p>
                  <h4 className="font-semibold text-gray-800 group-hover:text-brand-teal transition-colors">
                    {leftBottomArticle.title}
                  </h4>
                </div>
                <div className="relative flex-shrink-0">
                  <img
                    src={leftBottomArticle.imageUrl}
                    alt={leftBottomArticle.title}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Center Column */}
          <Link
            to={`/blog/${mainArticle._id}`}
            className="lg:col-span-2 cursor-pointer group block focus:outline-none"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg mb-4">
              <img
                src={mainArticle.imageUrl}
                alt={mainArticle.title}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">
              {mainArticle.category}
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-brand-teal transition-colors">
              {mainArticle.title}
            </h2>
            <p className="text-gray-600 mb-4">{mainArticle.excerpt}</p>
            <p className="text-xs font-semibold uppercase text-gray-500">
              {mainArticle.author}
            </p>
          </Link>

          {/* Right Column */}
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
              {latestArticles.map((article, index) => (
                <Link
                  key={index}
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

        {/* Bottom Grid */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {bottomGridArticles.map((article, index) => (
              <Link
                key={index}
                to={`/blog/${article._id}`}
                className="cursor-pointer group block focus:outline-none"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md mb-4">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h4 className="font-semibold text-gray-800 group-hover:text-brand-teal transition-colors">
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
