<template>
  <div class="signup">
    <img :src="pic" id="logo">
    <h1>{{ msg }}</h1>
    <h2>Sign Up</h2>
    <div class="container center_div">
      <h1 style="font-size: 20px; color: red">{{ error }}</h1>
      <b-form @submit="onSubmit"> 
      <b-form-group id="exampleInputGroup1"
                    label="Email address:" label-for="exampleInput1">
        <b-form-input id="exampleInput1"
                      type="email" v-model="form.email" required
                      placeholder="Enter email"
        ></b-form-input>
      </b-form-group>
      <b-form-group id="exampleInputGroup2"
                    label="Password:" label-for="exampleInput2">
        <b-form-input id="exampleInput2"
                      type="password" v-model="form.password" required
                      placeholder="Enter password"
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary">Sign Up</b-button>
      <b-button type="reset" variant="secondary" @click="reset">Reset</b-button>
    </b-form>
    <br>
    <router-link :to="{ name: 'LogIn'}">
      <b style="font-size: 17px">Have an account, Log In here!</b>
    </router-link>
    </div>
  </div>
</template>

<script>
import UsersApi from '../api/users.js'
import router from '../router'

export default {
  name: 'SignUp',
  data () {
    // console.log(this.$store.getters.loggedIn)
    // console.log(this.$store.getters.userLoggedIn)
    if (this.$store.getters.loggedIn) {
      router.push({ name: 'Home' })
    }
    return {
      form: {
        email: '',
        password: ''
      },
      error: '',
      msg: 'Welcome to Chess App',
      pic: require('../assets/board.svg')
    }
  },
  methods: {
    onSubmit (evt) {
      // console.log(this.form.email)
      // console.log(this.form.password)
      evt.preventDefault()
      var self = this
      UsersApi.signup(this.form.email, this.form.password, function (_response) {
        console.log(_response.success)
        console.log(_response.description)
        if (!_response.success) {
          self.error = _response.description;
        }
      })
    },
    reset () {
      this.error = '';
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#logo{
  width: 280px;
  height: 280px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.center_div{
    margin: 0 auto;
    width: 40%;
}
.signup{
  padding-top: 45px;
}
</style>
