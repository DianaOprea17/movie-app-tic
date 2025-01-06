const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');
const admin = require('firebase-admin');
const { initializeApp, credential } = require('firebase-admin/app');
//const { signInWithEmailAndPassword } = require('firebase/auth');
const serviceAccount = require('./movie-app2-7ebf5-firebase-adminsdk-7sju1-092e6e8247.json');
const storage = admin.storage();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'movie-app2-7ebf5.appspot.com', 
});

const upload = multer({
  storage: multer.memoryStorage(),
});
const port = 3000;
const app = express();

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors())
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
    const { title, genre, date, score, userEmail } = req.body;
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
      title,
      genre,
      date,
      score,
      posterURL: fileUrl,
      userEmail,
    });

    res.status(200).send('Movie added successfully');
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).send('Error adding movie');
  }
});

app.get('/', (req, res) => {
  res.send('MOVIE APP!');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const idToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({
      token: idToken,
      user: { uid: userRecord.uid, email: userRecord.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Invalid credentials or error authenticating user' });
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
