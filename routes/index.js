const express = require('express')
const router = express.Router()
const Shop = require('../models/Shop')
const {ensureAuth, ensureGuest} = require('../middleware/auth')

// @desc : intro page (anime JS)
// @route : GET /
router.get('/',(req,res) => {
    res.render('intro',{
        layout:"intro",
    });
})

// @desc : login page
// @route : GET /login
router.get('/login',ensureGuest,(req,res) => {
    res.render('login',{
        layout:"login",
    })
})

// @desc : Home page (Landing page Slider JS)
// @route : GET /home
router.get("/home",ensureAuth,(req,res) => {
    console.log(req.user.emailId);
    res.render('home',{
        name : req.user.displayName
    });
})

// @desc : Customer dashboard
// @route : GET /customer
router.get("/customer",ensureAuth,async (req,res) => {
    res.render('qr_scan',{
    });
})

// @desc : About us page
// @route : GET /about
router.get("/about",async (req,res) => {
    res.render('about_us',{
    });
})


// @desc : shopkeeper dashboard
// @route : GET /shopkeeper
router.get("/shopkeeper",ensureAuth,async (req,res) => {
    try{
        const shops = await Shop.find({owner : req.user.id})
        .populate("owner").lean()
        return res.render('shopkeeper',{
            name : req.user.displayName,
            shops : shops
        });
    }catch(err){
        console.error(err);
    }
    res.render('shopkeeper');
})



module.exports = router