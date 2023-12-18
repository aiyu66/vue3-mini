import { isObject } from "../shared"

type VNODE_TYPE = {
  type: any
  props?: any
  children?: string | Array<any>
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
  children?: string | Array<any>
) {
  const vnode: VNODE_TYPE = {
    type,
    props,
    children
  }
  return vnode
}

/**
 * 判断是否是组件类型的vnode
 * @param vnode 虚拟节点
 * @returns true|false, true: 表示vnode是一个组件类型
 */
export function isComponentVNode(vnode: any): boolean {
  return isObject(vnode.type)
}
