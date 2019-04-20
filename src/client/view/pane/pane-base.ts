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
 * @fileoverview This is the pane's base class
 * Property panes displayed in the property tool box.
 * Controls the params of the selected component.
 *
 */

import { Controller, Model } from '../../types';


/**
 * base class for all UI panes of the view.pane package
 *
 * @param element   container to render the UI
 * @param model  model class which holds
 *                                  the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 *                                  the controller instances
 */
export class PaneBase {
  /**
   * base url for relative/absolute urls
   */
  baseUrl = null;

  /**
   * {bool} flag to prevent redraw while changing a value myself
   *        this is true when the user has used the toolbox to change a value,
   *        while the call to notify the controller is processed
   */
  iAmSettingValue: boolean;

  /**
   * {bool} flag to prevent notifying the controller while changing a value myself
   *        this is true during redraw
   *        it is useful because setting a value of an input element
   *        automatically triggers a change event
   */
  iAmRedrawing: boolean;

  constructor(public element: HTMLElement, public model: Model, public controller: Controller) {

  }

  /**
   * notify the controller that the style changed
   * @param styleName   not css style but camel case
   */
  styleChanged(styleName: string, opt_styleValue?: string, opt_elements?: HTMLElement[]) {
    this.iAmSettingValue = true;

    // notify the controller
    this.controller.propertyToolController.styleChanged(styleName, opt_styleValue, opt_elements);
    this.iAmSettingValue = false;
  }

  /**
   * notify the controller that a property has changed
   * @param propertyName   property name, e.g. 'src'
   */
  propertyChanged(propertyName: string, opt_propertyValue?: string, opt_elements?: HTMLElement[], opt_applyToContent?: boolean) {
    if (this.iAmRedrawing) {
      return;
    }
    this.iAmSettingValue = true;

    // notify the controller
    this.controller.propertyToolController.propertyChanged(propertyName, opt_propertyValue, opt_elements, opt_applyToContent);
    this.iAmSettingValue = false;
  }

  /**
   * refresh the displayed data
   * @param selectedElements the elements currently selected
   * @param pageNames   the names of the pages which appear in the current HTML
   *     file
   * @param  currentPageName   the name of the current page
   */
  redraw(selectedElements: HTMLElement[], pageNames: string[], currentPageName: string) {
    if (!selectedElements) {
      throw new Error('selection array is undefined');
    }
  }

  /**
   * get the common property of a group of elements
   * @param getPropertyFunction the callback which returns the value for one
   *     element
   * @return ? {string|number|boolean} the value or null if the value is not the
   *     same for all elements
   * FIXME: we should use Array::reduce
   */
  getCommonProperty(
      elements: HTMLElement[],
      getPropertyFunction: (p1: HTMLElement) => string | number | boolean |
          null): any {
    let value = null;
    let hasCommonValue: boolean = true;
    let isFirstValue = true;
    elements.forEach((element) => {
      let elementValue = getPropertyFunction(element);
      if (isFirstValue) {
        isFirstValue = false;

        // init value
        value = elementValue;
      } else {
        // check if there is a common type
        if (elementValue !== value) {
          hasCommonValue = false;
        }
      }
    });
    if (!hasCommonValue) {
      value = null;
    }
    return value;
  }
}
