
import DownLoadTask from "#src/service/downloadTasks.js";
import convertToCSV from "#src/utils/csv.js";

import type { RequestHandler } from "express";

import {  UpdateTaskByIdType , CreateTaskType} from '#src/middleware/schemas/downloadTaskSchema.js'
import { DownloadTasksResponse, GetAllTasksRequest } from '#src/types/downloadTasksType.js'

import { toNumber } from "#src/utils/paramAndQueryHelpes.js";
import { CustomError } from "#src/utils/customErr.js";

const handleCreateTask: RequestHandler = async (req, res, next) => {
    try {
        const result: DownloadTasksResponse = await DownLoadTask.createTask(req.body as CreateTaskType);

        res.status(201).json({
            success: true,
            message: `Task '${result.task_name}' created successfully`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const handleUpdateTaskById: RequestHandler = async (req, res, next) => {
    try {
        const data: UpdateTaskByIdType = req.body;

        const id: number | null = toNumber(req.params.id);

        if (!id) throw new CustomError('Task id Undefined! ', 400)

        const result: DownloadTasksResponse | null = await DownLoadTask.updateTaskById(id, data);

        if(!result) {
          res.status(404).json( { success: false, message: `Task Id ${id} Not Updated Or Not Found!`} );
          return
        }
            

        res.status(200).json({
            success: true, 
            message: `Task Id ${id} Updated successfully`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

const handleGetAllTasks: RequestHandler = async (req, res, next) => {
  try {
    const isExport: boolean = req.query.export === 'true';

    const result = await DownLoadTask.getAllTasks(req.query as GetAllTasksRequest, isExport);

    if (isExport) {
      res.setHeader("Content-Disposition", 'attachment; filename="download-tasks-export.csv"');
      res.setHeader("Content-Type", "text/csv");
      
      const csvData: string = convertToCSV(result.data);
      res.status(200).send(csvData);
      return
    }

    res.status(200).json({
      success: true,
      message: `Found ${result.data.length} Task(s)`,
      ...result
    });
  } catch (err) {
    next(err);
  }
};


const handleGetTaskById: RequestHandler = async (req, res, next) => {
    try {
        const id: number | null = toNumber(req.params.id);

        if (!id) throw new CustomError('Task id Undefined! ', 400)

        const result: DownloadTasksResponse | null = await DownLoadTask.findByTaskId(id);

        if(!result){
          res.status(404).json( { success: false, message: `Not Found Task Id ${id}`} );
          return
        }
            

        res.status(200).json({
            success: true,
            message: `Found Task Id ${id} successfully`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

const handleDeleteTaskById: RequestHandler = async (req, res, next) => {
  try {
    const id: number | null = toNumber(req.params.id);

    if (!id) throw new CustomError('Task id Undefined! ', 400)

    const deletedCount: number | null = await DownLoadTask.deleteTaskById(id);

    if (deletedCount === 0 || !deletedCount) {
      res.status(404).json({
        success: false,
        message: `Not Found Task Id ${id}`,
        data: deletedCount
      });

      return
    }

    res.status(200).json({
      success: true,
      message: `Task Id ${id} Deleted successfully`,
      data: deletedCount
    })
  } catch (err) {
    next(err);
  }
};

const handleDeleteTasksByIds: RequestHandler = async (req, res, next) => {
  try {
    const ids: number[] = req.body; // [1,5,10]
    const deletedCount: number | null = await DownLoadTask.deleteTasksByIds(ids);

    if (deletedCount === 0 || !deletedCount) {
      res.status(404).json({
        success: false,
        message: `Not Found Tasks Ids ${ids}`,
        data: deletedCount
      });

      return
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} tasks`,
      data: deletedCount
    })
  } catch (err) { next(err) }
}

const handleDeleteAllTasksFailed: RequestHandler = async (_req, res, next) => {
  try {
    const deletedCount: number | null = await DownLoadTask.deleteAllTasksFailed();

    if (deletedCount === 0 || !deletedCount) {
      res.status(404).json({
        success: false,
        message: `Not Found Tasks Ids ${deletedCount}`,
        data: deletedCount
      });

      return
    }
    
    res.status(200).json({
      success: true,
      message: deletedCount === 0 
        ? 'No failed tasks found' 
        : `Deleted ${deletedCount} tasks successfully`,
      data: deletedCount
    })
  } catch (err) {
    next(err);
  }
}


export {
    handleGetAllTasks,
    handleGetTaskById,
    handleCreateTask,
    handleUpdateTaskById,
    handleDeleteTaskById,
    handleDeleteAllTasksFailed,
    handleDeleteTasksByIds
};
