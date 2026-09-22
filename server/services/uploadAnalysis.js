import { scoreTransactions } from './riskEngine.js';
import { generateInsights } from './insightService.js';

export const analyzeUpload = (upload) => {
  const data = typeof upload?.toObject === 'function' ? upload.toObject() : upload;
  const riskAnalysis = scoreTransactions(data.rows || [], data.headers || []);
  return {
    ...data,
    riskAnalysis,
    insights: generateInsights({ rows: data.rows || [], headers: data.headers || [], riskAnalysis }),
  };
};
