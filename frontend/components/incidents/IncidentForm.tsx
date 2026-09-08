"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ImageUpload } from "@/components/incidents/ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatApiError, getFieldErrors } from "@/lib/errors";
import { incidentService, referenceService } from "@/services/incidents";
import type { Category, IncidentVisibility, Location } from "@/types";

export function IncidentForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    visibility: "PRIVATE" as IncidentVisibility,
  });

  useEffect(() => {
    void (async () => {
      try {
        const [categoryData, locationData] = await Promise.all([
          referenceService.listCategories(),
          referenceService.listLocations(),
        ]);
        setCategories(categoryData);
        setLocations(locationData);
      } catch {
        setFormError("We couldn't load form options. Please refresh and try again.");
      } finally {
        setIsLoadingOptions(false);
      }
    })();
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setErrors({});
    setIsSubmitting(true);

    try {
      const incident = await incidentService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: Number(form.category),
        location: Number(form.location),
        visibility: form.visibility,
      });

      if (imageFile) {
        await incidentService.uploadImage(incident.id, imageFile);
      }

      router.push(`/student/incidents/${incident.id}?submitted=1`);
    } catch (error) {
      setFormError(formatApiError(error, "We couldn't submit your incident. Please try again."));
      setErrors(getFieldErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingOptions) {
    return <p className="text-sm text-text-secondary">Loading form...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl" noValidate>
      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-4">1. Incident details</h2>

        <FormField label="Title" htmlFor="title" required error={errors.title}>
          <Input
            id="title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Broken classroom door hinge, Block B Room 204"
            hasError={Boolean(errors.title)}
            required
          />
        </FormField>

        <FormField label="Category" htmlFor="category" required error={errors.category}>
          <Select
            id="category"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            hasError={Boolean(errors.category)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Location" htmlFor="location" required error={errors.location}>
          <Select
            id="location"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            hasError={Boolean(errors.location)}
            required
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          required
          error={errors.description}
          hint="Include what happened, when you noticed it, and any safety concerns."
        >
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={5}
            required
            placeholder="The door handle in Room 204 came loose this morning and the door will not close securely."
            className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              errors.description ? "border-danger" : "border-border"
            }`}
          />
        </FormField>
      </section>

      <section className="mb-8">
        <h2 className="text-[18px] font-semibold mb-4">2. Evidence</h2>
        <FormField
          label="Upload an image"
          htmlFor="image"
          error={errors.image}
          hint="Optional. A photo helps staff locate and assess the issue."
        >
          <ImageUpload file={imageFile} onChange={setImageFile} error={errors.image} />
        </FormField>
      </section>

      <section className="mb-8">
        <fieldset className="space-y-3 border-0 p-0">
          <legend className="mb-4 text-[18px] font-semibold">3. Visibility</legend>
          <p className="text-sm text-text-muted">
            Choose who can see this report after administrative review. Restricted visibility is assigned by staff when needed.
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="radio"
              name="visibility"
              value="PUBLIC"
              checked={form.visibility === "PUBLIC"}
              onChange={(event) => updateField("visibility", event.target.value)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-medium text-foreground">Public</span>
              <span className="block text-text-secondary">
                The incident may be displayed publicly after verification.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="radio"
              name="visibility"
              value="PRIVATE"
              checked={form.visibility === "PRIVATE"}
              onChange={(event) => updateField("visibility", event.target.value)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-medium text-foreground">Private</span>
              <span className="block text-text-secondary">
                Visible only to authorized university personnel.
              </span>
            </span>
          </label>
        </fieldset>
      </section>

      {formError ? (
        <p className="mb-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSubmitting} loadingText="Submitting report...">
          Submit incident
        </Button>
        <Link
          href="/student/dashboard"
          className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
