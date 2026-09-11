"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { PublicIncidentRow } from "@/components/incidents/PublicIncidentRow";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { incidentService, referenceService } from "@/services/incidents";
import { placeholders } from "@/lib/placeholders";
import type { Category, IncidentVoteResult, Location, PublicIncident } from "@/types";

type PublicIncidentListProps = {
  limit?: number;
};

export function PublicIncidentList({ limit }: PublicIncidentListProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [incidents, setIncidents] = useState<PublicIncident[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [stage, setStage] = useState<"" | "forwarded" | "in_progress" | "completed">("");
  const [ordering, setOrdering] = useState<"recent" | "highest_votes">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (limit) return;
    void Promise.all([
      referenceService.listCategories(),
      referenceService.listLocations(),
    ]).then(([categoryData, locationData]) => {
      setCategories(categoryData);
      setLocations(locationData);
    }).catch(() => {
      setError("The incident filters could not be loaded. Please refresh the page or try again later.");
    });
  }, [limit]);

  useEffect(() => {
    void (async () => {
      try {
        if (limit) {
          const response = await incidentService.listPublic({ ordering: "recent" });
          setIncidents(response.results);
          return;
        }

        const response = await incidentService.listPublic({
          q: deferredQuery,
          category: categoryId,
          location: locationId,
          stage,
          ordering,
        });
        setIncidents(response.results);
      } catch {
        setError("The public incident register could not be loaded. Please refresh the page or try again later.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [limit, retryCount, deferredQuery, categoryId, locationId, stage, ordering]);

  const visible = typeof limit === "number" ? incidents.slice(0, limit) : incidents;

  function handleVoteChange(incidentId: number, result: IncidentVoteResult) {
    setIncidents((current) => {
      const updated = current.map((incident) =>
        incident.id === incidentId
          ? { ...incident, ...result }
          : incident,
      );
      return ordering === "highest_votes"
        ? updated.sort((left, right) => right.vote_count - left.vote_count)
        : updated;
    });
  }

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
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <label className="col-span-2 block text-sm font-semibold text-foreground lg:col-span-1">
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
          <label className="block text-sm font-semibold text-foreground">
          <span className="mb-2 block">Progress</span>
          <Select value={stage} onChange={(event) => setStage(event.target.value as typeof stage)} aria-label="Filter by progress" searchable={false}>
            <option value="">All progress</option>
            <option value="forwarded">Forwarded to Dean</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </Select>
          </label>
          <label className="block text-sm font-semibold text-foreground">
          <span className="mb-2 block">Sort by</span>
          <Select value={ordering} onChange={(event) => setOrdering(event.target.value as typeof ordering)} aria-label="Sort incidents" searchable={false}>
            <option value="recent">Most recent</option>
            <option value="highest_votes">Highest votes</option>
          </Select>
          </label>
        </div>
      )}

      {!limit && (query || categoryId || locationId || stage || ordering !== "recent") ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-text-secondary">{visible.length} matching {visible.length === 1 ? "incident" : "incidents"}</p>
          <Button variant="ghost" onClick={() => { setQuery(""); setCategoryId(""); setLocationId(""); setStage(""); setOrdering("recent"); }}>Clear filters</Button>
        </div>
      ) : null}
      {visible.length === 0 ? (
        <p className="border-t border-border py-8 text-text-secondary">
          {query || categoryId || locationId || stage
            ? "There are no verified public incidents matching your search."
            : "No public incidents are listed at this time. Verified incidents marked as public will appear here."}
        </p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {visible.map((incident) => (
            <PublicIncidentRow key={incident.id} incident={incident} onVoteChange={handleVoteChange} />
          ))}
        </div>
      )}
    </div>
  );
}
