import { isObject } from "../shared"

// 组件类型
export interface Component {
  vnode: any
  type: any
  setupState?: object | Function
  render?: Function
}

// 创建组件的实例对象
export function createComponentInstance(vnode) {
  const component: Component = {
    vnode,
    type: vnode.type
  }
  return component
}

// 处理组件的props,slots和setup函数
export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()

  // 处理有状态的组件
  setupStatefulComponent(instance)
}

// 处理有状态的组件, 也就是setup()返回值是一个对象
function setupStatefulComponent(instance) {
  const component = instance.type
  const { setup } = component

  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

// 处理setup()的返回值, 保存到组件实例对象上
function handleSetupResult(instance, setupResult) {
  // TODO function
  if (isObject(setupResult)) {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

// 获取组件的render函数
function finishComponentSetup(instance) {
  const component = instance.type
  const { render } = component
  if (render) {
    // 把render添加到组件实例对象上
    instance.render = render
  }
}
