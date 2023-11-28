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
})
