import { isFunction, noop } from "../utils/index.js"
import { ReactiveEffect } from './effect.js'
import { trackRefValue, triggerRefValue } from "./ref.js"


export function computed(getterOrOptions) {

  let getter
  let setter

  const onlyGetter = isFunction(getterOrOptions)

  if (onlyGetter) {
    getter = getterOrOptions
    setter = noop
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set || noop
  }

  return new ComputedRefImpl(getter, setter)

}


class ComputedRefImpl {
  dep
  effect
  _value
  __v_isRef = true
  _dirty = true
  constructor(getter, setter) {
    this._getter = getter
    this._setter = setter

    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })
  }

  get value() {
    trackRefValue(this)

    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }

    return this._value

  }

  set value(newValue) {
    this._setter(newValue)
  }
}