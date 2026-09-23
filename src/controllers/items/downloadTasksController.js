
const DownLoadTask = require("../../service/downloadTasks");

// createTask(data)
const handleCreateTask = async (req, res, next) => {
    try {
        const result = await DownLoadTask.createTask(req.body);

        return res.status(201).json({
            success: true,
            message: `Task '${result.task_name}' created successfully`,
            data: result
        });
    } catch (err) {
        next(err);
    }
};

// UpdateTaskById(id, data)
const handleUpdateTaskById = async (req, res, next) => {
    try {
        const data = req.body;
        const id = req.params.id;

        const result = await DownLoadTask.updateTaskById(id, data);
        if(!result)
            return res.status(404).json( { success: false, message: `Task Id ${id} Not Updated Or Not Found!`} );

        return res.status(200).json({
            success: true, 
            message: `Task Id ${id} Updated successfully`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

// getAllTasks({order, page = 1, limit = 20, search})
const handleGetAllTasks = async (req, res, next) => {
    try {
        const result = await DownLoadTask.getAllTasks(req.query);

        return res.status(200).json({
            success: true,
            message: `Found ${result.data.length} task(s) (Total: ${result.pagination.total})`,
            ...result
        });
    } catch (err) {
        next(err);
    }
};

//  findByTaskId(id)
const handleGetTaskById = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await DownLoadTask.findByTaskId(id);

        if(!result)
            return res.status(404).json( { success: false, message: `Not Found Task Id ${id}`} );

        return res.status(200).json({
            success: true,
            message: `Found Task Id ${id} successfully`,
            data: result
        })
    } catch (err) {
        next(err);
    }
};

//  deleteTaskById(id)
const handleDeleteTaskById = async (req, res, next) => {
  try {
    const id = req.params.id
    const deletedCount = await DownLoadTask.deleteTaskById(id);

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Not Found Task Id ${id}`,
        data: { deletedCount: 0 }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Task Id ${id} Deleted successfully`,
      data: { deletedCount }
    })
  } catch (err) {
    next(err);
  }
};

const handleDeleteTasksByIds = async (req, res, next) => {
  try {
    const { ids } = req.body; // [1,5,10]
    const deletedCount = await DownLoadTask.deleteTasksByIds(ids);
    return res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} tasks`,
      data: { deletedCount }
    })
  } catch (err) { next(err) }
}

const handleDeleteAllTasksFailed = async (req, res, next) => {
  try {
    const data = await DownLoadTask.deleteAllTasksFailed();

    return res.status(200).json({
      success: true,
      message: data === 0 
        ? 'No failed tasks found' 
        : `Deleted ${data} tasks successfully`,
      data
    })
  } catch (err) {
    next(err);
  }
}

module.exports = {
    handleGetAllTasks,
    handleGetTaskById,
    handleCreateTask,
    handleUpdateTaskById,
    handleDeleteTaskById,
    handleDeleteAllTasksFailed,
    handleDeleteTasksByIds
};
