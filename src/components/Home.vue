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

          <b-button @click="showModal" variant="info" :disabled=joinGameDisabled>
            Join Game Textbox
          </b-button>
          <b-button @click="disconnect" variant="danger" :disabled=disconnectDisabled>Disconnect</b-button>

          <b-modal ref="myModalRef" hide-footer>
            <div class="d-block text-center">
              <h3>Enter the game ID : </h3>
              <b-form @submit="onSubmit">
                <b-form-input style="margin-bottom: 5px;" class="col-6 center_div" v-model="form.gameID" type="number" placeholder="game ID"></b-form-input>
                <b-button type="submit" variant="primary">Join</b-button>
              </b-form>
            </div>
            <b-btn class="mt-3" variant="outline-danger" block @click="hideModal">Close</b-btn>
          </b-modal>
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
          <h1>{{ reply }}</h1>
          <div id="board1" class="center_div" style="width: 500px; padding-top: 30px"></div>
          <b-button style="margin-top: 20px" @click="printBoard">Print Board</b-button>
          <b-button style="margin-top: 20px" @click="create_game" :disabled=createGameDisabled>Create Game</b-button>
        </div>
        <div class="col-lg-4" style="padding-top: 15px;">
          <header>Game Info:</header>
          <b-list-group class="gameInfoList">
            <b-list-group-item v-for="game in gamesAvailable" :key="game.gameID">
              <div class="row">
                <div class="col-4">
                  <b style="font-size: 10px;">Game ID: </b>{{ game.gameID }}
                </div>
                <div class="col-4">
                  <b style="font-size: 10px;">Host: </b>{{ game.hostName }}
                </div>
                <div class="col-4">
                  <b-button variant="primary" style="margin-left: 10px;" @click="join(game.gameID)">Join</b-button>
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>
    </div>
    
    <br>
  </div>
</template>

<script>
import router from '../router'
import UsersApi from '../api/users.js'

export default {
  data () {
    console.log(this.$store.getters.loggedIn)
    console.log(this.$store.getters.userLoggedIn)
    if (!this.$store.getters.loggedIn) {
      router.push({ name: 'LogIn' })
    }
    return {
      form: {
        gameID: null
      },
      invokeIdCnt: 0,
      msg: this.$store.getters.userLoggedIn,
      reply: '',
      user: this.$store.getters.userLoggedIn,
      player: 0,
      turn: 0,
      board: null,
      chess: null,
      gameDest: '',
      gameDestInt: null,
      gamesAvailable: [],
      isWaiting: null,
      connected: false,
      disconnectDisabled: true,
      createGameDisabled: true,
      joinGameDisabled: true,
      isHost: false
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
        if (that.chess.game_over() === true ||
            (that.chess.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (that.chess.turn() === 'b' && piece.search(/^w/) !== -1)) {
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
        // board.position('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R')
        let check =  JSON.stringify({ "from" : that.user });
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
      UsersApi.gamesAvailable(this.user, this.gameRequestCallback);
      // console.log("arr length:  " + this.gamesAvailable.length);
    },
    gameRequestCallback (response){
      console.log(response);
      this.gamesAvailable = response;
    },
    onSubmit (evt) {
      evt.preventDefault()
      if (this.form.gameID != null){
        this.gameDest = "/dest/msg/" + this.form.gameID;
        this.gameDestInt = this.form.gameID;
        this.$stompClient.unsubscribe('lobby');//'lobby', this.unsubscribeResponse
        this.$stompClient.subscribe('/sub/game/' + this.form.gameID, this.gameResponse,
          { id: 'game'+this.gameDestInt }, this.onFailed);
        let body =  JSON.stringify({ "from" : this.user, "command" : "start" })
        this.hideModal();
        this.sendWM(this.gameDest, body, this.invokeIdCnt, this.gameResponse, 3000);
      }
    },
    join(gameID){
      if (this.connected){
        this.$stompClient.unsubscribe('lobby');//'lobby', this.unsubscribeResponse
        this.$stompClient.subscribe('/sub/game/' + gameID, this.gameResponse,{ id: 'game'+gameID }, this.onFailed);
        this.gameDest = "/dest/msg/" + gameID;
        this.gameDestInt = gameID;
        let body =  JSON.stringify({ "from" : this.user, "command" : "start" })
        this.sendWM(this.gameDest, body, this.invokeIdCnt, this.gameResponse, 3000);
      }
    },
    showModal () {
      this.$refs.myModalRef.show()
    },
    hideModal () {
      this.$refs.myModalRef.hide()
    },
    logout () {
      UsersApi.logout()
    },
    printBoard (){
      console.log(this.chess.ascii());
    },
    onConnected (frame) {
      console.log('Connected: ' + frame)
      this.connected = true;
      this.joinGameDisabled = false;
      this.disconnectDisabled = false;
      this.createGameDisabled = false;
      this.$stompClient.subscribe('/user/sub/message', this.subscribeResponse,{ id: 'lobby' }, this.onFailed);
    },
    onFailed (frame) {
      console.log('Failed: ' + frame);
      this.connected = false;
    },    
    connectSrv () {
      var headers = {
        "user": this.user,
        "passcode": 'guest',
      //additional header
      };
      this.connetWM('http://localhost:3000/web_socket', headers, this.onConnected, this.onFailed);    
    },
    create_game (){
      // have to first subscribe to /user/dest/create_game
      let destination = '/dest/create_game'
      let body =  JSON.stringify({ "from" : this.user })
      console.log('creating here');
      this.sendWM(destination, body, this.invokeIdCnt, this.responseCallback, 3000);
    },
    responseCallback (frame){
    },
    subscribeResponse (frame){
      console.log(JSON.parse(frame.body));
      let response = JSON.parse(frame.body);
      if (response.type === "gameReq"){
        let chessID = response.chessID;
        let gameDest = "/dest/msg/" + chessID;
        console.log('DEST ' + gameDest);
        this.gameDest = gameDest;
        this.gameDestInt = chessID;
        this.joinGameDisabled = true;
        this.createGameDisabled = true;
        this.$stompClient.unsubscribe('lobby');
        this.$stompClient.subscribe('/sub/game/' + chessID, this.gameResponse, { id: 'game'+chessID }, this.onFailed);
        let request =  JSON.stringify({ "from" : this.user, "command" : "start" })
        this.sendWM(this.gameDest, request, this.invokeIdCnt, this.gameResponse, 3000);
      }
      // this.reply = JSON.parse(frame.body).reply;
    },
    gameResponse (frame){
      // console.log(JSON.parse(frame.body));
      let reply = JSON.parse(frame.body).reply;
      let turn = JSON.parse(frame.body).turn;
      let player1 = JSON.parse(frame.body).player1;
      let player2 = JSON.parse(frame.body).player2;
      let fenBoard = JSON.parse(frame.body).fenBoard;
      let source = JSON.parse(frame.body).source;
      let target = JSON.parse(frame.body).target;
      if (reply === "disconnect"){
        console.log('Other player offline');
        this.disconnect();
        return;
      }
      if (reply === "Error"){
        this.$stompClient.unsubscribe('game'+this.gameDestInt);
        this.refresh();
        return;
      }
      if (reply === "wait"){
        console.log('waiting for P2');
        this.isHost = true;
        this.isWaiting = true;
      } else if (reply === "start"){
        this.createGameDisabled = true;
        this.joinGameDisabled = true;
        this.refresh();
        this.isWaiting = false;
        if (this.user === player1){
          this.player = 1;
        } else if (this.user === player2){
          this.player = 2;
        }
        this.turn = 1;
        this.board.start();
        if (this.player == 2){
          console.log('P2 board flip');
          this.board.flip();
        }
        this.chess = new Chess();
      } else if (reply === "switch") {
        console.log("fen : " + fenBoard);
        console.log("source " + source);
        console.log("target " + target);
        this.turn = turn;
        this.board.position(fenBoard);
        this.chess.move({ from: source, to: target })
        // console.log(this.chess.load(fenBoard));
        console.log(this.chess.ascii());
      }
    },
    disconnect (){
      this.disconnetWM();
      this.board.clear();
      this.connected = false;
      if (this.isWaiting && this.isHost){
        console.log('sent request to delete the game');
        UsersApi.deleteGame(this.gameDestInt);
      }
      this.disconnectDisabled = true;
      this.joinGameDisabled = true;
      this.createGameDisabled = true;
      this.isHost = false;
      this.isWaiting = null;
      this.chess = null;
      this.refresh();
      this.board.flip();
      this.player = 0;
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
