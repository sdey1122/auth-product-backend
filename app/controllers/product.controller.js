const Product = require("../models/product.model");
const fs = require("fs");
const path = require("path");

class ProductController {
  constructor() {
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.update = this.update.bind(this);
    this.softDelete = this.softDelete.bind(this);
    this.restore = this.restore.bind(this);
    this.forceDelete = this.forceDelete.bind(this);
  }

  // COMMON FUNCTION → DELETE FILE
  deleteFile(filePath) {
    if (!filePath) return;

    const fileName = filePath.split("/uploads/")[1];
    if (!fileName) return;

    const fullPath = path.join(__dirname, "../../uploads", fileName);

    fs.unlink(fullPath, (err) => {
      if (err) {
        console.log("File delete error:", err.message);
      } else {
        console.log("Image deleted:", fullPath);
      }
    });
  }

  // CREATE PRODUCT
  async create(req, res) {
    try {
      const { name, price } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name required" });
      }

      if (isNaN(price)) {
        return res.status(400).json({ message: "Price must be number" });
      }

      const data = {
        ...req.body,
        createdBy: req.user.id,
      };

      if (req.file) {
        data.image = `/uploads/${req.file.filename}`;
      }

      const product = await Product.create(data);

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET ALL PRODUCTS
  async getAll(req, res) {
    try {
      const products = await Product.find({ isDeleted: false });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET SINGLE PRODUCT
  async getOne(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product || product.isDeleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // UPDATE PRODUCT (DELETE OLD IMAGE)
  async update(req, res) {
    try {
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      let updatedData = { ...req.body };

      if (req.file) {
        // DELETE OLD IMAGE
        this.deleteFile(existingProduct.image);

        updatedData.image = `/uploads/${req.file.filename}`;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true },
      );

      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // SOFT DELETE
  async softDelete(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.isDeleted = true;
      await product.save();

      res.json({ message: "Product moved to trash" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // RESTORE PRODUCT
  async restore(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.isDeleted = false;
      await product.save();

      res.json({ message: "Product restored" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // HARD DELETE (WITH IMAGE DELETE)
  async forceDelete(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // DELETE IMAGE FROM FOLDER
      this.deleteFile(product.image);

      // DELETE FROM DB
      await Product.findByIdAndDelete(req.params.id);

      res.json({ message: "Product permanently deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
