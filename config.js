module.exports={
    // MONGODB_URI: "mongodb+srv://nmiz:qweqwe3@quicknote.lfbve.mongodb.net/quicknote?retryWrites=true&w=majority", // "mongodb://localhost:27017/quicknote"
    // mongojs module and Mongo 4.4 compatibility issue.
    // [resolution - custom URI]:
    // Connect via mongo shell:
    // mongo "mongodb+srv://quicknote.lfbve.mongodb.net/quicknote" -u <user> -p <password>
    // copy link from log: "connecting to: mongodb://<link>
    // set MONGODB_URI to "mongodb://<user>:<password>@<link>
    MONGODB_URI: "mongodb://admin:qweqwe3@quicknote-shard-00-00.lfbve.mongodb.net:27017,quicknote-shard-00-02.lfbve.mongodb.net:27017,quicknote-shard-00-01.lfbve.mongodb.net:27017/quicknote?authSource=admin&compressors=disabled&gssapiServiceName=mongodb&replicaSet=atlas-7opq7x-shard-0&ssl=true",
};
