import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:8080/api/articles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch articles");
        return res.json();
      })
      .then((data) => {
        setPosts(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load articles");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading articles...</div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!posts.length) {
    return (
      <div className="text-center py-10 text-gray-500">No articles found.</div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/blog/${post._id}`)}
            className="bg-white shadow-md rounded-lg p-6 flex flex-col cursor-pointer transition hover:shadow-lg"
            style={{ width: "320px", minHeight: "420px", maxHeight: "420px" }}
          >
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-40 object-cover rounded mb-4"
              style={{ minHeight: "160px" }}
            />
            <h3
              className="mt-2 text-xl font-bold text-gray-900"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minHeight: "32px",
              }}
              title={post.title}
            >
              {post.title}
            </h3>
            <div
              className="text-gray-600 mt-2"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                WebkitLineClamp: 3,
                minHeight: "60px",
                maxHeight: "60px",
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
