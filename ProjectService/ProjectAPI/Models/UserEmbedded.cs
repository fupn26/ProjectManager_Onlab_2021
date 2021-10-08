using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ProjectAPI.Models
{
    public class UserEmbedded
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }
    }
}
