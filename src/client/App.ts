/**
 * @preserve
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
 * @fileoverview This file defines the entry point of Silex
 *
 * a view holds a reference to the controllers so that it can order changes on
 * the models a controller holds a reference to the models so that it can change
 * them a model holds a reference to the views so that it can update them
 *
 */

import { Config } from './ClientConfig';
import { ContextMenuController } from './controller/context-menu-controller';
import { CssEditorController } from './controller/css-editor-controller';
import { EditMenuController } from './controller/edit-menu-controller';
import { FileMenuController } from './controller/file-menu-controller';
import { HtmlEditorController } from './controller/html-editor-controller';
import { InsertMenuController } from './controller/insert-menu-controller';
import { JsEditorController } from './controller/js-editor-controller';
import { PageToolController } from './controller/page-tool-controller';
import { PropertyToolController } from './controller/property-tool-controller';
import { SettingsDialogController } from './controller/settings-dialog-controller';
import { StageController } from './controller/stage-controller';
import { TextEditorController } from './controller/text-editor-controller';
import { ToolMenuController } from './controller/tool-menu-controller';
import { ViewMenuController } from './controller/view-menu-controller';
import { Body } from './model/body';
import { Component } from './model/Component';
import { SilexElement } from './model/element';
import { File } from './model/file';
import { Head } from './model/head';
import { Page } from './model/page';
import { Property } from './model/property';
import { Controller, Model, View } from './types';
import { SilexNotification } from './utils/notification';
import { BreadCrumbs } from './view/bread-crumbs';
import { ContextMenu } from './view/context-menu';
import { CssEditor } from './view/dialog/css-editor';
import { Dashboard } from './view/dialog/Dashboard';
import { FileExplorer } from './view/dialog/file-explorer';
import { HtmlEditor } from './view/dialog/html-editor';
import { JsEditor } from './view/dialog/js-editor';
import { SettingsDialog } from './view/dialog/settings-dialog';
import { Menu } from './view/menu';
import { PageTool } from './view/page-tool';
import { PropertyTool } from './view/property-tool';
import { Splitter } from './view/splitter';
import { TextFormatBar } from './view/TextFormatBar';
import { Workspace } from './view/workspace';

import { Stage } from 'stage';

/**
 * Defines the entry point of Silex client application
 *
 */
export class App {
  /**
   * store the model instances
   * the model instances are passed to the controllers and the views
   */
  model: Model;

  /**
   * store the view instances
   * the view instaces have access to the models and controllers
   */
  view: View;

  /**
   * store the controller instances
   * controller instances have access to the views and the models
   */
  controller: Controller;

  /**
   * Entry point of Silex client application
   * create all views and models and controllers
   *
   */
  constructor(debug=false) {
    // the debug flag comes from index.jade or debug.jade
    Config.debug.debugMode = debug;
    if(Config.debug.debugMode) {
      console.warn('Silex starting in debug mode.')
    }

    // create all the components of Silex app
    this.initView();
    this.initModel();
    this.initController();

    // init views now that controllers and model are instanciated
    this.view.workspace.buildUi();
    // this.view.stage.buildUi();
    this.view.menu.buildUi();
    this.view.contextMenu.buildUi();
    this.view.breadCrumbs.buildUi();
    this.view.pageTool.buildUi();
    this.view.dashboard.buildUi();
    this.view.propertyTool.buildUi();

    // warning when not ff or chrome
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    if (!isFirefox && !isChrome) {
      SilexNotification.alert(
          'Your browser is not supported yet.<br><br>Considere using <a href="https://www.mozilla.org/firefox/" target="_blank">Firefox</a> or <a href="https://www.google.com/chrome/" target="_blank">chrome</a>.',
          () => {});
    }

    // the build type
    if (!Config.debug.debugMode) {
      // warning small screen size
      // height must be enough to view the settings pannel
      // width is just arbitrary
      const winSizeWidth = document.documentElement.clientWidth;
      const winSizeHeight = document.documentElement.clientHeight;
      const minWinSizeWidth = 950;
      const minWinSizeHeight = 630;
      if (winSizeHeight < minWinSizeHeight || winSizeWidth < minWinSizeWidth) {
        SilexNotification.alert(
            `Your window is very small (${winSizeWidth}x${
                winSizeHeight}) and Silex may not display correctly.<br><br>Considere maximizing the window or use a bigger screen to use Silex at its best. A window size of ${
                minWinSizeWidth}x${
                minWinSizeHeight} is considered to be a acceptable.`,
            () => {});
      }
    }

    // draw the workspace once
    this.view.workspace.redraw(this.view);

    // application start, open a new empty file
    this.controller.fileMenuController.newFile(
        () => {
          this.view.workspace.loadingDone();
          this.initDebug();
        },
        () => {
          this.view.workspace.loadingDone();
          this.initDebug();
        });
  }

  initDebug() {
    if (Config.debug.debugMode && Config.debug.debugScript) {
      window['model'] = this.model;
      window['view'] = this.view;
      window['controller'] = this.controller;
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = Config.debug.debugScript;
      document.body.appendChild(script);
    }

    // prevent accidental unload
    if (!Config.debug.debugMode || Config.debug.preventQuit) {
      this.view.workspace.startWatchingUnload();
    }
  }

  /**
   * creation of the view instances
   */
  initView() {
    // Stage
    let stageElement = document.getElementsByClassName('silex-stage')[0] as HTMLElement;
    // let stage: Stage = new Stage(stageElement, this.model, this.controller);

    // Menu
    let menuElement = document.getElementsByClassName(Menu.CLASS_NAME)[0] as HTMLElement;
    let menu: Menu = new Menu(menuElement, this.model, this.controller);

    // context menu
    let contextMenuElement =
        document.getElementsByClassName(ContextMenu.CLASS_NAME)[0] as HTMLElement;
    let contextMenu: ContextMenu =
        new ContextMenu(contextMenuElement, this.model, this.controller);

    // bread crumbs
    let breadCrumbsElement =
        document.getElementsByClassName('silex-bread-crumbs')[0] as HTMLElement;
    let breadCrumbs: BreadCrumbs =
        new BreadCrumbs(breadCrumbsElement, this.model, this.controller);

    // PageTool
    let pageToolElement = document.getElementsByClassName('silex-page-tool')[0] as HTMLElement;
    let pageTool: PageTool =
        new PageTool(pageToolElement, this.model, this.controller);

    // HtmlEditor
    let htmlEditorElement =
        document.getElementsByClassName('silex-html-editor')[0] as HTMLElement;
    let htmlEditor: HtmlEditor =
        new HtmlEditor(htmlEditorElement, this.model, this.controller);

    // CssEditor
    let cssEditorElement =
        document.getElementsByClassName('silex-css-editor')[0] as HTMLElement;
    let cssEditor: CssEditor =
        new CssEditor(cssEditorElement, this.model, this.controller);

    // JsEditor
    let jsEditorElement = document.getElementsByClassName('silex-js-editor')[0] as HTMLElement;
    let jsEditor: JsEditor =
        new JsEditor(jsEditorElement, this.model, this.controller);

    // SettingsDialog
    let settingsDialogElement =
        document.getElementsByClassName('silex-settings-dialog')[0] as HTMLElement;
    let settingsDialog: SettingsDialog =
        new SettingsDialog(settingsDialogElement, this.model, this.controller);

    // Dashboard
    let dashboardElement =
        document.getElementsByClassName('silex-dashboard')[0] as HTMLElement;
    let dashboard: Dashboard =
        new Dashboard(dashboardElement, this.model, this.controller);

    // FileExplorer
    let fileExplorerElement =
        (document.getElementById('silex-file-explorer') as HTMLElement);
    let fileExplorer: FileExplorer =
        new FileExplorer(fileExplorerElement, this.model, this.controller);

    // PropertyTool
    let propertyToolElement =
        document.getElementsByClassName('silex-property-tool')[0] as HTMLElement;
    let propertyTool: PropertyTool =
        new PropertyTool(propertyToolElement, this.model, this.controller);

    // TextFormatBar
    let textFormatBarElement =
        document.getElementsByClassName('silex-text-format-bar')[0] as HTMLElement;
    let textFormatBar: TextFormatBar =
        new TextFormatBar(textFormatBarElement, this.model, this.controller);

    // workspace
    let workspaceElement =
        document.getElementsByClassName('silex-workspace')[0] as HTMLElement;
    let workspace: Workspace =
        new Workspace(workspaceElement, this.model, this.controller);

    // add splitters
    let propSplitterElement =
        document.getElementsByClassName('vertical-splitter')[0] as HTMLElement;
    let propSplitter: Splitter = new Splitter(
        propSplitterElement, this.model, this.controller,
        () => workspace.resizeProperties());
    propSplitter.addLeft(contextMenuElement);
    propSplitter.addLeft(breadCrumbsElement);
    propSplitter.addLeft(stageElement);
    propSplitter.addRight(propertyToolElement);

    // init the view class which references all the views
    this.view = {
      menu,
      contextMenu,
      breadCrumbs,
      pageTool,
      propertyTool,
      textFormatBar,
      htmlEditor,
      cssEditor,
      jsEditor,
      fileExplorer,
      settingsDialog,
      dashboard,
      propSplitter,
      workspace,
    }
  }

  /**
   * creation of the model classes
   * create the models to be passed to the controllers and the views
   */
  initModel() {
    const iframeElement = (document.querySelector('.silex-stage-iframe') as HTMLIFrameElement);

    // init the model class which references all the views
    this.model = {
      file: new File(this.model, this.view),
      head: new Head(this.model, this.view),
      body: new Body(this.model, this.view),
      page: new Page(this.model, this.view),
      element: new SilexElement(this.model, this.view),
      component: new Component(this.model, this.view),
      property: new Property(this.model, this.view),
      stage: new Stage(iframeElement, iframeElement.contentWindow.document.querySelectorAll('.editable-element')),
    }
  }

  /**
   * init the controller class with references to the views and the models
   */
  initController() {
    this.controller = {
      fileMenuController: new FileMenuController(this.model, this.view),
      editMenuController: new EditMenuController(this.model, this.view),
      viewMenuController: new ViewMenuController(this.model, this.view),
      insertMenuController: new InsertMenuController(this.model, this.view),
      toolMenuController: new ToolMenuController(this.model, this.view),
      contextMenuController: new ContextMenuController(this.model, this.view),
      stageController: new StageController(this.model, this.view),
      pageToolController: new PageToolController(this.model, this.view),
      propertyToolController: new PropertyToolController(this.model, this.view),
      settingsDialogController: new SettingsDialogController(this.model, this.view),
      htmlEditorController: new HtmlEditorController(this.model, this.view),
      cssEditorController: new CssEditorController(this.model, this.view),
      jsEditorController: new JsEditorController(this.model, this.view),
      textEditorController: new TextEditorController(this.model, this.view),
    }
  }
}

window['silex'] = new App();
