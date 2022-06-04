import { useState, useEffect } from 'react'
import axios from "axios";

import _ from "lodash";

import { DateTime } from "luxon";


function WidgetSensor(props) {

  const [sensor, setSensor] = useState(null)

  return (
    <>
    <span className="widget-title" role="button" role="button" data-bs-toggle="modal" data-bs-target={"#widget-modal-"+props.widgetId} data-bs-toggle="tooltip" data-bs-placement="bottom" title={(props.sensorList.length > 0) ? props.sensorList.find(( sensor ) => sensor.id === props.sensorId).name : null}>
      <i className="far fa-signal-stream"></i>
    </span>
    </>
  );
}

function WidgetPeriod(props) {

  const [editable, setEditable] = useState(false)
  const [pickerRange, setPickerRange] = useState([null, null])

  useEffect(() => {

    // Handle relative dates
    if (props.periodType === "relative") {
      const new_start = DateTime.now().plus({minutes: props.periodStart}).toLocaleString(DateTime.DATETIME_MED)
      const new_end = DateTime.now().plus({minutes: props.periodEnd}).toLocaleString(DateTime.DATETIME_MED)

      const new_picker_range = [new_start, new_end]


      if (!_.isEqual(pickerRange, new_picker_range)) {
        setPickerRange(new_picker_range)
      }
    }


  }, [props.periodType, props.periodStart, props.periodEnd, props.dataTimestamp])

  // TODO: Allow date ranges




  return (
    <>
      <span> | </span>
      <span className="widget-title" data-bs-toggle="tooltip" data-bs-placement="bottom" title={"Start: "+pickerRange[0]}><i className="fas fa-arrow-alt-from-left" /></span>
      <span> | </span>
      <span className="widget-title" data-bs-toggle="tooltip" data-bs-placement="bottom" title={"End: "+pickerRange[1]}><i className="fas fa-arrow-alt-to-right" /></span>
    </>
  );
}

function WidgetToggler(props) {

  return (
    <div className="widget-toggler">
      <span role="button" onClick={() => props.handleTypeChange("live", props.widgetId)} className={props.widgetType === "live" ? "active" : null}><i className="far fa-tally"></i></span>
      <span> | </span>
      <span role="button" onClick={() => props.handleTypeChange("speed", props.widgetId)} className={props.widgetType === "speed" ? "active" : null}><i className="far fa-tachometer-alt-slow"></i></span>
      <span> | </span>
      <span role="button" onClick={() => props.handleTypeChange("graph", props.widgetId)} className={props.widgetType === "graph" ? "active" : null}><i className="far fa-chart-line"></i></span>
    </div>
  );
}

function WidgetPeriodText(props) {
  let period_text
  let unit
  let value

  if (props.periodType === "relative") {
    if (-props.periodStart <= 60) {
      unit = "minutes"
      value = -props.periodStart
    }
    else if (-props.periodStart <= 1440) {
      unit = "hours"
      value = -props.periodStart / 60
    }
    else {
      unit = "days"
      value = -props.periodStart / (60*24)
    }
    // else if (-props.periodStart <= 60 * 60 * 24 * 90) {
    //   unit = "weeks"
    //   value = -props.periodStart / (60*24*7)
    // }
    // else if (-props.periodStart <= 60 * 60 * 24 * 365 * 2) {
    //   unit = "months"
    //   value = -props.periodStart / (60*24*30)
    // }
    // else {
    //   unit = "years"
    //   value = -props.periodStart / (60*24*365)
    // }
  }

  period_text = "last "+ Math.round(value) + " " + unit

  return (
    <div className="widget-period-text">
      {period_text}
    </div>
  );
}

function WidgetModal(props) {

  const [periodTypeRadios, setPeriodTypeRadios] = useState(<>
    <div className="form-check form-check-inline">
      <label>
        <input className="form-check-input" type="radio" name="period-type" id="relative" value="relative" checked={props.periodType === "relative"} onChange={(e) => props.handlePeriodTypeChange(e.target.value, props.widgetId)} />
        Relative
      </label>
    </div>
  </>)

  const [periodSettings, setPeriodSettings] = useState(null)

  let unit = null
  let value = null
  if (props.periodType === "relative") {
    if (-props.periodStart < 60) {
      unit = "minutes"
      value = -props.periodStart
    }
    else if (-props.periodStart < 1440) {
      unit = "hours"
      value = -props.periodStart / 60
    }
    else if (-props.periodStart < 10080) {
      unit = "days"
      value = -props.periodStart / (60*24)
    }
    else if (-props.periodStart < 60 * 60 * 24 * 7) {
      unit = "weeks"
      value = -props.periodStart / (60*24*7)
    }
    else if (-props.periodStart < 60 * 60 * 24 * 30) {
      unit = "months"
      value = -props.periodStart / (60*24*30)
    }
    else {
      unit = "years"
      value = -props.periodStart / (60*24*365)
    }
  }

  const [periodPresets, setPeriodPresets] = useState([value, unit])

  const sensor_dropdown = (
    <select
      className="form-select"
      aria-label="Select sensor"
      value={props.sensorId}
      onChange={(e) => props.handleSensorChange(Number(e.target.value), props.widgetId)}
    >
      {props.sensorList.map((sensor) => {
                     return <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
                 })}
    </select>
  )

  // Determine presets
  // useEffect(() => {
  //
  //
  // }, [])

  useEffect(() => {
    const period_type_radios = (
      <div className="col-form-label">
        <div className="form-check form-check-inline">
          <label>
            <input className="form-check-input" type="radio" name="period-type" id="relative" value="relative" checked={props.periodType === "relative"} onChange={(e) => props.handlePeriodTypeChange(e.target.value, props.widgetId)} />
            Relative
          </label>
        </div>
        <div className="form-check form-check-inline">
          <label>
            <input className="form-check-input" type="radio" name="period-type" id="absolute" value="absolute" checked={props.periodType === "absolute"} onChange={(e) => props.handlePeriodTypeChange(e.target.value, props.widgetId)} />
            Absolute
          </label>
        </div>
      </div>
    )

    if (period_type_radios !== periodTypeRadios) {
      setPeriodTypeRadios(period_type_radios)
    }


    const relative_period_settings = (
      <div className="row mt-3">
        <div className="col-auto">
          <div className="col-form-label">
            Last
          </div>
        </div>
        <div className="col-auto">
          <label className="visually-hidden" htmlFor="autoSizingInput">Number</label>
          <input
            type="number"
            className="form-control"
            id="periodStartNumber"
            placeholder="e.g. 30"
            value={periodPresets[0]}
            onChange={(e) => onPeriodStartNumberChange(Number(e.target.value))}
          />
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            aria-label="Select time period start"
            value={periodPresets[1]}
            onChange={(e) => onPeriodStartUnitChange(e.target.value)}
          >
            <option key="minutes" value="minutes">Minutes</option>
            <option key="hours" value="hours">Hours</option>
            <option key="days" value="days">Days</option>
            <option key="weeks" value="weeks">Weeks</option>
            <option key="months" value="months">Months</option>
            <option key="years" value="years">Years</option>
          </select>
        </div>
      </div>
    )

    const absolute_period_settings = (
      <>
      </>
    )

    if (props.periodType === "relative") {
      if (periodSettings !== relative_period_settings) {
        setPeriodSettings(relative_period_settings)
      }
    }

    else if (props.periodType === "absolute") {
      if (periodSettings !== absolute_period_settings) {
        setPeriodSettings(absolute_period_settings)
      }
    }

  },[props.periodType, props.periodStart, props.periodEnd, periodPresets])

  const onPeriodStartUnitChange = (unit) => {
    // Update period presets
    const new_period_presets = _.cloneDeep(periodPresets)

    new_period_presets[1] = unit
    console.log(unit)
    console.log(new_period_presets)
    if (!_.isEqual(new_period_presets, periodPresets)) {
      setPeriodPresets(new_period_presets)
    }
  }

  const onPeriodStartNumberChange = (value) => {
    // Update period presets
    const new_period_presets = _.cloneDeep(periodPresets)

    new_period_presets[0] = value

    if (!_.isEqual(new_period_presets, periodPresets)) {
      setPeriodPresets(new_period_presets)
    }
  }

  useEffect(() => {
    // Calculate relative minutes
    const value = periodPresets[0]
    const unit = periodPresets[1]

    let minutes = null

    console.log(value)

    switch (unit) {
      case "minutes": minutes = value
                      break
      case "hours":   minutes = value * 60
                      break
      case "days":    minutes = value * 60 * 24
                      break
      case "weeks":   minutes = value * 60 * 24 * 7
                      break
      case "months":  minutes = value * 60 * 24 * 30
                      break
      case "years":   minutes = value * 60 * 24 * 365
                      break

    }

    // Update state
    props.handlePeriodChange(-minutes, 0, props.widgetId)

  }, [periodPresets])

  useEffect(() => {
    var modal = document.getElementById("widget-modal-"+props.widgetId)
    console.log("#widget-modal-"+props.widgetId)
    console.log(modal)
    if (modal !== null) {
      modal.addEventListener('shown.bs.modal', function (event) {
        // Disable gridstack when modal opened
        props.grid.disable()
        console.log("Hello")
      })
      modal.addEventListener('hidden.bs.modal', function (event) {
        // Enable gridstack when modal closed
        props.grid.enable()
        console.log("Bye")
      })
    }
  },[])

  return (
    <div className="modal" id={"widget-modal-"+props.widgetId}  tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Widget</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="input-group">
              <span className="input-group-text" id="basic-addon1"><i className="far fa-signal-stream"></i></span>
              {sensor_dropdown}
            </div>
            <div className="row mt-3">
              {periodSettings}
            </div>

          </div>

        </div>
      </div>
    </div>

  );
}

export {WidgetSensor, WidgetPeriod, WidgetToggler, WidgetModal, WidgetPeriodText};
