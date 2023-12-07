import { it, expect, describe, vi } from "vitest"
import { effect, ref } from ".."

describe("ref", () => {
  it("happy path", () => {
    const r = ref(1)
    expect(r.value).toBe(1)
  })

  it("should be track when ref value updated", () => {
    const r = ref(1)

    let dummy
    const effectFn = vi.fn(() => (dummy = r.value * 2))
    effect(effectFn)

    expect(effectFn).toBeCalledTimes(1)
    expect(dummy).toBe(2)

    r.value = 2
    expect(effectFn).toBeCalledTimes(2)
    expect(dummy).toBe(4)

    // 设置一样的值, 不应该触发
    r.value = 2
    expect(effectFn).toBeCalledTimes(2)
    expect(dummy).toBe(4)
  })
})
