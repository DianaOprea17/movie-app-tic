<template>
    <div class="signup-container">
      <h2>Sign Up</h2>
      <form v-on:submit.prevent="signUp">
        <div class="input-group">
          <label for="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            v-model="firstName"
            placeholder="Enter your first name"
            required
          />
        </div>
        <div class="input-group">
          <label for="lastName">Last Name:</label>
          <input
            type="lastName"
            id="lastName"
            v-model="lastName"
            placeholder="Enter your last name"
            required
          />
        </div>
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
        <div class="input-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            required
          />
        </div>
        <button type="submit" class="signup-btn">Sign Up</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <p class="login-link">
        Already have an account? <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </template>
  
  <script>
  export default {
    data(){
        return {
            firstName:'',
            lastName:'',
            email: '',
            password: '',
            confirmPassword: '',
            errorMessage: '',
    };
    }
  }
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style src="@/styles/RegisterUser.css">
  
  </style>
  