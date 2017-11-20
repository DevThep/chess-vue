import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

// initial state of the app
const state = {
  auth: false,
  user: ''
}

// mutations are operations that actually mutates the state.
// never call this directly. these actions are only called by `actions` below.
const mutations = {
  login (state, username) {
    console.log('mutations login')
    state.auth = true
    state.user = username
    router.push({ name: 'Home' })
  },
  logout (state) {
    console.log('mutations logout')
    state.auth = false
    state.user = ''
    router.push({ name: 'LogIn' })
  }
}

// operations that can be dispatched from other components.
// example `store.dispatch('login')` will call `login` action and then mutate the state using `mutations.login`
const actions = {
  login: ({ commit }, username) => commit('login', username),
  logout: ({ commit }) => commit('logout')
}

// just getter functions.
const getters = {
  loggedIn: state => state.auth,
  userLoggedIn (state) {
    return state.user
  }
}

// singleton pattern for ES6
// https://k94n.com/es6-modules-single-instance-pattern
// importing @/store.js will always return the same instance
// identical to exporting
// exports.default = new _vuex2.default.Store({
//   state: state,
//   getters: getters,
//   actions: actions,
//   mutations: mutations
// });

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
  plugins: [createPersistedState()]
})
