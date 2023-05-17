import React, {useEffect, useState} from "react";
import {useHistory} from 'react-router-dom';
import {getAvailableTickers, getChangeInSentiment, getSentimentOverview} from "../actions/FetchDataActions";
import {createUseStyles} from "react-jss";
import {Card} from "@blueprintjs/core";
import * as classnames from "classnames";
import {DateTime, Duration} from "luxon";
import AggregateWindow from "../data/AggregateWindow";
import AggregateFunction from "../data/AggregateFunction";
import DeltaDisplay from "../components/DeltaDisplay";


const useStyles = createUseStyles(() => ({
    tickerWrapper: {
        margin: '5px',
    },
    tickers: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        "& Card": {
            margin: '20px',
        },
        "& .ticker": {
            width: "100px",
        }
    },
    overviewCard: {
        width: '100%',
        boxSizing: 'border-box',
    },
    wrapper: {
        padding: '40px'
    }
}));


const HomePage = (props) => {
    const classes = useStyles(props);
    const history = useHistory();

    const [overviewInformation, setOverviewInformation] = useState(null);
    const [overviewInformationLoading, setOverviewInformationLoading] = useState(true);
    const [recentTickerChanges, setRecentTickerChanges] = useState(null);
    const [recentTickerChangesLoading, setRecentTickerChangesLoading] = useState(true);

    useEffect(() => {
        getSentimentOverview().then((result) => {
            setOverviewInformation(result)
            setOverviewInformationLoading(false);
        });
    }, []);

    useEffect(() => {
        const startDate = DateTime.local().minus(Duration.fromObject({days: 1}))
        getChangeInSentiment(
            {
                aggregateWindow: AggregateWindow.DAY,
                aggregateFunction: AggregateFunction.MEAN,
                startDate,
                maxDepth: 0,
            }).then(result => {
            setRecentTickerChanges(result.map(({delta, ...rest}) => ({delta: (delta * 100), ...rest})));
            setRecentTickerChangesLoading(false);
        });
    }, []);

    return (
        <div>
            <div className={classes.wrapper}>
                <div>
                    <h1>Welcome to stock sentiment analysis!</h1>
                    <div className={classes.overviewCard}>
                        <Card>
                            <h4>Tweets
                                tracked: {!overviewInformationLoading ? overviewInformation.numberOfTweets : '...'}</h4>
                        </Card>
                    </div>
                </div>
                <div>
                    <h3>Currently tracking:</h3>
                    <p>Current sentiment (Change in sentiment in past day)</p>
                    <div className={classes.tickers}>
                        {
                            recentTickerChangesLoading ?
                                getAvailableTickers().map(ticker => (
                                    <Card key={ticker} className={classnames(classes.tickerWrapper, 'bp3-skeleton')}
                                          interactive
                                          disabled
                                    >
                                        <div className={'ticker'}>${ticker}</div>
                                    </Card>))
                                :
                                (
                                    recentTickerChanges.map(({ticker, startPolarity, endPolarity, delta}) => (
                                        <Card key={ticker} className={classes.tickerWrapper}
                                              interactive
                                              onClick={(event) => history.push('/ticker/' + ticker)}>
                                            <div className={'ticker'}>
                                                <div>${ticker}: {endPolarity}</div>
                                                <div><DeltaDisplay delta={delta}/></div>
                                            </div>
                                        </Card>))

                                )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};

export default HomePage;
