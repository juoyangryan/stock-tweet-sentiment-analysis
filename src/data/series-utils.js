/**
 * Assumes "date" field holds time
 * @param series - the series
 * @param getYValuesFunction - Should return an array of values. These are the y values
 * Returns a promise in case it is parallelized. Use await
 */
import {DateTime} from "luxon";

export function convertToSentimentSeries(data) {
    return convertToApexChartGraphableSeries(data, point => point.polarity);
}

export function convertToCandleSeries(data) {
    return convertToApexChartGraphableSeries(data, point => [point.open, point.high, point.low, point.close]);
}

export function convertToVolumeSeries(data) {
    return convertToApexChartGraphableSeries(data, point => point.volume);
}


export function convertToGraphableSeries(series, getYValuesFromPoint) {
    const times = [];
    const yValuesLists = [];
    series.forEach((point) => {
       times.push(toUnixTime(point.date));
       const yValues = getYValuesFromPoint(point);
       yValues.forEach((yValue, index) => {
          if (yValuesLists.length - 1 < index) {
              yValuesLists.push([]);
          }
          yValuesLists[index].push(yValue);
       });
    });
    return [
        times,
        ...yValuesLists
    ];
}

export function convertToApexChartGraphableSeries(series, getYValuesFromPoint) {
    return series.map((point) => [toUnixTime(point.date) * 1000, getYValuesFromPoint(point)]);
}


function toUnixTime(date) {
    return Math.round(DateTime.fromISO(date).toMillis() / 1000);
}
