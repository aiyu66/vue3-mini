import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

// 响应式对象的判断标记
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

// 原始对象Target的结构
interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
}

// 缓存reactive()创建的proxy对象
const reactiveProxyMap = new WeakMap<Target, any>()
// 缓存readonly()创建的proxy对象
const readonlyProxyMap = new WeakMap<Target, any>()

/**
 * 基于原始对象创建一个响应式的代理对象并返回
 * @param raw 原始对象
 * @returns 代理对象
 */
export function reactive(raw: object): any {
  return createReactiveObject(raw, mutableHandlers, reactiveProxyMap)
}

/**
 * 基于原始对象创建一个只读的proxy对象
 * @param raw 原始对象
 * @returns 一个只读的proxy对象
 */
export function readonly(raw: object): any {
  return createReactiveObject(raw, readonlyHandlers, readonlyProxyMap)
}

/**
 * 基于target类型创建一个不同类型的proxy对象
 * @param target 原始对象
 * @param handlers proxy的handlers, 分为可读可写, 只读等
 * @param proxyMap 缓存的proxy列表
 * @returns 返回一个proxy对象, 如果已经存在则从缓存中获取
 */
function createReactiveObject(
  target: Target,
  handlers: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  // 判断target是否在proxy的缓存中, 如果在, 则只从缓存中获取
  const existProxy = proxyMap.get(target)
  if (existProxy) {
    return existProxy
  }

  const proxy = new Proxy(target, handlers)
  proxyMap.set(target, proxy)
  return proxy
}

/**
 * 判断value是否是一个可读可写的响应式对象
 * @param value 对象
 * @returns true|false, true 表示value是一个响应式对象, 否则不是
 */
export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE])
}

/**
 * 判断value是否是只读的响应式对象
 * @param value 对象
 * @returns true|false, true表示value是一个readonly的响应式对象
 */
export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
