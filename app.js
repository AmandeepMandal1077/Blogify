require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Blog = require("./models/blog.model.js");
const cors = require("cors");
//routes
//#region routes
const userRoute = require("./routes/user.route.js");
const blogRoute = require("./routes/blog.route.js");
//#endregion

//middlewares
//#region middlewares
const {
    checkForAuthenticationCookie,
} = require("./middlewares/authentication.middleware.js");
//#endregion

const PORT = process.env.PORT || 8000;

mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB connected"));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home.ejs", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});
