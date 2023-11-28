import { track, trigger } from "./effect"

// 顶层中创建 get/set, 具有缓存作用, 不会被多次创建
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

/**
 * 创建一个getter函数, 通过isReadonly标记是否需要收集依赖
 * @param isReadonly 是否是只读的响应式对象, 默认为false, 也就是可以被set
 * @returns getter函数
 */
function createGetter(isReadonly: boolean = false) {
  return function (target: object, key: string | symbol) {
    const value = Reflect.get(target, key)

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
    const res = Reflect.set(target, key, value)

    // 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: object, key: string | symbol, value: unknown) {
    console.warn(`key :${String(key)} 不能被 set, 因为target是只读的:`, target)
    return true
  }
}
