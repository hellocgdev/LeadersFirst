import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Image from "@tiptap/extension-image";

// MenuBar for editor
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2 bg-gray-100 p-2 rounded">
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border"
        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
    </div>
  );
};

const BlogPostLayout = ({
  category,
  title,
  metaTitle,
  thumbnail,
  content,
  author,
  publishedAt,
  currentUser,
  articleId,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editCategory, setEditCategory] = useState(category);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Check if current user is admin
  const isUserAdmin = currentUser?.role === "admin";
  const canManagePost = isUserAdmin;

  // Initialize editor for editing
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [2, 3] }),
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
    ],
    content: content,
    editable: false,
  });

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      const res = await fetch(
        `https://leader-first.onrender.com/api/articles/${articleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Article deleted successfully!");
        navigate("/blog");
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting article. Please try again.");
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode
      setIsEditing(true);
      editor?.setEditable(true);
      editor?.commands.setContent(content);
    } else {
      // Canceling edit
      setIsEditing(false);
      editor?.setEditable(false);
      editor?.commands.setContent(content);
      setEditTitle(title);
      setEditCategory(category);
      setUpdateError("");
      setUpdateSuccess("");
    }
  };

  // Handle update
  const handleUpdate = async () => {
    setUpdateError("");
    setUpdateSuccess("");

    const updatedContent = editor?.getHTML() || "";
    const updatedTitle = editTitle.trim();
    const updatedCategory = editCategory.trim();

    if (!updatedTitle || !updatedContent || !updatedCategory) {
      setUpdateError("Please fill all fields");
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch(
        `https://leader-first.onrender.com/api/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: updatedTitle,
            content: updatedContent,
            category: updatedCategory,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUpdateSuccess("Article updated successfully!");
        setIsEditing(false);
        editor?.setEditable(false);

        // Reload page to show updated content
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setUpdateError(data.message || "Failed to update article");
      }
    } catch (error) {
      console.error("Update error:", error);
      setUpdateError("Error updating article. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format published date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="container mx-auto px-6 py-16">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12 text-center">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="text-center w-full px-4 py-2 border border-gray-300 rounded-md uppercase text-sm font-semibold text-brand-teal"
                  placeholder="Category"
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-center w-full px-4 py-3 border border-gray-300 rounded-md text-4xl md:text-5xl font-bold text-brand-dark font-serif"
                  placeholder="Article Title"
                />
              </div>
            ) : (
              <>
                <p className="text-brand-teal font-semibold uppercase tracking-wider text-sm mb-2">
                  {category}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4 font-serif leading-tight">
                  {title}
                </h1>
                {metaTitle && (
                  <p className="text-lg text-gray-500">{metaTitle}</p>
                )}
              </>
            )}

            {/* Author and Date */}
            {!isEditing && (
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mt-4">
                <span>By {author?.name || author?.email || "Anonymous"}</span>
                <span>•</span>
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}
          </header>

          {/* Main Image */}
          {thumbnail?.url && !isEditing && (
            <img
              src={thumbnail.url}
              alt={thumbnail.alt || title}
              className="w-full h-auto rounded-lg shadow-lg mb-12 object-cover"
            />
          )}

          {/* Admin Controls */}
          {canManagePost && (
            <div className="flex justify-end gap-3 mb-8">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors font-semibold text-sm"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold text-sm"
                  >
                    Delete Post
                  </button>
                </>
              )}
            </div>
          )}

          {/* Update Messages */}
          {updateError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {updateSuccess}
            </div>
          )}

          {/* Article Body */}
          {isEditing ? (
            <div className="border border-gray-300 rounded-lg p-4">
              <MenuBar editor={editor} />
              <div className="border border-gray-200 rounded-md min-h-[400px] p-4">
                <EditorContent editor={editor} />
              </div>
            </div>
          ) : (
            <div
              className="article-content prose prose-lg max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogPostLayout;
