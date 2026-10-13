const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Importamos nuestro nuevo modelo de Post
const Post = require('./models/Post');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('¡Conectado a la base de datos de MongoDB!'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// ==========================================
// RUTAS DE LA API PARA EL BLOG
// ==========================================

// 1. OBTENER todos los artículos (Astro usará esta)
app.get('/api/posts', async (req, res) => {
  try {
    // Buscamos todos los posts y los ordenamos por fecha (el más nuevo primero)
    const posts = await Post.find().sort({ publishedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
});

// 2. CREAR un nuevo artículo (Tu panel de admin usará esta)
app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el artículo' });
  }
});

// 3. RUTA TEMPORAL (Solo para probar que podemos guardar en la base de datos)
app.get('/api/crear-prueba', async (req, res) => {
  try {
    const postPrueba = new Post({
      title: 'Mi primer post desde Node y MongoDB',
      slug: 'primer-post-mongodb',
      summary: 'Este es un resumen de prueba. Hemos reemplazado Sanity con éxito.',
      content: 'Aquí iría todo el contenido de tu artículo. Más adelante conectaremos un editor de texto enriquecido desde tu panel de Astro.'
    });
    await postPrueba.save();
    res.send('¡Post de prueba creado con éxito! Ve a http://localhost:3000/api/posts para verlo.');
  } catch (error) {
    res.status(500).send('Error creando post de prueba: ' + error.message);
  }
});

// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});