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
 *   This class represents a the page model of the html file being edited
 *   It has methods to manipulate the pages
 *
 */
import { Model, View } from '../types';
import { SilexNotification } from '../utils/notification';
import { Stage } from '../view/stage';

/**
 * structure to store all of a page data
 * @struct
 */
export class PageData {
  name: string = '';
  displayName: string = '';
  linkName: string = '';
  idx: number = -1;
}

/**
 * @param model  model class which holds the other models
 * @param view  view class which holds the other views
 */
export class Page {
  /**
   * constant for the class name of the pages
   */
  static PAGE_CLASS_NAME: string = 'page-element';

  /**
   * constant for the class name of elements visible only on some pages
   */
  static PAGED_CLASS_NAME: string = 'paged-element';

  /**
   * constant for the class name set on the body when the pageable plugin is
   * initialized
   */
  static PAGEABLE_PLUGIN_READY_CLASS_NAME: string = 'pageable-plugin-created';

  /**
   * constant for the class name of elements visible only on some pages
   */
  static PAGED_HIDDEN_CLASS_NAME: string = 'paged-element-hidden';

  /**
   * constant for the class name of element containing the pages
   */
  static PAGES_CONTAINER_CLASS_NAME: string = 'silex-pages';

  /**
   * constant for the class name of elements when it is in a visible page
   * this css class is set in pageable.js
   */
  static PAGED_VISIBLE_CLASS_NAME: string = 'paged-element-visible';

  /**
   * constant for the class name of links when it links to a visible page
   * this css class is set in pageable.js
   */
  static PAGE_LINK_ACTIVE_CLASS_NAME: string = 'page-link-active';

  // retrieve the element which will hold the body of the opened file
  iframeElement: any;

  constructor(public model: Model, public view: View) {
    this.iframeElement = document.querySelector('.' + Stage.STAGE_CLASS_NAME);
  }

  /**
   * retrieve the first parent which is visible only on some pages
   * @return null or the element or one of its parents which has the css class
   *     silex.model.Page.PAGED_CLASS_NAME
   */
  getParentPage(element: Element): Element {
    if (this.model.element.isSectionContent(element)) {
      element = (element.parentNode as Element);
    }
    let parent = element.parentNode as Element;
    while (parent && !parent.classList.contains(Page.PAGED_CLASS_NAME)) {
      parent = parent.parentNode as Element;
    }
    return (parent as Element | null);
  }

  /**
   * get the pages from the dom
   * @return an array of the page names I have found in the DOM
   */
  getPages(): string[] {
    // retrieve all page names from the head section
    const pages = [];
    const bodyElement = this.model.body.getBodyElement();
    if (!bodyElement) {
      console.warn('Can not get pages, the body element is null');
      return [];
    }
    const elements = bodyElement.querySelectorAll('a[data-silex-type="page"]');
    elements.forEach((element) => {
      pages.push(element.getAttribute('id'));
    });
    return pages;
  }

  /**
   * get the currently opened page from the dom
   * @return name of the page currently opened
   */
  getCurrentPage(): string {
    if (goog.isNull(this.model.file.getContentWindow()['jQuery'])) {
      throw new Error('JQuery not loaded in the opened website');
    }
    let bodyElement = this.model.body.getBodyElement();
    let pageName = null;
    try {
      if (this.model.file.getContentWindow()['jQuery'](bodyElement).pageable) {
        pageName = this.model.file.getContentWindow()
                       ['jQuery'](bodyElement)
                       .pageable('option', 'currentPage');
      }
    } catch (e) {
      // there was a problem in the pageable plugin, return the first page
      console.warn(
          `warning, could not retrieve the current page, I will return the first page (${
              this.getPages()})`);
      pageName = this.getPages()[0];
    }
    return pageName;
  }

  /**
   * refresh the view
   */
  refreshView() {
    const pages = this.getPages();
    const currentPage = this.getCurrentPage();
    const selectedElements = this.model.body.getSelection();
    this.view.contextMenu.redraw(selectedElements, pages, currentPage);
    this.view.pageTool.redraw(selectedElements, pages, currentPage);
    this.view.propertyTool.redraw(selectedElements, pages, currentPage);
    this.view.textFormatBar.redraw(selectedElements, pages, currentPage);
    this.view.stage.redraw(selectedElements, pages, currentPage);
  }

  /**
   * open the page
   * this is a static method, a helper
   * @param pageName   name of the page to open
   */
  setCurrentPage(pageName: string) {
    let bodyElement = this.model.body.getBodyElement();
    if (this.model.file.getContentWindow()['jQuery'](bodyElement).pageable) {
      this.model.file.getContentWindow()['jQuery'](bodyElement).pageable({
        'currentPage': pageName
      });
    }
    this.refreshView();
  }

  /**
   * get a page from the dom by its name
   * @param pageName  a page name
   * @return the page corresponding to the given page name
   */
  getDisplayName(pageName: string): string {
    let displayName = '';
    let pageElement =
        this.model.file.getContentDocument().getElementById(pageName);
    if (pageElement) {
      displayName = pageElement.innerHTML;
    }
    return displayName;
  }

  /**
   * remove a page from the dom
   * elements which are only in this page should be deleted
   */
  removePage(pageName: string) {
    let pages = this.getPages();
    let pageDisplayName = this.getDisplayName(pageName);
    if (pages.length < 2) {
      SilexNotification.notifyError(
          'I could not delete this page because <strong>it is the only page!</strong>');
    } else {
      // remove the DOM element
      const pageElements = Array.from(this.model.body.getBodyElement().querySelectorAll('a[data-silex-type="page"]'));
      pageElements.forEach((element) => {
        if (element.getAttribute('id') === pageName) {
          goog.dom.removeNode(element);
        }
      });

      // remove the links to this page
      const linkElements = Array.from(this.model.body.getBodyElement().querySelectorAll('*[data-silex-href="#!' + pageName + '"]'));
      linkElements.forEach((element) => {
        element.removeAttribute('data-silex-href');
      });

      // check elements which were only visible on this page
      // and returns them in this case
      let elementsOnlyOnThisPage = [];
      const elementsOfThisPage = Array.from(this.model.body.getBodyElement().getElementsByClassName(pageName));
      elementsOfThisPage.forEach((element) => {
        element.remove();
        let pagesOfElement = this.getPagesForElement(element);
        if (pagesOfElement.length <= 0) {
          elementsOnlyOnThisPage.push(element);
        }
      });

      // update the page list
      pages = this.getPages();

      // open default/first page
      this.setCurrentPage(pages[0]);

      // handle elements which should be deleted
      if (elementsOnlyOnThisPage.length > 0) {
        SilexNotification.confirm(
            elementsOnlyOnThisPage.length +
                ' elements were only visible on this page (' + pageDisplayName +
                '). <br /><ul><li>Do you want me to <strong>delete these elements?</strong><br /></li><li>or keep them and <strong>make them visible on all pages?</strong></li></ul>',
            (accept) => {
              elementsOnlyOnThisPage.forEach((element) => {
                if (accept) {
                  // remove these elements
                  this.model.element.removeElement(element);
                } else {
                  // remove from this page
                  this.model.page.removeFromAllPages(element);
                }
              });
            },
            'delete', 'keep');
      }
    }
  }

  /**
   * move a page in the dom
   * @param direction up or down
   */
  movePage(pageName: string, direction: string) {
    if (direction !== 'up' && direction !== 'down') {
      throw 'wrong direction ' + direction + ', can not move page';
    }
    const elements = this.model.body.getBodyElement().querySelectorAll(
        'a[data-silex-type="page"]');
    let prevEl = null;
    for (let idx = 0; idx < elements.length; idx++) {
      const el = elements[idx];
      if (prevEl &&
          (el.id === pageName && direction === 'up' ||
           prevEl.id === pageName && direction === 'down')) {
        el.parentNode.insertBefore(el, prevEl);
        let pages = this.getPages();
        let currentPage = this.getCurrentPage();
        this.view.pageTool.redraw(
            this.model.body.getSelection(), pages, currentPage);
        return;
      }
      prevEl = el;
    }
    console.error('page could not be moved', pageName, direction, prevEl);
  }

  /**
   * add a page to the dom
   */
  createPage(name: string, displayName: string) {
    let container = this.model.body.getBodyElement().querySelector(
        '.' + Page.PAGES_CONTAINER_CLASS_NAME);

    // create the DOM element
    let aTag = goog.dom.createElement('a');
    aTag.setAttribute('id', name);
    aTag.setAttribute('href', '#!' + name);
    aTag.setAttribute('data-silex-type', 'page');
    aTag.innerHTML = displayName;
    goog.dom.appendChild(container, aTag);

    // for coherence with other silex elements
    aTag.classList.add(Page.PAGE_CLASS_NAME);

    // select this page
    this.setCurrentPage(name);
  }

  /**
   * rename a page in the dom
   */
  renamePage(oldName: string, newName: string, newDisplayName: string) {
    const bodyElement = this.model.body.getBodyElement();

    // update the DOM element
    const pageElements = Array.from(bodyElement.querySelectorAll('a[data-silex-type="page"]'));
    pageElements.forEach((element) => {
      if (element.getAttribute('id') === oldName) {
        element.setAttribute('id', newName);
        element.setAttribute('href', '#!' + newName);
        element.innerHTML = newDisplayName;
      }
    });

    // update the links to this page
    const linkElements = Array.from(bodyElement.querySelectorAll('*[data-silex-href="#!' + oldName + '"]'));
    linkElements.forEach((element) => {
      element.setAttribute('data-silex-href', '#!' + newName);
    });

    // update the visibility of the compoents
    const componentElements = Array.from(bodyElement.getElementsByClassName(oldName));
    componentElements.forEach((element) => {
      element.classList.remove(oldName);
      element.classList.add(newName);
    });

    // wait until the dom reflects the changes
    setTimeout(() => {
      // select this page
      this.setCurrentPage(newName);
    }, 100);
  }

  /**
   * set/get a the visibility of an element in the given page
   * remove from all pages if visible in all pages
   */
  addToPage(element: HTMLElement, pageName: string) {
    if (this.model.element.isSectionContent(element)) {
      element = (element.parentElement);
    }
    const pages = this.getPagesForElement(element);
    if (pages.length + 1 === this.getPages().length) {
      pages.forEach((page) => element.classList.remove(page));
      element.classList.remove(Page.PAGED_CLASS_NAME);
    } else {
      element.classList.add(pageName);
      element.classList.add(Page.PAGED_CLASS_NAME);
    }
    this.refreshView();
  }

  /**
   * set/get a "silex style link" on an element
   */
  removeFromPage(element: Element, pageName: string) {
    if (this.model.element.isSectionContent(element)) {
      element = (element.parentNode as Element);
    }
    element.classList.remove(pageName);
    if (this.getPagesForElement(element).length <= 0) {
      element.classList.remove(Page.PAGED_CLASS_NAME);
    }
    this.refreshView();
  }

  /**
   * set/get a "silex style link" on an element
   */
  removeFromAllPages(element: Element) {
    if (this.model.element.isSectionContent(element)) {
      element = (element.parentNode as Element);
    }
    let pages = this.getPagesForElement(element);
    pages.forEach((pageName) => {
      element.classList.remove(pageName);
    });

    // the element is not "paged" anymore
    element.classList.remove(Page.PAGED_CLASS_NAME);
    this.refreshView();
  }

  /**
   * set/get a "silex style link" on an element
   */
  getPagesForElement(element: Element): string[] {
    if (this.model.element.isSectionContent(element)) {
      element = (element.parentNode as Element);
    }
    return this.getPages().filter(
        (pageName) => element.classList.contains(pageName));
  }

  /**
   * check if an element is in the given page (current page by default)
   */
  isInPage(element: Element, opt_pageName?: string): boolean {
    if (this.model.element.isSectionContent(element)) {
      element = (element.parentNode as Element);
    }
    if (!opt_pageName) {
      opt_pageName = this.getCurrentPage();
    }
    return element.classList.contains(opt_pageName);
  }
}
