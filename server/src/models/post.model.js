const mongoose = require('mongoose');
const { image } = require('../config/cloudinary');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }
})

module.exports = mongoose.model('Post', postSchema)