import { isObject, isString } from "../shared"

// VNode类型
export interface VNode {
  type: any
  props?: any
  children?: string | any[]
  el?: HTMLElement | null
}
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
  children?: string | any[]
): VNode {
  const vnode: VNode = {
    type,
    props,
    children
  }
  return vnode
}

/**
 * 判断vnode是否是组件类型
 * @param vnode 虚拟节点
 * @returns true|false, true: 表示vnode是一个组件类型
 */
export function isComponentVNode(type: any): boolean {
  return isObject(type)
}

/**
 * 判断vnode是否是element类型
 * @param type VNode的类型
 * @returns true|false, true: 表示vnode是个element类型
 */
export function isElementVNode(type: any): boolean {
  return isString(type)
}
