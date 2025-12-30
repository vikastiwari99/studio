import React from 'react';
import { Plus, Minus, X, Divide, Sigma, Percent, Calculator, Ruler, Dice5, BarChart } from 'lucide-react';

export const TopicIcons: { [key: string]: React.ElementType } = {
  "Addition": Plus,
  "Subtraction": Minus,
  "Multiplication": X,
  "Division": Divide,
  "Fractions": Calculator,
  "Decimals": Calculator,
  "Percentages": Percent,
  "Algebra": Sigma,
  "Geometry": Ruler,
  "Probability": Dice5,
  "Statistics": BarChart,
  "Default": Calculator
};

export function getTopicIcon(topic: string) {
  return TopicIcons[topic] || TopicIcons.Default;
}
