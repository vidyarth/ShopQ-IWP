const nodemailer = require('nodemailer');

let mailTransporter = nodemailer.createTransport({
    service : "gmail",
    auth:{
        user:"shopq.services@gmail.com",
        pass:"skhkkanwwmaufhbt",
    }
})

let details ={
    from:"shopq.services@gmail.com",
    to:"gsvidyarth2002@gmail.com",
    subject:"ShopQ order - Regarding",
    text:"Your shopQ order at store ABC is ready for collection!",
}

