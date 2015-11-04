var MongoClient = require("mongodb").MongoClient
  , fs = require("fs")
  , spawn = require("child_process").spawn;

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
      , argList = ["-f", "concat", "-i"]
      , listname = obj["_id"].toString()
      , ffmpeg;

    var fd = fs.openSync(listname, "w");

    obj["playlist"].forEach(function(fileObj) {
      var fullpath = path;
      fullpath += "/" + fileObj["subPath"];
      fullpath += "/" + fileObj["fileName"];
      fs.appendFile(listname, "file '" + fullpath + "'\n");
    });

    fs.closeSync(fd);

    argList.push(listname, "-c", "copy", "-bsf:a", "aac_adtstoasc");
    argList.push(listname + ".mp4");

    ffmpeg = spawn("ffmpeg", argList);

    ffmpeg.stdout.on("data", function (data) {
        console.log("stdout: " + data);
    });

    ffmpeg.stderr.on("data", function (data) {
        console.log("stderr: " + data);
    });

    ffmpeg.on("close", function (code) {
        fs.unlinkSync(listname);
        console.log("child process exited with code " + code);
    });
  });
}
