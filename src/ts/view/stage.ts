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
 * @fileoverview The stage is the area where the user drag/drops elements
 *   This class is in charge of listening to the DOM of the loaded publication
 *   and retrieve information about it
 *
 */
var events = goog.require("goog:goog.events");
var {MouseWheelHandler} = goog.require("goog:goog.events.MouseWheelHandler");


import { Controller, Model } from '../types.js';
import { InvalidationManager } from '../utils/invalidation-manager.js';
import { Keyboard, Shortcut } from '../utils/Keyboard.js';
import { ContextMenu } from '../view/context-menu.js';
import { Body } from '../model/body.js';
import { SilexElement } from '../model/element.js';
import { Page } from '../model/page.js';

/**
 * the Silex stage class
 * load the template and render to the given html element
 * @param  element  DOM element to which I render the UI
 *  has been changed by the user
 * @param model  model class which holds
 *                                  the model instances - views use it for read
 * operation only structure which holds the controller classes
 */
export class Stage {

  /**
   * class name for the stage element
   */
  static STAGE_CLASS_NAME = 'silex-stage-iframe';

  /**
   * input element to get the focus
   */
  static BACKGROUND_CLASS_NAME = 'background';

  /**
   * number of pixels to scroll when the user scrolls out of the site
   */
  static SCROLL_STEPS_DRAG: number = 100;

  /**
   * distance in pixels to the border of the stage, under which we scroll
   * this is when the user drag or resize an element and the mouse goes near the
   * border
   */
  static MARGIN_FOR_SCROLL: number = 20;

  /**
   * number of pixels to scroll at each animation frame to reach
   * silex.view.Stage.SCROLL_STEPS_DRAG the bigger the faster I will scroll to
   * the target
   */
  static SCROLL_DRAG_SPEED: number = 10;

  /**
   * number of pixels to scroll at each animation frame to reach a target
   * this is used when an element is added and it becomes a scorll target
   * the bigger the faster I will scroll to the target
   */
  static DEFAULT_SCROLL_SPEED: number = 100;

  /**
   * the Window of the iframe which contains the website
   */
  contentWindow = null;

  /**
   * the document of the iframe which contains the website
   */
  contentDocument = null;

  /**
   * the element which contains the body of the website
   */
  bodyElement = null;

  /**
   * flag to store the state
   */
  isResizing = false;

  /**
   * flag to store the state
   */
  isDragging = false;

  /**
   * flag to store the state
   */
  isDown = false;
  pendingMM = 0;

  /**
   * the keys we listen to which are not in a menu
   */
  static ACTION_KEYS: Shortcut[] = [
    {key: 'ArrowLeft', modifiers: false, input: false},
    {key: 'ArrowRight', modifiers: false, input: false},
    {key: 'ArrowUp', modifiers: false, input: false},
    {key: 'ArrowDown', modifiers: false, input: false},
    {key: 'Escape', input: false}, {key: 'Enter', input: false},
    // the keys bellow are intercepted to prevent scroll in the html tag
    {key: 'PageUp', input: false}, {key: 'PageDown', input: false},
    {key: ' ', input: false}
  ];

  /**
   * current selection
   */
  selectedElements: HTMLElement[] = null;

  /**
   * invalidation mechanism
   */
  invalidationManagerScroll: InvalidationManager;
  iframeElement: HTMLIFrameElement;
  iAmClicking: any;
  lastClickWasResize: any;
  resizeDirection: any;

  // remember selection
  currentPageName: any;
  lastSelected: any;

  // update the latest position and scroll
  lastPosX: any;
  lastPosY: any;
  lastScrollLeft: any;
  lastScrollTop: any;
  initialRatio: any;
  initialPos: any;
  initialScroll: any;
  scrollTarget: any;

  constructor(
      public element: HTMLElement, public model: Model,
      public controller: Controller) {
    this.invalidationManagerScroll = new InvalidationManager(100);
    this.iframeElement = (document.querySelector('.' + Stage.STAGE_CLASS_NAME) as HTMLIFrameElement);
  }

  /**
   * build the UI
   * called by the app constructor
   */
  buildUi() {
    // Disable horizontal scrolling for Back page on Mac OS, over Silex UI
    events.listen(
        new MouseWheelHandler(document.body),
        MouseWheelHandler.EventType.MOUSEWHEEL, this.onPreventBackSwipe, false,
        this);

    // Disable horizontal scrolling for Back page on Mac OS
    // on the iframe
    events.listen(
        new MouseWheelHandler(this.element),
        MouseWheelHandler.EventType.MOUSEWHEEL, this.onPreventBackSwipe, false,
        this);

    // listen on body too because user can release the mouse over the tool boxes
    events.listen(document.body, 'mouseup', this.onMouseUpOverUi, false, this);

    // listen on body too because user can release
    // on the tool boxes
    events.listen(
        document.body, 'mousemove', this.onMouseMoveOverUi, false, this);

    // listen on the element containing the stage too
    // because in mobile editor, it is visible
    // and should let the user reset selection
    events.listen(
        this.element, 'mousedown', this.onMouseDownOverStageBg, false, this);

    // action keys
    const keyboard = new Keyboard(document);
    Stage.ACTION_KEYS.forEach(({key, input, modifiers}) => {
      keyboard.addShortcut(
          {key: key, modifiers: modifiers, input: input},
          (e: KeyboardEvent) => this.handleKeyDown(e));
    });
  }

  /**
   * Forward mouse release from the tool boxes to the stage
   * Because user can drag something and move the mouse over the tool boxes
   */
  onMouseMoveOverUi(event: MouseEvent) {
    let pos = goog.style.getRelativePosition(event, this.iframeElement) as any;
    this.onMouseMove((event.target as any), pos.x, pos.y, event.shiftKey);
    event.preventDefault();
  }

  /**
   * Forward mouse release from the tool boxes to the stage
   * Because user can drag something and release the mouse over the tool boxes
   */
  onMouseUpOverUi(event: MouseEvent) {
    if (this.bodyElement !== null) {
      // if out of stage, release from drag of the plugin
      // simulate the mouse up on the iframe body
      let pos = goog.style.getRelativePosition(event, this.iframeElement) as any;
      let newEvObj = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: pos.x,
        clientY: pos.y,
      });
      this.iAmClicking = true;
      this.bodyElement.dispatchEvent(newEvObj);
      this.iAmClicking = false;
    }
  }

  /**
   * relay the event to Silex UI out of the iframe where the website is being
   * edited this happens when editing text in place
   */
  handleKeyInIframe(event: KeyboardEvent) {
    const newEvent = new KeyboardEvent('keydown', event);
    document.dispatchEvent(newEvent);
    if (newEvent.defaultPrevented) {
      event.preventDefault();
    }
  }

  /**
   * Reset selection and focus
   * Because user can clickon the stage bg in mobile mode
   * to empty selection
   */
  onMouseDownOverStageBg(event: Event) {
    if (this.bodyElement !== null) {
      this.controller.stageController.selectNone();
    }
  }

  /**
   * Disable horizontal scrolling for back page on Mac OS,
   * Over Silex UI and over the stage
   */
  onPreventBackSwipe(event: MouseWheelEvent) {
    if (event.deltaX < 0 && this.getScrollX() <= 0) {
      event.preventDefault();
    }
  }

  /**
   * remove stage event listeners
   * @param bodyElement the element which contains the body of the site
   */
  removeEvents(bodyElement: Element) {
    events.removeAll(bodyElement);
  }

  /**
   * init stage events
   * handle mouse events for selection,
   * events of the jquery editable plugin,
   * double click to edit,
   * and disable horizontal scrolling for back page on Mac OS
   * @param contentWindow the window instance of the iframe which contains the
   *     site
   */
  initEvents(contentWindow: Window) {
    this.bodyElement = contentWindow.document.body;
    this.contentDocument = contentWindow.document;
    this.contentWindow = contentWindow;

    // detect right click
    events.listen(contentWindow.document, 'contextmenu', function(event) {
      let x = event.clientX;
      let y = event.clientY;
      this.handleRightClick(x, y);
      event.preventDefault();
      return false;
    }, false, this);

    // forward keyboard events from the stage to the UI, useful for the text
    // editor because contentEditable captures keys
    this.contentDocument.addEventListener(
        'keydown', (event) => this.handleKeyInIframe(event));

    // listen on body instead of element because user can release
    // on the tool boxes
    events.listen(contentWindow.document, 'mouseup', function(event) {
      let x = event.clientX;
      let y = event.clientY;
      this.handleMouseUp(event.target, x, y, event.shiftKey);
    }, false, this);

    // move in the iframe
    events.listen(this.bodyElement, 'mousemove', function(event) {
      let x = event.clientX;
      let y = event.clientY;
      this.onMouseMove((event.target as Element), x, y, event.shiftKey);
      event.preventDefault();
    }, false, this);

    // detect mouse down
    events.listen(this.bodyElement, 'mousedown', function(event) {
      // get the first parent node which is editable (silex-editable css class)
      const editableElement =
          goog.dom.getAncestorByClass(
              event.target, Body.EDITABLE_CLASS_NAME) ||
          this.bodyElement;

      // if this is a text box being edited inline, do nothing
      const content = this.model.element.getContentNode(editableElement);
      if (content.getAttribute('contenteditable')) {
        return true;
      }
      this.lastClickWasResize = event.target.classList.contains('ui-resizable-handle');
      this.resizeDirection = this.getResizeDirection(event.target);
      let x = event.clientX;
      let y = event.clientY;
      try {
        // in firefox, this is needed to keep recieving events while dragging
        // outside the iframe in chrome this will throw an error
        editableElement.setCapture();
      } catch (e) {
      }

      // handle the mouse event
      this.handleMouseDown(editableElement, x, y, event.shiftKey);

      // necessary in firefox to prevent default image drag
      event.preventDefault();
    }, false, this);

    // detect double click
    events.listen(this.bodyElement, events.EventType.DBLCLICK, function(event) {
      this.controller.editMenuController.editElement();
    }, false, this);
  }

  /**
   * redraw the properties
   * @param selectedElements the selected elements
   * @param pageNames   the names of the pages
   * @param  currentPageName   the name of the current page
   */
  redraw(
      selectedElements: HTMLElement[], pageNames: string[],
      currentPageName: string) {
    // reset focus out of the text inputs,
    // this also prevents a bug when the page is loaded and the user presses a
    // key, the body is replaced by the keys chars
    Body.resetFocus();
    this.selectedElements = selectedElements;
    this.currentPageName = currentPageName;
  }

  /**
   * handles keyboard keys which are action and not in a menu
   */
  handleKeyDown(event: KeyboardEvent) {
    let tookAction = true;
    switch (event.key) {
      case 'Enter':
        this.controller.editMenuController.editElement();
        break;
      case 'Escape':
        this.controller.stageController.selectNone();
        break;
      default:
        tookAction = false;
    }

    // scroll to the moving element
    if (!tookAction) {
      // mobile mode or selection contains only sections elements
      const isPositioned = this.controller.stageController.getMobileMode() ||
          this.selectedElements &&
              this.selectedElements.reduce(
                  (prev, cur) => prev &&
                      (this.model.element.isSection(cur) ||
                       this.model.element.isSectionContent(cur)),
                  true);
      if (isPositioned || event.altKey) {
        // move the elements in the dom
        let tookAction = true;
        switch (event.key) {
          case 'ArrowLeft':
            this.controller.editMenuController.moveToTop();
            break;
          case 'ArrowRight':
            this.controller.editMenuController.moveToBottom();
            break;
          case 'ArrowUp':
            this.controller.editMenuController.moveUp();
            break;
          case 'ArrowDown':
            this.controller.editMenuController.moveDown();
            break;
          default:
            tookAction = false;
            console.warn('key not found', event.key);
        }

        // scroll to the moving element
        if (tookAction) {
          this.setScrollTarget(this.selectedElements[0]);
        }
      } else {
        // compute the number of pixels to move
        let amount = 10;
        if (event.shiftKey === true) {
          amount = 1;
        }

        // compute the direction
        let offsetX = 0;
        let offsetY = 0;
        switch (event.key) {
          case 'ArrowLeft':
            offsetX = -amount;
            break;
          case 'ArrowRight':
            offsetX = amount;
            break;
          case 'ArrowUp':
            offsetY = -amount;
            break;
          case 'ArrowDown':
            offsetY = amount;
            break;
          default:
            console.warn('key not found', event.key);
        }

        // if there is something to move
        if (offsetX !== 0 || offsetY !== 0) {
          // mark as undoable
          this.controller.stageController.markAsUndoable();

          // apply the offset
          this.moveElements(this.selectedElements, offsetX, offsetY);
        }
      }
    }

    // prevent default behavior for this key
    // especially important to have this for arrow keys and page up/down
    // to prevent stage scroll in body in firefox (opened issue in ff:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=295020 )
    event.preventDefault();
  }

  /**
   * handle mouse up
   * notify the controller to select/deselect the element (multiple or single)
   * reset state:
   * - clicked DOM element
   * - mouse position
   * - scroll position
   * - isDown
   * @param target a DOM element clicked by the user
   * @param x position of the mouse, relatively to the screen
   * @param y position of the mouse, relatively to the screen
   * @param shiftKey state of the shift key
   */
  handleMouseUp(
      target: Element, x: number, y: number, shiftKey: boolean) {
    // if click down was not on the UI, do nothing
    // this can happen when the user selects text in the property tool box and
    // releases outside the tool box
    if (!this.isDown) {
      return;
    }

    // give focus to the stage
    Body.resetFocus();
    this.isDown = false;

    // handle the mouse up
    if (this.isDragging) {
      // reset dropzone marker
      this.markAsDropZone(null);

      // new container
      let dropZone = this.getDropZone(x, y, true) ||
          {'element': this.bodyElement, 'zIndex': 0};

      // move all selected elements to the new container
      this.selectedElements.filter((element) => element !== this.bodyElement)
          .forEach((element) => {
            if (!goog.dom.getAncestorByClass(
                    element.parentNode,
                    SilexElement.SELECTED_CLASS_NAME) &&
                !element.classList.contains(Body.PREVENT_DRAGGABLE_CLASS_NAME)) {
              this.controller.stageController.newContainer(
                  dropZone.element, element);
            }
            this.cleanupElement(element);
          });
    }

    // change z order
    // this.bringSelectionForward();

    // handle selection
    // if not dragging, and on stage, then change selection
    if (this.isDragging || this.isResizing) {
      // update property tool box
      this.propertyChanged();
      this.isDragging = false;
      this.isResizing = false;

      // stop the drag system
      this.model.dragSystem.stopDrag(this.contentWindow);

      // remove dragging style
      const dragged = this.bodyElement.querySelectorAll(
          '.' + Body.DRAGGING_CLASS_NAME);
      for (let idx = 0, el = null; el = dragged[idx]; ++idx) {
        el.classList.remove(Body.DRAGGING_CLASS_NAME);
      }
    } else {
      if (this.iAmClicking !== true) {
        // get the first parent node which is editable (silex-editable css
        // class)
        let editableElement =
            goog.dom.getAncestorByClass(
                target, Body.EDITABLE_CLASS_NAME) ||
            this.bodyElement;

        // single or multiple selection
        if (shiftKey === true) {
          // if the element is selected, then unselect it
          if (this.lastSelected !== editableElement) {
            this.controller.stageController.deselect(editableElement);
          }
        } else {
          // if the user did not move the element,
          // select it in case other elements were selected
          // check if selection has changed
          // ?? do not check if selection has changed,
          // because it causes refresh bugs
          // (apply border to the next selected element)
          let hasChanged = this.selectedElements.length === 1 &&
              this.selectedElements[0] === editableElement;
          if (!hasChanged) {
            // update selection
            this.controller.stageController.select(editableElement);
          }
        }
      }
    }
  }

  /**
   * bring the selection forward
   */
  bringSelectionForward() {
    this.selectedElements.forEach((element) => {
      let container = element.parentNode;
      goog.dom.removeNode(element);
      goog.dom.appendChild(container, element);
    });
  }

  /**
   * Handle mouse move
   * If the mouse button isDown, then
   * - compute the offset of the mouse from the last known position
   * - handle the scroll position changes
   *       (while dragging an element near the border of the stage, it may
   * scroll)
   * - apply the ofset to the dragged or resized element(s)
   * @param target a DOM element clicked by the user
   * @param x position of the mouse, relatively to the screen
   * @param y position of the mouse, relatively to the screen
   * @param shiftKey true if shift is down
   */
  onMouseMove(target: Element, x: number, y: number, shiftKey: boolean) {
    // update states
    if (this.isDown) {
      // update property tool box
      this.propertyChanged();

      // case of a drag directly after mouse down (select + drag)
      if (this.lastSelected === null) {
        let editableElement =
            goog.dom.getAncestorByClass(
                target, Body.EDITABLE_CLASS_NAME) ||
            this.bodyElement;
        this.lastSelected = editableElement;
      }

      // update states
      if (!this.isDragging && !this.isResizing) {
        if (Math.abs(this.initialPos.x - x) + Math.abs(this.initialPos.y - y) <
            5) {
          // do nothing while the user has not dragged more than 5 pixels
          return;
        }

        // notify controller that a change is about to take place
        // marker for undo/redo
        this.controller.stageController.markAsUndoable();

        // store the state for later use
        if (this.lastClickWasResize) {
          this.isResizing = true;
        } else {
          // switch to dragging state
          this.isDragging = true;
          const draggableElements = this.selectedElements.filter(
              (element) => element !== this.bodyElement &&
                  !element.classList.contains(
                      Body.PREVENT_DRAGGABLE_CLASS_NAME));
          draggableElements.forEach((element) => {
            // move to the body so that it is above everything
            // move back to the same x, y position
            // var elementPos = element.getBoundingClientRect();
            let elementPos = goog.style.getPageOffset(element) as any;

            // // apply new position
            this.model.element.setStyle(element, 'left', elementPos.x + 'px');
            this.model.element.setStyle(element, 'top', elementPos.y + 'px');

            // attache to body
            this.bodyElement.appendChild(element);

            // dragging style
            element.classList.add(Body.DRAGGING_CLASS_NAME);
          });
        }

        // start the drag system
        this.model.dragSystem.startDrag(this.contentWindow);
      }

      // do MouseMove is a function which will be called while the user holds
      // the mouse button down even if the mouse do not move this is useful when
      // holding an element near the border of the stage, to keep scrolling
      let pendingMM = ++this.pendingMM;

      const doMM = function(me) {
        if (me.pendingMM === pendingMM && (me.isDragging || me.isResizing)) {
          // update multiple selection according the the dragged element
          me.multipleDragged(x, y, shiftKey);

          // update scroll when mouse is near the border
          me.updateScroll(x, y);

          // update body size with the front-end.js API
          me.contentWindow['silex']['resizeBody']();

          // loop while the mouse has not moved
          requestAnimationFrame(() => doMM(me));
        }
      }
      doMM(this);
    }
  }

  /**
   * add a css class to the drop zone
   * and remove from non dropzones
   * @param opt_element to be marked
   */
  markAsDropZone(opt_element?: Element) {
    let els = Array.from((this.bodyElement.parentNode as Element | null)
      .querySelectorAll(Body.DROP_CANDIDATE_CLASS_NAME));
    els.forEach((el) => el.classList.remove(Body.DROP_CANDIDATE_CLASS_NAME));
    if (opt_element) {
      opt_element.classList.add(Body.DROP_CANDIDATE_CLASS_NAME);
    }
  }

  /**
   * recursively get the top most element which is under the mouse cursor
   * excludes the selected elements
   * takes the zIndex into account, or the order in the DOM
   *
   * @param x    mouse position
   * @param y    mouse position
   * @param opt_preventSelected   will not considere the selected elements and
   *     their content as a potential drop zone,
   *                                          which is useful to prevent drop
   * into the element being dragged default is false
   * @param opt_container   element into which to seach for the dropzone, by
   *     default the body
   * @return  if not null this is the drop zone under the mouse cursor
   *                                              zIndex being the highest
   * z-index encountered while browsing children
   * TODO: use `pointer-events: none;` to get the dropzone with mouse events, or
   * `Document.elementsFromPoint()`
   */
  getDropZone(
      x: number, y: number, opt_preventSelected?: boolean,
      opt_container?: Element): {element: Element, zIndex: number} {
    // default value
    let container = opt_container || this.bodyElement;
    let children = goog.dom.getChildren(container);
    let topMost = null;
    let zTopMost = 0;

    // find the best drop zone
    for (let idx = 0; idx < children.length; idx++) {
      let element = children[idx];
      if (element.classList.contains('container-element') &&
          !element.classList.contains(Body.PREVENT_DROPPABLE_CLASS_NAME) &&
          !(opt_preventSelected === true &&
            element.classList.contains('silex-selected')) &&
          this.getVisibility(element)) {
        let bb = goog.style.getBounds(element) as any;
        let scrollX = this.getScrollX();
        let scrollY = this.getScrollY();
        if (bb.left < x + scrollX && bb.left + bb.width > x + scrollX &&
            bb.top < y + scrollY && bb.top + bb.height > y + scrollY) {
          let candidate = this.getDropZone(x, y, opt_preventSelected, element);

          // if zIndex is 0 then there is no value to css zIndex, considere the
          // DOM order
          if (candidate.element) {
            const zIndex = goog.style.getComputedZIndex(element);
            const zIndexNum = zIndex === 'auto' ? 0 : zIndex as number;
            if (zIndexNum >= zTopMost) {
              topMost = candidate;
              zTopMost = zIndexNum;

              // keep track of the highest z-index in for the given result
              if (zIndex > candidate.zIndex) {
                candidate.zIndex = zIndexNum;
              }
            }
          }
        }
      }
    }
    return topMost || {'element': container, 'zIndex': 0};
  }

  /**
   * compute the page visibility of the element
   * @param element     the element to check
   * @return true if the element is in the current page or not in any page
   */
  getVisibility(element: Element): boolean {
    let parent: Element = (element as Element | null);
    while (parent &&
           (!parent.classList.contains(Page.PAGED_CLASS_NAME) ||
            parent.classList.contains(this.currentPageName)) &&
           !(this.controller.stageController.getMobileMode() &&
             this.model.element.getHideOnMobile(parent))) {
      parent = (parent.parentNode as Element | null);
    }
    return parent === null;
  }

  /**
   * @return the size of the stage
   */
  getStageSize(): {width:number, height:number} {
    // FIXME: use document.documentElement.clientWidth
    return goog.style.getSize(this.element) as any;
  }

  /**
   * Handle the case where mouse is near a border of the stage
   * and an element is being dragged
   * Then scroll accordingly
   * @param x position of the mouse, relatively to the screen
   * @param y position of the mouse, relatively to the screen
   */
  updateScroll(x: number, y: number) {
    this.invalidationManagerScroll.callWhenReady(() => {
      let iframeSize = this.getStageSize();
      let scrollX = this.getScrollX();
      let scrollY = this.getScrollY();
      if (x < Stage.MARGIN_FOR_SCROLL) {
        // todo: same as scrollY, an animation with scrollTo (which should
        // support scrollX anim)
        this.setScrollX(scrollX - Stage.SCROLL_STEPS_DRAG);
      } else {
        if (x > iframeSize.width - Stage.MARGIN_FOR_SCROLL) {
          // todo: same as scrollY, an animation with scrollTo (which should
          // support scrollX anim)
          this.setScrollX(scrollX + Stage.SCROLL_STEPS_DRAG);
        }
      }
      if (y < Stage.MARGIN_FOR_SCROLL) {
        this.scrollTo(
            scrollY - Stage.SCROLL_STEPS_DRAG, Stage.SCROLL_DRAG_SPEED);
      } else {
        if (y > iframeSize.height - Stage.MARGIN_FOR_SCROLL) {
          this.scrollTo(
              scrollY + Stage.SCROLL_STEPS_DRAG, Stage.SCROLL_DRAG_SPEED);
        }
      }
    });
  }

  /**
   * Make selected elements move as the dragged element is moving
   * Compute the offset compared to the last mouse move
   * Take the scroll delta into account (changes when dragging outside the
   * stage)
   * @param x position of the mouse, relatively to the screen
   * @param y position of the mouse, relatively to the screen
   * @param shiftKey state of the shift key
   */
  multipleDragged(x: number, y: number, shiftKey: boolean) {
    let scrollX = this.getScrollX();
    let scrollY = this.getScrollY();

    // follow the mouse (this means that the element dragged by the editable
    // plugin is handled here, which overrides the behavior of the plugin (this
    // is because we take the body scroll into account, and the parent's scroll
    // too)
    let followers = this.selectedElements;

    // drag or resize
    if (this.isDragging || this.resizeDirection === null) {
      // det the drop zone under the cursor
      let dropZone = this.getDropZone(x, y, true) ||
          {'element': this.bodyElement, 'zIndex': 0};

      // handle the css class applyed to the dropzone
      this.markAsDropZone(dropZone.element);

      // handle shift key to move on one axis or preserve ratio
      if (shiftKey === true) {
        if (Math.abs(this.initialPos.x + this.initialScroll.x - (x + scrollX)) <
            Math.abs(
                this.initialPos.y + this.initialScroll.y - (y + scrollY))) {
          x = this.initialPos.x + this.initialScroll.x - scrollX;
        } else {
          y = this.initialPos.y + this.initialScroll.y - scrollY;
        }
      }
      let offsetX = x - this.lastPosX + (scrollX - this.lastScrollLeft);
      let offsetY = y - this.lastPosY + (scrollY - this.lastScrollTop);
      this.model.dragSystem.followElementPosition(
          this.contentWindow, followers, offsetX, offsetY);
    } else {
      if (this.isResizing) {
        // handle shift key to move on one axis or preserve ratio
        if (shiftKey === true &&
            (this.resizeDirection === 'sw' || this.resizeDirection === 'se' ||
             this.resizeDirection === 'nw' || this.resizeDirection === 'ne')) {
          let width = x - this.initialPos.x;
          if (this.resizeDirection === 'ne' || this.resizeDirection === 'sw') {
            width = -width;
          }
          y = this.initialPos.y + width * this.initialRatio;
        }
        let offsetX = x - this.lastPosX + (scrollX - this.lastScrollLeft);
        let offsetY = y - this.lastPosY + (scrollY - this.lastScrollTop);
        this.model.dragSystem.followElementSize(
            this.contentWindow, followers, this.resizeDirection, offsetX,
            offsetY);
      }
    }
    this.lastPosX = x;
    this.lastPosY = y;
    this.lastScrollLeft = scrollX;
    this.lastScrollTop = scrollY;
  }

  /**
   * handle mouse down
   * notify the controller to select the element (multiple or single)
   * store state:
   * - clicked DOM element
   * - mouse position
   * - scroll position
   * - isDown
   * @param element Silex element currently selected (text, image...)
   * @param x position of the mouse, relatively to the screen
   * @param y position of the mouse, relatively to the screen
   * @param shiftKey state of the shift key
   */
  handleMouseDown(
      element: HTMLElement, x: number, y: number, shiftKey: boolean) {
    this.lastSelected = null;

    // if the element was not already selected
    if (!element.classList.contains(SilexElement.SELECTED_CLASS_NAME)) {
      this.lastSelected = element;

      // notify the controller
      if (shiftKey) {
        this.controller.stageController.selectMultiple(element);
      } else {
        this.controller.stageController.select(element);
      }
    }

    // keep track of the last mouse position and body scroll
    this.lastPosX = x;
    this.lastPosY = y;
    this.lastScrollLeft = this.getScrollX();
    this.lastScrollTop = this.getScrollY();
    let initialSize = goog.style.getSize(element) as any;
    this.initialRatio = initialSize.height / initialSize.width;
    this.initialPos = {x: x, y: y};
    this.initialScroll = {x: this.getScrollX(), y: this.getScrollY()};

    // update state
    this.isDown = true;
  }

  /**
   * check if the target is a UI handle to resize or move -draggable jquery
   * plugin
   * @param target a DOM element clicked by the user,
   *                    which may be a handle to resize or move
   */
  getResizeDirection(target: Element): string {
    if (target.classList.contains('ui-resizable-s')) {
      return 's';
    } else {
      if (target.classList.contains('ui-resizable-n')) {
        return 'n';
      } else {
        if (target.classList.contains('ui-resizable-e')) {
          return 'e';
        } else {
          if (target.classList.contains('ui-resizable-w')) {
            return 'w';
          } else {
            if (target.classList.contains('ui-resizable-se')) {
              return 'se';
            } else {
              if (target.classList.contains('ui-resizable-sw')) {
                return 'sw';
              } else {
                if (target.classList.contains('ui-resizable-ne')) {
                  return 'ne';
                } else {
                  if (target.classList.contains('ui-resizable-nw')) {
                    return 'nw';
                  }
                }
              }
            }
          }
        }
      }
    }

    // Target is not a resize handle
    return null;
  }

  /**
   * get the scroll property, working around cross browser issues
   * @param value to be set
   */
  setScrollX(value: number) {
    let dh = new goog.dom.DomHelper(this.contentDocument);
    dh.getDocumentScrollElement().scrollLeft = value;
  }

  /**
   * get the scroll property, working around cross browser issues
   * @param value to be set
   */
  setScrollY(value: number) {
    let dh = new goog.dom.DomHelper(this.contentDocument);
    dh.getDocumentScrollElement().scrollTop = value;
  }

  /**
   * get the scroll property, working around cross browser issues
   * FIXME: no need for getScrollX and getScrollY, should be getScroll which
   * returns coords
   * @return the value
   */
  getScrollX(): number {
    let dh = new goog.dom.DomHelper(this.contentDocument);
    return (dh.getDocumentScroll() as any).x;
  }

  /**
   * get the scroll property, working around cross browser issues
   * FIXME: no need for getScrollX and getScrollY, should be getScroll which
   * returns coords
   * @return the value
   */
  getScrollY(): number {
    let dh = new goog.dom.DomHelper(this.contentDocument);
    return (dh.getDocumentScroll() as any).y;
  }

  /**
   * get the scroll property, working around cross browser issues
   * @return the value
   */
  getScrollMaxX(): number {
    let dh = new goog.dom.DomHelper(this.contentDocument);
    return (goog.style.getSize(dh.getDocumentScrollElement()) as any).width;
  }

  /**
   * get the scroll property, working around cross browser issues
   * @return the value
   */
  getScrollMaxY(): number {
    let dh = new goog.dom.DomHelper(this.contentDocument);
    return (goog.style.getSize(dh.getDocumentScrollElement()) as any).height;
  }

  /**
   * @param  element in the DOM to which I am scrolling
   */
  setScrollTarget(element: Element) {
    if (element !== this.bodyElement) {
      // start scrolling
      // not right away because the element may not be attached to the dom yet
      // (case of add element)
      requestAnimationFrame(() => {
        const scrollTop = (goog.style.getBounds(element) as any).top;
        const iframeSize = this.getStageSize();
        const scrollCentered = scrollTop - Math.round(iframeSize.height / 2);
        this.scrollTo(scrollCentered);
      });
    }
  }

  /**
   * @param  scrollTop to which I am scrolling
   * @param  scrollSpeed number of pixels per frame to go there
   */
  scrollTo(scrollTop: number, scrollSpeed?: number) {
    const previousTarget = this.scrollTarget;
    this.scrollTarget = scrollTop;
    if (previousTarget == null) {
      this.startScrolling(scrollSpeed);
    }
  }

  /**
   * scroll until the scroll target is reached
   * @param  scrollSpeed number of pixels per frame to go there
   * TODO: should support scrollX anim too
   */
  startScrolling(scrollSpeed?: number) {
    if (this.scrollTarget != null) {
      const scrollSpeedWithDefault = scrollSpeed || Stage.DEFAULT_SCROLL_SPEED;

      // det the next scroll step
      const prevScroll = this.getScrollY();

      // const nextStep = Math.round((bb.top - prevScroll) /
      // Stage.SCROLL_STEPS_ANIM);
      let nextStep;
      if (Math.abs(this.scrollTarget - prevScroll) < scrollSpeedWithDefault) {
        nextStep = this.scrollTarget;
      } else {
        if (this.scrollTarget > prevScroll) {
          nextStep = prevScroll + scrollSpeedWithDefault;
        } else {
          nextStep = prevScroll - scrollSpeedWithDefault;
        }
      }
      this.setScrollY(nextStep);

      // check if the scrolling target is reached
      const newScroll = this.getScrollY();
      if (newScroll === prevScroll || newScroll === this.scrollTarget) {
        this.scrollTarget = null;
      } else {
        requestAnimationFrame(
            () => this.startScrolling(scrollSpeedWithDefault));
      }
    }
  }

  /**
   * notify the controller that the properties of the selection have changed
   */
  propertyChanged() {
    // update property tool box
    this.controller.stageController.refreshView();
  }

  /**
   * reset 1 element properties since they are stored in the CSS by the model
   */
  cleanupElement(element) {}

  /**
   * Move the selected elements in the DOM
   * This is a convenience method which does as if the elements where dragged
   */
  moveElements(elements, offsetX, offsetY) {
    // just like when mouse moves
    this.model.dragSystem.followElementPosition(
        this.contentWindow, elements, offsetX, offsetY);

    // reset elements properties since they are stored in the CSS by the model
    // elements.forEach((element) => {
    //   this.controller.stageController.styleChanged('top', element.style.top,
    //   [element], false); this.controller.stageController.styleChanged('left',
    //   element.style.left, [element], false); this.cleanupElement(element);
    // });
    // notify the controller
    this.propertyChanged();
  }

  /**
   * Handle the right click and display a small text to inform users
   * @param x position of the mouse, relatively to the screen
   * @param y position of the mouse, relatively to the screen
   */
  handleRightClick(x: number, y: number) {
    const myContextHeight = document.querySelector('.' + ContextMenu.CLASS_NAME).clientHeight;
    const myMenuWidth = document.querySelector('.menu-container').clientWidth;
    const rightClickDiv = document.querySelector('.rightClick') as HTMLElement;
    rightClickDiv.style.display = 'block';
    rightClickDiv.style.left = x + myMenuWidth + 'px';
    rightClickDiv.style.top = y + myContextHeight + 'px';
    setTimeout(() => {
      const el = document.querySelector('.rightClick') as HTMLElement;
      el.style.display = 'none';
    }, 3000);
  }
}
