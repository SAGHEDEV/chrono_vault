"use client";

import React, { useCallback, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon, Plus, Trash2 } from "lucide-react";
import { FaFileUpload } from "react-icons/fa";
import SuccessModal from "@/components/miscellaneous/SuccessModal";
import { useUploadToWalrus } from "@/hooks/useUploadToWalrus";
import DemoSeal from "@/components/miscellaneous/TestSealEncrypt";

// -------------------------
// ✅ Zod Schema
// -------------------------
const vaultSchema = z.object({
  title: z
    .string()
    .min(3, "Vault name must be at least 3 characters")
    .max(100, "Vault name too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  unlockDate: z.date({
    error: (issue) =>
      issue.input === undefined
        ? "Please select an unlock date"
        : "Invalid date",
  }),
  accessAddresses: z.optional(
    z.array(
      z.object({
        address: z
          .string()
          .min(1, "Address cannot be empty")
          .refine((val) => val.startsWith("0x") || val.startsWith("@"), {
            message:
              "Addresses can only start with 0x or start with an @ sign for a Sui NS name",
          }),
      })
    )
  ),
  files: z.array(z.custom<File>()).min(1, "You must upload at least one file"),
});

type VaultFormValues = z.infer<typeof vaultSchema>;

export default function UploadSection() {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("12:00"); // ✅ time state
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const { mutate: uploadFilesToWalrus, isPending: uploadLoading } =
    useUploadToWalrus();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<VaultFormValues>({
    resolver: zodResolver(vaultSchema),
    defaultValues: {
      accessAddresses: [],
      files: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "accessAddresses",
  });

  const files = watch("files");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const currentFiles = watch("files") || [];
      setValue("files", [...currentFiles, ...acceptedFiles], {
        shouldValidate: true,
      });
    },
    [setValue, watch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024,
  });

  const onSubmit = async (data: VaultFormValues) => {
    console.log("✅ Form Data:", {
      ...data,
      unlockDate: data.unlockDate.toISOString(),
    });
    try {
      const blobs = data.files;
      const blobIds = await uploadFilesToWalrus({ files: blobs, vaultName: data.title });
      console.log(blobIds)
    } catch {}
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-black">Create Vault</h2>
        <p className="text-gray-600 mt-2">
          Store multiple files securely with verifiable timestamps and
          time-locks.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col lg:flex-row justify-between gap-8 text-gray-800 border p-4 rounded-2xl"
      >
        {/* ---------- LEFT: File Upload + Details ---------- */}
        <div className="w-full flex flex-col space-y-6">
          {/* Vault Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vault Name
            </label>
            <input
              {...register("title")}
              placeholder="e.g., Graduation Documents Vault"
              className="w-full rounded-md border border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm p-2"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* File Dropzone */}
          <div
            {...getRootProps()}
            className={`w-full border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors flex flex-col gap-3 items-center
              ${
                isDragActive
                  ? "border-gray-700 bg-gray-100"
                  : "border-gray-400 hover:border-gray-600"
              }`}
          >
            <input {...getInputProps()} />
            <FaFileUpload size={50} />

            <p className="font-medium text-gray-700 mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports multiple files up to 10 MB each
            </p>
          </div>
          {errors.files && (
            <p className="text-sm text-red-600 mt-1 text-center">
              {errors.files.message}
            </p>
          )}
          {files && files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-semibold text-gray-800">Uploaded files:</p>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between items-start gap-3 p-2 bg-gray-100 rounded-lg text-sm"
                >
                  <p className="font-medium text-gray-700 text-left">
                    {f.name} ({(f.size / 1024).toFixed(1)} KB)
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = (watch("files") || []).filter(
                        (_, idx) => idx !== i
                      );
                      setValue("files", updated, { shouldValidate: true });
                    }}
                    className="w-full py-2 text-red-600 hover:text-red-800 font-semibold text-xs
                       border border-red-300 hover:border-red-500
                       transition-colors rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Add a description for this vault..."
              className="w-full rounded-md border min-h-[120px] border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm p-2"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* ---------- RIGHT: Time-Lock + Access Control ---------- */}
        <div className="w-full flex flex-col space-y-6 p-4 rounded-xl border">
          <h3 className="text-xl font-bold text-black">Vault Lock Settings</h3>

          {/* Unlock Date Picker + Time Picker */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label htmlFor="date" className="px-1 text-sm">
                Set Unlock Date:
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon className="w-4 h-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(d) => {
                      setDate(d);
                      // Combine with time if already set
                      if (d) {
                        const [hh, mm] = time.split(":");
                        const combined = new Date(d);
                        combined.setHours(parseInt(hh, 10));
                        combined.setMinutes(parseInt(mm, 10));
                        combined.setSeconds(0);
                        setValue("unlockDate", combined, {
                          shouldValidate: true,
                        });
                      }
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.unlockDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.unlockDate.message}
                </p>
              )}
            </div>

            {/* ✅ Time Picker */}
            <div className="flex flex-col gap-3">
              <label htmlFor="time-picker" className="px-1 text-sm">
                Set Unlock Time:
              </label>
              <input
                id="time-picker"
                type="time"
                step="60" // minute increments
                value={time}
                onChange={(e) => {
                  const t = e.target.value;
                  setTime(t);
                  if (date) {
                    const [hh, mm] = t.split(":");
                    const combined = new Date(date);
                    combined.setHours(parseInt(hh, 10));
                    combined.setMinutes(parseInt(mm, 10));
                    combined.setSeconds(0);
                    setValue("unlockDate", combined, { shouldValidate: true });
                  }
                }}
                className="rounded-md border border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm p-2 bg-background"
              />
            </div>
          </div>

          {/* Dynamic Access Addresses */}
          <div className="flex flex-col gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Access Addresses (Optional)
            </label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`accessAddresses.${index}.address` as const)}
                  placeholder="0x1234... (wallet address)"
                  className="flex-1 rounded-md border border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm p-2"
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-600">
              These addresses will be the only ones allowed to access the vault.{" "}
              <br /> Note that you can reference a users Sui NS by adding the
              '@' sign to the front of the NS.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-2 flex items-center gap-1"
              onClick={() => append({ address: "" })}
            >
              <Plus className="w-4 h-4" />
              Add Address
            </Button>
          </div>
        </div>

        {/* ---------- Submit ---------- */}
        <div className="w-full flex justify-end col-span-2">
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-md cursor-pointer active:scale-95 transition"
            disabled={uploadLoading}
          >
            {uploadLoading ? "Uploading..." : "Upload & Seal Vault"}
          </button>
        </div>
      </form>
      <SuccessModal
        open={openSuccess}
        onClose={() => setOpenSuccess(false)}
        vaultName={"Test Name"}
        walrusCid="0x0jdjdjsjhsndjieieiei"
      />
    </div>
  );
}
