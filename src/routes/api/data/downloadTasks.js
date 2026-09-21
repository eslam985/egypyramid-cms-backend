const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const { createIdParamSchema, deleteManyIdsSchema } = require("../../../middleware/schemas/IDS_schema.js");
const {
    createTaskSchema,
    UpdateTaskByIdSchema,
    getAllTasksSchema,
    findByTaskNameSchema,
} = require("../../../middleware/schemas/downloadTaskSchema.js");

const {
    handleGetAllTasks,
    handleGetTaskById,
    handleFindByTaskByName,
    handleCreateTask,
    handleUpdateTaskById,
    handleDeleteTaskById,
    handleDeleteTasksByIds,
    handleDeleteAllTasksFailed,
} = require("../../../controllers/items/downloadTasksController.js");


router.get("/", validateRequest(getAllTasksSchema), handleGetAllTasks);
router.get("/by-name", validateRequest(findByTaskNameSchema), handleFindByTaskByName);
router.post("/", validateRequest(createTaskSchema), handleCreateTask);
router.delete("/failed", handleDeleteAllTasksFailed)

router.patch("/:id", validateRequest(UpdateTaskByIdSchema), handleUpdateTaskById);
router.get("/:id", validateRequest(createIdParamSchema()), handleGetTaskById);
router.delete("/:id", validateRequest(createIdParamSchema()), handleDeleteTaskById);
router.delete("/", validateRequest(deleteManyIdsSchema), handleDeleteTasksByIds); // دي الجديدة

module.exports = router;