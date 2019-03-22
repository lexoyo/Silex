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
 * @fileoverview This file contains the definitions of the Model, View and
 * Controller structures
 *
 */
import { ContextMenuController } from './controller/context-menu-controller.js';
import { CssEditorController } from './controller/css-editor-controller.js';
import { EditMenuController } from './controller/edit-menu-controller.js';
import { FileMenuController } from './controller/file-menu-controller.js';
import { HtmlEditorController } from './controller/html-editor-controller.js';
import { InsertMenuController } from './controller/insert-menu-controller.js';
import { JsEditorController } from './controller/js-editor-controller.js';
import { PageToolController } from './controller/page-tool-controller.js';
import { PropertyToolController } from './controller/property-tool-controller.js';
import { SettingsDialogController } from './controller/settings-dialog-controller.js';
import { StageController } from './controller/stage-controller.js';
import { TextEditorController } from './controller/text-editor-controller.js';
import { ToolMenuController } from './controller/tool-menu-controller.js';
import { ViewMenuController } from './controller/view-menu-controller.js';
import { Body } from './model/body.js';
import { Component } from './model/Component.js';
import { ComponentData } from './model/Data.js';
import { DragSystem } from './model/DragSystem.js';
import { SilexElement } from './model/element.js';
import { File } from './model/file.js';
import { Head } from './model/head.js';
import { Page } from './model/page.js';
import { Property } from './model/property.js';
import { BreadCrumbs } from './view/bread-crumbs.js';
import { ContextMenu } from './view/context-menu.js';
import { CssEditor } from './view/dialog/css-editor.js';
import { Dashboard } from './view/dialog/Dashboard.js';
import { FileExplorer } from './view/dialog/file-explorer.js';
import { HtmlEditor } from './view/dialog/html-editor.js';
import { JsEditor } from './view/dialog/js-editor.js';
import { SettingsDialog } from './view/dialog/settings-dialog.js';
import { Menu } from './view/menu.js';
import { PageTool } from './view/page-tool.js';
import { PropertyTool } from './view/property-tool.js';
import { Splitter } from './view/splitter.js';
import { Stage } from './view/stage.js';
import { TextFormatBar } from './view/TextFormatBar.js';
import { Workspace } from './view/workspace.js';

/**
 * warning: if you change that type, also change the default value in LinkDialog
 */
export type LinkData = {
  href?: string,
  target?: string,
  title?: string,
  rel?: string,
  type?: string,
  download?: string
};
export enum StickyPoint {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}
// MID_V: 'midV',
// MID_H: 'midH',
export type StickyLine = {
  id: string,
  vertical: boolean,
  position: number,
  stickyPoint: StickyPoint,
  metaData: any
};
export type Font = {
  family: string,
  href: string
};
export type Hosting = {
  providers: Provider[],
  skipHostingSelection: boolean
};
export type Provider = {
  name: string,
  displayName: string,
  isLoggedIn: boolean,
  authorizeUrl: string,
  dashboardUrl: string,
  pleaseCreateAVhost: string,
  vhostsUrl: string,
  buyDomainUrl: string,
  skipVhostSelection: boolean,
  skipFolderSelection: boolean,
  afterPublishMessage: string
};
export type VHost = {
  name: string,
  domainUrl: string,
  skipDomainSelection: boolean,
  publicationPath: FileInfo
};
export type PublicationOptions = {
  file: FileInfo,
  publicationPath: FileInfo,
  provider: Provider
};
export type UndoItem = {
  page: string,
  html: string,
  scrollX: number,
  scrollY: number
};
export interface ClipboardItem {
  element:Element;
  style: Object;
  mobileStyle: Object;
  componentData: ComponentData;
  children: Array<ClipboardItem>
}

/**
 * @struct
 */
export class Model {
  file: File;
  head: Head;
  body: Body;
  page: Page;
  element: SilexElement;
  component: Component;
  property: Property;
  dragSystem: DragSystem;

  /**
   * store references
   */
  init(
      file: File, head: Head, body: Body, page: Page, element: SilexElement,
      component: Component, property: Property, dragSystem: DragSystem) {
    this.file = file;
    this.head = head;
    this.body = body;
    this.page = page;
    this.element = element;
    this.component = component;
    this.property = property;
    this.dragSystem = dragSystem;
  }
}

/**
 * @struct
 */
export class Controller {
  fileMenuController: FileMenuController;
  editMenuController: EditMenuController;
  viewMenuController: ViewMenuController;
  insertMenuController: InsertMenuController;
  toolMenuController: ToolMenuController;
  contextMenuController: ContextMenuController;
  stageController: StageController;
  pageToolController: PageToolController;
  propertyToolController: PropertyToolController;
  settingsDialogController: SettingsDialogController;
  htmlEditorController: HtmlEditorController;
  cssEditorController: CssEditorController;
  jsEditorController: JsEditorController;
  textEditorController: TextEditorController;

  /**
   * store references
   */
  init(
      fileMenuController: FileMenuController,
      editMenuController: EditMenuController,
      viewMenuController: ViewMenuController,
      insertMenuController: InsertMenuController,
      toolMenuController: ToolMenuController,
      contextMenuController: ContextMenuController,
      stageController: StageController, pageToolController: PageToolController,
      propertyToolController: PropertyToolController,
      settingsDialogController: SettingsDialogController,
      htmlEditorController: HtmlEditorController,
      cssEditorController: CssEditorController,
      jsEditorController: JsEditorController,
      textEditorController: TextEditorController) {
    this.fileMenuController = fileMenuController;
    this.editMenuController = editMenuController;
    this.viewMenuController = viewMenuController;
    this.insertMenuController = insertMenuController;
    this.toolMenuController = toolMenuController;
    this.contextMenuController = contextMenuController;
    this.stageController = stageController;
    this.pageToolController = pageToolController;
    this.propertyToolController = propertyToolController;
    this.settingsDialogController = settingsDialogController;
    this.htmlEditorController = htmlEditorController;
    this.cssEditorController = cssEditorController;
    this.jsEditorController = jsEditorController;
    this.textEditorController = textEditorController;
  }
}

/**
 * @struct
 */
export class View {
  menu: Menu;
  contextMenu: ContextMenu;
  breadCrumbs: BreadCrumbs;
  stage: Stage;
  pageTool: PageTool;
  propertyTool: PropertyTool;
  textFormatBar: TextFormatBar;
  htmlEditor: HtmlEditor;
  cssEditor: CssEditor;
  jsEditor: JsEditor;
  fileExplorer: FileExplorer;
  settingsDialog: SettingsDialog;
  dashboard: Dashboard;
  propSplitter: Splitter;
  workspace: Workspace;

  /**
   * store references
   */
  init(
      menu: Menu, contextMenu: ContextMenu, breadCrumbs: BreadCrumbs,
      stage: Stage, pageTool: PageTool, propertyTool: PropertyTool,
      textFormatBar: TextFormatBar, htmlEditor: HtmlEditor,
      cssEditor: CssEditor, jsEditor: JsEditor, fileExplorer: FileExplorer,
      settingsDialog: SettingsDialog, dashboard: Dashboard,
      propSplitter: Splitter, workspace: Workspace) {
    this.menu = menu;
    this.contextMenu = contextMenu;
    this.breadCrumbs = breadCrumbs;
    this.stage = stage;
    this.pageTool = pageTool;
    this.propertyTool = propertyTool;
    this.textFormatBar = textFormatBar;
    this.htmlEditor = htmlEditor;
    this.cssEditor = cssEditor;
    this.jsEditor = jsEditor;
    this.fileExplorer = fileExplorer;
    this.settingsDialog = settingsDialog;
    this.dashboard = dashboard;
    this.propSplitter = propSplitter;
    this.workspace = workspace;
  }
}

/////////////////////////////
// from externs
export type FileInfo = {
  url: string,
  path: string,
  folder: string,
  service: string,
  size: number,
  // modified: string,
  name: string,
  isDir: boolean,
  mime: string,
  absPath: string,
  lastModified: string,
  lastModifiedDate: Date,
  type: string,
};
