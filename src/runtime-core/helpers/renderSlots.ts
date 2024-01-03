import { isArray, isFunction, warn } from "../../shared"
import { Fragment, VNode, VNodeChildren, createVNode } from "../vnode"

/**
 * 渲染slots
 * @param slots 组件格式化后的children
 * @param name 插槽的位置
 * @returns 返回相应位置上的vnode
 */
export function renderSlots(
  slots: VNodeChildren,
  name?: string,
  props?: object
): VNode {
  if (slots) {
    const slot = slots[name]
    if (slot) {
      // 作用域插槽
      if (isFunction(slot)) {
        // 当调用slot时, 就会去调用在initSlots中格式化后的slot函数,
        // 这样就可以把定义的props传递到函数作为插槽的作用域
        return slot(props)
      }
    } else {
      if (isArray(slots)) {
        // 默认插槽元素
        return createVNode(Fragment, {}, slots)
      }
    }
  } else {
    warn(`调用renderSlots失败, 因为slots是${slots}`)
  }
}
