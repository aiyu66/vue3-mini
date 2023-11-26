import { track, trigger } from "."

/**
 * 基于原始对象创建一个代理对象
 * @param raw 原始对象
 * @returns 代理对象
 */
export function reactive(raw: object) {
  return new Proxy(raw, {
    get(target, key) {
      const value = Reflect.get(target, key)

      // 收集依赖
      track(target, key)

      return value
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)

      // 触发依赖
      trigger(target, key)
      return res
    }
  })
}
