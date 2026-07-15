const Category = require('../models/Category');
const generateSlug = require('../utils/generateSlug');

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).lean();
    
    // Aggregate number of services for each category
    const Service = require('../models/Service');
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Service.countDocuments({ category: cat._id, isActive: true });
        return { ...cat, numOfServices: count };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    let slug = generateSlug(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name, slug, image });

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PATCH /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      if (req.body.name && req.body.name !== category.name) {
        let slug = generateSlug(req.body.name);
        const existing = await Category.findOne({ slug, _id: { $ne: category._id } });
        if (existing) {
          res.status(400);
          throw new Error('Category name already exists');
        }
        category.slug = slug;
      }

      Object.assign(category, req.body);
      const updatedCategory = await category.save();

      res.json({
        success: true,
        message: 'Category updated',
        data: updatedCategory,
      });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({
        success: true,
        message: 'Category deleted',
      });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
