import { DialogueModel } from "../lib/classes/DialogueModel";
import { getDialogue } from "../lib/functions/DialogueUtility";
import { GameStorageManager } from "../lib/managers/StorageManager";
import { UseMyQueryProps, useMyQuery } from "./useMyQuery";

export const USE_DIALOGUE_MEMORY_KEY = GameStorageManager.keysSystem.CURRENT_DIALOGUE_MEMORY_KEY

interface IProps<T> extends UseMyQueryProps<T> {
}

export function useDialogueMemory(props: IProps<DialogueModel>) {
	const {
		then: thenFn,
		catch: catchFn,
		...rest
	} = props;
	return useMyQuery({
		...rest,
		staleTime: 300000,
		queryKey: [USE_DIALOGUE_MEMORY_KEY],
		queryFn: async () => {
			return getDialogue()
		},
	});
}
