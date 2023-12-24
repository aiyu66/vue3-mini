import { h } from "../../lib/vue3-mini.esm.js"

export default {
  // .vue文件编译后就是一个js文件,
  // <template></template>会被compiler模块被编译成一个render函数

  render() {
    window.self = this
    return h("div", { class: ["demo"] }, [
      h(
        "p",
        {
          id: "p1",
          onClick: () => {
            console.error("click")
          }
        },
        "hello"
      ),
      h(
        "p",
        {
          id: "p2",
          onMousedown: () => {
            console.error("mousedown")
          }
        },
        this.msg
      )
    ])
  },
  setup() {
    window.self = null
    const msg = "mini-vue3"
    return {
      msg
    }
  }
}
