import { it, expect, describe, vi } from "vitest"
import { effect, isReactive, isShallow, shallowReactive } from ".."

describe("shallow reactive", () => {
  it("happy path", () => {
    const target = { foo: 1, bar: { baz: 2 } }

    const data = shallowReactive(target)

    expect(data).not.toBe(target)
    expect(data.foo).toBe(1)

    expect(isShallow(data)).toBe(true)
    expect(isReactive(data)).toBe(true)
    expect(isShallow(data.bar)).toBe(false)
    expect(isReactive(data.bar)).toBe(false)
  })

  it("should update shallow reactive data", () => {
    const target = { foo: 1, bar: { baz: 2 } }

    const data = shallowReactive(target)

    let dummy

    effect(() => {
      dummy = data.foo + data.bar.baz
    })

    expect(dummy).toBe(3)

    data.foo = 2
    expect(dummy).toBe(4)

    // 更新嵌套的对象时, 不会触发依赖
    data.bar.baz = 3
    expect(dummy).toBe(4)
  })
})
