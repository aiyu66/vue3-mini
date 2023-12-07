import { isChange } from "../shared"
import {
  ReactiveEffect,
  isTracking,
  trackRefValue,
  triggerRefValue
} from "./effect"

class RefImpl {
  private _value: any
  public dep: Set<ReactiveEffect>

  constructor(value: any) {
    this._value = value
    this.dep = new Set<ReactiveEffect>()
  }

  get value() {
    // 应该收集value的依赖
    // track(this, "value")
    if (isTracking()) {
      // 不使用track()的原因是ref只有一个value属性
      trackRefValue(this.dep)
    }
    return this._value
  }

  set value(newVal) {
    if (isChange(newVal, this._value)) {
      this._value = newVal
      // trigger(this, "value", TriggerType.SET)
      triggerRefValue(this.dep)
    }
  }
}

export function ref(value: any) {
  return new RefImpl(value)
}
