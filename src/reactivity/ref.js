import { hasChanged, isArray } from '../utils/index.js'
import { createDep } from './dep.js'
import { canTrack, trackEffects, triggerEffects } from './effect.js'
import { toReactive } from './reactive.js'

export function ref(value) {
  if (isRef(value)) {
    return value
  }
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value.__v_isRef === true)
}

class RefImpl {

  __v_isRef = true
  dep

  constructor(value) {
    this._value = toReactive(value)
    this._rawValue = value
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = toReactive(newValue)
      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref) {
  if (canTrack()) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

export function toRefs(object) {
  const ret = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}

export function toRef(object, key, defaultValue) {
  const val = object[key]
  return isRef(val) ? val : new ObjectRefImpl(object, key, defaultValue)
}

class ObjectRefImpl {
  __v_isRef = true
  constructor(object, key, defaultValue) {
    this._object = object
    this._key = key
    this._defaultValue = defaultValue
  }

  get value() {
    const val = this._object[this._key]
    return val === undefined ? this._defaultValue : val
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}