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
 * @fileoverview Constants shared between front and back
 *
 */

export class Constants {
  /**
   * class name set on the body while the user is dragging an element
   */
  static DRAGGING_CLASS_NAME: string = 'dragging-pending';

  /**
   * class name set on elements in which we are about to drop
   */
  static DROP_CANDIDATE_CLASS_NAME: string = 'drop-zone-candidate';

  /**
   * class name set when mouse is over the element **in the bread crumbs component**
   */
  static EDITABLE_STYLE_HOVER_CLASS = 'editable-style-hover';

  /**
   * constant for the class name of the pages
   */
  static PAGE_CLASS_NAME: string = 'page-element';

  /**
   * constant for the class name of elements visible only on some pages
   */
  static PAGED_CLASS_NAME: string = 'paged-element';

  /**
   * constant for the class name set on the body when the pageable plugin is
   * initialized
   */
  static PAGEABLE_PLUGIN_READY_CLASS_NAME: string = 'pageable-plugin-created';

  /**
   * constant for the class name of elements visible only on some pages
   */
  static PAGED_HIDDEN_CLASS_NAME: string = 'paged-element-hidden';

  /**
   * constant for the class name of element containing the pages
   */
  static PAGES_CONTAINER_CLASS_NAME: string = 'silex-pages';

  /**
   * constant for the class name of elements when it is in a visible page
   * this css class is set in pageable.js
   */
  static PAGED_VISIBLE_CLASS_NAME: string = 'paged-element-visible';

  /**
   * constant for the class name of links when it links to a visible page
   * this css class is set in pageable.js
   */
  static PAGE_LINK_ACTIVE_CLASS_NAME: string = 'page-link-active';

  /**
   * constant for loader on elements
   */
  static LOADING_ELEMENT_CSS_CLASS: string = 'loading-image';

  /**
   * constant for silex element type
   */
  static TYPE_CONTAINER: string = 'container';

  /**
   * constant for silex element type
   */
  static TYPE_SECTION: string = 'section';

  /**
   * constant for the content element of a section, which is also a container
   */
  static TYPE_CONTAINER_CONTENT: string = 'silex-container-content';

  /**
   * constant for silex element type
   */
  static TYPE_IMAGE: string = 'image';

  /**
   * constant for silex element type
   */
  static TYPE_TEXT: string = 'text';

  /**
   * constant for silex element type
   */
  static TYPE_HTML: string = 'html';

  /**
   * constant for silex element type
   */
  static TYPE_ATTR: string = 'data-silex-type';

  /**
   * constant for the class name of the element content
   */
  static ELEMENT_CONTENT_CLASS_NAME: string = 'silex-element-content';

  /**
   * constant for the class name of the default site width, rule is set when
   * setting is changed used to set a default width to section content container
   */
  static WEBSITE_WIDTH_CLASS_NAME: string = 'website-width';

  /**
   * constant for the attribute name of the links
   */
  static LINK_ATTR: string = 'data-silex-href';

  /**
   * constant for the class name of selected components
   */
  static SELECTED_CLASS_NAME: string = 'silex-selected';

  /**
   * constant for the class name of pasted components
   * this will be removed from the component as soon as it is dragged
   */
  static JUST_ADDED_CLASS_NAME: string = 'silex-just-added';

  /**
   * class for elements which are hidden in mobile version
   */
  static HIDE_ON_MOBILE: string = 'hide-on-mobile';

  /**
   * class for elements which are hidden in desktop version
   */
  static HIDE_ON_DESKTOP: string = 'hide-on-desktop';

  /**
   * attribute name used to store the type of element
   */
  static SILEX_TYPE_ATTR_NAME: string = 'data-silex-type';

  /**
   * class name used by the editable jquery plugin
   */
  static EDITABLE_CLASS_NAME: string = 'editable-style';

  /**
   * class name which can be used to change params of the eitable jquery plugin
   */
  static PREVENT_RESIZABLE_CLASS_NAME: string = 'prevent-resizable';

  /**
   * class name which can be used to change params of the eitable jquery plugin
   */
  static PREVENT_DRAGGABLE_CLASS_NAME: string = 'prevent-draggable';

  /**
   * class name which can be used to change params of the eitable jquery plugin
   */
  static PREVENT_DROPPABLE_CLASS_NAME: string = 'prevent-droppable';

  /**
   * id of the style element which holds silex editable css styles
   */
  static SILEX_STYLE_ELEMENT_CSS_CLASS = 'silex-style';

  /**
   * id of the style element which holds silex editable css styles
   */
  static SILEX_SCRIPT_ELEMENT_CSS_CLASS = 'silex-script';

  /**
   * css class which marks the tags added to load a custom font
   */
  static CUSTOM_FONTS_CSS_CLASS = 'silex-custom-font';

  /**
   * css class set to enable mobile version
   */
  static ENABLE_MOBILE_CSS_CLASS = 'enable-mobile';

  // sticky lines constants
  static STICKY_DISTANCE = 5;
  static STUCK_CSS_CLASS = 'stuck';
  static STUCK_LEFT_CSS_CLASS = 'stuck-left';
  static STUCK_RIGHT_CSS_CLASS = 'stuck-right';
  static STUCK_TOP_CSS_CLASS = 'stuck-top';
  static STUCK_BOTTOM_CSS_CLASS = 'stuck-bottom';

  // head tag constants
  static SILEX_CURRENT_PAGE_ID = 'current-page-style';
  static SILEX_TEMP_TAGS_CSS_CLASS = 'silex-temp-tag';
  static RISZE_HANDLE_CSS_CLASS = 'ui-resizable-handle';
  static JSON_STYLE_TAG_CLASS_NAME = 'silex-json-styles';
  static INLINE_STYLE_TAG_CLASS_NAME = 'silex-inline-styles';
  static HEAD_TAG_START = '<!-- Silex HEAD tag do not remove -->';
  static HEAD_TAG_STOP = '<!-- End of Silex HEAD tag do not remove -->';

  // prodotype components constants
  static COMPONENT_CLASS_NAME = 'silex-component';
  static STYLE_CLASS_NAME = 'silex-prodotype-style';
  static BODY_STYLE_NAME = 'All style';
  static BODY_STYLE_CSS_CLASS = 'all-style';
  static EMPTY_STYLE_CLASS_NAME = 'empty-style-class-name';
  static EMPTY_STYLE_DISPLAY_NAME = '';
  static COMPONENT_TYPE = 'component';
  static STYLE_TYPE = 'style';
  // available visibility for the styles
  static STYLE_VISIBILITY = ['desktop', 'mobile'];

  /**
   * constant for the class names which are of internal use in Silex
   * they do not appear in the "css classes" text field of the style-pane
   */
  static SILEX_CLASS_NAMES: string[] = [
    Constants.DRAGGING_CLASS_NAME, Constants.DROP_CANDIDATE_CLASS_NAME,
    Constants.PREVENT_DROPPABLE_CLASS_NAME, Constants.PREVENT_RESIZABLE_CLASS_NAME,
    Constants.PREVENT_DRAGGABLE_CLASS_NAME, Constants.EDITABLE_CLASS_NAME,
    Constants.ENABLE_MOBILE_CSS_CLASS, Constants.PAGED_CLASS_NAME,
    Constants.PAGED_HIDDEN_CLASS_NAME, Constants.PAGED_VISIBLE_CLASS_NAME,
    Constants.PAGEABLE_PLUGIN_READY_CLASS_NAME, Constants.PAGE_LINK_ACTIVE_CLASS_NAME,
    Constants.SELECTED_CLASS_NAME, Constants.JUST_ADDED_CLASS_NAME,
    Constants.ELEMENT_CONTENT_CLASS_NAME,
    // useful to hide it when the content container of a section is selected
    Constants.TYPE_CONTAINER_CONTENT,
    // useful to hide it when the content container of a section is selected
    Constants.WEBSITE_WIDTH_CLASS_NAME, Constants.TYPE_CONTAINER + '-element',
    Constants.TYPE_SECTION + '-element', Constants.TYPE_IMAGE + '-element',
    Constants.TYPE_TEXT + '-element', Constants.TYPE_HTML + '-element',
    Constants.HIDE_ON_MOBILE, Constants.COMPONENT_CLASS_NAME,
    Constants.EDITABLE_STYLE_HOVER_CLASS,
    // sticky lines classes
    Constants.STUCK_CSS_CLASS, Constants.STUCK_LEFT_CSS_CLASS,
    Constants.STUCK_RIGHT_CSS_CLASS, Constants.STUCK_TOP_CSS_CLASS,
    Constants.STUCK_BOTTOM_CSS_CLASS
  ];
  static SILEX_TEMP_CLASS_NAMES = [
    Constants.DRAGGING_CLASS_NAME,
    Constants.DROP_CANDIDATE_CLASS_NAME,
    Constants.EDITABLE_CLASS_NAME,
    Constants.PAGE_LINK_ACTIVE_CLASS_NAME,
    Constants.PAGEABLE_PLUGIN_READY_CLASS_NAME,
    Constants.PAGED_HIDDEN_CLASS_NAME,
    Constants.PAGED_VISIBLE_CLASS_NAME,
    Constants.JUST_ADDED_CLASS_NAME,
    Constants.SELECTED_CLASS_NAME,
  ];
  static RESIZE_HANDLE_CSS_CLASSES = [
      'ui-resizable-n',
      'ui-resizable-s',
      'ui-resizable-e',
      'ui-resizable-w',
      'ui-resizable-ne',
      'ui-resizable-nw',
      'ui-resizable-se',
      'ui-resizable-sw'
  ];
}
