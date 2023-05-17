import fetch from 'node-fetch';
import TICKER_TO_NAME from '../resources/ticker-to-name.json';
import TICKERS from '../resources/tickers';
import {DateTime} from "luxon";

/**
 * Get tickers (list of tickers)
 */
export function getAvailableTickers() {
    return TICKERS;
}

/**
 * Get ticker to company name (Object where key is ticker and value is company name)
 */
export function getTickerToNames() {
    return TICKER_TO_NAME;
}

/**
 * Gets the sentiment and stock time series
 * NOTE: Use Luxon datetime for all date objects
 * ADDITIONAL NOTE: DON'T let users use MINUTE and HOUR aggregation for this double series
 * @param tickers - Null means get for all tickers
 * @param startDate - The start date to (Luxon DateTime)
 * @param endDate - The end date (Luxon DateTime)
 * @param aggregateFunctionType (Ex: AggregrateFunction.MEAN) (see src/data/AggregateFunction)
 * @param aggregateWindowType (Ex: AggregateWindow.DAY) (see src/data/AggregateWindow)
 * @param withNormalization - If the series should be normalized
 * @return Returns a promise of the series with stock and sentiment
 */
export async function getSentimentAndStockTimeSeries({
                                                         tickers,
                                                         startDate,
                                                         endDate,
                                                         aggregateFunctionType: aggregateFunction,
                                                         aggregateWindowType: aggregateWindow,
                                                         withNormalization
                                                     }) {
    return fetchFromInternalAPI('/stock-and-sentiment' + assembleQueryParamsString({
        tickers,
        startDate,
        endDate,
        aggregateFunction,
        aggregateWindow,
        withNormalization
    }));

}

/**
 * Only sentiment series
 * @param tickers
 * @param startDate - see above
 * @param endDate
 * @param aggregateFunctionType
 * @param aggregateWindowType
 * @param withNormalization
 * @returns {Promise<*>}
 */
export async function getSentimentSeries({
                                      tickers,
                                      startDate,
                                      endDate,
                                      aggregateFunctionType: aggregateFunction,
                                      aggregateWindowType: aggregateWindow,
                                      withNormalization
                                  }) {
    return fetchFromInternalAPI('/sentiment' + assembleQueryParamsString({
        tickers,
        startDate,
        endDate,
        aggregateFunction,
        aggregateWindow,
        withNormalization
    }));
}

/**
 * Only sentiment series
 * @param tickers
 * @param startDate - see above
 * @param endDate
 * @param aggregateFunctionType
 * @param aggregateWindowType
 * @param withNormalization
 * @returns {Promise<*>}
 */
export async function getStockSeries({
                                      tickers,
                                      startDate,
                                      endDate,
                                      aggregateFunctionType: aggregateFunction,
                                      aggregateWindowType: aggregateWindow,
                                      withNormalization
                                  }) {
    return fetchFromInternalAPI('/stock' + assembleQueryParamsString({
        tickers,
        startDate,
        endDate,
        aggregateFunction,
        aggregateWindow,
        withNormalization
    }));
}

/**
 *
 * @param tickers
 * @param startDate
 * @param endDate
 * @returns The tweets in the window
 */
export async function getTweetsForWindow({
                                             tickers,
                                             startDate,
                                             endDate
                                         }) {
    return fetchFromInternalAPI('/tweet' + assembleQueryParamsString({
        tickers,
        startDate,
        endDate,
    }));
}

export async function getSentimentOverview({
                                               tickers,
                                               startDate,
                                               endDate
                                           } = {}) {

    return fetchFromInternalAPI('/sentiment-overview' + assembleQueryParamsString({
        tickers,
        startDate,
        endDate,
    }));
}

/**
 *
 * @param aggregateWindowType
 * @param startDate
 * @param endDate
 * @param maxDepth - Fill depth if there is no data at endDate. Don't change
 * @returns {Promise<*>}
 */
export async function getChangeInSentiment({
                                               aggregateWindowType: aggregateWindow,
                                               startDate,
                                               endDate,
                                                maxDepth
                                           }) {

    return fetchFromInternalAPI('/sentiment-change' + assembleQueryParamsString({
        aggregateWindow,
        startDate,
        endDate,
        maxDepth
    }));
}

export async function getCompanyInfo(ticker) {
    return fetchFromInternalAPI('/company/' + ticker);
}


function assembleQueryParamsString(params) {
    return '?' + Object.entries(params)
        .filter(([key, value]) => !!value)
        .map(([key, value]) => {

            if (typeof value === "boolean") {
                return key;
            }

            return `${key}=${convertValueToQueryParamString(value)}`
        }).join('&');

}

function convertValueToQueryParamString(value) {
    if (Array.isArray(value)) {
        return value.join(',');
    }
    if (DateTime.isDateTime(value)) {
        return value.toUTC().toISO();
    }
    return value;
}

const BASE_PATH = "/.netlify/functions"

async function fetchFromInternalAPI(path) {
    const fetchResult = await fetch(BASE_PATH + path);
    return (await fetchResult.json()).data;
}
