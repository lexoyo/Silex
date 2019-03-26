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
 * @fileoverview Property pane, displayed in the property tool box.
 * Controls the element visibility on the pages,
 *   and also the element "link to page" property
 *
 */


import { goog } from '../../Goog.js';
import { Constants } from '../../../Constants.js';
import { Controller, Model } from '../../types.js';
import { Dom } from '../../utils/dom.js';
import { PaneBase } from './pane-base.js';

/**
 * on of Silex Editors class
 * let user edit style of components
 * @param element   container to render the UI
 * @param model  model class which holds
 *                                  the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 *                                  the controller instances
 */
export class PagePane extends PaneBase {

  /**
   * dropdown list to select a link
   * link, select page or enter custom link
   */
  linkDropdown: HTMLInputElement;

  /**
   * text field used to type an external link
   */
  linkInputTextField: HTMLInputElement;

  /**
   * check box "view on mobile"
   */
  viewOnDeviceEl: HTMLDivElement = null;

  /**
   * check box "view on all pages"
   */
  viewOnAllPagesCheckbox: HTMLInputElement = null;

  /**
   * Array of checkboxes used to add/remove the element from pages
   */
  pageCheckboxes: {checkbox: HTMLInputElement, pageName: string}[] = null;


  // store the pages
  pages: Array<string>;
  iAmSettingValue: boolean;
  iAmRedrawing: boolean;

  // remember selection
  selectedElements: HTMLElement[] = null;

  constructor(element: HTMLElement, model: Model, controller: Controller) {
    // call super
    super(element, model, controller);

    // init the component
    this.buildUi();
  }

  /**
   * build the UI
   */
  buildUi() {
    this.linkDropdown = this.element.querySelector('.link-combo-box');
    this.linkDropdown.onchange = () => this.onLinkChanged;
    this.linkInputTextField = this.element.querySelector('.link-input-text');

    // hide by default
    this.linkInputTextField.style.display = 'none';

    // Watch for field changes, to display below.
    this.linkInputTextField.addEventListener('input', () => this.onLinkTextChanged(), false);
    this.viewOnDeviceEl = (this.element.querySelector('.view-on-mobile') as HTMLDivElement);
    this.viewOnDeviceEl.onclick = (e) => {
      const selected: HTMLInputElement = this.element.querySelector('.view-on-mobile input:checked');
      const value = selected.value;
      this.selectedElements.forEach((element) => {
        this.model.element.setHideOnMobile(element, value === 'desktop');
        this.model.element.setHideOnDesktop(element, value === 'mobile');
      });
    };
    this.viewOnAllPagesCheckbox = this.element.querySelector('.view-on-allpages-check');
    this.viewOnAllPagesCheckbox.addEventListener('change', () => {
      if (this.viewOnAllPagesCheckbox.checked) {
        this.checkAllPages();
      }
      this.removeFromAllPages();
    }, false);
  }

  /**
   * refresh with new pages
   * @param pages   the new list of pages
   */
  setPages(pages: Array<string>) {
    this.pages = pages;

    // build an array of obects with name and displayName properties
    let pageData = pages.map((pageName) => {
      const pageElement =
          this.model.file.getContentDocument().getElementById(pageName);
      if (!pageElement) {
        // this happens while undoing or redoing
        return null;
      }
      return {
        'name': pageName,
        'displayName': pageElement.innerHTML,
        'linkName': '#!' + pageName
      };
    });

    // link selector
    let pageDataWithDefaultOptions = [
      {'name': 'none', 'displayName': '-', 'linkName': 'none'},
      {'name': 'custom', 'displayName': 'External link', 'linkName': 'custom'}
    ].concat(pageData);
    let linkContainer = this.element.querySelector('.link-combo-box');
    let templateHtml = this.element.querySelector('.link-template').innerHTML;
    linkContainer.innerHTML = Dom.renderList(templateHtml, pageDataWithDefaultOptions);

    // render page/visibility template
    // init page template
    let pagesContainer = this.element.querySelector('.pages-container');
    templateHtml = this.element.querySelector('.pages-selector-template').innerHTML;
    pagesContainer.innerHTML = Dom.renderList(templateHtml, pageData);

    // reset page checkboxes
    if (this.pageCheckboxes) {
      this.pageCheckboxes.forEach((item) => {
        if (item.checkbox.parentElement != null) {
          item.checkbox.parentElement.removeChild(item.checkbox);
        }
        goog.Event.removeAll(
            item.checkbox, goog.EventType.CHANGE);
      });
    }

    // create page checkboxes
    const mainContainer = this.element.querySelector('.pages-container');
    const items = (Array.from(mainContainer.querySelectorAll('.page-container')) as HTMLElement[]);
    this.pageCheckboxes = items.map((item, idx) => {
      const checkbox: HTMLInputElement = item.querySelector('.page-check');
      const name = this.pages[idx++];
      checkbox.addEventListener('change', () => {
        this.checkPage(name, checkbox);
      }, false);
      return {checkbox: checkbox, pageName: name};
    });
  }

  /**
   * the user changed the link drop down
   */
  onLinkChanged() {
    if (this.linkDropdown.value === 'none') {
      this.controller.propertyToolController.removeLink(this.selectedElements);
      this.linkInputTextField.style.display = 'none';
    } else {
      if (this.linkDropdown.value === 'custom') {
        this.linkInputTextField.value = '';
        this.linkInputTextField.style.display = 'inherit';
      } else {
        this.controller.propertyToolController.addLink(
            this.selectedElements, this.linkDropdown.value);
      }
    }
  }

  /**
   * the user changed the link text field
   */
  onLinkTextChanged() {
    this.iAmSettingValue = true;
    this.controller.propertyToolController.addLink(
        this.selectedElements, this.linkInputTextField.value);
    this.iAmSettingValue = false;
  }

  /**
   * redraw the properties
   * @param selectedElements the elements currently selected
   * @param pageNames   the names of the pages which appear in the current HTML
   *     file
   * @param  currentPageName   the name of the current page
   */
  redraw(
      selectedElements: HTMLElement[], pageNames: string[],
      currentPageName: string) {
    if (this.iAmSettingValue) {
      return;
    }
    this.iAmRedrawing = true;

    // call super
    super.redraw( selectedElements, pageNames, currentPageName);
    this.selectedElements = selectedElements;

    // update page list
    this.setPages(pageNames);

    // View on mobile checkbox
    Array.from(this.viewOnDeviceEl.querySelectorAll('.view-on-mobile input'))
        .forEach((el: HTMLInputElement) => el.disabled = !this.model.head.getEnableMobile());

    // not available for stage element
    let elementsNoStage = [];
    selectedElements.forEach((element) => {
      if (this.model.body.getBodyElement() !== element) {
        elementsNoStage.push(element);
      } else {
        Array
            .from(this.viewOnDeviceEl.querySelectorAll('.view-on-mobile input'))
            .forEach((el: HTMLInputElement) => el.disabled = true);
      }
    });

    // update the "view on mobile" checkbox
    let visibility = this.getCommonProperty(selectedElements, (element) => {
      if (this.model.element.getHideOnMobile(element)) {
        return 'desktop';
      } else {
        if (this.model.element.getHideOnDesktop(element)) {
          return 'mobile';
        } else {
          return 'both';
        }
      }
    });
    if (!goog.Is.isNull(visibility)) {
      Array.from(this.viewOnDeviceEl.querySelectorAll('.view-on-mobile input'))
          .forEach((el: HTMLInputElement) => {
            el.checked = visibility === el.value;
            el.indeterminate = false;
          });
    } else {
      Array.from(this.viewOnDeviceEl.querySelectorAll('.view-on-mobile input'))
          .forEach((el: HTMLInputElement) => el.indeterminate = true);
    }

    // special case of the background / main container only selected element
    let bgOnly = false;
    if (selectedElements.length === 1 &&
        selectedElements[0].classList.contains('background')) {
      bgOnly = true;
    }
    if (elementsNoStage.length > 0 && bgOnly === false) {
      // not stage element only
      this.linkDropdown.disabled = false;

      // refresh page checkboxes
      let isInNoPage = true;
      this.pageCheckboxes.forEach((item) => {
        // there is a selection
        item.checkbox.disabled = false;

        // compute common pages
        let isInPage = this.getCommonProperty(selectedElements, (element) => {
          return this.model.page.isInPage(element, item.pageName);
        });

        // set visibility
        isInNoPage = isInNoPage && isInPage === false;
        if (goog.Is.isNull(isInPage)) {
          // multiple elements selected with different values
          item.checkbox.indeterminate = true;
        } else {
          item.checkbox.indeterminate = false;
          item.checkbox.checked = isInPage;
        }
      });
      this.viewOnAllPagesCheckbox.disabled = false;

      // this.checkAllPages();
      if (isInNoPage) {
        this.viewOnAllPagesCheckbox.checked = true;
      } else {
        this.viewOnAllPagesCheckbox.checked = false;
      }

      // refresh the link inputs
      // get the link of the element
      let elementLink =
          (this.getCommonProperty(selectedElements, function(element) {
            return element.getAttribute(Constants.LINK_ATTR);
          }) as string);

      // default selection
      if (!elementLink || elementLink === '') {
        this.linkDropdown.value = 'none';
        this.linkInputTextField.value = '';
      } else {
        if (elementLink.indexOf('#!') === 0) {
          // case of an internal link
          // select a page
          this.linkDropdown.value = elementLink;
        } else {
          // in case it is a custom link
          this.linkInputTextField.value = elementLink;
          this.linkDropdown.value = 'custom';
        }
      }
      if (this.linkDropdown.value === 'custom') {
        this.linkInputTextField.style.display = 'inherit';
      } else {
        this.linkInputTextField.style.display = 'none';
      }
    } else {
      // stage element only
      this.pageCheckboxes.forEach((item) => {
        item.checkbox.disabled = true;
        item.checkbox.indeterminate = true;
      });
      this.linkDropdown.value = 'none';
      this.linkDropdown.disabled = true;
      this.linkInputTextField.style.display = 'none';
      this.viewOnAllPagesCheckbox.disabled = true;
      this.viewOnAllPagesCheckbox.checked = true;
    }
    this.iAmRedrawing = false;
  }

  /**
   * callback for checkboxes click event
   * changes the visibility of the current component for the given page
   * @param pageName   the page for which the visibility changes
   * @param checkbox   the checkbox clicked
   */
  checkPage(pageName: string, checkbox: HTMLInputElement) {
    // notify the toolbox
    if (checkbox.checked) {
      this.controller.propertyToolController.addToPage(
          this.selectedElements, pageName);
    } else {
      this.controller.propertyToolController.removeFromPage(
          this.selectedElements, pageName);
    }
  }

  checkAllPages() {
    this.pageCheckboxes.forEach((item) => {
      item.checkbox.checked = true;
    });
    this.viewOnAllPagesCheckbox.checked = true;
  }

  removeFromAllPages() {
    this.pageCheckboxes.forEach((item) => {
      this.controller.propertyToolController.removeFromPage(
          this.selectedElements, item.pageName);
    });
  }
}
