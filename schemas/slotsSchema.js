const mongoose = require('mongoose');

const timingSchema = new mongoose.Schema({
    timing : mongoose.SchemaTypes.String,
    DiscordID : {
        type : mongoose.SchemaTypes.String,
        required : true
    },
    frequency : {
        type : mongoose.SchemaTypes.Number,
    }
});

module.exports = mongoose.model('Slot',timingSchema);