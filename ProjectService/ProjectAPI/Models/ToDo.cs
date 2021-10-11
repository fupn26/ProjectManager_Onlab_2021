using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace ProjectAPI.Models
{
    public class ToDo : IEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonRepresentation(BsonType.ObjectId)]
        public string ProjectId { get; set; }
        public string Title { get; set; }
        public string Desctiption { get; set; }
        public EToDoStatus Status { get; set; }
        public List<string> AssigneeIds { get; set; }
    }
}
