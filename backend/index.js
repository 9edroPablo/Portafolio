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

// CORS configurable para producción (por defecto permite cualquier origen en desarrollo)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Middleware de protección opcional para rutas de escritura en producción
// Si defines ADMIN_SECRET en backend/.env, exigirá el header 'x-admin-key'
function requireAdminAuth(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return next(); // En desarrollo local sin ADMIN_SECRET configurado, permite el paso
  }
  const providedKey = req.headers['x-admin-key'];
  if (providedKey !== adminSecret) {
    return res.status(401).json({ error: 'No autorizado: Clave de administrador inválida o faltante.' });
  }
  next();
}

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('¡Conectado a la base de datos de MongoDB!'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// ==========================================
// RUTAS DE LA API PARA EL BLOG
// ==========================================

// 1. OBTENER todos los artículos (Con filtro opcional por estado y slug)
app.get('/api/posts', async (req, res) => {
  try {
    const { status, slug } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (slug) filter.slug = slug;
    
    const posts = await Post.find(filter).sort({ publishedAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los artículos' });
  }
});

// 1.b OBTENER un artículo publicado por SLUG (Ruta para la vista pública /blog/[slug])
app.get('/api/posts/slug/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' });
    if (!post) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el artículo por slug' });
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
app.post('/api/posts', requireAdminAuth, upload.fields([
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
app.put('/api/posts/:id', requireAdminAuth, async (req, res) => {
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

// 5. ELIMINAR un artículo por ID
app.delete('/api/posts/:id', requireAdminAuth, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json({ message: 'Artículo eliminado correctamente', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el artículo' });
  }
});

// ==========================================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});
