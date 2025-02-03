<template>
  <div class="signup">

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
            type="text"
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
        Already have an account? <router-link to="/">Log in</router-link>
      </p>
    </div>
  </div>
  </template>
  
  <script>

import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from '../firebaseConfig';
import {getFirestore, doc, setDoc} from 'firebase/firestore';
import logo from "../assets/logoextinsalb.png"

const db = getFirestore();

  export default {
    data(){
        return {
          logo,
            firstName:'',
            lastName:'',
            email: '',
            password: '',
            confirmPassword: '',
            errorMessage: '',
    };
    },
    methods: {
        async signUp() {
         if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match!';
         return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        //salveaza informatiile in firestore
        await setDoc(doc(db, 'users', user.uid), {
         firstName: this.firstName,
         lastName: this.lastName,
         email: this.email,
        });  
        console.log('User registered:', userCredential.user);
        
        this.$router.push('/home');
      } catch (error) {
        this.errorMessage = error.message;
        console.error('Error registering user:', error);
      }
    },
    },
  };
  </script>
  

  <style src="@/styles/RegisterUser.css">
  
  </style>
  