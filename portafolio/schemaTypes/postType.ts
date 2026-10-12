import { defineField, defineType } from 'sanity';

export const postType = defineType({
  name: 'post',
  title: 'Entradas del Blog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título del artículo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL amigable)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha de publicación',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagen principal',
      type: 'image',
      options: {
        hotspot: true, // Permite recortar/enfocar la imagen desde Sanity
      },
    }),
    defineField({
      name: 'summary',
      title: 'Resumen o Extracto',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Contenido del artículo',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
  ],
});