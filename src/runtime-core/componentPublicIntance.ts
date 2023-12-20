import { isFunction } from "../shared"
import { Component } from "./component"

// 公共API, 可以在render中通过this直接访问
const publicPropertiesMap = {
  $el: (i: Component) => i.vnode.el
}

// 组件代理对象的handlers
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key: string | symbol) {
    const { setupState } = instance
    if (key in setupState) {
      // 判断key是否在setupState中
      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (isFunction(publicGetter)) {
      return publicGetter(instance)
    }
  }
}
