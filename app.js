const express = require('express');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.listen(process.env.PORT || 3000, () => {
    console.info('app started at port:3000');
});