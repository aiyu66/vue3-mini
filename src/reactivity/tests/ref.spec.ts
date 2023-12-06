import { it, expect, describe } from "vitest"
import { effect, ref } from ".."

describe("ref", () => {
  it("happy path", () => {
    const r = ref(1)

    let dummy
    effect(() => {
      dummy = r.value * 2
    })

    expect(dummy).toBe(2)
  })
})
