using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ProjectAPI.Models
{
    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string User { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string Content { get; set; }        
    }
}
