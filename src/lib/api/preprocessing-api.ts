import { apiClient } from "./api-client";

export interface PreprocessingPhaseRequest {
  run_embed?: boolean;
  run_process_content?: boolean;
  paper_ids?: string[];
  limit?: number;
}

export interface PreprocessingPhaseResponse {
  success: boolean;
  phase: string;
  message: string;
  details?: Record<string, unknown>;
}

export const preprocessingApi = {
  runPhase: async (data: PreprocessingPhaseRequest): Promise<PreprocessingPhaseResponse> => {
    return apiClient.post<PreprocessingPhaseResponse>("/api/v1/preprocess/phase/run", data);
  },

  queuePhase: async (data: PreprocessingPhaseRequest): Promise<{
    task_id: string;
    task_type: string;
    status: string;
    message: string;
  }> => {
    return apiClient.post("/api/v1/preprocess/phase/queue", data);
  },
};