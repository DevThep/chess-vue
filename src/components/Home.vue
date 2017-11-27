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
              <em>{{ user }}</em>
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
          <b-form-input v-model="text1" type="text" placeholder="Enter your name"></b-form-input>
          <b-button @click="connectSrv">Connect</b-button>
          <b-button @click="send" :disabled=sendDisabled>Send</b-button>
          <b-button @click="joinGame">Join Chess game</b-button>

          <b-button @click="showModal">
            Join Game Textbox
          </b-button>
          <b-modal ref="myModalRef" hide-footer title="Using Component Methods">
            <div class="d-block text-center">
              <h3>Enter the game ID : </h3>
              <b-form @submit="onSubmit">
                <b-form-input style="margin-bottom: 5px;" class="col-6 center_div" v-model="form.gameID" type="number" placeholder="game ID"></b-form-input>
                <b-button type="submit" variant="primary">Join</b-button>
              </b-form>
            </div>
            <b-btn class="mt-3" variant="outline-danger" block @click="hideModal">Close</b-btn>
          </b-modal>
          <b-button @click="gameMsg">Game Send</b-button>
          <b-button @click="disconnect">Disconnect</b-button>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-4" style="padding-top: 15px;">
          <header>Games Available:</header>
          <b-list-group>
            <b-list-group-item>
              <div class="row">
                <div class="col-4">
                  Awesome list
                </div>
                <div class="col-4">
                  Awesome list
                </div>
                <div class="col-4">
                  Awesome list
                </div>
              </div>
            </b-list-group-item>
            <b-list-group-item>
              <div class="row">
                <div class="col-4">
                  Awesome list
                </div>
                <div class="col-4">
                  Awesome list
                </div>
                <div class="col-4">
                  Awesome list
                </div>
              </div>
            </b-list-group-item>
            <b-list-group-item>
              <div class="row">
                <div class="col-4">
                  Awesome list
                </div>
                <div class="col-4">
                  Awesome list
                </div>
                <div class="col-4">
                  Awesome list
                </div>
              </div>
            </b-list-group-item>
          </b-list-group>
          <b-button class="col-12 refresh">Refresh</b-button>
        </div>
        <div class="col-lg-4">
          <h1>{{ reply }}</h1>
          <div id="board1" class="center_div" style="width: 550px; padding-top: 30px"></div>
          <b-button style="margin-top: 20px" @click="printBoard">Print Board</b-button>
          <b-button style="margin-top: 20px" @click="create_game">Create Game</b-button>
        </div>
        <div class="col-lg-4">
          
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
      text1: '',
      reply: '',
      user: this.$store.getters.userLoggedIn,
      player: 0,
      turn: 0,
      board: null,
      chess: null,
      gameDest: '',
      currentGame: null,
      sendDisabled: true
    }
  },
  mounted () {
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
      if (that.turn != that.player){
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
          // let reply = JSON.parse(frame.body).reply;
          // let switch_player = JSON.parse(frame.body).player;
          // let fenBoard = JSON.parse(frame.body).fenBoard;
          // console.log(switch_player);
          // console.log(fenBoard);
          // board.position(fenBoard);
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
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      if (this.form.gameID != null){
        this.$stompClient.unsubscribe('lobby');//'lobby', this.unsubscribeResponse
        this.$stompClient.subscribe('/sub/game', this.gameResponse, this.onFailed);
        this.gameDest = "/dest/msg/" + this.form.gameID;
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
      this.$stompClient.subscribe('/user/sub/message', this.subscribeResponse,{ id: 'lobby' }, this.onFailed);
    },
    onFailed (frame) {
      console.log('Failed: ' + frame);
    },
    joinGame (){
      this.$stompClient.unsubscribe('lobby');//'lobby', this.unsubscribeResponse
      this.$stompClient.subscribe('/sub/game', this.gameResponse, this.onFailed);
      this.gameDest = '/dest/msg/1'
      let body =  JSON.stringify({ "from" : this.user, "command" : "start" })
      this.sendWM(this.gameDest, body, this.invokeIdCnt, this.gameResponse, 3000);
    },
    gameMsg (){
      let destination = '/dest/msg/1'
      let invokeId = this.invokeIdCnt;
      let body =  JSON.stringify({ "from" : this.text1})
      if (this.text1 != '') this.sendWM(destination, body, invokeId, this.responseCallback, 3000);
    },        
    connectSrv () {
      var headers = {
        "user": this.user,
        "passcode": 'guest',
      //additional header
      };
      this.connetWM('http://localhost:3000/web_socket', headers, this.onConnected, this.onFailed);    
    },
    send (){
      let destination = this.gameDest;
      let invokeId = this.invokeIdCnt;
      let body =  JSON.stringify({ "from" : this.user})
      this.sendWM(destination, body, invokeId, this.responseCallback, 3000);
    },
    create_game (){
      // have to first subscribe to /user/dest/create_game
      let destination = '/dest/create_game'
      let body =  JSON.stringify({ "from" : this.user })
      console.log('creating here');
      this.sendWM(destination, body, this.invokeIdCnt, this.responseCallback, 3000);
    },
    responseCallback (frame){
      // console.log(JSON.parse(frame.body));
      // this.reply = JSON.parse(frame.body).reply;
      // let invokeId = frame.body.substr(invokeIdIndex, 4);
      // this.removeStompMonitor(invokeId);
    },
    subscribeResponse (frame){
      console.log(JSON.parse(frame.body));
      let response = JSON.parse(frame.body);
      if (response.type === "gameReq"){
        let chessID = response.chessID;
        let gameDest = "/dest/msg/" + chessID;
        console.log('DEST ' + gameDest);
        this.gameDest = gameDest;
        this.$stompClient.unsubscribe('lobby');
        this.$stompClient.subscribe('/sub/game', this.gameResponse, { id: 'game' }, this.onFailed);
        this.sendDisabled = false;
        let request =  JSON.stringify({ "from" : this.user, "command" : "start" })
        this.sendWM(this.gameDest, request, this.invokeIdCnt, this.gameResponse, 3000);
      }
      // this.reply = JSON.parse(frame.body).reply;
    },
    gameCallback (frame){
      console.log('CREATED GAME');
      console.log(JSON.parse(frame.body).reply);
      // console.log(JSON.parse(frame.body));
      // var chessID = JSON.parse(frame.body).chessID;
      // var gameDest = "/dest/msg/" + chessID;
      // console.log(gameDest);
      // this.gameDest = gameDest;
      // console.log(this.gameDest);
      // this.$stompClient.unsubscribe('lobby');
      // this.$stompClient.subscribe('/sub/game', this.responseCallback, { id: 'game' }, this.onFailed);
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
      if (reply === "wait"){
        console.log('waiting for P2');
      } else if (reply === "start"){
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
      this.sendDisabled = true;
      this.board.clear();
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
  b-navbar{
    padding-bottom: 20px;
  }
  .bg-info {
    background-color: #699ac5 !important;
  }
  .list-group {
    height:578px;
    border-style: solid;
    border-radius: 2px;
    border-color: grey;
    overflow:hidden; 
    overflow-y:scroll;
  }
  .refresh {
    background-color: #92e5aa;
  }
  .refresh:hover {
    background-color: #529665;
  }
</style>
