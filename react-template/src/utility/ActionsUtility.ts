import { GameStepManager, getSaveJson, loadSaveJson } from "@drincs/pixi-vn";

export function saveGame() {
    const jsonString = getSaveJson()
    // download the save data as a JSON file
    const blob = new Blob([jsonString], { type: "application/json" });
    // download the file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "save.json";
    a.click();
}

export function loadGameSave(navigate: (path: string) => void, afterLoad?: () => void) {
    // load the save data from a JSON file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonString = e.target?.result as string;
                // load the save data from the JSON string
                loadSaveJson(jsonString, navigate);
                afterLoad && afterLoad();
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

export function goBack(navigate: (path: string) => void, afterBack?: () => void) {
    GameStepManager.goBack(navigate)
    afterBack && afterBack()
}
