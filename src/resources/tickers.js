import TickerNameToCompanyName from "./ticker-to-name.json";
const tickers = Object.keys(TickerNameToCompanyName);
tickers.sort();
export default tickers;
