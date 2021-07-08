export interface ViewerAppParameterObject {
    range: string | number;
    import?: string;
    filter?: string[];
    caseFilter?: string[];
    verbose?: boolean;
    watch?: string;
    debug?: boolean;
}
