import { Constants } from '../../Constants';
import { Controller, Model } from '../types';
// import { Stage } from 'stage'; // this is not recognized by my IDE
import { Stage } from '../../../node_modules/stage/src/ts/index';
import { ScrollData, SelectableState } from '../../../node_modules/stage/src/ts/Types';

export class StageWrapper {
  private stage: Stage;
  /**
   *
   * @param element   container to render the UI
   * @param model  model class which holds
   * the model instances - views use it for
   * read operation only
   * @param controller  structure which holds
   * the controller instances
   */
  constructor(protected element: HTMLElement, protected model: Model, protected controller: Controller) {}

  redraw() {
    if(!this.stage) return;
    this.stage.redraw();
  }
  resizeWindow() {
    if(!this.stage) return;
    this.stage.resizeWindow();
  }
  addElement(element: HTMLElement) {
    if(!this.stage) return;
    this.stage.addElement(element);
  }
  removeElement(element: HTMLElement) {
    if(!this.stage) return;
    this.stage.removeElement(element);
  }
  center(elements: HTMLElement[]) {
    if(!this.stage) return;
    this.stage.center(elements);
  }
  getDropZone(posX: number, posY: number, element: HTMLElement): HTMLElement {
    if(!this.stage) return this.model.body.getBodyElement();
    return this.stage.getDropZone(posX, posY, element);
  }
  getScroll(): ScrollData {
    if(!this.stage) return {x: 0, y: 0};
    return this.stage.getScroll();
  }
  setScroll(scroll: ScrollData) {
    if(!this.stage) return;
    this.stage.setScroll(scroll);
  }
  getState(el: HTMLElement): SelectableState {
    if(!this.stage) return null;
    return this.stage.getState(el);
  }
  setState(el: HTMLElement, state: SelectableState) {
    if(!this.stage) return;
    this.stage.setState(el, state);
  }
  getSelection(): SelectableState[] {
    if(!this.stage) return [];
    return this.stage.getSelection();
  }
  setSelection(elements: HTMLElement[]) {
    if(!this.stage) return;
    this.stage.setSelection(elements);
  }
  getEditMode(): boolean {
    if(!this.stage) return false;
    return this.stage.catchingEvents;
  }
  setEditMode(mode: boolean) {
    if(!this.stage) return;
    if(this.stage.catchingEvents === mode) {
      this.stage.catchingEvents = !mode;
    }
  }

  cleanup() {
    // cleanup
    if(!!this.stage) {
      this.stage.cleanup();
      this.stage = null;
    }
  }

  init(iframe: HTMLIFrameElement) {
    this.cleanup();
    this.stage = new Stage(iframe, iframe.contentWindow.document.querySelectorAll(`[${Constants.ELEMENT_ID_ATTR_NAME}]`), {
      isSelectable: (el => !el.classList.contains(Constants.PREVENT_SELECTABLE_CLASS_NAME)),
      isDraggable: (el => !el.classList.contains(Constants.PREVENT_DRAGGABLE_CLASS_NAME)),
      isDropZone: ((el) => !el.classList.contains(Constants.PREVENT_DROPPABLE_CLASS_NAME) && el.classList.contains(Constants.TYPE_CONTAINER)),
      isResizeable: ((el) => {
        return el.classList.contains(Constants.PREVENT_RESIZABLE_CLASS_NAME) ? false : ({
          top: !el.classList.contains(Constants.PREVENT_RESIZABLE_TOP_CLASS_NAME),
          left: !el.classList.contains(Constants.PREVENT_RESIZABLE_LEFT_CLASS_NAME),
          bottom: !el.classList.contains(Constants.PREVENT_RESIZABLE_BOTTOM_CLASS_NAME),
          right: !el.classList.contains(Constants.PREVENT_RESIZABLE_RIGHT_CLASS_NAME),
        })
      }),
      useMinHeight: ((el) => !el.classList.contains(Constants.SILEX_USE_HEIGHT_NOT_MINHEIGHT)),
      canDrop: ((el: HTMLElement, dropZone: HTMLElement) => {
        // sections can only be dropped in the body
        return !el.classList.contains(Constants.TYPE_SECTION)
          || dropZone.tagName.toLowerCase() === 'body';
      }),
      onDrop: selectables => {
        selectables.forEach(s => {
          if(!s.el.classList.contains(Constants.TYPE_SECTION)) {
            this.model.element.setStyle(s.el, 'top', s.metrics.computedStyleRect.top + 'px');
            this.model.element.setStyle(s.el, 'left', s.metrics.computedStyleRect.left + 'px');
          }
          s.el.style.top = '';
          s.el.style.left = '';
          s.el.style.right = '';
          s.el.style.bottom = '';
          s.el.style.width = '';
          s.el.style.height = '';
          s.el.style.minHeight = '';
          s.el.style.position = '';
        });
        this.updateView();
      },
      onResizeEnd: selectables => {
        selectables.forEach(s => {
          this.model.element.setStyle(s.el, 'top', s.metrics.computedStyleRect.top + 'px');
          this.model.element.setStyle(s.el, 'left', s.metrics.computedStyleRect.left + 'px');
          this.model.element.setStyle(s.el, 'width', s.metrics.computedStyleRect.width + 'px');
          this.model.element.setStyle(s.el, s.useMinHeight ? 'min-height' : 'height', s.metrics.computedStyleRect.height + 'px');
          s.el.style.top = '';
          s.el.style.left = '';
          s.el.style.right = '';
          s.el.style.bottom = '';
          s.el.style.width = '';
          s.el.style.height = '';
          s.el.style.minHeight = '';
          s.el.style.position = '';
        });
        this.updateView();
      },
      onEdit: () => {
        this.controller.editMenuController.editElement();
      },
      onSelect: change => this.updateView(),
      onResize: change => this.updateView(),
      onDrag: change => this.updateView(),
    });
  }
  updateView() {
    const selection = this.stage.getSelection();
    this.model.body.setSelection(selection.map(s => s.el));
  }
}
