using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ProjectAPI.Models
{
    public class Comment : IEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonRepresentation(BsonType.ObjectId)]
        public string ToDoId { get; set; }
        public string User { get; set; }
        public string Content { get; set; }        
    }
}
