import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

/**
 * 基于原始对象创建一个响应式的代理对象并返回
 * @param raw 原始对象
 * @returns 代理对象
 */
export function reactive(raw: object): any {
  return createReactiveObject(raw, mutableHandlers)
}

/**
 * 基于原始对象创建一个只读的proxy对象
 * @param raw 原始对象
 * @returns 一个只读的proxy对象
 */
export function readonly(raw: object): any {
  return createReactiveObject(raw, readonlyHandlers)
}

function createReactiveObject(raw: object, handlers: ProxyHandler<any>) {
  return new Proxy(raw, handlers)
}
