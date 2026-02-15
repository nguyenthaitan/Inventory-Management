/**
 * MongoDB Script: Inventory Management System
 * Chức năng: Khởi tạo Collections, Validation, Indexes và Seed Data.
 */

// 1. Kết nối Database
db = db.getSiblingDB("inventory_management_db");

// 2. Dọn dẹp Database cũ (Cẩn thận khi sử dụng)
const collections = [
  "users",
  "materials",
  "label_templates",
  "inventory_lots",
  "inventory_transactions",
  "production_batches",
  "batch_components",
  "qc_tests",
];
collections.forEach((col) => db[col].drop());

// --------------------------------------------------------------------------
// 3. TẠO COLLECTIONS VỚI SCHEMA VALIDATION
// --------------------------------------------------------------------------

// --- Users ---
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "username", "email", "password", "role"],
      properties: {
        user_id: { bsonType: "string" },
        username: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" },
        role: {
          enum: [
            "Admin",
            "InventoryManager",
            "QualityControl",
            "Production",
            "Viewer",
          ],
        },
      },
    },
  },
});

// --- Materials ---
db.createCollection("materials", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "material_id",
        "part_number",
        "material_name",
        "material_type",
      ],
      properties: {
        material_type: {
          enum: [
            "API",
            "Excipient",
            "Dietary Supplement",
            "Container",
            "Closure",
            "Process Chemical",
            "Testing Material",
          ],
        },
      },
    },
  },
});

// --- Inventory Lots ---
db.createCollection("inventory_lots", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["lot_id", "material_id", "status", "quantity"],
      properties: {
        status: { enum: ["Quarantine", "Accepted", "Rejected", "Depleted"] },
        quantity: { bsonType: "decimal" },
      },
    },
  },
});

// --- Inventory Transactions ---
db.createCollection("inventory_transactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["transaction_id", "lot_id", "transaction_type", "quantity"],
      properties: {
        transaction_type: {
          enum: [
            "Receipt",
            "Usage",
            "Split",
            "Transfer",
            "Adjustment",
            "Disposal",
          ],
        },
      },
    },
  },
});

// --- QC Tests ---
db.createCollection("qc_tests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["test_id", "lot_id", "result_status"],
      properties: {
        result_status: { enum: ["Pass", "Fail", "Pending"] },
      },
    },
  },
});

// --- Production Batches ---
db.createCollection("production_batches", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["batch_id", "product_id", "batch_number", "status"],
      properties: {
        status: { enum: ["Planned", "In Progress", "Complete", "Rejected"] },
      },
    },
  },
});

// --- Batch Components & Label Templates (Tạo cơ bản) ---
db.createCollection("batch_components");
db.createCollection("label_templates");

// --------------------------------------------------------------------------
// 4. TẠO INDEXES (TỐI ƯU HÓA TRUY VẤN)
// --------------------------------------------------------------------------

db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.materials.createIndex({ material_id: 1 }, { unique: true });
db.materials.createIndex({ part_number: 1 }, { unique: true });
db.materials.createIndex({ material_name: "text" }); // Tìm kiếm nhanh tên vật tư

db.inventory_lots.createIndex({ lot_id: 1 }, { unique: true });
db.inventory_lots.createIndex({ material_id: 1 });
db.inventory_lots.createIndex({ expiration_date: 1 }); // Cảnh báo hàng hết hạn

db.inventory_transactions.createIndex({ lot_id: 1, transaction_date: -1 });

db.production_batches.createIndex({ batch_number: 1 }, { unique: true });
db.production_batches.createIndex({ product_id: 1 });

db.qc_tests.createIndex({ lot_id: 1 });

// --------------------------------------------------------------------------
// 5. CHÈN DỮ LIỆU MẪU (INSERT MANY)
// --------------------------------------------------------------------------

// Chèn Vật tư
db.materials.insertMany([
  {
    material_id: "MAT-001",
    part_number: "PART-10001",
    material_name: "Vitamin D3 100K",
    material_type: "API",
    storage_conditions: "2-8°C, dry",
    specification_document: "SPEC-API-001",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "PROD-001",
    part_number: "PART-99999",
    material_name: "Finished Vitamin Supplement",
    material_type: "Dietary Supplement",
    storage_conditions: "Room temperature",
    created_date: new Date(),
    modified_date: new Date(),
  },
]);

// Chèn Lô hàng
db.inventory_lots.insertMany([
  {
    lot_id: "lot-uuid-001",
    material_id: "MAT-001",
    manufacturer_name: "Acme Pharma",
    manufacturer_lot: "MFR-2025-001",
    received_date: new Date("2025-01-10"),
    expiration_date: new Date("2026-01-10"),
    status: "Accepted",
    quantity: NumberDecimal("25.500"),
    unit_of_measure: "kg",
    storage_location: "WH-A-12",
    is_sample: false,
    created_date: new Date(),
    modified_date: new Date(),
  },
]);

// Chèn Giao dịch
db.inventory_transactions.insertMany([
  {
    transaction_id: "txn-uuid-001",
    lot_id: "lot-uuid-001",
    transaction_type: "Receipt",
    quantity: NumberDecimal("25.500"),
    unit_of_measure: "kg",
    performed_by: "jdoe",
    transaction_date: new Date(),
    created_date: new Date(),
  },
]);

// Chèn Mẫu nhãn
db.label_templates.insertOne({
  template_id: "TPL-RM-01",
  template_name: "Raw Material 2x1",
  label_type: "Raw Material",
  template_content: "LOT: {{lot_id}} | EXP: {{expiration_date}}",
  width: 2.0,
  height: 1.0,
  created_date: new Date(),
});

print(">>> IMS Database Setup Completed Successfully!");
