import { it, expect, describe, vi } from "vitest"
import { readonly, isReadonly } from ".."

describe("readonly", () => {
  it("happy path", () => {
    const target = { count: 1 }
    const readonlyData = readonly(target)

    expect(readonlyData).not.toBe(target)
    expect(readonlyData.count).toBe(1)
  })

  it("shoule be get warn msg when setter called", () => {
    console.warn = vi.fn()

    const target = { count: 1 }
    const readonlyData = readonly(target)

    readonlyData.count = 2

    expect(console.warn).toBeCalled()
  })

  it.only("should be true when value is readonly", () => {
    const target = { count: 1 }
    const readonlyData = readonly(target)

    expect(isReadonly(target)).toBe(false)
    expect(isReadonly(readonlyData)).toBe(true)
  })
})
