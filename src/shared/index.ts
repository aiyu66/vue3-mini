// 扩展对象的属性到另一个对象上
export const extend = Object.assign

/**
 * 判断 value 是否是一个对象类型
 * @param value 对象
 * @returns true|false, true: 表示value是一个对象类型
 */
export function isObject(value: unknown): boolean {
  return value !== null && typeof value === "object"
}

/**
 * 判断 oldValue 和 newValue 是否不一样
 * @param oldValue 旧值
 * @param newValue 新值
 * @returns true|false, true: 表示 新值和旧值不一样
 */
export function isChange(oldValue: unknown, newValue: unknown): boolean {
  return !Object.is(oldValue, newValue)
}
