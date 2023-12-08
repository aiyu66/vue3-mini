import { isChange, isObject } from "../shared"
import {
  ReactiveEffect,
  isTracking,
  trackEffects,
  triggerEffects
} from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  private _rawValue: any
  public dep: Set<ReactiveEffect>
  public __v_isRef: boolean = true

  constructor(value: any) {
    // 如果 value 是一个对象, 需要使用reactive做一个转换, 这样嵌套的属性也是响应式的
    this._value = toReactive(value)
    this._rawValue = value
    this.dep = new Set<ReactiveEffect>()
  }

  get value() {
    // 应该收集value的依赖
    // track(this, "value")
    if (isTracking()) {
      // 不使用track()的原因是ref只有一个value属性需要被收集
      trackEffects(this.dep)
    }
    return this._value
  }

  set value(newVal) {
    if (isChange(newVal, this._rawValue)) {
      this._value = toReactive(newVal)
      this._rawValue = newVal
      // trigger(this, "value", TriggerType.SET)
      triggerEffects(this.dep)
    }
  }
}

export function ref(value: any) {
  return new RefImpl(value)
}

/**
 * 判断value是否是对象, 如果是就转成响应式的,否则返回自身
 * @param value 普通值或对象
 * @returns 响应式的对象或普通值
 */
function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

/**
 * 判断value是否是一个ref对象
 * @param value ref对象
 * @returns true|false, true:表示value是一个ref对象
 */
export function isRef(value: any): boolean {
  return !!value.__v_isRef
}

/**
 * 获取refObj的值
 * @param refObj ref对象
 * @returns 返回ref的value或本身
 */
export function unRef(refObj: any) {
  return isRef(refObj) ? refObj.value : refObj
}

export function proxyRefs(objectWithRefs: object) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, newVal) {
      if (isRef(target[key]) && !isRef(newVal)) {
        // target[key]是一个ref对象, 但是 新的value不是ref对象,因此需要修改value属性
        return (target[key].value = newVal)
      } else {
        // 直接设置, 无论 target[key]/newVal是不是ref
        return Reflect.set(target, key, newVal)
      }
    }
  })
}
