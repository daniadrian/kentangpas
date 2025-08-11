/**
 * @file article.service.js
 * @description Service untuk pengelolaan data artikel menggunakan Prisma ORM
 * @version 1.0.0
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc Mengambil semua artikel
 * @returns {Promise<Object[]>} Array data artikel
 */
const getAllArticles = async () => {
  return prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      bannerUrl: true,
      author: true,
      publishedAt: true,
    },
  });
};

/**
 * @desc Mengambil detail artikel berdasarkan slug
 * @param {string} slug - Slug artikel
 * @returns {Promise<Object|null>} Detail artikel atau null jika tidak ditemukan
 */
const getArticleBySlug = async (slug) => {
  return prisma.article.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      bannerUrl: true,
      author: true,
      publishedAt: true,
      articleContent: true,
    },
  });
};

module.exports = {
  getAllArticles,
  getArticleBySlug,
};
