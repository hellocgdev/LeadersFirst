import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import mammoth from "mammoth";
import ArticlePreviewModal from "./ArticlePreviewModal";

const PaywallModal = ({ open, onClose, onUpgrade }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 relative">
        <button
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold mb-2">Upgrade required</h3>
        <p className="text-sm text-gray-600 mb-6">
          You’ve reached your free publish limit. Upgrade to continue.
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800"
            onClick={onUpgrade}
          >
            Upgrade
          </button>
          <button
            className="flex-1 bg-white border border-gray-300 rounded-lg py-2 font-semibold hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// MenuBar Component (UI unchanged)
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

// Main Component (UI unchanged)
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
  const [showPreview, setShowPreview] = useState(false);
  const [publishedAt] = useState(() => {
    const now = new Date();
    return now.toLocaleString("en-GB", { hour12: false }).replace(",", "");
  });
  const [showPaywall, setShowPaywall] = useState(false);

  const contentImageInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const docxInputRef = useRef(null);
  const hasLoadedArticles = useRef(false);

  // Avoid duplicate extension names: only StarterKit + Underline + Image
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
    ],
    content: "",
  });

  // Fetch articles ONLY ONCE
  useEffect(() => {
    if (!isAdmin || !token || hasLoadedArticles.current) return;

    hasLoadedArticles.current = true;
    (async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE;
        const res = await fetch(`${baseUrl}/api/articles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllArticles(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      }
    })();
  }, [isAdmin, token]);

  // Upload image to server (same endpoint as thumbnail)
  const uploadImageToServer = async (blobOrFile, name) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE;
      const formData = new FormData();
      const file =
        blobOrFile instanceof File
          ? blobOrFile
          : new File([blobOrFile], name, {
              type: blobOrFile.type || "image/png",
            });

      formData.append("thumbnail", file);

      const res = await fetch(`${baseUrl}/api/upload/thumbnail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      return data.url || "";
    } catch (err) {
      console.error("Upload error:", err);
      return "";
    }
  };

  // Helpers
  const dataUrlToBlob = async (dataUrl) => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };
  const replaceAllSafe = (html, needle, replacement) =>
    html.split(needle).join(replacement);

  // DOCX processing without Buffer: use base64/data: URL from Mammoth
  const processDocxWithImages = async (arrayBuffer) => {
    console.log("🔄 Starting DOCX processing with image upload...");

    let index = 0;
    const jobs = [];
    const placeholderToUrl = new Map();

    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          index += 1;
          const placeholder = `__IMAGE_${index}__`;

          try {
            const base64 = await image.read("base64"); // no Buffer path
            const mime = image.contentType || "image/png";
            const dataUrl = `data:${mime};base64,${base64}`;

            // async upload job
            const job = (async () => {
              try {
                const blob = await dataUrlToBlob(dataUrl);
                const ext = (mime.split("/")[1] || "png").toLowerCase();
                const name = `docx-img-${Date.now()}-${index}.${ext}`;
                const url = await uploadImageToServer(blob, name);
                placeholderToUrl.set(placeholder, url || dataUrl); // fallback to dataUrl
              } catch (e) {
                console.error("Upload job error:", e);
                placeholderToUrl.set(placeholder, dataUrl);
              }
            })();

            jobs.push(job);
            return { src: placeholder, alt: `Image ${index}` };
          } catch (e) {
            console.error(`❌ Failed to process ${placeholder}:`, e);
            return {
              src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
              alt: `Image ${index}`,
            };
          }
        }),
      }
    );

    console.log(`⏳ Waiting for ${jobs.length} image(s) to upload...`);
    await Promise.all(jobs);

    let finalHtml = result.value || "";
    placeholderToUrl.forEach((url, ph) => {
      finalHtml = replaceAllSafe(finalHtml, ph, url);
    });

    console.log("✅ DOCX processing complete!");
    return { html: finalHtml, imageCount: placeholderToUrl.size };
  };

  // Handle DOCX file
  const handleDocxFile = async (file) => {
    if (!file || !file.name.endsWith(".docx")) {
      setError("❌ Please select a .docx file");
      return;
    }

    setProcessingDocx(true);
    setError("");
    setSuccess("📄 Processing DOCX and uploading images...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { html, imageCount } = await processDocxWithImages(arrayBuffer);
      if (!html) throw new Error("Could not extract content from DOCX");

      editor?.commands.setContent(html);

      setSuccess(
        imageCount > 0
          ? `✅ DOCX loaded! ${imageCount} image(s) uploaded and displayed.`
          : "✅ DOCX loaded! No images found in document."
      );
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("❌ DOCX processing error:", err);
      setError(`❌ Error: ${err.message}`);
    } finally {
      setProcessingDocx(false);
    }
  };

  // Manual image selection
  const handleContentImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImageToServer(file, file.name);
    if (url) editor?.chain().focus().setImage({ src: url }).run();
    else setError("❌ Failed to upload image");

    if (contentImageInputRef.current) contentImageInputRef.current.value = "";
  };

  // Thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Drag and drop
  const handleDrop = useCallback((e) => {
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
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleDocxFile(file);
  };

  // Submit (UI unchanged)
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
    // if (!thumbnailFile) {
    //   setError("❌ Please upload a thumbnail image");
    //   return;
    // }

    setIsUploading(true);

    try {
      const thumbFormData = new FormData();
      thumbFormData.append("thumbnail", thumbnailFile);
      const baseUrl = import.meta.env.VITE_API_BASE;

      const thumbRes = await fetch(`${baseUrl}/api/upload/thumbnail`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: thumbFormData,
      });

      // if (!thumbRes.ok) throw new Error("Thumbnail upload failed");
      const thumbData = await thumbRes.json();

      const res = await fetch(`${baseUrl}/api/articles`, {
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

      if (res.status === 402 && data?.code === "PAYMENT_REQUIRED") {
        setError("You have reached your free publish limit.");
        setShowPaywall(true);
        setTimeout(() => {
          setShowPaywall((open) => {
            if (open) navigate("/pay");
            return open;
          });
        }, 5000);
        setIsUploading(false);
        return;
      }

      if (res.ok) {
        setSuccess("✅ Article published successfully!");
        setTitle("");
        setLabels("");
        setThumbnailFile(null);
        setThumbnailPreview("");
        editor?.commands.setContent("");
        setAllArticles((prev) => [data.data, ...prev]);
        setTimeout(() => navigate("/upload-article"), 1500);
      } else {
        setError(`${data.message || "Failed to publish"}`);
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
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
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleDocxFile(f);
                }}
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

          <div className="space-y-2">
            <label className="block font-bold text-xs text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="w-full border-2 border-gray-300 bg-white focus:ring-2 focus:ring-brand-teal focus:border-brand-teal px-3 py-2 text-sm rounded-md transition"
            >
              <option value="">Select a category</option>
              <option value="Technology">Technology</option>
              <option value="Politics">Politics</option>
              <option value="Environment">Environment</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Science">Science</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Fashion">Fashion</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-xs text-gray-700 uppercase tracking-wider">
              Published on
            </label>
            <p className="text-sm text-gray-700 font-medium">{publishedAt}</p>
          </div>

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
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false);
          navigate("/pay");
        }}
      />
    </div>
  );
};

export default UploadArticlePage;
