<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="info">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand href="#">Chess App</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <!-- Using button-content slot -->
            <template slot="button-content">
              <em style="color:white;">{{ user }}</em>
            </template>
            <b-dropdown-item href="#">Profile</b-dropdown-item>
            <b-dropdown-item href="#" @click="logout">Signout</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-12 center_div">
          <b-button @click="connectSrv" variant="success" :disabled=connected>Connect</b-button>
          <b-button @click="disconnect" variant="danger" :disabled=disconnectDisabled>Disconnect</b-button>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-4" style="padding-top: 15px;">
          <header>Games Available:</header>
          <b-list-group class="gamesList">
            <h3 v-if="gamesAvailable.length == 0" style="padding-top: 250px">No Games Available</h3>
            <b-list-group-item v-for="game in gamesAvailable" :key="game.gameID">
              <div class="row">
                <div class="col-4">
                  <b style="font-size: 10px;">Game ID: </b>{{ game.gameID }}
                </div>
                <div class="col-4">
                  <b style="font-size: 10px;">Host: </b>{{ game.hostName }}
                </div>
                <div class="col-4">
                  <b-button variant="primary" style="margin-left: 10px;" @click="join(game.gameID)" :disabled=joinGameDisabled>
                    Join
                  </b-button>
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
          <b-button class="col-12 refresh" @click="refresh">Refresh</b-button>
        </div>
        <div class="col-lg-4">
          <div id="board1" class="center_div" style="width: 500px; padding-top: 30px"></div>
          <b-button style="margin-top: 20px" @click="create_game" :disabled=createGameDisabled>Create Game</b-button>
        </div>
        <div class="col-lg-4" style="padding-top: 15px;">
          <header>Game Info:</header>
          <b-list-group class="gameInfoList" v-if="!isGameOver">
            <b-list-group-item v-if="!inGame && !isWaiting" style="padding-top: 75px;height: 100%;"><h2>Not in Game</h2></b-list-group-item>
            <b-list-group-item v-if="isWaiting" style="padding-top: 75px;height: 100%;"><h2>Waiting for opponents</h2></b-list-group-item>
            <b-list-group-item v-if="inGame">
              <b>Game ID: </b>{{ gameDestInt }}
            </b-list-group-item>
            <b-list-group-item v-if="inGame">
              <b>Host: </b>
              <h6 v-if="isHost">You</h6>
              <h6 v-else>{{ opponent }}</h6>
            </b-list-group-item>
            <b-list-group-item v-if="inGame">
              <b>Playing Against: </b><h4>{{ opponent }}</h4>
            </b-list-group-item>
            <b-list-group-item v-if="inGame">
              <b>Turn: </b>
              <h3 v-if="turn == player" style="color: green;">Your Turn</h3>
              <h3 v-else style="color: red;">Your Opponents Turn</h3>
            </b-list-group-item>
          </b-list-group>
          <b-list-group class="gameInfoList" v-else>
            <b-list-group-item style="padding-top: 105px; height: 100%; background-color:#89f442"><h2>Game Over</h2>
            <b-button @click="disconnect" variant="danger" :disabled=disconnectDisabled>Leave</b-button>
            </b-list-group-item>
          </b-list-group>
          <header>Games Paused:</header>
          <b-list-group class="gamePausedList">
            <b-list-group-item v-for="game in gamesPaused" :key="game.gameID">
              <div class="row" v-if="gameDestInt != game.gameID">
                <div class="col-4">
                  <b style="font-size: 10px;">Game ID: </b>{{ game.gameID }}
                </div>
                <div class="col-4">
                  <b style="font-size: 10px;">Host: </b>{{ game.hostName }}
                </div>
                <div class="col-4">
                  <b-button variant="success" style="margin-left: 10px;" @click="resume(game.gameID,game.hostName)" :disabled=resumeDisabled>Resume</b-button>
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
          <b-button class="col-12 refresh" @click="getPausedGames">Refresh</b-button>
        </div>
      </div>
    </div>
    <br>
  </div>
</template>

<script>
import router from '../router'
import UsersApi from '../api/users.js'
import GamesApi from '../api/games.js'

export default {
  data () {
    if (!this.$store.getters.loggedIn) {
      router.push({ name: 'LogIn' })
    }
    return {
      user: this.$store.getters.userLoggedIn,
      player: 0,
      turn: 0,
      board: null,
      chess: null,
      gameDest: '',
      gameDestInt: null,
      gamesAvailable: [],
      gamesPaused: [],
      isWaiting: null,
      connected: false,
      disconnectDisabled: true,
      createGameDisabled: true,
      joinGameDisabled: true,
      resumeDisabled: true,
      isHost: false,
      inGame:false,
      opponent: '',
      isGameOver: false
    }
  },
  mounted () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      this.refresh();
      var context = this;
      var that = this;
      var removeGreySquares = function() {
        $('#board1 .square-55d63').css('background', '');
      };
      var greySquare = function(square) {
        var squareEl = $('#board1 .square-' + square);
        var background = '#a9a9a9';
        if (squareEl.hasClass('black-3c85d') === true) {
          background = '#696969';
        }
        squareEl.css('background', background);
      };
      var onDragStart = function(source, piece) {
        // do not pick up pieces if the game is over
        // or if it's not that side's turn
        if (that.chess.game_over() === true) {  
          // that.isGameOver = true;
          that.deleteGame();
          return false;
        }
      };
      var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        if (that.chess == null){
          return;
        }
        var moves = that.chess.moves({
          square: square,
          verbose: true
        });
        // exit if there are no moves available for this square
        if (moves.length === 0) return;
        if (that.player == that.turn){
          // highlight the square they moused over
          greySquare(square);
          // highlight the possible squares for this piece
          for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
          }
        }
      };
      var onMouseoutSquare = function(square, piece) {
        removeGreySquares();
      };
      var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
        removeGreySquares();
        console.log("Source: " + source);
        console.log("Target: " + target);
        console.log("Piece: " + piece);
        console.log("New position: " + ChessBoard.objToFen(newPos));
        console.log("Old position: " + ChessBoard.objToFen(oldPos));
        console.log("Orientation: " + orientation);
        console.log("--------------------");
        console.log("player " + that.player);
        console.log("turn " + that.turn);
        let check =  JSON.stringify({ "from" : that.user , "command" : "move"});
        if (that.turn != that.player){
          context.sendWM(that.gameDest, check, 0, function (frame) {
            console.log(JSON.parse(frame.body));
          }, 3000);
          return 'snapback';
        }
        console.log('BEFORE');
        console.log(that.chess.ascii());
        if (that.chess.move({ from: source, to: target, promotion: 'q' }) != null ) {
          // console.log(chess.ascii());
          let body =  JSON.stringify({ "from" : that.user, 
                    "command" : "move", 
                    "fenBoard" : that.chess.fen(),
                    "source" : source,
                    "target" : target });
          context.sendWM(that.gameDest, body, 0, function (frame) {
            console.log(JSON.parse(frame.body));
          }, 3000);
          console.log('AFTER');
          console.log(that.chess.ascii());
          console.log('move success');
          return;
        }
        console.log(that.chess.ascii());
        return 'snapback';
      };

      this.board = ChessBoard($('#board1'), {
        draggable: true,
        onDrop: onDrop,
        onDragStart: onDragStart,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare
        // onSnapEnd: onSnapEnd
      });
      var board = this.board;
    })
  },
  methods: {
    refresh() {
      var response = [];
      GamesApi.gamesAvailable(this.user, this.gameRequestCallback);
    },
    getPausedGames() {
      var response = [];
      GamesApi.ongoingGames(this.user, this.pausedGameCallback);
    },
    gameRequestCallback (response){
      this.gamesAvailable = response;
    },
    pausedGameCallback (response){
      this.gamesPaused = response;
    },
    join(gameID){
      if (this.connected){
        this.$stompClient.unsubscribe('lobby');
        this.$stompClient.subscribe('/sub/game/' + gameID, this.gameResponse,{ id: 'game'+gameID }, this.onFailed);
        this.gameDest = "/dest/msg/" + gameID;
        this.gameDestInt = gameID;
        let body =  JSON.stringify({ "from" : this.user, "command" : "start" })
        this.sendWM(this.gameDest, body, 0, this.gameResponse, 3000);
      }
    },
    logout () {
      UsersApi.logout()
    },
    onConnected (frame) {
      this.connected = true;
      this.joinGameDisabled = false;
      this.resumeDisabled = false;
      this.disconnectDisabled = false;
      this.createGameDisabled = false;
      this.$stompClient.subscribe('/user/sub/message', this.subscribeResponse,{ id: 'lobby' }, this.onFailed);
    },
    onFailed (frame) {
      this.connected = false;
    },    
    connectSrv () {
      var headers = {
        "user": this.user
      };
      this.connetWM('http://localhost:3000/web_socket', headers, this.onConnected, this.onFailed);    
    },
    create_game (){
      // have to first subscribe to /user/dest/create_game
      let destination = '/dest/create_game'
      let body =  JSON.stringify({ "from" : this.user })
      this.sendWM(destination, body, 0, this.responseCallback, 3000);
    },
    resume (gameID,host){
      if (this.connected){
        this.$stompClient.unsubscribe('lobby');//'lobby', this.unsubscribeResponse
        this.$stompClient.subscribe('/sub/game/' + gameID, this.resumedGameResponse,{ id: 'game'+gameID }, this.onFailed);
        this.gameDest = "/dest/msg/" + gameID;
        this.gameDestInt = gameID;
        if (this.user === host){
          this.isHost = true;
        }
        let body =  JSON.stringify({ "from" : this.user, "command" : "resume" })
        this.sendWM(this.gameDest, body, 0, this.resumedGameResponse, 3000);
      }
    },
    responseCallback (frame){
    },
    subscribeResponse (frame){
      let response = JSON.parse(frame.body);
      if (response.type === "gameReq"){
        let chessID = response.chessID;
        let gameDest = "/dest/msg/" + chessID;
        this.gameDest = gameDest;
        this.gameDestInt = chessID;
        this.joinGameDisabled = true;
        this.createGameDisabled = true;
        this.$stompClient.unsubscribe('lobby');
        this.$stompClient.subscribe('/sub/game/' + chessID, this.gameResponse, { id: 'game'+chessID }, this.onFailed);
        let request =  JSON.stringify({ "from" : this.user, "command" : "start" })
        this.sendWM(this.gameDest, request, 0, this.gameResponse, 3000);
      }
    },
    gameResponse (frame){
      let reply = JSON.parse(frame.body).reply;
      let turn = JSON.parse(frame.body).turn;
      let player1 = JSON.parse(frame.body).player1;
      let player2 = JSON.parse(frame.body).player2;
      let fenBoard = JSON.parse(frame.body).fenBoard;
      let source = JSON.parse(frame.body).source;
      let target = JSON.parse(frame.body).target;
      if (reply === "disconnect"){
        this.disconnect();
        return;
      }
      if (reply === "Error"){
        this.$stompClient.unsubscribe('game'+this.gameDestInt);
        this.refresh();
        return;
      }
      if (reply === "wait"){
        this.isHost = true;
        this.isWaiting = true;
      } else if (reply === "start"){
        this.inGame = true;
        this.createGameDisabled = true;
        this.joinGameDisabled = true;
        this.resumeDisabled = true;
        this.refresh();
        this.isWaiting = false;
        if (this.user === player1){
          this.player = 1;
          this.opponent = player2;
        } else if (this.user === player2){
          this.player = 2;
          this.opponent = player1;
        }
        this.turn = 1;
        this.board.start();
        if (this.player == 2){
          this.board.orientation('black');
        }else {
          this.board.orientation('white');
        }
        this.chess = new Chess();
      } else if (reply === "switch") {
        this.turn = turn;
        this.board.position(fenBoard);
        this.chess.move({ from: source, to: target })
      }
    },
    resumedGameResponse (frame){
      let reply = JSON.parse(frame.body).reply;
      let turn = JSON.parse(frame.body).turn;
      let player1 = JSON.parse(frame.body).player1;
      let player2 = JSON.parse(frame.body).player2;
      let fenBoard = JSON.parse(frame.body).fenBoard;
      let source = JSON.parse(frame.body).source;
      let target = JSON.parse(frame.body).target;
      if (reply === "disconnect"){
        this.disconnect();
        return;
      }
      if (reply === "Error"){
        this.$stompClient.unsubscribe('game'+this.gameDestInt);
        this.refresh();
        return;
      }
      if (reply === "wait"){
        this.resumeDisabled = true;
        this.isWaiting = true;
      } else if (reply === "start"){
        this.inGame = true;
        this.createGameDisabled = true;
        this.joinGameDisabled = true;
        this.resumeDisabled = true;
        this.refresh();
        this.getPausedGames();
        this.isWaiting = false;
        if (this.user === player1){
          this.player = 1;
          this.opponent = player2;
        } else if (this.user === player2){
          this.player = 2;
          this.opponent = player1;
        }
        this.turn = turn;
        this.board.position(fenBoard);
        if (this.player == 2){
          this.board.orientation('black');
        }else {
          this.board.orientation('white');
        }
        this.chess = new Chess(fenBoard);
      } else if (reply === "switch") {
        this.turn = turn;
        this.board.position(fenBoard);
        this.chess.move({ from: source, to: target })
      }
    },
    deleteGame(){
      GamesApi.deleteGame(this.gameDestInt);
    },
    disconnect (){
      this.disconnetWM();
      this.board.clear();
      if (this.isWaiting && this.isHost){
        this.deleteGame();
      }
      this.connected = false;
      this.inGame = false;
      this.disconnectDisabled = true;
      this.joinGameDisabled = true;
      this.createGameDisabled = true;
      this.resumeDisabled = true,
      this.isHost = false;
      this.isWaiting = null;
      this.chess = null;
      this.refresh();
      this.player = 0;
      this.turn = 0;
      this.opponent = '';
      this.gameDest = '';
      this.gameDestInt = null;
      this.isGameOver = false;
    }
  },
  stompClient:{
    monitorIntervalTime: 100,
    stompReconnect: false,
    timeout(orgCmd) {              
    }
  }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .center_div{
    margin: 0 auto;
    width: 40%;
  }
  .navbar {
    margin-bottom: 20px;
  }
  .bg-info {
    background-color: #699ac5 !important;
  }
  .gamesList {
    height:578px;
    border-style: solid;
    border-radius: 2px;
    border-color: grey;
    overflow:hidden; 
    overflow-y:scroll;
  }
  .gameInfoList {
    height:300px;
    border-style: solid;
    border-radius: 2px;
    border-color: grey;
    overflow:hidden; 
    overflow-y:scroll;
  }
  .gamePausedList {
    height:300px;
    border-style: solid;
    border-radius: 2px;
    border-color: grey;
    overflow:hidden; 
    overflow-y:scroll;
  }
  .list-group-item:hover {
    background-color: #c8f1f7;
  }
  .refresh {
    background-color: #92e5aa;
  }
  .refresh:hover {
    background-color: #529665;
  }
</style>
