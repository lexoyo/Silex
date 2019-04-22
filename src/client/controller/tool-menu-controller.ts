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
import {SilexTasks} from '../service/silex-tasks';
import {Model} from '../types';
import {View} from '../types';

import {ControllerBase} from './controller-base';

/**
 * @param view  view class which holds the other views
 */
export class ToolMenuController extends ControllerBase {
  constructor(model: Model, view: View) {

super(model, view);
  }

  /**
   * dock panels
   * @param dock or undock
   */
  dockPanel(dock: boolean) {
    if (dock) {
      document.body.classList.add('dock-editors');
      this.view.propSplitter.addRight(this.view.cssEditor.element);
      this.view.propSplitter.addRight(this.view.jsEditor.element);
      this.view.propSplitter.addRight(this.view.htmlEditor.element);
    } else {
      document.body.classList.remove('dock-editors');
      this.view.propSplitter.remove(this.view.cssEditor.element);
      this.view.propSplitter.remove(this.view.jsEditor.element);
      this.view.propSplitter.remove(this.view.htmlEditor.element);
    }
  }
}
