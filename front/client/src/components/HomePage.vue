<template>
    <div>
      <h1>Welcome to Movie App</h1>
      <button type = button v-on:click="signoutuser"> Sign out</button>
    </div>
  </template>

<script>
import { signOut } from "firebase/auth";
import {auth} from '../firebaseConfig';

export default {
  name: 'HomePage',
  methods: {
  async signoutuser() {
    console.log("Sign out button clicked");
    try {
      await signOut(auth);
      console.log("User signed out");
      this.$router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }
}
};
</script>