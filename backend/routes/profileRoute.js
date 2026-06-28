import express from "express";
import multer from "multer";
import { getAddress, upsertAddress, uploadProfilePhoto } from "../controllers/profile.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// fetch address by userid
router.get("/address/:userid", protect, getAddress);

// create or update address (expects body.userid)
router.put("/address", protect, upsertAddress);

// configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = file.originalname.split('.').pop();
		cb(null, `profile-${uniqueSuffix}.${ext}`);
	},
});

const upload = multer({ storage });

// upload profile photo (protected)
router.post("/upload", protect, upload.single("profile_photo"), uploadProfilePhoto);

export default router;
