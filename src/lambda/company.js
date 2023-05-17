import {generateRoute, ValidationError} from "../server/route-factory";
import TICKERS from "../resources/tickers";

import getMongoClient from "../server/mongo-db-connect";

const TICKERS_SET = new Set(TICKERS);
export const handler = generateRoute(async (event, context) => {
    const pathComponents = event.path.split('/');
    const ticker = pathComponents[pathComponents.length - 1].toUpperCase()
    if (ticker === "COMPANY") {
        const output = [];
        await (await getMongoClient()).collection("companies").find({}).project({
            _id: 0,
            description: 0
        })
            .forEach(company => output.push(company));
        return output;
    }

    if (!(TICKERS_SET.has(ticker))) {
        throw new ValidationError('Unknown ticker: ' + ticker)
    }

    return (await getMongoClient()).collection("companies").findOne({
            _id: ticker
        },
        {projection: {_id: 0}});
});
