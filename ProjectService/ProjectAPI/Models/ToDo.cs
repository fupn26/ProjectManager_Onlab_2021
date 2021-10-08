using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace ProjectAPI.Models
{
    public class ToDo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Title { get; set; }
        public string Desctiption { get; set; }
        public EToDoStatus Status { get; set; }
        public List<string> Assignees { get; set; }
        public List<string> Comments { get; set; }
    }
}
