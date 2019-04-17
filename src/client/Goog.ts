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
      else console.warn('todo: do not use this useless function')
      return res;
    }
  }
}
