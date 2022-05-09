using MongoDAL.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace ProjectAPI.Models
{
    public class Project : IEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Title { get; set; }
        public string Owner { get; set; }
        public List<string> Members { get; set; }
        public List<string> Tasks { get; set; }
    }
}
