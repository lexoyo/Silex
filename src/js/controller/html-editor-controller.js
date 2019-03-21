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
goog.provide('silex.controller.HtmlEditorController');

/**/const ControllerBase = goog.require('silex.controller.ControllerBase');



/**
 * @constructor
 * @extends {silex.controller.ControllerBase}
 * listen to the view events and call the main controller's methods}
 * @param {silex.types.Model} model
 * @param  {silex.types.View} view  view class which holds the other views
 */
silex.controller.HtmlEditorController = function(model, view) {
  // call super
super(model, view);
};

// inherit from silex.controller.ControllerBase
goog.inherits(silex.controller.HtmlEditorController/**/, ControllerBase);


/**
 * htmlEditor event handler
 * @param {silex.types.Element} element
 * @param {string} content
 */
silex.controller.HtmlEditorController.prototype.changed = function(element, content) {
  if (!element || element.tagName.toLowerCase() === 'body') {
    // edit head tag
    this.model.head.setUserHeadTag(content);
  }
  else {
    // edit current selection
    this.model.element.setInnerHtml(element, content);
  }
};
