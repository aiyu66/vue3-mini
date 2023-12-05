import { track, trigger } from "./effect"
import {
  ReactiveFlags,
  reactive,
  readonly,
  ITERATE_KEY,
  TriggerType,
  ARRAY_LENGTH_KEY
} from "./reactive"
import { extend, isArray, isChange, isObject, isSymbol } from "../shared"

// 响应式对象的key的类型
type KEY_TYPE = string | symbol

// 顶层中创建 get/set, 具有缓存作用, 不会被多次创建
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReactiveGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)

/**
 * 创建一个替代数组原型上某些方法的对象
 * @returns 替代数组原型上某些方法的对象
 */
function createArrayInstrumentations() {
  const instrumentations: Record<string, Function> = {}

  // 通过数组元素来查找是否存在的数组方法
  ;(["includes", "indexOf", "lastIndexOf"] as const).forEach(key => {
    const originalMethod = Array.prototype[key]
    instrumentations[key] = function (...args: unknown[]) {
      // this是代理对象
      let res = originalMethod.apply(this, args)
      if (!res || res === -1) {
        // 如果在代理对象中没找到就去原始对象上查找
        res = originalMethod.apply(this[ReactiveFlags.RAW], args)
      }
      return res
    }
  })

  return instrumentations
}

// 数组重写的方法对象, key是重写过的数组方法的名称
const arrayInstrumentaions = createArrayInstrumentations()

/**
 * 创建一个getter函数, 通过isReadonly标记是否需要收集依赖
 * @param isReadonly 是否是只读的响应式对象, 默认为false, 也就是可以被set
 * @returns getter函数
 */
function createGetter(isReadonly: boolean = false, isShallow: boolean = false) {
  return function (target: object, key: KEY_TYPE, receiver: any) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    } else if (key === ReactiveFlags.RAW) {
      // 获取原始对象
      return target
    }

    // 如果target是数组, 且key在arrayInstrumentaions中存在, 那么先获取改写的方法
    if (isArray(target) && arrayInstrumentaions.hasOwnProperty(key)) {
      return Reflect.get(arrayInstrumentaions, key, receiver)
    }

    const value = Reflect.get(target, key, receiver)

    // 如果key是symbol类型直接返回value
    if (isSymbol(key)) {
      return value
    }

    if (!isReadonly) {
      // 只有isReadonly为false时才需要收集依赖
      track(target, key)
    }

    if (isShallow) {
      // 如果是浅层的, 那么直接返回value, 这样嵌套的对象发生变化时, 不会触发依赖
      return value
    }

    if (isObject(value)) {
      // value是对象, 那么嵌套的对象也继续使用reactive/readonly转换成响应式对象
      return isReadonly ? readonly(value) : reactive(value)
    }

    return value
  }
}

/**
 * 通过判断target以及key来获取TriggerType, ADD|SET
 * @param target 原始对象
 * @param key 对象的属性
 * @returns 具体的triggerType, 如 设置|添加
 */
function getTriggerType(target: object, key: KEY_TYPE) {
  if (isArray(target)) {
    return Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
  } else {
    return Object.prototype.hasOwnProperty.call(target, key)
      ? TriggerType.SET
      : TriggerType.ADD
  }
}
// 创建一个setter
function createSetter() {
  return function (
    target: object,
    key: KEY_TYPE,
    value: unknown,
    receiver: any
  ) {
    // 通过 target中是否有key来判断是 新增还是设置属性的操作
    const type = getTriggerType(target, key)
    // 获取旧值
    const oldValue = target[key]

    const res = Reflect.set(target, key, value)
    // 说明 receiver就是 target的代理对象, 而不是其原型对象
    // 目的是为了屏蔽由原型引起的更新, 从而避免不必要的操作
    if (receiver[ReactiveFlags.RAW] === target) {
      // 当新值和旧值不一样时才更新, 并触发依赖
      if (isChange(oldValue, value)) {
        // 触发依赖
        trigger(target, key, type)
      }
    }
    return res
  }
}

export const mutableHandlers = {
  get,
  set,
  has(target: object, key: KEY_TYPE) {
    track(target, key)
    return Reflect.has(target, key)
  },
  ownKeys(target: object) {
    // 使用 for...in 遍历时不知道具体的key,因此用ITERATE_KEY来代替
    const key = isArray(target) ? ARRAY_LENGTH_KEY : ITERATE_KEY
    track(target, key)
    return Reflect.ownKeys(target)
  },
  deleteProperty(target: object, key: KEY_TYPE) {
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)

    const res = Reflect.deleteProperty(target, key)

    // 只有key是target自身上的, 且删除成功后 才触发
    if (hadKey && res) {
      trigger(target, key, TriggerType.DELETE)
    }

    return res
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
