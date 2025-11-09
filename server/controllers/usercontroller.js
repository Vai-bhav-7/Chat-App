import { generatetoken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

//signup new user
export const signup = async (req,res) => {
    const {fullName, email, password, bio} = req.body;
    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details" })
        }
        const user = await User.findOne({email});

        if(user) {
            return res.json({success: false, message: "Account already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);

        const newuser = await User.create({
            fullName, email, password: hashedpassword, bio
        });

        const token = generatetoken(newuser._id)

        res.json({success: true, userData: newuser, token, message: "Account created successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


//login a user
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email})

        const ispasswordcorrect = await bcrypt.compare(password, userData.password);

        if(!ispasswordcorrect){
            return res.json({success: false, message:"Invalid credentials"});
        }

        const token = generatetoken(userData._id)

        res.json({success: true, userData, token, message: "Login successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

//to check if user is authenticated 
export const checkAuth = (req,res)=>{
    res.json({success: true, user: req.user});
}

//to update user profile details
export const updateProfile = async (req,res)=>{
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId  = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilepic: upload.secure_url, bio, fullName},{new: true});
        }
        res.json({success: true,  user: updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success: true,  message: error.message})
    }
}