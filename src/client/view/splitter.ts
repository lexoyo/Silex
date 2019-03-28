import {Controller} from '../types.js';
import {Model} from '../types.js';


/**
 * Silex, live web creation
 * http://projects.silexlabs.org/?/silex/
 *
 * Copyright (c) 2012 Silex Labs
 * http://www.silexlabs.org/
 *
 * Silex is available under the GPL license
 * http://www.silexlabs.org/silex/silex-licensing/
 */

/**
 * @fileoverview
 * splitter to resize the UI
 *
 */


import { goog } from '../Goog.js';

/**
 * @param element   container to render the UI
 * @param model  model class which holds
 *                                  the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 *                                  the controller instances
 */
export class Splitter {
  onRedraw: (() => any)|undefined;
  onTheLeft: HTMLElement[] = [];
  onTheRight: HTMLElement[] = [];

  /**
   * true when the mouse is down
   */
  isDown: boolean = false;

  // store the window viewport for later use
  viewport: any;

  /**
   * width of the splitter, as defined in the CSS
   */
  static WIDTH = 5;

  constructor(
      public element: HTMLElement, public model: Model,
      public controller: Controller, opt_onRedraw?: (() => any)) {
    this.onRedraw = opt_onRedraw;

    // mouse down event
    this.element.addEventListener('mousedown', e => this.onMouseDown(e), false);

    // handle window resize event
    window.addEventListener('resize', () => this.redraw(), false);
  }

  /**
   * add a component to split
   */
  addLeft(element: HTMLElement) {
    this.onTheLeft.push(element);
    this.redraw();
  }

  /**
   * add a component to split
   */
  addRight(element: HTMLElement) {
    this.onTheRight.push(element);
    this.redraw();
  }

  /**
   * remove a component to split
   */
  remove(element: HTMLElement) {
    this.onTheRight.splice(this.onTheRight.indexOf(element), 1);
    element.style.left = '';
    element.style.right = '';
    this.redraw();
  }

  /**
   * redraw the components
   */
  redraw() {
    let pos = this.element.getBoundingClientRect();
    let parentSize = this.element.parentElement.getBoundingClientRect();

    // apply the position to the elements
    this.onTheLeft.forEach(element => {
      element.style.right = parentSize.width - pos.left + 'px';
    });
    this.onTheRight.forEach(element => {
      element.style.left = Splitter.WIDTH + pos.left + 'px';
    });
    if (this.onRedraw) {
      this.onRedraw();
    }
  }

  /**
   * handle mouse event
   */
  onMouseDown(e: Event) {
    this.isDown = true;

    // listen mouse events
    this.model.file.getContentWindow().addEventListener('mousemove', e => this.onMouseMoveFrame(e), false);
    this.model.file.getContentWindow().addEventListener('mouseup', e => this.onMouseUp(e), true);
    document.body.addEventListener('mouseup', e => this.onMouseUp(e), false);
    document.body.addEventListener('mousemove', e => this.onMouseMove(e), false);
  }

  /**
   * handle mouse event
   */
  onMouseUp(e: Event) {
    this.isDown = false;

    // stop listening
    goog.Event.unlisten(
        this.model.file.getContentWindow(), 'mousemove', this.onMouseMoveFrame,
        false, this);
    goog.Event.unlisten(
        this.model.file.getContentWindow(), 'mouseup', this.onMouseUp, true,
        this);
    goog.Event.unlisten(document.body, 'mouseup', this.onMouseUp, false, this);
    goog.Event.unlisten(
        document.body, 'mousemove', this.onMouseMove, false, this);
  }

  /**
   * handle mouse event of the iframe
   */
  onMouseMoveFrame(e: Event) {
    if (this.isDown) {
      let parentSize = this.element.parentElement.getBoundingClientRect();
      let pos = (e.target as HTMLElement).getBoundingClientRect();
      let posIFrame = this.model.file.getIFrameElement().getBoundingClientRect();
      this.element.style.right = parentSize.width - pos.left - posIFrame.left + 'px';
      this.redraw();
    }
  }

  /**
   * handle mouse event
   */
  onMouseMove(e: Event) {
    if (this.isDown) {
      let parentSize = this.element.parentElement.getBoundingClientRect();
      let pos = (e.target as HTMLElement).getBoundingClientRect();
      this.element.style.right = parentSize.width - pos.left + 'px';
      this.redraw();
    }
  }
}
