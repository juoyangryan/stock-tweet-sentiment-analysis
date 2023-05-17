import {generateSelectDataFields, generateSelectDataFieldWithNormalization, generateTimeBucket} from "./db-query-utils";
import client from "./db-connect";

export async function executeSentimentQuery(aggregateWindowParameters) {
    const {
        tickers,
        startDate,
        endDate,
        aggregateWindowType,
        aggregateFunctionType,
        withNormalization,
        multiplier
    } = aggregateWindowParameters;

    const result = await client.query(
        `
        SELECT date, ${generateSelectDataFieldWithNormalization(DATA_FIELDS, withNormalization)} FROM
            (${generateSentimentQuery({
            tickers,
            startDate,
            endDate,
            aggregateWindowType,
            aggregateFunctionType,
            multiplier
        })}) as sentiment
            ORDER BY date ASC
            `,
        [!tickers, tickers, startDate, endDate]);

    return result.rows
}

export async function getStatsForWindow({tickers, startDate, endDate}) {

    const result = await client.query(
        `
        SELECT  AVG(polarity) as avg_polarity, 
                PERCENTILE_CONT(.5) WITHIN GROUP (ORDER BY polarity ASC) as median_polarity,
                MAX(polarity) as max_polarity 
                FROM sentiment
                WHERE ($1::boolean OR ticker = ANY($2))
                    AND ($3::timestamptz is NULL OR time >= $3::timestamptz)
                    AND ($4::timestamptz is NULL or time < $4::timestamptz)
            `,
        [!tickers, tickers, startDate, endDate]);

    return Object.fromEntries(Object.entries(result.rows[0])
        .map(([key, value]) => [key, value ?? 0]));
}

export async function getTweetCountForWindow({tickers, startDate, endDate}) {
    const result = await client.query(
        `
        SELECT  COUNT(*) as count
                FROM sentiment
                WHERE ($1::boolean OR ticker = ANY($2))
                    AND ($3::timestamptz is NULL OR time >= $3::timestamptz)
                    AND ($4::timestamptz is NULL or time < $4::timestamptz)
            `,
        [!tickers, tickers, startDate, endDate]);

    return result.rows[0].count
}

export const DATA_FIELDS = ['polarity'];

export function generateSentimentQuery({tickers, startDate, endDate, aggregateWindowType, aggregateFunctionType, multiplier}) {
    const timeBucket = generateTimeBucket(aggregateWindowType, multiplier);

    return ` SELECT 
                ${timeBucket} as date,
                ${generateSelectDataFields(DATA_FIELDS, aggregateFunctionType)}
                FROM sentiment
                WHERE ($1::boolean OR ticker = ANY($2))
                    AND ($3::timestamptz is NULL OR time >= $3::timestamptz)
                    AND ($4::timestamptz is NULL or time < $4::timestamptz)
                GROUP BY ${timeBucket}`

}
