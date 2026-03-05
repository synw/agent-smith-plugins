export function action(args: any): Promise<string | {
    ok: boolean;
    data: string;
}>;
