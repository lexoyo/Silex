
type Value = string
class ValueArray extends Array<Value> {
  add(val: Value): ValueArray { return this.map(v => v + val) as ValueArray  }
}

test('chain', () => {
  const arr1 = new ValueArray('a', 'b')
  const arr2 = arr1.concat(['c']) as ValueArray
  expect(arr2).toBeInstanceOf(ValueArray)
  expect(arr2.add('x')).toHaveLength(3)
})
