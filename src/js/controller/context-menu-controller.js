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

 goog.module('silex.controller.ContextMenuController');

const ControllerBase = goog.require('silex.controller.ControllerBase');



/**
 * @extends {silex.controller.ControllerBase}
 * @class ContextMenuController
 */
exports = class ContextMenuController extends ControllerBase {
  /**
   *
   * listen to the view events and call the main controller's methods}
   * @param {silex.types.Model} model
   * @param  {silex.types.View} view  view class which holds the other views
   */
  constructor(model, view) {
    super(model, view);
  };
}
