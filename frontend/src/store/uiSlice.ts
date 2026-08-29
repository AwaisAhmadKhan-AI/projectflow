/**
 * The one piece of state that actually belongs in Redux: a client-side
 * display preference (compact vs. comfortable issue list density) that
 * multiple, unrelated components read (the list view and the filter
 * bar's density toggle) and that should survive navigating between
 * screens. This is deliberately the ONLY thing in the store — see
 * docs/assessment-notes.md for why everything else (server data, form
 * state, local UI toggles, URL filters) was NOT put here.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type IssueListDensity = "comfortable" | "compact";

interface UiState {
  issueListDensity: IssueListDensity;
}

const initialState: UiState = {
  issueListDensity: "comfortable",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setIssueListDensity(state, action: PayloadAction<IssueListDensity>) {
      state.issueListDensity = action.payload;
    },
  },
});

export const { setIssueListDensity } = uiSlice.actions;
export default uiSlice.reducer;
