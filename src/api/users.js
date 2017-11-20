import Vue from 'vue'
import store from '../store'

export default {
  login (email, password, callback) {
    console.log(store)
    var loginParams = {
      username: email,
      password: password
    }
    Vue.$http.post('/sessions', loginParams)
    .then(function (response) {
      let data = response.data
      if (data.success) {
        store.dispatch('login', email)
      }
      callback(response.data)
    })
    .catch(function (response) {
      store.dispatch('logout')
    })
  },
  signup (email, password, callback) {
    console.log(store)
    var signupParams = {
      username: email,
      password: password
    }
    Vue.$http.post('/users', signupParams)
    .then(function (response) {
      callback(response.data)
      // console.log(response.data)
    })
    .catch(function (response) {
      store.dispatch('logout')
    })
  },
  logout () {
    console.log(store)
    store.dispatch('logout')
  }
}
