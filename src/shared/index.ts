// 扩展对象的属性到另一个对象上
export const extend = Object.assign

// 判断是否是数组
export const isArray = Array.isArray

/**
 * 判断 value 是否是一个对象类型
 * @param value 对象
 * @returns true|false, true: 表示value是一个对象类型
 */
export function isObject(value: unknown): boolean {
  return value !== null && typeof value === "object"
}

/**
 * 判断value是否是一个函数
 * @param value 函数
 * @returns true|false, true 表示value是一个函数
 */
export function isFunction(value: unknown): boolean {
  return value !== null && typeof value === "function"
}

/**
 * 判断value是否是symbol类型
 * @param value 对象
 * @returns true|false, true: 表示value是symbol类型
 */
export function isSymbol(value: unknown): boolean {
  return value !== null && typeof value === "symbol"
}

/**
 * 判断value是否是字符串
 * @param value 字符串
 * @returns true|false, true:表示value是一个字符串类型
 */
export function isString(value: unknown): boolean {
  return value !== null && typeof value === "string"
}

/**
 * 判断value是否是一个空对象
 * @param value 字符串
 * @returns true|false, true:表示value是空对象
 */
export function isNull(value: undefined): boolean {
  return value === null
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
