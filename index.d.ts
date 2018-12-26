declare var queryStringsParser: queryStringsParser.QueryStringsParser
export = queryStringsParser

declare namespace queryStringsParser {
    export interface QueryStringsParser {
        (options?: IOptions): any
    }

    export interface IOptions {
        default?: IDefault
        use_page?: boolean
        client_db?: string
        date_field?: string
    }

    export interface IDefault {
        fields?: object
        sort?: object
        filters?: object
        pagination?: IPagination
    }

    export interface IPagination {
        page?: number
        skip?: number
        limit?: number
    }
}