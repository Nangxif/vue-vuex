export const mapState = (arrList) => {
  let obj = {};
  for (let i = 0; i < arrList.length; i++) {
    let stateName = arrList[i];
    obj[stateName] = function () {
      return this.$store.state[stateName];
    };
  }
  return obj;
};

export const mapGetters = (arrList) => {
  let obj = {};
  for (let i = 0; i < arrList.length; i++) {
    let getterName = arrList[i];
    obj[getterName] = function () {
      return this.$store.getters[getterName];
    };
  }
  return obj;
};

export const mapMutations = (arrList) => {
  let obj = {};
  for (let i = 0; i < arrList.length; i++) {
    let mutationName = arrList[i];
    obj[mutationName] = function (payload) {
      this.$store.commit(mutationName, payload);
    };
  }
  return obj;
};

export const mapActions = (arrList) => {
  let obj = {};
  for (let i = 0; i < arrList.length; i++) {
    let actionName = arrList[i];
    obj[actionName] = function (payload) {
      this.$store.dispatch(actionName, payload);
    };
  }
  return obj;
};
