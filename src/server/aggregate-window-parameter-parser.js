import AggregateWindow from "../data/AggregateWindow";
import AggregateFunction from "../data/AggregateFunction";
import { ValidationError }  from "./route-factory";

export function parseAggregateParameters(event) {
    let { startDate, endDate, aggregateWindow, aggregateFunction, tickers, multiplier } = event.queryStringParameters;
    const withNormalization = 'withNormalization' in event.queryStringParameters;

    if (!!aggregateWindow && !(aggregateWindow in AggregateWindow)) {
        throw new ValidationError(`Unknown aggregate window type ${aggregateWindow}`)
    }
    if (!!aggregateFunction && !(aggregateFunction in AggregateFunction)) {
        throw new ValidationError(`Unknown aggregate function type ${aggregateFunction}`)
    }

    aggregateWindow = aggregateWindow ? AggregateWindow[aggregateWindow] : AggregateWindow.DAY;
    aggregateFunction = aggregateFunction ? AggregateFunction[aggregateFunction] : AggregateFunction.MEAN;

    multiplier = multiplier ? parseInt(multiplier) : 1;


    if (multiplier > 1 && (aggregateWindow === aggregateWindow.MONTH || aggregateWindow === AggregateWindow.QUARTER)) {
        throw new ValidationError(`Multiplier cannot be greater than 1 when aggregating by month or quarters`)
    }
    return {
        tickers: tickers ? tickers.split(',') : null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        aggregateFunctionType: aggregateFunction,
        aggregateWindowType: aggregateWindow,
        multiplier,
        withNormalization
    }
}
