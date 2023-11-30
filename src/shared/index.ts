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
