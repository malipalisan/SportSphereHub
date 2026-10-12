import multer from "multer";
import path from "path";

// Poseban upload za slike opreme, da katalog ne mesa slike proizvoda sa avatarima korisnika.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Slike opreme idu u podfolder koji se kasnije cuva kao /uploads/equipment/<ime_fajla>.
        cb(null, "uploads/equipment")
    },

    filename: (req, file, cb) => {
        // Ime fajla se generise na osnovu trenutnog vremena i originalne ekstenzije.
        const uniqueName = Date.now() + path.extname(file.originalname)
        cb(null, uniqueName)
    }
});

// Router koristi ovaj middleware kao upload.single("image").
const upload = multer({
    storage: storage
});

export default upload;
