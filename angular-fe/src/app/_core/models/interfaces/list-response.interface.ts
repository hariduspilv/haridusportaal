export interface ListResponseDto<T = unknown> {
	entities: Record<string, T[]>;
	count: string;
}
