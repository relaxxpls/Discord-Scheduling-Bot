const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username : mongoose.SchemaTypes.String,
    DiscordID : {
        type : mongoose.SchemaTypes.String,
        required : true
    },
});

module.exports = mongoose.model('User',UserSchema);