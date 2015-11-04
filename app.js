var MongoClient = require("mongodb").MongoClient
  , FfmpegCommand = require('fluent-ffmpeg');

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
    //console.log(obj);
    var path = obj["path"]
      , cmd = new FfmpegCommand();
    obj["playlist"].forEach(function(fileObj) {
      var fullpath = path;
      fullpath += "/" + fileObj["subPath"];
      fullpath += "/" + fileObj["fileName"];
      console.log(fullpath);
      cmd.input(fullpath);
      //console.log(cmd);
    });
    cmd.on("error", function(err, stdout, stderr) {
      console.log("An error occurred: " + err.message);
      console.log("ffmpeg std out: " + stdout);
      console.log("ffmpeg std err: " + stderr);
    }).on("end", function() {
      console.log("Merging finished!");
    }).on("progress", function(progress) {
      console.log("Processing: " + progress.percent + "% done");
    }).on("start", function() {
      console.log("Starting merge.");
    });
    //cmd.ffprobe(0, function(err, data) { console.log(data); });
    cmd.output("outfile.mkv");
    //cmd.run();
    console.log("ran");
    //console.log(cmd);
    //console.log(obj["playlist"]);
    // console.log(obj["cameraName"] + " " + new Date(obj["startTime"]));
  });
}
