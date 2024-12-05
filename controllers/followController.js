const { prisma } = require("../prisma/prisma-client");
const { connect } = require("../routes");

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (followingId === userId)
      return res.status(400).json({ error: "Нельзя подписаться на себя" });

    try {
      const existringSunbscription = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (existringSunbscription)
        return res.status(400).json({ error: "Подписка уже существует" });

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });
      res.status(201).json({ message: "Подписка успешно создана" });
    } catch (error) {
      console.error("Ошибка при подписке на пользователя:", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
  unFollowUser: async (req, res) => {
    const { followingId } = req.params;
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows)
        return res.status(404).json({ error: "Подписка не найдена" });
      await prisma.follows.deleteMany({
        where: {
          id: follows.id,
        },
      });
      res.status(200).json({ message: "Подписка успешно удалена" });
    } catch (error) {
      console.error("Ошибка при отписке от пользователя:", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },
};

module.exports = FollowController;
