<template>
    <div class="profile-b"></div>
    <div class="all">
        <nav class="navbar">
        <div class="nav-logo">
          <img :src="logo" alt="logo" class="logo-image">
          
        </div>

        <div class="nav-title">
        <span class="nav-link">{{ username ? `${username}'s profile` : "Your profile" }}</span>
      </div>

      <div class="menu">
        <button v-on:click.stop="toggleMenu" class="menu-btn"> Menu
          <img
        :src="menuIcon"
        :alt="menu-icon"
        class="menu-icon"
        >
        </button>
        <div v-show="isMenuVisible" class="menu-dropdown">
            <router-link style="text-decoration: none;" to="/home">
              <button class="nav-btn">Movie List</button>
            </router-link>
          <button type = button v-on:click="signoutuser" class="nav-btn"> Sign out</button>
     
          </div>
        
      </div>
        
      </nav>

      <div class ="container">
      <div class="watched">
        <p> Movies Watched: {{ movieCount }}</p>
      </div>
    </div>

      <div class="profile">
        <div class="profile-card">
            <div class="info-group">
                <label>First Name: </label>
                <input
                type = "text"
                v-model="userProfile.firstName"
                :disabled="!isEditing"
                class="profile-input"
                >
            </div>

            <div class="info-group">
                <label>Last Name: </label>
                <input
                type = "text"
                v-model="userProfile.lastName"
                :disabled="!isEditing"
                class="profile-input"
                >
            </div>

            <div class="info-group">
                <label>Email: </label>
                <input
                type = "text"
                v-model="userProfile.email"
                :disabled="!isEditing"
                class="profile-input"
                >
            </div>

            <div class="profile-action">
                <button v-if="!isEditing" v-on:click="startEditing" class="edit-btn">
                Edit profile
                </button>
                <button v-if="!isEditing" class="pass-btn" v-on:click="confirmChange">Change password</button>
              <template v-else>
                    <button v-on:click="saveProfile" class="save-btn">Save</button>
                    <button v-on:click="cancelEditing" class="cancel-btn">Cancel</button>
              </template> 
              
            </div>
        </div>

      </div>

      

    </div>

</template>

<script>
import logo from '@/assets/logoextinsalb.png';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import {auth} from '../firebaseConfig';
import { getFirestore, doc, getDoc, updateDoc, collection, where, query, getCountFromServer } from 'firebase/firestore';
import menuIcon from '../assets/menu-icon.png';
//import { notify } from "@kyvg/vue3-notification";

export default {
  name: 'UserProfile',
  data(){
    return{
      logo,
      username: null,
      isMenuVisible:false,
      isEditing:false,
      menuIcon,
      movieCount: 0,
      userProfile: {
        firstName: '',
        lastName: '',
        email: '',
      
      },
    };
  },

  async created() {
    await this.fetchUserProfile();
    await this.fetchUserStats();

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

  async confirmChange(){
    const confirmation = confirm("Are you sure you want to change your password?");

    if(confirmation){
      await this.changePassword();
    } else{
      console.log("password change denied")
    }
  }, 

  async changePassword(){
    const email = this.userProfile.email;
    try{
      await sendPasswordResetEmail(auth, email);
      alert('Email sent to resend password')
    } catch(error){
      console.error('Error sending reset email:', error);
      alert('There was a problem in reseting your password. Please try again later');
    }
  },

  //preia datele din firebase
  async fetchUserProfile() {
    
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.userProfile = {
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: user.email,
            };
            this.username = userData.firstName;
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },

    startEditing() {
      this.originalProfile = { ...this.userProfile };
      this.isEditing = true;
    },

    async saveProfile() {
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          await updateDoc(doc(db, 'users', user.uid), {
            firstName: this.userProfile.firstName,
            lastName: this.userProfile.lastName,
          });
          this.isEditing = false;
          this.username = this.userProfile.firstName;
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    },

    cancelEditing() {
      this.userProfile = { ...this.originalProfile };
      this.isEditing = false;
    },

    async fetchUserName() {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(); 
    
        fetch(`http://localhost:3000/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('User data fetched:', data);
          this.username = data.firstName;
        })
        .catch(error => {
          console.error('Error fetching user:', error);
        });
      }
    },

    toggleMenu(event) {
        event.stopPropagation(); 
        this.isMenuVisible = !this.isMenuVisible;
    },
    closeMenu() {
      this.isMenuVisible = false;
    },

    async fetchUserStats(){
      try {
            const user = auth.currentUser;
            if (user) {
              const db = getFirestore();
              const moviesQuery = query(
                collection(db, 'movies'),
                where('user.email', '==', user.email)
              );
        const snapshot = await getCountFromServer(moviesQuery);
        this.movieCount = snapshot.data().count;
        
            }
      } catch (error) {
        console.error('Error fetching movie count:', error);
        this.movieCount = 0;
      }
    }

  },
      
  mounted() {
    document.addEventListener('click', this.closeMenu);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
  }
    

};
</script>

<styles src="../styles/UserProfile.css">

</styles>