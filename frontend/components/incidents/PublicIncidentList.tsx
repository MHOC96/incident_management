"use client";

import { useEffect, useState } from "react";
import { PublicIncidentRow } from "@/components/incidents/PublicIncidentRow";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { incidentService, referenceService } from "@/services/incidents";
import type { Category, Location, PublicIncident } from "@/types";

type PublicIncidentListProps = {
  limit?: number;
};

export function PublicIncidentList({ limit }: PublicIncidentListProps) {
  const [incidents, setIncidents] = useState<PublicIncident[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [response, categoryData, locationData] = await Promise.all([
          incidentService.listPublic(),
          referenceService.listCategories(),
          referenceService.listLocations(),
        ]);
        setIncidents(response.results);
        setCategories(categoryData);
        setLocations(locationData);
      } catch {
        setError("The public incident register could not be loaded. Please refresh the page or try again later.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = incidents.filter((incident) => {
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      incident.incident_number.toLowerCase().includes(search) ||
      incident.title.toLowerCase().includes(search);
    const matchesCategory = !categoryId || String(incident.category.id) === categoryId;
    const matchesLocation = !locationId || String(incident.location.id) === locationId;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const visible = typeof limit === "number" ? filtered.slice(0, limit) : filtered;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 border-y border-border py-6">
        <div className="h-4 w-1/3 rounded-sm bg-border" />
        <div className="h-6 w-2/3 rounded-sm bg-border" />
        <div className="h-4 w-1/2 rounded-sm bg-border" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-danger/20 bg-danger/5 px-6 py-8 text-sm text-danger">
        {error}
      </div>
    );
  }

  return (
    <div>
      {limit ? null : (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="INC-2026-00142 or broken door"
            aria-label="Search by incident ID or title"
          />
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            aria-label="Filter by location"
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="border-t border-border py-8 text-text-secondary">
          {query || categoryId || locationId
            ? "There are no verified public incidents matching your search."
            : "No public incidents are listed at this time. Verified incidents marked as public will appear here."}
        </p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {visible.map((incident) => (
            <PublicIncidentRow key={incident.id} incident={incident} />
          ))}
        </div>
      )}
    </div>
  );
}
