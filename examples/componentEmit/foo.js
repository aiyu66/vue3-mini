import { h } from "../../lib/vue3-mini.esm.js"

export default {
  name: "Foo",
  setup(props, { emit }) {
    const handleClick = () => {
      emit("add", 1, 2)
      emit("add-foo", 3, 4)
    }
    return { handleClick }
  },
  render() {
    const btn = h("button", { onClick: this.handleClick }, "Add")
    const p = h("p", {}, "foo组件")
    return h("div", { class: "foo" }, [p, btn])
  }
}
