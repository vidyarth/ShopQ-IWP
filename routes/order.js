const express = require('express')
const router = express.Router()
const Shop = require('../models/Shop')
const Order = require('../models/Order')
const nodemailer = require('nodemailer');
const {ensureAuth, ensureGuest} = require('../middleware/auth')

// @desc : Creds for shopq.services mail app
let mailTransporter = nodemailer.createTransport({
    service : "gmail",
    auth:{
        user:"shopq.services@gmail.com",
        pass:"skhkkanwwmaufhbt",
    }
})

// @desc : structure of the mail
let details ={
    from:"shopq.services@gmail.com",
    subject:"ShopQ order - Regarding",
}

// // @desc : adding  Shops
// // @route : GET /order/:id
// router.get('/order/:id',ensureAuth,async (req,res) => {
//     const shop = await Shop.findById(req.params.id);
//     res.render('order',{
//         name:req.user.displayName,
//         shop : shop
//     });
// })

// @desc : view the customer orders
// @route : GET /order/cust-order
router.get('/cust-orders/',ensureAuth,async (req,res) => {
    const order = await Order.find({customerId : req.user._id})
    .populate("shopId").lean();
    for(var i=0;i<order.length;i++){
            order[i].date = order[i].createdAt.toLocaleDateString("en-US");
            order[i].time = order[i].createdAt.toLocaleTimeString("en-US");
    }
    let shop = await Shop.findById(req.params.id).lean()
    res.render('cust-order',{
        name:req.user.displayName,
        orders : order
    });
})

// @desc : Toggling delivered to True and sending delivered mail
// @route : GET /order/:id/deliver
router.get('/:id/deliver',ensureAuth,async (req,res) => {
    const order1 = await Order.findById(req.params.id).lean();
    var new_order = order1;
    new_order.delivered = true
    console.log(new_order);
    await Order.findOneAndUpdate({_id : req.params.id },new_order,{
        new:true,
        runValidators:true
    });
    const order = await Order.findById(req.params.id).populate("shopId").lean();
    const order2 = await Order.findById(req.params.id).populate("customerId").lean();
    var mailContent = `Your order at ${order.shopId.shopName} is Delivered \n Thank you for shopping with us! `;
    var orderDetails = ` Order id : ${order._id} \n Customer Name : ${req.user.displayName} \n Date : ${order.createdAt.toLocaleDateString("en-US")} \n Time : ${order.createdAt.toLocaleTimeString("en-US")} \n Shop Name : ${order.shopId.shopName} \n Shop Phone : ${order.shopId.shopPhone}` ;
    var footer = `\n\n\n\n Regards,\n Team ShopQ \n `
    const to_mail = order2.customerId.emailId;
    details.to = to_mail;
    details.text = mailContent + '\n' + orderDetails + '\n' + footer;
    console.log(details);
    mailTransporter.sendMail(details,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log("Mail sent successfully");
        }
    });
    res.redirect(`/shop/${order.shopId._id}/orders`);
})

// @desc : sending alert mail for remainder
// @route : GET /order/:id/alert
router.get('/:id/alert',ensureAuth,async (req,res) => {
    const order = await Order.findById(req.params.id).populate("shopId").lean();
    const order2 = await Order.findById(req.params.id).populate("customerId").lean();
    var mailContent = `Your order at ${order.shopId.shopName} is ready for collection! `;
    var orderDetails = ` Order id : ${order._id} \n Customer Name : ${req.user.displayName} \n Date : ${order.createdAt.toLocaleDateString("en-US")} \n Time : ${order.createdAt.toLocaleTimeString("en-US")} \n Shop Name : ${order.shopId.shopName} \n Shop Phone : ${order.shopId.shopPhone}` ;
    var footer = `\n\n\n\n Regards,\n Team ShopQ \n `
    const to_mail = order2.customerId.emailId;
    details.to = to_mail;
    details.text = mailContent + '\n' + orderDetails + '\n' + footer;
    console.log(details);
    mailTransporter.sendMail(details,(err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log("Mail sent successfully");
        }
    });
    
    res.redirect(`/shop/${order.shopId._id}/orders`);


})


// @desc : Posting the orders in databse
// @route : GET /order/:id/ok
router.post('/:id/ok',ensureAuth,async (req,res) => {
    try{
        const new_entry = {}
        const itemsList = []
        // console.log(req.body);
        var shop = await Shop.findById(req.params.id).lean();
        var new_shop = shop;
        console.log(req.body);
        if(shop.items.length == 1){
            req.body.itemId = [req.body.itemId];
        }
        console.log(req.body);
        for(var idx =0; idx<req.body.itemId.length;idx++){
            const temp = {}
            temp.itemId = req.body.itemId[idx];
            temp.itemQuantity = req.body.itemQuantity[idx];
            new_shop.items[idx].itemQuantity -= temp.itemQuantity;
            itemsList.push(temp);
        }
        new_shop.orderCount += 1;
        shop = await Shop.findOneAndUpdate({_id : req.params.id },new_shop,{
            new:true,
            runValidators:true
        });
        new_entry.customerId = req.user.id;
        new_entry.shopId = req.params.id;
        new_entry.itemsOrdered = itemsList;
        // req.body.owner = req.user.id;
        console.log(new_entry);
        await Order.create(new_entry,(err,result) => {
            if(err){
                console.error(err);
            }
            else{
                res.redirect(`/order/${result._id}/view`)
            }
        });
        // res.redirect(`/order/${}/`);
    }catch(err){
        console.error(err);
    }
})

// @desc : View order with :id
// @route : GET /order/:id/view
router.get('/:id/view',ensureAuth,async (req,res) => {
    const order = await Order.findById(req.params.id)
        .populate("shopId").lean();
    const itemsInOrder = []
    var order_total = 0;
    for(var i=0;i<order.shopId.items.length;i++){
        try{
            temp = {}
            temp.itemId = order.shopId.items[i]._id;
            temp.itemName = order.shopId.items[i].itemName;
            temp.itemPrice = order.shopId.items[i].itemPrice;
            temp.itemQuantity = order.itemsOrdered[i].itemQuantity;
            temp.total = temp.itemPrice * temp.itemQuantity;
            order_total += temp.total;
            if(temp.itemQuantity != 0){
                itemsInOrder.push(temp);
            }
        }
        catch(err){
            ;
        }

    }
    console.log(temp)
    res.render("view_order",{
        order : order,
        itemsInOrder : itemsInOrder,
        name : req.user.displayName,
        order_total : order_total,
    })

})


module.exports = router