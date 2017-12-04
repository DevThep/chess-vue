import Vue from 'vue'
import router from '@/router'

export default {
	gamesAvailable (user, callback) {
    Vue.$http.get(`/availableGamesBy/${user}`)
    .then(function (response) {
      callback(response.data.game)
    })
    .catch(function (response) {
    })
  },
  ongoingGames (user, callback) {
    Vue.$http.get(`/ongoingGamesBy/${user}`)
    .then(function (response) {
      callback(response.data.game)
    })
    .catch(function (response) {
    })
  },
  deleteGame (chessID) {
    Vue.$http.delete(`/chess/${chessID}`)
    .then(function (response) {
    })
    .catch(function (response) {
    })
  }
}