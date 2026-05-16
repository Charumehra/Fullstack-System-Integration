import React, { useEffect, useState } from "react";

import {
  UploadCloud,
  Plus,
  ImageIcon,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";

const API_BASE_URL = "https://fullstack-system-integration-1.onrender.com/api/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_BASE_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files?.[0] || null,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.image) {
      return alert("Please fill all fields");
    }

    try {
      setSubmitting(true);

      const uploadData = new FormData();

      uploadData.append("title", formData.title);
      uploadData.append("content", formData.content);
      uploadData.append("image", formData.image);

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setPosts([data, ...posts]);

      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setPosts(posts.filter((post) => post._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 py-10 flex justify-center">
      <main className="w-full max-w-6xl px-4 space-y-14">

        <section className="relative overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_80px_rgba(15,23,42,0.08)] p-10 sm:p-14 text-center">

          <div className="absolute top-0 right-0 h-72 w-72 bg-sky-400/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 h-72 w-72 bg-indigo-400/10 blur-3xl rounded-full"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              Fullstack Content Platform
            </div>

            <h1 className="mt-6 text-5xl sm:text-6xl font-black text-slate-900 leading-tight">
              Create & Publish
              <span className="block bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Modern Posts
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-8">
              Beautiful and professional dashboard for managing your content with ease.
            </p>
          </div>
        </section>

        <section className=" relative overflow-hidden rounded-[2.5rem] border border-sky-200 bg-white shadow-[0_25px_100px_rgba(14,165,233,0.15)]">

          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-indigo-500/5"></div>

          <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center">

            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
                Create Post
              </p>

              <h2 className="mt-3 text-4xl font-black text-slate-900">
                Publish New Content
              </h2>

              <p className="mt-3 text-slate-600 text-lg">
                Add your title, content, and thumbnail image below.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-3xl space-y-8"
            >

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Post Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter a beautiful post title..."
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-lg text-slate-900 outline-none transition duration-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Post Content
                </label>

                <textarea
                  name="content"
                  rows="7"
                  placeholder="Write your amazing content here..."
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-lg text-slate-900 outline-none resize-none transition duration-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Thumbnail Image
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-gradient-to-br from-sky-50 to-indigo-50 px-8 py-14 transition hover:border-sky-500 hover:from-sky-100 hover:to-indigo-100">

                  <div className="rounded-full bg-white p-5 shadow-lg">
                    <UploadCloud className="h-10 w-10 text-sky-600" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-800">
                    Upload Thumbnail
                  </h3>

                  <p className="mt-2 text-slate-500">
                    Click to browse image
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {formData.image && (
                  <p className="mt-4 text-center text-sm font-medium text-sky-700">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-5 text-lg font-bold text-white shadow-[0_15px_40px_rgba(14,165,233,0.3)] transition duration-300 hover:scale-[1.01] disabled:opacity-70"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publishing...
                  </span>
                ) : (
                  "Publish Post"
                )}
              </button>
            </form>
          </div>
        </section>

        <section>

          <div className=" mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600">
              Recent Posts
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-900">
              Content Feed
            </h2>

            <p className="mt-3 text-lg text-slate-600">
              {posts.length} Published Posts
            </p>
          </div>

          {fetchError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
              {fetchError}
            </div>
          )}

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[2rem] bg-white shadow-lg animate-pulse"
                >
                  <div className="h-60 bg-slate-200"></div>

                  <div className="space-y-4 p-6">
                    <div className="h-6 rounded bg-slate-200"></div>
                    <div className="h-4 rounded bg-slate-200"></div>
                    <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-300 bg-white/70">
              <div className="text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-100">
                  <Plus className="h-10 w-10 text-sky-600" />
                </div>

                <h3 className="mt-6 text-3xl font-black text-slate-900">
                  No Posts Yet
                </h3>

                <p className="mt-3 text-slate-500 text-lg">
                  Create your first post now.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {posts.slice(0, visibleCount).map((post) => (
                  <article
                    key={post._id}
                    className="group overflow-hidden bg-white border border-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(15,23,42,0.14)]"
                  >
                    <div className="relative h-60 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 text-slate-500">
                          <ImageIcon className="h-10 w-10" />
                          <p className="text-sm font-medium">No Image</p>
                        </div>
                      )}

                      <button
                        onClick={() => handleDelete(post._id)}
                        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                        <FileText className="h-3.5 w-3.5" />
                        POST
                      </div>

                      <h3 className="mt-4 text-2xl font-black leading-tight text-slate-900 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="mt-4 line-clamp-3 text-slate-600 leading-7">
                        {post.content}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {posts.length > visibleCount && (
                <div className="mt-14 flex justify-center">
                  <button
                    onClick={() => setVisibleCount(visibleCount + 6)}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-xl transition duration-300 hover:scale-105"
                  >
                    Load More Posts
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
