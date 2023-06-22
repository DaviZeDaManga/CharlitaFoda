const dotenv = require("dotenv")
dotenv.config()
const connect = require("./src/database/connect")
connect()

require('./server')