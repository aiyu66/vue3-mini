import { effect, ReactiveEffectRunner } from "./effect"

type FunctionStruct = (...args: any[]) => any

class ComputedRefImpl {
  // 判断计算属性是否是脏的, 如果是说明需要更新
  private _dirty: boolean = true
  // 计算属性的值
  private _value: unknown

  // effect的返回值, 用于执行ReativeEffect的run()方法
  private _runner: ReactiveEffectRunner

  constructor(getter: FunctionStruct) {
    this._runner = effect(getter, {
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
        }
      },
      lazy: true
    })
  }

  get value() {
    if (this._dirty) {
      this._value = this._runner()
      this._dirty = false
    }
    return this._value
  }
}

export function computed(getter: FunctionStruct) {
  return new ComputedRefImpl(getter)
}
