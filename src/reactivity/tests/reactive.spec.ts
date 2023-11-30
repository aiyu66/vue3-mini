import { it, expect, describe } from "vitest"
import { reactive, isReactive } from ".."

describe("reactive", () => {
  it("happy path", () => {
    const original: any = { foo: 1 }
    const observed: any = reactive(original)

    // 原始对象 不等于 代理对象
    expect(original).not.toBe(observed)
    // 通过代理对象也能访问到原始对象中的属性
    expect(observed.foo).toBe(1)

    // 额外添加的属性也可以通过代理对象访问
    original.bar = 2
    expect(observed.bar).toBe(2)
  })

  it("should be get true when value is reactive object", () => {
    const original: any = { foo: 1 }
    const observed: any = reactive(original)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
  })

  it("should get same proxy when reactive same target", () => {
    const target = {}
    const proxy1 = reactive(target)
    const proxy2 = reactive(target)

    expect(proxy1).toBe(proxy2)
  })

  it("nested reactive", () => {
    const target = {
      foo: 1,
      bar: {
        baz: [{ count: 2 }]
      }
    }

    const data = reactive(target)

    expect(isReactive(data)).toBe(true)
    expect(isReactive(data.bar)).toBe(true)
    expect(isReactive(data.bar.baz)).toBe(true)
    expect(isReactive(data.bar.baz[0])).toBe(true)
  })
})
