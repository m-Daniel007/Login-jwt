const express = require('express')

const app = express()


const mongoose = require('./db/conn')
const router = require('./routes/rotas')



app.use(express.json())
app.use('/',router)




app.listen(5000)