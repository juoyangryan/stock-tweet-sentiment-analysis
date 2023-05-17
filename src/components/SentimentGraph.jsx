import React, {useState, useEffect} from 'react';
import Chart from "react-apexcharts";

export default function SentimentGraph({sentimentSeries, height, id, autoSelect, chartGroup}) {
    const [data, setData] = useState(null);
    const [options, setOptions] = useState(null);

    useEffect(() => {
        if (sentimentSeries) {
            setData([{name: 'Polarity', data: sentimentSeries}]);
        }
    }, [sentimentSeries])

    useEffect(() => {
        const autoSelectOptions = autoSelect ? {
            toolbar: {
                autoSelect: 'pan',
                show: false
            }
        } : {};
        setOptions({
            colors: ['#00D8FF'],
            chart: {
                type: 'line',
                id,
                ...autoSelectOptions,
                height: height,
                background: '0',
                animations: {
                    enabled: false
                },
                zoom: {
                    enabled: false,
                    autoScaleYaxis: true,
                }
            },
            yaxis: {
                decimalsInFloat: 3
            },
            legend: {show: false},
            title: {
                text: 'Sentiment',
                align: 'left'
            },
            xaxis: {
                type: 'datetime'
            },
            theme: {
                mode: 'dark',
            },
            bar: {
                borderRadius: 0,
            },
            background: 0,
            stroke: {
                width: 2,
            },
            noData: {
                text: 'No Data'
            },
        });
    }, [height]);


    return (
        <div>
            {data && options && (
                <div>
                    <Chart options={options} series={data} type="line" height={height}/>
                </div>)
            }
        </div>
    );

}
