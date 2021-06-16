const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/posts', (req, res) => {
    res.render('posts');
});

app.listen(3000, () => {
    console.info('app started at port:3000');
});