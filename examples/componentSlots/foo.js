import { h, renderSlots } from "../../lib/vue3-mini.esm.js"

export default {
  name: "Foo",
  setup(props, { emit }) {
    return {}
  },
  render() {
    const h2 = h("h2", {}, "我是Foo组件-main")
    console.error("$slots:", this.$slots)
    // 具名插槽
    // 1.找到需要渲染的虚拟节点
    // 2.找到虚拟节点的位置

    // 作用域插槽
    // 通过 props可以把定义在插槽中的prop传递出去使用
    return h("div", { class: "foo" }, [
      renderSlots(this.$slots, "header", { age: 18 }),
      h2,
      renderSlots(this.$slots, "footer", { age: 18 })
    ])
  }
}
