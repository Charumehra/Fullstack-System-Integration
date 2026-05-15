import React, { useEffect, useRef, useState, useCallback } from 'react'

const API_BASE_URL = 'http://localhost:5000/api/posts';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const totalPosts = posts.length;
  const hasPosts = totalPosts > 0;

  const showNotification = (type, text) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }

    setNotification({ type, text });

    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3000);
  };

  // Memoized Post card for performance
  const PostCard = React.memo(function PostCard({ post, onDelete }) {
    return (
      <article className="relative overflow-hidden rounded-[1.75rem] glass-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.10)]">
        <button
          aria-label="Delete post"
          onClick={() => onDelete(post._id)}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-700 shadow hover:bg-rose-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-56 w-full bg-transparent sm:h-60">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
              No image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/20 to-transparent" />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Post</p>
            <h3 className="mt-2 break-words text-lg font-semibold text-slate-950">{post.title}</h3>
            <p className="mt-2 break-words text-sm leading-6 text-slate-600">{post.content}</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
            <span>Just posted</span>
            <span>Clean minimal card</span>
          </div>
        </div>
      </article>
    );
  });

  const readApiResponse = async (response) => {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const serverMessage = payload?.message;
      throw new Error(serverMessage || 'Request failed. Please try again.');
    }

    return payload;
  };

  // Fetch posts with optional abort signal
  const fetchPosts = useCallback(async (signal) => {
    setLoading(true);
    setFetchError('');

    try {
      const response = await fetch(API_BASE_URL, signal ? { signal } : undefined);
      const data = await readApiResponse(response);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === 'AbortError') return; // fetch aborted
      setFetchError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPosts(controller.signal);

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  const focusComposer = () => {
    try {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const titleInput = composerRef.current?.querySelector('#title');
      titleInput?.focus();
    } catch (e) {
      // ignore
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  // image preview removed per request

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      const maxBytes = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxBytes) {
        setValidationErrors((prev) => ({ ...prev, image: 'Image must be under 5MB' }));
        return;
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(selectedFile.type)) {
        setValidationErrors((prev) => ({ ...prev, image: 'Unsupported image type' }));
        return;
      }

      setValidationErrors((prev) => ({ ...prev, image: undefined }));
    }

    setFormData((previous) => ({
      ...previous,
      image: selectedFile,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const title = (formData.title || '').trim();
    const content = (formData.content || '').trim();

    if (!title || title.length < 3) errors.title = 'Title must be at least 3 characters';
    if (title.length > 120) errors.title = 'Title must be under 120 characters';

    if (!content || content.length < 10) errors.content = 'Content must be at least 10 characters';
    if (content.length > 10000) errors.content = 'Content is too long';

    if (!formData.image) errors.image = 'Please upload a thumbnail image';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image: null,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setNotification(null);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('content', formData.content.trim());
      uploadData.append('image', formData.image);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: uploadData,
      });

      const createdPost = await readApiResponse(response);
      setPosts((currentPosts) => [createdPost, ...currentPosts]);
      resetForm();
      showNotification('success', 'Post created successfully.');
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    setError('');
    setNotification(null);

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      await readApiResponse(response);
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== id));
      showNotification('success', 'Post deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    }
  }, [showNotification]);

  const renderSkeletonCards = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-[1.5rem] glass-card animate-fade-in-up">
        <div className="h-52 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 sm:h-64" />
        <div className="space-y-4 p-5">
          <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-1/2 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_85%_20%,_rgba(99,102,241,0.14),_transparent_18%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_52%,#f8fafc_100%)] text-slate-900">
      {notification && (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6 sm:w-full">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-md transition ${
              notification.type === 'success'
                ? 'border-cyan-200 bg-cyan-50/95 text-cyan-900'
                : 'border-slate-200 bg-white/95 text-slate-800'
            }`}
          >
            <p className="text-sm font-semibold">{notification.text}</p>
          </div>
        </div>
      )}

      <main className="app-container flex min-h-screen flex-col items-center space-y-8 py-6 sm:py-10 lg:py-14">
        
        <section role="region" aria-labelledby="hero-title" className="w-full max-w-4xl rounded-[2rem] glass-strong accent-top">
          <div className="card-body text-center">
            <p id="hero-badge" className="mb-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.32em] text-sky-700">
              Posts Studio
            </p>
            <h1 id="hero-title" className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Publish and manage posts in a premium workspace
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">Minimal, centered, responsive — designed for fullstack workflows.</p>
          </div>
          <div className="card-actions grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-500">Posts</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{totalPosts}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-500">Status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">Live</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-indigo-500">Style</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Responsive minimal UI</p>
            </div>
          </div>
        </section>

        <section role="region" aria-labelledby="composer-title" ref={composerRef} className="w-full max-w-4xl rounded-[2rem] glass p-6 sm:p-10 lg:mt-8">
          <div className="card-header mb-4">
            <div>
              <p className="section-title">Composer</p>
              <h2 id="composer-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Create a new post</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Publish a post with a title, content, and thumbnail image.</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-4">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a sharp headline"
                className="w-full rounded-2xl glass-input px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              {validationErrors.title && (
                <p className="text-xs text-rose-700">{validationErrors.title}</p>
              )}
            </div>

            <div className="space-y-4">
              <label htmlFor="content" className="block text-sm font-semibold text-slate-800">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write the details of your post"
                rows="7"
                className="w-full rounded-2xl glass-input px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:shadow-sm focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              {validationErrors.content && (
                <p className="text-xs text-rose-700">{validationErrors.content}</p>
              )}
            </div>

            <div className="space-y-4">
              <label htmlFor="image" className="block text-sm font-semibold text-slate-800">
                Thumbnail Image
              </label>

              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 p-4 transition sm:p-5 ${
                  isDragging
                    ? 'border-sky-400 bg-sky-50/30 shadow-md'
                    : 'border-dashed border-slate-200 glass-accent'
                }`}
              >
                <input
                  id="image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-900">Drag & drop image, or click to browse</div>
                    <div className="mt-1 text-xs text-slate-500">PNG, JPG, WebP — up to 5MB</div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl glass-card">
                  <div className="flex h-20 items-center justify-center text-sm text-slate-500 sm:h-24">
                    {formData.image ? formData.image.name : 'No image selected'}
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  JPG, PNG, and WebP uploads work best for crisp thumbnails.
                </p>
                {validationErrors.image && (
                  <p className="mt-2 text-xs text-rose-700">{validationErrors.image}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || Object.values(validationErrors).some(Boolean)}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(14,165,233,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(14,165,233,0.3)] focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>

            {error && (
              <div className="rounded-2xl px-4 py-3 text-sm text-rose-700">
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                  <p className="font-semibold">Unable to publish</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}
            </form>

              {/* aside preview and tips removed per request */}
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-5xl rounded-[2rem] p-6 sm:p-10 glass">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              Feed
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Recent posts
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {hasPosts ? `${totalPosts} item${totalPosts === 1 ? '' : 's'} available` : 'No posts yet'}
            </p>
          </div>

          {fetchError && (
            <div className="mb-5 rounded-2xl px-4 py-3 text-sm text-rose-700">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                <p className="font-semibold">Unable to load posts</p>
                <p className="mt-1">{fetchError}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => fetchPosts()} className="btn-ghost">Retry</button>
                </div>
              </div>
            </div>
          )}

            {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">{renderSkeletonCards()}</div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center rounded-[1.5rem] border-dashed border-slate-200 glass-card px-6 py-12 text-center">
              <div>
                <svg className="mx-auto mb-4 h-16 w-16 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M8 3h8l1 4H7l1-4z" />
                </svg>
                <p className="text-base font-semibold text-slate-800">No posts yet</p>
                <p className="mt-1 text-sm text-slate-500">Create the first entry to populate the feed.</p>
                <div className="mt-4">
                  <button onClick={focusComposer} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                    Create your first post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.slice(0, visibleCount).map((post) => (
                <PostCard key={post._id} post={post} onDelete={handleDelete} />
              ))}
            </div>

            {posts.length > visibleCount && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="rounded-full px-5 py-2.5 bg-white/90 shadow-sm text-sm font-medium"
                >
                  Load more
                </button>
              </div>
            )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
