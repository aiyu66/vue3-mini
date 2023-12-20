import { isObject } from "../shared"
import { PublicInstanceProxyHandlers } from "./componentPublicIntance"
import { VNode } from "./vnode"

// 组件类型
export interface Component {
  vnode: VNode
  type: any
  setupState?: object | Function
  render?: Function
  // 组件的代理对象, 调用render时指定其this为proxy
  proxy?: {}
}

// 创建组件的实例对象
export function createComponentInstance(vnode: VNode) {
  const component: Component = {
    vnode,
    type: vnode.type
  }
  return component
}

// 处理组件的props,slots和setup函数
export function setupComponent(instance: Component) {
  // TODO
  // initProps()
  // initSlots()

  // 处理有状态的组件
  setupStatefulComponent(instance)
}

// 处理有状态的组件, 也就是setup()返回值是一个对象
function setupStatefulComponent(instance: Component) {
  const component = instance.type
  const { setup } = component

  // 组件的代理对象, 用于render()中的this, 方便访问组件实例上的属性
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

// 处理setup()的返回值, 保存到组件实例对象上
function handleSetupResult(
  instance: Component,
  setupResult: object | Function
) {
  // TODO function
  if (isObject(setupResult)) {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

// 获取组件的render函数
function finishComponentSetup(instance: Component) {
  const component = instance.type
  const { render } = component
  if (render) {
    // 把render添加到组件实例对象上
    instance.render = render
  }
}
