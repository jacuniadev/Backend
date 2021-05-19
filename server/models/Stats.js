const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGODB_HOST, {useNewUrlParser: true, useUnifiedTopology: true});

const schema = new Schema({
    _id:        String,                        // The mongo object ID
    machine_id: String,                        // The machine's ID
    timestamp:  Date,                          // When the stats are added
    ram:        {type: Object, default: null}, // The machines current ram usage
    cpu:        {type: Object, default: null}, // The machines current cpu usage
    network:    {type: Object, default: null}, // The machines current network usage
    disks:      {type: Object, default: null}, // The machines current disk capacity
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

schema.statics.fetchSpecificStats = async function(machineID, timeOffset) {
    if (!timeOffset) timeOffset = 0;
    const timestamp = new Date();
    const filter = { machine_id: machineID, timestamp: { $gte: new Date(timestamp - timeOffset) } };
    let stats = await this.aggregate([
        { $match: filter },
        { $group: {_id: '',totalRxSec: { $sum : "$network.RxSec"}, totalTxSec: { $sum : "$network.TxSec"}}},
        { $project: { _id: 0 } }
    ]);
    return stats;
}

/**
 * @param {Number} timeOffset For how far in the past we want to fetch the statistics from present
 * @returns All machine stats from the database
 */
schema.statics.fetchDailyTraffic = async function(timeOffset) {
    if (!timeOffset) timeOffset = 0;
    const timestamp = new Date();
    const filter = { timestamp: { $gte: new Date(timestamp - timeOffset) } };
    let stats = await this.aggregate([
        { $match: filter },
        { $group: {_id: '',totalRxSec: { $sum : "$network.RxSec"}, totalTxSec: { $sum : "$network.TxSec"}}},
        { $project: { _id: 0 } }
    ]);

    let networkTotal = stats[0].totalRxSec + stats[0].totalTxSec;
    return {
        average_mbps: (networkTotal / (timeOffset / 1000)).toFixed(2),
        total_megabits: networkTotal.toFixed(2),
        total_megabytes: (networkTotal / 8).toFixed(2),
    };
}
let Stats = mongoose.model('Stats', schema);

module.exports = Stats;