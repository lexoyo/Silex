import { DomDirection, ElementState } from './types';
import { ElementArray } from './element'

test('chain', () => {
  const arr1 = new ElementArray({} as ElementState, {} as ElementState)
  const arr2 = arr1.concat([{} as ElementState]) as ElementArray
  expect(arr2).toBeInstanceOf(ElementArray)
})

const input = [{
    id: 'child 1',
    children: [],
    selected: true,
  }, {
    id: 'child 2',
    children: [],
    selected: false,
  }, {
    id: 'parent',
    children: ['child 1', 'child 2'],
    selected: false,
  }, {
    id: 'parent parent',
    children: ['parent'],
    selected: false,
  },
] as ElementState[]

const [CHILD1, CHILD2, PARENT, ROOT] = input

test('root', () => {
  const elements = new ElementArray(...input)
  expect(elements.root()).toBe(ROOT)
})

test('parent', () => {
  const elements = new ElementArray(...input)
  expect(elements.parent(CHILD2)).toBe(PARENT)
})

test('select', () => {
  const elements = new ElementArray(...input)
  expect(elements.select([CHILD1])).toEqual(elements)
  expect(elements.select([]).filter((el) => el.selected)).toEqual([])
  expect(elements.select([CHILD2]).filter((el) => el.selected).map((el) => el.id))
    .toEqual(['child 2'])
  expect(elements.select([CHILD2, CHILD2]).filter((el) => el.selected).map((el) => el.id))
    .toEqual(['child 2'])
  expect(elements.select([CHILD1, CHILD2]).filter((el) => el.selected).map((el) => el.id))
    .toEqual(['child 1', 'child 2'])
})

test('children', () => {
  const elements = new ElementArray(...input)
  expect(elements.children(ROOT, true)).toEqual([PARENT, CHILD1, CHILD2])
  expect(elements.children(PARENT, true)).toEqual([CHILD1, CHILD2])
  expect(elements.children(CHILD1, true)).toEqual([])
  expect(elements.children(CHILD1, false)).toEqual([])
  expect(elements.children(ROOT, false)).toEqual([PARENT])
})

test('with ids', () => {
  const elements = new ElementArray(...input)
  expect(elements.ids(['child 1', 'parent'])).toEqual([CHILD1, PARENT])
})


test('move 1 element', () => {
  const CHILD3 = {
    id: 'child 3',
    children: [],
    selected: false,
  } as ElementState
  const input2 = input.concat([CHILD3])
  input2[2] = {
    ...PARENT,
    children: PARENT.children.concat(['child 3']),
  }
  const elements = new ElementArray(...input2)

  expect(input2[2].children).toEqual([CHILD1.id, CHILD2.id, CHILD3.id])
  let changed = elements.move([CHILD1], DomDirection.DOWN)
  expect(changed).toHaveLength(1)
  expect(changed[0].children).toEqual([CHILD2.id, CHILD1.id, CHILD3.id])
  changed = elements.move([], DomDirection.DOWN)
  expect(changed).toHaveLength(0)
  changed = elements.move([CHILD1], DomDirection.BOTTOM)
  expect(changed[0].children).toEqual([CHILD2.id, CHILD3.id, CHILD1.id])
  changed = elements.move([CHILD2], DomDirection.UP)
  expect(changed[0].children).toEqual([CHILD2.id, CHILD1.id, CHILD3.id])
  changed = elements.move([CHILD2], DomDirection.TOP)
  expect(changed[0].children).toEqual([CHILD2.id, CHILD1.id, CHILD3.id])
  changed = elements.move([CHILD1], DomDirection.UP)
  expect(changed).toHaveLength(0)
  changed = elements.move([CHILD3], DomDirection.DOWN)
  expect(changed).toHaveLength(0)
})
