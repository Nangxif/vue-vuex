<template>
  <div id="app">
    年龄：{{ $store.state.age }}<br />
    计算年龄：{{ $store.getters.getAge }}<br />
    <button @click="$store.commit('changeAge', 5)">同步更新状态</button>
    <button @click="$store.dispatch('changeAge', 5)">异步更新状态</button>
    <button @click="$store.state.age += 1">不合规的方法更新状态</button>
    <!-- {{ $store.state.a.c }}
    {{ $store.state.b.d }} -->
  </div>
</template>

<script>
import { mapState } from './whole-vuex';
export default {
  name: 'App',
  computed: {
    // 上下同理
    ...mapState(['age']),
    // age() {
    //   return this.$store.state.age;
    // },
  },
  methods: {
    // ...mapMutations原理
    changeAge(payload) {
      this.$store.commit('changeAge', payload);
    },
  },
};
</script>
