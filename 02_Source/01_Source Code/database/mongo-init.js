db = db.getSiblingDB('inventory_management_db');

// Create Validated Collection for Materials
db.createCollection("materials", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["material_id", "part_number", "material_name", "material_type"],
            properties: {
                material_id: {
                    bsonType: "string",
                    description: "Unique identifier for the material"
                },
                part_number: {
                    bsonType: "string",
                    description: "Part number code"
                },
                material_name: {
                    bsonType: "string",
                    description: "Name of the material"
                },
                material_type: {
                    bsonType: "string",
                    description: "Type of material (e.g., Raw Material, Packaging, Finished Product)"
                },
                storage_conditions: {
                    bsonType: "string",
                    description: "Storage requirements"
                },
                specification_document: {
                    bsonType: "string",
                    description: "Link or reference to spec document"
                },
                created_date: {
                    bsonType: "date",
                    description: "Creation timestamp"
                },
                modified_date: {
                    bsonType: "date",
                    description: "Last modification timestamp"
                }
            }
        }
    }
});

// Create Indexes
db.materials.createIndex({ "material_id": 1 }, { unique: true });
db.materials.createIndex({ "part_number": 1 }, { unique: true });
db.materials.createIndex({ "material_type": 1 });

// Insert Sample Data
db.materials.insertMany([
    {
        "material_id": "MAT-001",
        "part_number": "RM-VITC-100",
        "material_name": "Vitamin C Powder",
        "material_type": "Raw Material",
        "storage_conditions": "Cool, dry place, < 25°C",
        "specification_document": "SPEC-RM-001.pdf",
        "created_date": new Date(),
        "modified_date": new Date()
    },
    {
        "material_id": "MAT-002",
        "part_number": "PM-BOTTLE-500",
        "material_name": "Plastic Bottle 500ml",
        "material_type": "Packaging Material",
        "storage_conditions": "Standard Warehouse",
        "specification_document": "SPEC-PM-002.pdf",
        "created_date": new Date(),
        "modified_date": new Date()
    },
    {
        "material_id": "PROD-001",
        "part_number": "FP-VITC-TAB",
        "material_name": "Vitamin C Tablets 500mg",
        "material_type": "Finished Product",
        "storage_conditions": "Cool place",
        "specification_document": "SPEC-FP-001.pdf",
        "created_date": new Date(),
        "modified_date": new Date()
    }
]);

print("Materials collection initialized with schema validation and sample data.");