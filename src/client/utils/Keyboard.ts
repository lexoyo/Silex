import {SilexNotification} from '../utils/notification';

export type Shortcut = {
  label?: string,
  id?: string,
  key: string,
  altKey?: boolean,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  modifiers?: boolean,
  input?: boolean,
};

type ShortcutItem = {
  s: Shortcut,
  cbk: (e: KeyboardEvent) => void,
}

/**
 * @class Keyboard
 */
export class Keyboard {
  shortcuts: Map<string, ShortcutItem[]>;

  static isInput(target: HTMLElement) {
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

  addShortcut(s: Shortcut, cbk: (p1: Event) => void) {
    console.log('addShortcut', s)
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
    console.log('handleKeyDown', e.key)
    if(e.defaultPrevented) {
      console.warn('event prevented, do not call shortcut callback');
    } else {
      const shortcuts = this.getShortcutsFromEvent(e);
      console.log('found', shortcuts, SilexNotification.isActive);
      if (shortcuts.length > 0 &&
          // not while in a modal alert
          !SilexNotification.isActive) {
        console.log('found shortcuts', shortcuts)
        shortcuts.forEach((shortcut) => {
          shortcut.cbk(e);
        });
        e.preventDefault();
      }
    }
  }

  getShortcutsFromEvent(e): ShortcutItem[] {
    const key = e.key.toLowerCase();
    console.log('getShortcutsFromEvent', e.key, this.shortcuts)
    if (!this.shortcuts.has(key)) {
      return [];
    }
    const shortcuts = this.shortcuts.get(key);
    return shortcuts.filter((shortcut) => {
      console.log('getShortcutsFromEvent filter', shortcuts, !!(shortcut.s.shiftKey) === !!(e.shiftKey), !!(shortcut.s.altKey) === !!(e.altKey), !!(shortcut.s.ctrlKey) === !!(e.ctrlKey), shortcut.s.input !== false, !Keyboard.isInput((e.target as HTMLElement)));
      return (
        // accept all modifiers if modifiers is set to false
        shortcut.s.modifiers === false || (
        // otherwise check the modifiers
        !!(shortcut.s.shiftKey) === !!(e.shiftKey) &&
        !!(shortcut.s.altKey) === !!(e.altKey) &&
        !!(shortcut.s.ctrlKey) === !!(e.ctrlKey)) &&
        // not when in an input field
        (shortcut.s.input !== false || !Keyboard.isInput(e.target as HTMLElement))
      );
    });
  }
}
