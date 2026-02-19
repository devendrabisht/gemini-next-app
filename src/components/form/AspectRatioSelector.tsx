import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select";

import type { ChangeEvent } from "react";

type AspectRatioSelectorProps = {
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export default function AspectRatioSelector({ onChange } : AspectRatioSelectorProps) {
    const aspectRatios = [
        "custom",
        "1:1",
        "16:9",
        "3:2",
        "2:3",
        "4:5",
        "5:4",
        "9:16",
        "3:4",
        "4:3"
    ];
    
    return (
        <NativeSelect onChange={onChange}>
            {
                aspectRatios.map((aspectRatio) => (
                    <NativeSelectOption value={aspectRatio} key={aspectRatio}>{aspectRatio}</NativeSelectOption>
                ))
            }
        </NativeSelect>
    );
}