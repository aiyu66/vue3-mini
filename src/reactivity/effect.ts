let activeEffect: ReactiveEffect | undefined

// 响应式对象的核心
class ReactiveEffect {
  private _fn: Function

  constructor(fn: Function) {
    this._fn = fn
  }
  run() {
    activeEffect = this

    // 执行副作用函数的fn, 并把结果返回
    return this._fn()
  }
}

/**
 * 副作用函数, 用于注册fn
 * @param fn 与响应式数据关联的函数
 * @returns 一个runner函数, 也就是run()方法
 */
export function effect(fn: () => void) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
  // 绑定 _effect 是因为run()方法中需要this
  return _effect.run.bind(_effect)
}

// 以响应式对象作为key, Map为value的WeakMap对象
const targetMap = new WeakMap()

/**
 * 当读取响应式对象的属性时, 需要把effect作为依赖收集起来
 * @param target 响应式对象
 * @param key 响应式对象的属性
 */
export function track(target: object, key: any) {
  // 依赖结构: target -> key -> dep(activeEffect)

  // 与target关联的Map对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 与key关联的Set集合
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 保存activeEffect
  dep.add(activeEffect)
}

/**
 * 当响应式对象的属性更新时, 需要把与属性关联的activeEffect都重新调用
 * @param target 响应式对象
 * @param key 响应式对象的属性
 */
export function trigger(target: object, key: any) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  for (const effect of dep) {
    effect.run()
  }
}
