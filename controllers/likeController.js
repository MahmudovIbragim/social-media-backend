const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  likePost: async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    if (!postId)
      return res.status(400).json({ error: "идентификатор поста не указан" });

    try {
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: postId,
          userId: userId,
        },
      });

      if (existingLike) {
        res.status(400).json({ error: "Пост уже лайкнут" });
      }

      const like = await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });

      res.json(like);
    } catch (error) {
      console.error("Ошибка при лайке поста:", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
  unLikeDelete: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    if (!id)
      return res.status(400).json({ error: "идентификатор поста не указан" });

    try {
      const existingLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if (!existingLike)
        return res.status(404).json({ error: "Лайк уже существует" });

      const like = await prisma.like.deleteMany({
        where: {
          postId: id,
          userId,
        },
      });
      res.json(like);
    } catch (error) {
      console.error("Ошибка при удалении лайка:", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = LikeController;
