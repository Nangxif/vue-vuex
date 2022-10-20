const applyMixin = (Vue) => {
  // 一般插件的混合都在beforeCreate阶段
  Vue.mixin({
    // 在这个阶段做vuex的初始化
    beforeCreate: vuexInit,
  });
};
// 组件的创建过程是先父组件再创建子组件
function vuexInit() {
  const options = this.$options;
  //   一开始的时候，只有根实例上才有store
  if (options.store) {
    // 根实例
    this.$store = options.store;
  } else if (options.parent && options.parent.$store) {
    // 父亲有了store，儿子才能继承
    // 子组件
    this.$store = options.parent.$store;
  }
}
export default applyMixin;
