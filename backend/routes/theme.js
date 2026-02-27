import { Router } from 'express';
import { CHART_COLORS, GRAPH_THEMES, STATUS_THEME } from '../config/theme.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ chartColors: CHART_COLORS, graphThemes: GRAPH_THEMES, statusTheme: STATUS_THEME });
});

export default router;
