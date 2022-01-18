export interface ViewerAppParameterObject {
    range: string | number;
    importDir?: string;
    filter?: string[];
    caseFilter?: boolean;
    verbose?: boolean;
    watch?: string;
    debug?: boolean;
    instanceAll?: boolean;
    instanceEnter?: boolean;
}
