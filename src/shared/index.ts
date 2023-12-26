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

/**
 * 判断 obj中是否有 key, 如果有返回对应的value, 否则返回 undefined
 * @param obj 对象
 * @param key 对象中的key
 * @returns 返回key对应的value 或 undefined
 */
export function hasOwn(obj: object, key: string | symbol): unknown | undefined {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

// console.warn 的别名
export const warn = console.warn

// 把字符串的首字母转为大写
const captilize = (str: string) =>
  str.charAt(0).toUpperCase().concat(str.slice(1))

// 使用 'on' 连接转换后的eventName
export const toHandlerKey = (str: string) => {
  const eventPrefix = "on"
  return str ? eventPrefix.concat(captilize(str)) : ""
}

// 把 - 后边的字符转成大写
export const camelize = (str: string) => {
  // _:表示匹配到的字符
  // c:表示正则中()部分的字符
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ""
  })
}
