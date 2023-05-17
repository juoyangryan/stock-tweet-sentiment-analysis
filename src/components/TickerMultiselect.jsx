import {MultiSelect} from "@blueprintjs/select";
import {getAvailableTickers, getTickerToNames} from "../actions/FetchDataActions";
import {MenuItem} from "@blueprintjs/core";
import * as React from "react";

import {tickerToString} from "../data/ticker-utils";
import * as PropTypes from "prop-types";

/**
 * Based on the Blueprintjs multiselect example: https://github.com/palantir/blueprint/blob/develop/packages/docs-app/src/examples/select-examples/multiSelectExample.tsx
 * @param selectedTickers - the tickers that are selected
 * @param setTickers - called when new tickers are selected. This should update the value of selectedTickers
 * @returns {*}
 * @constructor
 */
const TickerMultiselect = ({selectedTickers, setTickers}) => {
    const getSelectedTickerIndex = (ticker) => {
        return selectedTickers.indexOf(ticker);
    }

    const isTickerSelected = (ticker) => {
        return getSelectedTickerIndex(ticker) !== -1;
    }

    const selectTicker = (ticker) => {
        selectTickers([ticker]);
    }

    const selectTickers = (tickersToSelect) => {
        setTickers([...selectedTickers, ...tickersToSelect]);
    }

    const deselectTicker = (index) => {
        setTickers(selectedTickers.filter((_ticker, ticker_index) => ticker_index !== index))
    }

    const handleTickerSelect = (ticker) => {
        if (!isTickerSelected(ticker)) {
            selectTicker(ticker);
        } else {
            deselectTicker(getSelectedTickerIndex(ticker));
        }
    }
    const tickerToNames = getTickerToNames();
    const renderTicker = (ticker, {handleClick, modifiers}) => {
        if (!modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                active={modifiers.active}
                icon={isTickerSelected(ticker) ? "tick" : "blank"}
                key={ticker}
                onClick={handleClick}
                text={tickerToString([ticker, tickerToNames[ticker]])}
                shouldDismissPopover={false}
                minimal="minimal"
            />
        );
    }

    return (
        <MultiSelect
            items={getAvailableTickers()}
            itemRenderer={renderTicker}
            onItemSelect={handleTickerSelect}
            selectedItems={selectedTickers}
            tagRenderer={value => value}
            tagInputProps={{
                onRemove: deselectTicker,
                tagProps: {
                    minimal: true
                }
            }}
            minimal="minimal"
        />
    );
}

TickerMultiselect.propTypes = {
    selectedTickers: PropTypes.arrayOf(PropTypes.string).isRequired,
    setTickers: PropTypes.func.isRequired
}

export default TickerMultiselect;

