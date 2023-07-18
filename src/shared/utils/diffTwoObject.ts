import { isEqual } from 'lodash'

export const getArrayOfObjectDiff = <T extends Record<string, any>>(
  obj1: T,
  obj2: T,
): string[] => {
  const diff = Object.keys(obj1).reduce((result, key) => {
    if (!obj2.hasOwnProperty(key)) {
      result.push(key)
    } else if (isEqual(obj1[key], obj2[key])) {
      const resultKeyIndex = result.indexOf(key)
      result.splice(resultKeyIndex, 1)
    }
    return result
  }, Object.keys(obj2))

  return diff
}

export const getObjectOfObjectDiff = <T extends Record<string, any>>(
  obj1: T,
  obj2: T,
): Record<string, true> => {
  return getArrayOfObjectDiff(obj1, obj2).reduce(
    (a, c) => ({ ...a, [c]: true }),
    {},
  )
}
