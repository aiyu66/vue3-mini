import { h } from "../../lib/vue3-mini.esm.js"
import Foo from "./foo.js"

export default {
  name: "APP",
  setup() {
    return {}
  },
  render() {
    const h2 = h("h2", {}, "我是App组件")
    const foo = h(
      Foo,
      {},
      {
        header: props =>
          h("div", { class: "foo-header" }, [
            h("p", {}, "header-1, age:" + props.age),
            h("p", {}, "header-2, age:" + props.age)
          ]),
        footer: props => h("p", {}, "footer, age:" + props.age)
      }
    )

    const foo2 = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "456")])
    const foo3 = h(Foo, {})
    return h("div", { class: "demo" }, [h2, foo])
  }
}
