import * as React from "react";

import { Omnibar } from "@blueprintjs/select";
import {getTickerToNames} from "../actions/FetchDataActions";
import {useHistory} from "react-router-dom";
import {MenuItem} from "@blueprintjs/core";
import {tickerToString} from "../data/ticker-utils";

/**
 * Based on the Blueprintjs example: https://github.com/palantir/blueprint/blob/develop/packages/docs-app/src/examples/select-examples/omnibarExample.tsx
 */
const TickerOmniBar = ({isOpen, setIsOpen}) => {
    const history = useHistory();


    const handleItemSelect = ([ticker, name]) => {
        history.push(`/ticker/${ticker}`)
        setIsOpen(false);
    }

    return (
        <Omnibar
            items={Object.entries(getTickerToNames())}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            itemPredicate={filterItem}
            itemRenderer={renderTicker}
            onItemSelect={handleItemSelect}
            filter
        />
    )
}

const renderTicker = ([ticker, name], { handleClick, modifiers, query }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={ticker}
            onClick={handleClick}
            text={highlightText(tickerToString([ticker, name]), query)}
            minimal="minimal"
        />
    );
};

function highlightText(text, query) {
    let lastIndex = 0;
    const words = query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(escapeRegExpChars);
    if (words.length === 0) {
        return [text];
    }
    const regexp = new RegExp(words.join("|"), "gi");
    const tokens = [];
    while (true) {
        const match = regexp.exec(text);
        if (!match) {
            break;
        }
        const length = match[0].length;
        const before = text.slice(lastIndex, regexp.lastIndex - length);
        if (before.length > 0) {
            tokens.push(before);
        }
        lastIndex = regexp.lastIndex;
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
    }
    const rest = text.slice(lastIndex);
    if (rest.length > 0) {
        tokens.push(rest);
    }
    return tokens;
}

function escapeRegExpChars(text) {
    return text.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
}

function filterItem(query, [ticker, name], _index, exactMatch) {
    const normalizedTitle = name.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    if (exactMatch) {
        return normalizedTitle === normalizedQuery;
    } else {
        return `${name.toLowerCase()} ${ticker.toLowerCase()}`.indexOf(normalizedQuery) >= 0;
    }
};

export default TickerOmniBar;
