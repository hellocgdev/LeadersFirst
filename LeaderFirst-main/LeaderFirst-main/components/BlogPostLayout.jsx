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
import "../styling/BlogPostLayout.css";

// MenuBar for editor
const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2 bg-gray-100 p-2 rounded">
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
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
      const baseUrl = import.meta.env.VITE_API_BASE;
      const res = await fetch(`${baseUrl}/api/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      setIsEditing(true);
      editor?.setEditable(true);
      editor?.commands.setContent(content);
    } else {
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
      const baseUrl = import.meta.env.VITE_API_BASE;

      const res = await fetch(`${baseUrl}/api/articles/${articleId}`, {
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
      });

      const data = await res.json();

      if (res.ok) {
        setUpdateSuccess("Article updated successfully!");
        setIsEditing(false);
        editor?.setEditable(false);

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
      <div className="container mx-auto px-4 py-4">
        <article className="max-w-4xl mx-auto">
          {/* Article Header - COMPACT */}
          <header className="mb-6 text-center">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="text-center w-full px-3 py-1.5 border border-gray-300 rounded-md uppercase text-xs font-semibold text-brand-teal"
                  placeholder="Category"
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-center w-full px-4 py-2 border border-gray-300 rounded-md text-2xl md:text-3xl font-bold text-brand-dark"
                  placeholder="Article Title"
                />
              </div>
            ) : (
              <>
                <p className="text-brand-teal font-semibold uppercase tracking-wider text-xs mb-2">
                  {category}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-3 leading-tight">
                  {title}
                </h1>
              </>
            )}
          </header>

          {/* Main Image - COMPACT */}
          {thumbnail?.url && !isEditing && (
            <div className="mb-6">
              <img
                src={thumbnail.url}
                alt={thumbnail.alt || title}
                className="w-[600px] max-h-[400px] rounded-lg shadow-lg object-cover"
              />
            </div>
          )}

          {/* Admin Controls - COMPACT */}
          {canManagePost && (
            <div className="flex justify-end gap-2 mb-6">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="bg-gray-500 text-white px-4 py-1.5 rounded-md hover:bg-gray-600 transition-colors font-medium text-xs"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition-colors font-medium text-xs disabled:opacity-50"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors font-medium text-xs"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Update Messages - COMPACT */}
          {updateError && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              {updateSuccess}
            </div>
          )}

          {/* Article Body - COMPACT */}
          {isEditing ? (
            <div className="border border-gray-300 rounded-lg p-3">
              <MenuBar editor={editor} />
              <div className="border border-gray-200 rounded-md min-h-[400px] p-3">
                <EditorContent editor={editor} />
              </div>
            </div>
          ) : (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogPostLayout;
