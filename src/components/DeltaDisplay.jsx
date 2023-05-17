import React from "react";
import PropTypes from "prop-types";

const DeltaDisplay = ({
    delta,
    displayDigits,
    ...rest
}) => {
    let displaySign;
    let displayColor;
    if (delta === 0) {
        displaySign = ""
        displayColor = "gray";
    } else if (delta > 0) {
        displaySign = "+"
        displayColor = "green"
    } else {
        displaySign = "";
        displayColor = "red";
    }
    return (
        <span style={{color: displayColor}}>{displaySign} {delta.toFixed(displayDigits)}</span>
    )
};

DeltaDisplay.props = {
    delta: PropTypes.number.isRequired,
    displayDigits: PropTypes.number
}
DeltaDisplay.defaultProps = {
    displayDigits: 1
}

export default DeltaDisplay;
