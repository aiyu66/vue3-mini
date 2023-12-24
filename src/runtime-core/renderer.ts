import { isArray, isString } from "../shared"
import {
  createComponentInstance,
  setupComponent,
  ComponentInstance
} from "./component"
import {
  isArrayChildren,
  isComponentVNode,
  isElementVNode,
  isTextChildren,
  VNode
} from "./vnode"

export function render(vnode: VNode, container) {
  // 只调用patch方法
  patch(vnode, container)
}

// 运行时核心函数
// 无论是初始化, 更新 还是处理children都会通过patch来完成
function patch(vnode: VNode, container) {
  if (isComponentVNode(vnode)) {
    processComponent(vnode, container)
  } else if (isElementVNode(vnode)) {
    processElement(vnode, container)
  }
}

// 处理Element类型的vnode
function processElement(vnode: VNode, container) {
  mountElement(vnode, container)
}

// 把vnode创建成真实的DOM元素
function mountElement(vnode: VNode, container) {
  // 特例 -> 通用
  // const el = document.createElement("div")
  // el.textContent = "hello world"
  // document.body.append(el)

  const { type, props, children } = vnode
  // 通过vnode的type创建出对应的DOM元素, 并和vnode绑定
  const el = (vnode.el = document.createElement(type))

  // 处理props
  for (const key in props) {
    const value = props[key]
    // HTML Attibute 和 DOM property 有些类似, 但不完全一样
    // vue3中对class, style 常用属性 做了增强
    el.setAttribute(key, value)
  }

  // 处理children
  if (isTextChildren(vnode)) {
    el.textContent = children
  } else if (isArrayChildren(vnode)) {
    mountChildren(children as any[], el)
  }

  // 把el添加到container中
  container.append(el)
}

// 挂载children
function mountChildren(children: any[], container: any) {
  // 数组类型的children也是由多个vnode组成, 因此需要patch
  children.forEach(vnode => {
    patch(vnode, container)
  })
}

/**
 * 处理组件类型的vnode
 * @param vnode 组件的vnode
 * @param container 挂载组件的DOM元素
 */
function processComponent(vnode: VNode, container) {
  mountComponent(vnode, container)
}

/**
 * 初始化组件
 * @param initialVNode 组件的vnode对象
 * @param container 挂载组件的DOM元素
 */
function mountComponent(initialVNode: VNode, container) {
  // 1.创建组件的实例对象
  const instance = createComponentInstance(initialVNode)
  // 2.处理组件的props, slots, setup以及render
  setupComponent(instance)
  // 3.调用组件的render函数, 以渲染组件的节点
  setupRenderEffect(instance, initialVNode, container)
}

/**
 * 调用组件的render函数把组件的vnode递归渲染成真实的DOM元素
 * @param instance 组件的实力对象
 * @param container 挂载组件的DOM元素
 */
function setupRenderEffect(
  instance: ComponentInstance,
  initialVNode: VNode,
  container
) {
  const { render, proxy } = instance
  const subTree = render.call(proxy)
  patch(subTree, container)

  // 组件的所有子元素都处理完毕后, 设置vnode的el为根节点
  initialVNode.el = subTree.el
}
