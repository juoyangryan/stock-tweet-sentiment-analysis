import './App.css';
import {createUseStyles} from "react-jss";
import {ThemeProvider} from "theming";
import * as classnames from "classnames";
import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ViewTweets from "./pages/ViewTweets"
import TickerDetails from "./pages/TickerDetails";
import SentimentChangeLeaderboard from './pages/SentimentChangeLeaderboard';
import TickerComparison from "./pages/TickerComparison";


const useStyles = createUseStyles(() => ({
    wrapper: {
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.backgroundColor,
        overflow: "auto"
    }
}));

const theme = {
    backgroundColor: '#202B33'
};
/**
 * Put all routes ABOVE the "/" route.
 */
const routes = (
    <Switch>
        <Route path="/compare" children={<TickerComparison/>} />
        <Route path="/ticker/:ticker" children={<TickerDetails/>} />
        <Route path="/sentiment-change-leaderboard" children={<SentimentChangeLeaderboard/>} />
        <Route path="/tweets" children={<ViewTweets/>} />
        <Route path="/">
            <HomePage/>
        </Route>
    </Switch>
);

function App() {
    const classes = useStyles({theme});

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <div className={classnames(classes.wrapper, 'bp3-dark')}>
                    <Navbar/>
                    {routes}
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
