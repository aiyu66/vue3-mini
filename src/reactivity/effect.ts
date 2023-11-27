import { extend } from "../shared"

interface ReactiveEffectRunner {
  (): any
  effect: ReactiveEffect
}

interface ReactiveEffectOptions {
  scheduler?: () => any | null
  onStop?: () => any | null
}

let activeEffect: ReactiveEffect | undefined

// 响应式对象的核心
class ReactiveEffect {
  private _fn: () => any
  // 反向记录activeEffect集合, stop时可以找到关联的activeEffect集合
  public deps: any[] = []
  // 标记activeEffect是否处于活跃状态
  public isActive: boolean = true

  // scheduler函数
  public scheduler?: () => any | null = null
  // onStop回调函数
  public onStop?: () => any | null = null

  constructor(fn: () => any) {
    this._fn = fn
  }

  run() {
    activeEffect = this

    // 执行副作用函数的fn, 并把结果返回
    return this._fn()
  }

  stop() {
    if (this.isActive) {
      cleanupEffect(this)

      if (this.onStop) {
        this.onStop()
      }
      // 一旦调用了stop, 那么activeEffect就会被删除, 需要置为false
      this.isActive = false
    }
  }
}

/**
 * 删除activeEffect的deps中的所有依赖集合
 * @param effect ReactiveEffect的实例对象
 */
function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    deps.forEach(dep => {
      dep.delete(effect)
    })
    deps.length = 0
  }
}

/**
 * 副作用函数, 用于注册fn
 * @param fn 与响应式数据关联的函数
 * @returns 一个runner函数, 也就是run()方法
 */
export function effect(
  fn: () => void,
  options?: ReactiveEffectOptions | null
): ReactiveEffectRunner {
  const _effect = new ReactiveEffect(fn)

  if (options) {
    // 把 options中的属性全都添加到ReactiveEffect实例上
    extend(_effect, options)
  }

  _effect.run()
  // 绑定 _effect 是因为run()方法中需要this
  const runner: ReactiveEffectRunner = _effect.run.bind(_effect)
  // 把_effect对象添加到runner函数上
  runner.effect = _effect

  return runner
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

  // 如果activeEffect不存在, 说明不需要收集依赖
  if (!activeEffect) return

  // 保存activeEffect
  dep.add(activeEffect)
  // 把dep添加到activeEffect的deps中, 方便清除
  activeEffect.deps.push(dep)
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
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

/**
 * 暂停触发更新
 */
export function stop(runner: ReactiveEffectRunner) {
  runner.effect.stop()
}
