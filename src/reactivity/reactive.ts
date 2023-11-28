import {
  mutableHandlers,
  readonlyHandlers,
  ReactiveFlags
} from "./baseHandlers"

/**
 * 基于原始对象创建一个响应式的代理对象并返回
 * @param raw 原始对象
 * @returns 代理对象
 */
export function reactive(raw: object): any {
  return createReactiveObject(raw, mutableHandlers)
}

/**
 * 判断value是否是一个可读可写的响应式对象
 * @param value 对象
 * @returns true/false, true 表示value是一个响应式对象, 否则不是
 */
export function isReactive(value: object): boolean {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

/**
 * 基于原始对象创建一个只读的proxy对象
 * @param raw 原始对象
 * @returns 一个只读的proxy对象
 */
export function readonly(raw: object): any {
  return createReactiveObject(raw, readonlyHandlers)
}

/**
 * 判断value是否是只读的响应式对象
 * @param value 对象
 * @returns true/false, true表示value是一个readonly的响应式对象
 */
export function isReadonly(value: object): boolean {
  return !!value[ReactiveFlags.IS_READONLY]
}

function createReactiveObject(raw: object, handlers: ProxyHandler<any>) {
  return new Proxy(raw, handlers)
}
