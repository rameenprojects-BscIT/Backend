const express = require("express");
// creating an express application instance to define routes
const app = express();

// added middleware to the app that automatically parses incoming JSON requests
app.use(express.json());
var path = require("path");
var fs = require("fs");
const cors = require("cors");
// setting the cors headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use(cors());

// the 'logger' middleware
app.use(function(req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect('mongodb+srv://rg818:rJun2005Mongo@cst3144-m00914912.zzz7nsb.mongodb.net/', (err, client) => {
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

// deleting an object with objectID
app.delete('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.deleteOne({_id: new ObjectID(req.params.id)},(e,result)=>{
        if (e) return next(e)
             res.send((result.result.n === 1) ? {msg: 'success'} : {msg:'error'})
    });
});

app.get('/search', (req, res, next) => {
    const query = req.query.q;

    if(!query) {
        return res.send([]);
    }

    db.collection("lessons")
        .find({subject: query})
        .toArray((err, results) => {
            if (err) return next (err);
            res.send(results);
        });

});

// static file middleware
app.use(function(req,res,next){
    var filePath = path.join(__dirname,"static",req.url);
    fs.stat(filePath, function(err, fileInfo){
        if (err){
            next();
            return;
        }

        if (fileInfo.isFile()){
            res.sendFile(filePath);
        } else{
            next();
        }

    });
});

app.use(function(req, res){
    res.status(404);
    res.send("File not found!");
});


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("App started on port: " + port);
});