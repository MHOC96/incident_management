"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicIncidentRow } from "@/components/incidents/PublicIncidentRow";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { incidentService, referenceService } from "@/services/incidents";
import { placeholders } from "@/lib/placeholders";
import type { Category, Location, PublicIncident } from "@/types";

type PublicIncidentListProps = {
  limit?: number;
};

export function PublicIncidentList({ limit }: PublicIncidentListProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [incidents, setIncidents] = useState<PublicIncident[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        if (limit) {
          const response = await incidentService.listPublic();
          setIncidents(response.results);
          return;
        }

        const [response, categoryData] = await Promise.all([
          incidentService.listPublic(),
          referenceService.listCategories(),
        ]);
        setIncidents(response.results);
        setCategories(categoryData);
      } catch {
        setError("The public incident register could not be loaded. Please refresh the page or try again later.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [limit, retryCount]);

  const locations = useMemo(() => {
    const unique = new Map<number, Location>();
    incidents.forEach((incident) => {
      unique.set(incident.location.id, incident.location);
    });
    return Array.from(unique.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [incidents]);

  const filtered = incidents.filter((incident) => {
    const search = query.trim().toLowerCase();
    const matchesSearch =
      !search ||
      incident.incident_number.toLowerCase().includes(search) ||
      incident.title.toLowerCase().includes(search) ||
      incident.category.name.toLowerCase().includes(search) ||
      incident.location.name.toLowerCase().includes(search);
    const matchesCategory =
      !categoryId || String(incident.category.id) === String(categoryId);
    const matchesLocation =
      !locationId || String(incident.location.id) === String(locationId);
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
        <p>{error}</p>
        <Button className="mt-4 w-full sm:w-auto" variant="secondary" onClick={() => { setError(""); setIsLoading(true); setRetryCount(count => count + 1); }}>Try again</Button>
      </div>
    );
  }

  return (
    <div>
      {limit ? null : (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <label className="block text-sm font-semibold text-foreground">
          <span className="mb-2 block">Search incidents</span>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholders.searchIncidents}
            aria-label="Search by incident ID or title"
          />
          </label>
          <label className="block text-sm font-semibold text-foreground">
          <span className="mb-2 block">Category</span>
          <Select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-label="Filter by category"
            searchable
            searchPlaceholder="Search categories..."
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </Select>
          </label>
          <label className="block text-sm font-semibold text-foreground">
          <span className="mb-2 block">Location</span>
          <Select
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            aria-label="Filter by location"
            searchable
            searchPlaceholder="Search locations..."
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={String(location.id)}>
                {location.name}
              </option>
            ))}
          </Select>
          </label>
        </div>
      )}

      {!limit && (query || categoryId || locationId) ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-text-secondary">{visible.length} matching {visible.length === 1 ? "incident" : "incidents"}</p>
          <Button variant="ghost" onClick={() => { setQuery(""); setCategoryId(""); setLocationId(""); }}>Clear filters</Button>
        </div>
      ) : null}
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
