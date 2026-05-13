const express = require('express');
const postController = require('../controllers/post.controller');

const router = express.Router();

router.post('/posts', postController.createPost);
router.get('/posts', postController.getPosts);

module.exports = router;