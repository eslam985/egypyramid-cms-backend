const express = require("express");
const router = express.Router();

const { validateRequest } = require("../../../middleware/validation.js");
const {
  createIdParamSchema,
  deleteManyIdsSchema,
} = require("../../../middleware/schemas/IDS_schema.js");
const ROLES_LIST = require("../../../config/roles_list.js");
const verifyRoles = require("../../../middleware/verifyRoles.js");
const {
  createTaskSchema,
  UpdateTaskByIdSchema,
  getAllTasksSchema,
  findByTaskNameSchema,
} = require("../../../middleware/schemas/downloadTaskSchema.js");

const {
  handleGetAllTasks,
  handleGetTaskById,
  handleCreateTask,
  handleUpdateTaskById,
  handleDeleteTaskById,
  handleDeleteTasksByIds,
  handleDeleteAllTasksFailed,
} = require("../../../controllers/items/downloadTasksController.js");

router.get("/", validateRequest(getAllTasksSchema), handleGetAllTasks);
router.post(
  "/",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(createTaskSchema),
  handleCreateTask,
);
router.delete(
  "/failed",
  verifyRoles(ROLES_LIST.Admin),
  handleDeleteAllTasksFailed,
);

router.patch(
  "/:id",
  verifyRoles(ROLES_LIST.Editor),
  validateRequest(UpdateTaskByIdSchema),
  handleUpdateTaskById,
);
router.get("/:id", validateRequest(createIdParamSchema()), handleGetTaskById);
router.delete(
  "/:id",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(createIdParamSchema()),
  handleDeleteTaskById,
);
router.delete(
  "/",
  verifyRoles(ROLES_LIST.Admin),
  validateRequest(deleteManyIdsSchema),
  handleDeleteTasksByIds,
);

module.exports = router;
