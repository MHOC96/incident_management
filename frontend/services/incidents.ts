import { apiClient } from "@/lib/api";
import type {
  Category,
  IncidentCreatePayload,
  IncidentDetail,
  IncidentImage,
  Location,
  PaginatedResponse,
  PublicIncident,
  StudentIncident,
} from "@/types";

export const incidentService = {
  listPublic: () =>
    apiClient.get<PaginatedResponse<PublicIncident>>("/incidents/public/", {
      auth: false,
    }),

  getPublic: (id: number) =>
    apiClient.get<PublicIncident>(`/incidents/${id}/public/`, {
      auth: false,
    }),

  listMine: () => apiClient.get<PaginatedResponse<IncidentDetail>>("/incidents/"),

  getById: (id: number) => apiClient.get<StudentIncident>(`/incidents/${id}/`),

  create: (payload: IncidentCreatePayload) =>
    apiClient.post<IncidentDetail>("/incidents/", payload),

  uploadImage: (incidentId: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.postFormData<IncidentImage>(
      `/incidents/${incidentId}/images/`,
      formData,
    );
  },
};

export const referenceService = {
  listCategories: () =>
    apiClient.get<Category[]>("/categories/", { auth: false }),

  listLocations: () =>
    apiClient.get<Location[]>("/locations/", { auth: false }),
};
