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
import {Model} from '../../types';
import {Controller} from '../../types';
import {Style} from '../../utils/style';

import {ColorPicker} from '../ColorPicker';

import {PaneBase} from './pane-base';

/**
 * on of Silex Editors class
 * let user edit style of components
 * @param element   container to render the UI
 * @param model  model class which holds
  * the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 * the controller instances
 */
export class BgPane extends PaneBase {
  colorPicker: any;

  // add bg image button
  bgSelectBgImage: any;

  // remove bg image button
  bgClearBgImage: any;

  // bg image properties
  attachmentComboBox: any;
  vPositionComboBox: any;
  hPositionComboBox: any;
  repeatComboBox: any;
  sizeComboBox: any;
  iAmRedrawing: boolean;

  // remember selection
  selectedElements: HTMLElement[] = null;
  pageNames: any;
  currentPageName: any;

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
    this.attachmentComboBox = this.initComboBox(
        '.bg-attachment-combo-box', (event) => {
          this.styleChanged('background-attachment', event.target.value);
        });
    this.vPositionComboBox = this.initComboBox(
        '.bg-position-v-combo-box', (event) => {
          let hPosition = this.hPositionComboBox.value;
          let vPosition = this.vPositionComboBox.value;
          this.styleChanged('background-position', vPosition + ' ' + hPosition);
        });
    this.hPositionComboBox = this.initComboBox(
        '.bg-position-h-combo-box', (event) => {
          let hPosition = this.hPositionComboBox.value;
          let vPosition = this.vPositionComboBox.value;
          this.styleChanged('background-position', vPosition + ' ' + hPosition);
        });
    this.repeatComboBox =
        this.initComboBox('.bg-repeat-combo-box', (event) => {
          this.styleChanged('background-repeat', event.target.value);
        });
    this.sizeComboBox =
        this.initComboBox('.bg-size-combo-box', (event) => {
          this.styleChanged('background-size', event.target.value);
        });
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


    super.redraw( selectedElements, pageNames, currentPageName);
    this.selectedElements = selectedElements;
    this.pageNames = pageNames;
    this.currentPageName = currentPageName;

    // BG color
    if (selectedElements.length > 0) {
      this.colorPicker.setDisabled(false);
      let color =
          this.getCommonProperty(selectedElements, element => {
            return this.model.element.getStyle(element, 'background-color') ||
                '';
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

    // BG image
    let enableBgComponents = (enable) => {
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
    let bgImage =
        this.getCommonProperty(selectedElements, element => {
          return this.model.element.getStyle(element, 'background-image');
        });
    if (bgImage !== null && bgImage !== 'none' && bgImage !== '') {
      enableBgComponents(true);
    } else {
      enableBgComponents(false);
    }

    // bg image attachment
    let bgImageAttachment =
        this.getCommonProperty(selectedElements, element => {
          return this.model.element.getStyle(element, 'background-attachment');
        });
    if (bgImageAttachment) {
      this.attachmentComboBox.value = bgImageAttachment;
    } else {
      this.attachmentComboBox.selectedIndex = 0;
    }

    // bg image position
    let bgImagePosition =
        this.getCommonProperty(selectedElements, element => {
          return this.model.element.getStyle(element, 'background-position');
        });
    if (bgImagePosition) {
      // convert 50% in cennter
      let posArr = bgImagePosition.split(' ');
      let hPosition = posArr[0] || 'left';
      let vPosition = posArr[1] || 'top';

      // convert 0% by left, 50% by center, 100% by right
      hPosition = hPosition.replace('100%', 'right')
                      .replace('50%', 'center')
                      .replace('0%', 'left');

      // convert 0% by top, 50% by center, 100% by bottom
      vPosition = vPosition.replace('100%', 'bottom')
                      .replace('50%', 'center')
                      .replace('0%', 'top');

      // update the drop down lists to display the bg image position
      this.vPositionComboBox.value = vPosition;
      this.hPositionComboBox.value = hPosition;
    } else {
      this.vPositionComboBox.selectedIndex = 0;
      this.hPositionComboBox.selectedIndex = 0;
    }

    // bg image repeat
    let bgImageRepeat =
        this.getCommonProperty(selectedElements, element => {
          return this.model.element.getStyle(element, 'background-repeat');
        });
    if (bgImageRepeat) {
      this.repeatComboBox.value = bgImageRepeat;
    } else {
      this.repeatComboBox.selectedIndex = 0;
    }

    // bg image size
    let bgImageSize =
        this.getCommonProperty(selectedElements, element => {
          return this.model.element.getStyle(element, 'background-size');
        });
    if (bgImageSize) {
      this.sizeComboBox.value = bgImageSize;
    } else {
      this.sizeComboBox.selectedIndex = 0;
    }
    this.iAmRedrawing = false;
  }

  /**
   * User has selected a color
   */
  onColorChanged() {
    if (this.iAmRedrawing) {
      return;
    }

    // notify the toolbox
    this.styleChanged('background-color', this.colorPicker.getColor());
  }

  /**
   * Create a combo box
   */
  initComboBox(selector, onChange) {
    // create the combo box
    let comboBox = this.element.querySelector(selector);

    // attach event
    comboBox.addEventListener('change', () => {
      if (onChange && !this.iAmRedrawing) {
        onChange();
      }
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
    this.redraw(this.selectedElements, this.pageNames, this.currentPageName);
  }
}
