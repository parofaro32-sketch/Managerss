export interface FormationPosition {
  id: string;
  role: 'GK' | 'DEF' | 'MID' | 'ATT';
  label: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
}

export const ALL_FORMATIONS: Record<string, FormationPosition[]> = {
  '4-4-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'LM', x: 15, y: 45 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 38, y: 48 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 62, y: 48 },
    { id: 'pos_8', role: 'MID', label: 'RM', x: 85, y: 45 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 20 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 20 }
  ],
  '4-3-3': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'CM', x: 30, y: 48 },
    { id: 'pos_6', role: 'MID', label: 'CDM', x: 50, y: 55 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 70, y: 48 },
    { id: 'pos_8', role: 'ATT', label: 'LW', x: 20, y: 22 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 50, y: 18 },
    { id: 'pos_10', role: 'ATT', label: 'RW', x: 80, y: 22 }
  ],
  '4-2-3-1': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'CDM', x: 38, y: 55 },
    { id: 'pos_6', role: 'MID', label: 'CDM', x: 62, y: 55 },
    { id: 'pos_7', role: 'MID', label: 'LAM', x: 20, y: 35 },
    { id: 'pos_8', role: 'MID', label: 'CAM', x: 50, y: 38 },
    { id: 'pos_9', role: 'MID', label: 'RAM', x: 80, y: 35 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 50, y: 18 }
  ],
  '3-5-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'CB', x: 25, y: 72 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 50, y: 75 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 75, y: 72 },
    { id: 'pos_4', role: 'MID', label: 'LWB', x: 12, y: 48 },
    { id: 'pos_5', role: 'MID', label: 'CM', x: 35, y: 50 },
    { id: 'pos_6', role: 'MID', label: 'CDM', x: 50, y: 58 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 65, y: 50 },
    { id: 'pos_8', role: 'MID', label: 'RWB', x: 88, y: 48 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 20 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 20 }
  ],
  '3-4-3': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'CB', x: 25, y: 72 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 50, y: 75 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 75, y: 72 },
    { id: 'pos_4', role: 'MID', label: 'LM', x: 15, y: 45 },
    { id: 'pos_5', role: 'MID', label: 'CM', x: 38, y: 48 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 62, y: 48 },
    { id: 'pos_7', role: 'MID', label: 'RM', x: 85, y: 45 },
    { id: 'pos_8', role: 'ATT', label: 'LW', x: 22, y: 20 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 50, y: 18 },
    { id: 'pos_10', role: 'ATT', label: 'RW', x: 78, y: 20 }
  ],
  '4-1-4-1': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'CDM', x: 50, y: 60 },
    { id: 'pos_6', role: 'MID', label: 'LM', x: 15, y: 40 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 38, y: 42 },
    { id: 'pos_8', role: 'MID', label: 'CM', x: 62, y: 42 },
    { id: 'pos_9', role: 'MID', label: 'RM', x: 85, y: 40 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 50, y: 18 }
  ],
  '4-5-1': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'LM', x: 15, y: 45 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 35, y: 50 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 50, y: 42 },
    { id: 'pos_8', role: 'MID', label: 'CM', x: 65, y: 50 },
    { id: 'pos_9', role: 'MID', label: 'RM', x: 85, y: 45 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 50, y: 18 }
  ],
  '5-3-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LWB', x: 12, y: 65 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 30, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 50, y: 74 },
    { id: 'pos_4', role: 'DEF', label: 'CB', x: 70, y: 72 },
    { id: 'pos_5', role: 'DEF', label: 'RWB', x: 88, y: 65 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 35, y: 45 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 50, y: 50 },
    { id: 'pos_8', role: 'MID', label: 'CM', x: 65, y: 45 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 20 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 20 }
  ],
  '5-4-1': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LWB', x: 12, y: 65 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 30, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 50, y: 74 },
    { id: 'pos_4', role: 'DEF', label: 'CB', x: 70, y: 72 },
    { id: 'pos_5', role: 'DEF', label: 'RWB', x: 88, y: 65 },
    { id: 'pos_6', role: 'MID', label: 'LM', x: 20, y: 45 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 40, y: 48 },
    { id: 'pos_8', role: 'MID', label: 'CM', x: 60, y: 48 },
    { id: 'pos_9', role: 'MID', label: 'RM', x: 80, y: 45 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 50, y: 18 }
  ],
  '4-3-1-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'CM', x: 30, y: 50 },
    { id: 'pos_6', role: 'MID', label: 'CDM', x: 50, y: 58 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 70, y: 50 },
    { id: 'pos_8', role: 'MID', label: 'CAM', x: 50, y: 35 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 18 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 18 }
  ],
  '4-2-2-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'CDM', x: 38, y: 58 },
    { id: 'pos_6', role: 'MID', label: 'CDM', x: 62, y: 58 },
    { id: 'pos_7', role: 'MID', label: 'LAM', x: 25, y: 38 },
    { id: 'pos_8', role: 'MID', label: 'RAM', x: 75, y: 38 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 18 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 18 }
  ],
  '3-4-2-1': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'CB', x: 25, y: 72 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 50, y: 75 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 75, y: 72 },
    { id: 'pos_4', role: 'MID', label: 'LM', x: 15, y: 48 },
    { id: 'pos_5', role: 'MID', label: 'CM', x: 38, y: 52 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 62, y: 52 },
    { id: 'pos_7', role: 'MID', label: 'RM', x: 85, y: 48 },
    { id: 'pos_8', role: 'ATT', label: 'CF', x: 35, y: 28 },
    { id: 'pos_9', role: 'ATT', label: 'CF', x: 65, y: 28 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 50, y: 16 }
  ],
  '4-1-2-1-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LB', x: 15, y: 70 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 38, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 62, y: 72 },
    { id: 'pos_4', role: 'DEF', label: 'RB', x: 85, y: 70 },
    { id: 'pos_5', role: 'MID', label: 'CDM', x: 50, y: 62 },
    { id: 'pos_6', role: 'MID', label: 'LM', x: 25, y: 45 },
    { id: 'pos_7', role: 'MID', label: 'RM', x: 75, y: 45 },
    { id: 'pos_8', role: 'MID', label: 'CAM', x: 50, y: 34 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 16 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 16 }
  ],
  '3-4-1-2': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'CB', x: 25, y: 72 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 50, y: 75 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 75, y: 72 },
    { id: 'pos_4', role: 'MID', label: 'LM', x: 15, y: 48 },
    { id: 'pos_5', role: 'MID', label: 'CM', x: 38, y: 52 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 62, y: 52 },
    { id: 'pos_7', role: 'MID', label: 'RM', x: 85, y: 48 },
    { id: 'pos_8', role: 'MID', label: 'CAM', x: 50, y: 32 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 40, y: 16 },
    { id: 'pos_10', role: 'ATT', label: 'ST', x: 60, y: 16 }
  ],
  '5-2-3': [
    { id: 'pos_0', role: 'GK', label: 'GK', x: 50, y: 88 },
    { id: 'pos_1', role: 'DEF', label: 'LWB', x: 12, y: 65 },
    { id: 'pos_2', role: 'DEF', label: 'CB', x: 30, y: 72 },
    { id: 'pos_3', role: 'DEF', label: 'CB', x: 50, y: 74 },
    { id: 'pos_4', role: 'DEF', label: 'CB', x: 70, y: 72 },
    { id: 'pos_5', role: 'DEF', label: 'RWB', x: 88, y: 65 },
    { id: 'pos_6', role: 'MID', label: 'CM', x: 38, y: 48 },
    { id: 'pos_7', role: 'MID', label: 'CM', x: 62, y: 48 },
    { id: 'pos_8', role: 'ATT', label: 'LW', x: 22, y: 20 },
    { id: 'pos_9', role: 'ATT', label: 'ST', x: 50, y: 16 },
    { id: 'pos_10', role: 'ATT', label: 'RW', x: 78, y: 20 }
  ]
};
