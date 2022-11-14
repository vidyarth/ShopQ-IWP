const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId:{
        type: 'string',
        required: true
    },
    displayName:{
        type: 'string',
        required: true
    },
    image:{
        type: 'string',
        required: true
    },
    createdAt:{
        type: Date,
        default:Date.now()
    },
    emailId:{
        type: 'string',
        required: true
    }
     
})

module.exports =mongoose.model('User',UserSchema);