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
          email: '',
          password: '',
          errorMessage: '',
  };
  },
  methods: {
  async login() {
    try {
      // Autentifică utilizatorul cu email și parolă folosind Firebase
     // await signInWithEmailAndPassword(auth, this.email, this.password);
     // console.log('User logged in');

      // Obține token-ul ID de la Firebase
      //const token = await getIdToken(auth.currentUser);

      // Trimite token-ul la backend pentru autentificare
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error logging in: ', error);
      this.errorMessage = 'Error logging in. Please try again.';
    }
  }
}

};
</script>

<style src="@/styles/Login.css"></style>
  