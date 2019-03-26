//////////////////////////////////////////////////
// Silex, live web creation
// http://projects.silexlabs.org/?/silex/
//
// Copyright (c) 2012 Silex Labs
// http://www.silexlabs.org/
//
// Silex is available under the GPL license
// http://www.silexlabs.org/silex/silex-licensing/
//////////////////////////////////////////////////

// node modules
const Path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const nodeModules = require('node_modules-path');
const session = require('cookie-session');
const serveStatic = require('serve-static');
import CloudExplorerRouter from './router/CloudExplorerRouter';
import WebsiteRouter from './router/WebsiteRouter.js';
import PublishRouter from './router/PublishRouter.js';
import SslRouter from './router/SslRouter.js';

export default function SilexServer(options) {
  this.options = options;
  const {
    serverOptions,
    publisherOptions,
    ceOptions,
    electronOptions,
    sslOptions,
  } = this.options;

  this.app = express();

  // compress gzip when possible
  this.app.use(compression());

  // cookie & session
  this.app.use(bodyParser.json({limit: '1mb'}));
  this.app.use(bodyParser.text({limit: '10mb'}));
  this.app.use(cookieParser());
  this.app.use(session({
    name: 'silex-session',
    secret: serverOptions.sessionSecret,
  }));

  // create the routes for unifile/CloudExplorer
  // and for Silex tasks
  this.ceRouter = CloudExplorerRouter(ceOptions);
  this.websiteRouter = WebsiteRouter(serverOptions, this.ceRouter.unifile);
  this.publishRouter = PublishRouter(publisherOptions, this.ceRouter.unifile);
  this.sslRouter = SslRouter(sslOptions, this.app);
  this.unifile = this.ceRouter.unifile; // for access by third party
};

SilexServer.prototype.start = function(cbk) {
  const {
    serverOptions,
    publisherOptions,
    ceOptions,
    electronOptions,
    sslOptions,
  } = this.options;

  // use routers
  this.app.use(serverOptions.cePath, this.ceRouter);
  this.app.use(this.websiteRouter);
  this.app.use(this.publishRouter);
  this.app.use(this.sslRouter);

  // add static folders to serve silex files
  this.app.use('/', serveStatic(Path.join(__dirname, '../../dist/client')));
  // debug silex, for js source map
  this.app.use('/js/src', serveStatic(Path.join(__dirname, '../../src')));
  // the scripts which have to be available in all versions (v2.1, v2.2, v2.3, ...)
  this.app.use('/static', serveStatic(Path.join(__dirname, '../../static')));
  // wysihtml
  this.app.use('/libs/wysihtml', serveStatic(Path.resolve(nodeModules('wysihtml'), 'wysihtml/parser_rules')));
  this.app.use('/libs/wysihtml', serveStatic(Path.resolve(nodeModules('wysihtml'), 'wysihtml/dist/minified')));
  // js-beautify
  this.app.use('/libs/js-beautify', serveStatic(Path.resolve(nodeModules('js-beautify'), 'js-beautify/js/lib')));
  // ace
  this.app.use('/libs/ace', serveStatic(Path.resolve(nodeModules('ace-builds'), 'ace-builds/src-min')));
  // alertify
  this.app.use('/libs/alertify', serveStatic(Path.resolve(nodeModules('alertifyjs'), 'alertifyjs/build')));
  // // normalize.css
  // this.app.use('/libs/normalize.css', serveStatic(Path.resolve(nodeModules('normalize.css'), 'normalize.css')));
  // font-awesome
  this.app.use('/libs/font-awesome/css', serveStatic(Path.resolve(nodeModules('font-awesome'), 'font-awesome/css')));
  this.app.use('/libs/font-awesome/fonts', serveStatic(Path.resolve(nodeModules('font-awesome'), 'font-awesome/fonts')));
  // templates
  this.app.use('/libs/templates/silex-templates', serveStatic(Path.resolve(nodeModules('silex-templates'), 'silex-templates')));
  this.app.use('/libs/templates/silex-blank-templates', serveStatic(Path.resolve(nodeModules('silex-blank-templates'), 'silex-blank-templates')));
  this.app.use('/libs/prodotype', serveStatic(Path.resolve(nodeModules('prodotype'), 'prodotype/pub')));

  // Start Silex as an Electron app
  if(electronOptions.enabled) {
    require(Path.join(__dirname, 'silex_electron'));
  }

  // server 'loop'
  this.app.listen(serverOptions.port, function() {
    console.log('Listening on ' + serverOptions.port);
    if(cbk) cbk();
  });
};

