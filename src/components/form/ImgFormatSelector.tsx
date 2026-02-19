import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select";

import type { ChangeEvent } from "react";

type ImgFormatSelectorProps = {
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export default function ImgFormatSelector({ onChange } : ImgFormatSelectorProps) {
    const formats = [
        "webp",
        "jpg",
        "png"
    ];
    
    return (
        <NativeSelect onChange={onChange}>
            {
                formats.map((format) => (
                    <NativeSelectOption value={format} key={format}>{format}</NativeSelectOption>
                ))
            }
        </NativeSelect>
    );
}