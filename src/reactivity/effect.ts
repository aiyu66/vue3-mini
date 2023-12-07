import { extend, isArray } from "../shared"
import { ARRAY_LENGTH_KEY, ITERATE_KEY, TriggerType } from "./reactive"

export interface ReactiveEffectRunner {
  (): any
  effect: ReactiveEffect
}

interface ReactiveEffectOptions {
  scheduler?: () => any | null
  onStop?: () => any | null
  lazy?: boolean
}

let activeEffect: ReactiveEffect | undefined
// effect执行栈
const effectStack: ReactiveEffect[] = []

// 用于判断activeEffect是否是活跃状态, 依此来确定是否需要收集activeEffect
let shouldTrack: boolean

// 响应式对象的核心
export class ReactiveEffect {
  private _fn: () => any
  // 反向记录activeEffect集合, 清除依赖时可以找到key关联依赖集合
  public deps: any[] = []
  // 标记activeEffect是否处于活跃状态
  public isActive: boolean = true

  // scheduler函数
  // public scheduler?: () => any | null = null
  // onStop回调函数
  public onStop?: () => any | null = null

  constructor(fn: () => any, public scheduler: () => any | null = null) {
    this._fn = fn
  }

  run() {
    // 如果activeEffect不是活跃状态的, 那么不需要收集依赖
    if (!this.isActive) {
      return this._fn()
    }

    // 每次执行fn之前都把依赖集合清空, 这样可以保证没有遗留的fn
    cleanupEffect(this)
    // 设置状态
    activeEffect = this
    enableTracking()

    // 把当前activeEffect压入栈中
    effectStack.push(activeEffect)

    // 执行副作用函数fn
    const ret = this._fn()

    // 把activeEffect弹出栈
    effectStack.pop()

    // activeEffect指向栈顶元素
    activeEffect = effectStack[effectStack.length - 1]
    // 当activeEffect为undefined时, 说明栈为空了
    if (!activeEffect) {
      // reset
      pauseTracking()
    }

    return ret
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
 * 用于注册副作用函数fn
 * @param fn 副作用函数
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
  if (!options?.lazy) {
    _effect.run()
  }

  // 绑定 _effect 是因为run()方法中需要this
  const runner: ReactiveEffectRunner = _effect.run.bind(_effect)
  // 把_effect对象添加到runner函数上
  runner.effect = _effect

  return runner
}

// 以响应式对象作为key, Map为value的WeakMap对象
const targetMap = new WeakMap()

/**
 * 用于判断是否是处于收集依赖中
 */
export function isTracking(): boolean {
  return shouldTrack && activeEffect !== undefined
}

/**
 * 暂停跟踪
 */
export function pauseTracking() {
  shouldTrack = false
}

/**
 * 开启跟踪
 */
export function enableTracking() {
  shouldTrack = true
}

/**
 * 当读取响应式对象的属性时, 需要把effect作为依赖收集起来
 * @param target 响应式对象
 * @param key 响应式对象的属性
 */
export function track(target: object, key: any) {
  // 依赖结构: target -> key -> dep(activeEffect)

  // 不需要收集
  if (!isTracking()) return

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

  // dep中没有activeEffect才需要收集起来
  if (!dep.has(activeEffect)) {
    // 保存activeEffect
    dep.add(activeEffect)
    // 把dep添加到activeEffect的deps中, 方便清除
    activeEffect.deps.push(dep)
  }
}

/**
 * 收集ref声明的响应式对象的依赖
 * @param dep ref的依赖集合
 */
export function trackRefValue(dep: Set<ReactiveEffect>) {
  // dep中没有activeEffect才需要收集起来
  if (!dep.has(activeEffect)) {
    // 保存activeEffect
    dep.add(activeEffect)
    // 把dep添加到activeEffect的deps中, 方便清除
    activeEffect.deps.push(dep)
  }
}

/**
 * 当响应式对象的属性更新时, 需要把与属性关联的activeEffect都重新调用
 * @param target 响应式对象
 * @param key 响应式对象的属性
 * @param type 触发set处理程序的操作方式: 更新 | 添加
 */
export function trigger(target: object, key: any, type: TriggerType) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  // 获取与具体key相关的依赖
  const dep = depsMap.get(key)

  // 复制一个依赖集合, 这样可以避免在run()中调用cleanupEffect时陷入死循环
  // 因为 添加/删除 在同一次迭代中
  const effectsToRun = new Set<ReactiveEffect>()

  if (dep?.size) {
    addEffectToNewDeps(dep, effectsToRun)
  }
  // 获取数组相关的依赖集合
  if (isArray(target) && type === TriggerType.ADD) {
    const lengthEffects = depsMap.get(ARRAY_LENGTH_KEY)
    lengthEffects && addEffectToNewDeps(lengthEffects, effectsToRun)
  }
  // 当操作类型是添加|删除时, 才需要获取ITERATE_KEY的依赖
  if (type === TriggerType.ADD || type === TriggerType.DELETE) {
    // 获取与ITERATE_KEY相关的依赖(for...in时会执行ownKeys处理程序)
    const iterateEffects = depsMap.get(ITERATE_KEY)
    iterateEffects && addEffectToNewDeps(iterateEffects, effectsToRun)
  }

  triggerRefValue(effectsToRun)
}

/**
 * 触发依赖, 重新执行run或schduler
 * @param effectsToRun 依赖集合
 */
export function triggerRefValue(effectsToRun: Set<ReactiveEffect>) {
  // 创建一个新的deps, 防止在一次for of中删除又添加导致死循环
  const newDeps = new Set(effectsToRun)
  for (const effect of newDeps) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

/**
 * 把不同key的依赖集合添加到一个新的依赖集合中
 * @param effects 依赖集合
 * @param effectsToRun 新的依赖集合
 * @returns 返回一个新的依赖集合
 */
function addEffectToNewDeps(effects, effectsToRun) {
  effects.forEach((effectFn: ReactiveEffect) => {
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
}

/**
 * 暂停触发更新
 */
export function stop(runner: ReactiveEffectRunner) {
  runner.effect.stop()
}
