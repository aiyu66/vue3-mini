import { it, expect, describe, vi } from "vitest"
import { reactive, effect, stop } from ".."

describe("effect", () => {
  it("happy path", () => {
    const data: any = reactive({ count: 1 })
    let doubleCount = 0

    effect(() => {
      // 获取响应式数据的值, 收集依赖
      doubleCount = data.count * 2
    })

    expect(doubleCount).toBe(2)

    // 更新响应式输入的值, 触发依赖
    data.count++
    expect(doubleCount).toBe(4)
  })

  it("should return a runner fucntion when effect called", () => {
    // effect(fn) -> runner -> 调用runner() -> fn()
    let count = 0

    const runner = effect(() => {
      count++
      return "foo"
    })

    expect(count).toBe(1)

    // 调用runner时重新执行fn并返回fn函数的返回值
    const ret = runner()
    expect(count).toBe(2)
    expect(ret).toBe("foo")
  })

  it("should call scheduler when reacitve update", () => {
    // 1.effect()可接收一个scheduler函数类型的参数
    // 2.初次执行effect时, 只会调用 fn, 而不会执行scheduler
    // 3.当响应式对象发生更新时, 会调用scheduler
    const data = reactive({ count: 1 })
    let dummy = 0

    let run = null
    const scheduler = vi.fn(() => {
      run = runner
    })

    const runner = effect(
      () => {
        dummy = data.count
      },
      { scheduler }
    )

    expect(dummy).toBe(1)
    // scheduler未被调用
    expect(scheduler).not.toBeCalled()

    // 更新响应式对象
    data.count++

    // 当响应式对象发生更新时, 应该调用 scheduler
    expect(scheduler).toBeCalledTimes(1)

    // 手动执行runner, 会调用fn
    run()
    expect(dummy).toBe(2)
  })

  it("shouldn't update reactive when stop called", () => {
    const data = reactive({ count: 1 })
    let dummy = 0
    const runner = effect(() => {
      dummy = data.count
    })

    expect(dummy).toBe(1)

    // 暂停触发依赖更新
    stop(runner)

    // 更新响应式对象的值
    data.count = 2
    // 不会触发更新, 也就是不能执行 activeEffect的run/scheduler 方法
    expect(dummy).toBe(1)

    // 手动恢复
    runner()
    expect(dummy).toBe(2)

    data.count = 3
    expect(dummy).toBe(3)
  })

  it("should call onStop when stop called", () => {
    const data = reactive({ count: 1 })
    let dummy = 0

    const onStop = vi.fn()

    const runner = effect(
      () => {
        dummy = data.count
      },
      { onStop }
    )

    stop(runner)

    expect(onStop).toBeCalledTimes(1)
  })
})
