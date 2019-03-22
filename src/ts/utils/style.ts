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
 * @fileoverview Helper class for common tasks
 *
 */

type GRgb = Array<number>;
var {GString} = goog.require("goog:goog.string");
var {GStyle} = goog.require("goog:goog.style");

import {Body} from '../model/body.js';
import {Component} from '../model/Component.js';
import {DragSystem} from '../model/DragSystem.js';
import {SilexElement} from '../model/element.js';
import {Head} from '../model/head.js';
import {Page} from '../model/page.js';

import {BreadCrumbs} from '../view/bread-crumbs.js';

export class Style {

  // constructor(){}

  /**
   * constant for the class names which are of internal use in Silex
   * they do not appear in the "css classes" text field of the style-pane
   */
  static SILEX_CLASS_NAMES: string[] = [
    Body.DRAGGING_CLASS_NAME, Body.DROP_CANDIDATE_CLASS_NAME,
    Body.PREVENT_DROPPABLE_CLASS_NAME, Body.PREVENT_RESIZABLE_CLASS_NAME,
    Body.PREVENT_DRAGGABLE_CLASS_NAME, Body.EDITABLE_CLASS_NAME,
    Head.ENABLE_MOBILE_CSS_CLASS, Page.PAGED_CLASS_NAME,
    Page.PAGED_HIDDEN_CLASS_NAME, Page.PAGED_VISIBLE_CLASS_NAME,
    Page.PAGEABLE_PLUGIN_READY_CLASS_NAME, Page.PAGE_LINK_ACTIVE_CLASS_NAME,
    SilexElement.SELECTED_CLASS_NAME, SilexElement.JUST_ADDED_CLASS_NAME,
    SilexElement.ELEMENT_CONTENT_CLASS_NAME,

    // useful to hide it when the content container of a section is selected
    SilexElement.TYPE_CONTAINER_CONTENT,
    // useful to hide it when the content container of a section is selected
    SilexElement.WEBSITE_WIDTH_CLASS_NAME, SilexElement.TYPE_CONTAINER + '-element',
    SilexElement.TYPE_SECTION + '-element', SilexElement.TYPE_IMAGE + '-element',
    SilexElement.TYPE_TEXT + '-element', SilexElement.TYPE_HTML + '-element',
    SilexElement.HIDE_ON_MOBILE, Component.COMPONENT_CLASS_NAME,
    BreadCrumbs.EDITABLE_STYLE_HOVER_CLASS,
    // sticky lines classes
    DragSystem.STUCK_CSS_CLASS, DragSystem.STUCK_LEFT_CSS_CLASS,
    DragSystem.STUCK_RIGHT_CSS_CLASS, DragSystem.STUCK_TOP_CSS_CLASS,
    DragSystem.STUCK_BOTTOM_CSS_CLASS
  ];

  /**
   * convert style object to object
   * with only the keys which are set
   */
  static styleToObject(styleObj: CSSStyleDeclaration): Object {
    let res = {};
    for (let idx = 0; idx < styleObj.length; idx++) {
      let styleName = styleObj[idx];
      res[styleName] = styleObj[styleName];
    }
    return res;
  }

  /**
   * convert style object to string
   */
  static styleToString(
      style: string|Object|CSSStyleDeclaration, opt_tab?: string): string {
    if (typeof style === 'string') {
      return style;
    }
    if (!opt_tab) {
      opt_tab = '';
    }
    let styleStr = '';
    for (let idx in style) {
      // filter the numerical indexes of a CSSStyleDeclaration object
      // filter initial values and shorthand properties
      if (style[idx] && typeof style[idx] === 'string' && style[idx] !== '' &&
          idx.match(/[^0-9]/)) {
        styleStr +=
            opt_tab + GString.toSelectorCase(idx) + ': ' + style[idx] + '; ';
      }
    }
    return styleStr;
  }

  /**
   * convert style string to object
   */
  static stringToStyle(styleStr: string): Object {
    return GStyle.parseStyleAttribute(styleStr);
  }

  /**
   * Compute background color
   * Takes the opacity of the backgrounds into account
   * Recursively compute parents background colors
   * @param element the element which bg color we want
   * @param contentWindow of the iframe containing the website
   * @return the element bg color
   */
  static computeBgColor(element: Element, contentWindow: Window): GRgb {
    let parentColorArray;

    // retrieve the parents blended colors
    if (element.parentNode && element.parentNode.nodeType === 1) {
      parentColorArray = Style.computeBgColor((element.parentNode as Element), contentWindow);
    } else {
      parentColorArray = null;
    }

    // rgba array
    let elementColorArray = null;
    let elementColorStr =
        contentWindow.getComputedStyle(element)['background-color'];
    if (elementColorStr) {
      // convert bg color from rgba to array
      if (elementColorStr.indexOf('rgba') >= 0) {
        // rgba case
        let alpha = parseFloat(elementColorStr.substring(
            elementColorStr.lastIndexOf(',') + 1,
            elementColorStr.lastIndexOf(')')));
        elementColorStr = elementColorStr.replace('rgba', 'rgb');
        elementColorStr =
            elementColorStr.substring(0, elementColorStr.lastIndexOf(',')) + ')';
        elementColorArray =
            goog.color.hexToRgb(goog.color.parse(elementColorStr).hex);
        elementColorArray.push(alpha);
      } else {
        if (elementColorStr.indexOf('transparent') >= 0) {
          // transparent case
          elementColorArray = null;
        } else {
          if (elementColorStr.indexOf('rgb') >= 0) {
            // rgb case
            elementColorArray =
                goog.color.hexToRgb(goog.color.parse(elementColorStr).hex);
            elementColorArray.push(1);
          } else {
            if (elementColorStr.indexOf('#') >= 0) {
              // hex case
              elementColorArray = goog.color.hexToRgb(elementColorStr);
              elementColorArray.push(1);
            } else {
              // handle all colors, including the named colors
              elementColorStr = GStyle.getBackgroundColor(element);

              // named color case
              elementColorArray =
                  goog.color.hexToRgb(goog.color.parse(elementColorStr).hex);
              elementColorArray.push(1);
            }
          }
        }
      }
    } else {
      console.warn('was not able to take the element bg color into account');
      elementColorArray = null;
    }
    let res: GRgb;

    // handle the case where there is no need to blend
    if (elementColorArray === null && parentColorArray === null) {
      // there is no need to blend
      res = null;
    } else {
      if (elementColorArray === null) {
        // there is no need to blend
        res = parentColorArray;
      } else {
        if (parentColorArray === null) {
          // there is no need to blend
          res = elementColorArray;
        } else {
          // blend the parents and the element's bg colors
          // f = (e*ae + p*(1-ae))
          let complement = 1 - elementColorArray[3];
          res = [
            elementColorArray[0] * elementColorArray[3] +
                parentColorArray[0] * complement,
            elementColorArray[1] * elementColorArray[3] +
                parentColorArray[1] * complement,
            elementColorArray[2] * elementColorArray[3] +
                parentColorArray[2] * complement,
            1
          ];
        }
      }
    }
    return res;
  }

  /**
   * convert hex color to rgba values
   * example: #000000FF will return rgba(0, 0, 0, 1)
   */
  static hexToRgba(hex: string): string {
    if (hex.indexOf('#') !== 0) {
      return hex;
    }
    if (hex.length !== 9) {
      console.error('Error in length ' + hex + ' - ' + hex.length);
      return hex;
    }
    let hexArr = Style.hexToArray(hex);
    let r = hexArr[0];
    let g = hexArr[1];
    let b = hexArr[2];
    let a = hexArr[3];
    let result = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    return result;
  }

  /**
   * convert rgba to array of values
   * example:    #000000FF will return [0, 0, 0, 1]
   */
  static hexToArray(hex: string): number[] {
    if (hex.indexOf('#') !== 0) {
      return null;
    }
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    let a = parseInt(hex.substring(6, 8), 16) / 255;
    let result = [r, g, b, a];
    return result;
  }

  /**
   * convert rgb to hex
   * example:    rgb(0, 0, 0) will return #000000
   */
  static rgbToHex(rgb: string): string {
    const hexWithA = Style.rgbaToHex(rgb);
    return hexWithA.substr(0, 7);
  }

  /**
   * convert rgba to hex
   * example:    rgba(0, 0, 0, 1) will return #000000FF
   */
  static rgbaToHex(rgba: string): string {
    // has to be rgb or rgba
    if (rgba.indexOf('rgb') !== 0) {
      return rgba;
    }

    // get the array version
    let rgbaArr = Style.rgbaToArray(rgba);
    let r = rgbaArr[0].toString(16);
    if (r.length < 2) {
      r = '0' + r;
    }
    let g = rgbaArr[1].toString(16);
    if (g.length < 2) {
      g = '0' + g;
    }
    let b = rgbaArr[2].toString(16);
    if (b.length < 2) {
      b = '0' + b;
    }
    let a = rgbaArr[3].toString(16);
    if (a.length < 2) {
      a = '0' + a;
    }
    let result = '#' + (r + g + b + a);
    return result;
  }

  /**
   * convert rgba to array of values
   * example:    rgba(0, 0, 0, 1) will return [0, 0, 0, 1]
   */
  static rgbaToArray(rgba: string): number[] {
    // not rgb nor rgba
    if (rgba.indexOf('rgb') !== 0) {
      return null;
    }
    if (rgba.indexOf('rgba') !== 0) {
      // rgb
      rgba = rgba.replace('rgb', '');
    } else {
      // rgba
      rgba = rgba.replace('rgba', '');
    }
    rgba = rgba.replace(' ', '');
    let rgbaArr = rgba.substring(1, rgba.length - 1).split(',');

    // add alpha if needed
    if (rgbaArr.length < 4) {
      rgbaArr.push('1');
    }
    let r = parseInt(rgbaArr[0], 10);
    let g = parseInt(rgbaArr[1], 10);
    let b = parseInt(rgbaArr[2], 10);
    let a = parseInt(rgbaArr[3], 10) * 255;
    let result = [r, g, b, a];
    return result;
  }
}
