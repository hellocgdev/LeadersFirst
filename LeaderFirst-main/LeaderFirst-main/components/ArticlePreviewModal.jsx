import React from "react";

const ArticlePreviewModal = ({
  open,
  onClose,
  title,
  content,
  thumbnail,
  labels,
  publishedAt,
  author,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Article Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold transition"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <article className="max-w-3xl mx-auto px-8 py-12">
            {/* Thumbnail */}
            {thumbnail && (
              <img
                src={thumbnail}
                alt={title || "Article"}
                className="w-full h-96 object-cover rounded-lg shadow-lg mb-8"
              />
            )}

            {/* Title */}
            <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {title || "Untitled Article"}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-8 pb-6 border-b border-gray-200">
              {author && <span>{author}</span>}
              {publishedAt && (
                <>
                  {author && <span>•</span>}
                  <span>{publishedAt}</span>
                </>
              )}
              {labels && (
                <>
                  {(author || publishedAt) && <span>•</span>}
                  <span className="font-medium text-gray-700">{labels}</span>
                </>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg prose-gray max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-gray-500 italic">No content yet...</p>
              )}
            </div>
          </article>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold text-sm transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreviewModal;
