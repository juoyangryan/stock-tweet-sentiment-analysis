import {parseAggregateParameters} from "../server/aggregate-window-parameter-parser";
import TimeSeriesClient from "../server/db-connect";
import GetMongoClient from "../server/mongo-db-connect";
import { generateRoute } from "../server/route-factory";

export const handler = generateRoute(async (event, context) => {
    const {startDate, endDate, tickers} = parseAggregateParameters(event);
    const tweetIdAndPolarityAndSubjectivity = await getPolarityAndSubjectivity(startDate, endDate, tickers);
    const tweetDocuments = await getTweetDocuments(tweetIdAndPolarityAndSubjectivity.map(value => value.id));
    const idToTweetDocument = Object.fromEntries((tweetDocuments).map((document) => [document.tweet_id, document]));
    const result = tweetIdAndPolarityAndSubjectivity.map((value) => ({
        ...value,
        ...idToTweetDocument[value.id]
    })).filter(value => value.id in idToTweetDocument);

    return result;
});

async function getPolarityAndSubjectivity(startDate, endDate, tickers) {
    const result = await TimeSeriesClient.query(
        `SELECT 
            distinct id as id,
            polarity,
            time
            FROM sentiment
            WHERE ($1::boolean OR ticker = ANY($2))
            AND ($3::timestamptz is NULL OR time >= $3::timestamptz)
            AND ($4::timestamptz is NULL or time < $4::timestamptz)
            ORDER BY time ASC
            LIMIT 100
         `,
        [!tickers, tickers, startDate, endDate]);
    return result.rows
}

async function getTweetDocuments(ids) {
    const query = {
        tweet_id: {
            $in: ids
        }
    }

    const output = []
    await (await GetMongoClient()).collection("tweets").find(query)
        .forEach((document) => output.push(document))
    return output;
}
