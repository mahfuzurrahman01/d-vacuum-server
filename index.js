const express = require('express')
const cors = require ('cors')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
//middleware 
app.use(cors())
app.use(express.json())

//simple api call
app.get('/',(req,res)=>{
    res.send('service review app server is running well..')
})

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})