import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BlogPostLayout from "./BlogPostLayout";

const BlogPostWrapper = ({ currentUser, handleDeletePost }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        // Try both common return types
        if (data && data.data) setPost(data.data);
        else if (data) setPost(data);
        else setPost(null);
        setLoading(false);
      })
      .catch(() => {
        setPost(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <BlogPostLayout
      title={post.title}
      imageUrl={post.imageUrl}
      children={post.content}
      currentUser={currentUser}
      onDelete={handleDeletePost}
      slug={post._id}
    />
  );
};

export default BlogPostWrapper;
