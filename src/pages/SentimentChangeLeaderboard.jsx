import React, {useState, useEffect} from 'react'
import {createUseStyles} from "react-jss";
import {Card} from "@blueprintjs/core";
import {DateRangeInput} from "@blueprintjs/datetime";
import SubmitButton from "../components/SubmitButton";
import WindowGranularitySelect from '../components/WindowGranularitySelect';
import DateTime from 'luxon/src/datetime.js';
import {getChangeInSentiment} from '../actions/FetchDataActions';
import MaterialTable, {MTableToolbar, MTablePagination} from 'material-table';
import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
import DeltaDisplay from "../components/DeltaDisplay";


const useStyles = createUseStyles(() => ({
    overviewCard: {
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        marginBottom: '20px'
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
    select: {
        display: 'inline-block',
        marginLeft: '10px',
        marginRight: '10px',
    },
    selectLabel: {
        marginTop: 10
    },
}));

const theme = createMuiTheme({
    palette: {
        type: 'dark'
    },

});

const options = {
    sorting: true,
    // paging:false,
    headerStyle: {
        backgroundColor: '#202B33',
        color: '#FFF'
    },
    rowStyle: {
        backgroundColor: '#30404D',
        color: '#FFF',
        borderColor: "#202B33"
    },
    pageSize: 10
}


const dateOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "numeric"
};

export default function SentimentChangeLeaderboard(props) {
    const classes = useStyles(props);

    const [state, setState] = useState({
        startDate: new Date("2014-01-01"),
        endDate: new Date("2016-01-01"),
        granularity: "MONTH"
    });

    const [data, setData] = useState([]);

    useEffect(() => {
        handleSearch();
    }, [])

    const handleDateChange = (dateRange) => {
        setState({...state, startDate: dateRange[0], endDate: dateRange[1]})
    };
    const handleWindowChange = (item) => {
        setState({...state, granularity: item[1]})
    };
    const handleSearch = async () => {
        let luxonStart = state.startDate ? DateTime.fromJSDate(state.startDate) : null;
        let luxonEnd = state.endDate ? DateTime.fromJSDate(state.endDate) : null;
        try {
            let result = (await getChangeInSentiment({
                aggregateWindowType: state.granularity,
                startDate: luxonStart,
                endDate: luxonEnd
            })).map((data) => {
                return {
                    ticker: data.ticker,
                    startPolarity: data.startPolarity.toFixed(3),
                    endPolarity: data.endPolarity.toFixed(3),
                    delta: data.delta.toFixed(3),
                }
            });
            setData(result);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className={classes.wrapper}>
            <h1>Sentiment Change Over Time</h1>
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
                        <WindowGranularitySelect
                            active={state.granularity}
                            handleClick={handleWindowChange}
                            excludeMinuteAndHour={true}
                        />
                    </div>
                    <SubmitButton onClick={handleSearch} className={classes.searchBtn}/>
                </Card>
            </div>
            <ThemeProvider theme={theme}>
                <MaterialTable
                    title="Sentiment Leaderboard"
                    pageSize={10}
                    components={{
                        Toolbar: props => (
                            <div style={{color: '#FFF', backgroundColor: '#30404D'}}>
                                <MTableToolbar {...props} />
                            </div>
                        ),
                        Pagination: props => (
                            <div style={{color: '#FFF !important', backgroundColor: '#202B33'}}>
                                <MTablePagination {...props}  />
                            </div>
                        )
                    }}
                    columns={[
                        {title: "Ticker", field: "ticker"},
                        {title: "Start Polarity", field: "startPolarity"},
                        {title: "End Polarity", field: "endPolarity"},
                        {title: "Delta", field: "delta", render: rowData => <DeltaDisplay delta={parseFloat(rowData.delta)} displayDigits={3}/>}
                    ]}
                    data={data}
                    options={options}
                />
            </ThemeProvider>
        </div>
    )
}
