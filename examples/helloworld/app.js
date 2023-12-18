import { h } from "../../lib/vue3-mini.esm.js"

export default {
  // .vue文件编译后就是一个js文件,
  // <template></template>会被compiler模块被编译成一个render函数
  render() {
    return h("div", "", this.msg)
  },
  setup() {
    const msg = "hello, mini-vue3"
    return {
      msg
    }
  }
}
