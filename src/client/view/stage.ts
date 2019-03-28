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
import { Body } from '../model/body.js';
import { Constants } from '../../Constants.js';
import { Controller, Model } from '../types.js';
import { Stage as StageComp } from 'stage';

/**
 * the Silex stage class handles the stage library
 */
export class Stage {

  /**
   * class name for the stage element
   */
  static STAGE_CLASS_NAME = 'silex-stage-iframe';

  iframeElement: HTMLIFrameElement;
  stage: StageComp;

  constructor(
      public element: HTMLElement, public model: Model,
      public controller: Controller) {
    this.iframeElement = (document.querySelector('.' + Stage.STAGE_CLASS_NAME) as HTMLIFrameElement);
  }

  /**
   * build the UI
   * called by the app constructor
   */
  buildUi() {
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
    // this.stage = new StageComp(this.iframeElement, contentWindow.document.querySelectorAll('.editable-element'), {

    // });
  }

  /**
   * remove stage event listeners
   * @param bodyElement the element which contains the body of the site
   */
  removeEvents(bodyElement: HTMLElement) {
  }

  /**
   * redraw the properties
   * @param selectedElements the selected elements
   * @param pageNames   the names of the pages
   * @param  currentPageName   the name of the current page
   */
  redraw(selectedElements: HTMLElement[], pageNames: string[], currentPageName: string) {
    // reset focus out of the text inputs,
    // this also prevents a bug when the page is loaded and the user presses a
    // key, the body is replaced by the keys chars
    Body.resetFocus();
  }

  /**
   * bring the selection forward
   */
  bringSelectionForward() {
    // this.selectedElements.forEach((element) => {
    //   let container = element.parentElement;
    //   element.parentElement.removeChild(element);
    //   container.appendChild(element);
    // });
  }


  /**
   * compute the page visibility of the element
   * @param element     the element to check
   * @return true if the element is in the current page or not in any page
   */
  getVisibility(element: HTMLElement): boolean {
    const currentPageName = '';
    let parent: HTMLElement = (element as HTMLElement | null);
    while (parent &&
           (!parent.classList.contains(Constants.PAGED_CLASS_NAME) ||
            parent.classList.contains(currentPageName)) &&
           !(this.controller.stageController.getMobileMode() &&
             this.model.element.getHideOnMobile(parent))) {
      parent = (parent.parentElement as HTMLElement | null);
    }
    return parent === null;
  }
}
