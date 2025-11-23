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

// setting the root route
app.get('/', (req, res, next) => {
    res.send("select a collection, e.g., /collection/messages")
});

// setting the middleware that will automatically run when the route has the collection name
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// getting all items in the collection, by converting the result to array and sedning it as response
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next (e);
        res.send(results);
    });
});

// importing mongodb object id to query documents by their ids
const ObjectID = require('mongodb').ObjectID;

// getting one lesson/document by its mongodb objectId
app.get('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.findOne({_id: new ObjectID(req.params.id)},(e,result)=>{
        if (e) return next(e)
            res.send(result)
    })
});

// setting the post to insert the orders to the collections
app.post('/collection/:collectionName', (req, res, next)=>{
    req.collection.insert(req.body, (e, results) => {
        if (e) return next (e)
            res.send(results.ops)
    });
});


app.put('/collection/:collectionName/:id',(req,res,next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false}, 
        (e, result) => {
            if (e) return next (e)
                res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
        
    });
});

app.listen(3000, () => {
    console.log("express.js server is running on localhost:3000");
});