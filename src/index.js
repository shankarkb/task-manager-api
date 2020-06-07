const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();
const port = process.env.PORT

// app.use((req, res, next) => {
//     res.status(503).send("This server is in maintanance mode")
// })


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port '+ port)
})

// const User = require('./models/user')
// const Task = require('./models/task')

// const main = async () => {
//     const user = await User.findById('5ed28ed7914d942e0c28f67f')
//     await user.populate('myTasks').execPopulate()
//         console.log(user.myTasks)
// }

// main()