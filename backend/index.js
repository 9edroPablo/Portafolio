const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de almacenamiento con Cloudinary
const upload = require('./config/cloudinary');

// Importamos el modelo de Post
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

// 1. OBTENER todos los artículos (Con filtro opcional por estado para el panel admin)
app.get('/api/posts', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const posts = await Post.find(filter).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
});

// 2. OBTENER un solo artículo por ID (Ruta requerida para la Vista Previa)
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el artículo' });
  }
});

// 3. CREAR un nuevo artículo (Soporta procesamiento de FormData e imágenes)
app.post('/api/posts', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'contentImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const postData = { ...req.body };

    if (req.files && req.files.coverImage) {
      postData.coverImage = req.files.coverImage[0].path;
    }

    if (req.files && req.files.contentImage) {
      postData.contentImage = req.files.contentImage[0].path;
    }

    if (typeof postData.technologies === 'string') {
      postData.technologies = postData.technologies
        .split(',')
        .map(tech => tech.trim())
        .filter(Boolean);
    }

    const newPost = new Post(postData);
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (error) {
    console.error("Detalle del error al guardar el artículo:", error);
    res.status(500).json({ error: error.message || 'Error al guardar el artículo' });
  }
});

// 4. ACTUALIZAR un artículo (Requerido para cambiar de Borrador a Publicado/Archivado)
app.put('/api/posts/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );
    if (!updatedPost) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el artículo' });
  }
});

// 5. RUTA TEMPORAL DE PRUEBA
app.get('/api/crear-prueba', async (req, res) => {
  try {
    const postPrueba = new Post({
      title: 'Mi primer post desde Node y MongoDB',
      slug: 'primer-post-mongodb',
      summary: 'Este es un resumen de prueba. Hemos reemplazado Sanity con éxito.',
      content: 'Aquí iría todo el contenido de tu artículo.'
    });
    await postPrueba.save();
    res.send('¡Post de prueba creado con éxito!');
  } catch (error) {
    res.status(500).send('Error creando post de prueba: ' + error.message);
  }
});

// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});