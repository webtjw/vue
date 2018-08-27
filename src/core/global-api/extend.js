/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this // 不一定就是 Vue，因为 extend 方法到后面也会被添加到子类上
    const SuperId = Super.cid
    // TODO 这里的缓存？？？extendOptions._Ctor 不可能由用户写入，哪究竟在哪写入的？
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // name 用于自身循环递归组件，如弹窗里的弹窗
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }

    // 子类构造函数
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype) // 建立原型链
    Sub.prototype.constructor = Sub // 子类原型构造器属性
    Sub.cid = cid++ // 子类 cid
    // 合并传参 options 和父类 options，得到子类自带静态属性 options
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super // 任何带有 super 属性的构造器都是通过 Vue.extend 创建的

    // TODO 在类原型上添加了一个 _props 属性，用于代理类静态 options 中的 props，待详细验证了解
    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // 允许更深层次的拓展 extend / mixin / plugin
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // 允许拓展类可以拥有私有的资源 components / filters / directives
    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // 递归调用自身为子组件
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // 保留对父类 options 的引用，这样就可以在实例化时检查父类的 options 是否更新修改过 TODO
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // 缓存父类 id
    // cache constructor
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
