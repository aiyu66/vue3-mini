import { it, expect, describe, vi } from "vitest"
import { reactive, computed } from ".."

describe("computed", () => {
  it("happy path", () => {
    const data = reactive({ count: 1 })

    const getter = vi.fn(() => data.count * 2)
    const doubleCount = computed(getter)

    expect(doubleCount.value).toBe(2)
  })

  it("should be lazily", () => {
    // 1.computed是懒执行的, 只有获取其value属性时才会被调用
    const data = reactive({ count: 1 })

    const getter = vi.fn(() => data.count * 2)
    const doubleCount = computed(getter)

    // 验证 getter是否被被调用了
    expect(getter).not.toBeCalled()

    expect(doubleCount.value).toBe(2)
    expect(getter).toBeCalledTimes(1)
  })

  it("should be cache value", () => {
    // computed具有缓存性: 如果响应式数据没有发生变化, computed不应被执行
    const data = reactive({ count: 1 })

    const getter = vi.fn(() => data.count * 2)
    const doubleCount = computed(getter)

    expect(doubleCount.value).toBe(2)
    expect(getter).toBeCalledTimes(1)

    // 读取value, 应该获取缓存的数据
    doubleCount.value
    expect(getter).toBeCalledTimes(1)
    doubleCount.value
    expect(getter).toBeCalledTimes(1)
  })

  it("should be update value when reactive data updated", () => {
    // 当响应式数据更新时, 计算属性的值也应该会重新计算
    const data = reactive({ count: 1 })

    const getter = vi.fn(() => data.count * 2)
    const doubleCount = computed(getter)

    // 更新响应式数据
    data.count = 2
    expect(doubleCount.value).toBe(4)
  })
})
