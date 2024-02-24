import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export interface UseMyQueryProps<T> {
	then?: (data: T) => void;
	catch?: (err: any) => void;
	staleTime?: number;
}

interface IProps<T> extends UseMyQueryProps<T>, UseQueryOptions<T> {
	queryKey: string[];
	queryFn: () => Promise<T>;
}

export function useMyQuery<T>(props: IProps<T>) {
	const {
		then: thenFn,
		catch: catchFn,
		queryFn: myQueryFn,
		queryKey,
		staleTime = Infinity,
		...rest
	} = props;
	return useQuery({
		...rest,
		queryKey: queryKey,
		staleTime: staleTime,
		queryFn: async () => {
			return myQueryFn().then((res) => {
				thenFn && thenFn(res)
				return res
			}).catch((err) => {
				console.error(err)
				catchFn && catchFn(err)
				throw err
			})
		},
	});
}
