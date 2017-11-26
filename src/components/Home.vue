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
    <h1>{{ msg }}</h1>
    <div class="container center_div">
      <b-form-input v-model="text1" type="text" placeholder="Enter your name"></b-form-input>
     </div>
    <b-button @click="connectSrv">Connect</b-button>
    <b-button @click="send">Send</b-button>
    <b-button @click="joinGame">Join Chess game</b-button>
    <b-button @click="gameMsg">Game Send</b-button>
    <b-button @click="disconnect">Disconnect</b-button>
    <br>
    <h1>{{ reply }}</h1>
    <div id="board1" class="center_div" style="width: 550px; padding-top: 30px"></div>
    <b-button style="margin-top: 20px" @click="printBoard">Print Board</b-button>
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
      invokeIdCnt: 0,
      msg: this.$store.getters.userLoggedIn,
      text1: '',
      reply: '',
      user: this.$store.getters.userLoggedIn,
      player: 0,
      turn: 0,
      board: null,
      chess: null,
      gameDest: ''
    }
  },
  mounted () {
    var context = this;
    var that = this;
    var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
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
      if (that.chess.move({ from: source, to: target }) != null ) {
        // console.log(chess.ascii());
        let body =  JSON.stringify({ "from" : that.user, 
                  "command" : "move", 
                  "fenBoard" : ChessBoard.objToFen(newPos),
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
        onDrop: onDrop
        // dropOffBoard: 'trash',
        // sparePieces: true
    });
    var board = this.board;
  },
  methods: {
    logout () {
      UsersApi.logout()
    },
    printBoard (){
      console.log(this.chess.ascii());
    },
    onConnected (frame) {
      console.log('Connected: ' + frame)
      this.$stompClient.subscribe('/sub/message', this.subscribeResponse,{ id: 'lobby' }, this.onFailed);
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
    // getInvokeId () { 
    //   let hex = (this.invokeIdCnt++ ).toString(16);
    //   var zero = '0000';
    //   var tmp  = 4-hex.length;
    //   return zero.substr(0,tmp) + hex;
    // },
    send (){
      let destination = '/dest/msg'
      let invokeId = this.invokeIdCnt;
      let body =  JSON.stringify({ "from" : this.text1})
      if (this.text1 != '') this.sendWM(destination, body, invokeId, this.responseCallback, 3000);
    },
    responseCallback (frame){
      // console.log(JSON.parse(frame.body));
      this.reply = JSON.parse(frame.body).reply;
      // let invokeId = frame.body.substr(invokeIdIndex, 4);
      // this.removeStompMonitor(invokeId);
    },
    subscribeResponse (frame){
      console.log(JSON.parse(frame.body));
      this.reply = JSON.parse(frame.body).reply;
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
</style>
