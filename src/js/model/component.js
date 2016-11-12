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
 * @fileoverview
 *   This class is used to manage Prodotype components
 *   Components are based on Silex elements, but Prodotype renders a template in it
 */

goog.provide('silex.model.Component');


/**
 * @constructor
 * @param  {silex.types.Model} model  model class which holds the other models
 * @param  {silex.types.View} view  view class which holds the other views
 */
silex.model.Component = function(model, view) {
  // store the model and the view
  /**
   * @type {silex.types.Model}
   */
  this.model = model;
  /**
   * @type {silex.types.View}
   */
  this.view = view;
  /**
   * @type {Prodotype}
   */
  this.prodotype = null;

  /**
   * @type {Array.<function(?Object)>}
   */
  this.readyCbkArr = [];
};

silex.model.Component.COMPONENT_CLASS_NAME = 'silex-component';

/**
 * load the Prodotype library
 */
silex.model.Component.prototype.initComponents = function(ui) {
  this.prodotype = new window['Prodotype'](ui, './libs/prodotype/components');
  this.prodotype.ready(err => {
    this.readyCbkArr.forEach(cbk => cbk(err));
    this.readyCbkArr = [];
  });
};


/**
 * notify when Prodotype library is ready
 * @param {function(?Object)} cbk callback to be called when prodotype is ready
 */
silex.model.Component.prototype.ready = function(cbk) {
  if(this.prodotype) this.prodotype.ready(err => cbk(err));
  // if(this.prodotype) cbk();
  else this.readyCbkArr.push(cbk);
};


/**
 * get Prodotype descriptor of the components
 * @return {Array} array of components descriptors
 */
silex.model.Component.prototype.getComponentsDef = function() {
  return this.prodotype ? this.prodotype.componentsDef : [];
}


/**
 * @param {Element} element component just added
 * @param {string} templateName type of component
 */
// silex.model.Component.prototype.onComponentAdded = function(element, type) {
silex.model.Component.prototype.initComponent = function(element, templateName) {
  const name = this.prodotype.createName(templateName, this.getAllComponents().map(el => {
    return {
      'name': this.model.property.getComponentData(el)['name'],
    };
  }));
  console.log('initComponent', element, templateName, name);
  this.model.property.setComponentData(element, {
    'name': name,
    'templateName': templateName,
  });
  this.prodotype.decorate(templateName, {
    'name': name,
  })
  .then(html => {
    this.model.element.setInnerHtml(element, html);
    this.updateDepenedencies();
  });
};


/**
 * @return {Array.<Element>}
 */
silex.model.Component.prototype.getAllComponents = function() {
  // get all elements which are components
  const components = this.model.body.getBodyElement().querySelectorAll('.' + silex.model.Component.COMPONENT_CLASS_NAME);
  // make an array out of it
  var arr = [];
  for (let idx=0; idx < components.length; idx++) arr.push(components[idx]);
  return arr;
};


/**
 * update the dependencies of Prodotype components
 */
silex.model.Component.prototype.updateDepenedencies = function() {
  const head = this.model.head.getHeadElement();
  const components = this.getAllComponents().map(el => {
    return {
      'templateName': this.model.property.getComponentData(el)['templateName'],
    };
  });
  // remove unused dependencies (scripts and style sheets)
  const nodeList = this.model.head.getHeadElement().querySelectorAll('[data-dependency]');
  const elements = [];
  for(let idx=0; idx<nodeList.length; idx++) elements.push(nodeList[idx]);
  const unused = this.prodotype.getUnusedDependencies(
    elements,
    components
  );
  for(let idx=0; idx < unused.length; idx++) {
    const el = unused[idx];
    head.removeChild(el);
    console.log('removed', el);
  };
  // add missing dependencies (scripts and style sheets)
  let missing = this.prodotype.getMissingDependencies(head, components);
  for(let idx=0; idx < missing.length; idx++) {
    const el = missing[idx];
    el.setAttribute('data-dependency', '');
    head.appendChild(el);
    console.log('added', el);
  };
};


/**
 *
 */
silex.model.Component.prototype.resetSelection = function() {
  if(this.prodotype) {
    this.prodotype.edit();
  }
};
/**
 * @param {Element} element, the component to edit
 */
silex.model.Component.prototype.edit = function(element) {
  const componentData = this.model.property.getComponentData(element);
  if(element && this.prodotype && componentData) {
    this.prodotype.edit(
      componentData,
      this.getAllComponents().map(el => {
        const name = this.model.property.getComponentData(el)['name'];
        const templateName = this.model.property.getComponentData(el)['templateName'];
        return {
          'name': name,
          'templateName': templateName,
          'displayName': `${name} (${templateName})`,
        };
      }),
      componentData['templateName'],
      {
        'onChange': (newData, html) => {
          this.model.property.setComponentData(element, newData);
          this.model.element.setInnerHtml(element, html);
        },
        'onBrowse': (e, cbk) => {
          console.error('TODO: call cloud explorer');
          e.preventDefault();
            this.browse(
              'publish.browse',
              '', // TODO: tracking
              (url, blob) => {
                cbk([{
                  'url': blob.url,
                  'lastModified': blob.lastModified, // not in blob?
                  'lastModifiedDate': blob.lastModifiedDate, // not in blob?
                  'name': blob.filename,
                  'size': blob.size,
                  'type': blob.type, // not in blob?
                }]);
              });
          }
      });
  }
};
