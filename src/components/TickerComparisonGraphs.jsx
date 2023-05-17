import React from 'react'
import {useParams} from 'react-router'
import {createUseStyles} from "react-jss";
import {Card} from "@blueprintjs/core";
import { Colors } from "@blueprintjs/core";
import SentimentGraph from "./SentimentGraph";
import StockGraph from "./StockGraph";

const useStyles = createUseStyles(() => ({
    overviewCard: {
        width: '100%',
        padding: '40px',
        boxSizing: 'border-box',
    },
    graphCard: {
        width: '100%',
        padding: '40px',
        boxSizing: 'border-box',
        color: Colors.WHITE
    }
}));

export default function TickerComparisonGraphs({ticker, data: {stock, sentiment}}) {

    const classes = useStyles();

    return (
        <div>
            <div className={classes.graphCard}>
                <Card>
                    <h3>{ticker}</h3>
                    <div style={{width: '50%', float: 'left'}}>
                        <SentimentGraph
                            id={'sentimentGraph'.concat(ticker)}
                            sentimentSeries={sentiment}
                            autoSelect={true}
                            chartGroup={"sentiment-and-stock"}
                            height={350}
                        />
                    </div>
                    <div style={{marginLeft: '50%'}}>
                        <StockGraph id={'stockGraph'.concat(ticker)}
                                    stockSeries={stock}
                                    additionalGraphsToControl={['sentimentGraph']}
                                    chartGroup={"sentiment-and-stock"}
                                    height={350}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
}
