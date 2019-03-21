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
goog.provide('silex.controller.InsertMenuController');

/**/const ControllerBase = goog.require('silex.controller.ControllerBase');
goog.require('silex.service.SilexTasks');



/**
 * @constructor
 * @extends {silex.controller.ControllerBase}
 * listen to the view events and call the main controller's methods}
 * @param {silex.types.Model} model
 * @param  {silex.types.View} view  view class which holds the other views
 */
silex.controller.InsertMenuController = function(model, view) {
  // call super
super(model, view);
};

// inherit from silex.controller.ControllerBase
goog.inherits(silex.controller.InsertMenuController/**/, ControllerBase);


/**
 * create a page
 * @param {?function()=} successCbk
 * @param {?function()=} cancelCbk
 */
silex.controller.InsertMenuController.prototype.createPage = function(successCbk, cancelCbk) {
  this.tracker.trackAction('controller-events', 'request', 'insert.page', 0);
  this.getUserInputPageName('Your new page name', goog.bind(function(name, displayName) {
    if (name) {
      // undo checkpoint
      this.undoCheckPoint();
      // create the page model
      this.model.page.createPage(name, displayName);
      // update view
      if (successCbk) {
        successCbk();
      }
      this.tracker.trackAction('controller-events', 'success', 'insert.page', 1);
    }
    else {
      if (cancelCbk) {
        cancelCbk();
      }
      this.tracker.trackAction('controller-events', 'cancel', 'insert.page', 0);
    }
  }, this));
};


