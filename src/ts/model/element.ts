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
 * @fileoverview
 *   This class is used to manage Silex elements
 *   It has methods to manipulate the DOM elements
 *      created by new silex.model.SilexElement().createElement
 */
var {EventType} = goog.require("goog:goog.net.EventType");
var {ImageLoader} = goog.require("goog:goog.net.ImageLoader");
var {GString} = goog.require("goog:goog.string");

import { Model, View } from '../types';
import {Url} from '../utils/url';
import { TemplateName } from './Data';
import {Style} from '../utils/style';
import {Body} from '../model/body';
import {Dom} from '../utils/dom';


/**
 * direction in the dom
 */
export class DomDirection {
  static UP = 'UP';
  static DOWN = 'DOWN';
  static TOP = 'TOP';
  static BOTTOM = 'BOTTOM';
};

/**
 * @param model  model class which holds the other models
 * @param view  view class which holds the other views
 */
export class SilexElement {
  static INITIAL_ELEMENT_SIZE = 100;

  /**
   * constant for minimum elements size
   */
  static MIN_HEIGHT: number = 20;

  /**
   * constant for minimum elements size
   */
  static MIN_WIDTH: number = 20;

  /**
   * constant for loader on elements
   */
  static LOADING_ELEMENT_CSS_CLASS: string = 'loading-image';

  /**
   * constant for silex element type
   */
  static TYPE_CONTAINER: string = 'container';

  /**
   * constant for silex element type
   */
  static TYPE_SECTION: string = 'section';

  /**
   * constant for the content element of a section, which is also a container
   */
  static TYPE_CONTAINER_CONTENT: string = 'silex-container-content';

  /**
   * constant for silex element type
   */
  static TYPE_IMAGE: string = 'image';

  /**
   * constant for silex element type
   */
  static TYPE_TEXT: string = 'text';

  /**
   * constant for silex element type
   */
  static TYPE_HTML: string = 'html';

  /**
   * constant for silex element type
   */
  static TYPE_ATTR: string = 'data-silex-type';

  /**
   * constant for the class name of the element content
   */
  static ELEMENT_CONTENT_CLASS_NAME: string = 'silex-element-content';

  /**
   * constant for the class name of the default site width, rule is set when
   * setting is changed used to set a default width to section content container
   */
  static WEBSITE_WIDTH_CLASS_NAME: string = 'website-width';

  /**
   * constant for the attribute name of the links
   */
  static LINK_ATTR: string = 'data-silex-href';

  /**
   * constant for the class name of selected components
   */
  static SELECTED_CLASS_NAME: string = 'silex-selected';

  /**
   * constant for the class name of pasted components
   * this will be removed from the component as soon as it is dragged
   */
  static JUST_ADDED_CLASS_NAME: string = 'silex-just-added';

  /**
   * class for elements which are hidden in mobile version
   */
  static HIDE_ON_MOBILE: string = 'hide-on-mobile';

  /**
   * class for elements which are hidden in desktop version
   */
  static HIDE_ON_DESKTOP: string = 'hide-on-desktop';

  constructor(public model: Model, public view: View) {}

  /**
   * get num tabs
   * example: getTabs(2) returns '        '
   */
  getTabs(num: number): string {
    let tabs = '';
    for (let n = 0; n < num; n++) {
      tabs += '    ';
    }
    return tabs;
  }

  /**
   * for properties or style which are to be applied to elements
   * but in the case of a section not to the internal container, only the whole
   * section this method will return the element or the section when the element
   * is a section container
   */
  noSectionContent(element) {
    if (this.isSectionContent(element)) {
      return (element.parentNode as Element);
    }
    return element;
  }

  /**
   * get/set type of the element
   * @param element   created by silex, either a text box, image, ...
   * @return           the type of element
   * example: for a container this will return "container"
   */
  getType(element: Element): string {
    return element.getAttribute(SilexElement.TYPE_ATTR);
  }

  /**
   * @param element   created by silex
   * @return true if `element` is a an element's content (the element in an
   *     image, html box, section...)
   */
  isElementContent(element: Element): any {
    return element.classList.contains(SilexElement.ELEMENT_CONTENT_CLASS_NAME);
  }

  /**
   * @param element   created by silex
   * @return true if `element` is a section
   */
  isSection(element: Element): boolean {
    if (!element || !element.classList) {
      return false;
    }
    return element.classList.contains(SilexElement.TYPE_SECTION + '-element');
  }

  /**
   * @param element   created by silex
   * @return true if `element` is the content container of a section
   */
  isSectionContent(element: Element): boolean {
    if (!element || !element.classList) {
      return false;
    }

    // FIXME: this is a workaround, it happens in mobile editor, when
    // dragg/dropping (element is document)
    return element.classList.contains(SilexElement.TYPE_CONTAINER_CONTENT);
  }

  /**
   * get/set the "hide on mobile" property
   * @return true if the element is hidden on mobile
   */
  getHideOnMobile(element: Element): boolean {
    if (!element || !element.classList) {
      return false;
    }

    // FIXME: this is a workaround, it happens in mobile editor, when
    // dragg/dropping (element is document)
    return this.noSectionContent(element).classList.contains(
        SilexElement.HIDE_ON_MOBILE);
  }

  /**
   * get/set the "hide on mobile" property
   * @param hide, true if the element has to be hidden on mobile
   */
  setHideOnMobile(element: Element, hide: boolean) {
    if (hide) {
      this.noSectionContent(element).classList.add(SilexElement.HIDE_ON_MOBILE);
    } else {
      this.noSectionContent(element).classList.remove(SilexElement.HIDE_ON_MOBILE);
    }
  }

  /**
   * get/set the "hide on desktop" property
   * @return true if the element is hidden on desktop
   */
  getHideOnDesktop(element: Element): boolean {
    if (!element || !element.classList) {
      return false;
    }

    // FIXME: this is a workaround, it happens in mobile editor, when
    // dragg/dropping (element is document)
    return this.noSectionContent(element).classList.contains(
        SilexElement.HIDE_ON_DESKTOP);
  }

  /**
   * get/set the "hide on desktop" property
   * @param hide, true if the element has to be hidden on desktop
   */
  setHideOnDesktop(element: Element, hide: boolean) {
    if (hide) {
      this.noSectionContent(element).classList.add(SilexElement.HIDE_ON_DESKTOP);
    } else {
      this.noSectionContent(element).classList.remove(SilexElement.HIDE_ON_DESKTOP);
    }
  }

  /**
   * get all the element's styles
   * @param element   created by silex, either a text box, image, ...
   * @return           the styles of the element
   */
  getAllStyles(element: Element): string {
    let styleObject = this.model.property.getStyle(element);
    let styleStr = Style.styleToString(styleObject);
    return styleStr;
  }

  /**
   * get/set style of the element
   * @param element   created by silex, either a text box, image, ...
   * @param styleName  the style name
   * @return           the style of the element
   */
  getStyle(element: Element, styleName: string): string {
    const cssName = GString.toSelectorCase(styleName);
    const isMobile = this.view.workspace.getMobileEditor();
    let styleObject = this.model.property.getStyle(element, isMobile);
    if (styleObject && styleObject[cssName]) {
      return styleObject[cssName];
    } else {
      if (isMobile) {
        // get the non mobile style if it is not defined in mobile
        styleObject = this.model.property.getStyle(element, false);
        if (styleObject && styleObject[cssName]) {
          return styleObject[cssName];
        }
      }
    }
    return null;
  }

  /**
   * get/set style of element from a container created by silex
   * @param element            created by silex, either a text box, image, ...
   * @param  styleName          the style name, camel case, not css with dashes
   * @param  opt_styleValue     the value for this styleName
   * @param  opt_preserveJustAdded     if true, do not remove the "just added"
   *     css class, default is false
   */
  setStyle(
      element: Element, styleName: string, opt_styleValue?: string,
      opt_preserveJustAdded?: boolean) {
    // convert to css case
    styleName = GString.toSelectorCase(styleName);

    // remove the 'just pasted' class
    if (!opt_preserveJustAdded) {
      element.classList.remove(SilexElement.JUST_ADDED_CLASS_NAME);
    }

    // retrieve style
    let styleObject = this.model.property.getStyle(element);
    if (!styleObject) {
      styleObject = {};
    }

    // apply the new style
    if (styleObject[styleName] !== opt_styleValue) {
      if (goog.isDefAndNotNull(opt_styleValue)) {
        styleObject[styleName] = opt_styleValue;
      } else {
        styleObject[styleName] = '';
      }
      this.model.property.setStyle(element, styleObject);
    }
  }

  /**
   * get/set a property of an element from a container created by silex
   * @param element            created by silex, either a text box, image, ...
   * @param  propertyName          the property name
   * @param  opt_propertyValue     the value for this propertyName
   * @param  opt_applyToContent    apply to the element or to its
   *     ".silex-element-content" element
   * example: element.setProperty(imgElement, 'style', 'top: 5px; left: 30px;')
   */
  setProperty(
      element: Element, propertyName: string,
      opt_propertyValue?: string, opt_applyToContent?: boolean) {
    if (opt_applyToContent) {
      element = this.getContentNode(element);
    }
    if (goog.isDefAndNotNull(opt_propertyValue)) {
      element.setAttribute(propertyName, (opt_propertyValue as string));
    } else {
      element.removeAttribute(propertyName);
    }
  }

  /**
   * @param url    URL of the image chosen by the user
   */
  setBgImage(element: Element, url: string) {
    if (url) {
      this.setStyle(element, 'backgroundImage', Url.addUrlKeyword(url));
    } else {
      this.setStyle(element, 'backgroundImage');
    }

    // redraw tools
    this.model.body.setSelection(this.model.body.getSelection());
  }

  /**
   * get/set html from a container created by silex
   * @param element  created by silex, either a text box, image, ...
   * @return  the html content
   */
  getInnerHtml(element: Element): string {
    let innerHTML = this.getContentNode(element).innerHTML;

    // put back executable scripts
    innerHTML = Dom.reactivateScripts(innerHTML);
    return innerHTML;
  }

  /**
   * get/set element from a container created by silex
   * @param element  created by silex, either a text box, image, ...
   * @param innerHTML the html content
   */
  setInnerHtml(element: Element, innerHTML: string) {
    // get the container of the html content of the element
    let contentNode = this.getContentNode(element);

    // deactivate executable scripts
    innerHTML = Dom.deactivateScripts(innerHTML);

    // set html
    contentNode.innerHTML = innerHTML;
  }

  /**
   * get/set element from a container created by silex
   * @param element  created by silex, either a text box, image, ...
   * @return  the element which holds the content, i.e. a div, an image, ...
   */
  getContentNode(element: Element): Element {
    return element.querySelector(
               ':scope > .' + SilexElement.ELEMENT_CONTENT_CLASS_NAME) ||
        element;
  }

  /**
   * move the element up/down the DOM
   */
  move(element: Element, direction: DomDirection) {
    // do not move a section's container content, but the section itself
    element = this.noSectionContent(element);
    switch (direction) {
      case DomDirection.UP:
        let nextSibling = this.getNextElement(element, true);
        if (nextSibling) {
          // insert after
          element.parentNode.insertBefore(nextSibling, element);
        }
        break;
      case DomDirection.DOWN:
        let prevSibling = this.getNextElement(element, false);
        if (prevSibling) {
          // insert before
          element.parentNode.insertBefore(prevSibling, element.nextSibling);
        }
        break;
      case DomDirection.TOP:
        element.parentNode.appendChild(element);
        break;
      case DomDirection.BOTTOM:
        element.parentNode.insertBefore(
            element, element.parentNode.childNodes[0]);
        break;
    }

    // remove the 'just pasted' class
    element.classList.remove(SilexElement.JUST_ADDED_CLASS_NAME);
  }

  /**
   * get the previous or next element in the DOM, which is a Silex element
   * @param forward if true look for the next element, if false for the previous
   */
  getNextElement(element: Element, forward: boolean): Element {
    let node = (element as Node);
    while (node = forward ? node.nextSibling : node.previousSibling) {
      if (node.nodeType === 1) {
        const el = (node as Element);

        // candidates are the elements which are visible in the current page, or
        // visible everywhere (not paged)
        if (this.getType(el) !== null &&
            (this.model.page.isInPage(el) ||
             this.model.page.getPagesForElement(el).length === 0)) {
          return el;
        }
      }
    }
    return null;
  }

  /**
   * set/get the image URL of an image element
   * @param element  container created by silex which contains an image
   * @return  the url of the image
   */
  getImageUrl(element: Element): string {
    let url = '';
    if (element.getAttribute(SilexElement.TYPE_ATTR) === SilexElement.TYPE_IMAGE) {
      // get the image tag
      let img = this.getContentNode(element);
      if (img) {
        url = img.getAttribute('src');
      } else {
        console.error(
            'The image could not be retrieved from the element.', element);
      }
    } else {
      console.error('The element is not an image.', element);
    }
    return url;
  }

  /**
   * set/get the image URL of an image element
   * @param element  container created by silex which contains an image
   * @param url  the url of the image
   * @param opt_callback the callback to be notified when the image is loaded
   * @param opt_errorCallback the callback to be notified of errors
   */
  setImageUrl(
      element: Element, url: string,
      opt_callback?: ((p1: Element, p2: Element) => any),
      opt_errorCallback?: ((p1: Element, p2: string) => any)) {
    if (element.getAttribute(SilexElement.TYPE_ATTR) === SilexElement.TYPE_IMAGE) {
      // get the image tag
      const img = this.getContentNode(element) as HTMLImageElement;
      if (img) {
        // img.innerHTML = '';
        // listen to the complete event
        let imageLoader = new ImageLoader();
        goog.events.listenOnce(
            imageLoader, goog.events.EventType.LOAD, function(e: Event) {
              // handle the loaded image
              const loadedImg = e.target as HTMLImageElement;

              // update element size
              this.setStyle(
                  element, 'width',
                  Math.max(SilexElement.MIN_WIDTH, loadedImg.naturalWidth) + 'px', true);
              this.setStyle(
                  element, this.getHeightStyleName(element),
                  Math.max(SilexElement.MIN_HEIGHT, loadedImg.naturalHeight) + 'px', true);

              // callback
              if (opt_callback) {
                opt_callback(element, loadedImg);
              }

              // add the image to the element
              goog.dom.appendChild(element, loadedImg);

              // add a marker to find the inner content afterwards, with
              // getContent
              loadedImg.classList.add(SilexElement.ELEMENT_CONTENT_CLASS_NAME);

              // remove the id set by the loader (it needs it to know what has
              // already been loaded?)
              loadedImg.removeAttribute('id');

              // remove loading asset
              element.classList.remove(SilexElement.LOADING_ELEMENT_CSS_CLASS);

              // redraw tools
              this.model.body.setSelection(this.model.body.getSelection());
            }, true, this);
        goog.events.listenOnce(imageLoader, EventType.ERROR, function(e) {
          console.error(
              'An error occured while loading the image.', element, e);

          // callback
          if (opt_errorCallback) {
            opt_errorCallback(
                element, 'An error occured while loading the image.');
          }
        }, true, this);

        // add loading asset
        element.classList.add(SilexElement.LOADING_ELEMENT_CSS_CLASS);

        // remove previous img tag
        let imgTags = goog.dom.getElementsByTagNameAndClass(
            'img', SilexElement.ELEMENT_CONTENT_CLASS_NAME, element);
        if (imgTags.length > 0) {
          goog.dom.removeNode(imgTags[0]);
        }

        // load the image
        imageLoader.addImage(url, url);
        imageLoader.start();
      } else {
        console.error(
            'The image could not be retrieved from the element.', element);
        if (opt_errorCallback) {
          opt_errorCallback(
              element, 'The image could not be retrieved from the element.');
        }
      }
    } else {
      console.error('The element is not an image.', element);
      if (opt_errorCallback) {
        opt_errorCallback(element, 'The element is not an image.');
      }
    }
  }

  /**
   * remove a DOM element
   * @param element   the element to remove
   */
  removeElement(element: Element) {
    // never delete sections container content, but the section itself
    element = this.noSectionContent(element);

    // check this is allowed, i.e. an element inside the stage container
    if (this.model.body.getBodyElement() !== element &&
        goog.dom.contains(this.model.body.getBodyElement(), element)) {
      // remove style and component data
      this.model.property.setElementComponentData(element);
      this.model.property.setStyle(element, null, true);
      this.model.property.setStyle(element, null, false);

      // remove the element
      goog.dom.removeNode(element);
    } else {
      console.error(
          'could not delete', element,
          'because it is not in the stage element');
    }
  }

  /**
   * append an element to the stage
   * handles undo/redo
   */
  addElement(container: Element, element: Element) {
    // for sections, force body
    if (this.isSection(element)) {
      container = this.model.body.getBodyElement();
    }
    goog.dom.appendChild(container, element);

    // add the class to keep the element above all others
    element.classList.add(SilexElement.JUST_ADDED_CLASS_NAME);

    // resize the body
    // call the method defined in front-end.js
    // this will resize the body according to its content
    // it will also trigger a "silex.resize" event
    this.model.file.getContentWindow()['silex']['resizeBody']();
  }

  /**
   * add an element at the center of the stage
   * and move it into the container beneeth it
   * @param element    the element to add
   * @param opt_offset an offset to apply to its position (x and y)
   */
  addElementDefaultPosition(element: Element, opt_offset?: number) {
    opt_offset = opt_offset || 0;

    // find the container (main background container or the stage)
    const stageSize = this.view.stage.getStageSize();
    const bb = this.model.property.getBoundingBox([element]);
    const posX = Math.round(stageSize.width / 2 - bb.width / 2);
    const posY = 100;
    const container = this.getBestContainerForNewElement(posX, posY);

    // take the scroll into account (drop at (100, 100) from top left corner of
    // the window, not the stage)
    const bbContainer = goog.style.getBounds(container);
    console.warn('TODO: check that this has left and top:', bbContainer);
    const offsetX = posX + this.view.stage.getScrollX() - bbContainer['left'];
    const offsetY = posY + this.view.stage.getScrollY() - bbContainer['top'];

    // add to stage
    this.addElement(container, element);

    // apply the style (force desktop style, not mobile)
    const styleObject = this.model.property.getStyle(element, false);
    styleObject.top = opt_offset + offsetY + 'px';
    styleObject.left = opt_offset + offsetX + 'px';
    this.model.property.setStyle(element, styleObject, false);
  }

  /**
   * find the best drop zone at a given position
   * NEW: drop in the body directly since containers have their own z-index
   *      and the element is partly hidden sometimes if we drop it in a
   * container
   * @param x position in px
   * @param y position in px
   * @return the container element under (x, y)
   */
  getBestContainerForNewElement(x: number, y: number): Element {
    // let dropZone = this.view.stage.getDropZone(x, y) || {'element':
    // this.model.body.getBodyElement(), 'zIndex': 0}; return dropZone.element;
    return this.model.body.getBodyElement();
  }

  /**
   * init the element depending on its type
   */
  initElement(element: Element) {
    // default style
    let defaultStyle = {};
    defaultStyle['width'] = SilexElement.INITIAL_ELEMENT_SIZE + 'px';
    defaultStyle[this.getHeightStyleName(element)] =
        SilexElement.INITIAL_ELEMENT_SIZE + 'px';

    // init the element depending on its type
    switch (this.getType(element)) {
      case SilexElement.TYPE_CONTAINER:
      case SilexElement.TYPE_HTML:
        if (!this.isSection(element)) {
          defaultStyle['background-color'] = 'rgb(255, 255, 255)';
        }
        break;
      case SilexElement.TYPE_TEXT:
      case SilexElement.TYPE_IMAGE:
        break;
    }

    // special case of section content
    if (this.isSectionContent(element)) {
      // no bg color for the content container
      defaultStyle['background-color'] = '';

      // no width either, it will take the .website-width
      // the default one from front-end.css or the one in the settings
      defaultStyle['width'] = '';
    }

    // send the scroll to the target
    this.view.stage.setScrollTarget(element);

    // default style to the element style
    // keep the style if there is one, usually set by component::initComponent
    const finalStyle = this.model.property.getStyle(element, false) || {};
    for (let name in defaultStyle) {
      finalStyle[name] = finalStyle[name] || defaultStyle[name];
    }

    // apply the style (force desktop style, not mobile)
    this.model.property.setStyle(element, finalStyle, false);

    // add the element to the stage
    if (this.isSection(element)) {
      this.addElement(this.model.body.getBodyElement(), element);
    } else {
      if (!this.isElementContent(element)) {
        // add to the stage at the right position
        // and in the right container
        this.addElementDefaultPosition(element);
      }
    }

    // set element editable
    this.initUiHandles(element);
  }

  /**
   * Add UI to resize elements. This is usually done on the server side but when
   * the client side adds an element it does add UIs itself.
   */
  initUiHandles(element: Element) {
      [
        'ui-resizable-n', 'ui-resizable-s', 'ui-resizable-e',
        'ui-resizable-w', 'ui-resizable-ne', 'ui-resizable-nw',
        'ui-resizable-se', 'ui-resizable-sw'
      ].forEach((className) => {
          let handle =
              this.model.file.getContentDocument().createElement('div');
          handle.classList.add(className);
          handle.classList.add('ui-resizable-handle');
          goog.dom.appendChild(element, handle);
        });
  }

  /**
   * element creation
   * create a DOM element, attach it to this container
   * and returns a new component for the element
   * @param type  the type of the element to create,
   *    see TYPE_* constants of the class @see silex.model.SilexElement
   * @return   the newly created element
   */
  createElement(type: string): Element {
    // create the element
    let element = null;
    switch (type) {
      // container
      case SilexElement.TYPE_CONTAINER:
        element = this.createContainerElement();
        break;

      // section
      case SilexElement.TYPE_SECTION:
        element = this.createSectionElement();
        break;

      // text
      case SilexElement.TYPE_TEXT:
        element = this.createTextElement();
        break;

      // HTML box
      case SilexElement.TYPE_HTML:
        element = this.createHtmlElement();
        break;

      // Image
      case SilexElement.TYPE_IMAGE:
        element = this.createImageElement();
        break;
    }

    // init the element
    element.classList.add(Body.EDITABLE_CLASS_NAME);
    this.model.property.initSilexId(
        element, this.model.file.getContentDocument());

    // add css class for Silex styles
    element.classList.add(type + '-element');

    // return the element
    return element;
  }

  /**
   * element creation method for a given type
   * called from createElement
   */
  createContainerElement(): Element {
    // create the conatiner
    let element = goog.dom.createElement('div');
    element.setAttribute(SilexElement.TYPE_ATTR, SilexElement.TYPE_CONTAINER);
    return element;
  }

  createElementWithContent(className: string): Element {
    // create the element
    let element = goog.dom.createElement('div');
    element.setAttribute(SilexElement.TYPE_ATTR, className);

    // create the container for text content
    let content = goog.dom.createElement('div');

    // add empty content
    goog.dom.appendChild(element, content);

    // add a marker to find the inner content afterwards, with getContent
    content.classList.add(SilexElement.ELEMENT_CONTENT_CLASS_NAME);

    // done
    return element;
  }

  /**
   * element creation method for a given type
   * called from createElement
   */
  createSectionElement(): Element {
    // create the element
    let element = goog.dom.createElement('div');
    element.setAttribute(SilexElement.TYPE_ATTR, SilexElement.TYPE_CONTAINER);
    element.classList.add(Body.PREVENT_DRAGGABLE_CLASS_NAME);
    element.classList.add(SilexElement.TYPE_CONTAINER + '-element');

    // content element is both a container and a content element
    let content = this.createElement(SilexElement.TYPE_CONTAINER);
    content.classList.add(SilexElement.ELEMENT_CONTENT_CLASS_NAME);
    content.classList.add(SilexElement.TYPE_CONTAINER_CONTENT);
    content.classList.add(SilexElement.WEBSITE_WIDTH_CLASS_NAME);
    content.classList.add(Body.PREVENT_DRAGGABLE_CLASS_NAME);
    element.appendChild(content);
    this.initElement(content);

    // done
    return element;
  }

  /**
   * element creation method for a given type
   * called from createElement
   */
  createTextElement(): Element {
    // create the element
    let element = this.createElementWithContent(SilexElement.TYPE_TEXT);

    // add default content
    let content = this.getContentNode(element);
    content.innerHTML = '<p>New text box</p>';

    // add normal class for default text formatting
    // sometimes there is only in text node in content
    // e.g. whe select all + remove formatting
    content.classList.add('normal');

    // done
    return element;
  }

  /**
   * element creation method for a given type
   * called from createElement
   */
  createHtmlElement(): Element {
    // create the element
    let element = goog.dom.createElement('div');
    element.setAttribute(SilexElement.TYPE_ATTR, SilexElement.TYPE_HTML);

    // create the container for html content
    let htmlContent = goog.dom.createElement('div');
    htmlContent.innerHTML = '<p>New HTML box</p>';
    goog.dom.appendChild(element, htmlContent);

    // add a marker to find the inner content afterwards, with getContent
    htmlContent.classList.add(SilexElement.ELEMENT_CONTENT_CLASS_NAME);
    return element;
  }

  /**
   * element creation method for a given type
   * called from createElement
   */
  createImageElement(): Element {
    // create the element
    let element = goog.dom.createElement('div');
    element.setAttribute(SilexElement.TYPE_ATTR, SilexElement.TYPE_IMAGE);
    return element;
  }

  /**
   * set/get a "silex style link" on an element
   * @param opt_link an URL
   *         or an internal link (beginning with #!)
   *         or null to remove the link
   */
  setLink(element: Element, opt_link?: string) {
    if (opt_link) {
      element.setAttribute(SilexElement.LINK_ATTR, opt_link);
    } else {
      element.removeAttribute(SilexElement.LINK_ATTR);
    }
  }

  /**
   * set/get a "silex style link" on an element
   */
  getLink(element: Element): string {
    return element.getAttribute(SilexElement.LINK_ATTR);
  }

  /**
   * get/set class name of the element of a container created by silex
   * remove all silex internal classes
   * @param element   created by silex, either a text box, image, ...
   * @return           the value for this styleName
   */
  getClassName(element: Element): string {
    const pages = this.model.page.getPages();
    let componentCssClasses = [];
    if (this.model.component.isComponent(element)) {
      const templateName =
          (this.model.property.getElementComponentData(
               element)['templateName'] as TemplateName);
      componentCssClasses = this.model.component.getCssClasses(templateName);
    }
    return element.className.split(' ')
        .filter((name) => {
          if (name === '' ||
              Style.SILEX_CLASS_NAMES.indexOf(name) > -1 ||
              pages.indexOf(name) > -1 ||
              componentCssClasses.indexOf(name) > -1 ||
              this.model.property.getSilexId(element) === name) {
            return false;
          }
          return true;
        })
        .join(' ');
  }

  /**
   * get/set class name of the element of a container created by silex
   * remove all silex internal classes
   * @param element   created by silex, either a text box, image, ...
   * @param opt_className  the class names, or null to reset
   */
  setClassName(element: Element, opt_className?: string) {
    // compute class names to keep, no matter what
    // i.e. the one which are in element.className + in Silex internal classes
    let pages = this.model.page.getPages();
    let classNamesToKeep =
        element.className.split(' ').map((name) => {
          if (Style.SILEX_CLASS_NAMES.indexOf(name) > -1 ||
              pages.indexOf(name) > -1 ||
              this.model.property.getSilexId(element) === name) {
            return name;
          }
        });

    // reset element class name
    element.className = classNamesToKeep.join(' ');
    if (opt_className) {
      // apply classes from opt_className
      opt_className.split(' ').forEach((name) => {
        name = name.trim();
        if (name && name !== '') {
          element.classList.add(name);
        }
      });
    }
  }

  /**
   * get the name of the style to be used to set the height of the element
   * returns 'height' or 'minHeight' depending on the element type
   * @return 'height' or 'minHeight' depending on the element type
   */
  getHeightStyleName(element: Element): string {
    if (element.classList.contains(Body.SILEX_USE_HEIGHT_NOT_MINHEIGHT)) {
      return 'height';
    }
    return 'min-height';
  }
}
