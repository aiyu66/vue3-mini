import { camelize, isFunction, toHandlerKey } from "../shared"
import { ComponentInstance } from "./component"

/**
 * 实现组件可以发射自定义事件, 在父组件中调用对应的事件处理器
 * @param instance 组件的实例
 * @param evnetName 自定义事件名
 * @param args 事件的参数
 */
export function emit(
  instance: ComponentInstance,
  evnetName: string,
  ...args: any[]
) {
  const { props } = instance

  // TPP: 特例 -> 通用
  // const handler = props["onAdd"]

  // eventName:
  // 1.add -> onAdd
  // 2.add-foo -> onAddFoo, 也就是去掉-, 并把-后边的第一个字符转为大写
  const handler = props[camelize(toHandlerKey(evnetName))]
  if (isFunction(handler)) {
    // 把事件的参数传递到事件处理器中
    handler(...args)
  }
}
