// 用于设置/判断vnode的类型, 以代替判断 对象/字符串/数组 的方式
export const enum ShapeFlags {
  ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3 // 1000
}

// 使用ShapeFlags来判断vnode的类型的目的是 & | 运算的效率高
// 使用 | 运算 设置 vnode 的shapeFlag
// 使用 & 运算 来判断 vnode的类型
