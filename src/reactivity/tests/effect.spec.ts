import { it, expect, describe } from "vitest"
import { reactive, effect } from ".."

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
})
