import { h } from "../../lib/vue3-mini.esm.js"
import Foo from "./foo.js"

export default {
  name: "APP",
  setup() {
    return {}
  },
  render() {
    return h("div", { class: "demo" }, [
      h("p", {}, "我是App组件"),
      // 传递props到Foo组件中
      h(Foo, {
        onAdd(a, b) {
          console.error("onAdd:", a, b)
        },
        onAddFoo(a, b) {
          console.error("onAddFoo:", a, b)
        }
      })
    ])
  }
}
