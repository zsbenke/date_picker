import { Controller } from "stimulus"

export default class extends Controller {
  show(event) {
    event.preventDefault()

    document.querySelectorAll('.popover').forEach((popover) => {
      popover.classList.remove('show')
    })

    if (!this.popoverElement) { return }

    this.popoverElement.classList.add('show')
  }

  dismiss(event) {
    if (!this.popoverElement) { return }

    if (event) {
      const keepPopoverShown =
        this.element == event.target ||
        this.element.contains(event.target) ||
        this.popoverElement.contains(event.target)

      if (keepPopoverShown) { return }
    }

    this.popoverElement.classList.remove('show')
  }

  get popoverElement() {
    let selector = this.data.get('popover')
    return document.querySelector(selector)
  }
}

