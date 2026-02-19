import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select";

export default function ImgFormatSelector({ onChange }) {
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