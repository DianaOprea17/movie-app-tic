<template>
    <div class="login-container">
      <h2>Log in</h2>
      <form v-on:submit.prevent="login">
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
      </form>
      <p class="signup-link">
        Don't have an account? <router-link to="/register">Sign up</router-link>
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

<style src="@/styles/Login.css"></style>
  