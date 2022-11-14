const express = require('express')
const router = express.Router()
const Shop = require('../models/Shop')
const Order = require('../models/Order')

// @desc : adding  Shops
// @route : GET /shop/add
router.get('/add',(req,res) => {
    res.render('add',{
        name:req.user.displayName
    });
})

// @desc : generating qr code for shop
// @route : GET /shop/add
router.get('/:id/qr_gen',(req,res) => {
    res.render('qr_gen',{
        id : req.params.id
    });
})

// @desc : add items to shop-id
// @route : GET /shop/id/add_items
router.get('/:id/add_items',(req,res) => {
    res.render('add_items',{
        id : req.params.id,
    });
})

// @desc : edit items to shop-id
// @route : GET /shop/id/add_items
router.get('/:shop_id/edit/:item_id',async (req,res) => {
    const shop = await Shop.findById(req.params.shop_id);
    let item = {}
    for(var i=0;i<shop.items.length;i++){
        console.log(i);
        if(shop.items[i]._id == req.params.item_id){
            item.itemName = shop.items[i].itemName;
            item.itemPrice = shop.items[i].itemPrice;
            item.itemQuantity = shop.items[i].itemQuantity;
            break;
        }
    }
    console.log(item);
    res.render('edit_items',{
        shop_id : req.params.shop_id,
        item_id : req.params.item_id,
        item : item,
    });
})

// @desc : posting items to shop-id
// @route : POST /shop/id/add_items
router.post('/:shop_id/edit/:item_id/ok',async (req,res) => {
    const shop = await Shop.findById(req.params.shop_id);
    let new_shop = {};
    new_shop.shopName = shop.shopName;
    new_shop.shopPhone = shop.shopPhone;
    new_shop.owner = shop.owner;
    new_shop.items = []
    for(var i =0;i<shop.items.length;i++){
        if(shop.items[i]._id == req.params.item_id){
            let new_item = {}
            new_item._id = shop.items[i]._id;
            new_item.itemName = req.body.itemName;
            new_item.itemPrice = req.body.itemPrice;
            new_item.itemQuantity = req.body.itemQuantity;
            new_shop.items.push(new_item);
        }
        else{
            new_shop.items.push(shop.items[i]);
        }
    }
    console.log(new_shop);
    await Shop.findOneAndUpdate({_id : req.params.shop_id },new_shop,{
        new:true,
        runValidators:true
    });
    res.redirect(`/shop/${req.params.shop_id}`)
})

// @desc : view shop detials from shopkeeper side
// @route : GET /shop/:id
router.get('/:id', async(req,res) => {
    try{
        let shop = await Shop.findById(req.params.id)
            .populate('owner')
            .lean()
        res.render("show_shop",{
            shop : shop,
            shop_id : shop._id
        });
    }catch(err){
        console.error(err);
    }
})

// @desc : view items in shop :id
// @route : GET /shop/:id/view_items
router.get('/:id/view_items', async(req,res) => {
    try{
        let shop = await Shop.findById(req.params.id)
            .populate('owner')
            .lean()
        res.render("shop_items_view",{
            shop
        });
    }catch(err){
        console.error(err);
    }
})

// @desc : view orders in shop :id
// @route : GET /shop/:id/view_items
router.get('/:id/orders', async(req,res) => {
    try{
        let order = await Order.find({shopId : req.params.id}).populate('customerId').lean();
        for(var i=0;i<order.length;i++){
            order[i].date = order[i].createdAt.toLocaleDateString("en-US");
            order[i].time = order[i].createdAt.toLocaleTimeString("en-US");
        }
        let shop = await Shop.findById(req.params.id).lean()
        res.render("shop_orders",{
            order : order,
            name : req.user.displayName,
            shopName : shop.shopName
        });
    }catch(err){
        console.error(err);
    }
})

// @desc : delete shop with :id
// @route : DELETE /shop/:id/delete
router.post('/:id/delete', async(req,res) => {
    try{
        await Shop.remove({_id : req.params.id});
        console.log("deleted ok");
        res.redirect("/shopkeeper")
    }catch(err){
        console.error(err);
    }
})

// @desc : delete items :item_id in shop :shop_id
// @route : DELETE /shop/:id/delete
router.post('/:shop_id/delete/:item_id', async(req,res) => {
    try{
        console.log(req.params.shop_id);
        let shop = await Shop.findById(req.params.shop_id);
        console.log(shop);
        let updated = {};
        updated.shopName = shop.shopName;
        updated.shopPhone = shop.shopPhone;
        updated.owner = shop.owner;
        updated.items = []
        for(var i = 0; i<shop.items.length;i++){
            if(shop.items[i]._id != req.params.item_id){
                updated.items.push(shop.items[i]);
            }
        }
        shop = await Shop.findOneAndUpdate({_id : req.params.shop_id },updated,{
            new:true,
            runValidators:true
        });
        console.log("ok");
        res.redirect(`/shop/${req.params.shop_id}`)
    }catch(err){
        console.error(err);
    }
})


// @desc : post Shops form
// @route : POST /shop/ok
router.post('/ok',async (req,res) => {
    try{
        req.body.owner = req.user.id;
        console.log("ok route");
        await Shop.create(req.body);
        res.redirect('/shopkeeper');
    }catch(err){
        console.error(err);
    }
})

// @desc : post items form
// @route : POST /shop/:id/ok
router.post('/:id/ok',async (req,res) => {
    try{
        let shop = await Shop.findById(req.params.id);
        new_shop = {}
        new_shop.shopName = shop.shopName;
        new_shop.owner = shop.owner;
        new_shop.shopPhone = shop.shopPhone;
        shop.items.push(req.body);
        new_shop.items = shop.items;
        shop = await Shop.findOneAndUpdate({_id : req.params.id },new_shop,{
            new:true,
            runValidators:true
        });
        // console.log(new_shop);
        // await Shop.findById(req.params.id).items.Create(req.body);
        res.redirect('/shopkeeper');
    }catch(err){
        console.error("error");
    }
})





module.exports = router