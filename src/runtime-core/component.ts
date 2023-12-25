import { shallowReadonly } from "../reactivity"
import { isObject } from "../shared"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicIntance"
import { VNode } from "./vnode"

// 组件实例的类型
export interface ComponentInstance {
  vnode: VNode
  type: any
  setupState?: object
  render?: Function
  // 组件的代理对象, 调用render时指定其this为proxy
  proxy?: {}
  ctx?: object
  // 组件的props
  props?: object
}

// 创建组件的实例对象
export function createComponentInstance(vnode: VNode) {
  const instance: ComponentInstance = {
    vnode,
    type: vnode.type
  }

  // 组件实例对象保存到ctx中
  instance.ctx = { _: instance }
  return instance
}

// 处理组件的props,slots和setup函数
export function setupComponent(instance: ComponentInstance) {
  // TODO
  initProps(instance, instance.vnode.props)
  // initSlots()

  // 处理有状态的组件
  setupStatefulComponent(instance)
}

// 处理有状态的组件, 也就是setup()返回值是一个对象
function setupStatefulComponent(instance: ComponentInstance) {
  const component = instance.type
  const { setup } = component

  // 组件的代理对象, 用于render()中的this, 方便访问组件实例上的属性
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)

  if (setup) {
    // 把props使用shallowReadonly处理变成只读的对象, 传递给setup函数作为第一个参数
    const setupResult = setup(shallowReadonly(instance.props))
    handleSetupResult(instance, setupResult)
  }
}

// 处理setup()的返回值, 保存到组件实例对象上
function handleSetupResult(instance: ComponentInstance, setupResult: any) {
  // TODO function
  if (isObject(setupResult)) {
    // setup返回的结果是对象类型, 说明是组件的状态
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

// 获取组件的render函数
function finishComponentSetup(instance: ComponentInstance) {
  const component = instance.type
  const { render } = component
  if (render) {
    // 把render函数添加到组件实例对象上
    instance.render = render
  }
}
