const express = require('express');
const cors = require('cors');
const postRoutes = require('./src/routes/post.route');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', postRoutes);

module.exports = app;