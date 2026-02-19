"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileDropzone from "@/components/FileDropzone";

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

type FileWithId = File & {
  id: string;
  preview: string;
};

/* -------------------------------------------------------------------------- */
/*                           Sortable File Item                               */
/* -------------------------------------------------------------------------- */

function SortableFileItem({
  file,
  onDelete,
}: {
  file: FileWithId;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } =
    useSortable({ id: file.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative overflow-hidden rounded-lg border bg-background p-2"
    >
      {/* Delete Button */}
      <button
        type="button"
        onClick={() => onDelete(file.id)}
        className="absolute right-2 top-2 z-10 rounded-full bg-background p-1 shadow"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Drag Handle + Preview */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <img
          src={file.preview}
          alt={file.name}
          className="h-40 w-full rounded-md object-cover"
        />
      </div>

      {/* File Name */}
      <p className="mt-2 truncate text-center text-sm">
        {file.name}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function UploadWithPrompt() {
  const [files, setFiles] = React.useState<FileWithId[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resultImage, setResultImage] = React.useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /*                  Convert FileList → FileWithId[]                          */
  /* ------------------------------------------------------------------------ */

  const handleFilesSelected = (fileList: FileList) => {
    const newFiles: FileWithId[] = Array.from(fileList).map((file) => ({
      ...file,
      id: uuidv4(),
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  /* ------------------------------------------------------------------------ */
  /*                             Delete File                                  */
  /* ------------------------------------------------------------------------ */

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  /* ------------------------------------------------------------------------ */
  /*                          Drag & Drop Reorder                              */
  /* ------------------------------------------------------------------------ */

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFiles((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                                Submit                                    */
  /* ------------------------------------------------------------------------ */

  const submit = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", prompt);
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("/api/process", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResultImage(data.resultImageUrl ?? null);
    setLoading(false);
  };

  /* ------------------------------------------------------------------------ */
  /*                                 UI                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* ================= LEFT PANEL ================= */}
      <Card className="space-y-6 p-6">
        {/* Dropzone */}
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          maxFiles={6}
          maxSizeMb={5}
        />

        {/* Sortable Preview */}
        {files.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={files.map((f) => f.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {files.map((file) => (
                  <SortableFileItem
                    key={file.id}
                    file={file}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Prompt */}
        <Input
          placeholder="Describe what you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* Submit */}
        <Button
          onClick={submit}
          disabled={loading || files.length === 0}
        >
          {loading ? "Processing..." : "Submit"}
        </Button>
      </Card>

      {/* ================= RIGHT PANEL ================= */}
      <Card className="flex items-center justify-center p-6">
        {resultImage ? (
          <img
            src={resultImage}
            alt="Result"
            className="max-h-[500px] rounded-lg object-contain"
          />
        ) : (
          <p className="text-muted-foreground">
            Result image will appear here
          </p>
        )}
      </Card>
    </div>
  );
}