import {executeSentimentQuery} from "../server/sentiment-query";
import {parseAggregateParameters} from "../server/aggregate-window-parameter-parser";
import {generateRoute} from "../server/route-factory";


export const handler = generateRoute(async (event, context) => {
    const parameters = parseAggregateParameters(event);
    return await executeSentimentQuery(parameters)
});
