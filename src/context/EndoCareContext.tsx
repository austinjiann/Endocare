import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Core data types for endometriosis tracking
export interface SymptomEntry {
  id: string;
  date: string;
  nausea: number;    // 1-10 scale
  fatigue: number;   // 1-10 scale  
  pain: number;      // 1-10 scale
  notes?: string;
  // TODO: Add mood tracking, specific pain locations
}

export interface PeriodLog {
  id: string;
  date: string;
  type: 'start' | 'end';
  flowLevel?: number;     // 1-5 scale (light to heavy)
  associatedSymptoms?: {
    nausea: number;
    fatigue: number;
    pain: number;
  };
  notes?: string;
  // TODO: Add cycle length tracking, ovulation indicators
}

export interface FoodLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: string;
  flareUpScore: number;   // 1-10 scale (1 = no reaction, 10 = severe flare)
  symptomsAfter?: {
    nausea: number;
    fatigue: number;
    pain: number;
  };
  timeAfterEating?: string; // e.g., "2 hours"
  notes?: string;
  // TODO: Add ingredient tracking, elimination diet support
}

export interface SleepLog {
  id: string;
  date: string;
  hoursSlept: number;
  sleepQuality: number;    // 1-10 scale
  morningSymptoms?: {
    nausea: number;
    fatigue: number;
    pain: number;
  };
  sleepDisruptions?: string; // e.g., "pain", "bathroom", "anxiety"
  notes?: string;
  // TODO: Add sleep pattern analysis, bedtime tracking
}

// App state interface
interface EndoCareState {
  symptomLogs: SymptomEntry[];
  periodLogs: PeriodLog[];
  foodLogs: FoodLog[];
  sleepLogs: SleepLog[];
}

// Action types for state management
type EndoCareAction =
  | { type: 'ADD_SYMPTOM_LOG'; payload: SymptomEntry }
  | { type: 'ADD_PERIOD_LOG'; payload: PeriodLog }
  | { type: 'ADD_FOOD_LOG'; payload: FoodLog }
  | { type: 'ADD_SLEEP_LOG'; payload: SleepLog }
  | { type: 'UPDATE_SYMPTOM_LOG'; payload: { id: string; updates: Partial<SymptomEntry> } }
  | { type: 'UPDATE_PERIOD_LOG'; payload: { id: string; updates: Partial<PeriodLog> } }
  | { type: 'UPDATE_FOOD_LOG'; payload: { id: string; updates: Partial<FoodLog> } }
  | { type: 'UPDATE_SLEEP_LOG'; payload: { id: string; updates: Partial<SleepLog> } }
  | { type: 'DELETE_SYMPTOM_LOG'; payload: string }
  | { type: 'DELETE_PERIOD_LOG'; payload: string }
  | { type: 'DELETE_FOOD_LOG'; payload: string }
  | { type: 'DELETE_SLEEP_LOG'; payload: string };

// Sample data for endometriosis tracking scenarios
const sampleSymptomLogs: SymptomEntry[] = [
  {
    id: '1',
    date: '2025-02-02',
    nausea: 7,
    fatigue: 8,
    pain: 6,
    notes: 'Woke up feeling nauseous, period starting soon'
  },
  {
    id: '2',
    date: '2025-02-01',
    nausea: 3,
    fatigue: 5,
    pain: 4,
    notes: 'Better day, mild discomfort'
  },
  {
    id: '3',
    date: '2025-01-31',
    nausea: 9,
    fatigue: 9,
    pain: 8,
    notes: 'Very bad flare after eating dairy yesterday'
  }
];

const samplePeriodLogs: PeriodLog[] = [
  {
    id: '1',
    date: '2025-02-02',
    type: 'start',
    flowLevel: 3,
    associatedSymptoms: {
      nausea: 7,
      fatigue: 8,
      pain: 6
    },
    notes: 'Heavy cramping, took ibuprofen'
  },
  {
    id: '2',
    date: '2025-01-25',
    type: 'end',
    flowLevel: 1,
    associatedSymptoms: {
      nausea: 2,
      fatigue: 3,
      pain: 2
    },
    notes: 'Finally feeling better'
  }
];

const sampleFoodLogs: FoodLog[] = [
  {
    id: '1',
    date: '2025-02-01',
    mealType: 'lunch',
    foodItems: 'Gluten-free quinoa salad with vegetables',
    flareUpScore: 2,
    symptomsAfter: {
      nausea: 2,
      fatigue: 3,
      pain: 2
    },
    timeAfterEating: '1 hour',
    notes: 'Felt good, no major reactions'
  },
  {
    id: '2',
    date: '2025-01-30',
    mealType: 'dinner',
    foodItems: 'Pizza with regular cheese and wheat crust',
    flareUpScore: 8,
    symptomsAfter: {
      nausea: 9,
      fatigue: 7,
      pain: 8
    },
    timeAfterEating: '3 hours',
    notes: 'Major flare - dairy and gluten trigger confirmed'
  },
  {
    id: '3',
    date: '2025-01-29',
    mealType: 'breakfast',
    foodItems: 'Oatmeal with almond milk and berries',
    flareUpScore: 1,
    symptomsAfter: {
      nausea: 1,
      fatigue: 2,
      pain: 1
    },
    timeAfterEating: '30 minutes',
    notes: 'Safe breakfast option'
  }
];

const sampleSleepLogs: SleepLog[] = [
  {
    id: '1',
    date: '2025-02-01',
    hoursSlept: 6.5,
    sleepQuality: 4,
    morningSymptoms: {
      nausea: 3,
      fatigue: 6,
      pain: 4
    },
    sleepDisruptions: 'Mild cramping, woke up twice',
    notes: 'Period starting, restless sleep'
  },
  {
    id: '2',
    date: '2025-01-31',
    hoursSlept: 4,
    sleepQuality: 2,
    morningSymptoms: {
      nausea: 9,
      fatigue: 9,
      pain: 8
    },
    sleepDisruptions: 'Severe pain, nausea, bathroom trips',
    notes: 'Terrible night after dairy trigger'
  },
  {
    id: '3',
    date: '2025-01-30',
    hoursSlept: 8,
    sleepQuality: 8,
    morningSymptoms: {
      nausea: 2,
      fatigue: 3,
      pain: 2
    },
    sleepDisruptions: 'None',
    notes: 'Great sleep, felt refreshed'
  }
];

// Initial state with realistic endometriosis sample data
const initialState: EndoCareState = {
  symptomLogs: sampleSymptomLogs,
  periodLogs: samplePeriodLogs,
  foodLogs: sampleFoodLogs,
  sleepLogs: sampleSleepLogs,
};

// Reducer function for state management
function endoCareReducer(state: EndoCareState, action: EndoCareAction): EndoCareState {
  switch (action.type) {
    case 'ADD_SYMPTOM_LOG':
      return {
        ...state,
        symptomLogs: [...state.symptomLogs, action.payload],
      };
    case 'ADD_PERIOD_LOG':
      return {
        ...state,
        periodLogs: [...state.periodLogs, action.payload],
      };
    case 'ADD_FOOD_LOG':
      return {
        ...state,
        foodLogs: [...state.foodLogs, action.payload],
      };
    case 'ADD_SLEEP_LOG':
      return {
        ...state,
        sleepLogs: [...state.sleepLogs, action.payload],
      };
    case 'UPDATE_SYMPTOM_LOG':
      return {
        ...state,
        symptomLogs: state.symptomLogs.map(log =>
          log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
        ),
      };
    case 'UPDATE_PERIOD_LOG':
      return {
        ...state,
        periodLogs: state.periodLogs.map(log =>
          log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
        ),
      };
    case 'UPDATE_FOOD_LOG':
      return {
        ...state,
        foodLogs: state.foodLogs.map(log =>
          log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
        ),
      };
    case 'UPDATE_SLEEP_LOG':
      return {
        ...state,
        sleepLogs: state.sleepLogs.map(log =>
          log.id === action.payload.id ? { ...log, ...action.payload.updates } : log
        ),
      };
    case 'DELETE_SYMPTOM_LOG':
      return {
        ...state,
        symptomLogs: state.symptomLogs.filter(log => log.id !== action.payload),
      };
    case 'DELETE_PERIOD_LOG':
      return {
        ...state,
        periodLogs: state.periodLogs.filter(log => log.id !== action.payload),
      };
    case 'DELETE_FOOD_LOG':
      return {
        ...state,
        foodLogs: state.foodLogs.filter(log => log.id !== action.payload),
      };
    case 'DELETE_SLEEP_LOG':
      return {
        ...state,
        sleepLogs: state.sleepLogs.filter(log => log.id !== action.payload),
      };
    default:
      return state;
  }
}

// Context interface with helper functions
interface EndoCareContextType {
  state: EndoCareState;
  dispatch: React.Dispatch<EndoCareAction>;
  // Helper functions for easier data management
  addSymptomLog: (log: Omit<SymptomEntry, 'id'>) => void;
  addPeriodLog: (log: Omit<PeriodLog, 'id'>) => void;
  addFoodLog: (log: Omit<FoodLog, 'id'>) => void;
  addSleepLog: (log: Omit<SleepLog, 'id'>) => void;
  // TODO: Add helper functions for data analysis
  // getSymptomTrends: () => any;
  // getFoodTriggers: () => any;
  // getWorstSymptomDays: () => any;
}

// Create context
const EndoCareContext = createContext<EndoCareContextType | undefined>(undefined);

// Context provider component
export function EndoCareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(endoCareReducer, initialState);

  // Helper functions for adding new logs
  const addSymptomLog = (log: Omit<SymptomEntry, 'id'>) => {
    dispatch({
      type: 'ADD_SYMPTOM_LOG',
      payload: { ...log, id: Date.now().toString() },
    });
  };

  const addPeriodLog = (log: Omit<PeriodLog, 'id'>) => {
    dispatch({
      type: 'ADD_PERIOD_LOG',
      payload: { ...log, id: Date.now().toString() },
    });
  };

  const addFoodLog = (log: Omit<FoodLog, 'id'>) => {
    dispatch({
      type: 'ADD_FOOD_LOG',
      payload: { ...log, id: Date.now().toString() },
    });
  };

  const addSleepLog = (log: Omit<SleepLog, 'id'>) => {
    dispatch({
      type: 'ADD_SLEEP_LOG',
      payload: { ...log, id: Date.now().toString() },
    });
  };

  return (
    <EndoCareContext.Provider
      value={{
        state,
        dispatch,
        addSymptomLog,
        addPeriodLog,
        addFoodLog,
        addSleepLog,
      }}
    >
      {children}
    </EndoCareContext.Provider>
  );
}

// Custom hook to use the EndoCare context
export function useEndoCare() {
  const context = useContext(EndoCareContext);
  if (context === undefined) {
    throw new Error('useEndoCare must be used within an EndoCareProvider');
  }
  return context;
}