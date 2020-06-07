const express = require('express')
const multer = require('multer')
const path = require('path')
const FileType = require('file-type');
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = express.Router();


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)  
    }
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     // res.status(400)
    //     // res.send(e)
    //     // or
    //     res.status(400).send(e)
    // })
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findbyidCrid(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        // const value = JSON.stringify(user)
        // console.log(value)
        // console.log(user)
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send("You are logged out")
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out of all logins')
    }catch(e){
        res.status(500).send()
    }
})


// router.get('/users', auth, async (req, res) => {

//     try{
//         const users = await User.find()
//         res.send(users)
//     }catch(e){
//         res.status(500).send(e)
//     }
//     // User.find().then((users) => {
//     //     res.send(users)
//     // }).catch((e) => {
//     //     res.status(500).send(e)
//     // })
// })
router.get('/users/me', auth, async (req, res) => {
    if(req.user){
        // console.log(req.user)
        res.send(req.user)
    }else{
        res.send("No Data to Send")
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }
    // User.findById(_id).then((user) => {
    //     if(!user){
    //         return res.status(404).send()
    //     }

    //     res.send(user)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({ error: "Invalid Updates"})
    }

    // const _id = req.user._id
    try{
        // const user = await User.findById(_id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
        // if(!user){
        //     return res.status(404).send()
        // }
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})


// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = [ 'name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
//     if(!isValidOperation){
//         return res.status(400).send({ error: "Invalid Updates"})
//     }

//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id)
//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()
//         // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true})
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(400).send(e)
//     }
// })


router.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     res.status(404).send()
        // }
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

// router.delete('/users/:id', auth, async (req, res) => {
//     try{
//         const user = await User.findByIdAndDelete(req.params.id)
//         if(!user){
//             res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send()
//     }
// })

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){

        // if(!file.originalname.endsWith('.pdf')){
        //     return cb(new Error('Please upload a PDF'))
        // }

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Only files with extension .jpg, .jpeg and .png are allowed for avatar'))
        }

        cb(undefined, true)
        // cb(new Error('File must be a PDF'))
        // cb(undefined, true)
        // cb(undefined, false)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        
        const htype = 'image/jpg'
        const ctype = await FileType.fromBuffer(user.avatar)
        console.log(ctype.mime)
        res.set('Content-Type', ctype.mime)
        res.send(user.avatar)

    }catch(e){
        res.status(404).send()
    }
})
// upload.array('photos', 12)
// upload.single('avatar')
const upload2 = multer({
    dest:'photos',
    limits: {
        fileSize: 1000000
    },
    rename: function (fieldname, filename) {
        // return filename.replace(/\W+/g, '-').toLowerCase();
        return Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1);
    },
    fileFilter(req, file, cb){

        // if(!file.originalname.endsWith('.pdf')){
        //     return cb(new Error('Please upload a PDF'))
        // }

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Only image files with extension .jpg, .jpeg and .png are allowed for avatar'))
        }
        // file.filename = Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1);
       
        
        // cb(new Error('File must be a PDF'))
        cb(undefined, true)
        // cb(undefined, false)
    }
})
router.post('/users/me/avatara', upload2.array('uploadedImages', 12), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})





// =================================================================================

var storage = multer.diskStorage(
    {
        destination: './uploads/',
        filename: function ( req, file, cb ) {
            //req.body is empty...
            //How could I get the new_file_name property sent from client here?
            // cb( null, file.originalname )
            // Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1)
            // cb( null, Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1 ))
            cb(null, file.fieldname + '-' + Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1 )+ path.extname(file.originalname))

        },
        
    }
)

var upload3 = multer( { 
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    rename: function (fieldname, filename) {
        // return filename.replace(/\W+/g, '-').toLowerCase();
        return Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1);
    },
    fileFilter(req, file, cb){

        // if(!file.originalname.endsWith('.pdf')){
        //     return cb(new Error('Please upload a PDF'))
        // }

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Only image files with extension .jpg, .jpeg and .png are allowed for avatar'))
        }
        // file.filename = Date.now() + "_" + Math.floor((Math.random() * 1000000) + 1);
       
        
        // cb(new Error('File must be a PDF'))
        cb(undefined, true)
        // cb(undefined, false)
    } } );

router.post('/users/me/multiupload', upload3.array('uploadedImages', 12), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})



router.get('/users/me/crop', (req, res) => {
    // req.user.avatar = req.file.buffer
    let originalImage = './uploads/uploadedImages-1591208285831_462517.jpg'

    // file name for cropped image
    let outputImage = './uploads/croppedImage.jpg'

    sharp(originalImage).extract({ width: 200, height: 200, left: 800, top: 800 }).toFile(outputImage)
    .then(function(new_file_info) {
        console.log("Image cropped and saved")
    })
    .catch(function(err) {
        console.log("An error occured")
    })
    res.send("Welcome")
})


module.exports = router