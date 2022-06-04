import { useState, useEffect, useRef } from 'react'
import axios from "axios";

import 'gridstack/dist/gridstack.min.css';
import { GridStack } from 'gridstack';
import 'gridstack/dist/h5/gridstack-dd-native';
import _ from "lodash";

import {bootstrap, Tooltip} from 'bootstrap'

import {Widget} from './Widgets'

function Dashboard(props) {
  const [widgets, setWidgets] = useState(props.user.widgets)
  const [savedWidgets, setSavedWidgets] = useState(props.user.widgets)

  const [widgetsRender, setWidgetsRender] = useState([])
  const [sensorList, setSensorList] = useState([])
  const [refreshInterval, setRefreshInterval] = useState(5) // Seconds

  const initialRender = useRef(true);

  let grid

  useEffect(() => {
    grid = GridStack.init({cellHeight: "110px"});
  }, []);

  useEffect(() => {
    // Get list of sensors
    axios({
      method: "GET",
      url:"/sensor_list",
      headers: {
        Authorization: 'Bearer ' + props.token
      }
    })
    .then((response) => {
      const res = response.data
      console.log(res)

      setSensorList(res)
    })
    .catch((error) => {
      if (error.response) {
        // console.log(error.response)
        console.log(error.response.status)
        // console.log(error.response.headers)
        }
    })
  }, [])

  useEffect(() => {
    // console.log("Building widgets")
    // Create widgets
    const widget_list = []
    for (let i = 0; i < widgets.length; i++) {
      let widget = null

        widget = (
          <Widget
            id = {i}
            key = {i}
            height = {widgets[i].height}
            width = {widgets[i].width}
            sensor_id = {widgets[i].sensor_id}
            periodType = {widgets[i].period_type}
            periodStart = {widgets[i].period_start}
            periodEnd = {widgets[i].period_end}
            resolution = {widgets[i].resolution}
            type = {widgets[i].type}
            token = {props.token}
            sensorList = {sensorList}
            handleSensorChange = {handleSensorChange}
            handleTypeChange = {handleTypeChange}
            handlePeriodTypeChange = {handlePeriodTypeChange}
            handlePeriodChange = {handlePeriodChange}
            setToken = {props.setToken}
            removeToken = {props.removeToken}
            grid = {grid}
            refreshInterval = {refreshInterval}
          />
        )



      widget_list.push(
        widget
      )

    }

    if (!_.isEqual(widget_list, widgetsRender)) {
      setWidgetsRender(widget_list)
    }
  }, [widgets, sensorList])

  // Wait 300ms for render to complete before making into GridStack widgets
  useEffect(() => {
    // console.log("Making widgets")
    if (typeof grid !== 'undefined' && grid !== null) {
      for (let i = 0; i < widgets.length; i++) {
        setTimeout(() => {grid.makeWidget('#widget-'+i)},300)
      }
    }

  }, [widgetsRender])

  // Activate tooltips
  useEffect(() => {
    // console.log("Building tooltips")
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      // console.log("Tooltip")
      return new Tooltip(tooltipTriggerEl)
    })
  },[widgetsRender])

  const handleSensorChange = (sensor_id, widget_id) => {
    console.log("Widget sensor changed")

    // Clone widgets array
    const new_widgets = _.cloneDeep(widgets)

    // Update sensor id for relevant widget
    new_widgets[widget_id]['sensor_id'] = sensor_id

    // Update widgets state if changed
    if (!_.isEqual(new_widgets, widgets)) {
      setWidgets(new_widgets)
    }
  }

  const handleTypeChange = (type, widget_id) => {
    console.log("Widget type changed")

    // Clone widgets array
    const new_widgets = _.cloneDeep(widgets)

    // Update type for relevant widget
    new_widgets[widget_id]['type'] = type

    // Update widgets state if changed
    if (!_.isEqual(new_widgets, widgets)) {
      setWidgets(new_widgets)
    }
  }

  const handlePeriodTypeChange = (period_type, widget_id) => {
    console.log("Widget period type changed")

    console.log(period_type, widget_id)

    // Clone widgets array
    const new_widgets = _.cloneDeep(widgets)

    // Update type for relevant widget
    new_widgets[widget_id]['period_type'] = period_type

    // Update widgets state if changed
    if (!_.isEqual(new_widgets, widgets)) {
      setWidgets(new_widgets)
    }
  }

  const handlePeriodChange = (period_start, period_end, widget_id) => {
    console.log("Widget period changed")

    console.log(period_start, period_end, widget_id)

    // Clone widgets array
    const new_widgets = _.cloneDeep(widgets)

    // Update type for relevant widget
    new_widgets[widget_id]['period_start'] = period_start
    new_widgets[widget_id]['period_end'] = period_end

    console.log(new_widgets)

    // Update widgets state if changed
    if (!_.isEqual(new_widgets, widgets)) {
      setWidgets(new_widgets)
    }
  }

  // Save widgets on change
  useEffect(() => {
    console.log(initialRender.current)
    if (!initialRender.current) {
      // console.log("Saving widgets")
      axios({
        method: "POST",
        url:"/save_widgets",
        headers: {
          Authorization: 'Bearer ' + props.token
        },
        data:{
          widgets: widgets,
         }
      })
      .then((response) => {

        // Update saved widgets
        setSavedWidgets(widgets)

        // Update user state (so that the correct widgets load on page refresh, without signing back in first)
        props.setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      })
      .catch((error) => {
        if (error.response) {
          // console.log(error.response)
          console.log("Could not save widgets")
          console.log(error.response.status)
          // console.log(error.response.headers)
          }
      })
    }
    else {
      initialRender.current = false
    }
  }, [widgets])

  return (
    <div className="dashboard">
      <div className="grid-stack">
        {widgetsRender}
      </div>
    </div>
  );
}

export default Dashboard;
