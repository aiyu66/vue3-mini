import { h } from "../../lib/vue3-mini.esm.js"

export default {
  name: "Foo",
  setup(props) {
    // 1.props作为setup函数的第一个参数
    console.error("props:", props)

    // 3.props不应该被修改, 应该遵循数据单向流动的原则
    props.count++
    console.error("props:", props)

    return {}
  },
  render() {
    // 2.在render函数中, 可以通过this访问props中的属性
    return h("div", { class: "foo" }, `我是Foo组件, count:${this.count}`)
  }
}
