import express from "express";
const router = express.Router();

import { validateRequest } from "#src/middleware/validation.js";
import verifyRoles from "#src/middleware/verifyRoles.js";
import ROLES_LIST from "#src/config/roles_list.js";

import {
  createIdParamSchema,
  deleteManyIdsSchema,
} from "#src/middleware/schemas/IDS_schema.js";

import {
  createTaskSchema,
  UpdateTaskByIdSchema,
  getAllTasksSchema,
  findByTaskNameSchema,
} from "#src/middleware/schemas/downloadTaskSchema.ts";

import {
  handleGetAllTasks,
  handleGetTaskById,
  handleCreateTask,
  handleUpdateTaskById,
  handleDeleteTaskById,
  handleDeleteTasksByIds,
  handleDeleteAllTasksFailed,
} from "#src/controllers/items/downloadTasksController.js";

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

export default router;
