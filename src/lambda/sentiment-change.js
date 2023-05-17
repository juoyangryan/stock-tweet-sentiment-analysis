import {generateRoute, ValidationError} from "../server/route-factory";
import {generateTimeBucket} from "../server/db-query-utils";
import TimeSeriesClient from '../server/db-connect';
import AggregateWindow from "../data/AggregateWindow";
import {parseAggregateParameters} from "../server/aggregate-window-parameter-parser";
import TICKERS from '../resources/tickers';

const WINDOW_GRANULARITY_TO_INTERVAL = {
    [AggregateWindow.DAY]: (multiplier) => `${multiplier} day`,
    [AggregateWindow.WEEK]: (multiplier) => `${multiplier} week`,
    [AggregateWindow.MONTH]: (multiplier) => `${multiplier} month`,
    [AggregateWindow.QUARTER]: (multiplier) => `${multiplier} month`,
}

async function getChange({date, aggregateWindow, multiplier, tickers, maxDepth}, depth) {
    if (tickers.length === 0) {
        return {}
    }
    depth = depth ?? 0;
    if (depth > maxDepth) {
        return Object.fromEntries(tickers.map(ticker => [ticker, 0]))
    }
    const timeBucket = generateTimeBucket(aggregateWindow, multiplier)
    const comparisonBucket = generateTimeBucket(aggregateWindow, multiplier, `$3::timestamptz - INTERVAL '${WINDOW_GRANULARITY_TO_INTERVAL[aggregateWindow](depth)}'`);
    const result = await TimeSeriesClient.query(`
     SELECT 
        ticker,
        avg(polarity) as polarity
        FROM sentiment
        WHERE ($1::boolean OR ticker = ANY($2))
        AND ${timeBucket} = ${comparisonBucket}
        GROUP BY ticker
    `, [false, tickers, date]);
    const resultDict = Object.fromEntries(result.rows.map(row => [row.ticker, row.polarity]));
    return {
        ...resultDict,
        ...await getChange({
            date,
            aggregateWindow,
            multiplier,
            tickers: tickers.filter(ticker => !(ticker in resultDict)),
            maxDepth
        }, depth + 1),
    };


}

export const handler = generateRoute(async (event, context) => {
    const {
        startDate,
        endDate,
        aggregateWindowType,
        multiplier
    } = parseAggregateParameters(event);
    if (aggregateWindowType === AggregateWindow.MINUTE || aggregateWindowType === AggregateWindow.HOUR) {
        throw new ValidationError('Granularity of minute and hour not supported for endpoint');
    }
    const maxDepth = event.queryStringParameters.maxDepth ? parseInt(event.queryStringParameters.maxDepth) : 2;
    const [startIntervalData, endIntervalData] = await Promise.all([getChange({
        date: startDate,
        aggregateWindow: aggregateWindowType,
        multiplier,
        tickers: TICKERS,
        maxDepth
    }), getChange({
        date: endDate,
        aggregateWindow: aggregateWindowType,
        multiplier,
        tickers: TICKERS,
        maxDepth
    })]);
    const result = TICKERS.map(ticker => ({
        ticker: ticker,
        startPolarity: startIntervalData[ticker],
        endPolarity: endIntervalData[ticker],
        delta: endIntervalData[ticker] - startIntervalData[ticker],
    }));
    result.sort((x, y) => y.delta - x.delta)
    return result;
});
