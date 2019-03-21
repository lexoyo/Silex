import {SilexNotification} from '../utils/notification';
// goog.module('silex.utils.Shortcut');
// goog.module('silex.utils.MenuShortcut');

export interface Shortcut {
  input?: boolean;
  key?: string;
  modifiers?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  ctrlKey?: boolean;
}

export interface MenuShortcut {
  checkable?: boolean;
  id: string;
  tooltip?: number;
  input?: boolean;
  key?: string;
  altKey?: boolean;
  shiftKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * @class Keyboard
 */
export class Keyboard {
  shortcuts: any;

  static isInput(target: Element) {
    return !target.tagName ||
        // this is in-iframe forwarding case
        target.tagName.toUpperCase() === 'INPUT' ||
        target.tagName.toUpperCase() === 'TEXTAREA' ||
        target.getAttribute('contenteditable') === 'true';
  }

  constructor(doc: Document) {
    this.shortcuts = new Map();
    doc.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  addShortcut(s: Shortcut, cbk: (p1: Event) => any) {
    const {ctrlKey, altKey, shiftKey} = s;
    const key = s.key.toLowerCase();
    if (!cbk || !key) {
      throw new Error('Can not add shortcut, callback and key are required');
    }
    if (!this.shortcuts.has(key)) {
      this.shortcuts.set(key, []);
    }
    this.shortcuts.get(key).push({s, cbk});
  }

  handleKeyDown(e) {
    console.error('TODO')
    // const {target, shiftKey, ctrlKey, altKey, metaKey} = e;
    // const key = e.key.toLowerCase();
    // const shortcuts = this.getShortcuts(e);
    // if (shortcuts.length > 0 &&
    //     // not while in a modal alert
    //     !SilexNotification.isActive) {
    //   shortcuts.forEach((shortcut) => {
    //     if (!e.defaultPrevented) {
    //       shortcut.cbk(e);
    //     } else {
    //       console.log('event prevented, do not call shortcut callback');
    //     }
    //   });
    //   e.preventDefault();
    // }
  }

  getShortcuts(e): Shortcut[] {
    const key = e.key.toLowerCase();
    if (!this.shortcuts.has(key)) {
      return [];
    }
    const shortcuts = this.shortcuts.get(key);
    return shortcuts.filter((shortcut) => {
      return (
                 // accept all modifiers if modifiers is set to false
                 shortcut.s.modifiers === false ||
                 // otherwise check the modifiers
                 !!shortcut.s.shiftKey === e.shiftKey &&
                     !!shortcut.s.altKey === e.altKey &&
                     !!shortcut.s.ctrlKey === e.ctrlKey) &&
          (
                 // not when in an input field
                 shortcut.s.input !== false || !Keyboard.isInput((e.target as Element)));
    });
  }
}
