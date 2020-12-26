const express = require("express");
const cors = require('cors');
const corsOptions = {
    origin: [
        'http://posteditor-frontend.herokuapp.com',
        'http://posteditor-backend.herokuapp.com'
    ]
}

const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const fileUpload = require('express-fileupload');

const PORT = process.env.PORT || 3000
const app = express();
const jsonParser = express.json();

const mongoClient = new MongoClient("mongodb+srv://admin:txjfnhnkJ6aYPfV@cluster0.q77ye.mongodb.net/", { useNewUrlParser: true });

let dbClient;

app.use(cors());
app.use('/static', express.static(__dirname + "/public"));
app.use(express.json());
app.use(fileUpload({
    createParentPath: true
}));


mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.postsDb = client.db("posteditor").collection("articles");
    app.listen(PORT, function() {
        console.log("Server started.");
    });
}); 

app.get("/api/posts", function(req, res) {
    const collection = req.app.locals.postsDb;
    collection.find({}).toArray(function(err, posts) {
        if(err) return console.log(err);
        res.send(posts)
    });
});

app.get("/api/posts/:id", function(req, res) {
    const collection = req.app.locals.postsDb;

    collection.findOne({ _id: req.params.id }, function(err, post) {
        if(err) return console.log(err);
        res.send(post);
    });
});

app.put("/api/posts/:id", function(req, res) {
    const collection = req.app.locals.postsDb;

    collection.updateOne(
        {
            _id: req.params.id
        },
        {
            $set: {
                article: req.body.article
            }
        },
        function(err, post) {
            if(err) return console.log(err);
            res.send({id: req.params.id});
        });
});


app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            console.log(req.files);
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            const upload = req.files.upload;

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            // avatar.mv('./uploads/' + avatar.name);

            upload.mv(`./public/${upload.name}`);


            res.send({
                "url": `http://posteditor-backend.herokuapp.com/static/${upload.name}`
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
