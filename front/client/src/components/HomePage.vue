<template>
  <div >
    <div class="background"></div>
    <div class="homepage" >

      <nav class="navbar">
        <div class="nav-logo">
          <img :src="logo" alt="logo" class="logo-image">
          
        </div>

        <div class="nav-title">
        <span class="nav-link">{{ username ? `${username}'s Movie List` : "Your Movie List" }}</span>
      </div>

      <div class="menu">
        <button v-on:click.stop="toggleMenu" class="menu-btn"> Menu
     <img
        :src="menuIcon"
        :alt="menu-icon"
        class="menu-icon"
        ></button>
        <div v-show="isMenuVisible" class="menu-dropdown">
            <button v-on:click="toggleForm" class="nav-btn">Add New Movie</button>
            <router-link to="/profile" style="text-decoration: none;">
          <button class="nav-btn" to="/profile">Profile</button>
        </router-link>
          <button type = button v-on:click="signoutuser" class="nav-btn"> Sign out</button>
     
          </div>
        
      </div>
        
      </nav>

      <div class="container">

      <div v-if="isFormVisible" class="modal-overlay">
        <div class="modal-content-form" v-on:click.stop>
        <button class="close-button" v-on:click="toggleForm">&times;</button>
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
          <input type="date" id="movieDate" v-model="newMovie.date" :max="currentDate" required />
        </div>

        <div>
          <label for="movieScore">Score:</label>
          <input type="number" id="movieScore" v-model="newMovie.score" max="10" min="0" step="0.1" required />
        </div>

        <div>
          <label for ="details">Other Details: </label>
          <input type="text" id="details" v-model = "newMovie.details" required/>
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
    
    </div></div>

        <div class="search-filter">
          <input v-model="searched" type="text" placeholder="Search" class="search-input">
          <button v-on:click="sortMovies" class="sort-btn">
            Sort {{ sortType === 'asc' ? 'Z-A' : 'A-Z' }}
            <img 
              :src="sortType === 'asc' ? arrowDown : arrowUp" 
              alt="sort direction" 
              class="sort-icon"
            >
          </button>
          
          <div class = "filter-wrap">
          <button v-on:click="toggleFilter" class="filter-btn">Filter by Genre</button>
          
          <div  v-if="isFilterVisible" class="filter-container">
            <div class="filter-options">
             <label for="genreFilter">Choose genre:</label>
              <select id="genreFilter" v-model="selectedFilter">
                <option value="">All</option>
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
         </div>
          </div>
        </div>
     


    <div v-if="filteredMovies.length >0">
     
      <div class="movie-list">
        <div v-for="movie in filteredMovies" :key="movie.id" class="movie-item" v-on:click="showMovieDetails(movie)">
          
          <img 
          :src="movie.posterURL" 
          :alt="movie.title"
          class="movie-poster"
        />
        <div class="movie-details">
          <strong>{{ movie.title }}</strong><br/>
          <strong>{{ movie.score }} /10</strong>
        </div>
        </div>

      </div>
    </div>
    <div v-else class="no-movies"> No movies added yet. <br> Add your first movie selecting the "Add new movie" option from the menu.</div>

    

    <div v-if="selectedMovie" class="modal-overlay" v-on:click="closeModal">
      <div class="modal-content" v-on:click.stop>
        <button class="close-button" v-on:click="closeModal">&times;</button>
        <div class="modal-body">
          <img :src="selectedMovie.posterURL" :alt="selectedMovie.title" class="modal-poster"/>
          <div class="modal-info">

            <h2 v-if="!isEditing">{{ selectedMovie.title }}</h2>
            <input v-else type="text" v-model="editedMovie.title" />

           <p v-if="!isEditing"><strong>Genre:</strong> {{ selectedMovie.genre }}</p>
            <select v-else v-model="editedMovie.genre">
              <option value="Action">Action</option>
              <option value="Animation">Animation</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
            </select>

             <p v-if="!isEditing"><strong>Date seen:</strong> {{ formatDate(selectedMovie.date) }}</p>
            <input v-else type="date" v-model="editedMovie.date" />

            <p v-if="!isEditing"><strong>Score:</strong> {{ selectedMovie.score }}/10</p>
            <input v-else type="number" v-model="editedMovie.score" />

            <p v-if="!isEditing"><strong>Other Details:</strong> {{ selectedMovie.details }}</p>
            <input v-else type="text" v-model="editedMovie.details"/>
            <!-- Inside the modal editing section -->
<div v-if="isEditing">
  <label for="editPoster">Change Poster:</label>
  <input 
    type="file" 
    id="editPoster" 
    @change="handleImageUpload($event, true)" 
    accept="image/png, image/jpeg"
  />
  <div v-if="editedMovie.posterPreview">
    <h3>New Poster Preview:</h3>
    <img 
      :src="editedMovie.posterPreview" 
      alt="New Poster Preview" 
      style="max-width: 200px; margin-top: 10px;"
    />
  </div>
</div>

            <div class="modal-buttons">
            <button v-if="!isEditing" class="edit-button" v-on:click="editMovie">Edit</button>
            <button v-if="!isEditing" class="delete-button" v-on:click="deleteMovie">Delete</button>
          </div>
          <div class="modal-buttons">
            <button  v-if = "isEditing" v-on:click="saveMovieEdits" class="save-button">Save</button>
            <button  v-if = "isEditing" v-on:click="cancelMovie" class="cancel-button">Cancel</button>
          </div>
          </div>
        </div>
      </div>
    </div>

  </div>

</div>
    
  </template>

<script>
import Homepage from '@/components/HomePage';

export default {
  extends: Homepage
};
</script>

<style src="../styles/HomePage.css"></style>