import express from 'express';
import { addToCart, updateCart, getUserCart, deleteCartItem } from '../controllers/cartController.js';
import { protect } from '../middleware/authmiddleware.js';

const cartRoutes = express.Router();

cartRoutes.use(protect);

cartRoutes.get('/:userId', getUserCart);
cartRoutes.post('/add/:pid', addToCart);
cartRoutes.put('/:cartId', updateCart);
cartRoutes.delete('/:cartId', deleteCartItem);
export default cartRoutes;

