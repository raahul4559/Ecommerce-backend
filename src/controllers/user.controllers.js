import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken };

    } catch (error) {
        console.log("JWT ERROR DETAILS:", error);
        throw new ApiError(
            500, "Something went wrong while generating the token"
        );
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get data form the frontend req.body
    // validate the field is empty ??
    // check the user exit or not using username or email
    // if not create the user 
    // check the user created successfully or not
    // return res

    const { username, fullname, email, password } = req.body

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,

    })

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });


    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "Users registered successfully and verification email has been sent on your email."
            )
        );

})

const loginUser = asyncHandler(async (req, res) => {
    // request the data from database
    // find the data using email or username
    // check whether user is exit or not 
    // check for password
    // send cookie 
    // refresh token

    const { email, username, password } = req.body

    if (!email && !username) {
        throw new ApiError(400, "Email and Username is required:")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist:")
    }

    const isPasswordInvalid = await user.isPasswordCorrect(password)

    if (!isPasswordInvalid) {
        throw new ApiError(401, "Invalid credential")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, {
                user: loggedInUser, accessToken, refreshToken
            }, "User login in successfully:")
        )


})

const logoutUser = asyncHandler(async (req, res) => {
    // find the user from database using id from req.user
    // set the refreshToken to empty string and save in database
    // clear the cookie and send response


    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: '',
            },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const verifyEmail = asyncHandler(async (req, res) => {
    // data from the frontend using req.params
    // check verificationToken is there or not 
    // generate the hashedtoken 
    // find the user with the token save in the db
    // if user isnot available token is expiry or invalid
    // token to undefined and save in db
    // response
    const { verificationToken } = req.params

    if (!verificationToken) {
        throw new ApiError("verification Token is missing")
    }

    let hashedToken = crypto
        .create("sha256")
        .update(verificationToken)
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },

    })

    if (!user) {
        throw new ApiError("Token is invalid or expired")
    }

    user.emailVerificationToken = undefined,
        user.emailVerificationExpiry = undefined,
        user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(
            201, { isEmailVerified: true }, "Email is Verified"
        ))

})

const resendEmailVerification = asyncHandler(async (req, res) => {
    // find the user using req.user?._id
    // check for user exist or not
    // check for the emailverified field
    // generate the token and save in the db
    // send email and response 

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User doesnot exist")
    }

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken,
    user.emailVerificationExpiry = tokenExpiry,
    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user?.email,
        subject: "Please verify email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        ),

    })


    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Mail has been sent successfully"))

})

const refreshAcessToken = asyncHandler(async (req, res) => {
    // get the refresh token from cookie or frontend(body)
    // check the token is there or not 
    // verify the token is valid or not
    // find the user with the token using id
    // if there is no user token is invalid
    // if incoming token and token in db is not same then token is already used or expired
    // generate new access token and refresh token
    // save the refresh token in db
    // send response with cookie

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Already used or expired refreshToken")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        user.refreshToken = newRefreshToken;
        await user.save();

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(201, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"))

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

const forgotPassword = asyncHandler(async (req, res) => {
    // get the email from the frontend
    // find the user with the email
    // if there is no user send response that email is not registered
    // if there is user then generate the temporary token and save in db
    // send the email with reset password link containing token
    // response

    const { email } = req.body

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(500, "User doesnot exits with this email or username", [])
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user?.email,
        subject: "Please reset request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`

        )
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password reset mail has been send")
        )
})

const resetPassword = asyncHandler(async (req, res) => {
    // get the token from req.params and new password from req.body
    // hash the token and find the user with hashed token and token expiry date greater than current date
    // if there is no user then token is invalid or expired
    // if there is user then update the password and set the token field to undefined and save in db
    // send response

    const { resetToken } = req.params
    const { newPassword } = req.body


    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(500, "Token is expiry or invalid")
    }

    user.forgotPasswordToken = undefined,
        user.forgotPasswordExpiry = undefined

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password Reset Successfully")
        )

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // get the old password and new passowrd from the req.body
    // find the user using req.user?._id
    // check the passowrd is correct or not 
    // change the password and save the password in db 
    // response

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isValidPassword = await user.isPasswordCorrect(oldPassword)

    if (!isValidPassword) {
        throw new ApiError(500, "Password is not correct")
    }

    user.oldPassword = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Change Successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetch successfully"))
})


const updateAccountDetails = asyncHandler(async (req, res) => {
    //get the username and name from the req.body
    // all field is required
    // change the name using the set function findbyidandupdate
    // response

    const { username, email, fullname } = req.body

    if (
        [fullname, email, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { email, username, fullname }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "user detailed update successfully"))

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changeCurrentPassword,
    getCurrentUser,
    resendEmailVerification,
    updateAccountDetails


}