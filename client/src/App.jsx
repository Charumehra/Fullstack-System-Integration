import React, { useState, useEffect } from 'react'

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          throw new Error(data.message || 'Failed to load posts');
        }

        setPosts(data);
      })
      .catch((err) => {
        setFetchError(err.message || 'Failed to load posts');
      })
      .finally(() => {
        setLoading(false);
      })
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          throw new Error(data.message || 'Failed to create post');
        }

        setPosts((currentPosts) => [data, ...currentPosts]);
        setTitle('');
        setContent('');
        setMessage('Post created successfully.');
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleDelete = (id) => {
    setError('');
    setMessage('');

    fetch(`http://localhost:5000/api/posts/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          throw new Error(data.message || 'Failed to delete post');
        }

        setPosts((currentPosts) => currentPosts.filter((post) => post._id !== id));
        setMessage('Post deleted successfully.');
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,#eff6ff_0%,#ffffff_45%,#f8fbff_100%)] text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.38em] text-slate-500">
            Posts App
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Posts
          </h1>
        </header>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(37,99,235,0.08)] backdrop-blur-md sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <label htmlFor="title" className="block text-sm font-semibold text-blue-900">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter post title"
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 hover:shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div className="space-y-2.5">
              <label htmlFor="content" className="block text-sm font-semibold text-blue-900">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your post content"
                rows="5"
                className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 hover:shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {submitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>

            {message && (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            )}
            {error && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(37,99,235,0.08)] backdrop-blur-md sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Posts</h2>
          </div>

          {fetchError && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow-sm">
              <p className="font-semibold">Unable to load posts</p>
              <p className="mt-1">{fetchError}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-blue-100 bg-blue-50 px-6 py-16 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
              <p className="text-sm font-medium text-blue-700">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-blue-100 bg-blue-50 px-6 py-16 text-center">
              <p className="text-sm text-blue-700">No posts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-950 sm:text-xl break-words">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 break-words">
                        {post.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(post._id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-blue-100 px-4 py-2 text-sm font-medium text-blue-700 transition duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
