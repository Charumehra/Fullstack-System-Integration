const uploadToCloudinary = require("../utils/uploadToCloudinary");
const postModel = require("../models/post.model");

async function createPost(req, res) {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }
    const result = await uploadToCloudinary(req.file.buffer);

    const newPost = new postModel({
      title,

      content,

      image: result.secure_url,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getPosts(req, res) {
  try {
    const posts = await postModel.find().sort({ _id: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const deletedPost = await postModel.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = { createPost, getPosts, deletePost };
