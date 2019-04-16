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
 * @fileoverview Property pane, displayed in the property tool box.
 * Controls the borders params
 *
 */

import { goog } from '../../Goog';
import { Controller, Model } from '../../types';
import { ColorPicker } from '../ColorPicker';
import { PaneBase } from './pane-base';

/**
 * on of Silex Editors class
 * let user edit style of components
 * @param element   container to render the UI
 * @param model  model class which holds
 *                                  the model instances - views use it for read
 * operation only
 * @param controller structure which holds
 *                                  the controller instances
 */
export class BorderPane extends PaneBase {
  /**
   * input element
   */
  borderWidthInput: HTMLInputElement;

  /**
   * input element
   */
  borderStyleComboBox: HTMLSelectElement;

  /**
   * input element
   */
  borderRadiusInput: HTMLInputElement;

  /**
   * color picker for border color
   */
  colorPicker: ColorPicker;

  /**
   * input element
   */
  borderPlacementCheckBoxes: HTMLInputElement[] = null;

  /**
   * input element
   */
  cornerPlacementCheckBoxes: HTMLInputElement[] = null;

  iAmRedrawing: boolean;

  constructor(element: HTMLElement, model: Model, controller: Controller) {
    // call super
    super(element, model, controller);

    // init the component
    this.buildUi();
    this.initEvents();
  }

  /**
   * build the UI
   */
  buildUi() {
    this.borderWidthInput = this.element.querySelector('.border-width-input');
    this.borderStyleComboBox = this.element.querySelector('.border-type-combo-box');
    this.colorPicker = new ColorPicker(
        this.element.querySelector('.color-edit-container'),
        (value) => this.onBorderColorChanged());
    this.borderPlacementCheckBoxes =
        [
          '.border-placement-container .top',
          '.border-placement-container .right',
          '.border-placement-container .bottom',
          '.border-placement-container .left'
        ]
            .map(
                (selector) => this.initCheckBox(
                    selector, () => this.onBorderWidthChanged()));
    this.borderRadiusInput = this.element.querySelector('.corner-radius-input');
    this.cornerPlacementCheckBoxes =
        [
          '.border-radius-container .top-left',
          '.border-radius-container .top-right',
          '.border-radius-container .bottom-right',
          '.border-radius-container .bottom-left'
        ]
            .map(
                (selector) => this.initCheckBox(
                    selector, () => this.onBorderCornerChanged()));
  }

  /**
   * attach events
   * called by the constructor
   */
  initEvents() {
    this.borderWidthInput.addEventListener('input', () => this.onBorderWidthChanged(), false);
    this.borderStyleComboBox.addEventListener('change', () => this.onBorderStyleChanged(), false);
    this.borderRadiusInput.addEventListener('input', () => this.onBorderCornerChanged(), false);
  }

  /**
   * create and return checkboxes
   * query the HTML nodes
   * attach change event
   */
  initCheckBox(cssSelector, onChanged) {
    let checkbox = this.element.querySelector(cssSelector);
    checkbox.addEventListener('change', () => onChanged(), false);
    return checkbox;
  }

  /**
   * redraw the properties
   */
  redraw(selectedElements, pageNames, currentPageName) {
    if (this.iAmSettingValue) {
      return;
    }
    this.iAmRedrawing = true;

    // call super
    super.redraw(selectedElements, pageNames, currentPageName);

    // border width, this builds a string like "0px 1px 2px 3px"
    // FIXME: should not build a string which is then split in redrawBorderWidth
    let borderWidth = this.getCommonProperty(selectedElements, (element) => {
      let w = this.model.element.getStyle(element, 'borderWidth');
      if (w && w != '') {
        return w;
      } else {
        return null;
      }
    });

    // display width or reset borders if width is null
    if (borderWidth) {
      this.redrawBorderWidth(borderWidth);
      this.redrawBorderColor(selectedElements);
    } else {
      this.resetBorder();
    }

    // border style
    let borderStyle = this.getCommonProperty(selectedElements, (element) => {
      let style;
      style = this.model.element.getStyle(element, 'borderStyle');
      if (style) {
        return style;
      }
      return null;
    });
    if (borderStyle) {
      this.borderStyleComboBox.value = borderStyle;
    } else {
      this.borderStyleComboBox.selectedIndex = 0;
    }

    // border radius
    let borderRadiusStr = this.getCommonProperty(
        selectedElements,
        (element) => this.model.element.getStyle(element, 'borderRadius'));
    if (borderRadiusStr) {
      this.redrawBorderRadius(borderRadiusStr);
    } else {
      this.resetBorderRadius();
    }
    this.iAmRedrawing = false;
  }

  /**
   * redraw border color UI
   */
  redrawBorderColor(selectedElements) {
    if (selectedElements.length > 0) {
      this.colorPicker.setDisabled(false);
      let color = this.getCommonProperty(selectedElements, (element) => {
        let w = this.model.element.getStyle(element, 'borderColor');
        return w || 'rgba(0,0,0,1)';
      });

      // indeterminate state
      this.colorPicker.setIndeterminate(color == null);

      // display color
      if (color != null) {
        this.colorPicker.setColor(color);
      }
    } else {
      this.colorPicker.setDisabled(true);
    }
  }

  /**
   * redraw border radius UI
   */
  redrawBorderRadius(borderWidth) {
    let values = borderWidth.split(' ');

    // get corner radius value, get the first non-zero value
    let val = values[0];
    if (goog.Is.isDef(values[1]) && val === '0' || val === '0px') {
      val = values[1];
    }
    if (goog.Is.isDef(values[2]) && val === '0' || val === '0px') {
      val = values[2];
    }
    if (goog.Is.isDef(values[3]) && val === '0' || val === '0px') {
      val = values[3];
    }

    // remove unit when needed
    if (goog.Is.isDef(val) && val !== '0' && val !== '0px') {
      this.borderRadiusInput.value = val.substr(0, val.indexOf('px'));

      // corner placement
      let idx;
      let len = this.cornerPlacementCheckBoxes.length;
      for (idx = 0; idx < len; idx++) {
        let checkBox = this.cornerPlacementCheckBoxes[idx];
        if (values[idx] !== '0' && values[idx] !== '0px') {
          checkBox.checked = true;
        } else {
          checkBox.checked = false;
        }
      }
    } else {
      this.resetBorderRadius();
    }
  }

  /**
   * redraw border width UI
   */
  redrawBorderWidth(borderWidth) {
    // top, right, bottom, left
    let values = borderWidth.split(' ');

    // get the first non-zero value
    let val = values[0];
    if (goog.Is.isDef(values[1]) && val === '0' || val === '0px') {
      val = values[1];
    }
    if (goog.Is.isDef(values[2]) && val === '0' || val === '0px') {
      val = values[2];
    }
    if (goog.Is.isDef(values[3]) && val === '0' || val === '0px') {
      val = values[3];
    }

    // if there is a non-zero value
    if (val !== '0' && val !== '0px') {
      this.borderWidthInput.value = val.substr(0, val.indexOf('px'));

      // border placement
      let len = this.borderPlacementCheckBoxes.length;
      for (let idx = 0; idx < len; idx++) {
        let checkBox = this.borderPlacementCheckBoxes[idx];
        if (values.length > idx && values[idx] !== '0' &&
            values[idx] !== '0px') {
          checkBox.checked = true;
        } else {
          checkBox.checked = false;
        }
      }
    } else {
      this.resetBorder();
    }
  }

  /**
   * reset UI
   */
  resetBorderRadius() {
    this.borderRadiusInput.value = '';

    // corner placement
    let idx;
    let len = this.cornerPlacementCheckBoxes.length;
    for (idx = 0; idx < len; idx++) {
      let checkBox = this.cornerPlacementCheckBoxes[idx];
      checkBox.checked = true;
    }
  }

  /**
   * reset UI
   */
  resetBorder() {
    this.borderWidthInput.value = '';

    // border placement
    let idx;
    let len = this.borderPlacementCheckBoxes.length;
    for (idx = 0; idx < len; idx++) {
      let checkBox = this.borderPlacementCheckBoxes[idx];
      checkBox.checked = true;
    }

    // border color
    this.colorPicker.setColor('');
    this.colorPicker.setDisabled(true);
  }

  /**
   * property changed
   * callback for number inputs
   */
  onBorderWidthChanged() {
    if (this.borderWidthInput.value && this.borderWidthInput.value !== '' &&
        this.borderWidthInput.value !== '0') {
      // border color
      this.colorPicker.setDisabled(false);
      if (this.colorPicker.getColor() == null ||
          this.colorPicker.getColor() === '') {
        this.colorPicker.setColor('rgba(0,0,0,1)');
      }

      // border placement
      let borderWidthStr = '';
      let idx;
      let len = this.borderPlacementCheckBoxes.length;
      for (idx = 0; idx < len; idx++) {
        let checkBox = this.borderPlacementCheckBoxes[idx];
        if (checkBox.checked) {
          borderWidthStr += this.borderWidthInput.value + 'px ';
        } else {
          borderWidthStr += '0 ';
        }
      }

      // reset indeterminate state (because all selected elements will be
      // changed the same value)
      this.colorPicker.setIndeterminate(false);

      // border width
      this.styleChanged('borderWidth', borderWidthStr);

      // border style
      this.onBorderStyleChanged();
    } else {
      this.styleChanged('borderWidth', '');
      this.styleChanged('borderStyle', '');
      this.colorPicker.setDisabled(true);
    }
  }

  /**
   * property changed
   * callback for number inputs
   * border style
   */
  onBorderStyleChanged() {
    // prevent changing border when redraw is setting the value
    if (this.iAmRedrawing) {
      return;
    }
    this.styleChanged('borderStyle', this.borderStyleComboBox.value);
  }

  /**
   * property changed
   * callback for number inputs
   */
  onBorderColorChanged() {
    this.styleChanged('borderColor', this.colorPicker.getColor());
  }

  /**
   * property changed
   * callback for number inputs
   */
  onBorderCornerChanged() {
    // corner radius
    if (goog.Is.isDef(this.borderRadiusInput.value) &&
        this.borderRadiusInput.value !== '') {
      // corner placement
      let borderWidthStr = '';
      let idx;
      let len = this.cornerPlacementCheckBoxes.length;
      for (idx = 0; idx < len; idx++) {
        let checkBox = this.cornerPlacementCheckBoxes[idx];
        if (checkBox.checked) {
          borderWidthStr += this.borderRadiusInput.value + 'px ';
        } else {
          borderWidthStr += '0 ';
        }
      }
      this.styleChanged('borderRadius', borderWidthStr);
    } else {
      this.styleChanged('borderRadius', '');
    }
  }
}
