import { ComponentInstance } from "./component"

/**
 * 把组件的props添加到组件实例上
 * @param instance 组件的实例
 * @param rawProps 组件的props对象`
 */
export function initProps(
  instance: ComponentInstance,
  rawProps: object | null
) {
  instance.props = rawProps || {}
}
