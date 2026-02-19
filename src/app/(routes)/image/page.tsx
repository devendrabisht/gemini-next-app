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
import { X, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileDropzone from "@/components/FileDropzone";



/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

type UploadItem = {
  id: string;
  file: File;      // ✅ REAL file (for backend)
  preview: string; // ✅ UI only (blob URL)
};

/* -------------------------------------------------------------------------- */
/*                           Sortable File Item                               */
/* -------------------------------------------------------------------------- */

function SortableFileItem({
  item,
  onDelete,
}: {
  item: UploadItem;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, transform, transition, attributes, listeners } =
    useSortable({ id: item.id });

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
        onClick={() => onDelete(item.id)}
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
          src={item.preview}
          alt={item.file.name}
          className="h-40 w-full rounded-md object-cover"
        />
      </div>

      {/* File Name */}
      <p className="mt-2 truncate text-center text-sm">
        {item.file.name}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function UploadWithPrompt() {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resultImage, setResultImage] = React.useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /*                  Convert FileList → UploadItem[]                          */
  /* ------------------------------------------------------------------------ */

  const handleFilesSelected = (fileList: FileList) => {
    const newItems: UploadItem[] = Array.from(fileList).map((file) => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  /* ------------------------------------------------------------------------ */
  /*                             Delete File                                  */
  /* ------------------------------------------------------------------------ */

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview); // 🧹 cleanup
      return prev.filter((i) => i.id !== id);
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                          Drag & Drop Reorder                              */
  /* ------------------------------------------------------------------------ */

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
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

    // ✅ ONLY send raw File objects
    items.forEach((item) => {
      formData.append("files", item.file);
    });

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
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          maxFiles={6}
          maxSizeMb={5}
        />

        {items.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {items.map((item) => (
                  <SortableFileItem
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Input
          placeholder="Describe what you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Button
          onClick={submit}
          disabled={loading || items.length === 0}
        >
          {loading ? "Processing..." : "Submit"}
        </Button>
      </Card>

      {/* ================= RIGHT PANEL ================= */}
      <Card className="relative flex items-center justify-center p-6">
  {resultImage ? (
    <div className="relative">
      {/* Result Image */}
      <img
        src={resultImage}
        alt="Result"
        className="max-h-[500px] rounded-lg object-contain"
      />

      {/* Download Button */}
      <a
        href={resultImage}
        download="result.jpg"
        className="absolute bottom-3 right-3 rounded-full bg-background/90 p-2 shadow-md backdrop-blur hover:bg-background"
        title="Download image"
      >
        <Download className="h-5 w-5" />
      </a>
    </div>
  ) : (
    <p className="text-muted-foreground">
      Result image will appear here
    </p>
  )}
</Card>

    </div>
  );
}
