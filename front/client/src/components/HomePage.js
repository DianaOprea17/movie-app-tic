import logo from '@/assets/logoextinsalb.png';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from '../firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc} from "firebase/firestore";
import{ ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import { storage } from '../firebaseConfig';
import arrowUp from '../assets/up3.png';
import arrowDown from '../assets/down3.png';
import menuIcon from '../assets/menu-icon.png';
//import Slider from Vue3Slider
import Vue3Slider from 'vue3-slider';
//import {notify} from 'vue3-notification';

const db = getFirestore();

export default {
  name: 'HomePage',
  data(){
    return{
      logo,
      arrowDown,
      arrowUp,
      menuIcon,
      Vue3Slider,
      movies: [],
      isFormVisible: false,
      isEditing: false,
      isMenuVisible: false,
      isVisble: false,
      editedMovie: {},
      newMovie:{
        title: '',
        genre: '',
        date: '',
        score: null,
        details: '',
        poster: null,
      },
      currentDate: new Date().toISOString().split("T")[0], //data curenta
      imagePreview: null,
      username: null,
      selectedMovie: null,
      searched: '',
      filteredMovies:[],
      selectedFilter: '',
     
      isFilterVisible: false,
      sortType: 'asc',
    };
  },

  created(){
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.username = user.email; 
        this.fetchUserName(user.uid);
        this.displayMovies();
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
  
  //close pt formular
  toggleForm(){
    this.newMovie = { title: '', genre: '', date: '', score: '', details: '', poster: null };
    this.imagePreview = null;
    this.isFormVisible = !this.isFormVisible;

  },

  handleImageUpload(event, isEditing=false) {
      const file = event.target.files[0];
      if (file) {
        const fileTypes = ['image/png', 'image/jpeg'];
        if(!fileTypes.includes(file.type)){
          alert('Please upload a PNG or JPG file.')
        }

        if(isEditing){
          this.editedMovie.newPoster = file;
          this.editedMovie.posterPreview  = URL.createObjectURL(file);
        } else{
          this.imagePreview = URL.createObjectURL(file);
          this.newMovie.poster = file; 
          console.log('Poster uploaded:', this.newMovie.poster);
        }
        
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

        if(this.newMovie.score <0 || this.newMovie.score>10){
          alert("The score must be between 0 and 10.");
          return;
        }

        if (this.newMovie.date > this.currentDate) {
          alert("The date introduced cannot be in the future!");
          return;
        }

         //upload poster in storage
        const posterRef = ref(storage, `posters/${this.newMovie.poster.name}`);
        await uploadBytes(posterRef, this.newMovie.poster);
        const posterURL = await getDownloadURL(posterRef);

        const user = auth.currentUser;

        await addDoc(collection(db, "movies"), {
          movie:{
            title: this.newMovie.title,
            genre: this.newMovie.genre ,
            date: this.newMovie.date,
            score: parseFloat(this.newMovie.score),
            details: this.newMovie.details
          },
          
          posterURL,
          user: {
            uid: user.uid,
            email: user.email,
            
          },
          metadata: {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
        }).then((docRef) => {
           this.movies.push({
            id: docRef.id,
            title: this.newMovie.title,
            genre: this.newMovie.genre,
            date: this.newMovie.date,
            score: parseFloat(this.newMovie.score),
            details: this.newMovie.details,
            posterURL: posterURL, 
          })});

        console.log('Movie added successfully');
        
        this.newMovie = { title: '', genre: '', date: '', score: '', details: '', poster: null };
        this.imagePreview = null;
        this.isFormVisible = false;
        
        alert("Movie added sucessfully");
      } catch (error) {
        console.error("Error adding movie: ", error);
      }
    
    },

    async displayMovies(){
      try{

        const user = auth.currentUser;
        if(!user){
          console.log('No user logged in');
          return;
        }

        const response = await fetch(`http://localhost:3000/movies?userEmail=${encodeURIComponent(user.email)}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
       const movies = await response.json();
       console.log("Movies received:", movies);
       
       this.movies = movies.map(movie => ({
        id: movie.id,
        ...movie,
      posterURL: movie.posterURL 
    }));

    console.log("Processed movies:", this.movies);
    this.filteredMovies = this.movies;
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

    cancelMovie(){
      this.isEditing= false;
      this.selectedMovie = {...this.editedMovie};
    },

    async saveMovieEdits() {
     try {
      if (!this.selectedMovie.id) return;

      let posterURL = this.selectedMovie.posterURL;

      if (this.editedMovie.newPoster) {
        
        const oldPosterPath = decodeURIComponent(posterURL).split('/o/')[1].split('?')[0];
        const oldPosterRef = ref(storage, oldPosterPath);
        try {
          await deleteObject(oldPosterRef);
          console.log('Old poster deleted');
        } catch (error) {
          console.error('Error deleting old poster:', error);
        }
  
        const posterRef = ref(storage, `posters/${this.editedMovie.newPoster.name}`);
        await uploadBytes(posterRef, this.editedMovie.newPoster);
        posterURL = await getDownloadURL(posterRef);

        const movieIndex = this.movies.findIndex(m => m.id === this.selectedMovie.id);
        if (movieIndex !== -1) {
          this.movies[movieIndex].posterURL = posterURL;
        }
        
        const filteredIndex = this.filteredMovies.findIndex(m => m.id === this.selectedMovie.id);
        if (filteredIndex !== -1) {
          this.filteredMovies[filteredIndex].posterURL = posterURL;
        }
      }
  

      const movieRef = doc(db, "movies", this.selectedMovie.id);
      await updateDoc(movieRef, {
        "movie.title": this.editedMovie.title,
        "movie.genre": this.editedMovie.genre,
        "movie.date": this.editedMovie.date,
        "movie.score": this.editedMovie.score,
        "movie.details": this.editedMovie.details,
        "posterURL": posterURL,
        "metadata.updatedAt": serverTimestamp(),
      });

      Object.assign(this.selectedMovie, {
      ...this.editedMovie,
      posterURL
    });

      this.isEditing = false;
         } catch (error) {
      console.error("Error updating movie:", error);
        }
      },

    async deleteMovie() {
      if (!this.selectedMovie || !this.selectedMovie.id) {
          console.error("No movie selected or invalid movie ID");
          return;
      }

      try {

        if (!confirm("Are you sure you want to delete this movie?")) {
        return;
      }

      console.log("Attempting to delete movie with ID:", this.selectedMovie.id);

      const response = await fetch(`http://localhost:3000/movies/${this.selectedMovie.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Delete response status:", response.status);

      const responseData = await response.json();

      if (!response.ok) {
        alert(responseData.error || "Failed to delete movie");
        return;
      }

      const index = this.movies.findIndex(movie => movie.id === this.selectedMovie.id);
      if (index > -1) {
        this.movies.splice(index, 1);
      }

      this.closeModal();
      console.log('Movie deleted successfully');
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie. Please try again.");
      }
    },
    
    //search
      searching(){
        if(!this.searched){
          this.filteredMovies =[ ...this.movies];
        }else{
          const lowerCase = this.searched.toLowerCase();
          this.filteredMovies = this.movies.filter(movie=>
            movie.title.toLowerCase().includes(lowerCase)
          );
        }

        if(this.sortType === 'desc'){
          this.sortMovies();
        }
      },

      //filter

      toggleFilter() {
        this.isFilterVisible = !this.isFilterVisible;
      },

      applyFilter() {
        if (!this.selectedFilter) {
            this.filteredMovies = this.movies;
        return;
      }

        if (this.selectedFilter) {
            this.filteredMovies = this.movies.filter(movie => movie.genre === this.selectedFilter);
        }
       
        
      },

      toggleMenu(event) {
        event.stopPropagation(); 
        this.isMenuVisible = !this.isMenuVisible;
    },
    closeMenu() {
      this.isMenuVisible = false;
    },

    sortMovies() {
      this.sortType = this.sortType === 'asc' ? 'desc' : 'asc';
      
      this.filteredMovies.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        
        if (this.sortType === 'asc') {
          return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
        } else {
          return titleB < titleA ? -1 : titleB > titleA ? 1 : 0;
        }
      });
    }

  },
  
  watch: {
       searched() {
        this.searching();
      },
       selectedFilter() {
        this.applyFilter();
      },
      
  },
  mounted() {
    document.addEventListener('click', this.closeMenu);

  },

  beforeUnount() {
    document.removeEventListener('click', this.closeMenu);
  },


 

};