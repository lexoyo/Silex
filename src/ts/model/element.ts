import { DomDirection, ElementId, ElementState } from './types';
import { flat, insertAt } from '../client/utils/array';

export class ElementArray extends Array<ElementState> {
  /**
   * select the root and only the element
   */
  selectBody(): ElementArray { return this.select([this.root()]) as ElementArray }

  /**
   * get the root element
   * FIXME: the root of the elements tree should be stored in site model
   */
  root(): ElementState { return this.find((el) => !this.parent(el)) }

  /**
   * get the parent of the given element
   */
  parent(element: ElementState): ElementState {
   return this.find((parent) => parent.children.includes(element.id))
  }

  /**
   * select a set of elements
   */
  select(selection: ElementState[]): ElementArray {
    return this
      // unselect all but the one to change
      .map((el) => {
        const selected = selection.includes(el)
        return el.selected === selected ? el : { ...el, selected, }
      }) as ElementArray
  }


  /**
   * get the children of a some elements
   * @param recursive also get the children of the children and so on
   */
  children(element: ElementState, recursive: boolean = false): ElementArray {
    const direct = this.ids(element.children)
    return recursive ? direct
      .concat(flat(direct.map((el) => this.children(el, true)))) as ElementArray
      : direct
  }

  /**
   * from a list of elements to a list of ids
   */
  ids(ids: ElementId[]): ElementArray { return this.filter((el) => ids.includes(el.id)) as ElementArray }

  /**
   * move elements order in their parent's children array
   * @return the parent elements to be updated
   */
  move(selection: ElementState[], direction: DomDirection) {
    const changes = selection
      .map((el) => ({
        el,
        parent: this.parent(el),
      }))
      .filter(({el, parent}) => {
        if (!parent) {
          console.warn('No parent, are you trying to move the root element?', {el, parent})
        }
        return !!el && !!parent
      })
      .map(({el, parent}) => ({
        el,
        parent,
        idx: parent.children.findIndex((c) => c === el.id),
      }))
      .reduce((acc, {el, parent, idx}) => {
        const stored = acc.has(parent) ? acc.get(parent) : {
          children: parent.children,
          parent,
          errored: false,
        }
        const newIdx = direction === DomDirection.UP ? idx - 1 : direction === DomDirection.DOWN ? idx + 1 : direction === DomDirection.TOP ? 0 : parent.children.length - 1
        acc.set(parent, {
          parent: stored.parent,
          children: insertAt(stored.children.filter((c, i) => i !== idx), newIdx, el.id),
          errored: stored.errored || newIdx < 0 || newIdx >= stored.parent.children.length,
        })
        return acc
      }, new Map())
      const states = Array.from(changes.values())
        .filter((change) => !change.errored)
        .map((change) => ({
          ...change.parent,
          children: change.children,
        })) as ElementState[]

      return new ElementArray(...states)
  }



}
