import {Client} from 'pg';

const {
    TIME_SERIES_DB_USER,
    TIME_SERIES_DB_PASS,
    TIME_SERIES_DB_HOST,
    TIME_SERIES_DB_PORT
} = process.env
const client = new Client({
    user: TIME_SERIES_DB_USER,
    host: TIME_SERIES_DB_HOST,
    database: 'tsdb',
    password: TIME_SERIES_DB_PASS,
    port: TIME_SERIES_DB_PORT
})
client.connect()

export default client
