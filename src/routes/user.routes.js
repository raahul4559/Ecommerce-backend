import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  registerUser,
  resendEmailVerification,
  resetPassword,
  updateAccountDetails,
  verifyEmail
}
  from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "passport";
import "../passport/index.js";

const router = Router();


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAcessToken)
router.route("/verify-email/:resetToken").get(verifyEmail)
router.route("/resend-verify-email").get(resendEmailVerification)

// secured routes

router.route("/logout").get(verifyJWT, logoutUser)
router.route("/forgot-password").post(verifyJWT, forgotPassword)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/reset-password").post(verifyJWT, resetPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)


// SSO route

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
  (req, res) => {
    res.send("redirecting to google...");
  }
);

router
  .route("/google/callback")
  .get(passport.authenticate("google"));


export default router;

