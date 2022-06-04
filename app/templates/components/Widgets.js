import { useState, useEffect } from 'react'
import axios from "axios";

import { WidgetSensor, WidgetPeriod, WidgetToggler, WidgetModal, WidgetPeriodText } from './WidgetComponents'
import { WidgetGraph } from './WidgetGraph'

import { DateTime } from "luxon";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid, regular, brands } from '@fortawesome/fontawesome-svg-core/import.macro' // <-- import styles to be used

// import {bootstrap, Tooltip} from 'bootstrap'

function Widget(props) {

  const [data, setData] = useState(null)
  const [widgetContent, setWidgetContent] = useState((<FontAwesomeIcon icon="fa-solid fa-arrows-rotate" className="fa-spin" />))
  const [refreshIcon, setRefreshIcon] = useState((<FontAwesomeIcon icon="fa-solid fa-arrows-rotate" className="fa-spin" />))

  function getData() {
    // setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-arrows-rotate" className="fa-spin" />))

    axios({
      method: "POST",
      url:"/production_stats",
      data: {
          "sensor_id": props.sensor_id,
          "period_type": props.periodType,
          "period_start": props.periodStart,
          "period_end": props.periodEnd,
          "type": props.type
      },
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then((response) => {
      const res = response.data
      res.access_token && props.setToken(res.access_token)

      setData(({
        count: res.count,
        timestamp: res.timestamp}))

      setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-circle-check" />))

    }).catch((error) => {
      if (error.response) {
        // console.log(error.response)
        console.log(error.response.status)
        setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />))
        // console.log(error.response.headers)

        // If token has expired, sign user out
        if (error.response.status === 401)
          props.removeToken()
        }
    })
  }

  function getGraphData() {
    // setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-arrows-rotate" className="fa-spin" />))
    axios({
      method: "POST",
      url:"/production_stats_graph",
      data: {
          "sensor_id": props.sensor_id,
          "period_type": props.periodType,
          "period_start": props.periodStart,
          "period_end": props.periodEnd,
          "type": props.type,
          "resolution": props.resolution
      },
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then((response) => {
      const res = response.data
      res.access_token && props.setToken(res.access_token)

      setData(({
        graphData: res.graph_data,
        graphResolution: res.resolution,
        timestamp: res.timestamp}))

      setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-circle-check" />))

    }).catch((error) => {
      if (error.response) {
        // console.log(error.response)
        console.log(error.response.status)
        setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />))
        // console.log(error.response.headers)

        // If token has expired, sign user out
        if (error.response.status === 401)
          props.removeToken()
        }
    })
  }

  useEffect(() => {
    let interval = null

    if (props.type === "live" || props.type === "speed") {
      getData()
      interval = setInterval(getData, props.refreshInterval * 1000)
    }
    else if (props.type === "graph") {
      getGraphData()
      interval = setInterval(getGraphData, props.refreshInterval * 1000)
    }

    return () => clearInterval(interval);
  },[props.sensor_id, props.type, props.periodStart, props.periodEnd, props.periodType])

  //  Update widget with new data
  useEffect(() => {
    if (data && data) {
      let widget_content
      if (props.type === "live" || props.type === "speed") {
        widget_content = (
          <>
            <div className="widget-value">{data.count}</div>
            {props.type === "speed" ? <div className="widget-rate">per minute</div> : null}
          </>
        )
      }
      else if (props.type === "graph") {
        widget_content = (
          <WidgetGraph
            widgetId = {props.id}
            graphData = {data.graphData}
            resolution = {data.graphResolution}
          />
        )
      }
      setWidgetContent(widget_content)

      //  Check if data is recent (no more than five refresh periods old)
      const timestamp = DateTime.fromHTTP(data.timestamp)
      const now = DateTime.now();
      const difference_seconds = now.diff(timestamp, 'seconds').toObject().seconds

      if (difference_seconds > props.refreshInterval * 5) {
        console.log("Unable to fetch data")
        setRefreshIcon((<FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />))
      }

    }
  }, [data])



  return (
    <div id={"widget-"+props.id} className="grid-stack-item" gs-w={props.width} gs-h={props.height}>
      <div className="grid-stack-item-content">
        <div className="widget-edit" role="button" data-bs-toggle="modal" data-bs-target={"#widget-modal-"+props.id} ><i className="fa-solid fa-pen"></i></div>
        <div className="widget-close"><i className="fa-solid fa-xmark"></i></div>

        {widgetContent}
        <WidgetPeriodText
          periodType = {props.periodType}
          periodStart = {props.periodStart}
          periodEnd = {props.periodEnd}
        />
        <div className="widget-details">
          <WidgetSensor
            widgetId = {props.id}
            sensorId = {props.sensor_id}
            sensorList = {props.sensorList}
            handleSensorChange = {props.handleSensorChange}
          />
          <WidgetPeriod
            widgetId = {props.id}
            periodType = {props.periodType}
            periodStart = {props.periodStart}
            periodEnd = {props.periodEnd}
            // handlePeriodChange = {props.handlePeriodChange}
            dataTimestamp = {data && data ? data.timestamp : null}
          />
          &nbsp;|&nbsp;
          <span>
            {refreshIcon}
          </span>
        </div>
        <WidgetToggler
          widgetId = {props.id}
          widgetType = {props.type}
          handleTypeChange = {props.handleTypeChange}
        />
        <WidgetModal
          widgetId = {props.id}
          sensorId = {props.sensor_id}
          sensorList = {props.sensorList}
          handleSensorChange = {props.handleSensorChange}
          periodType = {props.periodType}
          periodStart = {props.periodStart}
          periodEnd = {props.periodEnd}
          handlePeriodChange = {props.handlePeriodChange}
          dataTimestamp = {data && data ? data.timestamp : null}
          handlePeriodTypeChange = {props.handlePeriodTypeChange}
          resolution = {props.resolution}
          grid = {props.grid}
        />
      </div>
    </div>
  );
}


export {Widget};
