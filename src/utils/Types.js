const map = new Map()

//     key :sql  , value :elastic
map.set("BOOLEAN", "boolean")
map.set("TINYINT", "byte")
map.set("SMALLINT", "short")
map.set("INTEGER", "integer")
map.set("BIGINT", "long")
map.set("DOUBLE", "double")
map.set("REAL", "float")
map.set("FLOAT", "half_float")
map.set("DOUBLE", "scaled_float")
map.set("VARCHAR", "text")
map.set("CHAR", "text")
map.set("TEXT", "text")
map.set("VARBINARY", "binary")
map.set("TIMESTAMP", "date")

export default {
    getElasticTypeFromMysqlType(mysqlType) {
        let type = map.get(mysqlType)
        if (type) {
            return type
        }
        Array.from(map.keys()).map((key) => {
            if (mysqlType.includes(key)) {
                type = map.get(key)
            }
        })
        if (!type) {
            return 'text'
        }
        return type

    }
};


