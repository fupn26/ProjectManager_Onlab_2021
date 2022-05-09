using MongoDAL.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CommentAPI.Models
{
    public class Comment : IEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string ToDoId { get; set; }
        public string User { get; set; }
        public string Content { get; set; }
        public DateTime CreationTime { get; set; }
    }
}
