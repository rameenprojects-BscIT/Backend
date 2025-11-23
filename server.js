const express = require("express");
// creating an express application instance to define routes
const app = express();
app.set('PORT', 3000);

// added middleware to the app that automatically parses incoming JSON requests
app.use(express.json());

// setting the cors headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
 
    next();
});

const MongoClient = require("mongodb").MongoClient;

let db;

MongoClient.connect('mongodb+srv://rg818:rJun2005Mongo@cst3144-m00914912.zzz7nsb.mongodb.net/', 
    (err, client) => {
        db = client.db("AfterschoolApp");
    });

app.listen(3000, () => {
    console.log("express.js server is running on localhost:3000");
});