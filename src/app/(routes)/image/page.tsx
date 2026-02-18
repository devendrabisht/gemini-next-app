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

import {
    FileUpload,
    FileUploadDropzone,
    FileUploadTrigger,
    FileUploadList,
    FileUploadItem,
    FileUploadItemPreview,
    FileUploadItemMetadata,
} from "@/components/ui/file-upload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

type FileWithId = File & { id: string };

/* ------------------------------------------------------------------ */
/* Sortable Item */
/* ------------------------------------------------------------------ */

function SortableFileItem({
    file,
    onDelete,
}: {
    file: FileWithId;
    onDelete: (id: string) => void;
}) {
    const {
        setNodeRef,
        transform,
        transition,
        attributes,
        listeners,
    } = useSortable({ id: file.id });
    
    return (
        <FileUploadItem value={file}>
        <div
        ref={setNodeRef}
        style={{
            transform: CSS.Transform.toString(transform),
            transition,
        }}
        className="relative rounded-lg border bg-background p-2 overflow-hidden"
        >
        {/* Delete button */}
        <button
        type="button"
        onClick={(e) => {
            e.stopPropagation();
            onDelete(file.id);
        }}
        className="absolute right-2 top-2 z-10 rounded-full bg-background p-1 shadow"
        >
        <X className="h-4 w-4" />
        </button>
        
        {/* Drag handle + image */}
        <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
        >
        <FileUploadItemPreview className="h-40 w-full rounded-md object-cover" />
        </div>
        
        {/* Metadata */}
        <div className="mt-2 text-sm">
        <FileUploadItemMetadata />
        </div>
        </div>
        </FileUploadItem>
    );
}

/* ------------------------------------------------------------------ */
/* Page */
/* ------------------------------------------------------------------ */

export default function UploadWithPrompt() {
    const [files, setFiles] = React.useState<FileWithId[]>([]);
    const [prompt, setPrompt] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [resultImage, setResultImage] = React.useState<string | null>(null);
    
    /* ---------------- Drag End ---------------- */
    
    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        
        setFiles((prev) => {
            const oldIndex = prev.findIndex((f) => f.id === active.id);
            const newIndex = prev.findIndex((f) => f.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };
    
    /* ---------------- Submit ---------------- */
    
    const submit = async () => {
        setLoading(true);
        
        const formData = new FormData();
        formData.append("prompt", prompt);
        
        // Order preserved ✅
        files.forEach((file) => {
            formData.append("files", file);
        });
        
        const res = await fetch("/api/process", {
            method: "POST",
            body: formData,
        });
        
        const data = await res.json();
        setResultImage(data.resultImageUrl || null);
        setLoading(false);
    };
    
    /* ------------------------------------------------------------------ */
    
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ================= LEFT PANEL ================= */}
        <Card className="p-6 space-y-6">
        <FileUpload
        value={files}
        onValueChange={(incoming) =>
            setFiles(
                incoming.map((file: FileWithId) =>
                    "id" in file
                ? file
                : Object.assign(file, {
                    id: crypto.randomUUID(),
                })
            )
        )
    }
    
    
    // onValueChange={(incoming) => {
    //     setFiles(
    //         incoming.map((file) => {
    //             const f = file as FileWithId;
    
    //             return {
    //             ...file,
    //             id: f.id ?? crypto.randomUUID(),
    //             };
    //         })
    //     );
    // }}
    multiple
    accept="image/*"
    >
    {/* Dropzone */}
    <FileUploadDropzone>
    <div className="text-center space-y-2">
    <p className="font-medium">Upload images</p>
    <FileUploadTrigger asChild>
    <Button variant="outline">Browse files</Button>
    </FileUploadTrigger>
    </div>
    </FileUploadDropzone>
    
    {/* Sortable grid */}
    <FileUploadList>
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
        onDelete={(id) =>
            setFiles((prev) =>
                prev.filter((f) => f.id !== id)
        )
    }
    />
))}
</div>
</SortableContext>
</DndContext>
</FileUploadList>
</FileUpload>

{/* Prompt */}
<Input
placeholder="Write your prompt..."
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
    <div className="text-muted-foreground">
    Result image will appear here
    </div>
)}
</Card>
</div>
);
}