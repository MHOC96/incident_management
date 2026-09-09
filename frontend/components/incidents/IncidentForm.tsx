"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ImageUpload } from "@/components/incidents/ImageUpload";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatApiError, getFieldErrors } from "@/lib/errors";
import { placeholders } from "@/lib/placeholders";
import { incidentService, referenceService } from "@/services/incidents";
import type { Category, IncidentVisibility } from "@/types";

export function IncidentForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState<"creating" | "uploading" | null>(
    null,
  );
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
        const categoryData = await referenceService.listCategories();
        setCategories(categoryData);
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
    setSubmittingPhase("creating");

    if (!form.location.trim()) {
      setErrors((current) => ({
        ...current,
        location: "Please enter a location.",
      }));
      setIsSubmitting(false);
      setSubmittingPhase(null);
      return;
    }

    if (form.location.trim().length < 2) {
      setErrors((current) => ({
        ...current,
        location: "Location must be at least 2 characters.",
      }));
      setIsSubmitting(false);
      setSubmittingPhase(null);
      return;
    }

    try {
      const incident = await incidentService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: Number(form.category),
        location_name: form.location.trim(),
        visibility: form.visibility,
      });

      if (imageFile) {
        setSubmittingPhase("uploading");
        await incidentService.uploadImage(incident.id, imageFile);
      }

      router.push(`/student/incidents/${incident.id}?submitted=1`);
    } catch (error) {
      setFormError(formatApiError(error, "We couldn't submit your incident. Please try again."));
      setErrors(getFieldErrors(error));
      setIsSubmitting(false);
      setSubmittingPhase(null);
    }
  }

  if (isLoadingOptions) {
    return <p className="text-sm text-text-secondary">Loading form...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:gap-8">
        <section className="rounded-lg border border-border bg-surface p-4 md:p-6">
          <h2 className="mb-1 text-[18px] font-semibold">Incident details</h2>
          <p className="mb-5 text-sm text-text-muted">
            Describe the issue clearly so staff can find and assess it.
          </p>

          <FormField label="Title" htmlFor="title" required error={errors.title}>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder={placeholders.incidentTitle}
              hasError={Boolean(errors.title)}
              required
            />
          </FormField>

          <div className="grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
            <FormField label="Category" htmlFor="category" required error={errors.category}>
              <Select
                id="category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                hasError={Boolean(errors.category)}
                required
                searchable
                searchPlaceholder="Search categories..."
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
              <Input
                id="location"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder={placeholders.location}
                hasError={Boolean(errors.location)}
                required
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            htmlFor="description"
            required
            error={errors.description}
            hint="Include what happened, when you noticed it, and any safety concerns."
          >
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={6}
              required
              placeholder={placeholders.incidentDescription}
              hasError={Boolean(errors.description)}
              className="min-h-32 resize-y md:min-h-48"
            />
          </FormField>
        </section>

        <div className="flex min-w-0 flex-col gap-6">
          <section className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <h2 className="mb-1 text-[18px] font-semibold">Photo</h2>
            <p className="mb-5 text-sm text-text-muted">
              Optional. A photo helps staff locate the problem.
            </p>
            <ImageUpload file={imageFile} onChange={setImageFile} error={errors.image} />
          </section>

          <section className="rounded-lg border border-border bg-surface p-4 md:p-6">
            <fieldset className="border-0 p-0">
              <legend className="mb-1 text-[18px] font-semibold">Visibility</legend>
              <p className="mb-4 text-sm text-text-muted">
                Choose who can see this report after review.
              </p>
              <div className="grid gap-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                    form.visibility === "PRIVATE"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-surface-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    checked={form.visibility === "PRIVATE"}
                    onChange={(event) => updateField("visibility", event.target.value)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <span>
                    <span className="font-medium text-foreground">Private</span>
                    <span className="mt-0.5 block text-text-secondary">
                      Visible only to authorized university staff.
                    </span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                    form.visibility === "PUBLIC"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-surface-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    checked={form.visibility === "PUBLIC"}
                    onChange={(event) => updateField("visibility", event.target.value)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <span>
                    <span className="font-medium text-foreground">Public</span>
                    <span className="mt-0.5 block text-text-secondary">
                      May be listed publicly after verification.
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          </section>
        </div>
      </div>

      {formError ? (
        <p role="alert" className="mt-6 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/student/dashboard"
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-foreground hover:bg-surface-hover sm:w-auto"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          isLoading={isSubmitting}
          loadingText={
            submittingPhase === "uploading" ? "Uploading photo..." : "Submitting report..."
          }
        >
          Submit incident
        </Button>
      </div>
    </form>
  );
}
