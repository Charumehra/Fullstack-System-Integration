const express = require('express');
const multer = require('multer');
const postController = require('../controllers/post.controller');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/posts', upload.single('image'), postController.createPost);
router.get('/posts', postController.getPosts);
router.delete('/posts/:id', postController.deletePost);

module.exports = router;