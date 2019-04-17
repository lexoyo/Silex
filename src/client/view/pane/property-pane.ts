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
 * @fileoverview Property pane, displayed in the property tool box
 *
 */

import { goog } from '../../Goog';
import { SilexElement } from '../../model/element';
import { Controller, Model } from '../../types';
import { PaneBase } from './pane-base';
import { Constants } from '../../../Constants';

/**
 * on of Silex Editors class
 * let user edit style of components
 * @param element   container to render the UI
 * @param model  model class which holds
 *                                  the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 *                                  the controller instances
 */
export class PropertyPane extends PaneBase {
  /**
   * store the last selection
   */
  selectedElements: HTMLElement[] = null;

  // position and size
  iAmRedrawing: boolean;

  /**
   * callback to call to let the user edit the image url
   */
  // selectImage = null;

  /**
   * UI for position and size
   */
  leftInput: HTMLInputElement;

  /**
   * UI for position and size
   */
  topInput: HTMLInputElement;

  /**
   * UI for position and size
   */
  widthInput: HTMLInputElement;

  /**
   * UI for position and size
   */
  heightInput: HTMLInputElement;

  /**
   * UI for alt and title
   * only used for images
   */
  altInput: HTMLInputElement;

  /**
   * UI for alt and title
   */
  titleInput: HTMLInputElement;

  constructor(element: HTMLElement, model: Model, controller: Controller) {
    // call super
    super(element, model, controller);

    // init the component
    this.buildUi();
  }

  /**
   * build the UI
   */
  buildUi() {
    this.leftInput = document.querySelector('.left-input');
    this.leftInput.setAttribute('data-style-name', 'left');
    this.leftInput.addEventListener('input', e => this.onPositionChanged(e), false);
    this.widthInput = document.querySelector('.width-input');
    this.widthInput.setAttribute('data-style-name', 'width');
    this.widthInput.addEventListener('input', e => this.onPositionChanged(e), false);
    this.topInput = document.querySelector('.top-input');
    this.topInput.setAttribute('data-style-name', 'top');
    this.topInput.addEventListener('input', e => this.onPositionChanged(e), false);
    this.heightInput = document.querySelector('.height-input');
    this.heightInput.setAttribute('data-style-name', 'minHeight');
    this.heightInput.addEventListener('input', e => this.onPositionChanged(e), false);
    this.altInput = document.querySelector('.alt-input');
    this.altInput.addEventListener('input', e => this.onAltChanged(e), false);
    this.titleInput = document.querySelector('.title-input');
    this.titleInput.addEventListener('input', e => this.onTitleChanged(e), false);
  }

  /**
   * position or size changed
   * callback for number inputs
   */
  onPositionChanged(e) {
    // get the selected element
    let input: HTMLInputElement = e.target;

    // the name of the property to change
    let name: string = input.getAttribute('data-style-name');

    // do nothing if the value is not a number (numeric stepers's value set to
    // '')
    if (input.value !== '') {
      // get the value
      let value = parseFloat(input.value);

      // handle minimum size of elements on stage
      switch (name) {
        case 'width':
          value = Math.max(value, SilexElement.MIN_WIDTH);
        case 'minHeight':
          value = Math.max(value, SilexElement.MIN_HEIGHT);
      }

      // get the old value
      let oldValue = parseFloat(input.getAttribute('data-prev-value') || '0');

      // keep track of the new value for next time
      input.setAttribute('data-prev-value', value.toString());

      // compute the offset
      let offset = value - oldValue;

      // apply the change to all elements
      this.selectedElements.forEach((element) => {
        if (oldValue != NaN) {
          // compute the new value relatively to the old value,
          // in order to match the group movement
          let elementStyle = this.model.element.getStyle(element, name);
          let styleValue = 0;
          if (elementStyle && elementStyle !== '') {
            styleValue = parseFloat(elementStyle);
          }
          let newValue = styleValue + offset;

          // apply the change to the current element
          this.styleChanged(name, newValue + 'px', [element]);
        } else {
          this.styleChanged(name, value + 'px');
        }
      });
    }
  }

  /**
   * alt changed
   * callback for inputs
   */
  onAltChanged(e) {
    // get the selected element
    let input: HTMLInputElement = e.target;

    // apply the change to all elements
    if (input.value !== '') {
      this.propertyChanged('alt', input.value, null, true);
    } else {
      this.propertyChanged('alt', null, null, true);
    }
  }

  /**
   * title changed
   * callback for inputs
   */
  onTitleChanged(e) {
    // get the selected element
    let input: HTMLInputElement = e.target;

    // apply the change to all elements
    if (input.value !== '') {
      this.propertyChanged('title', input.value);
    } else {
      this.propertyChanged('title');
    }
  }

  /**
   * redraw the properties
   * @param selectedElements the elements currently selected
   * @param pageNames   the names of the pages which appear in the current HTML
   *     file
   * @param  currentPageName   the name of the current page
   */
  redraw(
      selectedElements: HTMLElement[], pageNames: string[],
      currentPageName: string) {
    if (this.iAmSettingValue) {
      return;
    }
    this.iAmRedrawing = true;

    // call super
    super.redraw( selectedElements, pageNames, currentPageName);

    // not available for stage element
    let elementsNoStage = [];
    selectedElements.forEach((element) => {
      if (this.model.body.getBodyElement() !== element) {
        elementsNoStage.push(element);
      }
    });
    if (elementsNoStage.length > 0) {
      // not stage element only
      this.leftInput.removeAttribute('disabled');
      this.topInput.removeAttribute('disabled');
      this.widthInput.removeAttribute('disabled');
      this.heightInput.removeAttribute('disabled');
      this.altInput.removeAttribute('disabled');
      this.titleInput.removeAttribute('disabled');
      this.selectedElements = selectedElements;
      let bb = this.model.property.getBoundingBox(selectedElements);

      // display position and size
      this.topInput.value = bb.top.toString() || '0';
      this.leftInput.value = bb.left.toString() || '0';
      this.widthInput.value = bb.width.toString() || '0';
      this.heightInput.value = bb.height.toString() || '0';

      // special case of the background / main container only selected element
      if (selectedElements.length === 1) {
        if (selectedElements[0].classList.contains('background') ||
            this.model.element.isSection(selectedElements[0]) ||
            this.model.element.isSectionContent(selectedElements[0]) ||
            this.isMobileMode()) {
          this.topInput.value = '';
          this.leftInput.value = '';
        }
        if (this.model.element.isSection(selectedElements[0])) {
          this.widthInput.value = '';
        }
      }

      // alt, only for images
      let elementsType =
          this.getCommonProperty(selectedElements, function(element) {
            return element.getAttribute(Constants.TYPE_ATTR);
          });
      if (elementsType === Constants.TYPE_IMAGE) {
        this.altInput.removeAttribute('disabled');
        let alt = this.getCommonProperty(selectedElements, function(element) {
          let content = element.querySelector(
              Constants.ELEMENT_CONTENT_CLASS_NAME);
          if (content) {
            return content.getAttribute('alt');
          }
          return null;
        });
        if (alt) {
          this.altInput.value = alt;
        } else {
          this.altInput.value = '';
        }
      } else {
        this.altInput.value = '';
        this.altInput.setAttribute('disabled', 'true');
      }

      // title
      let title = this.getCommonProperty(selectedElements, function(element) {
        return element.getAttribute('title');
      });
      if (title) {
        this.titleInput.value = title;
      } else {
        this.titleInput.value = '';
      }
    } else {
      // stage element only
      this.leftInput.setAttribute('disabled', 'true');
      this.leftInput.value = '';
      this.topInput.setAttribute('disabled', 'true');
      this.topInput.value = '';
      this.widthInput.setAttribute('disabled', 'true');
      this.widthInput.value = '';
      this.heightInput.setAttribute('disabled', 'true');
      this.heightInput.value = '';
      this.altInput.setAttribute('disabled', 'true');
      this.altInput.value = '';
      this.titleInput.setAttribute('disabled', 'true');
      this.titleInput.value = '';
    }

    // keep track of old position and size
    this.topInput.setAttribute('data-prev-value', this.topInput.value);
    this.leftInput.setAttribute('data-prev-value', this.leftInput.value);
    this.widthInput.setAttribute('data-prev-value', this.widthInput.value);
    this.heightInput.setAttribute('data-prev-value', this.heightInput.value);
    this.iAmRedrawing = false;
  }

  /**
   * helper for other views,
   * because views (view.workspace.get/setMobileEditor) is not accessible from
   * other views
   * FIXME: find another way to expose isMobileEditor to views
   */
  isMobileMode() {
    return document.body.classList.contains('mobile-mode');
  }
}
