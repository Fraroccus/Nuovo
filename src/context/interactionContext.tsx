import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import type { FC, ReactNode } from "react";
import type { EditMode, HighlightMetadata } from "../types/warehouse";

interface InteractionState {
  editMode: EditMode;
  selectedShelves: Set<string>;
  selectedInventoryItems: Set<string>;
  highlightedMetadata: Map<string, HighlightMetadata>;
}

type SelectionOptions = {
  append?: boolean;
};

type HighlightOptions = {
  merge?: boolean;
};

type InteractionAction =
  | { type: "SET_EDIT_MODE"; mode: EditMode }
  | { type: "SELECT_SHELVES"; ids: string[]; options?: SelectionOptions }
  | { type: "TOGGLE_SHELF"; id: string }
  | { type: "SELECT_INVENTORY"; ids: string[]; options?: SelectionOptions }
  | { type: "TOGGLE_INVENTORY"; id: string }
  | { type: "CLEAR_SELECTION" }
  | {
      type: "SET_HIGHLIGHTS";
      metadata: HighlightMetadata[];
      options?: HighlightOptions;
    }
  | { type: "CLEAR_HIGHLIGHTS" };

interface InteractionContextValue {
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
  selectedShelfIds: string[];
  selectShelves: (ids: string[], options?: SelectionOptions) => void;
  toggleShelfSelection: (id: string) => void;
  selectedInventoryIds: string[];
  selectInventoryItems: (ids: string[], options?: SelectionOptions) => void;
  toggleInventorySelection: (id: string) => void;
  clearSelection: () => void;
  highlightedMetadata: HighlightMetadata[];
  setHighlightedMetadata: (
    metadata: HighlightMetadata[],
    options?: HighlightOptions,
  ) => void;
  clearHighlighting: () => void;
  isShelfSelected: (id: string) => boolean;
  isInventorySelected: (id: string) => boolean;
  hasHighlight: (id: string) => boolean;
}

const initialState: InteractionState = {
  editMode: "view",
  selectedShelves: new Set(),
  selectedInventoryItems: new Set(),
  highlightedMetadata: new Map(),
};

const InteractionContext = createContext<InteractionContextValue | null>(null);

const toUniqueSet = (current: Set<string>, ids: string[], append?: boolean) => {
  if (append) {
    return new Set([...current, ...ids]);
  }

  return new Set(ids);
};

const interactionReducer = (
  state: InteractionState,
  action: InteractionAction,
): InteractionState => {
  switch (action.type) {
    case "SET_EDIT_MODE":
      if (state.editMode === action.mode) {
        return state;
      }
      return { ...state, editMode: action.mode };
    case "SELECT_SHELVES":
      return {
        ...state,
        selectedShelves: toUniqueSet(
          state.selectedShelves,
          action.ids,
          action.options?.append,
        ),
      };
    case "TOGGLE_SHELF": {
      const next = new Set(state.selectedShelves);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, selectedShelves: next };
    }
    case "SELECT_INVENTORY":
      return {
        ...state,
        selectedInventoryItems: toUniqueSet(
          state.selectedInventoryItems,
          action.ids,
          action.options?.append,
        ),
      };
    case "TOGGLE_INVENTORY": {
      const next = new Set(state.selectedInventoryItems);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, selectedInventoryItems: next };
    }
    case "CLEAR_SELECTION":
      if (
        state.selectedShelves.size === 0 &&
        state.selectedInventoryItems.size === 0
      ) {
        return state;
      }
      return {
        ...state,
        selectedShelves: new Set(),
        selectedInventoryItems: new Set(),
      };
    case "SET_HIGHLIGHTS": {
      const next = action.options?.merge
        ? new Map(state.highlightedMetadata)
        : new Map<string, HighlightMetadata>();
      action.metadata.forEach((meta) => {
        next.set(meta.id, meta);
      });
      return {
        ...state,
        highlightedMetadata: next,
      };
    }
    case "CLEAR_HIGHLIGHTS":
      if (state.highlightedMetadata.size === 0) {
        return state;
      }
      return {
        ...state,
        highlightedMetadata: new Map(),
      };
    default:
      return state;
  }
};

export interface InteractionProviderProps {
  children: ReactNode;
  initialEditMode?: EditMode;
}

export const InteractionProvider: FC<InteractionProviderProps> = ({
  children,
  initialEditMode = "view",
}) => {
  const [state, dispatch] = useReducer(interactionReducer, {
    ...initialState,
    editMode: initialEditMode,
  });

  const setEditMode = useCallback(
    (mode: EditMode) => dispatch({ type: "SET_EDIT_MODE", mode }),
    [],
  );

  const selectShelves = useCallback(
    (ids: string[], options?: SelectionOptions) =>
      dispatch({ type: "SELECT_SHELVES", ids, options }),
    [],
  );

  const toggleShelfSelection = useCallback(
    (id: string) => dispatch({ type: "TOGGLE_SHELF", id }),
    [],
  );

  const selectInventoryItems = useCallback(
    (ids: string[], options?: SelectionOptions) =>
      dispatch({ type: "SELECT_INVENTORY", ids, options }),
    [],
  );

  const toggleInventorySelection = useCallback(
    (id: string) => dispatch({ type: "TOGGLE_INVENTORY", id }),
    [],
  );

  const clearSelection = useCallback(
    () => dispatch({ type: "CLEAR_SELECTION" }),
    [],
  );

  const setHighlightedMetadata = useCallback(
    (metadata: HighlightMetadata[], options?: HighlightOptions) =>
      dispatch({ type: "SET_HIGHLIGHTS", metadata, options }),
    [],
  );

  const clearHighlighting = useCallback(
    () => dispatch({ type: "CLEAR_HIGHLIGHTS" }),
    [],
  );

  const selectedShelfIds = useMemo(
    () => Array.from(state.selectedShelves.values()),
    [state.selectedShelves],
  );

  const selectedInventoryIds = useMemo(
    () => Array.from(state.selectedInventoryItems.values()),
    [state.selectedInventoryItems],
  );

  const highlightedMetadata = useMemo(
    () => Array.from(state.highlightedMetadata.values()),
    [state.highlightedMetadata],
  );

  const isShelfSelected = useCallback(
    (id: string) => state.selectedShelves.has(id),
    [state.selectedShelves],
  );

  const isInventorySelected = useCallback(
    (id: string) => state.selectedInventoryItems.has(id),
    [state.selectedInventoryItems],
  );

  const hasHighlight = useCallback(
    (id: string) => state.highlightedMetadata.has(id),
    [state.highlightedMetadata],
  );

  const value = useMemo<InteractionContextValue>(
    () => ({
      editMode: state.editMode,
      setEditMode,
      selectedShelfIds,
      selectShelves,
      toggleShelfSelection,
      selectedInventoryIds,
      selectInventoryItems,
      toggleInventorySelection,
      clearSelection,
      highlightedMetadata,
      setHighlightedMetadata,
      clearHighlighting,
      isShelfSelected,
      isInventorySelected,
      hasHighlight,
    }),
    [
      state.editMode,
      setEditMode,
      selectedShelfIds,
      selectShelves,
      toggleShelfSelection,
      selectedInventoryIds,
      selectInventoryItems,
      toggleInventorySelection,
      clearSelection,
      highlightedMetadata,
      setHighlightedMetadata,
      clearHighlighting,
      isShelfSelected,
      isInventorySelected,
      hasHighlight,
    ],
  );

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
};

export const useInteractionContext = (): InteractionContextValue => {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error(
      "useInteractionContext must be used within an InteractionProvider",
    );
  }
  return context;
};

export const useSelection = () => {
  const {
    selectedShelfIds,
    selectedInventoryIds,
    selectShelves,
    selectInventoryItems,
    toggleShelfSelection,
    toggleInventorySelection,
    clearSelection,
    isShelfSelected,
    isInventorySelected,
  } = useInteractionContext();

  return {
    selectedShelfIds,
    selectedInventoryIds,
    selectShelves,
    selectInventoryItems,
    toggleShelfSelection,
    toggleInventorySelection,
    clearSelection,
    isShelfSelected,
    isInventorySelected,
  } as const;
};

export const useEditMode = () => {
  const { editMode, setEditMode } = useInteractionContext();
  return { editMode, setEditMode } as const;
};

export const useHighlighting = () => {
  const {
    highlightedMetadata,
    setHighlightedMetadata,
    clearHighlighting,
    hasHighlight,
  } = useInteractionContext();

  return {
    highlightedMetadata,
    setHighlightedMetadata,
    clearHighlighting,
    hasHighlight,
  } as const;
};
