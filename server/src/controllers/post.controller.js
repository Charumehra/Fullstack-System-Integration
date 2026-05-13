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

async function getPosts(req, res) {
    try {
        const posts = await postModel.find();   
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { createPost, getPosts };