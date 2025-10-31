import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/articles")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch articles");
        return res.json();
      })
      .then((data) => {
        setArticles(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load articles");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/articles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((art) => art._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">
          Articles Dashboard
        </h1>
        <Link
          to="/upload-article"
          className="bg-brand-dark text-white px-6 py-2 rounded-md hover:bg-gray-800 font-semibold text-base"
        >
          + New Article
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading articles...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No articles found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/blog/${article._id}`}
                      className="text-blue-800 hover:underline"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                        article.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {article.status ? article.status : "published"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {article.createdAt
                      ? new Date(article.createdAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => navigate(`/blog/${article._id}`)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
