const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const admin = require('firebase-admin');
const { initializeApp, credential } = require('firebase-admin/app');
//const { signInWithEmailAndPassword } = require('firebase/auth');
const serviceAccount = require('./movie-app2-7ebf5-firebase-adminsdk-7sju1-092e6e8247.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
