import React from "react";
import {
    getTweetsForWindow
} from "../actions/FetchDataActions";
import {createUseStyles} from "react-jss";
import {Card, Elevation, Colors, Icon, AnchorButton, Button, Spinner} from "@blueprintjs/core";
import {useState} from "react";
import * as classnames from "classnames";
import {DateTime} from "luxon";
import { DateRangeInput } from "@blueprintjs/datetime";
import SubmitButton from "../components/SubmitButton";
import TickerMultiselect from "../components/TickerMultiselect";

const useStyles = createUseStyles(() => ({
    overviewCard: {
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        marginBottom: '20px'
    },
    tickerWrapper: {
        margin: '20px',
    },
    wrapper: {
        padding: '40px'
    },
    tickers: {
        display: "flex",
        padding: "5px",
        margin: "15px",
        flexDirection: "row",
        flexWrap: "wrap",
        "& Card": {
            margin: '20px',
        },
        "& .user": {
            width: "100px",
        }
    },
    users: {
        margin: '0px',
        padding: '0px'
    },
    retweets: {
        marginRight: '30px',
        marginBottom: '10px'
    },
    select: {
        display: 'inline-block',
        marginLeft: '10px',
        marginRight: '10px',
    },
    selectLabel: {
        marginTop: 10
    },
    searchBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: '20px'
    },
    spinner: {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1',
    },
    datePosted: {
        color: '#ababab'
    },
    tweetWrap: {
        position: 'relative'
    },
    linkBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0
    }
}));

const filterId = "filters";


const ViewTweets = (props) => {
    const classes = useStyles(props);

    const [tweetInformationLoading, setTweetInformationLoading] = useState(false);

    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(new Date('2014-01-01'));
    const [endDate, setEndDate] = useState(new Date('2016-01-01'));
    const [tickers, setTickers] = useState([]);
    const [clean, setClean] = useState(false)

    const toggleClean = () => {
        setClean(!clean);
    }

    const dateOptions = {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "numeric"
    };

    const handleRangeChange = (dates) => {
        setStartDate(dates[0]);
        setEndDate(dates[1]);
    };

    const refreshTweets = async ({}) => {
        let luxonStart = startDate ? DateTime.fromJSDate(startDate): null;
        let luxonEnd = endDate ? DateTime.fromJSDate(endDate): null;
        setTweetInformationLoading(true);
        const tweetsPromise = getTweetsForWindow({
            tickers: tickers.length > 0 ? tickers : null,
            startDate: luxonStart,
            endDate: luxonEnd
        }).then(result => {
            setData(result);
            setTweetInformationLoading(false);
        });

    }

    return (
        <div className={classes.wrapper}>
            <h1>View Tweets</h1>
            <div className={classes.overviewCard}>
                <Card>
                    <form onSubmit={refreshTweets}>
                        <div className={classes.select}>
                            <p className={classes.selectLabel}>Select Tickers:</p>
                            <TickerMultiselect
                                selectedTickers = {tickers}
                                setTickers = {setTickers}
                            />
                        </div>
                        <div className={classes.select}>
                            <p className={classes.selectLabel}>Select Date Range:</p>
                            <DateRangeInput
                                closeOnSelection={false}
                                formatDate={date => date.toLocaleString("en", dateOptions)}
                                onChange={handleRangeChange}
                                parseDate={str => new Date(str)}
                                value={[startDate, endDate]}
                                timePickerProps={{showArrowButtons : true}}
                                allowSingleDayRange={true}
                                contiguousCalendarMonths={false}
                            />
                        </div>
                        <SubmitButton onClick={refreshTweets} className={classes.searchBtn} />
                    </form>
                </Card>
            </div>
            <div>
                {
                    tweetInformationLoading && (
                        <div className={classes.spinner}>
                            <div>
                                <Spinner />
                            </div>
                        </div>
                    )
                }
                { data && <Button onClick={toggleClean}>{ clean ? "Show original text" : "Show clean text" }</Button> }
                {
                data &&
                    data.map(tweet => (
                        <Card key={tweet.id}
                        style={tweet.polarity >= 0 ? (tweet.polarity === 0 ? {background: 'gray'} : {background: Colors.GREEN1})
                        :
                        {background: Colors.RED1} }
                        className={classnames(classes.tickerWrapper)} elevation={Elevation.FOUR}>
                                    <div className={classes.tweetWrap}>
                                        <Icon icon='user' iconSize={20} /> {tweet.user.name}
                                        <AnchorButton rightIcon="caret-right" outlined className={classes.linkBtn} target="_blank" href={`https://twitter.com/anyuser/status/${tweet.id}`}>View Tweet</AnchorButton>
                                    </div>
                                    {
                                        clean ?
                                        <div className={classnames(classes.tickers)}>{tweet.cleaned_text}</div> :
                                        <div className={classnames(classes.tickers)}>{tweet.text}</div>
                                    }

                            <div className={classes.retweets}><strong>Polarity: {tweet.polarity.toFixed(3)}</strong></div>
                            <div className={classes.datePosted}>{DateTime.fromISO(tweet.time).toLocaleString(DateTime.DATETIME_SHORT)}</div>
                                </Card>))
                }
            </div>
        </div>
    );
}

export default ViewTweets;
