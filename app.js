require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const DBCon = require("./app/config/db");

const app = express();

// security + middleware
app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connection
DBCon();

// static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
const routes = require("./app/routes/index");
app.use("/api", routes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "API Running" });
});

// server
const PORT = process.env.PORT || 3050;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
