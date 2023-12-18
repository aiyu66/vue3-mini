import { isNull, isString } from "../shared"
import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createApp(rootComponet) {
  return {
    mount(rootContainer) {
      // 1.创建组件的vnode
      const vnode = createVNode(rootComponet)

      // 2.渲染
      if (isString(rootContainer)) {
        rootContainer = document.querySelector(rootContainer)
      }
      if (isNull(rootContainer)) {
        console.warn(`rootContainer是${rootContainer}, 无法挂载app`)
        return
      }

      // 通过render函数把根组件渲染到根容器下
      render(vnode, rootContainer)
    }
  }
}
