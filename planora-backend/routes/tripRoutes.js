import express from 'express';
import {
  generateTrip,
  getAllTrips,
  getTripById,
  deleteTrip,
  toggleFavourite,
  swapPlace,
  removePlace,
  addCustomPlace,
  reorderSlots,
  addNote,
  resetToOriginal,
  getSuggestions,
  exportPDF,
  shareTrip
} from '../controllers/tripController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public share route (no auth middleware)
router.get('/:id/share', shareTrip);

// Protect all remaining routes in this router with authMiddleware
router.use(authMiddleware);

router.post('/generate', generateTrip);
router.get('/all', getAllTrips);
router.get('/:id', getTripById);
router.delete('/:id', deleteTrip);
router.patch('/:id/favourite', toggleFavourite);

// Protected edit, suggestion, and export routes
router.patch('/:id/edit/swap', swapPlace);
router.patch('/:id/edit/remove', removePlace);
router.patch('/:id/edit/custom', addCustomPlace);
router.patch('/:id/edit/reorder', reorderSlots);
router.patch('/:id/edit/note', addNote);
router.patch('/:id/edit/reset', resetToOriginal);
router.get('/:id/suggestions', getSuggestions);
router.get('/:id/export', exportPDF);

export default router;
