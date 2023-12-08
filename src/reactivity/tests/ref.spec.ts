import { it, expect, describe, vi } from "vitest"
import { effect, reactive, ref, isRef, unRef } from ".."

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

  it("should make nested prop ractive", () => {
    const data = ref({
      count: 1
    })
    let dummy
    effect(() => (dummy = data.value.count * 2))

    expect(dummy).toBe(2)

    data.value.count = 2
    expect(dummy).toBe(4)

    data.value = {
      count: 4
    }
    expect(dummy).toBe(8)
  })

  it("isRef()", () => {
    const r = ref(1)
    const data = reactive({ count: 1 })
    expect(isRef(r)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(data)).toBe(false)
  })

  it("unRef()", () => {
    const r = ref(1)
    expect(unRef(r)).toBe(1)
    expect(unRef(2)).toBe(2)
  })
})
