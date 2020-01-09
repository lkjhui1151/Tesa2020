ar mqtt   = require('mqtt');
var client = mqtt.connect('mqtt://202.139.192.75', {
  clientId: "tgr08"
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

client.on('connect', function() {
  console.log("MQTT Connect. tgr08 ");
  client.subscribe('tgr2020/pm25/data/#');
  client.subscribe('tgr2020/track/data/#');

})

client.on('message', function(topic, message) {
  // message is Buffer
  console.log(message.toString() + " " + "TGR08")
  //console.log("TGR24");
  MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("tgr08");
    var doc = {
      topic: topic,
      message,
      message
    };
    dbo.collection("raw_data").insertOne(doc, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  })
})
