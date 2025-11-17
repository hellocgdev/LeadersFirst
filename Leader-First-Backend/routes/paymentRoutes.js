import express from "express";
import {
  createOrder,
  getOrderStatus,
  markOrderPaid,
  activateSubscription,
} from "../controller/paymentController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create-order", auth, createOrder);
router.get("/order-status/:orderId", auth, getOrderStatus);
router.post("/activate-subscription", auth, activateSubscription);

// Admin/Internal route (requires internal key)
router.post("/mark-paid", markOrderPaid);

export default router;
