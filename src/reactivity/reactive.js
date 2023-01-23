import { isObject } from '../utils/index.js'
import { mutableHandlers } from './baseHandlers.js'

export const ReactiveFlags = {
  IS_REACTIVE : "__v_isReactive",
  // IS_READONLY : "__v_isReadonly",
  RAW : "__v_raw",
}

export const reactiveMap = new WeakMap()

export function reactive(target) {
  return createReactiveObject(target, reactiveMap, mutableHandlers)
}

export function createReactiveObject(target, proxyMap, baseHandlers) {
  if (!isObject(target)) {
    return target
  }

  if (isReactive(target)) {
    return target
  }

  if (proxyMap.has(target)) {
    return proxyMap.get(target)
  }

  const proxy = new Proxy(target, baseHandlers)

  proxyMap.set(target, proxy)

  return proxy
  
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}