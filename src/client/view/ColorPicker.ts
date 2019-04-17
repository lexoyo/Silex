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
 * @fileoverview This class is a color picker component used in the properties.
 * It let the user choose a color with an opacity, i.e. color is css
 * rgba(r,g,b,a) or no color at all, i.e. value is `transparent` It uses the
 * browser'scolor picker for the color
 */

import {Style} from '../utils/style';

export class ColorPicker {
  // store for later use
  element: any;
  cbk: any;
  color: any = '';
  isDisabled: any = true;
  isIndeterminate: any = true;

  // init button which shows/hides the palete
  colorInput: any;

  // alpha
  opacityInput: any;

  // transparency
  transparentCheckbox: any;

  /**
   * @param element the container of the component, it is supposed to have this
   *     structure:
   *    .color-edit-container
   *      input.color-edit-text-input(type='number', min='0', max='100')
   *      input.color-edit-color-input(type='color')
   *      input.color-edit-transparent-check(type='checkbox',
   * indeterminate='true')
   */
  constructor(element: HTMLElement, cbk) {
    this.element = element;
    this.cbk = cbk;
    this.colorInput = this.element.querySelector('.color-button');
    this.colorInput.onchange = (e) => this.onChange();
    this.colorInput.oninput = (e) => this.onChange();
    this.opacityInput = this.element.querySelector('.color-opacity-input');
    this.opacityInput.onchange = (e) => this.onChange();
    this.opacityInput.oninput = (e) => this.onChange();
    this.transparentCheckbox =
        this.element.querySelector('.color-edit-transparent-check');
    this.transparentCheckbox.onchange = (e) => this.onChange();
  }

  setDisabled(isDisabled) {
    this.isDisabled = isDisabled;
    this.redraw();
  }

  setIndeterminate(isIndeterminate) {
    this.isIndeterminate = isIndeterminate;
    this.redraw();
  }

  /**
   * store the new color
   * @param color the css color as an rgba string, i.e. rgba(r,g,b,a),
   *                      or "transparent"
   */
  setColor(color: string) {
    this.color = color;
    this.redraw();
  }

  getColor() {
    return this.color;
  }

  onChange() {
    if (!this.transparentCheckbox.checked) {
      const opacityPercent = parseInt(this.opacityInput.value, 10);
      const opacity = isNaN(opacityPercent) ? 1 : opacityPercent / 100;
      const hex = Math.round(opacity * 255).toString(16);
      this.color = Style.hexToRgba(
          this.colorInput.value + (hex.length === 2 ? '' : '0') + hex);
    } else {
      this.color = 'transparent';
    }

    // notify the owner
    this.cbk();

    // update the disabled states of the inputs
    this.redraw();
  }

  redraw() {
    if (this.isIndeterminate) {
      this.transparentCheckbox.indeterminate = true;
      this.opacityInput.value = '';
    } else {
      this.transparentCheckbox.indeterminate = false;
      if (this.color === 'transparent' || this.color == null ||
          this.color === '') {
        this.transparentCheckbox.checked = true;
        this.colorInput.disabled = true;
        this.colorInput.style.opacity = .3;
        this.opacityInput.disabled = true;
        this.opacityInput.value = '';
      } else {
        this.transparentCheckbox.checked = false;
        this.colorInput.disabled = false;
        this.colorInput.style.opacity = 1;

        // this will not accept rgba, only rgb:
        let hex = Style.rgbaToHex(this.color);
        this.colorInput.value = hex.substring(0, hex.length - 2);
        this.opacityInput.disabled = false;
        try {
          let arr = Style.rgbaToArray(this.color);
          this.opacityInput.value = Math.round(arr[3] * 100 / 255);
        } catch (e) {
          // probably not an rgba color
          this.opacityInput.value = 100;
        }
      }
    }
    if (this.isDisabled) {
      this.transparentCheckbox.disabled = true;
      this.colorInput.disabled = true;
      this.colorInput.style.opacity = .3;
      this.opacityInput.disabled = true;
    } else {
      this.transparentCheckbox.disabled = false;
    }
  }
}
