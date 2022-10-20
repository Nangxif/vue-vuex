import Vue from 'vue';
import App from './App.vue';
import store from './store';

Vue.config.productionTip = false;
// vuex无法脱离vue，因为内部创建了一个vue实例
new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
