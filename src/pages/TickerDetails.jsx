import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router'
import {DateRangeInput} from "@blueprintjs/datetime"
import {Button, Card, Collapse} from "@blueprintjs/core"
import {createUseStyles} from "react-jss";
import AggregateFunctionSelect from '../components/AggregateFunctionSelect';
import WindowGranularitySelect from '../components/WindowGranularitySelect';
import {
    getCompanyInfo,
    getSentimentOverview,
    getSentimentSeries,
    getStockSeries,
    getTickerToNames
} from '../actions/FetchDataActions';
import DateTime from 'luxon/src/datetime.js';
import SubmitButton from "../components/SubmitButton";
import SentimentGraph from '../components/SentimentGraph';
import StockGraph from '../components/StockGraph';
import {convertToSentimentSeries, convertToCandleSeries, convertToVolumeSeries} from "../data/series-utils";

const useStyles = createUseStyles(() => ({
    overviewCard: {
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
    },
    searchBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: '20px'
    },
    wrapper: {
        padding: '40px'
    },
    companyInfo: {
        paddingLeft: '10px'
    },
    select: {
        display: 'inline-block',
        marginLeft: '10px',
        marginRight: '10px',
    },
    selectLabel: {
        marginTop: 10
    },
    overview: {
        margin: '15px'
    },
    graph: {
        marginTop: '10px',
        marginBottom: '10px'
    }
}));

export default function TickerDetails(props) {
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
        isOpen: false,
        companyInfo: null
    })

    const [data, setData] = useState({
        sentiment: [],
        stock: [],
        overview: null
    })

    useEffect(() => {
        handleSearch();
    }, [ticker])


    const handleDateChange = (dateRange) => {
        setState({...state, startDate: dateRange[0], endDate: dateRange[1]})
    };
    const handleFuncChange = (item) => {
        setState({...state, func: item[1]})
    };
    const handleWindowChange = (item) => {
        setState({...state, window: item[1]})
    };
    const handleCollapse = () => {
        setState({...state, isOpen: !state.isOpen})
    }

    const handleSearch = async () => {
        let luxonStart = state.startDate ? DateTime.fromJSDate(state.startDate) : null;
        let luxonEnd = state.endDate ? DateTime.fromJSDate(state.endDate) : null;
        try {
            let companyInfo = await getCompanyInfo(ticker);
            setState({...state, companyInfo: companyInfo})
            let sentimentSeries = await getSentimentSeries({
                tickers: [ticker],
                startDate: luxonStart,
                endDate: luxonEnd,
                aggregateFunctionType: state.func,
                aggregateWindowType: state.window,
                withNormalization: false
            }).then(data => convertToSentimentSeries(data));
            let [stockSeries, volumeSeries] = await getStockSeries({
                tickers: [ticker],
                startDate: luxonStart,
                endDate: luxonEnd,
                aggregateFunctionType: state.func,
                aggregateWindowType: state.window,
                withNormalization: false
            }).then(result => [convertToCandleSeries(result), convertToVolumeSeries(result)]);
            let overview = await getSentimentOverview({
                tickers: [ticker],
                startDate: luxonStart,
                endDate: luxonEnd,
            });
            setData({
                sentimentSeries,
                stockSeries,
                volumeSeries,
                overview,
            })
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className={classes.wrapper}>
            <Button style={{outline: 'none'}} rightIcon={state.isOpen ? "caret-up" : "caret-down"} minimal
                    onClick={handleCollapse}><h1>{getTickerToNames()[ticker]} ({ticker})</h1></Button>
            <Collapse isOpen={state.isOpen}>
                <div className={classes.companyInfo}>
                    {
                        state.companyInfo && Object.keys(state.companyInfo).map(key => {
                            return <p key={key}>
                                <strong>{key === "assetType" ? "Asset Type" : key.charAt(0).toUpperCase() + key.slice(1)}: </strong> {state.companyInfo[key]}
                            </p>
                        })
                    }
                </div>
            </Collapse>
            <div className={classes.overviewCard}>
                <Card>
                    <div className={classes.select}>
                        <p className={classes.selectLabel}>Select Date Range: </p>
                        <DateRangeInput
                            formatDate={date => date.toLocaleString("en", dateOptions)}
                            value={[state.startDate, state.endDate]}
                            onChange={handleDateChange}
                            parseDate={str => new Date(str)}
                            contiguousCalendarMonths={false}
                            closeOnSelection={false}
                            allowSingleDayRange={true}
                            minimal="true"
                        />
                    </div>
                    <div className={classes.select}>
                        <AggregateFunctionSelect
                            active={state.func}
                            handleClick={handleFuncChange}
                        />
                    </div>
                    <div className={classes.select}>
                        <WindowGranularitySelect
                            active={state.window}
                            handleClick={handleWindowChange}
                            excludeMinuteAndHour={false}
                        />
                    </div>
                    <SubmitButton onClick={handleSearch} className={classes.searchBtn}/>
                    <div className={classes.overview}>
                        <div>
                            {data.overview &&
                            <div>
                                <div>
                                    <h3>Stats for entire window:</h3>
                                </div>
                                <p><strong>Average polarity:</strong> {data.overview.avgPolarity.toFixed(3)}, <strong> Max
                                    polarity:</strong> {data.overview.maxPolarity.toFixed(3)}, <strong> Median
                                    polarity:</strong> {data.overview.medianPolarity.toFixed(3)}, <strong> Number of
                                    tweets:</strong> {data.overview.numberOfTweets} </p>
                            </div>}
                        </div>
                    </div>
                </Card>
            </div>
            <div className={classes.graph}>
                <SentimentGraph
                    id={'sentimentGraph'}
                    sentimentSeries={data.sentimentSeries}
                    autoSelect={true}
                    chartGroup={"sentiment-and-stock"}
                    height={350}
                />
            </div>
            <div className={classes.graph}>
                <StockGraph stockSeries={data.stockSeries}
                            volumeSeries={data.volumeSeries}
                            additionalGraphsToControl={['sentimentGraph']}
                            chartGroup={"sentiment-and-stock"}
                            height={350}
                />
            </div>
        </div>
    )
}
