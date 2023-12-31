import { isObject, warn } from "../shared"
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
  shallowReactiveHandlers
} from "./baseHandlers"

// 响应式对象的判断标记

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  IS_SHALLOW = "__v_isShallow",
  RAW = "raw"
}

export const ITERATE_KEY = Symbol("iterate_key")
// 数组的length属性
export const ARRAY_LENGTH_KEY = "length"

// trigger的类型
export const enum TriggerType {
  ADD = "add",
  SET = "set",
  DELETE = "delete"
}

// 原始对象Target的结构
interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
}

// 缓存reactive()创建的proxy对象
const reactiveProxyMap = new WeakMap<Target, any>()
// 缓存readonly()创建的proxy对象
const readonlyProxyMap = new WeakMap<Target, any>()
// 缓存 shallowReadonly 创建的 proxy 对象
const shallowReadonlyProxyMap = new WeakMap<Target, any>()
// 缓存 shallowReactive 创建的 proxy 对象
const shallowReactiveProxyMap = new WeakMap<Target, any>()

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

export function shallowReactive(raw: object): any {
  return createReactiveObject(
    raw,
    shallowReactiveHandlers,
    shallowReactiveProxyMap
  )
}

/**
 * 基于原始对象创建一个浅层的readonly响应式对象
 * @param raw 原始对象
 * @returns 返回一个浅层的readonly响应式对象
 */
export function shallowReadonly(raw: object): any {
  return createReactiveObject(
    raw,
    shallowReadonlyHandlers,
    shallowReadonlyProxyMap
  )
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

  // 判断 target 是否是一个对象, 如果不是直接退出, 因为Proxy只能代理对象, 不能代理普通类型
  if (!isObject(target)) {
    warn(`target: ${target}不是一个对象`)
    return
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

/**
 * 判断value是否是浅层的响应式对象
 * @param value 对象
 * @returns true|false, true表示value是一个浅层的响应式对象
 */
export function isShallow(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_SHALLOW])
}

/**
 * 判断value是否是对象, 如果是就转成响应式的,否则返回自身
 * @param value 普通值或对象
 * @returns 响应式的对象或普通值
 */
export function toReactive(value: any) {
  return isObject(value) ? reactive(value) : value
}
