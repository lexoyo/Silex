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
 *   This class is used to manage how elements are dragged on the stage
 *   There is also a concept of "sticky lines" to which elements stick when
 * resized or moved The sticky lines can be automatically created on "startDrag"
 * from the components on the stage (to have sticky elements) or they can be set
 * by the user like rulers - yet to be developed (TODO) The process of creation
 * of sticky lines on startDrag is asynchronous through the use of generators
 * and continuation
 */
var GStyle = goog.require("goog:goog.style");

import { Body } from '../model/body';
import { SilexElement } from '../model/element';
import { Page } from '../model/page';
import { Model, StickyLine, StickyPoint, View } from '../types';
import { Stage } from '../view/stage';


function* buildStickyLinesFromElements(win, allWebsiteElements, dragSystem) {
  // console.log('loop START !!!', dragSystem.stickyLines);
  const stickableElements = allWebsiteElements.filter(
      (element) => dragSystem.isDraggable(element) &&
          !element.classList.contains(
              SilexElement.SELECTED_CLASS_NAME) &&
          (dragSystem.model.page.isInPage(element) ||
           !element.classList.contains(Page.PAGED_CLASS_NAME)));
  yield;
  for (let element of stickableElements) {
    const elementId = dragSystem.model.property.getSilexId(element);
    const box = dragSystem.getBoundingBox(win, element);
    const base = {
      metaData: {type: 'element', elementId: elementId, element: element}
    };
    dragSystem.addStickyLine(
        (Object.assign(
             {
               id: elementId + '_left',
               vertical: true,
               position: box.left,
               stickyPoint: StickyPoint.LEFT
             },
             base) as StickyLine));
    yield;
    dragSystem.addStickyLine(
        (Object.assign(
             {
               id: elementId + '_right',
               vertical: true,
               position: box.right,
               stickyPoint: StickyPoint.RIGHT
             },
             base) as StickyLine));
    yield;
    dragSystem.addStickyLine(
        (Object.assign(
             {
               id: elementId + '_top',
               vertical: false,
               position: box.top,
               stickyPoint: StickyPoint.TOP
             },
             base) as StickyLine));
    yield;
    dragSystem.addStickyLine(
        (Object.assign(
             {
               id: elementId + '_bottom',
               vertical: false,
               position: box.bottom,
               stickyPoint: StickyPoint.BOTTOM
             },
             base) as StickyLine));
  }
}

// yield;
// dragSystem.addStickyLine(/** @type {StickyLine} */ (Object.assign({
//   id: elementId + '_midV',
//   vertical: false,
//   position: Math.round((box.bottom - box.top) / 2),
//   stickyPoint: StickyPoint.MID_V,
// }, base)));
// yield;
// dragSystem.addStickyLine(/** @type {StickyLine} */ (Object.assign({
//   id: elementId + '_midH',
//   vertical: true,
//   position: Math.round((box.right - box.left) / 2),
//   stickyPoint: StickyPoint.MID_H,
// }, base)));

// console.log('loop STOP !!!', dragSystem.stickyLines);

/**
 * Handle elements "stickyness" and movements
 *
 * @class {silex.model.DragSystem}
 */
export class DragSystem {
  // static constants
  static get STICKY_DISTANCE() {
    return 5;
  }
  static get STUCK_CSS_CLASS() {
    return 'stuck';
  }
  static get STUCK_LEFT_CSS_CLASS() {
    return 'stuck-left';
  }
  static get STUCK_RIGHT_CSS_CLASS() {
    return 'stuck-right';
  }
  static get STUCK_TOP_CSS_CLASS() {
    return 'stuck-top';
  }
  static get STUCK_BOTTOM_CSS_CLASS() {
    return 'stuck-bottom';
  }
  model: any;
  view: any;
  stickyLines: Map<string, StickyLine>;

  /**
   * is auto sticky elements on or off
   */
  autoStickyElements: boolean = false;

  /**
   * flag used to stop the async process building auto sticky elements lines
   */
  stopAutoStickyElements: boolean = false;

  /**
   * @param model  model class which holds the other models
   * @param view  view class which holds the other views
   */
  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    this.stickyLines = new Map();
  }

  toggleStickyElements() {
    this.setStickyElements(!this.getStickyElements());
  }

  getStickyElements() {
    return this.autoStickyElements;
  }

  setStickyElements(enable) {
    this.autoStickyElements = enable;
    this.view.contextMenu.redraw();
  }

  /**
   * @param win the window object of the iframe in which elements are
   */
  startDrag(win: Window) {
    if (this.autoStickyElements) {
      const allWebsiteElements = Array.from(win.document.querySelectorAll(
          '.' + Body.EDITABLE_CLASS_NAME));
      this.stopAutoStickyElements = false;
      this.nextStep(
          buildStickyLinesFromElements(win, allWebsiteElements, this));
    }
  }

  /**
   * every animation frame, compute part of the sticky lines
   * this is optimization
   */
  nextStep(iterator) {
    if (!this.stopAutoStickyElements) {
      if (!iterator.next().done) {
        requestAnimationFrame(() => this.nextStep(iterator));
      }
    }
  }

  /**
   * @param win the window object of the iframe in which elements are
   */
  stopDrag(win: Window) {
    this.stopAutoStickyElements = true;
    this.removeElementsStickyLines();
    this.removeAllStyckyHtmlMarkup(win);
  }

  /**
   * remove sticky lines created with next step() anad
   * buildStickyLinesFromElements()
   */
  removeElementsStickyLines() {
    this.stickyLines.forEach((s) => {
      if (s.metaData && s.metaData.type === 'element') {
        this.removeStickyLine(s);
      }
    });
  }

  /**
   * @param win the window object of the iframe in which elements are
   */
  removeAllStyckyHtmlMarkup(win: Window) {
    // remove the 'stuck' css class
    Array.from(win.document.getElementsByClassName(DragSystem.STUCK_CSS_CLASS))
        .forEach(
            (element) => element.classList.remove(DragSystem.STUCK_CSS_CLASS));

    // remove the 'stuck-left', 'stuck-top'... css classes
    [DragSystem.STUCK_LEFT_CSS_CLASS, DragSystem.STUCK_RIGHT_CSS_CLASS,
     DragSystem.STUCK_TOP_CSS_CLASS, DragSystem.STUCK_BOTTOM_CSS_CLASS]
        .forEach((cssClass) => {
          Array.from(win.document.getElementsByClassName(cssClass))
              .forEach((element) => element.classList.remove(cssClass));
        });
  }

  getStickyLine(id: string): StickyLine {
    return this.stickyLines.get(id);
  }

  addStickyLine(s: StickyLine) {
    if (this.stickyLines.has(s.id)) {
      throw new Error(
          'Error: the sticky line with id "' + s.id + '" already exists');
    }
    return this.stickyLines.set(s.id, s);
  }

  removeStickyLine(s: StickyLine) {
    return this.stickyLines.delete(s.id);
  }

  /**
   * make the followers follow the element's size
   * @param win the window object of the iframe in which elements are
   * @param followers which will follow the elements
   * @param resizeDirection the direction n, s, e, o, ne, no, se, so
   * @param offsetX the delta to be applied
   * @param offsetY the delta to be applied
   */
  followElementSize(
      win: Window, followers: HTMLElement[], resizeDirection: string,
      offsetX: number, offsetY: number) {
    // check for a sticky line
    const element = followers[0];
    const box = this.getBoundingBox(win, element);
    let stuck = false;

    // cleanup before marking elements again when stuck
    this.removeAllStyckyHtmlMarkup(win);

    // for each sticky line, check if element sticks
    this.stickyLines.forEach((s) => {
      const allowedDirections = (() => {
        switch (s.stickyPoint) {
          case StickyPoint.LEFT:
          case StickyPoint.RIGHT:
            return ['o', 'e'];
          case StickyPoint.TOP:
          case StickyPoint.BOTTOM:
            return ['n', 's'];
        }
      })();
      const delta = s.position - box[s.stickyPoint];
      if (
          // keep only the lines corresponding to the resize direction, e.g. the
          // left vertical lines when we resize the top left corner
          allowedDirections.indexOf(resizeDirection) > -1 &&
          // and keep only the lines which are near the resized edge
          Math.abs(delta) < DragSystem.STICKY_DISTANCE) {
        if (!stuck) {
          stuck = true;
          switch (s.stickyPoint) {
            case StickyPoint.LEFT:
            case StickyPoint.RIGHT:

              // case StickyPoint.MID_V:
              offsetX += delta;
              break;
            case StickyPoint.TOP:
            case StickyPoint.BOTTOM:

              // case StickyPoint.MID_H:
              offsetY += delta;
              break;
          }
        }

        // mark all elements (the dragged element and the ones to which it
        // sticks) console.log('stick!!!');
        [element, s.metaData.element].forEach((el) => {
          el.classList.add(DragSystem.STUCK_CSS_CLASS);
          el.classList.add(`stuck-${s.stickyPoint}`);
        });
      }
    });

    // apply offset to other selected element
    followers.forEach((follower) => {
      // do not resize the stage or the un-resizeable elements
      if (follower.tagName.toUpperCase() !== 'BODY' &&
          !follower.classList.contains(
              Body.PREVENT_RESIZABLE_CLASS_NAME)) {
        let pos = GStyle.getPosition(follower);
        let offsetPosX = pos.x;
        let offsetPosY = pos.y;
        let offsetSizeX = offsetX;
        let offsetSizeY = offsetY;

        // depending on the handle which is dragged,
        // only width and/or height should be set
        switch (resizeDirection) {
          case 's':
            offsetSizeX = 0;
            break;
          case 'n':
            offsetPosY += offsetSizeY;
            offsetSizeY = -offsetSizeY;
            offsetSizeX = 0;
            break;
          case 'w':
            offsetPosX += offsetSizeX;
            offsetSizeX = -offsetSizeX;
            offsetSizeY = 0;
            break;
          case 'e':
            offsetSizeY = 0;
            break;
          case 'se':
            break;
          case 'sw':
            offsetPosX += offsetSizeX;
            offsetSizeX = -offsetSizeX;
            break;
          case 'ne':
            offsetPosY += offsetSizeY;
            offsetSizeY = -offsetSizeY;
            break;
          case 'nw':
            offsetPosX += offsetSizeX;
            offsetPosY += offsetSizeY;
            offsetSizeY = -offsetSizeY;
            offsetSizeX = -offsetSizeX;
            break;
        }
        const size = GStyle.getSize(follower);
        const borderBox = GStyle.getBorderBox(follower);
        const style = win.getComputedStyle(follower);
        const paddingBox = {
          left: parseInt(style.paddingLeft, 10),
          right: parseInt(style.paddingRight, 10),
          top: parseInt(style.paddingTop, 10),
          bottom: parseInt(style.paddingBottom, 10)
        };

        // handle section content elements which are forced centered
        // (only when the background is smaller than the body)
        // TODO in a while: remove support of .background since it is now a
        // section
        if ((follower.classList.contains(Stage.BACKGROUND_CLASS_NAME) ||
             this.model.element.isSectionContent(follower)) &&
            size.width < win.document.documentElement.clientWidth - 100) {
          offsetSizeX *= 2;
        }

        // compute new size
        let newSizeW = size.width + offsetSizeX - borderBox.left -
            paddingBox.left - borderBox.right - paddingBox.right;
        let newSizeH = size.height + offsetSizeY - borderBox.top -
            paddingBox.top - borderBox.bottom - paddingBox.bottom;

        // handle min size
        if (newSizeW < SilexElement.MIN_WIDTH) {
          if (resizeDirection === 'w' || resizeDirection === 'sw' ||
              resizeDirection === 'nw') {
            offsetPosX -= SilexElement.MIN_WIDTH - newSizeW;
          }
          newSizeW = SilexElement.MIN_WIDTH;
        }
        if (newSizeH < SilexElement.MIN_HEIGHT) {
          if (resizeDirection === 'n' || resizeDirection === 'ne' ||
              resizeDirection === 'nw') {
            offsetPosY -= SilexElement.MIN_HEIGHT - newSizeH;
          }
          newSizeH = SilexElement.MIN_HEIGHT;
        }

        // set position in case we are resizing up or left
        followers.forEach((element) => {
          this.model.element.setStyle(
              element, 'top', Math.round(offsetPosY) + 'px');
          this.model.element.setStyle(
              element, 'left', Math.round(offsetPosX) + 'px');

          // apply the new size
          this.model.element.setStyle(
              element, 'width', Math.round(newSizeW) + 'px');
          this.model.element.setStyle(
              element, this.model.element.getHeightStyleName(follower),
              Math.round(newSizeH) + 'px');
        });
      }
    });
  }

  /**
   * make the followers follow the element's position
   * @param win the window object of the iframe in which elements are
   * @param followers which will follow the elements
   * @param offsetX the delta to be applied
   * @param offsetY the delta to be applied
   */
  followElementPosition(
      win: Window, followers: HTMLElement[], offsetX: number, offsetY: number) {
    // check for a sticky line
    const element = followers[0];
    const box = this.getBoundingBox(win, element);
    let stuckX = false;
    let stuckY = false;

    // cleanup before marking elements again when stuck
    this.removeAllStyckyHtmlMarkup(win);

    // for each sticky line, check if element sticks
    this.stickyLines.forEach((s) => {
      if (stuckX && stuckY) {
        return;
      }
      const pos = (() => {
        switch (s.stickyPoint) {
          case StickyPoint.LEFT:
            return box.left;
          case StickyPoint.RIGHT:
            return box.right;
          case StickyPoint.TOP:
            return box.top;
          case StickyPoint.BOTTOM:
            return box.bottom;
        }
      })();

      // case StickyPoint.MID_H:
      //   return Math.round((box.right - box.left) / 2);
      // case StickyPoint.MID_V:
      //   return Math.round((box.bottom - box.top) / 2);

      // check if we should stick
      const delta = s.position - pos;
      if (Math.abs(delta) < DragSystem.STICKY_DISTANCE) {
        switch (s.stickyPoint) {
          case StickyPoint.LEFT:
          case StickyPoint.RIGHT:

            // case StickyPoint.MID_V:
            if (!stuckX) {
              offsetX += delta;
              stuckX = true;
            }
            break;
          case StickyPoint.TOP:
          case StickyPoint.BOTTOM:

            // case StickyPoint.MID_H:
            if (!stuckY) {
              offsetY += delta;
              stuckY = true;
            }
            break;
        }

        // mark all elements (the dragged element and the ones to which it
        // sticks) console.log('stick!!!');
        [element, s.metaData.element].forEach((el) => {
          el.classList.add(DragSystem.STUCK_CSS_CLASS);
          el.classList.add(`stuck-${s.stickyPoint}`);
        });
      }
    });

    // apply offset to other selected element
    followers.forEach((follower) => {
      // do not move an element if one of its parent is already being moved
      // or if it is the stage
      // or if it has been marked as not draggable
      if (this.isDraggable(follower)) {
        // do not do this anymore because the element is moved to the body
        // during drag so its position is wrong: update the toolboxes to display
        // the position during drag let pos = GStyle.getPosition(follower);
        // let finalY = Math.round(pos.y + offsetY);
        // let finalX = Math.round(pos.x + offsetX);
        // this.controller.stageController.styleChanged('top', finalY + 'px',
        // [follower], false);
        // this.controller.stageController.styleChanged('left', finalX + 'px',
        // [follower], false); move the element let pos =
        // GStyle.getPosition(follower);
        let left = parseInt(this.model.element.getStyle(follower, 'left'), 10);
        let top = parseInt(this.model.element.getStyle(follower, 'top'), 10);
        this.model.element.setStyle(
            follower, 'left', Math.round(left + offsetX) + 'px');
        this.model.element.setStyle(
            follower, 'top', Math.round(top + offsetY) + 'px');
      }
    });
  }

  isDraggable(element) {
    return element.tagName.toUpperCase() !== 'BODY' &&
        !goog.dom.getAncestorByClass(
            element.parentNode, SilexElement.SELECTED_CLASS_NAME) &&
        !element.classList.contains(
            Body.PREVENT_DRAGGABLE_CLASS_NAME);
  }

  getBoundingBox(win, element: Element):
      {left: number, right: number, top: number, bottom: number} {
    const box = (() => {
      if (this.view.workspace.getMobileEditor()) {
        // mobile => mix the 2 syles to have the final style
        const mob = this.model.property.getStyle(element, true) || {};
        const desk = this.model.property.getStyle(element, false) || {};
        return Object.assign({}, desk, mob);
      } else {
        return this.model.property.getStyle(element, false);
      }
    })();

    // parseInt(box.top, 10) + (parseInt(box.height || box['min-height'], 10)),
    if (box) {
      const computedHeight =
          parseInt(win.getComputedStyle(element).height || 0, 10);
      const height = Math.max(computedHeight, parseInt(box['min-height'], 10));
      const elementPos = GStyle.getPageOffset(element);
      return {
        'left': elementPos.x,
        // parseInt(box.left, 10),
        'right': elementPos.x + parseInt(box.width, 10),
        // parseInt(box.left, 10) + parseInt(box.width, 10),
        'top': elementPos.y,
        // parseInt(box.top, 10),
        'bottom': elementPos.y + height
      };
    } else {
      console.error('could not get bounding box of', element);
      throw new Error('could not get bounding box of element');
    }
  }
}
