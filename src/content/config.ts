import { defineCollection, z } from 'astro:content';

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
    coverImage: z.string(),
    tags: z.array(z.string()).default([]),
    locale: z.enum(['fr', 'en']).default('fr'),
    author: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const careersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
    coverImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    locale: z.enum(['fr', 'en']).default('fr'),
    location: z.string(),
    type: z.enum(['CDI', 'CDD', 'Stage', 'Alternance']).default('CDI'),
    department: z.string(),
    active: z.boolean().default(true),
  }),
});

const activitiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    coverImage: z.string(),
    icon: z.string().optional(),
    tags: z.array(z.string()).default([]),
    locale: z.enum(['fr', 'en']).default('fr'),
    order: z.number().default(99),
    color: z.string().default('#1f7a27'),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(['fr', 'en']).default('fr'),
  }),
});

export const collections = {
  news: newsCollection,
  careers: careersCollection,
  activities: activitiesCollection,
  pages: pagesCollection,
};
