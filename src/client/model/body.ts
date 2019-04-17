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
 * @fileoverview
 *   This class represents a the body of the opened file,
 *   which is rendered by the Stage class
 *   It has methods to manipulate the dom
 */


import {View} from '../types';
import {Model} from '../types';
import {Constants} from '../../Constants';

/**
 * @param model  model class which holds the other models
 * @param view  view class which holds the other views
 */
export class Body {
  /**
   * input element to get the focus
   * used to blur the UI inputs
   * @static
   */
  static focusInput: HTMLElement;

  constructor(private model: Model, private view: View) {
    // hide the focus input and attach it to the DOM
    Body.focusInput.style.left = '-1000px';
    Body.focusInput.style.position = 'absolute';
    document.body.appendChild(Body.focusInput);
  }

  /**
   * remove the focus from text fields
   * @static
   */
  static resetFocus() {
    Body.focusInput.focus();
    Body.focusInput.blur();
  }

  /**
   * @return   body element
   */
  getBodyElement(): HTMLElement {
    return this.model.file.getContentDocument().body;
  }

  /**
   * @return   array of elements which are currently selected
   */
  getSelection(): HTMLElement[] {
    if(this.view.stage) {
      let elements = this.view.stage.getSelection().map(s => s.el);
      if (!elements || elements.length === 0) {
        // default, return the body
        const bodyElement = this.getBodyElement();
        if (!bodyElement) {
          console.warn(
              'Could not get body element because it is not created yet.');
          return [];
        }
        return [bodyElement];
      }

      // build the result array
      let res = [];
      elements.forEach((element) => {
        res.push(element);
      });
      return res;
    }
    else {
      return [];
    }
  }

  /**
   * @param selectedElements  array of elements which are to select
   */
  setSelection(selectedElements: HTMLElement[]) {
    if(this.view.stage) {
      this.view.stage.setSelection(selectedElements);

      // refresh views
      let pages = this.model.page.getPages();
      let page = this.model.page.getCurrentPage();
      this.view.pageTool.redraw(selectedElements, pages, page);
      this.view.propertyTool.redraw(selectedElements, pages, page);
      this.view.textFormatBar.redraw(selectedElements, pages, page);
      // this.view.stage.redraw(selectedElements, pages, page);
      this.view.contextMenu.redraw(selectedElements, pages, page);
      this.view.breadCrumbs.redraw(selectedElements, pages, page);
      this.view.htmlEditor.setSelection(selectedElements);
    }
  }

  removeWysihtmlMarkup(root: HTMLElement|Document) {
    Array.from(root.querySelectorAll('.wysihtml-editor')).forEach((el) => {
      el.classList.remove('wysihtml-sandbox', 'wysihtml-editor');
      el.removeAttribute('contenteditable');
    });
  }
}
Body.focusInput = document.createElement('input');
