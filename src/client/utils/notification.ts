

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

import { goog } from '../Goog';

/**
 * @fileoverview Helper class for common tasks
 *
 */
export class SilexNotification {
  /**
   * constant for the duration of the notifications, in ms
   */
  static NOTIFICATION_DURATION_MS: number = 4000;

  /**
   * constant for the url of the icon
   */
  static ERROR_ICON: string = 'assets/notifications/error.png';

  /**
   * constant for the url of the icon
   */
  static SUCCESS_ICON: string = 'assets/notifications/success.png';

  /**
   * constant for the url of the icon
   */
  static INFO_ICON: string = 'assets/notifications/info.png';

  /**
   * flag to indicate wether a modal dialog is opened
   */
  static isActive: boolean = false;

  /**
   * flag to indicate wether the window/tab has focus
   */
  static hasFocus: boolean = true;

  /**
   * flag to indicate wether we are listening for focus event already
   */
  static isListeningForFocus: boolean = false;

  constructor() {
    throw 'this is a static class and it canot be instanciated';
  }

  /**
   * use native alerts vs alertify
   */
  static useNative(): boolean {
    return SilexNotification.hasFocus === false &&
        ('Notification' in window && Notification.permission === 'granted');
  }

  /**
   * activate native alerts if available
   */
  static activateNative() {
    if ('Notification' in window && Notification.permission !== 'denied') {
      if (!SilexNotification.useNative()) {
        goog.Event.listenOnce(
            document, goog.EventType.MOUSEMOVE, function(e) {
              Notification.requestPermission();
            });
      }
    }
  }

  /**
   * display a native notification, or ask for permission
   */
  static nativeNotification(message: string, iconUrl: string) {
    if (!SilexNotification.isListeningForFocus) {
      SilexNotification.isListeningForFocus = true;
      window.onfocus = (e) => SilexNotification.hasFocus = true;
      window.onblur = (e) => SilexNotification.hasFocus = false;
    }
    if (SilexNotification.useNative()) {
      let notification = new Notification(
          'Silex speaking...',
          {'icon': iconUrl, 'body': message, 'lang': 'en-US'});
      setTimeout(function() {
        notification.close();
      }, SilexNotification.NOTIFICATION_DURATION_MS);
    } else {
    }
  }

  /**
   * core method for alert, prompt and confirm
   */
  static dialog(
      dialogMethod:
          (p1: string, p2: (...p1) => any, p3?: string, p4?: string,
           p5?: string) => any,
      message: string, cbk: (p1: boolean, p2: string) => any,
      opt_okLabel?: string, opt_cancelLabel?: string,
      opt_default?: string) {
    SilexNotification.close();

    alertify.labels = {'ok': opt_okLabel || 'ok', 'cancel': opt_cancelLabel || 'cancel'};

    // set the flag while the modal dialog is opened
    SilexNotification.isActive = true;
    dialogMethod(message, function() {
      // reset the flag
      SilexNotification.isActive = false;

      // call the callback
      cbk.apply(this, arguments);
    }, opt_default);
  }

  /**
   * close (cancel) the current notification
   */
  static close() {
    const btn: HTMLElement = document.querySelector('#alertify-cancel') ||
        document.querySelector('#alertify-ok');
    if (btn) {
      btn.click();
    }
  }

  /**
   * display a message
   */
  static alert(
      message: string, cbk: () => any, opt_okLabel?: string,
      opt_cancelLabel?: string) {
    SilexNotification.dialog(
        alertify.alert, message, cbk, opt_okLabel, opt_cancelLabel);
  }

  /**
   * ask for a text
   */
  static prompt(
      message: string, text: string,
      cbk: (p1: boolean, p2: string) => any,
      opt_okLabel?: string, opt_cancelLabel?: string) {
    SilexNotification.dialog(
        alertify.prompt, message, cbk, opt_okLabel, opt_cancelLabel, text);
  }

  /**
   * ask for confirmation
   */
  static confirm(
      message: string, cbk: (p1: boolean) => any,
      opt_okLabel?: string, opt_cancelLabel?: string) {
    SilexNotification.dialog(
        alertify.confirm, message, cbk, opt_okLabel, opt_cancelLabel);
  }

  /**
   * notify the user with success formatting
   */
  static notifySuccess(message: string) {
    console.log(message);
    alertify.set({'delay': SilexNotification.NOTIFICATION_DURATION_MS});
    SilexNotification.nativeNotification(message, SilexNotification.SUCCESS_ICON);
    alertify.success(message);
  }

  /**
   * notify the user with success formatting
   */
  static notifyError(message: string) {
    console.error(message);
    alertify.set({'delay': SilexNotification.NOTIFICATION_DURATION_MS});
    SilexNotification.nativeNotification(message, SilexNotification.ERROR_ICON);
    alertify.error(message);
  }

  /**
   * notify the user with success formatting
   */
  static notifyInfo(message: string) {
    alertify.set({'delay': SilexNotification.NOTIFICATION_DURATION_MS});
    SilexNotification.nativeNotification(message, SilexNotification.INFO_ICON);
    alertify.log(message);
  }

  /**
   * change the text of the current notification
   */
  static setText(message: string) {
    document.querySelector('.alertify-message').innerHTML = message;
  }

  /**
   * @return element which holds the text of the current notification
   */
  static getTextElement(): HTMLElement {
    return document.querySelector('.alertify-message');
  }

  /**
   * @return element which holds the text field of the current notification
   */
  static getFormBody(): HTMLElement {
    return document.querySelector('.alertify-text-wrapper');
  }

  /**
   * @return element which holds the buttons of the current notification
   */
  static getFormButtons(): HTMLElement {
    return document.querySelector('.alertify-buttons');
  }

  /**
   * add an HTML panel with info of type "while you wait, here is an info"
   */
  static setInfoPanel(element: HTMLElement) {
    let container = document.querySelector('.alertify-inner');
    let infoPanel = container.querySelector('.silex-info-panel') as HTMLElement;
    if (infoPanel === null) {
      infoPanel = document.createElement('DIV');
      infoPanel.classList.add('info-panel');

      // limit height so that small screens still see the close button
      let stage = document.querySelector('#silex-stage-iframe');
      infoPanel.style.maxHeight = Math.round(stage.clientHeight * 2 / 3) + 'px';
      container.insertBefore(
          infoPanel, container.childNodes[container.childNodes.length - 1]);
    }
    infoPanel.innerHTML = '';
    infoPanel.appendChild(element);
  }
}

// else {
// Notifications are not supported or denied
// }

// Desktop notifications disabled because it disturbs more than it serves
// FIXME: remove all calls to nativeNotification since it is not useful anymore
// Notification.activateNative();

// :facepalm:
