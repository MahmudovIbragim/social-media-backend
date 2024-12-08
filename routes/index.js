const express = require("express");
const multer = require("multer");
const {
  UserController,
  PostController,
  CommentController,
  LikeController,
  FollowController,
} = require("../controllers");
const authenticateToken = require("../middleware/auth");
const router = express.Router();

const uploadDestination = "uploads";
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//route users
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.currentUser);
router.get("/user/:id", authenticateToken, UserController.getUserById);
router.put("/user/:id", authenticateToken, UserController.updateUser);
//route posts
router.post("/post", authenticateToken, PostController.createPost);
router.get("/posts", authenticateToken, PostController.getAllPosts);
router.get("/post/:id", authenticateToken, PostController.getPostById);
router.delete("/post/:id", authenticateToken, PostController.deletePost);
//route comments
router.post("/comment", authenticateToken, CommentController.createComment);
router.delete(
  "/comment/:id",
  authenticateToken,
  CommentController.deleteComment
);
//route Likes
router.post("/like", authenticateToken, LikeController.likePost);
router.delete("/like/:id", authenticateToken, LikeController.unLikeDelete);
//route follows
router.post("/follow", authenticateToken, FollowController.followUser);
router.delete(
  "/unfollow/:id",
  authenticateToken,
  FollowController.unFollowUser
);

module.exports = router;
