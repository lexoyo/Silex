import { ELEM_TEXT, ELEM_IMAGE, ELEM_CONTAINER, ELEM_SECTION_CONTENT, ELEM_HTML } from '../../test-utils/data-set';
import { initializeElements } from '../element-store/index';
import { getParent, isBody, getBody, getChildren, getChildrenRecursive } from '../element-store/filters';

beforeEach(() => {
  initializeElements([ELEM_TEXT, ELEM_IMAGE, ELEM_HTML, ELEM_CONTAINER])
})

test('find parent', () => {
  expect(getParent(ELEM_TEXT).id).toBe(ELEM_CONTAINER.id)
  expect(getParent(ELEM_IMAGE).id).toBe(ELEM_CONTAINER.id)
  expect(getParent(ELEM_CONTAINER)).toBeUndefined()
})

test('find children', () => {
  const elem3Children = getChildren(ELEM_CONTAINER)
  expect(elem3Children).toHaveLength(3)
  expect(elem3Children[0].id).toBe(ELEM_TEXT.id)
  expect(elem3Children[1].id).toBe(ELEM_IMAGE.id)
  expect(elem3Children[2].id).toBe(ELEM_HTML.id)

  const elem3ChildrenRecursive = getChildrenRecursive(ELEM_CONTAINER)
  expect(elem3ChildrenRecursive).toHaveLength(3)
  expect(elem3ChildrenRecursive[0].id).toBe(ELEM_TEXT.id)
  expect(elem3ChildrenRecursive[1].id).toBe(ELEM_IMAGE.id)
  expect(elem3ChildrenRecursive[2].id).toBe(ELEM_HTML.id)

  const elem4ChildrenRecursive = getChildrenRecursive(ELEM_SECTION_CONTENT)
  expect(elem4ChildrenRecursive).toHaveLength(4)
  expect(elem4ChildrenRecursive[0].id).toBe(ELEM_CONTAINER.id)
  expect(elem4ChildrenRecursive[1].id).toBe(ELEM_TEXT.id)
  expect(elem4ChildrenRecursive[2].id).toBe(ELEM_IMAGE.id)
  expect(elem4ChildrenRecursive[3].id).toBe(ELEM_HTML.id)
})
