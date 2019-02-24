global.default_options = {
    default: {
        pagination: {
            limit: Number.MAX_SAFE_INTEGER,
            skip: 0,
            page: 1
        },
        fields: {},
        sort: {},
        filters: {}
    },
    use_page: false,
    client_db: 'mongodb',
    date_fields: {
        start_at: 'created_at',
        end_at: 'created_at'
    }
}