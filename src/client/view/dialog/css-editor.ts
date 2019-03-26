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
 * the Silex CSS Editor
 *
 *
 */
import {Model} from '../../types.js';
import {Controller} from '../../types.js';
import {AceEditorBase} from './ace-editor-base.js';

/**
 * @class {silex.view.dialog.CssEditor}
 */
export class CssEditor extends AceEditorBase {
  /**
   * @param element   container to render the UI
   * @param model  model class which holds
   *                                  the model instances - views use it for
   * read operation only
   * @param controller  structure which holds
   *                                               the controller instances
   */
  constructor(element: HTMLElement, model: Model, controller: Controller) {
    super(element, model, controller);

    // set mode
    this.ace.getSession()['setMode']('ace/mode/css');
  }

  /**
   * the content has changed, notify the controler
   */
  contentChanged() {
    this.controller.cssEditorController.changed(this.ace.getValue());
  }
}
