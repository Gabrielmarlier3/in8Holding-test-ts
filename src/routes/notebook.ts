import express from 'express';
import { getProducts, syncData } from "../controller/NotebookController";

const router = express.Router();

router.get('/get', getProducts);

router.get('/sync', syncData);


export default router;