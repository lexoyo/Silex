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
 * @fileoverview A controller listens to a view element,
 *      and call the main {silex.controller.Controller} controller's methods
 *
 */
import { DomDirection, SilexElement } from '../model/element';
import { ClipboardItem, Model, View } from '../types';
import { InvalidationManager } from '../utils/invalidation-manager';
import { SilexNotification } from '../utils/notification';
import { Style } from '../utils/style';
import { FileExplorer } from '../view/dialog/file-explorer';
import { ControllerBase } from './controller-base';
/**
 * @param view  view class which holds the other views
 */
export class EditMenuController extends ControllerBase {
  /**
   * invalidation mechanism
   */
  undoredoInvalidationManager: InvalidationManager;

  constructor(model: Model, view: View) {
    // call super
super(model, view);
    this.undoredoInvalidationManager = new InvalidationManager(1000);
  }

  /**
   * undo the last action
   */
  undo() {
    this.model.body.setSelection([]);
    this.undoredoInvalidationManager.callWhenReady(() => {
      if (ControllerBase.getStatePending === 0 &&
          ControllerBase.undoHistory.length > 0) {
        const state = this.getState();
        ControllerBase.redoHistory.push(state);
        const prevState = ControllerBase.undoHistory.pop();
        this.restoreState(prevState);
      } else {
        requestAnimationFrame(() => this.undo());
      }
    });
  }

  /**
   * redo the last action
   */
  redo() {
    this.model.body.setSelection([]);
    this.undoredoInvalidationManager.callWhenReady(() => {
      if (ControllerBase.redoHistory.length > 0) {
        const state = this.getState();
        ControllerBase.undoHistory.push(state);
        const prevState = ControllerBase.redoHistory.pop();
        this.restoreState(prevState);
      }
    });
  }

  /**
   * copy the selection for later paste
   */
  copySelection() {
    this.tracker.trackAction('controller-events', 'info', 'copy', 0);
    const body = this.model.body.getBodyElement();

    // select the sections instead of their container content
    const elements =
        // clone the elements
        this.model.body.getSelection()
            .map((element) => {
              if (this.model.element.isSectionContent(element)) {
                return element.parentNode;
              } else {
                return element;
              }
            })
            .filter((element) => {
              // not the body
              return body !== element &&
                  // not an element which has a selected parent
                  // FIXME: closest is not yet defined on Element in google
                  // closure, remove the array access ['closest'] when it is
                  element.parentElement['closest'](
                      '.' + SilexElement.SELECTED_CLASS_NAME) == null;
            })
            .map((element) => {
              return element.cloneNode(true) as HTMLElement;
            });
    if (elements.length > 0) {
      // reset clipboard
      ControllerBase.clipboard = [];

      // add each selected element to the clipboard
      elements.forEach((element) => {
        // copy the element and its children
        ControllerBase.clipboard.push(this.recursiveCopy(element));
      });

      // update the views
      this.model.body.setSelection(this.model.body.getSelection());
    }
  }

  /**
   * make a recursive copy of an element styles/mobileStyle/componentData
   * the element and its children are already clones of the selection
   * this is needed to "freez" elements properties
   * return {silex.types.ClipboardItem}
   */
  recursiveCopy(element: Element) {
    // duplicate the node
    let res = {
      element: element,
      style: this.model.property.getStyle(element, false),
      mobileStyle: this.model.property.getStyle(element, true),
      componentData: this.model.property.getElementComponentData(element),
      children: []
    };

    // case of a container, handle its children
    if (this.model.element.getType(res.element) ===
        SilexElement.TYPE_CONTAINER) {
      const len = res.element.childNodes.length;
      for (let idx = 0; idx < len; idx++) {
        const el = (res.element.childNodes[idx] as Element);
        if (el.nodeType === 1 && this.model.element.getType(el) !== null) {
          res.children.push(this.recursiveCopy(el));
        }
      }
    }
    return res;
  }

  /**
   * paste the previously copied element
   */
  pasteSelection() {
    this.tracker.trackAction('controller-events', 'info', 'paste', 0);

    // default is selected element
    if (ControllerBase.clipboard && ControllerBase.clipboard.length > 0) {
      // undo checkpoint
      this.undoCheckPoint();

      // take the scroll into account (drop at (100, 100) from top left corner
      // of the window, not the stage)
      const doc = this.model.file.getContentDocument();
      let offset = 0;

      // add to the container
      const selection = ControllerBase.clipboard.map((clipboardItem) => {
        let element = this.recursivePaste(clipboardItem) as HTMLElement;

        // reset editable option
        this.doAddElement(element);

        // add to stage and set the "silex-just-added" css class
        this.model.element.addElementDefaultPosition(element, offset);
        offset += 20;

        // this is what will be added to selection
        return element;
      });

      // select the new elements
      this.model.body.setSelection(selection);

      // copy again so that we can paste several times (elements will be
      // duplicated again)
      this.copySelection();
    }
  }

  /**
   * add the stored properties of the element and its children to the dom
   * also reset the ID of the element and its children
   * the elements have already been added to stage
   */
  recursivePaste(clipboardItem: ClipboardItem): Element {
    let element = clipboardItem.element;

    // reset the ID
    this.model.property.initSilexId(element);

    // add its children
    clipboardItem.children.forEach((childItem) => {
      let childElement = this.recursivePaste(childItem);
    });

    // init component props
    if (clipboardItem.componentData) {
      this.model.property.setElementComponentData(
          element, clipboardItem.componentData);

      // re-render components (makes inner ID change)
      this.model.component.render(element);
    }

    // keep the original style
    this.model.property.setStyle(element, clipboardItem.style, false);
    this.model.property.setStyle(element, clipboardItem.mobileStyle, true);
    return element;
  }

  /**
   * remove selected elements from the stage
   */
  removeSelectedElements() {
    let elements = this.model.body.getSelection();

    // confirm and delete
    SilexNotification.confirm(
        'I am about to <strong>delete the selected element(s)</strong>, are you sure?',
        accept => {
          if (accept) {
            // undo checkpoint
            this.undoCheckPoint();

            // do remove selected elements
            elements.forEach(element => {
              this.model.element.removeElement(element);
            });
          }
        }, 'delete', 'cancel');
  }

  /**
   * edit an {silex.types.Element} element
   * take its type into account and open the corresponding editor
   */
  editElement(opt_element?: HTMLElement) {
    // undo checkpoint
    this.undoCheckPoint();

    // default is selected element
    let element = opt_element || this.model.body.getSelection()[0];

    // open the params tab for the components
    // or the editor for the elements
    if (this.model.component.isComponent(element)) {
      this.view.propertyTool.openParamsTab();
    } else {
      switch (this.model.element.getType(element)) {
        case SilexElement.TYPE_TEXT:
          let bgColor = Style.computeBgColor(
              element, this.model.file.getContentWindow());
          if (!bgColor) {
            // case where all parents are transparent
            bgColor = [255, 255, 255, 255];
          }

          // open the text editor
          this.view.textFormatBar.startEditing(this.view.fileExplorer);

          // this.view.propertyTool.openStyleTab();
          break;
        case SilexElement.TYPE_HTML:
          this.view.htmlEditor.open();
          this.view.htmlEditor.setSelection([element]);
          break;
        case SilexElement.TYPE_IMAGE:
          this.view.fileExplorer.openFile(FileExplorer.IMAGE_EXTENSIONS)
              .then((blob) => {
                if (blob) {
                  // load the image
                  this.model.element.setImageUrl(element, blob.url);
                }
              })
              .catch((error) => {
                SilexNotification.notifyError(
                    'Error: I did not manage to load the image. \n' +
                    (error.message || ''));
              });
          break;
      }
    }
  }

  /**
   * get the index of the element in the DOM
   */
  indexOfElement(element: Element): number {
    let len = element.parentNode.childNodes.length;
    for (let idx = 0; idx < len; idx++) {
      if (element.parentNode.childNodes[idx] === element) {
        return idx;
      }
    }
    return -1;
  }

  /**
   * Move the selected elements in the DOM
   * This will move its over or under other elements if the z-index CSS
   * properties are not set
   */
  move(direction: DomDirection) {
    // undo checkpoint
    this.undoCheckPoint();

    // get the selected elements
    let elements = this.model.body.getSelection();

    // sort the array
    elements.sort((a, b) => {
      return this.indexOfElement(a) - this.indexOfElement(b);
    });

    // move up
    elements.forEach((element) => {
      let stylesObj =
          this.model.file.getContentWindow().getComputedStyle(element);
      let reverse = stylesObj['position'] !== 'absolute';
      if (reverse) {
        switch (direction) {
          case DomDirection.UP:
            direction = DomDirection.DOWN;
            break;
          case DomDirection.DOWN:
            direction = DomDirection.UP;
            break;
          case DomDirection.TOP:
            direction = DomDirection.BOTTOM;
            break;
          case DomDirection.BOTTOM:
            direction = DomDirection.TOP;
            break;
        }
      }
      this.model.element.move(element, direction);
    });
  }

  /**
   * Move the selected elements in the DOM
   * This will move its over or under other elements if the z-index CSS
   * properties are not set
   */
  moveUp() {
    this.move(DomDirection.UP);
  }

  /**
   * Move the selected elements in the DOM
   * This will move its over or under other elements if the z-index CSS
   * properties are not set
   */
  moveDown() {
    this.move(DomDirection.DOWN);
  }

  /**
   * Move the selected elements in the DOM
   * This will move its over or under other elements if the z-index CSS
   * properties are not set
   */
  moveToTop() {
    this.move(DomDirection.TOP);
  }

  /**
   * Move the selected elements in the DOM
   * This will move its over or under other elements if the z-index CSS
   * properties are not set
   */
  moveToBottom() {
    this.move(DomDirection.BOTTOM);
  }
}
