
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
 * a view holds a reference to the controllers so that it can order changes on the models
 * a controller holds a reference to the models so that it can change them
 * a model holds a reference to the views so that it can update them
 *
 */

goog.module('silex.App');
// goog.provide('silex.App');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.style');
goog.require('silex.Config');
// const ControllerBase = goog.require('silex.controller.ControllerBase');
goog.require('silex.controller.CssEditorController');
goog.require('silex.controller.EditMenuController');
goog.require('silex.controller.FileMenuController');
goog.require('silex.controller.HtmlEditorController');
goog.require('silex.controller.InsertMenuController');
goog.require('silex.controller.JsEditorController');
goog.require('silex.controller.PageToolController');
goog.require('silex.controller.PropertyToolController');
goog.require('silex.controller.SettingsDialogController');
goog.require('silex.controller.StageController');
goog.require('silex.controller.ToolMenuController');
goog.require('silex.controller.ViewMenuController');
const ContextMenuController = goog.require('silex.controller.ContextMenuController');
const TextEditorController = goog.require('silex.controller.TextEditorController');
goog.require('silex.model.Body');
goog.require('silex.model.Element');
const {Component} = goog.require('silex.model.Component');
goog.require('silex.model.File');
goog.require('silex.model.Head');
goog.require('silex.model.Page');
goog.require('silex.model.Property');
const {DragSystem} = goog.require('silex.model.DragSystem');
goog.require('silex.service.Tracker');
goog.require('silex.service.SilexTasks');
goog.require('silex.types.Controller');
goog.require('silex.types.Model');
goog.require('silex.types.View');
goog.require('silex.utils.Dom');
goog.require('silex.utils.Polyfills');
goog.require('silex.utils.Style');
goog.require('silex.utils.Notification');
goog.require('silex.types.UndoItem');
goog.require('silex.view.ContextMenu');
goog.require('silex.view.BreadCrumbs');
goog.require('silex.view.Menu');
goog.require('silex.view.PageTool');
goog.require('silex.view.PropertyTool');
goog.require('silex.view.Splitter');
goog.require('silex.view.Stage');
goog.require('silex.view.Workspace');
const FileExplorer = goog.require('silex.view.dialog.FileExplorer');
const CssEditor = goog.require('silex.view.dialog.CssEditor');
const HtmlEditor = goog.require('silex.view.dialog.HtmlEditor');
const JsEditor = goog.require('silex.view.dialog.JsEditor');
const SettingsDialog = goog.require('silex.view.dialog.SettingsDialog');
const Dashboard = goog.require('silex.view.dialog.Dashboard');
const TextFormatBar = goog.require('silex.view.TextFormatBar');
goog.require('silex.view.ModalDialog');

goog.require('silex.model.data.SilexId');
goog.require('silex.model.data.StyleName');
goog.require('silex.model.data.CssRule');
goog.require('silex.model.data.ComponentData');
goog.require('silex.model.data.StyleData');
goog.require('silex.model.data.ProdotypeData');
goog.require('silex.model.data.SilexData');
goog.require('silex.model.data.JsonData');
goog.require('silex.model.data.ProdotypeTypes');
goog.require('silex.model.data.VisibilityData');
goog.require('silex.model.data.PseudoClassData');
goog.require('silex.model.data.Visibility');
goog.require('silex.model.data.PseudoClass');
goog.require('silex.model.data.TagName');
goog.require('silex.model.data.CssPropertyName');
goog.require('silex.model.data.CssPropertyValue');
goog.require('silex.model.data.TemplateName');

goog.require('Font');
goog.require('Hosting');
goog.require('Provider');
goog.require('VHost');
goog.require('PublicationOptions');

const DEBUG = false;

/**
 * Defines the entry point of Silex client application
 *
 */
exports.App = class App {


  /**
   * Entry point of Silex client application
   * create all views and models and controllers
   *
   */
  constructor() {

    // **
    // general initializations

    // polyfills
    silex.utils.Polyfills.init();

    /**
     * store the model instances
     * the model instances are passed to the controllers and the views
     * @type {!silex.types.Model}
     */
    this.model = new silex.types.Model();


    /**
     * store the view instances
     * the view instaces have access to the models and controllers
     * @type {!silex.types.View}
     */
    this.view = new silex.types.View();


    /**
     * store the controller instances
     * controller instances have access to the views and the models
     * @type {!silex.types.Controller}
     */
    this.controller = new silex.types.Controller();


    // create all the components of Silex app
    this.initView();
    this.initModel();
    this.initController();

    // init views now that controllers and model are instanciated
    this.view.workspace.buildUi();
    this.view.stage.buildUi();
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
      silex.utils.Notification.alert(
        'Your browser is not supported yet.<br><br>Considere using <a href="https://www.mozilla.org/firefox/" target="_blank">Firefox</a> or <a href="https://www.google.com/chrome/" target="_blank">chrome</a>.',
        () => {});
    }

    // Fixme: add a debug flag in the config + different configs depending on the build type
    console.warn('FIXME: add a debug flag in the config + different configs depending on the build type');
    if (!DEBUG) {
      // warning small screen size
      // height must be enough to view the settings pannel
      // width is just arbitrary
      const winSizeWidth = document.documentElement.clientWidth;
      const winSizeHeight = document.documentElement.clientHeight;
      const minWinSizeWidth = 950;
      const minWinSizeHeight = 630;
      if (winSizeHeight < minWinSizeHeight || winSizeWidth < minWinSizeWidth) {
        silex.utils.Notification.alert(
          `Your window is very small (${winSizeWidth}x${winSizeHeight}) and Silex may not display correctly.<br><br>Considere maximizing the window or use a bigger screen to use Silex at its best. A window size of ${minWinSizeWidth}x${minWinSizeHeight} is considered to be a acceptable.`,
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
      }
    );
  }

  initDebug() {
    console.warn('FIXME: add a debug flag in the config + different configs depending on the build type');
    if (DEBUG) {
      window['model'] = this.model;
      window['view'] = this.view;
      window['controller'] = this.controller;
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '/js/debug.js';
      document.body.appendChild(script);
    }

    // prevent accidental unload
    console.warn('FIXME: add a debug flag in the config + different configs depending on the build type');
    if (!DEBUG || silex.Config.debug.preventQuit) {
      this.view.workspace.startWatchingUnload();
    }
  }


  /**
   * creation of the view instances
   */
  initView() {
    // Stage
    var stageElement = (document.getElementsByClassName('silex-stage')[0]);
    /** @type {silex.view.Stage} */
    var stage = new silex.view.Stage(stageElement, this.model, this.controller);

    // Menu
     var menuElement = (document.getElementsByClassName('silex-menu')[0]);
    /** @type {silex.view.Menu} */
    var menu = new silex.view.Menu(menuElement, this.model, this.controller);

    // context menu
    var contextMenuElement = (document.getElementsByClassName(silex.view.ContextMenu.CLASS_NAME)[0]);
    /** @type {silex.view.ContextMenu} */
    var contextMenu = new silex.view.ContextMenu(contextMenuElement, this.model, this.controller);

    // bread crumbs
    var breadCrumbsElement = (document.getElementsByClassName('silex-bread-crumbs')[0]);
    /** @type {silex.view.BreadCrumbs} */
    var breadCrumbs = new silex.view.BreadCrumbs(breadCrumbsElement, this.model, this.controller);

    // PageTool
    var pageToolElement = (document.getElementsByClassName('silex-page-tool')[0]);
    /** @type {silex.view.PageTool} */
    var pageTool = new silex.view.PageTool(pageToolElement, this.model, this.controller);

    // HtmlEditor
    var htmlEditorElement = (document.getElementsByClassName('silex-html-editor')[0]);
    /** @type {HtmlEditor} */
    var htmlEditor = new HtmlEditor(htmlEditorElement, this.model, this.controller);

    // CssEditor
    var cssEditorElement = (document.getElementsByClassName('silex-css-editor')[0]);
    /** @type {CssEditor} */
    var cssEditor = new CssEditor(cssEditorElement, this.model, this.controller);

    // JsEditor
    var jsEditorElement = (document.getElementsByClassName('silex-js-editor')[0]);
    /** @type {JsEditor} */
    var jsEditor = new JsEditor(jsEditorElement, this.model, this.controller);

    // SettingsDialog
    var settingsDialogElement = (document.getElementsByClassName('silex-settings-dialog')[0]);
    /** @type {SettingsDialog} */
    var settingsDialog = new SettingsDialog(settingsDialogElement, this.model, this.controller);

    // Dashboard
    var dashboardElement = (document.getElementsByClassName('silex-dashboard')[0]);
    /** @type {Dashboard} */
    var dashboard = new Dashboard(dashboardElement, this.model, this.controller);

    // FileExplorer
    var fileExplorerElement = /** @type {!HTMLElement} */ (document.getElementById('silex-file-explorer'));
    /** @type {FileExplorer} */
    var fileExplorer = new FileExplorer(fileExplorerElement, this.model, this.controller);

    // PropertyTool
    var propertyToolElement = (document.getElementsByClassName('silex-property-tool')[0]);
    /** @type {silex.view.PropertyTool} */
    var propertyTool = new silex.view.PropertyTool(propertyToolElement, this.model, this.controller);

    // TextFormatBar
    var textFormatBarElement = (document.getElementsByClassName('silex-text-format-bar')[0]);
    /** @type {silex.view.TextFormatBar} */
    var textFormatBar = new TextFormatBar(textFormatBarElement, this.model, this.controller);

    // workspace
    var workspaceElement = (document.getElementsByClassName('silex-workspace')[0]);
    /** @type {silex.view.Workspace} */
    var workspace = new silex.view.Workspace(workspaceElement, this.model, this.controller);

    // add splitters
    var propSplitterElement = (document.getElementsByClassName('vertical-splitter')[0]);
    /** @type {silex.view.Splitter} */
    var propSplitter = new silex.view.Splitter(propSplitterElement, this.model, this.controller, () => workspace.resizeProperties());
    propSplitter.addLeft(contextMenuElement);
    propSplitter.addLeft(breadCrumbsElement);
    propSplitter.addLeft(stageElement);
    propSplitter.addRight(propertyToolElement);

    // init the view class which references all the views
    this.view.init(
        menu,
        contextMenu,
        breadCrumbs,
        stage,
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
        workspace
    );
  }


  /**
   * creation of the model classes
   * create the models to be passed to the controllers and the views
   */
  initModel() {
    // init the model class which references all the views
    this.model.init(
        new silex.model.File(this.model, this.view),
        new silex.model.Head(this.model, this.view),
        new silex.model.Body(this.model, this.view),
        new silex.model.Page(this.model, this.view),
        new silex.model.Element(this.model, this.view),
        new Component(this.model, this.view),
        new silex.model.Property(this.model, this.view),
        new DragSystem(this.model, this.view)
    );
  }


  /**
   * init the controller class with references to the views and the models
   */
  initController() {
    this.controller.init(
        new silex.controller.FileMenuController(this.model, this.view),
        new silex.controller.EditMenuController(this.model, this.view),
        new silex.controller.ViewMenuController(this.model, this.view),
        new silex.controller.InsertMenuController(this.model, this.view),
        new silex.controller.ToolMenuController(this.model, this.view),
        new ContextMenuController(this.model, this.view),
        new silex.controller.StageController(this.model, this.view),
        new silex.controller.PageToolController(this.model, this.view),
        new silex.controller.PropertyToolController(this.model, this.view),
        new silex.controller.SettingsDialogController(this.model, this.view),
        new silex.controller.HtmlEditorController(this.model, this.view),
        new silex.controller.CssEditorController(this.model, this.view),
        new silex.controller.JsEditorController(this.model, this.view),
        new TextEditorController(this.model, this.view)
    );
  }
};


// Ensures the symbol will be visible after compiler renaming
// which is required since index.html creates a silex.App instance
goog.exportSymbol('silex.App', exports.App);

// Also keep  goog.style unchanged since it is patched at runtime
// This fixes this issue: https://codereview.appspot.com/6115045/patch/1/2
// @see dist/client/js/closure-patches.js
goog.exportSymbol('goog.style', goog.style);

