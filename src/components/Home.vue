<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="info">

      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand href="#">Chess App</b-navbar-brand>

      <b-collapse is-nav id="nav_collapse">

<!--         <b-navbar-nav>
          <b-nav-item href="#">Link</b-nav-item>
          <b-nav-item href="#" disabled>Disabled</b-nav-item>
        </b-navbar-nav> -->

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">

<!--           <b-nav-form>
            <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>
            <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
          </b-nav-form> -->

<!--           <b-nav-item-dropdown text="Lang" right>
            <b-dropdown-item href="#">EN</b-dropdown-item>
            <b-dropdown-item href="#">ES</b-dropdown-item>
            <b-dropdown-item href="#">RU</b-dropdown-item>
            <b-dropdown-item href="#">FA</b-dropdown-item>
          </b-nav-item-dropdown> -->

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
    <br>
    <br>
<!--     <div class="container center_div">
      <b-form-input v-model="text1" type="text" placeholder="Enter your name"></b-form-input>
    </div> -->
    <b-button @click="connectSrv">Connect</b-button>
    <b-button @click="start">Start</b-button>
    <!-- <b-button @click="send">Send</b-button> -->
    <b-button @click="disconnect">Disconnect</b-button>
    <div id="board1" class="center_div" style="width: 550px; padding-top: 30px"></div>
    <!-- <input type="button" id="startBtn" value="Start" /> -->
    <!-- <input type="button" id="clearBtn" value="Clear" /> -->
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
      user: this.$store.getters.userLoggedIn,
      text1: 'text',
      player: 0,
      turn: 0,
      board: null,
      chess: null
    }
  },
  mounted() {
    var context = this;
    var that = this;
    // var board = Chessboard(this.$refs.myDiv);
    var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
      console.log("Source: " + source);
      console.log("Target: " + target);
      console.log("Piece: " + piece);
      console.log("New position: " + ChessBoard.objToFen(newPos));
      console.log("Old position: " + ChessBoard.objToFen(oldPos));
      // console.log("Orientation: " + orientation);
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
        context.sendWM('/dest/msg', body, 0, function (frame) {
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
    // $('#startBtn').on('click', board1.start);
    // $('#startBtn').on('click', function() {
    //   console.log(board);
    //   board.start();
    //   chess = new Chess();
    //   console.log(chess);
    //   console.log(chess.ascii());
    //   console.log(chess.fen());
    // });
    // $('#clearBtn').on('click', function() {
    //   board.clear();
    //   chess.clear();
    //   console.log(chess.ascii());
    //   console.log(chess.fen());
    // });
  },
  methods: {
    logout () {
      UsersApi.logout()
    },
    onConnected (frame) {
      console.log('Connected: ' + frame)
      this.$stompClient.subscribe('/sub/message', this.responseCallback, this.onFailed);
    },
    onFailed (frame) {
      console.log('Failed: ' + frame)
    },         
    connectSrv () {
      var headers = {
        "login": 'guest',
        "passcode": 'guest',
      //additional header
      };
      console.log(this.$refs.myDiv);
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
      let body =  JSON.stringify({ "from" : this.user })
      this.sendWM(destination, body, invokeId, this.responseCallback, 3000);
    },
    start (){
      let body =  JSON.stringify({ "from" : this.user, "command" : "start" })
      this.sendWM('/dest/msg', body, this.invokeIdCnt, this.responseCallback, 3000);
    },
    printBoard (){
      console.log(this.chess.ascii());
    },
    responseCallback (frame){
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
      // let invokeId = frame.body.substr(invokeIdIndex, 4);
      // this.removeStompMonitor(invokeId);
    },
    disconnect (){
      this.disconnetWM();
    }
  },
  stompClient:{
    monitorIntervalTime: 100,
    stompReconnect: true,
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
