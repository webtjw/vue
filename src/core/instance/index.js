import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue) // 向构造函数 Vue 写入初始化方法
stateMixin(Vue) // 向构造函数 Vue 写入组件状态相关
eventsMixin(Vue) // 向构造函数 Vue 写入事件相关
lifecycleMixin(Vue) // 向构造函数 Vue 写入生命周期相关
renderMixin(Vue) // 向构造函数 Vue 写入组件渲染相关

export default Vue
