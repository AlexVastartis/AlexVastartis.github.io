import { Navigate, useParams } from 'react-router-dom';
import { useChartContext } from '../App';
import CriterionView from '../components/CriterionView';
import { CATEGORIES } from '../config/stats';
import type { CategoryKey } from '../types';

export default function CriteriaChart() {
  const { key } = useParams<{ key: string }>();
  const ctx = useChartContext();

  if (!key || !(key in CATEGORIES)) return <Navigate to="/criteria/perception" replace />;
  return <CriterionView criterion={key as CategoryKey} ctx={ctx} />;
}
