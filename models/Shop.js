const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemName:{
        type: 'string',
        required: true
    },
    itemImage:{
        type: 'string',
        required: false,
    },
    itemPrice:{
        type: 'number',
        required: true
    },
    itemQuantity:{
        type: 'number',
        required: true,
    }
})
const ShopSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    shopName:{
        type: 'string',
        required: true
    },
    shopPhone:{
        type: 'number',
        required: true
    },
    orderCount:{
        type: 'number',
        default:0
    },
    createdAt:{
        type: Date,
        default:Date.now()
    },
    items:[itemSchema],
})

module.exports =mongoose.model('Shop',ShopSchema);