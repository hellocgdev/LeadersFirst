import React, { useState, useCallback, useEffect, useRef } from "react";
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
import JSZip from "jszip";
import mammoth from "mammoth";
import ArticlePreviewModal from "./ArticlePreviewModal"; // Import

// MenuBar Component
const MenuBar = React.memo(({ editor, onImageSelect }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-0.5 px-3 py-2.5 bg-white border-b border-gray-200 items-center">
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-sm font-semibold"
        title="Bold"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
      >
        <b>B</b>
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-sm font-semibold"
        title="Italic"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
      >
        <i>I</i>
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-sm font-semibold"
        title="Underline"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
      >
        <u>U</u>
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-sm font-semibold"
        title="Strikethrough"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
      >
        S
      </button>

      <div className="w-px bg-gray-300 h-5 mx-1"></div>

      <button
        className="p-1.5 hover:bg-gray-100 rounded text-xs font-bold"
        title="Normal"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
        }}
      >
        Normal
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-xs font-bold"
        title="H1"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 1 }).run();
        }}
      >
        H1
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-xs font-bold"
        title="H2"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 2 }).run();
        }}
      >
        H2
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded text-xs font-bold"
        title="H3"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 3 }).run();
        }}
      >
        H3
      </button>

      <div className="w-px bg-gray-300 h-5 mx-1"></div>

      <button
        className="p-1.5 hover:bg-gray-100 rounded"
        title="Bullet List"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
      >
        •
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded"
        title="Ordered List"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
      >
        1.
      </button>

      <div className="w-px bg-gray-300 h-5 mx-1"></div>

      <label
        className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
        title="Image"
      >
        🖼️
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageSelect}
        />
      </label>
      <button
        className="p-1.5 hover:bg-gray-100 rounded"
        title="Link"
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        🔗
      </button>

      <div className="w-px bg-gray-300 h-5 mx-1"></div>

      <button
        className="p-1.5 hover:bg-gray-100 rounded text-xs text-gray-600"
        title="Clear"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().unsetAllMarks().clearNodes().run();
        }}
      >
        Clear
      </button>
    </div>
  );
});

// Main Component
const UploadArticlePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  const isAdmin = user?.role === "admin";

  // State
  const [title, setTitle] = useState("");
  const [labels, setLabels] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingDocx, setProcessingDocx] = useState(false);
  const [allArticles, setAllArticles] = useState([]);
  const [showPreview, setShowPreview] = useState(false); // Preview state
  const [publishedAt] = useState(() => {
    const now = new Date();
    return now.toLocaleString("en-GB", { hour12: false }).replace(",", "");
  });

  const contentImageInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const docxInputRef = useRef(null);
  const hasLoadedArticles = useRef(false);

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content: "",
  });

  // Fetch articles ONLY ONCE
  useEffect(() => {
    if (!isAdmin || !token || hasLoadedArticles.current) return;

    hasLoadedArticles.current = true;
    const fetchArticles = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/articles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllArticles(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      }
    };

    fetchArticles();
  }, [isAdmin, token]);

  // Extract and process images from DOCX
  const extractImagesFromDocx = async (arrayBuffer) => {
    try {
      const zip = new JSZip();
      const docxData = await zip.loadAsync(arrayBuffer);
      const imageMap = {};
      let uploadedCount = 0;

      const mediaFolder = docxData.folder("word/media");
      if (!mediaFolder) return imageMap;

      for (const [path, file] of Object.entries(mediaFolder.files)) {
        if (path.includes("image")) {
          try {
            uploadedCount++;
            const imageData = await file.async("blob");
            const fileName = path.split("/").pop();
            const blobUrl = URL.createObjectURL(
              new File([imageData], fileName, { type: imageData.type })
            );
            imageMap[fileName] = blobUrl;
            console.log(`✅ Image ${uploadedCount} extracted: ${fileName}`);
          } catch (imgErr) {
            console.error(`Error processing image:`, imgErr);
          }
        }
      }

      return imageMap;
    } catch (err) {
      console.error("❌ Image extraction error:", err);
      return {};
    }
  };

  // Process DOCX file
  const handleDocxFile = async (file) => {
    if (!file || !file.name.endsWith(".docx")) {
      setError("❌ Please select a .docx file");
      return;
    }

    setProcessingDocx(true);
    setError("");
    setSuccess("📄 Processing DOCX...");

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Extract images
      const imageMap = await extractImagesFromDocx(arrayBuffer);
      const imageCount = Object.keys(imageMap).length;
      console.log(`📊 Total images extracted: ${imageCount}`);

      // Convert DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });

      if (!result.value) {
        throw new Error("Could not extract content from DOCX");
      }

      let htmlContent = result.value;

      // Replace image paths with blob URLs
      Object.entries(imageMap).forEach(([docxPath, blobUrl]) => {
        htmlContent = htmlContent.replace(
          new RegExp(`word/media/${docxPath}`, "g"),
          blobUrl
        );
      });

      editor?.commands.setContent(htmlContent);
      setSuccess(`✅ DOCX loaded! (${imageCount} images extracted)`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ DOCX processing error:", err);
      setError("❌ Error: " + err.message);
    } finally {
      setProcessingDocx(false);
    }
  };

  // Handle image selection
  const handleContentImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    editor?.chain().focus().setImage({ src: blobUrl }).run();
    if (contentImageInputRef.current) contentImageInputRef.current.value = "";
  };

  // Handle thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      const docxFile = Array.from(files).find((f) => f.name.endsWith(".docx"));

      if (docxFile) {
        handleDocxFile(docxFile);
      } else {
        setError("❌ Please drag a .docx file");
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleDocxFile(file);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const content = editor?.getHTML() || "";
    const plainTextContent = editor?.getText().trim() || "";
    const titleValue = title.trim();
    const labelsValue = labels.trim();

    if (!titleValue || !labelsValue || !plainTextContent) {
      setError("❌ Please fill: Title, Labels, and Content");
      return;
    }

    if (!thumbnailFile) {
      setError("❌ Please upload a thumbnail image");
      return;
    }

    setIsUploading(true);

    try {
      // Upload thumbnail first
      const thumbFormData = new FormData();
      thumbFormData.append("thumbnail", thumbnailFile);

      const thumbRes = await fetch(
        "http://localhost:8080/api/upload/thumbnail",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: thumbFormData,
        }
      );

      if (!thumbRes.ok) {
        throw new Error("Thumbnail upload failed");
      }

      const thumbData = await thumbRes.json();

      // Publish article
      const res = await fetch("http://localhost:8080/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: titleValue,
          content,
          category: labelsValue,
          thumbnail: {
            url: thumbData.url,
            publicId: thumbData.publicId,
            alt: titleValue,
          },
          publishedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Article published successfully!");
        setTitle("");
        setLabels("");
        setThumbnailFile(null);
        setThumbnailPreview("");
        editor?.commands.setContent("");

        // Add new article to list
        setAllArticles((prev) => [data.data, ...prev]);

        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(`❌ ${data.message || "Failed to publish"}`);
      }
    } catch (error) {
      setError(`❌ Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 rounded text-center text-red-700">
        <p className="font-bold">Access Denied</p>
        <p>Only admins can upload articles.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 hover:text-gray-900 text-2xl transition"
              title="Back"
            >
              ←
            </button>
            <span className="text-lg font-semibold text-gray-800">
              The Leaders First
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium transition"
            >
              👁️ Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || processingDocx}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded px-6 py-1.5 font-semibold text-sm shadow-md transition"
            >
              {isUploading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto px-12 py-10">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            {/* Title */}
            <input
              type="text"
              className="bg-transparent outline-none border-0 border-b-2 border-[#f05c56] text-5xl font-serif mb-8 w-full placeholder:text-gray-300 focus:border-[#f05c56] transition py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />

            {/* Toolbar + Editor */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-6">
              <MenuBar
                editor={editor}
                onImageSelect={() => contentImageInputRef.current?.click()}
              />
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleContentImageSelect}
                className="hidden"
              />
              <div
                className={`bg-white min-h-[450px] border-t border-gray-200 transition ${
                  isDragOver ? "ring-2 ring-blue-300 bg-blue-50" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none p-6"
                />
              </div>
            </div>

            {/* DOCX Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                ref={docxInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={processingDocx}
              />
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <button
                  type="button"
                  onClick={() => docxInputRef.current?.click()}
                  disabled={processingDocx}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-base disabled:opacity-50"
                >
                  {processingDocx
                    ? "⏳ Processing DOCX..."
                    : "Click to select DOCX file"}
                </button>
                <p className="text-sm text-gray-600">
                  or drag and drop your DOCX file here
                </p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm mb-6 font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm mb-6 font-medium">
                {success}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {/* Preview & Publish */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 flex-1 bg-gray-100 border border-gray-300 px-3 py-2 rounded hover:bg-gray-200 text-gray-700 font-medium text-sm transition"
            >
              👁️ Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || processingDocx}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded font-semibold text-sm shadow-md transition"
            >
              Publish
            </button>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-xs text-gray-700 uppercase tracking-wider">
              Thumbnail Image
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm transition"
            >
              Choose Image
            </button>
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200"
              />
            )}
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="block font-bold text-xs text-gray-700 uppercase tracking-wider">
              Labels
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="Separate by commas"
              className="w-full border-0 border-b-2 border-gray-300 bg-transparent focus:ring-0 focus:border-brand-teal px-0 py-1.5 text-sm placeholder:text-gray-400 transition"
            />
            <p className="text-xs text-gray-400 pt-1">
              No matching suggestions
            </p>
          </div>

          {/* Published On */}
          <div className="space-y-1">
            <label className="block font-bold text-xs text-gray-700 uppercase tracking-wider">
              Published on
            </label>
            <p className="text-sm text-gray-700 font-medium">{publishedAt}</p>
          </div>

          {/* Uploaded Articles */}
          <div className="space-y-2">
            <label className="block font-bold text-xs text-gray-700 uppercase tracking-wider">
              Uploaded Articles ({allArticles.length})
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {allArticles.length > 0 ? (
                allArticles.map((article) => (
                  <button
                    key={article._id}
                    type="button"
                    onClick={() => navigate(`/blog/${article._id}`)}
                    className="w-full text-left p-2.5 hover:bg-gray-100 rounded transition group"
                  >
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-brand-teal truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      /blog-post-{article._id.slice(0, 8)}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">
                  No articles yet
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Preview Modal */}
      <ArticlePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        content={editor?.getHTML() || ""}
        thumbnail={thumbnailPreview}
        labels={labels}
        publishedAt={publishedAt}
        author={user?.email || "Anonymous"}
      />
    </div>
  );
};

export default UploadArticlePage;
