import Vue from 'vue'
import store from '../store'

export default {
  login (email, password, callback) {
    console.log(store)
    var loginParams = {
      username: email,
      password: password
    }
    console.log(loginParams)
    console.log(email)
    console.log(password)
    Vue.$http.post('/users', loginParams)
    .then(function (response) {
      store.dispatch('login')
      callback(response.data)
    })
    .catch(function (response) {
      store.dispatch('logout')
    })
  },
  logout (callback) {
    console.log(store)
    Vue.$http.delete('/users/api_sign_out.json')
    .then(function (response) {
      store.dispatch('logout')
      callback(response.data)
    })
    .catch(function (response) {
      store.dispatch('logout')
    })
  }
}
