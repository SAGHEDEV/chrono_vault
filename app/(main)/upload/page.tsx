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
import { ChevronDownIcon, Plus, Trash2, Clock, Lock, AlertCircle } from "lucide-react";
import { FaFileUpload } from "react-icons/fa";
import SuccessModal from "@/components/miscellaneous/SuccessModal";
import { useCreateVault } from "@/hooks/useCreateVault";
import ProgressModal from "@/components/miscellaneous/ProgressModal";

// Zod Schema
const vaultSchema = z.object({
  title: z
    .string()
    .min(3, "Vault name must be at least 3 characters")
    .max(100, "Vault name too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  unlockDate: z.date().optional(),
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
  enableTimeLock: z.boolean(),
  enableAccessControl: z.boolean(),
}).refine((data) => {
  if (data.enableTimeLock && !data.unlockDate) {
    return false;
  }
  return data.enableTimeLock || data.enableAccessControl;
}, {
  message: "You must enable at least one lock type (Time-based or Access-based)",
  path: ["enableTimeLock"],
});

type VaultFormValues = z.infer<typeof vaultSchema>;

export default function UploadSection() {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("12:00");
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpenSuccess] = useState<{ open: boolean; id?: string } | null>(null);

  const { createVault, isCreating, progress, error } = useCreateVault();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
    getValues,
  } = useForm<VaultFormValues>({
    resolver: zodResolver(vaultSchema),
    defaultValues: {
      accessAddresses: [],
      files: [],
      enableTimeLock: false,
      enableAccessControl: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "accessAddresses",
  });

  const files = watch("files");
  const enableTimeLock = watch("enableTimeLock");
  const enableAccessControl = watch("enableAccessControl");

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
    try {
      const vaultDetails = await createVault({
        files: data.files,
        vaultName: data.title,
        description: data.description,
        unlockTime: data.unlockDate?.getTime(),
        authorizedAddresses: data.accessAddresses?.map(a => a.address)
      });

      console.log("✅ Vault created:", vaultDetails);
      setOpenSuccess({ open: true, id: vaultDetails.vaultId });
      reset();
      setDate(undefined);
      setTime("12:00");
    } catch (err) {
      console.error("❌ Error creating vault:", err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="brutalist-card p-6">
        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase">Create Vault</h2>
        <p className="text-[#0A0A0A] mt-2 font-bold">
          Store multiple files securely with verifiable timestamps and time-locks.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-8 text-[#0A0A0A] brutalist-card p-6"
      >
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* LEFT: File Upload + Details */}
          <div className="w-full flex flex-col space-y-6">
            {/* Vault Title */}
            <div>
              <label className="block text-sm font-black text-[#0A0A0A] mb-2 uppercase tracking-wide">
                Vault Name
              </label>
              <input
                {...register("title")}
                placeholder="GRADUATION DOCUMENTS VAULT"
                className="w-full brutalist-border focus:outline-none text-sm p-3 font-bold placeholder:text-gray-400 uppercase rounded-2xl"
                disabled={isCreating}
              />
              {errors.title && (
                <p className="text-sm text-[#FF3B30] mt-2 font-bold">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* File Dropzone */}
            <div
              {...getRootProps()}
              className={`w-full brutalist-border-thick p-10 text-center cursor-pointer transition-all flex flex-col gap-4 items-center rounded-2xl
                ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}
                ${isDragActive
                  ? "bg-[#4FC3F7]"
                  : "bg-white hover:bg-[#F5F5F5]"
                }`}
            >
              <input {...getInputProps()} disabled={isCreating} />
              <FaFileUpload size={60} className={isCreating ? 'text-gray-400' : 'text-[#0A0A0A]'} />

              <p className="font-black text-[#0A0A0A] uppercase text-lg">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-[#0A0A0A] font-bold">
                Supports multiple files up to 10 MB each
              </p>
            </div>
            {errors.files && (
              <p className="text-sm text-[#FF3B30] mt-2 text-center font-bold">
                {errors.files.message}
              </p>
            )}
            {files && files.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="font-black text-[#0A0A0A] uppercase">Uploaded files:</p>
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between items-start gap-3 p-4 brutalist-card rounded-2xl"
                  >
                    <p className="font-bold text-[#0A0A0A] text-left uppercase text-sm">
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
                      disabled={isCreating}
                      className="w-full py-2 px-4 bg-[#FF3B30] text-white font-black uppercase text-xs brutalist-border hover:translate-x-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-black text-[#0A0A0A] mb-2 uppercase tracking-wide">
                Description
              </label>
              <textarea
                {...register("description")}
                placeholder="ADD A DESCRIPTION FOR THIS VAULT..."
                className="w-full brutalist-border min-h-[120px] focus:outline-none text-sm p-3 font-bold placeholder:text-gray-400 uppercase rounded-2xl"
                disabled={isCreating}
              />
              {errors.description && (
                <p className="text-sm text-[#FF3B30] mt-2 font-bold">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Encryption Settings */}
          <div className="w-full flex flex-col space-y-6 p-6 brutalist-card bg-[#F5F5F5]">
            <h3 className="text-2xl font-black text-[#0A0A0A] uppercase">Encryption Settings</h3>

            {/* Encryption Type Toggles */}
            <div className="space-y-4">
              {/* Time-Based Lock Toggle */}
              <div className="flex items-center justify-between p-4 bg-white brutalist-border hover:bg-[#4FC3F7] transition-colors rounded-2xl">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-3 bg-[#1A73E8] brutalist-border rounded-2xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-black text-[#0A0A0A] cursor-pointer block uppercase">
                      Time-Based Lock
                    </label>
                    <p className="text-xs text-[#0A0A0A] mt-1 font-bold">
                      Automatically unlock vault at a specific date and time
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableTimeLock}
                  onClick={() => setValue("enableTimeLock", !enableTimeLock, { shouldValidate: true })}
                  disabled={isCreating}
                  className={`relative inline-flex h-8 w-14 items-center brutalist-border transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl cursor-pointer ${enableTimeLock ? "bg-[#1A73E8]" : "bg-white"
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform bg-[#4FC3F7] brutalist-border transition-transform rounded-full ${enableTimeLock ? "translate-x-7" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              {/* Access-Based Lock Toggle */}
              <div className="flex items-center justify-between p-4 bg-white brutalist-border hover:bg-[#4FC3F7] transition-colors rounded-2xl">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-3 bg-[#1A73E8] brutalist-border rounded-2xl">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-black text-[#0A0A0A] cursor-pointer block uppercase">
                      Access-Based Control
                    </label>
                    <p className="text-xs text-[#0A0A0A] mt-1 font-bold">
                      Restrict vault access to specific wallet addresses
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableAccessControl}
                  onClick={() => setValue("enableAccessControl", !enableAccessControl, { shouldValidate: true })}
                  disabled={isCreating}
                  className={`relative inline-flex h-8 w-14 items-center brutalist-border transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl cursor-pointer ${enableAccessControl ? "bg-[#1A73E8]" : "bg-white"
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform bg-[#4FC3F7] brutalist-border transition-transform rounded-full ${enableAccessControl ? "translate-x-7" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>

              {/* Validation Error */}
              {errors.enableTimeLock && (
                <p className="text-sm text-[#FF3B30] px-2 font-bold">
                  {errors.enableTimeLock.message}
                </p>
              )}
            </div>

            {/* Divider */}
            {(enableTimeLock || enableAccessControl) && (
              <div className="border-t-4 border-[#0A0A0A]"></div>
            )}

            {/* Time Lock Settings */}
            {enableTimeLock && (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#0A0A0A] flex items-center gap-2 uppercase">
                  <Clock className="w-4 h-4" />
                  Time Lock Configuration
                </h4>

                <div className="flex flex-col gap-4 bg-white p-4 brutalist-border rounded-2xl">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="date" className="text-sm font-black text-[#0A0A0A] uppercase">
                      Unlock Date
                    </label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                          className="justify-between font-bold brutalist-border uppercase rounded-2xl !p-3 cursor-pointer h-[46px]"
                          disabled={isCreating}
                        >
                          {date ? date.toLocaleDateString() : "Select date"}
                          <ChevronDownIcon className="w-4 h-4 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0 brutalist-border brutalist-shadow-sm"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={date}
                          captionLayout="dropdown"
                          onSelect={(d) => {
                            setDate(d);
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
                  </div>

                  <div className="flex flex-col gap-3">
                    <label htmlFor="time-picker" className="text-sm font-black text-[#0A0A0A] uppercase">
                      Unlock Time
                    </label>
                    <input
                      id="time-picker"
                      type="time"
                      step="60"
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
                      disabled={isCreating}
                      className="brutalist-border focus:outline-none text-sm p-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Access Control Settings */}
            {enableAccessControl && (
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#0A0A0A] flex items-center gap-2 uppercase">
                  <Lock className="w-4 h-4" />
                  Access Control Configuration
                </h4>

                <div className="flex flex-col gap-3 bg-white p-4 brutalist-border rounded-2xl">
                  <label className="text-sm font-black text-[#0A0A0A] uppercase">
                    Authorized Addresses
                  </label>

                  {fields.length === 0 ? (
                    <p className="text-xs text-[#0A0A0A] font-bold">
                      No addresses added yet. Click below to add authorized wallets.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <input
                            {...register(`accessAddresses.${index}.address` as const)}
                            placeholder="0X1234... OR @USERNAME.SUI"
                            className="flex-1 brutalist-border focus:outline-none text-sm p-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed uppercase placeholder:text-gray-400 rounded-2xl"
                            disabled={isCreating}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={isCreating}
                            className="brutalist-border p-3 rounded-full cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-[#0A0A0A] font-bold">
                    Only these addresses can access the vault. Use 0x prefix for wallet addresses or @ for Sui NS names.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2 brutalist-btn bg-[#1A73E8] text-white font-black uppercase cursor-pointer"
                    onClick={() => append({ address: "" })}
                    disabled={isCreating}
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex justify-end">
          <button
            type="submit"
            className="w-full bg-[#1A73E8] hover:bg-[#0B2A4A] text-white font-black px-6 py-4 brutalist-btn cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase text-lg"
            disabled={isCreating}
          >
            {isCreating ? "Processing..." : "Upload & Seal Vault"}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && !isCreating && (
        <div className="brutalist-card bg-[#FF3B30] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-black text-white mb-2 uppercase">
                Upload Failed
              </h3>
              <p className="text-sm text-white font-bold">
                {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      <ProgressModal open={isCreating} progress={progress} />

      {/* Success Modal */}
      <SuccessModal
        open={openSuccess?.open ?? false}
        onClose={() => setOpenSuccess(null)}
        vaultName={getValues().title ?? "Your Vault"}
        vaultId={openSuccess?.id ?? ""}
      />
    </div>
  );
}
