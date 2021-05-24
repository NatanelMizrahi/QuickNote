const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://nmiz:qweqwe3@quicknote.lfbve.mongodb.net/quicknote?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("quicknote").collection("users");
    // perform actions on the collection object
    collection.findOne({}, console.log);
    // client.close();
});
