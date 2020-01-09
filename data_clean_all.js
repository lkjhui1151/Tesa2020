const fs = require('fs')
const ini = require('ini')
const mongodb = require('mongodb')

var config = ini.parse(fs.readFileSync(__dirname + '/config.ini', 'utf-8'))

const MongoClient = require('mongodb').MongoClient;

var db

MongoClient.connect(config.mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (error, connection) {
    if (error) {
        console.error(error)
    } else {
        db = connection.db("tgr08");
    }
})

async function cleansing() {

    try {
        let collection = db.collection('sensor_data');
        let query = { sensor_type: "pm25", sensor_type: "track", cleaned: { $ne: true } }
        await collection.find(query).sort({ _id: 1 }).limit(10).toArray(function (err, result) {
            if (err) throw err;

            result.forEach(async (data) => {
                await updateCleanStatus(data)
                await updateCleanCol(data)
            })
        });
    } catch (err) {
        console.log(err);
    }
}

async function updateCleanStatus(data) {
    try {
        await db.collection('sensor_data').updateOne({ _id: data._id }, { $set: { 'cleaned': true } })
        console.log("Cleaned Raw Data By ID " + data._id)
    } catch (e) {
        console.log(e)
    }
}

async function updateCleanCol(data) {
    try {
        await db.collection('sensor_data').aggregate([{
            $match: { "_id": data._id }
        },
        {
            $project: {
                _id: 0,
                ts: 1,
                sensor_id: 1,
                'device_id': '$data.DevEUI_uplink.DevEUI',
                'pm25': '$data.DevEUI_uplink.payload_hex',
                "location": {
                    "LAT": '$data.DevEUI_uplink.LrrLAT',
                    "long": '$data.DevEUI_uplink.LrrLON'
                },
                sensor_type: 1
            }
        }
        ]).toArray((err, result) => {
            result.forEach(async (data) => {
                console.log('check', data.sensor_type)
                if (data.sensor_type == 'pm25' && data.sensor_type == 'track') {
                    console.log('complete clean', data.sensor_type)
                    await db.collection('sensor_clean_data').insertOne(data)
                }
            })
        });
        console.log("Cleansing Data  ID  :" + data._id)
    } catch (e) {
        console.log(e)
    }
}

setInterval(cleansing, 1000);


