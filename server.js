const express = require('express')
const redis = require('redis')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
const redisClient = redis.createClient('redis://localhost:6379')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send(`
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>My Homepage</title>
    </head>
    <body>
      Hi there
      <form action="/" method="post">
        <input type="number" name="number" placeholder="a number" />
        <input type="submit" />
      </form>
    </body>
  </html>
  `)
})

// app.post('/', (req, res) => {
//   let number = req.body.number

//   redisClient.exists(number, (error, result) => {
//     if (result) {

//     } else {

//     }
//   })

// })

// app.get('/done', (req, res) => {
//   res.send(`
//   `)
// })


app.listen(8080)