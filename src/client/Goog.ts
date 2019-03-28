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
 * @fileoverview Temp class with old classes from google closure
 *
 */

export namespace goog {
  // export type Rgb = Array<number>;
  export class String {
    static toSelectorCase(str: string): string {
      const res = str.replace(/([A-Z])/g, '-$1').toLowerCase();
      if(res !== str) console.error('these 2 strings should be the same', str, res);
      else console.log('todo: do not use this useless function')
      return res;
    }
  }
  export class ImageLoader {
    constructor() {
      console.error('not implemented')
    }
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
}
