const express = require('express');
const redis = require('redis')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

const client = redis.createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

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

app.post('/', async (req, res) => {
  let number = req.body.number;

  await client.connect();

  const isKeyExistInCache = await client.exists(number);

  if (isKeyExistInCache) {
    const result = await client.get(number)

    res.redirect(`/done?result=${result}&from=cache`)
  } else {
    console.log('inside else')
    axios.post('http://localhost:3000/', {
      number: number
    })
      .then(async (response) => {
        let result = response.data.result

        await client.connect();

        client.set(number, result)
        client.expire(number, 60)

        res.redirect(`/done?result=${result}&from=API`)
      })
  }

  await client.quit()
})

const getResultFromCache = (number, res) => {
  client.get(number, (error, result) => {
    if (error) {
      console.error(error)
      return
    }

    if (!result) {
      console.error('key is not exist in cache')
      return
    }

    res.redirect(`/done?result=${result}&from=cache`)
  })
}

const getResultFromAPI = (number, res) => {
  axios.post('http://localhost:3000/', {
    number: number
  })
    .then(response => {
      let result = response.data.result
      client.set(number, result)
      client.expire(number, 60)

      res.redirect(`/done?result=${result}&from=API`)
    })
}

app.get('/done', (req, res) => {
  res.send(`
  <html>
    <head></head>
    <body>
      The Result is: ${req.query.result}
      <br />
      So the original value is ${req.query.result / 2}
      <br />
      And comes from: ${req.query.from}
    </body>
  </html>
  `)
})

app.listen(8080, () => console.log('Main server is listening on port 8080...'));

