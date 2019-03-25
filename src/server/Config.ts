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

/**
 * @fileoverview this is where the default config is defined
 * The values can be overriden with env vars or before passing the config to Silex
 * @see {@link https://github.com/lexoyo/silex-for-hosting-company|example of customization with the config object}
 * @see {@link https://github.com/silexlabs/Silex/blob/develop/app.json|all the env vars in this definition file for heroku 1 click deploy}
 * @see {@link https://github.com/silexlabs/Silex/wiki/How-to-Host-An-Instance-of-Silex#environment-variables|Silex env vars}
 */

// server options
export interface ServerOptions {
  debug: boolean,
  port: string,
  rootUrl: string,
  sessionSecret: string,
  cePath: string,
};
const PORT = process.env.PORT || '6805'; // 6805 is the date of sexual revolution started in paris france 8-)
const serverOptions: ServerOptions = {
  debug: process.env.SILEX_DEBUG === 'true',
  port: PORT,
  rootUrl: process.env.SERVER_URL || `http://localhost:${PORT}`,
  sessionSecret: process.env.SILEX_SESSION_SECRET || 'test session secret',
  cePath: '/ce',
};

// electron app
export interface ElectronOptions {
  enabled: boolean,
};
const electronOptions: ElectronOptions = {
  enabled: process.env.SILEX_ELECTRON  === 'true',
}

// SSL options
export interface SslOptions {
  forceHttps: boolean,
  trustXFPHeader: boolean,
  privateKey: string,
  certificate: string,
  sslPort: string,
};
const sslOptions: SslOptions = {
  forceHttps: process.env.SILEX_FORCE_HTTPS === 'true',
  trustXFPHeader: process.env.SILEX_FORCE_HTTPS_TRUST_XFP_HEADER === 'true',
  privateKey: process.env.SILEX_SSL_PRIVATE_KEY,
  certificate: process.env.SILEX_SSL_CERTIFICATE,
  sslPort: process.env.SSL_PORT || '443',
};

// cloud explorer options
export interface CeOptions {
  enableFtp: boolean,
  enableSftp: boolean,
  enableWebdav: boolean,
  githubClientId: string,
  githubClientSecret: string,
  dropboxClientId: string,
  dropboxClientSecret: string,
  enableFs: boolean,
  fsRoot: string,
  rootUrl: string,
};
const ceOptions: CeOptions = {
  enableFtp: process.env.ENABLE_FTP === 'true',
  enableSftp: process.env.ENABLE_SFTP != 'false', // true by default
  enableWebdav: process.env.ENABLE_WEBDAV === 'true',
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  dropboxClientId: process.env.DROPBOX_CLIENT_ID,
  dropboxClientSecret: process.env.DROPBOX_CLIENT_SECRET,
  enableFs: serverOptions.debug || electronOptions.enabled || process.env.ENABLE_FS === 'true',
  fsRoot: process.env.FS_ROOT,
  rootUrl: serverOptions.rootUrl + serverOptions.cePath,
};

export interface PublisherOptions {
  rootUrl: string,
  port: string,
  skipHostingSelection: boolean,
  enableHostingGhPages: boolean,
  enableHostingUnifile: boolean,
  enableHostingJekyll: boolean,
};
const publisherOptions: PublisherOptions = {
  rootUrl: serverOptions.rootUrl,
  port: serverOptions.port,
  skipHostingSelection: process.env.SKIP_HOSTING_SELECTION === 'true',
  enableHostingGhPages: process.env.ENABLE_HOSTING_GH_PAGES === 'true',
  enableHostingUnifile: process.env.ENABLE_HOSTING_UNIFILE != 'false', // true by default
  enableHostingJekyll: process.env.ENABLE_HOSTING_JEKYLL === 'true',
}

export default class DefaultConfig {
  ceOptions = ceOptions;
  serverOptions = serverOptions;
  publisherOptions = publisherOptions;
  electronOptions = electronOptions;
  sslOptions = sslOptions;
};

