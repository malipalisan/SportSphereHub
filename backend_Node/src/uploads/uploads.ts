import multer from "multer";
import path from "path";

// Zajednicki upload za slike korisnika i druge opste fajlove.
// Multer prvo snimi fajl na disk, a servis kasnije u bazu upise putanju /uploads/<ime_fajla>.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Folder je relativan u odnosu na backend proces, zato server.ts izlaze isti folder kao staticki /uploads.
        cb(null, "uploads")
    },

    filename: (req, file, cb) => {
        // Date.now() smanjuje sansu da dva uploadovana fajla dobiju isto ime, a cuva originalnu ekstenziju.
        const uniqueName = Date.now() + path.extname(file.originalname)
        cb(null, uniqueName)
    }
});

// Router koristi ovaj middleware kao upload.single("avatar").
const upload = multer({
    storage: storage
});

export default upload;
