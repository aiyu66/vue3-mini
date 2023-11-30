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

  it("should be true when value is readonly", () => {
    const target = { count: 1 }
    const readonlyData = readonly(target)

    expect(isReadonly(target)).toBe(false)
    expect(isReadonly(readonlyData)).toBe(true)
  })

  it("should get same proxy when readonly same target", () => {
    const target = { count: 1 }
    const proxy1 = readonly(target)
    const proxy2 = readonly(target)

    expect(proxy1).toBe(proxy2)
  })

  it('nested readonly', () => {
      const target = {
        foo: 1,
        bar: {
          baz: [{ count: 2 }]
        }
      }

      const data = readonly(target)

      expect(isReadonly(data)).toBe(true)
      expect(isReadonly(data.bar)).toBe(true)
      expect(isReadonly(data.bar.baz)).toBe(true)
      expect(isReadonly(data.bar.baz[0])).toBe(true)
  })
})
