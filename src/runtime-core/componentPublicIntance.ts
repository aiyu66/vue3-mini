import { isFunction } from "../shared"
import { ComponentInstance } from "./component"

// 公共API, 可以在render中通过this直接访问
const publicPropertiesMap = {
  $el: (i: ComponentInstance) => i.vnode.el
}

// 组件代理对象的handlers
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key: string | symbol) {
    const { setupState } = instance
    if (key in setupState) {
      // key在setupState中
      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (isFunction(publicGetter)) {
      return publicGetter(instance)
    }
  }
}
