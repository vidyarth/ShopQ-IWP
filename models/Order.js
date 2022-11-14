const mongoose = require('mongoose');
const itemOrderSchema = new mongoose.Schema({
    itemId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Shop.items'
    },
    itemQuantity:{
        type: 'number',
        required: true,
    }
})
const OrderSchema = new mongoose.Schema({
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    shopId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Shop'
    },
    itemsOrdered:[itemOrderSchema],
    delivered:{
        type:"boolean",
        default: false
    },
    createdAt:{
        type: Date,
        default:Date.now()
    }


     
})

module.exports =mongoose.model('Order',OrderSchema);