const express = require('express');
const redis = require('redis')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

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
  const number = req.body.number;
  await redisClient.connect();
  const isKeyExistInCache = await redisClient.exists(number);

  if (isKeyExistInCache) {
    getResultFromCache(number, res);
  } else {
    getResultFromAPI(number, res);
  }

  await redisClient.quit()
})

const getResultFromCache = async (number, res) => {
  const startTime = Date.now();
  const result = await redisClient.get(number)
  console.log('Cache request took', Date.now() - startTime, 'Milliseconds')
  res.redirect(`/done?result=${result}&from=cache`)
}

const getResultFromAPI = async (number, res) => {
  const startTime = Date.now();
  axios.post('http://localhost:3000/', {
    number: number
  })
    .then(async (response) => {
      const result = response.data.result
      console.log('API request took', Date.now() - startTime, 'Milliseconds');
      await redisClient.connect();

      redisClient.set(number, result)
      redisClient.expire(number, 60)

      res.redirect(`/done?result=${result}&from=API`)
      await redisClient.quit()
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

