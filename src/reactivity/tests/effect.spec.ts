import { ARRAY_LENGTH_KEY } from "./../reactive"
import { it, expect, describe, vi } from "vitest"
import { reactive, effect, stop, ReactiveFlags } from ".."

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

  it("should return a runner fucntion when effect called", () => {
    // effect(fn) -> runner -> 调用runner() -> fn()
    let count = 0

    const runner = effect(() => {
      count++
      return "foo"
    })

    expect(count).toBe(1)

    // 调用runner时重新执行fn并返回fn函数的返回值
    const ret = runner()
    expect(count).toBe(2)
    expect(ret).toBe("foo")
  })

  it("should call scheduler when reacitve update", () => {
    // 1.effect()可接收一个scheduler函数类型的参数
    // 2.初次执行effect时, 只会调用 fn, 而不会执行scheduler
    // 3.当响应式对象发生更新时, 会调用scheduler
    const data = reactive({ count: 1 })
    let dummy = 0

    let run = null
    const scheduler = vi.fn(() => {
      run = runner
    })

    const runner = effect(
      () => {
        dummy = data.count
      },
      { scheduler }
    )

    expect(dummy).toBe(1)
    // scheduler未被调用
    expect(scheduler).not.toBeCalled()

    // 更新响应式对象
    data.count++

    // 当响应式对象发生更新时, 应该调用 scheduler
    expect(scheduler).toBeCalledTimes(1)

    // 手动执行runner, 会调用fn
    run()
    expect(dummy).toBe(2)
  })

  it("shouldn't update reactive when stop called", () => {
    const data = reactive({ count: 1 })
    let dummy = 0
    const runner = effect(() => {
      dummy = data.count
    })

    expect(dummy).toBe(1)

    // 暂停触发依赖更新
    stop(runner)

    // 更新响应式对象的值
    // data.count = 2

    // data.count++分为两步操作: data.count = data.count + 1
    // 也就是先取值, 然后再更新
    data.count++
    // 不会触发更新, 也就是不能执行 activeEffect的run/scheduler 方法
    expect(dummy).toBe(1)

    // 调用runner() 只会执行fn, 不会重新收集依赖
    runner()
    expect(dummy).toBe(2)

    // 一旦stop了effect, 将不可恢复
    data.count = 3
    expect(dummy).toBe(2)
  })

  it("should call onStop when stop called", () => {
    const data = reactive({ count: 1 })
    let dummy = 0

    const onStop = vi.fn()

    const runner = effect(
      () => {
        dummy = data.count
      },
      { onStop }
    )

    stop(runner)

    expect(onStop).toBeCalledTimes(1)
  })

  it("shouldn't trigger update when reactive data branch is false", () => {
    const target = { isOk: true, text: "ok" }
    const data = reactive(target)

    let dummy
    const effectFn = vi.fn(() => {
      dummy = data.isOk ? data.text : "not"
    })

    effect(effectFn)

    expect(dummy).toBe("ok")

    // 更新 isOk 为false
    data.isOk = false

    expect(dummy).toBe("not")
    expect(effectFn).toBeCalledTimes(2)

    // 更新 text 为1, 因为 isOk为false, 那么dummy的值不应该发生变化
    // 而且 text 对应的依赖不应该被执行
    data.text = 1
    expect(dummy).toBe("not")
    expect(effectFn).toBeCalledTimes(2)
  })
  it("nested effect", () => {
    // 嵌套effect, 在子组件的render函数就是嵌套会父组件的effect中
    /**
     * // Bar是Foo的子组件
     * effect(()=>{
     *  Foo.render()
     *  effect(()=>{
     *    Bar.render()
     *  })
     * })
     */

    const target = { foo: "foo", bar: "bar" }
    const data = reactive(target)
    let dummy1
    let dummy2

    const effectFn2 = () => {
      // console.log("执行fn2")
      dummy2 = data.bar
    }
    const effectFn1 = () => {
      // console.log("执行fn1")
      effect(effectFn2)
      dummy1 = data.foo
    }

    effect(effectFn1)

    expect(dummy1).toBe("foo")
    expect(dummy2).toBe("bar")

    // 更新外层effectFn1中的数据, 会重新执行 effectFn1,
    // 又间接导致重新执行 effectFn2, 会重新创建一个activeEffect
    data.foo = "new foo"
    expect(dummy1).toBe("new foo")

    data.bar = "new bar"
    expect(dummy2).toBe("new bar")
  })
  it("should be called run when lazy is true", () => {
    const fn = vi.fn()

    const runner = effect(fn, { lazy: true })

    expect(fn).not.toBeCalled()

    runner()
    expect(fn).toBeCalledTimes(1)
  })
  it("should be track in operator", () => {
    const target = { foo: "foo" }
    const data = reactive(target)

    let dummy
    effect(() => {
      dummy = "foo" in data
    })

    expect(dummy).toBe(true)
  })
  it("should be track forin operator", () => {
    const target = { foo: "foo" }
    const data = reactive(target)

    let keys = []
    effect(() => {
      keys.length = 0
      // for...in 操作
      for (const key in data) {
        keys.push(key)
      }
    })

    expect(keys).toContain("foo")

    // 响应式对象中添加一个新的属性
    data.bar = "bar"

    expect(keys).toContain("bar")
    expect(keys.length).toBe(2)
  })
  it("should be set not add operator", () => {
    const target = { foo: "foo" }
    const data = reactive(target)

    let keys = []
    effect(() => {
      // for...in 操作
      for (const key in data) {
        keys.push(key)
      }
    })

    expect(keys).toContain("foo")

    // 更新原有的属性
    data.foo = "new foo"

    expect(keys).toContain("foo")
    expect(keys.length).toBe(1)
    expect(data.foo).toBe("new foo")
  })
  it("should be trigger delete operator", () => {
    const target = { foo: "foo", bar: "bar" }
    const data = reactive(target)

    let keys = []
    effect(() => {
      keys.length = 0
      // for...in 操作
      for (const key in data) {
        keys.push(key)
      }
    })

    expect(keys).toContain("foo")
    expect(keys).toContain("bar")
    expect(keys.length).toBe(2)

    // 删除响应式对象上的key, 需要注意的是删除时会影响 ownKeys时操作
    delete data["bar"]

    expect(keys).not.toContain("bar")
    expect(keys).toContain("foo")
    expect(keys.length).toBe(1)
  })

  it("shoudn't update reactive when value is not change", () => {
    const target = { count: 1 }
    const data = reactive(target)
    let dummy

    const effectFn = vi.fn(() => (dummy = data.count))
    effect(effectFn)

    expect(effectFn).toBeCalledTimes(1)
    expect(dummy).toBe(1)

    // 更新响应式对象的count值, 但是值和原来的一样
    data.count = 1

    // 当新值和旧值一样时, 不应该执行fn
    expect(effectFn).toBeCalledTimes(1)
  })
  it("effect prototype chain", () => {
    const obj = { foo: 1 }
    const proto = { foo: 2 }
    const child = reactive(obj)
    const parent = reactive(proto)

    // 设置child的原型为parent(一个响应式对象)
    Object.setPrototypeOf(child, parent)

    let dummy
    // child.foo,会先在child上查找有无foo, 没有就从其原型上查找
    const effectFn = vi.fn(() => (dummy = child.foo))
    effect(effectFn)

    expect(dummy).toBe(1)

    // 删除child上的foo
    delete child.foo

    // 从原型上获取foo属性
    expect(dummy).toBe(2)

    // 修改原型上的foo属性, 也应该更新
    parent.foo = 3
    expect(dummy).toBe(3)

    // 在child上添加属性
    child.foo = 4
    expect(dummy).toBe(4)
  })
  it("should be track array", () => {
    const data = reactive(["foo"])
    let dummy
    effect(() => {
      dummy = data[0]
    })

    expect(dummy).toBe("foo")
  })
  it("should be update array when length change", () => {
    const arr = reactive(["foo"])
    let len
    effect(() => {
      // 访问数组的length属性
      len = arr.length
    })

    expect(len).toBe(1)

    // 添加一个元素, 会导致length+1, 副作用函数应该被执行
    arr[1] = "bar"

    expect(len).toBe(2)
  })
  it("should be trigger dep when use for in operator in array", () => {
    // 在数组上使用 for...in操作时也应该会触发依赖, 尽管不推荐在数组上使用for..in操作
    const arr = reactive(["foo", "bar"])
    let keys = []
    const effecFn = vi.fn(() => {
      keys.length = 0
      for (const key in arr) {
        keys.push(key)
      }
    })
    effect(effecFn)

    expect(keys.length).toBe(2)

    arr[2] = "baz"
    expect(keys.length).toBe(3)

    // 直接修改数组的长度也会影响for...in操作
    arr.length = 1
    expect(keys.length).toBe(1)
  })
  it("should be track dep when use for of operator in array", () => {
    const arr = reactive(["foo", "bar", "baz"])
    let values = []
    effect(() => {
      values.length = 0
      // for of 实际上用的是 Symbol.iterator key, 只不过它是一个函数,
      // 其内部有使用length, 因此不用修改也能触发依赖
      for (const item of arr) {
        values.push(item)
      }
    })

    expect(values.length).toBe(3)
    expect(values).toContain("foo")
  })

  it("array includes method", () => {
    const obj = {}
    const arr = reactive([obj])

    let ret1
    let ret2
    let ret3
    let ret4
    effect(() => {
      // 通过数组元素判断是否存在的方法
      // includes的调用是arr, 那么其this就是代理对象 arr,
      // 数组中的obj元素因为是object类型, 因此会转成reactive对象(proxy)
      // 因此 默认情况下, arr中是不包含obj的, 而是包含obj的proxy对象
      // 因此需要重写相关的查找方法, 从arr或其原始对象中查找
      ret1 = arr.includes(arr[0])
      ret2 = arr.includes(obj)
      ret3 = arr.indexOf(obj) === 0
      ret4 = arr.lastIndexOf(obj) === 0
    })

    expect(ret1).toBe(true)
    expect(ret2).toBe(true)
    expect(ret3).toBe(true)
    expect(ret4).toBe(true)
  })
  it("array push/pop/shift/unshift/splice method", () => {
    // 这些方法会隐式修改数组的length, 会导致多个独立的副作用函数相互影响
    const arr = reactive([])
    effect(() => {
      arr.push(1)
    })
    effect(() => {
      arr.push(2)
    })

    expect(arr.length).toBe(2)
  })
})
