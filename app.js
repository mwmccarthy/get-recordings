var MongoClient = require("mongodb").MongoClient
  , fs = require("fs")
  , spawn = require("child_process").spawn
  , moment = require("moment")
  , config = require("./config");

// Connection URL
var url = "mongodb://localhost:7441/av";

// Use connect method to connect to the Server
MongoClient.connect(url).then(fulfill, reject);

function fulfill(db) {
  console.log("Opened connection to database.");

  db.collection("recording")
    .find({ "startTime" : { $gt : hoursAgo(config.hours) } })
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
      , argList = []
      , listname = obj["_id"].toString()
      , ffmpeg = null
      , fd = fs.openSync(listname, "w")
      , log = fs.closeSync(fs.openSync("ffmpeg.log", "w"))
      , d = new Date(obj["startTime"])
      , outf = '';

    obj["playlist"].forEach(function(fileObj) {
      var fullpath = path + "/" + fileObj["subPath"] + "/" + fileObj["fileName"];
      fs.appendFileSync(listname, "file '" + fullpath + "'\n");
    });
    fs.closeSync(fd);

    outf = moment(d).format("YYYY-MM-DD HH:mm") + " " + obj["cameraName"] + ".mp4";

    argList.push("-f", "concat", "-i", listname, "-c",
                 "copy", "-bsf:a", "aac_adtstoasc",
                 config.path + "/" + outf);

    ffmpeg = spawn("ffmpeg", argList);
    ffmpeg.stdout.on("data", function (data) {
      console.log("stdout: " + data);
    });
    ffmpeg.stderr.on("data", function (data) {
      fs.appendFileSync("ffmpeg.log", data);
    });
    ffmpeg.on("start", function () {
      console.log("Retrieving files.");
    });
    ffmpeg.on("close", function (code) {
      fs.unlinkSync(listname);
      console.log("child process exited with code " + code);
    });
  });
}
