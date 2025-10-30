import React, { useState, useCallback } from "react";
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
import Image from "@tiptap/extension-image"; // <--- NEW
import mammoth from "mammoth";

// MenuBar now includes an image insert button
const MenuBar = React.memo(({ editor }) => {
  if (!editor) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      <button
        type="button"
        className="btn"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
      >
        H2
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => {
          const url = prompt("Enter link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        🔗
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => {
          const url = prompt("Enter image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
      >
        🖼️
      </button>
      <button
        type="button"
        className="btn"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
      >
        Clear
      </button>
    </div>
  );
});

const UploadArticlePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  const isAdmin = user?.role === "admin";
  const [title, setTitle] = useState("");
  const [articleFile, setArticleFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [2, 3] }),
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Image, // <--- NEW ADDITION
    ],
    content: "",
  });

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleFileRead = async (file) => {
    setArticleFile(file);
    if (file && file.name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editor?.commands.setContent(result.value || "");
      } catch {
        setError("Couldn't extract text from DOCX file.");
      }
    } else {
      setError("Please drop a .docx file.");
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFileRead(file);
    },
    [editor]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFileRead(file);
    },
    [editor]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const content = editor?.getHTML() || "";
    const plainTextContent = editor?.getText().trim() || "";
    const titleValue = title.trim();

    if (!titleValue || !plainTextContent) {
      setError("Please provide both article title and content.");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch("http://localhost:8080/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: titleValue, content }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Article published successfully!");
        setTitle("");
        editor?.commands.setContent("");
        setArticleFile(null);
        setTimeout(() => navigate("/"), 1200);
      } else {
        setError(data.message || "There was an error publishing your article.");
      }
    } catch (error) {
      setError("Network error. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 rounded text-center text-red-700">
        Only admins can upload articles.
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-16 bg-brand-light-gray">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold text-brand-dark">
              Upload New Article
            </h1>
            <p className="text-gray-600 mt-2">
              Fill out the form below to add a post. Use DOCX (auto extract),
              insert images by URL, or use the rich editor!
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Article Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={handleTitleChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-teal focus:border-brand-teal bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content (Images now supported: click 🖼️)
              </label>
              <MenuBar editor={editor} />
              <div
                className={`bg-white border ${
                  isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                } rounded-md prose prose-sm max-w-none p-3 min-h-[300px]`}
                style={{
                  cursor: "text",
                  outline: isDragOver ? "2px dashed #3b82f6" : "none",
                  background: isDragOver ? "#eff6ff" : "white",
                }}
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {editor ? (
                  <EditorContent editor={editor} />
                ) : (
                  <div>Loading editor...</div>
                )}
                <div
                  style={{ fontSize: "0.85em", color: "#777", marginTop: 8 }}
                >
                  Drag &amp; drop a .docx file here, click 🖼️ to insert image by
                  URL, or use the upload below.
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="article-file"
                className="block text-sm font-medium text-gray-700"
              >
                Attach DOCX Document (optional, auto extract to editor)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <input
                    id="article-file-input"
                    name="article-file"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".docx"
                  />
                  <label
                    htmlFor="article-file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-brand-teal hover:text-brand-teal-dark focus-within:outline-none"
                  >
                    <span>Upload a .docx file (auto-extracts to editor!)</span>
                  </label>
                  <p className="pl-1">DOCX up to 10MB</p>
                  {articleFile ? (
                    <p
                      className="text-sm text-gray-800 font-semibold pt-2"
                      aria-live="polite"
                    >
                      Selected file: {articleFile.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 font-semibold pt-2">
                      No file chosen
                    </p>
                  )}
                </div>
              </div>
            </div>
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}
            <div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-brand-dark hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Publishing..." : "Publish Article"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadArticlePage;
