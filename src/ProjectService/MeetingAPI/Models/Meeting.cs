using MongoDAL.Entities;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace MeetingAPI.Models
{
    public class Meeting : IEntity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string ProjectId { get; set; }

        public string CreatorId { get; set; }

        public string Theme { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public string Place { get; set; }

        public string Notes { get; set; }

        public List<string> Participants { get; set; }
    }
}
