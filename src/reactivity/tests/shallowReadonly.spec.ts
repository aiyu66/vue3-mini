import { it, expect, describe, vi } from "vitest"
import { isShallow, shallowReadonly } from ".."

describe("shallow readonly", () => {
  it("happy path", () => {
    const target = { foo: 1, bar: { baz: 2 } }

    const data = shallowReadonly(target)

    expect(data).not.toBe(target)
    expect(data.foo).toBe(1)
    expect(isShallow(data)).toBe(true)
    expect(isShallow(data.bar)).toBe(false)
  })

  it("shoule be get warn msg when setter called", () => {
    console.warn = vi.fn()

    const target = { count: 1 }
    const data = shallowReadonly(target)

    data.count = 2

    expect(console.warn).toBeCalled()
  })
})
