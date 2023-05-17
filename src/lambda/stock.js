import {generateRoute} from "../server/route-factory";
import {parseAggregateParameters} from "../server/aggregate-window-parameter-parser";
import {executeStockQuery} from "../server/stock-query";

export const handler = generateRoute(async (event, context) => {
    const parameters = parseAggregateParameters(event);
    return await executeStockQuery(parameters)
});
