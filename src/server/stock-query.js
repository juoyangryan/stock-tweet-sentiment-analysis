import {generateSelectDataFields, generateSelectDataFieldWithNormalization, generateTimeBucket} from "./db-query-utils";
import client from "./db-connect";

export const DATA_FIELDS = ['high', 'low', 'open', 'close', 'volume'];
export async function executeStockQuery(aggregateWindowParameters) {
    const {
        tickers,
        startDate,
        endDate,
        aggregateWindowType,
        aggregateFunctionType,
        withNormalization,
        multiplier,
    } = aggregateWindowParameters;

    const result = await client.query(
        `
        SELECT date, ${generateSelectDataFieldWithNormalization(DATA_FIELDS, withNormalization)} FROM
            (${generateStockQuery({tickers, startDate, endDate, aggregateWindowType, aggregateFunctionType, multiplier})}) as stock
            ORDER BY date ASC
            `,
        [!tickers, tickers, startDate, endDate]);

    return result.rows
}

export function generateStockQuery({tickers, startDate, endDate, aggregateWindowType, aggregateFunctionType, multiplier}) {
    const timeBucket = generateTimeBucket(aggregateWindowType, multiplier);
    return `
     SELECT 
        ${timeBucket} as date,
        min(low) as low,
        max(high) as high,
        first(open, time) as open,
        last(close, time) as close,
        sum(volume) as volume
        FROM stock
        WHERE ($1::boolean OR ticker = ANY($2))
        AND ($3::timestamptz is NULL OR time >= $3::timestamptz)
        AND ($4::timestamptz is NULL or time < $4::timestamptz)
        GROUP BY ${timeBucket}
   `
}
