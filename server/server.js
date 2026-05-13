require('dotenv').config
const app = require('./app');
const connnectDB = require('./src/config/db')


connnectDB();   
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});