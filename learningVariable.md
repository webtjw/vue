## 暴露属性：

- Vue.options = {component, directive, filter} // global-init
- Vue.options._base = Vue
- Vue.options.components.KeepAlive // 内置的 keep-alive 组件
- options.extends // 表明当前组件是继承自 options.extends
- options.extend ?????????
- options.propsData ?????????

## 内部属性

- Vue._installedPlugins = [] // 通过 Vue.use 安装的插件列表
- Ctor.super // 指向当前构造器的父类，通过 Vue.extend 得到的子类都带有此属性