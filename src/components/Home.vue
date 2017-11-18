<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
// import UsersApi from '../api/users.js'
import router from '../router'

export default {
  name: 'Home',
  data () {
    console.log(this.$store.getters.loggedIn)
    console.log(this.$store.getters.userLoggedIn)
    if (!this.$store.getters.loggedIn) {
      router.push({ name: 'LogIn' })
    }
    return {
      msg: this.$store.getters.userLoggedIn
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
