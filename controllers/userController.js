const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const jdentIcon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const UserController = {
  register: async (req, res) => {
    try {
      console.log(req.body);
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          error: "Все поля обязательны",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res.status(400).json({
          error: "Пользователь с таким email уже существует",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const png = await jdentIcon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (e) {
      console.error("Ошибка при регистрации:", e);
      res.status(500).json({
        error: "Что-то пошло не так",
      });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Все поля обязательны",
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(400).json({
          error: "Неверный email или пароль",
        });
      }
      const valid = await bcrypt.compare(password, user.password);

      if (!valid)
        return res.status(400).json({
          error: "Неверный email или пароль",
        });

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token });
    } catch (e) {
      console.error("Ошибка при логине:", e);
      res.status(500).json({
        error: "Что-то пошло не так",
      });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;

    const userId = req.user.id;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          followers: true,
          following: true,
        },
      });

      if (!user)
        return res.status(404).json({ error: "Пользователь не найден" });

      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followerId: userId,
            },
            {
              followingId: id,
            },
          ],
        },
      });

      res.json({ ...user, isFolowing: Boolean(isFollowing) });
    } catch (e) {
      console.error("Ошибка при get user:", e);
      res.status(500).json({
        error: "Что-то пошло не так",
      });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name, dateOfBirth, bio, location } = req.body;

    let filePath;

    if (req.file && req.file.path) filePath = req.file.path;

    if (id !== req.user.userId)
      return res.status(403).json({ error: "Нет доступа" });

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email: email },
        });

        if (existingUser && existingUser.id !== id)
          return res.status(400).json({
            error: "Пользователь с таким email уже существует",
          });
      }

      const user = await prisma.user.update({
        where: { id: id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      res.status(500).json({
        error: "Что-то пошло не так",
      });
    }
  },
  currentUser: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user)
        return res.status(400).json({
          error: "Пользователь не найден",
        });

      res.json(user);
    } catch (error) {
      console.error("Ошибка при получении текущего пользователя:", error);
      res.status(500).json({
        error: "Что-то пошло не так",
      });
    }
  },
};

module.exports = UserController;
