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
 * @fileoverview A controller listens to a view element,
 *      and call the main {silex.controller.Controller} controller's methods
 *
 */
import {Model} from '../types.js';
import {View} from '../types.js';
import {ControllerBase} from './controller-base.js';

/**
 * @param view  view class which holds the other views
 */
export class JsEditorController extends ControllerBase {
  constructor(model: Model, view: View) {
    // call super
super(model, view);
  }

  /**
   * JsEditor event handler
   */
  changed(content: string) {
    // update content
    this.model.head.setHeadScript(content);
  }
}
