const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const InventoryItem = require('../models/InventoryItem');
const { InventoryPurchase, InventoryPurchasePayment } = require('../models/InventoryPurchase');
const LedgerTransaction = require('../models/LedgerTransaction');
const { protect, admin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const paginate = require('../utils/pagination');

// @desc    Get all inventory items
// @route   GET /api/inventory/items
// @access  Private
router.get('/items', protect, asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await paginate(InventoryItem, {}, { page, limit });
    res.json(result);
}));

// @desc    Create inventory item
// @route   POST /api/inventory/items
// @access  Private/Admin
router.post('/items', protect, admin, asyncHandler(async (req, res) => {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
}));

// @desc    Get all inventory purchases
// @route   GET /api/inventory/purchases
// @access  Private
router.get('/purchases', protect, asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const result = await paginate(InventoryPurchase, {}, {
        page,
        limit,
        populate: 'items.inventoryItem',
        sort: { date: -1 }
    });
    res.json(result);
}));

// @desc    Inventory Purchase
// @route   POST /api/inventory/purchases
// @access  Private/Admin
router.post('/purchases', protect, admin, asyncHandler(async (req, res) => {
    console.log(`[API] HIT POST /api/inventory/purchases`, req.body);
    const {
        supplier, supplierPhone, supplierAddress,
        date,
        productName, productModel, productBrand,
        quantity, price,
        paymentMethod // Added paymentMethod
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Find or Create Inventory Item
        let item = await InventoryItem.findOne({
            name: productName,
            model: productModel,
            brand: productBrand
        }).session(session);

        if (!item) {
            const sku = `PROD-${Date.now().toString().slice(-6)}`;
            item = (await InventoryItem.create([{
                sku,
                name: productName,
                model: productModel,
                brand: productBrand,
                unitCost: price,
                sellBasePrice: price * 1.1, // Default 10% markup
                stockCount: 0
            }], { session }))[0];
            console.log(`[DB] Created new InventoryItem ID: ${item._id}`);
        } else {
            console.log(`[DB] Found existing InventoryItem ID: ${item._id}`);
        }

        const totalAmount = quantity * price;
        const method = (paymentMethod || 'CASH').toUpperCase();

        // 2. Create Purchase Record
        const purchase = await InventoryPurchase.create([{
            supplier,
            supplierPhone,
            supplierAddress,
            date: date || Date.now(),
            totalAmount,
            paidAmount: totalAmount,
            dueAmount: 0,
            paymentType: 'PAID',
            items: [{
                inventoryItem: item._id,
                qty: quantity,
                unitPrice: price
            }]
        }], { session });
        console.log(`[DB] Created InventoryPurchase ID: ${purchase[0]._id}`);

        // 3. Create Payment Record
        await InventoryPurchasePayment.create([{
            purchase: purchase[0]._id,
            date: date || Date.now(),
            amount: totalAmount,
            method: method
        }], { session });

        // 4. Update stock
        item.stockCount += quantity;
        item.unitCost = price;
        await item.save({ session });
        console.log(`[DB] Updated Stock for Item ID: ${item._id}, New Count: ${item.stockCount}`);

        // 5. Ledger Entry
        await LedgerTransaction.create([{
            type: 'INVENTORY_PURCHASE',
            amount: -totalAmount,
            account: method,
            inventoryPurchase: purchase[0]._id,
            createdBy: req.user._id,
            note: `Purchase: ${productName} (${quantity} units) from ${supplier} via ${method}`
        }], { session });

        await session.commitTransaction();
        res.status(201).json(purchase[0]);
    } catch (error) {
        await session.abortTransaction();
        console.error(`[DB] Error in inventory purchase:`, error);
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
}));

// @desc    Get stock report
// @route   GET /api/inventory/reports/stock
// @access  Private
router.get('/reports/stock', protect, asyncHandler(async (req, res) => {
    const stock = await InventoryItem.find({});
    res.json(stock);
}));

module.exports = router;
