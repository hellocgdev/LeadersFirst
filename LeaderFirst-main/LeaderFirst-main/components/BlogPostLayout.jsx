import React from "react";
// import { useNavigate } from "react-router-dom"; // Uncomment if redirect after delete needed

const adminEmails = ["abcd@gmail.com", "defg@gmail.com"];

const BlogPostLayout = ({
  category,
  title,
  metaTitle,
  imageUrl,
  children,
  currentUser,
  onDelete,
  slug,
  author,
}) => {
  const isUserAdmin = currentUser ? adminEmails.includes(currentUser) : false;
  const canManagePost = isUserAdmin && author === "Community Contributor";

  // Uncomment to use navigation after deletion
  // const navigate = useNavigate();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(slug);
      // Optionally redirect after deletion:
      // navigate("/blog");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-16">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12 text-center">
            <p className="text-brand-teal font-semibold uppercase tracking-wider text-sm mb-2">
              {category}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-serif leading-tight">
              {title}
            </h1>
            {metaTitle && <p className="text-lg text-gray-500">{metaTitle}</p>}
          </header>

          {/* Main Image */}
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto rounded-lg shadow-lg mb-12 object-cover"
          />

          {/* Admin Controls */}
          {canManagePost && (
            <div className="flex justify-end mb-8 -mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold text-sm"
              >
                Delete Post
              </button>
            </div>
          )}

          {/* Article Body */}
          <div className="article-content max-w-none text-gray-800">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostLayout;
