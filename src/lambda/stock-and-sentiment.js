import {generateSelectDataFieldWithNormalization} from "../server/db-query-utils";
import {parseAggregateParameters} from "../server/aggregate-window-parameter-parser";
import client from '../server/db-connect';
import {generateRoute, ValidationError} from "../server/route-factory";
import AggregateWindow from "../data/AggregateWindow";
import {DATA_FIELDS as DATA_FIELDS_STOCKS, generateStockQuery} from "../server/stock-query";
import {DATA_FIELDS as DATA_FIELDS_SENTIMENT, generateSentimentQuery} from "../server/sentiment-query";


export const handler = generateRoute(async (event, context) => {
    const parameters = parseAggregateParameters(event);
    if (parameters.aggregateWindowType === AggregateWindow.MINUTE ||
        parameters.aggregateWindowType === AggregateWindow.HOUR) {
        throw new ValidationError('Stock double series does not support minute or hour granularity')
    }
    return await executeStocksQuery(parameters);
});


const DATA_FIELDS_COMBINED = [...DATA_FIELDS_SENTIMENT, ...DATA_FIELDS_STOCKS]

async function executeStocksQuery(aggregateWindowParameters) {
    const {
        tickers,
        startDate,
        endDate,
        withNormalization
    } = aggregateWindowParameters;
    const result = await client.query(
        ` SELECT stock_series.date, ${generateSelectDataFieldWithNormalization(DATA_FIELDS_COMBINED, withNormalization)}
             FROM (
                    ${generateSentimentQuery(aggregateWindowParameters)}
                    ) as stock_series
                JOIN (
                    ${generateStockQuery(aggregateWindowParameters)}
                ) as sentiment_series
                ON stock_series.date = sentiment_series.date
                ORDER BY date ASC
            `,
        [!tickers, tickers, startDate, endDate]);
    return result.rows
}
