import React, { useState, useEffect } from 'react'

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Posts</h1>
              <p className="text-base text-gray-600">Discover amazing content</p>
            </div>
            <div className="text-right text-gray-600">
              <p className="text-base">Total Posts: <span className="font-semibold text-gray-900">{posts.length}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 py-24">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">📝</div>
            <p className="text-3xl text-gray-700">No posts yet</p>
            <p className="text-gray-600 mt-3">Check back soon for amazing content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post) => (
              <div
                key={post._id}
                className="relative bg-white rounded-2xl p-10 border border-gray-200 shadow-sm hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-block px-5 py-3 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full">
                    Article
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 overflow-hidden">
                  {post.title}
                </h2>

                <p className="text-gray-700 mb-8 leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <span className="text-sm text-gray-500">ID: {post._id?.substring(0, 8)}...</span>
                  <button className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-8 text-center text-gray-600">
          <p className="text-sm">© 2026 Posts App. Built with React & Vite.</p>
        </div>
      </div>
    </div>
  )
}

export default App
