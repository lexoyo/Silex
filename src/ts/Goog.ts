export namespace goog {
  export class String {
    static toSelectorCase(str: string): string { return ''; }
  }
  export class Color {
    static hexToRgb(_: string): any {return null}
    static parse(_: string): any {return null}
  }
  export class Style {
    static getBackgroundColor(el: HTMLElement): string { return '' }
    static getBounds(el: HTMLElement): { top: number, left: number, bottom: number, right: number, height: number, width: number } {
      return { top: 0, left: 0, bottom: 0, right: 0, height: 0, width: 0 }
    }
    static getComputedZIndex(el: HTMLElement): number|'auto' {
      return 0;
    }
    static getRelativePosition(event: any, el: HTMLElement): {x:number, y:number} {
      return {x:0,y:0};
    }
    static getStyle(el: HTMLElement, styleName: string): string|number {
      return null;
    }
    static setStyle(el: HTMLElement, styleName: string, val: string|number) {}
    static parseStyleAttribute(styleStr: string): Object {return null};
  }
  export class DomHelper {
    constructor(private doc: HTMLDocument) {}
    getDocumentScrollElement(): HTMLElement {
      return this.doc.body;
    }
    getDocumentScroll(): {x:number, y:number} {
      return {x:0,y:0};
    }
  }
  export class Dom {
    static getChildren(el: HTMLElement): Array<HTMLElement> {
      return [];
    }
    static getAncestorByClass(el: HTMLElement, className: string): HTMLElement {
      return null;
    }
  }
  export class ImageLoader {
    constructor() {}
    addImage(url: string, _: string) {}
    start() {}
  }
  export class EventType {
    static DBLCLICK = 'DBLCLICK';
    static MOUSEWHEEL = 'MOUSEWHEEL';
    static MOUSEMOVE = 'MOUSEMOVE';
    static CHANGE = 'CHANGE';
    static ALL = 'ALL';
    static LOAD = 'LOAD';
    static ERROR = 'ERROR';
  }
  export class Event {
    static removeAll(el: ImageLoader|HTMLElement|HTMLDocument|Window|MouseWheelHandler, type?: string) {}
    static listen(el: ImageLoader|HTMLElement|HTMLDocument|Window|MouseWheelHandler, type: string, cbk, bub: boolean, scope) {}
    static listenOnce(el: ImageLoader|HTMLElement|HTMLDocument|Window|MouseWheelHandler, type: string, cbk, bub?: boolean, scope?:any) {}
    static unlisten(el: ImageLoader|HTMLElement|HTMLDocument|Window|MouseWheelHandler, type: string, cbk, bub: boolean, scope) {}
  }
  export class MouseWheelHandler {
    constructor(private el: HTMLElement) {}
  }
  export class Is {
    static isNumber(value: any): boolean {return false;}
    static isNull(value: any): boolean {return false;}
    static isDef(value: any): boolean {return false;}
    static isDefAndNotNull(value: any): boolean {return false;}
  }
  export class Menu {
    addChild(btn: MenuButton, _: boolean) {}
  }
  export class MenuBar {
    static create():Menu { return null; }
  }
  export class MenuButton {
    constructor(label: string, menu: Menu) {}
    addClassName(className: string) {}
    setDispatchTransitionEvents(type: string, _: boolean) {}
  }
  export class MenuItem {
    constructor(label: string) {}
  }
  export class UserAgent {
    static MAC: boolean = true;
  }
  export class KeyboardShortcutHandler {
    static Modifiers: any = {}
  }
}
