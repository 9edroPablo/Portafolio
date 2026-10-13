const mongoose = require('mongoose');

// Definimos la estructura que tendrá cada artículo en la base de datos
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true // No pueden haber dos posts con la misma URL
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    default: Date.now // Si no le pasamos fecha, pone la de hoy
  }
});

// Exportamos el modelo
module.exports = mongoose.model('Post', postSchema);