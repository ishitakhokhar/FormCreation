const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect, authorizeRoles } = require('../middlewares/authMiddleware'); // Your auth middleware

// router.get('/', protect, authorizeRoles('admin'), async (req, res) => {
//   try {
//     const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

router.post("/register", registerUser);
router.post("/login", loginUser);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
