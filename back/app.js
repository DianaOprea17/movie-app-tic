const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');
const admin = require('firebase-admin');

const serviceAccount = require('./movie-app2-7ebf5-firebase-adminsdk-7sju1-092e6e8247.json');
const { getAuth } = require('firebase-admin/auth');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'movie-app2-7ebf5.appspot.com',
});

const storage = admin.storage();
const db = admin.firestore();

const upload = multer({
  storage: multer.memoryStorage(),
});
const port = 3000;
const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:8080', 
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
app.use(express.json());


const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send('Unauthorized');
  }
};

app.post('/add-movie', upload.single('poster'), async (req, res) => {
  try {
    const { title, genre, date, score, details, userEmail } = req.body;
    const file = req.file; 

    const bucket = storage.bucket();
    const fileName = `posters/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    
    await fileUpload.save(file.buffer, {
      contentType: file.mimetype,
      public: true,  
    });

    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    await db.collection('movies').add({
      movie: {
        title,
        genre,
        date,
        score,
        details,
      },
      posterURL: fileUrl,
      userEmail,
    });

    res.status(200).send('Movie added successfully');
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).send('Error adding movie');
  }
});


app.get('/user/:uid', async (req, res) => {
  const uid = req.params.uid;
  try {
    const docRef = db.collection('users').doc(uid);
    const docData = await docRef.get();

    if (docData.exists) {
      const userData = docData.data();
      console.log('User Data:', userData);
      res.status(200).json({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    } else {
      console.error('User document not found');
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('MOVIE APP!');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userInfo = await admin.auth().getUserByEmail(email);
    const idToken = await admin.auth().createCustomToken(userInfo.uid);

    res.status(200).json({
      token: idToken,
      user: { uid: userInfo.uid, email: userInfo.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Invalid credentials or error authenticating user' });
  }
});

app.get('/movies', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    let moviesQuery = db.collection('movies');

    if(userEmail){
      moviesQuery = moviesQuery.where('user.email','==', userEmail);
    }

    const movieD = await moviesQuery.get();
    const movies = movieD.docs.map(doc => ({
      
      id: doc.id,
      title: doc.data().movie?.title,
      genre: doc.data().movie?.genre,
      date: doc.data().movie?.date,
      score: doc.data().movie?.score,
      details: doc.data().movie?.details, 
      posterURL: doc.data().posterURL,
      
    }));
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).send('Error retrieving movies');
  }
});

app.delete("/movies/:id", async (req, res) => {
  const movieId = req.params.id;
  
  try {
    const movieRef = db.collection("movies").doc(movieId);
    const doc = await movieRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const movieData = doc.data();
    
    if (movieData.posterURL) {
      try {
        const bucket = storage.bucket();
        
        const url = movieData.posterURL;
        const decodeURL = decodeURIComponent(url);
        const filePath = decodeURL.split('/o/')[1].split('?')[0];
        
        const file = bucket.file(filePath);
        
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          console.log(`Poster deleted: ${filePath}`);
        } else {
          console.warn(`Poster not found: ${filePath}`);
        }
      } catch (storageError) {
        console.error("Storage Deletion Error:", storageError);
      }
    }


    await movieRef.delete();
    
    res.status(200).json({ message: "Movie and poster deleted successfully" });

  } catch (error) {
    console.error("Deletion Error:", error);
    res.status(500).json({ 
      error: "Failed to delete movie", 
      details: error.message 
    });
  }
});


app.get('/register', (req, res) => {
  res.send('cerere postman');
});

app.post('/protected', verifyToken, (req, res) => {
  res.send(`Hello, ${req.user.email}`);
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
