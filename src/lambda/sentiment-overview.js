import {getStatsForWindow, getTweetCountForWindow} from "../server/sentiment-query";
import {parseAggregateParameters} from "../server/aggregate-window-parameter-parser";
import {generateRoute} from "../server/route-factory";
import {convertSnakeCaseRowToCamelCase} from "../server/db-query-utils";


export const handler = generateRoute(async (event, context) => {
    const parameters = parseAggregateParameters(event);
    const statsForWindowPromise = getStatsForWindow(parameters);
    const numberOfTweetsPromise = getTweetCountForWindow(parameters);

    const [meanPolarityAndSubjectivityForWindow, count] = await Promise.all([
        statsForWindowPromise,
        numberOfTweetsPromise
    ]);
    return {
        numberOfTweets: count,
        ...convertSnakeCaseRowToCamelCase(meanPolarityAndSubjectivityForWindow)
    }
});
