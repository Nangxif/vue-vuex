import Vue from 'vue';
import Vuex from '../simple-vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  // 内部会创造一个vue实例，跨组件通信用的
  state: {
    // 组件的状态 new Vue(data)
    age: 26,
  },
  getters: {
    getAge(state) {
      // 获取计算属性new Vue(computed)依赖 当依赖的值发生变化，会重新执行
      // 如果state.age返回的结果相同，就不会重新执行这个函数
      return state.age + 10;
    },
  },
  mutations: {
    // vue中的方法，唯一可以改状态的方法
    // 更改状态的方式必须是同步的
    changeAge(state, payload) {
      state.age += payload;
    },
  },
  actions: {
    // 通过action中发起请求
    // 所有的异步操作在action中
    changeAge({ commit }) {
      setTimeout(() => {
        commit('changeAge', 10);
      }, 3000);
    },
  },
  modules: {},
});
