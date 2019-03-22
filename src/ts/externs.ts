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
 * @fileoverview define externs for libs used in Silex
 */

import { ComponentData } from './model/Data.js';

/**
 * @typedef {{
 *          faIconClass:?string,
 *          initialCss:?Array,
 *          initialCssContentContainer:?Array,
 *          initialCssClass:?Array,
 *          baseElement:?string,
 *          name:?string,
 *          category:?string,
 *          isPrivate:?boolean
 *          }}
 */
export interface ProdotypeCompDef {
  faIconClass?: string,
  initialCss?: Array<any>,
  initialCssContentContainer?: Array<any>,
  initialCssClass?: Array<any>,
  baseElement?: string,
  name?: string,
  category?: string,
  isPrivate?: boolean
};


/**
 * Prodotype
 * @see https://github.com/lexoyo/Prodotype
 * @constructor
 */
export interface Prodotype {
  componentsDef: ProdotypeCompDef;
  constructor(container, rootPath);
  decorate(templateName: string, data: any);
  ready(cbk: (any) => void);
  edit(
    data?:any,
    list?: Array<ComponentData>,
    templateName?: string,
    events?: any);
  reset();
  createName(type, list):string;
  getMissingDependencies(
    container: Element,
    componentNames:Array<{templateName:string}>
  ): Array<Element>;
  getUnusedDependencies(dependencyElements:Array<Element>, componentNames: Array<{templateName:string}>);
}


/**
 * @type {Array.<Array.<string|number>>}
 */
export var _paq = [];


/**
 * piwik analytics
 * @constructor
 */
export interface Piwik {
  // static getAsyncTracker(): Piwik;
  constructor();
  trackEvent(c: string, d: string, e?: string, f?: number);
}

/**
 * jquery externs
 */
export interface JQuery {
  editable(options);
  pageable(option, value);
};


/**
 * cloud explorer externs
 */
export interface CloudExplorer {
  getServices(): Promise<any>;
  openFile(extensions): Promise<any>;
  openFiles(extensions): Promise<any>;
  openFolder(): Promise<any>;
  write(data, blob): Promise<any>;
  read(blob): Promise<any>;
  saveAs(defaultFileName, extensions): Promise<any>;
};


/**
 * unifile externs
 */
export interface UnifileResponse {
   success: boolean,
   message?: string,
   tempLink?: string,
   code?: string,
 };


/**
 * wysihtml library
 */
export var wysihtml:any;

// export declare var wysihtml:WysiHtml;
// export declare class wysihtml {
//   public static Editor: any;
// }
export interface WysiHtmlEditor {
  constructor(el: Element, options);
  focus(changePosition);
  on(eventName, cbk);
  composer: WysiHtmlComposer;
  destroy();
}
interface WysiHtmlComposer {
  commands: WysiHtmlCommand;
}
interface WysiHtmlCommand {
  exec(cmd: string, options?: any);
};

export type wysihtmlParserRules = Object;


// now as typescript declaration file

// /**
//  * ace externs
//  * @type {Object.<*>}
//  */
// interface Ace {
//   public static edit(el: Element);
//   renderer;
//   setKeyboardHandler(keyboardHandler: string);
//   getKeyboardHandler(): string;
//   setSession(session);
//   getSession(): AceSession;
//   setValue(val: string, cursorPos?: number);
//   getValue(): string;
//   getSelection(): string;
//   resize(force);
//   setTheme(theme);
//   getTheme();
//   setStyle(style);
//   unsetStyle(style);
//   getFontSize();
//   setFontSize(size);
//   focus();
//   isFocused();
//   blur();
//   onFocus();
//   onBlur();
//   onDocumentChange(e);
//   onCursorChange();
//   getSelectedText();
//   getCopyText();
//   onCopy();
//   onCut();
//   onPaste(text);
//   insert(text);
//   setOverwrite(overwrite);
//   getOverwrite();
//   toggleOverwrite();
//   setScrollSpeed(speed);
//   getScrollSpeed();
//   setDragDelay(dragDelay);
//   getDragDelay();
//   setSelectionStyle(style);
//   getSelectionStyle();
//   setHighlightActiveLine(shouldHighlight);
//   getHighlightActiveLine();
//   setHighlightSelectedWord(shouldHighlight);
//   getHighlightSelectedWord();
//   setShowInvisibles(showInvisibles);
//   getShowInvisibles();
//   setShowPrintMargin(showPrintMargin);
//   getShowPrintMargin();
//   setPrintMarginColumn(showPrintMargin);
//   getPrintMarginColumn();
//   setReadOnly(readOnly);
//   getReadOnly();
//   setBehavioursEnabled(enabled);
//   getBehavioursEnabled();
//   setWrapBehavioursEnabled(enabled);
//   getWrapBehavioursEnabled();
//   setShowFoldWidgets(show);
//   getShowFoldWidgets();
//   remove(dir);
//   removeWordRight();
//   removeWordLeft();
//   removeToLineStart();
//   removeToLineEnd();
//   splitLine();
//   transposeLetters();
//   toLowerCase();
//   toUpperCase();
//   indent();
//   blockIndent();
//   blockOutdent();
//   toggleCommentLines();
//   getnumberAt(row, column);
//   modifynumber(amount);
//   removeLines();
//   moveLinesDown();
//   moveLinesUp();
//   moveText(range, toPosition, copy);
//   copyLinesUp();
//   copyLinesDown();
//   $moveLines(mover);
//   $getSelectedRows();
//   getFirstVisibleRow();
//   getLastVisibleRow();
//   isRowVisible(row);
//   isRowFullyVisible(row);
//   $getVisibleRowCount();
//   selectPageDown();
//   selectPageUp();
//   gotoPageDown();
//   gotoPageUp();
//   scrollPageDown();
//   scrollPageUp();
//   scrollToRow(row);
//   scrollToLine(line, center, animate, callback);
//   centerSelection();
//   getCursorPosition();
//   getCursorPositionScreen();
//   getSelectionRange();
//   selectAll();
//   clearSelection();
//   moveCursorTo(row, column);
//   moveCursorToPosition(pos);
//   jumpToMatching(select);
//   gotoLine(linenumber, column, animate);
//   navigateTo(row, column);
//   navigateUp(times);
//   navigateDown(times);
//   navigateLeft(times);
//   navigateRight(times);
//   navigateLineStart();
//   navigateLineEnd();
//   navigateFileEnd();
//   navigateFileStart();
//   navigateWordRight();
//   navigateWordLeft();
//   replace(replacement, options);
//   replaceAll(replacement, options);
//   getLastSearchOptions();
//   find(needle, options, animate);
//   findNext(options, animate);
//   findPrevious(options, animate);
//   undo();
//   redo();
//   destroy();
//   setAutoScrollEditorIntoView(enable);
//   setOptions(opts);
// }
// interface AceSession {
//   on(event: string, cbk: (Object) => void);
//   setMode(string);
// };

// now as typescript declaration file

// /**
//  * @type {Object.<*>}
//  */
// var alertify =;
// /**
//  * @param {string} message
//  */
// alertify.success = function (message);
// /**
//  * @param {*} config
//  */
// alertify.set = function (config);
// /**
//  * ask for a text
//  * @param {string} message
//  * @param {function(?boolean, ?string)} cbk
//  * @param {?string=} opt_okLabel
//  * @param {?string=} opt_cancelLabel
//  * @param {?string=} opt_text
//  */
// alertify.alert = function (message, cbk, opt_okLabel, opt_cancelLabel, opt_text);
// /**
//  * ask for a text
//  * @param {string} message
//  * @param {function(?boolean, ?string)} cbk
//  * @param {?string=} opt_okLabel
//  * @param {?string=} opt_cancelLabel
//  * @param {?string=} opt_text
//  */
// alertify.prompt = function (message, cbk, opt_okLabel, opt_cancelLabel, opt_text);
// /**
//  * ask for a text
//  * @param {string} message
//  * @param {function(?boolean, ?string)} cbk
//  * @param {?string=} opt_okLabel
//  * @param {?string=} opt_cancelLabel
//  * @param {?string=} opt_text
//  */
// alertify.confirm = function (message, cbk, opt_okLabel, opt_cancelLabel, opt_text);
// /**
//  * @param {string} message
//  */
// alertify.error = function (message);
// /**
//  * @param {string} message
//  */
// alertify.log = function (message);

