import { Router } from 'express';

import {
  getIndices,
  getIpos,
  getMarketOverview,
  getStock,
  getStockHistory,
  listStocks,
  screenStocks,
} from '../services/marketService.js';

const router = Router();

router.get('/overview', async (_req, res, next) => {
  try {
    res.json(await getMarketOverview());
  } catch (error) {
    next(error);
  }
});

router.get('/indices', async (_req, res, next) => {
  try {
    res.json({ indices: await getIndices() });
  } catch (error) {
    next(error);
  }
});

router.get('/stocks', async (req, res, next) => {
  try {
    const stocks = await listStocks({
      query: req.query.q || '',
      sector: req.query.sector || 'All',
    });

    res.json({ stocks });
  } catch (error) {
    next(error);
  }
});

// Keep this ABOVE /stocks/:symbol so "history" is not treated as a symbol.
router.get('/stocks/:symbol/history', async (req, res, next) => {
  try {
    const history = await getStockHistory(
      decodeURIComponent(req.params.symbol),
      req.query.period || '1Y'
    );

    if (!history) {
      return res.status(404).json({
        message: 'Stock history not found.',
      });
    }

    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/stocks/:symbol', async (req, res, next) => {
  try {
    const stock = await getStock(
      decodeURIComponent(req.params.symbol)
    );

    if (!stock) {
      return res.status(404).json({
        message: 'Stock not found.',
      });
    }

    res.json({ stock });
  } catch (error) {
    next(error);
  }
});

router.get('/ipos', async (req, res, next) => {
  try {
    res.json({
      ipos: await getIpos(req.query.status || 'all'),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/screener', async (req, res, next) => {
  try {
    res.json({
      stocks: await screenStocks(req.query),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
