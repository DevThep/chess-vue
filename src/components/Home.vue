<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="info">

      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand href="#">NavBar</b-navbar-brand>

      <b-collapse is-nav id="nav_collapse">

        <b-navbar-nav>
          <b-nav-item href="#">Link</b-nav-item>
          <b-nav-item href="#" disabled>Disabled</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">

          <b-nav-form>
            <b-form-input size="sm" class="mr-sm-2" type="text" placeholder="Search"/>
            <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
          </b-nav-form>

          <b-nav-item-dropdown text="Lang" right>
            <b-dropdown-item href="#">EN</b-dropdown-item>
            <b-dropdown-item href="#">ES</b-dropdown-item>
            <b-dropdown-item href="#">RU</b-dropdown-item>
            <b-dropdown-item href="#">FA</b-dropdown-item>
          </b-nav-item-dropdown>

          <b-nav-item-dropdown right>
            <!-- Using button-content slot -->
            <template slot="button-content">
              <em>User</em>
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
    <b-button @click="disconnect">Disconnect</b-button>
    <br>
    <h1>{{ reply }}</h1>
    <div id="board1" style="width: 400px"></div>
    <input type="button" id="startBtn" value="Start" />
    <input type="button" id="clearBtn" value="Clear" />
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
      reply: ''
    }
  },
  mounted() {
    // var board = Chessboard(this.$refs.myDiv);
    var board1 = ChessBoard($('#board1'), {
        draggable: true,
        dropOffBoard: 'trash',
        // sparePieces: true
      });
    // $('#startBtn').on('click', board1.start);
    $('#startBtn').on('click', function() {
      board1.position({
        a1: 'bP',
        a3: 'bP',
        b2: 'bP',
        c1: 'bP',
        c3: 'bP',
        d2: 'bP',
        e1: 'bP',
        e3: 'bP',
        f2: 'bP',
        g1: 'bP',
        g3: 'bP',
        h2: 'bP',

        b6: 'wP',
        b8: 'wP',
        a7: 'wP',
        d6: 'wP',
        d8: 'wP',
        c7: 'wP',
        e7: 'wP',
        f6: 'wP',
        f8: 'wP',
        g7: 'wP',
        h6: 'wP',
        h8: 'wP'
      });
    });
    $('#clearBtn').on('click', board1.clear);
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
      let body =  JSON.stringify({ "from" : this.text1})
      if (this.text1 != '') this.sendWM(destination, body, invokeId, this.responseCallback, 3000);
    },
    responseCallback (frame){
      // console.log(JSON.parse(frame.body));
      this.reply = JSON.parse(frame.body).reply;
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
