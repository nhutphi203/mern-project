import express from "express";

const router = express.Router();

// Mock workflow service for testing
const mockWorkflowService = {
  getStatus: () => ({ status: 'active', workflows: 5 }),
  getStatistics: () => ({ total: 10, active: 5, completed: 5 }),
  getHealth: () => ({ healthy: true, uptime: '1h' })
};

// Workflow routes
router.get('/status', (req, res) => {
  res.json(mockWorkflowService.getStatus());
});

router.get('/statistics', (req, res) => {
  res.json(mockWorkflowService.getStatistics());
});

router.get('/health', (req, res) => {
  res.json(mockWorkflowService.getHealth());
});

export default router;
