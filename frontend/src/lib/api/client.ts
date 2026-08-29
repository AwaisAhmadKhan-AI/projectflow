/**
 * Single entry point every hook/component imports from. Chooses the
 * mock or real implementation once, here, based on an environment
 * variable — nothing else in the app needs an if/else for this.
 */
import { httpApi } from "@/lib/api/httpClient";
import { mockApi } from "@/lib/api/mockData";

const useMock = import.meta.env.VITE_USE_MOCK_API !== "false";

export const api = useMock ? mockApi : httpApi;
export { NotFoundError, ValidationError } from "@/lib/api/mockData";
