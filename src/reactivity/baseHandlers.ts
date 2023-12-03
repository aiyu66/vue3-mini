import { track, trigger } from "./effect"
import {
  ReactiveFlags,
  reactive,
  readonly,
  ITERATE_KEY,
  TriggerType
} from "./reactive"
import { extend, isObject } from "../shared"

// 顶层中创建 get/set, 具有缓存作用, 不会被多次创建
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReactiveGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)

/**
 * 创建一个getter函数, 通过isReadonly标记是否需要收集依赖
 * @param isReadonly 是否是只读的响应式对象, 默认为false, 也就是可以被set
 * @returns getter函数
 */
function createGetter(isReadonly: boolean = false, isShallow: boolean = false) {
  return function (target: object, key: string | symbol) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    }

    const value = Reflect.get(target, key)

    if (isShallow && isReadonly) {
      // 如果是浅层且readonly的, 那么不需要对value做任何操作, 直接返回即可
      return value
    }

    if (isObject(value)) {
      // value是对象, 需要分别处理
      if (isShallow) {
        // 如果是浅层的, 那么直接返回value, 这样嵌套的对象发生变化时, 不会触发依赖
        return value
      }
      // 说明深层的对象也继续使用reactive/readonly转换成响应式对象
      return isReadonly ? readonly(value) : reactive(value)
    }

    if (!isReadonly) {
      // 只有isReadonly为false时才需要收集依赖
      track(target, key)
    }

    return value
  }
}

// 创建一个setter
function createSetter() {
  return function (target: object, key: string | symbol, value: unknown) {

    // 通过 target中是否有key来判断是 新增还是设置属性的操作
    const type = Object.prototype.hasOwnProperty.call(target, key)
      ? TriggerType.SET
      : TriggerType.ADD
    
    const res = Reflect.set(target, key, value)

    // 触发依赖
    trigger(target, key, type)
    return res
  }
}

export const mutableHandlers = {
  get,
  set,
  has(target: object, key: string | symbol) {
    track(target, key)
    return Reflect.has(target, key)
  },
  ownKeys(target: object) {
    // 使用 for...in 遍历时不知道具体的key,因此用ITERATE_KEY来代替
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: object, key: string | symbol, value: unknown) {
    console.warn(`key :${String(key)} 不能被 set, 因为target是只读的:`, target)
    return true
  }
}

export const shallowReactiveHandlers = extend({}, mutableHandlers, {
  get: shallowReactiveGet
})

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})
