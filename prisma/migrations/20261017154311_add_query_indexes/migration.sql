-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "Product_isActive_category_createdAt_idx" ON "Product"("isActive", "category", "createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_isFeatured_idx" ON "Product"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "Stock_productId_size_colorName_idx" ON "Stock"("productId", "size", "colorName");

-- CreateIndex
CREATE INDEX "Stock_quantity_idx" ON "Stock"("quantity");
