<template>
    <div>
      <h1>Your Movie List</h1>
      <button type = button v-on:click="signoutuser" class="btn-up"> Sign out</button>
      <button @click="toggleForm" class="btn-up">Add New Movie</button>

      <div v-if="isFormVisible" class="addmovieform">
      <h2>Add a New Movie</h2>
       <form @submit.prevent="addMovie">
        <div>
          <label for="movieTitle">Title:</label>
          <input type="text" id="movieTitle" v-model="newMovie.title" required />
        </div>

        <div>
          <label for="movieGenre">Genre:</label>
          <select id="movieGenre" v-model="newMovie.genre" required>
            <option value="" disabled selected>Select a genre</option> <!-- Opțiune default -->
            <option value="Action">Action</option>
            <option value="Animation">Animation</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Horror">Horror</option>
            <option value="Romance">Romance</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Thriller">Thriller</option>
          </select>
        </div>

        <div>
          <label for="movieDate">Date:</label>
          <input type="date" id="movieDate" v-model="newMovie.date" required />
        </div>

        <div>
          <label for="movieScore">Score:</label>
          <input type="number" id="movieScore" v-model="newMovie.score" required />
        </div>

        <div>
          <label for="moviePoster">Movie Poster:</label>
          <input type="file" id="moviePoster" @change="handleImageUpload" accept="image/*" />
        </div>
        <div v-if="imagePreview">
          <h3>Image Preview:</h3>
          <img :src="imagePreview" alt="Image Preview" style="max-width: 200px; margin-top: 10px;"/>
        </div>

        <button type="submit" class="btn-form">Add Movie</button>
        </form>
       </div>

    </div>


  </template>

<script>
import { signOut } from "firebase/auth";
import {auth} from '../firebaseConfig';

export default {
  name: 'HomePage',
  data(){
    return{
      isFormVisible: false,
      newMovie:{
        title: '',
        genre: '',
        date: '',
        score: '',
        poster: null,
      },
      imagePreview: null,
    };
  },
  methods: {
  async signoutuser() {
    console.log("Sign out button clicked");
    try {
      await signOut(auth);
      console.log("User signed out");
      this.$router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  },
  toggleForm(){
    this.isFormVisible = !this.isFormVisible;
  },
  handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Creăm un URL temporar pentru a previzualiza imaginea
        this.imagePreview = URL.createObjectURL(file);
        this.newMovie.image = file; // Salvăm fișierul selectat
      }
    },
  addMovie(){
    console.log('Movie added: ', this.newMovie);

    this.newMovie = { title: '', genre: '', date: '', image: null }; // Resetăm formularul după trimitere
    this.imagePreview = null;
    this.isFormVisible = false;
  }
}
};
</script>

<style src="../styles/HomePage.css"></style>