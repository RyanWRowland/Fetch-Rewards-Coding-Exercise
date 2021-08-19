/*
Fetch Rewards Coding Exercise - Backend Software Engineering
Ryan Rowland
*/

const express = require('express');

const app = express();

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// api routes
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));