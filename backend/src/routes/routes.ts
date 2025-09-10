// const experess = require("express");

import express, { Request, Response } from "express";
import {
  getAllAreas,
  getAreasRentalYield,
  getAreasPriceGrowthVacancyRisk,
  getAreasTransactionsTotalValue 
} from "../controllers/controllers";
const router = express.Router();

router.get("/areas", async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || null;

  try {
    const areas = await getAllAreas(offset, limit, search);
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/areas-rental-yield", async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;

  try {
    const data = await getAreasRentalYield(offset, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get(
  "/areas-price-growth-vacancy-risk",
  async (req: Request, res: Response) => {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = (req.query.search as string) || null;

    try {
      const data = await getAreasPriceGrowthVacancyRisk(offset, limit, search);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

router.get("/areas-transactions-total-value", async (req: Request, res: Response) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;
  const search = (req.query.search as string) || null;

  try {
    const data = await getAreasTransactionsTotalValue(offset, limit, search);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
