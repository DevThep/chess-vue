<template>
  <div>
    <h1>{{ msg }}</h1>
    <div class="container center_div">
      <b-form-input v-model="text1" type="text" placeholder="Enter your name"></b-form-input>
     </div>
    <b-button @click="connectSrv">Connect</b-button>
    <b-button @click="send">Send</b-button>
    <b-button @click="disconnect">Disconnect</b-button>
    <br>
    <h1>{{ reply }}</h1>
  </div>
</template>

<script>
import router from '../router'
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
  methods: {
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
</style>
