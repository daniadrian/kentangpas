const express = require("express");
const router = express.Router();
const path = require("path");
const articleService = require(path.resolve(
  __dirname,
  "../services/article.service.js"
));

router.get("/", async (req, res) => {
  try {
    const articles = await articleService.getAllArticles();
    res.json(articles);
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

module.exports = router;
