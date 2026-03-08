/**
 * MongoDB Script: Inventory Management System
 * Chức năng: Khởi tạo Collections, Validation, Indexes và Seed Data.
 */

// 1. Kết nối Database
db = db.getSiblingDB("inventory_management_db");
// Drop database nếu đã tồn tại để đảm bảo khởi tạo mới
db.dropDatabase();
print(">>> Database 'inventory_management_db' created and selected.");

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
      required: [
        "lot_id",
        "material_id",
        "manufacturer_name",
        "manufacturer_lot",
        "received_date",
        "expiration_date",
        "status",
        "quantity",
        "unit_of_measure",
      ],
      properties: {
        lot_id: { bsonType: "string" },
        material_id: { bsonType: "string" },
        manufacturer_name: { bsonType: "string" },
        manufacturer_lot: { bsonType: "string" },
        supplier_name: { bsonType: "string" },
        received_date: { bsonType: "date" },
        expiration_date: { bsonType: "date" },
        in_use_expiration_date: { bsonType: "date" },
        status: { enum: ["Quarantine", "Accepted", "Rejected", "Depleted"] },
        quantity: { bsonType: "int" },
        unit_of_measure: { bsonType: "string" },
        storage_location: { bsonType: "string" },
        is_sample: { bsonType: "bool" },
        parent_lot_id: { bsonType: "string" },
        notes: { bsonType: "string" },
        created_date: { bsonType: "date" },
        modified_date: { bsonType: "date" },
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
    material_name: "Vitamin D3 100K IU",
    material_type: "API",
    storage_conditions: "2-8°C, dry place, protect from light",
    specification_document: "SPEC-API-001",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "MAT-002",
    part_number: "PART-10002",
    material_name: "Vitamin C 500mg Powder",
    material_type: "API",
    storage_conditions: "2-8°C, sealed container",
    specification_document: "SPEC-API-002",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "MAT-003",
    part_number: "PART-10003",
    material_name: "Calcium Carbonate 500mg",
    material_type: "Excipient",
    storage_conditions: "Room temperature, dry",
    specification_document: "SPEC-EXC-001",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "MAT-004",
    part_number: "PART-10004",
    material_name: "Zinc Gluconate 10mg",
    material_type: "API",
    storage_conditions: "Room temperature, sealed",
    specification_document: "SPEC-API-003",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "MAT-005",
    part_number: "PART-10005",
    material_name: "Magnesium Oxide",
    material_type: "Excipient",
    storage_conditions: "15-30°C, moisture-free",
    specification_document: "SPEC-EXC-002",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "MAT-006",
    part_number: "PART-20001",
    material_name: "PET Plastic Bottle 100ml",
    material_type: "Container",
    storage_conditions: "Room temperature",
    specification_document: "SPEC-Ppill-001",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "MAT-007",
    part_number: "PART-20002",
    material_name: "HDPE Bottle Plastic Cap",
    material_type: "Closure",
    storage_conditions: "Room temperature",
    specification_document: "SPEC-Ppill-002",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    material_id: "PROD-001",
    part_number: "PART-99999",
    material_name: "Multivitamin Supplement Caplet",
    material_type: "Dietary Supplement",
    storage_conditions: "15-30°C, dry place",
    created_date: new Date(),
    modified_date: new Date(),
  },
]);

// Chèn Lô hàng
db.inventory_lots.insertMany([
  {
    lot_id: "lot-001-d3-2025",
    material_id: "MAT-001",
    manufacturer_name: "Acme Pharma Ltd.",
    manufacturer_lot: "MFR-2025-D3-001",
    supplier_name: "Global Pharma Supply",
    received_date: new Date("2025-01-10"),
    expiration_date: new Date("2027-01-10"),
    in_use_expiration_date: new Date("2026-07-10"),
    status: "Accepted",
    quantity: 25,
    unit_of_measure: "pill",
    storage_location: "WH-A-Cold-01",
    is_sample: false,
    notes: "Standard batch, quality approved",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-002-d3-sample",
    material_id: "MAT-001",
    manufacturer_name: "Acme Pharma Ltd.",
    manufacturer_lot: "MFR-2025-D3-001",
    supplier_name: "Global Pharma Supply",
    received_date: new Date("2025-01-10"),
    expiration_date: new Date("2027-01-10"),
    status: "Quarantine",
    quantity: 1,
    unit_of_measure: "pill",
    storage_location: "QC-Lab-B02",
    is_sample: true,
    parent_lot_id: "lot-001-d3-2025",
    notes: "QC sample for testing",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-003-vc-2025",
    material_id: "MAT-002",
    manufacturer_name: "Bright Chemicals Co.",
    manufacturer_lot: "BC-2024-VC-156",
    supplier_name: "Vitamin World Distributors",
    received_date: new Date("2025-02-05"),
    expiration_date: new Date("2026-02-05"),
    in_use_expiration_date: new Date("2025-08-05"),
    status: "Accepted",
    quantity: 12,
    unit_of_measure: "pill",
    storage_location: "WH-B-Shelf-15",
    is_sample: false,
    notes: "Powder form, properly sealed",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-004-ca-2025",
    material_id: "MAT-003",
    manufacturer_name: "ChemTech Industries",
    manufacturer_lot: "CT-2025-CA-089",
    supplier_name: "Industrial Chemical Supply",
    received_date: new Date("2025-01-20"),
    expiration_date: new Date("2028-01-20"),
    status: "Accepted",
    quantity: 50,
    unit_of_measure: "pill",
    storage_location: "WH-C-Dry-Storage",
    is_sample: false,
    notes: "Bulk excipient shipment",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-005-zn-2025",
    material_id: "MAT-004",
    manufacturer_name: "Nutrient Plus Corp.",
    manufacturer_lot: "NP-2025-ZN-042",
    supplier_name: "Premium Nutrient Supply",
    received_date: new Date("2025-02-15"),
    expiration_date: new Date("2026-02-15"),
    in_use_expiration_date: new Date("2025-12-15"),
    status: "Accepted",
    quantity: 9,
    unit_of_measure: "pill",
    storage_location: "WH-A-Shelf-08",
    is_sample: false,
    notes: "API for supplement formulation",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-006-mg-2025",
    material_id: "MAT-005",
    manufacturer_name: "ChemTech Industries",
    manufacturer_lot: "CT-2025-MG-103",
    supplier_name: "Industrial Chemical Supply",
    received_date: new Date("2025-01-15"),
    expiration_date: new Date("2028-01-15"),
    status: "Rejected",
    quantity: 0,
    unit_of_measure: "pill",
    storage_location: "QC-Rejected-Bay",
    is_sample: false,
    notes: "Failed moisture test, returned to supplier",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-007-pet-2025",
    material_id: "MAT-006",
    manufacturer_name: "PackCo Manufacturing",
    manufacturer_lot: "PCM-2025-PET-256",
    supplier_name: "Packaging Solutions Inc.",
    received_date: new Date("2025-02-01"),
    expiration_date: new Date("2027-02-01"),
    status: "Accepted",
    quantity: 5000,
    unit_of_measure: "pill",
    storage_location: "WH-D-Packaging",
    is_sample: false,
    notes: "Container bottles for finished products",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-008-cap-2025",
    material_id: "MAT-007",
    manufacturer_name: "CapTech Solutions",
    manufacturer_lot: "CTS-2025-HDPE-418",
    supplier_name: "Packaging Solutions Inc.",
    received_date: new Date("2025-02-03"),
    expiration_date: new Date("2027-02-03"),
    status: "Accepted",
    quantity: 10000,
    unit_of_measure: "pill",
    storage_location: "WH-D-Packaging",
    is_sample: false,
    notes: "Plastic caps for bottles, quality verified",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-009-prod-2025",
    material_id: "PROD-001",
    manufacturer_name: "Quality Pharma Ltd.",
    manufacturer_lot: "QP-2025-MULTI-201",
    supplier_name: "Direct Manufacturing",
    received_date: new Date("2025-02-20"),
    expiration_date: new Date("2026-02-20"),
    in_use_expiration_date: new Date("2025-11-20"),
    status: "Accepted",
    quantity: 2500,
    unit_of_measure: "pill",
    storage_location: "WH-E-Finished-Goods",
    is_sample: false,
    notes: "Finished multivitamin caplets, ready for distribution",
    created_date: new Date(),
    modified_date: new Date(),
  },
  {
    lot_id: "lot-010-vc-used",
    material_id: "MAT-002",
    manufacturer_name: "Bright Chemicals Co.",
    manufacturer_lot: "BC-2024-VC-135",
    supplier_name: "Vitamin World Distributors",
    received_date: new Date("2024-11-10"),
    expiration_date: new Date("2025-11-10"),
    in_use_expiration_date: new Date("2025-05-10"),
    status: "Depleted",
    quantity: 0,
    unit_of_measure: "pill",
    storage_location: "WH-Archive",
    is_sample: false,
    notes: "Fully consumed in production, archive status",
    created_date: new Date("2024-11-10"),
    modified_date: new Date(),
  },
]);

// Chèn Giao dịch
db.inventory_transactions.insertMany([
  {
    transaction_id: "txn-001-receipt",
    lot_id: "lot-001-d3-2025",
    transaction_type: "Receipt",
    quantity: NumberDecimal("25.500"),
    unit_of_measure: "pill",
    performed_by: "inventory_staff_001",
    transaction_date: new Date("2025-01-10"),
    created_date: new Date(),
  },
  {
    transaction_id: "txn-002-usage",
    lot_id: "lot-001-d3-2025",
    transaction_type: "Usage",
    quantity: NumberDecimal("5.250"),
    unit_of_measure: "pill",
    performed_by: "production_team_02",
    transaction_date: new Date("2025-02-10"),
    created_date: new Date(),
  },
  {
    transaction_id: "txn-003-receipt",
    lot_id: "lot-003-vc-2025",
    transaction_type: "Receipt",
    quantity: NumberDecimal("12.250"),
    unit_of_measure: "pill",
    performed_by: "inventory_staff_001",
    transaction_date: new Date("2025-02-05"),
    created_date: new Date(),
  },
  {
    transaction_id: "txn-004-receipt",
    lot_id: "lot-004-ca-2025",
    transaction_type: "Receipt",
    quantity: NumberDecimal("50.000"),
    unit_of_measure: "pill",
    performed_by: "inventory_staff_002",
    transaction_date: new Date("2025-01-20"),
    created_date: new Date(),
  },
  {
    transaction_id: "txn-005-usage",
    lot_id: "lot-004-ca-2025",
    transaction_type: "Usage",
    quantity: NumberDecimal("15.600"),
    unit_of_measure: "pill",
    performed_by: "production_team_01",
    transaction_date: new Date("2025-02-18"),
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
