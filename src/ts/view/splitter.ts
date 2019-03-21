import {Controller} from '../types';
import {Model} from '../types';


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
    goog.array.remove(this.onTheRight, element);
    element.style.left = '';
    element.style.right = '';
    this.redraw();
  }

  /**
   * redraw the components
   */
  redraw() {
    let pos = goog.style.getClientPosition(this.element) as any;
    let parentSize = goog.style.getContentBoxSize(this.element.parentNode as Element) as any;

    // apply the position to the elements
    this.onTheLeft.forEach(element => {
      element.style.right = parentSize.width - pos.x + 'px';
    });
    this.onTheRight.forEach(element => {
      element.style.left = Splitter.WIDTH + pos.x + 'px';
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
    goog.events.unlisten(
        this.model.file.getContentWindow(), 'mousemove', this.onMouseMoveFrame,
        false, this);
    goog.events.unlisten(
        this.model.file.getContentWindow(), 'mouseup', this.onMouseUp, true,
        this);
    goog.events.unlisten(document.body, 'mouseup', this.onMouseUp, false, this);
    goog.events.unlisten(
        document.body, 'mousemove', this.onMouseMove, false, this);
  }

  /**
   * handle mouse event of the iframe
   */
  onMouseMoveFrame(e: Event) {
    if (this.isDown) {
      let parentSize = goog.style.getContentBoxSize(this.element.parentNode as HTMLElement) as any;
      let pos = goog.style.getClientPosition(e) as any;
      let posIFrame = goog.style.getClientPosition(this.model.file.getIFrameElement()) as any;
      this.element.style.right = parentSize.width - pos.x - posIFrame.x + 'px';
      this.redraw();
    }
  }

  /**
   * handle mouse event
   */
  onMouseMove(e: Event) {
    if (this.isDown) {
      let parentSize = goog.style.getContentBoxSize(this.element.parentNode as Element) as any;
      let pos = goog.style.getClientPosition(e) as any;
      this.element.style.right = parentSize.width - pos.x + 'px';
      this.redraw();
    }
  }
}
