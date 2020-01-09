const fs = require('fs')
const ini = require('ini')
const mongodb = require('mongodb')
const express = require('express')
const app = express()
const port = 80

var config = ini.parse(fs.readFileSync(__dirname + '/config.ini', 'utf-8'))
var mongo_client = mongodb.MongoClient
var db

mongo_client.connect(config.mongodb.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(error, connection) {
  if (error) {
    console.error(error)
  } else {
    db = connection.db("tgr08");
  }
})
app.get('/', function(req, res) {
  db.collection("sensor_clean_data").find({
    sensor_type: 'pm25'
  }).toArray((error, result) => {
    if (error) {
      return res.status(500).send(error);
    }
    res.send(result);
  });
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

