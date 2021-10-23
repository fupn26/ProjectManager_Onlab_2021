using System.Collections.Generic;
using MongoDAL.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace ToDoAPI.Models
{
    public class ToDo : IEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string ProjectId { get; set; }
        public string Title { get; set; }
        public string Desctiption { get; set; }
        public EToDoStatus Status { get; set; }
        public List<string> AssigneeIds { get; set; }
    }
}
