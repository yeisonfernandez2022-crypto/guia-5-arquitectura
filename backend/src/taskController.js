function createTaskController(service) {
  return {
    list(req, res, next) {
      try { res.json(service.listTasks()); } catch (error) { next(error); }
    },
    create(req, res, next) {
      try { res.status(201).json(service.createTask(req.body || {})); } catch (error) { next(error); }
    },
    updateStatus(req, res, next) {
      try { res.json(service.changeStatus(req.params.id, req.body?.status)); } catch (error) { next(error); }
    }
  };
}

module.exports = { createTaskController };
