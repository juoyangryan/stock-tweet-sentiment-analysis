import AggregateWindow from "../data/AggregateWindow";
import AggregateFunction from "../data/AggregateFunction";

const AGGREGATE_WINDOW_TO_QUERY_PARAM = {
    [AggregateWindow.MINUTE]: (multiplier, column) => `time_bucket('${multiplier} minute', ${column})`,
    [AggregateWindow.HOUR]: (multiplier, column) => `time_bucket('${multiplier} hour', ${column})`,
    [AggregateWindow.DAY]: (multiplier, column) => `time_bucket('${multiplier} day', ${column})`,
    [AggregateWindow.WEEK]: (multiplier, column) => `time_bucket('${multiplier} week', ${column})`,
    [AggregateWindow.MONTH]: (multiplier, column) => `date_trunc('month', ${column})`,
    [AggregateWindow.QUARTER]: (multiplier, column) => `date_trunc('quarter', ${column})`,
};

const AGGREGATE_FUNCTION_TO_QUERY_FUNCTION = {
    [AggregateFunction.MEAN]: 'avg',
    [AggregateFunction.MAX]: 'max',
    [AggregateFunction.MIN]: 'min',
    [AggregateFunction.SUM]: 'sum'
}

export function generateTimeBucket(aggregateWindowType, multiplier, columnName) {
    columnName = columnName ?? 'time';
    return AGGREGATE_WINDOW_TO_QUERY_PARAM[aggregateWindowType](multiplier, columnName)
}

export function generateSelectDataFieldWithNormalization(fields, withNormalization) {
    if (!withNormalization) {
        return fields.join(', ');
    }
    return fields.map(field => `
        (
            (
                ${field} - (MIN(${field}) OVER ())
            )
        /
            ( 
                (MAX(${field}) OVER ()) - (MIN(${field}) OVER ())
            )
        ) as ${field}`)
        .join(',');
}

export function generateSelectDataFields(fields, aggregateFunctionType) {
    const aggregateFunction = AGGREGATE_FUNCTION_TO_QUERY_FUNCTION[aggregateFunctionType];
    return fields.map(field => `${aggregateFunction}(${field}) as ${field}`).join(', ')
}

export function convertSnakeCaseRowToCamelCase(dict) {
    return Object.fromEntries(
        Object.entries(dict).map(([key, value]) => [
            key.replace(/(_)[a-z]/,
                (match) => match.replace('_', '').toUpperCase()), value
        ]))
}
