const postModel = require('../models/post.model');

async function createPost(req, res) {
    try {
        const { title, content } = req.body;
        const newPost = new postModel({ title, content });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }   
}

module.exports = { createPost }