import { isArray, isObject, isString } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"

// VNode类型
export interface VNode {
  type: any
  props?: any
  children?: string | any[] | object
  shapeFlag?: number
  el?: HTMLElement | null
}

// vnode的children的类型
export type VNodeChildren = VNode["children"]

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

/**
 * 通过type, props 和 children创建一个vnode
 * @param type vnode的类型
 * @param props vnode的props
 * @param children vnode的children
 * @returns 返回一个vnode对象
 */
export function createVNode(
  type: any,
  props?: any,
  children?: VNodeChildren
): VNode {
  const vnode: VNode = {
    type,
    props,
    children
  }
  // 设置vnode的shapeFlag属性
  vnode.shapeFlag = getVNodeShapeFlag(vnode)

  // 判断 vnode的children是字符串还是数组, 然后使用 | 运算得到vnode真实的shapeFlag
  if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

/**
 * 创建一个文本类型的vnode
 * @param textContent 文本节点的内容
 * @returns 返回一个文本类型的vnode
 */
export function createTextVNode(textContent: string) {
  return createVNode(Text, {}, textContent)
}

/**
 * 获取vnode的shapeFlag属性
 * @param vnode vnode
 * @returns 返回 普通元素 | 有状态组件的vnode的shapeFlags
 */
function getVNodeShapeFlag(vnode: VNode) {
  const { type } = vnode
  if (isString(type)) {
    return ShapeFlags.ELEMENT
  } else if (isObject(type)) {
    return ShapeFlags.STATEFUL_COMPONENT
  }
}

/**
 * 判断vnode是否是组件类型
 * @param vnode 虚拟节点
 * @returns true|false, true: 表示vnode是一个组件类型
 */
export function isComponentVNode(vnode: VNode): boolean {
  return !!(vnode && vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
}

/**
 * 判断vnode是否是element类型
 * @param vnode 虚拟节点
 * @returns true|false, true: 表示vnode是个element类型
 */
export function isElementVNode(vnode: VNode): boolean {
  return !!(vnode && vnode.shapeFlag & ShapeFlags.ELEMENT)
}

/**
 * 判断vnode的children是否是 text 类型
 * @param vnode 虚拟节点
 * @returns 返回 true | false, true表示children是text类型
 */
export function isTextChildren(vnode: VNode): boolean {
  return !!(vnode && vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN)
}

/**
 * 判断vnode的children是否是 数组 类型
 * @param vnode 虚拟节点
 * @returns true | false, true表示children是数组类型
 */
export function isArrayChildren(vnode: VNode): boolean {
  return !!(vnode && vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN)
}
