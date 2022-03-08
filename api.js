const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', (req, res) => {
  res.send({
    result: req.body.number * 2
  })
})

app.listen(3000, () => console.log('API server is listening on port 3000...'))
