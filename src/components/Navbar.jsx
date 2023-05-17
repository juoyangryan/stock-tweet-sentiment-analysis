import {Button, Menu, MenuItem, Navbar, NavbarDivider, NavbarGroup, NavbarHeading} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/popover2";
import {getAvailableTickers} from "../actions/FetchDataActions";
import React, {useState} from "react";
import {createUseStyles} from "react-jss";
import {useHistory} from "react-router-dom";
import TickerOmniBar from "./TickerOmniBar";


const useStyles = createUseStyles(() => ({
    tickerMenu: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        height: '300px',
        width: '600px'
    },
}));

const AppNavbar = () => {
    const classes = useStyles();
    const history = useHistory();
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div>
            <TickerOmniBar {...{isOpen, setIsOpen}}/>
            <Navbar style={{backgroundColor: '#182026'}}>
                <NavbarGroup>
                    <NavbarHeading>Stock Tweet Sentiment Analysis</NavbarHeading>
                    <NavbarDivider/>
                    <Button minimal icon="home" text="Home" onClick={() => {
                        history.push("/")
                    }}/>
                </NavbarGroup>
                <NavbarGroup align="right">
                    <Popover2
                        placement="bottom"
                        interactionKind="hover"
                        hoverCloseDelay={100}
                        content={
                            (
                                <div>
                                    <Menu className={classes.tickerMenu}>
                                        {getAvailableTickers().map(value => (
                                            <MenuItem key={value} text={value}
                                                      onClick={() => {
                                                          history.push('/ticker/' + value)
                                                      }}/>
                                        ))}
                                    </Menu>
                                </div>
                            )}>
                        <Button minimal icon="grid-view" text="Tickers"/>
                    </Popover2>

                    <Button minimal icon="changes" text="Movement" onClick={() => {history.push("/sentiment-change-leaderboard")}}/>
                    <Button minimal icon="comparison" text="Compare" onClick={() => {
                        history.push("/compare")
                    }}/>
                    <Button minimal icon="filter-list" text="Tweets" onClick={() => {
                        history.push("/tweets")
                    }}/>
                    <Button minimal icon="search" onClick={() => setIsOpen(true)}/>
                </NavbarGroup>
            </Navbar>
        </div>
    )
};

export default AppNavbar;
