import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { RESORTS, Resort, ResortStatus } from '../data/resorts';
import { deleteDraft } from '../utils/storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Role = 'divisional' | 'district';

export type Inspection = {
    id: string;
    resortId: string;
    status: 'pending' | 'approved' | 'rejected';
    responses: Record<string, number | null>;
    totalScore: number;
    starRating: 1 | 2 | 3 | 4 | 5;
    performanceLabel: string;
    submittedAt: string;
    officerNotes: string;
};

type AppState = {
    role: Role | null;
    resorts: Resort[];
    inspections: Inspection[];
};

type Action =
    | { type: 'SET_ROLE'; payload: Role }
    | {
        type: 'SUBMIT_INSPECTION';
        payload: {
            resortId: string;
            responses: Record<string, number | null>;
            totalScore: number;
            starRating: 1 | 2 | 3 | 4 | 5;
            performanceLabel: string;
            officerNotes: string;
        };
    }
    | { type: 'APPROVE_INSPECTION'; payload: { inspectionId: string } }
    | { type: 'REJECT_INSPECTION'; payload: { inspectionId: string } }
    | { type: 'UNFREEZE_INSPECTION'; payload: { inspectionId: string } }
    | { type: 'REMOVE_INSPECTION'; payload: { inspectionId: string } };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
    role: null,
    resorts: RESORTS,
    inspections: [],
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {

        case 'SET_ROLE':
            return { ...state, role: action.payload };

        case 'SUBMIT_INSPECTION': {
            const { resortId, responses, totalScore, starRating, performanceLabel, officerNotes } = action.payload;
            const inspectionId = `inspection_${resortId}_${Date.now()}`;

            const newInspection: Inspection = {
                id: inspectionId,
                resortId,
                status: 'pending',
                responses,
                totalScore,
                starRating,
                performanceLabel,
                submittedAt: new Date().toISOString(),
                officerNotes,
            };

            const updatedResorts = state.resorts.map(r =>
                r.id === resortId
                    ? { ...r, status: 'pending' as ResortStatus, currentInspectionId: inspectionId }
                    : r
            );

            return {
                ...state,
                resorts: updatedResorts,
                inspections: [...state.inspections, newInspection],
            };
        }

        case 'APPROVE_INSPECTION': {
            const { inspectionId } = action.payload;
            const inspection = state.inspections.find(i => i.id === inspectionId);
            if (!inspection) return state;

            const updatedInspections = state.inspections.map(i =>
                i.id === inspectionId ? { ...i, status: 'approved' as const } : i
            );

            const updatedResorts = state.resorts.map(r =>
                r.id === inspection.resortId
                    ? {
                        ...r,
                        status: 'approved' as ResortStatus,
                        currentRating: inspection.starRating,
                    }
                    : r
            );

            return { ...state, inspections: updatedInspections, resorts: updatedResorts };
        }

        case 'REJECT_INSPECTION': {
            const { inspectionId } = action.payload;
            const inspection = state.inspections.find(i => i.id === inspectionId);
            if (!inspection) return state;

            const updatedInspections = state.inspections.map(i =>
                i.id === inspectionId ? { ...i, status: 'rejected' as const } : i
            );

            const updatedResorts = state.resorts.map(r =>
                r.id === inspection.resortId
                    ? {
                        ...r,
                        status: 'rejected' as ResortStatus,
                        currentRating: null,
                        currentInspectionId: null,
                    }
                    : r
            );

            return { ...state, inspections: updatedInspections, resorts: updatedResorts };
        }

        case 'UNFREEZE_INSPECTION': {
            const { inspectionId } = action.payload;
            const inspection = state.inspections.find(i => i.id === inspectionId);
            if (!inspection) return state;

            const updatedInspections = state.inspections.filter(
                i => i.id !== inspectionId
            );

            const updatedResorts = state.resorts.map(r =>
                r.id === inspection.resortId
                    ? {
                        ...r,
                        status: 'unrated' as ResortStatus,
                        currentRating: null,
                        currentInspectionId: null,
                    }
                    : r
            );

            return { ...state, inspections: updatedInspections, resorts: updatedResorts };
        }

        case 'REMOVE_INSPECTION': {
            const { inspectionId } = action.payload;
            const inspection = state.inspections.find(i => i.id === inspectionId);
            if (!inspection) return state;

            const updatedInspections = state.inspections.filter(
                i => i.id !== inspectionId
            );

            const updatedResorts = state.resorts.map(r =>
                r.id === inspection.resortId
                    ? {
                        ...r,
                        status: 'unrated' as ResortStatus,
                        currentRating: null,
                        currentInspectionId: null,
                    }
                    : r
            );

            return { ...state, inspections: updatedInspections, resorts: updatedResorts };
        }

        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

type AppContextType = {
    state: AppState;
    setRole: (role: Role) => void;
    submitInspection: (payload: {
        resortId: string;
        responses: Record<string, number | null>;
        totalScore: number;
        starRating: 1 | 2 | 3 | 4 | 5;
        performanceLabel: string;
        officerNotes: string;
    }) => void;
    approveInspection: (inspectionId: string) => void;
    rejectInspection: (inspectionId: string) => void;
    unfreezeInspection: (inspectionId: string) => void;
    removeInspection: (inspectionId: string) => void;
    getResortById: (id: string) => Resort | undefined;
    getInspectionById: (id: string) => Inspection | undefined;
    getInspectionByResortId: (resortId: string) => Inspection | undefined;
};

const AppContext = createContext<AppContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const setRole = (role: Role) => {
        dispatch({ type: 'SET_ROLE', payload: role });
    };

    const submitInspection = (payload: {
        resortId: string;
        responses: Record<string, number | null>;
        totalScore: number;
        starRating: 1 | 2 | 3 | 4 | 5;
        performanceLabel: string;
        officerNotes: string;
    }) => {
        deleteDraft(payload.resortId);
        dispatch({ type: 'SUBMIT_INSPECTION', payload });
    };

    const approveInspection = (inspectionId: string) => {
        dispatch({ type: 'APPROVE_INSPECTION', payload: { inspectionId } });
    };

    const rejectInspection = (inspectionId: string) => {
        dispatch({ type: 'REJECT_INSPECTION', payload: { inspectionId } });
    };

    const unfreezeInspection = (inspectionId: string) => {
        dispatch({ type: 'UNFREEZE_INSPECTION', payload: { inspectionId } });
    };

    const removeInspection = (inspectionId: string) => {
        dispatch({ type: 'REMOVE_INSPECTION', payload: { inspectionId } });
    };

    const getResortById = (id: string) =>
        state.resorts.find(r => r.id === id);

    const getInspectionById = (id: string) =>
        state.inspections.find(i => i.id === id);

    const getInspectionByResortId = (resortId: string) =>
        state.inspections.find(
            i => i.resortId === resortId && i.status !== 'rejected'
        );

    return (
        <AppContext.Provider
            value={{
                state,
                setRole,
                submitInspection,
                approveInspection,
                rejectInspection,
                unfreezeInspection,
                removeInspection,
                getResortById,
                getInspectionById,
                getInspectionByResortId,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}