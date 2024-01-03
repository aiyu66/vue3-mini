import { isArray, isFunction, isObject } from "../shared"
import { ComponentInstance } from "./component"
import { VNodeChildren } from "./vnode"

/**
 * 初始化组件的slots, 也就是组件的children就是组件的slots
 * @param instance 组件实例
 * @param children 组件的children
 */
export function initSlots(
  instance: ComponentInstance,
  children: VNodeChildren
) {
  // 如果没有children那么直接返回
  if (!children) return

  let slots = null
  if (isArray(children)) {
    // 说明是默认的插槽元素
    slots = children
  } else if (isObject(children)) {
    // 具名插槽
    slots = {}
    for (const key in children as object) {
      const value = children[key]
      if (isFunction(value)) {
        // 把每个children转成一个返回vnode的函数, 这样就获取到插槽中的props
        slots[key] = (props: object) => value(props)
      }
    }
  } else {
    slots = [children]
  }
  instance.slots = slots
}
