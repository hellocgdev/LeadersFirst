import React, { useState, useCallback, useRef } from "react";
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
import mammoth from "mammoth";
import JSZip from "jszip";

// MenuBar
const MenuBar = React.memo(({ editor, onImageUpload }) => {
  if (!editor) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2 bg-gray-100 p-2 rounded sticky top-0 z-10">
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-white hover:bg-gray-200 rounded border text-sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded text-sm"
        onClick={onImageUpload}
        title="Upload Image"
      >
        🖼️ Upload
      </button>
      <button
        type="button"
        className="px-3 py-1 bg-gray-500 text-white hover:bg-gray-600 rounded text-sm"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="Clear Formatting"
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
  const [category, setCategory] = useState("");
  const [articleFile, setArticleFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [thumbnailData, setThumbnailData] = useState(null);
  const [processingDocx, setProcessingDocx] = useState(false);

  const contentImageInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const docxInputRef = useRef(null);

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
    content: "",
  });

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "http://localhost:8080/api/upload/content-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Image uploaded:", data.url);
        return data.url;
      } else {
        console.error("❌ Upload failed:", data.message);
        return null;
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      return null;
    }
  };

  // Extract images from DOCX using JSZip
  const extractImagesFromDocx = async (arrayBuffer) => {
    try {
      console.log("📦 Extracting images from DOCX...");
      const zip = new JSZip();
      const docxData = await zip.loadAsync(arrayBuffer);

      const uploadedImages = {};
      let imageCounter = 0;

      // Get all files from media folder
      docxData.folder("word/media").forEach((relativePath, file) => {
        console.log("Found image in DOCX:", relativePath);
      });

      // Process each image in media folder
      for (const [path, file] of Object.entries(
        docxData.folder("word/media").files
      )) {
        if (path.includes("image")) {
          try {
            imageCounter++;
            const imageData = await file.async("blob");
            console.log(`📸 Processing image ${imageCounter}:`, path);

            // Create file with proper extension
            const ext = path.split(".").pop();
            const fileName = `docx-image-${Date.now()}-${imageCounter}.${ext}`;
            const imageFile = new File([imageData], fileName, {
              type: imageData.type,
            });

            // Upload to Cloudinary
            console.log(`⬆️ Uploading ${fileName}...`);
            const cloudinaryUrl = await uploadImageToCloudinary(imageFile);

            if (cloudinaryUrl) {
              uploadedImages[path] = cloudinaryUrl;
              console.log(`✅ Image uploaded: ${cloudinaryUrl}`);
            } else {
              console.warn(`⚠️ Failed to upload ${fileName}`);
            }
          } catch (imgErr) {
            console.error(`Error processing image ${path}:`, imgErr);
          }
        }
      }

      console.log(`📊 Total images found and processed: ${imageCounter}`);
      console.log("📸 Uploaded images map:", uploadedImages);

      return { uploadedImages, imageCount: imageCounter };
    } catch (err) {
      console.error("❌ Image extraction error:", err);
      throw new Error(`Failed to extract images: ${err.message}`);
    }
  };

  // Process DOCX file
  const handleDocxFile = async (file) => {
    setArticleFile(file);
    setProcessingDocx(true);
    setError("");
    setSuccess("📄 Processing DOCX file...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log("📥 DOCX loaded, size:", arrayBuffer.byteLength);

      // Extract images first
      const { uploadedImages, imageCount } = await extractImagesFromDocx(
        arrayBuffer
      );

      console.log(`Found ${imageCount} images in DOCX`);

      // Convert DOCX to HTML with image replacement
      const result = await mammoth.convertToHtml({ arrayBuffer });

      if (!result.value) {
        throw new Error("Could not extract content from DOCX");
      }

      // Replace image paths with Cloudinary URLs
      let htmlContent = result.value;

      // Replace embedded image references with uploaded URLs
      Object.entries(uploadedImages).forEach(
        ([originalPath, cloudinaryUrl]) => {
          // Replace various image reference patterns
          htmlContent = htmlContent.replace(
            /src="[^"]*word\/media\/[^"]*"/g,
            `src="${cloudinaryUrl}"`
          );
        }
      );

      // If no images were found in src attributes, add them as paragraphs
      if (imageCount > 0 && Object.keys(uploadedImages).length > 0) {
        const imageUrls = Object.values(uploadedImages);
        let imageHtml = imageUrls
          .map(
            (url) =>
              `<p><img src="${url}" alt="Document image" class="max-w-full h-auto rounded-lg" /></p>`
          )
          .join("");

        htmlContent = imageHtml + htmlContent;
      }

      console.log("📝 Setting editor content...");
      editor?.commands.setContent(htmlContent);

      setSuccess(
        `✅ DOCX processed! Extracted ${imageCount} image(s) and text content.`
      );
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("❌ DOCX processing error:", err);
      setError(`❌ Error: ${err.message}`);
    } finally {
      setProcessingDocx(false);
    }
  };

  // Drag and drop handlers
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
    [editor, token]
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
    if (file && file.name.endsWith(".docx")) {
      handleDocxFile(file);
    } else {
      setError("❌ Please select a .docx file");
    }
  };

  // Thumbnail upload
  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setError("⏳ Uploading thumbnail...");

    try {
      const formData = new FormData();
      formData.append("thumbnail", file);

      const res = await fetch("http://localhost:8080/api/upload/thumbnail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setThumbnailData({
          url: data.url,
          publicId: data.publicId,
          alt: title || "Article thumbnail",
        });
        setError("");
        setSuccess("✅ Thumbnail uploaded!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(`❌ Thumbnail error: ${err.message}`);
    }
  };

  // Content image upload
  const handleContentImageUpload = () => {
    contentImageInputRef.current?.click();
  };

  const handleContentImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "http://localhost:8080/api/upload/content-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        editor?.chain().focus().setImage({ src: data.url }).run();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
      if (contentImageInputRef.current) {
        contentImageInputRef.current.value = "";
      }
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const content = editor?.getHTML() || "";
    const plainTextContent = editor?.getText().trim() || "";
    const titleValue = title.trim();
    const categoryValue = category.trim();

    if (!titleValue || !categoryValue || !plainTextContent || !thumbnailData) {
      setError("❌ Please fill all required fields");
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
        body: JSON.stringify({
          title: titleValue,
          content: content,
          thumbnail: thumbnailData,
          category: categoryValue,
          publishedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Article published successfully!");
        setTitle("");
        setCategory("");
        setThumbnailFile(null);
        setThumbnailPreview("");
        setThumbnailData(null);
        editor?.commands.setContent("");
        setArticleFile(null);

        setTimeout(() => navigate("/blog"), 1500);
      } else {
        setError(`❌ ${data.message}`);
      }
    } catch (error) {
      setError(`❌ Network error: ${error.message}`);
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
    <div className="animate-fade-in py-16 bg-brand-light-gray min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl font-bold text-brand-dark">
              Upload New Article
            </h1>
            <p className="text-gray-600 mt-2">
              Upload a DOCX file - all text and images will be extracted
              automatically!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="Enter article title"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal"
                placeholder="e.g., Technology, Leadership"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Image *
                {thumbnailData && (
                  <span className="text-green-600 ml-2">✓</span>
                )}
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
                className="px-4 py-2 bg-brand-teal text-white rounded hover:bg-brand-teal-dark"
              >
                Choose Thumbnail
              </button>
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Preview"
                  className="mt-4 max-w-xs rounded-lg"
                />
              )}
            </div>

            {/* Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <MenuBar
                editor={editor}
                onImageUpload={handleContentImageUpload}
              />
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleContentImageChange}
                className="hidden"
              />
              <div
                className={`border-2 rounded-md p-4 min-h-[500px] max-h-[700px] overflow-y-auto ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <EditorContent editor={editor} />
                {uploadingImage && (
                  <p className="text-blue-600 text-sm mt-2">
                    ⏳ Uploading image...
                  </p>
                )}
              </div>
            </div>

            {/* DOCX Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload DOCX Document (auto-extract text & images) *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={docxInputRef}
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={processingDocx}
                />
                <button
                  type="button"
                  onClick={() => docxInputRef.current?.click()}
                  disabled={processingDocx}
                  className="text-brand-teal hover:text-brand-teal-dark font-semibold disabled:opacity-50"
                >
                  {processingDocx
                    ? "⏳ Processing DOCX..."
                    : "📄 Click to select or drag DOCX file here"}
                </button>
                {articleFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {articleFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading || processingDocx}
              className="w-full py-3 bg-brand-dark text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-semibold transition"
            >
              {isUploading ? "Publishing..." : "Publish Article"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadArticlePage;
