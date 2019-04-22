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
 * Controls the general params of the selected component
 *
 */

import { Controller, Model } from '../../types';
import { PaneBase } from './pane-base';


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
export class GeneralStylePane extends PaneBase {
  iAmRedrawing: boolean;
  /**
   * opacity input
   */
  opacityInput: HTMLInputElement;

  constructor(element: HTMLElement, model: Model, controller: Controller) {

    super(element, model, controller);

    // init the component
    this.buildUi();
  }

  /**
   * build the UI
   */
  buildUi() {
    this.opacityInput = document.querySelector('.opacity-input');
    this.opacityInput.addEventListener('input', (e) => this.onInputChanged(e), false);
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

    // not available for stage element
    let elementsNoStage = [];
    selectedElements.forEach((element) => {
      if (this.model.body.getBodyElement() !== element) {
        elementsNoStage.push(element);
      }
    });
    if (elementsNoStage.length > 0) {
      // not stage element only
      this.opacityInput.removeAttribute('disabled');

      // get the opacity
      let opacity = this.getCommonProperty(selectedElements, (element) => {
        return this.model.element.getStyle(element, 'opacity');
      });
      if (opacity === null) {
        this.opacityInput.value = '';
      } else {
        if (opacity === '') {
          this.opacityInput.value = '100';
        } else {
          this.opacityInput.value = Math.round(parseFloat(opacity) * 100).toString();
        }
      }
    } else {
      // stage element only
      this.opacityInput.value = '';
      this.opacityInput.setAttribute('disabled', 'true');
    }
    this.iAmRedrawing = false;
  }

  /**
   * User has selected a color
   */
  onInputChanged(event) {
    if (this.opacityInput.value && this.opacityInput.value !== '') {
      let val = parseFloat(this.opacityInput.value) / 100.0;
      if (val < 0) {
        val = 0;
      }
      if (val > 1) {
        val = 1;
      }
      this.styleChanged('opacity', val.toString());
    } else {
      this.styleChanged('opacity');
    }
  }
}
