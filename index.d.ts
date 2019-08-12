declare var queryStringsParser: queryStringsParser.QueryStringsParser
export = queryStringsParser

declare namespace queryStringsParser {
    export interface QueryStringsParser {
        (options?: IOptions): any

        parser(query?: string | object, defaults?: IDefault, options?: IOptions): any

        parseFields(query?: string | object, options?: IOptions): any

        parseSort(query?: string | object, options?: IOptions): any

        parsePagination(query?: string | object, pagination?: IPagination, use_page?: boolean): any

        parseFilter(query?: string | object, options?: IOptions): any

        parseDate(query?: string | object, date_fields?: IDateFields): any
    }

    export interface IOptions {
        default?: IDefault
        use_page?: boolean
        client_db?: string
        date_fields?: IDateFields
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

    export interface IDateFields {
        start_at?: string
        end_at?: string
    }
}
