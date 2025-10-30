import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import {
  list,
  get,
  create,
  update,
  remove,
} from "../controller/articleController.js";

const router = Router();

router.get("/", list);
router.get("/:id", get);
router.post("/", auth, authorize("admin"), create);
router.put("/:id", auth, authorize("admin"), update);
router.delete("/:id", auth, authorize("admin"), remove);

export default router;
