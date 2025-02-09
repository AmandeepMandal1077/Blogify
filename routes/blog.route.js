const express = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog.model");
const Comment = require("../models/comment.model");
const router = express.Router();

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig.js");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "blog_images",
        format: async (req, file) => file.mimetype.split("/")[1],
        public_id: (req, file) =>
            Date.now().toString() + "-" + file.originalname,
    },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, body } = req.body;
    // if (!req.file) {
    //     const coverImageURL = req.file.path;
    // }

    const newBlog = await Blog.create({
        title,
        body,
        coverImageURL: req.file?.path,
        createdBy: req.user._id,
    });

    await newBlog.save();
    // return res.redirect(`/blog/${newBlog._id}`);
    return res.redirect("/");
});

router.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id)?.populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
        "createdBy"
    );

    // console.log(`comments: ${comments}`);
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    });
});

router.post("/comment/:blogId", async (req, res) => {
    if (req.body.content === "") {
        return res.redirect(`/blog/${req.params.blogId}`);
    }
    const comment = await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });

    return res.redirect(`/blog/${req.params.blogId}`);
});
module.exports = router;
