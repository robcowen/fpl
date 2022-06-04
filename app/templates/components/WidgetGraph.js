import { useState, useEffect } from 'react'
import axios from "axios";

import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';

import _ from "lodash";

function WidgetGraph(props) {

  const [processedData, setProcessedData] = useState([])

  useEffect(() => {
    if (props.graphData != null) {
      // Reformat data for Chart.js
      // console.log("Processing chart data")
      const new_processed_data = []
      for (let i = 0; i < props.graphData.length; i++) {
        new_processed_data.push({
          x: new Date(props.graphData[i].index),
          y: props.graphData[i].value
        })
      }

      if (!_.isEqual(processedData, new_processed_data)) {
        setProcessedData(new_processed_data)
      }
    }



  }, [props.graphData])


  useEffect(() => {
    // console.log(processedData)

    const data = {
      datasets: [{
        fill: false,
        spanGaps: false,
        lineTension: 0.05, //Bezier curve tension of the line. Set to 0 to draw straightlines

        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2, //width of line

        pointRadius: 0,
        pointBorderWidth: 0,
        pointBackgroundColor: 'red',
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointHitRadius: 5, //Radius at which hover becomes active

        data: processedData
      }]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        plugins: {
          legend: {
                  display: false,
              },
        },
        scales: {
            x: {
              type: 'time',
              time: {
                // unit: 'minute',
                // unitStepSize: 30,
                // displayFormats: {
                //     'day': 'ddd D MMM Y h mm a'
                // }
              },
              position: 'bottom',
              scaleLabel: {
                display: false,
                labelString: 'Time'
              },
              gridLines: {
                display: false,
              }
            },
          y: {
            min: 0,
            title: {
              display: true,
              text: "Units per "+props.resolution
            }
          }
        },
        animation: {
          duration: 0
        }
      }
    };

    const myChart = new Chart(
      document.getElementById("lineChart-"+props.widgetId),
      config
    );

    // Destroy chart on unmount
    return () => {
      myChart.destroy()
    }

  }, [processedData])




  return (
    <div className="widget-graph">
      <canvas id={"lineChart-"+props.widgetId}></canvas>
    </div>
  );
}

export {WidgetGraph};
