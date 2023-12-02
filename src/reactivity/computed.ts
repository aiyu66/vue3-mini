import { ReactiveEffect, track, trigger } from "./effect"

type FunctionStruct = (...args: any[]) => any

class ComputedRefImpl {
  // 判断计算属性是否是脏的, 如果是说明需要更新
  private _dirty: boolean = true
  // 计算属性的值
  private _value: unknown

  // ReativeEffect的实例
  private _effect: ReactiveEffect

  constructor(getter: FunctionStruct) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        // 响应式数据更新时, 需要被动触发计算属性的依赖更新
        trigger(this, "value")
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._value = this._effect.run()
      // 收集 value 的依赖
      track(this, "value")
      this._dirty = false
    }
    return this._value
  }
}

export function computed(getter: FunctionStruct) {
  return new ComputedRefImpl(getter)
}
