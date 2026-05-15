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

  const PostCard = React.memo(function PostCard({ post, onDelete }) {
    return (
      <article className="relative overflow-hidden rounded-2xl glass-card group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-96 flex flex-col">
        <button
          aria-label="Delete post"
          onClick={() => {
            if(window.confirm('Are you sure you want to delete this post?')) {
              onDelete(post._id);
            }
          }}
          className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-600 hover:bg-red-50 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete this post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 flex-shrink-0">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-150">
              <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40" />
        </div>

        <div className="flex flex-col gap-3 p-5 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-hidden">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              Post
            </span>
            <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950 leading-tight">{post.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{post.content}</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto text-xs font-medium flex-shrink-0">
            <span className="text-slate-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Just now
            </span>
            <span className="text-sky-600 font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 3a1 1 0 000 2h6v.01H7a1 1 0 000 2h6V7H7a1 1 0 000 2h10a1 1 0 100-2h-1V5h1a1 1 0 100-2H7zm0 8a1 1 0 000 2h12a1 1 0 100-2H7zm0 4a1 1 0 000 2h8a1 1 0 100-2H7z" />
              </svg>
              View
            </span>
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
      <div key={index} className="overflow-hidden rounded-2xl glass-card animate-pulse">
        <div className="h-52 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse-soft" />
        <div className="space-y-4 p-5">
          <div className="h-4 w-20 rounded-full bg-slate-300 animate-pulse-soft" />
          <div className="space-y-3">
            <div className="h-6 w-full rounded-lg bg-slate-200 animate-pulse-soft" />
            <div className="h-6 w-3/4 rounded-lg bg-slate-200 animate-pulse-soft" />
            <div className="h-5 w-2/3 rounded-lg bg-slate-200 animate-pulse-soft" />
          </div>
          <div className="h-12 w-full rounded-lg bg-slate-200 animate-pulse-soft" />
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_85%_20%,_rgba(99,102,241,0.14),_transparent_18%),linear-gradient(180deg,#f8fafc_0%,#eff6ff_52%,#f8fafc_100%)] text-slate-900">
      {notification && (
        <div className="fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6 sm:w-full animate-slide-in-down">
          <div
            className={`rounded-xl border px-5 py-4 shadow-lg backdrop-blur-xl transition notification ${
              notification.type === 'success'
                ? 'notification-success'
                : 'notification-error'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-sm font-semibold flex-1">{notification.text}</p>
            </div>
          </div>
        </div>
      )}

      <main className="app-container flex min-h-screen flex-col items-center space-y-10 py-8 sm:py-12 lg:py-16">
        
        <section role="region" aria-labelledby="hero-title" className="w-full max-w-5xl animate-fade-in-up rounded-[2rem] glass-strong accent-top overflow-hidden">
          <div className="card-body text-center py-8 sm:py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 px-4 py-2 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <p className="text-xs font-semibold tracking-[0.32em] text-sky-700 uppercase">Content Hub</p>
            </div>
            <h1 id="hero-title" className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950">
              Create & Manage Posts
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">A premium workspace for publishing, managing, and sharing your content with ease and elegance.</p>
          </div>
          <div className="card-actions grid gap-4 sm:grid-cols-3 px-6 sm:px-10 py-6">
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-sky-25 px-6 py-6 shadow-sm glass-card hover:shadow-lg transition">
              <p className="text-xs uppercase tracking-[0.24em] font-semibold text-sky-600">Total Posts</p>
              <p className="mt-3 text-4xl font-bold text-slate-950">{totalPosts}</p>
              <p className="mt-2 text-xs text-slate-500">{totalPosts === 1 ? '1 item' : `${totalPosts} items`}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-cyan-25 px-6 py-6 shadow-sm glass-card hover:shadow-lg transition">
              <p className="text-xs uppercase tracking-[0.24em] font-semibold text-cyan-600">Status</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-2xl font-bold text-slate-950">Live</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">Active & Ready</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-25 px-6 py-6 shadow-sm glass-card hover:shadow-lg transition">
              <p className="text-xs uppercase tracking-[0.24em] font-semibold text-indigo-600">Platform</p>
              <p className="mt-3 text-2xl font-bold text-slate-950">Modern</p>
              <p className="mt-2 text-xs text-slate-500">Fullstack Ready</p>
            </div>
          </div>
        </section>

        <section role="region" aria-labelledby="composer-title" ref={composerRef} className="w-full max-w-5xl rounded-[2rem] glass p-8 sm:p-12 lg:mt-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="card-header">
            <div className="flex-1">
              <p className="section-title">Creator Tools</p>
              <h2 id="composer-title" className="mt-3 text-3xl sm:text-4xl font-bold text-slate-950">Create New Post</h2>
              <p className="mt-2 text-base text-slate-600">Share your stories with the world. Add a title, compelling content, and a stunning thumbnail.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="form-label">Post Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a compelling headline..."
                className="w-full rounded-xl glass-input px-5 py-3.5 text-slate-900 text-base outline-none transition duration-200 placeholder:text-slate-400"
              />
              {validationErrors.title && (
                <p className="form-error">
                  <span>⚠</span> {validationErrors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="form-label">Post Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write the details of your post here..."
                rows="8"
                className="w-full rounded-xl glass-input px-5 py-3.5 text-slate-900 text-base outline-none transition duration-200 placeholder:text-slate-400 resize-none"
              />
              {validationErrors.content && (
                <p className="form-error">
                  <span>⚠</span> {validationErrors.content}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="form-label">Thumbnail Image</label>

              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 p-6 transition duration-300 ${
                  isDragging
                    ? 'drag-active'
                    : 'border-dashed border-slate-300 glass-accent hover:border-slate-400'
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

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v12m0 0l-4-4m4 4l4-4M3 15h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="text-base font-semibold text-slate-900">Drag & drop your image</div>
                    <div className="mt-1 text-sm text-slate-600">or click to browse your device</div>
                    <div className="mt-2 text-xs text-slate-500 font-medium">PNG, JPG, WebP — up to 5MB</div>
                  </div>
                </div>

                {formData.image && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/50 p-3 backdrop-blur-sm border border-sky-100">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{formData.image.name}</p>
                      <p className="text-xs text-slate-500">{(formData.image.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}

                {validationErrors.image && (
                  <p className="form-error mt-3">
                    <span>⚠</span> {validationErrors.image}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || Object.values(validationErrors).some(Boolean)}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.25)] transition duration-300 hover:shadow-[0_15_45px_rgba(14,165,233,0.35)] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Publish Post
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50/95 to-red-25/95 backdrop-blur-sm px-5 py-4 shadow-sm animate-fade-in-up">
                <p className="font-semibold text-red-900">Unable to publish</p>
                <p className="mt-1 text-sm text-red-800">{error}</p>
              </div>
            )}
          </form>
        </section>

        <section className="mx-auto mt-12 w-full max-w-5xl rounded-[2rem] p-8 sm:p-12 glass animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="mb-8 text-center">
            <p className="section-title inline-block mb-2">
              Recent Posts
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Your Feed
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
              {hasPosts ? `${totalPosts} item${totalPosts === 1 ? '' : 's'} published` : 'Your posts will appear here'}
            </p>
          </div>

          {fetchError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50/95 to-red-25/95 backdrop-blur-sm px-5 py-4 shadow-sm animate-fade-in-up">
              <p className="font-semibold text-red-900">Unable to load posts</p>
              <p className="mt-1 text-sm text-red-800">{fetchError}</p>
              <button onClick={() => fetchPosts()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{renderSkeletonCards()}</div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 glass-accent px-8 py-16 text-center">
              <div>
                <svg className="mx-auto mb-4 h-20 w-20 text-sky-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-xl font-semibold text-slate-800">No posts yet</p>
                <p className="mt-2 text-slate-600 mb-4">Create your first post to populate the feed</p>
                <button onClick={focusComposer} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition hover:-translate-y-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Post
                </button>
              </div>
            </div>
          ) : (
            <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.slice(0, visibleCount).map((post, index) => (
                <div key={post._id} className="animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                  <PostCard post={post} onDelete={handleDelete} />
                </div>
              ))}
            </div>

            {posts.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition hover:-translate-y-1 active:translate-y-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Load More Posts
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
