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
 * Controls the background params
 *
 */
import { SelectableState } from 'stage/src/ts/Types';
import { Controller, Model } from '../../types';
import { ColorPicker } from '../ColorPicker';
import { PaneBase } from './pane-base';


/**
 * on of Silex Editors class
 * const user edit style of components
 * @param element   container to render the UI
 * @param model  model class which holds
  * the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 * the controller instances
 */
export class BgPane extends PaneBase {
  colorPicker: ColorPicker;

  // bg image buttons
  bgSelectBgImage: HTMLElement;
  bgClearBgImage: HTMLElement;

  // bg image properties
  attachmentComboBox: HTMLSelectElement;
  vPositionComboBox: HTMLSelectElement;
  hPositionComboBox: HTMLSelectElement;
  repeatComboBox: HTMLSelectElement;
  sizeComboBox: HTMLSelectElement;

  constructor(element: HTMLElement, model: Model, controller: Controller) {
    super(element, model, controller);

    // init the component
    this.buildUi();
  }

  /**
   * build the UI
   */
  buildUi() {
    // BG color
    this.buildBgColor();

    // init bg image
    this.buildBgImage();

    // bg image properties
    this.buildBgImageProperties();
  }

  /**
   * build the UI
   */
  buildBgColor() {
    this.colorPicker = new ColorPicker(
        this.element.querySelector('.color-edit-container'),
        (value) => this.onColorChanged());
  }

  /**
   * build the UI
   */
  buildBgImage() {
    this.bgSelectBgImage = this.element.querySelector('.bg-image-button');
    this.bgClearBgImage = this.element.querySelector('.clear-bg-image-button');

    // event user wants to update the bg image
    this.bgSelectBgImage.addEventListener('click', () => this.onSelectImageButton(), false);

    // event user wants to remove the bg image
    this.bgClearBgImage.addEventListener('click', () => this.onClearImageButton(), false);
  }

  /**
   * build the UI
   */
  buildBgImageProperties() {
    this.attachmentComboBox = this.initComboBox('.bg-attachment-combo-box', (event: Event) => {
      this.styleChanged('background-attachment', (event.target as HTMLInputElement).value);
    });
    this.vPositionComboBox = this.initComboBox('.bg-position-v-combo-box', (event: Event) => {
      const hPosition = this.hPositionComboBox.value;
      const vPosition = this.vPositionComboBox.value;
      this.styleChanged('background-position', vPosition + ' ' + hPosition);
    });
    this.hPositionComboBox = this.initComboBox('.bg-position-h-combo-box', (event: Event) => {
      const hPosition = this.hPositionComboBox.value;
      const vPosition = this.vPositionComboBox.value;
      this.styleChanged('background-position', vPosition + ' ' + hPosition);
    });
    this.repeatComboBox = this.initComboBox('.bg-repeat-combo-box', (event: Event) => {
      this.styleChanged('background-repeat', (event.target as HTMLInputElement).value);
    });
    this.sizeComboBox = this.initComboBox('.bg-size-combo-box', (event: Event) => {
      this.styleChanged('background-size', (event.target as HTMLInputElement).value);
    });
  }

  /**
   * redraw the properties
   * @param states the elements currently selected
   * @param pageNames   the names of the pages which appear in the current HTML file
   * @param  currentPageName   the name of the current page
   */
  redraw(states: SelectableState[], pageNames: string[], currentPageName: string) {
    super.redraw(states, pageNames, currentPageName);
    console.log('bg pane redraw')

    // BG color
    if (states.length > 0) {
      this.colorPicker.setDisabled(false);
      const color = this.getCommonProperty(states, state => this.model.element.getStyle(state.el, 'background-color') || '');

      // indeterminate state
      this.colorPicker.setIndeterminate(color == null);

      // display color
      if (color != null) {
        this.colorPicker.setColor(color);
      }
    } else {
      this.colorPicker.setDisabled(true);
    }

    // BG image
    const enableBgComponents = (enable) => {
      if (enable) {
        this.bgClearBgImage.classList.remove('disabled');
      } else {
        this.bgClearBgImage.classList.add('disabled');
      }
      this.attachmentComboBox.disabled = !enable;
      this.vPositionComboBox.disabled = !enable;
      this.hPositionComboBox.disabled = !enable;
      this.repeatComboBox.disabled = !enable;
      this.sizeComboBox.disabled = !enable;
    };
    const bgImage = this.getCommonProperty(states, state => this.model.element.getStyle(state.el, 'background-image'));

    if (bgImage !== null && bgImage !== 'none' && bgImage !== '') {
      enableBgComponents(true);
    } else {
      enableBgComponents(false);
    }

    // bg image attachment
    const bgImageAttachment = this.getCommonProperty(states, state => this.model.element.getStyle(state.el, 'background-attachment'));
    if (bgImageAttachment) {
      this.attachmentComboBox.value = bgImageAttachment;
    } else {
      this.attachmentComboBox.selectedIndex = 0;
    }

    // bg image position
    const bgImagePosition = this.getCommonProperty(states, state => this.model.element.getStyle(state.el, 'background-position'));
    console.log('bg pane bgImagePosition', bgImagePosition)
    if (bgImagePosition) {
      // convert 50% in center
      const posArr = bgImagePosition.split(' ');
      let hPosition = posArr[0] || 'left';
      let vPosition = posArr[1] || 'top';

      // convert 0% by left, 50% by center, 100% by right
      hPosition = hPosition.replace('100%', 'right').replace('50%', 'center').replace('0%', 'left');

      // convert 0% by top, 50% by center, 100% by bottom
      vPosition = vPosition.replace('100%', 'bottom').replace('50%', 'center').replace('0%', 'top');

      // update the drop down lists to display the bg image position
      this.vPositionComboBox.value = vPosition;
      this.hPositionComboBox.value = hPosition;
    } else {
      this.vPositionComboBox.selectedIndex = 0;
      this.hPositionComboBox.selectedIndex = 0;
    }

    // bg image repeat
    const bgImageRepeat = this.getCommonProperty(states, state => this.model.element.getStyle(state.el, 'background-repeat'));

    if (bgImageRepeat) {
      this.repeatComboBox.value = bgImageRepeat;
    } else {
      this.repeatComboBox.selectedIndex = 0;
    }

    // bg image size
    const bgImageSize = this.getCommonProperty(states, state => this.model.element.getStyle(state.el, 'background-size'));

    if (bgImageSize) {
      this.sizeComboBox.value = bgImageSize;
    } else {
      this.sizeComboBox.selectedIndex = 0;
    }
  }

  /**
   * User has selected a color
   */
  onColorChanged() {
    // notify the toolbox
    this.styleChanged('background-color', this.colorPicker.getColor());
  }

  /**
   * Create a combo box
   */
  initComboBox(selector: string, onChange: (e: Event) => void): HTMLSelectElement {
    // create the combo box
    const comboBox = this.element.querySelector(selector) as HTMLSelectElement;

    // attach event
    comboBox.addEventListener('change', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('combo', e.target, (e.target as any).value)
      onChange(e);
    });

    return comboBox;
  }

  /**
   * User has clicked the select image button
   */
  onSelectImageButton() {
    this.controller.propertyToolController.browseBgImage();
  }

  /**
   * User has clicked the clear image button
   */
  onClearImageButton() {
    this.styleChanged('background-image', '');

    // UI needs to be updated (which is prevented in this.styleChanged by the
    // flag iAmSettingTheValue
    this.redraw(this.states, this.pageNames, this.currentPageName);
  }
}
