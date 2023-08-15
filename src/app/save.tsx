'use client'

import { Button } from "@chakra-ui/react"


export default function Save({ name, data, fileName }: {
    name: string, data: any, fileName: string
}) {
    const saveFile = (data) => {
        const downloadable = new Blob([data], { type: "application/json" });
        const url = window.URL.createObjectURL(downloadable);
        const tempLink = document.createElement("a");
        tempLink.href = url;
        tempLink.setAttribute('download', fileName);
        tempLink.click();
    }
    return (
        <Button onClick={(e) => saveFile(data)}>{name}</Button>
    )
}