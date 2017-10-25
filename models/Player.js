module.exports = {
    fields:{
        name    : "text",
        nicknames: {
          type: "list",
          typeDef: "<text>"
        },
        age     : "int",
        player_id: "uuid",
        stats: {
          type: "map",
          typeDef: "<text,int>"
        },
        average: "int",
    },
    key:["player_id", "average"]
}
