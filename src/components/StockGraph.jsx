import React, {useEffect, useState} from "react";
import Chart from "react-apexcharts";


/**
 * Pass in data and height
 * @param data
 * @param height
 * @returns {*}
 * @constructor
 */
const StockGraph = ({stockSeries, volumeSeries, height, additionalGraphsToControl, chartGroup}) => {
    height = height ?? 500;
    const candleStickHeight = height;
    const barHeight = 200;

    const [data, setData] = useState(null);
    const [options, setOptions] = useState(null);

    useEffect(() => {
        if (stockSeries || volumeSeries) {
            setData({
                stockSeries: [{data: stockSeries}],
                volumeSeries: [{data: volumeSeries, name: 'Volume'}]
            });

        }
    }, [stockSeries, volumeSeries])

    useEffect(() => {
        const candleStickOptions = {
            chart: {
                type: 'candlestick',
                height: 400,
                id: 'candles',
                toolbar: {
                    autoSelected: 'pan',
                    show: false
                },
                zoom: {
                    enabled: true,
                    autoScaleYaxis: true,
                },
                animations: {
                    enabled: false
                },
                background: '0'
            },
            title: {
                text: 'Stock Price'
            },
            xaxis: {
                type: 'datetime'
            },
            yaxis: {
            },
            theme: {
                mode: 'dark'
            },
            noData: {
                text: 'No Data'
            },
        };
        const volumeOptions = {
            chart: {
                height: 400,
                type: 'bar',
                background: '0',
                brush: {
                    enabled: true,
                    targets: ['candles', ...additionalGraphsToControl]
                },
                selection: {
                    enabled: true,
                    fill: {
                        color: '#ccc',
                        opacity: 0.4
                    },
                    stroke: {
                        color: '#0D47A1',
                    }
                },
                animations: {
                    enabled: false
                },
            },
            dataLabels: {
                enabled: false
            },
            plotOptions: {
                bar: {
                    columnWidth: '80%',
                    colors: {
                        ranges: [{
                            from: -1000,
                            to: 0,
                            color: '#F15B46'
                        }, {
                            from: 1,
                            to: 10000,
                            color: '#FEB019'
                        }],

                    },
                }
            },
            stroke: {
                width: 0
            },
            xaxis: {
                type: 'datetime',
                axisBorder: {
                    offsetX: 13
                }
            },
            yaxis: {
                title: {
                    text: 'Volume'
                }
            },
            theme: {
                mode: 'dark'
            },
            tooltip: {
                enabled: true
            },

            noData: {
                text: 'No Data'
            },
        };
        setOptions({
            candleStickOptions,
            volumeOptions
        });

    }, [height])


    return (
        <div>
            {data && options && (
                <div>
                    {stockSeries && <Chart options={options.candleStickOptions} series={data.stockSeries} type="candlestick"
                           height={candleStickHeight}/>}
                    {volumeSeries && <Chart options={options.volumeOptions} series={data.volumeSeries} type="bar"
                           height={barHeight}/>}
                </div>)
            }
        </div>)
}

StockGraph.defaultProps = {
    additionalGraphsToControl: []
}

export default StockGraph;
