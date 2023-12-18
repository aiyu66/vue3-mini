import { createComponentInstance, setupComponent } from "./component"
import { isComponentVNode } from "./vnode"

export function render(vnode, container) {
  // 只调用patch方法
  patch(vnode, container)
}

// 运行时核心函数
// 无论是初始化, 更新 还是处理children都会被调用
function patch(vnode, container) {
  if (isComponentVNode(vnode)) {
    processComponent(vnode, container)
  }
}

/**
 * 处理组件类型的vnode
 * @param vnode 组件的vnode
 * @param container 挂载组件的DOM元素
 */
function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

/**
 * 初始化组件
 * @param vnode 组件的vnode对象
 * @param container 挂载组件的DOM元素
 */
function mountComponent(vnode, container) {
  // 1.创建组件的实例对象
  const instance = createComponentInstance(vnode)
  // 2.处理组件的props, slots, setup以及render
  setupComponent(instance)
  // 3.调用组件的render函数, 以渲染组件的节点
  setupRenderEffect(instance, container)
}

/**
 * 调用组件的render函数把组件的vnode递归渲染成真实的DOM元素
 * @param instance 组件的实力对象
 * @param container 挂载组件的DOM元素
 */
function setupRenderEffect(instance, container) {
  const { render, setupState } = instance
  const subTree = render.call(setupState)
  patch(subTree, container)
}
