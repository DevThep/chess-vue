import Vue from 'vue'
import router from '@/router'

export default {
	gamesAvailable (user, callback) {
    Vue.$http.get(`/available/${user}`)
    .then(function (response) {
      callback(response.data.game)
    })
    .catch(function (response) {
    })
  },
  ongoingGames (user, callback) {
    Vue.$http.get(`/ongoing/${user}`)
    .then(function (response) {
      callback(response.data.game)
    })
    .catch(function (response) {
    })
  },
  deleteGame (chessID) {
    Vue.$http.delete(`/delete/${chessID}`)
    .then(function (response) {
    })
    .catch(function (response) {
    })
  }
}