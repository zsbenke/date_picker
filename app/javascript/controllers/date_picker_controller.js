import { Controller } from "stimulus"
import * as chrono from 'chrono-node'
import Moment from 'moment'
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment)

export default class extends Controller {
  static targets = [
    'dateField',
    'hourField',
    'minuteField',
    'timePicker',
    'currentMonthLabel',
    'calendar'
  ]

  renderer = {
    set: (target, property, value) => {
      target[property] = value

      let renderCalendar = (highlightedDate) => {
        if (highlightedDate == null) { highlightedDate = new Date() }

        let start = moment(highlightedDate).add(this.state.month, 'month').startOf('month').toDate()
        let end = moment(highlightedDate).add(this.state.month, 'month').endOf('month').toDate()
        let range = moment().range(start, end)
        let dates = Array.from(range.by('days')).map(m => m.toDate())

        this.calendarTarget.querySelectorAll('tbody td')
          .forEach((element) => {
            element.innerHTML = ''
          })

        dates.forEach((date) => {
          let currentDate = moment().format(this.dateFormat)
          let formattedDate = moment(date).format(this.dateFormat)
          let proposedDate = moment(highlightedDate).format(this.dateFormat)
          let datasetDate = `${moment(date).format(this.dateFormat)}`
          if (this.isTimeActive) {
            datasetDate += ` ${moment(this.state.proposedDate).format(this.timeFormat)}`
          }
          let coordinates = this.getCoordinates(date)
          let row = this.element.querySelector(`[data-date-picker-row="${coordinates.row}"]`)
          let column = row.querySelector(`[data-date-picker-column="${coordinates.column}"]`)
          let datePickerElement = document.createElement('a')
          datePickerElement.href = "#"
          datePickerElement.innerText = moment(date).format("D")
          datePickerElement.dataset.date = datasetDate
          datePickerElement.dataset.action = 'click->date-picker#pickDate'
          if (currentDate == formattedDate) {
            datePickerElement.classList.add('today')
          }

          if (proposedDate == formattedDate) {
            datePickerElement.classList.add('proposed_date')
          }
          column.innerHTML = datePickerElement.outerHTML
        })

        this.currentMonthLabelTarget.innerText = moment(start).format("YYYY MMMM")
      }

      if (property === 'proposedDate') {
        renderCalendar(value)

        if (this.isTimeActive) {
          this.hourFieldTarget.value = moment(value).format("HH")
          this.minuteFieldTarget.value = moment(value).format("mm")
        }
      }

      if (property === 'date') {
        this.dateFieldTarget.value = value
      }

      if (property === 'month') {
        renderCalendar(this.state.proposedDate)
      }

      if (property === 'started' && value === false) {
        this.popoverController.dismiss()
      }

      return true
    }
  }

  connect() {
    this.state = new Proxy({}, this.renderer)

    this.dateFieldTarget.readOnly = this.isTouch
    this.timePickerTarget.style.display = this.isTimeActive ? 'flex' : 'none'
  }

  currentMonth(event) {
    event.preventDefault()

    this.state.proposedDate = new Date()
    this.state.month = 0
  }

  nextMonth(event) {
    event.preventDefault()

    this.state.month += 1
  }

  previousMonth() {
    event.preventDefault()

    this.state.month -= 1
  }

  pickDate(event) {
    event.preventDefault()
    this.dismiss()

    this.state.date = event.target.dataset.date
  }

  start(event) {
    if (this.state.started === true) { return }

    this.parseDate()
    this.state.month = 0
    this.state.started = true
  }

  parseDate(event) {
    let value = this.dateFieldTarget.value.trim()
    let parsedDate = chrono.parseDate(value)
    this.state.proposedDate = parsedDate == null ? new Date() : parsedDate
  }

  adjustTime(event) {
    let hour = ('0' + this.hourFieldTarget.value.trim()).substr(-2, 2)
    let minute = ('0' + this.minuteFieldTarget.value.trim()).substr(-2, 2)
    let date = moment(this.state.proposedDate).format(this.parserDateFormat)
    let formattedTime = moment(`${date} ${hour}:${minute}`).toDate()
    this.state.proposedDate = formattedTime
    this.state.date = moment(this.state.proposedDate).format(this.format)
  }

  handleKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      this.dismiss()

      this.state.date = moment(this.state.proposedDate).format(this.format)
    }

    if (event.keyCode === 9) {
      this.dismiss()
    }
  }

  handleTimePickerKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      event.target.blur()
      this.dismiss()
    }
  }

  fillInProposedDate(event) {
    let value = this.dateFieldTarget.value.trim()

    if (value.length) {
      this.state.date = moment(this.state.proposedDate).format(this.format)
    }
  }

  dismiss(event) {
    this.state.started = false
  }

  getCoordinates(date) {
    let coordinates = {}
    let day = date.getDate()
    day += (date.getDay() == 0 ? 0 : 7 - date.getDay())
    coordinates.row = Math.ceil(parseFloat(day) / 7) - 1
    coordinates.column = ((date.getDay() + 6) % 7)
    return coordinates
  }

  get isTouch() {
    try {
      document.createEvent("TouchEvent")
      return true
    } catch (e) {
      return false
    }
  }

  get parserDateFormat() {
    return "YYYY-MM-DD"
  }

  get dateFormat() {
    return this.data.get('dateFormat') || "YYYY.MM.DD"
  }

  get timeFormat() {
    return this.data.get('timeFormat') || "HH:mm"
  }

  get format() {
    return this.isTimeActive ? `${this.dateFormat} ${this.timeFormat}` : this.dateFormat
  }

  get isTimeActive() {
    return this.data.get('time') == 'true'
  }

  get popoverController() {
    return this.application.getControllerForElementAndIdentifier(
      this.dateFieldTarget, "popover-toggle"
    )
  }
}
