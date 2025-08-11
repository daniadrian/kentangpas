const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllArticles = async () =>
  prisma.article.findMany({
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

const getArticleBySlug = async (slug) =>
  prisma.article.findUnique({
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

module.exports = {
  getAllArticles,
  getArticleBySlug,
};
