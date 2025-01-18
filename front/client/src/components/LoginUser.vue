<template>
    <div class="login-container">
      <div class="login-form">
      <h2>Log in</h2>
      <form v-on:submit.prevent="login">
        <div class="form-content">
        <div class="input-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="input-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="login-btn">Log in</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
      </form>
      <p class="signup-link">
        Don't have an account? <router-link to="/register">Sign up</router-link>
      </p>
    </div>
    </div>
  </template>

   
<script>
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default {
  data(){
      return {
          email: '',
          password: '',
          errorMessage: '',
  };
  },
  methods: {
  async login() {
    try {
      //autentifica utilizatorul 
      await signInWithEmailAndPassword(auth, this.email, this.password);
      console.log('User logged in');

      //obtine token-ul ID de la firebase
      const token = await getIdToken(auth.currentUser);

      //trimite token-ul la backend pentru autentificare
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: this.email, password: this.password }), 
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        this.$router.push('/home');
      } else {
        this.errorMessage = data.message || 'Login failed';
      }

    } catch (error) {
      console.error("Error details:", error);
      if (error.code === 'auth/invalid-credential') {
          this.errorMessage = 'Invalid user. Please check you email and password again.';
        }  else {
          this.errorMessage = 'Error logging in. Please try again.';
        }
    }
  }
}

};
</script>

<style src="@/styles/Login.css"></style>
  