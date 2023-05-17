import React from 'react';
import AggregateFunction from '../data/AggregateFunction';
import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import {createUseStyles} from "react-jss";

const useStyles = createUseStyles(() => ({
    selectLabel: {
        marginTop: 10
    }
}));


export default function AggregateFunctionSelect({active, handleClick}) {
    const classes = useStyles();

    const renderFunction = (
        item,
        {handleClick}
    ) => {
        return (
            <MenuItem
                key={item[0]}
                text={item[1]}
                onClick={handleClick}
                shouldDismissPopover={true}
                minimal="true"
            />
        );
    }

    return (
        <div>
            <p className={classes.selectLabel}>Select Aggregate Function: </p>
            <Select
                items={Object.entries(AggregateFunction)}
                itemRenderer={renderFunction}
                filterable={false}
                onItemSelect={handleClick}
                minimal="true"
            >
                <Button text={active} rightIcon="caret-down" />
            </Select>
        </div>
    )
}
