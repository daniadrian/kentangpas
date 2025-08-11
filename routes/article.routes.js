/**
 * @file article.routes.js
 * @description Routing untuk artikel
 * @version 1.0.0
 */

const express = require("express");
const path = require("path");

const router = express.Router();
const articleService = require(path.resolve(
  __dirname,
  "../services/article.service.js"
));

/**
 * @route GET /articles
 * @desc Mengambil semua artikel
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const articles = await articleService.getAllArticles();
    res.status(200).json({
      success: true,
      message: "Data artikel berhasil diambil",
      data: articles,
    });
  } catch (err) {
    console.error("[Route] Error fetching articles:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data artikel",
    });
  }
});

/**
 * @route GET /articles/:slug
 * @desc Mengambil detail artikel berdasarkan slug
 * @access Public
 */
router.get("/:slug", async (req, res) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail artikel berhasil diambil",
      data: article,
    });
  } catch (err) {
    console.error("[Route] Error fetching article:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail artikel",
    });
  }
});

module.exports = router;
