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
 * @fileoverview A controller listens to a view element,
 *      and call the main {silex.controller.Controller} controller's methods
 *
 */
goog.provide('silex.controller.FileMenuController');

/**/const ControllerBase = goog.require('silex.controller.ControllerBase');

const {PublishDialog} = goog.require('silex.view.dialog.PublishDialog');
const FileExplorer = goog.require('silex.view.dialog.FileExplorer');



/**
 * @constructor
 * @extends {silex.controller.ControllerBase}
 * listen to the view events and call the main controller's methods}
 * @param {silex.types.Model} model
 * @param  {silex.types.View} view  view class which holds the other views
 */
silex.controller.FileMenuController = function(model, view) {
  // call super
super(model, view);
};

// inherit from silex.controller.ControllerBase
goog.inherits(silex.controller.FileMenuController/**/, ControllerBase);


/**
 * @param {?function()=} opt_cbk
 * @param {?function(Object)=} opt_errorCbk
 */
silex.controller.FileMenuController.prototype.loadTemplate = function(url, opt_cbk, opt_errorCbk) {
  this.model.file.openFromUrl(url, rawHtml => this.onOpened(opt_cbk, rawHtml), (err, msg) => this.onOpenError(err, msg, opt_errorCbk));
};


/**
 * load blank template
 * @param {?function()=} opt_cbk
 * @param {?function(Object)=} opt_errorCbk
 */
silex.controller.FileMenuController.prototype.loadBlank = function(opt_cbk, opt_errorCbk) {
  const blankUrl = '/libs/templates/silex-blank-templates/blank/editable.html';
  this.loadTemplate(blankUrl, opt_cbk, opt_errorCbk);
};


silex.controller.FileMenuController.prototype.openRecent = function(fileInfo, opt_cbk) {
  // a recent file was selected
  this.model.file.open(/** @type {silex.types.FileInfo} */ (fileInfo), rawHtml => this.onOpened(opt_cbk, rawHtml), err => {
    silex.utils.Notification.confirm(`Could not open this recent file, you probably need to connect to ${ fileInfo.service } again.`, ok => {
      const ce = silex.service.CloudStorage.getInstance().ce;
      console.log('before auth', ce);
      silex.utils.Notification.alert(`I am trying to connect you to ${ fileInfo.service } again, please accept the connection in the popup I have just opened then <strong>please wait</strong>.`, () => {});
      ce['auth'](fileInfo.service).then(res => {
        silex.utils.Notification.close();
        if(ok) {
          this.openRecent(fileInfo, opt_cbk);
        }
      });
    });
  });
};


/**
 * open a file
 * @param {?function()=} opt_cbk
 * @param {?function(Object)=} opt_errorCbk
 */
silex.controller.FileMenuController.prototype.newFile = function(opt_cbk, opt_errorCbk) {

  this.tracker.trackAction('controller-events', 'request', 'file.new', 0);
  this.view.dashboard.openDialog({
    openFileInfo: (fileInfo) => {
      if(!silex.types.FileInfo && !this.model.file.hasContent()) {
        // if the user closes the dialog and no website is being edited then load default blank website
        this.loadBlank(opt_cbk, opt_errorCbk);
      }
      else if(fileInfo) {
        this.openRecent(fileInfo, opt_cbk);
      }
    },
    openTemplate: (url) => {
      if(!url && !this.model.file.hasContent()) {
        // if the user closes the dialog and no website is being edited then load default blank website
        this.loadBlank(opt_cbk, opt_errorCbk);
      }
      else if(url) {
        // a template was selected
        this.loadTemplate(url, opt_cbk, opt_errorCbk);
      }
    },
    ready: () => {
      if(opt_cbk) {
        opt_cbk();
      }
    },
    error: err => {
      console.error('loading templates error');
      this.onOpenError(err, 'Loading templates error', opt_errorCbk);
    },
  });
};

silex.controller.FileMenuController.prototype.onOpened = function(opt_cbk, rawHtml) {
  // reset file URL in order to "save as" instead of "save"
  // this.model.file.setUrl(null);
  this.model.file.setHtml(rawHtml, () => {
    // undo redo reset
    this.undoReset();
    this.fileOperationSuccess(null, true);
  }, true); // with loader
  // QOS, track success
  this.tracker.trackAction('controller-events', 'success', 'file.new', 1);
  if(opt_cbk) {
    opt_cbk();
  }
};


/**
 * @param {Object} err
 * @param {string} msg
 * @param {?function(Object)=} opt_errorCbk
 */
silex.controller.FileMenuController.prototype.onOpenError = function(err, msg, opt_errorCbk) {
  console.error('opening template error', err);
  silex.utils.Notification.alert('An error occured. ' + msg, () => {});
  if (opt_errorCbk) {
    opt_errorCbk(err);
  }
  if(!this.model.file.hasContent()) {
    this.loadBlank();
  }
  this.tracker.trackAction('controller-events', 'error', 'file.new', -1);

};

/**
 * open a file
 * @param {?function(!silex.types.FileInfo)=} opt_cbk
 * @param {?function(*)=} opt_errorCbk
 * @param {?function()=} opt_cancelCbk
 */
silex.controller.FileMenuController.prototype.openFile = function(opt_cbk, opt_errorCbk, opt_cancelCbk) {
  // QOS, track success
  this.tracker.trackAction('controller-events', 'request', 'file.open', 0);
  // let the user choose the file
  this.view.fileExplorer.openFile(FileExplorer.HTML_EXTENSIONS)
    .then(fileInfo => {
      if(fileInfo) {
        this.model.file.open(fileInfo, rawHtml => {
          this.model.file.setHtml(rawHtml, () => {
            // undo redo reset
            this.undoReset();
            // display and redraw
            this.fileOperationSuccess((this.model.head.getTitle() || 'Untitled website') + ' opened.', true);
            // QOS, track success
            this.tracker.trackAction('controller-events', 'success', 'file.open', 1);
            if (opt_cbk) {
              opt_cbk(/** @type {silex.types.FileInfo} */ (fileInfo));
            }
          }, true); // with loader
        },
          (error, message) => {
            silex.utils.Notification.alert('Error: I did not manage to open this file. \n' + (message || error.message || ''), () => {
              if (opt_errorCbk) {
                opt_errorCbk(error);
              }
            });
            this.tracker.trackAction('controller-events', 'error', 'file.open', -1);
          });
      }
      else {
        if(opt_cancelCbk) opt_cancelCbk();
      }
    })
    .catch(error => {
      this.tracker.trackAction('controller-events', 'error', 'file.open', -1);
      if (opt_errorCbk) {
        opt_errorCbk(error);
      }
    });
};


silex.controller.FileMenuController.prototype.publishError = function(message) {
  this.tracker.trackAction('controller-events', 'error', 'file.publish', -1);
  console.error('Error: I did not manage to publish the file.', message);
  silex.utils.Notification.alert(`<strong>An error occured.</strong><p>I did not manage to publish the website. ${ message }</p><p><a href="${ silex.Config.ISSUES_SILEX }" target="_blank">Get help in Silex forums.</a></p>`, () => {});
};

/**
 * ask the user for a new file title
 * handle tracking and call the Dom helper
 */
silex.controller.FileMenuController.prototype.publish = function() {
  if(silex.utils.Notification.isActive) {
    console.warn('Publish canceled because a modal dialog is opened already.');
    return;
  }
  this.tracker.trackAction('controller-events', 'request', 'file.publish', 0);
  /** @type {silex.view.dialog.PublishDialog} */
  const dialog = new PublishDialog(this.model, this.view);
  dialog.open().then(publishOptions => {
    if(publishOptions) {
      this.doPublish(publishOptions, (errMsg, warningMsg, finalPublicationOptions) => {
        if(errMsg) {
          dialog.close();
          this.publishError(errMsg);
        }
        else if(warningMsg) {
          dialog.close();
          silex.utils.Notification.alert(warningMsg, () => {});
          this.tracker.trackAction('controller-events', 'cancel', 'file.publish', 0);
        }
        else {
          dialog.publish(/** @type {PublicationOptions} */ (finalPublicationOptions))
          .then(msg => {
            this.tracker.trackAction('controller-events', 'success', 'file.publish', 1);
            dialog.close();
            silex.utils.Notification.alert(msg, () => {});
          })
          .catch(msg => {
            dialog.close();
            this.publishError(msg);
          });
        }
      });
    }
    else {
      this.tracker.trackAction('controller-events', 'cancel', 'file.publish', 0);
    }
  })
  .catch(msg => this.publishError(msg));
};


/**
 * @param {PublicationOptions} publicationOptions
 * @param {function(?string, ?string, ?PublicationOptions)} cbk
 */
silex.controller.FileMenuController.prototype.doPublish = function(publicationOptions, cbk) {
  const publicationPath = publicationOptions['publicationPath'];
  const provider = publicationOptions['provider'];
  const vhost = publicationOptions['vhost'];

  // get info about the website file
  const file = this.model.file.getFileInfo();
  const isTemplate = this.model.file.isTemplate;

  // save new path when needed and get publication path
  if(publicationPath) this.model.head.setPublicationPath(publicationPath);
  const folder = this.model.head.getPublicationPath();
  if (!folder) {
    this.view.settingsDialog.open(function() {
      //here the panel was closed
    }, 'publish-pane');
    this.view.workspace.redraw(this.view);
    cbk(null, 'I do not know where to publish your site.' +
      'Select a folder in the settings pannel and do "publish" again.' +
      '\nNow I will open the publish settings.', null);
  }
  // the file must be saved somewhere because all URLs are made relative
  else if (!file || isTemplate) {
    console.error('The file must be saved before I can publish it.');
    cbk(null, 'The file must be saved before I can publish it.', null);
  }
  else {
    if(!provider) {
      const providerName = this.model.head.getHostingProvider();
      if(!providerName) {
        throw new Error('I need a hosting provider name for this website. And none is configured.');
      }
      else {
        silex.service.SilexTasks.getInstance().hosting(hosting => {
          /** @type {Provider} */ const storedProvider = hosting['providers'].find(p => p['name'] === providerName);
          if(!storedProvider) {
            silex.utils.Notification.alert(`Unknown provider ${ providerName }. Is it configured on this servier? Here are the hosting providers I know: ${ hosting['providers'].map(p => p['name']).join(', ') }`, () => {});
            throw new Error(`Unknown provider ${ providerName }. Is it configured on this servier? Here are the hosting providers I know: <ul>${ hosting['providers'].map(p => '<li>' + p['name'] + '</li>').join('') }</ul>`);
          }
          cbk(null, null, /** @type {PublicationOptions} */ ({
            'file': file,
            'publicationPath': folder,
            'provider': storedProvider,
          }));
        });
      }
    }
    else {
      cbk(null, null, /** @type {PublicationOptions} */ ({
        'file': file,
        'publicationPath': folder,
        'provider': provider,
      }));
    }
  }
};

