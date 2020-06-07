const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect(process.env.MONGODB_URL, 
{ useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false })

// const User = mongoose.model('User', {
//     name:{
//         type: String,
//         required: true,
//         trim: true
//     },
//     email:{
//         type: String,
//         required:true,
//         trim: true,
//         lowercase: true,
//         validate(value)
//         {
//             if(!validator.isEmail(value)){
//                 throw new Error('Email is invalid')
//             }
//         }
//     },
//     age:{
//         type: Number,
//         default:0,
//         validate(value){
//             if(value < 0){
//                 throw new Error('Age must be an posititive number')
//             }
//         }
//     },
//     password: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: 7,
//         validate(value){
//             if(value.toLowerCase().includes('password')){
//                 throw new Error('Password cannot contain "password"')
//             }
//         }

//     }
// })

// const me = new User({
//     name: '  Andrew      ',
//     email: 'MYEMAIL@MEAD.IO   ',
//     password: 'phone098!'
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })

// const Task = mongoose.model('Task', {
//     description:{
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed:{
//         type: Boolean,
//         default: false
//     }
// })

// const todo = new Task({
//     description: '     Eat Lunch'
// })

// todo.save().then(() => {
//     console.log(todo)
// }).catch((error) => {
//     console.log('Error!', error)
// })