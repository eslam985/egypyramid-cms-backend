const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const { createIdParamSchema } = require("../../../middleware/schemas/IDS_schema.js");
const {
    createTaskSchema,
    UpdateTaskByIdSchema,
    getAllTasksSchema,
    findByTaskNameSchema
} = require("../../../middleware/schemas/downloadTaskSchema.js");

const {
    handleGetAllTasks,
    handleGetTaskById,
    handleFindByTaskByName,
    handleCreateTask,
    handleUpdateTaskById,
    handleDeleteTaskById,
} = require("../../../controllers/items/downloadTasksController.js");


router.get("/", validateRequest(getAllTasksSchema), handleGetAllTasks);
router.get("/by-name", validateRequest(findByTaskNameSchema), handleFindByTaskByName);
router.post("/", validateRequest(createTaskSchema), handleCreateTask);

router.patch("/:id", validateRequest(UpdateTaskByIdSchema), handleUpdateTaskById);
router.get("/:id", validateRequest(createIdParamSchema()), handleGetTaskById);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteTaskById);

module.exports = router;