import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select";

export default function AspectRatioSelector({ onChange }) {
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