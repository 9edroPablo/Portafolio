const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Estado del post para controlar el flujo de publicación
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft' // Se guarda como borrador por defecto
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  // Tecnologías
  technologies: [{
    type: String
  }],

  // Imágenes de Cloudinary
  coverImage: {
    type: String,
    default: ''
  },
  contentImage: {
    type: String,
    default: ''
  },

  // Estilos dinámicos
  bgColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#1f2937'
  },
  titleFont: {
    type: String,
    default: 'sans-serif'
  },

  // Métricas de lecturas
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);