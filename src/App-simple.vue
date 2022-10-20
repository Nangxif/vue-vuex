<template>
  <div id="app">
    年龄：{{ $store.state.age }}<br />
    计算年龄：{{ $store.getters.getAge }}<br />

    <button @click="$store.state.age+=10">这种方式是错误的，为了快我就先这么写了</button>
    <!-- <button @click="$store.commit('changeAge', 5)">同步更新状态</button>
    <button @click="$store.dispatch('changeAge', 5)">异步更新状态</button> -->
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>
