const mongoose = require('mongoose');

const inventoryItemSchema = mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    model: String,
    brand: String,
    category: String,
    unitCost: { type: Number, default: 0 },
    sellBasePrice: { type: Number, default: 0 },
    stockCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
module.exports = InventoryItem;
