var MongoClient = require("mongodb").MongoClient
  , ffmpeg = require('fluent-ffmpeg');

// Connection URL
var url = "mongodb://localhost:7441/av";

// Use connect method to connect to the Server
MongoClient.connect(url).then(fulfill, reject);

function fulfill(db) {
  console.log("Opened connection to database.");

  db.collection("recording")
    .find({ "startTime" : { $gt : hoursAgo(process.argv[2]) } })
    .toArray()
    .then(function(result) {
      db.close();
      console.log("Closed connection to database.");
      getRecordings(result);
    }, reject);
}

function reject(err) {
  console.log(err);
}

function hoursAgo(h) {
  return Date.now() - Number(h) * 60 * 60 * 1000;
}

function getRecordings(recArray) {
  recArray.forEach(function(obj) {
    var path = obj["path"]
      , cmd = ffmpeg();
    obj["playlist"].forEach(function(fileObj) {
      var fullpath = path;
      fullpath += "/" + fileObj["subPath"];
      fullpath += "/" + fileObj["fileName"];
      console.log(fullpath);
      cmd.input(fullpath);
    });
    cmd.on("error", function(err, stdout, stderr) {
      console.log("An error occurred: " + err.message);
      console.log("ffmpeg std out: " + stdout);
      console.log("ffmpeg std err: " + stderr);
    }).on("end", function() {
      console.log("Merging finished!");
    }).on("progress", function(progress) {
      console.log("Processing: " + progress.percent);
    }).on("start", function() {
      console.log("Starting merge.");
    }).mergeToFile("outfile.mkv");
  });
}
