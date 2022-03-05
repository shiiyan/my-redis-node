const express = require('express')
const redis = require('redis')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')

const app = express()
const redisClient = redis.createClient('redis://localhost:6379')
