<template>
    <div>
      <div class="container">
      <h1>{{ username ? `${username}'s Movie List` : "Your Movie List" }}</h1>
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
            <option value="" disabled selected>Select a genre</option>
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

    <div v-if="movies.length >0">
     
      <div class="movie-list">
        <div v-for="movie in movies" :key="movie.id" class="movie-item" @click="showMovieDetails(movie)">
          
          <img 
          :src="movie.posterURL" 
          :alt="movie.title"
          class="movie-poster"
        />
        <div class="movie-details">
          <strong>{{ movie.title }}</strong><br/>
          
        </div>
        </div>

      </div>
    </div>

    <div v-if="selectedMovie" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="closeModal">&times;</button>
        <div class="modal-body">
          <img :src="selectedMovie.posterURL" :alt="selectedMovie.title" class="modal-poster"/>
          <div class="modal-info">

            <h2 v-if="!isEditing">{{ selectedMovie.title }}</h2>
            <input v-else type="text" v-model="editedMovie.title" />

           <p v-if="!isEditing"><strong>Genre:</strong> {{ selectedMovie.genre }}</p>
            <select v-else v-model="editedMovie.genre">
              <option value="Action">Action</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
            </select>

             <p v-if="!isEditing"><strong>Date seen:</strong> {{ formatDate(selectedMovie.date) }}</p>
            <input v-else type="date" v-model="editedMovie.date" />

            <p v-if="!isEditing"><strong>Score:</strong> {{ selectedMovie.score }}/10</p>
            <input v-else type="number" v-model="editedMovie.score" />

            <button class="edit-button" @click="editMovie">Edit</button>
            <button class="delete-button" @click="deleteMovie">Delete</button>
            <button v-if="isEditing" @click="saveMovieEdits">Save</button>
          </div>
        </div>
      </div>
    </div>

  </div>

    
  </template>

<script>
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {auth} from '../firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc} from "firebase/firestore";
import{ ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { storage } from "../firebaseConfig";

const db = getFirestore();

export default {
  name: 'HomePage',
  data(){
    return{
      movies: [],
      isFormVisible: false,
      isEditing: false,
      editedMovie: {},
      newMovie:{
        title: '',
        genre: '',
        date: '',
        score: '',
        poster: null,
      },
      imagePreview: null,
      username: null,
      selectedMovie: null,
    };
  },

  created(){
    this.displayMovies();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.username = user.email; 
        this.fetchUserName(user.uid);
        console.log("User logged in:", user.email);
      } else {
        console.log("No user logged in");
        this.$router.push('/'); 
      }
    });

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
        
        this.imagePreview = URL.createObjectURL(file);
        this.newMovie.poster = file; 
        console.log('Poster uploaded:', this.newMovie.poster);
      }else {
        console.error('No file selected or invalid file.');
      }
    },

    fetchUserName() {
      const user = auth.currentUser;

     if (user) {
         fetch(`http://localhost:3000/user/${user.uid}`).then(response => response.json())
            .then(data => {
               console.log('User data fetched:', data);
               this.username = data.firstName;
             }).catch(error => {
                console.error('Error fetching user:', error);
                });
  }
    },

  async addMovie(){
    try {
        if (!this.newMovie.poster || !(this.newMovie.poster instanceof File)) {
          alert("Please upload a valid movie poster.");
          return;
        }

         //upload poster in storage
        const posterRef = ref(storage, `posters/${this.newMovie.poster.name}`);
        await uploadBytes(posterRef, this.newMovie.poster);
        const posterURL = await getDownloadURL(posterRef);

        const user = auth.currentUser;

        await addDoc(collection(db, "movies"), {
          title: this.newMovie.title,
          genre: this.newMovie.genre ,
          date: this.newMovie.date,
          score: parseFloat(this.newMovie.score),
          posterURL,
          user: {
            uid: user.uid,
            email: user.email,
            
          },
          metadata: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
        });

        console.log('Movie added successfully');
        this.newMovie = { title: '', genre: '', date: '', score: '', poster: null };
        this.imagePreview = null;
        this.isFormVisible = false;
      } catch (error) {
        console.error("Error adding movie: ", error);
      }
    
    },
    async displayMovies(){
      try{
        const response = await fetch('http://localhost:3000/movies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
       const movies = await response.json();
       this.movies = movies.map(movie => ({
      ...movie,
      posterURL: movie.posterURL 
    }));
      } catch(error){
        console.error("Error displaying movies: ", error);
      }
    },

    showMovieDetails(movie){
      this.selectedMovie = movie;
    },
    closeModal(){
      this.selectedMovie = null;
    },
    formatDate(date){
      if (!date) return 'No date available';
      try {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        //'en-GB' este pentru zi/luna/an
        return new Date(date).toLocaleDateString('en-GB', options); 
    } catch (error) {
      return 'Invalid Date';
    }
    },

    editMovie(){
      this.isEditing = true;
      this.editedMovie = { ...this.selectedMovie };
    },

    async saveMovieEdits() {
  try {
    if (!this.selectedMovie.id) return;

    const movieRef = doc(db, "movies", this.selectedMovie.id);
    await updateDoc(movieRef, {
      title: this.editedMovie.title,
      genre: this.editedMovie.genre,
      date: this.editedMovie.date,
      score: this.editedMovie.score,
      "metadata.updatedAt": serverTimestamp(),
    });

    // Actualizăm și în interfață
    Object.assign(this.selectedMovie, this.editedMovie);
    this.isEditing = false;
  } catch (error) {
    console.error("Error updating movie:", error);
  }
},
  }
};
</script>

<style src="../styles/HomePage.css"></style>