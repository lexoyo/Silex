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

import { ElementId, ElementState } from './types'
import { getElements } from './index';
import { getDomElement } from './dom'

/**
 * @fileoverview Useful filters used to retrieve items in the store. Cross platform, it needs to run client and server side
 *
 */

export const getElementById = (id: ElementId, elements = getElements()): ElementState => elements.find((el) => el.id === id)
export const getElementByDomElement = (doc: HTMLDocument, element: HTMLElement, elements = getElements()) => elements.find((el) => element === getDomElement(doc, el))

export const getChildren = (element: ElementState, elements = getElements()): ElementState[] => element.children.map((id) => getElementById(id, elements))

export const getChildrenRecursive = (element: ElementState, elements = getElements()): ElementState[] => {
  return element.children
  .map((id) => getElementById(id, elements))
  .concat(element.children.reduce((prev, id) => getChildrenRecursive(getElementById(id, elements), elements), []))
}

export const getAllParents = (element: ElementState, elements = getElements()): ElementState[] => {
  const parent = getParent(element, elements)
  return !!parent ? [parent, ...getAllParents(parent, elements)] : []
}

export const noSectionContent = (element: ElementState, elements = getElements()): ElementState => element.isSectionContent ? getParent(element, elements) : element

// const defaultSelection = (selected) => selected.length ? selected : [getBody()]

export const getSelectedElements = (elements = getElements()) => elements
  .filter((el) => el.selected)

export const getSelectedElementsNoSectionContent = (elements = getElements()) => elements
  .map((el) => noSectionContent(el, elements))
  .filter((el) => el.selected)

/**
 * check if the element's parents belong to a page, and if one of them do,
 * remove the element from the other pages
 *
 * if the element is in a container which is visible only on some pages,
 * then the element should be visible everywhere, i.e. in the same pages as
 * its parent
 */
export function getFirstPagedParent(element: ElementState, elements = getElements()): ElementState {
  const parent = elements.find((el) => el.children.includes(element.id))
  if (!!parent) {
    if (parent.pageNames.length) {
      return parent
    }
    return getFirstPagedParent(parent, elements)
  }
  // body
  return null
}
