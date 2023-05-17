import { ClientEncryption } from "mongodb-client-encryption";
import {MongoClient} from 'mongodb';

const {
    MONGODB_USER,
    MONGODB_PASS,
    MONGODB_HOST,
    MONGODB_DB
} = process.env;

const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}?retryWrites=true&w=majority`
const client = new MongoClient(MONGODB_URI, {useUnifiedTopology: true});

async function getClient() {
    await client.connect();
    return client.db(MONGODB_DB);
}

export default getClient;
