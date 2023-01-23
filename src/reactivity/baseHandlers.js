import { hasChanged, isObject } from '../utils/index.js'
import { track, trigger } from './effect.js'
import { reactive, ReactiveFlags, reactiveMap } from './reactive.js'

function createGetter() {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.RAW && receiver === reactiveMap.get(target)) {
      return target
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    const res = Reflect.get(target, key, receiver)

    track(target, key)

    if (isObject(res)) {
      return reactive(res)
    }

    return res
  }
}

function createSetter() {
  return function set(target, key, newValue, receiver) {
    const oldValue = target[key]
    const res = Reflect.set(target, key, newValue, receiver)
    if (hasChanged(oldValue, newValue)) {
      trigger(target, key)
    }
    return res
  }
}

const get = createGetter()
const set = createSetter()

export const mutableHandlers = {
  get,
  set
}