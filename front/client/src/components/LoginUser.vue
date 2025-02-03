<template>
    <div class="login-container">

      <div class="left-side">
      <img :src=logo alt="Logo" class="logo" />
      <div class="welcome-text">
        <h1>Keep track of all the movies you've watched in one place!</h1>
        <p>Movie Tracker helps you organize your movie collection and rate your favorites. <br>
          Whether you're a casual viewer or a true cinephile, <br>
          this app makes it easy to log your movie experiences.
      </p>
      </div>
    </div>

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
      <p class="change-ps">
        Forgot your password? 
        <a class="link-change-ps" v-on:click="showResetPassword = !showResetPassword"> Click here to change it.</a>
      </p>

      <div v-if="showResetPassword" class="reset-container">
        <div class="reset-content">
        <button class="close-btn" v-on:click="closeForm">&times;</button>
        <h3>Reset your password</h3>

        <label for="resetEmail">Enter your email:</label>
        <input type="email" id="resetEmail" v-model="resetEmail" placeholder="Enter your email" required />
        <button v-on:click="resetPassword" id="reset-btn">Reset Password</button>
        <p v-if="resetMessage" class="reset-message">{{ resetMessage }}</p>
      </div>
    </div>
    </div>
    </div>

  </template>

   
<script>
import { signInWithEmailAndPassword, getIdToken, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import logo from '../assets/logoextinsalb.png';

export default {
  data(){
      return {
        logo,
          email: '',
          password: '',
          errorMessage: '',
          showResetPassword:false,
          resetEmail: '',
          resetMessage: ''
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
  },

  async resetPassword(){
    try{
      await sendPasswordResetEmail(auth, this.resetEmail);
      this.resetMessage = "An email has been sent for you to change the password!";

    } catch(error){
      console.error("Reset error:", error);
      this.resetMessage = "No account found for this email address.";
    }
  },

  closeForm(){
    this.showResetPassword= false;
    this.resetEmail = null;
  }
}

};
</script>

<style src="@/styles/Login.css"></style>
  