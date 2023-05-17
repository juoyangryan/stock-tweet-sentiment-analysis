import React, {useState} from 'react'
import {useParams} from 'react-router'
import {DateRangeInput} from "@blueprintjs/datetime"
import {createUseStyles} from "react-jss";
import {Card} from "@blueprintjs/core";
import AggregateFunctionSelect from '../components/AggregateFunctionSelect';
import WindowGranularitySelect from '../components/WindowGranularitySelect';
import {getSentimentSeries, getStockSeries} from '../actions/FetchDataActions';
import DateTime from 'luxon/src/datetime.js';
import TickerMultiselect from "../components/TickerMultiselect";
import SubmitButton from "../components/SubmitButton";
import TickerComparisonGraphs from '../components/TickerComparisonGraphs';
import {convertToCandleSeries, convertToSentimentSeries} from "../data/series-utils";

const useStyles = createUseStyles(() => ({
    graphCard: {
        width: '100%',
        padding: '40px',
        boxSizing: 'border-box'
    },
    searchBtn: {
        marginTop: 10
    }
}));

export default function TickerComparison(props) {
    const classes = useStyles(props);
    let {ticker} = useParams();
    const dateOptions = {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "numeric"
    };

    const [state, setState] = useState({
        startDate: new Date("2014-01-01"),
        endDate: new Date("2016-01-01"),
        func: "MEAN",
        window: "DAY",
    });

    const [tickers, setTickers] = useState([]);
    const [tickerData, setTickerData] = useState([]);

    const handleDateChange = (dateRange) => {
        setState({...state, startDate: dateRange[0], endDate: dateRange[1]})
    };
    const handleFuncChange = (item) => {
        setState({...state, func: item[1]})
    };
    const handleWindowChange = (item) => {
        setState({...state, window: item[1]})
    };

    const handleSearch = async () => {
        let luxonStart = DateTime.fromJSDate(state.startDate);
        let luxonEnd = DateTime.fromJSDate(state.endDate);
        try {
            Promise.all(tickers.map(async ticker => {
                let sentimentPromise = getSentimentSeries({
                    tickers: [ticker],
                    startDate: luxonStart,
                    endDate: luxonEnd,
                    aggregateFunctionType: state.func,
                    aggregateWindowType: state.window,
                    withNormalization: false
                }).then(data => convertToSentimentSeries(data));

                let stockPromise = getStockSeries({
                    tickers: [ticker],
                    startDate: luxonStart,
                    endDate: luxonEnd,
                    aggregateFunctionType: state.func,
                    aggregateWindowType: state.window,
                    withNormalization: false
                }).then(res => convertToCandleSeries(res));
                const [sentiment, stock] = await Promise.all([sentimentPromise, stockPromise])
                return [ticker, {sentiment, stock}]
            })).then((result) =>{
                setTickerData(result);
            });
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div>
            <h3>{ticker}</h3>
            <div className={classes.overviewCard}>
                <Card>
                    <DateRangeInput
                        formatDate={date => date.toLocaleString("en", dateOptions)}
                        value={[state.startDate, state.endDate]}
                        onChange={handleDateChange}
                        shortcuts={false}
                        parseDate={str => new Date(str)}
                        contiguousCalendarMonths={false}
                        closeOnSelection={false}
                        allowSingleDayRange={true}
                    />
                    <AggregateFunctionSelect
                        active={state.func}
                        handleClick={handleFuncChange}
                    />
                    <WindowGranularitySelect
                        active={state.window}
                        handleClick={handleWindowChange}
                    />
                    <TickerMultiselect selectedTickers={tickers} setTickers={setTickers} singleSelect={true}/>
                    <SubmitButton onClick={handleSearch} className={classes.searchBtn}/>
                </Card>
            </div>
            {tickerData.map(([ticker, data]) => {
                return <TickerComparisonGraphs ticker={ticker}
                                               data={data}
                />
            })}
        </div>
    )
}
